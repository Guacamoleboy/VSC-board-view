import * as assert from "node:assert";
import * as vscode from "vscode";
import { filterByLabel } from "@/commands/filter-by-label";
import { filterState } from "@/services/filter-state";

suite("commands/filter-by-label", () => {
  const mockContext = {
    extensionUri: vscode.Uri.file("/mock/path"),
  } as vscode.ExtensionContext;

  test("should add label to filter state", async () => {
    filterState.clearLabels();
    await filterByLabel("bug", mockContext); 

    const filters = filterState.getFilters();
    assert.strictEqual(filters.labels.includes("bug"), true);
  });

  test("should toggle labels (add and remove)", async () => {
    filterState.clearLabels();

    await filterByLabel("feature", mockContext);
    assert.strictEqual(filterState.getFilters().labels.includes("feature"), true);

    await filterByLabel("feature", mockContext);
    assert.strictEqual(filterState.getFilters().labels.includes("feature"), false);
  });

  test("should support multiple labels", async () => {
    filterState.clearLabels();

    await filterByLabel("bug", mockContext);
    await filterByLabel("feature", mockContext);
    await filterByLabel("refactor", mockContext);

    const filters = filterState.getFilters();
    assert.strictEqual(filters.labels.length, 3);
    assert.strictEqual(filters.labels.includes("bug"), true);
    assert.strictEqual(filters.labels.includes("feature"), true);
    assert.strictEqual(filters.labels.includes("refactor"), true);
  });

  test("should handle empty label", async () => {
    filterState.clearLabels();
    await filterByLabel("", mockContext);

    const filters = filterState.getFilters();
    assert.strictEqual(filters.labels.includes(""), true);
  });

  test("should not throw errors when executing", async () => {
    await assert.doesNotReject(async () => {
      await filterByLabel("test-label", mockContext);
    });
  });

});