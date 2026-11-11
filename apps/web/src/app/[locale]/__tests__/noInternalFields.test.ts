// D-217 H1-3 (MEDIUM-1 of H1-2) — no page hands a client component a corpus question with its
// internal fields. Each page that carries questions / explanations / the practice index is rendered
// (server pages: their element tree, i.e. the props that become the RSC payload; the client-resolved
// /practice and /mock/run: the views their browser resolvers build from the static data), and no key
// of key_guard's internals, figure_type or source_note may appear anywhere in it — nor the text of
// a sampled note_jp. The samples are chosen so that their loader objects DO hold every one of those
// keys a question carries (checked first), so the test fails if a page passes a loader question through.
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND (test sentinel)");
  },
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("next-intl/server", () => ({
  setRequestLocale: () => {},
  getTranslations: async () => (k: string) => k,
}));
vi.mock("@/i18n/navigation", () => ({
  Link: () => null,
  redirect: () => {
    throw new Error("unexpected redirect");
  },
  useRouter: () => ({ push: () => {}, replace: () => {} }),
}));

import { resolveMockView } from "@/lib/mock/mockView";
import { resolvePracticeView } from "@/lib/practice/practiceView";
import { loadAllQuestions, type QuizQuestion } from "@/lib/quiz/quizReader";
import { routeData } from "@/lib/staticData/__tests__/routeData";

import HomePage from "../page";
import MockPage from "../mock/page";
import MockRunPage from "../mock/run/page";
import PracticePage from "../practice/page";
import TopicRoute from "../practice/browse/[topicId]/page";
import MistakesPage from "../practice/mistakes/page";
import QuestionRoute from "../practice/q/[qid]/page";
import RecordRoute from "../record/page";

const INTERNAL = [
  "note_jp",
  "round1",
  "derived_answer",
  "figure_derivable",
  "matches_key",
  "stem_corruption_suspected",
  "figure_type",
  "source_note",
] as const;

const LOCALES = ["ja", "zh", "en"] as const;

/** Every key in a value; React elements are entered through their props only. */
function keysOf(value: unknown, into = new Set<string>(), seen = new Set<unknown>()): Set<string> {
  if (value === null || typeof value !== "object" || seen.has(value)) return into;
  seen.add(value);
  if ("$$typeof" in value && "props" in value) return keysOf((value as { props: unknown }).props, into, seen);
  if (Array.isArray(value)) {
    for (const v of value) keysOf(v, into, seen);
    return into;
  }
  for (const [k, v] of Object.entries(value)) {
    into.add(k);
    keysOf(v, into, seen);
  }
  return into;
}

/** The JSON of a value's data (functions and element internals dropped). */
function textOf(value: unknown): string {
  return JSON.stringify(value, (k, v) => (k === "_owner" || k === "_store" || k.startsWith("_debug") ? undefined : v));
}

function expectClean(value: unknown, label: string, notes: readonly string[] = []): void {
  const keys = keysOf(value);
  expect(INTERNAL.filter((k) => keys.has(k)), label).toEqual([]);
  const text = textOf(value);
  for (const note of notes) expect(text.includes(note), `${label}: a note_jp text`).toBe(false);
}

async function samples(): Promise<{ ids: string[]; notes: string[] }> {
  const all = await loadAllQuestions();
  const kg = (q: QuizQuestion) => (q.explanation?.key_guard ?? {}) as Record<string, unknown>;
  const pick = (f: (q: QuizQuestion) => boolean) => all.find(f)!.id;
  const ids = [
    ...new Set([
      pick((q) => kg(q).suspect === true && typeof kg(q).note_jp === "string" && (kg(q).note_jp as string) !== ""),
      pick((q) => "round1" in kg(q)),
      pick((q) => q.figure_type !== null && q.figure_type !== undefined),
      "2009h21a-q012",
    ]),
  ];
  const chosen = all.filter((q) => ids.includes(q.id));
  // precondition: the loader objects hold every internal key a question can carry (else this test
  // could not fail); source_note is a sidecar file's header, never on a question
  const loaderKeys = keysOf(chosen);
  expect(INTERNAL.filter((k) => k !== "source_note" && !loaderKeys.has(k))).toEqual([]);
  const notes = chosen.map((q) => kg(q).note_jp).filter((n): n is string => typeof n === "string" && n.length > 12);
  return { ids, notes };
}

describe("no page passes internal corpus fields to the client (MEDIUM-1)", () => {
  it("/practice/q/<qid> (server-rendered): the SingleQuestion props, every locale", async () => {
    const { ids, notes } = await samples();
    for (const locale of LOCALES) {
      for (const qid of ids) {
        const el = await QuestionRoute({ params: Promise.resolve({ locale, qid }) });
        expectClean(el, `${locale} q/${qid}`, notes);
        // the explanation still reaches the page (suspect caveat included)
        expect(textOf(el)).toContain('"explanation"');
      }
    }
  });

  it("/practice/browse/<topicId>, /practice/mistakes, /record, /mock, / (today)", async () => {
    const { notes } = await samples();
    for (const locale of LOCALES) {
      for (const topicId of ["technology-14-36", "strategy-01-01", "management-08-25"]) {
        expectClean(await TopicRoute({ params: Promise.resolve({ locale, topicId }) }), `${locale} browse/${topicId}`, notes);
      }
      expectClean(await MistakesPage({ params: Promise.resolve({ locale }) }), `${locale} mistakes`, notes);
      expectClean(await RecordRoute({ params: Promise.resolve({ locale }) }), `${locale} record`, notes);
      expectClean(await MockPage({ params: Promise.resolve({ locale }) }), `${locale} mock`, notes);
      expectClean(await HomePage({ params: Promise.resolve({ locale }) }), `${locale} today`, notes);
    }
  });

  it("/practice and /mock/run: the locale-only shells, and the views their browser resolvers build", async () => {
    const { ids, notes } = await samples();
    const data = routeData();
    for (const locale of LOCALES) {
      expectClean(await PracticePage({ params: Promise.resolve({ locale }) }), `${locale} practice shell`, notes);
      expectClean(await MockRunPage({ params: Promise.resolve({ locale }) }), `${locale} mock/run shell`, notes);
      const session = await resolvePracticeView({ ids: ids.join(",") }, locale, data);
      expect(session.kind).toBe("session");
      expectClean(session, `${locale} practice session`, notes);
      expectClean(await resolvePracticeView({}, locale, data), `${locale} practice setup`, notes);
      // explanations fetched once answered
      for (const id of ids) expectClean(await data.fetchExplanation(id), `${locale} explanation ${id}`, notes);
      const mock = await resolveMockView({ exam: ids[0]!.slice(0, ids[0]!.lastIndexOf("-q")) }, locale, data);
      expect(mock.kind).toBe("run");
      expectClean(mock, `${locale} mock run`, notes);
    }
  });
});
