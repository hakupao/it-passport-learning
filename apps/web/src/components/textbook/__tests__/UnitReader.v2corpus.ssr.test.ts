// Stage 7 Phase 3 batch B4 (D-201 §0-9) — every committed v2 unit of the corpus through the reader and
// the glossary term page (SSR), in ja / zh / en: block order h1 → goals → overview → articles → key
// points → #confirm → 読了, one article per term, no raw inline markup (`**`, `[[jp:`, `]]`); every
// headword's dictionary page renders without markup. Replaces the per-unit e2e loop for the whole corpus
// (e2e keeps only the batch's own units, TEXTBOOK_E2E_UNITS). Same SSR approach as UnitReader.ssr /
// v2-compat (renderToStaticMarkup, createElement, real message catalogs).
import { readFileSync } from "node:fs";
import path from "node:path";

import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createTranslator, NextIntlClientProvider } from "next-intl";
import { beforeAll, describe, expect, it, vi } from "vitest";

function messages(locale: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path.resolve(__dirname, `../../../../messages/${locale}.json`), "utf-8"));
}

vi.mock("next-intl/server", () => ({
  getTranslations: async ({ locale, namespace }: { locale: string; namespace: string }) =>
    createTranslator({ locale, messages: messages(locale), namespace: namespace as never }),
}));
vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, locale, children, className }: { href: string; locale?: string; children: React.ReactNode; className?: string }) =>
    h("a", { href: `/${locale ?? "_"}${href}`, className }, children),
  useRouter: () => ({ push: () => {} }),
}));

import { UnitReader } from "../UnitReader";
import { TermDetail } from "@/components/glossary/TermDetail";
import { LearningRecordProvider } from "@/hooks/useLearningRecord";
import { loadDictionary } from "@/lib/glossary/dictionaryReader";
import type { Dictionary } from "@/lib/glossary/dictionary";
import { loadChumonMembers } from "@/lib/practice/chumonMembers";
import type { ChumonMembers } from "@/lib/practice/chumonMembers";
import { pickConfirm } from "@/lib/textbook/confirm";
import { loadAllUnits, loadGeneratedSvg, loadReaderIndex, neighbors, normalizeUnit, unitPlace, type ReaderIndex } from "@/lib/textbook/reader";
import { V2_SCHEMA, type TextbookUnitV2 } from "@/lib/textbook/types";

const LOCALES = ["ja", "zh", "en"] as const;
const MARKUP = ["**", "[[jp:", "]]"];
// the whole corpus once rewritten: 241 units × 3 locales and ~1400 headwords × 3 (≈ 80× the pilot's ~0.2 s)
const CORPUS_TIMEOUT = 300_000;
const BLOCKS = ['data-part="goals"', 'data-part="overview"', "<article", 'data-part="key-points"', 'id="confirm"', 'data-part="read"'];

let units: TextbookUnitV2[] = [];
let index: ReaderIndex;
let members: ChumonMembers;
let dict: Dictionary;

beforeAll(async () => {
  const all = await loadAllUnits();
  [index, members, dict] = await Promise.all([loadReaderIndex(), loadChumonMembers(), loadDictionary()]);
  units = all.filter((u) => u.schema_version === V2_SCHEMA) as unknown as TextbookUnitV2[];
});

async function renderUnit(raw: TextbookUnitV2, locale: (typeof LOCALES)[number]): Promise<string> {
  const unit = normalizeUnit(raw, members);
  const el = await UnitReader({
    unit,
    place: unitPlace(index, raw.unit_id, locale),
    neighbors: neighbors(index, raw.unit_id),
    locale,
    senseiAnchorText: "ANCHOR",
    confirm: pickConfirm(unit, members),
  });
  return renderToStaticMarkup(
    h(NextIntlClientProvider, {
      locale,
      messages: messages(locale),
      children: h(LearningRecordProvider, { isOwner: false, children: el }),
    }),
  );
}

const rawMarkup = (out: string) => MARKUP.filter((m) => out.includes(m));

describe("every committed v2 unit (SSR)", () => {
  it("exists (at least the pilot)", () => {
    expect(units.length).toBeGreaterThan(0);
  });

  it("reader: h1 → goals → overview → articles → key points → #confirm → 読了, one article per term, no raw markup", async () => {
    const bad: string[] = [];
    for (const u of units) {
      for (const locale of LOCALES) {
        const out = await renderUnit(u, locale);
        const where = `${u.unit_id} /${locale}`;
        const marks = ["<h1", ...BLOCKS].map((m) => out.indexOf(m));
        if (marks.some((i) => i < 0) || marks.some((i, k) => k > 0 && i < marks[k - 1]!)) bad.push(`${where}: block order ${JSON.stringify(marks)}`);
        if (out.lastIndexOf("</article>") > out.indexOf('data-part="key-points"')) bad.push(`${where}: an article after the key points`);
        const n = (out.match(/<article/g) ?? []).length;
        if (n !== u.terms.length) bad.push(`${where}: ${n} articles ≠ ${u.terms.length} terms`);
        if (rawMarkup(out).length > 0) bad.push(`${where}: raw ${rawMarkup(out).join(" ")}`);
      }
    }
    expect(bad).toEqual([]);
  }, CORPUS_TIMEOUT);

  it("glossary term page of every v2 headword: renders in ja / zh / en, links its v2 unit, no raw markup", async () => {
    const bad: string[] = [];
    for (const u of units) {
      for (const t of u.terms) {
        const entry = dict.byTerm.get(t.term);
        if (!entry) {
          bad.push(`${u.unit_id} ${t.term}: no dictionary entry`);
          continue;
        }
        const svgs = await Promise.all(entry.senses.map((s) => (s.term.figure ? loadGeneratedSvg(s.term.figure.svg_path) : Promise.resolve(null))));
        for (const locale of LOCALES) {
          const out = renderToStaticMarkup(
            h(NextIntlClientProvider, {
              locale,
              messages: messages(locale),
              children: h(TermDetail, { locale, entry, unitTitles: {}, svgs, senseiAnchorText: "A" }),
            }),
          );
          const where = `${u.unit_id} ${t.term} /${locale}`;
          if (!out.includes(`/${locale}/textbook/${u.unit_id}#${entry.id}`)) bad.push(`${where}: no link to the unit`);
          if (rawMarkup(out).length > 0) bad.push(`${where}: raw ${rawMarkup(out).join(" ")}`);
        }
      }
    }
    expect(bad).toEqual([]);
  }, CORPUS_TIMEOUT);
});
