// D-217 H1-2 — the pure parts of lib/staticData: file names, the shard → QuizQuestion rebuild, the
// pick helpers, the setup index, and the browser fetch cache (fake fetch).

import { describe, expect, it, vi } from "vitest";

import type { TermCard } from "@/lib/glossary/dictionary";
import type { TodayIndex } from "@/lib/practice/practiceIndex";
import { isSuspect } from "@/lib/quiz/quizModel";

import { createStaticData } from "../client";
import {
  dataPaths,
  examOfId,
  explChunkOf,
  parseLocaleFile,
  pickQuestions,
  pickSenseiTerms,
  projectQuestion,
  reviewIds,
  senseiShardOf,
  senseiTermIds,
  setupFromToday,
  termCardsFor,
  toQuizQuestion,
  type ExamShard,
  type ExplanationShard,
  type ShardQuestion,
} from "../shards";

const q = (id: string, extra: Partial<ShardQuestion> = {}): ShardQuestion => ({
  id,
  exam_id: examOfId(id),
  topic_id: "technology-01-01",
  category: "technology",
  source_label: `label ${id}`,
  stem_jp: `stem ${id}`,
  choices_jp: { ア: "a", イ: "i", ウ: "u", エ: "e" },
  correct_answer: "イ",
  has_figure: false,
  figure: null,
  terms: ["CPU"],
  ...extra,
});

const shard = (examId: string, ids: string[]): ExamShard => ({ exam_id: examId, locale: "zh", questions: ids.map((id) => q(id)) });

describe("file names", () => {
  it("parseLocaleFile splits <name>.<locale>.json; other shapes → null", () => {
    expect(parseLocaleFile("2026r08.zh.json")).toEqual(["2026r08", "zh"]);
    expect(parseLocaleFile("2011h23tokubetsu-4.en.json")).toEqual(["2011h23tokubetsu-4", "en"]);
    expect(parseLocaleFile("today.ja.json")).toEqual(["today", "ja"]);
    expect(parseLocaleFile("today.fr.json")).toBeNull();
    expect(parseLocaleFile("today.ja")).toBeNull();
    expect(parseLocaleFile(".ja.json")).toBeNull();
  });

  it("examOfId / explChunkOf / senseiShardOf", () => {
    expect(examOfId("2011h23tokubetsu-q007")).toBe("2011h23tokubetsu");
    expect([1, 10, 11, 20, 21, 100].map((n) => explChunkOf(`2026r08-q${String(n).padStart(3, "0")}`))).toEqual([1, 1, 2, 2, 3, 10]);
    expect(senseiShardOf("tab00000000000000")).toBe("a");
  });

  it("dataPaths", () => {
    expect(dataPaths.exam("2026r08", "ja")).toBe("/data/quiz/2026r08.ja.json");
    expect(dataPaths.explanations("2026r08", 3)).toBe("/data/quiz-expl/2026r08-3.json");
    expect(dataPaths.senseiTerms("f", "zh")).toBe("/data/sensei/terms-f.zh.json");
    expect(dataPaths.quizIndex()).toBe("/data/quiz/index.json");
  });
});

describe("toQuizQuestion / pickQuestions", () => {
  it("no figure_type, no key_guard: the explanation carries its suspect flag (H1-4 LOW-1) and keeps all three languages", () => {
    const out = toQuizQuestion(q("2026r08-q001", { stem_zh: "题干" }), {
      suspect: true,
      correct: { jp: "正", zh: "对", en: "" },
      distractors: { ア: { jp: "誤", zh: "错", en: "" } },
      points: [{ jp: "要", zh: "要点", en: "" }],
    });
    expect("figure_type" in out).toBe(false);
    expect(out.stem_zh).toBe("题干");
    expect(out.explanation).toEqual({
      suspect: true,
      correct: { jp: "正", zh: "对", en: "" },
      distractors: { ア: { jp: "誤", zh: "错", en: "" } },
      points: [{ jp: "要", zh: "要点", en: "" }],
    });
    expect(toQuizQuestion(q("2026r08-q002")).explanation).toBeUndefined();
  });

  it("does not share arrays / objects with the shard", () => {
    const sq = q("2026r08-q001");
    const out = toQuizQuestion(sq);
    out.terms.push("x");
    out.choices_jp["ア"] = "changed";
    expect(sq.terms).toEqual(["CPU"]);
    expect(sq.choices_jp["ア"]).toBe("a");
  });

  it("input order across shards, unknown ids dropped, explanations attached by id", () => {
    const expl: ExplanationShard = {
      exam_id: "2025r07",
      chunk: 1,
      explanations: { "2025r07-q001": { suspect: false, correct: { jp: "c", zh: "c", en: "c" }, distractors: {}, points: [] } },
    };
    const got = pickQuestions(
      ["2025r07-q001", "2026r08-q002", "2026r08-q099", "2026r08-q001"],
      [shard("2026r08", ["2026r08-q001", "2026r08-q002"]), shard("2025r07", ["2025r07-q001"])],
      [expl],
    );
    expect(got.map((x) => x.id)).toEqual(["2025r07-q001", "2026r08-q002", "2026r08-q001"]);
    expect(got[0]!.explanation?.correct.jp).toBe("c");
    expect(got[1]!.explanation).toBeUndefined();
  });
});

describe("the suspect flag on the exam shard question (H1-4 LOW-2)", () => {
  const expl = (suspect: boolean) => ({ suspect, correct: { jp: "c", zh: "c", en: "c" }, distractors: {}, points: [] });

  it("projectQuestion: suspect: true only for a suspect question (absent otherwise); never the explanation", () => {
    const flagged = projectQuestion({ ...q("2026r08-q001"), explanation: expl(true) }, "zh");
    expect(flagged.suspect).toBe(true);
    expect("explanation" in flagged).toBe(false);
    expect("suspect" in projectQuestion({ ...q("2026r08-q002"), explanation: expl(false) }, "zh")).toBe(false);
    expect("suspect" in projectQuestion(q("2026r08-q003"), "ja")).toBe(false);
  });

  it("isSuspect: the question's own flag (explanation not loaded / failed) or its explanation's", () => {
    expect(isSuspect(toQuizQuestion(q("2026r08-q001", { suspect: true })))).toBe(true);
    expect(isSuspect(toQuizQuestion(q("2026r08-q001"), expl(true)))).toBe(true);
    expect(isSuspect(toQuizQuestion(q("2026r08-q001"), expl(false)))).toBe(false);
    expect(isSuspect(toQuizQuestion(q("2026r08-q001")))).toBe(false);
  });
});

describe("termCardsFor / setupFromToday", () => {
  const card = (id: string): TermCard => ({ id, term: id, gloss: id, definition: "d", memoryHook: "", senseCount: 1, questionCount: 1 });

  it("termCardsFor keeps only the questions' terms that have a card, keyed as written", () => {
    const cards = { CPU: card("t1"), RAM: card("t2"), ROM: card("t3") };
    expect(termCardsFor([{ terms: ["CPU", "GPU"] }, { terms: ["RAM", "CPU"] }], cards)).toEqual({ CPU: cards.CPU, RAM: cards.RAM });
    expect(termCardsFor([{ terms: ["toString"] }], cards)).toEqual({});
  });

  it("setupFromToday empties every topic's terms and keeps the rest", () => {
    const today: TodayIndex = {
      topics: [],
      topicQuestionIds: { a: ["x"] },
      groups: { g: ["x", "y"] },
      topicTerms: { a: [{ id: "t1", term: "CPU", gloss: "CPU", definition: "d" }], b: [] },
      exams: { e: "label" },
    };
    expect(setupFromToday(today)).toEqual({ ...today, topicTerms: { a: [], b: [] } });
    expect(today.topicTerms.a).toHaveLength(1);
  });
});

describe("reviewIds / senseiTermIds / pickSenseiTerms", () => {
  const index = {
    topics: [{ topic_id: "technology-01-01" }, { topic_id: "technology-01-02" }],
    questions: [
      ["2026r08-q001", "2026r08", "technology-01-01"],
      ["2026r08-q002", "2026r08", "technology-01-01"],
      ["2026r08-q003", "2026r08", "technology-01-02"],
    ],
  } as unknown as Parameters<typeof reviewIds>[2];

  it("reviewIds: dedupe + order; null for none, > 5, a bad id, an unknown topic, another topic's id", () => {
    const T = "technology-01-01";
    expect(reviewIds(T, ["2026r08-q002", "", "2026r08-q001", "2026r08-q002"], index)).toEqual(["2026r08-q002", "2026r08-q001"]);
    expect(reviewIds(T, [""], index)).toBeNull();
    expect(reviewIds(T, ["a", "b", "c", "d", "e", "f"], index)).toBeNull();
    expect(reviewIds(T, ["bad"], index)).toBeNull();
    expect(reviewIds("nope", ["2026r08-q001"], index)).toBeNull();
    expect(reviewIds(T, ["2026r08-q003"], index)).toBeNull();
  });

  it("senseiTermIds: null for none / more than 8 segments; invalid skipped, repeats once", () => {
    const a = "t0000000000000001";
    const b = "t0000000000000002";
    expect(senseiTermIds([b, "", "bad", a, b])).toEqual([b, a]);
    expect(senseiTermIds(["", ""])).toBeNull();
    expect(senseiTermIds(Array(9).fill(a))).toBeNull();
    expect(senseiTermIds(Array(8).fill(a))).toEqual([a]);
  });

  it("pickSenseiTerms: request order, unknown skipped", () => {
    const t = (id: string) => ({ id, term: id, senses: [] });
    const files = [{ locale: "ja" as const, shard: "0", terms: { t01: t("t01"), t02: t("t02") } }];
    expect(pickSenseiTerms(["t02", "t09", "t01"], files)).toEqual([t("t02"), t("t01")]);
  });
});

describe("createStaticData (fake fetch)", () => {
  const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });

  it("fetches a file once and shares concurrent requests", async () => {
    const fetchImpl = vi.fn(async () => ok({ topics: [] }));
    const data = createStaticData(fetchImpl);
    const [a, b] = await Promise.all([data.fetchQuizIndex(), data.fetchQuizIndex()]);
    await data.fetchQuizIndex();
    expect(a).toEqual({ topics: [] });
    expect(b).toBe(a);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledWith("/data/quiz/index.json");
  });

  it("a non-2xx status throws and is not cached (the next call retries)", async () => {
    const fetchImpl = vi
      .fn<(url: string) => Promise<Response>>()
      .mockResolvedValueOnce(new Response("", { status: 503 }))
      .mockResolvedValueOnce(ok({ locale: "ja", cards: {} }));
    const data = createStaticData(fetchImpl);
    await expect(data.fetchTermCards("ja")).rejects.toThrow("/data/glossary/cards.ja.json: 503");
    await expect(data.fetchTermCards("ja")).resolves.toEqual({ locale: "ja", cards: {} });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("a rejected fetch is evicted too", async () => {
    const fetchImpl = vi
      .fn<(url: string) => Promise<Response>>()
      .mockRejectedValueOnce(new TypeError("offline"))
      .mockResolvedValueOnce(ok({ locale: "en", units: {} }));
    const data = createStaticData(fetchImpl);
    await expect(data.fetchUnits("en")).rejects.toThrow("offline");
    await expect(data.fetchUnits("en")).resolves.toEqual({ locale: "en", units: {} });
  });

  const quizFiles = (): Record<string, unknown> => ({
    "/data/quiz/index.json": {
      topics: [],
      exams: [],
      questions: [
        ["2025r07-q001", "2025r07", "technology-01-01"],
        ["2026r08-q001", "2026r08", "technology-01-01"],
        ["2026r08-q015", "2026r08", "technology-01-01"],
      ],
      chumonGroups: [],
    },
    "/data/quiz/2026r08.zh.json": shard("2026r08", ["2026r08-q001", "2026r08-q015"]),
    "/data/quiz/2025r07.zh.json": shard("2025r07", ["2025r07-q001"]),
    "/data/quiz-expl/2026r08-1.json": { exam_id: "2026r08", chunk: 1, explanations: {} },
    "/data/quiz-expl/2026r08-2.json": {
      exam_id: "2026r08",
      chunk: 2,
      explanations: { "2026r08-q015": { suspect: false, correct: { jp: "c", zh: "c", en: "c" }, distractors: {}, points: [] } },
    },
    "/data/quiz-expl/2025r07-1.json": { exam_id: "2025r07", chunk: 1, explanations: {} },
  });
  const serve = (files: Record<string, unknown>) =>
    vi.fn(async (url: string) => (url in files ? ok(files[url]) : new Response("", { status: 404 })));

  it("fetchQuestions loads the index + each needed exam shard once, + the explanation chunks only when asked", async () => {
    const fetchImpl = serve(quizFiles());
    const data = createStaticData(fetchImpl);
    const ids = ["2026r08-q015", "2025r07-q001", "2026r08-q001"];

    const plain = await data.fetchQuestions(ids, "zh", { explanations: false });
    expect(plain.map((x) => x.id)).toEqual(ids);
    expect(fetchImpl.mock.calls.map((c) => c[0]).sort()).toEqual([
      "/data/quiz/2025r07.zh.json",
      "/data/quiz/2026r08.zh.json",
      "/data/quiz/index.json",
    ]);

    const full = await data.fetchQuestions(ids, "zh", { explanations: true });
    expect(full[0]!.explanation?.correct.en).toBe("c");
    expect(fetchImpl.mock.calls.map((c) => c[0]).sort()).toEqual([
      "/data/quiz-expl/2025r07-1.json",
      "/data/quiz-expl/2026r08-1.json",
      "/data/quiz-expl/2026r08-2.json",
      "/data/quiz/2025r07.zh.json",
      "/data/quiz/2026r08.zh.json",
      "/data/quiz/index.json",
    ]);
  });

  it("fetchQuestions drops malformed / unknown-exam / out-of-range ids before building any path (loadQuestionsByIds)", async () => {
    const fetchImpl = serve(quizFiles());
    const data = createStaticData(fetchImpl);
    const ids = [
      "../../etc/passwd-q001", // malformed (path-like)
      "2026r08-q015",
      "2026r08-q1", // malformed number
      "1999h11a-q001", // well-formed, unknown exam
      "2026r08-q999", // well-formed, out of range
      "2026r08-q001",
      "",
    ];
    const got = await data.fetchQuestions(ids, "zh", { explanations: true });
    expect(got.map((x) => x.id)).toEqual(["2026r08-q015", "2026r08-q001"]);
    const urls = fetchImpl.mock.calls.map((c) => c[0]);
    expect(urls.some((u) => u.includes("1999h11a") || u.includes("etc") || u.includes("-40."))).toBe(false);
    expect(urls.sort()).toEqual([
      "/data/quiz-expl/2026r08-1.json",
      "/data/quiz-expl/2026r08-2.json",
      "/data/quiz/2026r08.zh.json",
      "/data/quiz/index.json",
    ]);
    expect(await data.fetchQuestions(["nope"], "zh", { explanations: false })).toEqual([]);
  });

  it("fetchSenseiTermContexts loads only the shards of the ids", async () => {
    const t = (id: string) => ({ id, term: id, senses: [] });
    const fetchImpl = vi.fn(async (url: string) =>
      ok(url.includes("terms-a") ? { locale: "en", shard: "a", terms: { ta1: t("ta1") } } : { locale: "en", shard: "b", terms: { tb1: t("tb1") } }),
    );
    const data = createStaticData(fetchImpl);
    expect(await data.fetchSenseiTermContexts(["tb1", "ta1", "ta9"], "en")).toEqual([t("tb1"), t("ta1")]);
    expect(fetchImpl.mock.calls.map((c) => c[0]).sort()).toEqual(["/data/sensei/terms-a.en.json", "/data/sensei/terms-b.en.json"]);
  });
});
