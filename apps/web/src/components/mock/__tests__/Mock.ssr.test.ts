// Stage 7 Phase 2 Task 4 (DESIGN §6.7 / D-192 / D-193 §0-5〜§0-8) — the mock exam's views (SSR) and
// the record step the exam page runs at the finish.
//
//   - MockResult: total / three areas out of 1000, 合格 / 不合格, the 正誤一覧 (every row links to
//     /practice/q/<id>, unanswered rows say 未回答); right / wrong by glyph + text, never colour.
//   - MockReview: the 回答見直し grid — answered (reversed number), unanswered (hollow), flagged (▲).
//   - mockRecordPlan (R1: renderToStaticMarkup fires no click / effect, so MockRun's finish →
//     answerBatch path is pinned on the pure helper it calls): only answered questions
//     (Review Focus 4: nothing recorded for unanswered), at === endedAt; a recorded state → null,
//     so a re-render never writes again (Review Focus 2). src "mock" is fixed by answerBatch's type
//     and asserted on the stored record in e2e/mock.spec.ts.
import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) =>
    h("a", { href, className }, children),
  useRouter: () => ({ push: () => {} }),
}));
vi.mock("@/hooks/useLearningRecord", () => ({
  useLearningRecord: () => ({
    record: { attempts: {}, unitsRead: {}, settings: {} },
    loaded: true,
    answer: () => {},
    answerBatch: () => {
      throw new Error("answerBatch must not be called while rendering");
    },
    readUnit: () => {},
    setSetting: () => {},
  }),
}));

import type { ChoiceLetter } from "@/lib/learning/record";
import { examMockIds, scoreMock, type MockCategory } from "@/lib/mock/mockModel";
import { mockReducer, mockRecordPlan, newMock, type MockState } from "@/lib/mock/mockStore";
import { loadBaseQuestions, type QuizQuestion } from "@/lib/quiz/quizReader";

import { MockResult } from "../MockResult";
import { owesRecord } from "../MockRun";
import { MockReview } from "../MockReview";

type Messages = Record<string, Record<string, string>>;
const messagesFor = (locale: string): Messages =>
  JSON.parse(readFileSync(path.resolve(__dirname, `../../../../messages/${locale}.json`), "utf-8")) as Messages;
const render = (locale: string, el: React.ReactElement): string =>
  renderToStaticMarkup(h(NextIntlClientProvider, { locale, messages: messagesFor(locale), timeZone: "Asia/Tokyo", children: el }));

const EXAM = "2025r07";
let QS: QuizQuestion[] = [];
let IDS: string[] = [];
let KEY = new Map<string, { correct: ChoiceLetter; category: MockCategory }>();
beforeAll(async () => {
  const base = await loadBaseQuestions();
  IDS = examMockIds(EXAM, base);
  const byId = new Map(base.map((q) => [q.id, q]));
  QS = IDS.map((id) => byId.get(id)!);
  KEY = new Map(QS.map((q) => [q.id, { correct: q.correct_answer as ChoiceLetter, category: q.category as MockCategory }]));
});

const wrongOf = (c: string): ChoiceLetter => (c === "ア" ? "イ" : "ア");
const rowOf = (html: string, id: string): string => {
  const m = new RegExp(`<li[^>]*data-result-row="${id}"[^>]*>[\\s\\S]*?</li>`).exec(html);
  if (!m) throw new Error(`no row ${id}`);
  return m[0];
};

describe("MockResult", () => {
  it("total, three areas, 不合格, the 正誤一覧 linking to /practice/q/<id>, 未回答 rows", () => {
    const [q1, q2, q3] = QS;
    const answers: Record<string, ChoiceLetter> = {
      [q1!.id]: q1!.correct_answer as ChoiceLetter,
      [q2!.id]: wrongOf(q2!.correct_answer),
    };
    const score = scoreMock(IDS, answers, KEY);
    for (const locale of ["ja", "zh", "en"]) {
      const M = messagesFor(locale).Mock!;
      const out = render(locale, h(MockResult, { ids: IDS, answers, questions: QS, score, elapsedMs: 65 * 60_000 }));
      expect(out).toMatch(new RegExp(`data-total="${score.total}"`));
      for (const a of ["strategy", "management", "technology"] as const) {
        expect(out).toMatch(new RegExp(`data-area="${a}"[^>]*data-score="${score.areas[a]}"`));
      }
      expect(score.passed).toBe(false);
      expect(out).toContain(M.failed);
      expect(out).not.toContain(M.passed);
      expect(out.match(/data-result-row="/g)).toHaveLength(IDS.length);
      for (const id of IDS) expect(rowOf(out, id)).toContain(`href="/practice/q/${id}"`);
      expect(rowOf(out, q1!.id)).toMatch(/data-result="right"/);
      expect(rowOf(out, q1!.id)).toContain(M.right);
      expect(rowOf(out, q2!.id)).toMatch(/data-result="wrong"/);
      expect(rowOf(out, q2!.id)).toContain(M.wrong);
      expect(rowOf(out, q3!.id)).toMatch(/data-result="none"/);
      expect(rowOf(out, q3!.id)).toContain(M.unanswered);
    }
  });

  it("all correct → 1000 and 合格; all blank → 0 and 不合格 (Review Focus 4)", () => {
    const all = Object.fromEntries(QS.map((q) => [q.id, q.correct_answer as ChoiceLetter]));
    const M = messagesFor("ja").Mock!;
    const pass = render("ja", h(MockResult, { ids: IDS, answers: all, questions: QS, score: scoreMock(IDS, all, KEY), elapsedMs: 0 }));
    expect(pass).toMatch(/data-total="1000"/);
    expect(pass).toContain(M.passed);
    const blank = render("ja", h(MockResult, { ids: IDS, answers: {}, questions: QS, score: scoreMock(IDS, {}, KEY), elapsedMs: 0 }));
    expect(blank).toMatch(/data-total="0"/);
    expect(blank).toContain(M.failed);
    expect(blank.match(/data-result="none"/g)).toHaveLength(IDS.length);
  });

  it("mock.module.css: tokens only — no hex, no shadow, no gradient, radius ≤ 6px", () => {
    const css = readFileSync(path.resolve(__dirname, "../mock.module.css"), "utf-8").replace(/\/\*[\s\S]*?\*\//g, "");
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(css).not.toMatch(/box-shadow|gradient|\b(?:red|green|lime|crimson)\b/i);
    for (const m of css.matchAll(/border-radius:\s*([^;]+);/g)) {
      for (const v of m[1]!.split(/\s+/)) expect(parseFloat(v), m[0]).toBeLessThanOrEqual(6);
    }
    // 回答見直し: 10 columns, 5 at ≤ 560px (§0-8)
    expect(css).toMatch(/\.grid\s*\{[^}]*grid-template-columns:\s*repeat\(10,/);
    expect(css).toMatch(/@media \(max-width: 560px\)\s*\{[^@]*\.grid\s*\{[^}]*grid-template-columns:\s*repeat\(5,/);
  });
});

describe("MockReview", () => {
  it("answered / unanswered / flagged glyphs, counts, every cell a button", () => {
    const ids = IDS.slice(0, 10);
    const answers: Record<string, ChoiceLetter> = { [ids[0]!]: "ア", [ids[1]!]: "イ" };
    const flagged = [ids[1]!, ids[4]!];
    for (const locale of ["ja", "zh", "en"]) {
      const out = render(locale, h(MockReview, { ids, answers, flagged, pos: 4, onGo: () => {} }));
      expect(out.match(/<button[^>]*data-cell="/g)).toHaveLength(10);
      expect(out).toMatch(/data-cell="1"[^>]*data-answered="true"[^>]*data-flagged="false"/);
      expect(out).toMatch(/data-cell="2"[^>]*data-answered="true"[^>]*data-flagged="true"/);
      expect(out).toMatch(/data-cell="5"[^>]*data-answered="false"[^>]*data-flagged="true"/);
      expect(out).toMatch(/data-cell="3"[^>]*data-answered="false"[^>]*data-flagged="false"/);
      expect(out).toMatch(/data-cell="5"[^>]*aria-current="true"/);
      const grid = /<ol[^>]*data-review-grid[\s\S]*<\/ol>/.exec(out)![0];
      expect(grid.match(/▲/g)).toHaveLength(2);
      expect(out).toMatch(/data-count-answered="2"/);
      expect(out).toMatch(/data-count-unanswered="8"/);
      expect(out).toMatch(/data-count-flagged="2"/);
      expect(out).not.toMatch(/[○×]/);
    }
  });
});

describe("mockRecordPlan (the finish → answerBatch step)", () => {
  const T0 = 1_700_000_000_000;
  const started = (): MockState => newMock("exam", EXAM, IDS, T0);
  const pick = (s: MockState, qid: string, choice: ChoiceLetter): MockState => mockReducer(s, { type: "pick", qid, choice });

  it("null while the mock runs", () => {
    expect(mockRecordPlan(started(), KEY)).toBeNull();
  });

  it("nothing recorded for unanswered: only answered ids, correctness from the key, at === endedAt", () => {
    const [q1, q2] = QS;
    let s = pick(started(), q1!.id, q1!.correct_answer as ChoiceLetter);
    s = pick(s, q2!.id, wrongOf(q2!.correct_answer));
    s = mockReducer(s, { type: "finish", now: T0 + 30 * 60_000 });
    const plan = mockRecordPlan(s, KEY)!;
    expect(plan.at).toBe(s.endedAt);
    expect(plan.at).toBe(T0 + 30 * 60_000);
    expect(plan.items).toEqual([
      [q1!.id, q1!.correct_answer, true],
      [q2!.id, wrongOf(q2!.correct_answer), false],
    ]);
  });

  it("expired: at is the deadline, not the moment of return", () => {
    const s = mockReducer(pick(started(), IDS[0]!, "ア"), { type: "tick", now: T0 + 5 * 3_600_000 });
    expect(mockRecordPlan(s, KEY)!.at).toBe(T0 + 120 * 60_000);
  });

  it("all blank → an empty plan (answerBatch is skipped)", () => {
    const s = mockReducer(started(), { type: "finish", now: T0 + 1000 });
    expect(mockRecordPlan(s, KEY)).toEqual({ items: [], at: T0 + 1000 });
  });

  it("recorded === true → null: a re-render or a second finish never writes again", () => {
    let s = mockReducer(pick(started(), IDS[0]!, "ア"), { type: "finish", now: T0 + 1000 });
    s = mockReducer(s, { type: "recorded" });
    expect(mockRecordPlan(s, KEY)).toBeNull();
    expect(mockRecordPlan(mockReducer(s, { type: "finish", now: T0 + 2000 }), KEY)).toBeNull();
  });
});

// fix round 1 (D-192 ①): a stored mock that still owes its answers to the record — the setup page
// offers only 「結果を見る」 for it, and the exam page opens it before starting another mock.
describe("owesRecord", () => {
  const T0 = 1_700_000_000_000;
  const MS = 120 * 60_000;
  it("running in time: no; running past the deadline / finished unrecorded: yes; recorded: no", () => {
    const s = newMock("exam", EXAM, ["a", "b"], T0);
    expect(owesRecord(s, T0 + MS - 1)).toBe(false);
    expect(owesRecord(s, T0 + MS)).toBe(true);
    const ended = mockReducer(s, { type: "finish", now: T0 + 1000 });
    expect(owesRecord(ended, T0 + 2000)).toBe(true);
    expect(owesRecord(mockReducer(ended, { type: "recorded" }), T0 + 2000)).toBe(false);
  });
});
