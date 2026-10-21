// Stage 6 (D-179 / D-180 §0-2) — static trilingual dictionary (pure, no I/O).
//
// One entry per JP headword (NFC) across the textbook units. A headword taught in
// several units keeps every unit's sense, ordered by buildNav() (technology →
// management → strategy, topic index order, unit_order); the representative topic
// is the first sense's. Past-exam questions link in via QuizQuestion.terms.
// Entries are keyed by the JP headword's termId, so zh/en homonyms never merge.
// The disk loader is ./dictionaryReader; this module is unit-tested with fixtures.

import type { QuizQuestion } from "../quiz/quizModel";
import { buildNav, pick, pickTerm, type ReaderIndex } from "../textbook/reader";
import type { TextbookUnit, UnitTerm } from "../textbook/types";
import { termId } from "./termId";

export interface DictSense {
  unitId: string;
  topicId: string;
  category: string;
  term: UnitTerm;
}

export interface DictQuestionRef {
  id: string;
  examId: string;
  sourceLabel: string;
}

export interface DictEntry {
  id: string;
  term: string;
  termZh: string;
  termEn: string;
  senses: DictSense[];
  questions: DictQuestionRef[];
}

export interface Dictionary {
  entries: DictEntry[];
  byId: Map<string, DictEntry>;
  /** Keyed by the NFC-normalized JP headword. */
  byTerm: Map<string, DictEntry>;
}

/**
 * Build the dictionary. Units absent from the index's nav are appended after the
 * nav-ordered ones (in input order); question terms with no entry are ignored.
 * Throws on a termId collision between two distinct headwords.
 */
export function buildDictionary(
  index: ReaderIndex,
  units: TextbookUnit[],
  questions: Pick<QuizQuestion, "id" | "exam_id" | "source_label" | "terms">[],
): Dictionary {
  const navPos = new Map<string, number>();
  for (const cat of buildNav(index, "ja")) {
    for (const t of cat.topics) {
      for (const u of t.units) navPos.set(u.unit_id, navPos.size);
    }
  }
  const pos = (u: TextbookUnit) => navPos.get(u.unit_id) ?? Number.MAX_SAFE_INTEGER;
  const ordered = [...units].sort((a, b) => pos(a) - pos(b));

  const entries: DictEntry[] = [];
  const byId = new Map<string, DictEntry>();
  const byTerm = new Map<string, DictEntry>();

  for (const u of ordered) {
    for (const t of u.terms) {
      const key = t.term.normalize("NFC");
      let entry = byTerm.get(key);
      if (!entry) {
        const id = termId(key);
        const clash = byId.get(id);
        if (clash) {
          throw new Error(`termId collision: ${JSON.stringify(clash.term)} vs ${JSON.stringify(t.term)} → ${id}`);
        }
        entry = { id, term: key, termZh: t.term_zh, termEn: t.term_en, senses: [], questions: [] };
        entries.push(entry);
        byId.set(id, entry);
        byTerm.set(key, entry);
      }
      entry.senses.push({ unitId: u.unit_id, topicId: u.topic_id, category: u.category, term: t });
    }
  }

  for (const q of questions) {
    for (const name of q.terms ?? []) {
      const entry = byTerm.get(name.normalize("NFC"));
      if (!entry || entry.questions.some((r) => r.id === q.id)) continue;
      entry.questions.push({ id: q.id, examId: q.exam_id, sourceLabel: q.source_label });
    }
  }

  return { entries, byId, byTerm };
}

// Every entry is created together with its first sense, so senses[0] always exists.
const first = (e: DictEntry): DictSense => e.senses[0]!;

const rec = (o: object) => o as unknown as Record<string, unknown>;

/** Active-locale headword, JP when the translation is empty. */
function gloss(t: UnitTerm, locale: string): string {
  const v = pickTerm(t, locale);
  return v.trim() !== "" ? v : t.term;
}

/** Active-locale `{base}_{lang}` field, JP when the translation is empty (list card + detail page). */
export function field(t: UnitTerm, base: string, locale: string): string {
  const v = pick(rec(t), base, locale);
  return v.trim() !== "" ? v : pick(rec(t), base, "ja");
}

export interface TermCard {
  id: string;
  term: string;
  gloss: string;
  definition: string;
  memoryHook: string;
  senseCount: number;
  questionCount: number;
}

/** Summary card from the representative sense (senses[0]). */
export function toTermCard(entry: DictEntry, locale: string): TermCard {
  const t = first(entry).term;
  return {
    id: entry.id,
    term: entry.term,
    gloss: gloss(t, locale),
    definition: field(t, "definition", locale),
    memoryHook: field(t, "memory_hook", locale),
    senseCount: entry.senses.length,
    questionCount: entry.questions.length,
  };
}

export interface DictListItem {
  id: string;
  term: string;
  gloss: string;
  termZh: string;
  termEn: string;
  /** NFKC-lowercased JP headword + every sense's term_zh / term_en, newline-joined (list search). */
  search: string;
}

// Same normalization as the query side in GlossaryList.tsx (a client module, which
// may only `import type` from here, so the one-liner is mirrored there).
const searchNorm = (s: string): string => s.normalize("NFKC").toLowerCase();

export interface DictListGroup {
  category: string;
  topicId: string;
  major: string;
  medium: string;
  nameJp: string;
  items: DictListItem[];
}

/**
 * Group entries under their representative topic, groups in buildNav order,
 * items sorted by JP headword (localeCompare "ja"). Topics owning no entry are omitted.
 */
export function buildListGroups(dict: Dictionary, index: ReaderIndex, locale: string): DictListGroup[] {
  const byTopic = new Map<string, DictEntry[]>();
  for (const e of dict.entries) {
    const topicId = first(e).topicId;
    const arr = byTopic.get(topicId) ?? [];
    arr.push(e);
    byTopic.set(topicId, arr);
  }

  const groups: DictListGroup[] = [];
  for (const cat of buildNav(index, locale)) {
    for (const t of cat.topics) {
      const owned = byTopic.get(t.topic_id);
      if (!owned) continue;
      groups.push({
        category: cat.category,
        topicId: t.topic_id,
        major: t.major,
        medium: t.medium,
        nameJp: t.name_jp,
        items: owned
          .map((e) => ({
            id: e.id,
            term: e.term,
            gloss: gloss(first(e).term, locale),
            termZh: e.termZh,
            termEn: e.termEn,
            search: searchNorm([e.term, ...e.senses.flatMap((s) => [s.term.term_zh, s.term.term_en])].join("\n")),
          }))
          .sort((a, b) => a.term.localeCompare(b.term, "ja")),
      });
    }
  }
  return groups;
}
