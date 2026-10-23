// Stage 7 Phase 1 Task 14 (D-189 §3.1 / §1 anti-goals) — colours only through the 7 tokens.
//
// Every CSS module under src/ (globals.css, which defines the tokens, is not a module) and every
// component .tsx under src/components/ is scanned for what the A4 look forbids: a hex colour literal
// (colours come from var(--ink) … var(--rule-spot)), Tailwind shadows, radii above 6px (md / lg / xl /
// full), the grey / blue SaaS backgrounds, and `dark:` variants (they follow prefers-color-scheme and
// fight the single light theme). Comments are scanned too: a stale hex in a comment invites a copy.
//
// ALLOWED lists a file + pattern that is a deliberate exception, with the reason. Empty for now: the
// textbook / glossary SVG figures are generated data loaded at runtime, not source.

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const SRC = path.resolve(__dirname, "..");

const FORBIDDEN: [name: string, re: RegExp][] = [
  ["hex colour", /#[0-9a-fA-F]{3,6}/g],
  ["shadow-", /shadow-/g],
  ["rounded-(md|lg|xl|full)", /rounded-(md|lg|xl|full)/g],
  ["bg-(blue|gray|slate|zinc|neutral)-", /bg-(blue|gray|slate|zinc|neutral)-/g],
  ["dark:", /dark:/g],
];

/** `<path relative to src>` → forbidden-pattern names allowed there (with a reason in a comment). */
const ALLOWED: Record<string, string[]> = {};

function walk(dir: string, keep: (file: string) => boolean): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "__tests__" || e.name === "node_modules") continue;
      out.push(...walk(p, keep));
    } else if (keep(p)) {
      out.push(p);
    }
  }
  return out;
}

const files = [
  ...walk(SRC, (f) => f.endsWith(".module.css") && path.basename(f) !== "globals.css"),
  ...walk(path.join(SRC, "components"), (f) => f.endsWith(".tsx")),
];

describe("tokens only (D-189 §3.1)", () => {
  it("scans the CSS modules and the component sources", () => {
    const rel = files.map((f) => path.relative(SRC, f));
    expect(rel).toContain("components/textbook/reader.module.css");
    expect(rel).toContain("components/glossary/glossary.module.css");
    expect(rel).toContain("components/sensei/SenseiPanel.tsx");
    expect(rel).toContain("components/ui/button.tsx");
  });

  it("no hex colours, shadows, large radii, grey / blue backgrounds or dark: variants", () => {
    const hits: string[] = [];
    for (const f of files) {
      const rel = path.relative(SRC, f);
      const allowed = ALLOWED[rel] ?? [];
      const lines = readFileSync(f, "utf-8").split("\n");
      lines.forEach((line, i) => {
        for (const [name, re] of FORBIDDEN) {
          if (allowed.includes(name)) continue;
          for (const m of line.matchAll(re)) hits.push(`${rel}:${i + 1}  ${name}  ${m[0]}`);
        }
      });
    }
    expect(hits).toEqual([]);
  });
});
