// Phase 2 Step 15 — Chat surface happy-path E2E (Session 48).
//
// 3 tests (ja / zh / en) verify:
//   - Page loads through D-099 i18n routing at `/{locale}/chat`.
//   - D-097 firewall passes (Basic Auth header carried by `extraHTTPHeaders`).
//   - Localized chrome strings render from `messages/{locale}.json`.
//   - User-submit path works end-to-end: typing → send → user bubble appears.
//
// Scope discipline: no waiting on the streamed AI response — that path is
// already covered by Sessions 41-44 + 47 Chrome DevTools MCP smokes. Playwright
// here validates the UI plumbing layer (i18n + firewall + form submit). Each
// test still fires one LLM call (`useChat` sends on submit); DeepSeek
// stable-prefix cache (D-088 §2.3) keeps the 3 calls at ≥95% hit since the
// prompt body is identical across locales.

import { test, expect, type Page } from "@playwright/test";

interface LocaleFixture {
  locale: "ja" | "zh" | "en";
  title: string;
  send: string;
  inputAriaLabel: string;
  prompt: string;
}

const LOCALES: readonly LocaleFixture[] = [
  {
    locale: "ja",
    title: "IT パスポート — Chat",
    send: "送信",
    inputAriaLabel: "メッセージ入力",
    prompt: "DNS とは何か？",
  },
  {
    locale: "zh",
    title: "IT 护照 — 对话",
    send: "发送",
    inputAriaLabel: "消息输入",
    prompt: "DNS とは何か？",
  },
  {
    locale: "en",
    title: "IT Passport — Chat",
    send: "Send",
    inputAriaLabel: "Message input",
    prompt: "DNS とは何か？",
  },
];

for (const f of LOCALES) {
  test(`chat ${f.locale}: load + send happy path`, async ({ page }: { page: Page }) => {
    await page.goto(`/${f.locale}/chat`);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(f.title);

    const input = page.getByRole("textbox", { name: f.inputAriaLabel });
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();

    const sendBtn = page.getByRole("button", { name: f.send });
    await expect(sendBtn).toBeVisible();

    await input.fill(f.prompt);
    await sendBtn.click();

    // User bubble appears immediately (client-side, no network round-trip).
    await expect(page.getByText(f.prompt, { exact: false }).first()).toBeVisible({
      timeout: 5_000,
    });

    // Streaming indicator OR a response bubble must appear within the timeout.
    // We don't wait for completion — only that the SSE pipe opened correctly.
    await expect(page.locator('[aria-busy="true"]').first()).toBeVisible({
      timeout: 5_000,
    });
  });
}
