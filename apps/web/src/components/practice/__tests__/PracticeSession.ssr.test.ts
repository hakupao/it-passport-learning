// Stage 7 Phase 1 Task 9 (D-189 §6.2 / D-190 §0-8 / §0-13) — the practice session screen and the
// summary (SSR). Node env, renderToStaticMarkup, real corpus + catalogs: PracticeSession renders
// its first (server) frame — or a given initialState — and SessionView renders any (state, record).
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) =>
    h("a", { href, ...rest }, children),
  useRouter: () => ({ push: () => {} }),
}));

import { SenseiHost } from "@/components/sensei/AskSensei";
import { LearningRecordProvider } from "@/hooks/useLearningRecord";
import { emptyRecord, recordAttempt, setSetting, type ChoiceLetter, type LearningRecord } from "@/lib/learning/record";
import { topicStars, type ChumonGroup } from "@/lib/practice/practiceIndex";
import { loadChumonGroups, loadTodayIndex } from "@/lib/practice/practiceReader";
import {
  applyAction,
  foldPlan,
  loadSession,
  newSession,
  saveSession,
  sessionKey,
  parseScope,
  practiceReducer,
  type SessionAction,
  type SessionState,
} from "@/lib/practice/practiceSession";
import { CHOICE_LETTERS, loadAllQuestions, loadQuizIndex, type QuizQuestion } from "@/lib/quiz/quizReader";

import { PracticeSession, SessionTimer, SessionView, type SessionViewProps } from "../PracticeSession";

// I-2: the 1 s clock lives in SessionTimer only — SessionView (face + explanation) has no time prop,
// so a tick cannot re-render it (compile-time check: tsc fails if one is added back).
const noTimeProps: "now" | "endedAt" extends keyof SessionViewProps ? never : true = true;
void noTimeProps;
import type { SessionTopic } from "../SessionSummary";
import { sourceNumber } from "../choiceLayout";
import { fidOne, messagesFor, textOf } from "./practiceRender";

let QS: QuizQuestion[] = [];
let GROUPS: ChumonGroup[] = [];
let TOPICS: Record<string, SessionTopic> = {};
const byId = (id: string) => QS.find((q) => q.id === id)!;

beforeAll(async () => {
  const [qs, groups, index] = await Promise.all([loadAllQuestions(), loadChumonGroups(), loadQuizIndex()]);
  QS = qs;
  GROUPS = groups;
  const stars = topicStars(index);
  TOPICS = Object.fromEntries(
    index.topics.map((t) => [
      t.topic_id,
      { category: t.category, path: `${t.medium_jp} › ${t.name_jp}`, stars: stars[t.topic_id]! },
    ]),
  );
});

/** three strategy questions without figures, in corpus order */
const three = (): QuizQuestion[] =>
  QS.filter((q) => q.category === "strategy" && !q.figure && q.explanation).slice(0, 3);
const wrongOf = (q: QuizQuestion): ChoiceLetter => CHOICE_LETTERS.find((L) => L !== q.correct_answer)!;
const run = (s: SessionState, ...as: SessionAction[]): SessionState => as.reduce(practiceReducer, s);

function withIntl(locale: string, child: React.ReactElement): string {
  return renderToStaticMarkup(
    h(NextIntlClientProvider, { locale, messages: messagesFor(locale), timeZone: "Asia/Tokyo", children: child }),
  );
}

function renderSession(questions: QuizQuestion[], locale: string, initialState?: SessionState): string {
  return withIntl(
    locale,
    h(LearningRecordProvider, {
      isOwner: false,
      children: h(PracticeSession, {
        questions,
        locale,
        isOwner: false,
        termCards: {},
        topics: TOPICS,
        folds: foldPlan(
          questions.map((q) => q.id),
          GROUPS,
        ),
        from: null,
        today: null,
        initialState,
      }),
    }),
  );
}

function renderView(questions: QuizQuestion[], locale: string, over: Partial<SessionViewProps> = {}): string {
  const props: SessionViewProps = {
    questions,
    locale,
    isOwner: false,
    termCards: {},
    topics: TOPICS,
    folds: foldPlan(
      questions.map((q) => q.id),
      GROUPS,
    ),
    from: null,
    today: null,
    state: newSession(
      questions.map((q) => q.id),
      0,
    ),
    record: emptyRecord(),
    recordLoaded: true,
    kind: null,
    nextHref: null,
    showTranslation: false,
    onToggleTranslation: () => {},
    act: () => {},
    ...over,
  };
  return withIntl(locale, h(SenseiHost, { children: h(SessionView, props) }));
}

describe("PracticeSession — one question per screen", () => {
  it("/practice?ids=a,b,c renders question 1 of 3 and the 3-cell answer card", () => {
    const qs = three();
    const ids = qs.map((q) => q.id);
    const scope = parseScope({ ids: ids.join(",") }, new Set(QS.map((q) => q.id)), new Set(), new Set());
    expect(scope).toEqual({ kind: "ids", ids });
    const out = renderSession(qs, "ja");
    expect(out).toContain('data-progress="1/3"');
    expect(out).toContain("全 3 問中 1 問目");
    expect(out).toContain(`<article id="${ids[0]}"`);
    expect(out).not.toContain(`<article id="${ids[1]}"`);
    const card = /<ol[^>]*data-answer-card=""[^>]*>([\s\S]*?)<\/ol>/.exec(out)![1]!;
    expect(card.match(/<li /g)).toHaveLength(3);
    expect(card).toMatch(/<li[^>]*data-cell="none"[^>]*data-current="true"/);
    // unanswered: no 解答栏 (it shows the key), an empty status line, the explanation placeholder
    expect(fidOne(out, "answer")).toBeNull();
    expect(out).toMatch(/<p[^>]*role="status"[^>]*data-status=""[^>]*><\/p>/);
    expect(out).toContain("解答すると解説が表示されます");
    // prev is disabled on the first question; next says 次の問題
    expect(out).toMatch(/<button[^>]*disabled=""[^>]*data-nav="prev"/);
    expect(out).toMatch(/data-nav="next"[^>]*>次の問題 →</);
  });

  it("a 結束 button is present (finish → summary of answered part)", () => {
    const qs = three();
    const ids = qs.map((q) => q.id);
    for (const [locale, label] of [
      ["ja", "終了"],
      ["zh", "结束"],
      ["en", "End"],
    ] as const) {
      expect(renderSession(qs, locale)).toMatch(new RegExp(`<button[^>]*data-finish=""[^>]*>${label}</button>`));
    }
    const s = run(
      newSession(ids, 0),
      { type: "pick", choice: qs[0]!.correct_answer as ChoiceLetter },
      { type: "finish" },
    );
    const out = renderSession(qs, "zh", s);
    expect(out).toContain("data-summary");
    expect(out).toContain('data-score="1/1"');
    expect(out).toContain("答对 1 / 1 题");
    expect(out).toContain("共 3 题，已答 1 题");
    expect(out).toContain("本组没有错题");
  });

  it("after a wrong pick: 解答栏「解答 問N [正解]」+ 状态句「已记入错题本，明天再出」", () => {
    const qs = three();
    const q = qs[0]!;
    const s = run(
      newSession(
        qs.map((x) => x.id),
        0,
      ),
      { type: "pick", choice: wrongOf(q) },
    );
    const out = renderSession(qs, "zh", s);
    expect(out).toMatch(/<span[^>]*lang="ja"[^>]*>解答<\/span>/);
    expect(out).toMatch(new RegExp(`問${sourceNumber(q)}<span[^>]*data-fid="answer"[^>]*>${q.correct_answer}</span>`));
    // the provider's first frame has not loaded the record yet: the status line waits (M-8) …
    expect(out).toMatch(/<p[^>]*role="status"[^>]*data-status=""[^>]*><\/p>/);
    // … and once it is loaded it says where the question went
    expect(renderView(qs, "zh", { state: s })).toMatch(
      /<p[^>]*role="status"[^>]*data-status="wrong"[^>]*>已记入错题本，明天再出<\/p>/,
    );
    // the answer card marks the first cell ×, the explanation is open, the choice is stamped
    expect(out).toMatch(/<li[^>]*data-cell="wrong"[^>]*data-current="true"[^>]*><span aria-hidden="true">×<\/span>/);
    expect(out).toContain("data-verdicts");
    expect(out).toMatch(new RegExp(`<li data-letter="${wrongOf(q)}" data-state="picked-wrong"`));
    for (const [locale, text] of [
      ["ja", "間違えた問題に入りました。明日もう一度出ます"],
      ["en", "Added to your mistakes — it comes back tomorrow"],
    ] as const) {
      expect(renderView(qs, locale, { state: s })).toContain(text);
    }
  });

  it("right answers: first ever → 7 days; later → next due (plural); mastered", () => {
    const qs = three();
    const q = qs[0]!;
    const state = run(
      newSession(
        qs.map((x) => x.id),
        0,
      ),
      { type: "pick", choice: q.correct_answer as ChoiceLetter },
    );
    const now = Date.now();
    const first = recordAttempt(emptyRecord(), q.id, q.correct_answer as ChoiceLetter, true, now);
    expect(renderView(qs, "zh", { state, record: first })).toContain("答对了，7 天后再确认");
    expect(renderView(qs, "en", { state, record: first })).toContain("Correct — you&#x27;ll see it again in 7 days");
    expect(renderView(qs, "ja", { state, record: first })).toContain("正解。次は 7 日後に確認します");
    // wrong 2 days ago, right now → box 1 → 3 days
    let again = recordAttempt(emptyRecord(), q.id, wrongOf(q), false, now - 2 * 86_400_000);
    again = recordAttempt(again, q.id, q.correct_answer as ChoiceLetter, true, now);
    expect(renderView(qs, "en", { state, record: again })).toContain("Next in 3 days");
    expect(renderView(qs, "zh", { state, record: again })).toContain("3 天后再出");
    expect(renderView(qs, "ja", { state, record: again })).toContain("次は 3 日後");
  });

  it("translation default follows settings.transDefault", () => {
    const qs = three();
    // the provider's first frame is the empty record → hidden
    const plain = renderSession(qs, "zh");
    expect(fidOne(plain, "stem-tr")).toBeNull();
    expect(plain).toMatch(/aria-pressed="false" data-translation-toggle=""/);
    // the session passes showTranslation = settingValue(record, "transDefault") === "shown"
    const shown = setSetting(emptyRecord(), "transDefault", "shown", 1);
    expect(renderView(qs, "zh", { record: shown, showTranslation: true })).toMatch(/data-fid="stem-tr"/);
    expect(renderView(qs, "zh", { record: shown, showTranslation: true })).toMatch(
      /aria-pressed="true" data-translation-toggle=""/,
    );
  });

  it("top bar shows 分野 tag + topic path + 1/3 + timer", () => {
    const qs = three();
    const topic = TOPICS[qs[0]!.topic_id]!;
    for (const locale of ["ja", "zh", "en"]) {
      const out = renderSession(qs, locale);
      expect(out).toMatch(/<span[^>]*lang="ja">ストラテジ系<\/span>/);
      expect(out).toContain(`lang="ja">${topic.path.replace(/&/g, "&amp;")}</span>`);
      expect(out).toMatch(/<span aria-hidden="true"><strong>1<\/strong> \/ 3<\/span>/);
      expect(out).toMatch(/<span[^>]*role="timer"[^>]*data-timer=""[^>]*>00:00<\/span>/);
    }
    // from=today: the task kind in front of pos / total
    const today = renderView(qs, "zh", { from: { kind: "today" }, kind: "mistakes" });
    expect(textOf(/<span aria-hidden="true">([\s\S]*?)<\/span><\/span>/.exec(today)![0])).toBe("错题　1 / 3");
    expect(renderView(qs, "ja", { from: { kind: "today" }, kind: "due" })).toContain("今日の復習　");
    expect(renderView(qs, "en", { from: { kind: "today" }, kind: "fresh" })).toContain("New questions　");
    // the timer counts from startedAt (mm:ss), frozen at endedAt; 00:00 before mount
    expect(withIntl("ja", h(SessionTimer, { startedAt: 1000, endedAt: 1000 + 522_000 }))).toContain(">08:42<");
    expect(withIntl("ja", h(SessionTimer, { startedAt: 1000, endedAt: null }))).toContain(">00:00<");
  });

  it("from=today with kind= in the URL: the first frame already names the task (no inference needed)", () => {
    const qs = three();
    const render = (kindParam: "mistakes" | "due" | "fresh" | null) =>
      withIntl(
        "zh",
        h(LearningRecordProvider, {
          isOwner: false,
          children: h(PracticeSession, {
            questions: qs,
            locale: "zh",
            isOwner: false,
            termCards: {},
            topics: TOPICS,
            folds: {},
            from: { kind: "today" },
            today: null,
            kindParam,
          }),
        }),
      );
    expect(render("mistakes")).toContain("错题　<strong>1</strong>");
    expect(render("due")).toContain("到期复习　<strong>1</strong>");
    // without the param the label waits for the record (inference runs in an effect)
    expect(render(null)).not.toMatch(/(错题|到期复习|新题)　<strong>/);
  });

  it("中問: the 2nd member folds the shared preamble, the 1st shows the full stem", () => {
    const g = GROUPS.find((x) => x.preambleChars.jp !== null)!;
    const members = g.memberIds.map(byId);
    const ids = members.map((q) => q.id);
    const at0 = renderSession(members, "ja", newSession(ids, 0));
    expect(at0).not.toContain("共通前文 ▸");
    expect(textOf(fidOne(at0, "stem")!.inner)).toBe(textOf(fidOne(renderSession([members[0]!], "ja"), "stem")!.inner));
    const at1 = renderSession(members, "ja", run(newSession(ids, 0), { type: "next" }));
    expect(at1).toMatch(/<details[^>]*><summary lang="ja">共通前文 ▸<\/summary><div[^>]*data-fid="stem-preamble"/);
    const pre = textOf(fidOne(at1, "stem-preamble")!.inner);
    const rest = textOf(fidOne(at1, "stem")!.inner);
    expect(pre.length).toBeGreaterThan(0);
    expect(rest.length).toBeGreaterThan(0);
  });
});

describe("SessionSummary", () => {
  it("finished → summary with score and wrong list", () => {
    const qs = three();
    const ids = qs.map((q) => q.id);
    const s = run(
      newSession(ids, 0),
      { type: "pick", choice: qs[0]!.correct_answer as ChoiceLetter },
      { type: "next" },
      { type: "pick", choice: wrongOf(qs[1]!) },
      { type: "next" },
      { type: "pick", choice: wrongOf(qs[2]!) },
      { type: "next" },
    );
    expect(s.finished).toBe(true);
    const out = renderView(qs, "ja", { state: { ...s, endedAt: 125_000 } });
    expect(out).toContain('data-score="1/3"');
    expect(out).toContain("1 / 3 問正解");
    expect(out).not.toContain("問を解答"); // all answered: no partial line
    expect(out).toContain(">02:05<");
    for (const q of [qs[1]!, qs[2]!]) {
      const row = new RegExp(`<li[^>]*data-wrong="${q.id}"[^>]*>([\\s\\S]*?)</li>`).exec(out)![1]!;
      expect(row).toContain(`href="/practice/q/${q.id}"`);
      expect(row).toContain(q.source_label);
      expect(row).toContain(`>${wrongOf(q)}</span>`);
      expect(row).toContain(`>${q.correct_answer}</span>`);
      expect(row).toContain('<span lang="ja">正解</span>');
    }
    expect(out).not.toContain(`data-wrong="${qs[0]!.id}"`);
    expect(out).toContain(`href="/practice?ids=${qs[1]!.id},${qs[2]!.id}&amp;run=125000"`);
    expect(out).toContain('href="/"');
    expect(out).toContain("間違えた問題だけもう一度");
    expect(out).toContain("今日に戻る");
    // 「继续下一项」 only for from=today
    expect(out).not.toContain('data-action="continue"');
    const next = `/practice?ids=${qs[0]!.id}&from=today`;
    const today = renderView(qs, "zh", { state: s, from: { kind: "today" }, nextHref: next });
    expect(today).toContain(`href="${next.replace("&", "&amp;")}" class=`);
    expect(today).toMatch(/data-action="continue"[^>]*>继续下一项</);
    expect(today).toContain("只做错题再来一遍");
    expect(today).toContain("回今日");
    expect(renderView(qs, "en", { state: s, from: { kind: "today" }, nextHref: "/" })).toMatch(
      /href="\/"[^>]*>Continue to the next task</,
    );
  });

  it("from=unit: 「単元に戻る」 is the primary action → /textbook/<id>#confirm; the retry keeps from=unit&unit=", () => {
    const qs = three();
    const s = {
      ...run(
        newSession(
          qs.map((q) => q.id),
          0,
        ),
        { type: "pick", choice: qs[0]!.correct_answer as ChoiceLetter },
        { type: "next" },
        { type: "pick", choice: wrongOf(qs[1]!) },
        { type: "finish" },
      ),
      endedAt: 5000,
    };
    const unit = { kind: "unit" as const, unitId: "management-08-25-u01", title: "要件定義と設計", terms: [] };
    const out = renderView(qs, "ja", { state: s, from: unit });
    expect(out).toMatch(/<a href="\/textbook\/management-08-25-u01#confirm" class="[^"]*" data-action="unit">単元に戻る<\/a>/);
    expect(out).toContain(`href="/practice?ids=${qs[1]!.id}&amp;from=unit&amp;unit=management-08-25-u01&amp;run=5000"`);
    expect(out).not.toContain('data-action="continue"');
    expect(renderView(qs, "en", { state: s, from: unit })).toMatch(/data-action="unit">Back to the unit</);
    // not from a unit: no 「単元に戻る」
    expect(renderView(qs, "ja", { state: s })).not.toContain('data-action="unit"');
  });

  it("from=unit, a wrong answer: 「単元に戻る：<title>」 under the explanation; a right one: none", () => {
    const qs = three();
    const q = qs[0]!;
    const unit = {
      kind: "unit" as const,
      unitId: "management-08-25-u01",
      title: "要件定義と設計",
      terms: q.terms.length > 0 ? [{ id: "tshared", term: q.terms[0]! }] : [],
    };
    const ids = qs.map((x) => x.id);
    const wrong = run(newSession(ids, 0), { type: "pick", choice: wrongOf(q) });
    const out = renderView(qs, "ja", { state: wrong, from: unit });
    const anchor = q.terms.length > 0 ? "#tshared" : "";
    expect(out).toContain(`href="/textbook/management-08-25-u01${anchor}"`);
    expect(out).toContain("単元に戻る：要件定義と設計");
    const right = run(newSession(ids, 0), { type: "pick", choice: q.correct_answer as ChoiceLetter });
    expect(renderView(qs, "ja", { state: right, from: unit })).not.toContain("data-unit-back");
    expect(renderView(qs, "ja", { state: wrong })).not.toContain("data-unit-back");
  });

  it("nothing answered: no score, no retry", () => {
    const qs = three();
    const s = run(
      newSession(
        qs.map((q) => q.id),
        0,
      ),
      { type: "finish" },
    );
    const out = renderView(qs, "en", { state: s });
    expect(out).toContain("Nothing answered in this set");
    expect(out).toContain("0 of 3 answered");
    expect(out).not.toContain('data-action="retry"');
  });
});

describe("record wiring", () => {
  it("复习三格 shows the history before this group's answer", () => {
    const qs = three();
    const q = qs[0]!;
    const now = Date.now();
    let r: LearningRecord = emptyRecord();
    r = recordAttempt(r, q.id, wrongOf(q), false, now - 5 * 86_400_000);
    r = recordAttempt(r, q.id, q.correct_answer as ChoiceLetter, true, now);
    const ids = qs.map((x) => x.id);
    const before = renderView(qs, "ja", { record: r });
    expect(before).toMatch(/data-recent="right"[\s\S]*?data-recent="wrong"/);
    const after = renderView(qs, "ja", {
      record: r,
      state: run(newSession(ids, 0), { type: "pick", choice: q.correct_answer as ChoiceLetter }),
    });
    expect(after).toMatch(/<span[^>]*data-recent="wrong"[^>]*>×<\/span><span[^>]*data-recent="none"/);
  });
});

describe("fix round 1: reload on the summary, start over, run nonce, status after load", () => {
  const finishedState = (qs: QuizQuestion[]): SessionState => {
    const ids = qs.map((q) => q.id);
    let st = newSession(ids, 10_000);
    st = applyAction(st, { type: "pick", choice: wrongOf(qs[0]!) }, KEY(qs), 20_000).next;
    return applyAction(st, { type: "finish" }, KEY(qs), 70_000).next;
  };
  const KEY = (qs: QuizQuestion[]) => new Map(qs.map((q) => [q.id, q.correct_answer]));

  it("finished session survives reload (summary + frozen elapsed)", () => {
    const qs = three();
    const stored = new Map<string, string>();
    const storage = {
      getItem: (k: string) => stored.get(k) ?? null,
      setItem: (k: string, v: string) => void stored.set(k, v),
      removeItem: (k: string) => void stored.delete(k),
    };
    const ended = finishedState(qs);
    saveSession(storage, ended);
    // what the mount effect restores, rendered: the summary with 01:00 however late the reload is
    const restored = loadSession(storage, ended.ids, 10_000_000);
    const out = renderSession(qs, "ja", restored);
    expect(out).toContain("data-summary");
    expect(out).toContain('data-score="0/1"');
    expect(out).toContain(">01:00<");
    expect(out).toMatch(/<h1 id="practice-summary"[^>]*tabindex="-1"/);
  });

  it("start over: the summary offers it; retry link with run nonce gets a fresh session", () => {
    const qs = three();
    const ended = finishedState(qs);
    const out = renderSession(qs, "zh", ended);
    expect(out).toMatch(/<button[^>]*data-action="restart"[^>]*>再做一遍<\/button>/);
    expect(renderSession(qs, "ja", ended)).toContain(">もう一度</button>");
    expect(renderSession(qs, "en", ended)).toContain(">Start over</button>");
    // the retry link carries &run=<endedAt>: same ids, another storage key → a new group
    expect(out).toContain(`href="/practice?ids=${qs[0]!.id}&amp;run=70000"`);
    expect(sessionKey([qs[0]!.id], "70000")).not.toBe(sessionKey([qs[0]!.id]));
  });

  it("final fix 1: the summary's continue link waits for the learning record to load", async () => {
    const qs = three();
    const today = await loadTodayIndex("ja");
    // the server frame: the record is not loaded (owner GET pending / fresh reload) → no continue link
    const out = withIntl(
      "ja",
      h(LearningRecordProvider, {
        isOwner: false,
        children: h(PracticeSession, {
          questions: qs,
          locale: "ja",
          isOwner: false,
          termCards: {},
          topics: TOPICS,
          folds: {},
          from: { kind: "today" },
          today,
          initialState: finishedState(qs),
        }),
      }),
    );
    expect(out).toContain("data-summary");
    expect(out).not.toContain('data-action="continue"');
  });

  it("the status line waits for the learning record to load", () => {
    const qs = three();
    const state = run(
      newSession(
        qs.map((x) => x.id),
        0,
      ),
      { type: "pick", choice: wrongOf(qs[0]!) },
    );
    expect(renderView(qs, "zh", { state, recordLoaded: false })).toMatch(/data-status=""[^>]*><\/p>/);
    expect(renderView(qs, "zh", { state, recordLoaded: true })).toContain("已记入错题本，明天再出");
  });
});
