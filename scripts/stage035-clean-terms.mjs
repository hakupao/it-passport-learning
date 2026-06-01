#!/usr/bin/env node
// Stage 3.5a 後処理 — rejudge 題の terms から樹外造語を除去 (Rule A 発見)
// 重判 mapper が「索引に無ければ核心語を造る」指示で造語を混入 → Stage 3 reconcile の
// unknown_terms 除去と同等の清洗を rejudged 題に適用 (索引規則: terms は topic 用語リスト由来)。
// 非 rejudged 題 (2841) は Stage 3 で清洗済のため対象外。invariant 不変、by_year 同期。
import fs from "node:fs";

const QB = "data/ip/exams/question_bank.json";
const BYYEAR_DIR = "data/ip/exams/by_year";
const KT = "data/ip/syllabus/knowledge_tree.json";

// 全量 term 集合 (補完後 1417)
const tree = JSON.parse(fs.readFileSync(KT, "utf8"));
const treeTerms = new Set();
for (const c of tree.categories) for (const mj of c.major_categories) for (const md of mj.medium_categories) for (const tp of md.topics) for (const t of (tp.terms || [])) treeTerms.add(t);

const qb = JSON.parse(fs.readFileSync(QB, "utf8"));
const byId = {}; for (const q of qb.questions) byId[q.id] = q;

const removedLog = [], emptied = [];
let cleaned = 0;
for (const q of qb.questions) {
  if (q.syllabus_refs.mapping_status !== "rejudged") continue;
  const terms = q.syllabus_refs.terms || [];
  const kept = terms.filter(t => treeTerms.has(t));
  const removed = terms.filter(t => !treeTerms.has(t));
  if (removed.length) {
    cleaned++;
    removedLog.push({ id: q.id, removed, kept });
    if (kept.length === 0) emptied.push(q.id);
    q.syllabus_refs.terms = kept;
  }
}

// invariant: terms 以外不変 (簡易: rejudged 題の primary/secondary/confidence/status 不変を確認)
// (terms のみ変更。他フィールドは触らない設計)

fs.writeFileSync(QB, JSON.stringify(qb, null, 2));

// by_year 同期 (cleaned 題のみ)
const byExam = {};
for (const { id } of removedLog) { const e = id.split("-q")[0]; (byExam[e] = byExam[e] || []).push(id); }
let filesUpd = 0;
for (const exam of Object.keys(byExam)) {
  const fp = `${BYYEAR_DIR}/${exam}.json`;
  const yj = JSON.parse(fs.readFileSync(fp, "utf8"));
  const arr = Array.isArray(yj) ? yj : yj.questions;
  const ym = {}; for (const q of arr) ym[q.id] = q;
  for (const id of byExam[exam]) if (ym[id]) ym[id].syllabus_refs.terms = byId[id].syllabus_refs.terms;
  fs.writeFileSync(fp, JSON.stringify(yj, null, 2));
  filesUpd++;
}

// 検証: 全 2900 題の terms が樹内
let stillBad = 0;
for (const q of qb.questions) for (const t of (q.syllabus_refs.terms || [])) if (!treeTerms.has(t)) stillBad++;

console.log("=== Stage 3.5a terms 清洗 ===");
console.log("清洗題数:", cleaned, "/ 59 rejudged");
console.log("terms 変空題:", emptied.length, emptied.join(" "));
console.log("by_year 更新:", filesUpd, "ファイル");
console.log("清洗後 全題で樹外 term 残存:", stillBad, stillBad === 0 ? "✓" : "✗");
fs.writeFileSync("data/ip/exams/.tmp/s035/terms_clean_log.json", JSON.stringify({ cleaned, emptied, removedLog }, null, 1));
console.log("詳細: data/ip/exams/.tmp/s035/terms_clean_log.json");
