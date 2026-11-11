// D-217 H1-4 — every page under /[locale] is prerendered at build time: no page exports
// `dynamic = "force-dynamic"` except the two detail families whose strategy gate H2 decides
// (practice/q/[qid], glossary/[termId]); the other dynamic segments enumerate every valid param
// (generateStaticParams) and turn the rest away (dynamicParams = false). Comments are stripped first.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ notFound: () => {}, useSearchParams: () => new URLSearchParams() }));
vi.mock("next-intl/server", () => ({ setRequestLocale: () => {}, getTranslations: async () => (k: string) => k }));
vi.mock("@/i18n/navigation", () => ({ Link: () => null, useRouter: () => ({ push: () => {}, replace: () => {} }) }));

import { loadQuizIndex } from "@/lib/quiz/quizReader";
import { loadReaderIndex } from "@/lib/textbook/reader";

import * as TopicRoute from "../practice/browse/[topicId]/page";
import * as UnitRoute from "../textbook/[unitId]/page";

const LOCALE_DIR = path.resolve(__dirname, "..");
/** Gate H2 (OQ-22): prerendered (option A) or one client shell each (option B) — not decided here. */
const H2_FAMILIES = ["practice/q/[qid]/page.tsx", "glossary/[termId]/page.tsx"];

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

describe("/[locale] pages are prerendered (H1-4)", () => {
  const files = pages(LOCALE_DIR).map((f) => path.relative(LOCALE_DIR, f).split(path.sep).join("/"));

  it("finds the pages, the two H2 families among them", () => {
    expect(files.length).toBeGreaterThanOrEqual(17);
    for (const f of H2_FAMILIES) expect(files).toContain(f);
  });

  it("no page but the two H2 families exports force-dynamic (or any dynamic / revalidate / fetchCache)", () => {
    for (const f of files) {
      const src = code(readFileSync(path.join(LOCALE_DIR, f), "utf-8"));
      if (H2_FAMILIES.includes(f)) continue;
      expect(src, f).not.toMatch(/force-dynamic/);
      expect(src, f).not.toMatch(/export const (dynamic|revalidate|fetchCache)\b/);
    }
  });

  it("every other dynamic segment has generateStaticParams and dynamicParams = false", () => {
    for (const f of files.filter((x) => /\[[^\]]+\]\/page\.tsx$/.test(x))) {
      if (H2_FAMILIES.includes(f)) continue;
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
});
