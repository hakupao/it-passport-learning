#!/usr/bin/env node
// Stage 6 / Quiz — 中問グループ member の「旧前文・重複図 剥がし」 (D-141 の前処理, Session 116)。
//
// S115 の `quiz-chumon-normalize-S115.mjs` と同じ趣旨だが、本回は **重複した共有図の除去**が加わる。
//
// ══ 2009h21a-q093 ══
// 見出し「〔中問B〕商品の販売データの分析に関する次の記述を読んで，**問に答えよ**。」は、
// 源の「中問B …問93 〜 96 に答えよ。」の**対象範囲を潰した**形 (S115 の 2009h21h-q097 と同型)。
// 加えて中問B の共有前文と 図 商品別販売分析ワークシート を本文に内包しているため、
// 原典逐字版を前置すると二重になる。→ 設問文だけに切り詰める。
//
// ══ 2009h21a-q095 ══
// (1) 分野見出し〔ストラテジ〕の前置 (corpus 規約は非前置)。
// (2) **同じ 図 商品別販売分析ワークシートを本文に重複掲載**している。
//     この表は共有図として前文側に入るため、設問固有の〔条件〕とランク表だけを残す。
//     ※ 表を落としても q095 は自完結する — 前文に同じ表が入るため。
//
// ══ なぜ表を「前文側」に寄せるのか ══
// 元の配置は **q093 と q095 が表を持ち、本当に表を必要としている q096 だけが持っていない**
// という歪んだものだった (q096 は図の添付も無い)。共有図を前文に 1 回だけ置き、
// 全 member が同じものを見る形に正す。
//
// ══ 操作 ══
//   keep_from    : anchor 以降を残す        — 見出し・旧前文の除去
//   cut_between  : from anchor から to anchor の直前までを除去 — 重複図の除去
// いずれも anchor がちょうど 1 回出現することを assert する。jp は `stem_jp_clean`、
// zh/en は `stem.zh` / `stem.en` を対象 (raw の `stem_jp` は非表示層なので触らない = D-141 §1)。
//
// Run: node scripts/quiz-chumon-normalize-S116.mjs
//   then: node scripts/quiz-chumon-preamble-apply.mjs <augmented_output>

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TR = path.join(ROOT, "data/ip/quiz/translations/2009h21a.json");

const OPS = [
  {
    id: "2009h21a-q093", op: "keep_from",
    why: "中問B の見出し (源の「問93 〜 96 に答えよ」を「問に答えよ」に潰した形) + 共有前文 + 重複した ワークシート表 を除去。原典逐字の前文と共有図を前置し直す",
    jp: "図のセルE2に入力されている計算式として適切なものはどれか。",
    zh: "作为输入到图中单元格E2的计算公式，哪一个是恰当的？",
    en: "Which of the following is the appropriate formula entered in cell E2 in the figure?",
  },
  {
    id: "2009h21a-q095", op: "keep_from",
    why: "分野見出し〔ストラテジ〕の前置を除去 (corpus 規約は非前置)",
    jp: "N社では，売上構成比率を基準に商品をランク分けし，",
    zh: "N 公司以销售构成比率为基准对商品进行分级，",
    en: "At Company N, products are ranked based on their sales composition ratio,",
  },
  {
    id: "2009h21a-q095", op: "cut_between",
    why: "本文に重複掲載されていた 図 商品別販売分析ワークシート を除去 (共有図として前文側が供給する)。設問固有の〔条件〕とランク表は残す",
    jp: ["図 商品別販売分析ワークシート（網掛けの部分は表示していない）", "〔条件〕"],
    zh: ["图 各商品销售分析工作表（加底纹的部分未显示）", "〔条件〕"],
    en: ["Figure: Product-by-product sales analysis worksheet (shaded cells are not displayed)", "[Conditions]"],
  },
];

const doc = JSON.parse(readFileSync(TR, "utf-8"));

const once = (text, anchor, where) => {
  const n = text.split(anchor).length - 1;
  if (n !== 1) throw new Error(`${where}: anchor «${anchor.slice(0, 40)}…» occurs ${n} times (need exactly 1)`);
  return text.indexOf(anchor);
};

const apply = (text, o, lang, where) => {
  if (o.op === "keep_from") {
    const i = once(text, o[lang], where);
    if (i === 0) throw new Error(`${where}: anchor already at position 0 — nothing to strip`);
    return text.slice(i).trimStart();
  }
  if (o.op === "cut_between") {
    const [from, to] = o[lang];
    const i = once(text, from, `${where} from`);
    const j = once(text, to, `${where} to`);
    if (j <= i) throw new Error(`${where}: to anchor precedes from anchor`);
    return (text.slice(0, i).trimEnd() + "\n\n" + text.slice(j)).trim();
  }
  throw new Error(`unknown op ${o.op}`);
};

let n = 0;
for (const o of OPS) {
  const t = doc.questions[o.id];
  if (!t) throw new Error(`${o.id}: not in translations sidecar`);
  if (!t.stem_jp_clean) throw new Error(`${o.id}: no stem_jp_clean`);
  const before = { jp: t.stem_jp_clean.length, zh: t.stem.zh.length, en: t.stem.en.length };
  t.stem_jp_clean = apply(t.stem_jp_clean, o, "jp", `${o.id} jp`);
  t.stem.zh = apply(t.stem.zh, o, "zh", `${o.id} zh`);
  t.stem.en = apply(t.stem.en, o, "en", `${o.id} en`);
  const after = { jp: t.stem_jp_clean.length, zh: t.stem.zh.length, en: t.stem.en.length };
  n++;
  console.log(`  ✓ ${o.id} [${o.op}] jp ${before.jp}→${after.jp} / zh ${before.zh}→${after.zh} / en ${before.en}→${after.en}`);
  console.log(`      ${o.why}`);
}
writeFileSync(TR, JSON.stringify(doc, null, 2) + "\n");
console.log(`✓ quiz-chumon-normalize-S116: ${n} 操作`);
