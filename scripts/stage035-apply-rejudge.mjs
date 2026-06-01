#!/usr/bin/env node
// Stage 3.5a — low-conf 重判結果の適用 (D-127)
// 入力: data/ip/exams/.tmp/s035/rejudge_result.json (workflow 返回の mappings)
// 処理: 重判結果を question_bank.json + by_year/* に適用。
//   - primary 一致 → confirmed / primary 変化 → changed (old→new 記録、Rule A 必査)
//   - confidence: upgraded(low→med/high) / same / downgraded
// 安全: backup .pre-s035 / 非法 topic id 検出 / invariant 検証 (correct_answer/stem/choices/figure/source/group 不変)
import fs from "node:fs";

const QB = "data/ip/exams/question_bank.json";
const QB_BACKUP = QB + ".pre-s035";
const BYYEAR_DIR = "data/ip/exams/by_year";
const RESULT = "data/ip/exams/.tmp/s035/rejudge_result.json";
const KT = "data/ip/syllabus/knowledge_tree.json";

// --- 合法 topic id 集合 ---
const tree = JSON.parse(fs.readFileSync(KT, "utf8"));
const validTopics = new Set();
for (const c of tree.categories) for (const mj of c.major_categories) for (const md of mj.medium_categories) for (const tp of md.topics) validTopics.add(tp.id);

// --- 重判結果 ---
const result = JSON.parse(fs.readFileSync(RESULT, "utf8"));
const mappings = Array.isArray(result) ? result : result.mappings;
console.log("重判結果:", mappings.length, "題");

// --- 非法 primary 検出 ---
const invalid = mappings.filter(m => !validTopics.has(m.primary_topic));
if (invalid.length) {
  console.error("✗ 非法 primary_topic:", invalid.map(m => `${m.id}→${m.primary_topic}`).join(", "));
  process.exit(1);
}
// secondary も検証
for (const m of mappings) {
  const badSec = (m.secondary_topics || []).filter(s => !validTopics.has(s));
  if (badSec.length) { console.error(`✗ ${m.id} 非法 secondary:`, badSec.join(",")); process.exit(1); }
}

// --- question_bank backup + load ---
const rawQB = fs.readFileSync(QB, "utf8");
if (!fs.existsSync(QB_BACKUP)) { fs.writeFileSync(QB_BACKUP, rawQB); console.log("✓ backup:", QB_BACKUP); }
else console.log("• backup 既存:", QB_BACKUP);
const qb = JSON.parse(rawQB);
const backupQb = JSON.parse(fs.readFileSync(QB_BACKUP, "utf8"));
const byId = {}; for (const q of qb.questions) byId[q.id] = q;
const backupById = {}; for (const q of backupQb.questions) backupById[q.id] = q;

// --- 適用 + 分類 ---
const stat = { confirmed: 0, changed: 0, up: 0, same: 0, down: 0 };
const changedList = [], upList = [], stillLow = [];
const RANK = { low: 0, medium: 1, high: 2 };
for (const m of mappings) {
  const q = byId[m.id];
  if (!q) { console.error("✗ 題不存在:", m.id); process.exit(1); }
  const old = q.syllabus_refs;
  const primaryChanged = old.primary_topic !== m.primary_topic;
  if (primaryChanged) { stat.changed++; changedList.push({ id: m.id, from: old.primary_topic, to: m.primary_topic, reason: m.reasoning }); }
  else stat.confirmed++;
  const dr = RANK[m.confidence] - RANK[old.confidence];
  if (dr > 0) { stat.up++; upList.push({ id: m.id, from: old.confidence, to: m.confidence }); }
  else if (dr < 0) stat.down++;
  else stat.same++;
  if (m.confidence === "low") stillLow.push(m.id);
  // 適用 (invariants は触らない)
  q.syllabus_refs = {
    primary_topic: m.primary_topic,
    secondary_topics: (m.secondary_topics || []).slice(0, 2),
    terms: m.terms || [],
    confidence: m.confidence,
    mapping_status: "rejudged",
  };
}

// --- invariant 検証 (重判題のみ、backup 比較) ---
const INV = ["stem_jp", "choices_jp", "correct_answer", "has_figure", "figure_path", "figure_bbox_pct", "group_id", "source"];
for (const m of mappings) {
  const q = byId[m.id], b = backupById[m.id];
  for (const f of INV) {
    if (JSON.stringify(q[f]) !== JSON.stringify(b[f])) { console.error(`✗ invariant 破壊: ${m.id}.${f}`); process.exit(1); }
  }
}
console.log("✓ invariant 不変 (correct_answer/stem/choices/figure/source/group)");

// --- 書き戻し question_bank (原フォーマット 2空格、Stage3 apply と同一) ---
fs.writeFileSync(QB, JSON.stringify(qb, null, 2));

// --- by_year 同期 ---
const byExam = {};
for (const m of mappings) { const exam = m.id.split("-q")[0]; (byExam[exam] = byExam[exam] || []).push(m.id); }
let filesUpd = 0;
for (const exam of Object.keys(byExam)) {
  const fp = `${BYYEAR_DIR}/${exam}.json`;
  if (!fs.existsSync(fp)) { console.error("✗ by_year 不存在:", fp); process.exit(1); }
  const yj = JSON.parse(fs.readFileSync(fp, "utf8"));
  const arr = Array.isArray(yj) ? yj : yj.questions;
  const ym = {}; for (const q of arr) ym[q.id] = q;
  for (const id of byExam[exam]) { if (ym[id]) ym[id].syllabus_refs = byId[id].syllabus_refs; }
  fs.writeFileSync(fp, JSON.stringify(yj, null, 2));
  filesUpd++;
}

console.log("\n=== Stage 3.5a 適用結果 ===");
console.log(`primary: confirmed ${stat.confirmed} / changed ${stat.changed}`);
console.log(`confidence: upgraded ${stat.up} / same ${stat.same} / downgraded ${stat.down}`);
console.log(`依然 low: ${stillLow.length} 題`);
console.log(`by_year 更新: ${filesUpd} ファイル`);
if (changedList.length) { console.log("\n--- primary 改判 (Rule A 必査) ---"); changedList.forEach(c => console.log(`  ${c.id}: ${c.from} → ${c.to}`)); }
// 派生物を evidence 用に保存
fs.writeFileSync("data/ip/exams/.tmp/s035/rejudge_classified.json", JSON.stringify({ stat, changedList, upList, stillLow }, null, 1));
console.log("\n分類詳細: data/ip/exams/.tmp/s035/rejudge_classified.json");
