import { escapeHtml } from "@/utils/sanitize";
import { renderCard } from "./board-card";
import { BoardItem, KanbanStatus, TodoPriority } from "@/types/board";

// Samlet oversigt over labels til alle mulige kolonner
const COLUMN_LABELS: Record<string, string> = {
  // Kanban
  idea: "Idea",
  "to be done": "To Be Done",
  "in progress": "In Progress",
  "in review": "In Review",
  done: "Done",
  // Todo Board (Prioriteter)
  low: "Low Priority",
  medium: "Medium Priority",
  high: "High Priority",
  urgent: "Urgent",
  critical: "Critical"
};

function renderEmptyColumn(): string {
  return `<p class="empty">No tasks added</p>`;
}

export function renderColumn(
  columnKey: string, // Nu en string for at håndtere både status og priority
  items: BoardItem[],
  user1Uri: string
): string {
  // Find pænt navn til kolonnen, eller brug nøglen direkte hvis den ikke findes
  const title = COLUMN_LABELS[columnKey.toLowerCase()] || columnKey;
  const count = items.length;
  
  const cards = count === 0 
    ? renderEmptyColumn() 
    : items.map(item => renderCard(item, user1Uri)).join("");

  return `
    <section class="column" data-status="${escapeHtml(columnKey.toLowerCase())}">
      <header class="column__header">
        <span class="column__title">${escapeHtml(title)}</span>
        <span class="badge">${count}</span>
      </header>
      <div class="column__content">
        ${cards}
      </div>
    </section>
  `;
}
