import { readJsonFile, writeJsonFile } from "@/services/storage";
import { RawHit } from "@/types/board";

/**
 * Mescla novos TODOs escaneados com informações de issues já criadas.
 * Se um TODO já existia e tinha issue associada, mantém essas informações.
 */
export async function mergeWithPersistedIssues(
  newHits: RawHit[],
): Promise<RawHit[]> {
  try {
    const persistedHits = await loadPersistedTodos();

    // Cria um mapa de hits antigos por file:line para rápida consulta
    const persistedMap = new Map<string, RawHit>();
    for (const hit of persistedHits) {
      const key = `${hit.file}:${hit.line}`;
      persistedMap.set(key, hit);
    }

    // Mescla informações de issues nos novos hits
    const mergedHits = newHits.map((newHit) => {
      const key = `${newHit.file}:${newHit.line}`;
      const persistedHit = persistedMap.get(key);

      // Se o hit já existia e tinha issue, mantém as informações
      if (persistedHit?.issueId) {
        return {
          ...newHit,
          issueId: persistedHit.issueId,
          issueKey: persistedHit.issueKey,
          issueLink: persistedHit.issueLink,
        };
      }

      return newHit;
    });

    return mergedHits;
  } catch {
    return newHits;
  }
}

export async function persistResults(results: RawHit[]): Promise<void> {
  try {
    await writeJsonFile("todos.json", results);
  } catch {
    // ignore
  }
}

export async function loadPersistedTodos(): Promise<RawHit[]> {
  try {
    const parsed = await readJsonFile<unknown>("todos.json");

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isValidRawHit).map((hit) => {
      // Convert lastModified string back to Date object if present
      if (hit.lastModified && typeof hit.lastModified === "string") {
        return {
          ...hit,
          lastModified: new Date(hit.lastModified),
        };
      }

      return hit;
    });
  } catch {
    return [];
  }
}

function isValidRawHit(value: unknown): value is RawHit {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.file === "string" &&
    typeof candidate.line === "number" &&
    typeof candidate.text === "string"
  );
}

export async function updateTodoWithIssue(
  filePath: string,
  line: number,
  issueData: { id: string; key: string; link: string },
): Promise<void> {
  try {
    const hits = await loadPersistedTodos();

    const updatedHits = hits.map((hit) => {
      if (hit.file === filePath && hit.line === line) {
        return {
          ...hit,
          issueId: issueData.id,
          issueKey: issueData.key,
          issueLink: issueData.link,
        };
      }
      return hit;
    });

    await persistResults(updatedHits);
  } catch (error) {
    console.error("[updateTodoWithIssue] Erro:", error);
  }
}
