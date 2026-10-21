// Stage 6 (D-179 / D-180 §0-3) Task 7 — question anchors + term chips on QuizSet.
// Task 11 (D-180 §0-5): choices are buttons (click = answer); QuizSet needs a LearningRecordProvider.
// Same SSR approach as QuizFeedback.ssr.test.ts (node env, renderToStaticMarkup,
// createElement instead of JSX, real questions.json + message catalogs).
import { describe, expect, it, vi } from "vitest";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider, useTranslations } from "next-intl";
import { readFileSync } from "node:fs";
import path from "node:path";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) =>
    h("a", { href, className }, children),
}));

import { ChoiceMark, QuizSet } from "../QuizSet";
import { LearningRecordProvider } from "@/hooks/useLearningRecord";
import type { TermCard } from "@/lib/glossary/dictionary";
import type { QuizQuestion } from "@/lib/quiz/quizModel";

const ROOT = path.resolve(__dirname, "../../../../../..");
const Q = JSON.parse(readFileSync(path.join(ROOT, "data/ip/quiz/questions.json"), "utf-8"))
  .questions as QuizQuestion[];
const QUESTION = Q.find((q) => q.id === "2024r06-q001")!;

const CARD: TermCard = {
  id: "t0123456789abcdef",
  term: "RPA",
  gloss: "RPA",
  definition: "def",
  memoryHook: "hook",
  senseCount: 1,
  questionCount: 1,
};

const messagesFor = (locale: string) =>
  JSON.parse(readFileSync(path.resolve(__dirname, `../../../../messages/${locale}.json`), "utf-8"));

function render(termCards: Record<string, TermCard>, question: QuizQuestion = QUESTION, locale = "ja"): string {
  return renderToStaticMarkup(
    h(NextIntlClientProvider, {
      locale,
      messages: messagesFor(locale),
      children: h(LearningRecordProvider, {
        isOwner: false,
        children: h(QuizSet, { locale, label: "L", sublabel: "S", questions: [question], termCards }),
      }),
    }),
  );
}

describe("QuizSet anchors + term chips (SSR)", () => {
  it("fixture question carries the expected terms", () => {
    expect(QUESTION.terms).toEqual(["ダイレクトマーケティング", "販売促進", "RPA"]);
  });

  it("renders each question as <article id={question id}>", () => {
    expect(render({})).toMatch(/<article[^>]*id="2024r06-q001"/);
  });

  it("terms with a card become chip buttons; the rest stay plain text", () => {
    const out = render({ RPA: CARD });
    expect((out.match(/aria-expanded="false"/g) ?? []).length).toBe(1);
    expect(out).toMatch(/<button[^>]*aria-expanded="false"[^>]*>RPA<\/button>/);
    expect(out).toContain("ダイレクトマーケティング");
    expect(out).toContain("販売促進");
  });

  it("adjacent card-less terms are separated by spaces + a visible dot; chips are not", () => {
    const sep = ' <span aria-hidden="true">·</span> ';
    const none = render({});
    expect(none).toContain(`ダイレクトマーケティング</span>${sep}<span`);
    expect(none).toContain(`販売促進</span>${sep}<span`);
    expect(none.split(sep).length - 1).toBe(2);

    // RPA has a card: only the pair of plain-text terms gets a separator.
    const one = render({ RPA: CARD });
    expect(one.split(sep).length - 1).toBe(1);
    expect(one).toContain(`ダイレクトマーケティング</span>${sep}<span`);
    expect(one).not.toMatch(/·<\/span> <span[^>]*><button/);
  });

  it("no cards: every term is plain text", () => {
    const out = render({});
    expect(out).not.toContain("aria-expanded");
    expect(out).toContain("RPA");
  });
});

describe("QuizSet choices are answer buttons (SSR, D-180 §0-5)", () => {
  it("each of the 4 choices is an enabled <button type=button aria-pressed=false> inside its <li>", () => {
    const out = render({});
    const choiceButtons = out.match(/<li><button type="button"[^>]*aria-pressed="false"[^>]*>/g) ?? [];
    expect(choiceButtons).toHaveLength(4);
    for (const b of choiceButtons) {
      // aria-disabled (not the disabled attribute) after reveal keeps focus + tab order
      expect(b).toContain('aria-disabled="false"');
      expect(b).not.toMatch(/\sdisabled(=|\s|>)/);
    }
    for (const letter of ["ア", "イ", "ウ", "エ"]) {
      expect(out).toMatch(new RegExp(`aria-pressed="false"[^>]*><span[^>]*>${letter}</span>`));
    }
  });

  it("before any answer nothing is marked correct and the reveal button is still there", () => {
    const out = render({});
    expect(out).not.toContain(`aria-pressed="true"`);
    expect(out).toContain("解答を表示");
    expect(out).not.toContain("正解:");
  });

  it("throws a clear error when rendered outside LearningRecordProvider", () => {
    const messages = JSON.parse(readFileSync(path.resolve(__dirname, "../../../../messages/ja.json"), "utf-8"));
    expect(() =>
      renderToStaticMarkup(
        h(NextIntlClientProvider, {
          locale: "ja",
          messages,
          children: h(QuizSet, { locale: "ja", label: "L", sublabel: "S", questions: [QUESTION], termCards: {} }),
        }),
      ),
    ).toThrow(/LearningRecordProvider/);
  });
});

/** questions.json: choices are "table" (2022r04-q059) / "tables" (2009h21a-q100) kinds — 18 such questions. */
const TABLE_Q = Q.find((q) => q.id === "2022r04-q059")!;
const TABLES_Q = Q.find((q) => q.id === "2009h21a-q100")!;

describe("QuizSet table choices: the table is a sibling of the button (SSR)", () => {
  for (const [question, locale, label] of [
    [TABLE_Q, "ja", "アを選ぶ"],
    [TABLES_Q, "ja", "アを選ぶ"],
    [TABLE_Q, "zh", "选择 ア"],
    [TABLE_Q, "en", "Choose ア"],
  ] as const) {
    it(`${question.id} (${locale}): no <table> inside any <button>; aria-describedby → the table`, () => {
      const out = render({}, question, locale);
      const buttons = out.match(/<button[^>]*>[\s\S]*?<\/button>/g) ?? [];
      expect(buttons.length).toBeGreaterThanOrEqual(5); // 4 choices + 「解答を表示」
      for (const b of buttons) {
        expect(b).not.toContain("<table");
        expect(b).not.toContain("<div");
      }
      expect((out.match(/<table/g) ?? []).length).toBeGreaterThanOrEqual(4);

      const items = out.match(/<li class="[^"]*choiceTableItem[^"]*">[\s\S]*?<\/li>/g) ?? [];
      expect(items).toHaveLength(4);
      for (const [i, letter] of ["ア", "イ", "ウ", "エ"].entries()) {
        const li = items[i]!;
        const describedby = /<button [^>]*aria-describedby="([^"]+)"/.exec(li)?.[1];
        expect(describedby).toBe(`${question.id}-choice-${letter}`);
        // the id resolves to exactly one element on the page, and it holds the table(s)
        expect(out.split(`id="${describedby}"`).length - 1).toBe(1);
        expect(li).toMatch(new RegExp(`id="${describedby}"[^>]*>[\\s\\S]*<table`));
        // button first in the <li>: letter (aria-hidden) + sr-only label, nothing else yet
        expect(li).toMatch(
          new RegExp(
            `^<li[^>]*><button type="button"[^>]*aria-pressed="false"[^>]*><span[^>]*aria-hidden="true">${letter}</span>` +
              `<span class="sr-only">${label.replace("ア", letter)}</span></button>`,
          ),
        );
      }
    });
  }

  it("ordinary (non-table) choices are unchanged: body inside the button, no describedby", () => {
    const out = render({});
    expect(out).not.toContain("aria-describedby");
    expect(out).not.toContain("choiceTableItem");
  });
});

describe("QuizSet answer feedback is not color-only (SSR)", () => {
  it("the answer line is an always-mounted aria-live=polite region (empty before reveal)", () => {
    const out = render({});
    expect(out).toContain('<p aria-live="polite"></p>');
    expect((out.match(/aria-live=/g) ?? []).length).toBe(1);
  });

  for (const [locale, right, wrong] of [
    ["ja", "正解", "不正解"],
    ["zh", "正确", "错误"],
    ["en", "Correct", "Incorrect"],
  ] as const) {
    it(`ChoiceMark (${locale}): visible ✓ / ✗ (aria-hidden) + sr-only result text`, () => {
      function Mark({ correct }: { correct: boolean }): React.ReactElement {
        return h(ChoiceMark, { correct, t: useTranslations("Quiz") });
      }
      const mark = (correct: boolean) =>
        renderToStaticMarkup(
          h(NextIntlClientProvider, { locale, messages: messagesFor(locale), children: h(Mark, { correct }) }),
        );
      expect(mark(true)).toMatch(
        new RegExp(`^<span class="[^"]*choiceMark[^"]*"><span aria-hidden="true">✓</span><span class="sr-only">${right}</span></span>$`),
      );
      expect(mark(false)).toMatch(
        new RegExp(`^<span class="[^"]*choiceMark[^"]*"><span aria-hidden="true">✗</span><span class="sr-only">${wrong}</span></span>$`),
      );
    });
  }
});
