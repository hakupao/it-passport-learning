// Stage 7 Phase 1 Task 12 (DESIGN §3.4 / §6.8) — the settings page body (SSR). Node env,
// renderToStaticMarkup, real catalogs; the learning-record hook is mocked at its module boundary.
// Submitting cannot run under renderToStaticMarkup (no DOM events): the save path is the pure
// submitSettings, tested with a setSetting spy in lib/settings/__tests__/settingsForm.test.ts.
import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, locale, children, ...rest }: { href: string; locale?: string; children: React.ReactNode }) =>
    h("a", { href: locale ? `/${locale}${href}` : href, ...rest }, children),
  usePathname: () => "/settings",
}));

const state: { record: LearningRecord; loaded: boolean } = { record: emptyRecord(), loaded: false };
vi.mock("@/hooks/useLearningRecord", () => ({
  useLearningRecord: () => ({ ...state, answer: () => {}, readUnit: () => {}, setSetting: () => {} }),
}));

import { emptyRecord, setSetting, type LearningRecord } from "@/lib/learning/record";

import { SettingsForm } from "../SettingsForm";

const LOCALES = ["ja", "zh", "en"] as const;
type Locale = (typeof LOCALES)[number];
type Messages = Record<string, Record<string, string>>;
const catalogs = new Map<string, Messages>();
function messagesFor(locale: string): Messages {
  let m = catalogs.get(locale);
  if (!m) {
    m = JSON.parse(readFileSync(path.resolve(__dirname, `../../../../messages/${locale}.json`), "utf-8")) as Messages;
    catalogs.set(locale, m);
  }
  return m;
}

function render(locale: Locale): string {
  return renderToStaticMarkup(
    h(NextIntlClientProvider, { locale, messages: messagesFor(locale), timeZone: "Asia/Tokyo", children: h(SettingsForm) }),
  );
}
const textOf = (html: string): string =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
const input = (html: string, id: string): string => new RegExp(`<input[^>]*id="${id}"[^>]*>`).exec(html)?.[0] ?? "";
const attr = (tag: string, name: string): string | null => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1] ?? null;

beforeEach(() => {
  state.record = emptyRecord();
  state.loaded = true;
});

describe("SettingsForm", () => {
  it("settings shows defaults 30 / 10 / hidden", () => {
    const html = render("zh");
    expect(html).toMatch(/<h1[^>]*>设置<\/h1>/);
    expect(attr(input(html, "settings-exam-date"), "type")).toBe("date");
    expect(attr(input(html, "settings-exam-date"), "value")).toBe("");
    const cap = input(html, "settings-review-cap");
    expect(attr(cap, "type")).toBe("number");
    expect(attr(cap, "value")).toBe("30");
    expect([attr(cap, "min"), attr(cap, "max")]).toEqual(["10", "100"]);
    const target = input(html, "settings-new-target");
    expect(attr(target, "value")).toBe("10");
    expect([attr(target, "min"), attr(target, "max")]).toEqual(["0", "50"]);
    const hidden = input(html, "settings-trans-hidden");
    const shown = input(html, "settings-trans-shown");
    expect(hidden).toContain("checked");
    expect(shown).not.toContain("checked");
    expect([attr(hidden, "name"), attr(shown, "name")]).toEqual(["transDefault", "transDefault"]);
  });

  it("stored settings fill the form", () => {
    let r = emptyRecord();
    r = setSetting(r, "examDate", "2026-11-30", 1);
    r = setSetting(r, "dailyReviewCap", 50, 1);
    r = setSetting(r, "transDefault", "shown", 1);
    state.record = r;
    const html = render("ja");
    expect(attr(input(html, "settings-exam-date"), "value")).toBe("2026-11-30");
    expect(attr(input(html, "settings-review-cap"), "value")).toBe("50");
    expect(input(html, "settings-trans-shown")).toContain("checked");
  });

  it("every input has a label; one 保存 button; a role=status line; the sync note", () => {
    for (const l of LOCALES) {
      const html = render(l);
      for (const id of ["settings-exam-date", "settings-review-cap", "settings-new-target", "settings-trans-hidden", "settings-trans-shown"]) {
        expect(html, `${l} ${id}`).toMatch(new RegExp(`<label[^>]*for="${id}"`));
      }
      expect(html).toMatch(/<fieldset[^>]*>\s*<legend/);
      expect(html.match(/<button[^>]*type="submit"/g)).toHaveLength(1);
      expect(html).toMatch(/<p[^>]*role="status"[^>]*><\/p>/); // empty until saved
      expect(html).toContain("data-sync-note");
      expect(html).toMatch(/<form[^>]*novalidate/i);
    }
    const zh = render("zh");
    expect(zh).toMatch(/<button[^>]*type="submit"[^>]*>保存<\/button>/);
  });

  it("settings has a link to /sensei", () => {
    for (const l of LOCALES) {
      const html = render(l);
      expect(html, l).toMatch(/<a href="\/sensei"[^>]*>/);
    }
    expect(textOf(render("zh"))).toContain("AI 老师：对话记录与自由提问");
  });

  it("interface language links (日 / 中 / EN) to this page in the other locales", () => {
    const html = render("zh");
    expect(html).toMatch(/<a href="\/ja\/settings"[^>]*>日<\/a>/);
    expect(html).toMatch(/<a href="\/en\/settings"[^>]*>EN<\/a>/);
    expect(html).toMatch(/<strong aria-current="true"[^>]*>中<\/strong>/);
  });

  it("loading → the form keeps its space with no values; language and AI sections are there", () => {
    state.loaded = false;
    const html = render("zh");
    expect(html).toContain('data-pending=""');
    expect(html).not.toContain("settings-review-cap");
    expect(html).toMatch(/<a href="\/sensei"/);
  });

  it("ja / zh / en Settings and Mistakes namespaces share the same keys", () => {
    for (const ns of ["Settings", "Mistakes"]) {
      const keys = LOCALES.map((l) => Object.keys(messagesFor(l)[ns] ?? {}).sort());
      expect(keys[0]!.length, ns).toBeGreaterThan(0);
      expect(keys[1], ns).toEqual(keys[0]);
      expect(keys[2], ns).toEqual(keys[0]);
    }
  });
});
