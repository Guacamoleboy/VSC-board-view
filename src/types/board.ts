import type { CommonLabels } from "./label";

export interface RawHit {
  id: string;
  file: string;
  line: number;
  text: string;
  lastModified?: Date;
  daysOld?: number;
  issueId?: string;
  issueKey?: string;
  issueLink?: string;
}

export interface BaseBoardItem {
  id: string;
  title: string;
  description: string;
  filePath: string;
  relativePath: string;
  line: number;
  labels: CommonLabels[] | string[] | undefined;
  lastModified?: Date;
  daysOld?: number;
  issueId?: string;
  issueKey?: string;
  issueLink?: string;
  assignees: string[];
}

export type KanbanStatus = "idea" | "to be done" | "in progress" | "in review" | "done";

export interface KanbanItem extends BaseBoardItem {
  boardType: "kanban";
  status: KanbanStatus;
  priority: string;
}

export type TodoPriority = "Low" | "Medium" | "High" | "Urgent" | "Critical";

export interface TodoItem extends BaseBoardItem {
  boardType: "todo";
  priority: TodoPriority;
  status?: never;
}

export type BugStatus = "Open" | "Fixing" | "Fixed";

export interface BugItem extends BaseBoardItem {
  boardType: "bug";
  priority: string;
  status: BugStatus;
}

export type BoardItem = KanbanItem | TodoItem | BugItem;
export type BoardGroups = Record<string, BoardItem[]>;