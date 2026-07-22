# Architecture

`src/domain/cases.ts` is the executable core. It owns the schema, fixed inputs, bad and repaired functions, and assertions. `runExhibit` converts a requested case and mode into a serializable result; this makes the same logic usable from tests, CLI packaging, and the browser UI without network access.

`src/components/Museum.tsx` holds only selection and display state. It invokes `runExhibit` directly in the browser; no user-provided program is evaluated. The MDX files under `content/cases/` provide human explanations and are validated to have a matching case id.

```text
MDX source ── validate-content ──> case id
                                    │
browser UI / demo CLI ──> domain runner ──> serializable assertion results
                                    │
                          Vitest / Playwright verification
```

This separation permits deterministic tests with no browser, server, database, or external adapter.
