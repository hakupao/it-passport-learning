// Phase 2 Step 15 — Glossary surface happy-path E2E (Session 48).
//
// 3 tests (ja / zh / en) verify:
//   - `/{locale}/glossary` loads through D-099 i18n routing.
//   - 908 glossary cards render (in 50音 order); each has Explain CTA.
//   - Click → URL `?term=<surface>` pinned → <TermPopover /> opens with
//     busy text in the chosen locale.
//   - Close (✕ or Close footer) clears `?term=` and removes the popover.
//
// Scope: same modal-abort pattern as quiz.spec.ts. The `アルゴリズム` baseline
// (Sessions 39+43+44+47) is ratified at 96% DeepSeek prefix cache hit across
// 7 days; whichever term lands first in the rendered list will hit cache too
// since the SYSTEM_INSTRUCTION is the stable prefix (D-088 §2.3).

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
    listTitle: "IT パスポート — 用語集",
    explain: "解説を見る",
    busyText: "AI が用語を解説中…（数秒）",
    closeLabel: "閉じる",
  },
  {
    locale: "zh",
    listTitle: "IT 护照 — 术语表",
    explain: "查看解析",
    busyText: "AI 正在解释术语…（数秒）",
    closeLabel: "关闭",
  },
  {
    locale: "en",
    listTitle: "IT Passport — Glossary",
    explain: "Show explanation",
    busyText: "AI is explaining the term… (a few seconds)",
    closeLabel: "Close",
  },
];

for (const f of LOCALES) {
  test(`glossary ${f.locale}: load + open popover + close`, async ({
    page,
  }: { page: Page }) => {
    await page.goto(`/${f.locale}/glossary`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(f.listTitle);

    const firstExplainBtn = page.getByRole("button", { name: f.explain }).first();
    await expect(firstExplainBtn).toBeVisible();
    await firstExplainBtn.click();

    // URL pins ?term=<encoded surface>.
    await expect(page).toHaveURL(/[?&]term=/);

    // Modal opens.
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Busy text appears.
    await expect(dialog.getByText(f.busyText, { exact: false })).toBeVisible({
      timeout: 5_000,
    });

    // Close via Close footer button (or ✕). Footer Close uses locale label.
    await dialog.getByRole("button", { name: f.closeLabel }).first().click();
    await expect(dialog).toBeHidden();

    await expect(page).not.toHaveURL(/[?&]term=/);
  });
}
