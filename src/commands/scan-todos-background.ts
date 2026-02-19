import * as vscode from "vscode";
import { readCache } from "@/services/cache";
import { RawHit } from "@/types/board"; // Importación corregida
import { getCurrentPanel, updateBoardContent } from "@/commands/open-board";
import { mergeWithPersistedIssues, persistResults } from "@/services/persist";
import { enrichTodosWithGitInfo, scanWorkspace } from "@/services/scanner";

export async function scanTodosBackground(context: vscode.ExtensionContext, doc?: vscode.TextDocument): Promise<void> {
  try {
    const cache = await readCache();
    const { hits: newHits } = await scanWorkspace(undefined, undefined, doc);
    
    // Enriquecemos los hits y los mezclamos con los datos persistidos
    const enrichedHits = await enrichTodosWithGitInfo(newHits);
    const mergedHits = await mergeWithPersistedIssues(enrichedHits);

    // Actualizamos el caché local
    if (doc) {
      cache.files[doc.uri.fsPath] = { mtime: Date.now(), hits: mergedHits };
    } else {
      // Si es un escaneo general, actualizamos las entradas por archivo
      for (const hit of mergedHits) {
        cache.files[hit.file] = { 
          mtime: Date.now(), 
          hits: mergedHits.filter(h => h.file === hit.file) 
        };
      }
    }

    // Recopilamos todos los hits de todas las rutas guardadas en caché como RawHit[]
    const allHits: RawHit[] = Object.entries(cache.files).flatMap(([file, cacheEntry]) =>
        cacheEntry.hits.map(hit => ({ ...hit, file }))
    );

    // Guardamos en el almacenamiento persistente
    await persistResults(allHits);

    // Notificamos a la UI (Sidebar y Webview)
    await vscode.commands.executeCommand("todo-board.updateSidebar");

    const panel = getCurrentPanel();
    if (panel) {
      await updateBoardContent(panel.webview, context);
    }

  } catch (err) {
    console.error("[TODO Board] Erro no background scan:", err);
  }
}