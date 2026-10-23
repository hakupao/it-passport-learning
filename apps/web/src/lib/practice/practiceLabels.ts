// Stage 7 Phase 1 Task 10 (fix round 1) — labels and orderings the practice pages share (setup panel,
// browse, topic page, single question). Isomorphic: no React, no node:*; relative imports.
//
//   - PRACTICE_CATEGORY_ORDER: the three fields in the IPA / exam order (ストラテジ → マネジメント →
//     テクノロジ, as OFFICIAL_RATIO) — deliberately not the textbook's technology-first
//     CATEGORY_ORDER (lib/textbook/reader).
//   - PRACTICE_CATEGORY_LABEL_KEYS: field → Practice message key (the JP 分野 tag in every locale).
//   - starText: 頻出度 1–3 → 「★☆☆」.
//   - examsNewestFirst: exams by gregorian descending; within a year the corpus order reversed
//     (quiz_index lists a year's spring paper before its autumn one).

import type { Stars } from "./practiceIndex";

export const PRACTICE_CATEGORY_ORDER = ["strategy", "management", "technology"] as const;

export const PRACTICE_CATEGORY_LABEL_KEYS: Record<string, "cat_strategy" | "cat_management" | "cat_technology"> = {
  strategy: "cat_strategy",
  management: "cat_management",
  technology: "cat_technology",
};

export const starText = (n: Stars): string => "★".repeat(n) + "☆".repeat(3 - n);

export function examsNewestFirst<E extends { gregorian: number }>(exams: readonly E[]): E[] {
  return exams
    .map((e, i) => ({ e, i }))
    .sort((a, b) => b.e.gregorian - a.e.gregorian || b.i - a.i)
    .map(({ e }) => e);
}
