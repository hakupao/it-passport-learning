// Test-only: a frozen copy of the pre-Stage-7 v1 client (D-180 §0-6 / §0-7) —
// the v1 record model (recordAnswer / mergeRecords / canonicalJson /
// mergeIfChanged / deltaSince) and the v1 sync calls (GET /api/learning with no
// `?v`, PUT a v1 body). Stage 7 moved the app to record v2 (D-190), but old
// tabs keep running this code until they reload, so the route tests drive the
// server with it to prove an old tab still works (Review Focus 1). Copied
// verbatim from src/lib/learning/recordV1.ts / syncClient.ts as of 7f32a45 —
// do not "fix" it: it must behave like the deployed v1 bundle.

import { parseRecordV1, type LearningRecordV1, type QuestionResultV1 } from "../recordV1";
import { KEEPALIVE_MAX_BYTES, LEARNING_API_PATH, type FetchLike } from "../syncClient";

const hasOwn = (o: object, k: string): boolean => Object.prototype.hasOwnProperty.call(o, k);

function assertFiniteAt(at: number): void {
  if (!Number.isFinite(at) || at < 0) {
    throw new RangeError(`learning record: at must be finite non-negative epoch ms, got ${at}`);
  }
}

export function emptyRecordV1(): LearningRecordV1 {
  return { v: 1, questions: {}, unitsRead: {} };
}

export function recordAnswerV1(
  r: LearningRecordV1,
  qid: string,
  choice: string,
  correct: boolean,
  at: number,
): LearningRecordV1 {
  assertFiniteAt(at);
  const existing = hasOwn(r.questions, qid) ? r.questions[qid] : undefined;
  const stamped = Math.max(at, (existing?.at ?? -1) + 1);
  return { ...r, questions: { ...r.questions, [qid]: { choice, correct, at: stamped } } };
}

function wins(x: QuestionResultV1, y: QuestionResultV1): boolean {
  if (x.at !== y.at) return x.at > y.at;
  if (x.choice !== y.choice) return x.choice > y.choice;
  return !x.correct && y.correct;
}

const sortedObject = <T>(m: Map<string, T>): Record<string, T> =>
  Object.fromEntries([...m].sort(([x], [y]) => (x < y ? -1 : x > y ? 1 : 0)));

export function mergeRecordsV1(a: LearningRecordV1, b: LearningRecordV1): LearningRecordV1 {
  const questions = new Map(Object.entries(a.questions));
  for (const [k, y] of Object.entries(b.questions)) {
    const x = questions.get(k);
    if (x === undefined || wins(y, x)) questions.set(k, y);
  }
  const unitsRead = new Map(Object.entries(a.unitsRead));
  for (const [k, y] of Object.entries(b.unitsRead)) {
    const x = unitsRead.get(k);
    if (x === undefined || y < x) unitsRead.set(k, y);
  }
  return { v: 1, questions: sortedObject(questions), unitsRead: sortedObject(unitsRead) };
}

export const canonicalJsonV1 = (r: LearningRecordV1): string => JSON.stringify(mergeRecordsV1(r, emptyRecordV1()));

export function mergeIfChangedV1(prev: LearningRecordV1, other: LearningRecordV1): LearningRecordV1 {
  const merged = mergeRecordsV1(prev, other);
  return canonicalJsonV1(merged) === canonicalJsonV1(prev) ? prev : merged;
}

export function deltaSinceV1(current: LearningRecordV1, synced: LearningRecordV1 | null): LearningRecordV1 {
  if (!synced) return mergeRecordsV1(current, emptyRecordV1());
  const questions = new Map<string, QuestionResultV1>();
  for (const [k, x] of Object.entries(current.questions)) {
    const y = hasOwn(synced.questions, k) ? synced.questions[k] : undefined;
    if (!y || y.at !== x.at || y.choice !== x.choice || y.correct !== x.correct) questions.set(k, x);
  }
  const unitsRead = new Map<string, number>();
  for (const [k, t] of Object.entries(current.unitsRead)) {
    if (!hasOwn(synced.unitsRead, k) || synced.unitsRead[k] !== t) unitsRead.set(k, t);
  }
  return { v: 1, questions: sortedObject(questions), unitsRead: sortedObject(unitsRead) };
}

// ---- v1 sync calls (old syncClient) ---------------------------------------------

async function callV1(
  fetchImpl: FetchLike,
  method: "GET" | "PUT",
  init: RequestInit,
  signal?: AbortSignal,
): Promise<LearningRecordV1 | null> {
  try {
    const res = await fetchImpl(LEARNING_API_PATH, { ...init, method, cache: "no-store", signal });
    if (!res.ok) {
      console.warn(`[learning-sync] ${method} failed: HTTP ${res.status}`);
      return null;
    }
    const record = parseRecordV1(await res.json());
    if (!record) console.warn(`[learning-sync] ${method} failed: invalid record in response`);
    return record;
  } catch (err) {
    if (signal?.aborted) return null;
    console.warn(`[learning-sync] ${method} failed: ${err instanceof Error ? err.name : typeof err}`);
    return null;
  }
}

/** Old v1 GET: `/api/learning` with no query (the route answers v1). */
export function pullRemoteV1(fetchImpl: FetchLike, signal?: AbortSignal): Promise<LearningRecordV1 | null> {
  return callV1(fetchImpl, "GET", {}, signal);
}

/** Old v1 PUT: the v1 record as the body (the route answers v1). */
export function pushRemoteV1(
  fetchImpl: FetchLike,
  r: LearningRecordV1,
  { signal, keepalive = false }: { signal?: AbortSignal; keepalive?: boolean } = {},
): Promise<LearningRecordV1 | null> {
  return callV1(
    fetchImpl,
    "PUT",
    { headers: { "Content-Type": "application/json" }, body: JSON.stringify(r), keepalive },
    signal,
  );
}

export function hideFlushPlanV1(
  current: LearningRecordV1,
  synced: LearningRecordV1 | null,
): { record: LearningRecordV1; keepalive: boolean } {
  const delta = deltaSinceV1(current, synced);
  return new TextEncoder().encode(JSON.stringify(delta)).byteLength <= KEEPALIVE_MAX_BYTES
    ? { record: delta, keepalive: true }
    : { record: current, keepalive: false };
}
