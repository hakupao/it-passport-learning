// Stage 7 Phase 3 Task 2 (D-196 §0-5 / §0-6) — the unit reader's single column: no horizontal page
// scroll at 1440 / 390, the reading column at most 44em wide, and the D-195 blocks present (term
// index, per-term past questions, #confirm, 読了). No LLM call (guarded), non-owner.

import { test, expect } from "@playwright/test";

import ja from "../messages/ja.json";
import { guardAnthropic } from "./helpers/fakeAnthropic";
import { waitForRecord } from "./helpers/learning";

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
  await expect(confirm.getByRole("link")).toHaveAttribute("href", /^\/ja\/practice\?ids=[^&]+$/);
  await expect(main.locator('button[data-part="read"]')).toHaveText(ja.Textbook.readDone);

  // the term index jumps to the article
  const first = index.first();
  const id = (await first.getAttribute("href"))!.slice(1);
  await first.click();
  await expect(page.locator(`article#${id}`)).toBeInViewport();
});
