import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { exhibits, runExhibit } from "@/domain/cases";

const contentDir = resolve(process.cwd(), "content/cases");

describe("catalogue integration", () => {
  it("has one MDX explanation for every executable exhibit", () => {
    const ids = readdirSync(contentDir)
      .filter((file) => file.endsWith(".mdx"))
      .map((file) => {
        const source = readFileSync(resolve(contentDir, file), "utf8");
        return source.match(/^id: (.+)$/m)?.[1];
      });
    expect(ids.sort()).toEqual(exhibits.map((entry) => entry.id).sort());
  });

  it("runs the complete catalogue with a bad failure and repaired pass", () => {
    for (const exhibit of exhibits) {
      expect(runExhibit({ id: exhibit.id, mode: "bad" }).passed).toBe(false);
      expect(runExhibit({ id: exhibit.id, mode: "fixed" }).passed).toBe(true);
    }
  });
});
