import type * as vscode from "vscode";

import { generateNonce } from "@/utils/generators";
import { renderColumn } from "./components/board-column";
import { getHeaderComponent } from "./components/header";
import { getBoardScripts } from "./scripts";
import { getBoardStyles } from "./styles";
import type { TodoGroups, TodoStatus } from "@/types/todo";

const STATUS_LEVELS: TodoStatus[] = [
  "idea",
  "to be done",
  "in progress",
  "in review",
  "done",
];

export function renderBoard(
  webview: vscode.Webview,
  groups: TodoGroups,
): string {
  const nonce = generateNonce();
  const columns = STATUS_LEVELS.map((status) =>
    renderColumn(status, groups[status] || [])
  ).join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Kanban Task Board</title>
        <style>
          ${getBoardStyles()}
        </style>
      </head>
      <body>
        ${getHeaderComponent()}
        <div class="board">
          ${columns}
        </div>

        <!-- Modal de criação de issue -->
        <div id="issueModal" class="modal" hidden>
          <div class="modal__overlay"></div>
          <div class="modal__content">
            <div class="modal__header">
              <h2 class="modal__title">Criar Issue no Jira</h2>
              <button class="modal__close" id="modalClose" title="Fechar">×</button>
            </div>
            <form class="modal__form" id="issueForm">
              <div class="form-group-row">
                <div class="form-group">
                  <label for="issueProject">Projeto *</label>
                  <select id="issueProject" name="project" required>
                    <option value="">Carregando projetos...</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="issueType">Tipo *</label>
                  <select id="issueType" name="issueType" required>
                    <option value="">Carregando tipos...</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label for="issueSummary">Título *</label>
                <input type="text" id="issueSummary" name="summary" required maxlength="255" />
              </div>
              <div class="form-group">
                <label for="issueDescription">Descrição</label>
                <textarea id="issueDescription" name="description" rows="6"></textarea>
              </div>
              <div class="form-group">
                <label for="issueLocation">Localização</label>
                <input type="text" id="issueLocation" name="location" readonly />
              </div>
              <div class="modal__actions">
                <button type="button" class="button button--secondary" id="modalCancel">Cancelar</button>
                <button type="submit" class="button button--primary">Criar Issue</button>
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
