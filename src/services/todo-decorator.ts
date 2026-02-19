import * as vscode from "vscode";
import { getMaxTodoLines, getSearchPatterns, getTodoPattern } from "@/config";

// Farve-konfiguration for alle tags (TODO, KANBAN, BUG, etc.)
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
  kanban: "#e6bd08",
  todo: "#69f74d",
};

const extraDecorationType = vscode.window.createTextEditorDecorationType({
  color: "#FFFFFF",
  fontWeight: "bold",
});

export const tagDecorationTypes: Record<string, vscode.TextEditorDecorationType> = {};
let isEnabled = true;

function createDecorationTypes(): void {
  for (const key in tagColors) {
    tagDecorationTypes[key] = vscode.window.createTextEditorDecorationType({
      color: tagColors[key],
      overviewRulerColor: tagColors[key],
      overviewRulerLane: vscode.OverviewRulerLane.Right,
      fontWeight: "bold",
    });
  }
}

function extractLabelsFromLine(line: string): string[] {
  const tags = Object.keys(tagColors).join("|");
  const regex = new RegExp(`(${tags})`, "i");
  const match = line.match(regex);
  return match ? [match[0].toLowerCase()] : [];
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
  if (!isCommentLine(lineText)) return false;
  const upperText = lineText.toUpperCase();
  return patterns.some((pattern) => upperText.includes(pattern.toUpperCase()));
}

function decorateTodos(editor: vscode.TextEditor | undefined): void {
  if (!editor || !isEnabled) return;

  const text = editor.document.getText();
  const extraDecorationRanges: vscode.Range[] = [];
  const patterns = getSearchPatterns();
  const todoPattern = getTodoPattern();
  const lines = text.split(/\r?\n/);

  // Nulstil alle eksisterende dekorationer
  for (const key in tagDecorationTypes) {
    editor.setDecorations(tagDecorationTypes[key], []);
  }
  editor.setDecorations(extraDecorationType, []);

  const tagRanges: Record<string, vscode.Range[]> = {};
  for (const key in tagColors) tagRanges[key] = [];

  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i];
    if (!todoPattern.test(lineText)) continue;
    if (!isTodoInComment(lineText, patterns)) continue;

    const lineLabels = extractLabelsFromLine(lineText);
    if (lineLabels.length === 0) continue;

    const mainLabel = lineLabels[0];
    const range = new vscode.Range(
      new vscode.Position(i, lineText.indexOf(lineText.trimStart())),
      new vscode.Position(i, lineText.length)
    );

    if (tagDecorationTypes[mainLabel]) {
      tagRanges[mainLabel].push(range);
    }

    // Highlight (status) og [labels]
    const extraRegex = /(\([^)]*\)|\[[^\]]*\])/g;
    let matchExtra: RegExpExecArray | null;
    while ((matchExtra = extraRegex.exec(lineText))) {
      extraDecorationRanges.push(
        new vscode.Range(
          new vscode.Position(i, matchExtra.index),
          new vscode.Position(i, matchExtra.index + matchExtra[0].length)
        )
      );
    }
  }

  // Påfør dekorationer
  for (const key in tagRanges) {
    editor.setDecorations(tagDecorationTypes[key], tagRanges[key]);
  }
  editor.setDecorations(extraDecorationType, extraDecorationRanges);
}

export function initializeTodoDecorator(context: vscode.ExtensionContext): void {
  const config = vscode.workspace.getConfiguration("todo-board");
  isEnabled = config.get<boolean>("highlight.enabled", true);
  if (!isEnabled) return;

  createDecorationTypes();

  if (vscode.window.activeTextEditor) decorateTodos(vscode.window.activeTextEditor);

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => decorateTodos(editor)),
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (vscode.window.activeTextEditor && event.document === vscode.window.activeTextEditor.document) {
        decorateTodos(vscode.window.activeTextEditor);
      }
    })
  );
}