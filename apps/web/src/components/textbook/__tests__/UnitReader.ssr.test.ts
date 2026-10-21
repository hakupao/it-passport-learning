// Stage 6 (D-179 / D-180 §0-3) Task 8 — textbook term anchors + link to the glossary.
// Same SSR approach as the glossary *.ssr.test.ts files (node env,
// renderToStaticMarkup, createElement instead of JSX, real message catalogs).
// UnitReader is an async server component: it is awaited to an element first,
// with next-intl/server's getTranslations served by createTranslator.
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { createTranslator } from "next-intl";
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
import { loadDictionary } from "@/lib/glossary/dictionaryReader";
import { termId } from "@/lib/glossary/termId";
import { loadAllUnits, loadReaderIndex, loadUnit, neighbors } from "@/lib/textbook/reader";

// A real unit whose terms include 機能要件 (committed corpus).
const UNIT_ID = "management-08-25-u01";

async function render(locale: "ja" | "zh" | "en"): Promise<string> {
  const [unit, index] = await Promise.all([loadUnit(UNIT_ID), loadReaderIndex()]);
  return renderToStaticMarkup(await UnitReader({ unit, neighbors: neighbors(index, UNIT_ID), locale }));
}

describe("UnitReader term anchors (SSR)", () => {
  it("gives the 機能要件 article id=termId and links it to /<locale>/glossary/<same id>", async () => {
    const id = termId("機能要件");
    const out = await render("ja");
    expect(out).toMatch(new RegExp(`<article[^>]*\\bid="${id}"`));
    expect(out).toContain(`href="/ja/glossary/${id}"`);
    expect(out).toContain("用語集で開く");
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
    const articleIds = [...out.matchAll(/<article[^>]*\bid="([^"]*)"/g)].map((m) => m[1]);
    const ids = unit.terms.map((tm) => termId(tm.term));
    expect(articleIds).toEqual(ids);
    for (const id of ids) expect(out).toContain(`href="/en/glossary/${id}"`);
  });
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
