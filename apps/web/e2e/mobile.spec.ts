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

// Stage 7 Phase 5 (D-239) — the phone pass. At 375×667 (iPhone SE): the stem and choices take the whole
// face width, a short question shows all four choices on the first screen, and after an answer the
// next button is in the viewport without scrolling (a bar fixed to the bottom) and never covers the
// end of the page. The header is about 100px in every locale.
test.describe("D-239 phone layout (375×667)", () => {
  const SHORT = "2024r06-q006"; // 39-character stem, one-word choices, no figure
  const URL = `/zh/practice?ids=${SHORT},2024r06-q018`;

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test("the face: stem ≥ 300px wide; all four choices start on the first screen", async ({ page }) => {
    await page.goto(URL);
    await waitForRecord(page);
    await page.evaluate(() => document.fonts.ready);
    const stem = await page.locator('article [data-fid="stem"]').boundingBox();
    expect(stem!.width).toBeGreaterThanOrEqual(300);
    for (const L of ["ア", "イ", "ウ", "エ"]) {
      const box = await page.locator(`article li[data-letter="${L}"]`).boundingBox();
      expect(box!.y, `choice ${L} starts on the first screen`).toBeLessThan(667);
    }
    // 問番号 / 复习三格 / 頻出度 sit in one row above the stem
    const qNo = await page.locator("article [data-qno]").boundingBox();
    expect(qNo!.y + qNo!.height).toBeLessThanOrEqual(stem!.y);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  });

  test("progress, 答题卡, timer and 结束 share one row", async ({ page }) => {
    await page.goto(URL);
    await waitForRecord(page);
    const ys = await Promise.all(
      ["[data-progress]", "[data-answer-card]", "[data-timer]", "[data-finish]"].map(async (s) => {
        const b = (await page.locator(s).boundingBox())!;
        return b.y + b.height / 2;
      }),
    );
    for (const y of ys) expect(Math.abs(y - ys[0]!)).toBeLessThan(12);
  });

  test("after an answer: the next button is in the viewport, fixed; it never covers the end of the page", async ({ page }) => {
    await page.goto(URL);
    await waitForRecord(page);
    const next = page.locator('[data-nav="next"]');
    const choice = page.locator('article li[data-letter="ア"] button');
    await expect(async () => {
      await choice.click();
      await expect(choice).toHaveAttribute("aria-pressed", "true", { timeout: 500 });
    }).toPass();
    await expect(page.locator("main[data-session]")).toHaveAttribute("data-answered", "");
    await page.waitForTimeout(1200); // the smooth scroll to the explanation
    await expect(next).toBeInViewport({ ratio: 1 });
    expect(await next.evaluate((el) => getComputedStyle(el.parentElement!).position)).toBe("fixed");
    // scrolled to the very bottom, the last in-flow content ends above the bar
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(200);
    const barTop = (await next.locator("..").boundingBox())!.y;
    const statusBottom = await page.locator('main[data-session] [role="status"]').evaluate((el) => el.getBoundingClientRect().bottom);
    expect(statusBottom).toBeLessThanOrEqual(barTop);
    await expect(next).toBeInViewport({ ratio: 1 });
    // it is the in-flow button itself: one next button, and it still moves on
    await expect(page.locator('[data-nav="next"]')).toHaveCount(1);
    await next.click();
    await expect(page.locator("[data-progress]")).toHaveAttribute("data-progress", "2/2");
    await expect(page.locator("main[data-session]")).not.toHaveAttribute("data-answered", "");
  });

  test("after an answer the explanation heading is never left under the bar (in-view test uses the bar top)", async ({ page }) => {
    // 1st pass, tall viewport: where the heading lands with no scroll
    await page.setViewportSize({ width: 390, height: 2000 });
    const pick = async () => {
      const choice = page.locator('article li[data-letter="ア"] button');
      await expect(async () => {
        await choice.click();
        await expect(choice).toHaveAttribute("aria-pressed", "true", { timeout: 500 });
      }).toPass();
    };
    await page.goto(`${URL}&run=1`);
    await waitForRecord(page);
    await pick();
    const heading = page.locator("#practice-explanation h2");
    const bottom = (await heading.boundingBox())!;
    // 2nd pass: the heading would end 30px above the viewport bottom, i.e. inside the 61px bar
    await page.setViewportSize({ width: 390, height: Math.round(bottom.y + bottom.height + 30) });
    await page.goto(`${URL}&run=2`);
    await waitForRecord(page);
    await pick();
    await page.waitForTimeout(1200);
    const barTop = (await page.locator('[data-nav="next"]').locator("..").boundingBox())!.y;
    const h = (await heading.boundingBox())!;
    expect(h.y + h.height).toBeLessThanOrEqual(barTop);
  });

  test("a control in the explanation reached by Tab is not hidden under the bar (WCAG 2.4.11)", async ({ page }) => {
    await page.goto(URL);
    await waitForRecord(page);
    const choice = page.locator('article li[data-letter="ア"] button');
    await expect(async () => {
      await choice.click();
      await expect(choice).toHaveAttribute("aria-pressed", "true", { timeout: 500 });
    }).toPass();
    await page.waitForTimeout(1200);
    // the last focusable control of the explanation, reached by Tab from the one before it while it sits fully
    // inside the viewport but in the bottom band the bar covers: without scroll-padding the browser counts it as
    // "in view" and does not scroll, so the focused control stays hidden under the bar
    const targetIdx = await page.evaluate(() => {
      const all = [...document.querySelectorAll<HTMLElement>("a[href], button:not(:disabled), summary")].filter((e) => e.offsetParent !== null);
      const inExpl = all.filter((e) => e.closest("#practice-explanation"));
      const target = inExpl[inExpl.length - 1]!;
      target.setAttribute("data-e2e-target", "");
      const i = all.indexOf(target);
      all[i - 1]!.focus({ preventScroll: true });
      const r = target.getBoundingClientRect();
      window.scrollTo(0, window.scrollY + r.bottom - (window.innerHeight - 8));
      return i;
    });
    expect(targetIdx).toBeGreaterThan(0);
    await page.keyboard.press("Tab");
    const target = page.locator("[data-e2e-target]");
    await expect(target).toBeFocused();
    await page.waitForTimeout(300);
    const barTop = (await page.locator('[data-nav="next"]').locator("..").boundingBox())!.y;
    const box = (await target.boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(barTop);
  });

  test("a 30-question group: the 答题卡 scrolls inside its row (no page overflow), the current cell in view", async ({ page }) => {
    const ids = Array.from({ length: 30 }, (_, i) => `2024r06-q${String(i + 1).padStart(3, "0")}`);
    await page.goto(`/zh/practice?ids=${ids.join(",")}`);
    await waitForRecord(page);
    await expect(async () => {
      await page.keyboard.press("ArrowRight");
      await expect(page.locator("[data-progress]")).not.toHaveAttribute("data-progress", "1/30", { timeout: 500 });
    }).toPass();
    for (let i = 0; i < 22; i++) await page.keyboard.press("ArrowRight");
    await expect(page.locator("[data-progress]")).toHaveAttribute("data-progress", "24/30");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
    const inView = await page.locator("[data-answer-card]").evaluate((ol) => {
      const cur = ol.querySelector('[data-current="true"]')!.getBoundingClientRect();
      const r = ol.getBoundingClientRect();
      return cur.left >= r.left && cur.right <= r.right;
    });
    expect(inView).toBe(true);
  });

  for (const width of [360, 375]) {
    for (const locale of ["ja", "zh", "en"]) {
      test(`header is two rows, ≤ 110px, not sticky (${locale}, ${width})`, async ({ page }) => {
        await page.setViewportSize({ width, height: 667 });
        await page.goto(`/${locale}/textbook`);
        await page.evaluate(() => document.fonts.ready);
        const banner = page.getByRole("banner");
        const header = (await banner.boundingBox())!;
        expect(header.height).toBeLessThanOrEqual(110);
        // row 1 = site name + tools (same line), row 2 = the nav on one line, below both
        const name = (await banner.locator("a").first().boundingBox())!;
        const tools = (await banner.locator("nav ~ div").boundingBox())!;
        const nav = (await banner.getByRole("navigation").boundingBox())!;
        expect(tools.y).toBeLessThan(name.y + name.height);
        expect(nav.y).toBeGreaterThanOrEqual(Math.max(name.y + name.height, tools.y + tools.height) - 1);
        const items = await banner.getByRole("navigation").getByRole("link").evaluateAll((as) => as.map((a) => a.getBoundingClientRect().top));
        expect(Math.max(...items) - Math.min(...items)).toBeLessThan(4);
        expect(await banner.evaluate((el) => getComputedStyle(el).position)).toBe("static");
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      });
    }
  }
});

test("D-239 desktop (1280): the next row stays in the page flow after an answer", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/zh/practice?ids=2024r06-q006,2024r06-q018");
  await waitForRecord(page);
  const choice = page.locator('article li[data-letter="ア"] button');
  await expect(async () => {
    await choice.click();
    await expect(choice).toHaveAttribute("aria-pressed", "true", { timeout: 500 });
  }).toPass();
  expect(await page.locator('[data-nav="next"]').evaluate((el) => getComputedStyle(el.parentElement!).position)).toBe("static");
});
