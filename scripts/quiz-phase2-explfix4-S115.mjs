#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 — explfix4 S115: Rule A が捕らえた**主 context の裁決注記の誤り**を訂正。
//
// Rule A の critic (N=41 / N=38) は accurate 39/41・36/38 を返しつつ、medium 8 件のうち
// **6 件が私 (主 context) 自身のミス**だった。データ側の是正は fidfix-S115e / S115f、
// 本スクリプトは key_guard.note_jp の記述訂正を担当する。
//
//  1. q042 (2010h22a) — **未適用の是正を「是正済」と宣言**していた (No fake completion 違反)。
//     fidfix-S115e で実際に是正したので、出典を S115c → S115e に訂正する。
//  2. q093 / q094 (2010h22a) と q098 (2009h21h) — 「key X 不変」の字母が stored key と食い違う
//     **コピペ由来の誤記**。critic は corpus 全体で「key X 不変」51 件中この 3 件だけが
//     不一致であることを実測して特定した。
//  3. q094 (2009h21h) — 「本 session でこの型が corpus から消えた」という**私の断定を反証**。
//     半角開き括弧の変種 `[ストラテジ〕` が 3 件残っていた (S114 の走査が全角 〔〕 のみだったため)。
//     fidfix-S115f で 3 件とも是正したうえで、断定の経緯を注記に残す。
//  4. q097 (2009h21h) — 「page-42 は前文だけ」という私の記述が誤り。page-42 は本問唯一の図
//     (表 通販業務の平均作業時間) を載せており、`figure_bbox_pct` はその page-42 上の位置。
//     さらに prep は `source.page_image` をそのまま `figure_page_png` に流すため、
//     page-43 に変えると vision 用の図ページが問98 のグラフページになる。fidfix-S115f で差し戻した。
//
// Run: node scripts/quiz-phase2-explfix4-S115.mjs   (then: merge → verify-result)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P2 = path.join(ROOT, "data/ip/quiz/.phase2");

const EDITS = {
  "2010h22a": [
    ["2010h22a-q042",
     "stem「プロジェクトを立ち上げ た。」の行折り返し由来の空白を除去し「立ち上げた。」に是正 (fidfix-S115c、表示層 = raw)。key イ 不変。",
     "stem「プロジェクトを立ち上げ た。」の行折り返し由来の空白を除去し「立ち上げた。」に是正 (**fidfix-S115e**、表示層 = raw)。key イ 不変。" +
     "【訂正】本注記の初版は fidfix-S115c で是正済みと書いたが、S115c の FIXES に q042 は入っておらず**未適用のまま完了宣言していた**。" +
     "Rule A の critic が「同バッチの他問は questions.json に反映済みで q042 だけ適用漏れ」と実測で指摘し、fidfix-S115e で実際に是正した。"],
    ["2010h22a-q093", "key ア 不変。", "key エ 不変。【訂正】初版は「key ア 不変」と書いたがコピペ由来の誤記 (本問の stored key も derived_answer も エ)。Rule A の critic が corpus の「key X 不変」51 件を走査して不一致 3 件を特定した。"],
    ["2010h22a-q094", "key ウ 不変。", "key イ 不変。【訂正】初版は「key ウ 不変」と書いたがコピペ由来の誤記 (本問の stored key も derived_answer も イ)。同上。"],
  ],
  "2009h21h": [
    ["2009h21h-q094",
     "**S114 §1b が「corpus 全 2900 問で選択肢への見出し混入は 2011h23tokubetsu-q091.エ と本件の 2 件のみ」と特定していた残り 1 件で、本 session でこの型が corpus から消えた** (fidfix-S115)。key ウ 不変。",
     "S114 §1b は「corpus 全 2900 問で選択肢への見出し混入は 2011h23tokubetsu-q091.エ と本件の 2 件のみ」としていた (fidfix-S115 で本件を是正)。" +
     "【訂正】初版で私は「本 session でこの型が corpus から消えた」と断定したが、**Rule A の critic がこれを反証した**: " +
     "S114 の走査は全角 `〔〕` のみを対象にしており、**開き括弧が半角の変種** `[ストラテジ〕` `[テクノロジ〕` が " +
     "`2012h24a-q097.エ` / `2014h26h-q085.エ` / `2014h26h-q094.エ` の 3 件残っていた。fidfix-S115f で 3 件とも是正済み。key ウ 不変。"],
    ["2009h21h-q097",
     "併せて `source.page_number` が前文だけの page-42 を指していた誤りを page-43 に是正 (pagefix-S115)。key エ 不変。",
     "併せて `source.page_number` を page-42 → page-43 に変更したが (pagefix-S115)、**fidfix-S115f で差し戻した**。" +
     "【訂正】初版の「page-42 は前文だけ」は誤り。**page-42 は本問唯一の図 (表 通販業務を 1 人で担当するときに要する 1 週間の平均作業時間) を載せているページ**で、" +
     "`figure_bbox_pct` {x1:0.25, y1:0.39, x2:0.75, y2:0.6} はその page-42 上の表の位置である。" +
     "さらに `quiz-phase2-prep.mjs` は `source.page_image` をそのまま `figure_page_png` に流すため、" +
     "page-43 のままだと vision 用の図ページが問98 のグラフページにすり替わる。Rule A の critic が指摘した。" +
     "**単一ポインタのスキーマでは「設問文は page-43 / 図は page-42」を表現できない**のが本質で、これは backlog。key エ 不変。"],
    ["2009h21h-q098", "key ウ 不変。", "key ア 不変。【訂正】初版は「key ウ 不変」と書いたがコピペ由来の誤記 (本問の stored key も derived_answer も ア)。Rule A の keyGuardMismatch がこれを検出した。"],
  ],
};

let n = 0;
for (const [E, edits] of Object.entries(EDITS)) {
  const p = path.join(P2, `generate_result_${E}.json`);
  const gr = JSON.parse(readFileSync(p, "utf-8"));
  for (const [id, from, to] of edits) {
    const r = (gr.results ?? []).find((x) => x.id === id);
    if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
    const note = String(r.key_guard.note_jp ?? "");
    if (note.includes("【訂正】")) { console.log(`  = ${id}: 既に訂正済`); continue; }
    const c = note.split(from).length - 1;
    if (c !== 1) throw new Error(`${id}: «${from.slice(0, 40)}» occurs ${c} times`);
    r.key_guard.note_jp = note.replace(from, to);
    n++;
    console.log(`  ✓ ${id}: 注記を訂正`);
  }
  writeFileSync(p, JSON.stringify(gr, null, 2) + "\n");
}
console.log(`✓ quiz-phase2-explfix4-S115: ${n} 件の注記を訂正`);
