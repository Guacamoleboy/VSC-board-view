import { BoardParser } from "./board-parser";
import { RawParsedComment } from "./base-parser";

const TODO_TAGS = ["TODO", "@TODO"];
const PRIORITIES = ["low", "medium", "high", "urgent", "critical"];

export function spawnStructuredCommentForTodo(typeToken: string) {
    return `${typeToken.toUpperCase()}\n   (title) (description) (priority) (assignee) [badge, badge]`;
}

export class TodoParser implements BoardParser {

  supports(token: string): boolean {
    return TODO_TAGS.includes(token);
  }

  parse(raw: RawParsedComment) {
    const [title, description, priorityRaw, assigneeRaw] = raw.parens;

    const priority = PRIORITIES.includes(priorityRaw?.toLowerCase())
      ? priorityRaw
      : "Low";

    const blacklistedValues = ["assignee", "null", "undefined", ""];
    const assignees = assigneeRaw && !blacklistedValues.includes(assigneeRaw.toLowerCase())
      ? assigneeRaw.split(",").map(s => s.trim()).filter(Boolean)
      : [];

    return {
      boardType: "todo",
      title: title ?? "No Title",
      description,
      priority,
      assignees,
      labels: raw.labels,
      token: raw.token,
    };
  }

}