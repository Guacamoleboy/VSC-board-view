import { KanbanStatus, BoardItem } from "@/types/board";

export type BoardType = "kanban" | "todo" | "bug";

export interface BoardConfig {
  type: BoardType;
  tags: string[];
  defaultStatus: KanbanStatus | string; 
}

export const BOARDS: BoardConfig[] = [
  {
    type: "kanban",
    tags: ["KANBAN", "@KANBAN"],
    defaultStatus: "idea",
  },
  {
    type: "todo",
    tags: ["TODO", "@TODO"],
    defaultStatus: "to be done", 
  },
  {
    type: "bug",
    tags: ["BUG", "@BUG"],
    defaultStatus: "in progress",
  },
];