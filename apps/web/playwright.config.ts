// Phase 2 Step 15 — Playwright E2E config (Session 48).
//
// Targets the **prod canonical** alias `web-mu-sandy-78.vercel.app` because:
//   - Session 44 obs §ii: preview URLs `*-bojiangs-projects.vercel.app` are
//     intercepted by Vercel team-level SSO Protection (separate from D-097
//     application Basic Auth firewall). Tests issued at preview URLs see an
//     SSO redirect, not the app. The prod alias serves the actual app behind
//     D-097 Basic Auth.
//   - Session 47 close Q1=a locks Playwright Medium = 9 happy-path tests
//     against prod with Basic Auth header injection.
//
// Auth strategy: read `FIREWALL_BASIC_AUTH` (base64 of `user:pass`) from the
// process env or from `apps/web/.env.local`. Inject as `Authorization: Basic
// <token>` on every request via `use.extraHTTPHeaders`. Chrome carries this
// for sub-resource fetches, so the SPA's AI SDK calls inherit it too.

import * as fs from "node:fs";
import * as path from "node:path";
import { defineConfig, devices } from "@playwright/test";

function loadEnvLocal(): Record<string, string> {
  const envPath = path.resolve(__dirname, ".env.local");
  if (!fs.existsSync(envPath)) return {};
  const out: Record<string, string> = {};
  for (const raw of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const line = raw.trimStart();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    out[key] = value;
  }
  return out;
}

const envLocal = loadEnvLocal();
const FIREWALL_BASIC_AUTH =
  process.env.FIREWALL_BASIC_AUTH ?? envLocal.FIREWALL_BASIC_AUTH ?? "";

if (!FIREWALL_BASIC_AUTH) {
  console.warn(
    "[playwright.config] FIREWALL_BASIC_AUTH not set; tests requiring auth will see 401.",
  );
}

const PROD_CANONICAL = "https://web-mu-sandy-78.vercel.app";
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? PROD_CANONICAL;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1, // serial — gentle on prod LLM cost envelope; total LLM calls ≤9.
  retries: 1,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [
    ["list"],
    ["json", { outputFile: "playwright-report/results.json" }],
    ["html", { open: "never", outputFolder: "playwright-report/html" }],
  ],
  use: {
    baseURL: BASE_URL,
    extraHTTPHeaders: FIREWALL_BASIC_AUTH
      ? { Authorization: `Basic ${FIREWALL_BASIC_AUTH}` }
      : undefined,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
    ignoreHTTPSErrors: false,
  },
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
