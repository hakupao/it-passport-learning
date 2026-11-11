// D-217 H1-4 (LOW-1 of H1-3) — the loader lifts each explanation's key_guard.suspect to
// explanation.suspect (server side, quizReader), so the display code (localizedExplanation,
// ExplanationPane, the AI 先生 anchors — all bundled for the browser) reads `suspect` only and never
// names key_guard. key_guard itself stays on the loader object (corpus scripts and tests read it).
import { describe, expect, it } from "vitest";

import { loadAllQuestions } from "../quizReader";

describe("loader: explanation.suspect = key_guard.suspect", () => {
  it("every explained question, 84 suspect (corpus anchor)", async () => {
    const all = await loadAllQuestions();
    const explained = all.filter((q) => q.explanation);
    expect(explained.length).toBeGreaterThan(2800);
    for (const q of explained) {
      expect(q.explanation!.suspect, q.id).toBe(q.explanation!.key_guard.suspect === true);
    }
    expect(explained.filter((q) => q.explanation!.suspect)).toHaveLength(84);
  });
});
