"use client";

import { useState } from "react";
import { exhibits, runExhibit, type Mode, type RunResult } from "@/domain/cases";

function ResultCard({ label, result }: { label: string; result?: RunResult }) {
  if (!result)
    return (
      <section className="result empty" aria-label={`${label} result`}>
        Run this exhibit to inspect real output.
      </section>
    );
  return (
    <section className={`result ${result.passed ? "pass" : "fail"}`} aria-label={`${label} result`}>
      <h3>
        {label} — {result.passed ? "assertion passed" : "assertion failed"}
      </h3>
      <dl>
        <dt>Output</dt>
        <dd>
          <code>{JSON.stringify(result.output)}</code>
        </dd>
        <dt>Expected</dt>
        <dd>
          <code>{JSON.stringify(result.expected)}</code>
        </dd>
      </dl>
    </section>
  );
}

export function Museum() {
  const [selectedId, setSelectedId] = useState(exhibits[0].id);
  const [results, setResults] = useState<Partial<Record<Mode, RunResult>>>({});
  const exhibit = exhibits.find((entry) => entry.id === selectedId) ?? exhibits[0];

  function run(mode: Mode) {
    setResults((current) => ({ ...current, [mode]: runExhibit({ id: selectedId, mode }) }));
  }

  function change(id: string) {
    setSelectedId(id);
    setResults({});
  }

  return (
    <div className="shell">
      <header>
        <p className="eyebrow">OFFLINE SOFTWARE FAILURE LAB</p>
        <h1>BugPattern Gallery</h1>
        <p className="lede">
          A small museum where every exhibit makes the broken rule fail before showing its repair.
        </p>
      </header>
      <section className="selector">
        <label id="choose-exhibit" htmlFor="exhibit">
          Choose an exhibit
        </label>
        <select id="exhibit" value={selectedId} onChange={(event) => change(event.target.value)}>
          {exhibits.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.title} · {entry.category}
            </option>
          ))}
        </select>
        <p>
          <strong>{exhibit.category}</strong> — {exhibit.summary}
        </p>
      </section>
      <section className="workbench" aria-labelledby="workbench-title">
        <div className="input">
          <h2 id="workbench-title">Bundled input</h2>
          <pre>{JSON.stringify(exhibit.input, null, 2)}</pre>
        </div>
        <div className="actions">
          <button className="broken" type="button" onClick={() => run("bad")}>
            Run broken version
          </button>
          <button className="repaired" type="button" onClick={() => run("fixed")}>
            Run repaired version
          </button>
          <button
            className="both"
            type="button"
            onClick={() => {
              run("bad");
              run("fixed");
            }}
          >
            Run exhibit
          </button>
        </div>
      </section>
      <section className="results" aria-live="polite">
        <ResultCard label="Broken behaviour" result={results.bad} />
        <ResultCard label="Repaired behaviour" result={results.fixed} />
      </section>
      <footer>
        All examples run deterministically in this browser. No input leaves this page.
      </footer>
    </div>
  );
}
