// Stage 7 Phase 2 Task 4 (DESIGN §6.7 / D-192 ①② / D-193 §0-4 / §0-6〜§0-8) — the timed mock exam
// and, once it ends, its result (same URL).
//
//   - State: MockState in localStorage MOCK_STORAGE_KEY (mockStore). The first render (server and
//     client) is a loading line (data-pending, no storage read in render: no hydration mismatch).
//     On mount the stored mock is resumed when it is this URL's mock (sameMock) — after a tick at
//     Date.now(), so a mock that ran out while the tab was closed ends at its deadline — otherwise a
//     new one starts and replaces it (one mock at a time, §0-4).
//   - Writes: only local actions write storage (commit), never an effect on [state] — a state
//     adopted from another tab is not echoed back. A finished state is sticky: when storage already
//     holds this mock finished — and this tab's state was still running, or the stored one is
//     recorded — a local change (a pick, this tab's own finish or deadline tick) adopts the stored
//     state instead of writing (fix round 1: a tab that missed the other tab's storage event must
//     not overwrite its finished + recorded state with an unrecorded one and record again).
//   - Mount with another mock in storage that still owes the record (owesRecord): go to that mock's
//     URL first (it is recorded there, D-192 ①) instead of overwriting it — unless that URL is this
//     page (same scope, but the ids it now resolves to differ, e.g. after a data update): then the
//     save cannot be opened, and an in-page notice offers 「記録せずに破棄」 behind a confirmation
//     (MockDiscard; fix round 2: never redirect to itself, never loop).
//   - Mount with another mock in storage that is still running in time (final fix I-2): never
//     overwritten silently (back button, session restore, a bookmark) — an in-page notice
//     (data-busy) links back to it (its own run URL) and offers 「記録せずに破棄」 behind the
//     MockDiscard confirmation, which then starts this page's mock.
//   - Every discard confirmation re-reads storage at the click: when it no longer holds the save
//     the notice was built for in the same state (owed / running) — another tab started or ended
//     a mock meanwhile — the page re-runs the mount decision on what is there instead of removing.
//   - Timer: derived from startedAt and the real clock (remainingMs), never a counter. The tick
//     (1 s) is a no-op until the deadline, then the reducer's finish (endedAt = deadline).
//   - Recording (§0-6, dispatch rulings R1 / R4): one effect, gated on the learning record being
//     loaded, calls mockRecordPlan and, for a plan, re-reads storage first (another tab already
//     recorded → adopt that state), then answerBatch(answered items, endedAt, "mock") — skipped for
//     an empty plan — and only then the `recorded` action, written to storage. A tab records only a
//     finish it produced itself (own: its finish / tick, or what it found on mount); a finished
//     state adopted from another tab's storage event is that tab's to record. So with two tabs, the
//     finishing tab writes the batch once and the other just shows the result.
//   - Other tabs (storage event): the same mock → adopt (except over our own finished state, which
//     is written back; and a finished + recorded result is never replaced). Another mock or the key
//     removed (the setup page's 「破棄」 or a new mock) → this tab stops with a note (superseded).
//   - Exam view (§0-7 / §0-8): PracticeQuestion mode="exam" (no ○ / ×, no explanation, no AI 先生,
//     no report); top bar = time left (bold from 10 min), 回答見直し, 試験終了; bottom bar = prev,
//     あとで見直す, next (on the last question: the review). 試験終了 opens an in-page confirmation
//     with 未回答 N 問 (no modal, no confirm()).
//   - Result: MockResult (score over every question of the mock: the page guarantees one question
//     per id, R3).

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { PracticeQuestion } from "@/components/practice/PracticeQuestion";
import { useLearningRecord } from "@/hooks/useLearningRecord";
import { Link, useRouter } from "@/i18n/navigation";
import { settingValue, type ChoiceLetter } from "@/lib/learning/record";
import { remainingMs, scoreMock, type MockCategory } from "@/lib/mock/mockModel";
import { mockRunHref, scopeOfMock } from "@/lib/mock/mockScope";
import {
  MOCK_STORAGE_KEY,
  mockRecordPlan,
  mockReducer,
  newMock,
  owesRecord,
  parseMock,
  sameMock,
  sameSave,
  serializeMock,
  type MockAction,
  type MockState,
} from "@/lib/mock/mockStore";
import type { Stars } from "@/lib/practice/practiceIndex";
import { formatElapsed } from "@/lib/practice/practiceSession";
import type { QuizQuestion } from "@/lib/quiz/quizModel";

import { MOCK_RESULT_HEADING_ID, MockResult } from "./MockResult";
import { MockDiscard } from "./MockDiscard";
import { MockReview } from "./MockReview";
import styles from "./mock.module.css";

export interface MockRunProps {
  kind: MockState["kind"];
  examId: string | null;
  /** the exam's label (kind "exam"), else null */
  examLabel: string | null;
  /** one question per id of the mock, in mock order (translations merged, no explanations) */
  questions: QuizQuestion[];
  locale: string;
  /** qid → JP fold point (foldPlan) */
  folds: Record<string, number>;
  /** topicId → 頻出度 */
  stars: Record<string, Stars>;
}

const LOW_MS = 10 * 60_000;

function readStored(): MockState | null {
  try {
    return parseMock(window.localStorage.getItem(MOCK_STORAGE_KEY));
  } catch {
    return null;
  }
}

function writeStored(s: MockState): void {
  try {
    window.localStorage.setItem(MOCK_STORAGE_KEY, serializeMock(s));
  } catch {
    // storage unavailable: the mock runs in memory only
  }
}

/** mm:ss left (rounded up: 120:00 at the start, 00:00 at the deadline). */
const formatLeft = (ms: number): string => formatElapsed(Math.ceil(ms / 1000) * 1000);

/** Time left, its own 1 s clock (only this span re-renders per second). */
function MockTimer({ startedAt }: { startedAt: number }): React.ReactElement {
  const t = useTranslations("Mock");
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const left = remainingMs(startedAt, now);
  return (
    <span className={styles.timer} data-low={left <= LOW_MS ? "true" : "false"}>
      <span className={styles.timerLabel}>{t("timeLeft")}</span>
      <span role="timer" aria-label={t("timeLeft")} data-timer="">
        {formatLeft(left)}
      </span>
    </span>
  );
}

export function MockRun({ kind, examId, examLabel, questions, locale, folds, stars }: MockRunProps): React.ReactElement {
  const t = useTranslations("Mock");
  const router = useRouter();
  const { record, loaded, answerBatch } = useLearningRecord();
  const ids = useMemo(() => questions.map((q) => q.id), [questions]);
  const keyOf = useMemo(
    () =>
      new Map(
        questions.map((q) => [q.id, { correct: q.correct_answer as ChoiceLetter, category: q.category as MockCategory }]),
      ),
    [questions],
  );

  const [state, setState] = useState<MockState | null>(null);
  const stateRef = useRef<MockState | null>(null);
  /** the finish of the current state was produced in this tab (it records it) */
  const own = useRef(false);
  const [superseded, setSuperseded] = useState(false);
  /** a stored mock owes its record but resolves to this very URL with other ids (cannot be opened) */
  const [unopenable, setUnopenable] = useState<MockState | null>(null);
  /** another mock is stored and still running in time: not overwritten without a confirmed discard */
  const [busy, setBusy] = useState<MockState | null>(null);
  const supersededRef = useRef(false);
  const [reviewing, setReviewing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [trOverride, setTrOverride] = useState<boolean | null>(null);
  /** the result was on screen already (the finish moves the focus to its heading once) */
  const shownEnded = useRef(false);

  const isThisMock = useCallback((s: MockState) => sameMock(s, kind, examId, ids), [kind, examId, ids]);

  const show = useCallback((s: MockState) => {
    stateRef.current = s;
    setState(s);
  }, []);

  /** A local change prev → next: written to storage, unless another tab already ended this mock there. */
  const commit = useCallback(
    (prev: MockState, next: MockState) => {
      const stored = readStored();
      if (
        stored &&
        isThisMock(stored) &&
        stored.endedAt !== null &&
        (prev.endedAt === null || (stored.recorded && !next.recorded))
      ) {
        own.current = false;
        show(stored);
        return;
      }
      writeStored(next);
      show(next);
    },
    [isThisMock, show],
  );

  const act = useCallback(
    (a: MockAction) => {
      const prev = stateRef.current;
      if (!prev || supersededRef.current) return;
      const next = mockReducer(prev, a);
      if (next === prev) return;
      if (prev.endedAt === null && next.endedAt !== null) own.current = true;
      commit(prev, next);
    },
    [commit],
  );

  /** Resume this URL's mock (ticked to now) or start a new one. */
  const begin = useCallback(
    (stored: MockState | null) => {
      const now = Date.now();
      const s =
        stored && isThisMock(stored) ? mockReducer(stored, { type: "tick", now }) : newMock(kind, examId, ids, now);
      own.current = true; // a mock found ended (or ending now) on mount is this tab's to record
      writeStored(s);
      show(s);
    },
    [isThisMock, kind, examId, ids, show],
  );

  const here = useMemo(
    () => mockRunHref(kind === "exam" && examId !== null ? { kind, examId } : { kind: "random", ids }),
    [kind, examId, ids],
  );

  /** The mount decision on what storage holds (also re-run when a discard finds storage changed). */
  const resolve = useCallback(
    (stored: MockState | null) => {
      setUnopenable(null);
      setBusy(null);
      if (stored && !isThisMock(stored)) {
        if (owesRecord(stored, Date.now())) {
          // another mock still owes its answers to the record: open it (it records there) first —
          // unless its URL is this page, which now resolves to other ids (never redirect to itself)
          const target = mockRunHref(scopeOfMock(stored));
          if (target === here) setUnopenable(stored);
          else router.replace(target);
          return;
        }
        if (stored.endedAt === null) {
          setBusy(stored); // another mock still running in time: ask first (I-2)
          return;
        }
      }
      begin(stored);
    },
    [isThisMock, here, begin, router],
  );

  // mount
  useEffect(() => {
    resolve(readStored());
  }, [resolve]);

  /** Confirmed 「記録せずに破棄」 of `seen` (owed or running when the notice was built). */
  const discardOther = useCallback(
    (seen: MockState, owed: boolean) => {
      const stored = readStored();
      if (stored && !(sameSave(stored, seen) && owesRecord(stored, Date.now()) === owed)) {
        resolve(stored); // storage changed since the notice: decide again, remove nothing
        return;
      }
      try {
        window.localStorage.removeItem(MOCK_STORAGE_KEY);
      } catch {
        // storage unavailable: nothing stored
      }
      resolve(null);
    },
    [resolve],
  );

  // the tick (real time; a no-op until the deadline)
  const running = state !== null && state.endedAt === null;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => act({ type: "tick", now: Date.now() }), 1000);
    return () => clearInterval(id);
  }, [running, act]);

  // other tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== null && e.key !== MOCK_STORAGE_KEY) return;
      const cur = stateRef.current;
      if (!cur || supersededRef.current || (cur.endedAt !== null && cur.recorded)) return;
      const incoming = e.key === null ? null : parseMock(e.newValue);
      if (!incoming || !isThisMock(incoming)) {
        supersededRef.current = true;
        setSuperseded(true);
        return;
      }
      if (cur.endedAt !== null) {
        // our finish stands over a running state, our record over an unrecorded one
        if (incoming.endedAt === null || (cur.recorded && !incoming.recorded)) {
          writeStored(cur);
          return;
        }
        if (!incoming.recorded) return; // both ended, neither recorded yet: ours records (re-read guards it)
      }
      if (incoming.endedAt !== null) own.current = false; // the other tab's finish: it records
      show(incoming);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [isThisMock, show]);

  // the finish → the learning record, once (see header)
  useEffect(() => {
    if (!state || !loaded || !own.current || supersededRef.current) return;
    const plan = mockRecordPlan(state, keyOf);
    if (!plan) return;
    const stored = readStored();
    if (stored && isThisMock(stored) && stored.endedAt !== null && stored.recorded) {
      own.current = false;
      show(stored);
      return;
    }
    if (plan.items.length > 0) answerBatch(plan.items, plan.at, "mock");
    const next = mockReducer(state, { type: "recorded" });
    writeStored(next);
    show(next);
  }, [state, loaded, keyOf, answerBatch, isThisMock, show]);

  // focus: a new question → top of the page; the end → the result heading
  const hasState = state !== null;
  const pos = state?.pos ?? 0;
  const ended = state !== null && state.endedAt !== null;
  useEffect(() => {
    if (!hasState) return;
    if (ended) {
      if (!shownEnded.current) {
        shownEnded.current = true;
        window.scrollTo({ top: 0 });
        document.getElementById(MOCK_RESULT_HEADING_ID)?.focus({ preventScroll: true });
      }
      return;
    }
    window.scrollTo({ top: 0 });
  }, [hasState, pos, reviewing, ended]);

  if (superseded) {
    return (
      <main className={styles.page} data-superseded="">
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.lead}>{t("superseded")}</p>
        <div className={styles.actions}>
          <Link href="/mock" className={styles.btn}>
            {t("toSetup")}
          </Link>
        </div>
      </main>
    );
  }

  if (busy) {
    const target = mockRunHref(scopeOfMock(busy));
    return (
      <main className={styles.page} data-busy="">
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.lead}>{t("busy")}</p>
        <div className={styles.actions}>
          {target !== here ? (
            <Link href={target} className={styles.btnPrimary} data-busy-resume="">
              {t("busyResume")}
            </Link>
          ) : null}
          <MockDiscard key={busy.startedAt} onDiscard={() => discardOther(busy, false)} />
        </div>
      </main>
    );
  }

  if (unopenable) {
    return (
      <main className={styles.page} data-unopenable="">
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.lead}>{t("unopenable")}</p>
        <div className={styles.actions}>
          <MockDiscard key={unopenable.startedAt} onDiscard={() => discardOther(unopenable, true)} />
          <Link href="/" className={styles.btn}>
            {t("backToday")}
          </Link>
        </div>
      </main>
    );
  }

  if (!state) {
    return (
      <main className={styles.page} data-pending="">
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.lead}>{t("loading")}</p>
      </main>
    );
  }

  if (state.endedAt !== null) {
    return (
      <main className={styles.page}>
        <MockResult
          ids={state.ids}
          answers={state.answers}
          questions={questions}
          score={scoreMock(state.ids, state.answers, keyOf)}
          elapsedMs={state.endedAt - state.startedAt}
        />
      </main>
    );
  }

  const q = questions[state.pos]!;
  const qid = q.id;
  const picked = Object.prototype.hasOwnProperty.call(state.answers, qid) ? state.answers[qid]! : null;
  const flagged = state.flagged.includes(qid);
  const unanswered = state.ids.filter((id) => !Object.prototype.hasOwnProperty.call(state.answers, id)).length;
  const total = state.ids.length;
  const isLast = state.pos === total - 1;
  const fold = Object.prototype.hasOwnProperty.call(folds, qid) ? folds[qid]! : null;
  const showTranslation = trOverride ?? settingValue(record, "transDefault") === "shown";

  return (
    <main className={styles.exam} data-mock-run="">
      <h1 className="sr-only">{t("title")}</h1>
      <div className={styles.topBar}>
        <span className={styles.examName} lang="ja">
          {examLabel ?? t("randomLabel")}
        </span>
        <MockTimer startedAt={state.startedAt} />
        <button
          type="button"
          className={styles.barBtn}
          aria-pressed={reviewing}
          data-review-toggle=""
          onClick={() => {
            setConfirming(false);
            setReviewing(!reviewing);
          }}
        >
          {t(reviewing ? "reviewClose" : "reviewOpen")}
        </button>
        <button
          type="button"
          className={styles.barBtn}
          aria-expanded={confirming}
          aria-controls="mock-confirm"
          data-finish=""
          onClick={() => setConfirming(!confirming)}
        >
          {t("finish")}
        </button>
      </div>

      {confirming ? (
        <section id="mock-confirm" className={styles.confirm} aria-labelledby="mock-confirm-title" data-confirm="">
          <h2 id="mock-confirm-title" className={styles.confirmTitle}>
            {t("confirmTitle")}
          </h2>
          <p className={styles.confirmCount} data-confirm-unanswered={unanswered}>
            {unanswered > 0 ? <strong>{t("confirmUnanswered", { n: unanswered })}</strong> : t("confirmAllAnswered")}
          </p>
          <p className={styles.muted}>{t("confirmNote")}</p>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.btnPrimary}
              data-confirm-yes=""
              onClick={() => act({ type: "finish", now: Date.now() })}
            >
              {t("confirmYes")}
            </button>
            <button type="button" className={styles.btn} onClick={() => setConfirming(false)}>
              {t("confirmNo")}
            </button>
          </div>
        </section>
      ) : null}

      {reviewing ? (
        <MockReview
          ids={state.ids}
          answers={state.answers}
          flagged={state.flagged}
          pos={state.pos}
          onGo={(p) => {
            act({ type: "go", pos: p });
            setReviewing(false);
          }}
        />
      ) : (
        <>
          <div className={styles.faceWrap}>
            <PracticeQuestion
              key={qid}
              q={q}
              locale={locale}
              mode="exam"
              examNo={{ n: state.pos + 1, total }}
              picked={picked}
              onPick={(choice) => act({ type: "pick", qid, choice })}
              recent={[]}
              stars={stars[q.topic_id] ?? 1}
              showTranslation={showTranslation}
              onToggleTranslation={() => setTrOverride(!showTranslation)}
              preambleChars={fold}
              foldPreamble={fold !== null}
            />
          </div>
          <div className={styles.bottomBar}>
            <button
              type="button"
              className={styles.barBtn}
              disabled={state.pos === 0}
              data-nav="prev"
              onClick={() => act({ type: "go", pos: state.pos - 1 })}
            >
              {t("prev")}
            </button>
            <label className={styles.flag}>
              <input type="checkbox" checked={flagged} data-flag="" onChange={() => act({ type: "flag", qid })} />
              <span>{t("flag")}</span>
            </label>
            <button
              type="button"
              className={`${styles.barBtn} ${styles.next}`}
              data-nav="next"
              onClick={() => (isLast ? setReviewing(true) : act({ type: "go", pos: state.pos + 1 }))}
            >
              {t(isLast ? "reviewOpen" : "next")}
            </button>
          </div>
        </>
      )}
    </main>
  );
}
