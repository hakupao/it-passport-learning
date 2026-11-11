// D-223 細目 (H1-5) — on the static export the two detail families (practice/q/<id>,
// glossary/<termId>) have no RSC payload (.txt): getting into one must be a full page load that
// never asks for the missing .txt (on Cloudflare such a fetch can invoke the H3 Worker and count
// against the free daily requests). Each case starts on another page, marks the window, follows the
// link and checks (1) a document request for the detail URL, (2) the window mark is gone (a real
// load, not a client transition), (3) no request for a detail .txt was made at any point, including
// prefetches while the source page was open. Run against the static site (`out/`); under `next dev`
// the same links are plain <a> too, so the spec holds there as well.
import { expect, test, type Page } from "@playwright/test";

import { termId } from "../src/lib/glossary/termId";
import { guardAnthropic } from "./helpers/fakeAnthropic";

const DETAIL_TXT = /\/(?:ja|zh|en)\/(?:practice\/q|glossary)\/[^/?#]+\.txt(?:\?|$)/;
const QID = "2009h21a-q054";
const TOPIC = "technology-14-36";
const TERM = termId("ISO/IEC 27000");

declare global {
  interface Window {
    __mark?: number;
  }
}

let unhandled: string[] = [];
let detailTxt: string[] = [];
let documents: string[] = [];

test.beforeEach(async ({ page }) => {
  unhandled = await guardAnthropic(page);
  detailTxt = [];
  documents = [];
  page.on("request", (r) => {
    if (DETAIL_TXT.test(r.url())) detailTxt.push(r.url());
    if (r.resourceType() === "document") documents.push(new URL(r.url()).pathname);
  });
});

test.afterEach(() => {
  expect(unhandled, "requests to api.anthropic.com").toEqual([]);
  expect(detailTxt, "requests for a detail page's .txt payload").toEqual([]);
});

async function followFullLoad(page: Page, click: () => Promise<void>, want: string): Promise<void> {
  await page.waitForLoadState("networkidle"); // any prefetch of the source page has happened
  await page.evaluate(() => (window.__mark = 1));
  await click();
  await expect(page).toHaveURL(new RegExp(`${want}$`));
  await page.waitForLoadState("networkidle");
  expect(await page.evaluate(() => window.__mark)).toBeUndefined();
  expect(documents).toContain(want);
}

test("topic page → a question page: full page load, no .txt", async ({ page }) => {
  await page.goto(`/ja/practice/browse/${TOPIC}`);
  const want = `/ja/practice/q/${QID}`;
  await followFullLoad(page, () => page.locator(`tr[data-question-row="${QID}"] a`).first().click(), want);
  await expect(page.locator(`article[id="${QID}"]`)).toBeVisible();
});

test("glossary list → a term page: full page load, no .txt", async ({ page }) => {
  await page.goto("/ja/glossary");
  const want = `/ja/glossary/${TERM}`;
  await followFullLoad(page, () => page.locator(`a[href="${want}"]`).first().click(), want);
});

test("term page → a question page, and the language switch on a detail page: full page loads, no .txt", async ({ page }) => {
  await page.goto(`/ja/glossary/${TERM}`);
  const q = page.locator('a[href^="/ja/practice/q/"]').first();
  const href = (await q.getAttribute("href"))!;
  await followFullLoad(page, () => q.click(), href);
  // 日 → 中 on the question page: the zh detail page, again a full load
  const zh = href.replace(/^\/ja\//, "/zh/");
  await followFullLoad(page, () => page.locator(`a[hreflang="zh"][href="${zh}"]`).first().click(), zh);
});

test("legacy /ja/quiz#<qid> → the question page by location.replace, no .txt", async ({ page }) => {
  await page.goto(`/ja/quiz#${QID}`);
  await expect(page).toHaveURL(new RegExp(`/ja/practice/q/${QID}$`));
  await page.waitForLoadState("networkidle");
  expect(documents).toContain(`/ja/practice/q/${QID}`);
});

test("control: a non-detail link is still a client transition (the window mark survives), so the checks above are not vacuous", async ({ page }) => {
  await page.goto("/ja/practice/browse");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => (window.__mark = 1));
  await page.locator(`a[href="/ja/practice/browse/${TOPIC}"]`).first().click();
  await expect(page).toHaveURL(new RegExp(`/ja/practice/browse/${TOPIC}$`));
  await expect(page.locator(`main[data-topic="${TOPIC}"]`)).toBeVisible();
  expect(await page.evaluate(() => window.__mark)).toBe(1);
});

test("back / forward around a detail page: detail → topic (client transition) → back → forward, no .txt", async ({ page }) => {
  await page.goto(`/ja/practice/q/${QID}`);
  await expect(page.locator(`article[id="${QID}"]`)).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.locator(`a[href="/ja/practice/browse/${TOPIC}"]`).first().click();
  await expect(page).toHaveURL(new RegExp(`/ja/practice/browse/${TOPIC}$`));
  await page.waitForLoadState("networkidle");
  await page.goBack();
  await expect(page).toHaveURL(new RegExp(`/ja/practice/q/${QID}$`));
  await expect(page.locator(`article[id="${QID}"]`)).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.goForward();
  await expect(page).toHaveURL(new RegExp(`/ja/practice/browse/${TOPIC}$`));
  await page.waitForLoadState("networkidle");
});
