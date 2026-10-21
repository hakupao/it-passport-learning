// D-149 (S126): the per-question report button is owner-gated at render time.
// Same SSR approach as QuizRichText.ssr.test.ts (node env, renderToStaticMarkup,
// createElement instead of JSX).
import { describe, expect, it, vi } from "vitest";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { readFileSync } from "node:fs";
import path from "node:path";

// next-intl's createNavigation imports `next/navigation` without an extension,
// which vitest's ESM resolver rejects; a plain <a> is enough for these checks.
vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) =>
    h("a", { href, className }, children),
}));

import { QuizSet } from "../QuizSet";
import { LearningRecordProvider } from "@/hooks/useLearningRecord";
import type { QuizQuestion } from "@/lib/quiz/quizModel";

const ROOT = path.resolve(__dirname, "../../../../../..");
const Q = JSON.parse(readFileSync(path.join(ROOT, "data/ip/quiz/questions.json"), "utf-8"))
  .questions as QuizQuestion[];
const QUESTIONS = Q.filter((q) => q.id === "2016h28h-q033" || q.id === "2017h29a-q015");

function render(locale: "ja" | "zh" | "en", isOwner?: boolean): string {
  const messages = JSON.parse(
    readFileSync(path.resolve(__dirname, `../../../../messages/${locale}.json`), "utf-8"),
  );
  return renderToStaticMarkup(
    h(NextIntlClientProvider, {
      locale,
      messages,
      children: h(LearningRecordProvider, {
        isOwner: isOwner ?? false,
        children: h(QuizSet, { locale, label: "L", sublabel: "S", questions: QUESTIONS, termCards: {}, isOwner }),
      }),
    }),
  );
}

describe("QuizSet owner-gated report button (SSR)", () => {
  it("fixture has both seed questions", () => {
    expect(QUESTIONS).toHaveLength(2);
  });

  it("non-owner (default and explicit false): no report button", () => {
    for (const out of [render("ja"), render("ja", false)]) {
      expect(out).not.toContain("問題を報告");
      expect(out).not.toContain("aria-expanded");
    }
  });

  it("owner: one collapsed report button per question, localized in ja/zh/en", () => {
    const expected = { ja: "問題を報告", zh: "报告问题", en: "Report a problem" } as const;
    for (const locale of ["ja", "zh", "en"] as const) {
      const out = render(locale, true);
      expect(out.split(expected[locale]).length - 1).toBe(2);
      expect((out.match(/aria-expanded="false"/g) ?? []).length).toBe(2);
      // panel is not rendered until opened
      expect(out).not.toContain('role="region"');
      // aria-controls only points at the panel while it exists (NIT-1)
      expect(out).not.toContain("aria-controls");
    }
  });
});

describe("messages parity for the D-149 keys", () => {
  it("ja/zh/en Quiz namespaces share the same fb* key set", () => {
    const keys = (l: string) =>
      Object.keys(
        JSON.parse(readFileSync(path.resolve(__dirname, `../../../../messages/${l}.json`), "utf-8")).Quiz,
      )
        .filter((k) => k.startsWith("fb"))
        .sort();
    expect(keys("ja").length).toBe(23);
    expect(keys("zh")).toEqual(keys("ja"));
    expect(keys("en")).toEqual(keys("ja"));
  });
});
