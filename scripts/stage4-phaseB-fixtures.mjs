#!/usr/bin/env node
/**
 * Stage 4 Phase B — 確定的 fixtures 装配 (D-131-A/B 選題 + D-131-E 原裁剪図索引)
 *
 * 非 LLM (D-132)。unit_index.json (全量 ToC) の各 unit に対し:
 *  - inline_quiz: 即時チェック (per term 1〜2題, D-131-A)
 *  - challenge_questions: チャレンジ (per unit 3〜5題, D-131-B, 混合=年度+term跨度 D-131-D)
 *  - source_figures: 引用題が持つ原裁剪図/group共有図 (D-131-E track2)
 * + 全局 figure_index.json (溯源対照)。
 *
 * quiz は question_bank ID 参照のみ (内嵌せず, D-118)。invariants 不変。
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const rd = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));

const toc = rd("data/ip/textbook/unit_index.json");
const bank = rd("data/ip/exams/question_bank.json");
const groups = rd("data/ip/exams/groups.json");
const questions = bank.questions;

const qById = new Map(questions.map((q) => [q.id, q]));
const groupById = new Map(Object.values(groups.groups).map((g) => [g.group_id, g]));

const confRank = (c) => ({ high: 0, medium: 1, low: 2 }[c] ?? 3);
const examOf = (id) => id.split("-")[0]; // 年度跨度の単位 (29 回試験)

// 各 topic の primary 題プール
const primaryByTopic = new Map();
for (const q of questions) {
  const pt = q.syllabus_refs?.primary_topic;
  if (!pt) continue;
  if (!primaryByTopic.has(pt)) primaryByTopic.set(pt, []);
  primaryByTopic.get(pt).push(q);
}
const qHasTerm = (q, term) => Array.isArray(q.syllabus_refs?.terms) && q.syllabus_refs.terms.includes(term);

// 図参照の解決 (q.figure_path 優先, 無ければ group 共有図)
function figureForQuestion(q) {
  if (q.figure_path) {
    return {
      source: "question",
      question_id: q.id,
      figure_path: q.figure_path,
      figure_type: q.figure_type || null,
      figure_description: q.figure_description || null,
      group_id: q.group_id || null,
    };
  }
  if (q.group_id && groupById.has(q.group_id)) {
    const g = groupById.get(q.group_id);
    if (g.shared_figure?.path) {
      return {
        source: "group",
        question_id: q.id,
        figure_path: g.shared_figure.path,
        figure_type: "group_shared",
        figure_description: g.shared_figure.caption || null,
        group_id: q.group_id,
      };
    }
  }
  return null;
}

const figureIndex = new Map(); // figure_path -> {figure_path, type, description, group_id, source_question_ids:Set, units:Set}
const fixtures = [];

for (const topic of toc.topics) {
  const topicId = topic.topic_id;
  const pool = primaryByTopic.get(topicId) || [];

  for (const unit of topic.units) {
    const unitTerms = unit.terms.map((t) => t.term);
    const freqByTerm = new Map(unit.terms.map((t) => [t.term, t.freq_in_topic]));
    const usedInUnit = new Set();

    // --- 即時チェック (per term 1〜2題, D-131-A) ---
    // 稀少度優先分配: 候補が少ない term から1題確保し、共有設問の取り合い(starvation)を防ぐ。
    // (例: サブスクの唯一直配題をアクティベーションが2題目で奪い、サブスクが無関係 fallback に落ちる事故を回避。Rule A medium 指摘)
    const directMap = new Map(
      unitTerms.map((term) => [
        term,
        pool.filter((q) => qHasTerm(q, term)).sort((a, b) => confRank(a.syllabus_refs.confidence) - confRank(b.syllabus_refs.confidence) || a.id.localeCompare(b.id)),
      ])
    );
    const assign = new Map(unitTerms.map((t) => [t, []]));
    const isFallback = new Map(unitTerms.map((t) => [t, false]));

    // pass 1: 候補数昇順 → 各 term に未使用の直配1題
    const scarcityOrder = [...unitTerms].sort((a, b) => directMap.get(a).length - directMap.get(b).length || unitTerms.indexOf(a) - unitTerms.indexOf(b));
    for (const term of scarcityOrder) {
      const cand = directMap.get(term).find((q) => !usedInUnit.has(q.id));
      if (cand) { assign.get(term).push(cand.id); usedInUnit.add(cand.id); }
    }
    // pass 2: 高頻度 term (freq_in_topic>=8) に未使用直配があれば2題目 (unit順)
    for (const term of unitTerms) {
      if (assign.get(term).length !== 1) continue;
      if ((freqByTerm.get(term) || 0) < 8) continue;
      const cand2 = directMap.get(term).find((q) => !usedInUnit.has(q.id));
      if (cand2) { assign.get(term).push(cand2.id); usedInUnit.add(cand2.id); }
    }
    // pass 3: 直配ゼロの term → 節点級フォールバック (unit の他 term に触れる題を優先, なければ任意未使用)
    for (const term of unitTerms) {
      if (assign.get(term).length) continue;
      isFallback.set(term, true);
      const unused = pool.filter((q) => !usedInUnit.has(q.id));
      const pref = unused.filter((q) => unitTerms.some((t) => qHasTerm(q, t)));
      const fb = (pref.length ? pref : unused).sort((a, b) => confRank(a.syllabus_refs.confidence) - confRank(b.syllabus_refs.confidence) || a.id.localeCompare(b.id))[0];
      if (fb) { assign.get(term).push(fb.id); usedInUnit.add(fb.id); }
    }
    const inline = unitTerms.map((term) => ({ term, question_ids: assign.get(term), fallback: isFallback.get(term) }));

    // --- チャレンジ (per unit 3〜5, D-131-B/D 混合=年度+term跨度) ---
    const relevant = pool.filter((q) => !usedInUnit.has(q.id) && unitTerms.some((t) => qHasTerm(q, t)));
    const nodeOnly = pool.filter((q) => !usedInUnit.has(q.id) && !unitTerms.some((t) => qHasTerm(q, t)));
    const challenge = [];
    const seenExam = new Set();
    const coveredTerms = new Set();
    const pickGreedy = (cands) => {
      let remaining = cands.slice();
      while (challenge.length < 5 && remaining.length) {
        // スコア: 新年度+2 / unit新term被覆+1、tie=conf→id
        remaining.sort((a, b) => {
          const sa = (seenExam.has(examOf(a.id)) ? 0 : 2) + (unitTerms.some((t) => qHasTerm(a, t) && !coveredTerms.has(t)) ? 1 : 0);
          const sb = (seenExam.has(examOf(b.id)) ? 0 : 2) + (unitTerms.some((t) => qHasTerm(b, t) && !coveredTerms.has(t)) ? 1 : 0);
          return sb - sa || confRank(a.syllabus_refs.confidence) - confRank(b.syllabus_refs.confidence) || a.id.localeCompare(b.id);
        });
        const q = remaining.shift();
        challenge.push(q.id);
        seenExam.add(examOf(q.id));
        unitTerms.forEach((t) => { if (qHasTerm(q, t)) coveredTerms.add(t); });
      }
    };
    pickGreedy(relevant);
    if (challenge.length < 3) pickGreedy(nodeOnly); // 3未満なら節点池で補完

    // --- source_figures (D-131-E track2): 引用題 (inline + challenge) の図 ---
    const referenced = [...new Set([...inline.flatMap((x) => x.question_ids), ...challenge])];
    const seenFig = new Set();
    const sourceFigures = [];
    for (const qid of referenced) {
      const q = qById.get(qid);
      const fig = figureForQuestion(q);
      if (!fig) continue;
      if (seenFig.has(fig.figure_path)) continue;
      seenFig.add(fig.figure_path);
      sourceFigures.push(fig);
      // global index
      if (!figureIndex.has(fig.figure_path)) {
        figureIndex.set(fig.figure_path, { figure_path: fig.figure_path, figure_type: fig.figure_type, figure_description: fig.figure_description, group_id: fig.group_id, source_question_ids: new Set(), units: new Set() });
      }
      const fi = figureIndex.get(fig.figure_path);
      fi.source_question_ids.add(qid);
      fi.units.add(unit.unit_id);
    }

    fixtures.push({
      unit_id: unit.unit_id,
      topic_id: topicId,
      term_count: unitTerms.length,
      inline_quiz: inline,
      challenge_questions: challenge,
      source_figures: sourceFigures,
      selection_meta: {
        inline_total: inline.reduce((s, x) => s + x.question_ids.length, 0),
        inline_fallback_terms: inline.filter((x) => x.fallback).map((x) => x.term),
        challenge_count: challenge.length,
        challenge_year_span: new Set(challenge.map(examOf)).size,
        challenge_terms_covered: coveredTerms.size,
        source_figure_count: sourceFigures.length,
      },
    });
  }
}

// figure_index を直列化
const figureIndexOut = {
  schema_version: "stage4-figure-index-v1",
  scope: "full",
  note: "原裁剪図/group共有図の溯源索引 (D-131-E track2)。再裁剪せず Stage2 figures を参照。",
  figures: [...figureIndex.values()].map((f) => ({
    figure_path: f.figure_path,
    figure_type: f.figure_type,
    figure_description: f.figure_description,
    group_id: f.group_id,
    source_question_ids: [...f.source_question_ids],
    referenced_by_units: [...f.units],
  })),
};

writeFileSync(join(ROOT, "data/ip/textbook/.planning/quiz_fixtures.json"), JSON.stringify({ scope: "full", units: fixtures }, null, 2));
writeFileSync(join(ROOT, "data/ip/textbook/figure_index.json"), JSON.stringify(figureIndexOut, null, 2));

// 要約
console.log("=== Phase B fixtures 装配完了 ===");
let tIn = 0, tCh = 0, tFb = 0, tFig = 0;
for (const f of fixtures) {
  const m = f.selection_meta;
  tIn += m.inline_total; tCh += m.challenge_count; tFb += m.inline_fallback_terms.length; tFig += m.source_figure_count;
  console.log(`[${f.unit_id}] inline=${m.inline_total}(fb:${m.inline_fallback_terms.length}) challenge=${m.challenge_count}(年${m.challenge_year_span}/term${m.challenge_terms_covered}) figs=${m.source_figure_count}`);
}
console.log(`\n計: units=${fixtures.length} inline=${tIn} challenge=${tCh} fallback_terms=${tFb} source_figures(unique paths)=${figureIndexOut.figures.length} (unit参照延べ=${tFig})`);
console.log("出力: .planning/quiz_fixtures.json + figure_index.json");
