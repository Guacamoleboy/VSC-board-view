import { KanbanParser } from "./kanban-parser";
import { TodoParser } from "./todo-parser";
import { BugParser } from "./bug-parser";
import { REGEX } from "@/constants/regex";

const kanbanParser = new KanbanParser();
const todoParser = new TodoParser();
const bugParser = new BugParser();

interface RawParsedComment {
  token: string;
  parens: string[];
  labels: string[];
  text: string;
}

export function parseBoardItem(text: string) {
  const upperText = text.trim().toUpperCase();
  
  const tokenMatch = text.match(/(TODO|KANBAN|BUG|REVIEWED|FIXME|REFACTOR)/i);
  if (!tokenMatch) return undefined;
  const token = tokenMatch[0].toUpperCase();

  const parenMatches = text.match(/\(([^)]+)\)/g) || [];
  const parens = parenMatches.map(m => m.replace(/[()]/g, ""));

  const labelMatch = text.match(/\[([^\]]+)\]/);
  const labels = labelMatch ? labelMatch[1].split(",").map(s => s.trim()) : [];

  const rawComment = { token, parens, labels, text };

  if (token === "KANBAN" || token === "@KANBAN") {
    const result = kanbanParser.parse(rawComment);
    return result ? { ...result, boardType: "kanban" as const } : undefined;
  } 
  
  if (token === "BUG" || token === "@BUG") {
    const result = bugParser.parse(rawComment);
    return result ? { ...result, boardType: "bug" as const } : undefined;
  }

  const result = todoParser.parse(rawComment);
  return result ? { ...result, boardType: "todo" as const, token } : undefined;

}