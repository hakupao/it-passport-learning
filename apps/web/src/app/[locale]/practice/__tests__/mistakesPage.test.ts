// Stage 7 Phase 1 Task 12 — /[locale]/practice/mistakes on the server side: force-dynamic (owner
// cookie) with the record provider around MistakesList, fed the dictionary-free payload (a glossary
// failure cannot break it). Real corpus; only Next's runtime pieces are stubbed.
import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));
vi.mock("next-intl/server", () => ({
  setRequestLocale: () => {},
  getTranslations: async ({ namespace }: { namespace: string }) => (k: string) => `${namespace}.${k}`,
}));
vi.mock("@/i18n/navigation", () => ({ Link: () => null, useRouter: () => ({ push: () => {} }) }));
const dict = vi.hoisted(() => ({ fail: false }));
vi.mock("@/lib/glossary/dictionaryReader", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/glossary/dictionaryReader")>();
  return {
    ...real,
    loadDictionary: () => (dict.fail ? Promise.reject(new Error("dictionary down (test)")) : real.loadDictionary()),
  };
});

import { MistakesList, type MistakesListProps } from "@/components/practice/MistakesList";
import { LearningRecordProvider } from "@/hooks/useLearningRecord";

import MistakesPage, { dynamic, generateMetadata } from "../mistakes/page";

type El = { type: unknown; props: { children?: El } & Record<string, unknown> };
const page = (locale: string) => MistakesPage({ params: Promise.resolve({ locale }) }) as Promise<El>;

describe("/practice/mistakes", () => {
  it("MistakesList under the record provider, force-dynamic, the payload without terms", async () => {
    expect(dynamic).toBe("force-dynamic");
    dict.fail = true;
    try {
      const el = await page("ja");
      expect(el.type).toBe(LearningRecordProvider);
      expect(el.props.isOwner).toBe(false);
      const list = el.props.children!;
      expect(list.type).toBe(MistakesList);
      const p = list.props as unknown as MistakesListProps;
      expect(p.index.topics).toHaveLength(63);
      expect(p.index.exams["2025r07"]).toMatch(/^令和7年度/);
      expect(Object.values(p.index.topicTerms).every((cards) => cards.length === 0)).toBe(true);
    } finally {
      dict.fail = false;
    }
  });
  it("title from the Mistakes namespace", async () => {
    expect(await generateMetadata({ params: Promise.resolve({ locale: "zh" }) })).toEqual({ title: "Mistakes.title" });
  });
});
