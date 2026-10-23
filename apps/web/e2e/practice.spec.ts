// Stage 7 Phase 1 Task 15 — the practice group (/[locale]/practice?ids=…, D-187 / D-189 §6.2).
// Supersedes quiz.spec.ts (the old QuizSet / QuizBrowser views are gone, Task 13).
//
//   1. One question per screen, answered by keyboard (1–4) and by click; Enter moves on (also with
//      the focus still on the clicked choice: an answered choice is aria-disabled, so Enter is not its
//      own activation); ← / → move; a reload restores the position and the answers without recording
//      them twice; 終了 / the last 「結果を見る」 → the summary (score, wrong list → /practice/q/<id>),
//      which survives a reload; 「間違えた問題だけもう一度」 opens a new group of the wrong ids only
//      (`&run=`); 「もう一度」 restarts the same group; 「今日に戻る」 → /ja. Every answer lands in
//      itp:learn:v2 (src practice), the v1 key is never written, no /api/learning request (non-owner).
//   2. Table choices (2022r04-q059, keyed エ): the table is beside the button, not in it; clicking a
//      table answers once. The result is ○ / × + sr-only text, never colour (DESIGN §1 / §3.1).
//   3. A figure question with a table stem (2009h21a-q054): a real <table> in the stem, the figure
//      image loads, the zoom <dialog> opens and Esc closes it; a digit key while it is open answers nothing.
//   4. 中問 (2010h22h-q089…q092): ?ids=<one member> brings the whole group in order; the first member
//      shows its stem whole, a later one folds the common preamble into a closed 「共通前文 ▸」 that opens.
//   5. zh: the translation toggle adds / removes the translated stem; settings.transDefault "shown" shows it
//      from the start.
//
// Fixture ids / keys come from data/ip/quiz/questions.json; strings from messages/*.json.
// No LLM call fires here (a guard routes api.anthropic.com and the afterEach asserts it stayed unused).

import { test, expect, type Locator, type Page } from "@playwright/test";

import ja from "../messages/ja.json";
import zh from "../messages/zh.json";
import { guardAnthropic } from "./helpers/fakeAnthropic";
import {
  fill,
  rawStored,
  recordWith,
  seedV2,
  storedAttempts,
  trackLearningRequests,
  V1_KEY,
} from "./helpers/learning";

const P = ja.Practice;

/** technology-14-36: keyed イ / ウ / イ; none is in a 中問 group. */
const A = "2009h21a-q054";
const B = "2010h22h-q085";
const C = "2011h23tokubetsu-q058";
const GROUP_URL = `/ja/practice?ids=${A},${B},${C}`;

const TABLE_CHOICE_QID = "2022r04-q059"; // keyed エ, 4 table choices, no figure
const CHUMON = ["2010h22h-q089", "2010h22h-q090", "2010h22h-q091", "2010h22h-q092"];

const session = (page: Page) => page.locator("main[data-session]");
const face = (page: Page) => session(page).locator("article");
const progress = (page: Page) => page.locator("[data-progress]");
const choiceItem = (page: Page, letter: string) => face(page).locator(`li[data-letter="${letter}"]`);
const choiceButton = (page: Page, letter: string) => choiceItem(page, letter).locator("button").first();

/** Press a digit until it is taken: keys are ignored until hydration + the session restore. */
async function pressToAnswer(page: Page, key: "1" | "2" | "3" | "4", letter: string): Promise<void> {
  await expect(async () => {
    await page.keyboard.press(key);
    await expect(choiceButton(page, letter)).toHaveAttribute("aria-pressed", "true", { timeout: 500 });
  }).toPass();
}

async function expectAnswered(page: Page, picked: string, keyed: string): Promise<void> {
  await expect(choiceButton(page, picked)).toHaveAttribute("aria-pressed", "true");
  await expect(choiceItem(page, keyed)).toHaveAttribute("data-state", "correct");
  if (picked !== keyed) await expect(choiceItem(page, picked)).toHaveAttribute("data-state", "picked-wrong");
  for (const l of ["ア", "イ", "ウ", "エ"]) await expect(choiceButton(page, l)).toHaveAttribute("aria-disabled", "true");
  await expect(session(page).locator('[data-fid="answer"]')).toHaveText(keyed); // 解答栏: the keyed letter
}

let unhandled: string[] = [];

test.beforeEach(async ({ page }) => {
  unhandled = await guardAnthropic(page);
});

test.afterEach(() => {
  expect(unhandled, "requests to api.anthropic.com").toEqual([]);
});

test("practice ja: keys 1–4 and clicks answer, Enter / ← / → move, reload restores, summary, retry wrong", async ({
  page,
}) => {
  const learning = trackLearningRequests(page);
  await page.goto(GROUP_URL);
  await expect(face(page)).toHaveAttribute("id", A);
  await expect(progress(page)).toHaveAttribute("data-progress", "1/3");
  await expect(session(page).locator('[data-fid="answer"]')).toHaveCount(0); // no 解答栏 before answering

  // A (keyed イ): key 1 = ア, wrong
  await pressToAnswer(page, "1", "ア");
  await expectAnswered(page, "ア", "イ");
  await expect(page.locator("[data-status]")).toHaveAttribute("data-status", "wrong");
  await expect(page.locator("[data-status]")).toHaveText(P.statusWrong);
  await page.keyboard.press("2"); // already answered: ignored
  await expect(choiceButton(page, "イ")).toHaveAttribute("aria-pressed", "false");

  // Enter → B, focus on its article
  await page.keyboard.press("Enter");
  await expect(face(page)).toHaveAttribute("id", B);
  await expect(progress(page)).toHaveAttribute("data-progress", "2/3");
  await expect(face(page)).toBeFocused();

  // B (keyed ウ): click ウ, correct; Enter with the focus on the clicked (now aria-disabled) choice moves on
  await choiceButton(page, "ウ").click();
  await expectAnswered(page, "ウ", "ウ");
  await expect(choiceButton(page, "ウ")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(face(page)).toHaveAttribute("id", C);

  // ← back to B shows its answer, → returns to C
  await page.keyboard.press("ArrowLeft");
  await expect(face(page)).toHaveAttribute("id", B);
  await expectAnswered(page, "ウ", "ウ");
  await page.keyboard.press("ArrowRight");
  await expect(face(page)).toHaveAttribute("id", C);
  await expect(choiceButton(page, "ア")).toHaveAttribute("aria-pressed", "false");

  await expect.poll(() => storedAttempts(page, B).then((l) => l.length)).toBe(1);

  // reload on C: position and answers restored, nothing recorded twice
  await page.reload();
  await expect(face(page)).toHaveAttribute("id", C);
  await expect(progress(page)).toHaveAttribute("data-progress", "3/3");
  await expect(async () => {
    await page.keyboard.press("ArrowLeft");
    await expect(face(page)).toHaveAttribute("id", B, { timeout: 500 });
  }).toPass();
  await expectAnswered(page, "ウ", "ウ");
  await page.keyboard.press("ArrowLeft");
  await expect(face(page)).toHaveAttribute("id", A);
  await expectAnswered(page, "ア", "イ");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(face(page)).toHaveAttribute("id", C);

  // C (keyed イ): key 4 = エ, wrong; Enter on the last question → the summary
  await pressToAnswer(page, "4", "エ");
  await expectAnswered(page, "エ", "イ");
  await expect(session(page).locator('[data-nav="next"]')).toHaveText(P.seeResults);
  await page.keyboard.press("Enter");

  const summary = page.locator("main[data-summary]");
  await expect(summary).toBeVisible();
  await expect(summary.getByRole("heading", { level: 1 })).toHaveText(P.summaryTitle);
  await expect(summary.getByRole("heading", { level: 1 })).toBeFocused();
  await expect(summary.locator("[data-score]")).toHaveAttribute("data-score", "1/3");
  await expect(summary.locator("[data-score]")).toHaveText(fill(P.score, { correct: 1, answered: 3 }));
  const wrongRows = summary.locator("[data-wrong]");
  await expect(wrongRows).toHaveCount(2);
  await expect(wrongRows.nth(0)).toHaveAttribute("data-wrong", A);
  await expect(wrongRows.nth(1)).toHaveAttribute("data-wrong", C);
  await expect(wrongRows.nth(0).getByRole("link")).toHaveAttribute("href", `/ja/practice/q/${A}`);
  await expect(summary.locator('[data-action="today"]')).toHaveAttribute("href", "/ja");
  await expect(summary.locator('[data-action="continue"]')).toHaveCount(0); // not from=today

  // the stored record: one attempt each, src practice; the v1 key is never written
  for (const [qid, choice, correct] of [
    [A, "ア", false],
    [B, "ウ", true],
    [C, "エ", false],
  ] as const) {
    const list = await storedAttempts(page, qid);
    expect(list, qid).toHaveLength(1);
    expect(list[0], qid).toMatchObject({ choice, correct, src: "practice" });
  }
  expect(await rawStored(page, V1_KEY)).toBeNull();

  // the summary survives a reload
  await page.reload();
  await expect(page.locator("main[data-summary] [data-score]")).toHaveAttribute("data-score", "1/3");

  // 「間違えた問題だけもう一度」 → a new group of A and C only
  const retry = page.locator('[data-action="retry"]');
  await expect(retry).toHaveText(P.retryWrong);
  await expect(retry).toHaveAttribute("href", new RegExp(`^/ja/practice\\?ids=${A},${C}&run=\\d+$`));
  await retry.click();
  await expect(page).toHaveURL(new RegExp(`/ja/practice\\?ids=${A},${C}&run=\\d+$`));
  await expect(face(page)).toHaveAttribute("id", A);
  await expect(progress(page)).toHaveAttribute("data-progress", "1/2");
  await expect(choiceButton(page, "ア")).toHaveAttribute("aria-pressed", "false"); // a fresh group

  // 終了 at once → the summary of nothing answered; 「もう一度」 restarts the same group
  await expect(async () => {
    await session(page).locator("[data-finish]").click();
    await expect(page.locator("main[data-summary]")).toBeVisible({ timeout: 500 });
  }).toPass();
  await expect(page.locator("[data-score]")).toHaveText(P.noneAnswered);
  await page.locator('[data-action="restart"]').click();
  await expect(face(page)).toHaveAttribute("id", A);
  await expect(progress(page)).toHaveAttribute("data-progress", "1/2");

  // 「今日に戻る」 from a summary
  await session(page).locator("[data-finish]").click();
  await page.locator('[data-action="today"]').click();
  await expect(page).toHaveURL(/\/ja$/);
  await expect(page.locator("main[data-today]")).toBeVisible();
  expect(learning).toEqual([]);
});

test("practice ja: table choices — the table is beside the button; clicking it answers once", async ({ page }) => {
  await page.goto(`/ja/practice?ids=${TABLE_CHOICE_QID}`);
  await expect(face(page)).toHaveAttribute("id", TABLE_CHOICE_QID);
  await expect(face(page).locator("button table")).toHaveCount(0);
  for (const letter of ["ア", "イ", "ウ", "エ"]) {
    const btn = face(page).getByRole("button", { name: fill(P.pickChoice, { letter }), exact: true });
    await expect(btn).toHaveCount(1);
    await expect(btn).toHaveAttribute("aria-describedby", `${TABLE_CHOICE_QID}-choice-${letter}`);
    await expect(face(page).locator(`[id="${TABLE_CHOICE_QID}-choice-${letter}"] table`).first()).toBeVisible();
  }

  // a click on ア's table answers (wrong); エ is marked as the key
  await expect(async () => {
    await face(page).locator(`[id="${TABLE_CHOICE_QID}-choice-ア"] table`).first().click();
    await expect(choiceButton(page, "ア")).toHaveAttribute("aria-pressed", "true", { timeout: 500 });
  }).toPass();
  await expectAnswered(page, "ア", "エ");
  await expect(choiceButton(page, "ア").locator(".sr-only", { hasText: P.markYourWrong })).toHaveCount(1);
  await expect(choiceButton(page, "エ").locator(".sr-only", { hasText: P.markCorrect })).toHaveCount(1);
  await expect(face(page).locator('[aria-pressed="true"]')).toHaveCount(1);

  // a further click on another table changes nothing
  await face(page).locator(`[id="${TABLE_CHOICE_QID}-choice-エ"] table`).first().click();
  await expect(choiceButton(page, "エ")).toHaveAttribute("aria-pressed", "false");
  await expect.poll(() => storedAttempts(page, TABLE_CHOICE_QID).then((l) => l.length)).toBe(1);
  expect((await storedAttempts(page, TABLE_CHOICE_QID))[0]).toMatchObject({ choice: "ア", correct: false });
});

test("practice ja: a figure question with a table stem — table, figure image, zoom dialog", async ({ page }) => {
  const figure = page.waitForResponse((r) => r.url().endsWith(`/quiz-figures/${A}.webp`));
  await page.goto(`/ja/practice?ids=${A}`);
  await expect(face(page)).toHaveAttribute("id", A);
  const stemTable = face(page).locator('[data-fid="stem"] table');
  await expect(stemTable).toHaveCount(1);
  await expect(stemTable.locator("thead th")).toHaveCount(2);
  await expect(stemTable.locator("tbody tr")).toHaveCount(4);

  const img = face(page).locator('img[data-fid="figure"]');
  await expect(img).toBeVisible();
  expect((await figure).status()).toBe(200);
  await expect.poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);

  const zoom = face(page).getByRole("button", { name: P.zoomFigure });
  await expect(async () => {
    await zoom.click();
    await expect(face(page).locator("dialog[open]")).toHaveCount(1, { timeout: 500 });
  }).toPass();
  await expect(face(page).locator("dialog[open] img")).toBeVisible();
  await page.keyboard.press("1"); // the dialog is open: no answer
  await page.keyboard.press("Escape");
  await expect(face(page).locator("dialog[open]")).toHaveCount(0);
  await expect(choiceButton(page, "ア")).toHaveAttribute("aria-pressed", "false");
  expect(await storedAttempts(page, A)).toEqual([]);
});

test("practice ja: one 中問 member brings its whole group; later members fold the common preamble", async ({ page }) => {
  await page.goto(`/ja/practice?ids=${CHUMON[1]}`);
  await expect(progress(page)).toHaveAttribute("data-progress", `1/${CHUMON.length}`);
  await expect(face(page)).toHaveAttribute("id", CHUMON[0]!);
  // the first member: the stem whole, no fold
  await expect(face(page).locator("details")).toHaveCount(0);
  const firstStem = (await face(page).locator('[data-fid="stem"]').innerText()).trim();

  for (let i = 1; i < CHUMON.length; i++) {
    await expect(async () => {
      await page.keyboard.press("ArrowRight");
      await expect(face(page)).toHaveAttribute("id", CHUMON[i]!, { timeout: 500 });
    }).toPass();
    const fold = face(page).locator("details");
    await expect(fold).toHaveCount(1);
    await expect(fold).not.toHaveAttribute("open");
    await expect(fold.locator("summary")).toHaveText(P.preamble);
    const preamble = fold.locator('[data-fid="stem-preamble"]');
    await expect(preamble).toBeHidden();
    await fold.locator("summary").click();
    await expect(fold).toHaveAttribute("open", "");
    await expect(preamble).toBeVisible();
    // the folded text is the common preamble the first member opens with (nothing dropped)
    const text = (await preamble.innerText()).trim();
    expect(text.length).toBeGreaterThan(20);
    expect(firstStem.replace(/\s/g, "")).toContain(text.replace(/\s/g, ""));
    await expect(face(page).locator('[data-fid="stem"]')).toBeVisible();
  }
});

const ZH = zh.Practice;

async function translationToggle(page: Page): Promise<Locator> {
  const toggle = face(page).locator("[data-translation-toggle]");
  await expect(toggle).toHaveCount(1);
  return toggle;
}

test("practice zh: the translation toggle adds and removes the translated stem", async ({ page }) => {
  await page.goto(`/zh/practice?ids=${B}`);
  await expect(face(page)).toHaveAttribute("id", B);
  const toggle = await translationToggle(page);
  await expect(toggle).toHaveText(ZH.showTranslation);
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(face(page).locator('[data-fid="stem-tr"]')).toHaveCount(0);
  await expect(face(page).locator('[data-fid="stem"]')).toHaveAttribute("lang", "ja"); // JP stem by default

  await expect(async () => {
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true", { timeout: 500 });
  }).toPass();
  await expect(toggle).toHaveText(ZH.hideTranslation);
  const tr = face(page).locator('[data-fid="stem-tr"]');
  await expect(tr).toBeVisible();
  await expect(tr).toHaveAttribute("lang", /^zh/);
  expect((await tr.innerText()).trim().length).toBeGreaterThan(0);
  await expect(face(page).locator('[data-fid^="choice-tr-"]')).toHaveCount(4);

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(face(page).locator('[data-fid="stem-tr"]')).toHaveCount(0);
});

test("practice zh: settings.transDefault 'shown' shows the translation from the start", async ({ page }) => {
  await seedV2(page, recordWith({ settings: { transDefault: { value: "shown", at: 1_000 } } }));
  await page.goto(`/zh/practice?ids=${B}`);
  const toggle = await translationToggle(page);
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(face(page).locator('[data-fid="stem-tr"]')).toBeVisible();
});
