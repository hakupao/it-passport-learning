// D-217 H1-4 (LOW-1 of H1-3) — the loader lifts each explanation's key_guard.suspect to
// explanation.suspect (server side, quizReader), so the display code (localizedExplanation,
// ExplanationPane, the AI 先生 anchors — all bundled for the browser) reads `suspect` only and never
// names key_guard. key_guard itself stays on the loader object (corpus scripts and tests read it).
import { describe, expect, it } from "vitest";

import { loadAllQuestions } from "../quizReader";

// D-235 (S163 C28): a blind re-check that reached the keyed answer (key_guard.recheck.cleared) clears
// the displayed flag; key_guard.suspect keeps the generate-time count (audit trail).
describe("loader: explanation.suspect = key_guard.suspect minus re-check clears", () => {
  it("every explained question; 84 generate-time suspect, all re-checked and cleared → 0 displayed (corpus anchors)", async () => {
    const all = await loadAllQuestions();
    const explained = all.filter((q) => q.explanation);
    expect(explained.length).toBeGreaterThan(2800);
    for (const q of explained) {
      const kg = q.explanation!.key_guard;
      expect(q.explanation!.suspect, q.id).toBe(kg.suspect === true && kg.recheck?.cleared !== true);
    }
    const generated = explained.filter((q) => q.explanation!.key_guard.suspect === true);
    expect(generated).toHaveLength(84);
    expect(explained.filter((q) => q.explanation!.key_guard.recheck).map((q) => q.id)).toEqual(generated.map((q) => q.id));
    expect(explained.filter((q) => q.explanation!.suspect)).toHaveLength(0);
  });
});
