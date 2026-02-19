import * as vscode from "vscode";
import { BoardItem, BoardGroups, RawHit } from "@/types/board";
import { transformKanbanHit } from "./kanban-transformer";
import { transformTodoHit } from "./todo-transformer";
import { transformBugHit } from "./bug-transformer";
import { parseBoardItem } from "@/domain/parsing/parser-factory";


export function groupItems(items: BoardItem[]): BoardGroups {
  const groups: BoardGroups = {};

  items.forEach(item => {
    let column: string;

    if (item.boardType === "kanban") {
      column = (item.status || "idea").toLowerCase();
    } else if (item.boardType === "bug") {
      column = (item.status || "open").toLowerCase();
    } else {
      column = (item.priority || "low").toLowerCase();
    }

    if (!groups[column]) {
      groups[column] = [];
    }
    groups[column].push(item);
  });

  return groups;
}

export function buildBoardItems(hits: RawHit[]): BoardItem[] {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  const relativePathResolver = workspaceFolders?.length
    ? (uri: string) => vscode.workspace.asRelativePath(uri)
    : (uri: string) => uri;

  const items: BoardItem[] = [];

  console.log(`[Board Debug] Starter buildBoardItems med ${hits.length} rå hits.`);

  for (const hit of hits) {
    const relativePath = relativePathResolver(hit.file);
    const parsed = parseBoardItem(hit.text);
    
    if (!parsed) {
      console.log(`[Board Debug] Parser kunne ikke læse linje: "${hit.text}"`);
      continue;
    }

    let boardItem: BoardItem | undefined;
    
    if (parsed.boardType === "kanban") {
      boardItem = transformKanbanHit(hit, relativePath);
    } else if (parsed.boardType === "bug") {
      boardItem = transformBugHit(hit, relativePath);
    } else if (parsed.boardType === "todo") {
      boardItem = transformTodoHit(hit, relativePath);
    }

    if (boardItem) {
      items.push(boardItem);
    } else {
      console.log(`[Board Debug] Transformer fejlede for ${parsed.boardType} på linje: ${hit.line}`);
    }
  }

  console.log(`[Board Debug] Build færdig. Returnerer ${items.length} BoardItems.`);
  return items;
}