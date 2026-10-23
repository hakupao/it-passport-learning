// Stage 7 Phase 1 Task 14 — the shared question-id shape matches every id of the committed corpus
// (so the strict check in the /practice/q route, the legacy /quiz redirect, the /sensei thread rows
// and an AI 先生 reply's `#<question_id>` link never rejects a real question) and nothing looser.
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { QUESTION_ID } from "../questionId";

const ROOT = path.resolve(__dirname, "../../../../../..");
const IDS = (
  JSON.parse(readFileSync(path.join(ROOT, "data/ip/quiz/questions.json"), "utf-8")).questions as { id: string }[]
).map((q) => q.id);

describe("QUESTION_ID", () => {
  it("matches all 2900 corpus ids", () => {
    expect(IDS).toHaveLength(2900);
    expect(IDS.filter((id) => !QUESTION_ID.test(id))).toEqual([]);
  });

  it("rejects other shapes", () => {
    for (const bad of ["", "2009h21a", "2009h21a-q54", "2009h21a-q0540", "2009H21A-q054", "abc-q001", "2009h21a-q054:イ", "a/b-q001", "2011h23tokubetsux-q001"]) {
      expect(QUESTION_ID.test(bad), bad).toBe(false);
    }
  });
});
