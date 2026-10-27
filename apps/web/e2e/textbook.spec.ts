// Stage 7 Phase 3 Task 2 (D-196 §0-5 / §0-6) — the unit reader's single column: no horizontal page
// scroll at 1440 / 390, the reading column at most 44em wide, and the D-195 blocks present (term
// index, per-term past questions, #confirm, 読了).
// Task 3 (§0-1 / §0-2): the confirmation questions run as a practice group (from=unit, a click-time
// run) and return to the unit; every click is a new round; a wrong answer lands in the mistakes book.
// No LLM call (guarded), non-owner.

import { readFileSync } from "node:fs";
import path from "node:path";

import { test, expect, type Page } from "@playwright/test";

import ja from "../messages/ja.json";
import { guardAnthropic } from "./helpers/fakeAnthropic";
import { answerChoice, LETTERS, storedAttempts, waitForRecord } from "./helpers/learning";

const QUESTIONS: Map<string, string> = new Map(
  (
    JSON.parse(readFileSync(path.resolve(__dirname, "../../../data/ip/quiz/questions.json"), "utf-8")) as {
      questions: { id: string; correct_answer: string }[];
    }
  ).questions.map((q) => [q.id, q.correct_answer]),
);

const face = (page: Page) => page.locator("main[data-session] article[id]");
const progress = (page: Page) => page.locator("[data-progress]");
const confirmLink = (page: Page) => page.locator("section#confirm a");
const runOf = (url: string): string | null => new URL(url).searchParams.get("run");

/** Answer the question on screen (right or wrong) and move on (the last one → the summary). */
async function answerAndNext(page: Page, right: boolean): Promise<string> {
  const qid = (await face(page).getAttribute("id"))!;
  const key = QUESTIONS.get(qid)!;
  await answerChoice(page, right ? key : LETTERS.find((l) => l !== key)!);
  await page.locator('main[data-session] [data-nav="next"]').click();
  return qid;
}

const UNIT_ID = "management-08-25-u01";

let unhandled: string[] = [];

test.beforeEach(async ({ page }) => {
  unhandled = await guardAnthropic(page);
});

test.afterEach(() => {
  expect(unhandled, "requests to api.anthropic.com").toEqual([]);
});

for (const width of [1440, 390]) {
  test(`unit page at ${width}px: no horizontal scroll, column ≤ 44em`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const res = await page.goto(`/ja/textbook/${UNIT_ID}`);
    expect(res?.status()).toBe(200);
    await waitForRecord(page);
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    const { w, em } = await page.evaluate(() => {
      const main = document.querySelector("main:has(article)")!;
      return { w: main.getBoundingClientRect().width, em: parseFloat(getComputedStyle(main).fontSize) };
    });
    expect(w).toBeGreaterThan(0);
    expect(w).toBeLessThanOrEqual(44 * em + 0.5);
  });
}

test("unit page: term index → articles → 要点 → 確認問題 → 読了", async ({ page }) => {
  await page.goto(`/ja/textbook/${UNIT_ID}`);
  const main = page.locator("main:has(article)");
  const index = main.locator('[data-part="term-index"] a');
  const articles = main.locator("article");
  await expect(articles).not.toHaveCount(0);
  await expect(index).toHaveCount(await articles.count());
  await expect(main.locator('[data-part="term-past"] a')).not.toHaveCount(0);
  const confirm = main.locator("section#confirm");
  await expect(confirm.getByRole("heading", { level: 2 })).toHaveText(ja.Textbook.confirmTitle);
  // the rendered href: from=unit, no run (the run is made at click time)
  await expect(confirm.getByRole("link")).toHaveAttribute(
    "href",
    new RegExp(`^/ja/practice\\?ids=[^&]+&from=unit&unit=${UNIT_ID}$`),
  );
  await expect(main.locator('button[data-part="read"]')).toHaveText(ja.Textbook.readDone);

  // the term index jumps to the article
  const first = index.first();
  const id = (await first.getAttribute("href"))!.slice(1);
  await first.click();
  await expect(page.locator(`article#${id}`)).toBeInViewport();
});

test("confirm: a round all right → 単元に戻る → the confirm block again is a new round (new run)", async ({ page }) => {
  await page.goto(`/ja/textbook/${UNIT_ID}`);
  await waitForRecord(page);
  await confirmLink(page).click();
  await expect(page).toHaveURL(new RegExp(`/ja/practice\\?ids=[^&]+&from=unit&unit=${UNIT_ID}&run=\\d{1,16}$`));
  const run1 = runOf(page.url());
  const total = Number((await progress(page).getAttribute("data-progress"))!.split("/")[1]);
  expect(total).toBeGreaterThanOrEqual(3);
  expect(total).toBeLessThanOrEqual(5);
  for (let i = 0; i < total; i++) await answerAndNext(page, true);

  const summary = page.locator("main[data-summary]");
  await expect(summary.locator("[data-score]")).toHaveAttribute("data-score", `${total}/${total}`);
  const back = summary.locator('[data-action="unit"]');
  await expect(back).toHaveText(ja.Practice.backToUnit);
  await expect(back).toHaveAttribute("href", `/ja/textbook/${UNIT_ID}#confirm`);
  await back.click();
  await expect(page).toHaveURL(new RegExp(`/ja/textbook/${UNIT_ID}#confirm$`));
  await expect(page.locator("section#confirm")).toBeInViewport();

  await waitForRecord(page);
  await confirmLink(page).click();
  await expect(page).toHaveURL(/&run=\d{1,16}$/);
  const run2 = runOf(page.url());
  expect(run2).not.toBe(run1); // a new group, not the stored summary
  await expect(progress(page)).toHaveAttribute("data-progress", `1/${total}`);
  await expect(page.locator("main[data-summary]")).toHaveCount(0);
});

test("confirm: two clicks on the same unit page get different runs", async ({ page }) => {
  await page.goto(`/ja/textbook/${UNIT_ID}`);
  await waitForRecord(page);
  await confirmLink(page).click();
  await expect(page).toHaveURL(/&run=\d{1,16}$/);
  const run1 = runOf(page.url());
  await page.goBack();
  await expect(page).toHaveURL(new RegExp(`/ja/textbook/${UNIT_ID}$`));
  await waitForRecord(page);
  await confirmLink(page).click();
  await expect(page).toHaveURL(/&run=\d{1,16}$/);
  expect(runOf(page.url())).not.toBe(run1);
  await expect(progress(page)).toHaveAttribute("data-progress", /^1\//);
});

test("confirm: a wrong answer lands in the mistakes book", async ({ page }) => {
  await page.goto(`/ja/textbook/${UNIT_ID}`);
  await waitForRecord(page);
  await confirmLink(page).click();
  await expect(progress(page)).toHaveAttribute("data-progress", /^1\//);
  const qid = await answerAndNext(page, false);
  await expect.poll(async () => (await storedAttempts(page, qid)).map((a) => a.correct)).toEqual([false]);

  await page.goto("/ja/practice/mistakes");
  await waitForRecord(page);
  await expect(page.locator(`[data-mistake-row="${qid}"]`)).toHaveCount(1);
});

test("a term's past-question link opens a from=unit group with a run", async ({ page }) => {
  await page.goto(`/ja/textbook/${UNIT_ID}`);
  await waitForRecord(page);
  const link = page.locator('[data-part="term-past"] a').first();
  await expect(link).toHaveAttribute("href", new RegExp(`&from=unit&unit=${UNIT_ID}$`));
  await link.click();
  await expect(page).toHaveURL(new RegExp(`&from=unit&unit=${UNIT_ID}&run=\\d{1,16}$`));
  await expect(progress(page)).toHaveAttribute("data-progress", /^1\//);
});
