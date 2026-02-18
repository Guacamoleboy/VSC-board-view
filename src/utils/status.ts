import { extractLabelsFromText } from "./label";
import type { TodoStatus } from "@/types/todo";

const STATUS_LEVELS: TodoStatus[] = [
  "idea",
  "to be done",
  "in progress",
  "in review",
  "done",
];

export const DEFAULT_STATUS_MAP: Record<string, TodoStatus> = {
  TODO: "to be done",
  "@TODO": "to be done",
  BUG: "in progress",
  "@BUG": "in progress",
  KANBAN: "idea",
  "@KANBAN": "idea",
  FIXME: "idea",
  "@FIXME": "idea",
  REFACTOR: "idea",
  "@REFACTOR": "idea",
  SECURITY: "in review",
  "@SECURITY": "in review",
  REVIEWED: "done",
  "@REVIEWED": "done",
  REVIEWREQUEST: "in review",
  "@REVIEWREQUEST": "in review",
  TEMP: "idea",
  "@TEMP": "idea",
  OPTIMIZE: "in progress",
  "@OPTIMIZE": "in progress",
  ISSUE: "to be done",
  "@ISSUE": "to be done",
  TASK: "to be done",
  "@TASK": "to be done",
  DOC: "idea",
  "@DOC": "idea",
  TEST: "in review",
  "@TEST": "in review",
  LINK: "idea",
  "@LINK": "idea",
  HACK: "idea",
  "@HACK": "idea",
  DEPRECATED: "done",
  "@DEPRECATED": "done",
};

// Param helper when // structure is hit
export function spawnStructuredComment(typeToken: string = "TODO"): string {
  const upperToken = typeToken.toUpperCase();
  if (!(upperToken in DEFAULT_STATUS_MAP)) {
    console.warn(`Unknown typeToken "${typeToken}", defaulting to TODO`);
  }
  return `${upperToken} (title) (description) (status) (priority) [badge, badge]`;
}

export function parseTodoStatus(text: string): {
  status: TodoStatus;
  title: string;
  description: string;
  priority: string;
  labels: string[];
} {
  const trimmed = text.trim();
  const typeMatch = trimmed.match(new RegExp(`^(${Object.keys(DEFAULT_STATUS_MAP).join("|")})`, "i"));
  const typeToken = typeMatch?.[1].toUpperCase() ?? "TODO";
  let status: TodoStatus = DEFAULT_STATUS_MAP[typeToken] ?? "idea";
  const parenMatches = [...trimmed.matchAll(/\(([^)]+)\)/g)].map((m) => m[1].trim());

  let title = "No Title";
  let description = "";
  let priority = "Low";

  if (parenMatches.length >= 1) {
    title = parenMatches[0];
    description = parenMatches[1] || "";

    if (parenMatches[2]) {
      const s = parenMatches[2].toLowerCase() as TodoStatus;
      if (STATUS_LEVELS.includes(s)) status = s;
    }

    if (parenMatches[3]) {
      priority = parenMatches[3];
    }
  }

  const labels = extractLabelsFromText(trimmed) ?? [];

  return { status, title, description, priority, labels };
}