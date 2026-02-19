// src/ui/cards/todo-card.ts
import { CardContext } from "@/types/CardContext";
import { escapeAttribute, escapeHtml } from "@/utils/sanitize";

export function renderTodoCard(ctx: CardContext): string {
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

  return `
    <article
      class="card card--todo"
      data-card="true"
      data-board-type="todo"
      data-file="${escapeAttribute(item.filePath)}"
      data-line="${item.line}"
      data-status="${escapeAttribute(priority.toLowerCase())}"
      data-days-old="${item.daysOld !== undefined ? item.daysOld : 0}"
    >
      <div class="card__content">
        <div class="card__header">
          <span class="header__date">${ageBadgeHtml}</span>
          <span class="header__assignees">${assigneesHtml}</span>
        </div>
        
        <div class="card__header__alignment">
          <h2 class="card__title">${safeTitle}</h2>
          <span class="card__priority-badge" data-priority="${escapeAttribute(priority.toLowerCase())}">
            ${escapeHtml(displayBadge)}
          </span>
        </div>

        <p class="card__meta">
          ${locationHtml}
          ${issueBadgeHtml}
        </p>

        <p class="card__description">${safeDescription}</p>
        
        <div class="card__labels">
          ${labelsHtml}
        </div>
      </div>
    </article>
  `;
  
}