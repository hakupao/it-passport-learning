#!/usr/bin/env node
// Stage 6 / Quiz — S115g: **上流の抽出層 `data/ip/exams/by_year/*.json` の見出し混入是正**。
//
// ══ なぜ必要か (確認 Rule A が捕らえた退行リスク) ══
// 確認 Rule A (2009h21h-q094) の critic が指摘した:
//   「配信 corpus (questions.json) と build 入力 (question_bank.json) では 0 件だが、
//    その**上流の抽出層 `data/ip/exams/by_year/*.json` には見出し混入が 8 件残存**している。
//    `scripts/merge-question-bank.mjs` は by_year/*.json を読んで question_bank.json を再生成し、
//    それを build-quiz-corpus.mjs が questions.json にするため、**この 2 本を再実行すると
//    S115/S115f の是正が 8 件すべて退行する**」
//
// つまり下流だけ直しても、パイプラインを頭から回した瞬間に元に戻る。
// **是正は最上流の層にも入れないと永続しない**、という Tier 3 の基本を突かれた指摘である。
//
// 対象 8 件 (全角 〔〕 と半角 [ の変種が混在):
//   2009h21h-q094.エ 〔ストラテジ〕        / 2011h23tokubetsu-q091.エ 〔マネジメント〕
//   2012h24a-q091.エ [マネジメント]〕      / 2012h24a-q097.エ [ストラテジ〕
//   2012h24h-q098.エ [テクノロジ〕         / 2014h26h-q085.エ [テクノロジ〕
//   2014h26h-q094.エ [テクノロジ〕         / 2014h26h-q095.エ [マネジメント]
// うち 2011h23tokubetsu-q091 は S114 で、残りは S115 / S115f で下流を是正済み。
// 3 件 (2012h24a-q091 / 2012h24h-q098 / 2014h26h-q095) は下流では既にクリーンで、
// **by_year 層にだけ残っていた**。
//
// 選択肢末尾の分野見出しを落とすだけで、key / stem / 他フィールドは一切触らない。
//
// Run: node scripts/quiz-fidfix-S115g-byyear.mjs

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "data/ip/exams/by_year");
// 末尾の分野見出しを落とす。括弧は開き・閉じとも全角/半角の変種があり、
// さらに `[マネジメント]〕` のように**閉じ括弧が二重に付いた**変種 (2012h24a-q091.エ) もあるため
// 閉じ側は 1〜2 個を許す。
const TAIL = /\s*[〔\[［](?:テクノロジ|ストラテジ|マネジメント)[〕\]］]{1,2}\s*$/;

let total = 0;
for (const f of readdirSync(DIR).filter((x) => x.endsWith(".json"))) {
  const fp = path.join(DIR, f);
  const doc = JSON.parse(readFileSync(fp, "utf-8"));
  const arr = Array.isArray(doc) ? doc : (doc.questions ?? Object.values(doc));
  let n = 0;
  for (const q of arr) {
    for (const [L, v] of Object.entries(q.choices_jp ?? {})) {
      if (typeof v !== "string" || !TAIL.test(v)) continue;
      const before = v;
      q.choices_jp[L] = v.replace(TAIL, "");
      if (!q.choices_jp[L].trim()) throw new Error(`${q.id}.${L}: 除去後が空になる — 中止`);
      n++; total++;
      console.log(`  ✓ ${f} ${q.id}.${L}: 「${before.slice(-16)}」→ 末尾見出しを除去`);
    }
  }
  if (n) writeFileSync(fp, JSON.stringify(doc, null, 2) + "\n");
}
console.log(`✓ quiz-fidfix-S115g-byyear: ${total} 件 (上流の抽出層を下流と一致させ、再生成による退行を防ぐ)`);
