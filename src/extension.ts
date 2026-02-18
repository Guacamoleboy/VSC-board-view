import * as vscode from "vscode";

import { clearAgeCache } from "@/commands/clear-cache";
import { filterByLabel } from "@/commands/filter-by-label";
import { insertTodoComment } from "@/commands/insert-todo";
import { openTodoBoard } from "@/commands/open-board";
import { scanTodos } from "@/commands/scan-todos";
import { clearAuthToken, initializeAuth, setAuthToken } from "@/services/auth";
import { initializeStorage } from "@/services/storage";
import { initializeTodoDecorator } from "@/services/todo-decorator";
import { registerTodoSidebar } from "@/ui/sidebar";
import { scanTodosBackground } from "@/commands/scan-todos-background";
import { spawnStructuredComment, DEFAULT_STATUS_MAP } from "@/utils/status";
import debounce from "lodash.debounce";

export function activate(context: vscode.ExtensionContext) {
  console.log('TODO Board extension activated');

  // Initialize storage service
  initializeStorage(context);

  // Initialize secret-backed auth storage
  initializeAuth(context);

  // Initialize TODO comment highlighting
  initializeTodoDecorator(context);

  const debouncedBackgroundScan = debounce((doc: vscode.TextDocument) => {
    scanTodosBackground(doc);
  }, 300);

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((doc) => {
      debouncedBackgroundScan(doc);
    })
  );

  const selectStatusCmd = vscode.commands.registerCommand(
    "todo-board.selectStatus",
    async (lineNum: number) => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const statuses = ["idea", "to be done", "in progress", "in review", "done"];
      const selection = await vscode.window.showQuickPick(statuses, {
        placeHolder: "Choose status",
      });

      if (selection) {
        await editor.edit((editBuilder) => {
          const line = editor.document.lineAt(lineNum);
          const updatedText = line.text.replace(
            /^(\s*\/\/.*?\([^)]*\)\s*\([^)]*\)\s*)\([^)]*\)/,
            `$1(${selection})`
          );
          editBuilder.replace(line.range, updatedText);
        });
      }
    }
  );

  const selectBadgesCmd = vscode.commands.registerCommand(
    "todo-board.selectBadges",
    async (lineNum: number) => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const line = editor.document.lineAt(lineNum);
      const text = line.text;
      const badgeMatch = text.match(/\[(.*?)\]/);
      const currentBadges = badgeMatch 
        ? badgeMatch[1].split(',').map(s => s.trim()).filter(s => s !== "") 
        : [];

      const availableLabels = [
        "High Priority", "WIP","Ready for Review", "Staged", "Deprecated", "Low Priority", "Urgent", "API",
        "Frontend", ".CSS" , ".HTML",".TSX", ".TS", "Backend", "Database", "API", "UI/UX", "Security",
        "Quick Fix", "Major Change", "BUG", "Research Needed",
        "Documentation missing", "Draft", "Feature", "Refactor needed", "fixme", "wontfix", "Unit Test", "Temporary Hack"
      ];
      
      const quickPickItems = availableLabels.map(label => ({
        label,
        picked: currentBadges.includes(label) 
      }));

      const quickPick = vscode.window.createQuickPick();
      quickPick.items = quickPickItems;
      quickPick.selectedItems = quickPickItems.filter(item => item.picked); 
      quickPick.canSelectMany = true;
      quickPick.placeholder = "Choose badges";

      quickPick.onDidChangeSelection(async (selection) => {
        const badgesString = selection.map(s => s.label).join(", ");
        
        await editor.edit((editBuilder) => {
          const currentLine = editor.document.lineAt(lineNum);
          const updatedText = currentLine.text.replace(/\[.*?\]/, `[${badgesString}]`);
          editBuilder.replace(currentLine.range, updatedText);
        }, { undoStopBefore: false, undoStopAfter: false });
      });

      quickPick.onDidHide(() => quickPick.dispose());
      quickPick.show();
    }

  );

  const selectPriorityCmd = vscode.commands.registerCommand(
    "todo-board.selectPriority",
    async (lineNum: number) => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const priorities = ["Low", "Medium", "High", "Urgent", "Critical"];
      const selection = await vscode.window.showQuickPick(priorities, {
        placeHolder: "Set task priority",
      });

      if (selection) {
        await editor.edit((editBuilder) => {
          const line = editor.document.lineAt(lineNum);
          const updatedText = line.text.replace(
            /^(\s*\/\/.*?\([^)]*\)\s*\([^)]*\)\s*\([^)]*\)\s*)\([^)]*\)/,
            `$1(${selection})`
          );
          editBuilder.replace(line.range, updatedText);
        });
      }
    }
  );

  const codeLensProvider = vscode.languages.registerCodeLensProvider({ scheme: 'file' }, {
    provideCodeLenses(document) {
      const lenses: vscode.CodeLens[] = [];
      const tags = Object.keys(DEFAULT_STATUS_MAP);

      for (let i = 0; i < document.lineCount; i++) {
        const line = document.lineAt(i);
        if (tags.some(tag => line.text.includes(tag)) && line.text.includes('(')) {
          const range = new vscode.Range(i, 0, i, 0);
          
          lenses.push(new vscode.CodeLens(range, {
            title: "$(list-selection)  Set status",
            command: "todo-board.selectStatus",
            arguments: [i]
          }));

          lenses.push(new vscode.CodeLens(range, {
            title: "$(graph)  Set Priority",
            command: "todo-board.selectPriority",
            arguments: [i]
          }));

          lenses.push(new vscode.CodeLens(range, {
            title: "$(tag)  Choose badges",
            command: "todo-board.selectBadges",
            arguments: [i]
          }));
        }
      }
      return lenses;
    }
  });

  // () () () [] spawner
  const structuredCommentListener = vscode.workspace.onDidChangeTextDocument(event => {
    const editor = vscode.window.activeTextEditor;
    if (!editor || event.contentChanges.length === 0) return;

    const change = event.contentChanges[0];
    
    if (change.text === "" && change.rangeLength > 0) {
      return;
    }

    const lineNum = change.range.start.line;
    const line = editor.document.lineAt(lineNum);
    const text = line.text;
    const tags = Object.keys(DEFAULT_STATUS_MAP);
    const match = tags.find(tag => {
      const regex = new RegExp(`\\b${tag}$`); 
      return regex.test(text.trim());
    });

    if (match) {
      const tagIndex = line.text.lastIndexOf(match);
      const rangeToReplace = new vscode.Range(
        lineNum, tagIndex, 
        lineNum, tagIndex + match.length
      );

      editor.edit(editBuilder => {
        editBuilder.replace(rangeToReplace, spawnStructuredComment(match));
      }, { undoStopBefore: false, undoStopAfter: false });
    }

  });

  const scanCmd = vscode.commands.registerCommand(
    "todo-board.scanTodos",
    scanTodos,
  );

  const openBoardCmd = vscode.commands.registerCommand(
    "todo-board.showBoard",
    () => openTodoBoard(context),
  );

  const insertTodoCmd = vscode.commands.registerCommand(
    "todo-board.insertTodo",
    insertTodoComment,
  );

  const filterByLabelCmd = vscode.commands.registerCommand(
    "todo-board.filterByLabel",
    filterByLabel,
  );

  const clearAgeCacheCmd = vscode.commands.registerCommand(
    "todo-board.clearAgeCache",
    clearAgeCache,
  );

  const authenticateCmd = vscode.commands.registerCommand(
    "todo-board.authenticate",
    async () => {
      // Mostra modal explicativo antes de iniciar autenticação
      const continuar = await vscode.window.showInformationMessage(
        "Autenticação com Jira\n\n" +
          "Você será redirecionado para fazer login no Jira usando OAuth 2.0 (3LO), " +
          "um protocolo seguro de autenticação.\n\n" +
          "Após autorizar o acesso, você será redirecionado de volta ao VS Code automaticamente.\n\n" +
          "Deseja continuar?",
        { modal: true },
        "Continuar",
        "Cancelar",
      );

      if (continuar === "Continuar") {
        // Open external OAuth start URL
        const url = vscode.Uri.parse(
          "https://todo-board.dantewebmaster.com.br/oauth/start",
        );
        await vscode.env.openExternal(url);
      }
    },
  );

  const logoutCmd = vscode.commands.registerCommand(
    "todo-board.logout",
    async () => {
      await clearAuthToken();
      void vscode.window.showInformationMessage(
        "TODO Board: Desconectado do Jira com sucesso.",
      );
    },
  );

  // Register URI handler to receive token via vscode:// callback
  const uriHandlerDisposable = vscode.window.registerUriHandler({
    handleUri: async (uri: vscode.Uri) => {
      try {
        const expectedScheme = "vscode";
        const isExpectedAuthority = uri.authority.endsWith(".todo-board");
        const expectedPath = "/auth";

        const isExpectedScheme = uri.scheme === expectedScheme;
        const isExpectedPath = uri.path === expectedPath;

        if (!isExpectedScheme || !isExpectedAuthority || !isExpectedPath) {
          void vscode.window.showErrorMessage(
            `TODO Board: Received unexpected authentication callback URI.\n` +
              `scheme: ${uri.scheme}, authority: ${uri.authority}, path: ${uri.path}`,
          );
          return;
        }

        // Expect token in query param 'token'
        const params: URLSearchParams = new URLSearchParams(uri.query);
        const token: string | null = params.get("token");
        if (token) {
          await setAuthToken(token);
          void vscode.window.showInformationMessage(
            "TODO Board: Jira authentication successful.",
          );
        } else {
          void vscode.window.showErrorMessage(
            "TODO Board: Authentication callback did not contain a token.",
          );
        }
      } catch {
        void vscode.window.showErrorMessage(
          "TODO Board: Error processing authentication callback.",
        );
      }
    },
  });

  const { disposable: sidebarView, provider: sidebarProvider } =
    registerTodoSidebar(context);

  // Refresh button calls scanTodos (full scan)
  const refreshSidebarCmd = vscode.commands.registerCommand(
    "todo-board.refreshSidebar",
    scanTodos,
  );

  // Update sidebar after scan (just updates the webview)
  const updateSidebarCmd = vscode.commands.registerCommand(
    "todo-board.updateSidebar",
    () => {
      sidebarProvider.refresh();
    },
  );

  context.subscriptions.push(
    scanCmd,
    openBoardCmd,
    insertTodoCmd,
    filterByLabelCmd,
    clearAgeCacheCmd,
    authenticateCmd,
    logoutCmd,
    refreshSidebarCmd,
    updateSidebarCmd,
    sidebarView,
    authenticateCmd,
    uriHandlerDisposable,
    structuredCommentListener,
    codeLensProvider,
    selectStatusCmd,
    selectBadgesCmd,
    selectPriorityCmd,
  );
}

// This method is called when your extension is deactivated
export function deactivate(): void {
  // Nenhuma limpeza necessária no momento.
}