import * as assert from "node:assert";
import { filterAndSortTodos, filterTodos, sortTodos } from "@/utils/filter-sort";
import type { FilterOptions, SortOptions } from "@/types/filter";
import type { BoardItem } from "@/types/board";

suite("utils/filter-sort", () => {
  const createMockBoardItem = (
    id: string,
    labels: string[] = [],
    daysOld?: number,
    lastModified?: Date,
    priority: string = "Low",
    assignees: string[] = ["user1"]
  ): BoardItem => ({
    boardType: "kanban", 
    id,
    filePath: `/test/file-${id}.ts`,
    relativePath: `file-${id}.ts`,
    line: Number.parseInt(id, 10),
    title: `Test ${id}`,               
    description: `Description ${id}`,   
    status: "idea",
    priority,
    labels,
    daysOld,
    lastModified,
    assignees,
  });

  suite("filterTodos", () => {
    test("should return all items when no filters applied", () => {
      const items: BoardItem[] = [
        createMockBoardItem("1", ["bug"]),
        createMockBoardItem("2", ["feature"]),
        createMockBoardItem("3", []),
      ];

      const filters: FilterOptions = {
        labels: [],
        age: "all",
      };

      const result = filterTodos(items, filters);
      assert.strictEqual(result.length, 3);
    });

    test("should filter by single label", () => {
      const items: BoardItem[] = [
        createMockBoardItem("1", ["bug"]),
        createMockBoardItem("2", ["feature"]),
        createMockBoardItem("3", ["bug", "urgent"]),
      ];

      const filters: FilterOptions = {
        labels: ["bug"],
        age: "all",
      };

      const result = filterTodos(items, filters);
      assert.strictEqual(result.length, 2);
      assert.ok(result.every((item) => item.labels?.includes("bug")));
    });

    test("should filter by multiple labels (OR logic)", () => {
      const items: BoardItem[] = [
        createMockBoardItem("1", ["bug"]),
        createMockBoardItem("2", ["feature"]),
        createMockBoardItem("3", ["refactor"]),
        createMockBoardItem("4", []),
      ];

      const filters: FilterOptions = {
        labels: ["bug", "feature"],
        age: "all",
      };

      const result = filterTodos(items, filters);
      assert.strictEqual(result.length, 2);
    });

    test("should filter by age category", () => {
      const items: BoardItem[] = [
        createMockBoardItem("1", [], 3), // fresh
        createMockBoardItem("2", [], 15), // recent
        createMockBoardItem("3", [], 60), // old
        createMockBoardItem("4", [], 180), // abandoned
      ];

      const filters: FilterOptions = {
        labels: [],
        age: "fresh",
      };

      const result = filterTodos(items, filters);
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].id, "1");
    });

    test("should combine label and age filters", () => {
      const items: BoardItem[] = [
        createMockBoardItem("1", ["bug"], 3),
        createMockBoardItem("2", ["bug"], 60),
        createMockBoardItem("3", ["feature"], 3),
      ];

      const filters: FilterOptions = {
        labels: ["bug"],
        age: "fresh",
      };

      const result = filterTodos(items, filters);
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].id, "1");
    });

    test("should exclude items without labels when label filter active", () => {
      const items: BoardItem[] = [
        createMockBoardItem("1", ["bug"]),
        createMockBoardItem("2", []),
        createMockBoardItem("3"),
      ];

      const filters: FilterOptions = {
        labels: ["bug"],
        age: "all",
      };

      const result = filterTodos(items, filters);
      assert.strictEqual(result.length, 1);
    });
  });

  suite("sortTodos", () => {
    test("should sort by date ascending", () => {
      const items: BoardItem[] = [
        createMockBoardItem("1", [], undefined, new Date("2025-12-29")),
        createMockBoardItem("2", [], undefined, new Date("2025-12-27")),
        createMockBoardItem("3", [], undefined, new Date("2025-12-28")),
      ];

      const sort: SortOptions = {
        direction: "asc",
      };

      const result = sortTodos(items, sort);
      assert.strictEqual(result[0].id, "2"); // oldest first
      assert.strictEqual(result[1].id, "3");
      assert.strictEqual(result[2].id, "1"); // newest last
    });

    test("should sort by date descending", () => {
      const items: BoardItem[] = [
        createMockBoardItem("1", [], undefined, new Date("2025-12-27")),
        createMockBoardItem("2", [], undefined, new Date("2025-12-29")),
        createMockBoardItem("3", [], undefined, new Date("2025-12-28")),
      ];

      const sort: SortOptions = {
        direction: "desc",
      };

      const result = sortTodos(items, sort);
      assert.strictEqual(result[0].id, "2"); // newest first
      assert.strictEqual(result[1].id, "3");
      assert.strictEqual(result[2].id, "1"); // oldest last
    });

    test("should handle items without dates", () => {
      const items: BoardItem[] = [
        createMockBoardItem("1", [], undefined, new Date("2025-12-29")),
        createMockBoardItem("2"),
        createMockBoardItem("3", [], undefined, new Date("2025-12-27")),
      ];

      const sort: SortOptions = {
        direction: "asc",
      };

      const result = sortTodos(items, sort);
      assert.strictEqual(result.length, 3);
    });

    test("should not mutate original array", () => {
      const items: BoardItem[] = [
        createMockBoardItem("1", [], undefined, new Date("2025-12-29")),
        createMockBoardItem("2", [], undefined, new Date("2025-12-27")),
      ];

      const sort: SortOptions = {
        direction: "asc",
      };

      const originalOrder = items.map((item) => item.id);
      sortTodos(items, sort);

      assert.deepStrictEqual(
        items.map((item) => item.id),
        originalOrder,
      );
    });
  });

  suite("filterAndSortTodos", () => {
    test("should apply both filtering and sorting", () => {
      const items: BoardItem[] = [
        createMockBoardItem("1", ["bug"], 3, new Date("2025-12-29")),
        createMockBoardItem("2", ["bug"], 3, new Date("2025-12-27")),
        createMockBoardItem("3", ["feature"], 3, new Date("2025-12-28")),
        createMockBoardItem("4", ["bug"], 60, new Date("2025-12-26")),
      ];

      const filters: FilterOptions = {
        labels: ["bug"],
        age: "fresh",
      };

      const sort: SortOptions = {
        direction: "desc",
      };

      const result = filterAndSortTodos(items, filters, sort);

      // Should have 2 items (bug + fresh), sorted newest first
      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].id, "1"); // newest
      assert.strictEqual(result[1].id, "2"); // oldest
    });

    test("should work with no filters and sorting only", () => {
      const items: BoardItem[] = [
        createMockBoardItem("1", [], undefined, new Date("2025-12-27")),
        createMockBoardItem("2", [], undefined, new Date("2025-12-29")),
      ];

      const filters: FilterOptions = {
        labels: [],
        age: "all",
      };

      const sort: SortOptions = {
        direction: "asc",
      };

      const result = filterAndSortTodos(items, filters, sort);

      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].id, "1");
    });
  });
});
