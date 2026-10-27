// Stage 7 Phase 3 Task 1 (D-196 §0-1 / §0-5) — unit-end confirmation questions.
import { describe, expect, it } from "vitest";

import { emptyRecord, recordAttempt } from "../../learning/record";
import { resolveScope } from "../../practice/practiceIndex";
import { loadChumonMembers, type ChumonMembers } from "../../practice/chumonMembers";
import { loadChumonRegistry } from "../../practice/practiceReader";
import { loadBaseQuestions } from "../../quiz/quizReader";
import { orderConfirm, pastCount, pickConfirm } from "../confirm";
import { loadAllUnits, normalizeUnit, type ReaderTerm, type ReaderUnit } from "../reader";

const DAY = 86_400_000;

/** Synthetic member set for hand-made units (production code only gets one from loadChumonMembers). */
const fakeMembers = (...ids: string[]): ChumonMembers => new Set(ids) as ReadonlySet<string> as ChumonMembers;

function unit(challenge: string[], quizzes: string[][]): ReaderUnit {
  const l = { jp: "", zh: "", en: "" };
  const terms: ReaderTerm[] = quizzes.map((quiz, i) => ({
    id: `t${i}`,
    term: `T${i}`,
    gloss: l,
    one: l,
    detail: l,
    analogy: null,
    hook: null,
    points: [],
    fig: null,
    quiz,
  }));
  return {
    id: "x-00-00-u01",
    topicId: "x-00-00",
    category: "x",
    title: l,
    goals: null,
    overviewRows: null,
    terms,
    pairs: [],
    keyPoints: { jp: [], zh: [], en: [] },
    challenge,
    minutes: 1,
    freqBadge: "",
    schema: "v1",
  };
}

describe("pickConfirm", () => {
  it("drops group members, tops up to 3 in term order (deduped), caps at 5", () => {
    const m = fakeMembers("g1", "g2");
    expect(pickConfirm(unit(["a", "g1", "b"], [["b", "g2", "c"], ["d"]]), m)).toEqual(["a", "b", "c"]);
    expect(pickConfirm(unit([], [["a"], ["a", "b"], ["c", "d"]]), m)).toEqual(["a", "b", "c"]);
    expect(pickConfirm(unit(["a", "b", "c", "d", "e", "f"], []), m)).toEqual(["a", "b", "c", "d", "e"]);
    expect(pickConfirm(unit(["a", "a", "b", "c"], [["d"]]), m)).toEqual(["a", "b", "c"]);
  });

  it("every corpus unit gets 3〜5 resolvable, same-topic, non-member questions", async () => {
    const [units, members, groups, questions] = await Promise.all([
      loadAllUnits(),
      loadChumonMembers(),
      loadChumonRegistry(),
      loadBaseQuestions(),
    ]);
    const byId = new Map(questions.map((q) => [q.id, q]));
    const dist: Record<number, number> = {};
    for (const raw of units) {
      const u = normalizeUnit(raw, members);
      const ids = pickConfirm(u, members);
      dist[ids.length] = (dist[ids.length] ?? 0) + 1;
      expect(ids.length, u.id).toBeGreaterThanOrEqual(3);
      expect(ids.length, u.id).toBeLessThanOrEqual(5);
      expect(new Set(ids).size, u.id).toBe(ids.length);
      for (const id of ids) {
        expect(members.has(id), `${u.id} ${id}`).toBe(false);
        expect(byId.get(id)?.topic_id, `${u.id} ${id}`).toBe(u.topicId);
      }
      expect(resolveScope({ kind: "ids", ids }, questions, groups), u.id).toEqual(ids);
      // independent of the reader model: raw challenge_questions + raw non-fallback inline_quiz, members dropped
      const rawPast = new Set(
        [...raw.challenge_questions, ...raw.terms.flatMap((t) => (t.inline_fallback ? [] : t.inline_quiz))].filter(
          (id) => !members.has(id),
        ),
      );
      expect(pastCount(u), u.id).toBe(rawPast.size);
    }
    // Measured on the v1 corpus (D-196 §0-1). Update when the data changes: Task 9's v2
    // units (management-10-27-u01〜u03) bring new challenge_questions and change it.
    expect(dist).toEqual({ 3: 26, 4: 45, 5: 173 });
  });

  it("anchors: technology-21-54-u01 (no challenge_questions) / management-10-27-u02 past count", async () => {
    const [units, members] = await Promise.all([loadAllUnits(), loadChumonMembers()]);
    const norm = (id: string) => normalizeUnit(units.find((u) => u.unit_id === id)!, members);
    expect(pickConfirm(norm("technology-21-54-u01"), members)).toEqual([
      "2009h21h-q058",
      "2011h23a-q053",
      "2014h26a-q074",
    ]);
    expect(pastCount(norm("management-10-27-u02"))).toBe(11);
  });
});

describe("pastCount", () => {
  it("counts confirm ∪ term quiz once each", () => {
    expect(pastCount(unit(["a", "b"], [["b", "c"], ["c", "d"]]))).toBe(4);
    expect(pastCount(unit([], []))).toBe(0);
  });
});

describe("orderConfirm", () => {
  const now = Date.UTC(2026, 9, 27, 12);

  it("empty record keeps the given order", () => {
    expect(orderConfirm(["a", "b", "c"], emptyRecord(), now)).toEqual(["a", "b", "c"]);
  });

  it("never answered → in the mistakes book → the rest, stable within each", () => {
    let r = emptyRecord();
    r = recordAttempt(r, "a", "ア", true, now - 3 * DAY); // answered, not a mistake
    r = recordAttempt(r, "c", "ア", false, now - 2 * DAY); // mistake
    r = recordAttempt(r, "e", "イ", false, now - DAY); // mistake
    expect(orderConfirm(["a", "b", "c", "d", "e"], r, now)).toEqual(["b", "d", "c", "e", "a"]);
  });

  it("all answered and none wrong keeps the given order", () => {
    let r = emptyRecord();
    for (const id of ["a", "b", "c"]) r = recordAttempt(r, id, "ア", true, now - DAY);
    expect(orderConfirm(["c", "a", "b"], r, now)).toEqual(["c", "a", "b"]);
  });

  it("a mistake fixed on two later days is no longer in the book", () => {
    let r = emptyRecord();
    r = recordAttempt(r, "a", "ア", false, now - 3 * DAY);
    r = recordAttempt(r, "a", "ア", true, now - 2 * DAY);
    r = recordAttempt(r, "a", "ア", true, now - DAY);
    r = recordAttempt(r, "b", "ア", false, now - DAY);
    expect(orderConfirm(["a", "b"], r, now)).toEqual(["b", "a"]);
  });
});
