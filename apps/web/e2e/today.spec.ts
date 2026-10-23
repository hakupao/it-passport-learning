// Stage 7 Phase 1 Task 15 — the today page /[locale] (D-189 §6.1 / D-190 §0-7 / §0-17 / §0-26) and the
// mistakes flow (D-190 §0-5 / §0-6, the mistakes book /practice/mistakes).
//
//   1. New user (empty record): the server HTML carries no number (every record block is data-pending);
//      once loaded: the empty-state line instead of task rows, 「まず 20 問で実力チェック」 →
//      /practice?ids=<≥ 20 ids>&from=today&kind=fresh, the weak-topic empty line, 「試験日を設定」 → /settings,
//      0 answered. The baseline group's top bar names the today task (新しい問題).
//   2. Seeded record (answers made yesterday, 2 wrong + 3 right in データ構造): the mistakes row
//      (誤答ノート 2 問) whose link and the primary 「1 番目から始める」 open that group (ids by qid) with
//      kind=mistakes; 「一覧」 → the mistakes book with both rows; the weak-topic row for データ構造 with
//      「10 問解く」 / 「AI 分析」 links. Working the group (both right) → the summary offers 「次の項目へ」;
//      back on today the mistakes row is done (✓, 今日の分は完了, no link).
//   3. Mistakes flow on a fixed clock (page.clock.setFixedTime, local noon): a wrong answer is in the
//      mistakes book at once but not in today's queue (due tomorrow); one day later it is the today
//      mistakes row (1 問) and the book says 今日.
//
// Ids from data/ip/quiz/questions.json (none in a 中問 group, so no group expansion changes the counts).
// Non-owner: no /api/learning request; no LLM call (guarded).

import { test, expect, type Page } from "@playwright/test";

import ja from "../messages/ja.json";
import { guardAnthropic } from "./helpers/fakeAnthropic";
import {
  answerChoice,
  attemptsOf,
  escapeRe as escape,
  fill,
  recordWith,
  seedV2,
  trackLearningRequests,
  waitForRecord,
  yesterday,
} from "./helpers/learning";

const T = ja.Today;
const P = ja.Practice;
const TOPIC = "technology-14-36"; // データ構造, 7 問
const TOTAL = 2900;

/** [qid, choice, correct] — keys: q054 イ, q085 ウ, q058 イ, q092 エ, q076 イ */
const TOPIC_ROWS = [
  ["2009h21a-q054", "ア", false],
  ["2010h22h-q085", "ア", false],
  ["2011h23tokubetsu-q058", "イ", true],
  ["2016h28a-q092", "エ", true],
  ["2018h30a-q076", "イ", true],
] as const;
const WRONG = ["2009h21a-q054", "2010h22h-q085"]; // qid order = the queue order (same due day)
const KEY: Record<string, "イ" | "ウ"> = { "2009h21a-q054": "イ", "2010h22h-q085": "ウ" };

const task = (page: Page, kind: string) => page.locator(`[data-task="${kind}"]`);
const primary = (page: Page) => page.locator("[data-primary]");

let unhandled: string[] = [];

test.beforeEach(async ({ page }) => {
  unhandled = await guardAnthropic(page);
});

test.afterEach(() => {
  expect(unhandled, "requests to api.anthropic.com").toEqual([]);
});

test("today, new user: no numbers before the record loads; then the 20-question baseline button", async ({
  page,
  request,
}) => {
  // the server render: every record block waits, no count is in the markup
  const html = await (await request.get("/ja")).text();
  expect(html).toContain("data-pending");
  expect(html).not.toContain("data-answered");
  expect(html).not.toContain("data-primary");

  const learning = trackLearningRequests(page);
  await page.goto("/ja");
  await waitForRecord(page);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(T.title);
  await expect(page.locator('[data-empty="tasks"]')).toHaveText(T.newUserLead);
  await expect(page.locator("[data-task]")).toHaveCount(0);
  await expect(page.locator('[data-empty="weak"]')).toHaveText(T.weakEmpty);
  await expect(page.locator("[data-answered]")).toHaveAttribute("data-answered", `0/${TOTAL}`);
  await expect(page.locator("[data-countdown]")).toHaveCount(0);
  const setExam = page.getByRole("link", { name: T.setExamDate });
  await expect(setExam).toHaveAttribute("href", "/ja/settings");

  await expect(primary(page)).toHaveText(T.baseline);
  const href = (await primary(page).getAttribute("href")) ?? "";
  const m = /^\/ja\/practice\?ids=([^&]+)&from=today&kind=fresh$/.exec(href);
  expect(m, href).not.toBeNull();
  const ids = m![1]!.split(",");
  expect(ids.length).toBeGreaterThanOrEqual(20);
  expect(new Set(ids).size).toBe(ids.length);

  await primary(page).click();
  await expect(page).toHaveURL(new RegExp(`${escape(href)}$`));
  const bar = page.locator("main[data-session] [data-progress]");
  await expect(bar).toHaveAttribute("data-progress", `1/${ids.length}`);
  await expect(bar).toContainText(P.kind_fresh);
  await expect(page.locator("main[data-session] article")).toHaveAttribute("id", ids[0]!);
  expect(learning).toEqual([]);
});

test("today, seeded record: mistakes row + primary button target, 一覧 → mistakes book, weak topic, done after working it", async ({
  page,
}) => {
  const learning = trackLearningRequests(page);
  await seedV2(page, recordWith({ attempts: attemptsOf(TOPIC_ROWS, yesterday()) }));
  await page.goto("/ja");
  await waitForRecord(page);
  await expect(page.locator('[data-empty="tasks"]')).toHaveCount(0);
  await expect(page.locator("[data-answered]")).toHaveAttribute("data-answered", `${TOPIC_ROWS.length}/${TOTAL}`);

  const mistakes = task(page, "mistakes");
  await expect(mistakes).toHaveAttribute("data-done", "false");
  await expect(task(page, "mistakes")).toHaveCount(1);
  await expect(page.locator("[data-task]").first()).toHaveAttribute("data-task", "mistakes"); // first row
  const groupHref = `/ja/practice?ids=${WRONG.join(",")}&from=today&kind=mistakes`;
  const titleLink = mistakes.getByRole("link", { name: fill(T.title_mistakes, { n: WRONG.length }) });
  await expect(titleLink).toHaveAttribute("href", groupHref);
  await expect(mistakes).toContainText(`${"データ構造"} ${WRONG.length}`); // detail: topic + count
  await expect(primary(page)).toHaveText(T.start);
  await expect(primary(page)).toHaveAttribute("href", groupHref);

  // weak topics: データ構造 (5 answered, 2 wrong = 60 %)
  const weak = page.locator(`[data-weak-row="${TOPIC}"]`);
  await expect(weak).toContainText("60%");
  await expect(weak.getByRole("link", { name: T.practice10 })).toHaveAttribute(
    "href",
    `/ja/practice?topic=${TOPIC}&n=10&order=rand`,
  );
  await expect(weak.getByRole("link", { name: T.aiReview })).toHaveAttribute(
    "href",
    `/ja/practice/browse/${TOPIC}?review=1`,
  );

  // 一覧 → the mistakes book
  await mistakes.locator("[data-mistakes-list]").click();
  await expect(page).toHaveURL(/\/ja\/practice\/mistakes$/);
  await waitForRecord(page);
  await expect(page.locator("[data-mistake-row]")).toHaveCount(WRONG.length);
  for (const id of WRONG) await expect(page.locator(`[data-mistake-row="${id}"]`)).toContainText(ja.Mistakes.nextToday);
  await expect(page.locator(`[data-mistake-group="${TOPIC}"]`)).toHaveCount(1);
  await expect(page.locator("[data-do-all]")).toHaveText(fill(ja.Mistakes.doAll, { n: WRONG.length }));

  // the primary button → the group, top bar names the task; both right → summary with 「次の項目へ」
  await page.goto("/ja");
  await waitForRecord(page);
  await primary(page).click();
  await expect(page).toHaveURL(new RegExp(`${escape(groupHref)}$`));
  const bar = page.locator("main[data-session] [data-progress]");
  await expect(bar).toContainText(P.kind_mistakes);
  for (const [i, id] of WRONG.entries()) {
    await expect(page.locator("main[data-session] article")).toHaveAttribute("id", id);
    await answerChoice(page, KEY[id]!);
    await page.locator('[data-nav="next"]').click();
    if (i < WRONG.length - 1) await expect(bar).toHaveAttribute("data-progress", `${i + 2}/${WRONG.length}`);
  }
  const summary = page.locator("main[data-summary]");
  await expect(summary.locator("[data-score]")).toHaveAttribute("data-score", `${WRONG.length}/${WRONG.length}`);
  const next = summary.locator('[data-action="continue"]');
  await expect(next).toHaveText(P.continueNext);
  await expect(next).toHaveAttribute("href", /^\/ja(\/practice\?ids=[^&]+&from=today&kind=(due|fresh)&run=\d+)?$/);

  // back on today: the mistakes row is done for today
  await summary.locator('[data-action="today"]').click();
  await expect(page).toHaveURL(/\/ja$/);
  await waitForRecord(page);
  await expect(task(page, "mistakes")).toHaveAttribute("data-done", "true");
  await expect(task(page, "mistakes")).toContainText(T.doneLine);
  await expect(task(page, "mistakes").getByRole("link")).toHaveCount(0);
  expect(learning).toEqual([]);
});

test("mistakes: a wrong answer is in the book at once and in today's mistakes row the next day", async ({ page }) => {
  const learning = trackLearningRequests(page);
  const now = new Date();
  const t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0); // local noon today
  const t1 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 12, 0, 0); // local noon tomorrow
  const qid = WRONG[0]!;
  await page.clock.setFixedTime(t0);

  await page.goto(`/ja/practice?ids=${qid}`);
  await answerChoice(page, "ア");
  await expect(page.locator("[data-status]")).toHaveText(P.statusWrong);

  // in the book at once, due tomorrow
  await page.goto("/ja/practice/mistakes");
  await waitForRecord(page);
  const row = page.locator(`[data-mistake-row="${qid}"]`);
  await expect(row).toHaveCount(1);
  await expect(row).toContainText(`${t1.getMonth() + 1}/${t1.getDate()}`);

  // not in today's queue yet
  await page.goto("/ja");
  await waitForRecord(page);
  expect(await page.evaluate(() => Date.now())).toBe(t0.getTime());
  await expect(page.locator('[data-empty="tasks"]')).toHaveCount(0); // not a new user any more
  await expect(task(page, "mistakes")).toHaveCount(0);

  // one day later
  await page.clock.setFixedTime(t1);
  await page.reload();
  await waitForRecord(page);
  expect(await page.evaluate(() => Date.now())).toBe(t1.getTime());
  const mistakes = task(page, "mistakes");
  await expect(mistakes).toHaveAttribute("data-done", "false");
  await expect(mistakes.getByRole("link", { name: fill(T.title_mistakes, { n: 1 }) })).toHaveAttribute(
    "href",
    `/ja/practice?ids=${qid}&from=today&kind=mistakes`,
  );
  await expect(primary(page)).toHaveAttribute("href", `/ja/practice?ids=${qid}&from=today&kind=mistakes`);

  await page.goto("/ja/practice/mistakes");
  await waitForRecord(page);
  await expect(page.locator(`[data-mistake-row="${qid}"]`)).toContainText(ja.Mistakes.nextToday);
  expect(learning).toEqual([]);
});
