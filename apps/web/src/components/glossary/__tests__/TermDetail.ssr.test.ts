// Stage 6 (D-179 / D-180) Task 5 — glossary term detail component + termId guard.
// Same SSR approach as GlossaryList.ssr.test.ts (node env, renderToStaticMarkup,
// createElement instead of JSX, NextIntlClientProvider with the real catalogs).
import { describe, expect, it, vi } from "vitest";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { readFileSync } from "node:fs";
import path from "node:path";

// Stand-in for next-intl's Link (see GlossaryList.ssr.test.ts): localePrefix
// "always", so the active locale becomes the path prefix.
vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    locale,
    children,
    className,
  }: {
    href: string;
    locale: string;
    children: React.ReactNode;
    className?: string;
  }) => h("a", { href: `/${locale}${href}`, className }, children),
}));

import { TermDetail } from "../TermDetail";
import type { DictEntry } from "@/lib/glossary/dictionary";
import { loadDictionary } from "@/lib/glossary/dictionaryReader";
import { isValidTermId, termId } from "@/lib/glossary/termId";
import type { UnitTerm } from "@/lib/textbook/types";

function unitTerm(term: string, tag: string): UnitTerm {
  return {
    term,
    term_zh: `${term}-zh`,
    term_en: `${term}-en`,
    definition_jp: `定義-${tag}`,
    definition_zh: `定义-${tag}`,
    definition_en: `def-${tag}`,
    explanation_jp: `解説-${tag}`,
    explanation_zh: `解说-${tag}`,
    explanation_en: `expl-${tag}`,
    analogy_jp: `たとえ-${tag}`,
    analogy_zh: `类比-${tag}`,
    analogy_en: `analogy-${tag}`,
    memory_hook_jp: `フック-${tag}`,
    memory_hook_zh: `口诀-${tag}`,
    memory_hook_en: `hook-${tag}`,
    inline_quiz: [],
    inline_fallback: false,
    figure: null,
  };
}

const ID = termId("機能要件");
const ENTRY: DictEntry = {
  id: ID,
  term: "機能要件",
  termZh: "機能要件-zh",
  termEn: "機能要件-en",
  senses: [
    { unitId: "t-01-u01", topicId: "t-01", category: "technology", term: unitTerm("機能要件", "A") },
    { unitId: "m-02-u03", topicId: "m-02", category: "management", term: unitTerm("機能要件", "B") },
  ],
  questions: [{ id: "2024r06-q001", examId: "2024r06", sourceLabel: "令和6年度 問1" }],
};
const TITLES = { "t-01-u01": "要件定義の基礎", "m-02-u03": "システム開発の管理" };

function render(
  locale: "ja" | "zh" | "en",
  entry: DictEntry,
  unitTitles: Record<string, string>,
  svgs: (string | null)[],
): string {
  const messages = JSON.parse(
    readFileSync(path.resolve(__dirname, `../../../../messages/${locale}.json`), "utf-8"),
  );
  return renderToStaticMarkup(
    h(NextIntlClientProvider, {
      locale,
      messages,
      children: h(TermDetail, { locale, entry, unitTitles, svgs, senseiAnchorText: "ANCHOR" }),
    }),
  );
}

// Static markup escapes `&` in attributes; decode it back to the real href.
const hrefs = (out: string): string[] =>
  [...out.matchAll(/href="([^"]*)"/g)].map((m) => (m[1] ?? "").replaceAll("&amp;", "&"));
const textbookLinks = (out: string): string[] => hrefs(out).filter((l) => l.startsWith("/ja/textbook/"));

describe("TermDetail (SSR)", () => {
  it("renders one sense block and one textbook #termId link per sense", () => {
    const out = render("ja", ENTRY, TITLES, [null, null]);
    expect(out.match(/<article\b/g)).toHaveLength(2);
    expect(textbookLinks(out)).toEqual([`/ja/textbook/t-01-u01#${ID}`, `/ja/textbook/m-02-u03#${ID}`]);
    for (const tag of ["A", "B"]) {
      for (const f of ["定義", "解説", "たとえ", "フック"]) expect(out).toContain(`${f}-${tag}`);
    }
    expect(out).toContain("要件定義の基礎");
    expect(out).toContain("システム開発の管理");
  });

  it("links each question to its exam set with a #questionId anchor, labelled by sourceLabel", () => {
    const out = render("ja", ENTRY, TITLES, [null, null]);
    const quiz = hrefs(out).filter((l) => l.startsWith("/ja/quiz"));
    expect(quiz).toEqual(["/ja/quiz?mode=exam&id=2024r06#2024r06-q001"]);
    expect(out).toContain("令和6年度 問1");
  });

  it("inlines the sense's SVG figure and shows active-locale fields with a JP headword", () => {
    const out = render("zh", ENTRY, TITLES, ['<svg id="fig-a"></svg>', null]);
    expect(out).toContain('<svg id="fig-a"></svg>');
    expect(out.match(/<svg\b/g)).toHaveLength(1);
    expect(out).toContain("定义-A");
    expect(out).not.toContain("定義-A");
    expect(out).toContain("機能要件-zh");
    expect(out).toContain("機能要件");
  });

  it("falls back to the JP text when an active-locale sense field is empty (same as the list card)", () => {
    const sense = { ...ENTRY.senses[0]!, term: { ...unitTerm("機能要件", "A"), definition_zh: "", analogy_zh: "  " } };
    const out = render("zh", { ...ENTRY, senses: [sense] }, TITLES, [null]);
    expect(out).toContain("定義-A");
    expect(out).toContain("たとえ-A");
    expect(out).toContain("解说-A");
    expect(out).toContain("口诀-A");
    expect(out).not.toContain("解説-A");
  });

  it("renders the 「AI 先生に聞く」 button under the headword (D-181 Phase C); no panel before a click", () => {
    const messages = JSON.parse(readFileSync(path.resolve(__dirname, "../../../../messages/ja.json"), "utf-8"));
    const out = render("ja", ENTRY, TITLES, [null, null]);
    const button = out.match(/<button[^>]*data-testid="ask-sensei"[^>]*>([^<]*)<\/button>/);
    expect(button?.[1]).toBe(messages.Sensei.askButton);
    expect(out.indexOf("data-testid=\"ask-sensei\"")).toBeGreaterThan(out.indexOf("</h1>"));
    expect(out.indexOf("data-testid=\"ask-sensei\"")).toBeLessThan(out.indexOf("<article"));
    expect(out).not.toContain("role=\"dialog\"");
    expect(out).not.toContain("ANCHOR"); // the anchor text is a prop, not markup
  });

  it("pluralizes the en question count (1 question / 2 questions)", () => {
    const one = render("en", ENTRY, TITLES, [null, null]);
    expect(one).toContain("1 question");
    expect(one).not.toContain("1 questions");
    const q2 = { id: "2024r06-q002", examId: "2024r06", sourceLabel: "令和6年度 問2" };
    const two = render("en", { ...ENTRY, questions: [...ENTRY.questions, q2] }, TITLES, [null, null]);
    expect(two).toContain("2 questions");
  });
});

describe("isValidTermId", () => {
  it("accepts t + 16 lowercase hex and rejects anything else", () => {
    expect(isValidTermId("t0123456789abcdef")).toBe(true);
    expect(isValidTermId(termId("ISO/IEC 27000"))).toBe(true);
    expect(isValidTermId("../x")).toBe(false);
    expect(isValidTermId("t0123456789ABCDEF")).toBe(false);
    expect(isValidTermId("t0123456789abcde")).toBe(false);
    expect(isValidTermId("t0123456789abcdef0")).toBe(false);
    expect(isValidTermId("")).toBe(false);
  });
});

describe("TermDetail on the real corpus", () => {
  it("機能要件 renders 2 sense blocks with 2 textbook links", async () => {
    const dict = await loadDictionary();
    const entry = dict.byTerm.get("機能要件");
    expect(entry).toBeDefined();
    const out = render("ja", entry!, {}, entry!.senses.map(() => null));
    expect(out.match(/<article\b/g)).toHaveLength(2);
    expect(textbookLinks(out)).toHaveLength(2);
    expect(textbookLinks(out).every((l) => l.endsWith(`#${entry!.id}`))).toBe(true);
  });
});
