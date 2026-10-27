// Stage 7 Phase 1 Task 9 (D-187 / D-189 §6.2 / D-190 §0-13 / §0-14 / §0-18 / §0-26) — one question
// per screen, mockup A4-Practice.
//
// PracticeSession owns the wiring; SessionView is the pure render of (state, record), so the SSR
// tests can render any state without a DOM.
//   - State: SessionState. The first render (server and client) is the fresh state; after mount
//     the sessionStorage copy (key = ids + the URL's run nonce) replaces it (loadSession, a finished
//     group included: a reload on the summary shows the summary), and every change after that is
//     saved (saveSession). Actions go through `act` → applyAction on a ref of the committed state;
//     answer() is called only for its `record` (an accepted pick) — once per question per group,
//     also after a reload. Nothing is dispatched before the restore. The summary's 「もう一度」
//     clears the stored group and starts it again.
//   - Keyboard (§0-14): one window keydown listener → keyToAction; editable targets, open dialogs
//     (the figure <dialog>, the AI 先生 panel), IME composition, auto-repeat and modifier chords are left alone;
//     Enter on an enabled button / link / summary keeps its own activation. A handled key is
//     preventDefault-ed, so Enter never also activates the control under the focus.
//   - Moving to another question remounts the face and the explanation (key = q.id: the
//     explanation language switch starts at the UI locale again, folded details close), scrolls to
//     the top and focuses the question <article>.
//   - Translation: shown by default when settings.transDefault = "shown" (hidden otherwise); the
//     toggle holds for this group only and is not saved.
//   - Timer: SessionTimer owns its clock (its own state + interval), so the 1 s tick re-renders only
//     that span — SessionView takes no time prop and the face / explanation do not re-render per
//     tick. Elapsed since startedAt, mm:ss; frozen at endedAt. "00:00" until mounted.
//   - The status line waits for the learning record to be loaded (no "first time" from an empty
//     record); its day is Date.now() at render.
//   - Focus: a new question → its <article>; the group ending (not a restore) → the summary <h1>.
//   - Answering (OQ-13 / D-194): the explanation sits under the face; an accepted pick (applyAction
//     returned an attempt — never the restore, a revisit or a re-pick) scrolls down until the
//     explanation's heading sits about 45% down the viewport, so the end of the question (the choices
//     with ○ / ×) stays in view above it (the user's pick: 「解析标题刚好可见，题目仍部分可见」).
//     Never up; no move when the heading is already fully in view; smooth, instant with
//     prefers-reduced-motion.
//   - from=today: the top bar names the today task — the URL's `kind=` (kindParam, Task 11) from the
//     first frame, else inferred once the record is loaded (todayKind, fixed once known) — and the
//     summary offers 「继续下一项」 (summaryNextHref: nextTodayGroup → /practice?ids=…&from=today&kind=…,
//     or "/" when the day is done) — only once the record is loaded (no link while an owner's GET is
//     pending or right after a reload, which would plan from an empty record).
//   - from=unit (Phase 3 §0-2 / §0-8): the summary's 「単元に戻る」, and a wrong answer's link back to
//     the unit under the explanation (unitReturnHref).
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
import { PRACTICE_CATEGORY_LABEL_KEYS } from "@/lib/practice/practiceLabels";
import {
  applyAction,
  clearSession,
  formatElapsed,
  keyToAction,
  loadSession,
  localDateKey,
  newSession,
  recentResults,
  saveSession,
  statusLine,
  summaryNextHref,
  todayKind,
  unitReturnHref,
  type SessionAction,
  type SessionFrom,
  type SessionState,
  type StatusLine,
  type TodayKind,
} from "@/lib/practice/practiceSession";
import type { QuizQuestion } from "@/lib/quiz/quizModel";
import type { StorageLike } from "@/lib/storage";

import { AnswerBar } from "./AnswerBar";
import { AnswerCard } from "./AnswerCard";
import { EXPLANATION_ID, ExplanationPane } from "./ExplanationPane";
import { PracticeQuestion } from "./PracticeQuestion";
import { SESSION_SUMMARY_HEADING_ID as SUMMARY_HEADING_ID, SessionSummary, type SessionTopic } from "./SessionSummary";
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
  /** where the group was opened from (parseFrom; a unit carries its title and terms) */
  from: SessionFrom | null;
  /** the today payload (from=today only; null when it failed to load) */
  today: TodayIndex | null;
  /** the URL's run nonce (parseRun); part of the storage key */
  run?: string | null;
  /** from=today: the URL's `kind=` (parseKind); null / absent = infer it from the record */
  kindParam?: TodayKind | null;
  /** tests: start from this state and skip the sessionStorage restore */
  initialState?: SessionState;
}

/** where the explanation's heading lands after an answer: this fraction of the viewport from its top */
const EXPLANATION_VIEW_AT = 0.45;

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
  const { questions, initialState, from, today } = props;
  const fromToday = from?.kind === "today";
  const run = props.run ?? null;
  const { record, loaded, answer } = useLearningRecord();
  const ids = useMemo(() => questions.map((q) => q.id), [questions]);
  const keyOf = useMemo(() => new Map(questions.map((q) => [q.id, q.correct_answer])), [questions]);

  const [state, setState] = useState<SessionState>(() => initialState ?? newSession(ids, 0, run));
  const stateRef = useRef(state);
  const [ready, setReady] = useState(initialState !== undefined);
  const [trOverride, setTrOverride] = useState<boolean | null>(null);
  /** undefined = not worked out yet */
  const [kind, setKind] = useState<TodayKind | null | undefined>(() => props.kindParam ?? undefined);
  /** the position on screen (a change scrolls up and focuses the new question) */
  const shownPos = useRef(state.pos);
  /** whether the summary is on screen (the group ending moves the focus to its heading) */
  const shownFinished = useRef(state.finished);
  /** an accepted pick waits for its explanation to render, then scrolls to it */
  const scrollToExplanation = useRef(false);

  // restore (once per group; the page keys this component by the group)
  useEffect(() => {
    if (initialState !== undefined) return;
    const restored = loadSession(browserSession(), ids, Date.now(), run);
    stateRef.current = restored;
    shownPos.current = restored.pos;
    shownFinished.current = restored.finished;
    setState(restored);
    setReady(true);
  }, [ids, initialState, run]);

  useEffect(() => {
    if (ready) saveSession(browserSession(), state);
  }, [ready, state]);

  const act = useCallback(
    (a: SessionAction) => {
      if (!ready) return;
      const prev = stateRef.current;
      const { next, record: attempt } = applyAction(prev, a, keyOf, Date.now());
      if (next === prev) return;
      if (attempt) {
        answer(...attempt);
        scrollToExplanation.current = true;
      }
      stateRef.current = next;
      setState(next);
    },
    [ready, answer, keyOf],
  );

  const startOver = useCallback(() => {
    clearSession(browserSession(), ids, run);
    const fresh = newSession(ids, Date.now(), run);
    stateRef.current = fresh;
    shownPos.current = -1; // focus the first question
    setState(fresh);
  }, [ids, run]);

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

  // a new question: top of the page, focus on its <article>; the group ended: the summary heading
  useEffect(() => {
    if (!ready) return; // the mount frame still shows the pre-restore state
    if (state.finished) {
      if (!shownFinished.current) {
        shownFinished.current = true;
        window.scrollTo({ top: 0 });
        document.getElementById(SUMMARY_HEADING_ID)?.focus({ preventScroll: true });
      }
      return;
    }
    shownFinished.current = false;
    if (shownPos.current === state.pos) return;
    shownPos.current = state.pos;
    window.scrollTo({ top: 0 });
    document.getElementById(state.ids[state.pos]!)?.focus({ preventScroll: true });
  }, [ready, state.pos, state.ids, state.finished]);

  // an accepted pick: bring the explanation's heading into view (OQ-13 / D-194)
  useEffect(() => {
    if (!scrollToExplanation.current) return;
    scrollToExplanation.current = false;
    const el = document.getElementById(EXPLANATION_ID);
    if (!el || state.finished) return;
    const heading = el.querySelector("h2") ?? el;
    const r = heading.getBoundingClientRect();
    if (r.top >= 0 && r.bottom <= window.innerHeight) return; // already in view
    const top = Math.max(window.scrollY, window.scrollY + r.top - window.innerHeight * EXPLANATION_VIEW_AT);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  }, [state]);

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

  const at = Date.now();
  const nextHref = summaryNextHref(
    state,
    fromToday,
    loaded,
    record,
    today ? poolFromIndex(today) : null,
    at,
    toLocalDay,
    localDateKey(new Date(at)),
  );

  const showTranslation = trOverride ?? settingValue(record, "transDefault") === "shown";

  return (
    <SenseiHost onQuestionLink={onQuestionLink}>
      <SessionView
        {...props}
        state={state}
        record={record}
        recordLoaded={loaded}
        kind={kind ?? null}
        nextHref={nextHref}
        showTranslation={showTranslation}
        onToggleTranslation={() => setTrOverride(!showTranslation)}
        act={act}
        onStartOver={startOver}
      />
    </SenseiHost>
  );
}

export interface SessionViewProps extends Omit<PracticeSessionProps, "initialState" | "run" | "kindParam"> {
  state: SessionState;
  record: LearningRecord;
  /** the record has been read (localStorage, and the server for the owner) */
  recordLoaded: boolean;
  kind: TodayKind | null;
  nextHref: string | null;
  showTranslation: boolean;
  onToggleTranslation: () => void;
  act: (a: SessionAction) => void;
  onStartOver?: () => void;
}

/** Elapsed time of the group, mm:ss: its own 1 s clock, frozen at endedAt; "00:00" until mounted. */
export function SessionTimer({
  startedAt,
  endedAt,
}: {
  startedAt: number;
  endedAt: number | null;
}): React.ReactElement {
  const t = useTranslations("Practice");
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (endedAt !== null) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [endedAt]);
  const end = endedAt ?? now ?? startedAt;
  return (
    <span className={styles.timer} role="timer" aria-label={t("timer")} data-timer="">
      {formatElapsed(end - startedAt)}
    </span>
  );
}

/** The session screen (or the summary) for a given state — no effects, no storage. */
export function SessionView({
  questions,
  locale,
  isOwner,
  termCards,
  topics,
  folds,
  from,
  state,
  record,
  recordLoaded,
  kind,
  nextHref,
  showTranslation,
  onToggleTranslation,
  act,
  onStartOver,
}: SessionViewProps): React.ReactElement {
  const t = useTranslations("Practice");
  const keyOf = useMemo(() => new Map(questions.map((q) => [q.id, q.correct_answer])), [questions]);

  if (state.finished) {
    return (
      <SessionSummary
        ids={state.ids}
        answers={state.answers}
        questions={questions}
        elapsedMs={Math.max(0, (state.endedAt ?? state.startedAt) - state.startedAt)}
        from={from}
        nextHref={nextHref}
        topics={topics}
        runNonce={state.endedAt}
        onStartOver={onStartOver}
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
  const catKey = topic ? PRACTICE_CATEGORY_LABEL_KEYS[topic.category] : undefined;

  let status: StatusLine | null = null;
  if (picked !== null && recordLoaded) {
    const day = toLocalDay(Date.now());
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
        <SessionTimer startedAt={state.startedAt} endedAt={state.endedAt} />
        <button type="button" className={styles.finishBtn} data-finish="" onClick={() => act({ type: "finish" })}>
          {t("finish")}
        </button>
      </div>

      <div className={styles.stack}>
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
        <ExplanationPane
          key={`${q.id}:explanation`}
          q={q}
          locale={locale}
          picked={picked}
          termCards={termCards}
          isOwner={isOwner}
          unitBack={from?.kind === "unit" ? { href: unitReturnHref(from, q.terms), title: from.title } : null}
        />
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
