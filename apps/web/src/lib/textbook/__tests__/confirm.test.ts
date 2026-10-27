// Stage 7 Phase 3 Task 1 (D-196 §0-1 / §0-5) — unit-end confirmation questions.
import { describe, expect, it } from "vitest";

import { emptyRecord, recordAttempt } from "../../learning/record";
import { resolveScope } from "../../practice/practiceIndex";
import { loadChumonMembers, type ChumonMembers } from "../../practice/chumonMembers";
import { loadChumonRegistry } from "../../practice/practiceReader";
import { loadBaseQuestions } from "../../quiz/quizReader";
import { confirmHref, nextRun, orderConfirm, pastCount, pickConfirm } from "../confirm";
import { loadAllUnits, normalizeUnit, type ReaderTerm, type ReaderUnit } from "../reader";
import { frozenV1 } from "./v1Frozen";

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
    overviewCols: null,
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
    for (const raw of units) {
      const u = normalizeUnit(raw, members);
      const ids = pickConfirm(u, members);
      // independent of the reader model (B4: the batch rewrite changes the corpus distribution, so it is
      // recomputed per unit from the raw fields instead of pinned): raw challenge_questions, then raw
      // non-fallback inline_quiz in term order up to 3, members dropped, deduped, at most 5
      const want: string[] = [];
      const take = (id: string) => {
        if (!members.has(id) && !want.includes(id)) want.push(id);
      };
      raw.challenge_questions.forEach(take);
      for (const t of raw.terms) for (const id of t.inline_fallback ? [] : t.inline_quiz) if (want.length < 3) take(id);
      expect(ids, u.id).toEqual(want.slice(0, 5));
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
    // (history: the all-v1 corpus measured { 3: 26, 4: 45, 5: 173 } at D-196 §0-1; no longer pinned, B4)
  });

  it("anchors: technology-21-54-u01 (v1, frozen copy: no challenge_questions) / management-10-27-u02 past count", async () => {
    const [units, members] = await Promise.all([loadAllUnits(), loadChumonMembers()]);
    const norm = (id: string) => normalizeUnit(units.find((u) => u.unit_id === id)!, members);
    const v1 = frozenV1("technology-21-54-u01");
    expect(v1.challenge_questions).toEqual([]);
    expect(pickConfirm(normalizeUnit(v1, members), members)).toEqual([
      "2009h21h-q058",
      "2011h23a-q053",
      "2014h26a-q074",
    ]);
    // the pilot is a frozen baseline (D-201 §0-4), so its live file is stable
    expect(pastCount(norm("management-10-27-u02"))).toBe(17); // v2 (S135): 5 confirm ∪ 12 term quiz, no members (v1: 11)
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

describe("confirmHref / nextRun (§0-2)", () => {
  it("builds the from=unit practice link with the given run", () => {
    expect(confirmHref(["a-q001", "b-q002"], "x-00-00-u01", "1730000000000")).toBe(
      "/practice?ids=a-q001,b-q002&from=unit&unit=x-00-00-u01&run=1730000000000",
    );
    expect(confirmHref(["a-q001"], "x-00-00-u01", null)).toBe("/practice?ids=a-q001&from=unit&unit=x-00-00-u01");
    expect(confirmHref(["a-q001"], "x-00-00-u01", "7", "t0123456789abcdef")).toBe(
      "/practice?ids=a-q001&from=unit&unit=x-00-00-u01&at=t0123456789abcdef&run=7",
    );
  });

  it("every click gets a new run, even within the same millisecond; run fits /^\\d{1,16}$/", () => {
    const a = nextRun(null, 1_730_000_000_000);
    const b = nextRun(a, 1_730_000_000_000);
    const c = nextRun(b, 1_730_000_000_500);
    expect([a, b, c]).toEqual(["1730000000000", "1730000000001", "1730000000500"]);
    for (const r of [a, b, c]) expect(r).toMatch(/^\d{1,16}$/);
  });
});
