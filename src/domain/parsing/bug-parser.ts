import { BoardParser, ParsedBoardItem } from "./board-parser";
import { RawParsedComment } from "./base-parser";

const BUG_TAGS = ["BUG", "@BUG"];
const BUG_STATUSES = ["open", "fixing", "fixed"];

export function spawnStructuredCommentForBug(typeToken: string) {
    return `${typeToken.toUpperCase()}\n   (title) (description) (status) (assignee) [badge, badge]`;
}

export class BugParser implements BoardParser {
  supports(token: string): boolean {
    return BUG_TAGS.includes(token);
  }

  parse(raw: RawParsedComment): ParsedBoardItem {
    const [title, description, statusRaw, assigneeRaw] = raw.parens;
    const status = BUG_STATUSES.includes(statusRaw?.toLowerCase())
      ? statusRaw.toLowerCase()
      : "open";

    const blacklistedValues = ["assignee", "null", "undefined", ""];
    const assignees = assigneeRaw && !blacklistedValues.includes(assigneeRaw.toLowerCase())
      ? assigneeRaw.split(",").map(s => s.trim()).filter(Boolean)
      : [];

    return {
      boardType: "bug",
      title: title ?? "No Title",
      description: description ?? "",
      status,
      priority: "Medium",
      assignees,
      labels: raw.labels,
      token: raw.token,
    };

  }

}