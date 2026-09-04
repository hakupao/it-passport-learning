#!/usr/bin/env node
// Stage 6 / Quiz — `source.page_number` / `source.page_image` の 1 ページずれ是正 (S115, 2009h21h 中問C)。
//
// ══ 発見の経緯 ══
// 2010h22a 中問A で同型の欠陥 (中問の**先頭問**が「前文だけのページ」を指し、以降が繰り上がる)
// を見つけたので、全 29 回に決定的スキャンを掛けた:
//   「中問の先頭候補 (問89 / 問93 / 問97) の割当ページに他の設問が 1 問も無く、
//     かつ次問が +1 ページ以内」→ 19 件の候補。
// これは **上限値** であり、前文と先頭問が同じページに載っていれば正常でも該当する
// (実例: 2010h22a-q097 は page-43 に前文と問97 が同居しており記録値 43 は正しい)。
// そこで本 batch の 2 exam ぶんだけ主 context が実読で確定させた。
//
// ══ 主 context による実読確認 (2009h21h) ══
//   page-34 : 中問A 見出し + 前文 + 図 LAN の構成            (設問なし)
//   page-38 : 中問B 見出し + 前文 + 図1 + 図2 + 表 性別年代別利用者数一覧 (設問なし)
//   page-42 : 中問C 見出し + 前文 + 表 平均作業時間 + 業務量モデル 2 段落 (**設問なし**)
//   page-43 : **問97** (ア 1/8 イ 5/36 ウ 1/6 エ 2/9) + **問98** (進捗率グラフ ①〜④)
// → 記録値 q097=42 は前文ページを指しており誤り。正しくは 43 (q098 の記録値 43 は正しい)。
//
// なお q089 (page-35) / q093 (page-39) は s7x 保真核験でエージェントが問番号を特定できており
// ページ不整合の報告が無いため、記録値は正しいと判断した (2010h22a-q091 のケースでは
// エージェントが「指定ページに問91が無い」と明示的に報告していた)。
//
// 是正は `source` メタデータのみ。stem / choices / correct_answer / 図は一切触らない。
//
// Run: node scripts/quiz-pagefix-S115-2009h21h.mjs

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const E = "2009h21h";

const FIXES = { [`${E}-q097`]: [42, 43] };

const bank = JSON.parse(readFileSync(RB, "utf-8"));
const byId = new Map((bank.questions ?? bank).map((x) => [x.id, x]));

let n = 0;
for (const [id, [from, to]] of Object.entries(FIXES)) {
  const rec = byId.get(id);
  if (!rec) throw new Error(`${id}: not in question_bank`);
  const cur = rec.source?.page_number;
  if (cur === to) { console.log(`  = ${id}: 既に ${to} → skip`); continue; }
  if (cur !== from) throw new Error(`${id}: expected page_number ${from}, found ${cur} — 想定外の状態なので中止`);
  const img = `pages/${E}/page-${String(to).padStart(2, "0")}.png`;
  if (!existsSync(path.join(ROOT, "data/ip/exams", img))) throw new Error(`${id}: ${img} が存在しない`);
  rec.source.page_number = to;
  rec.source.page_image = img;
  n++;
  console.log(`  ✓ ${id}: page ${from} → ${to} (${img})`);
}

writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
console.log(`✓ quiz-pagefix-S115-2009h21h: ${n} 件是正 (source メタデータのみ)`);
