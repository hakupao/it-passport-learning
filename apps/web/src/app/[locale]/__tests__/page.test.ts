// Stage 7 Phase 1 Task 11 — the home route /[locale] (today page) on the server side: no redirect
// to the old quiz list any more; force-dynamic (owner cookie) with the record provider; the today
// payload, or the dictionary-free payload when the glossary fails (no terms box then). Real corpus;
// only Next's runtime pieces are stubbed.
import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));
vi.mock("next-intl/server", () => ({
  setRequestLocale: () => {},
  getTranslations: async ({ namespace }: { namespace: string }) => (k: string) => `${namespace}.${k}`,
}));
vi.mock("@/i18n/navigation", () => ({
  Link: () => null,
  redirect: () => {
    throw new Error("unexpected redirect");
  },
  useRouter: () => ({ push: () => {} }),
}));
const dict = vi.hoisted(() => ({ fail: false }));
vi.mock("@/lib/glossary/dictionaryReader", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/glossary/dictionaryReader")>();
  return {
    ...real,
    loadDictionary: () => (dict.fail ? Promise.reject(new Error("dictionary down (test)")) : real.loadDictionary()),
  };
});

import { TodayPage, type TodayPageProps } from "@/components/today/TodayPage";
import { LearningRecordProvider } from "@/hooks/useLearningRecord";

import HomePage, { dynamic, generateMetadata } from "../page";

type El = { type: unknown; props: { children?: El } & Record<string, unknown> };
const home = (locale: string) => HomePage({ params: Promise.resolve({ locale }) }) as Promise<El>;

describe("/[locale] → the today page", () => {
  it("renders TodayPage under the record provider (no redirect), force-dynamic", async () => {
    expect(dynamic).toBe("force-dynamic");
    const el = await home("zh");
    expect(el.type).toBe(LearningRecordProvider);
    expect(el.props.isOwner).toBe(false);
    const page = el.props.children!;
    expect(page.type).toBe(TodayPage);
    const p = page.props as unknown as TodayPageProps;
    expect(p.locale).toBe("zh");
    expect(p.index.topics).toHaveLength(63);
    expect(Object.values(p.index.topicTerms).some((cards) => cards.length > 0)).toBe(true);
  });

  it("a dictionary failure → the payload without terms (the page still renders)", async () => {
    dict.fail = true;
    try {
      const p = (await home("ja")).props.children!.props as unknown as TodayPageProps;
      expect(p.index.topics).toHaveLength(63);
      expect(Object.values(p.index.topicTerms).every((cards) => cards.length === 0)).toBe(true);
    } finally {
      dict.fail = false;
    }
  });

  it("title = App.siteName", async () => {
    expect((await generateMetadata({ params: Promise.resolve({ locale: "en" }) })).title).toBe("App.siteName");
  });
});
