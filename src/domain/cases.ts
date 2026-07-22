import { z } from "zod";

export type Mode = "bad" | "fixed";
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type Exhibit = {
  id: string;
  title: string;
  category: string;
  summary: string;
  input: Record<string, JsonValue>;
  expected: JsonValue;
  bad: (input: Record<string, JsonValue>) => JsonValue;
  fixed: (input: Record<string, JsonValue>) => JsonValue;
  assertion: (actual: JsonValue, expected: JsonValue) => boolean;
};

export type RunResult = {
  id: string;
  mode: Mode;
  title: string;
  input: Record<string, JsonValue>;
  output: JsonValue;
  expected: JsonValue;
  passed: boolean;
};

const same = (actual: JsonValue, expected: JsonValue) =>
  JSON.stringify(actual) === JSON.stringify(expected);
const asNumber = (value: JsonValue): number => {
  if (typeof value !== "number") throw new Error("Expected number input");
  return value;
};
const asString = (value: JsonValue): string => {
  if (typeof value !== "string") throw new Error("Expected string input");
  return value;
};
const asArray = (value: JsonValue): JsonValue[] => {
  if (!Array.isArray(value)) throw new Error("Expected array input");
  return value;
};
const asObject = (value: JsonValue): { [key: string]: JsonValue } => {
  if (!value || Array.isArray(value) || typeof value !== "object")
    throw new Error("Expected object input");
  return value;
};

export const exhibits: readonly Exhibit[] = [
  {
    id: "race-condition",
    title: "Lost update race",
    category: "Concurrency",
    summary: "Two updates read the same balance before either writes it.",
    input: { balance: 0, updates: [5, 9] },
    expected: 14,
    bad: ({ balance, updates }) => asNumber(balance) + asNumber(asArray(updates).at(-1) ?? 0),
    fixed: ({ balance, updates }) =>
      asArray(updates).reduce<number>((sum, update) => sum + asNumber(update), asNumber(balance)),
    assertion: same,
  },
  {
    id: "stale-cache",
    title: "Stale cache invalidation",
    category: "Caching",
    summary: "A cache entry is reused after the source version changes.",
    input: { cached: { version: 1, value: "blue" }, source: { version: 2, value: "green" } },
    expected: "green",
    bad: ({ cached }) => asString(asObject(cached).value),
    fixed: ({ cached, source }) => {
      const cache = asObject(cached);
      const origin = asObject(source);
      return asNumber(cache.version) === asNumber(origin.version)
        ? asString(cache.value)
        : asString(origin.value);
    },
    assertion: same,
  },
  {
    id: "timezone-boundary",
    title: "UTC date displayed as local date",
    category: "Time",
    summary: "Formatting a UTC instant as a date ignores the viewer offset.",
    input: { instant: "2026-07-22T00:30:00Z", offsetMinutes: -420 },
    expected: "2026-07-21",
    bad: ({ instant }) => asString(instant).slice(0, 10),
    fixed: ({ instant, offsetMinutes }) => {
      const shifted = new Date(
        new Date(asString(instant)).getTime() + asNumber(offsetMinutes) * 60_000,
      );
      return shifted.toISOString().slice(0, 10);
    },
    assertion: same,
  },
  {
    id: "floating-currency",
    title: "Floating-point currency",
    category: "Calculation",
    summary: "Binary floating point cannot represent every decimal amount exactly.",
    input: { items: [0.1, 0.2] },
    expected: 0.3,
    bad: ({ items }) => asArray(items).reduce<number>((sum, item) => sum + asNumber(item), 0),
    fixed: ({ items }) =>
      asArray(items).reduce<number>((sum, item) => sum + Math.round(asNumber(item) * 100), 0) / 100,
    assertion: same,
  },
  {
    id: "retry-storm",
    title: "Retry storm",
    category: "Reliability",
    summary: "Independent clients multiply retries against a dependency already failing.",
    input: { clients: 5, attemptsPerClient: 3 },
    expected: 3,
    bad: ({ clients, attemptsPerClient }) => asNumber(clients) * asNumber(attemptsPerClient),
    fixed: ({ attemptsPerClient }) => asNumber(attemptsPerClient),
    assertion: same,
  },
  {
    id: "null-protocol",
    title: "Missing optional value",
    category: "API contracts",
    summary: "A missing optional property is rendered as an accidental protocol value.",
    input: { profile: { name: "Mina" } },
    expected: "never",
    bad: ({ profile }) => String(asObject(profile).lastSeen),
    fixed: ({ profile }) => {
      const lastSeen = asObject(profile).lastSeen;
      return typeof lastSeen === "string" ? lastSeen : "never";
    },
    assertion: same,
  },
  {
    id: "idempotency",
    title: "Duplicate payment retry",
    category: "Distributed systems",
    summary: "Retrying a request charges twice when no idempotency key is retained.",
    input: { requests: ["order-7", "order-7"] },
    expected: 1,
    bad: ({ requests }) => asArray(requests).length,
    fixed: ({ requests }) => new Set(asArray(requests).map(asString)).size,
    assertion: same,
  },
  {
    id: "pagination-index",
    title: "One-based pagination",
    category: "Data access",
    summary: "A one-based page parameter is used as though it were zero-based.",
    input: { items: ["a", "b", "c", "d"], page: 1, size: 2 },
    expected: ["a", "b"],
    bad: ({ items, page, size }) =>
      asArray(items).slice(asNumber(page) * asNumber(size), (asNumber(page) + 1) * asNumber(size)),
    fixed: ({ items, page, size }) => {
      const start = (asNumber(page) - 1) * asNumber(size);
      return asArray(items).slice(start, start + asNumber(size));
    },
    assertion: same,
  },
  {
    id: "unicode-normalization",
    title: "Unicode duplicate names",
    category: "Data quality",
    summary: "Visually identical text has different code points without normalization.",
    input: { names: ["Café", "Café"] },
    expected: 1,
    bad: ({ names }) => new Set(asArray(names).map(asString)).size,
    fixed: ({ names }) =>
      new Set(asArray(names).map((name) => asString(name).normalize("NFC"))).size,
    assertion: same,
  },
  {
    id: "config-drift",
    title: "Falsy configuration value",
    category: "Configuration",
    summary: "A valid zero timeout is discarded by a truthiness fallback.",
    input: { environment: { TIMEOUT_MS: "0" }, fallback: 1000 },
    expected: 0,
    bad: ({ environment, fallback }) =>
      Number(asObject(environment).TIMEOUT_MS) || asNumber(fallback),
    fixed: ({ environment, fallback }) => {
      const raw = asObject(environment).TIMEOUT_MS;
      return raw === undefined ? asNumber(fallback) : Number(raw);
    },
    assertion: same,
  },
];

export const runRequestSchema = z.object({ id: z.string().min(1), mode: z.enum(["bad", "fixed"]) });

export function findExhibit(id: string): Exhibit {
  const exhibit = exhibits.find((entry) => entry.id === id);
  if (!exhibit) throw new Error(`Unknown exhibit: ${id}`);
  return exhibit;
}

export function redactSensitive(value: JsonValue, key = ""): JsonValue {
  if (/secret|token|password|authorization/i.test(key)) return "[redacted]";
  if (Array.isArray(value)) return value.map((item) => redactSensitive(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, item]) => [entryKey, redactSensitive(item, entryKey)]),
    );
  }
  return value;
}

export function runExhibit(request: unknown): RunResult {
  const { id, mode } = runRequestSchema.parse(request);
  const exhibit = findExhibit(id);
  const output = redactSensitive(exhibit[mode](exhibit.input));
  return {
    id,
    mode,
    title: exhibit.title,
    input: redactSensitive(exhibit.input) as Record<string, JsonValue>,
    output,
    expected: exhibit.expected,
    passed: exhibit.assertion(output, exhibit.expected),
  };
}
