#!/usr/bin/env node
/**
 * Stage 4 Phase A — 機械装配: per-topic 規劃 pass 入力ビルダ (D-130-A, D-131-C)
 *
 * 非 LLM の確定的装配 (D-132: 機械処理は TS/JS スクリプト)。
 * 入力: knowledge_tree.json (63 topic / terms) + question_bank.json (2,900 題 + syllabus_refs)。
 * 出力: data/ip/textbook/.planning/input_{topic}.json (pilot 3 節点) + planning_stats.json。
 *
 * 各 term の歴史題頻 (D-130-A) と 節点級頻度分位 (D-131-C 頻出/標準/低頻) を確定的に集計。
 * LLM 規劃 pass はこの入力を読んでユニット分割/排列を出力する (別 step, Workflow)。
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TREE = join(ROOT, "data/ip/syllabus/knowledge_tree.json");
const BANK = join(ROOT, "data/ip/exams/question_bank.json");
const OUT_DIR = join(ROOT, "data/ip/textbook/.planning");

const PILOTS = ["strategy-02-04", "management-11-29", "technology-16-43"];

const tree = JSON.parse(readFileSync(TREE, "utf8"));
const bank = JSON.parse(readFileSync(BANK, "utf8"));
const questions = bank.questions;

// --- 全 topic を平坦化 (id -> {topic, category}) ---
const topicMap = new Map();
for (const cat of tree.categories) {
  for (const mj of cat.major_categories) {
    for (const md of mj.medium_categories) {
      for (const tp of md.topics || []) {
        topicMap.set(tp.id, { topic: tp, category: cat.id, major: mj.name_jp, medium: md.name_jp });
      }
    }
  }
}

// --- 節点級題頻 (primary) を全 63 topic で集計 → 分位閾値 (D-131-C) ---
const primaryCount = new Map(); // topicId -> #questions where primary_topic==topicId
for (const id of topicMap.keys()) primaryCount.set(id, 0);
for (const q of questions) {
  const pt = q.syllabus_refs?.primary_topic;
  if (pt && primaryCount.has(pt)) primaryCount.set(pt, primaryCount.get(pt) + 1);
}
const counts = [...primaryCount.values()].sort((a, b) => a - b);
const quantile = (p) => {
  const idx = (counts.length - 1) * p;
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  return counts[lo] + (counts[hi] - counts[lo]) * (idx - lo);
};
// 三分位: 低頻 < t33 <= 標準 < t67 <= 頻出
const t33 = quantile(1 / 3);
const t67 = quantile(2 / 3);
const badgeOf = (n) => (n < t33 ? "低頻" : n < t67 ? "標準" : "頻出");

// --- term 題頻集計 (D-130-A): 各 term につき topic 内 / 全体 ---
function termFreq(topicId, term) {
  let inTopic = 0, global = 0;
  for (const q of questions) {
    const refs = q.syllabus_refs;
    if (!refs) continue;
    const hasTerm = Array.isArray(refs.terms) && refs.terms.includes(term);
    if (!hasTerm) continue;
    global++;
    if (refs.primary_topic === topicId) inTopic++;
  }
  return { inTopic, global };
}

// --- pilot 節点ごとに入力を構築 ---
const stats = { generated_for: PILOTS, badge_thresholds: { t33, t67, rule: "n<t33=低頻 / t33<=n<t67=標準 / n>=t67=頻出" }, topics: [] };

for (const id of PILOTS) {
  const entry = topicMap.get(id);
  if (!entry) throw new Error(`pilot topic not found: ${id}`);
  const tp = entry.topic;

  const primary = primaryCount.get(id);
  const secondary = questions.filter((q) => (q.syllabus_refs?.secondary_topics || []).includes(id)).length;

  // terms: シラバス自然順 (= 前置概念ヒント D-130-A) を保持しつつ題頻を付与
  const terms = (tp.terms || []).map((term, i) => {
    const f = termFreq(id, term);
    return { term, syllabus_order: i, freq_in_topic: f.inTopic, freq_global: f.global };
  });

  const input = {
    topic_id: id,
    category: entry.category,
    major: entry.major,
    medium: entry.medium,
    name_jp: tp.name_jp,
    objective_jp: tp.objective_jp,
    node_frequency: { primary_questions: primary, secondary_questions: secondary, badge: badgeOf(primary) },
    term_count: terms.length,
    // syllabus 自然順 = 概念依存の弱いヒント (D-130-A 前置概念ヒント)。LLM が依存を再判定する。
    terms,
    _meta: {
      note: "LLM 規劃 pass 用入力。確定的装配 (D-132)。terms は syllabus 自然順、freq は question_bank syllabus_refs 集計。",
      badge_thresholds: { t33, t67 },
    },
  };

  writeFileSync(join(OUT_DIR, `input_${id}.json`), JSON.stringify(input, null, 2));
  stats.topics.push({
    topic_id: id, name_jp: tp.name_jp, term_count: terms.length,
    primary, secondary, badge: badgeOf(primary),
    terms_with_direct_questions: terms.filter((t) => t.freq_in_topic > 0).length,
    terms_zero_direct: terms.filter((t) => t.freq_in_topic === 0).map((t) => t.term),
  });
}

writeFileSync(join(OUT_DIR, "planning_stats.json"), JSON.stringify(stats, null, 2));

// --- コンソール要約 ---
console.log("=== Stage 4 Phase A 規劃入力 装配完了 ===");
console.log(`badge 閾値 (全63節点 primary 分位): 低頻 < ${t33.toFixed(1)} <= 標準 < ${t67.toFixed(1)} <= 頻出`);
console.log(`全63節点 primary: min=${counts[0]} median=${quantile(0.5).toFixed(0)} max=${counts[counts.length - 1]}`);
for (const t of stats.topics) {
  console.log(`\n[${t.topic_id}] ${t.name_jp}`);
  console.log(`  terms=${t.term_count} primary題=${t.primary} secondary題=${t.secondary} badge=${t.badge}`);
  console.log(`  直配題ありterm=${t.terms_with_direct_questions}/${t.term_count}  直配0=${t.terms_zero_direct.length}件`);
  if (t.terms_zero_direct.length) console.log(`    直配0 terms: ${t.terms_zero_direct.join(", ")}`);
}
console.log(`\n出力: ${OUT_DIR}/input_*.json + planning_stats.json`);
