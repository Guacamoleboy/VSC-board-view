import * as vscode from "vscode";

import { filterState } from "@/services/filter-state";
import { loadPersistedTodos } from "@/services/persist";
import { iconsSvg } from "@/ui/icons";
import { generateNonce } from "@/utils/generators";
import { countLabels } from "@/utils/label";
import { renderLabelsList } from "../components/labels-list";
import { getSidebarScripts } from "../scripts";
import { getSidebarStyles } from "../styles";

export class TodoSidebarProvider implements vscode.WebviewViewProvider {
  private webviewView?: vscode.WebviewView;

  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ): void {
    this.webviewView = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };

    this.updateWebviewContent(webviewView.webview);

    // Open board automatically when sidebar becomes visible and board is not open
    const openBoardIfNeeded = () => {
      const boardPanel = vscode.window.tabGroups.all
        .flatMap((group) => group.tabs)
        .find(
          (tab) =>
            tab.label === "TODO Board" &&
            tab.input instanceof vscode.TabInputWebview,
        );

      if (!boardPanel) {
        void vscode.commands.executeCommand("todo-board.showBoard");
      }
    };

    // Open on first load
    openBoardIfNeeded();

    // Open whenever sidebar becomes visible
    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        openBoardIfNeeded();
      }
    });

    // Listen for filter changes
    filterState.onChange(() => {
      if (this.webviewView) {
        const filters = filterState.getFilters();
        this.webviewView.webview.postMessage({
          type: "updateFilters",
          labels: filters.labels,
          age: filters.age,
        });
      }
    });

    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case "openBoard":
          void vscode.commands.executeCommand("todo-board.showBoard");
          break;
        case "scanTodos":
          void vscode.commands.executeCommand("todo-board.scanTodos");
          break;
        case "authenticate":
          void vscode.commands.executeCommand("todo-board.authenticate");
          break;
        case "filterByLabel": {
          await vscode.commands.executeCommand(
            "todo-board.filterByLabel",
            message.label,
          );
          break;
        }
      }
    });
  }

  async updateWebviewContent(webview: vscode.Webview): Promise<void> {
    const hits = await loadPersistedTodos();
    const todoCount = hits.length;
    const labelCounts = countLabels(hits);
    const nonce = generateNonce();
    const filters = filterState.getFilters();

    webview.html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>TODO Board</title>
          <style>${getSidebarStyles()}</style>
        </head>
        <body>
          <div class="sticky-container">
            <div class="actions">
              <button class="btn btn--primary" id="openBoardBtn" data-action="openBoard">
                ${iconsSvg.board}
                <span>Open Board</span>
              </button>
              <button class="btn btn--secondary" id="scanTodosBtn" data-action="scanTodos">
                ${iconsSvg.scanFiles}
                <span>Manual Task Scan</span>
              </button>
            </div>

            <div class="divider"></div>

            <div class="section">
              <div class="totals-overview">
                <div class="stats-card">
                  <div class="stats-card__value">${todoCount}</div>
                  <div class="stats-card__label">Total TODOs</div>
                </div>
                <div class="stats-card">
                  <div class="stats-card__value text-orange">${labelCounts.size}</div>
                  <div class="stats-card__label">Total Labels</div>
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section__header">
              <span class="section__title">
                ${iconsSvg.tag}
                Labels
              </span>
              <span class="section__badge">${labelCounts.size}</span>
            </div>
            <div class="label-list">
              ${renderLabelsList(labelCounts, filters.labels)}
            </div>
          </div>

          <script nonce="${nonce}">
            ${getSidebarScripts()}
          </script>
        </body>
      </html>
    `;
  }

  refresh(): void {
    if (this.webviewView) {
      this.updateWebviewContent(this.webviewView.webview);
    }
  }
}
