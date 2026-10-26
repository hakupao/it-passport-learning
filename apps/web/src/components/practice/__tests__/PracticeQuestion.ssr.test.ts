// Stage 7 Phase 1 Task 8 (D-189 §6.2 / D-190 §0-15) — the practice question face (SSR).
// Same approach as QuizSet.ssr.test.ts: node env, renderToStaticMarkup, real corpus + catalogs.
import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) =>
    h("a", { href, className }, children),
}));

import { loadChumonGroups } from "@/lib/practice/practiceReader";
import type { ChumonGroup } from "@/lib/practice/practiceIndex";
import { CHOICE_LETTERS, loadAllQuestions, type QuizQuestion } from "@/lib/quiz/quizReader";

import { choiceLayout } from "../choiceLayout";
import { fidAll, fidOne, messagesFor, renderFace } from "./practiceRender";

let QS: QuizQuestion[] = [];
let GROUPS: ChumonGroup[] = [];
const byId = (id: string) => QS.find((q) => q.id === id)!;
beforeAll(async () => {
  [QS, GROUPS] = await Promise.all([loadAllQuestions(), loadChumonGroups()]);
});

const CSS = readFileSync(path.resolve(__dirname, "../practice.module.css"), "utf-8");
/** red / green colour values that must never encode right / wrong (DESIGN §3.1) */
const RED_GREEN =
  /#(?:f00|0f0|ff0000|00ff00|e53935|43a047|dc2626|16a34a|ef4444|22c55e)\b|\b(?:red|green|lime|crimson)\b/i;

/** the <li> of one choice letter */
function choiceItem(html: string, letter: string): string {
  const m = new RegExp(`<li[^>]*data-letter="${letter}"[^>]*>[\\s\\S]*?</li>`).exec(html);
  if (!m) throw new Error(`no choice ${letter}`);
  return m[0];
}

describe("PracticeQuestion — 問 N, layout, choices", () => {
  it("問 N uses the source question number (sourceNumber(q); no number prop), 問 in every locale", () => {
    const q = QS.find((x) => x.id.endsWith("-q087"))!;
    for (const locale of ["ja", "zh", "en"]) {
      const out = renderFace(q, locale);
      expect(out).toMatch(/data-qno="87"/);
      expect(out).toMatch(/<span[^>]*>問<\/span><span[^>]*>87<\/span>/);
      expect(out).toContain("頻出度");
      expect(out).toMatch(/>出典　</);
      // Japanese book labels carry lang="ja" (zh / en screen readers)
      expect(out).toMatch(/<span[^>]*lang="ja"[^>]*>問<\/span>/);
      expect(out).toMatch(/<span lang="ja">頻出度<\/span>/);
      expect(out).toMatch(/<span lang="ja">出典　</);
    }
    const g = GROUPS.find((x) => x.preambleChars.jp !== null)!;
    const member = byId(g.memberIds[1]!);
    expect(renderFace(member, "en", { preambleChars: g.preambleChars.jp, foldPreamble: true })).toContain(
      '<summary lang="ja">共通前文 ▸</summary>',
    );
  });

  it("a shown translation turns row4 into list (grid2 stays grid2); hidden or ja keeps row4", () => {
    const q = QS.find((x) => choiceLayout(x) === "row4")!;
    expect(renderFace(q, "zh", { showTranslation: true })).toMatch(/data-layout="list"/);
    expect(renderFace(q, "en", { showTranslation: true })).toMatch(/data-layout="list"/);
    expect(renderFace(q, "zh", { showTranslation: false })).toMatch(/data-layout="row4"/);
    expect(renderFace(q, "ja", { showTranslation: true })).toMatch(/data-layout="row4"/);
    const grid = QS.find((x) => choiceLayout(x) === "grid2")!;
    expect(renderFace(grid, "en", { showTranslation: true })).toMatch(/data-layout="grid2"/);
  });

  it("row4 renders 4 columns class", () => {
    const q = QS.find((x) => choiceLayout(x) === "row4")!;
    const out = renderFace(q, "ja");
    expect(out).toMatch(/<ul[^>]*class="[^"]*row4[^"]*"[^>]*data-layout="row4"/);
    expect(CSS).toMatch(/\.row4\s*\{[^}]*grid-template-columns:\s*repeat\(4,/);
    const list = QS.find((x) => choiceLayout(x) === "list")!;
    expect(renderFace(list, "ja")).toMatch(/data-layout="list"/);
    const grid = QS.find((x) => choiceLayout(x) === "grid2")!;
    expect(renderFace(grid, "ja")).toMatch(/data-layout="grid2"/);
    expect(CSS).toMatch(/\.grid2\s*\{[^}]*grid-template-columns:\s*repeat\(2,/);
  });

  it("choices are buttons in ア〜エ order; unanswered = enabled, unmarked", () => {
    const q = byId("2024r06-q001");
    const out = renderFace(q, "ja");
    const at = CHOICE_LETTERS.map((L) => out.indexOf(`data-letter="${L}"`));
    expect(at.every((x) => x > 0)).toBe(true);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
    const buttons = out.match(/<button type="button"[^>]*aria-pressed="false"[^>]*aria-disabled="false"/g) ?? [];
    expect(buttons).toHaveLength(4);
    expect(out).not.toMatch(/data-state="(correct|picked-wrong)"/);
  });

  it("picked wrong: ink block + × and the correct choice spot ○ (no red / green values)", () => {
    const q = byId("2024r06-q001");
    const wrong = CHOICE_LETTERS.find((L) => L !== q.correct_answer)!;
    const out = renderFace(q, "ja", { picked: wrong });
    const w = choiceItem(out, wrong);
    expect(w).toContain('data-state="picked-wrong"');
    expect(w).toContain('aria-pressed="true"');
    expect(w).toMatch(/aria-hidden="true">×</);
    const c = choiceItem(out, q.correct_answer);
    expect(c).toContain('data-state="correct"');
    expect(c).toMatch(/class="[^"]*ring[^"]*" aria-hidden="true">○</);
    for (const L of CHOICE_LETTERS) expect(choiceItem(out, L)).toContain('aria-disabled="true"');
    // ink block for your wrong answer, spot for the correct one — tokens only
    expect(CSS).toMatch(/\[data-state="picked-wrong"\] \.letter\s*\{[^}]*background:\s*var\(--ink\)/);
    expect(CSS).toMatch(/\[data-state="correct"\][^{]*\{[^}]*var\(--spot\)/);
    expect(out).not.toMatch(RED_GREEN);
    expect(CSS).not.toMatch(RED_GREEN);
  });

  it("picked correct: one ○ cell, no × mark", () => {
    const q = byId("2024r06-q001");
    const out = renderFace(q, "ja", { picked: q.correct_answer as "ア" });
    expect(choiceItem(out, q.correct_answer)).toContain('data-state="correct"');
    expect(out).not.toContain('data-state="picked-wrong"');
  });

  it("出典 row carries the full source label", () => {
    const q = byId("2024r06-q001");
    const src = fidOne(renderFace(q, "ja"), "source")!;
    expect(src.inner).toBe(q.source_label);
  });
});

describe("PracticeQuestion — translation layer (D-186)", () => {
  const q = () => byId("2024r06-q001");

  it("translation toggle absent in ja, present in zh/en, default hidden", () => {
    const ja = renderFace(q(), "ja", { showTranslation: true });
    expect(ja).not.toContain("data-translation-toggle");
    expect(fidAll(ja, "stem-tr")).toHaveLength(0);
    for (const locale of ["zh", "en"]) {
      const off = renderFace(q(), locale);
      expect(off).toMatch(/<button[^>]*aria-pressed="false"[^>]*data-translation-toggle/);
      expect(fidAll(off, "stem-tr")).toHaveLength(0);
      expect(fidAll(off, "choice-tr-0")).toHaveLength(0);
      const on = renderFace(q(), locale, { showTranslation: true });
      expect(on).toMatch(/<button[^>]*aria-pressed="true"[^>]*data-translation-toggle/);
      expect(fidAll(on, "stem-tr")).toHaveLength(1);
      expect(fidAll(on, "choice-tr-3")).toHaveLength(1);
    }
    expect(renderFace(q(), "zh")).toContain("显示中文译文");
    expect(renderFace(q(), "en")).toContain("Show English translation");
  });

  it("JP stem stays on the face when the translation is shown", () => {
    const on = renderFace(q(), "zh", { showTranslation: true });
    expect(fidAll(on, "stem")).toHaveLength(1);
    expect(on).toMatch(/<div lang="ja"[^>]*data-fid="stem"/);
    expect(on).toMatch(/lang="zh-Hans"[^>]*data-fid="stem-tr"/);
  });
});

describe("PracticeQuestion — 复习三格 / 頻出度 / figure / 中問", () => {
  it("recent cells: ○ for correct, ink × for wrong, blank for no attempt (newest first)", () => {
    const out = renderFace(byId("2024r06-q001"), "ja", { recent: [false, true] });
    const cells = out.match(/<span class="[^"]*cell[^"]*" data-recent="[a-z]+"[^>]*>[^<]*<\/span>/g) ?? [];
    expect(cells).toHaveLength(3);
    expect(cells[0]).toMatch(/data-recent="wrong"[^>]*>×</);
    expect(cells[1]).toMatch(/data-recent="right"[^>]*>○</);
    expect(cells[2]).toMatch(/data-recent="none"[^>]*><\/span>/);
    expect(CSS).toMatch(/\[data-recent="wrong"\]\s*\{[^}]*background:\s*var\(--ink\)/);
  });

  it("頻出度 stars in spot: ★★☆", () => {
    const out = renderFace(byId("2024r06-q001"), "ja", { stars: 2 });
    expect(out).toMatch(/頻出度/);
    expect(out).toMatch(/>★★☆</);
    expect(renderFace(byId("2024r06-q001"), "ja", { stars: 3 })).toMatch(/>★★★</);
  });

  it("figure question: the figure sits under the stem, above the choices, inside a zoom button; the dialog is empty until opened", () => {
    const q = QS.find((x) => x.figure)!;
    const out = renderFace(q, "ja");
    const fig = fidOne(out, "figure")!;
    expect(fig.open).toContain(`src="/quiz-figures/${q.figure}.webp"`);
    expect(out.indexOf('data-fid="stem"')).toBeLessThan(fig.at);
    expect(fig.at).toBeLessThan(out.indexOf('data-letter="ア"'));
    expect(out).toMatch(/<button type="button"[^>]*aria-label="図を拡大"[^>]*><img/);
    expect(out).toMatch(/<dialog[^>]*><\/dialog>/);
  });

  it("chumon member: preamble folded into a closed <details> 「共通前文 ▸」, the rest as the stem", () => {
    const g = GROUPS.find((x) => x.preambleChars.jp !== null)!;
    const q = byId(g.memberIds[1]!);
    const n = g.preambleChars.jp!;
    const out = renderFace(q, "ja", { preambleChars: n, foldPreamble: true });
    expect(out).toMatch(/<details class="[^"]*"><summary[^>]*>共通前文 ▸<\/summary><div[^>]*data-fid="stem-preamble"/);
    expect(renderFace(q, "en", { preambleChars: n, foldPreamble: true })).toContain(">共通前文 ▸</summary>");
    expect(out).not.toMatch(/<details[^>]*\sopen/);
    expect(fidAll(out, "stem-preamble")).toHaveLength(1);
    expect(fidAll(out, "stem")).toHaveLength(1);
    // not folding (first member / foldPreamble false) → whole stem, no details
    const plain = renderFace(q, "ja", { preambleChars: n, foldPreamble: false });
    expect(fidAll(plain, "stem-preamble")).toHaveLength(0);
    expect(plain).not.toContain("共通前文");
    const nullFold = renderFace(q, "ja", { preambleChars: null, foldPreamble: true });
    expect(fidAll(nullFold, "stem-preamble")).toHaveLength(0);
  });

  it("table choices keep the table outside the button (sibling body, aria-describedby)", () => {
    const q = QS.find(
      (x) => x.choices_jp["ア"]?.startsWith("[表]") && /\n\s*\|/.test(x.choices_jp["ア"] ?? "") && !x.choice_figures,
    );
    if (!q) throw new Error("fixture: no table-choice question");
    const out = renderFace(q, "ja");
    const li = choiceItem(out, "ア");
    expect(li).toMatch(/<button[^>]*aria-describedby="[^"]+"[\s\S]*?<\/button><div[^>]*id="[^"]+"/);
    expect(li).not.toMatch(/<button[^>]*>(?:(?!<\/button>)[\s\S])*<table/);
  });

  it("OQ-11: the figure dialog restores margin: auto (Tailwind preflight sets margin 0 on every element)", () => {
    expect(CSS).toMatch(/\.zoom\s*\{[^}]*margin:\s*auto;/);
  });

  it("OQ-11 review: the zoomed image fits the dialog's content box (no sideways scroll on a phone, close button in view)", () => {
    // dialog box 96vw × 94vh (border-box) − padding 2 × 12 − border 2 × 1.5 = 27px; close button 10 + 36 = 46px
    expect(CSS).toMatch(/\.zoomImg\s*\{[^}]*max-width:\s*calc\(96vw - 27px\);/);
    expect(CSS).toMatch(/\.zoomImg\s*\{[^}]*max-height:\s*calc\(94dvh - 73px\);/);
  });

  it("OQ-10: row4 drops to 2 columns below 460px and 1 column below 234px of the face body (container query)", () => {
    expect(CSS).toMatch(/\.body\s*\{[^}]*container-type:\s*inline-size;/);
    expect(CSS).toMatch(
      /@container\s*\(max-width:\s*459\.98px\)\s*\{\s*\.row4\s*\{\s*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/,
    );
    expect(CSS).toMatch(
      /@container\s*\(max-width:\s*233\.98px\)\s*\{\s*\.row4\s*\{\s*grid-template-columns:\s*minmax\(0,\s*1fr\);/,
    );
  });

  it("practice.module.css: tokens only — no hex, no shadow, no gradient, radius ≤ 6px, no white-space override", () => {
    expect(CSS).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(CSS).not.toMatch(/box-shadow|text-shadow|gradient\(/);
    expect(CSS).not.toMatch(/\brgba?\(|\bhsla?\(/);
    for (const m of CSS.matchAll(/border-radius:\s*([^;]+);/g)) {
      for (const v of m[1]!.split(/\s+/)) {
        expect(Number.parseFloat(v)).toBeLessThanOrEqual(6);
      }
    }
    expect(CSS).not.toMatch(/white-space\s*:/);
  });
});

// Stage 7 Phase 2 Task 4 (D-193 §0-7): the mock exam's face — picking only marks 「選択中」 (re-pick
// allowed), nothing tells right from wrong, the number is the mock's own 第 N 問 / 100.
describe("PracticeQuestion — mode exam (mock)", () => {
  it("picked イ: that <li> is data-state picked; no ○ / ×, no lock, no explanation / AI / report", () => {
    const q = QS.find((x) => x.correct_answer !== "イ" && choiceLayout(x) === "list" && !x.figure && !x.choice_figures)!;
    for (const locale of ["ja", "zh", "en"]) {
      const out = renderFace(q, locale, {
        mode: "exam",
        picked: "イ",
        recent: [true, false],
        examNo: { n: 7, total: 100 },
      });
      expect(choiceItem(out, "イ")).toMatch(/data-state="picked"/);
      expect(choiceItem(out, "イ")).toMatch(/aria-pressed="true"/);
      for (const l of ["ア", "ウ", "エ"]) expect(choiceItem(out, l)).toMatch(/data-state="idle"/);
      expect(out).not.toMatch(/aria-disabled="true"/);
      expect(out).not.toMatch(/data-state="(correct|picked-wrong|other)"/);
      expect(out).not.toMatch(/[○×]/); // neither the choice marks nor the recent cells
      const P = messagesFor(locale).Practice as Record<string, string>;
      for (const k of ["markCorrect", "markYourWrong", "markYourCorrect", "explanationTab", "fbReport"]) {
        expect(out, k).not.toContain(P[k]!);
      }
      expect(out).not.toContain((messagesFor(locale).Sensei as Record<string, string>).askButton);
      // the mock's own number, 出典 kept
      expect(out).toMatch(/data-qno="7"/);
      expect(out).toContain("/ 100");
      expect(out).toContain(q.source_label);
    }
  });

  it("practice mode (default) is unchanged: a pick still shows ○ / × and locks the choices", () => {
    const q = QS.find((x) => x.correct_answer !== "イ" && choiceLayout(x) === "list" && !x.figure && !x.choice_figures)!;
    const out = renderFace(q, "ja", { picked: "イ" });
    expect(choiceItem(out, "イ")).toMatch(/data-state="picked-wrong"/);
    expect(out).toMatch(/aria-disabled="true"/);
  });
});
