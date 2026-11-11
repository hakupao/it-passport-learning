// D-217 H1-2 — Rule A for the static data files: every built file (through the route handlers under
// src/app/data) against what the server loaders hand the pages today, plus the allow-list walk.
//
//   - exam + explanation shards: all 2,900 questions × 3 locales deep-equal the loader question cut
//     to JP + the locale's language. The expected side is built by OMISSION from the loader object
//     (drop figure_type / explanation / other languages), so a new corpus field fails here instead
//     of passing silently through the allow-list projection. Then the rendering: localizedStem /
//     localizedChoices / localizedExplanation / questionAnchor of toQuizQuestion(shard) are
//     byte-identical to those of the loader question.
//   - index / today / setup / term cards / units / sensei terms deep-equal their loaders.
//   - GET /api/quiz/questions and GET /api/sensei/terms vs the shard helpers on samples (incl. 400s).
//   - allow-list: every file conforms to ./allowList, no FORBIDDEN_KEYS anywhere, no FORBIDDEN_TEXT.

import { describe, expect, it } from "vitest";

import { GET as examGET, generateStaticParams as examParams } from "@/app/data/quiz/[file]/route";
import { GET as indexGET } from "@/app/data/quiz/index.json/route";
import { GET as explGET, generateStaticParams as explParams } from "@/app/data/quiz-expl/[file]/route";
import { GET as todayGET, generateStaticParams as todayParams } from "@/app/data/practice/[file]/route";
import { GET as cardsGET, generateStaticParams as cardsParams } from "@/app/data/glossary/[file]/route";
import { GET as unitsGET, generateStaticParams as unitsParams } from "@/app/data/textbook/[file]/route";
import { GET as senseiGET, generateStaticParams as senseiParams } from "@/app/data/sensei/[file]/route";
import { GET as questionsApiGET } from "@/app/api/quiz/questions/route";
import { GET as termsApiGET } from "@/app/api/sensei/terms/route";
import { buildTermCards } from "@/lib/glossary/dictionary";
import { loadDictionary } from "@/lib/glossary/dictionaryReader";
import { loadChumonGroups, loadSetupIndex, loadTodayIndex } from "@/lib/practice/practiceReader";
import type { SearchParams } from "@/lib/practice/practiceSession";
import { resolveSessionFrom } from "@/lib/practice/sessionFrom";
import {
  loadAllQuestions,
  loadBaseQuestions,
  loadQuizIndex,
  loadTranslations,
  localizedChoices,
  localizedExplanation,
  localizedStem,
  mergeTranslation,
  type QuizQuestion,
} from "@/lib/quiz/quizReader";
import { questionAnchor } from "@/lib/sensei/anchors";

import {
  allKeys,
  checkAllowed,
  examShardSpec,
  explanationShardSpec,
  FORBIDDEN_KEYS,
  FORBIDDEN_TEXT,
  quizIndexSpec,
  senseiTermsSpec,
  termCardsSpec,
  todaySpec,
  unitsSpec,
  type AllowSpec,
} from "../allowList";
import {
  examOfId,
  explChunkOf,
  parseLocaleFile,
  pickQuestions,
  pickSenseiTerms,
  reviewIds,
  senseiShardOf,
  senseiTermIds,
  setupFromToday,
  STATIC_LOCALES,
  termCardsFor,
  toQuizQuestion,
  type ExamShard,
  type ExplanationShard,
  type QuizIndexFile,
  type SenseiTermsFile,
  type StaticLocale,
  type TermCardsFile,
  type UnitsFile,
} from "../shards";

type Handler = (req: Request, ctx: { params: Promise<{ file: string }> }) => Promise<Response>;

async function call<T>(handler: Handler, file: string): Promise<{ res: Response; body: T; text: string }> {
  const res = await handler(new Request(`http://localhost/data/${file}`), { params: Promise.resolve({ file }) });
  const text = await res.text();
  return { res, body: JSON.parse(text) as T, text };
}

/** Every file of a route family: file name → parsed body + raw text. */
async function family<T>(handler: Handler, params: () => Promise<{ file: string }[]> | { file: string }[]) {
  const out = new Map<string, { body: T; text: string }>();
  for (const { file } of await params()) {
    const { res, body, text } = await call<T>(handler, file);
    expect(res.status, file).toBe(200);
    expect(res.headers.get("content-type"), file).toMatch(/^application\/json/);
    out.set(file, { body, text });
  }
  return out;
}

const OTHER_LANG_KEYS: Record<StaticLocale, string[]> = {
  ja: ["stem_zh", "stem_en", "choices_zh", "choices_en"],
  zh: ["stem_en", "choices_en"],
  en: ["stem_zh", "choices_zh"],
};

/** The loader question cut to what a `locale` shard should hold, by omission (see header). */
function expectedShardQuestion(q: QuizQuestion, locale: StaticLocale): Record<string, unknown> {
  const out: Record<string, unknown> = { ...q };
  for (const k of ["figure_type", "explanation", ...OTHER_LANG_KEYS[locale]]) delete out[k];
  return out;
}

/** The loader explanation as the (locale-free) chunk should hold it, by omission: key_guard dropped,
 *  its suspect flag lifted to `suspect`; every language kept. */
function expectedExplanation(q: QuizQuestion): Record<string, unknown> {
  const out: Record<string, unknown> = { ...q.explanation!, suspect: q.explanation!.key_guard.suspect };
  delete out.key_guard;
  return out;
}

// Built once for the whole file (≈ 500 files, a few seconds).
const files = (async () => {
  const [exams, expl, today, cards, units, sensei, index] = await Promise.all([
    family<ExamShard>(examGET, examParams),
    family<ExplanationShard>(explGET, explParams),
    family<unknown>(todayGET, todayParams),
    family<TermCardsFile>(cardsGET, cardsParams),
    family<UnitsFile>(unitsGET, unitsParams),
    family<SenseiTermsFile>(senseiGET, senseiParams),
    (async () => {
      const res = await indexGET();
      expect(res.headers.get("content-type")).toMatch(/^application\/json/);
      const text = await res.text();
      return new Map([["index.json", { body: JSON.parse(text) as QuizIndexFile, text }]]);
    })(),
  ]);
  return { exams, expl, today, cards, units, sensei, index };
})();

const shardOf = async (examId: string, locale: StaticLocale) => (await files).exams.get(`${examId}.${locale}.json`)!.body;
const explOf = async (examId: string, chunk: number) => (await files).expl.get(`${examId}-${chunk}.json`)!.body;

describe("static data — file families", () => {
  it("file counts: 87 exam, 116 explanation, 3 today / cards / units, 48 sensei, 1 index", async () => {
    const f = await files;
    expect([f.exams.size, f.expl.size, f.today.size, f.cards.size, f.units.size, f.sensei.size, f.index.size]).toEqual([
      87, 116, 3, 3, 3, 48, 1,
    ]);
  });

  it("every question id is <exam_id>-qNNN (examOfId / explChunkOf derive the shard)", async () => {
    for (const q of await loadBaseQuestions()) {
      expect(q.id.startsWith(`${q.exam_id}-q`), q.id).toBe(true);
      expect(examOfId(q.id)).toBe(q.exam_id);
      expect(explChunkOf(q.id)).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("static data — exam + explanation shards vs loadAllQuestions (2,900 × 3)", () => {
  it("each exam shard holds exactly that exam's questions, id order, cut to JP + the locale (by omission)", async () => {
    const all = await loadAllQuestions();
    let n = 0;
    for (const locale of STATIC_LOCALES) {
      for (const e of (await loadQuizIndex()).exams) {
        const shard = await shardOf(e.exam_id, locale);
        const want = all
          .filter((q) => q.exam_id === e.exam_id)
          .sort((a, b) => (a.id < b.id ? -1 : 1))
          .map((q) => expectedShardQuestion(q, locale));
        expect(shard.exam_id).toBe(e.exam_id);
        expect(shard.locale).toBe(locale);
        expect(shard.questions).toEqual(want);
        n += shard.questions.length;
      }
    }
    expect(n).toBe(2900 * 3);
  });

  it("each explanation chunk holds exactly its questions' explanations, all three languages (by omission)", async () => {
    const all = await loadAllQuestions();
    let n = 0;
    for (const [file, { body }] of (await files).expl) {
      const want = Object.fromEntries(
        all
          .filter((q) => q.exam_id === body.exam_id && explChunkOf(q.id) === body.chunk && q.explanation)
          .map((q) => [q.id, expectedExplanation(q)]),
      );
      expect(file).toBe(`${body.exam_id}-${body.chunk}.json`);
      expect(body.explanations, file).toEqual(want);
      n += Object.keys(body.explanations).length;
    }
    expect(n).toBe(all.filter((q) => q.explanation).length);
  });

  it("rendering of toQuizQuestion(shard + explanation) = the loader question, all 2,900, every page locale × displayed language", async () => {
    const all = await loadAllQuestions();
    const dict = await loadDictionary();
    let explPairs = 0;
    for (const locale of STATIC_LOCALES) {
      const cards = (await files).cards.get(`cards.${locale}.json`)!.body.cards;
      for (const q of all) {
        const sq = (await shardOf(q.exam_id, locale)).questions.find((x) => x.id === q.id)!;
        const se = (await explOf(q.exam_id, explChunkOf(q.id))).explanations[q.id];
        const got = toQuizQuestion(sq, se);
        // ExplanationPane's 日/中/EN switch is independent of the page locale (D-186): all 3 × 3 pairs
        for (const shown of STATIC_LOCALES) {
          expect(localizedExplanation(got, shown), `${q.id} page=${locale} shown=${shown}`).toEqual(
            localizedExplanation(q, shown),
          );
          explPairs++;
        }
        // the question face shows JP and (its translation toggle) the page locale only
        // (PracticeQuestion: localizedStem / localizedChoices(q, locale), stem_jp / choices_jp)
        for (const shown of new Set<StaticLocale>(["ja", locale])) {
          expect(localizedStem(got, shown), `${q.id} ${locale}/${shown}`).toBe(localizedStem(q, shown));
          expect(localizedChoices(got, shown), `${q.id} ${locale}/${shown}`).toEqual(localizedChoices(q, shown));
        }
        const termCards = termCardsFor([got], cards);
        expect(termCards).toEqual(buildTermCards(dict, [q], locale));
        for (const choice of [undefined, q.correct_answer, "ア"]) {
          expect(questionAnchor(got, locale, { choice, termCards }), q.id).toBe(
            questionAnchor(q, locale, { choice, termCards }),
          );
        }
      }
    }
    expect(explPairs).toBe(2900 * 9);
  });

  it("the mock run's questions (base + translation, no explanation) = pickQuestions without explanation shards", async () => {
    const [base, tr] = await Promise.all([loadBaseQuestions(), loadTranslations()]);
    for (const locale of STATIC_LOCALES) {
      const examId = "2026r08";
      const ids = base.filter((q) => q.exam_id === examId).map((q) => q.id);
      const got = pickQuestions(ids, [await shardOf(examId, locale)]);
      const want = base.filter((q) => q.exam_id === examId).map((q) => mergeTranslation(q, tr.get(q.id)));
      expect(got.every((q) => q.explanation === undefined)).toBe(true);
      expect(got.map((q) => localizedStem(q, locale))).toEqual(want.map((q) => localizedStem(q, locale)));
      expect(got.map((q) => localizedChoices(q, locale))).toEqual(want.map((q) => localizedChoices(q, locale)));
    }
  });
});

describe("static data — indexes vs their loaders", () => {
  it("index.json: quiz_index topics / exams, [id, exam, topic] in corpus order, the 中問 groups", async () => {
    const [index, base, groups] = await Promise.all([loadQuizIndex(), loadBaseQuestions(), loadChumonGroups()]);
    const body = (await files).index.get("index.json")!.body;
    expect(body.topics).toEqual(index.topics);
    expect(body.exams).toEqual(index.exams);
    expect(body.questions).toEqual(base.map((q) => [q.id, q.exam_id, q.topic_id]));
    expect(body.chumonGroups).toEqual(groups);
  });

  it("today.<locale>.json = loadTodayIndex; setupFromToday(it) = loadSetupIndex", async () => {
    for (const locale of STATIC_LOCALES) {
      const body = (await files).today.get(`today.${locale}.json`)!.body as Awaited<ReturnType<typeof loadTodayIndex>>;
      expect(body).toEqual(await loadTodayIndex(locale));
      expect(setupFromToday(body)).toEqual(await loadSetupIndex(locale));
    }
  });

  it("cards.<locale>.json = buildTermCards over the whole corpus; termCardsFor(a session) = buildTermCards(that session)", async () => {
    const [dict, base] = await Promise.all([loadDictionary(), loadBaseQuestions()]);
    for (const locale of STATIC_LOCALES) {
      const cards = (await files).cards.get(`cards.${locale}.json`)!.body.cards;
      expect(cards).toEqual(buildTermCards(dict, base, locale));
      for (let start = 0; start < base.length; start += 97) {
        const session = base.slice(start, start + 20);
        expect(termCardsFor(session, cards)).toEqual(buildTermCards(dict, session, locale));
      }
    }
  });

  it("units.<locale>.json: every listed unit = resolveSessionFrom(from=unit)'s title + terms", async () => {
    for (const locale of STATIC_LOCALES) {
      const { units } = (await files).units.get(`units.${locale}.json`)!.body;
      expect(Object.keys(units)).toHaveLength(244);
      for (const [unitId, meta] of Object.entries(units)) {
        const sp: SearchParams = { from: "unit", unit: unitId };
        const from = await resolveSessionFrom(sp, locale);
        expect(from?.kind).toBe("unit");
        if (from?.kind !== "unit") continue;
        expect(meta, unitId).toEqual({ title: from.title, terms: from.terms });
      }
    }
  });
});

describe("static data — the two read-only APIs vs the shard helpers", () => {
  const termsApi = async (qs: string) => termsApiGET(new Request(`http://localhost/api/sensei/terms${qs}`));
  const questionsApi = async (qs: string) => questionsApiGET(new Request(`http://localhost/api/quiz/questions${qs}`));

  it("sensei: every dictionary term sits in exactly its shard, once per locale", async () => {
    const dict = await loadDictionary();
    for (const locale of STATIC_LOCALES) {
      const seen = new Set<string>();
      for (const [file, { body }] of (await files).sensei) {
        if (body.locale !== locale) continue;
        for (const id of Object.keys(body.terms)) {
          expect(senseiShardOf(id), file).toBe(body.shard);
          expect(seen.has(id)).toBe(false);
          seen.add(id);
        }
      }
      expect([...seen].sort()).toEqual(dict.entries.map((e) => e.id).sort());
    }
  });

  it("sensei: GET /api/sensei/terms = pickSenseiTerms(senseiTermIds) on samples (order, repeats, unknown, invalid, 400s)", async () => {
    const ids = (await loadDictionary()).entries.map((e) => e.id);
    const samples: string[][] = [];
    for (let i = 0; i < ids.length; i += 37) samples.push(ids.slice(i, i + 1 + (i % 8)));
    samples.push(
      [ids[5]!, ids[3]!, ids[5]!],
      [ids[1]!, "t0000000000000000", "not-an-id", ids[2]!],
      ["", ids[9]!, ""],
      ids.slice(0, 8),
      ids.slice(0, 9),
      [],
      [""],
    );
    let ok = 0;
    let rejected = 0;
    for (const locale of STATIC_LOCALES) {
      const loaded = [...(await files).sensei.values()].map((f) => f.body).filter((f) => f.locale === locale);
      for (const sample of samples) {
        const res = await termsApi(`?${new URLSearchParams({ ids: sample.join(","), locale })}`);
        const picked = senseiTermIds(sample.join(",").split(","));
        if (res.status === 400) {
          expect(picked, sample.join(",")).toBeNull();
          rejected++;
          continue;
        }
        ok++;
        expect(res.status).toBe(200);
        const body = (await res.json()) as { terms: unknown };
        expect(picked).not.toBeNull();
        const needed = loaded.filter((f) => picked!.some((id) => senseiShardOf(id) === f.shard));
        expect(pickSenseiTerms(picked!, needed), sample.join(",")).toEqual(body.terms);
      }
    }
    expect(rejected).toBe(3 * 3); // 9 ids, no ids, only empty segments
    expect(ok).toBe((samples.length - 3) * 3);
  });

  it("quiz: GET /api/quiz/questions = pickQuestions(reviewIds) of the exam shards + explanation chunks (samples, 400s)", async () => {
    const [index, base] = await Promise.all([loadQuizIndex(), loadBaseQuestions()]);
    const indexFile = (await files).index.get("index.json")!.body;
    const samples: [string, string[]][] = [];
    for (const t of index.topics) {
      const inTopic = base.filter((q) => q.topic_id === t.topic_id).map((q) => q.id);
      samples.push([t.topic_id, inTopic.filter((_, i) => i % 7 === 0).slice(0, 5).reverse()]);
    }
    const t0 = index.topics[0]!.topic_id;
    const t1 = index.topics[1]!.topic_id;
    const in0 = base.filter((q) => q.topic_id === t0).map((q) => q.id);
    const in1 = base.filter((q) => q.topic_id === t1).map((q) => q.id);
    samples.push(
      [t0, [in0[1]!, in0[0]!, in0[1]!, in0[0]!, in0[1]!, in0[0]!]],
      [t0, in0.slice(0, 6)],
      [t0, [in0[0]!, in1[0]!]],
      [t0, ["bad"]],
      ["no-such-topic", [in0[0]!]],
      [t0, []],
    );
    let ok = 0;
    let rejected = 0;
    for (const [topic, ids] of samples) {
      const res = await questionsApi(`?topic=${topic}&ids=${ids.join(",")}`);
      const accepted = reviewIds(topic, ids.join(",").split(","), indexFile);
      if (res.status === 400) {
        expect(accepted, `${topic} ${ids.join(",")}`).toBeNull();
        rejected++;
        continue;
      }
      ok++;
      expect(res.status).toBe(200);
      const { questions } = (await res.json()) as { questions: QuizQuestion[] };
      expect(accepted).not.toBeNull();
      for (const locale of STATIC_LOCALES) {
        const shards = await Promise.all([...new Set(accepted!.map(examOfId))].map((e) => shardOf(e, locale)));
        const expl = await Promise.all(accepted!.map((id) => explOf(examOfId(id), explChunkOf(id))));
        const got = pickQuestions(accepted!, shards, expl);
        expect(got.map((q) => q.id)).toEqual(questions.map((q) => q.id));
        got.forEach((q, i) => {
          const want = questions[i]!;
          expect(expectedShardQuestion(q, locale)).toEqual(expectedShardQuestion(want, locale));
          for (const shown of STATIC_LOCALES) expect(localizedExplanation(q, shown)).toEqual(localizedExplanation(want, shown));
          expect(questionAnchor(q, locale, { termCards: {} })).toBe(questionAnchor(want, locale, { termCards: {} }));
        });
      }
    }
    expect(rejected).toBe(5); // 6 ids, another topic's id, a bad id, an unknown topic, no ids
    expect(ok).toBe(index.topics.length + 1); // every topic sample + the deduped repeat
  });
});

describe("static data — allow-list", () => {
  it("every file conforms to its declared allow-list; no forbidden key or IPA path anywhere", async () => {
    const f = await files;
    const families: [Map<string, { body: unknown; text: string }>, (locale: StaticLocale) => AllowSpec][] = [
      [f.exams, examShardSpec],
      [f.expl, () => explanationShardSpec],
      [f.today, () => todaySpec],
      [f.cards, () => termCardsSpec],
      [f.units, () => unitsSpec],
      [f.sensei, senseiTermsSpec],
      [f.index, () => quizIndexSpec],
    ];
    let checked = 0;
    for (const [fam, spec] of families) {
      for (const [file, { body, text }] of fam) {
        const locale = parseLocaleFile(file)?.[1] ?? "ja";
        expect(checkAllowed(body, spec(locale)), file).toEqual([]);
        const keys = allKeys(body);
        expect(FORBIDDEN_KEYS.filter((k) => keys.has(k)), file).toEqual([]);
        expect(FORBIDDEN_TEXT.filter((s) => text.includes(s)), file).toEqual([]);
        checked++;
      }
    }
    expect(checked).toBe(261);
  });

  it("the walker itself flags an extra key, a forbidden nested key and a wrong locale's text", () => {
    const bad = {
      exam_id: "x",
      locale: "ja",
      questions: [{ id: "a", stem_zh: "x", explanation: { key_guard: { note_jp: "x" } } }],
    };
    const problems = checkAllowed(bad, examShardSpec("ja"));
    expect(problems.some((p) => p.includes('"stem_zh"'))).toBe(true);
    expect(problems.some((p) => p.includes('"explanation"'))).toBe(true);
    const keys = allKeys(bad);
    expect(FORBIDDEN_KEYS.filter((k) => keys.has(k))).toEqual(["key_guard", "note_jp"]);
  });
});
