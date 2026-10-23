// Stage 7 Phase 1 Task 14 (D-189 §3.1 / §1 anti-goals) — colours only through the 7 tokens.
//
// Every CSS module under src/ (globals.css, which defines the tokens, is not a module) and every
// component .tsx under src/components/ is scanned for what the A4 look forbids: a hex colour literal
// or an rgb() / hsl() colour (colours come from var(--ink) … var(--rule-spot)), shadows (Tailwind or
// box-shadow), radii above 6px (Tailwind md … full, any side; every border-radius in a CSS module must
// be 0 or ≤ 6px), the grey / blue SaaS backgrounds, red / green right-wrong colours, and `dark:`
// variants (they follow prefers-color-scheme and fight the single light theme). Comments are scanned
// too: a stale hex in a comment invites a copy. The patterns are pinned on sample strings below.
//
// ALLOWED lists a file + pattern that is a deliberate exception, with the reason. Empty for now: the
// textbook / glossary SVG figures are generated data loaded at runtime, not source; no ○ mark uses a
// 50% radius (the ○ is a glyph), so the radius check has no exception either.

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const SRC = path.resolve(__dirname, "..");

const FORBIDDEN: [name: string, re: RegExp][] = [
  // a whole 3–6 digit hex token, so an id like `#2024r06-q001` in a comment is not a colour
  ["hex colour", /#[0-9a-fA-F]{3,6}\b(?![-\w])/g],
  ["hex colour (8-digit, with alpha)", /#[0-9a-fA-F]{8}\b(?![-\w])/g],
  ["shadow-", /shadow-/g],
  ["box-shadow:", /\bbox-shadow\s*:/g],
  ["rgb() / hsl()", /\b(rgba?|hsla?)\(/g],
  // rounded-md … rounded-full, also per side / corner (rounded-t-lg, rounded-tl-xl, rounded-s-full)
  ["rounded-(md|lg|xl|2xl|3xl|full)", /rounded-(?:[trblxyse]{1,2}-)?(?:md|lg|xl|[23]xl|full)/g],
  ["bg-(blue|gray|slate|zinc|neutral)-", /bg-(blue|gray|slate|zinc|neutral)-/g],
  ["red / green text, bg, border", /(text|bg|border)-(red|green)-\d/g],
  ["dark:", /dark:/g],
];

/** `<path relative to src>` → forbidden-pattern names allowed there (with a reason in a comment). */
const ALLOWED: Record<string, string[]> = {};

/** Every forbidden match in `text` as `<line>  <pattern name>  <match>`. */
function hitsIn(text: string, allowed: string[] = []): string[] {
  const hits: string[] = [];
  text.split("\n").forEach((line, i) => {
    for (const [name, re] of FORBIDDEN) {
      if (allowed.includes(name)) continue;
      for (const m of line.matchAll(re)) hits.push(`${i + 1}  ${name}  ${m[0]}`);
    }
  });
  return hits;
}

/** Every border(-*)-radius value in `css` that is not 0 or ≤ 6px. */
function radiusHits(css: string): string[] {
  const hits: string[] = [];
  for (const m of css.matchAll(/(border(?:-[a-z]+)*-radius)\s*:\s*([^;}]+)/g)) {
    const ok = m[2]!.trim().split(/\s+/).every((v) => v === "0" || (/^\d+(\.\d+)?px$/.test(v) && parseFloat(v) <= 6));
    if (!ok) hits.push(`${css.slice(0, m.index).split("\n").length}  ${m[1]}: ${m[2]!.trim()}`);
  }
  return hits;
}

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
      for (const h of hitsIn(readFileSync(f, "utf-8"), ALLOWED[rel] ?? [])) hits.push(`${rel}:${h}`);
    }
    expect(hits).toEqual([]);
  });

  it("every border-radius in the CSS modules is 0 or ≤ 6px", () => {
    const hits: string[] = [];
    for (const f of files.filter((x) => x.endsWith(".css"))) {
      for (const h of radiusHits(readFileSync(f, "utf-8"))) hits.push(`${path.relative(SRC, f)}:${h}`);
    }
    expect(hits).toEqual([]);
  });
});

// The pattern list itself, on sample strings (fix round 1): each sample must be caught / let through.
describe("tokens only — the patterns", () => {
  const caught: string[] = [
    "color: #e94560;",
    "background: #fff;",
    "border: 1px solid #1B2A4A80;",
    "box-shadow: 0 1px 2px var(--ink);",
    "box-shadow:none",
    "background: rgba(26, 26, 46, 0.12);",
    "color: rgb(0 0 0);",
    "color: hsl(0 0% 50%);",
    "border-color: hsla(0, 0%, 0%, 0.1);",
    'className="shadow-lg"',
    'className="rounded-md"',
    'className="rounded-t-lg"',
    'className="rounded-tl-xl"',
    'className="rounded-2xl"',
    'className="rounded-s-full"',
    'className="bg-gray-100"',
    'className="text-red-800"',
    'className="bg-green-50"',
    'className="border-red-300"',
    'className="dark:bg-white/10"',
  ];
  const passed: string[] = [
    "// a reply's `#2024r06-q001` link",
    "// `#<question_id>` and #sensei-input",
    'href={`/textbook/${s.unitId}#${entry.id}`}',
    "color: var(--spot);",
    'className="rounded-none border-ink bg-tint text-ink-muted"',
    'className="rounded-sm"',
    "border-radius: 6px;",
  ];
  for (const sample of caught) {
    it(`catches ${sample}`, () => {
      expect(hitsIn(sample)).not.toEqual([]);
    });
  }
  for (const sample of passed) {
    it(`lets through ${sample}`, () => {
      expect(hitsIn(sample)).toEqual([]);
    });
  }

  it("radius: 0 / ≤ 6px pass; larger, %, rem, var() fail", () => {
    expect(radiusHits(".a { border-radius: 0; } .b { border-radius: 6px; } .c { border-radius: 0 0 6px 6px; }")).toEqual([]);
    expect(radiusHits(".d { border-top-left-radius: 3px; }")).toEqual([]);
    for (const bad of ["8px", "999px", "50%", "0.5rem", "var(--radius)", "4px / 8px"]) {
      expect(radiusHits(`.x { border-radius: ${bad}; }`), bad).not.toEqual([]);
    }
    expect(radiusHits(".y { border-bottom-right-radius: 12px; }")).not.toEqual([]);
  });
});
