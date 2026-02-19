import * as vscode from "vscode";

import { getAuthToken, setAuthToken } from "@/services/auth";
import { filterState } from "@/services/filter-state";
import { loadPersistedTodos, updateTodoWithIssue } from "@/services/persist";
import { renderBoard } from "@/ui/board";
import { buildBoardItems, groupItems } from "@/ui/board/services/board-transformer";
import type { FetchOptions } from "@/types/fetch";
import type { CreateIssueResponse, IssueTypeResponse } from "@/types/issue";
import type { ProjectResponse } from "@/types/project";

let currentPanel: vscode.WebviewPanel | undefined;

// Helper para fazer requisições com refresh token automático
async function fetchWithTokenRefresh<T>(
  url: string,
  options: FetchOptions,
  retryCount = 0,
): Promise<T> {
  const fetchModule = await import("node-fetch");
  const fetch = fetchModule.default;

  const response = await fetch(url, options);

  // Verificar se há um novo token e salva atualizado
  const newToken = response.headers.get("X-New-Token");
  if (newToken) {
    await setAuthToken(newToken);
  }

  // Se retornou 401 e ainda não tentou refresh, tenta renovar o token
  if (response.status === 401 && retryCount === 0) {
    try {
      const currentToken = await getAuthToken();
      if (!currentToken) {
        throw new Error("No authentication token available");
      }

      // Tenta refresh do token
      const refreshResponse = await fetch(
        "https://todo-board.dantewebmaster.com.br/refresh-token",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (refreshResponse.ok) {
        const refreshData = (await refreshResponse.json()) as { token: string };
        const newToken = refreshData.token;

        // Atualiza o token armazenado
        await setAuthToken(newToken);

        // Atualiza o header da requisição original com o novo token
        options.headers.Authorization = `Bearer ${newToken}`;

        // Retenta a requisição original
        return fetchWithTokenRefresh(url, options, retryCount + 1);
      }
    } catch (err) {
      console.error("[TODO Board] Erro ao fazer refresh do token:", err);
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[TODO Board] Erro ao criar issue:", {
      status: response.status,
      errorText,
    });
    throw new Error(`Erro ao criar issue: ${response.status} - ${errorText}`);
  }

  const jsonResponse = await response.json();

  return jsonResponse as T;
}

let currentView: "kanban" | "todo" | "bug" = "kanban";

export async function updateBoardContent(
  webview: vscode.Webview,
  context: vscode.ExtensionContext,
  view: "kanban" | "todo" | "bug" = currentView
): Promise<void> {
  currentView = view;
  
  const hits = await loadPersistedTodos();
  const allBoardItems = buildBoardItems(hits);
  
  const filteredItems = allBoardItems.filter(item => {
    if (view === "kanban") {
      return item.boardType === "kanban";
    } else if (view === "bug") {
      return item.boardType === "bug";
    } else {
      return item.boardType === "todo" && (item as any).token === "TODO";
    }
  });

  const grouped = groupItems(filteredItems);
  
  const user1Path = vscode.Uri.joinPath(context.extensionUri, "resources", "users", "user1.png");
  const user1Uri = webview.asWebviewUri(user1Path).toString();
  
  webview.html = renderBoard(webview, grouped, user1Uri, view);
}

export function getCurrentPanel(): vscode.WebviewPanel | undefined {
  return currentPanel;
}

function setupWebviewMessageHandler(panel: vscode.WebviewPanel, context: vscode.ExtensionContext): void {
  panel.webview.onDidReceiveMessage(async (message) => {
    if (message?.type === "open" && typeof message.file === "string") {
      const line = typeof message.line === "number" ? message.line : 0;
      try {
        const resourceUri = vscode.Uri.file(message.file);
        const document = await vscode.workspace.openTextDocument(resourceUri);
        const position = new vscode.Position(line, 0);
        const selection = new vscode.Selection(position, position);
        await vscode.window.showTextDocument(document, { selection, preview: false });
      } catch (error) {
        const messageText = error instanceof Error ? error.message : String(error);
        void vscode.window.showErrorMessage(`Unable to open TODO location: ${messageText}`);
      }
    } 
    
    else if (message?.type === "switchView" && typeof message.view === "string") {
      try {
        await updateBoardContent(panel.webview, context, message.view as "kanban" | "todo" | "bug");
      } catch (err) {
        console.error("[TODO Board] Erro ao trocar de vista:", err);
      }
    }

    else if (message?.type === "setFilter" && typeof message.label === "string") {
      filterState.toggleLabel(message.label);
    } 
    else if (message?.type === "removeLabel" && typeof message.label === "string") {
      filterState.removeLabel(message.label);
    } 
    else if (message?.type === "clearLabels") {
      filterState.clearLabels();
    } 
    else if (message?.type === "setAgeFilter" && typeof message.ageFilter === "string") {
      filterState.setAgeFilter(message.ageFilter);
    } 
    else if (message?.type === "toggleSort" && typeof message.direction === "string") {
      filterState.toggleSortDirection();
    } 
    else if (message?.type === "resetFilters") {
      filterState.clearLabels();
      filterState.setAgeFilter("all");
      filterState.setSort({ direction: "desc" });
    } 

    else if (message?.type === "fetchProjects") {
      try {
        const token = await getAuthToken();
        if (!token) {
          panel.webview.postMessage({ type: "projectsLoaded", projects: [] });
          return;
        }
        const response = await fetchWithTokenRefresh<ProjectResponse[]>(
          "https://todo-board.dantewebmaster.com.br",
          { method: "GET", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );
        panel.webview.postMessage({ type: "projectsLoaded", projects: response || [] });
      } catch (error) {
        console.error("[TODO Board] Falha ao buscar projetos:", error);
        panel.webview.postMessage({ type: "projectsLoaded", projects: [] });
      }
    } 
    else if (message?.type === "fetchIssueTypes") {
      try {
        const token = await getAuthToken();
        if (!token) {
          panel.webview.postMessage({ type: "issueTypesLoaded", issueTypes: [] });
          return;
        }
        const projectId = message.projectId || "";
        const url = `https://todo-board.dantewebmaster.com.br{projectId}`;
        const response = await fetchWithTokenRefresh<IssueTypeResponse[]>(url, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
        });
        panel.webview.postMessage({ type: "issueTypesLoaded", issueTypes: response || [] });
      } catch (error) {
        console.error("[TODO Board] Falha ao buscar tipos de issue:", error);
        panel.webview.postMessage({ type: "issueTypesLoaded", issueTypes: [] });
      }
    } 

    // 5. CREATE JIRA ISSUE
    else if (message?.type === "createIssue") {
      try {
        const token = await getAuthToken();
        if (!token) {
          void vscode.window.showErrorMessage("Você precisa estar autenticado para criar uma issue.");
          return;
        }

        const ageText = message.daysOld === 0 ? "hoje" : `${message.daysOld} dias`;
        const adfDescription = {
          type: "doc", version: 1,
          content: [{
            type: "paragraph",
            content: [
              { type: "text", text: message.description || "TODO sem descrição" },
              { type: "text", text: `\nAdicionado no código: ${ageText}` },
              { type: "text", text: `\nArquivo: ${message.location} | Linha: ${message.line}` }
            ]
          }]
        };

        const payload = {
          fields: {
            project: { key: message.projectKey || "" },
            summary: message.summary || "TODO sem descrição",
            issuetype: { id: message.issueTypeId },
            description: adfDescription,
          }
        };

        const response = await fetchWithTokenRefresh<CreateIssueResponse>(
          "https://todo-board.dantewebmaster.com.br",
          { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(payload) }
        );

        await updateTodoWithIssue(message.filePath, message.line, { id: response.id, key: response.key, link: response.link });
        panel.webview.postMessage({ type: "issueCreated", issueData: { id: response.id, key: response.key, link: response.link, location: message.location, line: message.line } });
        void vscode.window.showInformationMessage(`Issue [${response.key}] criada com sucesso!`);
      } catch (err) {
        void vscode.window.showErrorMessage(`Erro ao criar issue: ${err instanceof Error ? err.message : String(err)}`);
      }
    } 

    // 6. EXTERNAL LINKS & AUTH CHECK
    else if (message?.type === "openExternal" && typeof message.url === "string") {
      try {
        await vscode.env.openExternal(vscode.Uri.parse(message.url));
      } catch (err) {
        void vscode.window.showErrorMessage(`Erro ao abrir link: ${err instanceof Error ? err.message : String(err)}`);
      }
    } 
    else if (message?.type === "checkAuthBeforeCreateIssue") {
      const token = await getAuthToken();
      if (!token) {
        void vscode.window.showInformationMessage("Você precisa se conectar ao Jira primeiro. Iniciando autenticação...");
        await vscode.commands.executeCommand("todo-board.authenticate");
      } else {
        panel.webview.postMessage({ type: "authChecked", isAuthenticated: true });
      }
    }
  });
}

export async function openTodoBoard(context: vscode.ExtensionContext) {
  if (currentPanel) {
    currentPanel.reveal(vscode.ViewColumn.One);
    await updateBoardContent(currentPanel.webview, context);
    return;
  }

  const panel = vscode.window.createWebviewPanel(
    "todoBoard",
    "TODO Board",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(context.extensionUri, "out"),
        vscode.Uri.joinPath(context.extensionUri, "resources"),
      ],
    }
  );

  const iconPath = vscode.Uri.joinPath(context.extensionUri, "resources", "activity-bar-icon.svg");
  panel.iconPath = {
    light: iconPath,
    dark: iconPath,
  };

  currentPanel = panel;

  panel.onDidDispose(() => {
    currentPanel = undefined;
  });

  await updateBoardContent(panel.webview, context);
  
  setupWebviewMessageHandler(panel, context); 
  
}