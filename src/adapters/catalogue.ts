import { exhibits, runExhibit, type RunResult } from "@/domain/cases";

export type CatalogueRun = { bad: RunResult; fixed: RunResult };

/**
 * Boundary adapter for non-UI consumers. It exposes only the bundled, deterministic
 * catalogue and never evaluates caller-provided code or touches a network service.
 */
export function runBundledCatalogue(): CatalogueRun[] {
  return exhibits.map((exhibit) => ({
    bad: runExhibit({ id: exhibit.id, mode: "bad" }),
    fixed: runExhibit({ id: exhibit.id, mode: "fixed" }),
  }));
}
