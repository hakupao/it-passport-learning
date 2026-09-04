#!/usr/bin/env node
// Stage 6 / Quiz — 表示層の OCR 異物 是正 第 2 波 (S115b, 2010h22a)。
//
// ══ 発見の経緯 ══
// generate 実行中に `key_guard.stem_corruption_suspected=true` が立った問を先読みしたところ、
// `2010h22a-q032` の note に「stem の『購 入者』が OCR の行折り返しで空白に割れている」
// 「選択肢エの末尾に OCR ノイズ『|  。。 。』が付着している」とあった。
//
// **これは S115 §1 の決定的 junk スキャンが取りこぼした型**である:
//   - 末尾ノイズ規則が「句点 3 個以上の連続」を要求しており `。。 。` (2 個 + 空白 + 1 個) に
//     当たらなかった → 「文末の 。 の後ろに記号・句点・空白だけが 2 文字以上続く」に一般化。
//   - 語中空白は「markdown 表の行を除外」した走査に直しただけで、**表キャプション行**
//     (「表　許可区分の設定」「表1 料金表（単位 円）」「注　網掛けの部分は…」) が
//     偽陽性として大量に出るため埋もれていた → 実 hit は 3 件だけだった。
//
// 是正方針は S114 を踏襲する: **語中空白のうち熟語を割っているものだけ**を直す
// (corpus 全体に分布する行折り返し由来の空白そのものは横断 backlog)。
// 本 exam の 3 件はいずれも 表示層 (`stem_jp_clean` が無く raw が表示される問) にあり、
// 学習者に「請負 人」「購 入者」「移行 計画書」と割れて見えていた。
//
// ※ S115 の 1 本目 (`quiz-fidfix-S115-2010h22a.mjs`) のヘッダに「熟語を割る語中空白は
//    本 exam には該当なし」と書いたのは**誤り**。本スクリプトで訂正する。
//
// zh/en への波及: 3 件とも訳文は既に正しい (「购买者」「承揽人」「迁移计划书」/
// "the purchaser" 等) ため tr 修正なし。q032 エ の末尾ノイズも訳文には無い。
//
// Run: node scripts/quiz-fidfix-S115b-junk.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const E = "2010h22a";
const TR = path.join(ROOT, `data/ip/quiz/translations/${E}.json`);
const q = (n) => `${E}-q${String(n).padStart(3, "0")}`;

const FIXES = [
  {
    id: q(28), kind: "stem", layer: "raw",
    from: "当事者である注文者又は請負 人に",
    to: "当事者である注文者又は請負人に",
    why: "cosmetic: 熟語「請負人」が行折り返し由来の空白で割れていた (表示層 = raw)",
  },
  {
    id: q(32), kind: "stem", layer: "raw",
    from: "購入することによって, 購 入者に帰属する",
    to: "購入することによって, 購入者に帰属する",
    why: "cosmetic: 熟語「購入者」が割れていた。同一文に正しい「購入する」があるため対比で目立つ (表示層 = raw)",
  },
  {
    id: q(32), kind: "choice_jp", key: "エ",
    from: "プログラムの記録された CD-ROM の著作権|  。。 。",
    to: "プログラムの記録された CD-ROM の著作権",
    why: "cosmetic: 源に無い末尾 OCR ノイズ。q052 エ の「|  。。。 。」と同型で、S115 §1 の検出器が句点連続数の閾値で取りこぼしていた",
  },
  {
    id: q(47), kind: "stem", layer: "raw",
    from: "移行計画書を作成した。移行 計画書に含める",
    to: "移行計画書を作成した。移行計画書に含める",
    why: "cosmetic: 熟語「移行計画書」が割れていた。直前に正しい「移行計画書」があるため対比で目立つ (表示層 = raw)",
  },
];

const bank = JSON.parse(readFileSync(RB, "utf-8"));
const byId = new Map((bank.questions ?? bank).map((x) => [x.id, x]));
const trDoc = JSON.parse(readFileSync(TR, "utf-8"));

const replaceOnce = (s, f, where) => {
  const n = s.split(f.from).length - 1;
  if (n !== 1) throw new Error(`${f.id} ${where}: expected exactly 1 occurrence of «${f.from}», found ${n}`);
  return s.replace(f.from, f.to);
};

const counts = { raw: 0, clean: 0, choice: 0 };
for (const f of FIXES) {
  const rec = byId.get(f.id);
  if (!rec) throw new Error(`${f.id}: not in question_bank`);
  if (f.kind === "stem") {
    if (f.layer === "raw" || f.layer === "both") {
      rec.stem_jp = replaceOnce(rec.stem_jp, f, "raw");
      counts.raw++;
      console.log(`  ✓ ${f.id} [raw]      ${f.why}`);
    }
    if (f.layer === "clean" || f.layer === "both") {
      const t = trDoc.questions[f.id];
      if (!t?.stem_jp_clean) throw new Error(`${f.id}: no stem_jp_clean`);
      t.stem_jp_clean = replaceOnce(t.stem_jp_clean, f, "clean");
      counts.clean++;
      console.log(`  ✓ ${f.id} [clean]    ${f.why}`);
    }
  } else if (f.kind === "choice_jp") {
    rec.choices_jp[f.key] = replaceOnce(rec.choices_jp[f.key], f, `choice_jp.${f.key}`);
    counts.choice++;
    console.log(`  ✓ ${f.id} [choice ${f.key}] ${f.why}`);
  }
}

writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
writeFileSync(TR, JSON.stringify(trDoc, null, 2) + "\n");
console.log(`✓ quiz-fidfix-S115b-junk: raw ${counts.raw} / clean ${counts.clean} / choice ${counts.choice}`);
console.log(`  next: node scripts/build-quiz-corpus.mjs`);
