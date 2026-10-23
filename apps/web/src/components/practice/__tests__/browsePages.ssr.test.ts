// Stage 7 Phase 1 Task 10 (D-189 §4 / §6.2, D-190 §0-17) — setup panel, browse list, topic page,
// single-question view (SSR). Node env, renderToStaticMarkup, real corpus + catalogs. Effects never
// run under SSR, so the learning-record hook is mocked at its module boundary (fixed record / loaded).
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) =>
    h("a", { href, ...rest }, children),
  useRouter: () => ({ push: () => {} }),
}));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams() }));

const state: { record: LearningRecord; loaded: boolean } = { record: emptyRecord(), loaded: false };
vi.mock("@/hooks/useLearningRecord", () => ({
  useLearningRecord: () => ({ ...state, answer: () => {}, readUnit: () => {}, setSetting: () => {} }),
  useLearningActions: () => ({ answer: () => {}, readUnit: () => {}, setSetting: () => {} }),
}));

import { emptyRecord, recordAttempt, type LearningRecord } from "@/lib/learning/record";
import { toLocalDay } from "@/lib/learning/schedule";
import { topicStars, type TodayIndex } from "@/lib/practice/practiceIndex";
import { loadTodayIndex } from "@/lib/practice/practiceReader";
import { DEFAULT_SETTINGS } from "@/lib/practice/practiceSetup";
import { CHOICE_LETTERS, loadAllQuestions, loadQuizIndex, type QuizIndex, type QuizQuestion } from "@/lib/quiz/quizReader";

import { BrowseList, browseModel } from "../BrowseList";
import { PracticeSetup } from "../PracticeSetup";
import { SingleQuestion } from "../SingleQuestion";
import { TopicPage } from "../TopicPage";
import { messagesFor, textOf } from "./practiceRender";

let QS: QuizQuestion[] = [];
let INDEX: QuizIndex;
let TODAY: TodayIndex;

beforeAll(async () => {
  [QS, INDEX, TODAY] = await Promise.all([loadAllQuestions(), loadQuizIndex(), loadTodayIndex("ja")]);
});
beforeEach(() => {
  state.record = emptyRecord();
  state.loaded = false;
});

function withIntl(locale: string, child: React.ReactElement): string {
  return renderToStaticMarkup(
    h(NextIntlClientProvider, { locale, messages: messagesFor(locale), timeZone: "Asia/Tokyo", children: child }),
  );
}
const count = (html: string, re: RegExp): number => html.match(re)?.length ?? 0;
/** the opening <input> tags carrying every one of the given attribute fragments (any attribute order) */
const inputs = (html: string, ...frags: string[]): string[] =>
  [...html.matchAll(/<input\b[^>]*>/g)].map((m) => m[0]).filter((tag) => frags.every((f) => tag.includes(f)));

describe("PracticeSetup", () => {
  it("setup lists 3 categories → topics with ★", () => {
    const html = withIntl("ja", h(PracticeSetup, { index: TODAY, initial: DEFAULT_SETTINGS, prefilled: false }));
    expect(html).toContain("data-setup");
    const cats = [...html.matchAll(/data-cat="([a-z]+)"/g)].map((m) => m[1]);
    expect(cats).toEqual(["strategy", "management", "technology"]);
    expect(count(html, /data-topic-option="/g)).toBe(63);
    const stars = topicStars(INDEX);
    const t = INDEX.topics[0]!;
    const row = new RegExp(`data-topic-option="${t.topic_id}"[\\s\\S]*?</li>`).exec(html)![0];
    expect(textOf(row)).toContain(t.name_jp);
    expect(textOf(row)).toContain("★".repeat(stars[t.topic_id]!) + "☆".repeat(3 - stars[t.topic_id]!));
    // the five scopes, the counts, the orders
    for (const k of ["topic", "exam", "mistakes", "due", "random"]) expect(html).toContain(`value="${k}"`);
    for (const n of ["10", "20", "50", "all"]) expect(inputs(html, 'name="n"', `value="${n}"`)).toHaveLength(1);
    expect(inputs(html, 'name="n"', 'value="20"', 'checked=""')).toHaveLength(1);
    expect(inputs(html, 'name="order"', 'value="seq"', 'checked=""')).toHaveLength(1);
    expect(html).not.toContain("data-session");
  });

  it("?topic=X&prefill=1 preselects X (and only X)", () => {
    const X = "technology-14-36";
    const html = withIntl(
      "zh",
      h(PracticeSetup, { index: TODAY, initial: { ...DEFAULT_SETTINGS, topics: [X] }, prefilled: true }),
    );
    const checked = [...html.matchAll(/<input[^>]*data-topic-input="([^"]+)"[^>]*>/g)]
      .filter((m) => / checked=""/.test(m[0]))
      .map((m) => m[1]);
    expect(checked).toEqual([X]);
    expect(inputs(html, 'name="scope"', 'value="topic"', 'checked=""')).toHaveLength(1);
  });

  it("exam scope: the exam select lists every exam, newest first, preselected", () => {
    const exams = Object.keys(TODAY.exams);
    const html = withIntl(
      "en",
      h(PracticeSetup, {
        index: TODAY,
        initial: { ...DEFAULT_SETTINGS, kind: "exam", exam: exams[0]!, n: "all" },
        prefilled: true,
      }),
    );
    const opts = [...html.matchAll(/<option value="([^"]+)"/g)].map((m) => m[1]);
    expect(opts).toEqual([...exams].reverse());
    expect(html).toMatch(new RegExp(`<option value="${exams[0]}" selected=""`));
  });
});

describe("BrowseList", () => {
  it("browse lists topics (3 categories, ★, count) and exams newest first", () => {
    const model = browseModel(INDEX, "ja");
    const html = withIntl("ja", h(BrowseList, model));
    expect([...html.matchAll(/data-cat="([a-z]+)"/g)].map((m) => m[1])).toEqual(["strategy", "management", "technology"]);
    for (const t of INDEX.topics) expect(html).toContain(`href="/practice/browse/${t.topic_id}"`);
    const examHrefs = [...html.matchAll(/href="\/practice\?exam=([^&"]+)&amp;n=all&amp;order=seq"/g)].map((m) => m[1]);
    expect(examHrefs).toHaveLength(INDEX.exams.length);
    expect(examHrefs).toEqual(model.exams.map((e) => e.id));
    expect(model.exams[0]!.id).toBe(INDEX.exams.at(-1)!.exam_id);
    expect(model.exams.at(-1)!.id).toBe(INDEX.exams[0]!.exam_id);
    const t = INDEX.topics.find((x) => x.topic_id === "technology-14-36")!;
    const row = new RegExp(`data-topic-row="${t.topic_id}"[\\s\\S]*?</tr>`).exec(html)![0];
    expect(textOf(row)).toContain(t.name_jp);
    expect(textOf(row)).toContain(String(t.question_count));
    expect(textOf(row)).toMatch(/★/);
  });
});

describe("TopicPage", () => {
  const TOPIC = "technology-14-36";
  const topicQs = () => QS.filter((q) => q.topic_id === TOPIC);
  const props = () => {
    const t = INDEX.topics.find((x) => x.topic_id === TOPIC)!;
    return {
      locale: "ja",
      isOwner: false,
      topic: { id: TOPIC, category: t.category, name_jp: t.name_jp, path: `${t.major_jp} › ${t.medium_jp}`, stars: topicStars(INDEX)[TOPIC]! },
      questions: topicQs(),
      termCards: {},
      exams: TODAY.exams,
    };
  };

  it("topic page renders ReviewLauncher and question rows", () => {
    state.loaded = true;
    const html = withIntl("ja", h(TopicPage, props()));
    expect(html).toContain('data-testid="review-launcher"');
    const qs = topicQs();
    expect(count(html, /data-question-row="/g)).toBe(qs.length);
    for (const q of qs) expect(html).toContain(`href="/practice/q/${q.id}"`);
    const q0 = qs[0]!;
    const row = new RegExp(`data-question-row="${q0.id}"[\\s\\S]*?</tr>`).exec(html)![0];
    expect(textOf(row)).toContain(`問 ${Number(q0.id.slice(-3))}`);
    expect(textOf(row)).toContain(TODAY.exams[q0.exam_id]!);
    expect(row).toContain('data-result="none"');
    expect(html).toContain(`href="/practice?topic=${TOPIC}&amp;n=10&amp;order=rand"`);
    expect(html).toContain(`href="/practice?topic=${TOPIC}&amp;n=all&amp;order=seq"`);
  });

  it("rows show ○ / × of the latest attempt and the next day once the record is loaded", () => {
    const [a, b] = topicQs();
    const now = Date.now();
    let r = recordAttempt(emptyRecord(), a!.id, a!.correct_answer as never, true, now - 1000);
    const wrong = CHOICE_LETTERS.find((L) => L !== b!.correct_answer)!;
    r = recordAttempt(r, b!.id, wrong, false, now - 1000);
    state.record = r;
    state.loaded = false;
    const before = withIntl("ja", h(TopicPage, props()));
    expect(new RegExp(`data-question-row="${a!.id}"[\\s\\S]*?</tr>`).exec(before)![0]).toContain('data-result=""');
    state.loaded = true;
    const html = withIntl("ja", h(TopicPage, props()));
    const rowA = new RegExp(`data-question-row="${a!.id}"[\\s\\S]*?</tr>`).exec(html)![0];
    const rowB = new RegExp(`data-question-row="${b!.id}"[\\s\\S]*?</tr>`).exec(html)![0];
    expect(rowA).toContain('data-result="right"');
    expect(rowB).toContain('data-result="wrong"');
    const tomorrow = new Date((toLocalDay(now) + 1) * 86_400_000);
    expect(textOf(rowB)).toContain(`${tomorrow.getUTCMonth() + 1}/${tomorrow.getUTCDate()}`);
    expect(html).toContain('data-accuracy="1/2"');
  });
});

describe("SingleQuestion", () => {
  const FIG = "2009h21a-q012";
  const props = () => {
    const q = QS.find((x) => x.id === FIG)!;
    const t = INDEX.topics.find((x) => x.topic_id === q.topic_id)!;
    return {
      q,
      locale: "ja",
      isOwner: false,
      termCards: {},
      stars: topicStars(INDEX)[q.topic_id]!,
      topic: { id: t.topic_id, category: t.category, path: `${t.medium_jp} › ${t.name_jp}` },
    };
  };

  it("never answered: read-only face, the explanation shown anyway, no 'your answer'", () => {
    state.loaded = true;
    const html = withIntl("ja", h(SingleQuestion, props()));
    const q = props().q;
    expect(html).toContain("data-verdicts");
    expect(html).not.toContain("← あなたの答え");
    expect(html).not.toContain("解答すると解説が表示されます");
    expect(html).toMatch(/aria-disabled="true"/);
    expect(html).toContain(`data-letter="${q.correct_answer}" data-state="correct"`);
    expect(html).toContain('data-fid="answer"');
    expect(html).toContain(`href="/practice?ids=${FIG}"`);
    expect(html).toContain("data-history-none");
  });

  it("q page renders history newest first, the face on the latest choice", () => {
    const q = props().q;
    const wrong = CHOICE_LETTERS.find((L) => L !== q.correct_answer)!;
    const base = Date.UTC(2026, 9, 1, 3);
    let r = emptyRecord();
    for (let i = 0; i < 12; i++) {
      const right = i % 3 === 0;
      r = recordAttempt(r, q.id, right ? (q.correct_answer as never) : wrong, right, base + i * 86_400_000);
    }
    // newest (i = 11) is wrong
    state.record = r;
    state.loaded = true;
    const html = withIntl("ja", h(SingleQuestion, props()));
    const ats = [...html.matchAll(/data-history-at="(\d+)"/g)].map((m) => Number(m[1]));
    expect(ats).toHaveLength(10);
    expect(ats).toEqual([...ats].sort((x, y) => y - x));
    expect(ats[0]).toBe(base + 11 * 86_400_000);
    expect(html).toContain(`data-letter="${wrong}" data-state="picked-wrong"`);
    expect(html).toContain("← あなたの答え");
  });
});
