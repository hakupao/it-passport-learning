// Phase 2 Step 15 — D-097 firewall E2E (Session 48, optional per Q1=a).
//
// 2 tests validate D-097 Edge middleware Basic Auth:
//   - WITHOUT Authorization header → 401 + WWW-Authenticate: Basic.
//   - WITH valid Authorization header → 200 on the same URL.
//
// Uses `request` fixture (raw HTTP, no browser context) so we can issue calls
// with explicit header overrides. The default `request` context inherits
// `use.extraHTTPHeaders` from the project config; we strip those for the
// no-auth case via `request.newContext({ extraHTTPHeaders: {} })`.
//
// Per Session 44 obs §iv: `vercel logs --grep '[tripwire]'` is suppressed by
// the auto-mode classifier, so we can't verify the firewall server-side log.
// HTTP status code + WWW-Authenticate header is the authoritative client-side
// signal.

import { test, expect, request as pwRequest } from "@playwright/test";

const PROD_CANONICAL =
  process.env.PLAYWRIGHT_BASE_URL ?? "https://web-mu-sandy-78.vercel.app";

test("firewall: 401 without Authorization header", async () => {
  const ctx = await pwRequest.newContext({ extraHTTPHeaders: {} });
  try {
    const res = await ctx.get(`${PROD_CANONICAL}/ja/chat`, {
      maxRedirects: 0,
    });
    expect(res.status()).toBe(401);
    expect(res.headers()["www-authenticate"] ?? "").toMatch(/^Basic\b/);
  } finally {
    await ctx.dispose();
  }
});

test("firewall: 200 with valid Authorization header", async ({ request }) => {
  // `request` inherits `extraHTTPHeaders` from playwright.config.ts use.
  const res = await request.get(`${PROD_CANONICAL}/ja/chat`);
  expect(res.status()).toBe(200);
});
