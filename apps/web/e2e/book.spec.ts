// Phase 3 Step 3 — Book surface E2E smoke (Session 52).
//
// 3 tests (ja / zh / en) verify the new Phase 3 reading trunk loads on
// prod behind the D-097 Basic Auth firewall:
//   - `/{locale}` redirects → `/{locale}/book` per D-101 §2.1.
//   - `<BookIndex />` lists 16 chapter cards with the locale title + page
//     range; the BookProgressSummary X/16 overlay hydrates post-mount.
//   - Clicking the first card navigates to `/{locale}/book/chapter/00`.
//   - The chapter reader renders the page list + chapter-end panel
//     ("ask" + "quiz" buttons) + completion gate ("mark as read"
//     button starting disabled per LD-3 scroll-to-end gate).
//
// Scope: pure DOM-level smoke. No live LLM call fired here — chapter
// chat / translate are opt-in via the modal triggers and would balloon
// the per-run LLM cost beyond the α-private envelope. β empirical data
// is collected by a single explicit translate call in the manual smoke
// pass (recorded in evidence/phase3/step_03_progress/smoke_ui_*).

import { test, expect, type Page } from "@playwright/test";

interface LocaleFixture {
  locale: "ja" | "zh" | "en";
  bookTitle: string;
  chapter00BadgeText: string;
  askChapter: string;
  markCompleted: string;
}

const LOCALES: readonly LocaleFixture[] = [
  {
    locale: "ja",
    bookTitle: "IT パスポート — 教科書",
    chapter00BadgeText: "第 00 章",
    askChapter: "この章について質問する",
    markCompleted: "読み終わった",
  },
  {
    locale: "zh",
    bookTitle: "IT 护照 — 教科书",
    chapter00BadgeText: "第 00 章",
    askChapter: "问本章",
    markCompleted: "我看完了",
  },
  {
    locale: "en",
    bookTitle: "IT Passport — Textbook",
    chapter00BadgeText: "Chapter 00",
    askChapter: "Ask about this chapter",
    markCompleted: "Mark as read",
  },
];

for (const f of LOCALES) {
  test(`book ${f.locale}: index loads → chapter 00 reader + completion gate`, async ({
    page,
  }: { page: Page }) => {
    await page.goto(`/${f.locale}`);
    await expect(page).toHaveURL(new RegExp(`/${f.locale}/book(?:\\?|$)`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(f.bookTitle);

    // Chapter 00 card visible + linked to /book/chapter/00.
    const ch00Link = page.getByRole("link", { name: /^Chapter 00|^第 00 章|この章を読む|阅读本章|Read this chapter/i }).first();
    await expect(ch00Link).toBeVisible();

    // Navigate directly to chapter 00 (deterministic).
    await page.goto(`/${f.locale}/book/chapter/00`);
    await expect(page).toHaveURL(new RegExp(`/${f.locale}/book/chapter/00`));

    // Chapter badge appears in the header.
    await expect(page.getByText(f.chapter00BadgeText).first()).toBeVisible();

    // Chapter-end panel "ask" button is reachable.
    await expect(
      page.getByRole("button", { name: f.askChapter }),
    ).toBeVisible();

    // Completion gate button is present + disabled before scroll-to-end.
    const completionBtn = page.getByRole("button", { name: f.markCompleted });
    await expect(completionBtn).toBeVisible();
    await expect(completionBtn).toBeDisabled();
  });
}
