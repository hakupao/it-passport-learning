// Glossary surface E2E — Stage 6 (D-179 / D-180 §0-3) Task 6.
//
// Covers the static trilingual dictionary:
//   - `/{locale}/glossary` answers 200 in ja / zh / en with the localized
//     `Glossary.title` <h1>; typing "ISO" into the search box narrows the list
//     (機能要件 drops out) and keeps `ISO/IEC 27000`; clicking it opens the
//     detail page with the JP headword in the <h1>.
//   - `/ja/glossary/<termId(機能要件)>` answers 200 and shows 2 sense blocks
//     (機能要件 is taught in two units — Review Focus 1).
//   - The detail page's past-exam links point to
//     `/quiz?mode=exam&id=<examId>#<questionId>`.
//   - Bad ids answer 404: a path-traversal-shaped id and a valid-shaped id that
//     is not in the dictionary (Review Focus 2).
//
// Term ids come from the real termId() (src/lib/glossary/termId.ts has no
// imports), so the spec never hard-codes hashes; i18n strings are read from
// messages/*.json so they cannot drift. Fixture headwords exist in the committed
// corpus (data/ip/textbook/units/*.json). No LLM call fires on this surface.
//
// Base URL: prod canonical by default; `PLAYWRIGHT_BASE_URL` overrides it for a
// local run (see playwright.config.ts).

import { test, expect, type Page } from "@playwright/test";

import en from "../messages/en.json";
import ja from "../messages/ja.json";
import zh from "../messages/zh.json";
import { termId } from "../src/lib/glossary/termId";

const LOCALES = [
  { locale: "ja", title: ja.Glossary.title },
  { locale: "zh", title: zh.Glossary.title },
  { locale: "en", title: en.Glossary.title },
] as const;

const ISO_TERM = "ISO/IEC 27000"; // strategy-02-08-u03; has past-exam questions
const MULTI_SENSE_TERM = "機能要件"; // taught in 2 units
const ISO_ID = termId(ISO_TERM);
const MULTI_ID = termId(MULTI_SENSE_TERM);

const termLink = (page: Page, id: string) => page.locator(`a[href$="/glossary/${id}"]`);

for (const f of LOCALES) {
  test(`glossary ${f.locale}: list 200 + search narrows + open detail`, async ({ page }) => {
    const res = await page.goto(`/${f.locale}/glossary`);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(f.title);

    const allItems = page.locator('a[href*="/glossary/t"]');
    const total = await allItems.count();
    await expect(termLink(page, MULTI_ID)).toHaveCount(1);

    // Retry the fill in case it lands before hydration wires up onChange.
    const search = page.getByRole("searchbox");
    await expect(async () => {
      await search.fill("ISO");
      await expect(termLink(page, MULTI_ID)).toHaveCount(0, { timeout: 1_000 });
    }).toPass();
    const isoLink = termLink(page, ISO_ID);
    await expect(isoLink).toHaveCount(1);
    await expect(isoLink).toContainText(ISO_TERM);
    expect(await allItems.count()).toBeLessThan(total);

    await isoLink.click();
    await expect(page).toHaveURL(new RegExp(`/${f.locale}/glossary/${ISO_ID}$`));
    await expect(page.getByRole("heading", { level: 1 })).toContainText(ISO_TERM);
  });
}

test(`glossary detail: ${MULTI_SENSE_TERM} shows 2 sense blocks`, async ({ page }) => {
  const res = await page.goto(`/ja/glossary/${MULTI_ID}`);
  expect(res?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(MULTI_SENSE_TERM);
  await expect(page.locator("main article")).toHaveCount(2);
});

test("glossary detail: question links carry exam id + #questionId", async ({ page }) => {
  const res = await page.goto(`/ja/glossary/${ISO_ID}`);
  expect(res?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(ISO_TERM);

  const qLinks = page.locator('a[href*="/quiz?mode=exam&id="]');
  expect(await qLinks.count()).toBeGreaterThan(0);
  for (const href of await qLinks.evaluateAll((as) => as.map((a) => a.getAttribute("href") ?? ""))) {
    expect(href).toMatch(/^\/ja\/quiz\?mode=exam&id=[^#&]+#.+$/);
  }
});

test("glossary detail: invalid ids answer 404", async ({ request }) => {
  for (const bad of ["..%2Fx", "t0000000000000000"]) {
    const res = await request.get(`/ja/glossary/${bad}`);
    expect(res.status(), bad).toBe(404);
  }
});
