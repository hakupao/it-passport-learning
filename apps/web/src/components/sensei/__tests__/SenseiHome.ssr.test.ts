// D-181 Task A5 — /sensei body, first render (node env, renderToStaticMarkup, as
// KeySettings.ssr.test.ts). Effects do not run in SSR: no key and no thread list
// yet, so the how-to-get-a-key note is shown and the free question cannot be sent
// yet. The AI SDK is not rendered here (the panel is lazy). Interaction is covered in e2e.
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

import { MAX_THREADS } from "@/lib/sensei/threadStore";

import { SenseiHome } from "../SenseiHome";

const TERM_INDEX = [["機能要件", "功能需求", "Functional requirement"]];

function render(locale: "ja" | "zh" | "en"): { html: string; s: Record<string, string> } {
  const messages = JSON.parse(
    readFileSync(path.resolve(__dirname, `../../../../messages/${locale}.json`), "utf-8"),
  );
  const html = renderToStaticMarkup(
    h(NextIntlClientProvider, { locale, messages, children: h(SenseiHome, { termIndex: TERM_INDEX }) }),
  );
  return { html, s: messages.Sensei };
}

const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/'/g, "&#x27;").replace(/"/g, "&quot;");

describe("SenseiHome SSR", () => {
  for (const locale of ["ja", "zh", "en"] as const) {
    it(`${locale}: key settings, the console link, the free-question input (enabled; send disabled until a key is read)`, () => {
      const { html, s } = render(locale);
      expect(html).toContain('data-testid="sensei-key-settings"');
      expect(html).toMatch(
        /<a href="https:\/\/console\.anthropic\.com\/settings\/keys" target="_blank" rel="noopener noreferrer"/,
      );
      expect(html).toContain(esc(s.keyHowToLink!));
      expect(s.comingSoon).toBeUndefined();
      expect(html).not.toContain("sensei-coming-soon");
      expect(html).toContain(esc(s.freeHint!));
      expect(html).toMatch(/<textarea[^>]*data-testid="sensei-free-input"/);
      expect(html).not.toMatch(/<textarea[^>]*disabled=""/);
      const send = /<button[^>]*data-testid="sensei-free-send"[^>]*>/.exec(html)?.[0] ?? "";
      expect(send).toContain('disabled=""');
      expect(html).toContain(esc(s.threadsTitle!));
    });
  }

  for (const locale of ["ja", "zh", "en"] as const) {
    it(`${locale}: the thread note shows MAX_THREADS through the {max} param (M3)`, () => {
      const { html, s } = render(locale);
      expect(s.threadsNote).toContain("{max}");
      const note = esc(s.threadsNote!.replace("{max}", String(MAX_THREADS)));
      expect(html).toContain(note);
      expect(html).not.toContain("{max}");
    });
  }

  for (const locale of ["ja", "zh", "en"] as const) {
    it(`${locale}: the intro and the empty state name every entry point (m1)`, () => {
      const { s } = render(locale);
      const messages = JSON.parse(readFileSync(path.resolve(__dirname, `../../../../messages/${locale}.json`), "utf-8"));
      for (const key of ["pageIntro", "threadsEmpty"]) {
        // question / term / unit share the 「AI 先生に聞く」 button; review; the free question
        expect(s[key], key).toContain(messages.Sensei.askButton);
        expect(s[key], key).toContain(s.reviewTitle);
        expect(s[key], key).toContain(s.freeTitle);
      }
      expect(s.threadsEmpty).not.toMatch(/答えたあと|答题后|After answering/);
    });
  }

  it("the disabled Send is described by the key-missing reason (C2 M6); the form is not busy", () => {
    for (const locale of ["ja", "zh", "en"] as const) {
      const { html, s } = render(locale);
      const send = /<button[^>]*data-testid="sensei-free-send"[^>]*>/.exec(html)?.[0] ?? "";
      const describedBy = /aria-describedby="([^"]+)"/.exec(send)?.[1];
      expect(describedBy, locale).toBeTruthy();
      expect(html).toContain(`id="${describedBy}"`);
      const at = html.indexOf(`id="${describedBy}"`);
      const reason = html.slice(html.indexOf(">", at) + 1, html.indexOf("<", at));
      expect(reason, locale).toBe(esc(s.keyMissing!));
      expect(html).toMatch(/<form[^>]*aria-busy="false"/);
      expect(html).not.toMatch(/<textarea[^>]*readonly/i);
    }
  });

  it("has a dedicated notice for a free thread that cannot be reopened (C2 M3), distinct from the terms-load failure", () => {
    for (const locale of ["ja", "zh", "en"] as const) {
      const { s } = render(locale);
      expect(s.threadMissing, locale).toBeTruthy();
      expect(s.threadMissing).not.toBe(s.freeTermsFailed);
    }
    expect(render("ja").s.threadMissing).toContain("最初の質問が見つからない");
  });

    it("renders no thread rows and no empty state before the index is read", () => {
    const { html } = render("ja");
    expect(html).not.toContain('data-testid="sensei-thread"');
    expect(html).not.toContain('data-testid="sensei-threads-empty"');
  });
});
