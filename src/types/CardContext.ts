import type { BoardItem } from "./board";

export interface CardContext {
    item: BoardItem;
    safeTitle: string;
    safeDescription: string;
    displayBadge: string;
    priority: string;
    locationHtml: string;
    assigneesHtml: string;
    issueBadgeHtml: string;
    ageBadgeHtml: string;
    labelsHtml: string;
}