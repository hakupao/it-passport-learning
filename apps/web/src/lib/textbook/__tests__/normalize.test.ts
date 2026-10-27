// Stage 7 Phase 3 Task 1 (D-196 §0-6) — v1 units → reader model, over the real corpus.
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { termId } from "../../glossary/termId";
import { loadChumonMembers, type ChumonMembers } from "../../practice/chumonMembers";
import { loadAllUnits, normalizeUnit, UNIT_ID_RE } from "../reader";
import type { TextbookUnitV2 } from "../types";

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
      expect(u.overviewCols).toBeNull();
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

// Stage 7 Phase 3 Task 6 (D-196 §0-9) — a v2 unit reads its new fields (markup kept:
// the reader parses it), with the same chumon filtering as v1.
describe("normalizeUnit (v2)", () => {
  const SAMPLE = JSON.parse(
    readFileSync(path.join(__dirname, "..", "__fixtures__", "v2-sample.json"), "utf-8"),
  ) as TextbookUnitV2;

  it("maps the new fields", async () => {
    const members = await loadChumonMembers();
    const u = normalizeUnit(SAMPLE, members);
    expect(u.schema).toBe("v2");
    expect(u.id).toBe(SAMPLE.unit_id);
    expect(u.title).toEqual({ jp: SAMPLE.title_jp, zh: SAMPLE.title_zh, en: SAMPLE.title_en });
    expect(u.goals).toEqual({ jp: SAMPLE.goals_jp, zh: SAMPLE.goals_zh, en: SAMPLE.goals_en });
    expect(u.overviewCols).toEqual({ jp: ["位置づけ"], zh: ["定位"], en: ["Role"] });
    expect(u.overviewRows).toHaveLength(6);
    expect(u.overviewRows![3]).toEqual({
      term: "軽減",
      one: { jp: "確率か影響を下げる", zh: "降低概率或影响", en: "Lower probability or impact" },
      extra: { jp: ["確率・影響を下げる"], zh: ["降低概率或影响"], en: ["Lower probability or impact"] },
    });
    expect(u.keyPoints).toEqual({ jp: SAMPLE.key_points_jp, zh: SAMPLE.key_points_zh, en: SAMPLE.key_points_en });
    expect(u.minutes).toBe(12);
    expect(u.freqBadge).toBe(SAMPLE.overview.freq_badge);
    expect(u.challenge).toEqual(SAMPLE.challenge_questions.filter((id) => !members.has(id)));
    expect(u.pairs).toEqual([
      {
        a: "回避",
        b: "軽減",
        rows: SAMPLE.pairs[0]!.rows.map((r) => ({
          label: { jp: r.label_jp, zh: r.label_zh, en: r.label_en },
          a: { jp: r.a_jp, zh: r.a_zh, en: r.a_en },
          b: { jp: r.b_jp, zh: r.b_zh, en: r.b_en },
          key: r.key,
        })),
      },
    ]);
    SAMPLE.terms.forEach((t, i) => {
      const rt = u.terms[i]!;
      expect(rt.id).toBe(termId(t.term));
      expect(rt.gloss).toEqual({ jp: t.term, zh: t.term_zh, en: t.term_en });
      expect(rt.one).toEqual({ jp: t.one_jp, zh: t.one_zh, en: t.one_en });
      expect(rt.one.jp).toContain("**");
      expect(rt.detail).toEqual({ jp: t.detail_jp, zh: t.detail_zh, en: t.detail_en });
      expect(rt.fig).toEqual(t.fig);
      expect(rt.quiz).toEqual(t.quiz.filter((id) => !members.has(id)));
      expect(rt.points).toEqual(
        t.points.map((p) => ({ kind: p.kind, text: { jp: p.text_jp, zh: p.text_zh, en: p.text_en }, ...(p.qids ? { qids: p.qids } : {}) })),
      );
    });
    const kaihi = u.terms[2]!;
    expect(kaihi.hook).toEqual({ jp: SAMPLE.terms[2]!.hook_jp, zh: SAMPLE.terms[2]!.hook_zh, en: SAMPLE.terms[2]!.hook_en });
    expect(kaihi.analogy?.jp).toBe(SAMPLE.terms[2]!.analogy_jp);
  });

  it("a term without analogy / hook gets null (受容)", async () => {
    const u = normalizeUnit(SAMPLE, await loadChumonMembers());
    const juyou = u.terms.find((t) => t.term === "受容")!;
    expect(juyou.analogy).toBeNull();
    expect(juyou.hook).toBeNull();
  });

  it("drops a chumon group member from a v2 term's quiz and the challenge list", () => {
    // stand-in member set: 2016h28a-q042 (受容's only question) as if it were a group member
    const fake = new Set(["2016h28a-q042"]) as unknown as ChumonMembers;
    const raw = structuredClone(SAMPLE);
    raw.challenge_questions = [...raw.challenge_questions, "2016h28a-q042"];
    const u = normalizeUnit(raw, fake);
    expect(u.terms.find((t) => t.term === "受容")!.quiz).toEqual([]);
    expect(u.challenge).toEqual(SAMPLE.challenge_questions);
  });
});
