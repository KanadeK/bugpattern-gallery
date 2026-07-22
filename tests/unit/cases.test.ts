import { describe, expect, it } from "vitest";
import { exhibits, findExhibit, redactSensitive, runExhibit } from "@/domain/cases";

describe("executable exhibits", () => {
  for (const exhibit of exhibits) {
    it(`${exhibit.id} broken implementation fails its real assertion`, () => {
      expect(runExhibit({ id: exhibit.id, mode: "bad" }).passed).toBe(false);
    });
    it(`${exhibit.id} repaired implementation satisfies its real assertion`, () => {
      expect(runExhibit({ id: exhibit.id, mode: "fixed" })).toMatchObject({
        passed: true,
        expected: exhibit.expected,
      });
    });
  }

  it("rejects invalid runner requests instead of returning a synthetic success", () => {
    expect(() => runExhibit({ id: "not-a-case", mode: "bad" })).toThrow("Unknown exhibit");
    expect(() => runExhibit({ id: "race-condition", mode: "unknown" })).toThrow();
    expect(() => findExhibit("")).toThrow("Unknown exhibit");
  });

  it("redacts sensitive output keys recursively", () => {
    expect(redactSensitive({ token: "abc", nested: { password: "123", value: "safe" } })).toEqual({
      token: "[redacted]",
      nested: { password: "[redacted]", value: "safe" },
    });
  });
});
