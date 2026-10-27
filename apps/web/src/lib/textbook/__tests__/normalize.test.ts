// Stage 7 Phase 3 Task 1 (D-196 §0-6) — v1 units → reader model, over the real corpus.
import { describe, expect, it } from "vitest";

import { termId } from "../../glossary/termId";
import { loadChumonMembers } from "../../practice/chumonMembers";
import { loadAllUnits, normalizeUnit, UNIT_ID_RE } from "../reader";

describe("normalizeUnit (v1)", () => {
  it("maps every unit of the corpus by §0-6", async () => {
    const [units, members] = await Promise.all([loadAllUnits(), loadChumonMembers()]);
    expect(units).toHaveLength(244);
    for (const raw of units) {
      const u = normalizeUnit(raw, members);
      expect(u.schema).toBe("v1");
      expect(u.id).toBe(raw.unit_id);
      expect(UNIT_ID_RE.test(u.id), u.id).toBe(true);
      expect(u.topicId).toBe(raw.topic_id);
      expect(u.title).toEqual({ jp: raw.title_jp, zh: raw.title_zh, en: raw.title_en });
      expect(u.goals).toBeNull();
      expect(u.overviewRows).toBeNull();
      expect(u.pairs).toEqual([]);
      expect(u.keyPoints.jp).toEqual(raw.summary.key_points_jp);
      expect(u.minutes).toBe(raw.overview.est_minutes);
      expect(u.freqBadge).toBe(raw.overview.freq_badge);
      expect(u.challenge.some((id) => members.has(id)), u.id).toBe(false);
      expect(u.terms).toHaveLength(raw.terms.length);
      raw.terms.forEach((t, i) => {
        const rt = u.terms[i]!;
        expect(rt.id).toBe(termId(t.term));
        expect(rt.term).toBe(t.term);
        expect(rt.gloss).toEqual({ jp: t.term, zh: t.term_zh, en: t.term_en });
        expect(rt.one.jp).toBe(t.definition_jp);
        expect(rt.one.en).toBe(t.definition_en);
        expect(rt.detail.jp).toBe(t.explanation_jp);
        expect(rt.detail.zh).toBe(t.explanation_zh);
        expect(rt.points).toEqual([]);
        expect(rt.analogy?.jp ?? "").toBe(t.analogy_jp);
        expect(rt.hook?.jp ?? "").toBe(t.memory_hook_jp);
        expect(rt.fig).toEqual(t.figure ? { kind: "svg", mode: "static", data: { path: t.figure.svg_path } } : null);
        const want = t.inline_fallback ? [] : t.inline_quiz.filter((id) => !members.has(id));
        expect(rt.quiz).toEqual(want);
      });
    }
  });

  it("drops a chumon group member from a term's quiz (strategy-01-02-u14 最適化)", async () => {
    const [units, members] = await Promise.all([loadAllUnits(), loadChumonMembers()]);
    const raw = units.find((u) => u.unit_id === "strategy-01-02-u14")!;
    expect(raw.terms[2]!.term).toBe("最適化");
    expect(raw.terms[2]!.inline_quiz).toEqual(["2009h21h-q097", "2011h23a-q024"]);
    expect(normalizeUnit(raw, members).terms[2]!.quiz).toEqual(["2011h23a-q024"]);
  });

  it("analogy / hook are null when absent", async () => {
    const [[raw], members] = await Promise.all([loadAllUnits(), loadChumonMembers()]);
    const t = { ...raw!.terms[0]!, analogy_jp: "", analogy_zh: "", analogy_en: "", memory_hook_jp: "", memory_hook_zh: "", memory_hook_en: "" };
    const u = normalizeUnit({ ...raw!, terms: [t] }, members);
    expect(u.terms[0]!.analogy).toBeNull();
    expect(u.terms[0]!.hook).toBeNull();
  });

  it("rejects an unknown schema_version", async () => {
    const [[raw], members] = await Promise.all([loadAllUnits(), loadChumonMembers()]);
    expect(() => normalizeUnit({ ...raw!, schema_version: "nope" }, members)).toThrow(/schema_version/);
  });
});
