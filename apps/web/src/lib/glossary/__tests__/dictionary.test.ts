// Stage 6 (D-179 / D-180 §0-2) — static trilingual dictionary builders (pure, no disk).
//
// Guards: one entry per JP headword (zh homonyms never merge), multi-unit senses
// kept in buildNav order (technology → management → strategy), past-exam reverse
// lookup via QuizQuestion.terms, per-locale term cards, and list groups placed
// only under the representative (first-sense) topic.

import { describe, expect, it } from "vitest";

import type { ReaderIndex } from "../../textbook/reader";
import type { TextbookUnit, UnitTerm } from "../../textbook/types";
import { buildDictionary, buildListGroups, buildTermCards, toTermCard } from "../dictionary";
import { termId } from "../termId";

const term = (
  jp: string,
  zh: string,
  en: string,
  def: string,
  over: Partial<UnitTerm> = {},
): UnitTerm => ({
  term: jp,
  term_zh: zh,
  term_en: en,
  definition_jp: `${def}(jp)`,
  definition_zh: `${def}(zh)`,
  definition_en: `${def}(en)`,
  explanation_jp: "",
  explanation_zh: "",
  explanation_en: "",
  analogy_jp: "",
  analogy_zh: "",
  analogy_en: "",
  memory_hook_jp: `${def}-hook(jp)`,
  memory_hook_zh: `${def}-hook(zh)`,
  memory_hook_en: `${def}-hook(en)`,
  inline_quiz: [],
  inline_fallback: false,
  figure: null,
  ...over,
});

const unit = (unit_id: string, topic_id: string, category: string, terms: UnitTerm[]): TextbookUnit => ({
  schema_version: "stage4-unit-v1-trilingual",
  unit_id,
  topic_id,
  category,
  title_jp: unit_id,
  title_zh: unit_id,
  title_en: unit_id,
  unit_summary_jp: "",
  unit_summary_zh: "",
  unit_summary_en: "",
  order_in_topic: 1,
  prerequisites: [],
  overview: { intro_jp: "", intro_zh: "", intro_en: "", freq_badge: "標準", est_minutes: 15 },
  terms,
  summary: {
    memory_hooks_jp: [],
    memory_hooks_zh: [],
    memory_hooks_en: [],
    key_points_jp: [],
    key_points_zh: [],
    key_points_en: [],
  },
  challenge_questions: [],
  source_figures: [],
  lang_status: { jp: "done", zh: "done", en: "done" },
});

const ref = (unit_id: string, term_count: number) => ({
  unit_id,
  title_jp: unit_id,
  title_zh: unit_id,
  title_en: unit_id,
  node_freq_badge: "標準",
  term_count,
});

// strategy is listed FIRST in the index (and in the units array) so that the
// management-before-strategy sense order can only come from buildNav ordering.
const index: ReaderIndex = {
  schema_version: "stage4-toc-v1",
  stats: { topics: 2, units: 2, terms: 4 },
  topics: [
    {
      topic_id: "strategy-07-23",
      category: "strategy",
      major: "システム戦略",
      major_zh: "系统战略",
      major_en: "System Strategy",
      medium: "システム企画",
      medium_zh: "系统企划",
      medium_en: "System Planning",
      name_jp: "要件定義",
      unit_order: ["strategy-07-23-u01"],
      units: [ref("strategy-07-23-u01", 3)],
    },
    {
      topic_id: "management-08-25",
      category: "management",
      major: "開発技術",
      major_zh: "开发技术",
      major_en: "Development Technology",
      medium: "システム開発技術",
      medium_zh: "系统开发技术",
      medium_en: "System Development Technology",
      name_jp: "システム開発のプロセス",
      unit_order: ["management-08-25-u01"],
      units: [ref("management-08-25-u01", 2)],
    },
  ],
};

const units: TextbookUnit[] = [
  unit("strategy-07-23-u01", "strategy-07-23", "strategy", [
    term("機能要件", "功能性需求", "Functional requirements", "S-func"),
    term("非機能要件", "非功能性需求", "Non-functional requirements", "S-nonfunc"),
    // zh homonym of 業務要件 below: different JP headword, identical term_zh.
    term("業務要件定義", "需求定义", "Business requirements definition", "S-biz"),
  ]),
  unit("management-08-25-u01", "management-08-25", "management", [
    term("機能要件", "功能需求", "Functional requirement", "M-func"),
    term("要件定義", "需求定义", "", "M-req", { definition_en: "", memory_hook_en: "" }),
  ]),
];

const q1 = {
  id: "2024r06-q001",
  exam_id: "2024r06",
  source_label: "令和6年度 ITパスポート試験 問1",
  terms: ["機能要件", "不存在の語"],
};
const questions = [q1];

describe("buildDictionary", () => {
  const dict = buildDictionary(index, units, questions);

  it("has one entry per unique JP headword", () => {
    expect(dict.entries.map((e) => e.term).sort()).toEqual(
      ["機能要件", "非機能要件", "業務要件定義", "要件定義"].sort(),
    );
    expect(dict.byId.size).toBe(4);
    expect(dict.byTerm.size).toBe(4);
  });

  it("keys entries by termId", () => {
    const e = dict.byTerm.get("機能要件")!;
    expect(e.id).toBe(termId("機能要件"));
    expect(dict.byId.get(e.id)).toBe(e);
  });

  it("keeps every unit's sense, in buildNav order (management before strategy)", () => {
    const e = dict.byTerm.get("機能要件")!;
    expect(e.senses.map((s) => s.unitId)).toEqual(["management-08-25-u01", "strategy-07-23-u01"]);
    expect(e.senses.map((s) => s.topicId)).toEqual(["management-08-25", "strategy-07-23"]);
    expect(e.senses.map((s) => s.category)).toEqual(["management", "strategy"]);
    expect(e.senses.map((s) => s.term.definition_jp)).toEqual(["M-func(jp)", "S-func(jp)"]);
    // Headword translations come from the first (representative) sense.
    expect(e.termZh).toBe("功能需求");
    expect(e.termEn).toBe("Functional requirement");
  });

  it("orders entries by first appearance in buildNav order", () => {
    expect(dict.entries.map((e) => e.term)).toEqual(["機能要件", "要件定義", "非機能要件", "業務要件定義"]);
  });

  it("reverse-links questions and ignores unknown terms without throwing", () => {
    const e = dict.byTerm.get("機能要件")!;
    expect(e.questions).toEqual([
      { id: "2024r06-q001", examId: "2024r06", sourceLabel: "令和6年度 ITパスポート試験 問1" },
    ]);
    expect(dict.byTerm.get("非機能要件")!.questions).toEqual([]);
    expect(dict.byTerm.has("不存在の語")).toBe(false);
  });

  it("dedupes a question listed twice and tolerates missing terms", () => {
    const d = buildDictionary(index, units, [
      { ...q1, terms: ["機能要件", "機能要件"] },
      { ...q1 },
      { id: "x", exam_id: "e", source_label: "s", terms: undefined as unknown as string[] },
    ]);
    expect(d.byTerm.get("機能要件")!.questions.map((q) => q.id)).toEqual(["2024r06-q001"]);
  });

  it("never merges different JP headwords that share a zh title", () => {
    const a = dict.byTerm.get("業務要件定義")!;
    const b = dict.byTerm.get("要件定義")!;
    expect(a.termZh).toBe(b.termZh);
    expect(a.id).not.toBe(b.id);
    expect(dict.byId.get(a.id)).toBe(a);
    expect(dict.byId.get(b.id)).toBe(b);
  });

  it("merges NFC / NFD spellings of one headword into one entry", () => {
    const d = buildDictionary(index, [
      unit("strategy-07-23-u01", "strategy-07-23", "strategy", [term("ガ", "", "", "nfc")]),
      unit("management-08-25-u01", "management-08-25", "management", [term("ガ", "", "", "nfd")]),
    ], [{ id: "q", exam_id: "e", source_label: "s", terms: ["ガ"] }]);
    expect(d.entries).toHaveLength(1);
    expect(d.entries[0]!.senses).toHaveLength(2);
    expect(d.byTerm.get("ガ")).toBe(d.entries[0]);
    expect(d.entries[0]!.term).toBe("ガ"); // NFC key, though the NFD spelling is seen first
    expect(d.entries[0]!.id).toBe(termId("ガ"));
    expect(d.entries[0]!.questions.map((q) => q.id)).toEqual(["q"]);
  });
});

describe("toTermCard", () => {
  const dict = buildDictionary(index, units, questions);
  const e = dict.byTerm.get("機能要件")!;

  it("uses senses[0] for ja", () => {
    expect(toTermCard(e, "ja")).toEqual({
      id: termId("機能要件"),
      term: "機能要件",
      gloss: "機能要件",
      definition: "M-func(jp)",
      memoryHook: "M-func-hook(jp)",
      senseCount: 2,
      questionCount: 1,
    });
  });

  it("picks zh / en fields", () => {
    const zh = toTermCard(e, "zh");
    expect(zh.gloss).toBe("功能需求");
    expect(zh.definition).toBe("M-func(zh)");
    expect(zh.memoryHook).toBe("M-func-hook(zh)");
    expect(toTermCard(e, "en").gloss).toBe("Functional requirement");
  });

  it("falls back to JP when a translation is empty", () => {
    const card = toTermCard(dict.byTerm.get("要件定義")!, "en");
    expect(card.gloss).toBe("要件定義");
    expect(card.definition).toBe("M-req(jp)");
    expect(card.memoryHook).toBe("M-req-hook(jp)");
  });
});

describe("buildTermCards", () => {
  const dict = buildDictionary(index, units, questions);
  const qs = [
    { terms: ["機能要件", "不存在の語"] },
    // NFD spelling of an NFC headword still resolves; the card is keyed by the raw term.
    { terms: ["要件定義".normalize("NFD"), "機能要件"] },
  ];

  it("cards only the given questions' terms that have an entry, keyed by the raw term", () => {
    const cards = buildTermCards(dict, qs, "zh");
    expect(Object.keys(cards).sort()).toEqual(["機能要件", "要件定義".normalize("NFD")].sort());
    expect(cards["機能要件"]).toEqual(toTermCard(dict.byTerm.get("機能要件")!, "zh"));
    expect(cards["要件定義".normalize("NFD")]!.id).toBe(termId("要件定義"));
    expect(cards["不存在の語"]).toBeUndefined();
  });

  it("returns {} when the dictionary is unavailable (terms fall back to plain text)", () => {
    expect(buildTermCards(null, qs, "ja")).toEqual({});
  });
});

describe("buildListGroups", () => {
  const dict = buildDictionary(index, units, questions);

  it("orders groups like buildNav and localizes labels", () => {
    const groups = buildListGroups(dict, index, "zh");
    expect(groups.map((g) => g.topicId)).toEqual(["management-08-25", "strategy-07-23"]);
    expect(groups.map((g) => g.category)).toEqual(["management", "strategy"]);
    expect(groups[0]).toMatchObject({
      major: "开发技术",
      medium: "系统开发技术",
      nameJp: "システム開発のプロセス",
    });
  });

  it("lists each entry only under its representative (first-sense) topic", () => {
    const groups = buildListGroups(dict, index, "ja");
    const terms = groups.map((g) => g.items.map((i) => i.term));
    expect(new Set(terms[0])).toEqual(new Set(["機能要件", "要件定義"]));
    expect(new Set(terms[1])).toEqual(new Set(["非機能要件", "業務要件定義"]));
    expect(terms.flat()).toHaveLength(dict.entries.length);
  });

  it("sorts items by JP headword with localeCompare('ja')", () => {
    const groups = buildListGroups(dict, index, "ja");
    for (const g of groups) {
      const sorted = [...g.items].sort((a, b) => a.term.localeCompare(b.term, "ja"));
      expect(g.items).toEqual(sorted);
    }
  });

  it("carries id / gloss / search", () => {
    const item = buildListGroups(dict, index, "en")[0]!.items.find((i) => i.term === "機能要件")!;
    expect(item).toEqual({
      id: termId("機能要件"),
      term: "機能要件",
      gloss: "Functional requirement",
      search: "機能要件\n功能需求\nfunctional requirement\n功能性需求\nfunctional requirements",
    });
  });

  it("search covers every sense's zh/en, not just senses[0]", () => {
    const d = buildDictionary(
      index,
      [
        unit("management-08-25-u01", "management-08-25", "management", [term("ＲＦＩＤ", "射频识别", "RFID", "M")]),
        unit("strategy-07-23-u01", "strategy-07-23", "strategy", [term("ＲＦＩＤ", "电子标签", "Radio Frequency ID", "S")]),
      ],
      [],
    );
    const item = buildListGroups(d, index, "ja")[0]!.items[0]!;
    expect(item.search).toContain("radio frequency id");
    expect(item.search).toContain("电子标签");
    // NFKC folds the full-width JP headword so an ASCII query can hit it.
    expect(item.search.startsWith("rfid\n")).toBe(true);
  });

  it("omits topics that own no entries", () => {
    const d = buildDictionary(index, [units[1]!], []);
    expect(buildListGroups(d, index, "ja").map((g) => g.topicId)).toEqual(["management-08-25"]);
  });
});
