// D-180 Task 12 — per-topic progress on the quiz landing (QuizBrowser + the
// TopicProgress client island). Same SSR approach as UnitReader.ssr.test.ts:
// node env, renderToStaticMarkup, createElement instead of JSX, real corpus +
// message catalogs. Effects never run under SSR, so the learning-record hook is
// mocked at its module boundary to serve a fixed record / loaded flag.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { NextIntlClientProvider, createTranslator } from "next-intl";
import { readFileSync } from "node:fs";
import path from "node:path";

import type { LearningRecord } from "@/lib/learning/record";

function messages(locale: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path.resolve(__dirname, `../../../../messages/${locale}.json`), "utf-8"));
}

vi.mock("next-intl/server", () => ({
  getTranslations: async ({ locale, namespace }: { locale: string; namespace: string }) =>
    createTranslator({ locale, messages: messages(locale), namespace: namespace as never }),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    locale,
    children,
    className,
  }: {
    href: string;
    locale?: string;
    children: React.ReactNode;
    className?: string;
  }) => h("a", { href: `/${locale ?? "_"}${href}`, className }, children),
}));

const state: { record: LearningRecord; loaded: boolean } = {
  record: { v: 1, questions: {}, unitsRead: {} },
  loaded: false,
};

vi.mock("@/hooks/useLearningRecord", () => ({
  useLearningRecord: () => ({ ...state, answer: () => {}, readUnit: () => {} }),
}));

import { QuizBrowser } from "../QuizBrowser";
import { buildExamNav, buildTopicNav, loadBaseQuestions, loadQuizIndex } from "@/lib/quiz/quizReader";

/** quiz_index.json → technology-14-36 (データ構造) has 7 questions, 2009h21a-q054 among them. */
const TOPIC = "technology-14-36";
const IN_TOPIC = "2009h21a-q054";

async function render(locale: "ja" | "zh" | "en"): Promise<string> {
  const [index, questions] = await Promise.all([loadQuizIndex(), loadBaseQuestions()]);
  const topicQuestionIds: Record<string, string[]> = {};
  for (const q of questions) (topicQuestionIds[q.topic_id] ??= []).push(q.id);
  const el = await QuizBrowser({
    locale,
    stats: index.stats,
    topicNav: buildTopicNav(index, locale),
    exams: buildExamNav(index),
    topicQuestionIds,
  });
  return renderToStaticMarkup(h(NextIntlClientProvider, { locale, messages: messages(locale), children: el }));
}

/** Inner HTML of the landing link for one topic. */
function row(out: string, topicId: string): string {
  const m = out.match(new RegExp(`<a href="[^"]*id=${topicId}"[^>]*>([\\s\\S]*?)</a>`));
  expect(m, topicId).not.toBeNull();
  return m![1] ?? "";
}

async function otherTopicId(): Promise<string> {
  const questions = await loadBaseQuestions();
  return questions.find((q) => q.topic_id !== TOPIC)!.id;
}

beforeEach(() => {
  state.record = { v: 1, questions: {}, unitsRead: {} };
  state.loaded = false;
});

describe("QuizBrowser per-topic progress (SSR)", () => {
  it("a loaded record with one correct answer shows 1/7 and 100% on that topic only", async () => {
    state.loaded = true;
    state.record.questions[IN_TOPIC] = { choice: "イ", correct: true, at: 1 };
    const out = await render("ja");
    expect(row(out, TOPIC)).toContain("1/7 解答 · 正答率 100%");
    expect(out.match(/1\/7 解答/g)?.length).toBe(1);
    // Other topics show their 0/N without an accuracy figure.
    expect(row(out, "technology-13-33")).toMatch(/0\/28 解答</);
    expect(out).not.toContain("NaN");
  });

  it("answers in another topic do not count toward this one", async () => {
    state.loaded = true;
    state.record.questions[await otherTopicId()] = { choice: "ア", correct: false, at: 1 };
    expect(row(await render("ja"), TOPIC)).toContain("0/7 解答");
  });

  it("formats zh / en with the accuracy as a percentage", async () => {
    state.loaded = true;
    const ids = (await loadBaseQuestions()).filter((q) => q.topic_id === TOPIC).map((q) => q.id);
    state.record.questions[ids[0]!] = { choice: "ア", correct: true, at: 1 };
    state.record.questions[ids[1]!] = { choice: "ア", correct: false, at: 2 };
    expect(row(await render("en"), TOPIC)).toContain("2/7 answered · 50% correct");
    expect(row(await render("zh"), TOPIC)).toContain("已答 2/7 · 正确率 50%");
  });

  it("before the record has loaded: no 0/N, one reserved empty slot per topic", async () => {
    state.record.questions[IN_TOPIC] = { choice: "イ", correct: true, at: 1 };
    const out = await render("ja");
    expect(out).not.toMatch(/\d+\/\d+ 解答/);
    const index = await loadQuizIndex();
    const slots = out.match(/<span class="[^"]*rowProgress[^"]*" aria-hidden="true"><\/span>/g) ?? [];
    expect(slots.length).toBe(index.topics.length);
  });
});

// D-181 Phase B — the 「AI 先生の復習」 card (components/sensei/ReviewCard).
describe("QuizBrowser AI 先生 review card (SSR)", () => {
  /** The card's markup. */
  const reviewCard = (out: string): string => {
    const m = out.match(/<section[^>]*data-testid="review-card"[^>]*>([\s\S]*?)<\/section>/);
    expect(m).not.toBeNull();
    return m![1] ?? "";
  };
  async function answer(topicId: string, answered: number, correct: number, at = 1): Promise<void> {
    const ids = (await loadBaseQuestions()).filter((q) => q.topic_id === topicId).map((q) => q.id);
    for (let i = 0; i < answered; i++) state.record.questions[ids[i]!] = { choice: "ア", correct: i < correct, at: at + i };
  }

  const HINT = "1 つの分野で 5 題以上解くと弱点を分析します";
  const ALL_CORRECT = "5 題以上解いた分野はすべて全問正解です";
  const INTRO = "解答記録から正答率の低い分野を選びました";

  it("before the record has loaded: the title, but neither rows, the intro nor a hint", async () => {
    const card = reviewCard(await render("ja"));
    expect(card).toContain("AI 先生の復習");
    expect(card).not.toContain("review-topic");
    expect(card).not.toContain(HINT);
    expect(card).not.toContain(ALL_CORRECT);
    expect(card).not.toContain(INTRO);
  });

  it("no topic with 5 answers (even 5 spread over topics): the per-topic hint, no intro", async () => {
    state.loaded = true;
    await answer("technology-14-36", 4, 0);
    await answer("technology-21-54", 4, 0);
    const card = reviewCard(await render("ja"));
    expect(card).toContain(HINT);
    expect(card).not.toContain(ALL_CORRECT);
    expect(card).not.toContain(INTRO);
    expect(card).not.toContain("review-topic");
  });

  it("topics with 5 answers exist but all are correct: the all-correct line, no intro", async () => {
    state.loaded = true;
    await answer("technology-14-36", 4, 0); // fewer than 5: never counts
    await answer("technology-21-54", 5, 5);
    const card = reviewCard(await render("ja"));
    expect(card).toContain(ALL_CORRECT);
    expect(card).not.toContain(HINT);
    expect(card).not.toContain(INTRO);
    expect(card).not.toContain("review-topic");
  });

  it("lists the weakest topics, lowest accuracy first, linking to the set with review=1", async () => {
    state.loaded = true;
    await answer("technology-14-36", 5, 1); // 20%
    await answer("technology-21-54", 6, 3); // 50%
    await answer("technology-14-39", 5, 4); // 80%
    await answer("technology-13-33", 10, 9); // 90% — 4th, not shown
    await answer("technology-19-50", 7, 7); // all correct — never shown
    const card = reviewCard(await render("ja"));
    expect(card).toContain(INTRO);
    // name and stat are separated by a real space (the link's text reads 「データ構造 正答率 …」)
    const rows = [...card.matchAll(/<a href="([^"]*)"[^>]*><span[^>]*>([^<]*)<\/span> <span[^>]*>([^<]*)<\/span><\/a>/g)].map(
      (m) => [m[1], m[2], m[3]],
    );
    const index = await loadQuizIndex();
    const name = (id: string) => index.topics.find((x) => x.topic_id === id)!.name_jp;
    expect(rows).toEqual([
      ["/ja/quiz?mode=topic&amp;id=technology-14-36&amp;review=1", name("technology-14-36"), "正答率 20% · 5 題解答"],
      ["/ja/quiz?mode=topic&amp;id=technology-21-54&amp;review=1", name("technology-21-54"), "正答率 50% · 6 題解答"],
      ["/ja/quiz?mode=topic&amp;id=technology-14-39&amp;review=1", name("technology-14-39"), "正答率 80% · 5 題解答"],
    ]);
  });

  it("zh / en strings (en: AI Tutor)", async () => {
    state.loaded = true;
    await answer("technology-14-36", 5, 1);
    const en = reviewCard(await render("en"));
    expect(en).toContain("AI Tutor review");
    expect(en).toContain("20% correct · 5 answered");
    const zh = reviewCard(await render("zh"));
    expect(zh).toContain("AI 老师的复习");
    expect(zh).toContain("正确率 20% · 已答 5 题");
  });

  it("zh / en hints name the per-topic rule and the all-correct case", async () => {
    state.loaded = true;
    expect(reviewCard(await render("zh"))).toContain("在同一领域答满 5 题后会分析你的薄弱点");
    expect(reviewCard(await render("en"))).toContain("Answer 5 or more questions in a topic");
    await answer("technology-21-54", 5, 5);
    expect(reviewCard(await render("zh"))).toContain("已答 5 题以上的领域全部答对了");
    expect(reviewCard(await render("en"))).toContain("Every topic where you have answered 5 or more questions is all correct");
  });
});
