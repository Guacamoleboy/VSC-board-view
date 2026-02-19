import { RawHit, TodoItem, TodoPriority } from "@/types/board"; 
import { parseBoardItem } from "@/domain/parsing/parser-factory";
import { REGEX } from "@/constants/regex";

export function transformTodoHit(hit: RawHit, relativePath: string): TodoItem | undefined {
  const parsed = parseBoardItem(hit.text);
  if (!parsed || parsed.boardType !== "todo") return undefined;

  const normalizedDescription = (parsed.description || "").replace(
    REGEX.LINE_BREAK_REGEX,
    REGEX.LINE_BREAK_TOKEN
  );

  return {
    boardType: "todo",
    token: parsed.token,
    id: hit.id,
    title: parsed.title ?? "No Title",
    priority: (parsed.priority as TodoPriority) ?? "Low",
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
  } as TodoItem;
}