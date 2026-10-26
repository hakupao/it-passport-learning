// Stage 7 Phase 2 (D-192 ② / D-193 §0-4 / §0-6) — resumable mock state.
// Pure: the state kept in localStorage under MOCK_STORAGE_KEY (one mock at a
// time), its never-throwing parser and the reducer the exam page runs. No I/O.
//
// Reducer rules:
//   - pick / flag only act on ids of this mock and only before the finish.
//   - go clamps to the question list.
//   - finish: endedAt = min(now, deadline(startedAt)); an ended mock is kept as-is
//     (the first endedAt and the recorded flag survive a second tab's finish).
//   - tick: at or past the deadline it is a finish (a mock that ran out while
//     the tab was closed ends at the deadline, not when the user came back).
//   - recorded: the answers have been written to the learning record.
// An action that changes nothing returns the same object.
//
// Imports are relative (not `@/`): e2e specs import learning modules by relative path.

import { isChoiceLetter, type ChoiceLetter } from "../learning/record";
import { deadline } from "./mockModel";

export const MOCK_STORAGE_KEY = "itp:mock:v1";

export interface MockState {
  v: 1;
  kind: "random" | "exam";
  /** the exam (回) for kind "exam", else null */
  examId: string | null;
  ids: string[];
  /** qid → chosen letter (answered questions only) */
  answers: Record<string, ChoiceLetter>;
  /** qids marked「あとで見直す」 */
  flagged: string[];
  /** current question index into ids */
  pos: number;
  /** epoch ms */
  startedAt: number;
  /** epoch ms of the finish (≤ deadline), null while running */
  endedAt: number | null;
  /** the answers have been written to the learning record */
  recorded: boolean;
}

export type MockAction =
  | { type: "pick"; qid: string; choice: ChoiceLetter }
  | { type: "flag"; qid: string }
  | { type: "go"; pos: number }
  | { type: "finish"; now: number }
  | { type: "tick"; now: number }
  | { type: "recorded" };

export function newMock(kind: MockState["kind"], examId: string | null, ids: string[], now: number): MockState {
  return {
    v: 1,
    kind,
    examId,
    ids,
    answers: {},
    flagged: [],
    pos: 0,
    startedAt: now,
    endedAt: null,
    recorded: false,
  };
}

export function serializeMock(s: MockState): string {
  return JSON.stringify(s);
}

const isMap = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);
const isStringArray = (x: unknown): x is string[] => Array.isArray(x) && x.every((e) => typeof e === "string");
const isTime = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x);

/** The stored mock, or null when `raw` is missing or not a well-formed MockState. Never throws. */
export function parseMock(raw: string | null): MockState | null {
  if (raw === null) return null;
  let x: unknown;
  try {
    x = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isMap(x) || x.v !== 1) return null;
  const { kind, examId, ids, answers, flagged, pos, startedAt, endedAt, recorded } = x;
  if (kind !== "random" && kind !== "exam") return null;
  if (examId !== null && typeof examId !== "string") return null;
  if (!isStringArray(ids) || !isStringArray(flagged)) return null;
  if (!isMap(answers) || !Object.values(answers).every(isChoiceLetter)) return null;
  if (typeof pos !== "number" || !Number.isInteger(pos) || pos < 0) return null;
  if (!isTime(startedAt) || (endedAt !== null && !isTime(endedAt))) return null;
  if (typeof recorded !== "boolean") return null;
  return {
    v: 1,
    kind,
    examId,
    ids: [...ids],
    // Object.fromEntries: a "__proto__" key stays ordinary data
    answers: Object.fromEntries(Object.entries(answers as Record<string, ChoiceLetter>)),
    flagged: [...flagged],
    pos,
    startedAt,
    endedAt,
    recorded,
  };
}

function finish(s: MockState, now: number): MockState {
  if (s.endedAt !== null) return s;
  return { ...s, endedAt: Math.min(now, deadline(s.startedAt)) };
}

export function mockReducer(s: MockState, a: MockAction): MockState {
  switch (a.type) {
    case "pick":
      if (s.endedAt !== null || !s.ids.includes(a.qid) || s.answers[a.qid] === a.choice) return s;
      return { ...s, answers: { ...s.answers, [a.qid]: a.choice } };
    case "flag":
      if (s.endedAt !== null || !s.ids.includes(a.qid)) return s;
      return {
        ...s,
        flagged: s.flagged.includes(a.qid) ? s.flagged.filter((q) => q !== a.qid) : [...s.flagged, a.qid],
      };
    case "go": {
      const pos = Math.min(Math.max(0, Math.trunc(a.pos)), Math.max(0, s.ids.length - 1));
      return pos === s.pos ? s : { ...s, pos };
    }
    case "finish":
      return finish(s, a.now);
    case "tick":
      return a.now >= deadline(s.startedAt) ? finish(s, a.now) : s;
    case "recorded":
      return s.recorded ? s : { ...s, recorded: true };
  }
}

/** Whether the stored mock `s` is the one the URL asks for (same kind, exam and id order). */
export function sameMock(s: MockState, kind: MockState["kind"], examId: string | null, ids: readonly string[]): boolean {
  return (
    s.kind === kind && s.examId === examId && s.ids.length === ids.length && s.ids.every((id, i) => id === ids[i])
  );
}
