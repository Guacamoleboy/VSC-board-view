// src/ui/cards/bug-card.ts
import { CardContext } from "@/types/CardContext";
import { escapeAttribute, escapeHtml } from "@/utils/sanitize";

export function renderBugCard(ctx: CardContext): string {
  const { 
    item, 
    safeTitle, 
    safeDescription, 
    locationHtml, 
    ageBadgeHtml, 
    assigneesHtml, 
    labelsHtml, 
    priority, 
    issueBadgeHtml 
  } = ctx;

  return `
    <article
      class="card card--bug"
      data-card="true"
      data-board-type="bug"
      data-file="${escapeAttribute(item.filePath)}"
      data-line="${item.line}"
      data-status="bug"
      data-priority="${escapeAttribute(priority.toLowerCase())}"
    >
      <div class="card__content">
        <div class="card__header">
          <div class="bug-label">
            <span class="header__date">${ageBadgeHtml}</span>
          </div>
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

        <p class="card__description card__description--bug">${safeDescription}</p>

        <div class="card__footer">
          <div class="card__labels">
            ${labelsHtml}
          </div>
        </div>
      </div>
    </article>
  `;

}