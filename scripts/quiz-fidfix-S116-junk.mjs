#!/usr/bin/env node
// Stage 6 / Quiz — S116: 2009h21a 表示層の決定的 junk 是正 (s7x 監査の射程外)。
//
// s7x 保真核験は `stem_resourced_s7x` / `choices_resourced_s7x` の問だけを対象にする。
// 本スクリプトが直す 2 問はどちらも **s7x 対象外** (母数 30 問のリストに無い) で、
// 主 context の決定的 junk スキャン + 源実読だけが捕らえた
// (S114 §1b「保真監査 (源との一致) と junk スキャン (dataset 内部の異物) は別ゲート」の再現)。
//
// ══ q065 (page-25 実読) ══
// ア「4 **パ**イト表記」→ 源「4 **バ**イト表記」。**濁点が半濁点に化けた**型で、
//   S115 の ポ/ボ (2010h22a-q076・2009h21h-q054) と同系。**バ/パ は新しい字形ペア**で、
//   決定的 decoder の辞書に追加する価値がある。加えて末尾に源に無い空白列 + ピリオドが付着。
// ウ「国**ど**とに」→ 源「国**ご**とに」。こちらも濁点位置の取り違えで、
//   「国どとに」は日本語として成立しない非語。
// → **同一設問の 2 肢で別々の濁点崩れ**が起きており、この設問だけ OCR の質が落ちている。
//
// ══ q080 (page-29 実読) ══
// エ「文字や図形 静止画像動画像, 音声など」→ 源「文字や図形，静止画像，動画像，音声など」。
//   **読点 2 個が脱落**し、うち 1 個は空白に化けている。同設問の ア/イ/ウ はいずれも
//   「文字や図形，静止画像，動画像，音声など」と読点を保持しており、**設問内で表記が割れていた**
//   (S114 §8b の「同一設問の中で表記が割れている = 抽出時の取りこぼし」と同じ裁決根拠)。
//   なお ア は正解肢だが無傷。
//
// zh/en への波及: 4 件とも訳文は既に正しい (翻訳者が腐敗を暗黙に補正) ため tr 修正なし。
//
// Run: node scripts/quiz-fidfix-S116-junk.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");

const FIXES = [
  ["2009h21a-q065", "ア",
   "192.168.1.1 のように 4 パイト表記の IP アドレスの数は, 地球上の人口 (約 70億) よりも多い。                               .",
   "192.168.1.1 のように 4 バイト表記の IP アドレスの数は, 地球上の人口 (約 70億) よりも多い。",
   "源「4 バイト表記」の濁点が半濁点に化けて「4 パイト」= 非語になっていた + 末尾に源に無い空白列 + ピリオド"],
  ["2009h21a-q065", "ウ",
   "IPアドレスは, 国どとに重複のないアドレスであればよい。",
   "IPアドレスは, 国ごとに重複のないアドレスであればよい。",
   "源「国ごとに」の濁点位置が崩れて「国どとに」= 非語になっていた。同一設問の ア と合わせて 2 肢で別々の濁点崩れ"],
  ["2009h21a-q080", "エ",
   "文字や図形 静止画像動画像, 音声などを公開するときに著作権の登録をする。",
   "文字や図形, 静止画像, 動画像, 音声などを公開するときに著作権の登録をする。",
   "源は「文字や図形，静止画像，動画像，音声など」。読点 2 個が脱落し 1 個は空白に化けていた。同設問の ア/イ/ウ は読点を保持しており設問内で表記が割れていた"],
];

const bank = JSON.parse(readFileSync(RB, "utf-8"));
const byId = new Map((bank.questions ?? bank).map((x) => [x.id, x]));
let n = 0;
for (const [id, L, from, to, why] of FIXES) {
  const rec = byId.get(id);
  if (!rec) throw new Error(`${id}: not in question_bank`);
  if (rec.choices_jp[L] === to) { console.log(`  = ${id}.${L}: 既に是正済`); continue; }
  if (rec.choices_jp[L] !== from) throw new Error(`${id}.${L}: 想定外の現在値\n  expected: ${JSON.stringify(from)}\n  actual:   ${JSON.stringify(rec.choices_jp[L])}`);
  rec.choices_jp[L] = to;
  n++;
  console.log(`  ✓ ${id} [choice ${L}] ${why}`);
}
writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
console.log(`✓ quiz-fidfix-S116-junk: choice ${n}`);
