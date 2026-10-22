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
// No LLM call fires on these pages by themselves; a guard routes api.anthropic.com
// in every test, so one that did would fail.
// D-181 Phase C: on the glossary term page and the textbook unit page the test also
// opens the 「AI 先生に聞く」 panel and sends one question to the fake Anthropic API
// (helpers/fakeAnthropic.ts), so the lazily loaded AI SDK and the rendered reply are
// checked under the CSP too. On /sensei (Task C2) it sends one free question
// naming a dictionary term (so /api/sensei/terms is fetched too) and waits for the
// rendered reply.
//
// Base URL: prod canonical by default; `PLAYWRIGHT_BASE_URL` overrides it for a
// local run (see playwright.config.ts).

import { test, expect } from "@playwright/test";

import { termId } from "../src/lib/glossary/termId";
import ja from "../messages/ja.json";
import { fakeAnthropic, guardAnthropic } from "./helpers/fakeAnthropic";

const TERM_PAGE = `/ja/glossary/${termId("ISO/IEC 27000")}`;
const UNIT_PAGE = "/ja/textbook/management-08-25-u01";
/** Pages with a 「AI 先生に聞く」 button: the panel is opened and a fake reply rendered. */
const ASK_PAGES = new Set([TERM_PAGE, UNIT_PAGE]);
const FREE_PAGE = "/ja/sensei";
const REPLY_MARK = "後入れ先出し（LIFO）です。"; // helpers/fakeAnthropic DEFAULT_REPLY

const PAGES = [
  "/ja",
  "/ja/textbook",
  UNIT_PAGE,
  "/ja/quiz",
  "/ja/quiz?mode=exam&id=2024r06",
  "/ja/glossary",
  TERM_PAGE,
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
  const ask = ASK_PAGES.has(path);
  const free = path === FREE_PAGE;
  const label = ask ? " (AI 先生 panel open, reply rendered)" : free ? " (free question sent, reply rendered)" : "";
  test(`csp: no violation on ${path}${label}`, async ({ page }) => {
    const fake = ask || free ? await fakeAnthropic(page) : null;
    if (fake) {
      await page.addInitScript(
        (key) => localStorage.setItem("itp:sensei:key:v1", JSON.stringify({ provider: "anthropic", apiKey: key, savedAt: "2026-10-01T00:00:00.000Z" })),
        "sk-ant-test-0000000000000000wxyz",
      );
    }
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

    if (fake && free) {
      await page.getByLabel(ja.Sensei.freeLabel).fill("ISO/IEC 27000 とは何ですか");
      await page.getByTestId("sensei-free-send").click();
      await expect(page.getByRole("dialog").getByTestId("sensei-log")).toContainText(REPLY_MARK);
      expect(fake.requests).toHaveLength(1);
      expect(JSON.stringify(fake.requests[0]!.body.system)).toContain("- ISO/IEC 27000: "); // the card came from /api/sensei/terms
    }
    if (fake && ask) {
      await page.getByTestId("ask-sensei").click();
      const panel = page.getByRole("dialog");
      await panel.getByLabel(ja.Sensei.inputLabel).fill("この内容を説明してください");
      await panel.getByRole("button", { name: ja.Sensei.send }).click();
      await expect(panel.getByTestId("sensei-log")).toContainText(REPLY_MARK);
      expect(fake.requests).toHaveLength(1);
    }

    expect(await page.evaluate(() => window.__cspViolations)).toEqual([]);
    expect(consoleCsp).toEqual([]);
  });
}
