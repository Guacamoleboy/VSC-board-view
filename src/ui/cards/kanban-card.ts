// src/ui/cards/kanban-card.ts
import { CardContext } from "@/types/CardContext";
import { escapeAttribute, escapeHtml } from "@/utils/sanitize";

export function renderKanbanCard(ctx: CardContext): string {
  const { 
    item, 
    safeTitle, 
    safeDescription, 
    locationHtml, 
    ageBadgeHtml, 
    assigneesHtml, 
    labelsHtml, 
    displayBadge, 
    priority,
    issueBadgeHtml 
  } = ctx;

  const statusClass = (item.status || "todo").toLowerCase().replace(/\s+/g, "-");

  return `
    <article
      class="card card--kanban"
      data-card="true"
      data-board-type="kanban"
      data-file="${escapeAttribute(item.filePath)}"
      data-line="${item.line}"
      data-status="${escapeAttribute(statusClass)}"
      data-issue-key="${escapeAttribute(item.issueKey || "")}"
    >
      <div class="card__content">
        <div class="card__header">
          <span class="card__priority-badge" data-priority="${escapeAttribute(priority.toLowerCase())}">
            ${escapeHtml(priority)}
          </span>
          <div class="header__assignees">
            ${assigneesHtml}
          </div>
        </div>

        <div class="card__header__alignment">
          <h2 class="card__title">${safeTitle}</h2>
        </div>

        <p class="card__meta">
          ${locationHtml}
        </p>

        <p class="card__description">${safeDescription}</p>

        <div class="card__labels">
          ${labelsHtml}
        </div>
      </div>
    </article>
  `;
}