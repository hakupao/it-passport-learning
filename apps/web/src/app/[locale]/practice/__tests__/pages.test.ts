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

import { BrowseList } from "@/components/practice/BrowseList";
import { PracticeSetup, type PracticeSetupProps } from "@/components/practice/PracticeSetup";
import { SingleQuestion, type SingleQuestionProps } from "@/components/practice/SingleQuestion";
import { TopicPage, type TopicPageProps } from "@/components/practice/TopicPage";
import { LearningRecordProvider } from "@/hooks/useLearningRecord";

import PracticePage from "../page";
import BrowsePage from "../browse/page";
import TopicRoute from "../browse/[topicId]/page";
import QuestionRoute from "../q/[qid]/page";

type El = { type: unknown; props: { children?: El } & Record<string, unknown> };
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
  it("a topic → TopicPage with its questions (explanations merged) under the record provider", async () => {
    const el = await call("technology-14-36");
    expect(el.type).toBe(LearningRecordProvider);
    const page = childOf(el);
    expect(page.type).toBe(TopicPage);
    const p = page.props as unknown as TopicPageProps;
    expect(p.questions.map((q) => q.topic_id).every((t) => t === "technology-14-36")).toBe(true);
    expect(p.questions.length).toBe(7);
    expect(p.questions.some((q) => q.explanation)).toBe(true);
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
