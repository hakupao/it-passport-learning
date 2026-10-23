// Stage 7 Task 7 fix round 1 (D-189 §3.2) — the site font really applies.
// next/font defines --font-biz / --font-sc on the element that carries its
// `.variable` class, while Tailwind's --font-sans / --default-font-family resolve
// on :root, so the classes must sit on <html>. A declaration check cannot see a
// var() that resolves to nothing; this measures the computed style and the
// loaded font faces in the browser.
import { expect, test } from "@playwright/test";

async function fontState(page: import("@playwright/test").Page): Promise<{ body: string; loaded: string[] }> {
  return page.evaluate(async () => {
    await document.fonts.ready;
    const loaded: string[] = [];
    document.fonts.forEach((f) => {
      if (f.status === "loaded") loaded.push(f.family.replace(/^["']|["']$/g, ""));
    });
    return { body: getComputedStyle(document.body).fontFamily, loaded };
  });
}

test("ja: body font is BIZ UDPGothic and a BIZ UDPGothic face is loaded", async ({ page }) => {
  await page.goto("/ja/glossary");
  const { body, loaded } = await fontState(page);
  expect(body).toMatch(/^"?BIZ UDPGothic"?,/);
  expect(loaded).toContain("BIZ UDPGothic");
});

test("zh: the computed stack falls back to Noto Sans SC after BIZ UDPGothic", async ({ page }) => {
  await page.goto("/zh/glossary");
  const { body } = await fontState(page);
  expect(body).toMatch(/^"?BIZ UDPGothic"?,/);
  expect(body).toContain("Noto Sans SC");
});
