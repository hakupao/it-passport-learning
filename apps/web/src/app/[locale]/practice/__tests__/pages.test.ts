// Stage 7 Phase 1 Task 10 — the practice routes' server side: /practice without a scope or with
// prefill=1 → the setup panel (pre-selected), /practice/browse/<topicId> and /practice/q/<qid>
// (notFound for unknown ids). Real corpus; only Next's runtime pieces are stubbed (notFound,
// cookies, next-intl/server, the next-intl navigation wrappers).
import { describe, expect, it, vi } from "vitest";

const NOT_FOUND = new Error("NEXT_NOT_FOUND (test sentinel)");

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw NOT_FOUND;
  },
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));
vi.mock("next-intl/server", () => ({ setRequestLocale: () => {}, getTranslations: async () => (k: string) => k }));
vi.mock("@/i18n/navigation", () => ({
  Link: () => null,
  redirect: () => {
    throw new Error("unexpected redirect");
  },
  useRouter: () => ({ push: () => {} }),
}));
// fix round 1 (1): the glossary dictionary can fail; /practice's setup panel must not depend on it
const dict = vi.hoisted(() => ({ fail: false }));
vi.mock("@/lib/glossary/dictionaryReader", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/glossary/dictionaryReader")>();
  return {
    ...real,
    loadDictionary: () => (dict.fail ? Promise.reject(new Error("dictionary down (test)")) : real.loadDictionary()),
  };
});

import { BrowseList } from "@/components/practice/BrowseList";
import { PracticeSetup, type PracticeSetupProps } from "@/components/practice/PracticeSetup";
import { SingleQuestion, type SingleQuestionProps } from "@/components/practice/SingleQuestion";
import { TopicPage, type TopicPageProps } from "@/components/practice/TopicPage";
import { LearningRecordProvider } from "@/hooks/useLearningRecord";

import PracticePage from "../page";
import BrowsePage from "../browse/page";
import TopicRoute from "../browse/[topicId]/page";
import QuestionRoute from "../q/[qid]/page";

type El = { type: unknown; key?: string | null; props: { children?: El } & Record<string, unknown> };
const childOf = (el: El): El => el.props.children as El;

const practice = (sp: Record<string, string>) =>
  PracticePage({ params: Promise.resolve({ locale: "ja" }), searchParams: Promise.resolve(sp) }) as Promise<El>;

describe("/practice → setup panel", () => {
  it("?topic=X&prefill=1 shows setup with X preselected, not a session", async () => {
    const el = await practice({ topic: "technology-14-36", prefill: "1" });
    expect(el.type).toBe(LearningRecordProvider);
    const setup = childOf(el);
    expect(setup.type).toBe(PracticeSetup);
    const p = setup.props as unknown as PracticeSetupProps;
    expect(p.initial).toMatchObject({ kind: "topic", topics: ["technology-14-36"] });
    expect(p.prefilled).toBe(true);
    // a soft navigation with another pre-selection remounts the panel (fresh form state)
    const other = childOf(await practice({ topic: "strategy-01-01", prefill: "1" }));
    expect(setup.key).not.toBeNull();
    expect(other.key).not.toBe(setup.key);
  });
  it("exams reach the panel newest first (by gregorian)", async () => {
    const p = childOf(await practice({})).props as unknown as PracticeSetupProps;
    expect(p.exams[0]!.id).toBe("2026r08");
    expect(p.exams.at(-1)!.id).toBe("2009h21h");
  });
  it("a dictionary failure does not break the setup panel", async () => {
    dict.fail = true;
    try {
      const setup = childOf(await practice({ topic: "technology-14-36", prefill: "1" }));
      expect(setup.type).toBe(PracticeSetup);
      const p = setup.props as unknown as PracticeSetupProps;
      expect(p.index.topics).toHaveLength(63);
      expect(Object.values(p.index.topicTerms).every((cards) => cards.length === 0)).toBe(true);
    } finally {
      dict.fail = false;
    }
  });
  it("no params → setup with defaults; ?exam=Y&prefill=1 → that exam", async () => {
    const none = childOf(await practice({}));
    expect(none.type).toBe(PracticeSetup);
    expect((none.props as unknown as PracticeSetupProps).prefilled).toBe(false);
    const exam = childOf(await practice({ exam: "2025r07", prefill: "1" }));
    expect((exam.props as unknown as PracticeSetupProps).initial).toMatchObject({ kind: "exam", exam: "2025r07" });
  });
  it("only invalid ids → setup", async () => {
    expect(childOf(await practice({ ids: "nope-q001" })).type).toBe(PracticeSetup);
  });
});

describe("/practice?…&from=today&kind=", () => {
  const ids = "2009h21a-q001,2009h21a-q002";
  it("kind=<mistakes|due|fresh> reaches the session (preferred over inference); invalid / absent → null", async () => {
    const PracticeSession = (await import("@/components/practice/PracticeSession")).PracticeSession;
    const session = async (sp: Record<string, string>) => {
      const el = childOf(await practice(sp));
      expect(el.type).toBe(PracticeSession);
      return el.props as Record<string, unknown>;
    };
    expect((await session({ ids, from: "today", kind: "due" })).kindParam).toBe("due");
    expect((await session({ ids, from: "today", kind: "fresh" })).kindParam).toBe("fresh");
    expect((await session({ ids, from: "today", kind: "unit" })).kindParam).toBeNull();
    expect((await session({ ids, from: "today" })).kindParam).toBeNull();
    // the kind only names a today group
    expect((await session({ ids, kind: "mistakes" })).kindParam).toBeNull();
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
    TopicRoute({ params: Promise.resolve({ locale: "ja", topicId }), searchParams: Promise.resolve({}) }) as Promise<El>;
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
