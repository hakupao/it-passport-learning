import { describe, expect, it } from "vitest";

import type { DictEntry } from "@/lib/glossary/dictionary";
import type { TextbookUnit, UnitTerm } from "@/lib/textbook/types";

import { termAnchor, unitAnchor } from "../textbookAnchors";

function unitTerm(term: string, tag: string): UnitTerm {
  return {
    term,
    term_zh: `${term}ZH名-${tag}`,
    term_en: `${term} EN name-${tag}`,
    definition_jp: `JP定義-${tag}`,
    definition_zh: `ZH定义-${tag}`,
    definition_en: `EN definition-${tag}`,
    explanation_jp: `JP解説-${tag}`,
    explanation_zh: `ZH解说-${tag}`,
    explanation_en: `EN explanation-${tag}`,
    analogy_jp: `JPたとえ-${tag}`,
    analogy_zh: `ZH类比-${tag}`,
    analogy_en: `EN analogy-${tag}`,
    memory_hook_jp: `JPフック-${tag}`,
    memory_hook_zh: `ZH口诀-${tag}`,
    memory_hook_en: `EN hook-${tag}`,
    inline_quiz: [`QUIZ-${tag}`],
    inline_fallback: false,
    figure: null,
  };
}

/** The same object with its keys in reverse insertion order (recursively). */
function reversedKeys<T>(x: T): T {
  if (Array.isArray(x)) return x.map(reversedKeys) as T;
  if (x && typeof x === "object") {
    return Object.fromEntries(Object.entries(x).reverse().map(([k, v]) => [k, reversedKeys(v)])) as T;
  }
  return x;
}

const ENTRY: DictEntry = {
  id: "t0123456789abcdef",
  term: "機能要件",
  termZh: "機能要件ZH名-a",
  termEn: "機能要件 EN name-a",
  senses: [
    { unitId: "management-08-25-u01", topicId: "management-08-25", category: "management", term: unitTerm("機能要件", "a") },
    { unitId: "strategy-03-12-u02", topicId: "strategy-03-12", category: "strategy", term: unitTerm("機能要件", "b") },
    { unitId: "technology-14-36-u03", topicId: "technology-14-36", category: "technology", term: unitTerm("機能要件", "c") },
  ],
  questions: [{ id: "2009h21a-q054", examId: "2009h21a", sourceLabel: "平成21年度 秋期 問54" }],
};

const UNIT_TITLES_JP: Record<string, string> = {
  "management-08-25-u01": "要件定義と設計",
  "strategy-03-12-u02": "システム戦略",
  "technology-14-36-u03": "データ構造",
};

const UNIT: TextbookUnit = {
  schema_version: "stage4-unit-v1-trilingual",
  unit_id: "management-08-25-u01",
  topic_id: "management-08-25",
  category: "management",
  title_jp: "JP単元名",
  title_zh: "ZH单元名",
  title_en: "EN unit title",
  unit_summary_jp: "JP単元概要",
  unit_summary_zh: "ZH单元概要",
  unit_summary_en: "EN unit summary",
  order_in_topic: 1,
  prerequisites: [],
  overview: { intro_jp: "JP導入", intro_zh: "ZH导入", intro_en: "EN intro", freq_badge: "★★", est_minutes: 10 },
  terms: [unitTerm("機能要件", "a"), unitTerm("非機能要件", "b"), unitTerm("品質特性", "c")],
  summary: {
    memory_hooks_jp: ["JPまとめフック"],
    memory_hooks_zh: ["ZH总结口诀"],
    memory_hooks_en: ["EN summary hook"],
    key_points_jp: ["JP要点"],
    key_points_zh: ["ZH要点"],
    key_points_en: ["EN key point"],
  },
  challenge_questions: ["CHALLENGE-1"],
  source_figures: [],
  lang_status: { jp: "done", zh: "done", en: "done" },
};

describe("termAnchor", () => {
  it("is byte-stable: same input → same text, independent of object key order", () => {
    const a = termAnchor(ENTRY, "en", UNIT_TITLES_JP);
    expect(termAnchor(ENTRY, "en", UNIT_TITLES_JP)).toBe(a);
    expect(termAnchor(reversedKeys(ENTRY), "en", reversedKeys(UNIT_TITLES_JP))).toBe(a);
  });

  it("lists every sense in order, each with its unit and JP definition / explanation / memory hook", () => {
    const text = termAnchor(ENTRY, "ja", UNIT_TITLES_JP);
    let last = -1;
    for (const tag of ["a", "b", "c"]) {
      for (const field of [`JP定義-${tag}`, `JP解説-${tag}`, `JPフック-${tag}`]) {
        expect(text).toContain(field);
        expect(text.indexOf(field)).toBeGreaterThan(last);
        last = text.indexOf(field);
      }
    }
    expect(text).toContain("要件定義と設計");
    expect(text).toContain("システム戦略");
    expect(text).toContain("データ構造");
    expect(text).toContain("3 つの単元");
  });

  it("ja: JP only — no zh / en text", () => {
    const text = termAnchor(ENTRY, "ja", UNIT_TITLES_JP);
    expect(text).toContain("回答言語: 日本語");
    expect(text).not.toMatch(/ZH|EN /);
  });

  it("en: JP original + English, no zh; zh: JP original + Chinese, no en", () => {
    const en = termAnchor(ENTRY, "en", UNIT_TITLES_JP);
    expect(en).toContain("回答言語: 英語");
    for (const tag of ["a", "b", "c"]) {
      expect(en).toContain(`JP定義-${tag}`);
      expect(en).toContain(`EN definition-${tag}`);
      expect(en).toContain(`EN explanation-${tag}`);
      expect(en).toContain(`EN hook-${tag}`);
      expect(en).toContain(`機能要件 EN name-${tag}`);
    }
    expect(en).not.toContain("ZH");

    const zh = termAnchor(ENTRY, "zh", UNIT_TITLES_JP);
    expect(zh).toContain("回答言語: 簡体字中国語");
    expect(zh).toContain("ZH定义-b");
    expect(zh).not.toContain("EN ");
  });

  it("leaves out the analogy, the inline quiz and the past-exam list", () => {
    for (const locale of ["ja", "zh", "en"] as const) {
      const text = termAnchor(ENTRY, locale, UNIT_TITLES_JP);
      expect(text).not.toMatch(/たとえ|类比|analogy|QUIZ|2009h21a-q054|平成21年度/);
    }
  });

  it("an empty translation drops that line instead of repeating the JP text", () => {
    const sense = { ...ENTRY.senses[0]!, term: { ...unitTerm("機能要件", "a"), explanation_en: "" } };
    const text = termAnchor({ ...ENTRY, senses: [sense] }, "en", UNIT_TITLES_JP);
    expect(text).toContain("EN definition-a");
    expect(text.match(/JP解説-a/g)).toHaveLength(1);
    expect(text).not.toContain("つの単元"); // one sense: no multi-sense note
  });

  it("a unit missing from the titles falls back to its id", () => {
    expect(termAnchor(ENTRY, "ja", {})).toContain("management-08-25-u01");
  });
});

describe("unitAnchor", () => {
  it("is byte-stable: same input → same text, independent of object key order", () => {
    const a = unitAnchor(UNIT, "zh");
    expect(unitAnchor(UNIT, "zh")).toBe(a);
    expect(unitAnchor(reversedKeys(UNIT), "zh")).toBe(a);
  });

  it("holds the unit title and summary, then every term in unit order", () => {
    const text = unitAnchor(UNIT, "ja");
    expect(text).toContain("JP単元名");
    expect(text).toContain("JP単元概要");
    expect(text).toContain("management-08-25-u01");
    let last = text.indexOf("JP単元概要");
    for (const [term, tag] of [["機能要件", "a"], ["非機能要件", "b"], ["品質特性", "c"]] as const) {
      for (const field of [term, `JP定義-${tag}`, `JP解説-${tag}`, `JPフック-${tag}`]) {
        expect(text.indexOf(field, last)).toBeGreaterThan(last);
        last = text.indexOf(field, last);
      }
    }
  });

  it("ja: JP only; en: JP original + English, no zh", () => {
    const ja = unitAnchor(UNIT, "ja");
    expect(ja).toContain("回答言語: 日本語");
    expect(ja).not.toMatch(/ZH|EN /);

    const en = unitAnchor(UNIT, "en");
    expect(en).toContain("回答言語: 英語");
    for (const s of ["JP単元名", "EN unit title", "JP単元概要", "EN unit summary", "EN definition-c", "EN explanation-c", "EN hook-c", "品質特性 EN name-c"]) {
      expect(en).toContain(s);
    }
    expect(en).not.toContain("ZH");
  });

  it("leaves out the analogy, the inline / challenge quiz, the overview and the summary lists", () => {
    for (const locale of ["ja", "zh", "en"] as const) {
      const text = unitAnchor(UNIT, locale);
      expect(text).not.toMatch(/たとえ|类比|analogy|QUIZ|CHALLENGE|導入|导入|intro|まとめ|总结|summary hook|要点|key point/);
    }
  });
});
