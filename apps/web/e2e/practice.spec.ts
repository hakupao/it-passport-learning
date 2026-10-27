// Stage 7 Phase 1 Task 15 — the practice group (/[locale]/practice?ids=…, D-187 / D-189 §6.2).
// Supersedes quiz.spec.ts (the old QuizSet / QuizBrowser views are gone, Task 13).
//
//   1. One question per screen, answered by keyboard (1 / 3 / 4) and by click; Enter moves on (also with
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
//   6. en smoke: the face and the explanation render with the book labels (問 / 解説 / 解答) in Japanese.
//   7. The single-question page /practice/q/<qid> is a reference view: clicks and keys record nothing.
//   8. OQ-13 / D-194 one column (1440 × 1000): a text-choice question (2023r05-q086, keyed ア, a former
//      row4 set) has its choices one per line; answering brings the explanation into view under the
//      choices at the face's width — the heading about mid-viewport, the choices still in view above it
//      (also instant with prefers-reduced-motion); a choice_figures question (2022r04-q032) keeps 2 × 2.
//
// Fixture ids / keys come from data/ip/quiz/questions.json; strings from messages/*.json.
// No LLM call fires here (a guard routes api.anthropic.com and the afterEach asserts it stayed unused).

import { test, expect, type Locator, type Page } from "@playwright/test";

import ja from "../messages/ja.json";
import zh from "../messages/zh.json";
import { guardAnthropic } from "./helpers/fakeAnthropic";
import en from "../messages/en.json";
import {
  choiceButton,
  fill,
  rawStored,
  recordWith,
  seedV2,
  storedAttempts,
  trackLearningRequests,
  V1_KEY,
  waitForRecord,
} from "./helpers/learning";

const P = ja.Practice;

/** technology-14-36: keyed イ / ウ / イ / エ; none is in a 中問 group. */
const A = "2009h21a-q054";
const B = "2010h22h-q085";
const C = "2011h23tokubetsu-q058";
const D = "2016h28a-q092";
const GROUP_URL = `/ja/practice?ids=${A},${B},${C},${D}`;

const TABLE_CHOICE_QID = "2022r04-q059"; // keyed エ, 4 table choices, no figure
const CHUMON = ["2010h22h-q089", "2010h22h-q090", "2010h22h-q091", "2010h22h-q092"];

const session = (page: Page) => page.locator("main[data-session]");
const face = (page: Page) => session(page).locator("article");
const progress = (page: Page) => page.locator("[data-progress]");
const choiceItem = (page: Page, letter: string) => face(page).locator(`li[data-letter="${letter}"]`);

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

test("practice ja: keys 1 / 3 / 4 and clicks answer, Enter / ← / → move, reload restores, summary, retry wrong", async ({
  page,
}) => {
  const learning = trackLearningRequests(page);
  await page.goto(GROUP_URL);
  await expect(face(page)).toHaveAttribute("id", A);
  await expect(progress(page)).toHaveAttribute("data-progress", "1/4");
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
  await expect(progress(page)).toHaveAttribute("data-progress", "2/4");
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
  await expect(progress(page)).toHaveAttribute("data-progress", "3/4");
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

  // C (keyed イ): key 4 = エ, wrong; Enter → D
  await pressToAnswer(page, "4", "エ");
  await expectAnswered(page, "エ", "イ");
  await expect(session(page).locator('[data-nav="next"]')).toHaveText(P.next);
  await page.keyboard.press("Enter");
  await expect(face(page)).toHaveAttribute("id", D);
  await expect(progress(page)).toHaveAttribute("data-progress", "4/4");

  // D (keyed エ): key 3 = ウ, wrong; Enter on the last question → the summary
  await pressToAnswer(page, "3", "ウ");
  await expectAnswered(page, "ウ", "エ");
  await expect(session(page).locator('[data-nav="next"]')).toHaveText(P.seeResults);
  await page.keyboard.press("Enter");

  const summary = page.locator("main[data-summary]");
  await expect(summary).toBeVisible();
  await expect(summary.getByRole("heading", { level: 1 })).toHaveText(P.summaryTitle);
  await expect(summary.getByRole("heading", { level: 1 })).toBeFocused();
  await expect(summary.locator("[data-score]")).toHaveAttribute("data-score", "1/4");
  await expect(summary.locator("[data-score]")).toHaveText(fill(P.score, { correct: 1, answered: 4 }));
  const wrongRows = summary.locator("[data-wrong]");
  await expect(wrongRows).toHaveCount(3);
  await expect(wrongRows.nth(0)).toHaveAttribute("data-wrong", A);
  await expect(wrongRows.nth(1)).toHaveAttribute("data-wrong", C);
  await expect(wrongRows.nth(2)).toHaveAttribute("data-wrong", D);
  await expect(wrongRows.nth(0).getByRole("link")).toHaveAttribute("href", `/ja/practice/q/${A}`);
  await expect(summary.locator('[data-action="today"]')).toHaveAttribute("href", "/ja");
  await expect(summary.locator('[data-action="continue"]')).toHaveCount(0); // not from=today

  // the stored record: one attempt each, src practice; the v1 key is never written
  for (const [qid, choice, correct] of [
    [A, "ア", false],
    [B, "ウ", true],
    [C, "エ", false],
    [D, "ウ", false],
  ] as const) {
    const list = await storedAttempts(page, qid);
    expect(list, qid).toHaveLength(1);
    expect(list[0], qid).toMatchObject({ choice, correct, src: "practice" });
  }
  expect(await rawStored(page, V1_KEY)).toBeNull();

  // the summary survives a reload
  await page.reload();
  await expect(page.locator("main[data-summary] [data-score]")).toHaveAttribute("data-score", "1/4");

  // 「間違えた問題だけもう一度」 → a new group of A, C and D only
  const retry = page.locator('[data-action="retry"]');
  await expect(retry).toHaveText(P.retryWrong);
  await expect(retry).toHaveAttribute("href", new RegExp(`^/ja/practice\\?ids=${A},${C},${D}&run=\\d+$`));
  await retry.click();
  await expect(page).toHaveURL(new RegExp(`/ja/practice\\?ids=${A},${C},${D}&run=\\d+$`));
  await expect(face(page)).toHaveAttribute("id", A);
  await expect(progress(page)).toHaveAttribute("data-progress", "1/3");
  await expect(choiceButton(page, "ア")).toHaveAttribute("aria-pressed", "false"); // a fresh group

  // 終了 at once → the summary of nothing answered; 「もう一度」 restarts the same group
  await expect(async () => {
    await session(page).locator("[data-finish]").click();
    await expect(page.locator("main[data-summary]")).toBeVisible({ timeout: 500 });
  }).toPass();
  await expect(page.locator("[data-score]")).toHaveText(P.noneAnswered);
  await page.locator('[data-action="restart"]').click();
  await expect(face(page)).toHaveAttribute("id", A);
  await expect(progress(page)).toHaveAttribute("data-progress", "1/3");

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

test("practice en: the face and the explanation render; book labels stay Japanese", async ({ page }) => {
  await page.goto(`/en/practice?ids=${B}`);
  await expect(face(page)).toHaveAttribute("id", B);
  await expect(face(page).locator('[data-fid="stem"]')).toHaveAttribute("lang", "ja");
  await expect(face(page).locator("[data-qno]")).toContainText(ja.Practice.qLabel); // 問 N
  const pane = page.getByRole("region", { name: en.Practice.explanationAria });
  await expect(pane).toContainText(en.Practice.awaitAnswer);
  await pressToAnswer(page, "3", "ウ"); // keyed ウ
  await expectAnswered(page, "ウ", "ウ");
  await expect(pane.getByText(ja.Practice.explanationTab, { exact: true })).toBeVisible(); // 解説 tab
  await expect(pane.getByRole("heading", { level: 2 })).toContainText(`${ja.Practice.qLabel} `); // 問 N
  await expect(pane.locator('[data-verdict="correct"]')).toHaveAttribute("data-letter", "ウ");
  await expect(pane.locator('[data-expl-lang="en"]')).toHaveAttribute("aria-pressed", "true"); // the UI locale
  await expect(session(page).getByText(ja.Practice.answerTag, { exact: true })).toBeVisible(); // 解答栏
  expect((await storedAttempts(page, B))[0]).toMatchObject({ choice: "ウ", correct: true });
});

test("single-question page: a reference view — clicks and keys record nothing", async ({ page }) => {
  await page.goto(`/ja/practice/q/${C}`);
  await waitForRecord(page);
  const ref = page.locator(`main article[id="${C}"]`); // no session here: the reference view
  await expect(ref).toBeVisible();
  await expect(page.locator("main[data-session]")).toHaveCount(0);
  await expect(ref.locator('li[data-letter="イ"]')).toHaveAttribute("data-state", "correct"); // the key, nothing "yours"
  await choiceButton(page, "ア").click({ force: true }); // aria-disabled: force the click to hit the guard
  await ref.focus();
  await page.keyboard.press("2");
  await page.waitForTimeout(500);
  await expect(ref.locator('[aria-pressed="true"]')).toHaveCount(0);
  expect(await storedAttempts(page, C)).toEqual([]);
  expect((await rawStored(page, "itp:learn:v2")) ?? "").not.toContain(C);
});

test("practice ja: one column — choices one per line, explanation under them at the face's width (OQ-13)", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/ja/practice?ids=2023r05-q086,2022r04-q032");
  await expect(progress(page)).toHaveAttribute("data-progress", "1/2");
  await page.evaluate(() => document.fonts.ready);

  // (b) a text-choice question: one choice per line (each top strictly below the one before)
  const list = face(page).locator("ul[data-layout]");
  await expect(list).toHaveAttribute("data-layout", "list");
  const tops: number[] = [];
  for (const l of ["ア", "イ", "ウ", "エ"]) tops.push((await choiceItem(page, l).boundingBox())!.y);
  for (let i = 1; i < tops.length; i++) expect(tops[i]!).toBeGreaterThan(tops[i - 1]!);

  // (a) answered: the explanation is under the choices, as wide as the face; the scroll leaves the
  // choices (○ / ×) in view above the explanation's heading
  await pressToAnswer(page, "1", "ア");
  await expectAnswerScroll(page);

  // (c) a choice_figures question keeps 2 × 2
  await page.locator('[data-nav="next"]').click();
  await expect(progress(page)).toHaveAttribute("data-progress", "2/2");
  await expect(face(page).locator("ul[data-layout]")).toHaveAttribute("data-layout", "grid2");
  const box = async (l: string) => (await choiceItem(page, l).boundingBox())!;
  const [a, i, u, e] = [await box("ア"), await box("イ"), await box("ウ"), await box("エ")];
  expect(Math.abs(a.y - i.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(u.y - e.y)).toBeLessThanOrEqual(1);
  expect(u.y).toBeGreaterThan(a.y);
  expect(i.x).toBeGreaterThan(a.x);
  expect(Math.abs(a.x - u.x)).toBeLessThanOrEqual(1);
});

test("practice ja: with prefers-reduced-motion the answer scroll is instant, same place (OQ-13)", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/ja/practice?ids=2023r05-q086");
  await expect(progress(page)).toHaveAttribute("data-progress", "1/1");
  await page.evaluate(() => document.fonts.ready);
  await pressToAnswer(page, "1", "ア");
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
  await expectAnswerScroll(page);
});

/** After an answer: once the scroll has settled, the choice list ends in the viewport above the
 *  explanation, whose heading is in the viewport; the explanation spans the face's width. */
async function expectAnswerScroll(page: Page): Promise<void> {
  await expect(page.locator("#practice-explanation h2")).toBeVisible();
  // settled: two reads 200ms apart agree
  await expect(async () => {
    const a = await page.evaluate(() => scrollY);
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => scrollY)).toBe(a);
  }).toPass();
  const m = await page.evaluate(() => {
    const rect = (sel: string) => document.querySelector(sel)!.getBoundingClientRect();
    const list = rect("main[data-session] article ul[data-layout]");
    const face = rect("main[data-session] article");
    const expl = rect("#practice-explanation");
    const h2 = rect("#practice-explanation h2");
    return { list, face, expl, h2, vh: innerHeight };
  });
  expect(m.expl.top).toBeGreaterThanOrEqual(m.list.bottom);
  expect(Math.abs(m.expl.width - m.face.width)).toBeLessThanOrEqual(2);
  expect(Math.abs(m.expl.left - m.face.left)).toBeLessThanOrEqual(2);
  expect(m.list.bottom).toBeGreaterThan(0);
  expect(m.list.bottom).toBeLessThanOrEqual(m.vh);
  expect(m.h2.top).toBeGreaterThanOrEqual(0);
  expect(m.h2.bottom).toBeLessThanOrEqual(m.vh);
}
