// Stage 6 (D-179 / D-180 §0-3) Task 8 — textbook term anchors + link to the glossary.
// Same SSR approach as the glossary *.ssr.test.ts files (node env,
// renderToStaticMarkup, createElement instead of JSX, real message catalogs).
// UnitReader is an async server component: it is awaited to an element first,
// with next-intl/server's getTranslations served by createTranslator.
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { createTranslator, NextIntlClientProvider } from "next-intl";
import { readFileSync } from "node:fs";
import path from "node:path";

function messages(locale: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path.resolve(__dirname, `../../../../messages/${locale}.json`), "utf-8"));
}

vi.mock("next-intl/server", () => ({
  getTranslations: async ({ locale, namespace }: { locale: string; namespace: string }) =>
    createTranslator({ locale, messages: messages(locale), namespace: namespace as never }),
}));

// Stand-in for next-intl's Link (see GlossaryList.ssr.test.ts): localePrefix
// "always", so the explicit `locale` prop becomes the path prefix.
vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    locale,
    children,
    className,
  }: {
    href: string;
    locale?: string;
    children: React.ReactNode;
    className?: string;
  }) => h("a", { href: `/${locale ?? "_"}${href}`, className }, children),
}));

import { UnitReader } from "../UnitReader";
import { LearningRecordProvider } from "@/hooks/useLearningRecord";
import { loadDictionary } from "@/lib/glossary/dictionaryReader";
import { termId } from "@/lib/glossary/termId";
import { loadAllUnits, loadReaderIndex, loadUnit, neighbors } from "@/lib/textbook/reader";

// A real unit whose terms include 機能要件 (committed corpus).
const UNIT_ID = "management-08-25-u01";

// Task 12: UnitReader mounts MarkUnitRead (readUnit on mount), so it renders
// inside the LearningRecordProvider the unit page mounts.
async function element(locale: "ja" | "zh" | "en"): Promise<React.ReactElement> {
  const [unit, index] = await Promise.all([loadUnit(UNIT_ID), loadReaderIndex()]);
  return UnitReader({ unit, neighbors: neighbors(index, UNIT_ID), locale, senseiAnchorText: "ANCHOR" });
}

// D-181 Phase C: the 「AI 先生に聞く」 client island reads the Sensei messages.
async function render(locale: "ja" | "zh" | "en"): Promise<string> {
  return renderToStaticMarkup(
    h(NextIntlClientProvider, {
      locale,
      messages: messages(locale),
      children: h(LearningRecordProvider, { isOwner: false, children: await element(locale) }),
    }),
  );
}

describe("UnitReader read mark (SSR)", () => {
  it("mounts the MarkUnitRead island, which needs a LearningRecordProvider", async () => {
    const el = await element("ja");
    expect(() => renderToStaticMarkup(el)).toThrow(/LearningRecordProvider/);
  });
});

describe("UnitReader AI 先生 entry (SSR, D-181 Phase C)", () => {
  it("renders the 「AI 先生に聞く」 button under the title; no panel before a click", async () => {
    const out = await render("en");
    const button = out.match(/<button[^>]*data-testid="ask-sensei"[^>]*>([^<]*)<\/button>/);
    expect(button?.[1]).toBe((messages("en").Sensei as Record<string, string>).askButton);
    expect(out.indexOf("data-testid=\"ask-sensei\"")).toBeGreaterThan(out.indexOf("</h1>"));
    expect(out.indexOf("data-testid=\"ask-sensei\"")).toBeLessThan(out.indexOf("<article"));
    expect(out).not.toContain("role=\"dialog\"");
    expect(out).not.toContain("ANCHOR");
  });
});

describe("UnitReader term anchors (SSR)", () => {
  it("gives the 機能要件 article id=termId and links it to /<locale>/glossary/<same id>", async () => {
    const id = termId("機能要件");
    const out = await render("ja");
    expect(out).toMatch(new RegExp(`<article[^>]*\\bid="${id}"`));
    expect(out).toContain(`href="/ja/glossary/${id}"`);
    expect(out).toContain("用語集で開く");
  });

  it("keeps the glossary link out of the h3; its accessible text names the term", async () => {
    const id = termId("機能要件");
    const out = await render("ja");
    const heads = [...out.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/g)].map((m) => m[1] ?? "");
    expect(heads.length).toBeGreaterThan(0);
    for (const inner of heads) {
      expect(inner).not.toContain("<a");
      expect(inner).not.toContain("用語集で開く");
    }
    expect(heads.some((inner) => inner.includes("機能要件"))).toBe(true);

    const link = out.match(new RegExp(`<a[^>]*href="/ja/glossary/${id}"[^>]*>([\\s\\S]*?)</a>`));
    expect(link).not.toBeNull();
    const inner = link![1] ?? "";
    expect(inner).toContain("用語集で開く");
    expect(inner).toMatch(/<span class="sr-only">\s*機能要件<\/span>/);
    expect(inner).toContain('<span aria-hidden="true"> →</span>');
    // Accessible text (tags stripped, aria-hidden arrow dropped) = label + term.
    const name = inner.replace(/<span aria-hidden="true">[^<]*<\/span>/g, "").replace(/<[^>]+>/g, "");
    expect(name.trim()).toBe("用語集で開く 機能要件");
  });

  it("uses the active locale for the link prefix and label", async () => {
    const id = termId("機能要件");
    const out = await render("zh");
    expect(out).toContain(`href="/zh/glossary/${id}"`);
    expect(out).toContain("在术语表中打开");
  });

  it("anchors and links every term of the unit, ids matching termId(term)", async () => {
    const unit = await loadUnit(UNIT_ID);
    const out = await render("en");
    const articleIds = [...out.matchAll(/<article[^>]*\bid="([^"]*)"/g)].map((m) => m[1] ?? "");
    const ids = unit.terms.map((tm) => termId(tm.term));
    expect(articleIds).toEqual(ids);
    for (const id of ids) expect(out).toContain(`href="/en/glossary/${id}"`);
  });
});

describe("UnitReader past-questions link (Stage 7 Task 13)", () => {
  const label = { ja: "この単元の過去問", zh: "本单元的过去问", en: "Past questions for this unit" } as const;
  for (const locale of ["ja", "zh", "en"] as const) {
    it(`${locale}: links 「${label[locale]}」 to the unit's topic page; the deferred note is gone`, async () => {
      const unit = await loadUnit(UNIT_ID);
      expect(unit.topic_id).toBe("management-08-25");
      const out = await render(locale);
      const link = out.match(new RegExp(`<a[^>]*href="/${locale}/practice/browse/${unit.topic_id}"[^>]*>([^<]*)</a>`));
      expect(link?.[1]).toBe(label[locale]);
      expect(out).not.toMatch(/\/quiz(?!-figures)/);
      const textbook = messages(locale).Textbook as Record<string, string>;
      expect(textbook.quizDeferred).toBeUndefined();
      expect(textbook.pastQuestions).toBe(label[locale]);
    });
  }
});

describe("textbook terms on the real corpus", () => {
  it("every term is a dictionary headword whose senses include its unit, unique per unit", async () => {
    const [dict, units] = await Promise.all([loadDictionary(), loadAllUnits()]);
    for (const unit of units) {
      const ids = unit.terms.map((tm) => termId(tm.term));
      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) {
        const entry = dict.byId.get(id);
        expect(entry, `${unit.unit_id}: ${id}`).toBeDefined();
        expect(entry!.senses.map((s) => s.unitId)).toContain(unit.unit_id);
      }
    }
  });
});
