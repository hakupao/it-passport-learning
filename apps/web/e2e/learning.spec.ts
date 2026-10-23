// D-180 Task 12 — learning progress on the quiz landing + textbook read marks.
//
// 1. Cross-tab (Task 11 review follow-up): tab A sits on the quiz landing, tab B
//    answers a question in a set; A's row for that topic updates through the
//    window "storage" event, WITHOUT reloading A.
// 2. Opening a unit marks it read (localStorage `itp:learn:v1` unitsRead), and
//    the textbook TOC then shows the read mark on that unit's row only.
// Both run as a non-owner (no `?owner_key=`), so no /api/learning request may fire.
// Strings come from apps/web/messages/ja.json via the literal values below
// (Quiz.progress / Textbook.read); fixture ids from data/ip/quiz + data/ip/textbook.

import { test, expect, type Page } from "@playwright/test";

import ja from "../messages/ja.json";

/** quiz_index.json → technology-14-36 (データ構造, 7 問); 2009h21a-q054 is in it, keyed イ. */
const TOPIC_ID = "technology-14-36";
const QUESTION_ID = "2009h21a-q054";
const UNIT_ID = "management-08-25-u01";
const OTHER_UNIT_ID = "management-08-25-u02";

function trackLearningRequests(page: Page): string[] {
  const seen: string[] = [];
  page.on("request", (r) => {
    if (new URL(r.url()).pathname.startsWith("/api/learning")) seen.push(r.url());
  });
  return seen;
}

test("quiz landing: progress updates from another tab without a reload", async ({ context }) => {
  const a = await context.newPage();
  const b = await context.newPage();
  const requests = [...[a, b].map(trackLearningRequests)];

  await a.goto("/ja/quiz");
  const row = a.locator(`a[href*="id=${TOPIC_ID}"]`);
  await expect(row).toHaveCount(1);
  // Loaded state first, so the later 1/7 can only come from the storage event.
  await expect(row).toContainText("0/7 解答");
  await expect(row).not.toContainText("正答率");
  await a.evaluate(() => {
    (window as unknown as { __noReload: number }).__noReload = 1;
  });

  await b.goto(`/ja/quiz?mode=topic&id=${TOPIC_ID}`);
  const card = b.locator(`article[id="${QUESTION_ID}"]`);
  await card.getByRole("listitem").getByRole("button").first().click(); // ア — wrong
  await expect(card.getByText(`正解: イ`)).toBeVisible();

  await expect(row).toContainText("1/7 解答 · 正答率 0%");
  expect(await a.evaluate(() => (window as unknown as { __noReload?: number }).__noReload)).toBe(1);
  expect(requests.flat()).toEqual([]);
});

test("textbook: opening a unit marks it read in the TOC", async ({ page }) => {
  const requests = trackLearningRequests(page);
  const stored = () => page.evaluate(() => localStorage.getItem("itp:learn:v1"));
  const unitRow = (id: string) => page.locator(`a[href="/ja/textbook/${id}"]`);

  await page.goto("/ja/textbook");
  await expect(unitRow(UNIT_ID)).toHaveCount(1);
  await expect(unitRow(UNIT_ID)).not.toContainText(ja.Textbook.read);

  await page.goto(`/ja/textbook/${UNIT_ID}`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect.poll(stored).toContain(UNIT_ID);
  const rec = JSON.parse((await stored())!) as { unitsRead: Record<string, number> };
  expect(Object.keys(rec.unitsRead)).toEqual([UNIT_ID]);

  await page.goto("/ja/textbook");
  await expect(unitRow(UNIT_ID)).toContainText(`✓ ${ja.Textbook.read}`);
  await expect(unitRow(OTHER_UNIT_ID)).toHaveCount(1);
  await expect(unitRow(OTHER_UNIT_ID)).not.toContainText(ja.Textbook.read);
  await expect(page.locator("a", { hasText: ja.Textbook.read })).toHaveCount(1);
  expect(requests).toEqual([]);
});
