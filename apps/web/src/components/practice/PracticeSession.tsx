// Stage 7 Phase 1 Task 9 (D-187 / D-189 §6.2 / D-190 §0-13 / §0-14 / §0-18 / §0-26) — one question
// per screen, mockup A4-Practice.
//
// PracticeSession owns the wiring; SessionView is the pure render of (state, record), so the SSR
// tests can render any state without a DOM.
//   - State: practiceReducer over SessionState. The first render (server and client) is the fresh
//     state; after mount the sessionStorage copy is merged in (loadSession), and every change after
//     that is saved (saveSession). Actions go through `act`, which runs the reducer on a ref of the
//     committed state and calls answer() only when a pick was accepted — once per question per
//     group, also after a reload (the restored answers reject the repeat). Nothing is dispatched
//     before the restore.
//   - Keyboard (§0-14): one window keydown listener → keyToAction; editable targets, open dialogs
//     (the figure <dialog>, the AI 先生 panel), IME composition, auto-repeat and modifier chords are left alone;
//     Enter on an enabled button / link / summary keeps its own activation. A handled key is
//     preventDefault-ed, so Enter never also activates the control under the focus.
//   - Moving to another question remounts the face and the explanation (key = q.id: the
//     explanation language switch starts at the UI locale again, folded details close), scrolls to
//     the top and focuses the question <article>.
//   - Translation: shown by default when settings.transDefault = "shown" (hidden otherwise); the
//     toggle holds for this group only and is not saved.
//   - Timer: elapsed since startedAt, mm:ss, every second; frozen when the group ends. "00:00" until
//     mounted (no hydration mismatch).
//   - from=today: the top bar names the today task (todayKind, fixed once known) and the summary
//     offers 「继续下一项」 (nextTodayIds → /practice?ids=…&from=today, or "/" when the day is done).
//   - AI 先生 (§0-18): SenseiHost.onQuestionLink jumps to a question of this group (true).

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { SenseiHost } from "@/components/sensei/AskSensei";
import { useLearningRecord } from "@/hooks/useLearningRecord";
import type { TermCard } from "@/lib/glossary/dictionary";
import { settingValue, type LearningRecord } from "@/lib/learning/record";
import { toLocalDay } from "@/lib/learning/schedule";
import { poolFromIndex, type TodayIndex } from "@/lib/practice/practiceIndex";
import {
  formatElapsed,
  keyToAction,
  loadSession,
  localDateKey,
  newSession,
  nextTodayIds,
  practiceReducer,
  recentResults,
  saveSession,
  statusLine,
  todayKind,
  type SessionAction,
  type SessionState,
  type StatusLine,
  type TodayKind,
} from "@/lib/practice/practiceSession";
import type { QuizQuestion } from "@/lib/quiz/quizModel";
import type { StorageLike } from "@/lib/storage";

import { AnswerBar } from "./AnswerBar";
import { AnswerCard } from "./AnswerCard";
import { ExplanationPane } from "./ExplanationPane";
import { PracticeQuestion } from "./PracticeQuestion";
import { SessionSummary, type SessionTopic } from "./SessionSummary";
import styles from "./session.module.css";

export interface PracticeSessionProps {
  /** the group, in order (the ids are their ids) */
  questions: QuizQuestion[];
  locale: string;
  isOwner: boolean;
  /** dictionary cards keyed by JP term; {} when the dictionary failed to load (plain-text terms) */
  termCards: Record<string, TermCard>;
  topics: Record<string, SessionTopic>;
  /** qid → JP fold point (foldPlan) */
  folds: Record<string, number>;
  fromToday: boolean;
  /** the today payload (from=today only; null when it failed to load) */
  today: TodayIndex | null;
  /** tests: start from this state and skip the sessionStorage restore */
  initialState?: SessionState;
}

const CATEGORY_KEYS: Record<string, "cat_strategy" | "cat_management" | "cat_technology"> = {
  strategy: "cat_strategy",
  management: "cat_management",
  technology: "cat_technology",
};

const hasOwn = (o: object, k: string): boolean => Object.prototype.hasOwnProperty.call(o, k);

function browserSession(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

function isEditable(el: Element | null): boolean {
  if (!el) return false;
  if (el instanceof HTMLElement && el.isContentEditable) return true;
  return el.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])') !== null;
}

function isActivatable(el: Element | null): boolean {
  return el?.closest('a[href], button:not([aria-disabled="true"]):not(:disabled), summary') != null;
}

function dialogOpen(): boolean {
  return document.querySelector('dialog[open], [role="dialog"], [role="alertdialog"]') !== null;
}

export function PracticeSession(props: PracticeSessionProps): React.ReactElement {
  const { questions, initialState, fromToday, today } = props;
  const { record, loaded, answer } = useLearningRecord();
  const ids = useMemo(() => questions.map((q) => q.id), [questions]);
  const keyOf = useMemo(() => new Map(questions.map((q) => [q.id, q.correct_answer])), [questions]);

  const [state, setState] = useState<SessionState>(() => initialState ?? newSession(ids, 0));
  const stateRef = useRef(state);
  const [ready, setReady] = useState(initialState !== undefined);
  const [now, setNow] = useState<number | null>(null);
  const [endedAt, setEndedAt] = useState<number | null>(null);
  const [trOverride, setTrOverride] = useState<boolean | null>(null);
  /** undefined = not worked out yet */
  const [kind, setKind] = useState<TodayKind | null | undefined>(undefined);
  /** the position on screen (a change scrolls up and focuses the new question) */
  const shownPos = useRef(state.pos);

  // restore (once per group; the page keys this component by the group)
  useEffect(() => {
    if (initialState !== undefined) return;
    const restored = loadSession(browserSession(), ids, Date.now());
    stateRef.current = restored;
    shownPos.current = restored.pos;
    setState(restored);
    setReady(true);
  }, [ids, initialState]);

  useEffect(() => {
    if (ready) saveSession(browserSession(), state);
  }, [ready, state]);

  const act = useCallback(
    (a: SessionAction) => {
      if (!ready) return;
      const prev = stateRef.current;
      const next = practiceReducer(prev, a);
      if (next === prev) return;
      if (a.type === "pick") {
        const qid = prev.ids[prev.pos]!;
        answer(qid, a.choice, a.choice === keyOf.get(qid));
      }
      if (next.finished) setEndedAt(Date.now());
      stateRef.current = next;
      setState(next);
    },
    [ready, answer, keyOf],
  );

  // timer
  useEffect(() => {
    if (state.finished) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [state.finished]);

  // keyboard (§0-14)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.isComposing || e.repeat) return; // a held → / Enter must not race to the summary
      const s = stateRef.current;
      if (s.finished) return;
      const target = e.target instanceof Element ? e.target : null;
      const qid = s.ids[s.pos];
      const action = keyToAction(e.key, {
        answered: qid !== undefined && hasOwn(s.answers, qid),
        editableTarget: isEditable(target),
        dialogOpen: dialogOpen(),
        modifier: e.ctrlKey || e.metaKey || e.altKey,
        activatable: isActivatable(target),
      });
      if (!action) return;
      e.preventDefault();
      act(action);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [act]);

  // a new question: top of the page, focus on its <article>
  useEffect(() => {
    if (shownPos.current === state.pos || state.finished) return;
    shownPos.current = state.pos;
    window.scrollTo({ top: 0 });
    document.getElementById(state.ids[state.pos]!)?.focus({ preventScroll: true });
  }, [state.pos, state.ids, state.finished]);

  // from=today: the task kind, fixed once the record is loaded
  useEffect(() => {
    if (!fromToday || !today || !loaded || kind !== undefined) return;
    const at = Date.now();
    setKind(todayKind(record, poolFromIndex(today), ids, toLocalDay(at), toLocalDay, localDateKey(new Date(at))));
  }, [fromToday, today, loaded, kind, record, ids]);

  const onQuestionLink = useCallback(
    (id: string): boolean => {
      const pos = stateRef.current.ids.indexOf(id);
      if (pos < 0 || stateRef.current.finished) return false;
      act({ type: "goto", pos });
      return true;
    },
    [act],
  );

  let nextHref: string | null = null;
  if (state.finished && fromToday && today) {
    const at = endedAt ?? Date.now();
    const next = nextTodayIds(record, poolFromIndex(today), toLocalDay(at), toLocalDay, localDateKey(new Date(at)));
    nextHref = next ? `/practice?ids=${next.join(",")}&from=today` : "/";
  }

  const showTranslation = trOverride ?? settingValue(record, "transDefault") === "shown";

  return (
    <SenseiHost onQuestionLink={onQuestionLink}>
      <SessionView
        {...props}
        state={state}
        record={record}
        now={now}
        endedAt={endedAt}
        kind={kind ?? null}
        nextHref={nextHref}
        showTranslation={showTranslation}
        onToggleTranslation={() => setTrOverride(!showTranslation)}
        act={act}
      />
    </SenseiHost>
  );
}

export interface SessionViewProps extends Omit<PracticeSessionProps, "initialState"> {
  state: SessionState;
  record: LearningRecord;
  /** clock of the last tick; null before mount */
  now: number | null;
  /** when the group ended (frozen elapsed time) */
  endedAt: number | null;
  kind: TodayKind | null;
  nextHref: string | null;
  showTranslation: boolean;
  onToggleTranslation: () => void;
  act: (a: SessionAction) => void;
}

/** The session screen (or the summary) for a given state — no effects, no storage. */
export function SessionView({
  questions,
  locale,
  isOwner,
  termCards,
  topics,
  folds,
  fromToday,
  state,
  record,
  now,
  endedAt,
  kind,
  nextHref,
  showTranslation,
  onToggleTranslation,
  act,
}: SessionViewProps): React.ReactElement {
  const t = useTranslations("Practice");
  const keyOf = useMemo(() => new Map(questions.map((q) => [q.id, q.correct_answer])), [questions]);
  const elapsed = Math.max(0, (endedAt ?? now ?? state.startedAt) - state.startedAt);

  if (state.finished) {
    return (
      <SessionSummary
        ids={state.ids}
        answers={state.answers}
        questions={questions}
        elapsedMs={elapsed}
        from={fromToday ? "today" : null}
        nextHref={nextHref}
        topics={topics}
      />
    );
  }

  const q = questions[state.pos]!;
  const topic = topics[q.topic_id];
  const picked = hasOwn(state.answers, q.id) ? state.answers[q.id]! : null;
  const attempts = hasOwn(record.attempts, q.id) ? record.attempts[q.id] : undefined;
  const fold = hasOwn(folds, q.id) ? folds[q.id]! : null;
  const total = state.ids.length;
  const isLast = state.pos === total - 1;
  const catKey = topic ? CATEGORY_KEYS[topic.category] : undefined;

  let status: StatusLine | null = null;
  if (picked !== null) {
    const day = toLocalDay(now ?? Date.now());
    status = statusLine(attempts ?? [], record.v2Since, q.id, picked === q.correct_answer, day, toLocalDay);
  }

  return (
    <main className={styles.session} data-session="">
      <h1 className="sr-only">{t("title")}</h1>
      <div className={styles.topBar}>
        {catKey ? (
          <span className={styles.catTag} lang="ja">
            {t(catKey)}
          </span>
        ) : null}
        {topic ? (
          <span className={styles.path} lang="ja">
            {topic.path}
          </span>
        ) : null}
        <span className={styles.progress} data-progress={`${state.pos + 1}/${total}`}>
          <span className="sr-only">{t("progressAria", { pos: state.pos + 1, total })}</span>
          <span aria-hidden="true">
            {kind ? `${t(`kind_${kind}`)}　` : null}
            <strong>{state.pos + 1}</strong> / {total}
          </span>
        </span>
        <AnswerCard ids={state.ids} answers={state.answers} keyOf={keyOf} pos={state.pos} />
        <span className={styles.timer} role="timer" aria-label={t("timer")} data-timer="">
          {formatElapsed(elapsed)}
        </span>
        <button type="button" className={styles.finishBtn} data-finish="" onClick={() => act({ type: "finish" })}>
          {t("finish")}
        </button>
      </div>

      <div className={styles.columns}>
        <div className={styles.faceCol}>
          <PracticeQuestion
            key={q.id}
            q={q}
            locale={locale}
            picked={picked}
            onPick={(choice) => act({ type: "pick", choice })}
            recent={recentResults(attempts, picked !== null)}
            stars={topic?.stars ?? 1}
            showTranslation={showTranslation}
            onToggleTranslation={onToggleTranslation}
            preambleChars={fold}
            foldPreamble={fold !== null}
          />
        </div>
        <div className={styles.explCol}>
          <ExplanationPane key={q.id} q={q} locale={locale} picked={picked} termCards={termCards} isOwner={isOwner} />
        </div>
      </div>

      <div className={styles.footer}>
        {picked !== null ? <AnswerBar q={q} /> : null}
        <p className={styles.status} role="status" data-status={status?.kind ?? ""}>
          {status ? statusText(status, t) : null}
        </p>
        <div className={styles.nav}>
          <button
            type="button"
            className={styles.navBtn}
            disabled={state.pos === 0}
            data-nav="prev"
            onClick={() => act({ type: "prev" })}
          >
            {t("prev")}
          </button>
          <button type="button" className={styles.navBtnPrimary} data-nav="next" onClick={() => act({ type: "next" })}>
            {t(isLast ? "seeResults" : "next")}
          </button>
        </div>
      </div>
    </main>
  );
}

function statusText(s: StatusLine, t: ReturnType<typeof useTranslations>): string {
  switch (s.kind) {
    case "wrong":
      return t("statusWrong");
    case "firstRight":
      return t("statusFirstRight");
    case "nextIn":
      return t("statusNextIn", { n: s.days });
    case "mastered":
      return t("statusMastered");
  }
}
