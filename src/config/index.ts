import * as vscode from "vscode";

import {
  buildPriorityPattern,
  buildTodoPattern,
  validateSearchPatterns,
} from "@/utils/regex-builder";

export function getTargetExtensions(): string[] {
  return vscode.workspace
    .getConfiguration("todo-board")
    .get<string[]>("fileExtensions", [
      "html",
      "css",
      "scss",
      "sass",
      "ts",
      "tsx",
      "js",
      "jsx",
      "vue",
      "mjs",
      "cjs",
      "md",
      "mdx",
      "json",
      "yaml",
      "yml",
      "java",
      "py",
      "go",
      "rb",
      "php",
      "rs",
      "swift",
      "kt",
      "kts",
      "dart",
      "cs",
    ]);
}

export function getIncludeGlob(): string {
  const exts = getTargetExtensions();
  return `**/*.{${exts.join(",")}}`;
}

export function getExcludeGlob(): string {
  return "{**/node_modules/**,**/assets/**,**/.git/**,**/.svn/**,**/.hg/**,**/.DS_Store,**/.idea/**,**/.vscode/**,**/.angular/**,**/dist/**,**/out/**,**/build/**,**/coverage/**,**/tmp/**,**/.cache/**}";
}

export function getMaxTodoLines(): number {
  return vscode.workspace
    .getConfiguration("todo-board")
    .get<number>("maxTodoLines", 4);
}

export function getSearchPatterns(): string[] {
  const patterns = vscode.workspace
    .getConfiguration("todo-board")
    .get<string[]>("searchPatterns", [
      "TODO", 
      "@TODO", 
      "KANBAN", 
      "@KANBAN", 
      "BUG",
      "@BUG", 
      "FIXME"
    ]);
  return validateSearchPatterns(patterns);
}

export function getTodoPattern(): RegExp {
  const patterns = getSearchPatterns();
  return buildTodoPattern(patterns);
}

export function getPriorityPattern(): RegExp {
  const patterns = getSearchPatterns();
  return buildPriorityPattern(patterns);
}
