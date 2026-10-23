// Stage 7 Phase 1 (D-190 §0-8 / §0-11 / §0-12 / §0-20) — practice index over the
// real committed corpus (data/ip/quiz + data/ip/textbook). Failure messages carry
// ids / counts / offsets only — never stem text (IPA copyright).
import { describe, expect, it } from "vitest";

import { loadDictionary } from "../../glossary/dictionaryReader";
import { loadAllQuestions, loadQuizIndex } from "../../quiz/quizReader";
import { localizedStem, type QuizQuestion } from "../../quiz/quizModel";
import { loadReaderIndex } from "../../textbook/reader";
import {
  buildTodayIndex,
  groupMap,
  lcpPreamble,
  poolFromIndex,
  resolveScope,
  topicStars,
  type ChumonGroup,
  type StemLang,
} from "../practiceIndex";
import { loadChumonGroups, loadTodayIndex } from "../practiceReader";

const LANG_LOCALE: Record<StemLang, string> = { jp: "ja", zh: "zh", en: "en" };

function rawLcp(stems: string[]): number {
  let n = stems[0]!.length;
  for (const s of stems) {
    let i = 0;
    while (i < n && i < s.length && s[i] === stems[0]![i]) i++;
    n = i;
  }
  return n;
}

function q(id: string, topic: string, exam = id.split("-q")[0]!): QuizQuestion {
  return {
    id,
    exam_id: exam,
    topic_id: topic,
    category: "technology",
    source_label: "",
    stem_jp: "",
    choices_jp: {},
    correct_answer: "ア",
    has_figure: false,
    figure: null,
    figure_type: null,
    terms: [],
  };
}

describe("topicStars (§0-11)", () => {
  it("63 topics → 21 / 21 / 21, more questions never fewer stars", async () => {
    const index = await loadQuizIndex();
    const stars = topicStars(index);
    expect(Object.keys(stars)).toHaveLength(63);
    const n = { 1: 0, 2: 0, 3: 0 };
    for (const s of Object.values(stars)) n[s]++;
    expect(n).toEqual({ 1: 21, 2: 21, 3: 21 });
    const byCount = [...index.topics].sort((a, b) => b.question_count - a.question_count);
    for (let i = 1; i < byCount.length; i++) {
      expect(stars[byCount[i - 1]!.topic_id]!).toBeGreaterThanOrEqual(stars[byCount[i]!.topic_id]!);
    }
  });

  it("ties on question_count break by topic_id ascending", () => {
    const topics = Array.from({ length: 6 }, (_, i) => ({
      topic_id: `t-${String.fromCharCode(102 - i)}`, // t-f, t-e, … t-a (reverse id order)
      question_count: 5,
    }));
    const stars = topicStars({ topics } as never);
    expect(stars).toEqual({ "t-a": 3, "t-b": 3, "t-c": 2, "t-d": 2, "t-e": 1, "t-f": 1 });
  });
});

describe("chumon groups + lcpPreamble (§0-8, Review Focus 4)", () => {
  it("50 groups, 200 member ids, members of a group share exam_id", async () => {
    const [groups, all] = await Promise.all([loadChumonGroups(), loadAllQuestions()]);
    const byId = new Map(all.map((x) => [x.id, x]));
    expect(groups).toHaveLength(50);
    const ids = groups.flatMap((g) => g.memberIds);
    expect(ids).toHaveLength(200);
    expect(new Set(ids).size).toBe(200);
    for (const g of groups) {
      const exams = new Set(g.memberIds.map((id) => byId.get(id)?.exam_id));
      expect(exams.size, g.key).toBe(1);
      expect(exams.has(undefined), g.key).toBe(false);
      expect([...g.memberIds].sort(), g.key).toEqual(g.memberIds);
    }
  });

  it("139 of 150 group×lang fold exactly at the LCP, 11 fall back to an earlier paragraph boundary, 0 unfoldable", async () => {
    const [groups, all] = await Promise.all([loadChumonGroups(), loadAllQuestions()]);
    const byId = new Map(all.map((x) => [x.id, x]));
    const tally = { exact: 0, backoff: 0, none: 0 };
    for (const g of groups) {
      for (const lang of ["jp", "zh", "en"] as const) {
        const stems = g.memberIds.map((id) => localizedStem(byId.get(id)!, LANG_LOCALE[lang]));
        const n = g.preambleChars[lang];
        const where = `${g.key} ${lang}`;
        if (n === null) {
          tally.none++;
          continue;
        }
        const lcp = rawLcp(stems);
        expect(n, where).toBeLessThanOrEqual(lcp);
        if (n === lcp) tally.exact++;
        else tally.backoff++;
        // fold point includes the trailing paragraph break; nothing is lost
        const pre = stems[0]!.slice(0, n);
        expect(pre.endsWith("\n\n"), where).toBe(true);
        for (const s of stems) {
          expect(s.slice(0, n) === pre, where).toBe(true);
          expect(s.slice(0, n) + s.slice(n) === s, where).toBe(true);
          expect(s.length, where).toBeGreaterThan(n);
        }
      }
    }
    expect(tally).toEqual({ exact: 139, backoff: 11, none: 0 });
  });

  it("a synthetic group with no \\n\\n inside the LCP → null", () => {
    expect(lcpPreamble(["共通前文A。設問1", "共通前文A。設問2"])).toBeNull();
    expect(lcpPreamble(["前文\n本文1\n\n設問", "前文\n本文2\n\n設問"])).toBeNull();
  });

  it("folds after the last \\n\\n inside the LCP (inclusive), else null", () => {
    expect(lcpPreamble(["P1\n\nP2\n\nQ1", "P1\n\nP2\n\nQ2"])).toBe(8);
    expect(lcpPreamble(["P1\n\nP2a\n\nQ", "P1\n\nP2b\n\nQ"])).toBe(4); // diverges inside P2 → back off
    expect(lcpPreamble([])).toBeNull();
    expect(lcpPreamble(["P\n\nQ"])).toBeNull(); // a lone stem has nothing in common to fold
    expect(lcpPreamble(["P\n\n", "P\n\nQ"])).toBeNull(); // would fold away a whole stem
    expect(lcpPreamble(["P\n\nQ", undefined])).toBeNull(); // missing language
    expect(lcpPreamble(["\n\nA", "\n\nB"])).toBeNull(); // "\n\n" at position 0: nothing to fold
    expect(lcpPreamble([" \u3000\n\nA", " \u3000\n\nB"])).toBeNull(); // whitespace-only preamble
  });
});

describe("resolveScope (§0-12)", () => {
  const corpus = [
    q("e1-q001", "ta"),
    q("e1-q002", "tb"),
    q("e1-q003", "ta"),
    q("e1-q004", "tc"),
    q("e2-q001", "ta"),
    q("e2-q002", "tb"),
    q("e2-q003", "ta"),
  ];
  const groups = { "e1-G": ["e1-q003", "e1-q004"] };

  it("seq keeps corpus order; topics are any-of, exam narrows", () => {
    const base = { kind: "filter" as const, exam: null, n: "all" as const, order: "seq" as const, seed: 0 };
    expect(resolveScope({ ...base, topics: ["tb"] }, corpus, {})).toEqual(["e1-q002", "e2-q002"]);
    expect(resolveScope({ ...base, topics: ["tb", "tc"] }, corpus, {})).toEqual(["e1-q002", "e1-q004", "e2-q002"]);
    expect(resolveScope({ ...base, topics: ["ta"], exam: "e2" }, corpus, {})).toEqual(["e2-q001", "e2-q003"]);
    expect(resolveScope({ ...base, topics: [], exam: "e1", n: 2 }, corpus, {})).toEqual(["e1-q001", "e1-q002"]);
    expect(resolveScope({ ...base, topics: ["nope"] }, corpus, {})).toEqual([]);
    // n is clamped to max(0, trunc(n))
    expect(resolveScope({ ...base, topics: [], exam: "e1", n: 2.7 }, corpus, {})).toEqual(["e1-q001", "e1-q002"]);
    expect(resolveScope({ ...base, topics: [], exam: "e1", n: -3 }, corpus, {})).toEqual([]);
  });

  it("rand is a deterministic mulberry32(seed) Fisher–Yates shuffle", () => {
    const s = (seed: number) =>
      resolveScope({ kind: "filter", topics: [], exam: null, n: "all", order: "rand", seed }, corpus, {});
    expect(s(42)).toEqual(s(42));
    expect([...s(42)].sort()).toEqual(corpus.map((x) => x.id).sort());
    expect(s(42)).not.toEqual(s(43));
    // byte-stable order: shareable ?seed= URLs must keep resolving the same list
    expect(s(42)).toEqual(["e1-q004", "e1-q002", "e1-q001", "e2-q002", "e2-q003", "e1-q003", "e2-q001"]);
    const s3 = resolveScope({ kind: "filter", topics: [], exam: null, n: 3, order: "rand", seed: 42 }, corpus, {});
    expect(s3).toEqual(s(42).slice(0, 3));
  });

  it("resolveScope expands a chumon member to its whole group", () => {
    // seq, topic tc → only e1-q004 matches; its group pulls e1-q003 in before it
    expect(
      resolveScope({ kind: "filter", topics: ["tc"], exam: null, n: 1, order: "seq", seed: 0 }, corpus, groups),
    ).toEqual(["e1-q003", "e1-q004"]);
    // ids: keep order, drop unknown, expand, no duplicates
    expect(resolveScope({ kind: "ids", ids: ["e2-q002", "bogus", "e1-q004", "e1-q003"] }, corpus, groups)).toEqual([
      "e2-q002",
      "e1-q003",
      "e1-q004",
    ]);
    expect(resolveScope({ kind: "ids", ids: ["bogus"] }, corpus, groups)).toEqual([]);
  });

  it("real corpus: opening the 3rd member of a group yields the whole group in order", async () => {
    const [groups, all] = await Promise.all([loadChumonGroups(), loadAllQuestions()]);
    const g: ChumonGroup = groups[0]!;
    expect(resolveScope({ kind: "ids", ids: [g.memberIds[2]!] }, all, groupMap(groups))).toEqual(g.memberIds);
  });
});

describe("buildTodayIndex (fixture)", () => {
  const card = (id: string) => ({
    id,
    term: id,
    gloss: "",
    definition: "",
    memoryHook: "",
    senseCount: 1,
    questionCount: 0,
  });
  const quizIndex = {
    topics: [
      { topic_id: "ta", category: "technology", name_jp: "A", question_count: 4 },
      { topic_id: "tb", category: "strategy", name_jp: "B", question_count: 1 },
    ],
    exams: [{ exam_id: "e1", label_jp: "令和1年度" }],
  } as never;
  const readerIndex = {
    topics: [
      {
        topic_id: "ta",
        unit_order: ["u2", "u1", "gone"],
        units: [
          { unit_id: "u1", title_jp: "一", title_zh: "壹", title_en: "" },
          { unit_id: "u2", title_jp: "二", title_zh: "贰", title_en: "Two" },
        ],
      },
    ],
  } as never;
  const withTerms = (id: string, topic: string, terms: string[]) => ({ ...q(id, topic), terms });
  const input = {
    quizIndex,
    questions: [
      withTerms("e1-q001", "ta", ["x", "nocard", "y"]),
      withTerms("e1-q002", "ta", ["nocard", "z", "y", "y"]),
      withTerms("e1-q003", "ta", ["z", "w", "nocard"]),
      withTerms("e1-q004", "ta", ["x2", "w", "w"]),
      withTerms("e1-q005", "tb", []),
    ],
    readerIndex,
    unitMinutes: { u1: 10, u2: 12 },
    groups: { G: ["e1-q003", "e1-q004"] },
    // x and x2 are two spellings of one headword (same card id)
    termCards: { x: card("cx"), x2: card("cx"), y: card("cy"), z: card("cz"), w: card("cw") },
    locale: "en",
  };

  it("topicTerms: cards only, counted once per question, ties by first appearance, one card per headword", () => {
    const t = buildTodayIndex(input);
    // counts: x 1, x2 1 (same card), y 2 (once per question), z 2, w 2, nocard ignored
    expect(t.topicTerms.ta!.map((c) => c.id)).toEqual(["cy", "cz", "cw"]);
    expect(t.topicTerms.tb).toEqual([]);
    const t2 = buildTodayIndex({ ...input, questions: input.questions.slice(0, 1) });
    expect(t2.topicTerms.ta!.map((c) => c.id)).toEqual(["cx", "cy"]);
    const t3 = buildTodayIndex({ ...input, questions: [input.questions[0]!, input.questions[3]!] });
    expect(t3.topicTerms.ta!.map((c) => c.id)).toEqual(["cx", "cy", "cw"]); // x2 = same card as x
  });

  it("topics / units / exams / groups shape", () => {
    const t = buildTodayIndex(input);
    expect(t.topics[0]).toEqual({
      id: "ta",
      category: "technology",
      name_jp: "A",
      stars: 3,
      questionCount: 4,
      units: [
        { id: "u2", title: "Two", minutes: 12 },
        { id: "u1", title: "一", minutes: 10 }, // empty en title → JP fallback
      ],
    });
    expect(t.topics[1]!.units).toEqual([]);
    expect(t.topicQuestionIds).toEqual({ ta: ["e1-q001", "e1-q002", "e1-q003", "e1-q004"], tb: ["e1-q005"] });
    expect(t.groups).toEqual({ G: ["e1-q003", "e1-q004"] });
    expect(t.exams).toEqual({ e1: "令和1年度" });
    expect(() => buildTodayIndex({ ...input, unitMinutes: { u1: 10 } })).toThrow(/u2/);
  });
});

describe("TodayIndex (§0-20)", () => {
  it("TodayIndex JSON <= 160 KB (ja / zh / en)", async () => {
    for (const locale of ["ja", "zh", "en"]) {
      const json = JSON.stringify(await loadTodayIndex(locale));
      // UTF-8 bytes (>= json.length) — the stricter of the two readings of "160 KB"
      expect(json.length, locale).toBeLessThanOrEqual(160 * 1024);
      expect(Buffer.byteLength(json, "utf-8"), locale).toBeLessThanOrEqual(160 * 1024);
    }
  });

  it("topicTerms has <= 3 cards per topic, all with dictionary entries", async () => {
    const [today, dict] = await Promise.all([loadTodayIndex("ja"), loadDictionary()]);
    expect(Object.keys(today.topicTerms)).toHaveLength(63);
    let total = 0;
    for (const [topic, cards] of Object.entries(today.topicTerms)) {
      expect(cards.length, topic).toBeLessThanOrEqual(3);
      expect(new Set(cards.map((c) => c.id)).size, topic).toBe(cards.length);
      for (const c of cards) expect(dict.byId.has(c.id), `${topic} ${c.id}`).toBe(true);
      for (const c of cards) expect(Object.keys(c).sort(), c.id).toEqual(["definition", "gloss", "id", "term"]);
      total += cards.length;
    }
    expect(total).toBeGreaterThan(150); // nearly every topic has 3
  });

  it("topics / exams / pool cover the corpus", async () => {
    const [today, index, all] = await Promise.all([loadTodayIndex("en"), loadQuizIndex(), loadAllQuestions()]);
    expect(today.topics.map((t) => t.id)).toEqual(index.topics.map((t) => t.topic_id));
    expect(Object.keys(today.exams)).toHaveLength(index.exams.length);
    // every quiz topic has textbook units (same topic set as unit_index)
    const reader = await loadReaderIndex();
    expect(today.topics.map((t) => t.id).sort()).toEqual(reader.topics.map((t) => t.topic_id).sort());
    for (const t of today.topics) expect(t.units.length, t.id).toBeGreaterThan(0);
    const pool = poolFromIndex(today);
    const ids = Object.values(pool.topicQuestionIds).flat();
    expect(ids).toHaveLength(all.length);
    expect(new Set(ids).size).toBe(all.length);
    expect(Object.keys(pool.groups)).toHaveLength(50);
    for (const t of today.topics) {
      expect(pool.topicStars[t.id]).toBe(t.stars);
      expect(t.questionCount, t.id).toBe(pool.topicQuestionIds[t.id]!.length);
    }
  });
});
