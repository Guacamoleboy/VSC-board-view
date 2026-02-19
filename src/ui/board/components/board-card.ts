import { iconsSvg } from "@/ui/icons";
import { formatDate, formatDaysOld, getAgeBadgeClass } from "@/utils/age-formatter";
import { getLabelColor } from "@/utils/label";
import { escapeAttribute, escapeHtml } from "@/utils/sanitize";
import type { BoardItem } from "@/types/board";
import type { CardContext } from "@/types/CardContext";
import { renderKanbanCard } from "../../cards/kanban-card";
import { renderTodoCard } from "../../cards/todo-card";
import { renderBugCard } from "../../cards/bug-card";

export function renderCard(item: BoardItem, user1Uri: string): string {
  const safeTitle = escapeHtml(item.title || "No Title");
  const safeDescription = escapeHtml(item.description || "").replace(/\n/g, "<br />");
  const displayBadge = item.boardType === "kanban" ? item.status : item.priority;
  const priority = escapeHtml(item.priority || "Low");
  const fileName = item.relativePath.split("/").pop() ?? item.relativePath;

  const customUserUri = user1Uri.replace("user1.png", "custom-user.png");

  const ctx: CardContext = {
    item,
    safeTitle,
    safeDescription,
    displayBadge,
    priority,
    locationHtml: `
      <span class="badge badge--location" title="${escapeHtml(item.relativePath)}">
        ${escapeHtml(fileName)} : ${item.line + 1}
      </span>
    `,
    assigneesHtml: (item.assignees || []).map(user => {
      const safeName = escapeHtml(user);
      const initial = safeName.charAt(0).toUpperCase();

      return `
        <div class="assignee-container" title="${safeName}">
          <img src="${customUserUri}" class="assignee-avatar" />
          <span class="assignee-initial">${initial}</span>
          <span class="assignee-full-name">${safeName}</span>
        </div>
      `;
    }).join(""),
    
    issueBadgeHtml: item.issueKey 
      ? `<span class="issue-badge" data-issue-link="${escapeAttribute(item.issueLink || "")}" title="Open Jira Issue">${escapeHtml(item.issueKey)}</span>`
      : "",
    ageBadgeHtml: item.daysOld !== undefined 
      ? `<span class="age-badge ${getAgeBadgeClass(item.daysOld)}" title="Last modified: ${item.lastModified ? formatDate(item.lastModified) : "Unknown"}">${iconsSvg.clock} ${formatDaysOld(item.daysOld)}</span>`
      : "Recent",
    labelsHtml: (item.labels || []).map(label => {
      const colors = getLabelColor(label);
      return `<span class="badge badge--clickable" data-label="${escapeAttribute(label)}" style="background-color: ${colors.background}; color: ${colors.text};">${escapeHtml(label)}</span>`;
    }).join("")
  };

  switch (item.boardType) {
    case "kanban": return renderKanbanCard(ctx);
    case "bug": return renderBugCard(ctx);
    case "todo":
    default: return renderTodoCard(ctx);
  }

}