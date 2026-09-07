// Quiz surface happy-path E2E — rewritten in Session 117 for the D-134/D-135
// past-exam surface. **Supersedes the Session 48 version**, which drove the
// D-085-era `<QuizList />` scope cards + `?qid=` `<QuizExplain />` modal; those
// components were deleted in S117 stage 4 and the only live quiz surface is now
// `/[locale]/quiz` → `<QuizBrowser />` (landing) / `<QuizSet />` (one set).
//
// 3 tests (ja / zh / en) verify:
//   - `/{locale}/quiz` (no params) loads through D-099 i18n routing and renders
//     the localized landing: `Quiz.title` <h1> + 分野別 / 年度別 <h2> sections.
//   - `/{locale}/quiz?mode=topic&id=…` renders that topic's set: the <h1> is the
//     JP topic name (JP-first per D-135 — identical across all 3 locales), the
//     `Quiz.count` line matches, and every question card carries exactly the
//     4 canonical choices ア/イ/ウ/エ.
//   - D-144 段 1: a stem holding a markdown 表 renders a real <table> (2 header
//     cells + 4 body rows) rather than raw pipe text — in all 3 locales, since
//     the translated stems keep the same table shape.
//   - Reveal: clicking `Quiz.showAnswer` swaps the button for the answer line
//     (`Quiz.correctLabel` + the keyed letter) plus the D-137 explanation block.
//
// There is no per-choice selection on this surface: choices are static <li>s and
// reveal is local `useState`. No LLM call fires here, so — unlike the Session 48
// version, which streamed deepseek-reasoner on modal mount — this spec costs
// nothing per run and is safe to repeat.
//
// Fixture set: `technology-14-36` (データ構造, 7 問) — the smallest topic that
// still contains a table-stem question, and its first card (`2009h21a-q054`,
// keyed イ) is the table one. Values come from data/ip/quiz/quiz_index.json +
// questions.json; i18n strings are read from apps/web/messages/*.json so the
// spec cannot drift from the catalogs.
//
// Base URL: playwright.config.ts defaults to the prod canonical alias with
// D-097 Basic Auth injected; `PLAYWRIGHT_BASE_URL` overrides it for a local run
// (e.g. `PLAYWRIGHT_BASE_URL=http://localhost:3100 pnpm exec playwright test`).

import { test, expect, type Page } from "@playwright/test";

import en from "../messages/en.json";
import ja from "../messages/ja.json";
import zh from "../messages/zh.json";

/** The subset of the `Quiz` namespace this spec asserts on. */
interface QuizMessages {
  title: string;
  byTopicTitle: string;
  byExamTitle: string;
  count: string;
  backToList: string;
  showAnswer: string;
  correctLabel: string;
  explanationTitle: string;
}

interface LocaleFixture {
  locale: "ja" | "zh" | "en";
  m: QuizMessages;
}

const LOCALES: readonly LocaleFixture[] = [
  { locale: "ja", m: ja.Quiz },
  { locale: "zh", m: zh.Quiz },
  { locale: "en", m: en.Quiz },
];

/** quiz_index.json → topics[topic_id="technology-14-36"] */
const TOPIC_ID = "technology-14-36";
const TOPIC_NAME_JP = "データ構造"; // name_jp — stays JP in every locale (D-135 / OQ-03)
const TOPIC_QUESTION_COUNT = 7;

/** questions.json → 2009h21a-q054: first card of that topic, markdown 表 in the stem. */
const TABLE_HEADER_CELLS = 2;
const TABLE_BODY_ROWS = 4;
const TABLE_ANSWER_LETTER = "イ";

const CHOICE_LETTERS = ["ア", "イ", "ウ", "エ"] as const;

/** Minimal ICU stand-in — the catalogs only use simple `{name}` placeholders here. */
function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}

for (const f of LOCALES) {
  test(`quiz ${f.locale}: landing + topic set + table stem + reveal`, async ({
    page,
  }: { page: Page }) => {
    // ── landing (<QuizBrowser />) ────────────────────────────────────────────
    await page.goto(`/${f.locale}/quiz`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(f.m.title);
    await expect(
      page.getByRole("heading", { level: 2, name: f.m.byTopicTitle }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: f.m.byExamTitle }),
    ).toBeVisible();

    // ── one topic set (<QuizSet />) ──────────────────────────────────────────
    await page.goto(`/${f.locale}/quiz?mode=topic&id=${TOPIC_ID}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(TOPIC_NAME_JP);
    await expect(page.getByRole("link", { name: f.m.backToList })).toBeVisible();
    await expect(
      page.getByText(fill(f.m.count, { n: TOPIC_QUESTION_COUNT })).first(),
    ).toBeVisible();

    const cards = page.getByRole("article");
    await expect(cards).toHaveCount(TOPIC_QUESTION_COUNT);

    // Every card renders the 4 canonical choices (pre-reveal, so the only <li>s
    // on a card are its choices — the explanation lists appear after reveal).
    for (let i = 0; i < TOPIC_QUESTION_COUNT; i += 1) {
      await expect(cards.nth(i).getByRole("listitem")).toHaveCount(
        CHOICE_LETTERS.length,
      );
    }
    const firstCard = cards.first();
    for (const letter of CHOICE_LETTERS) {
      await expect(firstCard.getByText(letter, { exact: true }).first()).toBeVisible();
    }

    // ── D-144 段 1: the markdown 表 in the stem is a real <table> ─────────────
    const stemTable = firstCard.locator("table");
    await expect(stemTable).toHaveCount(1);
    await expect(stemTable.locator("thead th")).toHaveCount(TABLE_HEADER_CELLS);
    await expect(stemTable.locator("tbody tr")).toHaveCount(TABLE_BODY_ROWS);

    // ── reveal ───────────────────────────────────────────────────────────────
    const revealBtn = firstCard.getByRole("button", { name: f.m.showAnswer });
    await expect(revealBtn).toBeVisible();
    await revealBtn.click();

    await expect(
      firstCard.getByText(`${f.m.correctLabel}: ${TABLE_ANSWER_LETTER}`),
    ).toBeVisible();
    // D-137 explanation sidecar is present for this exam, so the block renders.
    await expect(firstCard.getByText(f.m.explanationTitle).first()).toBeVisible();
    // The button is replaced, not merely hidden.
    await expect(revealBtn).toHaveCount(0);
  });
}
