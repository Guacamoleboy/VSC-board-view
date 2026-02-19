import * as assert from "node:assert";
import { parseLabelsFromLine } from "@/utils/status";

suite("utils/status", () => {
  suite("parseLabelsFromLine", () => {
    test("should extract labels from line", () => {
      const line = "@TODO Fix bug [bug, urgent]";
      const labels = parseLabelsFromLine(line);
      assert.deepStrictEqual(labels, ["bug", "urgent"]);
    });

    test("should return empty array if no labels", () => {
      const line = "@TODO Simple task";
      const labels = parseLabelsFromLine(line);
      assert.deepStrictEqual(labels, []);
    });
  });
});