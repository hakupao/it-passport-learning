// Stage 7 Phase 1 Task 9 (D-187 / D-190 §0-8 / §0-12〜§0-14 / §0-26) — the practice session's
// pure layer (no React, no DOM; bundler-safe, relative imports like ./practiceIndex).
//
//   - parseScope (§0-12): the URL → PracticeScope. `ids` (comma list) wins over a filter: unknown
//     and repeated ids dropped, input order kept, at most MAX_SCOPE_IDS. Otherwise `topic` (comma
//     list, unknown dropped) / `exam` (unknown → none) + `n` (10 | 20 | 50 | all, anything else →
//     20) + `order` (rand, anything else → seq) + `seed` (decimal digits → uint32, else 0; the page
//     redirects order=rand without a seed to one with a fresh seed, so a reload resolves the same
//     list). A filter with neither a valid topic nor a valid exam → null (resolveScope would take
//     the whole corpus). null = show the setup panel. `prefill=1` (a legacy /quiz redirect asking
//     the setup panel to pre-fill the scope; Task 10 / 13) → null as well.
//   - practiceReducer (§0-13): pick (only an unanswered question; a repeat returns the same state
//     object), next (past the last → finished), prev (stops at 0), finish (summary of the answered
//     part), goto (a question of this group: the AI 先生 reply's `#<question_id>` link, §0-18).
//     A finished session ignores every action.
//   - applyAction: the component's accept-and-record step — the reducer plus, when a pick was
//     accepted, the attempt to record ([qid, choice, correct]); when the group just ended, endedAt
//     = now. The component calls answer() only for a returned `record`, so a question is recorded
//     once per group, also after a reload (the restored answers reject the repeat).
//   - keyToAction (§0-14): 1–4 → ア〜エ while unanswered, ← / → prev / next, Enter → next once
//     answered. Nothing from an editable target, while a dialog is open, with a modifier chord
//     (Alt+← is history back), and no Enter on a control that activates itself (a focused enabled
//     button / link / summary — otherwise Enter on 「次へ」 would advance twice).
//   - sessionKey / loadSession / saveSession / clearSession (§0-13): sessionStorage
//     `itp:practice:v1:<fnv1a32(ids.join(",")) hex>[:<run>]` → { pos, answers, startedAt } while the
//     group runs, plus { finished: true, endedAt } once it ended — a deliberate extension of §0-13
//     (fix round 1): a reload on the summary shows the summary again with the elapsed time frozen.
//     `run` (URL `&run=<digits>`, parseRun) is a nonce the summary's links carry (the group's
//     endedAt), so 「只做错题再来一遍」 with the same ids (all wrong) is a new group, not the stored
//     summary; the summary's 「もう一度」 clears the key and starts the same group afresh. Storage
//     per tab: a new tab is a new group. Never throws; unusable storage → in-memory only. What does
//     not fit the ids is dropped on load.
//   - foldPlan (§0-8 / §6.2): qid → JP fold point (ChumonGroup.preambleChars.jp) for each 中問 member
//     that directly follows a member of its own group (expandGroups keeps a group consecutive, so:
//     the 2nd member on); the first member — or one reached without its group before it — shows
//     its full stem. A group without a clean fold point (null) never folds.
//   - statusLine: the footer sentence after an answer (wrong / first-ever right / next due / mastered).
//   - todayKind / nextTodayGroup / nextTodayIds (§0-26): the today task a from=today group belongs
//     to (majority of its ids in the start-of-day plan, so it survives answering and reloading) and
//     the next today group (first non-empty of mistakes → due → fresh, todayChunk: first ≤ 20, 中問
//     groups kept whole). Today links carry `kind=<mistakes|due|fresh>` (todayHref, Task 11); the
//     page reads it with parseKind and the session prefers it — todayKind is only the fallback for a
//     link without it (it cannot recognise e.g. the new user's 20-question baseline, which is not the
//     start-of-day plan's new list). startOfDayPlan = dailyPlan over the record as it stood at the
//     start of today (the today page's "done" check).

import { fnv1a32 } from "../hash";
import { isChoiceLetter, type Attempt, type ChoiceLetter, type LearningRecord } from "../learning/record";
import { dailyPlan, expandGroups, reviewState, type DailyPlan, type QuestionPool, type ToDay } from "../learning/schedule";
import type { StorageLike } from "../storage";
import type { ChumonGroup, PracticeScope } from "./practiceIndex";

export const MAX_SCOPE_IDS = 100;
export const DEFAULT_N = 20;
/** questions per today group (§0-26) */
export const TODAY_CHUNK = 20;
const N_VALUES: Record<string, number | "all"> = { "10": 10, "20": 20, "50": 50, all: "all" };

export type SearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v);

const list = (v: string | undefined): string[] =>
  (v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "");

const dedupe = (xs: readonly string[]): string[] => [...new Set(xs)];

/** The practice scope of a URL's search params (see header); null = the setup panel. */
export function parseScope(
  sp: SearchParams,
  validIds: ReadonlySet<string>,
  validTopics: ReadonlySet<string>,
  validExams: ReadonlySet<string>,
): PracticeScope | null {
  if (first(sp.prefill) === "1") return null;
  const rawIds = first(sp.ids);
  if (rawIds !== undefined) {
    const ids = dedupe(list(rawIds).filter((id) => validIds.has(id))).slice(0, MAX_SCOPE_IDS);
    return ids.length > 0 ? { kind: "ids", ids } : null;
  }
  const topics = dedupe(list(first(sp.topic)).filter((t) => validTopics.has(t)));
  const examRaw = first(sp.exam);
  const exam = examRaw !== undefined && validExams.has(examRaw) ? examRaw : null;
  if (topics.length === 0 && exam === null) return null;
  const nRaw = first(sp.n);
  const n = nRaw !== undefined && Object.prototype.hasOwnProperty.call(N_VALUES, nRaw) ? N_VALUES[nRaw]! : DEFAULT_N;
  const order = first(sp.order) === "rand" ? "rand" : "seq";
  const seedRaw = first(sp.seed);
  const seed = seedRaw !== undefined && /^\d{1,20}$/.test(seedRaw) ? Number(seedRaw) >>> 0 : 0;
  return { kind: "filter", topics, exam, n, order, seed };
}

/** `from=today`: the group is a today task (the summary offers 「继续下一项」). */
export function isFromToday(sp: SearchParams): boolean {
  return first(sp.from) === "today";
}

/** `kind=<mistakes|due|fresh>` of a from=today link (see header); anything else → null. */
export function parseKind(sp: SearchParams): TodayKind | null {
  const k = first(sp.kind);
  return (KINDS as readonly (string | undefined)[]).includes(k) ? (k as TodayKind) : null;
}

/** `run=<1–16 digits>`: the group nonce (see header); anything else → null. */
export function parseRun(sp: SearchParams): string | null {
  const r = first(sp.run);
  return r !== undefined && /^\d{1,16}$/.test(r) ? r : null;
}

// ---- session state ----

export interface SessionState {
  ids: string[];
  pos: number;
  answers: Record<string, ChoiceLetter>;
  startedAt: number;
  finished: boolean;
  /** when the group ended (finish / next past the last); null while it runs */
  endedAt: number | null;
  /** the URL's run nonce (part of the storage key); null = none */
  run: string | null;
}

export type SessionAction =
  | { type: "pick"; choice: ChoiceLetter }
  | { type: "next" }
  | { type: "prev" }
  | { type: "finish" }
  | { type: "goto"; pos: number };

export function newSession(ids: readonly string[], now: number, run: string | null = null): SessionState {
  return { ids: [...ids], pos: 0, answers: {}, startedAt: now, finished: false, endedAt: null, run };
}

const hasOwn = (o: object, k: string): boolean => Object.prototype.hasOwnProperty.call(o, k);

export function practiceReducer(s: SessionState, a: SessionAction): SessionState {
  if (s.finished) return s;
  switch (a.type) {
    case "pick": {
      const qid = s.ids[s.pos];
      if (qid === undefined || hasOwn(s.answers, qid)) return s;
      return { ...s, answers: { ...s.answers, [qid]: a.choice } };
    }
    case "next":
      return s.pos >= s.ids.length - 1 ? { ...s, finished: true } : { ...s, pos: s.pos + 1 };
    case "prev":
      return s.pos <= 0 ? s : { ...s, pos: s.pos - 1 };
    case "finish":
      return { ...s, finished: true };
    case "goto":
      return Number.isInteger(a.pos) && a.pos >= 0 && a.pos < s.ids.length && a.pos !== s.pos
        ? { ...s, pos: a.pos }
        : s;
  }
}

export interface Applied {
  /** the new state (=== prev when the action changed nothing) */
  next: SessionState;
  /** an accepted pick: the attempt to record */
  record?: [qid: string, choice: ChoiceLetter, correct: boolean];
}

/** practiceReducer + what the component must do: record an accepted pick, stamp endedAt. */
export function applyAction(
  prev: SessionState,
  a: SessionAction,
  keyOf: ReadonlyMap<string, string>,
  now: number,
): Applied {
  let next = practiceReducer(prev, a);
  if (next === prev) return { next };
  if (next.finished && !prev.finished) next = { ...next, endedAt: now };
  if (a.type !== "pick") return { next };
  const qid = prev.ids[prev.pos]!;
  return { next, record: [qid, a.choice, a.choice === keyOf.get(qid)] };
}

// ---- keyboard ----

export interface KeyContext {
  /** the current question has been answered */
  answered: boolean;
  /** the key came from input / textarea / select / contenteditable */
  editableTarget: boolean;
  /** the AI 先生 panel or the figure zoom is open */
  dialogOpen: boolean;
  /** Ctrl / Meta / Alt held */
  modifier?: boolean;
  /** the target is an enabled button / link / summary, which handles Enter itself */
  activatable?: boolean;
}

const KEY_CHOICE: Record<string, ChoiceLetter> = { "1": "ア", "2": "イ", "3": "ウ", "4": "エ" };

export function keyToAction(key: string, ctx: KeyContext): SessionAction | null {
  if (ctx.editableTarget || ctx.dialogOpen || ctx.modifier) return null;
  if (hasOwn(KEY_CHOICE, key)) return ctx.answered ? null : { type: "pick", choice: KEY_CHOICE[key]! };
  if (key === "ArrowLeft") return { type: "prev" };
  if (key === "ArrowRight") return { type: "next" };
  if (key === "Enter") return ctx.answered && !ctx.activatable ? { type: "next" } : null;
  return null;
}

// ---- sessionStorage ----

export function sessionKey(ids: readonly string[], run: string | null = null): string {
  const base = `itp:practice:v1:${fnv1a32(ids.join(",")).toString(16)}`;
  return run === null ? base : `${base}:${run}`;
}

const isRecord = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);

/** The stored session for these ids (and run), or a fresh one (startedAt = now). Never throws. */
export function loadSession(
  storage: StorageLike | null,
  ids: readonly string[],
  now: number,
  run: string | null = null,
): SessionState {
  const fresh = newSession(ids, now, run);
  if (!storage) return fresh;
  let doc: unknown;
  try {
    const raw = storage.getItem(sessionKey(ids, run));
    if (raw === null) return fresh;
    doc = JSON.parse(raw);
  } catch {
    return fresh;
  }
  if (!isRecord(doc)) return fresh;
  const inGroup = new Set(ids);
  const answers: Record<string, ChoiceLetter> = {};
  if (isRecord(doc.answers)) {
    for (const [qid, c] of Object.entries(doc.answers)) if (inGroup.has(qid) && isChoiceLetter(c)) answers[qid] = c;
  }
  const pos =
    typeof doc.pos === "number" && Number.isInteger(doc.pos) && doc.pos >= 0 && doc.pos < ids.length ? doc.pos : 0;
  const t = doc.startedAt;
  const startedAt = typeof t === "number" && Number.isFinite(t) && t >= 0 && t <= now ? t : now;
  const e = doc.endedAt;
  const ended = doc.finished === true && typeof e === "number" && Number.isFinite(e) && e >= startedAt && e <= now;
  return { ...fresh, pos, answers, startedAt, finished: ended, endedAt: ended ? e : null };
}

/** Store { pos, answers, startedAt } (+ { finished, endedAt } once ended). Never throws. */
export function saveSession(storage: StorageLike | null, s: SessionState): void {
  if (!storage) return;
  const doc = s.finished
    ? { pos: s.pos, answers: s.answers, startedAt: s.startedAt, finished: true, endedAt: s.endedAt }
    : { pos: s.pos, answers: s.answers, startedAt: s.startedAt };
  try {
    storage.setItem(sessionKey(s.ids, s.run), JSON.stringify(doc));
  } catch {
    // quota / blocked storage: the session keeps running in memory
  }
}

/** Forget the stored group (the summary's 「もう一度」). Never throws. */
export function clearSession(storage: StorageLike | null, ids: readonly string[], run: string | null = null): void {
  try {
    storage?.removeItem(sessionKey(ids, run));
  } catch {
    // blocked storage: nothing stored anyway
  }
}

// ---- 中問 fold ----

/** qid → JP fold point for a member right after a member of its own group in `ids` (absent = full stem). */
export function foldPlan(
  ids: readonly string[],
  groups: readonly Pick<ChumonGroup, "memberIds" | "preambleChars">[],
): Record<string, number> {
  const groupOf = new Map<string, Pick<ChumonGroup, "memberIds" | "preambleChars">>();
  for (const g of groups) for (const id of g.memberIds) if (!groupOf.has(id)) groupOf.set(id, g);
  const out: Record<string, number> = {};
  ids.forEach((id, i) => {
    const g = groupOf.get(id);
    const n = g?.preambleChars.jp ?? null;
    if (i > 0 && g !== undefined && groupOf.get(ids[i - 1]!) === g && n !== null) out[id] = n;
  });
  return out;
}

// ---- footer / summary helpers ----

export type StatusLine =
  | { kind: "wrong" }
  | { kind: "firstRight" }
  | { kind: "nextIn"; days: number }
  | { kind: "mastered" };

/**
 * The sentence after an answer. `attempts` = the question's stored attempts including this answer
 * (≤ 1 → the first ever; an answer not yet in the record counts as the first too).
 */
export function statusLine(
  attempts: readonly Attempt[],
  v2Since: number | undefined,
  qid: string,
  correct: boolean,
  today: number,
  toDay: ToDay,
): StatusLine {
  if (!correct) return { kind: "wrong" };
  if (attempts.length <= 1) return { kind: "firstRight" };
  const s = reviewState(attempts, v2Since, qid, toDay);
  if (s === null) return { kind: "firstRight" };
  if (s.dueDay === null) return { kind: "mastered" };
  return { kind: "nextIn", days: Math.max(1, s.dueDay - today) };
}

/**
 * 复习三格: the last ≤ 3 results, newest first. Once this group answered the question, its newest
 * attempt (that answer, shown as ○ / × on the choices) is left out.
 */
export function recentResults(attempts: readonly Attempt[] | undefined, answeredHere: boolean): boolean[] {
  return (attempts ?? []).slice(answeredHere ? 1 : 0, answeredHere ? 4 : 3).map((a) => a.correct);
}

export interface SessionScore {
  total: number;
  answered: number;
  correct: number;
  /** wrong answers, session order */
  wrong: string[];
}

export function summarize(
  ids: readonly string[],
  answers: Readonly<Record<string, ChoiceLetter>>,
  questions: readonly { id: string; correct_answer: string }[],
): SessionScore {
  const key = new Map(questions.map((q) => [q.id, q.correct_answer]));
  let answered = 0;
  let correct = 0;
  const wrong: string[] = [];
  for (const id of ids) {
    if (!hasOwn(answers, id)) continue;
    answered++;
    if (answers[id] === key.get(id)) correct++;
    else wrong.push(id);
  }
  return { total: ids.length, answered, correct, wrong };
}

/** mm:ss of elapsed ms (minutes keep counting past 59). */
export function formatElapsed(ms: number): string {
  const sec = Math.max(0, Math.floor(ms / 1000));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(sec / 60))}:${pad(sec % 60)}`;
}

/** Local YYYY-MM-DD (the dailyPlan dateKey). */
export function localDateKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// ---- today chain (§0-26) ----

export type TodayKind = "mistakes" | "due" | "fresh";
const KINDS: readonly TodayKind[] = ["mistakes", "due", "fresh"];

/** The record as it stood at the start of `today` (today's attempts removed). */
function startOfDay(r: LearningRecord, today: number, toDay: ToDay): LearningRecord {
  const attempts: Record<string, Attempt[]> = {};
  for (const [qid, xs] of Object.entries(r.attempts)) {
    const kept = xs.filter((a) => toDay(a.at) !== today);
    if (kept.length > 0) attempts[qid] = kept;
  }
  return { ...r, attempts };
}

/** dailyPlan over the record as it stood at the start of `today`. */
export function startOfDayPlan(
  r: LearningRecord,
  pool: QuestionPool,
  today: number,
  toDay: ToDay,
  dateKey: string,
): DailyPlan {
  return dailyPlan(startOfDay(r, today, toDay), pool, today, toDay, dateKey);
}

/** One today group of a task's list: its first ≤ TODAY_CHUNK ids, 中問 groups kept whole (may run past 20). */
export function todayChunk(ids: readonly string[], groups: Record<string, string[]>): string[] {
  return expandGroups(ids.slice(0, TODAY_CHUNK), groups);
}

/** The practice URL of a today group (add `&run=` for a fresh group). */
export function todayHref(kind: TodayKind, ids: readonly string[]): string {
  return `/practice?ids=${ids.join(",")}&from=today&kind=${kind}`;
}

/** The today task most of `ids` belonged to at the start of today (ties: mistakes → due → fresh); null = none. */
export function todayKind(
  r: LearningRecord,
  pool: QuestionPool,
  ids: readonly string[],
  today: number,
  toDay: ToDay,
  dateKey: string,
): TodayKind | null {
  const plan = startOfDayPlan(r, pool, today, toDay, dateKey);
  let best: TodayKind | null = null;
  let bestCount = 0;
  for (const k of KINDS) {
    const members = new Set(plan[k]);
    const count = ids.reduce((n, id) => (members.has(id) ? n + 1 : n), 0);
    if (count > bestCount) {
      best = k;
      bestCount = count;
    }
  }
  return best;
}

/** The next today group and its task: first non-empty of mistakes → due → fresh, todayChunk; null = done. */
export function nextTodayGroup(
  r: LearningRecord,
  pool: QuestionPool,
  today: number,
  toDay: ToDay,
  dateKey: string,
): { kind: TodayKind; ids: string[] } | null {
  const plan = dailyPlan(r, pool, today, toDay, dateKey);
  for (const k of KINDS) {
    if (plan[k].length > 0) return { kind: k, ids: todayChunk(plan[k], pool.groups) };
  }
  return null;
}

/** nextTodayGroup's ids. */
export function nextTodayIds(
  r: LearningRecord,
  pool: QuestionPool,
  today: number,
  toDay: ToDay,
  dateKey: string,
): string[] | null {
  return nextTodayGroup(r, pool, today, toDay, dateKey)?.ids ?? null;
}

/**
 * The summary's 「继续下一项」 target (from=today): null unless the group is finished, came from
 * today, has the today index AND the learning record is loaded (an owner's GET pending or a fresh
 * reload would plan from an empty record); then the next today group with the group's endedAt as
 * its run nonce, or "/" when the day is done.
 */
export function summaryNextHref(
  s: Pick<SessionState, "finished" | "endedAt">,
  fromToday: boolean,
  loaded: boolean,
  r: LearningRecord,
  pool: QuestionPool | null,
  now: number,
  toDay: ToDay,
  dateKey: string,
): string | null {
  if (!s.finished || !fromToday || !pool || !loaded) return null;
  const next = nextTodayGroup(r, pool, toDay(now), toDay, dateKey);
  return next ? `${todayHref(next.kind, next.ids)}&run=${s.endedAt ?? now}` : "/";
}
