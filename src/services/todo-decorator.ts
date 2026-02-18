import * as vscode from "vscode";

import { getMaxTodoLines, getSearchPatterns, getTodoPattern } from "@/config";
import type { TodoStatus } from "@/types/todo";

// Color Scheme
const tagColors: Record<string, string> = {
  bug: "#DC2626",
  fixme: "#F43F5E",
  refactor: "#6366F1",
  security: "#EC4899",
  reviewed: "#10B981",
  reviewrequest: "#F59E0B",
  temp: "#F97316",
  optimize: "#8B5CF6",
  issue: "#DC2626",
  task: "#14B8A6",
  doc: "#FBBF24",
  test: "#06B6D4",
  link: "#3B82F6",
  hack: "#EF4444",
  deprecated: "#9CA3AF",
  kanban: "#e6bd08;",
};

const extraDecorationType = vscode.window.createTextEditorDecorationType({
  color: "#FFFFFF",
});

function extractLabelsFromLine(line: string): string[] {
  const match = line.match(/(TODO|BUG|FIXME|REFRACTOR|SECURITY|REVIEWED|REVIEWREQUEST|TEMP|OPTIMIZE|ISSUE|TASK|DOC|TEST|LINK|HACK|DEPRECATED|KANBAN)/i);
  return match ? [match[0]] : [];
}

// Create TextEditorDecorationTypes for each tag
export const tagDecorationTypes: Record<string, vscode.TextEditorDecorationType> = {};
  for (const key in tagColors) {
    tagDecorationTypes[key] = vscode.window.createTextEditorDecorationType({
      color: tagColors[key],
      overviewRulerColor: tagColors[key],
      overviewRulerLane: vscode.OverviewRulerLane.Right,
    });
}

let highPriorityDecorationType: vscode.TextEditorDecorationType;
let mediumPriorityDecorationType: vscode.TextEditorDecorationType;
let lowPriorityDecorationType: vscode.TextEditorDecorationType;
let defaultPriorityDecorationType: vscode.TextEditorDecorationType;
let isEnabled = true;

// Editor colors triggerig on known // XX.
function createDecorationTypes(): void {
  highPriorityDecorationType = vscode.window.createTextEditorDecorationType({
    color: "#e74c3c",
    overviewRulerColor: "#e74c3c",
    overviewRulerLane: vscode.OverviewRulerLane.Right,
  });

  mediumPriorityDecorationType = vscode.window.createTextEditorDecorationType({
    color: "#ffa94d", 
    overviewRulerColor: "#ffa94d",
    overviewRulerLane: vscode.OverviewRulerLane.Right,
  });

  lowPriorityDecorationType = vscode.window.createTextEditorDecorationType({
    color: "#4dabf7", 
    overviewRulerColor: "#4dabf7",
    overviewRulerLane: vscode.OverviewRulerLane.Right,
  });

  // Default
  defaultPriorityDecorationType = vscode.window.createTextEditorDecorationType({
    color: "#69f74d",
    overviewRulerColor: "#69f74d",
    overviewRulerLane: vscode.OverviewRulerLane.Right,
  });

}


function isCommentLine(line: string): boolean {
  const trimmed = line.trimStart();
  return (
    trimmed.startsWith("//") ||
    trimmed.startsWith("/*") ||
    trimmed.startsWith("*") ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("<!--")
  );
}

function isTodoInComment(lineText: string, patterns: string[]): boolean {
  const trimmed = lineText.trimStart();
  if (!isCommentLine(lineText)) return false;

  let commentContent = trimmed;
  if (commentContent.startsWith("//")) commentContent = commentContent.substring(2).trimStart();
  else if (commentContent.startsWith("#")) commentContent = commentContent.substring(1).trimStart();
  else if (commentContent.startsWith("<!--")) commentContent = commentContent.substring(4).trimStart();
  else if (commentContent.startsWith("/*")) commentContent = commentContent.replace(/^\/\*+\s*/, "");
  else if (commentContent.startsWith("*")) commentContent = commentContent.replace(/^\*+\s*/, "");

  return patterns.some(pattern =>
    commentContent.toUpperCase().startsWith(pattern.toUpperCase())
  );

}

// Editor decoration
function decorateTodos(editor: vscode.TextEditor | undefined): void {
  if (!editor || !isEnabled) return;

  const text = editor.document.getText();
  const highPriorityRanges: vscode.Range[] = [];
  const mediumPriorityRanges: vscode.Range[] = [];
  const lowPriorityRanges: vscode.Range[] = [];
  const defaultPriorityRanges: vscode.Range[] = [];
  const extraDecorationRanges: vscode.Range[] = [];
  const patterns = getSearchPatterns();
  const todoPattern = getTodoPattern();
  const maxLines = getMaxTodoLines();
  const lines = text.split("\n");

  for (const key in tagDecorationTypes) editor.setDecorations(tagDecorationTypes[key], []);
  editor.setDecorations(extraDecorationType, []);
  editor.setDecorations(highPriorityDecorationType, []);
  editor.setDecorations(mediumPriorityDecorationType, []);
  editor.setDecorations(lowPriorityDecorationType, []);
  editor.setDecorations(defaultPriorityDecorationType, []);

  const tagRanges: Record<string, vscode.Range[]> = {};
  for (const key in tagColors) tagRanges[key] = [];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const lineText = lines[lineIndex];
    if (!todoPattern.test(lineText)) continue;
    if (!isTodoInComment(lineText, patterns)) continue;

    const lineLabels = extractLabelsFromLine(lineText);
    if (!lineLabels || lineLabels.length === 0) continue;

    const priorityMatch = lineText.match(/\((\w+)\)/);
    const token = priorityMatch?.[1]?.toLowerCase() ?? "default";

    const trimmedLine = lineText.trimStart();
    const leadingWhitespace = lineText.length - trimmedLine.length;
    let startLineIndex = lineIndex;
    let commentStart = leadingWhitespace;

    let endLineIndex = lineIndex;
    const maxEndLine = Math.min(startLineIndex + maxLines - 1, lines.length - 1);
    for (let i = lineIndex + 1; i <= maxEndLine; i++) {
      const nextLine = lines[i].trimStart();
      const isContinuation =
        (nextLine.startsWith("//") ||
         nextLine.startsWith("*") ||
         nextLine.startsWith("#") ||
         nextLine.startsWith("<!--")) &&
        !todoPattern.test(lines[i]);
      if (isContinuation) endLineIndex = i;
      else break;
    }

    const fullRange = new vscode.Range(
      new vscode.Position(startLineIndex, commentStart),
      new vscode.Position(endLineIndex, lines[endLineIndex]?.length ?? 0)
    );

    const extraRegex = /(\([^)]*\)|\[[^\]]*\])/g; 
    let matchExtra: RegExpExecArray | null;
    while ((matchExtra = extraRegex.exec(lineText))) {
      const startPos = new vscode.Position(lineIndex, matchExtra.index);
      const endPos = new vscode.Position(lineIndex, matchExtra.index + matchExtra[0].length);
      extraDecorationRanges.push(new vscode.Range(startPos, endPos));
    }

    for (const label of lineLabels) {
      const lower = label.replace(/^@/, "").toLowerCase();
      if (lower === "todo") {
        switch (token) {
          case "high": highPriorityRanges.push(fullRange); break;
          case "medium": mediumPriorityRanges.push(fullRange); break;
          case "low": lowPriorityRanges.push(fullRange); break;
          default: defaultPriorityRanges.push(fullRange); break;
        }
      } else if (tagDecorationTypes[lower]) {
        tagRanges[lower].push(fullRange);
      } else {
        defaultPriorityRanges.push(fullRange);
      }
    }
  }

  for (const key in tagRanges) editor.setDecorations(tagDecorationTypes[key], tagRanges[key]);
  editor.setDecorations(highPriorityDecorationType, highPriorityRanges);
  editor.setDecorations(mediumPriorityDecorationType, mediumPriorityRanges);
  editor.setDecorations(lowPriorityDecorationType, lowPriorityRanges);
  editor.setDecorations(defaultPriorityDecorationType, defaultPriorityRanges);
  editor.setDecorations(extraDecorationType, extraDecorationRanges);

}

export function initializeTodoDecorator(context: vscode.ExtensionContext): void {
  
  const config = vscode.workspace.getConfiguration("todo-board");
  isEnabled = config.get<boolean>("highlight.enabled", true);
  if (!isEnabled) return;

  createDecorationTypes();

  if (vscode.window.activeTextEditor) decorateTodos(vscode.window.activeTextEditor);

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(editor => decorateTodos(editor)),
    vscode.workspace.onDidChangeTextDocument(event => {
      if (vscode.window.activeTextEditor && event.document === vscode.window.activeTextEditor.document) {
        decorateTodos(vscode.window.activeTextEditor);
      }
    }),
    vscode.workspace.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration("todo-board.highlight")) {
        const newConfig = vscode.workspace.getConfiguration("todo-board");
        const newEnabled = newConfig.get<boolean>("highlight.enabled", true);

        if (newEnabled !== isEnabled) {
          isEnabled = newEnabled;
          if (!isEnabled && vscode.window.activeTextEditor) {
            vscode.window.activeTextEditor.setDecorations(highPriorityDecorationType, []);
            vscode.window.activeTextEditor.setDecorations(mediumPriorityDecorationType, []);
            vscode.window.activeTextEditor.setDecorations(lowPriorityDecorationType, []);
            vscode.window.activeTextEditor.setDecorations(defaultPriorityDecorationType, []);
          }
        }

        if (isEnabled) {
          disposeTodoDecorator();
          createDecorationTypes();
          if (vscode.window.activeTextEditor) decorateTodos(vscode.window.activeTextEditor);
        }
      }
    })
  );

}
 
// Dispose decorations
function disposeTodoDecorator(): void {
  highPriorityDecorationType?.dispose();
  mediumPriorityDecorationType?.dispose();
  lowPriorityDecorationType?.dispose();
  defaultPriorityDecorationType?.dispose();
}