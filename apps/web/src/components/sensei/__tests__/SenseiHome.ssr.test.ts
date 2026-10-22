// D-181 Task A5 — /sensei body, first render (node env, renderToStaticMarkup, as
// KeySettings.ssr.test.ts). Effects do not run in SSR: no key and no thread list
// yet, so the how-to-get-a-key note is shown. Interaction is covered in e2e.
import { describe, expect, it, vi } from "vitest";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { readFileSync } from "node:fs";
import path from "node:path";

// next-intl's navigation cannot load under vitest (same mock as the other SSR tests);
// no row renders before mount, so the Link is never actually rendered here.
vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => h("a", { href }, children),
}));

import { SenseiHome } from "../SenseiHome";

function render(locale: "ja" | "zh" | "en"): { html: string; s: Record<string, string> } {
  const messages = JSON.parse(
    readFileSync(path.resolve(__dirname, `../../../../messages/${locale}.json`), "utf-8"),
  );
  const html = renderToStaticMarkup(h(NextIntlClientProvider, { locale, messages, children: h(SenseiHome) }));
  return { html, s: messages.Sensei };
}

const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/'/g, "&#x27;").replace(/"/g, "&quot;");

describe("SenseiHome SSR", () => {
  for (const locale of ["ja", "zh", "en"] as const) {
    it(`${locale}: key settings, the console link, the disabled free-question input (coming soon)`, () => {
      const { html, s } = render(locale);
      expect(html).toContain('data-testid="sensei-key-settings"');
      expect(html).toMatch(
        /<a href="https:\/\/console\.anthropic\.com\/settings\/keys" target="_blank" rel="noopener noreferrer"/,
      );
      expect(html).toContain(esc(s.keyHowToLink!));
      expect(html).toContain(esc(s.comingSoon!));
      expect(html).toMatch(/<textarea[^>]*disabled=""/);
      expect(html).toContain(esc(s.threadsTitle!));
    });
  }

  it("renders no thread rows and no empty state before the index is read", () => {
    const { html } = render("ja");
    expect(html).not.toContain('data-testid="sensei-thread"');
    expect(html).not.toContain('data-testid="sensei-threads-empty"');
  });
});
