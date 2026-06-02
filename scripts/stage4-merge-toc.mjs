#!/usr/bin/env node
/**
 * Stage 4 Phase A — ToC 統合 (確定的装配, D-128-A / D-130-B / D-131)
 *
 * 入力: .planning/{input,plan,review}_{topic}.json (pilot 3 節点)。
 * 出力: data/ip/textbook/unit_index.pilot.json (pilot ToC 骨格)
 *      + evidence/phase5/stage_04_toc_pilot/toc_pilot.md (人間可読、ユーザー審査用)。
 *
 * 規劃 (LLM) の plan に、確定的に集計した term/unit 頻度を結合。badge は節点級 (D-131-C、
 * 全63節点分位)。unit 級 raw 頻度 (term freq_in_topic 合計) を併記 (データ裏付け、tier は捏造しない)。
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PL = join(ROOT, "data/ip/textbook/.planning");
const PILOTS = ["strategy-02-04", "management-11-29", "technology-16-43"];
const stamp = new Date().toISOString();

const rd = (p) => JSON.parse(readFileSync(p, "utf8"));

const topicsOut = [];
const mdLines = [];
mdLines.push(`# Stage 4 Phase A — pilot ToC (3 跨類節点)`);
mdLines.push(`> 生成: ${stamp} ／ scope: pilot 3 節点 ／ D-128-A 廉価ゲート用（ユーザー審査対象）`);
mdLines.push(`> 規劃=general-purpose(opus)、核験=code-reviewer(opus, Rule D)。badge=全63節点 primary 分位（低頻/標準/頻出）。`);
mdLines.push("");

let totalUnits = 0;
let totalTerms = 0;

for (const id of PILOTS) {
  const input = rd(join(PL, `input_${id}.json`));
  const plan = rd(join(PL, `plan_${id}.json`));
  const review = rd(join(PL, `review_${id}.json`));

  const freqInTopic = new Map(input.terms.map((t) => [t.term, t.freq_in_topic]));
  const freqGlobal = new Map(input.terms.map((t) => [t.term, t.freq_global]));

  // plan.units を unit_order の順に
  const byId = new Map(plan.units.map((u) => [u.unit_id, u]));
  const ordered = plan.unit_order.map((uid) => byId.get(uid)).filter(Boolean);

  const unitsOut = ordered.map((u) => {
    const terms = u.terms.map((t) => ({
      term: t.term,
      freq_in_topic: freqInTopic.get(t.term) ?? 0,
      freq_global: freqGlobal.get(t.term) ?? 0,
      order_reason_jp: t.order_reason_jp,
    }));
    const unitTotalFreq = terms.reduce((s, t) => s + t.freq_in_topic, 0);
    return {
      unit_id: u.unit_id,
      topic_id: id,
      title_jp: u.title_jp,
      summary_jp: u.summary_jp,
      rationale_jp: u.rationale_jp,
      node_freq_badge: input.node_frequency.badge, // 節点級 (D-131-C)
      unit_total_freq_in_topic: unitTotalFreq, // unit 級 raw (データ裏付け、tier は Phase B/全量で確定)
      term_count: terms.length,
      terms,
      prerequisites: u.prerequisites || [],
    };
  });

  totalUnits += unitsOut.length;
  totalTerms += unitsOut.reduce((s, u) => s + u.term_count, 0);

  topicsOut.push({
    topic_id: id,
    category: input.category,
    major: input.major,
    medium: input.medium,
    name_jp: input.name_jp,
    objective_jp: input.objective_jp,
    node_frequency: input.node_frequency,
    planning_notes_jp: plan.planning_notes_jp,
    rule_d: { verdict: review.final_review.verdict, rounds: review.rounds, history: review.history_verdicts },
    unit_order: plan.unit_order,
    units: unitsOut,
  });

  // --- markdown ---
  mdLines.push(`## ${id} — ${input.name_jp}（${input.category}）`);
  mdLines.push(`- 目標: ${input.objective_jp}`);
  mdLines.push(`- 節点頻度: primary ${input.node_frequency.primary_questions}題 / secondary ${input.node_frequency.secondary_questions}題 → **${input.node_frequency.badge}**`);
  mdLines.push(`- Rule D: **${review.final_review.verdict}**（${review.rounds}ラウンド: ${review.history_verdicts.map((h) => "r" + h.round + "=" + h.verdict).join(" → ")}）`);
  mdLines.push(`- ${unitsOut.length} ユニット / ${unitsOut.reduce((s, u) => s + u.term_count, 0)} 用語`);
  mdLines.push("");
  for (const u of unitsOut) {
    const pre = u.prerequisites.length ? `（前提: ${u.prerequisites.join(", ")}）` : "（前提なし）";
    mdLines.push(`### ${u.unit_id} ${u.title_jp}　[${u.term_count}語 / topic内題数計${u.unit_total_freq_in_topic}] ${pre}`);
    mdLines.push(`${u.summary_jp}`);
    mdLines.push(`<sub>分割根拠: ${u.rationale_jp}</sub>`);
    const termline = u.terms.map((t) => `${t.term}(${t.freq_in_topic})`).join(" → ");
    mdLines.push(`用語順: ${termline}`);
    mdLines.push("");
  }
  mdLines.push("---");
  mdLines.push("");
}

const index = {
  schema_version: "stage4-phaseA-toc-pilot-v1",
  generated_at: stamp,
  scope: "pilot-3-nodes",
  pilot_topics: PILOTS,
  decisions: ["D-128", "D-129", "D-130", "D-131", "D-132"],
  stats: { topics: PILOTS.length, units: totalUnits, terms: totalTerms },
  topics: topicsOut,
};

writeFileSync(join(ROOT, "data/ip/textbook/unit_index.pilot.json"), JSON.stringify(index, null, 2));
writeFileSync(join(ROOT, "evidence/phase5/stage_04_toc_pilot/toc_pilot.md"), mdLines.join("\n"));

console.log("=== ToC 統合完了 ===");
console.log(`topics=${PILOTS.length} units=${totalUnits} terms=${totalTerms}`);
for (const t of topicsOut) console.log(`  [${t.topic_id}] ${t.name_jp}: ${t.units.length}u / ${t.units.reduce((s, u) => s + u.term_count, 0)}t / RuleD=${t.rule_d.verdict}`);
console.log("出力: data/ip/textbook/unit_index.pilot.json + evidence/phase5/stage_04_toc_pilot/toc_pilot.md");
