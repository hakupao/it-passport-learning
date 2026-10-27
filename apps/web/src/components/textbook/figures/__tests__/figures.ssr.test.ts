// Stage 7 Phase 3 Task 7 (D-196 §0-11, Review Focus 5) — every figure kind SSR-renders the v2
// sample's data in all three locales; invalid params render nothing (null, no throw); only the
// v1 svg kind injects markup. Same SSR approach as the textbook *.ssr.test.ts files.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import type { FigSpec, TextbookUnitV2 } from "@/lib/textbook/types";

import { CompareFig } from "../CompareFig";
import { FlowFig } from "../FlowFig";
import { NetworkFig } from "../NetworkFig";
import { DaysField, networkGeometry, NODE_R } from "../NetworkFig";
import { FIG_COMPONENTS, renderFig } from "../registry";
import { StageView } from "../StepStage";
import { TableFig } from "../TableFig";
import { TreeFig } from "../TreeFig";
import { SvgFig } from "../SvgFig";

const LOCALES = ["ja", "zh", "en"] as const;
type Locale = (typeof LOCALES)[number];

const SAMPLE = JSON.parse(
  readFileSync(path.resolve(__dirname, "../../../../lib/textbook/__fixtures__/v2-sample.json"), "utf-8"),
) as TextbookUnitV2;
const figOf = (term: string): FigSpec => structuredClone(SAMPLE.terms.find((t) => t.term === term)!.fig!);
const FIG = {
  svg: figOf("プロジェクトリスクマネジメント"),
  tree: figOf("リスクの対応策"),
  flow: figOf("回避"),
  network: figOf("軽減"),
  table: figOf("受容"),
  compare: figOf("転嫁"),
};
const SVG = '<svg id="v1-fig" viewBox="0 0 320 100"></svg>';

function messages(locale: Locale): Record<string, unknown> {
  return JSON.parse(readFileSync(path.resolve(__dirname, `../../../../../messages/${locale}.json`), "utf-8"));
}
const fm = (locale: Locale) => messages(locale).Figure as Record<string, string>;

function html(locale: Locale, el: React.ReactElement | null): string {
  return renderToStaticMarkup(h(NextIntlClientProvider, { locale, messages: messages(locale), children: el }));
}
const render = (locale: Locale, fig: FigSpec, svg: string | null = SVG) => html(locale, renderFig(fig, { locale, svg }));

describe("figure registry", () => {
  it("has exactly the FIGURE_KINDS kinds", async () => {
    const { FIGURE_KINDS } = await import("@/lib/textbook/figureSpec");
    expect(Object.keys(FIG_COMPONENTS).sort()).toEqual(Object.keys(FIGURE_KINDS).sort());
  });

  it("renders every kind of the sample in every locale", () => {
    for (const locale of LOCALES) {
      for (const [kind, fig] of Object.entries(FIG)) {
        const out = render(locale, fig);
        expect(out, `${kind} ${locale}`).toContain('data-part="fig"');
        // the svg kind keeps the v1 markup byte-for-byte (no data-fig); the others name their kind
        if (kind !== "svg") expect(out, `${kind} ${locale}`).toContain(`data-fig="${kind}"`);
      }
    }
  });
});

describe("each kind (SSR)", () => {
  it("svg: the v1 SVG inlined; nothing without the SVG text", () => {
    const out = render("ja", FIG.svg);
    expect(out).toContain(SVG);
    expect(out).toMatch(/<figure data-part="fig" class="[^"]*" style="--fig-w:320px"/);
    expect(html("ja", h(SvgFig, { fig: FIG.svg as Extract<FigSpec, { kind: "svg" }>, svg: null }))).toBe("");
  });

  it("table: headers and cells in the active locale, the key row marked", () => {
    const zh = render("zh", FIG.table);
    expect(zh).toContain("<table");
    expect(zh).toContain("影响 ＼ 概率");
    expect(zh).toContain("接受");
    expect(zh).not.toContain("受容");
    expect((zh.match(/<tr[^>]*data-key="true"/g) ?? []).length).toBe(1);
  });

  it("compare: a / b columns and the decisive row marked", () => {
    const en = render("en", FIG.compare);
    expect(en).toContain("Before transfer");
    expect(en).toContain("After transfer");
    expect(en).toContain("Still yes");
    expect((en.match(/<tr[^>]*data-key="true"/g) ?? []).length).toBe(1);
  });

  it("flow (steps): SSR shows the final step — every node, the last caption (silent), 前へ / もう一度, one dot per step", () => {
    const out = render("ja", FIG.flow);
    for (const label of ["要因を見つける", "計画・方式を変える", "発生しなくなる"]) expect(out).toContain(label);
    expect(out).not.toContain('data-off="true"');
    // polite from the first render; load announces nothing because the step does not change until in view / pressed
    expect(out).toMatch(/aria-live="polite"[^>]*>[^<]*要因がないので、リスクは起きない。/);
    const m = fm("ja");
    expect(out).toContain(`>${m.prev}</button>`);
    expect(out).toContain(`>${m.replay}</button>`);
    expect(out).not.toContain(`>${m.next}</button>`);
    expect((out.match(/data-dot=/g) ?? []).length).toBe(3);
  });

  it("flow (static): every node, no stage controls", () => {
    const fig = structuredClone(FIG.flow) as Extract<FigSpec, { kind: "flow" }>;
    fig.mode = "static";
    delete fig.steps;
    const out = render("en", fig);
    expect(out).toContain("Change the plan");
    expect(out).not.toContain("<button");
  });

  it("tree (steps): SSR shows every level", () => {
    const out = render("zh", FIG.tree);
    for (const label of ["对负面风险的应对", "规避", "减轻", "移交第三方"]) expect(out).toContain(label);
    expect(out).not.toContain('data-off="true"');
    expect((out.match(/data-dot=/g) ?? []).length).toBe(3);
  });

  it("network (widget): a labelled duration input per real activity, the total and the critical path", () => {
    for (const locale of LOCALES) {
      const out = render(locale, FIG.network);
      const m = fm(locale);
      expect((out.match(/<input[^>]*type="number"/g) ?? []).length, locale).toBe(4);
      for (const name of ["A", "B", "C", "D"]) {
        expect(out).toContain(m.actDays!.replace("{name}", name));
      }
      expect(out).toContain(m.total!.replace("{n}", "7"));
      expect((out.match(/data-critical="true"/g) ?? []).length).toBe(4); // A, C, D, the dummy
    }
  });
});

describe("invalid params render nothing and never throw", () => {
  const broken: Record<string, FigSpec> = {
    svg: { ...FIG.svg, data: { path: "../../etc/passwd" } } as FigSpec,
    table: (() => {
      const f = structuredClone(FIG.table) as Extract<FigSpec, { kind: "table" }>;
      f.data.rows[0]!.cells.pop();
      return f;
    })(),
    compare: (() => {
      const f = structuredClone(FIG.compare) as Extract<FigSpec, { kind: "compare" }>;
      f.data.rows = f.data.rows.slice(0, 1);
      return f;
    })(),
    flow: (() => {
      const f = structuredClone(FIG.flow) as Extract<FigSpec, { kind: "flow" }>;
      f.steps![2]!.state.show = 9;
      return f;
    })(),
    tree: (() => {
      const f = structuredClone(FIG.tree) as Extract<FigSpec, { kind: "tree" }>;
      (f.data.root as { label: unknown }).label = null;
      return f;
    })(),
    network: (() => {
      const f = structuredClone(FIG.network) as Extract<FigSpec, { kind: "network" }>;
      f.data.acts.push({ from: "4", to: "1", days: 1 });
      return f;
    })(),
  };

  it("through the registry", () => {
    for (const [kind, fig] of Object.entries(broken)) {
      expect(() => renderFig(fig, { locale: "ja", svg: SVG }), kind).not.toThrow();
      expect(renderFig(fig, { locale: "ja", svg: SVG }), kind).toBeNull();
    }
    expect(renderFig({ kind: "pie", mode: "static", data: {} } as unknown as FigSpec, { locale: "ja", svg: null })).toBeNull();
    expect(renderFig(null as unknown as FigSpec, { locale: "ja", svg: null })).toBeNull();
  });

  it("each component on its own (a backstop when called directly)", () => {
    type AnyFig = React.FC<{ fig: FigSpec; locale: string }>;
    const direct: [AnyFig, FigSpec][] = [
      [TableFig as AnyFig, broken.table!],
      [CompareFig as AnyFig, broken.compare!],
      [FlowFig as AnyFig, broken.flow!],
      [TreeFig as AnyFig, broken.tree!],
      [NetworkFig as AnyFig, broken.network!],
    ];
    for (const [C, fig] of direct) {
      expect(() => html("ja", h(C, { fig, locale: "ja" }))).not.toThrow();
      expect(html("ja", h(C, { fig, locale: "ja" }))).toBe("");
    }
    expect(html("ja", h(SvgFig, { fig: broken.svg as Extract<FigSpec, { kind: "svg" }>, svg: SVG }))).toBe("");
  });
});

describe("Review Focus 5: figure params are data", () => {
  it("only SvgFig uses dangerouslySetInnerHTML", () => {
    const dir = path.resolve(__dirname, "..");
    const users = readdirSync(dir)
      .filter((f) => /\.tsx?$/.test(f))
      .filter((f) => readFileSync(path.join(dir, f), "utf-8").includes("dangerouslySetInnerHTML"));
    expect(users).toEqual(["SvgFig.tsx"]);
  });

  it("markup in a label is escaped text, not HTML", () => {
    const f = structuredClone(FIG.compare) as Extract<FigSpec, { kind: "compare" }>;
    f.data.a.jp = "<img src=x onerror=alert(1)>";
    const out = render("ja", f);
    expect(out).not.toContain("<img");
    expect(out).toContain("&lt;img");
  });
});

// Task 7 review: the network drawing must keep every label readable, and the widgets accessible.
describe("network geometry", () => {
  const shapes: Record<string, { nodes: string[]; acts: { from: string; to: string; days: number; dummy?: boolean; name?: string }[] }> = {
    sample: (FIG.network as Extract<FigSpec, { kind: "network" }>).data,
    chain: { nodes: ["1", "2", "3", "4"], acts: [{ from: "1", to: "2", days: 3 }, { from: "2", to: "3", days: 4 }, { from: "3", to: "4", days: 2 }] },
    parallel: {
      nodes: ["1", "2", "3", "4"],
      acts: [
        { from: "1", to: "2", days: 2 },
        { from: "1", to: "3", days: 3 },
        { from: "2", to: "4", days: 4 },
        { from: "3", to: "4", days: 3 },
        { from: "1", to: "4", days: 5 },
      ],
    },
  };

  for (const [name, d] of Object.entries(shapes)) {
    it(`${name}: distinct node centres, no label inside a node, everything inside the canvas`, () => {
      const g = networkGeometry(d.nodes, d.acts);
      const pts = d.nodes.map((n) => g.pos[n]!);
      expect(new Set(pts.map((p) => `${p.x},${p.y}`)).size).toBe(d.nodes.length);
      g.edges.forEach((e, i) => {
        if (d.acts[i]!.dummy) return;
        for (const p of pts) {
          expect(Math.hypot(e.label.x - p.x, e.label.y - p.y), `${name} edge ${i} label vs node`).toBeGreaterThan(NODE_R + 8);
        }
        expect(e.label.x).toBeGreaterThan(0);
        expect(e.label.y).toBeGreaterThan(0);
        expect(e.label.x).toBeLessThan(g.width);
        expect(e.label.y).toBeLessThan(g.height);
      });
    });
  }

  it("sample: the dummy does not push node 3 a column right (1 | 2, 3 | 4); the dummy is vertical", () => {
    const g = networkGeometry(shapes.sample!.nodes, shapes.sample!.acts);
    expect(g.pos["2"]!.x).toBe(g.pos["3"]!.x);
    expect(g.pos["1"]!.x).toBeLessThan(g.pos["2"]!.x);
    expect(g.pos["3"]!.x).toBeLessThan(g.pos["4"]!.x);
  });

  it("two activities skipping columns (1→3, 1→4 over the chain 1→2→3→4): labels stay apart and clear of nodes", () => {
    const d = {
      nodes: ["1", "2", "3", "4"],
      acts: [
        { from: "1", to: "2", days: 1 },
        { from: "2", to: "3", days: 1 },
        { from: "3", to: "4", days: 1 },
        { from: "1", to: "3", days: 3 },
        { from: "1", to: "4", days: 4 },
      ],
    };
    const g = networkGeometry(d.nodes, d.acts);
    const pts = d.nodes.map((n) => g.pos[n]!);
    const TEXT_H = 16; // 13px labels + leading
    g.edges.forEach((e, i) => {
      for (const p of pts) expect(Math.hypot(e.label.x - p.x, e.label.y - p.y), `edge ${i} vs node`).toBeGreaterThan(NODE_R + 8);
      expect(e.label.y).toBeGreaterThan(0);
      expect(e.label.y).toBeLessThan(g.height);
      g.edges.forEach((f, j) => {
        if (j > i) expect(Math.hypot(e.label.x - f.label.x, e.label.y - f.label.y), `labels ${i} / ${j}`).toBeGreaterThan(TEXT_H);
      });
    });
    expect(g.edges[3]!.d).toMatch(/ Q /);
    expect(g.edges[4]!.d).toMatch(/ Q /);
  });

  it("parallel: the 1→4 activity spanning two columns is a curve, not a straight line through the middle column", () => {
    const g = networkGeometry(shapes.parallel!.nodes, shapes.parallel!.acts);
    expect(g.edges[4]!.d).toMatch(/ Q /);
    expect(g.edges[0]!.d).not.toMatch(/ Q /);
  });
});

describe("widget accessibility", () => {
  it("an invalid duration shows a visible error tied to the input", () => {
    const out = html("ja", h(DaysField, { id: "f1", label: "A の所要日数（日）", value: "abc", error: "0〜99 の整数で入力してください", onChange: () => {} }));
    expect(out).toContain('aria-invalid="true"');
    expect(out).toMatch(/aria-describedby="f1-err"/);
    expect(out).toMatch(/<p[^>]*id="f1-err"[^>]*>0〜99 の整数で入力してください<\/p>/);
    const ok = html("ja", h(DaysField, { id: "f1", label: "A", value: "3", error: "x", onChange: () => {} }));
    expect(ok).not.toContain("aria-invalid");
    expect(ok).not.toContain("f1-err");
  });

  it("step 1: 前へ stays focusable (aria-disabled, not disabled); the caption region is always polite", () => {
    const view = (step: number) =>
      html("ja", h(StageView, { step, frames: ["a", "b", "c"], captions: ["c1", "c2", "c3"], label: "L", onGo: () => {} }));
    const first = view(0);
    expect(first).toMatch(/<button[^>]*aria-disabled="true"[^>]*>前へ<\/button>/);
    expect(first).not.toMatch(/<button[^>]*disabled=""/);
    expect(first).toContain('aria-live="polite"');
    expect(view(2)).toContain('aria-live="polite"');
    // the aria-disabled 前へ looks disabled too (N1)
    const css = readFileSync(path.resolve(__dirname, "../figures.module.css"), "utf-8");
    expect(css).toMatch(/\.btn\[aria-disabled="true"\][^{]*\{[^}]*cursor:\s*default/);
  });
});
