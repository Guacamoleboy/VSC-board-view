import * as vscode from "vscode";

import {
  getExcludeGlob,
  getIncludeGlob,
  getMaxTodoLines,
  getSearchPatterns,
  getTodoPattern,
} from "@/config";
import { REGEX } from "@/constants/regex";
import { readCache, writeCache } from "@/services/cache";
import { getLineInfo } from "@/services/git-line-info";
import { generateTodoId } from "@/utils/generators";
import {
  findFirstPatternIndex,
  hasPatternAtCommentStart,
} from "@/utils/regex-builder";
import { sanitizeTodoExtract } from "@/utils/sanitize";
import type { CacheData } from "@/types/cache";
import { RawHit } from "@/types/board";

export interface ScanResult {
  hits: RawHit[];
  reused: number;
  scanned: number;
  filesProcessed: number;
}

export async function scanWorkspace(
  progress?: vscode.Progress<{ message?: string; increment?: number }>,
  token?: vscode.CancellationToken,
  doc?: vscode.TextDocument,
): Promise<ScanResult> {
  const hits: RawHit[] = [];
  let reused = 0;
  let scanned = 0;
  let filesProcessed = 0;
  const pattern = getTodoPattern();
  const searchPatterns = getSearchPatterns();
  const maxLines = getMaxTodoLines();
  const include = getIncludeGlob();
  const exclude = getExcludeGlob();
  const uris = doc 
    ? [doc.uri]
    : await vscode.workspace.findFiles(include, exclude, 12000);
  const cache: CacheData = await readCache();
  const updated: string[] = [];
  const concurrency = 25;
  let cursor = 0;

  function scanDocumentForTasks(
    doc: vscode.TextDocument,
    matchPattern: RegExp,
    patterns: string[],
  ): { localHits: { id: string; line: number; text: string }[] } {
    const localHits: { id: string; line: number; text: string }[] = [];
    let i = 0;

      function buildCombinedFromLine(index: number): {
      text: string;
      endIndex: number;
    } {
      const lineText = doc.lineAt(index).text;
      const idx = findFirstPatternIndex(lineText, patterns);
      const raw = lineText.substring(idx).trim();
      let combined = sanitizeTodoExtract(raw);

      const isNakedTag = /^\/\/\s*[A-Z@]+\s*$/i.test(lineText.trim());

      if (isNakedTag && index + 1 < doc.lineCount) {
        const nextLineText = doc.lineAt(index + 1).text.trim();
        if (nextLineText.startsWith('(')) {
          const { combinedSuffix, endIndex } = collectContinuation(
            doc,
            index + 1,
            matchPattern,
            patterns,
            maxLines,
          );
          
          if (combinedSuffix.length > 0) {
            combined = `${combined} ${combinedSuffix}`;
          }
          return { text: combined, endIndex };
        }
      }

      if (isHtmlBlockStartWithoutEnd(lineText)) {
        const { combinedSuffix, endIndex } = collectHtmlBlockContinuation(
          doc,
          index + 1,
          matchPattern,
          patterns,
          maxLines,
        );

        if (combinedSuffix.length > 0) {
          combined = `${combined}${REGEX.LINE_BREAK_TOKEN}${combinedSuffix}`;
        }

        return { text: combined, endIndex };
      }

      if (isBlockStartWithoutEnd(lineText) || isInsideBlock(lineText)) {
        const { combinedSuffix, endIndex } = collectBlockContinuation(
          doc,
          index + 1,
          matchPattern,
          patterns,
          maxLines,
        );

        if (combinedSuffix.length > 0) {
          combined = `${combined}${REGEX.LINE_BREAK_TOKEN}${combinedSuffix}`;
        }

        return { text: combined, endIndex };
      }

      const { combinedSuffix, endIndex } = collectContinuation(
        doc,
        index + 1,
        matchPattern,
        patterns,
        maxLines,
      );

      if (combinedSuffix.length > 0) {
        combined = `${combined}${REGEX.LINE_BREAK_TOKEN}${combinedSuffix}`;
      }

      return { text: combined, endIndex };
    }

    while (i < doc.lineCount) {
      const lineText: string = doc.lineAt(i).text;

      if (isTodoLine(lineText, matchPattern, patterns)) {
        const { text, endIndex } = buildCombinedFromLine(i);
        const id = generateTodoId(doc.uri.fsPath, i, text);
        localHits.push({ id, line: i, text });
        i = endIndex; // pular linhas agregadas
        continue;
      }

      i++;
    }

    return { localHits };
  }

  async function processFile(uri: vscode.Uri) {
    try {
      const stat = await vscode.workspace.fs.stat(uri);
      const key = uri.fsPath;
      const prev = cache.files[key];

      if (prev && prev.mtime === stat.mtime) {
        for (const h of prev.hits) {
          // Mapper cache-hits til RawHit format
          hits.push({ id: h.id, file: key, line: h.line, text: h.text });
        }
        reused += prev.hits.length;
        return;
      }

      const openedDoc = await vscode.workspace.openTextDocument(uri);
      if (openedDoc.lineCount > 6000) return;

      const { localHits } = scanDocumentForTasks(openedDoc, pattern, searchPatterns);
      for (const h of localHits) {
        hits.push({ id: h.id, file: key, line: h.line, text: h.text });
      }

      scanned += localHits.length;
      cache.files[key] = { mtime: stat.mtime, hits: localHits };
      updated.push(key);
    } catch {
      // ignore
    }
  }

  async function worker() {
    while (true) {
      const uriIndex = cursor++;
      if (uriIndex >= uris.length || token?.isCancellationRequested) break;

      await processFile(uris[uriIndex]);
      filesProcessed += 1;

      if (progress) {
        progress.report({
          message: `${((uriIndex + 1) / uris.length * 100).toFixed(1)}% (${uriIndex + 1}/${uris.length})`,
        });
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));

  if (updated.length && !token?.isCancellationRequested) {
    writeCache(cache).catch(() => undefined);
  }

  return { hits, reused, scanned, filesProcessed };
}

/**
 * Enrich TODO hits with Git information (last modified date and age)
 * This runs after the initial scan to add temporal context to TODOs
 * @param hits - Array of TODO hits to enrich
 * @returns Promise that resolves when enrichment is complete
 */
export async function enrichTodosWithGitInfo(
  hits: RawHit[],
): Promise<RawHit[]> {
  const enrichedHits: RawHit[] = [];
  const batchSize = 10;

  for (let i = 0; i < hits.length; i += batchSize) {
    const batch = hits.slice(i, i + batchSize);
    const enrichedBatch = await Promise.all(
      batch.map(async (hit) => {
        try {
          const gitInfo = await getLineInfo(hit.file, hit.line + 1);
          return gitInfo
            ? { ...hit, lastModified: gitInfo.date, daysOld: gitInfo.daysOld }
            : hit;
        } catch {
          return hit;
        }
      }),
    );
    enrichedHits.push(...enrichedBatch);
  }

  return enrichedHits;
}

// @TODO: talvez separar esses metodos em outro arquivo utils/scanner.ts
// por enquanto são utilizados apenas aqui.
function collectBlockContinuation(
  doc: vscode.TextDocument,
  startIndex: number,
  matchPattern: RegExp,
  patterns: string[],
  maxLines = 4,
): { combinedSuffix: string; endIndex: number } {
  let j = startIndex;
  const parts: string[] = [];
  const maxEndIndex = startIndex + maxLines;

  while (j < doc.lineCount && j < maxEndIndex) {
    const nextText = doc.lineAt(j).text;
    if (isTodoLine(nextText, matchPattern, patterns)) {
      break;
    }

    const trimmed = nextText.trim();
    if (trimmed.startsWith(REGEX.BLOCK_COMMENT_END)) {
      j++;
      break;
    }

    if (trimmed.includes(REGEX.BLOCK_COMMENT_END)) {
      const before = trimmed.split(REGEX.BLOCK_COMMENT_END)[0] ?? "";
      parts.push(sanitizeTodoExtract(stripBlockLinePrefix(before)));
      j++;
      break;
    }

    if (REGEX.BLOCK_CONTENT_LINE_REGEX.test(nextText)) {
      const content = sanitizeTodoExtract(stripBlockLinePrefix(nextText));
      parts.push(content);
      j++;
      continue;
    }

    break;
  }

  return { combinedSuffix: parts.join(REGEX.LINE_BREAK_TOKEN), endIndex: j };
}

function collectHtmlBlockContinuation(
  doc: vscode.TextDocument,
  startIndex: number,
  matchPattern: RegExp,
  patterns: string[],
  maxLines = 4,
): { combinedSuffix: string; endIndex: number } {
  let j = startIndex;
  const parts: string[] = [];
  const maxEndIndex = startIndex + maxLines;

  while (j < doc.lineCount && j < maxEndIndex) {
    const nextText = doc.lineAt(j).text;
    if (isTodoLine(nextText, matchPattern, patterns)) {
      break;
    }

    const trimmed = nextText.trim();
    if (trimmed.includes(REGEX.HTML_COMMENT_END)) {
      const before = trimmed.split(REGEX.HTML_COMMENT_END)[0] ?? "";
      parts.push(sanitizeTodoExtract(before));
      j++;
      break;
    }

    parts.push(sanitizeTodoExtract(nextText));
    j++;
  }

  return { combinedSuffix: parts.join(REGEX.LINE_BREAK_TOKEN), endIndex: j };
}

function collectContinuation(
  doc: vscode.TextDocument,
  startIndex: number,
  matchPattern: RegExp,
  patterns: string[],
  maxLines = 4,
): { combinedSuffix: string; endIndex: number } {
  let j = startIndex;
  const parts: string[] = [];
  const maxEndIndex = startIndex + maxLines;

  while (j < doc.lineCount && j < maxEndIndex) {
    const nextText = doc.lineAt(j).text;
    
    if (isTodoLine(nextText, matchPattern, patterns)) {
      break;
    }

    const trimmed = nextText.trim();
    
    if (trimmed.startsWith('(') || trimmed.startsWith('//')) {
      parts.push(sanitizeTodoExtract(nextText));
      j++;
      continue;
    }

    
    if (trimmed.length > 0 && !hasPatternAtCommentStart(nextText, patterns)) {
      parts.push(sanitizeTodoExtract(nextText));
      j++;
      continue;
    }

    break;
  }

  return { combinedSuffix: parts.join(" "), endIndex: j };
}

function stripBlockLinePrefix(text: string): string {
  // Remove '/**', '/*' or leading '*' with all following spaces
  // This ensures labels like [tag] are preserved in block comments
  return text.replace(/^\s*(?:\/\*\*?|\*)\s*/, "");
}

function isHtmlBlockStartWithoutEnd(text: string): boolean {
  return (
    text.includes(REGEX.HTML_COMMENT_START) &&
    !text.includes(REGEX.HTML_COMMENT_END)
  );
}

function isBlockStartWithoutEnd(text: string): boolean {
  return (
    text.includes(REGEX.BLOCK_COMMENT_START) &&
    !text.includes(REGEX.BLOCK_COMMENT_END)
  );
}

function isInsideBlock(text: string): boolean {
  // Detect if line is inside a block comment (starts with * but not /* or */)
  const trimmed = text.trimStart();
  return (
    trimmed.startsWith("*") &&
    !trimmed.startsWith("/*") &&
    !trimmed.startsWith("*/")
  );
}

function isTodoLine(
  text: string,
  matchPattern: RegExp,
  patterns: string[],
): boolean {
  // Check if pattern appears at the start of comment (after removing markers)
  return hasPatternAtCommentStart(text, patterns) && matchPattern.test(text);
}

function extractCommentContent(text: string): string {
  return text.replace(REGEX.LINE_COMMENT_PREFIX_REGEX, "").trim();
}

function isLineComment(text: string): boolean {
  return REGEX.LINE_COMMENT_REGEX.test(text);
}
