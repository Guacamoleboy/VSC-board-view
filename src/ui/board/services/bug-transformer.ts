import { RawHit, BugItem, BugStatus } from "@/types/board";
import { parseBoardItem } from "@/domain/parsing/parser-factory";

export function transformBugHit(hit: RawHit, relativePath: string): BugItem | undefined {
  const parsed = parseBoardItem(hit.text);
  
  if (!parsed || parsed.boardType !== "bug") return undefined;

  return {
    boardType: "bug",
    id: hit.id,
    title: parsed.title ?? "No Title",
    description: parsed.description || "",
    status: (parsed.status as BugStatus) || "open", 
    priority: parsed.priority ?? "Medium",
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
