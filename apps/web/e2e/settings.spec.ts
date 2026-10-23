// Stage 7 Phase 1 Task 15 — the settings page /[locale]/settings (DESIGN §3.4 / §6.8, D-190 §0-7).
//
//   1. The daily review cap drives today's queue: 15 mistakes from yesterday → today's mistakes row
//      says 15; saving cap 10 on /settings (「保存しました。」, stored in itp:learn:v2 as a LWW setting)
//      → the row says 10 and its group has 10 ids. An out-of-range cap is clamped to the minimum.
//   2. The exam date drives the countdown: no date → 「試験日を設定」 and no countdown; saving today + 30
//      → 「試験まで 30 日」 and the 「試験 M月D日」 date line; the field keeps the date after a reload.
//   3. The page links to AI 先生 (/sensei) and to the other locales' settings pages.
//
// Ids from data/ip/quiz/questions.json, none in a 中問 group. Non-owner: no /api/learning request.

import { test, expect, type Page } from "@playwright/test";

import ja from "../messages/ja.json";
import { guardAnthropic } from "./helpers/fakeAnthropic";
import {
  attemptsOf,
  fill,
  LETTERS,
  localDate,
  recordWith,
  seedV2,
  storedV2,
  trackLearningRequests,
  waitForRecord,
  yesterday,
} from "./helpers/learning";

const S = ja.Settings;
const T = ja.Today;

/** 15 questions answered wrong yesterday: [qid, key]; the wrong choice is the next letter. */
const KEYED: [string, "ア" | "イ" | "ウ" | "エ"][] = [
  ["2009h21a-q001", "ウ"],
  ["2009h21a-q002", "ウ"],
  ["2009h21a-q003", "ア"],
  ["2009h21a-q004", "ア"],
  ["2009h21a-q005", "ア"],
  ["2009h21a-q006", "エ"],
  ["2009h21a-q007", "ウ"],
  ["2009h21a-q008", "イ"],
  ["2009h21a-q009", "エ"],
  ["2009h21a-q010", "エ"],
  ["2009h21a-q011", "ア"],
  ["2009h21a-q014", "エ"],
  ["2009h21a-q015", "エ"],
  ["2009h21a-q016", "ア"],
  ["2009h21a-q018", "エ"],
];
const wrongOf = (key: string) => LETTERS[(LETTERS.indexOf(key as (typeof LETTERS)[number]) + 1) % 4]!;
const WRONG_ROWS = KEYED.map(([id, key]) => [id, wrongOf(key), false] as const);

const mistakesRow = (page: Page) => page.locator('[data-task="mistakes"]');
const status = (page: Page) => page.locator("main[data-settings] form [role=status]");

async function save(page: Page): Promise<void> {
  await page.getByRole("button", { name: S.save }).click();
  await expect(status(page)).toHaveText(new RegExp(`^${S.saved}`));
}

let unhandled: string[] = [];

test.beforeEach(async ({ page }) => {
  unhandled = await guardAnthropic(page);
});

test.afterEach(() => {
  expect(unhandled, "requests to api.anthropic.com").toEqual([]);
});

test("settings: lowering the daily review cap shortens today's mistakes row", async ({ page }) => {
  const learning = trackLearningRequests(page);
  await seedV2(page, recordWith({ attempts: attemptsOf(WRONG_ROWS, yesterday()) }));

  await page.goto("/ja");
  await waitForRecord(page);
  await expect(mistakesRow(page).getByRole("link", { name: fill(T.title_mistakes, { n: 15 }) })).toBeVisible();

  await page.goto("/ja/settings");
  await waitForRecord(page);
  const cap = page.getByLabel(S.reviewCap);
  await expect(cap).toHaveValue("30"); // the default
  await cap.fill("10");
  await save(page);
  await expect.poll(async () => (await storedV2(page))?.settings.dailyReviewCap?.value).toBe(10);

  await page.goto("/ja");
  await waitForRecord(page);
  const link = mistakesRow(page).getByRole("link", { name: fill(T.title_mistakes, { n: 10 }) });
  await expect(link).toBeVisible();
  const ids = /[?&]ids=([^&]+)/.exec((await link.getAttribute("href")) ?? "")?.[1]?.split(",") ?? [];
  expect(ids).toEqual(KEYED.map(([id]) => id).sort().slice(0, 10)); // same due day → qid order
  await expect(page.locator('[data-task="due"]')).toHaveCount(0);

  // out of range → clamped to the minimum (10), shown after saving
  await page.goto("/ja/settings");
  await waitForRecord(page);
  await page.getByLabel(S.reviewCap).fill("3");
  await save(page);
  await expect(page.getByLabel(S.reviewCap)).toHaveValue("10");
  expect((await storedV2(page))?.settings.dailyReviewCap?.value).toBe(10);
  expect(learning).toEqual([]);
});

test("settings: the exam date drives today's countdown", async ({ page }) => {
  const learning = trackLearningRequests(page);
  await page.goto("/ja");
  await waitForRecord(page);
  await expect(page.locator("[data-countdown]")).toHaveCount(0);
  await expect(page.locator("[data-progress-only]")).toHaveCount(1);
  await page.getByRole("link", { name: T.setExamDate }).click();
  await expect(page).toHaveURL(/\/ja\/settings$/);
  await waitForRecord(page);

  const now = new Date();
  const exam = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30, 12);
  const examDate = localDate(exam.getTime());
  await page.getByLabel(S.examDate).fill(examDate);
  await save(page);
  await expect.poll(async () => (await storedV2(page))?.settings.examDate?.value).toBe(examDate);
  await page.reload();
  await waitForRecord(page);
  await expect(page.getByLabel(S.examDate)).toHaveValue(examDate);

  await page.goto("/ja");
  await waitForRecord(page);
  await expect(page.locator("[data-countdown]")).toHaveAttribute("data-countdown", "30");
  await expect(page.locator("#today-countdown-title")).toHaveText(T.countdownTitle);
  await expect(page.locator("[data-exam-date]")).toHaveText(
    fill(T.examOn, { date: `${exam.getMonth() + 1}月${exam.getDate()}日` }),
  );
  await expect(page.getByRole("link", { name: T.setExamDate })).toHaveCount(0);
  expect(learning).toEqual([]);
});

test("settings: links to AI 先生 and to the other locales", async ({ page }) => {
  await page.goto("/ja/settings");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(S.title);
  await expect(page.getByRole("link", { name: S.senseiLink })).toHaveAttribute("href", "/ja/sensei");
  await expect(page.locator('main[data-settings] a[href="/zh/settings"]')).toHaveCount(1);
  await expect(page.locator('main[data-settings] a[href="/en/settings"]')).toHaveCount(1);
});
