// D-144 段 4 (S117): QuizRichText の component テスト。vitest は node 環境のままで、react-dom/server の
// renderToStaticMarkup で SSR し、出力 HTML を検査する (jsdom 不要 — Rule D 段 1 で「.tsx が未テスト」と指摘された穴を埋める)。
// JSX は vitest の bundler 設定に依存するため使わず createElement で書く。
import { describe, expect, it } from "vitest";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import path from "node:path";

import { ChoiceBody, StemBlocks } from "../QuizRichText";

const ROOT = path.resolve(__dirname, "../../../../../..");
const Q = JSON.parse(readFileSync(path.join(ROOT, "data/ip/quiz/questions.json"), "utf-8")).questions as {
  id: string; exam_id: string; stem_jp: string; choices_jp: Record<string, string>; choice_figures?: Record<string, string>; figure: string | null;
}[];
const byId = new Map(Q.map((q) => [q.id, q]));
const trCache = new Map<string, Record<string, { stem_jp_clean?: string }>>();
const clean = (id: string): string => {
  const q = byId.get(id)!;
  if (!trCache.has(q.exam_id)) trCache.set(q.exam_id, JSON.parse(readFileSync(path.join(ROOT, "data/ip/quiz/translations", `${q.exam_id}.json`), "utf-8")).questions);
  return trCache.get(q.exam_id)![id]?.stem_jp_clean || q.stem_jp;
};
const html = (el: React.ReactElement): string => renderToStaticMarkup(el);

describe("StemBlocks (SSR)", () => {
  it("renders markdown tables as <table> with <th> header and no raw pipes (2021r03-q095)", () => {
    const out = html(h(StemBlocks, { stem: clean("2021r03-q095") }));
    expect((out.match(/<table/g) ?? []).length).toBe(2);
    expect(out).toContain("<th scope=\"col\">商品コード</th>");
    expect(out).toContain("<td>Z00003</td><td>0002</td>");
    expect(out).not.toMatch(/\|\s*商品コード/);
  });
  it("keeps pseudo-code verbatim inside <p> (2026r08-q085) and renders ``` fences as <pre> (2019h31h-q096)", () => {
    const a = html(h(StemBlocks, { stem: clean("2026r08-q085") }));
    expect(a).not.toContain("<table");
    expect(a).toContain("　if (num が 2　[　a　])");
    const b = html(h(StemBlocks, { stem: clean("2019h31h-q096") }));
    expect(b).toContain("<pre");
    expect(b).not.toContain("```");
  });
  it("header-less table (blank first row) renders without <thead> (2014h26a-q001)", () => {
    const out = html(h(StemBlocks, { stem: clean("2014h26a-q001") }));
    expect(out).toContain("<table");
    expect(out).not.toContain("<thead");
    expect(out).toContain("<td>売上高</td>");
  });
  it("chumon preamble + question renders as multiple <p> without category headers (2013h25a-q090)", () => {
    const out = html(h(StemBlocks, { stem: clean("2013h25a-q090") }));
    expect(out).toContain("〔業務改善の企画書作成に関する上司からの指示〕");
    expect(out).not.toContain("〔ストラテジ〕");
  });
});

describe("ChoiceBody (SSR)", () => {
  it("[表] a:/b: → key chips bound to values (2023r05-q037)", () => {
    const out = html(h(ChoiceBody, { text: "[表] a: 外観, b: 客観的な" }));
    expect(out).toContain(">a<");
    expect(out).toContain("外観");
    expect(out).not.toContain("[表]");
  });
  it("translation without the mark inherits the jp shape (2009h21h-q061 en)", () => {
    const out = html(h(ChoiceBody, { text: "MTBF (hours) 100, MTTR (hours) 150, Availability (%) 40", jpText: "[表] MTBF（時間）100，MTTR（時間）150，稼働率（%）40" }));
    expect((out.match(/class="[^"]*pairValue[^"]*"/g) ?? []).length).toBe(3); // セル数 3 を固定 (Rule D LOW-2)
  });
  it("choice figure renders <img> with the neutral label as alt (2014h26a-q046)", () => {
    const q = byId.get("2014h26a-q046")!;
    expect(q.choice_figures?.["ア"]).toBe("2014h26a-q046-cA");
    const out = html(h(ChoiceBody, { text: "図ア", figure: q.choice_figures!["ア"] }));
    expect(out).toContain("src=\"/quiz-figures/2014h26a-q046-cA.webp\"");
    expect(out).toContain("alt=\"図ア\"");
  });
  it("plain choice stays a plain <span> (no pre-wrap class) so the ~2600 ordinary questions are unchanged", () => {
    const out = html(h(ChoiceBody, { text: "リスク分析 → リスク評価 → リスク対応" }));
    expect(out).toBe("<span>リスク分析 → リスク評価 → リスク対応</span>");
  });
});

describe("StemBlocks whole corpus (SSR)", () => {
  it("every displayed stem SSR-renders without raw table pipes (line-leading, incl. after prose) or fences", () => {
    const bad: string[] = [];
    for (const q of Q) {
      const out = html(h(StemBlocks, { stem: clean(q.id) }));
      // <p> 内のテキストを取り出し、行頭が | の行 (散文の後に続くものも含む) と ``` を探す (Rule D LOW-1)
      const texts = [...out.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => m[1] ?? "");
      if (texts.some((tx) => /(^|\n)\s*\|[^\n]*\|/.test(tx)) || out.includes("```")) bad.push(q.id);
    }
    expect(bad, `raw table/fence leaked in: ${bad.slice(0, 5).join(", ")}`).toEqual([]);
  });
});
