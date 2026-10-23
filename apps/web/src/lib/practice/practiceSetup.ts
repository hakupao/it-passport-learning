// Stage 7 Phase 1 Task 10 (D-189 §6.2 设置面板 / D-190 §0-12) — the practice setup panel's pure layer
// (no React, no DOM; bundler-safe, relative imports like ./practiceSession).
//
//   - SetupSettings: scope kind (topic = 領域 multi-select | exam = one 年度 | mistakes | due |
//     random), topics, exam, count (10 | 20 | 50 | all), order (seq | rand).
//   - setupHref: the §0-12 URL of the settings. topic / exam → the filter form
//     `/practice?topic=a,b&n=20&order=seq` (`exam=<id>` likewise; order=rand adds `&seed=<uint32>`,
//     the server resolves the list). mistakes / due / random → the ids form `/practice?ids=…`
//     computed here from the browser's record (≤ MAX_SCOPE_IDS; 全部 = MAX_SCOPE_IDS). For mistakes /
//     due, order=seq keeps the n most urgent (dueDay, qid) and lists them by question id (= exam /
//     question-number order); order=rand shuffles the whole list with mulberry32(seed), then takes n. `run` (the click time) is appended so starting
//     the same list again is a new group, not the finished summary stored in this tab (Task 9 §0-13).
//     null = nothing to practise (no topic / exam chosen, or an empty list).
//   - mistakeIds: every current mistake (reviewState + classify = "mistake", not only those due
//     today; independent of dailyPlan's cap), by (dueDay, qid). dueIds: every due review
//     (classify = "due", dueDay <= today), by (dueDay, qid). Only questions of the pool count.
//   - randomIds: never-answered questions by the official category ratio (pickNew with
//     fillWeakTopics: false), seeded by the given seed instead of the date, so each start draws anew.
//   - Last settings (localStorage `itp:practice:last:v1`, LAST_SETTINGS_KEY): the settings, never
//     the computed ids (「按上次的条件继续」 recomputes mistakes / due / random). parseLastSettings
//     validates the JSON (unknown topics / exam dropped; a topic / exam scope left empty → null).
//     load / save never throw.
//   - prefillOf: the topics / exam a setup URL pre-selects (`?topic=X&prefill=1` from a legacy /quiz
//     link, or a filter URL whose ids were all invalid): unknown ids dropped.

import { mulberry32 } from "../hash";
import type { LearningRecord } from "../learning/record";
import { classify, pickNew, reviewState, type QuestionPool, type ToDay } from "../learning/schedule";
import type { StorageLike } from "../storage";
import { MAX_SCOPE_IDS, type SearchParams } from "./practiceSession";

export const LAST_SETTINGS_KEY = "itp:practice:last:v1";

export type SetupKind = "topic" | "exam" | "mistakes" | "due" | "random";
export type SetupCount = 10 | 20 | 50 | "all";
export type SetupOrder = "seq" | "rand";

export const SETUP_KINDS: readonly SetupKind[] = ["topic", "exam", "mistakes", "due", "random"];
export const SETUP_COUNTS: readonly SetupCount[] = [10, 20, 50, "all"];
export const SETUP_ORDERS: readonly SetupOrder[] = ["seq", "rand"];

export interface SetupSettings {
  kind: SetupKind;
  /** kind "topic": the chosen topic ids */
  topics: string[];
  /** kind "exam": the chosen exam id */
  exam: string | null;
  n: SetupCount;
  order: SetupOrder;
}

export const DEFAULT_SETTINGS: SetupSettings = { kind: "topic", topics: [], exam: null, n: 20, order: "seq" };

const byDueThenId = (x: { id: string; due: number }, y: { id: string; due: number }): number =>
  x.due !== y.due ? x.due - y.due : x.id < y.id ? -1 : x.id > y.id ? 1 : 0;

function classified(
  r: LearningRecord,
  pool: QuestionPool,
  today: number,
  toDay: ToDay,
  want: "mistake" | "due",
): string[] {
  const inPool = new Set(Object.values(pool.topicQuestionIds).flat());
  const out: { id: string; due: number }[] = [];
  for (const [qid, list] of Object.entries(r.attempts)) {
    if (!inPool.has(qid)) continue;
    const s = reviewState(list, r.v2Since, qid, toDay);
    if (s === null || classify(s, today) !== want) continue;
    out.push({ id: qid, due: s.dueDay ?? Number.MAX_SAFE_INTEGER });
  }
  return out.sort(byDueThenId).map((x) => x.id);
}

/** Every current mistake of the pool, by (dueDay, qid). */
export function mistakeIds(r: LearningRecord, pool: QuestionPool, today: number, toDay: ToDay): string[] {
  return classified(r, pool, today, toDay, "mistake");
}

/** Every review due today or earlier (not mistakes), by (dueDay, qid). */
export function dueIds(r: LearningRecord, pool: QuestionPool, today: number, toDay: ToDay): string[] {
  return classified(r, pool, today, toDay, "due");
}

/** Up to n never-answered questions by the category ratio, drawn with `seed` (chumon groups whole). */
export function randomIds(r: LearningRecord, pool: QuestionPool, n: number, seed: number): string[] {
  return pickNew(r, pool, n, `random:${seed}`, { fillWeakTopics: false });
}

/** Questions a count stands for in an ids URL (全部 → MAX_SCOPE_IDS). */
export function idsCount(n: SetupCount): number {
  return n === "all" ? MAX_SCOPE_IDS : Math.min(n, MAX_SCOPE_IDS);
}

function shuffled(ids: readonly string[], seed: number): string[] {
  const out = [...ids];
  const rand = mulberry32(seed >>> 0);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

const runPart = (run: number | null | undefined): string => (run == null ? "" : `&run=${Math.trunc(run)}`);

/** `/practice?ids=…` of a client-computed list (order=rand shuffles first; ≤ MAX_SCOPE_IDS); null when empty. */
export function idsHref(
  ids: readonly string[],
  n: SetupCount,
  order: SetupOrder,
  seed: number,
  run?: number | null,
): string | null {
  const list = (order === "rand" ? shuffled(ids, seed) : [...ids]).slice(0, idsCount(n));
  return list.length === 0 ? null : `/practice?ids=${list.join(",")}${runPart(run)}`;
}

/** The §0-12 filter URL of a topic / exam scope; null when nothing is chosen. */
export function filterHref(s: SetupSettings, seed: number, run?: number | null): string | null {
  let scope: string;
  if (s.kind === "topic") {
    if (s.topics.length === 0) return null;
    scope = `topic=${s.topics.join(",")}`;
  } else if (s.kind === "exam") {
    if (s.exam === null) return null;
    scope = `exam=${s.exam}`;
  } else return null;
  const seedPart = s.order === "rand" ? `&seed=${seed >>> 0}` : "";
  return `/practice?${scope}&n=${s.n}&order=${s.order}${seedPart}${runPart(run)}`;
}

const byId = (x: string, y: string): number => (x < y ? -1 : x > y ? 1 : 0);

/** mistakes / due (urgent first): seq → the n most urgent in qid order; rand → a seeded sample. */
function reviewHref(urgent: readonly string[], s: SetupSettings, seed: number, run?: number | null): string | null {
  if (s.order === "rand") return idsHref(urgent, s.n, "rand", seed, run);
  return idsHref(urgent.slice(0, idsCount(s.n)).sort(byId), "all", "seq", seed, run);
}

export interface SetupContext {
  record: LearningRecord;
  pool: QuestionPool;
  today: number;
  toDay: ToDay;
  /** uint32: the rand order's shuffle / the random scope's draw */
  seed: number;
  /** the start's nonce (click time; see header); null = none */
  run?: number | null;
}

/** The practice URL of the settings (see header); null = nothing to practise. */
export function setupHref(s: SetupSettings, ctx: SetupContext): string | null {
  const { record, pool, today, toDay, seed, run } = ctx;
  switch (s.kind) {
    case "topic":
    case "exam":
      return filterHref(s, seed, run);
    case "mistakes":
      return reviewHref(mistakeIds(record, pool, today, toDay), s, seed, run);
    case "due":
      return reviewHref(dueIds(record, pool, today, toDay), s, seed, run);
    case "random":
      // already in random order; whole chumon groups may run past n (§0-8) — the URL cap still holds
      return idsHref(randomIds(record, pool, idsCount(s.n), seed), "all", "seq", seed, run);
  }
}

// ---- last settings ----

const isRecord = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);

/** Validated last settings from the stored JSON; null when absent, malformed or now empty. */
export function parseLastSettings(
  raw: string | null,
  validTopics: ReadonlySet<string>,
  validExams: ReadonlySet<string>,
): SetupSettings | null {
  if (raw === null) return null;
  let doc: unknown;
  try {
    doc = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(doc) || doc.v !== 1) return null;
  const kind = SETUP_KINDS.find((k) => k === doc.kind);
  const n = SETUP_COUNTS.find((c) => c === doc.n);
  const order = SETUP_ORDERS.find((o) => o === doc.order);
  if (kind === undefined || n === undefined || order === undefined) return null;
  const topics = Array.isArray(doc.topics)
    ? [...new Set(doc.topics.filter((t): t is string => typeof t === "string" && validTopics.has(t)))]
    : [];
  const exam = typeof doc.exam === "string" && validExams.has(doc.exam) ? doc.exam : null;
  if (kind === "topic" && topics.length === 0) return null;
  if (kind === "exam" && exam === null) return null;
  return { kind, topics: kind === "topic" ? topics : [], exam: kind === "exam" ? exam : null, n, order };
}

export function serializeSettings(s: SetupSettings): string {
  return JSON.stringify({ v: 1, kind: s.kind, topics: s.topics, exam: s.exam, n: s.n, order: s.order });
}

/** The stored last settings (validated); null when none or storage is unusable. Never throws. */
export function loadLastSettings(
  storage: StorageLike | null,
  validTopics: ReadonlySet<string>,
  validExams: ReadonlySet<string>,
): SetupSettings | null {
  if (!storage) return null;
  let raw: string | null;
  try {
    raw = storage.getItem(LAST_SETTINGS_KEY);
  } catch {
    return null;
  }
  return parseLastSettings(raw, validTopics, validExams);
}

/** Store the settings as the last ones. Never throws. */
export function saveLastSettings(storage: StorageLike | null, s: SetupSettings): void {
  try {
    storage?.setItem(LAST_SETTINGS_KEY, serializeSettings(s));
  } catch {
    // quota / blocked storage: 「按上次的条件继续」 is just not offered next time
  }
}

// ---- URL pre-selection ----

const first = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v);

/** The topics / exam a setup URL pre-selects (unknown dropped, input order, deduped). */
export function prefillOf(
  sp: SearchParams,
  validTopics: ReadonlySet<string>,
  validExams: ReadonlySet<string>,
): { topics: string[]; exam: string | null } {
  const topics = [
    ...new Set(
      (first(sp.topic) ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter((t) => validTopics.has(t)),
    ),
  ];
  const e = first(sp.exam);
  return { topics, exam: e !== undefined && validExams.has(e) ? e : null };
}

/** The settings the panel opens with for a pre-selection (topics win over an exam). */
export function settingsFromPrefill(p: { topics: string[]; exam: string | null }): SetupSettings {
  if (p.topics.length > 0) return { ...DEFAULT_SETTINGS, kind: "topic", topics: [...p.topics] };
  if (p.exam !== null) return { ...DEFAULT_SETTINGS, kind: "exam", exam: p.exam, n: "all" };
  return { ...DEFAULT_SETTINGS };
}

/**
 * A static practice link made fresh at click time: `&seed=<uint32>` when `seed` is given (order=rand;
 * without it the page redirects to a random seed itself) and `&run=<now>` (a new group, see header).
 */
export function withNonce(href: string, now: number, seed?: number): string {
  const seedPart = seed === undefined ? "" : `&seed=${seed >>> 0}`;
  const extra = `${seedPart}&run=${Math.trunc(now)}`;
  return href.includes("?") ? `${href}${extra}` : `${href}?${extra.slice(1)}`;
}
