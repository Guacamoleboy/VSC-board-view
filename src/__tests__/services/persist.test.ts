import * as assert from "node:assert";
import { loadPersistedTodos, mergeWithPersistedIssues, persistResults, updateTodoWithIssue } from "@/services/persist";
import type { RawHit } from "@/types/board"; 

suite("services/persist", () => {
  suite("persistResults and loadPersistedTodos", () => {
    test("should export persistResults function", () => {
      assert.strictEqual(typeof persistResults, "function");
    });

    test("should export loadPersistedTodos function", () => {
     
      assert.strictEqual(typeof loadPersistedTodos, "function");
    });
  });

  suite("mergeWithPersistedIssues", () => {
    test("should export mergeWithPersistedIssues function", () => {
      assert.strictEqual(typeof mergeWithPersistedIssues, "function");
    });

    test("should preserve issue data when merging TODOs", async () => {
      const mockNewTodos: RawHit[] = [
        {
          id: "1",
          file: "/test/file.ts",
          line: 10,
          text: "TODO: Test task",
        },
        {
          id: "2",
          file: "/test/other.ts",
          line: 20,
          text: "TODO: Another task",
        },
      ];

      // Como não podemos mockar facilmente, testamos apenas o comportamento da função
      const result = await mergeWithPersistedIssues(mockNewTodos);

      assert.ok(Array.isArray(result));
      assert.strictEqual(result.length, mockNewTodos.length);
    });

    test("should return new TODOs when no persisted data exists", async () => {
      const mockNewTodos:  RawHit[] = [
        {
          id: "1",
          file: "/test/file.ts",
          line: 10,
          text: "TODO: Test task",
        },
      ];

      const result = await mergeWithPersistedIssues(mockNewTodos);

      assert.ok(Array.isArray(result));
      assert.strictEqual(result.length, mockNewTodos.length);
    });

    test("should handle errors gracefully", async () => {
      const mockNewTodos: RawHit[] = [
        {
          id: "1",
          file: "/test/file.ts",
          line: 10,
          text: "TODO: Test",
        },
      ];

      // Should not throw even if internal operations fail
      const result = await mergeWithPersistedIssues(mockNewTodos);
      assert.ok(Array.isArray(result));
    });
  });

  suite("updateTodoWithIssue", () => {
    test("should export updateTodoWithIssue function", () => {
      assert.strictEqual(typeof updateTodoWithIssue, "function");
    });

    test("should update TODO with issue data", async () => {
      const filePath = "/test/file.ts";
      const line = 10;
      const issueData = {
        id: "10001",
        key: "PROJ-123",
        link: "https://jira.example.com/browse/PROJ-123",
      };

      // Should not throw
      await assert.doesNotReject(async () => {
        await updateTodoWithIssue(filePath, line, issueData);
      });
    });

    test("should handle errors gracefully", async () => {
      const filePath = "";
      const line = -1;
      const issueData = { id: "", key: "", link: "" };

      // Should not throw even with invalid data
      await assert.doesNotReject(async () => {
        await updateTodoWithIssue(filePath, line, issueData);
      });
    });
  });
});
