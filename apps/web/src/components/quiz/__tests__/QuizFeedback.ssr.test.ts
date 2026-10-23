// D-149 (S126): the per-question report button is owner-gated at render time.
// Stage 7 Task 13: QuizSet is gone; the button now lives in the practice ExplanationPane and
// its keys in the Practice namespace. Same SSR approach as QuizRichText.ssr.test.ts (node env,
// renderToStaticMarkup, createElement instead of JSX).
import { describe, expect, it, vi } from "vitest";
import { createElement as h } from "react";
import { readFileSync } from "node:fs";
import path from "node:path";

// next-intl's createNavigation imports `next/navigation` without an extension,
// which vitest's ESM resolver rejects; a plain <a> is enough for these checks.
vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) =>
    h("a", { href, className }, children),
}));

import { renderPane } from "@/components/practice/__tests__/practiceRender";
import type { ChoiceLetter } from "@/lib/learning/record";
import type { QuizQuestion } from "@/lib/quiz/quizModel";

const ROOT = path.resolve(__dirname, "../../../../../..");
const Q = JSON.parse(readFileSync(path.join(ROOT, "data/ip/quiz/questions.json"), "utf-8"))
  .questions as QuizQuestion[];
const QUESTIONS = Q.filter((q) => q.id === "2016h28h-q033" || q.id === "2017h29a-q015");

const messages = (l: string): Record<string, Record<string, string>> =>
  JSON.parse(readFileSync(path.resolve(__dirname, `../../../../messages/${l}.json`), "utf-8"));

function render(locale: "ja" | "zh" | "en", isOwner: boolean): string {
  return QUESTIONS.map((q) => renderPane(q, locale, q.correct_answer as ChoiceLetter, {}, isOwner)).join("");
}

describe("owner-gated report button in the explanation pane (SSR)", () => {
  it("fixture has both seed questions", () => {
    expect(QUESTIONS).toHaveLength(2);
  });

  it("non-owner: no report button", () => {
    const out = render("ja", false);
    expect(out).not.toContain("問題を報告");
    expect(out).not.toContain("aria-expanded");
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
  it("ja/zh/en Practice namespaces share the same fb* key set; the Quiz namespace is gone", () => {
    const keys = (l: string) =>
      Object.keys(messages(l).Practice!)
        .filter((k) => k.startsWith("fb"))
        .sort();
    expect(keys("ja").length).toBe(23);
    expect(keys("zh")).toEqual(keys("ja"));
    expect(keys("en")).toEqual(keys("ja"));
    for (const l of ["ja", "zh", "en"]) expect(messages(l).Quiz, l).toBeUndefined();
  });
});
