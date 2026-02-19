import { extractLabelsFromText } from "./label";

export function parseLabelsFromLine(text: string) {
  return extractLabelsFromText(text) ?? [];
}