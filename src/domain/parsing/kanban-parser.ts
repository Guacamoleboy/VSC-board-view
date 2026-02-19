import { BoardParser } from "./board-parser";
import { RawParsedComment } from "./base-parser";

const KANBAN_TAGS = ["KANBAN", "@KANBAN"];
const STATUS_LEVELS = [
    "idea",
    "to be done",
    "in progress",
    "in review",
    "done",
];

export function spawnStructuredCommentForKanban(typeToken: string) {
    return `${typeToken.toUpperCase()}\n   (title) (description) (status) (priority) (assignee) [badge, badge]`;
}

export class KanbanParser implements BoardParser {

  supports(token: string): boolean {
    return KANBAN_TAGS.includes(token);
  }

  parse(raw: RawParsedComment) {
    const [title, description, statusRaw, priority, assigneeRaw] = raw.parens;

    const status = STATUS_LEVELS.includes(statusRaw?.toLowerCase())
      ? statusRaw.toLowerCase()
      : "idea";

    const blacklistedValues = ["assignee", "null", "undefined", ""];

    const assignees = assigneeRaw 
      ? assigneeRaw.split(",")
          .map(s => s.trim())
          .filter(s => s && !blacklistedValues.includes(s.toLowerCase())) 
      : [];

    return {
      boardType: "kanban",
      title: title ?? "No Title",
      description: description ?? "",
      status,
      priority: priority ?? "Low",
      assignees,
      labels: raw.labels,
      token: raw.token,
    };
  }

}