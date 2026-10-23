// Stage 7 Task 7 (D-189 §3.4) — the single AppShell that replaces the three theme
// shells. Same SSR approach as the other *.ssr.test.ts (node env, renderToStaticMarkup,
// createElement instead of JSX, NextIntlClientProvider with the real catalogs).
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { readFileSync } from "node:fs";
import path from "node:path";

// next-intl's navigation cannot load under vitest; the Link mock prints the
// locale-prefixed href the real Link would produce (and flags a replace navigation).
const nav = vi.hoisted(() => ({ pathname: "/", locale: "ja" }));
vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    locale,
    replace,
    children,
    ...rest
  }: {
    href: string;
    locale?: string;
    replace?: boolean;
    children: React.ReactNode;
  }) =>
    h(
      "a",
      { href: `/${locale ?? nav.locale}${href === "/" ? "" : href}`, "data-replace": replace ? "true" : undefined, ...rest },
      children,
    ),
  usePathname: () => nav.pathname,
}));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams() }));

import { AppShell } from "../AppShell";
import { APP_NAV, isNavActive } from "../AppNav";

type Locale = "ja" | "zh" | "en";

function messages(locale: Locale): Record<string, Record<string, unknown>> {
  return JSON.parse(readFileSync(path.resolve(__dirname, `../../../../messages/${locale}.json`), "utf-8"));
}

function render(locale: Locale, pathname = "/"): string {
  nav.pathname = pathname;
  nav.locale = locale;
  return renderToStaticMarkup(
    h(NextIntlClientProvider, {
      locale,
      messages: messages(locale),
      children: h(AppShell, { children: h("p", { id: "page-body" }, "BODY") }),
    }),
  );
}

/** The <a> tags inside the main <nav>, in document order. */
function navLinks(html: string): Array<{ tag: string; text: string }> {
  const navHtml = /<nav[^>]*>([\s\S]*?)<\/nav>/.exec(html)?.[1] ?? "";
  return [...navHtml.matchAll(/<a([^>]*)>([\s\S]*?)<\/a>/g)].map((m) => ({
    tag: m[1] ?? "",
    text: (m[2] ?? "").replace(/<[^>]+>/g, ""),
  }));
}

beforeEach(() => {
  nav.pathname = "/";
  nav.locale = "ja";
});

describe("APP_NAV / isNavActive", () => {
  it("Phase 1 nav = today / practice / textbook / glossary", () => {
    expect(APP_NAV).toEqual([
      { href: "/", key: "today" },
      { href: "/practice", key: "practice" },
      { href: "/textbook", key: "textbook" },
      { href: "/glossary", key: "glossary" },
    ]);
  });

  it("isNavActive: /practice matches /practice/**; / only matches the home page (locale-prefixed paths)", () => {
    expect(isNavActive("/ja/practice/mistakes", "/practice")).toBe(true);
    expect(isNavActive("/ja/practice", "/")).toBe(false);
    expect(isNavActive("/ja/practice", "/practice")).toBe(true);
    expect(isNavActive("/ja", "/")).toBe(true);
    expect(isNavActive("/zh/", "/")).toBe(true);
    expect(isNavActive("/en/glossary/t1", "/glossary")).toBe(true);
    expect(isNavActive("/ja/practicex", "/practice")).toBe(false);
  });

  it("isNavActive: the same on next-intl's locale-less pathname", () => {
    expect(isNavActive("/practice/mistakes", "/practice")).toBe(true);
    expect(isNavActive("/practice", "/")).toBe(false);
    expect(isNavActive("/", "/")).toBe(true);
    expect(isNavActive("/", "/practice")).toBe(false);
    expect(isNavActive("/textbook/U01", "/textbook")).toBe(true);
    expect(isNavActive("/textbook/U01", "/glossary")).toBe(false);
    // a path segment that merely starts with a locale code is not a locale prefix
    expect(isNavActive("/japan", "/")).toBe(false);
  });
});

describe("AppShell SSR", () => {
  const EXPECTED: Record<Locale, string[]> = {
    ja: ["今日", "練習", "教科書", "辞典"],
    zh: ["今日", "练习", "教科书", "辞典"],
    en: ["Today", "Practice", "Textbook", "Glossary"],
  };

  for (const locale of ["ja", "zh", "en"] as const) {
    it(`${locale}: renders 4 nav links in order ${EXPECTED[locale].join("/")}`, () => {
      const links = navLinks(render(locale));
      expect(links.map((l) => l.text)).toEqual(EXPECTED[locale]);
      expect(links.map((l) => /href="([^"]*)"/.exec(l.tag)?.[1])).toEqual([
        `/${locale}`,
        `/${locale}/practice`,
        `/${locale}/textbook`,
        `/${locale}/glossary`,
      ]);
    });
  }

  it("the nav has a localized accessible name", () => {
    for (const locale of ["ja", "zh", "en"] as const) {
      const label = (messages(locale).App as { navLabel: string }).navLabel;
      expect(render(locale)).toContain(`<nav aria-label="${label}"`);
    }
  });

  it('active item has aria-current="page" (exactly one; / is not active on /practice/**)', () => {
    const links = navLinks(render("ja", "/practice/mistakes"));
    const current = links.filter((l) => l.tag.includes('aria-current="page"'));
    expect(current.map((l) => l.text)).toEqual(["練習"]);

    const home = navLinks(render("ja", "/")).filter((l) => l.tag.includes('aria-current="page"'));
    expect(home.map((l) => l.text)).toEqual(["今日"]);

    const sensei = navLinks(render("ja", "/sensei")).filter((l) => l.tag.includes('aria-current="page"'));
    expect(sensei).toEqual([]);
  });

  it("no 记录 link in Phase 1 (and no mock-exam / sensei entry in the top nav)", () => {
    for (const locale of ["ja", "zh", "en"] as const) {
      const html = render(locale);
      expect(html).not.toMatch(/记录|記録|Records?\b|History|模拟|模試/);
      expect(html).not.toMatch(/href="\/[a-z]{2}\/(record|records|history|exam|mock|sensei)\b/);
      expect(navLinks(html)).toHaveLength(4);
    }
  });

  it("settings link present", () => {
    for (const locale of ["ja", "zh", "en"] as const) {
      const html = render(locale);
      const label = (messages(locale).App as { settings: string }).settings;
      expect(html).toMatch(new RegExp(`<a[^>]*href="/${locale}/settings"[^>]*>${label}</a>`));
    }
  });

  it("site name is ITパスポート 過去問ノート and no IPA logo / iパス", () => {
    for (const locale of ["ja", "zh", "en"] as const) {
      const html = render(locale);
      expect((messages(locale).App as { siteName: string }).siteName).toBe("ITパスポート 過去問ノート");
      expect(html).toContain("ITパスポート 過去問ノート");
      expect(html).not.toMatch(/iパス|IPA|<img|<svg/);
    }
  });

  it("language switch reads 日 / 中 / EN; the current one is bold with aria-current, the others keep the path", () => {
    const html = render("zh", "/glossary/t1");
    const group = /<div[^>]*role="group"[^>]*>([\s\S]*?)<\/div>/.exec(html)?.[0] ?? "";
    expect(group.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()).toBe("日 / 中 / EN");
    expect(group).toMatch(/<strong[^>]*aria-current="true"[^>]*>中<\/strong>/);
    expect(group).toMatch(/<a[^>]*href="\/ja\/glossary\/t1"[^>]*>日<\/a>/);
    expect(group).toMatch(/<a[^>]*href="\/en\/glossary\/t1"[^>]*>EN<\/a>/);
    // same mechanics as the old <select>: a replace navigation, not a new history entry
    expect(group.match(/data-replace="true"/g)).toHaveLength(2);
    expect(group).not.toMatch(/<select|🌐/);
  });

  it("children render inside the content frame after the header; skip link targets it", () => {
    const html = render("ja", "/textbook");
    expect(html.indexOf("</header>")).toBeGreaterThan(-1);
    expect(html.indexOf('id="page-body"')).toBeGreaterThan(html.indexOf("</header>"));
    expect(html).toMatch(/<a[^>]*href="#main-content"/);
    expect(html).toMatch(/id="main-content"/);
    // pages own their <main> landmark (UnitReader / GlossaryList …); the frame must not nest another
    expect(html).not.toContain("<main");
  });
});

describe("messages", () => {
  it("App namespace in all locales; Shell / Nav namespaces removed", () => {
    for (const locale of ["ja", "zh", "en"] as const) {
      const m = messages(locale);
      expect(m.Shell).toBeUndefined();
      expect(m.Nav).toBeUndefined();
      // later tasks add keys (App.nav.records in Phase 2 …): require these, allow more
      expect(Object.keys(m.App ?? {})).toEqual(
        expect.arrayContaining(["nav", "navLabel", "settings", "siteName", "skipToContent"]),
      );
      expect(Object.keys((m.App?.nav as object) ?? {})).toEqual(
        expect.arrayContaining(["today", "practice", "textbook", "glossary"]),
      );
    }
  });
});
