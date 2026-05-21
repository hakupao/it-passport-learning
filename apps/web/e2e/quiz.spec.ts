// Phase 2 Step 15 — Quiz surface happy-path E2E (Session 48).
//
// 3 tests (ja / zh / en) verify:
//   - `/{locale}/quiz` loads through D-099 i18n routing.
//   - D-085 §2.4 quiz scope cards render with i18n badges + Explain CTA.
//   - Click → URL `?qid=...` pinned → <QuizExplain /> modal opens with busy
//     text in the chosen locale.
//   - Close (✕ button) clears `?qid=` and removes the modal.
//
// Scope: the modal-open path DOES fire the deepseek-reasoner stream on mount,
// but we close immediately. The `streamQuizExplain` AbortController in
// <QuizExplain /> aborts the fetch on cleanup. Even if the server completes
// before abort lands, DeepSeek prefix cache (Session 42 baseline 99.81% on
// `page_*_entity_0`) keeps each repeat call near-zero cost.

import { test, expect, type Page } from "@playwright/test";

interface LocaleFixture {
  locale: "ja" | "zh" | "en";
  listTitle: string;
  explain: string;
  busyText: string;
  closeLabel: string;
}

const LOCALES: readonly LocaleFixture[] = [
  {
    locale: "ja",
    listTitle: "IT パスポート — 問題集",
    explain: "解説を見る",
    busyText: "AI が回答を生成しています…（最長 約 30〜45 秒）",
    closeLabel: "閉じる",
  },
  {
    locale: "zh",
    listTitle: "IT 护照 — 题库",
    explain: "查看解析",
    busyText: "AI 正在生成回答…（最长约 30–45 秒）",
    closeLabel: "关闭",
  },
  {
    locale: "en",
    listTitle: "IT Passport — Quiz",
    explain: "Show explanation",
    busyText: "AI is composing the answer… (up to 30–45 s)",
    closeLabel: "Close",
  },
];

for (const f of LOCALES) {
  test(`quiz ${f.locale}: load + open explain modal + close`, async ({
    page,
  }: { page: Page }) => {
    await page.goto(`/${f.locale}/quiz`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(f.listTitle);

    // First Explain button on the page = first question card.
    const firstExplainBtn = page.getByRole("button", { name: f.explain }).first();
    await expect(firstExplainBtn).toBeVisible();
    await firstExplainBtn.click();

    // URL pins ?qid=...
    await expect(page).toHaveURL(/[?&]qid=/);

    // Modal opens.
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Busy text (locale-specific) appears.
    await expect(dialog.getByText(f.busyText, { exact: false })).toBeVisible({
      timeout: 5_000,
    });

    // Close via ✕ button — aria-labelled with locale close string.
    await dialog.getByRole("button", { name: f.closeLabel }).first().click();
    await expect(dialog).toBeHidden();

    // ?qid= is gone from the URL.
    await expect(page).not.toHaveURL(/[?&]qid=/);
  });
}
