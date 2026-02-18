import { escapeHtml } from "@/utils/sanitize";
import { renderCard } from "./board-card";
import type { BoardItem, TodoStatus } from "@/types/todo";

function renderEmptyColumn(): string {
  return `<p class="empty">No tasks added</p>`;
}

const STATUS_LABELS: Record<TodoStatus, string> = {
  idea: "Idea",
  "to be done": "To Be Done",
  "in progress": "In Progress",
  "in review": "In Review",
  done: "Done",
};

export function renderColumn(
  status: TodoStatus,
  items: BoardItem[],
): string {
  const title = STATUS_LABELS[status];
  const count = items.length;
  const cards = count === 0 ? renderEmptyColumn() : items.map(renderCard).join("");

  return `
    <section class="column" data-status="${status}">
      <header class="column__header">
        <span>${escapeHtml(title)}</span>
        <span class="badge">${count}</span>
      </header>
      <div class="column__content">
        ${cards}
      </div>
    </section>
  `;
}