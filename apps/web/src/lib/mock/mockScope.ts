// Stage 7 Phase 2 Task 4 (D-193 §0-2, Review Focus 5) — the exam page's URL ↔ mock scope.
//
//   /mock/run?exam=<exam_id>  → that exam's questions (examMockIds); `exam=` wins over `ids=`;
//                               an unknown exam → null (the page answers 404 because `exam=` was given).
//   /mock/run?ids=<id,id,…>   → a random mock drawn on the setup page: unknown and repeated ids
//                               dropped, input order kept, at most MOCK_N; fewer than MOCK_N left →
//                               null (the page goes back to the setup page).
//
// Pure, relative imports (like practiceSession).

import type { SearchParams } from "../practice/practiceSession";
import { MOCK_N } from "./mockModel";

export type MockScope = { kind: "exam"; examId: string } | { kind: "random"; ids: string[] };

const first = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v);

/** The mock a URL asks for (see header); null = 404 (exam=) or back to the setup page. */
export function parseMockScope(
  sp: SearchParams,
  validIds: ReadonlySet<string>,
  validExams: ReadonlySet<string>,
): MockScope | null {
  const exam = first(sp.exam);
  if (exam !== undefined) return validExams.has(exam) ? { kind: "exam", examId: exam } : null;
  const ids = [
    ...new Set(
      (first(sp.ids) ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter((id) => validIds.has(id)),
    ),
  ].slice(0, MOCK_N);
  return ids.length === MOCK_N ? { kind: "random", ids } : null;
}

/** The exam page's URL for a scope (locale-less; the i18n Link / router adds the locale). */
export function mockRunHref(scope: MockScope): string {
  return scope.kind === "exam"
    ? `/mock/run?exam=${encodeURIComponent(scope.examId)}`
    : `/mock/run?ids=${scope.ids.join(",")}`;
}
