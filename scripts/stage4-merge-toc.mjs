#!/usr/bin/env node
/**
 * Stage 4 Phase A — ToC 統合 (確定的装配, 全量 63 topic, D-128-A / D-130-B / D-131)
 *
 * 入力: .planning/{input,plan,review}_{topic}.json (全 63 topic; pilot 3 + 全量 60)。
 * 出力: data/ip/textbook/unit_index.json (正式 ToC 骨格、Phase B が消費)
 *      + evidence/phase5/stage_04_toc/toc.md (人間可読、ユーザー審査用)
 *      + evidence/phase5/stage_04_toc/structural_audit.json (確定性結構復検結果)。
 *
 * 規劃 (LLM) の plan に、確定的に集計した term/unit 頻度を結合。badge は節点級 (D-131-C、全63節点分位)。
 * Session 79 §3 で手動実施した「独立確定性検算」を本 script に内化し、ゲート化:
 *   HARD (throw): 入力 term の過不足 / 捏造 / 重複 / term 文字列不一致 / unit_order 網羅漏れ。
 *   SOFT (記録): unit サイズ 5〜8 逸脱 (Rule D が rationale 付きで既に判定済のため note のみ)。
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TREE = join(ROOT, "data/ip/syllabus/knowledge_tree.json");
const PL = join(ROOT, "data/ip/textbook/.planning");
const stamp = new Date().toISOString();
const rd = (p) => JSON.parse(readFileSync(p, "utf8"));

// --- 全 topic をシラバス自然順で平坦化 ---
const tree = rd(TREE);
const orderedTopics = []; // {id, category, major, medium}
for (const cat of tree.categories)
  for (const mj of cat.major_categories)
    for (const md of mj.medium_categories)
      for (const tp of md.topics || [])
        orderedTopics.push({ id: tp.id, category: cat.id, major: mj.name_jp, medium: md.name_jp });

// --- 対象 = plan_ が存在する topic (シラバス順)。欠落は gap として報告 ---
const TARGETS = orderedTopics.filter((t) => existsSync(join(PL, `plan_${t.id}.json`)));
const missingPlans = orderedTopics.filter((t) => !existsSync(join(PL, `plan_${t.id}.json`))).map((t) => t.id);

// --- 確定性結構復検 (Session 79 §3 内化) ---
function structuralCheck(id, input, plan) {
  const inputTerms = input.terms.map((t) => t.term);
  const inputSet = new Set(inputTerms);
  const planTermsFlat = plan.units.flatMap((u) => u.terms.map((t) => t.term));
  const seen = new Map();
  for (const t of planTermsFlat) seen.set(t, (seen.get(t) || 0) + 1);
  const missing = inputTerms.filter((t) => !seen.has(t));
  const extra = [...seen.keys()].filter((t) => !inputSet.has(t)); // 捏造
  const duplicates = [...seen.entries()].filter(([, n]) => n > 1).map(([t]) => t);
  // unit_order 網羅
  const unitIds = plan.units.map((u) => u.unit_id);
  const orderSet = new Set(plan.unit_order || []);
  const orderMissing = unitIds.filter((uid) => !orderSet.has(uid));
  const orderExtra = (plan.unit_order || []).filter((uid) => !unitIds.includes(uid));
  // サイズ (soft)
  const sizes = plan.units.map((u) => ({ unit_id: u.unit_id, n: u.terms.length }));
  const sizeOutliers = sizes.filter((s) => s.n < 5 || s.n > 8);
  const hardFail = missing.length || extra.length || duplicates.length || orderMissing.length || orderExtra.length;
  return {
    topic_id: id,
    term_count_input: inputTerms.length,
    term_count_plan: planTermsFlat.length,
    missing, extra, duplicates, orderMissing, orderExtra,
    unit_sizes: sizes, size_outliers: sizeOutliers,
    hard_fail: !!hardFail,
  };
}

const topicsOut = [];
const mdLines = [];
const auditTopics = [];
const hardFailures = [];
let totalUnits = 0, totalTerms = 0;
const catStats = {}; // category -> {topics, units, terms}

mdLines.push(`# Stage 4 Phase A — 全量 ToC (63 topic)`);
mdLines.push(`> 生成: ${stamp} ／ scope: 全量 ${TARGETS.length} topic ／ D-128-A ゲート用（ユーザー審査対象）`);
mdLines.push(`> 規劃=general-purpose(opus)、核験=code-reviewer(opus, Rule D)。badge=全63節点 primary 分位（低頻/標準/頻出）。`);
mdLines.push(`> 確定性結構復検: 入力 term 過不足0・捏造0・重複0・unit_order 網羅 を本 script が機械検算 (HARD gate)。`);
mdLines.push("");

let curCat = null;
for (const t of TARGETS) {
  const id = t.id;
  const input = rd(join(PL, `input_${id}.json`));
  const plan = rd(join(PL, `plan_${id}.json`));
  const review = existsSync(join(PL, `review_${id}.json`)) ? rd(join(PL, `review_${id}.json`)) : null;

  // --- 結構復検 ---
  const chk = structuralCheck(id, input, plan);
  auditTopics.push(chk);
  if (chk.hard_fail) hardFailures.push(chk);

  const freqInTopic = new Map(input.terms.map((tt) => [tt.term, tt.freq_in_topic]));
  const freqGlobal = new Map(input.terms.map((tt) => [tt.term, tt.freq_global]));

  const byId = new Map(plan.units.map((u) => [u.unit_id, u]));
  const ordered = (plan.unit_order || []).map((uid) => byId.get(uid)).filter(Boolean);

  const unitsOut = ordered.map((u) => {
    const terms = u.terms.map((tt) => ({
      term: tt.term,
      freq_in_topic: freqInTopic.get(tt.term) ?? 0,
      freq_global: freqGlobal.get(tt.term) ?? 0,
      order_reason_jp: tt.order_reason_jp,
    }));
    const unitTotalFreq = terms.reduce((s, tt) => s + tt.freq_in_topic, 0);
    return {
      unit_id: u.unit_id,
      topic_id: id,
      title_jp: u.title_jp,
      summary_jp: u.summary_jp,
      rationale_jp: u.rationale_jp,
      node_freq_badge: input.node_frequency.badge, // 節点級 (D-131-C)
      unit_total_freq_in_topic: unitTotalFreq, // unit 級 raw (tier は捏造しない)
      term_count: terms.length,
      terms,
      prerequisites: u.prerequisites || [],
    };
  });

  totalUnits += unitsOut.length;
  totalTerms += unitsOut.reduce((s, u) => s + u.term_count, 0);
  catStats[t.category] = catStats[t.category] || { topics: 0, units: 0, terms: 0 };
  catStats[t.category].topics++;
  catStats[t.category].units += unitsOut.length;
  catStats[t.category].terms += unitsOut.reduce((s, u) => s + u.term_count, 0);

  topicsOut.push({
    topic_id: id,
    category: input.category,
    major: input.major,
    medium: input.medium,
    name_jp: input.name_jp,
    objective_jp: input.objective_jp,
    node_frequency: input.node_frequency,
    planning_notes_jp: plan.planning_notes_jp,
    rule_d: review
      ? { verdict: review.final_review.verdict, rounds: review.rounds, history: review.history_verdicts }
      : { verdict: "MISSING", rounds: 0, history: [] },
    structural_check: { hard_fail: chk.hard_fail, size_outliers: chk.size_outliers },
    unit_order: plan.unit_order,
    units: unitsOut,
  });

  // --- markdown (category 見出し付き) ---
  if (t.category !== curCat) {
    curCat = t.category;
    mdLines.push(`\n# ▼ ${curCat}\n`);
  }
  const rd_v = review ? review.final_review.verdict : "MISSING";
  const rd_h = review ? review.history_verdicts.map((h) => "r" + h.round + "=" + h.verdict).join(" → ") : "-";
  mdLines.push(`## ${id} — ${input.name_jp}（${input.major} / ${input.medium}）`);
  mdLines.push(`- 目標: ${input.objective_jp}`);
  mdLines.push(`- 節点頻度: primary ${input.node_frequency.primary_questions}題 / secondary ${input.node_frequency.secondary_questions}題 → **${input.node_frequency.badge}**`);
  mdLines.push(`- Rule D: **${rd_v}**（${review ? review.rounds : 0}ラウンド: ${rd_h}）`);
  mdLines.push(`- ${unitsOut.length} ユニット / ${unitsOut.reduce((s, u) => s + u.term_count, 0)} 用語${chk.size_outliers.length ? `　⚠ サイズ逸脱: ${chk.size_outliers.map((s) => s.unit_id + "(" + s.n + ")").join(", ")}` : ""}`);
  mdLines.push("");
  for (const u of unitsOut) {
    const pre = u.prerequisites.length ? `（前提: ${u.prerequisites.join(", ")}）` : "（前提なし）";
    mdLines.push(`### ${u.unit_id} ${u.title_jp}　[${u.term_count}語 / topic内題数計${u.unit_total_freq_in_topic}] ${pre}`);
    mdLines.push(`${u.summary_jp}`);
    mdLines.push(`<sub>分割根拠: ${u.rationale_jp}</sub>`);
    mdLines.push(`用語順: ${u.terms.map((tt) => `${tt.term}(${tt.freq_in_topic})`).join(" → ")}`);
    mdLines.push("");
  }
  mdLines.push("---");
  mdLines.push("");
}

// --- 構造監査 出力 ---
const audit = {
  generated_at: stamp,
  scope: "full",
  expected_topics: orderedTopics.length,
  resolved_topics: TARGETS.length,
  missing_plans: missingPlans,
  hard_failures: hardFailures.map((h) => ({
    topic_id: h.topic_id, missing: h.missing, extra: h.extra, duplicates: h.duplicates,
    orderMissing: h.orderMissing, orderExtra: h.orderExtra,
  })),
  size_outliers_total: auditTopics.reduce((s, a) => s + a.size_outliers.length, 0),
  topics: auditTopics,
};
writeFileSync(join(ROOT, "evidence/phase5/stage_04_toc/structural_audit.json"), JSON.stringify(audit, null, 2));

const index = {
  schema_version: "stage4-phaseA-toc-v1",
  generated_at: stamp,
  scope: "full",
  decisions: ["D-128", "D-129", "D-130", "D-131", "D-132"],
  stats: { topics: TARGETS.length, units: totalUnits, terms: totalTerms, by_category: catStats },
  topics: topicsOut,
};
writeFileSync(join(ROOT, "data/ip/textbook/unit_index.json"), JSON.stringify(index, null, 2));
writeFileSync(join(ROOT, "evidence/phase5/stage_04_toc/toc.md"), mdLines.join("\n"));

console.log("=== 全量 ToC 統合完了 ===");
console.log(`topics=${TARGETS.length}/${orderedTopics.length} units=${totalUnits} terms=${totalTerms}`);
for (const [c, v] of Object.entries(catStats)) console.log(`  ${c}: ${v.topics}topic / ${v.units}unit / ${v.terms}term`);
const verdictCount = topicsOut.reduce((m, t) => { const v = t.rule_d.verdict; m[v] = (m[v] || 0) + 1; return m; }, {});
console.log(`Rule D: ${Object.entries(verdictCount).map(([k, v]) => `${k}=${v}`).join(" / ")}`);
console.log(`構造復検: HARD失敗=${hardFailures.length} / サイズ逸脱=${audit.size_outliers_total}`);
if (missingPlans.length) console.warn(`⚠ plan 欠落 topic (${missingPlans.length}): ${missingPlans.join(", ")}`);
console.log("出力: data/ip/textbook/unit_index.json + evidence/phase5/stage_04_toc/{toc.md,structural_audit.json}");

if (hardFailures.length) {
  console.error(`\n❌ HARD 構造失敗 ${hardFailures.length} 件 — term 整合性違反。unit_index.json は書込済だが要修復:`);
  for (const h of hardFailures) {
    console.error(`  [${h.topic_id}] 入力${h.term_count_input}/plan${h.term_count_plan} 欠落=${h.missing.length} 捏造=${h.extra.length} 重複=${h.duplicates.length} order漏=${h.orderMissing.length}`);
    if (h.missing.length) console.error(`     欠落: ${h.missing.join(", ")}`);
    if (h.extra.length) console.error(`     捏造: ${h.extra.join(", ")}`);
    if (h.duplicates.length) console.error(`     重複: ${h.duplicates.join(", ")}`);
  }
  process.exit(2);
}
