#!/usr/bin/env node
// Stage 6 / Quiz — D-144 段 5 (S118): 2014h26a-q086 の **zh 表示 stem** の共有前文を組と逐字一致させる (冪等)。
//
// 症状: 中問組 2014h26a-mqA (q085〜q088) の共有前文は zh で「机械制造商S公司将嵌入…」だが、q086 の zh だけ
//   「机械制造商S公司，将嵌入…」と読点が 1 つ多く、A7 の probe (前文先頭 40 字) に命中しない。
//   同じ組の中で同一の前文が 2 通りの訳文で表示されるのは学習体験上の欠陥 (jp/en は一致済み)。
// 是正: q086 の zh のうち **設問固有文の直前まで** (＝共有前文の 表1 まで) を、組の前文 zh の同区間で置換する。
//   組の前文末尾の「图1是根据表1绘制的箭线图。」は q086 には元から無い (jp/en も同じ姿 — 設問固有の正しい形)
//   ため、置換区間は表1 の表までとする。設問固有文「当X软件的开发按照表1…」は一切触らない。
// 範囲: translations sidecar の stem.zh のみ。stem_jp_clean / stem.en / choices / raw 層 (question_bank, by_year)
//   / questions.json / explanations には触れない。
// Run: node scripts/quiz-chumon-fix-q086zh-S118.mjs [--dry-run]

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry-run");
const rj = (f) => JSON.parse(readFileSync(f, "utf-8"));

const ID = "2014h26a-q086";
const EXAM = "2014h26a";
const GROUP = "2014h26a-mqA";
const OWN_ZH = "当X软件的开发按照表1"; // q086 固有の設問文の開頭
const TAIL_ZH = "图1是根据表1绘制的箭线图。"; // 組前文の末尾 1 文 (q086 には無い)

const evf = path.join(ROOT, "evidence/phase5/stage_06_quiz_fidelity/chumon_preamble_S117_batch2.json");
const evRaw = rj(evf);
const g = (evRaw.result ?? evRaw).results.find((x) => x.key === GROUP);
if (!g) throw new Error(`${GROUP}: evidence に組が無い`);
const ti = g.draft.preamble_zh.indexOf(TAIL_ZH);
if (ti < 0) throw new Error(`${GROUP}: 前文 zh に '${TAIL_ZH}' が無い (evidence の形が変わった)`);
const shared = g.draft.preamble_zh.slice(0, ti).trimEnd();

const trf = path.join(ROOT, "data/ip/quiz/translations", `${EXAM}.json`);
const doc = rj(trf);
const ent = doc.questions?.[ID];
if (!ent?.stem?.zh) throw new Error(`${ID}: zh stem が無い`);
const before = ent.stem.zh;
const jpBefore = ent.stem_jp_clean, enBefore = ent.stem.en;
const oi = before.indexOf(OWN_ZH);
if (oi < 0) throw new Error(`${ID}: 設問固有文 '${OWN_ZH}' が zh stem に無い`);
const after = `${shared}\n\n${before.slice(oi)}`;

// 差分の可視化 (最初に食い違う位置の前後)
let d = 0;
while (d < before.length && d < after.length && before[d] === after[d]) d++;
const win = (s) => JSON.stringify(s.slice(Math.max(0, d - 12), d + 12));
if (before === after) {
  console.log(`= ${ID} zh: 既に組 ${GROUP} の前文と一致 (冪等 no-op)`);
} else {
  console.log(`${ID} zh: 置換区間 = 先頭〜'${OWN_ZH}' の直前 (${oi} → ${shared.length + 2} 字)`);
  console.log(`  first diff @${d}`);
  console.log(`  before: ${win(before)}`);
  console.log(`  after : ${win(after)}`);
  console.log(`  設問固有文 (不変): ${JSON.stringify(before.slice(oi, oi + 24))}…`);
  ent.stem.zh = after;
  if (!DRY) writeFileSync(trf, JSON.stringify(doc, null, 2) + "\n");
}
if (ent.stem_jp_clean !== jpBefore || ent.stem.en !== enBefore) throw new Error(`${ID}: jp/en に触れてしまった`);
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-chumon-fix-q086zh-S118: jp/en 不変を確認 (jp ${jpBefore.length} 字 / en ${enBefore.length} 字)`);
