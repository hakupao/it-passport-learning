// Stage 7 Phase 2 Task 5 — the learning record page /[locale]/record (DESIGN §6.6 / D-193 §0-9).
//
//   1. The server HTML carries no number (every record block is data-pending); an empty record →
//      the one empty-state line, 0 answered.
//   2. Answer 2 questions in a practice group → /ja/record: 解いた問題 = 2, today's daily cell = 2,
//      the topic table sorts by ?sort=rate.
//   3. 360 × 800: no horizontal scroll.
//
// Ids from data/ip/quiz/questions.json (none in a 中問 group). Non-owner; no LLM call (guarded).

import { test, expect, type Page } from "@playwright/test";

import ja from "../messages/ja.json";
import { guardAnthropic } from "./helpers/fakeAnthropic";
import { answerChoice, storedAttempts, waitForRecord } from "./helpers/learning";

const R = ja.Record;
const A = "2009h21a-q054";
const B = "2010h22h-q085";

let unhandled: string[] = [];

test.beforeEach(async ({ page }) => {
  unhandled = await guardAnthropic(page);
});

test.afterEach(() => {
  expect(unhandled, "requests to api.anthropic.com").toEqual([]);
});

async function answerTwo(page: Page): Promise<void> {
  await page.goto(`/ja/practice?ids=${A},${B}`);
  await answerChoice(page, "ア");
  await page.keyboard.press("Enter");
  await expect(page.locator("main[data-session] article")).toHaveAttribute("id", B);
  await answerChoice(page, "ア");
  await expect.poll(() => storedAttempts(page, A).then((l) => l.length)).toBe(1);
  await expect.poll(() => storedAttempts(page, B).then((l) => l.length)).toBe(1);
}

test("record, new user: no numbers in the server HTML; then the empty-state line and 0 answered", async ({
  page,
  request,
}) => {
  const res = await request.get("/ja/record");
  expect(res.status()).toBe(200);
  const html = await res.text();
  expect(html).toContain("data-pending");
  expect(html).not.toContain("data-answered");
  expect(html).not.toContain("data-count");

  await page.goto("/ja/record");
  await waitForRecord(page);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(R.title);
  await expect(page.locator("[data-empty]")).toHaveText(R.empty);
  await expect(page.locator("[data-answered]")).toHaveAttribute("data-answered", "0");
});

test("record after 2 answers: answered 2, today's cell 2, sort by rate", async ({ page }) => {
  await answerTwo(page);
  await page.goto("/ja/record");
  await waitForRecord(page);
  await expect(page.locator("[data-empty]")).toHaveCount(0);
  await expect(page.locator("[data-answered]")).toHaveAttribute("data-answered", "2");
  await expect(page.locator("[data-day-today]")).toHaveAttribute("data-count", "2");
  await expect(page.locator("[data-day-today]")).toHaveText("2");
  await expect(page.locator("[data-study-days]")).toHaveAttribute("data-study-days", "1");

  await page.getByRole("link", { name: R.sortRate, exact: true }).click();
  await expect(page).toHaveURL(/\/ja\/record\?sort=rate$/);
  await expect(page.locator("[data-sort]")).toHaveAttribute("data-sort", "rate");
  // every field: rated rows first, ascending; unanswered (—) last
  for (const group of await page.locator("[data-category]").all()) {
    const rates = await group.locator("td[data-rate]").evaluateAll((tds) => tds.map((td) => td.getAttribute("data-rate")!));
    const rated = rates.filter((r) => r !== "").map(Number);
    expect(rated).toEqual([...rated].sort((x, y) => x - y));
    expect(rates.slice(rated.length).every((r) => r === "")).toBe(true);
  }
});

test("record phone 360px: no horizontal scroll", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await answerTwo(page);
  for (const url of ["/ja/record", "/en/record?sort=rate"]) {
    await page.goto(url);
    await waitForRecord(page);
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  }
});
