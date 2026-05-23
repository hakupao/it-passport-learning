// Phase 4 Module D Step D.1 — Tutor surface happy-path E2E (Session 58).
//
// 3 tests (ja / zh / en) verify:
//   - Page loads through D-099 i18n routing at `/{locale}/tutor`.
//   - D-097 firewall passes (Basic Auth header carried by `extraHTTPHeaders`).
//   - Localized chrome strings render from `messages/{locale}.json`.
//   - User-submit path works end-to-end: typing → send → user bubble appears.
//   - TutorContext snapshot (D-106 §2.3) + escalation heuristic (D-106 §2.4)
//     are exercised transparently — the component loads empty progress from
//     localStorage (fresh browser context) and sends it as body alongside the
//     message via ChatRequestOptions.body.
//
// Same scope discipline as chat.spec.ts: no waiting on the full streamed
// response — only that the SSE pipe opened correctly.

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
    title: "IT パスポート — 学習助手",
    send: "送信",
    inputAriaLabel: "メッセージ入力",
    prompt: "ネットワーク層とトランスポート層の違いを教えて",
  },
  {
    locale: "zh",
    title: "IT 护照 — 学习助手",
    send: "发送",
    inputAriaLabel: "消息输入",
    prompt: "网络层和传输层有什么区别？",
  },
  {
    locale: "en",
    title: "IT Passport — Study Tutor",
    send: "Send",
    inputAriaLabel: "Message input",
    prompt: "What is the difference between the network and transport layers?",
  },
];

for (const f of LOCALES) {
  test(`tutor ${f.locale}: load + send happy path`, async ({ page }: { page: Page }) => {
    await page.goto(`/${f.locale}/tutor`);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(f.title);

    const input = page.getByRole("textbox", { name: f.inputAriaLabel });
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();

    const sendBtn = page.getByRole("button", { name: f.send });
    await expect(sendBtn).toBeVisible();

    await input.fill(f.prompt);
    await sendBtn.click();

    await expect(page.getByText(f.prompt, { exact: false }).first()).toBeVisible({
      timeout: 5_000,
    });

    await expect(page.locator('[aria-busy="true"]').first()).toBeVisible({
      timeout: 5_000,
    });
  });
}
