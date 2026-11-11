// D-217 H1-4 / H1-5 — every page under /[locale] is prerendered at build time (output: 'export'):
// no page exports `dynamic` / `revalidate` / `fetchCache`, and every dynamic segment enumerates every
// valid param (generateStaticParams) and turns the rest away (dynamicParams = false) — since D-223
// (A′) the two detail families practice/q/[qid] and glossary/[termId] too. Comments are stripped first.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ notFound: () => {}, useSearchParams: () => new URLSearchParams() }));
vi.mock("next-intl/server", () => ({ setRequestLocale: () => {}, getTranslations: async () => (k: string) => k }));
vi.mock("@/i18n/navigation", () => ({ Link: () => null, useRouter: () => ({ push: () => {}, replace: () => {} }) }));

import { loadDictionary } from "@/lib/glossary/dictionaryReader";
import { loadBaseQuestions, loadQuizIndex } from "@/lib/quiz/quizReader";
import { loadReaderIndex } from "@/lib/textbook/reader";

import * as TermRoute from "../glossary/[termId]/page";
import * as TopicRoute from "../practice/browse/[topicId]/page";
import * as QuestionRoute from "../practice/q/[qid]/page";
import * as UnitRoute from "../textbook/[unitId]/page";

const LOCALE_DIR = path.resolve(__dirname, "..");
/** The two detail families (D-223 = A′: prerendered, their .txt payloads deleted after export). */
const DETAIL_FAMILIES = ["practice/q/[qid]/page.tsx", "glossary/[termId]/page.tsx"];

function pages(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === "__tests__" ? [] : pages(p);
    return /^(page|layout)\.tsx$/.test(e.name) ? [p] : [];
  });
}

function code(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
}

describe("/[locale] pages are prerendered (H1-4, H1-5)", () => {
  const files = pages(LOCALE_DIR).map((f) => path.relative(LOCALE_DIR, f).split(path.sep).join("/"));

  it("finds the pages, the two detail families among them", () => {
    expect(files.length).toBeGreaterThanOrEqual(17);
    for (const f of DETAIL_FAMILIES) expect(files).toContain(f);
  });

  it("no page exports force-dynamic (or any dynamic / revalidate / fetchCache)", () => {
    for (const f of files) {
      const src = code(readFileSync(path.join(LOCALE_DIR, f), "utf-8"));
      expect(src, f).not.toMatch(/force-dynamic/);
      expect(src, f).not.toMatch(/export const (dynamic|revalidate|fetchCache)\b/);
    }
  });

  it("every dynamic segment has generateStaticParams and dynamicParams = false", () => {
    const dynamicPages = files.filter((x) => /\[[^\]]+\]\/page\.tsx$/.test(x));
    for (const f of DETAIL_FAMILIES) expect(dynamicPages).toContain(f);
    for (const f of dynamicPages) {
      const src = code(readFileSync(path.join(LOCALE_DIR, f), "utf-8"));
      expect(src, f).toMatch(/export (async )?function generateStaticParams\b/);
      expect(src, f).toMatch(/export const dynamicParams = false;/);
    }
  });

  it("textbook/[unitId]: all 244 listed units", async () => {
    const index = await loadReaderIndex();
    const want = index.topics.flatMap((t) => (t.units ?? []).map((u) => u.unit_id));
    const got = (await UnitRoute.generateStaticParams()).map((p) => p.unitId);
    expect(got).toHaveLength(244);
    expect([...got].sort()).toEqual([...want].sort());
    expect(UnitRoute.dynamicParams).toBe(false);
  });

  it("practice/browse/[topicId]: all 63 topics", async () => {
    const index = await loadQuizIndex();
    const got = (await TopicRoute.generateStaticParams()).map((p) => p.topicId);
    expect(got).toHaveLength(63);
    expect(got).toEqual(index.topics.map((t) => t.topic_id));
    expect(TopicRoute.dynamicParams).toBe(false);
  });

  it("practice/q/[qid]: all 2,900 questions", async () => {
    const want = (await loadBaseQuestions()).map((q) => q.id);
    const got = (await QuestionRoute.generateStaticParams()).map((p) => p.qid);
    expect(got).toHaveLength(2900);
    expect(new Set(got).size).toBe(2900);
    expect(got).toEqual(want);
    expect(QuestionRoute.dynamicParams).toBe(false);
  });

  it("glossary/[termId]: every dictionary term", async () => {
    const want = [...(await loadDictionary()).byId.keys()];
    const got = (await TermRoute.generateStaticParams()).map((p) => p.termId);
    expect(got.length).toBeGreaterThan(1000);
    expect(got).toEqual(want);
    expect(TermRoute.dynamicParams).toBe(false);
  });
});
