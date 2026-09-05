#!/usr/bin/env node
// Stage 6 / Quiz — 中問共有前文に**共有図のテキスト化**を追記する (S116)。
//
// D-141 の前文抽出は規約上「図は設問ごとに添付済み」を前提に図を再現しない。
// ところが 2009h21a では **図を持たない member** がいて、その前提が崩れた:
//   mqB: q095 / q096 が図なし → 図 商品別販売分析ワークシート が読めない
//        (とくに q096 は「累計 70% 以内かつ回転率 10 回以下の商品は何品目か」= 表が無いと数えられない)
//   mqC: q098 / q099 が図なし → 図1 データベースの構造 / 図2 請求書の様式 が読めない
//        (q098 は主キーを問う = 列構成が要る、q099 は参照回数を問う = 両図が要る)
//
// そこで `quiz-chumon-sharedfig-S116.workflow.mjs` (Extract≠Verify, Rule D) が起こした
// 共有図のテキストを、前文の末尾に追記して全 member を自完結にする。
//
// 核験結果: mqC = **PASS**。mqB = CONCERNS だが、指摘は notes_jp の記述誤り
// (「I・J 列が網掛けだから空」→ 実際は「前文の指示によりまだ未入力だから空」) のみで、
// **4 チェック (values_verbatim / structure_preserved / no_fabrication / tr_faithful) は全て true**、
// 核験自身が「figure の内容は原典どおりで訂正不要」と明記している。よって図本体は採用可。
//
// Run: node scripts/quiz-chumon-augment-S116.mjs <preamble_output> <sharedfig_output> <out_path>

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const [preFile, figFile, outFile] = process.argv.slice(2);
if (!preFile || !figFile || !outFile) {
  console.error("✗ usage: node scripts/quiz-chumon-augment-S116.mjs <preamble_output> <sharedfig_output> <out_path>");
  process.exit(1);
}
const unwrap = (p) => { const j = JSON.parse(readFileSync(path.resolve(p), "utf-8")); return j.result ?? j; };
const pre = unwrap(preFile);
const fig = unwrap(figFile);

// sharedfig の key は extract 側で接尾辞が付くことがあるので前方一致で束ねる
const figByGroup = new Map();
for (const r of fig.results ?? []) {
  if (!r?.draft) continue;
  const gk = (r.key ?? r.draft.key ?? "").split("-fig-")[0];
  figByGroup.set(gk, r);
}

let n = 0;
for (const g of pre.results ?? []) {
  const f = figByGroup.get(g.key);
  if (!f) { console.log(`  = ${g.key}: 共有図の追記なし`); continue; }
  const v = f.verification;
  const checks = v?.checks ?? {};
  const allChecksTrue = ["values_verbatim", "structure_preserved", "no_fabrication", "tr_faithful"].every((k) => checks[k] === true);
  if (!allChecksTrue) throw new Error(`${g.key}: 共有図の核験チェックに false がある (${JSON.stringify(checks)}) — 追記を中止`);
  if (v.verdict === "FAIL") throw new Error(`${g.key}: 共有図の核験が FAIL — 追記を中止`);
  if (v.verdict !== "PASS") console.log(`  ⚠ ${g.key}: verdict=${v.verdict} だが 4 チェック全 true のため採用 (指摘は notes 層)`);

  for (const [lang, fkey] of [["jp", "figure_jp"], ["zh", "figure_zh"], ["en", "figure_en"]]) {
    const pk = `preamble_${lang}`;
    if (!g.draft[pk] || !f.draft[fkey]) throw new Error(`${g.key}: ${pk} または ${fkey} が空`);
    if (g.draft[pk].includes(f.draft[fkey].slice(0, 40))) { console.log(`  = ${g.key} ${lang}: 既に追記済`); continue; }
    g.draft[pk] = `${g.draft[pk].trimEnd()}\n\n${f.draft[fkey].trim()}`;
  }
  n++;
  console.log(`  ✓ ${g.key}: 共有図を前文の末尾に追記 (jp/zh/en)`);
}

writeFileSync(path.resolve(outFile), JSON.stringify(pre, null, 2) + "\n");
console.log(`✓ quiz-chumon-augment-S116: ${n} グループに追記 → ${outFile}`);
