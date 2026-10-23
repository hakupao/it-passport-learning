// Stage 7 Phase 1 Task 13 — the legacy /quiz page: a static client redirect (DESIGN §4).
// SSR (no effects): the one-line notice + a plain link (no-JS fallback; before the effect has read
// location it points at the browse page). The page route itself stays static (no force-dynamic,
// no server data) and never writes a review intent.
import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, locale, children }: { href: string; locale?: string; children: React.ReactNode }) =>
    h("a", { href: `/${locale ?? "_"}${href}` }, children),
  useRouter: () => ({ replace: () => {} }),
}));
vi.mock("next-intl/server", () => ({ setRequestLocale: () => {}, getTranslations: async () => (k: string) => k }));

import { LegacyQuizRedirect } from "../LegacyQuizRedirect";
import * as quizPage from "@/app/[locale]/quiz/page";

const messages = (l: string): Record<string, Record<string, string>> =>
  JSON.parse(readFileSync(path.resolve(__dirname, `../../../../messages/${l}.json`), "utf-8"));

describe("LegacyQuizRedirect (SSR)", () => {
  for (const locale of ["ja", "zh", "en"] as const) {
    it(`${locale}: one notice line and a plain link to the browse page`, () => {
      const P = messages(locale).Practice!;
      const out = renderToStaticMarkup(
        h(NextIntlClientProvider, { locale, messages: messages(locale), children: h(LegacyQuizRedirect, { locale }) }),
      );
      expect(out).toContain(P.legacyMoving);
      expect(out).toMatch(new RegExp(`<a href="/${locale}/practice/browse">${P.legacyOpen}</a>`));
      expect(out).toContain('role="status"');
    });
  }

  it("never writes a review intent (a bookmarked ?review=1 must not auto-send)", () => {
    const src = readFileSync(path.resolve(__dirname, "../LegacyQuizRedirect.tsx"), "utf-8");
    expect(src).not.toMatch(/reviewIntent|writeReviewIntent|sessionStorage|localStorage/);
  });
});

describe("/[locale]/quiz route", () => {
  it("is static-friendly: no force-dynamic, no searchParams / cookies, renders the redirect", async () => {
    expect((quizPage as Record<string, unknown>).dynamic).toBeUndefined();
    const src = readFileSync(path.resolve(__dirname, "../../../app/[locale]/quiz/page.tsx"), "utf-8").replace(/\/\/.*$/gm, "");
    expect(src).not.toMatch(/searchParams|cookies|force-dynamic|quizReader/);
    const el = (await quizPage.default({ params: Promise.resolve({ locale: "zh" }) })) as React.ReactElement<{
      locale: string;
    }>;
    expect(el.type).toBe(LegacyQuizRedirect);
    expect(el.props.locale).toBe("zh");
  });
});
