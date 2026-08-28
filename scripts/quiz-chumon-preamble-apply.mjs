#!/usr/bin/env node
// Stage 6 / Quiz — 中問共有前文の埋め込み (D-141, Session 114).
//
// quiz-chumon-preamble.workflow.mjs の出力 (Extract → Verify の 2 段) を読み、
// グループの各設問の **表示層** に共有前文を前置する:
//   jp → translations[<exam>].questions[<id>].stem_jp_clean
//   zh → ...stem.zh   /   en → ...stem.en
// raw の stem_jp は非表示層なので触らない (D-141 §1)。
//
// 冪等性: 既に前文を含む設問はスキップする。判定は preamble の**先頭 40 文字**
// (空白・改行を除去して比較) が既存 stem に含まれるかで行う。
//
// 安全弁:
//   - verification.verdict が PASS 以外のグループは既定で適用しない (--force で上書き)。
//   - stem_jp_clean が無い設問は、**raw を種に clean を新設**して前文を前置する
//     (quizModel.ts は clean があればそれを表示するので、raw と同内容の clean を作れば
//     前文以外の表示は不変。raw は OCR 原文として保存したまま触らない)。
//     この経路を通った設問はログに [clean 新設] と出す。
//
// Run: node scripts/quiz-chumon-preamble-apply.mjs <task_output_file> [--force]

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TR_DIR = path.join(ROOT, "data/ip/quiz/translations");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");

const [outFile, ...flags] = process.argv.slice(2);
if (!outFile) {
  console.error("✗ usage: node scripts/quiz-chumon-preamble-apply.mjs <task_output_file> [--force]");
  process.exit(1);
}
const FORCE = flags.includes("--force");

const raw = JSON.parse(readFileSync(path.resolve(outFile), "utf-8"));
const payload = raw.result ?? raw;
const groups = payload.results ?? [];
if (!groups.length) {
  console.error("✗ no groups in workflow output");
  process.exit(1);
}

const bankDoc = JSON.parse(readFileSync(RB, "utf-8"));
const bank = new Map((bankDoc.questions ?? bankDoc).map((x) => [x.id, x]));

const norm = (s) => s.replace(/\s+/g, "");
const docs = new Map(); // exam_id → parsed translations doc
const loadDoc = (examId) => {
  if (!docs.has(examId)) {
    const p = path.join(TR_DIR, `${examId}.json`);
    docs.set(examId, { p, doc: JSON.parse(readFileSync(p, "utf-8")) });
  }
  return docs.get(examId);
};

let applied = 0, skipped = 0, groupsApplied = 0;
for (const g of groups) {
  const verdict = g.verification?.verdict ?? "null";
  if (verdict !== "PASS" && !FORCE) {
    console.log(`  ⚠ ${g.key}: verdict=${verdict} → skip (--force で適用可)`);
    if (g.verification?.issues_jp?.length) {
      for (const i of g.verification.issues_jp) console.log(`      · ${i}`);
    }
    continue;
  }
  const d = g.draft;
  if (!d?.preamble_jp || !d?.preamble_zh || !d?.preamble_en) throw new Error(`${g.key}: incomplete draft`);
  const { p, doc } = loadDoc(g.exam_id);
  const probe = norm(d.preamble_jp).slice(0, 40);
  let groupTouched = false;

  for (const id of g.member_ids) {
    const t = doc.questions[id];
    if (!t) throw new Error(`${id}: not in translations sidecar`);
    if (!t.stem?.zh || !t.stem?.en) throw new Error(`${id}: no tr stem zh/en`);
    let seeded = false;
    if (!t.stem_jp_clean) {
      const rec = bank.get(id);
      if (!rec?.stem_jp) throw new Error(`${id}: no stem_jp_clean and no raw stem_jp to seed from`);
      t.stem_jp_clean = rec.stem_jp;
      seeded = true;
    }

    if (norm(t.stem_jp_clean).includes(probe)) {
      console.log(`  = ${id}: 既に前文あり → skip`);
      skipped++;
      continue;
    }
    t.stem_jp_clean = `${d.preamble_jp.trimEnd()}\n\n${t.stem_jp_clean.trimStart()}`;
    t.stem.zh = `${d.preamble_zh.trimEnd()}\n\n${t.stem.zh.trimStart()}`;
    t.stem.en = `${d.preamble_en.trimEnd()}\n\n${t.stem.en.trimStart()}`;
    console.log(`  ✓ ${id}: 前文を jp/zh/en に前置${seeded ? " [clean 新設: raw を種に生成]" : ""}`);
    applied++;
    groupTouched = true;
  }
  if (groupTouched) groupsApplied++;
}

for (const { p, doc } of docs.values()) writeFileSync(p, JSON.stringify(doc, null, 2) + "\n");

console.log(`✓ quiz-chumon-preamble-apply: グループ ${groupsApplied} / 埋め込み ${applied} 問 / skip ${skipped} 問`);
console.log(`  next: node scripts/build-quiz-corpus.mjs`);
