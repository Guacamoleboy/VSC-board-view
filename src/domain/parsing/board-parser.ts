import type { RawParsedComment } from "./base-parser";

export interface ParsedBoardItem {
    boardType: string;
    title: string;
    description: string;
    status?: string;
    priority?: string;
    assignees: string[];
    labels: string[];
    token: string;
}

export interface BoardParser {
    supports(token: string): boolean;
    parse(raw: RawParsedComment): ParsedBoardItem;
}