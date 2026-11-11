// D-217 H1-2 — the declared allow-list of the /data/… static files: every key each file family may
// hold, per locale (a ja file holds no zh / en text, a zh file no en text, and so on). The
// staticData test walks every built file against it; FORBIDDEN_KEYS must appear nowhere (as a
// field or a record key) and FORBIDDEN_TEXT nowhere in the serialized file.

import { UNIT_ID_RE } from "../textbook/reader";
import type { StaticLocale } from "./shards";

export type AllowSpec =
  | "string"
  | "number"
  | "boolean"
  | "string|null"
  | "number|null"
  | { obj: Record<string, AllowSpec> }
  | { rec: AllowSpec; key: RegExp }
  | { arr: AllowSpec }
  | { tuple: AllowSpec[] };

/** Internal / provenance fields of the corpus and its sidecars. */
export const FORBIDDEN_KEYS = [
  "source_note",
  "suspect_count",
  "stem_corruption_count",
  "stem_corruption_suspected",
  "stem_reconstructed_s975",
  "key_guard",
  "key_guard_round1",
  "round1",
  "note_jp",
  "figure_derivable",
  "derived_answer",
  "matches_key",
  "generated_from",
  "attribution",
  "schema_version",
  "stem_jp_clean",
  "figure_type",
  "stats",
  "count",
  "pages",
  "page",
  "bbox",
  "svg_path",
] as const;

/** Paths / names of the raw IPA material and the extraction pipeline. */
export const FORBIDDEN_TEXT = ["data/ip/", "question_bank", ".pdf", "/exams/", "/sources/", "/syllabus/", ".source/"] as const;

const S = "string" as const;
const N = "number" as const;
const LETTER = /^[アイウエ]$/;
const QID = /^\d{4}[a-z0-9]{1,16}-q\d{3}$/;
const TERM_ID = /^t[0-9a-f]{16}$/;
const TOPIC_ID = /^[a-z]+-\d{2}-\d{2}$/;
const ANY_KEY = /^[^]+$/;

const letters = (v: AllowSpec): AllowSpec => ({ rec: v, key: LETTER });

function langs(locale: StaticLocale): ("zh" | "en")[] {
  return locale === "zh" ? ["zh"] : locale === "en" ? ["en"] : [];
}

export function examShardSpec(locale: StaticLocale): AllowSpec {
  const extra: Record<string, AllowSpec> = {};
  for (const l of langs(locale)) {
    extra[`stem_${l}`] = S;
    extra[`choices_${l}`] = letters(S);
  }
  return {
    obj: {
      exam_id: S,
      locale: S,
      questions: {
        arr: {
          obj: {
            id: S,
            exam_id: S,
            topic_id: S,
            category: S,
            source_label: S,
            stem_jp: S,
            choices_jp: letters(S),
            correct_answer: S,
            has_figure: "boolean",
            figure: "string|null",
            choice_figures: letters(S),
            terms: { arr: S },
            suspect: "boolean",
            ...extra,
          },
        },
      },
    },
  };
}

/** Explanations keep all three languages (ExplanationPane's 日/中/EN switch, D-186) and no locale. */
const TEXT3: AllowSpec = { obj: { jp: S, zh: S, en: S } };
export const explanationShardSpec: AllowSpec = {
  obj: {
    exam_id: S,
    chunk: N,
    explanations: {
      rec: { obj: { suspect: "boolean", correct: TEXT3, distractors: letters(TEXT3), points: { arr: TEXT3 } } },
      key: QID,
    },
  },
};

export const quizIndexSpec: AllowSpec = {
  obj: {
    topics: {
      arr: {
        obj: {
          topic_id: S,
          category: S,
          major_jp: S,
          major_zh: S,
          major_en: S,
          medium_jp: S,
          medium_zh: S,
          medium_en: S,
          name_jp: S,
          question_count: N,
        },
      },
    },
    exams: {
      arr: { obj: { exam_id: S, gregorian: N, wareki: S, season: S, label_jp: S, question_count: N } },
    },
    questions: { arr: { tuple: [S, S, S] } },
    chumonGroups: {
      arr: {
        obj: {
          key: S,
          memberIds: { arr: S },
          preambleChars: { obj: { jp: "number|null", zh: "number|null", en: "number|null" } },
        },
      },
    },
  },
};

export const todaySpec: AllowSpec = {
  obj: {
    topics: {
      arr: {
        obj: {
          id: S,
          category: S,
          name_jp: S,
          stars: N,
          questionCount: N,
          units: { arr: { obj: { id: S, title: S, minutes: N } } },
        },
      },
    },
    topicQuestionIds: { rec: { arr: S }, key: TOPIC_ID },
    groups: { rec: { arr: S }, key: ANY_KEY },
    topicTerms: { rec: { arr: { obj: { id: S, term: S, gloss: S, definition: S } } }, key: TOPIC_ID },
    exams: { rec: S, key: ANY_KEY },
  },
};

export const termCardsSpec: AllowSpec = {
  obj: {
    locale: S,
    cards: {
      rec: {
        obj: { id: S, term: S, gloss: S, definition: S, memoryHook: S, senseCount: N, questionCount: N },
      },
      key: ANY_KEY,
    },
  },
};

export const unitsSpec: AllowSpec = {
  obj: {
    locale: S,
    units: { rec: { obj: { title: S, terms: { arr: { obj: { id: S, term: S } } } } }, key: UNIT_ID_RE },
  },
};

export function senseiTermsSpec(locale: StaticLocale): AllowSpec {
  const sense: Record<string, AllowSpec> = { unitTitleJp: S, definitionJp: S, explanationJp: S, memoryHookJp: S };
  if (locale !== "ja") Object.assign(sense, { definitionLocale: S, explanationLocale: S, memoryHookLocale: S });
  return {
    obj: {
      locale: S,
      shard: S,
      terms: { rec: { obj: { id: S, term: S, senses: { arr: { obj: sense } } } }, key: TERM_ID },
    },
  };
}

/** Every violation of `spec` in `value` as `path: reason` (empty = the file conforms). */
export function checkAllowed(value: unknown, spec: AllowSpec, path = "$"): string[] {
  const out: string[] = [];
  const type = value === null ? "null" : Array.isArray(value) ? "array" : typeof value;
  if (typeof spec === "string") {
    if (!spec.split("|").includes(type)) out.push(`${path}: ${type} is not ${spec}`);
    return out;
  }
  if ("arr" in spec || "tuple" in spec) {
    if (!Array.isArray(value)) return [`${path}: ${type} is not an array`];
    if ("tuple" in spec && value.length !== spec.tuple.length) out.push(`${path}: tuple length ${value.length}`);
    value.forEach((v, i) => out.push(...checkAllowed(v, "arr" in spec ? spec.arr : spec.tuple[i]!, `${path}[${i}]`)));
    return out;
  }
  if (type !== "object") return [`${path}: ${type} is not an object`];
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if ("obj" in spec) {
      const field = spec.obj[k];
      if (!field) out.push(`${path}: key ${JSON.stringify(k)} not allowed`);
      else out.push(...checkAllowed(v, field, `${path}.${k}`));
    } else {
      if (!spec.key.test(k)) out.push(`${path}: record key ${JSON.stringify(k)} does not match ${spec.key}`);
      out.push(...checkAllowed(v, spec.rec, `${path}[${JSON.stringify(k)}]`));
    }
  }
  return out;
}

/** Every key (fields and record keys) anywhere in `value`. */
export function allKeys(value: unknown, into = new Set<string>()): Set<string> {
  if (Array.isArray(value)) for (const v of value) allKeys(v, into);
  else if (value !== null && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      into.add(k);
      allKeys(v, into);
    }
  }
  return into;
}
