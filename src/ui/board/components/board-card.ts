import { iconsSvg } from "@/ui/icons";
import {
  formatDate,
  formatDaysOld,
  getAgeBadgeClass,
} from "@/utils/age-formatter";
import { getLabelColor } from "@/utils/label";
import { escapeAttribute, escapeHtml } from "@/utils/sanitize";
import type { BoardItem } from "@/types/todo";

export function renderCard(item: BoardItem): string {
  
  // Data
  const safeTitle = escapeHtml(item.title || "No Title");
  const safeDescription = escapeHtml(item.description || "").replace(/\n/g, "<br />");
  const priority = escapeHtml(item.priority || "Low");

  // Comment location in <file>
  const fileName = item.relativePath.split("/").pop() ?? item.relativePath;
  const location = `
    <span class="badge badge--location" title="${escapeHtml(item.relativePath)}">
      ${escapeHtml(fileName)} : ${item.line + 1}
    </span>
  `;

  // Issue badge (se existir)
  const issueBadgeHtml = item.issueKey
    ? `<span class="issue-badge" data-issue-link="${escapeAttribute(item.issueLink || "")}" title="Clique para abrir a issue no Jira">${escapeHtml(item.issueKey)}</span>`
    : "";

  // Age badge (if available)
  const ageBadgeHtml =
    item.daysOld !== undefined
      ? `
      <span
        class="age-badge ${getAgeBadgeClass(item.daysOld)}"
        title="Last modified: ${item.lastModified ? formatDate(item.lastModified) : "Unknown"}"
      >
        ${iconsSvg.clock} ${formatDaysOld(item.daysOld)}
      </span>
    `
      : "";

  const labelsHtml =
    item.labels && item.labels.length > 0
      ? `
      <div class="card__labels">
        ${item.labels
          .map((label) => {
            const colors = getLabelColor(label);
            return `
            <span
              class="badge badge--clickable"
              data-label="${escapeAttribute(label)}"
              style="
                background-color: ${colors.background}; color: ${colors.text};
              "
              title="Click to filter by '${escapeAttribute(label)}'"
            >${escapeHtml(label)}</span>`;
          })
          .join("")}
      </div>
    `
      : "";

  return `
    <article
      class="card"
      data-card="true"
      data-file="${escapeAttribute(item.filePath)}"
      data-line="${item.line}"
      data-days-old="${item.daysOld !== undefined ? item.daysOld : 0}"
      data-priority="${item.status}"
      data-issue-id="${escapeAttribute(item.issueId || "")}"
      data-issue-key="${escapeAttribute(item.issueKey || "")}"
      data-issue-link="${escapeAttribute(item.issueLink || "")}"
    >
      <div class="card__content">
        <div class="card__header">
          ${issueBadgeHtml}
          ${ageBadgeHtml}
        </div>
        <div class="card__header__alignment">
          <h2 class="card__title">${safeTitle}</h2>
          <span class="card__priority-badge" data-priority="${escapeAttribute(priority.toLowerCase())}">
            ${escapeHtml(priority)}
          </span>
        </div>
        <p class="card__meta">
          <span class="card__meta-location">${location}</span>
        </p>
        <p class="card__description">${safeDescription}</p>
        <p class="card__labels">
          ${labelsHtml}
        </p>
      </div>
    </article>
  `;
}
