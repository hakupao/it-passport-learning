// Stage 7 Phase 1 Task 15 fix round 1 (M2) — at phone width (390×844) the main pages have no
// horizontal page scroll. A failure here is reported, not patched: the mobile pass is D-183, later.
// Each page waits until its record-dependent blocks have rendered (no [data-pending]) so the
// measured layout is the final one. No LLM call (guarded), non-owner.

import { test, expect } from "@playwright/test";

import { guardAnthropic } from "./helpers/fakeAnthropic";
import { waitForRecord } from "./helpers/learning";

const PAGES = ["/ja", "/ja/practice?ids=2009h21a-q054", "/ja/settings", "/ja/glossary"];
const WIDTH = 390;

let unhandled: string[] = [];

test.beforeEach(async ({ page }) => {
  unhandled = await guardAnthropic(page);
  await page.setViewportSize({ width: WIDTH, height: 844 });
});

test.afterEach(() => {
  expect(unhandled, "requests to api.anthropic.com").toEqual([]);
});

for (const path of PAGES) {
  test(`phone width: no horizontal scroll on ${path}`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await waitForRecord(page);
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(WIDTH);
  });
}
