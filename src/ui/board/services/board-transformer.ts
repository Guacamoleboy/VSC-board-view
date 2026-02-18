import * as vscode from "vscode";

import { REGEX } from "@/constants/regex";
import { parseTodoStatus } from "@/utils/status";
import type { BoardItem, TodoGroups, TodoHit, TodoStatus } from "@/types/todo";
const STATUS_LEVELS: TodoStatus[] = [
  "idea",
  "to be done",
  "in progress",
  "in review",
  "done",
];

export function buildBoardItems(hits: TodoHit[]): BoardItem[] {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  const relativePathResolver = workspaceFolders?.length
    ? (uri: string) => vscode.workspace.asRelativePath(uri)
    : (uri: string) => uri;

  return hits.map((hit) => toBoardItem(hit, relativePathResolver(hit.file)));
}

function toBoardItem(hit: TodoHit, relativePath: string): BoardItem {
  const { status, title, description, priority, labels } = parseTodoStatus(hit.text);
  const normalizedDescription = description.replace(
    REGEX.LINE_BREAK_REGEX,
    REGEX.LINE_BREAK_TOKEN,
  );

  return {
    id: hit.id,
    status,
    title,  
    priority: priority || "Low",                           
    description: normalizedDescription,
    filePath: hit.file,
    relativePath,
    line: hit.line,
    labels,
    lastModified: hit.lastModified,
    daysOld: hit.daysOld,
    issueId: hit.issueId,
    issueKey: hit.issueKey,
    issueLink: hit.issueLink,
  };

}

function compareBoardItems(left: BoardItem, right: BoardItem): number {
  if (left.relativePath !== right.relativePath) {
    return left.relativePath.localeCompare(right.relativePath);
  }

  if (left.line !== right.line) {
    return left.line - right.line;
  }

  return left.title.localeCompare(right.title);
}

export function groupItems(items: BoardItem[]): TodoGroups {
  const groups: TodoGroups = {
    idea: [],
    "to be done": [],
    "in progress": [],
    "in review": [],
    done: [],
  };

  for (const item of items) {
    const s = item.status ?? "idea";
    groups[s].push(item);
  }

  for (const status of STATUS_LEVELS) {
    groups[status].sort(compareBoardItems);
  }

  return groups;

}