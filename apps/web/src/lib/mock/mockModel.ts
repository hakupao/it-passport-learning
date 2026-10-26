// Stage 7 Phase 2 (DESIGN §6.7, D-192, D-193 §0-2 / §0-5) — mock exam pure model:
// random draw, single-exam id list, scoring, timer. No UI, no storage.
//
// Random draw (drawRandomMock): exactly OFFICIAL_RATIO per area (35 / 20 / 45 = 100).
//   - Units = single questions or whole chumon groups (members in `pool.groups`
//     order). A unit counts each member by that member's own category. A unit
//     sharing an id with an earlier unit is skipped (overlapping groups never
//     repeat an id).
//   - All units of all three areas go into ONE list, shuffled once (Fisher–Yates,
//     mulberry32(fnv1a32(String(seed))), the PRNG of pickNew), walked once: a unit
//     is taken iff it fits every area's remaining quota (a group that would
//     overrun any area is skipped). One mixed walk — not one walk per area —
//     so a group spanning areas is never starved by an earlier area's quota
//     filling up first. This supersedes plan Step 3's per-area walk (controller
//     ruling, review round 1; D-193 §0 note).
//   - preferUnanswered: the walk first takes only units whose members are all
//     unanswered (no key in `r.attempts`), then walks again over the rest.
//   - Output order: by the area of each unit's first member, strategy →
//     management → technology, inside an area in pick order, group members
//     contiguous in group order. A pool too small to fill the quotas yields
//     fewer than MOCK_N ids (the caller treats that as invalid).
// Scoring (§0-5): 1 point each, total = round(correct / n × 1000), area =
// round(area correct / area size × 1000) (0 for an empty area); unanswered =
// wrong; passed = total ≥ PASS_TOTAL and every area ≥ PASS_AREA. Ids missing
// from `keyOf` are ignored.
//
// Imports are relative (not `@/`): e2e specs import learning modules by relative path.

import { fnv1a32, mulberry32 } from "../hash";
import type { ChoiceLetter, LearningRecord } from "../learning/record";
import { OFFICIAL_RATIO, groupIndex, type QuestionPool } from "../learning/schedule";
import type { QuizQuestion } from "../quiz/quizModel";

export const MOCK_N = 100;
export const MOCK_MS = 120 * 60_000;
export const PASS_TOTAL = 600;
export const PASS_AREA = 300;

export type MockCategory = "strategy" | "management" | "technology";

const AREAS = Object.keys(OFFICIAL_RATIO) as MockCategory[];

const zeroAreas = (): Record<MockCategory, number> => ({ strategy: 0, management: 0, technology: 0 });

interface Unit {
  ids: string[];
  need: Record<MockCategory, number>;
}

/** MOCK_N random questions at the official area ratio (see header); same seed → same list. */
export function drawRandomMock(
  r: LearningRecord,
  pool: QuestionPool,
  categoryOf: ReadonlyMap<string, MockCategory>,
  seed: number,
  preferUnanswered: boolean,
): string[] {
  const rand = mulberry32(fnv1a32(String(seed)));
  const byId = groupIndex(pool.groups);
  const units: Unit[] = [];
  const seen = new Set<string>();
  for (const t of Object.keys(pool.topicQuestionIds).sort()) {
    for (const id of pool.topicQuestionIds[t]!) {
      if (seen.has(id)) continue;
      const ids = byId.get(id) ?? [id];
      if (ids.some((x) => seen.has(x))) {
        seen.add(id); // overlaps an earlier unit: skip rather than repeat an id
        continue;
      }
      for (const x of ids) seen.add(x);
      if (!ids.every((x) => categoryOf.has(x))) continue;
      const need = zeroAreas();
      for (const x of ids) need[categoryOf.get(x)!]++;
      units.push({ ids, need });
    }
  }
  for (let i = units.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [units[i], units[j]] = [units[j]!, units[i]!];
  }

  const left: Record<MockCategory, number> = { ...OFFICIAL_RATIO };
  const picked: Record<MockCategory, Unit[]> = { strategy: [], management: [], technology: [] };
  const taken = new Set<Unit>();
  const unanswered = (u: Unit): boolean =>
    u.ids.every((x) => !Object.prototype.hasOwnProperty.call(r.attempts, x));
  const rounds: ((u: Unit) => boolean)[] = preferUnanswered ? [unanswered, () => true] : [() => true];
  for (const eligible of rounds) {
    for (const u of units) {
      if (taken.has(u) || !eligible(u) || AREAS.some((a) => u.need[a] > left[a])) continue;
      taken.add(u);
      picked[categoryOf.get(u.ids[0]!)!].push(u);
      for (const a of AREAS) left[a] -= u.need[a];
    }
  }
  return AREAS.flatMap((a) => picked[a].flatMap((u) => u.ids));
}

/** All questions of one exam, by id ascending (= the exam's own question order). */
export function examMockIds(examId: string, questions: readonly Pick<QuizQuestion, "id" | "exam_id">[]): string[] {
  return questions
    .filter((q) => q.exam_id === examId)
    .map((q) => q.id)
    .sort((x, y) => (x < y ? -1 : x > y ? 1 : 0));
}

export interface MockScore {
  /** 0–1000 */
  total: number;
  /** 0–1000 per area */
  areas: Record<MockCategory, number>;
  correct: number;
  answered: number;
  n: number;
  passed: boolean;
}

/** Score a finished mock (§0-5, see header). */
export function scoreMock(
  ids: readonly string[],
  answers: Readonly<Record<string, ChoiceLetter>>,
  keyOf: ReadonlyMap<string, { correct: ChoiceLetter; category: MockCategory }>,
): MockScore {
  const size = zeroAreas();
  const right = zeroAreas();
  let n = 0;
  let correct = 0;
  let answered = 0;
  for (const id of ids) {
    const k = keyOf.get(id);
    if (k === undefined) continue;
    n++;
    size[k.category]++;
    const a = Object.prototype.hasOwnProperty.call(answers, id) ? answers[id] : undefined;
    if (a === undefined) continue;
    answered++;
    if (a === k.correct) {
      correct++;
      right[k.category]++;
    }
  }
  const per = (c: number, of: number): number => (of === 0 ? 0 : Math.round((c / of) * 1000));
  const areas = zeroAreas();
  for (const a of AREAS) areas[a] = per(right[a], size[a]);
  const total = per(correct, n);
  return {
    total,
    areas,
    correct,
    answered,
    n,
    passed: total >= PASS_TOTAL && AREAS.every((a) => areas[a] >= PASS_AREA),
  };
}

/** Milliseconds left at `now` for a mock started at `startedAt` (never negative). */
export function remainingMs(startedAt: number, now: number): number {
  return Math.max(0, startedAt + MOCK_MS - now);
}

/** When a mock started at `startedAt` ends. */
export function deadline(startedAt: number): number {
  return startedAt + MOCK_MS;
}
