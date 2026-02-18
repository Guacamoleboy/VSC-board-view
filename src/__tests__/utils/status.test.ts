import * as assert from "node:assert";

import { parseTodoStatus } from "@/utils/status";

suite("utils/status", () => {
  suite("parseTodoStatus", () => {
    test("should return 'idea' status when metadata is missing", () => {
      const result = parseTodoStatus("@TODO Implement feature");

      assert.deepStrictEqual(result, {
        status: "idea",
        description: "@TODO Implement feature",
        labels: undefined,
      });
    });

    test("should extract 'to be done' status from metadata", () => {
      const result = parseTodoStatus("@TODO(to be done) Work in progress");

      assert.deepStrictEqual(result, {
        status: "to be done",
        description: "@TODO(to be done) Work in progress",
        labels: undefined,
      });
    });

    test("should extract 'in progress' status from metadata", () => {
      const result = parseTodoStatus("@TODO(in progress) Critical fix needed");

      assert.deepStrictEqual(result, {
        status: "in progress",
        description: "@TODO(in progress) Critical fix needed",
        labels: undefined,
      });
    });

    test("should return 'idea' when no status is specified", () => {
      const result = parseTodoStatus("@TODO: testing without status");

      assert.deepStrictEqual(result, {
        status: "idea",
        description: "@TODO: testing without status",
        labels: undefined,
      });
    });

    test("should ignore extra metadata tokens", () => {
      const result = parseTodoStatus("@TODO(in review,owner:jane) Finalize work");

      assert.deepStrictEqual(result, {
        status: "in review",
        description: "@TODO(in review,owner:jane) Finalize work",
        labels: undefined,
      });
    });

    test("should extract labels from description", () => {
      const result = parseTodoStatus("@TODO(done) Fix bug [bug,urgent]");

      assert.deepStrictEqual(result, {
        status: "done",
        description: "@TODO(done) Fix bug [bug,urgent]",
        labels: ["bug", "urgent"],
      });
    });

    test("should handle multiple labels with spaces", () => {
      const result = parseTodoStatus("@TODO Refactor code [refactor, cleanup, performance]");

      assert.deepStrictEqual(result, {
        status: "idea",
        description: "@TODO Refactor code [refactor, cleanup, performance]",
        labels: ["refactor", "cleanup", "performance"],
      });
    });

    test("should handle empty labels array", () => {
      const result = parseTodoStatus("@TODO Simple task []");

      assert.deepStrictEqual(result, {
        status: "idea",
        description: "@TODO Simple task []",
        labels: undefined,
      });
    });

    test("should normalize status case-insensitively", () => {
      const resultUpper = parseTodoStatus("@TODO(DONE) Uppercase status");
      const resultMixed = parseTodoStatus("@TODO(In Progress) Mixed case");

      assert.strictEqual(resultUpper.status, "done");
      assert.strictEqual(resultMixed.status, "in progress");
    });
  });
  
});