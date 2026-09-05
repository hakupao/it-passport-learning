#!/usr/bin/env node
// Stage 6 / Quiz — S116: `2009h21a-q091` の正解を **イ(10) → ウ(14)** に是正する。
// **S111 のユーザー確認済み判断を覆す変更**であり、本 session でユーザーの再確認を得ている。
//
// ══ なぜ S111 が誤ったのか — 前文が corpus に無かったから ══
// 問91 は中問A (問89〜92) の一部で、引当規則は**前文 (源 page-32) にしか書かれていない**:
//   〔販売管理業務の概要〕(2) 「…通常注文は在庫数の70％まで引当可能であり，
//                              優先注文は在庫数まで引当可能である。…」
// ところがこの前文は **corpus のどこにも存在しなかった** (本 session の D-141 適用で初めて投入)。
//
// S111 §5 はその状態でユーザーに判断を仰いだ。提示した計算は S111 の log に残っている:
//   「引当計算: 100 − 80 − 10 = 10 ⇒ イ。…**ウ = 14 は表のどの数からも導けない**」
// これは 70% 規則を知らなければ完全に妥当な推論で、ユーザーは「10 で正しい」と確認した。
// 結果、**元々 ウ だった answer_keys が イ に変更された**。
//
// ══ 前文を入れた後の導出 (源 page-32 + page-35 を主 context が実読) ══
//   在庫 100
//   10:00 通常注文 80 → 引当可能 = 100 × 70% = 70 → 70 引当、在庫 30 (残 10 は次の入荷待ち)
//   10:30 優先注文 10 → 引当可能 = 在庫 30 まで   → 10 引当、在庫 20
//   11:00 通常注文 40 → **引当可能数量 = 20 × 70% = 14** ⇒ **ウ**
//
// 選択肢が ア7 / イ10 / ウ14 / エ20 であることが決定的な裏づけになる:
//   ア 7  = 10 × 70%  (在庫を 10 と誤る)
//   **イ 10 = 100 − 80 − 10  ← まさに「70% 規則を無視した」誤答肢**
//   ウ 14 = 正解
//   エ 20 = 在庫 20 のまま (最後の 70% を忘れる)
// つまり **S111 が選んだ イ は、この設問が用意した最も典型的な罠そのもの**だった。
//
// generate の key_guard も独立に ウ を導出し matches_key=false を立てている
// (「stored correct_answer が『イ』になっているのは、10:00 の通常注文に 70％上限を適用せず
//   80 を全量引き当てて 100−80−10=10 とした計算に相当し、前文 (2) の明示規則と正面から矛盾する」)。
//
// ══ 教訓 ══
// **「源の一部が corpus に無い」状態で key を裁決してはいけない。**
// S111 は手続きとしては正しく (推測で書き換えず、材料を揃えてユーザーに渡した) 、
// 「表のどの数からも導けない」という否定的証拠まで示していた。それでも誤ったのは、
// **提示した材料そのものが不完全だった**から。D-141 の前文投入は、
// 単に解答可能性を回復するだけでなく、**過去の key 裁決を再検証させる**効果を持つ。
//
// ══ 注意: answer_keys.json は gitignored ══
// S111 §5 と同じ理由で、手で直さず tracked な再実行可能スクリプトを是正の記録とする。
//
// Run: node scripts/quiz-keyfix-S116-2009h21a-q091.mjs

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const AK = path.join(ROOT, "data/ip/exams/answer_keys.json");
const BY = path.join(ROOT, "data/ip/exams/by_year/2009h21a.json");
const ID = "2009h21a-q091", FROM = "イ", TO = "ウ";

let changed = 0;

// 1) question_bank.json
{
  const bank = JSON.parse(readFileSync(RB, "utf-8"));
  const rec = (bank.questions ?? bank).find((x) => x.id === ID);
  if (!rec) throw new Error(`${ID}: not in question_bank`);
  if (rec.correct_answer === TO) console.log(`  = question_bank: 既に ${TO}`);
  else if (rec.correct_answer !== FROM) throw new Error(`question_bank: expected ${FROM}, found ${rec.correct_answer} — abort`);
  else { rec.correct_answer = TO; writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n"); changed++; console.log(`  ✓ question_bank: ${FROM} → ${TO}`); }
}

// 2) answer_keys.json (gitignored)
{
  const ak = JSON.parse(readFileSync(AK, "utf-8"));
  const ans = ak["2009h21a"].answers ?? ak["2009h21a"];
  if (ans["91"] === TO) console.log(`  = answer_keys: 既に ${TO}`);
  else if (ans["91"] !== FROM) throw new Error(`answer_keys: expected ${FROM}, found ${ans["91"]} — abort`);
  else { ans["91"] = TO; writeFileSync(AK, JSON.stringify(ak, null, 2) + "\n"); changed++; console.log(`  ✓ answer_keys: ${FROM} → ${TO} (S111 の変更を差し戻し = 元の抽出値に復帰)`); }
}

// 3) by_year (上流。S115 の教訓: 最上流も直さないと再生成で退行する)
if (existsSync(BY)) {
  const doc = JSON.parse(readFileSync(BY, "utf-8"));
  const arr = Array.isArray(doc) ? doc : (doc.questions ?? Object.values(doc));
  const rec = arr.find((x) => x.id === ID);
  if (!rec) console.log(`  ⚠ by_year: ${ID} が見つからない`);
  else if (rec.correct_answer === TO) console.log(`  = by_year: 既に ${TO}`);
  else { const was = rec.correct_answer; rec.correct_answer = TO; writeFileSync(BY, JSON.stringify(doc, null, 2) + "\n"); changed++; console.log(`  ✓ by_year: ${was} → ${TO}`); }
}

// 4) 交叉核対 (corpus 全体)
{
  const bank = JSON.parse(readFileSync(RB, "utf-8"));
  const ak = JSON.parse(readFileSync(AK, "utf-8"));
  let mism = 0;
  for (const q of (bank.questions ?? bank)) {
    const [e] = q.id.split("-q");
    const n = String(parseInt(q.id.slice(-3), 10));
    const ans = ak[e]?.answers ?? ak[e];
    if (!ans) continue;
    if (ans[n] !== q.correct_answer) { mism++; console.log(`  !! ${q.id}: questions=${q.correct_answer} keys=${ans[n]}`); }
  }
  console.log(`  交叉核対: mismatch ${mism} 件 / ${(bank.questions ?? bank).length} 問`);
  if (mism) process.exit(1);
}
console.log(`✓ quiz-keyfix-S116-2009h21a-q091: ${changed} 層を是正`);
