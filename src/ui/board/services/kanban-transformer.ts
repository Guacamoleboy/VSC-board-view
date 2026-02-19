import { RawHit, KanbanItem, KanbanStatus } from "@/types/board";
import { parseBoardItem } from "@/domain/parsing/parser-factory";
import { REGEX } from "@/constants/regex";

interface ParsedKanban {
  boardType: "kanban";
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  labels?: string[];
  assignees?: string[];
}

export function transformKanbanHit(hit: RawHit, relativePath: string): KanbanItem | undefined {
  const parsedRaw = parseBoardItem(hit.text);
  if (!parsedRaw || parsedRaw.boardType !== "kanban") return undefined;
  const parsed = parsedRaw as unknown as ParsedKanban;

  const normalizedDescription = (parsed.description || "").replace(
    REGEX.LINE_BREAK_REGEX,
    REGEX.LINE_BREAK_TOKEN
  );

  return {
    boardType: "kanban",
    id: hit.id,
    status: (parsed.status as KanbanStatus) ?? "idea",
    title: parsed.title ?? "No Title",
    priority: parsed.priority ?? "Low",
    description: normalizedDescription,
    filePath: hit.file,
    relativePath,
    line: hit.line,
    labels: parsed.labels || [],
    lastModified: hit.lastModified,
    daysOld: hit.daysOld,
    issueId: hit.issueId,
    issueKey: hit.issueKey,
    issueLink: hit.issueLink,
    assignees: parsed.assignees || [],
  };
}
