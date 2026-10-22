// D-181 §0-8 / Review Focus 1 — the production CSP must not break any page.
//
// Opens each page, collects every `securitypolicyviolation` event (listener
// installed by addInitScript, so it is in place before any page script runs)
// and every console message mentioning Content Security Policy, and asserts
// none. Each response must carry the CSP header, so a run against a build
// without it fails instead of passing vacuously.
//
// Needs a production build (`next build` + `next start`, or the deployed app):
// next.config.ts only sets the header when NODE_ENV === "production".
// No LLM call fires on these pages (/sensei loads no AI SDK in Phase A); a guard
// routes api.anthropic.com in every test, so one that did would fail.
//
// Base URL: prod canonical by default; `PLAYWRIGHT_BASE_URL` overrides it for a
// local run (see playwright.config.ts).

import { test, expect } from "@playwright/test";

import { termId } from "../src/lib/glossary/termId";
import { guardAnthropic } from "./helpers/fakeAnthropic";

const PAGES = [
  "/ja",
  "/ja/textbook",
  "/ja/textbook/management-08-25-u01",
  "/ja/quiz",
  "/ja/quiz?mode=exam&id=2024r06",
  "/ja/glossary",
  `/ja/glossary/${termId("ISO/IEC 27000")}`,
  "/ja/sensei",
];

declare global {
  interface Window {
    __cspViolations?: string[];
  }
}

let unhandled: string[] = [];

test.beforeEach(async ({ page }) => {
  unhandled = await guardAnthropic(page);
});

test.afterEach(() => {
  expect(unhandled, "requests to api.anthropic.com").toEqual([]);
});

for (const path of PAGES) {
  test(`csp: no violation on ${path}`, async ({ page }) => {
    await page.addInitScript(() => {
      window.__cspViolations = [];
      document.addEventListener("securitypolicyviolation", (e) => {
        window.__cspViolations?.push(`${e.effectiveDirective} ${e.blockedURI}`);
      });
    });
    const consoleCsp: string[] = [];
    page.on("console", (msg) => {
      if (/Content[- ]Security[- ]Policy/i.test(msg.text())) consoleCsp.push(msg.text());
    });

    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    expect(res?.headers()["content-security-policy"]).toContain("connect-src 'self' https://api.anthropic.com");
    await page.waitForLoadState("networkidle");

    expect(await page.evaluate(() => window.__cspViolations)).toEqual([]);
    expect(consoleCsp).toEqual([]);
  });
}
