// Stage 7 Phase 1 Task 12 (DESIGN §5.4 leech / §6.3, D-190 §0-20) — the mistakes book's pure model
// (no React; bundler-safe, relative imports). The page computes it in the browser from the learning
// record and the dictionary-free today payload (loadSetupIndex).
//
//   - The book = every current mistake of the payload (mistakeIds: reviewState + classify = "mistake",
//     not only those due today, independent of the daily cap), with its review state.
//   - Groups: one per topic; topics in PRACTICE_CATEGORY_ORDER (ストラテジ → マネジメント → テクノロジ),
//     inside a field in index.topics order (topics of no known field last). Rows inside a topic:
//     earliest due first, ties by qid (mistakeIds' order).
//   - Row: the §0-20 label from the qid (`<exam_id>-q<NNN>`: exams[exam_id] label_jp, else the exam id;
//     the NNN as 問 N, the same regex as choiceLayout.sourceNumber), the topic name (JP, OQ-03),
//     wrongInWindow (「近 10 次错 N 次」, the leech count), next = today when dueDay <= today, else that
//     day; isLeech + the topic's first unit (units[0], unit_order) for 「读单元」, null when it has none.
//   - href (「做全部错题」): `/practice?ids=…` of the mistakes by (due, qid), the first MAX_SCOPE_IDS
//     (= 100); null when there is none. total = every mistake (the button's N).

import type { LearningRecord } from "../learning/record";
import { reviewState, type ToDay } from "../learning/schedule";
import { poolFromIndex, type TodayIndex } from "./practiceIndex";
import { PRACTICE_CATEGORY_ORDER } from "./practiceLabels";
import { idsHref, mistakeIds } from "./practiceSetup";

export type MistakeNext = { kind: "today" } | { kind: "date"; day: number };

export interface RowLabel {
  /** label_jp of the exam (the exam id when unknown) */
  exam: string;
  /** 問 N of the source exam */
  number: number;
  topicId: string | null;
  /** topic name (JP); "" when the qid is in no topic */
  topic: string;
}

export interface MistakeRow extends RowLabel {
  qid: string;
  wrongInWindow: number;
  next: MistakeNext;
  isLeech: boolean;
  /** the topic's first unit (leech 「读单元」); null when the topic has none */
  unitId: string | null;
}

export interface MistakeGroup {
  topicId: string;
  name_jp: string;
  category: string;
  rows: MistakeRow[];
}

export interface MistakesBook {
  total: number;
  groups: MistakeGroup[];
  /** 「做全部错题」 (≤ 100 ids, earliest due first); null when there is no mistake */
  href: string | null;
}

const QID_RE = /^(.*)-q(\d+)$/;

function topicOfIds(index: TodayIndex): Map<string, string> {
  const m = new Map<string, string>();
  for (const [t, ids] of Object.entries(index.topicQuestionIds)) for (const id of ids) if (!m.has(id)) m.set(id, t);
  return m;
}

function labelOf(qid: string, index: TodayIndex, topicOf: Map<string, string>): RowLabel {
  const m = QID_RE.exec(qid);
  if (!m) throw new Error(`question id without a question number: ${qid}`);
  const examId = m[1]!;
  const topicId = topicOf.get(qid) ?? null;
  const topic = topicId === null ? undefined : index.topics.find((t) => t.id === topicId);
  return {
    exam: Object.prototype.hasOwnProperty.call(index.exams, examId) ? index.exams[examId]! : examId,
    number: Number(m[2]),
    topicId,
    topic: topic?.name_jp ?? "",
  };
}

/** The §0-20 row label of `qid`: exam label_jp + 問 N + topic name (JP). */
export function rowLabel(qid: string, index: TodayIndex): RowLabel {
  return labelOf(qid, index, topicOfIds(index));
}

const fieldRank = (category: string): number => {
  const i = (PRACTICE_CATEGORY_ORDER as readonly string[]).indexOf(category);
  return i < 0 ? PRACTICE_CATEGORY_ORDER.length : i;
};

export function mistakesBook(r: LearningRecord, index: TodayIndex, today: number, toDay: ToDay): MistakesBook {
  const ids = mistakeIds(r, poolFromIndex(index), today, toDay);
  const topicOf = topicOfIds(index);
  const meta = new Map(index.topics.map((t, i) => [t.id, { t, i }]));
  const groups = new Map<string, MistakeGroup>();
  for (const qid of ids) {
    const s = reviewState(r.attempts[qid]!, r.v2Since, qid, toDay)!;
    const label = labelOf(qid, index, topicOf);
    const topicId = label.topicId!; // mistakeIds keeps only ids of the payload's topics
    const topic = meta.get(topicId)?.t;
    let g = groups.get(topicId);
    if (!g) {
      g = { topicId, name_jp: topic?.name_jp ?? topicId, category: topic?.category ?? "", rows: [] };
      groups.set(topicId, g);
    }
    g.rows.push({
      ...label,
      qid,
      wrongInWindow: s.wrongInWindow,
      next: s.dueDay !== null && s.dueDay > today ? { kind: "date", day: s.dueDay } : { kind: "today" },
      isLeech: s.isLeech,
      unitId: topic?.units[0]?.id ?? null,
    });
  }
  const order = (g: MistakeGroup): [number, number] => [fieldRank(g.category), meta.get(g.topicId)?.i ?? Number.MAX_SAFE_INTEGER];
  const sorted = [...groups.values()].sort((x, y) => {
    const [a, b] = [order(x), order(y)];
    return a[0] - b[0] || a[1] - b[1];
  });
  return { total: ids.length, groups: sorted, href: idsHref(ids, "all", "seq", 0) };
}
