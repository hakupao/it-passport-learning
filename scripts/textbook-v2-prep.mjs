#!/usr/bin/env node
// Stage 7 Phase 3 Task 9 Step 1 (D-196 §0-13) — the writer's input manifest for one unit (deterministic).
//
// Run: node scripts/textbook-v2-prep.mjs --unit <unit_id> [--data-root <dir>]
// Out: <data-root>/textbook/.planning/v2/<unit>/manifest.json   (.planning/ is gitignored)
//
// The manifest holds everything the JP writer / reviewers / localiser read, and what the
// validate / merge scripts need from *before* the rewrite:
//   - v1             the current unit file verbatim (must be v1: a v2 file means the unit was
//                    already rewritten and its v1 glosses / content are gone → throw)
//   - v1_terms       headword glosses {term, term_zh, term_en} = validateV2's v1Terms (never
//                    taken from the file being validated)
//   - terms          the headwords in index order (fixed: §0-9 invariant)
//   - topic          topic_id / category / name_jp / objective_jp / badge; index_unit = the unit's
//                    unit_index entry (title, summary, terms with freq / order_reason)
//   - questions      every same-topic question that lists one of the unit's terms, plus the v1
//                    challenge / inline ids — D-198 thin form: {topic_id, terms, stem_jp (translations
//                    sidecar stem_jp_clean first, as lines), choices_jp, correct_answer}. No
//                    explanations (S135 u02 attempt 3). WRITER-ONLY reference: never merged into the unit.
//   - term_questions headword → its question ids (sorted)
//   - chumon_members member ids among those questions (validateV2 members; confirm count §0-1)
//   - figures        FIGURE_KINDS, step / network limits, the v2 type definitions (types.ts), the
//                    unit's existing svg files
// Long texts (d195, types.ts, stems) are arrays of lines (lib toLines: newline, then
// after 。 past 200 chars) so a Read of the pretty-printed manifest never truncates a line (S135 M2);
// the workflow prompts also point every role at the original D-195 / types.ts / figureSpec.ts files.
//   - rules          validateV2 limits and banned-phrase patterns (as source text)
//   - d195_lines     docs/decisions/D-195-textbook-writing-and-figure-rules.md, full text
//   - output_schema  JSON Schema of the JP part (the localised part = the same + _zh / _en, {zh, en})
// Determinism: no timestamps, ids sorted, fixed key order → two runs give identical bytes.

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { dataPaths, jsonText, loadV2, MANIFEST_SCHEMA, parseArgs, readJson, REPO, toLines, UNIT_ID_RE, V1_SCHEMA } from "./lib/textbook-v2.mjs";

const D195 = path.join(REPO, "docs/decisions/D-195-textbook-writing-and-figure-rules.md");
const TYPES = path.join(REPO, "apps/web/src/lib/textbook/types.ts");

/** JSON Schema of the JP writer's part file (the localiser adds _zh / _en and label zh / en in place). */
export const JP_PART_SCHEMA = {
  type: "object",
  required: ["unit_id", "stage", "round", "goals_jp", "overview_cols_jp", "overview_rows", "terms", "pairs", "key_points_jp", "challenge_questions"],
  additionalProperties: false,
  properties: {
    unit_id: { type: "string" },
    stage: { const: "jp" },
    round: { type: "integer", minimum: 0, description: "0 = first draft, n = revision after review n" },
    goals_jp: { type: "array", items: { type: "string" }, description: "学習目標 ~3 (D-195 §3)、行内標記可" },
    overview_cols_jp: { type: "array", items: { type: "string" }, description: "用語総表の追加列見出し (0 列も可)" },
    overview_rows: {
      type: "array",
      description: "用語ごとに 1 行、用語順",
      items: {
        type: "object",
        required: ["term", "one_line_jp", "extra_jp"],
        additionalProperties: false,
        properties: { term: { type: "string" }, one_line_jp: { type: "string" }, extra_jp: { type: "array", items: { type: "string" } } },
      },
    },
    terms: {
      type: "array",
      description: "manifest.terms と同じ見出し語・同じ順",
      items: {
        type: "object",
        required: ["term", "one_jp", "detail_jp", "analogy_jp", "points", "fig", "quiz"],
        additionalProperties: false,
        properties: {
          term: { type: "string" },
          one_jp: { type: "string", description: "一句話 1 文、キーワードは **語**" },
          detail_jp: { type: "string", description: "展開 2〜3 文" },
          analogy_jp: { type: "string", description: "比喩 (平文、標記なし)。無ければ \"\"" },
          hook_jp: { type: "string", description: "記法 (定義の言い換え禁止)。無ければ省略" },
          points: {
            type: "array",
            items: {
              type: "object",
              required: ["kind", "text_jp"],
              additionalProperties: false,
              properties: { kind: { enum: ["exam", "mix"] }, text_jp: { type: "string" }, qids: { type: "array", items: { type: "string" } } },
            },
          },
          fig: { type: ["object", "null"], description: "FigSpec (figures.types_ts_lines)、ラベルは {jp} のみ、caption は caption_jp のみ" },
          quiz: { type: "array", items: { type: "string" }, description: "この用語の過去問 id (同 topic・題の terms にこの用語を含む)" },
        },
      },
    },
    pairs: {
      type: "array",
      items: {
        type: "object",
        required: ["a", "b", "rows"],
        additionalProperties: false,
        properties: {
          a: { type: "string" },
          b: { type: "string" },
          rows: {
            type: "array",
            items: {
              type: "object",
              required: ["label_jp", "a_jp", "b_jp", "key"],
              additionalProperties: false,
              properties: { label_jp: { type: "string" }, a_jp: { type: "string" }, b_jp: { type: "string" }, key: { type: "boolean" } },
            },
          },
        },
      },
    },
    key_points_jp: { type: "array", items: { type: "string" }, description: "要点 3〜5" },
    challenge_questions: { type: "array", items: { type: "string" }, description: "確認題 (中問組員を除いて 3〜5)" },
  },
};

const src = (re) => re.source;

export async function buildManifest(unitId, paths) {
  if (!UNIT_ID_RE.test(unitId)) throw new Error(`bad unit id ${JSON.stringify(unitId)}`);
  const v2 = await loadV2();
  const figSpec = await import(pathToFileURL(path.join(REPO, "apps/web/src/lib/textbook/figureSpec.ts")).href);

  const index = readJson(paths.index);
  const topic = index.topics.find((t) => (t.units ?? []).some((u) => u.unit_id === unitId));
  if (!topic) throw new Error(`${unitId}: not in unit_index.json`);
  const iu = topic.units.find((u) => u.unit_id === unitId);
  const terms = iu.terms.map((t) => t.term);

  const v1 = readJson(paths.unit(unitId));
  if (v1.schema_version !== V1_SCHEMA) {
    throw new Error(`${unitId}: units file is ${JSON.stringify(v1.schema_version)}, not v1 — prep reads the pre-rewrite unit (use .planning/v2/${unitId}/v1-original.json to restore it first)`);
  }
  const v1Names = v1.terms.map((t) => t.term);
  if (JSON.stringify(v1Names) !== JSON.stringify(terms)) throw new Error(`${unitId}: v1 headwords ${JSON.stringify(v1Names)} ≠ index ${JSON.stringify(terms)}`);
  const v1_terms = v1.terms.map((t) => ({ term: t.term, term_zh: t.term_zh, term_en: t.term_en }));

  // questions: same topic + lists a unit term, plus whatever v1 already uses
  const all = readJson(paths.questions).questions;
  const v1Used = new Set([...(v1.challenge_questions ?? []), ...v1.terms.flatMap((t) => t.inline_quiz ?? [])]);
  const picked = all
    .filter((q) => q.topic_id === topic.topic_id && (q.terms.some((t) => terms.includes(t)) || v1Used.has(q.id)))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const groupOf = new Map();
  for (const g of readJson(paths.chumon).groups) for (const m of g.member_ids) groupOf.set(m, g.key);

  // D-198 thin manifest (u02 attempt 3): per question only the stem (translations sidecar
  // stem_jp_clean first = the display layer), the choices and the keyed letter. No explanations:
  // writer and critic holding 解説 texts made every standard sentence "match" some explanation.
  const stems = new Map();
  const stemOf = (q) => {
    if (!stems.has(q.exam_id)) {
      const f = paths.translations(q.exam_id);
      stems.set(q.exam_id, existsSync(f) ? readJson(f).questions ?? {} : {});
    }
    return stems.get(q.exam_id)[q.id]?.stem_jp_clean ?? q.stem_jp;
  };
  const questions = {};
  for (const q of picked) {
    questions[q.id] = { topic_id: q.topic_id, terms: q.terms, stem_jp: toLines(stemOf(q)), choices_jp: q.choices_jp, correct_answer: q.correct_answer };
  }
  const term_questions = Object.fromEntries(terms.map((t) => [t, picked.filter((q) => q.terms.includes(t)).map((q) => q.id)]));
  // every same-topic member (not only the picked ones): challenge_questions may cite any same-topic
  // question, and the reader removes members using the whole registry
  const chumon_members = all.filter((q) => q.topic_id === topic.topic_id && groupOf.has(q.id)).map((q) => q.id).sort();

  const types = readFileSync(TYPES, "utf-8");
  const typesFrom = types.indexOf("/** A label in all three languages");
  const figDir = path.join(paths.tb, "figures");
  const svgs = existsSync(figDir) ? readdirSync(figDir).filter((f) => f.startsWith(`${unitId}-`) && f.endsWith(".svg")).sort().map((f) => `figures/${f}`) : [];

  return {
    schema: MANIFEST_SCHEMA,
    unit_id: unitId,
    terms,
    topic: {
      topic_id: topic.topic_id,
      category: topic.category,
      name_jp: topic.name_jp,
      objective_jp: topic.objective_jp,
      badge: topic.node_frequency?.badge ?? null,
    },
    index_unit: {
      title_jp: iu.title_jp,
      title_zh: iu.title_zh,
      title_en: iu.title_en,
      summary_jp: iu.summary_jp,
      rationale_jp: iu.rationale_jp,
      terms: iu.terms,
      prerequisites: iu.prerequisites,
    },
    v1_terms,
    chumon_members,
    term_questions,
    questions,
    figures: {
      kinds: figSpec.FIGURE_KINDS,
      steps: { min: figSpec.STEPS_MIN, max: figSpec.STEPS_MAX },
      network_days_max: figSpec.NETWORK_DAYS_MAX,
      svg_available: svgs,
      types_ts_lines: toLines(typesFrom >= 0 ? types.slice(typesFrom) : types),
    },
    rules: {
      detail_sentences: v2.DETAIL_SENTENCES,
      key_points: v2.KEY_POINTS,
      listing_max: v2.LISTING_MAX,
      counted_classification: src(v2.COUNTED_CLASSIFICATION),
      confirm: v2.CONFIRM,
      banned_phrases: Object.fromEntries(Object.entries(v2.BANNED_PHRASES).map(([l, rs]) => [l, rs.map(src)])),
      exam_framing_outside_points: Object.fromEntries(Object.entries(v2.EXAM_FRAMING).map(([l, rs]) => [l, rs.map(src)])),
      inline_markup: "**語** = キーワード / [[jp:用語]] = zh・en 本文中の日本語原語。analogy・総表 extra 以外の本文で使用可、図ラベル・caption は平文",
    },
    d195_lines: toLines(readFileSync(D195, "utf-8")),
    output_schema: JP_PART_SCHEMA,
    v1,
  };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const opt = parseArgs(process.argv.slice(2), { unit: "string", "data-root": "string" });
  if (!opt.unit) {
    console.error("usage: textbook-v2-prep.mjs --unit <unit_id> [--data-root <dir>]");
    process.exit(2);
  }
  const paths = dataPaths(opt["data-root"]);
  const m = await buildManifest(opt.unit, paths);
  const out = paths.manifest(opt.unit);
  mkdirSync(path.dirname(out), { recursive: true });
  const text = jsonText(m);
  const prev = existsSync(out) ? readFileSync(out, "utf-8") : null;
  if (prev !== text) writeFileSync(out, text);
  console.log(
    `${prev === text ? "=" : "✓"} ${path.relative(process.cwd(), out)} (${Buffer.byteLength(text)} bytes): ${m.terms.length} terms [${m.terms.join(" / ")}], ` +
      `${Object.keys(m.questions).length} questions, ${m.chumon_members.length} chumon members, svg ${m.figures.svg_available.length}`,
  );
}
