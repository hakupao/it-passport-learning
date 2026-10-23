// Stage 7 Phase 1 (D-190 §0-1 / §0-2 / §0-4, DESIGN §5.2) — learning record v2
// pure model: schema, updates, merge, compact wire format and trust-boundary
// parsing. No I/O, no React; safe to import from client components. The v1
// model and the v1 ⇄ v2 bridge live in ./recordV1 (which imports this module,
// never the other way round).
//
// Merge is commutative, associative and idempotent (local ⇄ server sync can
// merge in any order):
//   - attempts: per question, union of both lists → sort by compareAttempts →
//     drop repeats of the dedupe key (at, choice, correct), keeping the one that
//     ranks first → keep the first ATTEMPTS_K. "Union, then top-K of a total
//     order" gives the same result for any grouping. Empty lists are dropped.
//   - unitsRead and v2Since: the smaller value wins (v2Since absent → the other).
//   - settings: per key last-writer-wins — larger `at`; equal `at` → the
//     lexicographically larger JSON.stringify(value).
// compareAttempts is the one total order: `at` desc → `choice` desc →
// correct=false first → src mock > practice > v1. Merge, latestResult and the
// v1 downgrade all use it.
//
// Merge output is canonical: map keys are sorted, attempt lists normalized,
// fields in a fixed order and v2Since present only when defined, so
// JSON.stringify(merge(a, b)) === JSON.stringify(merge(b, a)).
//
// Maps are always built with spread / Object.fromEntries (CreateDataProperty),
// so a "__proto__" key stays ordinary data and never touches the prototype.
//
// Imports are relative (not `@/`): e2e specs import this module by relative path.

import { CHOICE_LETTERS, type QuizQuestion } from "../quiz/quizModel";

export type ChoiceLetter = "ア" | "イ" | "ウ" | "エ";
export type AttemptSrc = "practice" | "mock" | "v1";

export interface Attempt {
  /** epoch ms */
  at: number;
  choice: ChoiceLetter;
  correct: boolean;
  /** "v1" = upgraded from a v1 record */
  src: AttemptSrc;
}

export interface LwwValue<T> {
  value: T;
  /** epoch ms of the write */
  at: number;
}

export interface LearningSettings {
  /** YYYY-MM-DD */
  examDate?: LwwValue<string>;
  dailyReviewCap?: LwwValue<number>;
  dailyNewTarget?: LwwValue<number>;
  transDefault?: LwwValue<"hidden" | "shown">;
}

export interface LearningRecord {
  v: 2;
  /** qid → the latest ATTEMPTS_K attempts, in compareAttempts order */
  attempts: Record<string, Attempt[]>;
  /** unitId → epoch ms of the first read */
  unitsRead: Record<string, number>;
  settings: LearningSettings;
  /** first time this record was written as v2 (migration scheduling) */
  v2Since?: number;
}

export interface TopicStat {
  topicId: string;
  total: number;
  answered: number;
  correct: number;
}

export type SettingKey = keyof LearningSettings;
export type SettingValue<K extends SettingKey> = NonNullable<LearningSettings[K]>["value"];

/** [at, choice index into CHOICE_LETTERS, correct 0|1, src "p"|"m"|"1"] */
export type WireAttempt = [at: number, choice: 0 | 1 | 2 | 3, correct: 0 | 1, src: "p" | "m" | "1"];

/** Compact wire / storage form (localStorage, /api/learning, Redis). */
export interface WireRecordV2 {
  v: 2;
  a: Record<string, WireAttempt[]>;
  u: Record<string, number>;
  s: { [K in SettingKey]?: [value: SettingValue<K>, at: number] };
  since?: number;
}

export const ATTEMPTS_K = 10;
export const LEARNING_STORAGE_KEY = "itp:learn:v2";

export const SETTING_DEFAULTS: {
  dailyReviewCap: number;
  dailyNewTarget: number;
  transDefault: "hidden" | "shown";
} = { dailyReviewCap: 30, dailyNewTarget: 10, transDefault: "hidden" };

export const SETTING_RANGES: {
  dailyReviewCap: readonly [min: number, max: number];
  dailyNewTarget: readonly [min: number, max: number];
} = { dailyReviewCap: [10, 100], dailyNewTarget: [0, 50] };

/** Fixed key order of `settings` in canonical output. */
const SETTING_KEYS = [
  "examDate",
  "dailyReviewCap",
  "dailyNewTarget",
  "transDefault",
] as const satisfies readonly SettingKey[];

const SRC_RANK: Record<AttemptSrc, number> = { mock: 0, practice: 1, v1: 2 };
const SRC_CODE = { practice: "p", mock: "m", v1: "1" } as const satisfies Record<AttemptSrc, WireAttempt[3]>;

const hasOwn = (o: object, k: string): boolean => Object.prototype.hasOwnProperty.call(o, k);

const own = (m: Record<string, Attempt[]>, k: string): Attempt[] => (hasOwn(m, k) ? m[k]! : []);

const isMap = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);

/** Largest valid Date value (ms). Times above it are rejected: at >= 2^53 would make `max + 1 === max`. */
const MAX_TIME = 8.64e15;

const isTime = (x: unknown): x is number =>
  typeof x === "number" && Number.isFinite(x) && x >= 0 && x <= MAX_TIME;

const EXAM_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** YYYY-MM-DD naming a real calendar date (2026-02-30 is rejected). Never throws. */
function isCalendarDate(v: string): boolean {
  if (!EXAM_DATE_RE.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

export const isChoiceLetter = (x: unknown): x is ChoiceLetter =>
  typeof x === "string" && (CHOICE_LETTERS as readonly string[]).includes(x);

function isSettingValue(key: SettingKey, v: unknown): boolean {
  switch (key) {
    case "examDate":
      return typeof v === "string" && isCalendarDate(v);
    case "dailyReviewCap":
    case "dailyNewTarget":
      return typeof v === "number" && Number.isFinite(v);
    case "transDefault":
      return v === "hidden" || v === "shown";
  }
}

/** Numeric settings are rounded to an integer, then clamped into SETTING_RANGES; other values pass through. */
function clampSetting<K extends SettingKey>(key: K, v: SettingValue<K>): SettingValue<K> {
  const k: SettingKey = key;
  if ((k === "dailyReviewCap" || k === "dailyNewTarget") && typeof v === "number") {
    const [min, max] = SETTING_RANGES[k];
    return Math.min(max, Math.max(min, Math.round(v))) as SettingValue<K>;
  }
  return v;
}

/** `at` must be finite epoch ms in [0, 8.64e15] (what parseRecord accepts); anything else is a caller bug. */
function assertFiniteAt(at: number): void {
  if (!isTime(at)) {
    throw new RangeError(`learning record: at must be finite epoch ms in [0, ${MAX_TIME}], got ${at}`);
  }
}

export function emptyRecord(): LearningRecord {
  return { v: 2, attempts: {}, unitsRead: {}, settings: {} };
}

/** The total order of attempts: negative when `x` ranks before (is "later" than) `y`. */
export function compareAttempts(x: Attempt, y: Attempt): number {
  if (x.at !== y.at) return x.at > y.at ? -1 : 1;
  if (x.choice !== y.choice) return x.choice > y.choice ? -1 : 1;
  if (x.correct !== y.correct) return x.correct ? 1 : -1;
  return SRC_RANK[x.src] - SRC_RANK[y.src];
}

const sameKey = (x: Attempt, y: Attempt): boolean => x.at === y.at && x.choice === y.choice && x.correct === y.correct;

/** Sort → dedupe on (at, choice, correct) keeping the first-ranked → top ATTEMPTS_K. Fresh objects. */
function normalizeAttempts(list: readonly Attempt[]): Attempt[] {
  const sorted = list.map(({ at, choice, correct, src }) => ({ at, choice, correct, src })).sort(compareAttempts);
  const out: Attempt[] = [];
  for (const x of sorted) {
    if (out.length > 0 && sameKey(out[out.length - 1]!, x)) continue;
    out.push(x);
    if (out.length === ATTEMPTS_K) break;
  }
  return out;
}

/** The first attempt for `qid` in total order (= the latest answer), whatever the stored list order. */
export function latestResult(r: LearningRecord, qid: string): Attempt | undefined {
  let best: Attempt | undefined;
  for (const x of own(r.attempts, qid)) if (best === undefined || compareAttempts(x, best) < 0) best = x;
  return best;
}

/**
 * Add an attempt for `qid` (src "practice" (default) or "mock"). Returns a new
 * record; `r` is untouched. `at` is finite epoch ms in [0, 8.64e15], `choice`
 * one of ア/イ/ウ/エ and `src` practice/mock — anything else throws RangeError.
 * The new attempt always ranks first for `qid`, even when the clock went
 * backwards: the stored `at` is at least the question's previous max `at` + 1.
 * Same-day repeats are all stored.
 */
export function recordAttempt(
  r: LearningRecord,
  qid: string,
  choice: ChoiceLetter,
  correct: boolean,
  at: number,
  src: "practice" | "mock" = "practice",
): LearningRecord {
  assertFiniteAt(at);
  if (!isChoiceLetter(choice)) throw new RangeError(`learning record: choice must be ア/イ/ウ/エ, got ${choice}`);
  if (src !== "practice" && src !== "mock") throw new RangeError(`learning record: src must be practice/mock, got ${src}`);
  const prev = own(r.attempts, qid);
  const stamped = Math.max(at, prev.reduce((m, x) => Math.max(m, x.at), -1) + 1);
  const list = normalizeAttempts([{ at: stamped, choice, correct, src }, ...prev]);
  return { ...r, attempts: { ...r.attempts, [qid]: list } };
}

/**
 * Record the first read of `unitId`; an existing value is kept (returns `r` as-is).
 * `at` is finite, non-negative epoch ms — anything else throws RangeError.
 */
export function markUnitRead(r: LearningRecord, unitId: string, at: number): LearningRecord {
  assertFiniteAt(at);
  if (hasOwn(r.unitsRead, unitId)) return r;
  return { ...r, unitsRead: { ...r.unitsRead, [unitId]: at } };
}

/**
 * Set a setting (last-writer-wins). Numeric values are rounded to an integer and
 * clamped into SETTING_RANGES; a value outside the schema (non-finite number,
 * examDate not a real YYYY-MM-DD date, unknown transDefault) or a bad `at`
 * throws RangeError. Like recordAttempt, a re-set on this device wins over this
 * record's previous value even on a skewed clock: the stored `at` is at least
 * the previous `at` + 1.
 */
export function setSetting<K extends SettingKey>(
  r: LearningRecord,
  key: K,
  value: SettingValue<K>,
  at: number,
): LearningRecord {
  assertFiniteAt(at);
  if (!isSettingValue(key, value)) throw new RangeError(`learning record: invalid ${key} ${String(value)}`);
  const prev = r.settings[key];
  const stamped = prev === undefined ? at : Math.max(at, prev.at + 1);
  return { ...r, settings: { ...r.settings, [key]: { value: clampSetting(key, value), at: stamped } } };
}

type DefaultedKey = keyof typeof SETTING_DEFAULTS;

/** The setting's value, or its default (examDate has none → undefined). Numbers are clamped. */
export function settingValue<K extends DefaultedKey>(r: LearningRecord, key: K): SettingValue<K>;
export function settingValue(r: LearningRecord, key: "examDate"): string | undefined;
export function settingValue(r: LearningRecord, key: SettingKey): SettingValue<SettingKey> | undefined {
  const v = r.settings[key]?.value;
  if (v !== undefined) return clampSetting(key, v);
  return key === "examDate" ? undefined : SETTING_DEFAULTS[key];
}

const sortedObject = <T>(m: Map<string, T>): Record<string, T> =>
  Object.fromEntries([...m].sort(([x], [y]) => (x < y ? -1 : x > y ? 1 : 0)));

type LooseSettings = Partial<Record<SettingKey, LwwValue<unknown>>>;

/** x wins over y under LWW: larger `at`; equal `at` → larger JSON text. */
const lwwWins = (x: LwwValue<unknown>, y: LwwValue<unknown>): boolean =>
  x.at !== y.at ? x.at > y.at : JSON.stringify(x.value) > JSON.stringify(y.value);

function mergeSettings(a: LearningSettings, b: LearningSettings): LearningSettings {
  const [x, y] = [a as LooseSettings, b as LooseSettings];
  const out: LooseSettings = {};
  for (const k of SETTING_KEYS) {
    const [p, q] = [x[k], y[k]];
    const w = p === undefined ? q : q === undefined || !lwwWins(q, p) ? p : q;
    if (w !== undefined) out[k] = { value: w.value, at: w.at };
  }
  return out as LearningSettings;
}

const minDefined = (x: number | undefined, y: number | undefined): number | undefined =>
  x === undefined ? y : y === undefined ? x : Math.min(x, y);

export function mergeRecords(a: LearningRecord, b: LearningRecord): LearningRecord {
  const attempts = new Map<string, Attempt[]>();
  for (const k of new Set([...Object.keys(a.attempts), ...Object.keys(b.attempts)])) {
    const list = normalizeAttempts([...own(a.attempts, k), ...own(b.attempts, k)]);
    if (list.length > 0) attempts.set(k, list);
  }
  const unitsRead = new Map(Object.entries(a.unitsRead));
  for (const [k, y] of Object.entries(b.unitsRead)) {
    const x = unitsRead.get(k);
    if (x === undefined || y < x) unitsRead.set(k, y);
  }
  const v2Since = minDefined(a.v2Since, b.v2Since);
  return {
    v: 2,
    attempts: sortedObject(attempts),
    unitsRead: sortedObject(unitsRead),
    settings: mergeSettings(a.settings, b.settings),
    ...(v2Since === undefined ? {} : { v2Since }),
  };
}

/** JSON of the canonical form of `r` (mergeRecords output is canonical), for "did anything change" checks. */
export const canonicalJson = (r: LearningRecord): string => JSON.stringify(mergeRecords(r, emptyRecord()));

/**
 * mergeRecords(prev, other), or `prev` itself when `other` adds nothing — so a
 * React state update with the result is a no-op (no re-render) when nothing is new.
 */
export function mergeIfChanged(prev: LearningRecord, other: LearningRecord): LearningRecord {
  const merged = mergeRecords(prev, other);
  return canonicalJson(merged) === canonicalJson(prev) ? prev : merged;
}

const sameList = (x: readonly Attempt[], y: readonly Attempt[]): boolean =>
  x.length === y.length && x.every((a, i) => sameKey(a, y[i]!) && a.src === y[i]!.src);

/**
 * The part of `current` that `synced` does not already hold (canonical form):
 * per question the whole attempt list when it differs from (or is missing in)
 * `synced`; unitsRead entries and settings whose value differs; v2Since when it
 * differs. `synced` null → all of `current`. mergeRecords(synced,
 * deltaSince(current, synced)) equals mergeRecords(synced, current), so the
 * server (which merges every PUT with its copy) can take the delta in place of
 * the full record.
 */
export function deltaSince(current: LearningRecord, synced: LearningRecord | null): LearningRecord {
  if (!synced) return mergeRecords(current, emptyRecord());
  const attempts: [string, Attempt[]][] = [];
  for (const [k, list] of Object.entries(current.attempts)) {
    if (!sameList(list, own(synced.attempts, k))) attempts.push([k, list]);
  }
  const unitsRead: [string, number][] = [];
  for (const [k, t] of Object.entries(current.unitsRead)) {
    if (!hasOwn(synced.unitsRead, k) || synced.unitsRead[k] !== t) unitsRead.push([k, t]);
  }
  const [cur, syn] = [current.settings as LooseSettings, synced.settings as LooseSettings];
  const settings: LooseSettings = {};
  for (const k of SETTING_KEYS) {
    const [x, y] = [cur[k], syn[k]];
    if (x !== undefined && (y === undefined || y.at !== x.at || JSON.stringify(y.value) !== JSON.stringify(x.value))) {
      settings[k] = x;
    }
  }
  const since = current.v2Since !== synced.v2Since ? current.v2Since : undefined;
  const delta: LearningRecord = {
    v: 2,
    attempts: Object.fromEntries(attempts),
    unitsRead: Object.fromEntries(unitsRead),
    settings: settings as LearningSettings,
    ...(since === undefined ? {} : { v2Since: since }),
  };
  return mergeRecords(delta, emptyRecord());
}

// ---- wire format ---------------------------------------------------------------

const encodeAttempt = (x: Attempt): WireAttempt => [
  x.at,
  CHOICE_LETTERS.indexOf(x.choice) as WireAttempt[1],
  x.correct ? 1 : 0,
  SRC_CODE[x.src],
];

/** Compact wire form of `r` (key order as in `r`; pass a merge result for canonical output). */
export function encodeRecord(r: LearningRecord): WireRecordV2 {
  const settings = r.settings as LooseSettings;
  const s: Partial<Record<SettingKey, [unknown, number]>> = {};
  for (const k of SETTING_KEYS) {
    const x = settings[k];
    if (x !== undefined) s[k] = [x.value, x.at];
  }
  return {
    v: 2,
    a: Object.fromEntries(Object.entries(r.attempts).map(([k, list]) => [k, list.map(encodeAttempt)])),
    u: Object.fromEntries(Object.entries(r.unitsRead)),
    s: s as WireRecordV2["s"],
    ...(r.v2Since === undefined ? {} : { since: r.v2Since }),
  };
}

function decodeSrc(x: unknown): AttemptSrc | null {
  return x === "p" ? "practice" : x === "m" ? "mock" : x === "1" ? "v1" : null;
}

function parseWireAttempt(e: unknown): Attempt | null {
  if (!Array.isArray(e) || e.length !== 4) return null;
  const [at, idx, correct, code] = e as unknown[];
  const src = decodeSrc(code);
  if (!isTime(at) || !Number.isInteger(idx) || (correct !== 0 && correct !== 1) || src === null) return null;
  const choice = CHOICE_LETTERS[idx as number];
  if (choice === undefined) return null;
  return { at, choice, correct: correct === 1, src };
}

/**
 * Trust boundary for localStorage / network data: accepts only the v2 wire
 * form (times in [0, 8.64e15], examDate a real calendar date, numeric settings
 * integers). Returns a fresh record in canonical form (unknown fields and unknown
 * settings dropped; attempt lists sorted, deduped and cut to ATTEMPTS_K), or
 * null when anything does not match the schema. Never throws.
 */
export function parseRecord(x: unknown): LearningRecord | null {
  if (!isMap(x) || x.v !== 2 || !isMap(x.a) || !isMap(x.u) || !isMap(x.s)) return null;
  if (x.since !== undefined && !isTime(x.since)) return null;
  const attempts: [string, Attempt[]][] = [];
  for (const [k, list] of Object.entries(x.a)) {
    if (!Array.isArray(list)) return null;
    const parsed: Attempt[] = [];
    for (const e of list) {
      const a = parseWireAttempt(e);
      if (a === null) return null;
      parsed.push(a);
    }
    attempts.push([k, parsed]);
  }
  const unitsRead: [string, number][] = [];
  for (const [k, t] of Object.entries(x.u)) {
    if (!isTime(t)) return null;
    unitsRead.push([k, t]);
  }
  const settings: LooseSettings = {};
  for (const k of SETTING_KEYS) {
    if (!hasOwn(x.s, k)) continue;
    const t = x.s[k];
    if (!Array.isArray(t) || t.length !== 2 || !isTime(t[1]) || !isSettingValue(k, t[0])) return null;
    if (typeof t[0] === "number" && !Number.isInteger(t[0])) return null; // numeric settings are integers
    settings[k] = { value: t[0], at: t[1] };
  }
  const record: LearningRecord = {
    v: 2,
    attempts: Object.fromEntries(attempts),
    unitsRead: Object.fromEntries(unitsRead),
    settings: settings as LearningSettings,
    ...(x.since === undefined ? {} : { v2Since: x.since }),
  };
  return mergeRecords(record, emptyRecord());
}

/** Per-topic totals over `questions` from each question's latest attempt (insertion order = first appearance of each topic). */
export function topicStats(
  r: LearningRecord,
  questions: Pick<QuizQuestion, "id" | "topic_id">[],
): Map<string, TopicStat> {
  const stats = new Map<string, TopicStat>();
  for (const { id, topic_id } of questions) {
    let s = stats.get(topic_id);
    if (!s) {
      s = { topicId: topic_id, total: 0, answered: 0, correct: 0 };
      stats.set(topic_id, s);
    }
    s.total++;
    const res = latestResult(r, id);
    if (res) {
      s.answered++;
      if (res.correct) s.correct++;
    }
  }
  return stats;
}
