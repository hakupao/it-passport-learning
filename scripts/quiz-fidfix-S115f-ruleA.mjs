#!/usr/bin/env node
// Stage 6 / Quiz — S115f: Rule A の critic が挙げた medium 指摘の是正。
//
// Rule A (`pr-review-toolkit:code-reviewer`, N=41 / N=38) は **主 context のミスを 6 件**捕らえた。
// 本スクリプトはそのうちデータ側の是正が必要なものを扱う (注記の訂正は explfix4-S115)。
//
// ══ (A) 選択肢への分野見出し混入 — 半角開き括弧の変種が corpus に 3 件残っていた ══
// explfix-S115 で私は 2009h21h-q094 の裁決に
//   「S114 §1b が『corpus 全 2900 問で選択肢への見出し混入は 2 件のみ』と特定していた残り 1 件で、
//    本 session でこの型が corpus から消えた」
// と書いた。critic は **`[ストラテジ〕` のように開き括弧が半角 `[` の変種**を走査して反証した:
//   `2012h24a-q097.エ` / `2014h26h-q085.エ` / `2014h26h-q094.エ` の 3 件が残存。
// S114 の走査が全角 `〔〕` のみを対象にしていたための取りこぼし。
// **私の断定は誤りだった**ので、3 件を実際に是正して claim を真にする
// (いずれも他 exam = Phase 2 処理済みだが、選択肢末尾の見出しを落とすだけで key は不変)。
//
// ══ (B) 訳文の弁別ロジックを壊す訳ズレ 2 件 ══
// - `2010h22a-q092` 誤答ア en: JP「1 段左」(サイズ区分の段) を "one column to the left" と訳し、
//   同じ文の直前で自ら column 2 / column 3 と述べているのと自己矛盾していた。
//   区分 1 段 = 3 列ぶんなので "one size-category block (three columns)" とする。
//   同問の誤答エ en は「1 段ずつ手前」を "shifted one row earlier" と正しく訳しており、
//   ア だけが 段→column に解決していた。
// - `2009h21h-q049` 誤答エ zh: 詳細設計の別名を「程序设计」と訳したが、大陸中国語で
//   「程序设计」は programming (=编程) を指す。同じ解説内で プログラム言語→「程序设计语言」/
//   プログラミング→「编程」と訳し分けているため、
//   「详细设计（程序设计）…因此作为编程的说明并不恰当」が
//   **『プログラミングはプログラミングの説明として不適切』という自己矛盾**に読める。
//   本問は「編程と他工程の弁別」そのものが論点なので弁別ロジックを壊す。→「程序详细设计」。
//
// ══ (C) 私のページ是正の差し戻し — `2009h21h-q097` ══
// pagefix-S115 で `source.page_image` を page-42 → page-43 に変えた (問97 の設問文は page-43)。
// しかし critic が指摘したとおり **page-42 は「前文だけ」ではなく本問唯一の図
// (表 通販業務の平均作業時間) を載せているページ**で、`figure_bbox_pct`
// {x1:0.25, y1:0.39, x2:0.75, y2:0.6} はその page-42 上の表の位置である。
// さらに `quiz-phase2-prep.mjs:113` は **`source.page_image` をそのまま `figure_page_png` に流す**
// ため、page-43 のままだと vision 用の図ページが問98 のグラフページになってしまう。
// → **差し戻す**。単一ポインタのスキーマでは「設問文は 43 / 図は 42」を表現できないという
//    制約が本質で、それは backlog として記録する。
//
// Run: node scripts/quiz-fidfix-S115f-ruleA.mjs   (then: build-quiz-corpus → merge → verify-result)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const P2 = path.join(ROOT, "data/ip/quiz/.phase2");

const bank = JSON.parse(readFileSync(RB, "utf-8"));
const byId = new Map((bank.questions ?? bank).map((x) => [x.id, x]));
const once = (s, from, where) => {
  const n = s.split(from).length - 1;
  if (n !== 1) throw new Error(`${where}: «${from.slice(0, 40)}» occurs ${n} times`);
};

// ---- (A) 見出し混入 3 件
const HEADINGS = [
  ["2012h24a-q097", "エ", "住所と電話番号の入力を必須とすべきではない。[ストラテジ〕", "住所と電話番号の入力を必須とすべきではない。"],
  ["2014h26h-q085", "エ", "データ管理簿に記録しなかった。[テクノロジ〕", "データ管理簿に記録しなかった。"],
  ["2014h26h-q094", "エ", "必要な添付資料があるかどうか。[テクノロジ〕", "必要な添付資料があるかどうか。"],
];
for (const [id, L, from, to] of HEADINGS) {
  const rec = byId.get(id);
  if (!rec) throw new Error(`${id}: not found`);
  if (rec.choices_jp[L] === to) { console.log(`  = ${id}.${L}: 既に是正済`); continue; }
  once(rec.choices_jp[L], from, `${id}.${L}`);
  rec.choices_jp[L] = rec.choices_jp[L].replace(from, to);
  console.log(`  ✓ ${id}.${L}: 末尾の分野見出し (半角 [ 変種) を除去 — Rule A が S114 の走査漏れを反証`);
}

// ---- (C) q097 の page 差し戻し
{
  const rec = byId.get("2009h21h-q097");
  if (rec.source.page_number === 43) {
    rec.source.page_number = 42;
    rec.source.page_image = "pages/2009h21h/page-42.png";
    console.log(`  ✓ 2009h21h-q097: source.page を 43 → 42 に**差し戻し** (figure_bbox_pct と figure_page_png の整合を優先)`);
  } else console.log(`  = 2009h21h-q097: 既に page-42`);
}
writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");

// ---- (B) 訳文 2 件 (merge の入力ファイルを直す)
const TR = [
  ["2010h22a-q092", "ア", "en", "so both are shifted one column to the left",
   "so both are shifted one size-category block (three columns) to the left",
   "JP「1 段左」= サイズ区分の 1 段 = 3 列ぶん。同じ文の直前で column 2 / column 3 と述べているのと自己矛盾していた (同問の誤答エ en は「1 段ずつ手前」を one row earlier と正しく訳している)"],
  ["2009h21h-q049", "エ", "zh", "详细设计（程序设计）", "详细设计（程序详细设计）",
   "大陸中国語の「程序设计」は programming (=编程)。同解説内で プログラム言語→程序设计语言 / プログラミング→编程 と訳し分けているため「詳細設計 (程序设计)…因此作为编程的说明并不恰当」が自己矛盾に読め、本問の論点である『編程と他工程の弁別』を壊していた"],
];
for (const [id, L, lang, from, to, why] of TR) {
  const fp = path.join(P2, `expl_tr_${id}.json`);
  const doc = JSON.parse(readFileSync(fp, "utf-8"));
  const d = doc.distractors.find((x) => x.letter === L);
  if (!d) throw new Error(`${id}: letter ${L} not found`);
  if (d[lang].includes(to) && !d[lang].includes(from)) { console.log(`  = ${id}.${L}.${lang}: 既に是正済`); continue; }
  once(d[lang], from, `${id}.${L}.${lang}`);
  d[lang] = d[lang].replace(from, to);
  writeFileSync(fp, JSON.stringify(doc, null, 2) + "\n");
  console.log(`  ✓ ${id} ${L}.${lang}\n      ${why}`);
}
console.log(`✓ quiz-fidfix-S115f-ruleA`);
