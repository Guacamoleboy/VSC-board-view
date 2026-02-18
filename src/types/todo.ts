import type { CommonLabels } from "./label";

export type TodoStatus =
  | "idea"
  | "to be done"
  | "in progress"
  | "in review"
  | "done";

export interface BoardItem {
  id: string;
  status: TodoStatus;    
  title: string;           
  description: string;
  priority: string;
  filePath: string;
  relativePath: string;
  line: number;
  labels: CommonLabels[] | string[] | undefined;
  lastModified?: Date;
  daysOld?: number;
  issueId?: string;
  issueKey?: string;
  issueLink?: string;
}

export interface TodoGroups {
  idea: BoardItem[];
  "to be done": BoardItem[];
  "in progress": BoardItem[];
  "in review": BoardItem[];
  done: BoardItem[];
}

export interface TodoHit {
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

export interface ScanResult {
  hits: TodoHit[];
  reused: number;
  scanned: number;
  filesProcessed: number;
}
