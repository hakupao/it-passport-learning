// Stage 7 Phase 1 Task 8 (D-189 §6.2 / D-190 §0-16 / §0-24 / §0-25) — explanation pane + 解答栏 (SSR).
import { createElement as h } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) =>
    h("a", { href, className }, children),
}));

import type { TermCard } from "@/lib/glossary/dictionary";
import type { ChoiceLetter } from "@/lib/learning/record";
import { CHOICE_LETTERS, loadAllQuestions, type QuizQuestion } from "@/lib/quiz/quizReader";

import { sourceNumber } from "../choiceLayout";
import { splitTerms } from "../termHighlight";
import { fidAll, fidOne, renderAnswerBar, renderPane, textOf } from "./practiceRender";

let QS: QuizQuestion[] = [];
const byId = (id: string) => QS.find((q) => q.id === id)!;
beforeAll(async () => {
  QS = await loadAllQuestions();
});

const SUSPECT = {
  ja: "※ この問題は、解説作成時の検算で公表解答を確認しきれませんでした。判定は IPA 公表の解答どおりです。",
  zh: "※ 编写解析时的验算未能完全确认公布答案；判定仍按 IPA 公布的答案。",
  en: "※ Our check while writing this explanation could not fully confirm the published answer; scoring follows IPA's official key.",
} as const;

const wrongOf = (q: QuizQuestion): ChoiceLetter => CHOICE_LETTERS.find((L) => L !== q.correct_answer)!;
const card = (term: string, gloss = term): TermCard => ({
  id: `t-${term}`,
  term,
  gloss,
  definition: "def",
  memoryHook: "",
  senseCount: 1,
  questionCount: 1,
});

describe("ExplanationPane — unanswered", () => {
  it("unanswered: explanation pane shows only the placeholder", () => {
    const q = byId("2024r06-q001");
    for (const [locale, text] of [
      ["ja", "解答すると解説が表示されます"],
      ["zh", "作答后显示解析"],
      ["en", "The explanation appears after you answer."],
    ] as const) {
      const out = renderPane(q, locale, null);
      expect(out).toContain(text);
      expect(out).not.toContain("data-verdict");
      expect(out).not.toContain("data-fid");
      expect(out).not.toMatch(/<button/);
    }
  });
});

describe("ExplanationPane — verdict list (× / ○)", () => {
  it("explanation lists ×/○ for all 4 letters in ア〜エ order", () => {
    const q = byId("2024r06-q001");
    const out = renderPane(q, "ja", wrongOf(q));
    const rows = [...out.matchAll(/<li[^>]*data-verdict="(correct|wrong)"[^>]*data-letter="(.)"/g)].map((m) => [m[2], m[1]]);
    expect(rows).toEqual(CHOICE_LETTERS.map((L) => [L, L === q.correct_answer ? "correct" : "wrong"]));
    expect((out.match(/aria-hidden="true">○</g) ?? []).length).toBe(1);
    expect((out.match(/aria-hidden="true">×</g) ?? []).length).toBe(3);
    // the ○ row carries the correct reason; × rows carry their distractor by letter index
    const ex = q.explanation!;
    expect(textOf(fidOne(out, "expl-correct")!.inner)).toBe(ex.correct.jp);
    const ci = CHOICE_LETTERS.indexOf(q.correct_answer as ChoiceLetter);
    expect(fidAll(out, `expl-${ci}`)).toHaveLength(0);
    for (const [i, L] of CHOICE_LETTERS.entries()) {
      if (L === q.correct_answer) continue;
      expect(textOf(fidOne(out, `expl-${i}`)!.inner)).toBe(ex.distractors[L]!.jp);
    }
  });

  it("your choice row is open, other wrong rows are closed (<details> without open)", () => {
    const q = byId("2024r06-q001");
    const mine = wrongOf(q);
    const out = renderPane(q, "ja", mine);
    const details = [...out.matchAll(/<li[^>]*data-letter="(.)"[^>]*><details([^>]*)>/g)].map((m) => [m[1], /\sopen/.test(m[2]!)]);
    expect(details).toHaveLength(3);
    for (const [L, open] of details) expect(open).toBe(L === mine);
    expect(out).toMatch(new RegExp(`data-letter="${mine}"[^>]*data-mine="true"`));
    expect(out).toContain("← あなたの答え");
    expect((out.match(/data-mine="true"/g) ?? []).length).toBe(1);
    // each × row: visible × is aria-hidden, the result is in sr-only text; a ▸/▾ disclosure hint (CSS)
    const summaries = out.match(/<summary>[\s\S]*?<\/summary>/g) ?? [];
    expect(summaries).toHaveLength(3);
    for (const sm of summaries) {
      expect(sm).toMatch(/aria-hidden="true">×<\/span><span class="sr-only">不正解<\/span>/);
      expect(sm).toMatch(/class="[^"]*disclosure[^"]*" aria-hidden="true"/);
    }
    expect(renderPane(q, "zh", mine)).toContain('<span class="sr-only">错误</span>');
    expect(renderPane(q, "en", mine)).toContain('<span class="sr-only">Incorrect</span>');
  });

  it("picked correct: the ○ row is yours; all × rows closed", () => {
    const q = byId("2024r06-q001");
    const out = renderPane(q, "ja", q.correct_answer as ChoiceLetter);
    expect(out).toMatch(/data-verdict="correct"[^>]*data-mine="true"/);
    expect(out).not.toMatch(/<details[^>]*\sopen/);
  });
});

describe("ExplanationPane — title, points, suspect, language", () => {
  it("title = 問 N + the short phrase of points[0] (§0-16); none → only 問 N", () => {
    const withTitle = QS.find((q) => {
      const p = q.explanation?.points[0]?.jp ?? "";
      const i = p.indexOf("。");
      return i > 0 && [...p.slice(0, i)].length <= 30;
    })!;
    const out = renderPane(withTitle, "ja", wrongOf(withTitle));
    const p0 = withTitle.explanation!.points[0]!.jp;
    const n = Number(/-q(\d+)$/.exec(withTitle.id)![1]);
    expect(out).toMatch(new RegExp(`<h2[^>]*><span[^>]*>問 ${n}</span><span[^>]*>${p0.slice(0, p0.indexOf("。")).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</span></h2>`));
    const en = renderPane(withTitle, "en", wrongOf(withTitle));
    expect(en).toMatch(new RegExp(`<h2[^>]*><span[^>]*>問 ${n}</span></h2>`));
  });

  it("points render 1–3 items", () => {
    for (const k of [1, 2, 3]) {
      const q = QS.find((x) => x.explanation?.points.length === k)!;
      const out = renderPane(q, "ja", wrongOf(q));
      expect(out).toContain("ここがポイント");
      for (let i = 0; i < 3; i++) expect(fidAll(out, `point-${i}`)).toHaveLength(i < k ? 1 : 0);
    }
  });

  it("suspect question shows the suspect line in ja/zh/en", () => {
    const q = QS.find((x) => x.explanation?.key_guard.suspect)!;
    for (const locale of ["ja", "zh", "en"] as const) {
      const out = renderPane(q, locale, wrongOf(q));
      expect(textOf(fidOne(out, "suspect")!.inner)).toBe(SUSPECT[locale]);
    }
  });

  it("non-suspect shows none", () => {
    const q = QS.find((x) => x.explanation && !x.explanation.key_guard.suspect)!;
    for (const locale of ["ja", "zh", "en"]) {
      const out = renderPane(q, locale, wrongOf(q));
      expect(fidAll(out, "suspect")).toHaveLength(0);
      expect(out).not.toContain("※");
    }
  });

  it("explanation language starts at the UI locale; 日 / 中 / EN switch inside the block", () => {
    const q = byId("2024r06-q001");
    for (const [locale, field, lang] of [
      ["ja", "jp", "ja"],
      ["zh", "zh", "zh-Hans"],
      ["en", "en", "en"],
    ] as const) {
      const out = renderPane(q, locale, wrongOf(q));
      const pressed = [...out.matchAll(/<button type="button"[^>]*aria-pressed="(true|false)"[^>]*data-expl-lang="(\w+)"/g)];
      expect(pressed.map((m) => m[2])).toEqual(["ja", "zh", "en"]);
      expect(pressed.filter((m) => m[1] === "true").map((m) => m[2])).toEqual([locale]);
      expect(textOf(fidOne(out, "expl-correct")!.inner)).toBe(q.explanation!.correct[field]);
      expect(out).toMatch(new RegExp(`<ul[^>]*lang="${lang}"[^>]*data-verdicts`));
    }
  });

  it("terms row: chips for carded terms + 问 AI 老师", () => {
    const q = byId("2024r06-q001");
    const out = renderPane(q, "zh", wrongOf(q), { RPA: card("RPA") });
    expect(out).toMatch(/<button[^>]*aria-expanded="false"[^>]*>RPA<\/button>/);
    expect(out).toContain("问 AI 老师");
  });
});

describe("book labels stay Japanese in every locale (A4 mockup)", () => {
  it("zh / en render 問 / 解説 / 解答 / ここがポイント / 正解 / 用語; your-answer and the placeholder are localized", () => {
    const q = QS.find((x) => x.explanation?.points.length === 2 && x.terms.length > 0)!;
    for (const [locale, yours] of [
      ["ja", "← あなたの答え"],
      ["zh", "← 你的答案"],
      ["en", "← your answer"],
    ] as const) {
      const out = renderPane(q, locale, wrongOf(q));
      expect(out).toMatch(/>解説</);
      expect(out).toContain(`>問 ${sourceNumber(q)}<`);
      expect(out).toContain(">ここがポイント<");
      expect(out).toContain("<strong>正解</strong>");
      expect(out).toContain(">用語<");
      expect(out).toContain(yours);
      expect(renderAnswerBar(q, locale)).toContain(">解答<");
    }
  });
});

describe("key-term highlight (§0-25)", () => {
  it("splitTerms marks occurrences, longest first, and never changes the text", () => {
    const parts = splitTerms("RPA と RPAツール と XRPA", ["RPA", "RPAツール"]);
    expect(parts.map((p) => p.text).join("")).toBe("RPA と RPAツール と XRPA");
    expect(parts.filter((p) => p.term).map((p) => p.text)).toEqual(["RPA", "RPAツール"]);
    expect(splitTerms("abc", [])).toEqual([{ text: "abc", term: false }]);
    expect(splitTerms("", ["a"])).toEqual([]);
  });

  it("ASCII needles need word boundaries; CJK needles do not", () => {
    expect(splitTerms("SHIP IP", ["IP"]).filter((p) => p.term).map((p) => p.text)).toEqual(["IP"]);
    expect(splitTerms("販売促進策", ["販売促進"]).filter((p) => p.term)).toHaveLength(1);
  });

  it("pane: a carded term in the explanation is spot bold, text unchanged", () => {
    const q = QS.find((x) => x.terms.some((t) => x.explanation?.correct.jp.includes(t)))!;
    const term = q.terms.find((t) => q.explanation!.correct.jp.includes(t))!;
    const out = renderPane(q, "ja", wrongOf(q), { [term]: card(term) });
    const inner = fidOne(out, "expl-correct")!.inner;
    expect(inner).toMatch(new RegExp(`<strong class="[^"]*term[^"]*">${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</strong>`));
    expect(textOf(inner)).toBe(q.explanation!.correct.jp.trim());
    // a term without a dictionary card is not highlighted
    const plain = renderPane(q, "ja", wrongOf(q), {});
    expect(fidOne(plain, "expl-correct")!.inner).not.toContain("<strong");
  });
});

describe("AnswerBar — 解答栏「解答 問N [X]」", () => {
  it("shows the keyed answer letter for the source question number", () => {
    const q = byId("2024r06-q001");
    const out = renderAnswerBar(q, "ja");
    expect(out).toContain(">解答<");
    expect(out).toMatch(/問1/);
    expect(fidOne(out, "answer")!.inner).toBe(q.correct_answer);
    expect(renderAnswerBar(q, "en")).toContain(">解答<");
  });
});
