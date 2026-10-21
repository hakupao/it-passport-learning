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
// D-180 §0-5 (Task 11): each choice is a <button> inside its <li>. Clicking one
// answers the question (reveal + aria-pressed on the pick + saved to localStorage
// `itp:learn:v1`); 「解答を表示」 only reveals and records nothing. The answer
// test runs as a non-owner (it never visits `?owner_key=`), so no
// /api/learning request may fire. No LLM call fires here, so — unlike the
// Session 48 version, which streamed deepseek-reasoner on modal mount — this
// spec costs nothing per run and is safe to repeat.
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
  pickChoice: string;
  resultCorrect: string;
  resultWrong: string;
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
const TABLE_QUESTION_ID = "2009h21a-q054";
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

test("quiz ja: clicking a choice answers, marks it and saves it locally", async ({
  page,
}: { page: Page }) => {
  const m = ja.Quiz;
  const learningRequests: string[] = [];
  page.on("request", (r) => {
    if (new URL(r.url()).pathname.startsWith("/api/learning")) learningRequests.push(r.url());
  });
  const stored = () => page.evaluate(() => localStorage.getItem("itp:learn:v1"));

  await page.goto(`/ja/quiz?mode=topic&id=${TOPIC_ID}`);
  const cards = page.getByRole("article");
  await expect(cards).toHaveCount(TOPIC_QUESTION_COUNT);
  const firstCard = page.locator(`article[id="${TABLE_QUESTION_ID}"]`);
  await expect(firstCard).toHaveCount(1);

  const choiceButtons = firstCard.getByRole("listitem").getByRole("button");
  await expect(choiceButtons).toHaveCount(CHOICE_LETTERS.length);
  for (let i = 0; i < CHOICE_LETTERS.length; i += 1) {
    await expect(choiceButtons.nth(i)).toHaveAttribute("aria-pressed", "false");
    await expect(choiceButtons.nth(i)).toBeEnabled();
  }

  // ア is wrong (keyed イ): click it → answer line + explanation, ア marked.
  const pick = choiceButtons.nth(0);
  await expect(pick).toContainText("ア");
  await pick.click();
  await expect(firstCard.getByText(`${m.correctLabel}: ${TABLE_ANSWER_LETTER}`)).toBeVisible();
  await expect(firstCard.getByText(m.explanationTitle).first()).toBeVisible();
  await expect(firstCard.getByRole("button", { name: m.showAnswer })).toHaveCount(0);
  await expect(pick).toHaveAttribute("aria-pressed", "true");
  for (let i = 1; i < CHOICE_LETTERS.length; i += 1) {
    await expect(choiceButtons.nth(i)).toHaveAttribute("aria-pressed", "false");
  }
  // After the answer every choice is inert via aria-disabled: focus stays on the
  // pick (not dropped to <body>) and a further click changes nothing.
  await expect(pick).toBeFocused();
  for (let i = 0; i < CHOICE_LETTERS.length; i += 1) {
    await expect(choiceButtons.nth(i)).toHaveAttribute("aria-disabled", "true");
  }
  // Playwright treats aria-disabled as not actionable; force the click to hit the guard.
  await choiceButtons.nth(2).click({ force: true });
  await expect(choiceButtons.nth(2)).toHaveAttribute("aria-pressed", "false");
  await expect(pick).toHaveAttribute("aria-pressed", "true");

  // 「解答を表示」 on another card reveals without recording.
  const secondCard = cards.nth(1);
  const secondId = await secondCard.getAttribute("id");
  expect(secondId).toBeTruthy();
  await secondCard.getByRole("button", { name: m.showAnswer }).click();
  await expect(secondCard.getByText(`${m.correctLabel}:`, { exact: false })).toBeVisible();

  // Keyboard: Enter on a focused choice of the third card answers it.
  const thirdCard = cards.nth(2);
  const thirdId = await thirdCard.getAttribute("id");
  const kbPick = thirdCard.getByRole("listitem").getByRole("button").nth(1);
  await kbPick.focus();
  await page.keyboard.press("Enter");
  await expect(kbPick).toHaveAttribute("aria-pressed", "true");
  await expect(kbPick).toHaveAttribute("aria-disabled", "true");
  await expect(kbPick).toBeFocused();
  await expect(thirdCard.getByText(`${m.correctLabel}:`, { exact: false })).toBeVisible();

  // Saved in a passive effect after paint — poll rather than read once.
  await expect.poll(stored).toContain(TABLE_QUESTION_ID);
  await expect.poll(stored).toContain(thirdId!);

  await page.reload();
  await expect(page.getByRole("article")).toHaveCount(TOPIC_QUESTION_COUNT);
  const raw = await stored();
  expect(raw).not.toBeNull();
  const rec = JSON.parse(raw!) as { v: number; questions: Record<string, { choice: string; correct: boolean; at: number }> };
  expect(rec.v).toBe(1);
  expect(rec.questions[TABLE_QUESTION_ID]).toMatchObject({ choice: "ア", correct: false });
  expect(rec.questions[secondId!]).toBeUndefined();
  expect(rec.questions[thirdId!]).toMatchObject({ choice: "イ" });
  expect(learningRequests).toEqual([]);
});

test("quiz ja: two open tabs never drop each other's answers", async ({ context }) => {
  const url = `/ja/quiz?mode=topic&id=${TOPIC_ID}`;
  const a = await context.newPage();
  const b = await context.newPage();
  await a.goto(url);
  await b.goto(url); // both tabs loaded before any answer
  await expect(a.getByRole("article")).toHaveCount(TOPIC_QUESTION_COUNT);
  await expect(b.getByRole("article")).toHaveCount(TOPIC_QUESTION_COUNT);
  const stored = () => a.evaluate(() => localStorage.getItem("itp:learn:v1"));

  const idA = await a.getByRole("article").nth(0).getAttribute("id");
  const idB = await b.getByRole("article").nth(1).getAttribute("id");
  await a.getByRole("article").nth(0).getByRole("listitem").getByRole("button").first().click();
  await expect.poll(stored).toContain(idA!);
  await b.getByRole("article").nth(1).getByRole("listitem").getByRole("button").first().click();
  await expect.poll(stored).toContain(idB!);
  // B saved after A: A's answer must still be there.
  expect(await stored()).toContain(idA!);

  await a.reload();
  await expect(a.getByRole("article")).toHaveCount(TOPIC_QUESTION_COUNT);
  const rec = JSON.parse((await stored())!) as { questions: Record<string, unknown> };
  expect(Object.keys(rec.questions).sort()).toEqual([idA!, idB!].sort());
});

// Phase 3 fix wave item 1 — table choices (ChoiceBody kind "table"): the table
// is a sibling of the choice button, not inside it. questions.json →
// 2022r04-q059 (topic technology-13-34, keyed エ, no figure) has 4 table choices.
const TABLE_CHOICE_TOPIC = "technology-13-34";
const TABLE_CHOICE_QID = "2022r04-q059";
const TABLE_CHOICE_ANSWER = "エ";

test("quiz ja: table choices — table outside the button, answered via the button", async ({
  page,
}: { page: Page }) => {
  const m = ja.Quiz;
  const stored = () => page.evaluate(() => localStorage.getItem("itp:learn:v1"));
  await page.goto(`/ja/quiz?mode=topic&id=${TABLE_CHOICE_TOPIC}`);
  const card = page.locator(`article[id="${TABLE_CHOICE_QID}"]`);
  await expect(card).toHaveCount(1);

  const items = card.getByRole("list").first().getByRole("listitem");
  await expect(items).toHaveCount(CHOICE_LETTERS.length);
  await expect(card.locator("button table")).toHaveCount(0);
  for (const letter of CHOICE_LETTERS) {
    const btn = card.getByRole("button", { name: fill(m.pickChoice, { letter }), exact: true });
    await expect(btn).toHaveCount(1);
    const describedby = await btn.getAttribute("aria-describedby");
    expect(describedby).toBe(`${TABLE_CHOICE_QID}-choice-${letter}`);
    await expect(card.locator(`[id="${describedby}"] table`).first()).toBeVisible();
  }

  const pick = card.getByRole("button", { name: fill(m.pickChoice, { letter: TABLE_CHOICE_ANSWER }) });
  await pick.click();
  await expect(pick).toHaveAttribute("aria-pressed", "true");
  await expect(pick).toHaveAttribute("aria-disabled", "true");
  await expect(pick).toContainText("✓");
  await expect(pick.locator(".sr-only", { hasText: m.resultCorrect })).toHaveCount(1);
  const answerLine = card.locator('p[aria-live="polite"]');
  await expect(answerLine).toHaveText(`${m.correctLabel}: ${TABLE_CHOICE_ANSWER}`);
  await expect.poll(stored).toContain(TABLE_CHOICE_QID);
  const rec = JSON.parse((await stored())!) as { questions: Record<string, { choice: string; correct: boolean }> };
  expect(rec.questions[TABLE_CHOICE_QID]).toMatchObject({ choice: TABLE_CHOICE_ANSWER, correct: true });

  // After the answer, clicking another choice's table changes nothing.
  await card.locator(`[id="${TABLE_CHOICE_QID}-choice-ア"]`).click();
  await expect(card.getByRole("button", { name: fill(m.pickChoice, { letter: "ア" }) })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
});

test("quiz ja: clicking a table choice's table answers it once (wrong → ✗)", async ({
  page,
}: { page: Page }) => {
  const m = ja.Quiz;
  await page.goto(`/ja/quiz?mode=topic&id=${TABLE_CHOICE_TOPIC}`);
  const card = page.locator(`article[id="${TABLE_CHOICE_QID}"]`);
  await card.locator(`[id="${TABLE_CHOICE_QID}-choice-ア"] table`).first().click();
  const btn = card.getByRole("button", { name: fill(m.pickChoice, { letter: "ア" }) });
  await expect(btn).toHaveAttribute("aria-pressed", "true");
  await expect(btn).toContainText("✗");
  await expect(btn.locator(".sr-only", { hasText: m.resultWrong })).toHaveCount(1);
  await expect(card.locator('p[aria-live="polite"]')).toHaveText(`${m.correctLabel}: ${TABLE_CHOICE_ANSWER}`);
  await expect(card.locator('[aria-pressed="true"]')).toHaveCount(1);
});
