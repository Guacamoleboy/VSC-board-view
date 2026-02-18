import * as vscode from "vscode";
import { readCache, writeCache } from "@/services/cache";
import type { TodoHit } from "@/types/todo";
import { getCurrentPanel, updateBoardContent } from "@/commands/open-board";
import { mergeWithPersistedIssues, persistResults } from "@/services/persist";
import { enrichTodosWithGitInfo, scanWorkspace } from "@/services/scanner";

export async function scanTodosBackground(doc?: vscode.TextDocument): Promise<void> {
  try {
    const cache = await readCache();
    const { hits: newHits } = await scanWorkspace(undefined, undefined, doc);
    const enrichedHits = await enrichTodosWithGitInfo(newHits);
    const mergedHits = await mergeWithPersistedIssues(enrichedHits);

    if (doc) {
      cache.files[doc.uri.fsPath] = { mtime: Date.now(), hits: mergedHits };
    } else {
      for (const hit of mergedHits) {
        cache.files[hit.file] = { mtime: Date.now(), hits: mergedHits.filter(h => h.file === hit.file) };
      }
    }

    const allHits: TodoHit[] = Object.entries(cache.files).flatMap(([file, cacheEntry]) =>
        cacheEntry.hits.map(hit => ({ ...hit, file }))
    );

    await persistResults(allHits);

    await vscode.commands.executeCommand("todo-board.updateSidebar");

    const panel = getCurrentPanel();

    if (panel) {
      await updateBoardContent(panel.webview);
    }

  } catch (err) {
    console.error("Erro no background scan:", err);
  }

}