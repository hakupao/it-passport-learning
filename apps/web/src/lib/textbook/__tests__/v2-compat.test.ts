// Stage 7 Phase 3 Task 6 (D-196 §0-9, Review Focus 4) — a v2 unit goes through the
// v1 consumers untouched: the glossary dictionary, the glossary term page (SSR),
// the AI 先生 unit / term anchors and /api/sensei/terms' termContext read only the
// compat fields, so nothing throws, nothing is blank and no inline markup leaks.
// With the sample substituted for its v1 unit (as the pilot will do), every
// remaining v1 unit still matches the v1 snapshot.
import { readFileSync } from "node:fs";
import path from "node:path";

import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, locale, children, className }: { href: string; locale: string; children: React.ReactNode; className?: string }) =>
    h("a", { href: `/${locale}${href}`, className }, children),
}));

import { TermDetail } from "@/components/glossary/TermDetail";
import { buildDictionary, field, toTermCard, type Dictionary } from "../../glossary/dictionary";
import { loadBaseQuestions } from "../../quiz/quizReader";
import { termAnchor, termContext, unitAnchor } from "../../sensei/textbookAnchors";
import { loadAllUnits, loadGeneratedSvg, loadReaderIndex, type TextbookUnit } from "../reader";
import type { TextbookUnitV2 } from "../types";
import { V1_SCHEMA, v1Fingerprint, type V1UnitHash } from "./v1Snapshot";

const SAMPLE = JSON.parse(
  readFileSync(path.join(__dirname, "..", "__fixtures__", "v2-sample.json"), "utf-8"),
) as TextbookUnitV2;
const LOCALES = ["ja", "zh", "en"] as const;
const MARKUP = /\*\*|\[\[jp:|\]\]/;

let dict: Dictionary;
let units: TextbookUnit[];
beforeAll(async () => {
  const [index, all, questions] = await Promise.all([loadReaderIndex(), loadAllUnits(), loadBaseQuestions()]);
  units = all.map((u) => (u.unit_id === SAMPLE.unit_id ? SAMPLE : u));
  expect(units).toContain(SAMPLE);
  dict = buildDictionary(index, units, questions);
});

const entryOf = (term: string) => dict.byTerm.get(term)!;
const v2Sense = (term: string) => entryOf(term).senses.find((s) => s.unitId === SAMPLE.unit_id)!;

describe("v2 sample through the v1 consumers", () => {
  it("buildDictionary: one sense per term, compat fields non-empty and markup-free", () => {
    for (const t of SAMPLE.terms) {
      const s = v2Sense(t.term);
      expect(s, t.term).toBeDefined();
      for (const l of LOCALES) {
        for (const base of ["definition", "explanation"]) expect(field(s.term, base, l).trim(), `${t.term} ${base} ${l}`).not.toBe("");
        for (const base of ["definition", "explanation", "analogy", "memory_hook"]) {
          expect(field(s.term, base, l), `${t.term} ${base} ${l}`).not.toMatch(MARKUP);
        }
      }
      const card = toTermCard(entryOf(t.term), "zh");
      expect(card.definition).not.toMatch(MARKUP);
    }
  });

  it("glossary term page (SSR): renders every v2 term in each locale, no markup; empty analogy / hook hide their label", async () => {
    for (const t of SAMPLE.terms) {
      const entry = entryOf(t.term);
      const svgs = await Promise.all(entry.senses.map((s) => (s.term.figure ? loadGeneratedSvg(s.term.figure.svg_path) : Promise.resolve(null))));
      for (const locale of LOCALES) {
        const messages = JSON.parse(readFileSync(path.resolve(__dirname, `../../../../messages/${locale}.json`), "utf-8"));
        const out = renderToStaticMarkup(
          h(NextIntlClientProvider, {
            locale,
            messages,
            children: h(TermDetail, { locale, entry, unitTitles: {}, svgs, senseiAnchorText: "A" }),
          }),
        );
        expect(out, `${t.term} ${locale}`).not.toMatch(MARKUP);
        expect(out).toContain(`/${locale}/textbook/${SAMPLE.unit_id}#${entry.id}`);
        if (t.term === "受容") {
          const g = (messages as { Glossary: Record<string, string> }).Glossary;
          expect(out).not.toContain(`>${g.analogy}</span>`);
          expect(out).not.toContain(`>${g.memoryHook}</span>`);
        }
      }
    }
    // the svg fig keeps the v1 `figure` shape, so the term page still inlines it
    const prm = v2Sense("プロジェクトリスクマネジメント");
    expect(prm.term.figure?.svg_path).toBe("figures/management-10-27-u03-t01.svg");
    expect(await loadGeneratedSvg(prm.term.figure!.svg_path)).toContain("<svg");
  });

  it("AI 先生 anchors and termContext: no throw, every headword present, no markup", () => {
    for (const locale of LOCALES) {
      const a = unitAnchor(SAMPLE, locale);
      expect(a).not.toMatch(MARKUP);
      for (const t of SAMPLE.terms) expect(a).toContain(t.term);
      for (const t of SAMPLE.terms) {
        const entry = entryOf(t.term);
        expect(termAnchor(entry, locale, {})).not.toMatch(MARKUP);
        const ctx = termContext(entry, locale, {});
        expect(JSON.stringify(ctx)).not.toMatch(MARKUP);
        expect(ctx.senses.every((s) => s.definitionJp.trim() !== "")).toBe(true);
      }
    }
  });

  it("every remaining v1 unit still matches the v1 snapshot (cross-unit headwords keep their v1 sense)", () => {
    const saved = JSON.parse(readFileSync(path.join(__dirname, "__snapshots__", "v1-units.json"), "utf-8")) as Record<string, V1UnitHash>;
    const now = v1Fingerprint(dict, units);
    expect(now[SAMPLE.unit_id]).toBeUndefined();
    const v1Ids = units.filter((u) => u.schema_version === V1_SCHEMA).map((u) => u.unit_id);
    expect(Object.keys(now).sort()).toEqual([...v1Ids].sort());
    for (const [id, hsh] of Object.entries(now)) expect(saved[id], id).toEqual(hsh);
  });
});
