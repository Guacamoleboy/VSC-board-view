import type * as vscode from "vscode";
import { generateNonce } from "@/utils/generators";
import { renderColumn } from "./components/board-column";
import { getHeaderComponent } from "./components/header";
import { getBoardScripts } from "./scripts";
import { getBoardStyles } from "./styles";
import { BoardGroups } from "@/types/board";

const KANBAN_COLUMNS = [
  "idea",
  "to be done",
  "in progress",
  "in review",
  "done"
];

const TODO_COLUMNS = [
  "low",
  "medium",
  "high",
  "urgent",
  "critical"
];

const BUG_COLUMNS = [
  "open",
  "fixing",
  "fixed",
];

export function renderBoard(
  webview: vscode.Webview,
  groups: BoardGroups,
  user1Uri: string,
  activeView: "kanban" | "todo" | "bug" = "kanban"
): string {
  console.log("Groups received in renderBoard:", JSON.stringify(groups));
  const nonce = generateNonce();

  // Her tjekker vi om vi har Kanban data. 
  // Hvis ja, bruger vi KANBAN_COLUMNS for at sikre faste kolonner og korrekt rækkefølge.
  // Hvis det er et andet board (fx Todo/Priority), bruger vi de keys der findes i data.
  
  const isKanbanView = Object.values(groups).flat().some(item => item.boardType === "kanban");
  let columns: string;
  
  if (activeView === "kanban") {
    columns = KANBAN_COLUMNS.map(s => renderColumn(s, groups[s] || [], user1Uri)).join("");
  } else if (activeView === "bug") {
    columns = BUG_COLUMNS.map(s => renderColumn(s, groups[s] || [], user1Uri)).join("");
  } else {
    columns = TODO_COLUMNS.map(p => renderColumn(p, groups[p] || [], user1Uri)).join("");
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta 
          http-equiv="Content-Security-Policy" 
          content="default-src 'none'; img-src ${webview.cspSource} https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';" 
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Extension Name</title>
        <style>
          ${getBoardStyles()}
        </style>
      </head>
      <body>
        ${getHeaderComponent(activeView)}
        <main class="board">
          ${columns || '<p class="empty-board">No tasks found. Add // KANBAN (status) to your code.</p>'}
        </main>

        <!-- Modal (uændret) -->
        <div id="issueModal" class="modal" hidden>
          <div class="modal__overlay"></div>
          <div class="modal__content">
            <div class="modal__header">
              <h2 class="modal__title">Create Jira Issue</h2>
              <button class="modal__close" id="modalClose" title="Close">×</button>
            </div>
            <form class="modal__form" id="issueForm">
              <div class="form-group-row">
                <div class="form-group">
                  <label for="issueProject">Project *</label>
                  <select id="issueProject" name="project" required>
                    <option value="">Loading projects...</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="issueType">Type *</label>
                  <select id="issueType" name="issueType" required>
                    <option value="">Loading types...</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label for="issueSummary">Summary *</label>
                <input type="text" id="issueSummary" name="summary" required maxlength="255" />
              </div>
              <div class="form-group">
                <label for="issueDescription">Description</label>
                <textarea id="issueDescription" name="description" rows="6"></textarea>
              </div>
              <div class="form-group">
                <label for="issueLocation">Location</label>
                <input type="text" id="issueLocation" name="location" readonly />
              </div>
              <div class="modal__actions">
                <button type="button" class="button button--secondary" id="modalCancel">Cancel</button>
                <button type="submit" class="button button--primary">Create Issue</button>
              </div>
            </form>
          </div>
        </div>

        <script nonce="${nonce}">
          ${getBoardScripts()}
        </script>
      </body>
    </html>
  `;
}