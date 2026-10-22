// D-181 Task A2 — KeySettings first render (node env, renderToStaticMarkup, same
// approach as QuizFeedback.ssr.test.ts). Effects do not run in SSR, so this is the
// pre-mount markup: no key shown yet. Save / delete behaviour is covered in e2e.
import { describe, expect, it } from "vitest";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { readFileSync } from "node:fs";
import path from "node:path";

import { KeySettings } from "../KeySettings";

const NOTES = {
  ja: "保存先：このブラウザの localStorage のみ。サーバーには送信されません",
  zh: "保存位置：仅此浏览器的 localStorage，不会发送到服务器",
  en: "Stored only in this browser&#x27;s localStorage. It is never sent to our server.",
} as const;

function render(locale: keyof typeof NOTES): string {
  const messages = JSON.parse(
    readFileSync(path.resolve(__dirname, `../../../../messages/${locale}.json`), "utf-8"),
  );
  return renderToStaticMarkup(h(NextIntlClientProvider, { locale, messages, children: h(KeySettings) }));
}

describe("KeySettings SSR", () => {
  for (const locale of ["ja", "zh", "en"] as const) {
    it(`${locale}: password input without autocomplete + storage note`, () => {
      const html = render(locale);
      expect(html).toMatch(/<input[^>]*type="password"[^>]*autoComplete="off"/);
      expect(html).toContain(NOTES[locale]);
    });
  }

  it("shows no saved key and no delete button before mount", () => {
    const html = render("ja");
    expect(html).toContain("key は保存されていません");
    expect(html).not.toContain(">削除<");
  });
});
