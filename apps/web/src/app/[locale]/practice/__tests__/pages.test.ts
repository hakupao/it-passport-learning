// Stage 7 Phase 1 Task 10 — the practice routes: /practice without a scope or with prefill=1 → the
// setup panel (pre-selected), a scope → the session, /practice/browse/<topicId> and /practice/q/<qid>
// (notFound for unknown ids). D-217 H1-3: /practice is a locale-only shell (PracticeRoute) and the
// query is resolved in the browser by resolvePracticeView over the static data — the cases below
// run it against the route handlers' files (routeData), and pin that the session list, term cards,
// topics, folds and `from` equal what the former server page computed from the loaders.
// Real corpus; only Next's runtime pieces are stubbed (notFound, next-intl/server, the next-intl
// navigation wrappers).
import { Suspense } from "react";
import { describe, expect, it, vi } from "vitest";

const NOT_FOUND = new Error("NEXT_NOT_FOUND (test sentinel)");

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw NOT_FOUND;
  },
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("next-intl/server", () => ({ setRequestLocale: () => {}, getTranslations: async () => (k: string) => k }));
vi.mock("@/i18n/navigation", () => ({
  Link: () => null,
  redirect: () => {
    throw new Error("unexpected redirect");
  },
  useRouter: () => ({ push: () => {}, replace: () => {} }),
}));

import { BrowseList } from "@/components/practice/BrowseList";
import { PracticeRoute } from "@/components/practice/PracticeRoute";
import { SingleQuestion, type SingleQuestionProps } from "@/components/practice/SingleQuestion";
import { TopicPage, type TopicPageProps } from "@/components/practice/TopicPage";
import { LearningRecordProvider } from "@/hooks/useLearningRecord";
import { buildTermCards } from "@/lib/glossary/dictionary";
import { loadDictionary } from "@/lib/glossary/dictionaryReader";
import { termId } from "@/lib/glossary/termId";
import { foldPlan, parseScope, type SearchParams } from "@/lib/practice/practiceSession";
import { groupMap, resolveScope } from "@/lib/practice/practiceIndex";
import { loadChumonGroups, loadSetupIndex } from "@/lib/practice/practiceReader";
import { resolvePracticeView, searchParamsOf, type SessionView, type SetupView } from "@/lib/practice/practiceView";
import { resolveSessionFrom } from "@/lib/practice/sessionFrom";
import { loadAllQuestions, loadBaseQuestions, loadQuizIndex, localizedExplanation } from "@/lib/quiz/quizReader";
import { routeData } from "@/lib/staticData/__tests__/routeData";
import type { StaticLocale } from "@/lib/staticData/shards";

import PracticePage from "../page";
import BrowsePage from "../browse/page";
import TopicRoute from "../browse/[topicId]/page";
import QuestionRoute from "../q/[qid]/page";

type El = { type: unknown; key?: string | null; props: { children?: El } & Record<string, unknown> };
const childOf = (el: El): El => el.props.children as El;

const data = routeData();
const FIXED = { now: () => 1_700_000_000_000, random: () => 0.5 };
const view = (sp: Record<string, string>, locale: StaticLocale = "ja", d = data) =>
  resolvePracticeView(sp, locale, d, FIXED);
const setupOf = async (sp: Record<string, string>) => {
  const v = await view(sp);
  expect(v.kind).toBe("setup");
  return v as SetupView;
};
const sessionOf = async (sp: Record<string, string>, locale: StaticLocale = "ja", d = data) => {
  const v = await view(sp, locale, d);
  expect(v.kind).toBe("session");
  return v as SessionView;
};

describe("/practice page shell (H1-3)", () => {
  it("renders PracticeRoute for the locale in Suspense under the record provider; no query read on the server", async () => {
    const el = (await PracticePage({ params: Promise.resolve({ locale: "zh" }) })) as El;
    expect(el.type).toBe(LearningRecordProvider);
    const suspense = childOf(el);
    expect(suspense.type).toBe(Suspense);
    const route = childOf(suspense);
    expect(route.type).toBe(PracticeRoute);
    expect(route.props).toEqual({ locale: "zh" });
  });
  it("an unknown locale → notFound()", async () => {
    await expect(PracticePage({ params: Promise.resolve({ locale: "xx" }) })).rejects.toBe(NOT_FOUND);
  });
});

describe("/practice → setup panel", () => {
  it("?topic=X&prefill=1 shows setup with X preselected, not a session", async () => {
    const p = await setupOf({ topic: "technology-14-36", prefill: "1" });
    expect(p.initial).toMatchObject({ kind: "topic", topics: ["technology-14-36"] });
    expect(p.prefilled).toBe(true);
    // a soft navigation with another pre-selection remounts the panel (fresh form state)
    const other = await setupOf({ topic: "strategy-01-01", prefill: "1" });
    expect(p.key).not.toBe("");
    expect(other.key).not.toBe(p.key);
  });
  it("exams reach the panel newest first (by gregorian)", async () => {
    const p = await setupOf({});
    expect(p.exams[0]!.id).toBe("2026r08");
    expect(p.exams.at(-1)!.id).toBe("2009h21h");
  });
  it("the panel's index = loadSetupIndex (topicTerms empty: no dictionary dependency)", async () => {
    for (const locale of ["ja", "zh", "en"] as const) {
      const p = (await view({ topic: "technology-14-36", prefill: "1" }, locale)) as SetupView;
      expect(p.index).toEqual(await loadSetupIndex(locale));
      expect(p.index.topics).toHaveLength(63);
      expect(Object.values(p.index.topicTerms).every((cards) => cards.length === 0)).toBe(true);
    }
  });
  it("no params → setup with defaults; ?exam=Y&prefill=1 → that exam", async () => {
    expect((await setupOf({})).prefilled).toBe(false);
    expect((await setupOf({ exam: "2025r07", prefill: "1" })).initial).toMatchObject({ kind: "exam", exam: "2025r07" });
  });
  it("only invalid ids → setup", async () => {
    await setupOf({ ids: "nope-q001" });
  });
  it("searchParamsOf: a repeated key keeps every value (the server's searchParams shape); the first one counts", async () => {
    expect(searchParamsOf(new URLSearchParams("ids=a&ids=b&n=10"))).toEqual({ ids: ["a", "b"], n: "10" });
    const v = await sessionOf(searchParamsOf(new URLSearchParams("ids=2009h21a-q001&ids=2009h21a-q002")) as Record<string, string>);
    expect(v.questions.map((q) => q.id)).toEqual(["2009h21a-q001"]);
  });
});

describe("/practice?… → the session = the former server page's (loaders)", () => {
  /** what the former server page computed for `sp`: the list, folds, term cards, topic labels, from */
  async function former(sp: SearchParams, locale: StaticLocale) {
    const [index, base, groups, dict] = await Promise.all([loadQuizIndex(), loadBaseQuestions(), loadChumonGroups(), loadDictionary()]);
    const scope = parseScope(
      sp,
      new Set(base.map((q) => q.id)),
      new Set(index.topics.map((t) => t.topic_id)),
      new Set(index.exams.map((e) => e.exam_id)),
    )!;
    const ids = resolveScope(scope, base, groupMap(groups));
    const qs = base.filter((q) => ids.includes(q.id));
    return {
      ids,
      folds: foldPlan(ids, groups),
      termCards: buildTermCards(dict, qs, locale),
      topics: [...new Set(qs.map((q) => q.topic_id))].sort(),
      from: scope.kind === "ids" || sp.from !== "unit" ? await resolveSessionFrom(sp, locale) : null,
    };
  }
  const URLS: Record<string, string>[] = [
    { ids: "2009h21a-q001,2009h21a-q002" },
    { ids: "2026r08-q010,2009h21a-q054,2015h27h-q001,2019r01a-q077,2012h24h-q032,2013h25a-q035,2021r03-q005,2024r06-q090,2010h22h-q001,2018h30a-q028" },
    { topic: "technology-14-36", n: "10", order: "rand", seed: "12345" },
    { topic: "strategy-01-01,management-08-25", n: "20", order: "seq" },
    { exam: "2025r07", n: "all" },
    { exam: "2011h23a", n: "50", order: "rand", seed: "7" },
    { ids: "2012h24h-q032,2013h25a-q035", from: "unit", unit: "management-08-25-u01", run: "1" },
    { ids: "2009h21a-q001,2009h21a-q002", from: "today", kind: "due" },
  ];
  for (const sp of URLS) {
    it(new URLSearchParams(sp).toString(), async () => {
      for (const locale of ["ja", "zh", "en"] as const) {
        const got = await sessionOf(sp, locale);
        const want = await former(sp, locale);
        expect(got.questions.map((q) => q.id)).toEqual(want.ids);
        expect(got.folds).toEqual(want.folds);
        expect(got.termCards).toEqual(want.termCards);
        expect(Object.keys(got.topics).sort()).toEqual(want.topics);
        expect(got.from).toEqual(want.from);
        expect(got.questions.every((q) => q.explanation === undefined)).toBe(true); // fetched once answered
      }
    });
  }
  it("a topic random 10 keeps a 中問 group whole (the list may run past 10)", async () => {
    const groups = await loadChumonGroups();
    for (let seed = 1; seed <= 40; seed++) {
      const ids = (await sessionOf({ exam: "2009h21a", n: "10", order: "rand", seed: String(seed) })).questions.map((q) => q.id);
      for (const g of groups) {
        const hit = g.memberIds.filter((id) => ids.includes(id));
        if (hit.length > 0) expect(hit, `${seed} ${g.key}`).toEqual(g.memberIds);
      }
    }
  });
  it("term cards failing to load → plain-text terms ({}), the session still opens", async () => {
    const d = routeData((p) => p.startsWith("/data/glossary/"));
    const v = await sessionOf({ ids: "2009h21a-q001,2009h21a-q002" }, "ja", d);
    expect(v.termCards).toEqual({});
    expect(v.questions).toHaveLength(2);
  });
});

describe("the session's explanations (fetched once answered)", () => {
  it("staticData.fetchExplanation(id) renders as the loader explanation; one chunk file serves its 10 questions; none → null", async () => {
    const all = await loadAllQuestions();
    const d = routeData();
    const ids = ["2009h21a-q001", "2009h21a-q002", "2009h21a-q010", "2009h21a-q011", "2026r08-q100"];
    for (const id of ids) {
      const q = all.find((x) => x.id === id)!;
      const e = await d.fetchExplanation(id);
      for (const shown of ["ja", "zh", "en"] as const) {
        expect(localizedExplanation({ ...q, explanation: e ?? undefined }, shown)).toEqual(localizedExplanation(q, shown));
      }
    }
    expect([...new Set(d.requests)].sort()).toEqual([
      "/data/quiz-expl/2009h21a-1.json",
      "/data/quiz-expl/2009h21a-2.json",
      "/data/quiz-expl/2026r08-10.json",
    ]);
    expect(d.requests.filter((r) => r === "/data/quiz-expl/2009h21a-1.json")).toHaveLength(1); // cached
    const without = all.find((q) => !q.explanation);
    if (without) expect(await d.fetchExplanation(without.id)).toBeNull();
  });
});

describe("/practice?…&order=rand without a seed → replace (was the server redirect)", () => {
  it("the same query plus seed=<uint32>", async () => {
    const v = await view({ topic: "technology-14-36", n: "10", order: "rand" });
    expect(v).toEqual({
      kind: "replace",
      query: { topic: "technology-14-36", n: "10", order: "rand", seed: String(Math.floor(0.5 * 2 ** 32)) },
    });
  });
  it("seq or a given seed: no replace", async () => {
    expect((await view({ topic: "technology-14-36", n: "10", order: "seq" })).kind).toBe("session");
    expect((await view({ topic: "technology-14-36", n: "10", order: "rand", seed: "0" })).kind).toBe("session");
  });
});

describe("/practice?…&from=today&kind=", () => {
  const ids = "2009h21a-q001,2009h21a-q002";
  it("kind=<mistakes|due|fresh> reaches the session (preferred over inference); invalid / absent → null", async () => {
    expect((await sessionOf({ ids, from: "today", kind: "due" })).kindParam).toBe("due");
    expect((await sessionOf({ ids, from: "today", kind: "fresh" })).kindParam).toBe("fresh");
    expect((await sessionOf({ ids, from: "today", kind: "unit" })).kindParam).toBeNull();
    expect((await sessionOf({ ids, from: "today" })).kindParam).toBeNull();
    // the kind only names a today group
    expect((await sessionOf({ ids, kind: "mistakes" })).kindParam).toBeNull();
  });
  it("from=today carries today.<locale> (the summary's 「继续下一项」); a failed file → null, the session still opens", async () => {
    expect((await sessionOf({ ids, from: "today" })).today?.topics).toHaveLength(63);
    expect((await sessionOf({ ids })).today).toBeNull();
    const d = routeData((p) => p.startsWith("/data/practice/"));
    expect((await sessionOf({ ids, from: "today" }, "ja", d)).today).toBeNull();
  });
});

describe("/practice?…&from=unit (Phase 3 §0-2)", () => {
  const UNIT = "management-08-25-u01";
  const ids = "2012h24h-q032,2013h25a-q035";

  it("an ids set with a known unit and a run → from carries the unit (and a valid at)", async () => {
    const from = (await sessionOf({ ids, from: "unit", unit: UNIT, run: "1" })).from as Record<string, unknown>;
    expect(from).toMatchObject({ kind: "unit", unitId: UNIT, at: null });
    const at = termId("機能要件");
    const withAt = (await sessionOf({ ids, from: "unit", unit: UNIT, at, run: "1" })).from as Record<string, unknown>;
    expect(withAt).toMatchObject({ kind: "unit", at });
  });

  it("no run → replace with the same query plus run=<now>, at kept (was the server redirect)", async () => {
    const v = await view({ ids, from: "unit", unit: UNIT, at: "t0123456789abcdef" });
    expect(v).toEqual({
      kind: "replace",
      query: { ids, from: "unit", unit: UNIT, at: "t0123456789abcdef", run: String(FIXED.now()) },
    });
  });

  it("a filter scope or an unknown unit is not a unit set (no from, no replace)", async () => {
    expect((await sessionOf({ topic: "management-08-25", from: "unit", unit: UNIT })).from).toBeNull();
    expect((await sessionOf({ ids, from: "unit", unit: "management-08-25-u99" })).from).toBeNull();
  });

  it("the units file failing → the set runs without from (no replace)", async () => {
    const d = routeData((p) => p.startsWith("/data/textbook/"));
    expect((await sessionOf({ ids, from: "unit", unit: UNIT }, "ja", d)).from).toBeNull();
  });

  it("only the files a view needs are fetched (no explanation chunk, no units file without from=unit)", async () => {
    const d = routeData();
    await sessionOf({ ids: "2009h21a-q001,2026r08-q001" }, "zh", d);
    expect([...new Set(d.requests)].sort()).toEqual([
      "/data/glossary/cards.zh.json",
      "/data/quiz/2009h21a.zh.json",
      "/data/quiz/2026r08.zh.json",
      "/data/quiz/index.json",
    ]);
  });
});

describe("/practice/browse", () => {
  it("renders the browse list (topics + exams newest first)", async () => {
    const el = (await BrowsePage({ params: Promise.resolve({ locale: "zh" }) })) as El;
    expect(el.type).toBe(BrowseList);
    const exams = el.props.exams as { id: string }[];
    expect(exams[0]!.id).toBe("2026r08");
  });
});

describe("/practice/browse/<topicId>", () => {
  const call = (topicId: string) =>
    TopicRoute({ params: Promise.resolve({ locale: "ja", topicId }) }) as Promise<El>;
  it("unknown topic → notFound()", async () => {
    await expect(call("nope-01-01")).rejects.toBe(NOT_FOUND);
  });
  it("a topic → TopicPage with its light rows (D-193 §0-1) under the record provider", async () => {
    const el = await call("technology-14-36");
    expect(el.type).toBe(LearningRecordProvider);
    const page = childOf(el);
    expect(page.type).toBe(TopicPage);
    const p = page.props as unknown as TopicPageProps;
    expect(p.rows.length).toBe(7);
    expect(p.rows.every((r) => r.id.startsWith(r.exam_id))).toBe(true);
    expect(Object.keys(p.rows[0]!).sort()).toEqual(["correct_answer", "exam_id", "id", "source_label", "terms"]);
    expect(p.exams["2009h21a"]).toBe("平成21年度 秋期");
  });
});

describe("/practice/q/<qid>", () => {
  const call = (qid: string) => QuestionRoute({ params: Promise.resolve({ locale: "ja", qid }) }) as Promise<El>;
  it("q page 404 for unknown id", async () => {
    await expect(call("2009h21a-q999")).rejects.toBe(NOT_FOUND);
    await expect(call("../etc")).rejects.toBe(NOT_FOUND);
  });
  it("a real id → SingleQuestion", async () => {
    const el = await call("2009h21a-q012");
    expect(el.type).toBe(LearningRecordProvider);
    const page = childOf(el);
    expect(page.type).toBe(SingleQuestion);
    expect((page.props as unknown as SingleQuestionProps).q.id).toBe("2009h21a-q012");
  });
});
