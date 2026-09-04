#!/usr/bin/env node
// Stage 6 / Quiz — `source.page_number` / `source.page_image` の 1 ページずれ是正 (S115, 2010h22a 中問A)。
//
// ══ 発見の経緯 ══
// S115 の s7x 保真核験 pass1 で `2010h22a-q091` を担当したエージェントが、
// 入力の source_page_png (page-36.png) に 問91 が存在しないことを自分で検出し、
// 隣の page-37.png を権威として照合し直したうえで CLEAN と判定していた
// (UNREADABLE にはせず、問番号で一意に特定できることを根拠に自己修復した)。
// **監査自体は正しく行われたが、prep が渡したページ指定は誤っていた**。
//
// ══ 主 context による実読確認 ══
//   page-35.png : 中問A 見出し + 状況設定 + 表1 料金表        (設問なし)
//   page-36.png : 表2 出力結果表 (a は列3、b/c は列5・6 を指す↑) + **問89**
//   page-37.png : **問90** (ア1,300 イ1,600 ウ2,000 エ3,400) +
//                 **問91** (テストデータ表 C/60/5/1,400 …) + **問92** (b/c 列の組合せ表)
//   page-38.png : 中問B 見出し + 状況設定 + 表 許可区分の設定 + 〔設定の形式〕(1)〜(5)
//   page-43.png : 中問C 見出し + 前文 + 表 作業計画の一覧 + 問97  ← q097 の記録値 43 は正しい
//
// つまり **中問A の 4 問だけが 1 ページ手前を指していた**。q093 (39) / q097 (43) は正しく、
// exam 全体が一律にずれているわけではない。原因は 中問A の前文ページ (35) を
// 先頭問のページとして採ってしまい、以降 4 問が繰り上がったものと考えられる。
//
// ══ 影響 ══
//   - s7x 保真核験の prep が誤ったページを渡す (S115 は監査側が自己修復したので実害なし)
//   - 図クロップ・cross-page 図の処理など、page を起点にする後段すべて
// 是正は `source` メタデータのみ。**stem / choices / correct_answer / 図は一切触らない**。
//
// Run: node scripts/quiz-pagefix-S115-2010h22a.mjs

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const E = "2010h22a";

// id → [誤った現在値, 実読で確認した正しい値]
const FIXES = {
  [`${E}-q089`]: [35, 36],
  [`${E}-q090`]: [36, 37],
  [`${E}-q091`]: [36, 37],
  [`${E}-q092`]: [36, 37],
};

const bank = JSON.parse(readFileSync(RB, "utf-8"));
const list = bank.questions ?? bank;
const byId = new Map(list.map((x) => [x.id, x]));

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
console.log(`✓ quiz-pagefix-S115-2010h22a: ${n} 件是正 (source メタデータのみ / stem・choices・correct_answer 不変)`);
