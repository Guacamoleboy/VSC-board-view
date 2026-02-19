export interface RawParsedComment {
  token: string;
  parens: string[];
  labels: string[];
}

export function isCommentEmpty(text: string): boolean {
  const trimmed = text.trim();
  const nakedTagRegex = /^\/\/\s*[A-Z@]+\s*$/i;
  return nakedTagRegex.test(trimmed);
}

export function parseRawComment(text: string): RawParsedComment | undefined {
  const trimmed = text.trim();

  const typeMatch = trimmed.match(/^\/\/\s*(\S+)/);
  if (!typeMatch) return undefined;

  const token = typeMatch[1].toUpperCase();

  const parens = [...trimmed.matchAll(/\(([^)]*)\)/g)]
    .map(m => m[1].trim());

  const labelMatch = trimmed.match(/\[(.*?)\]/);
  const labels = labelMatch
    ? labelMatch[1].split(",").map(l => l.trim()).filter(Boolean)
    : [];

  return { token, parens, labels };
}