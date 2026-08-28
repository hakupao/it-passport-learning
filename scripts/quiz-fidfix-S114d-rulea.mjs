#!/usr/bin/env node
// Stage 6 / Quiz — Rule A 指摘の是正、batch S114d.
//
// Rule A (`wf_8391918f-1a2` tokubetsu N=35 / `wf_8732fa3b-460` 2010h22h N=42) が
// medium 級で捕捉した「S114 の是正が一部の層に届いていない」取り残しを解消する。
// **critic が主 context の作業ミスを 5 件捕まえた回**であり、Rule D が効いた実例。
//
// (1) 2010h22h-q097: 分野見出しの除去が **jp (stem_jp_clean) にしか適用されていなかった**。
//     zh の「〔战略〕」/ en の「[Strategy]」が前文直後に残存 (Rule A 実測)。
// (2) 2010h22h-q094: zh が「社員」を **「社员」と直訳借用**。本土中文の「社员」は
//     人民公社・合作社の成員を指す false friend で、会社員は「员工」。
//     corpus 全体では 员工 116 件に対し 社员 は本問 6 箇所のみ、しかも同一中問の
//     隣接問 q093 は「员工表」を使っており **中問内で不整合**だった。
// (3) 中問C (2010h22h q097〜q100) の key_guard: D-141 で前文を埋め込み解答可能になったのに
//     `suspect` / `figure_derivable` が旧値のまま。同 exam の q089/q094 は更新済で
//     **内部規約とも不整合な偽陽性**だった (Rule A が keyGuardMismatch として検出)。
// (4) 2011h23tokubetsu-q096 の【S114 裁決】注記が **事実誤り**。
//     「groups.json は実在しない」と書いたが `data/ip/exams/groups.json` は実在する
//     (Session 73 / D-120、16 グループ)。中身は共有「図」であって共有「本文」ではなく、
//     web app からも build-quiz-corpus からも参照されていない、が正しい記述。
//     **主 context が `data/ip/quiz/` と `apps/web/` しか探さずに断定した誤り**。
//     D-141 の ADR 本文も併せて訂正済。
// (5) 2010h22h-q090 の key_guard 注記が WBS 図の所在を page-39 と書いていたが、
//     図は中問A 冒頭の page-38 にある (page-39 は問90 本文と問91)。
//
// Run: node scripts/quiz-fidfix-S114d-rulea.mjs

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TRP = (e) => path.join(ROOT, `data/ip/quiz/translations/${e}.json`);
const GRP = (e) => path.join(ROOT, `data/ip/quiz/.phase2/generate_result_${e}.json`);

const replaceOnce = (s, from, to, where) => {
  const n = s.split(from).length - 1;
  if (n !== 1) throw new Error(`${where}: expected exactly 1 occurrence of «${from}», found ${n}`);
  return s.replace(from, to);
};

// ---------- (1)(2) translations ----------
const tr = JSON.parse(readFileSync(TRP("2010h22h"), "utf-8"));
const q097 = tr.questions["2010h22h-q097"];
q097.stem.zh = replaceOnce(q097.stem.zh, "\n〔战略〕\n", "\n", "q097.stem.zh 分野見出し");
q097.stem.en = replaceOnce(q097.stem.en, "\n[Strategy]\n", "\n", "q097.stem.en 分野見出し");
console.log("  ✓ 2010h22h-q097 zh/en から分野見出し (〔战略〕/[Strategy]) を除去");

const q094 = tr.questions["2010h22h-q094"];
const before = (q094.stem.zh.match(/社员/g) || []).length;
if (before === 0) throw new Error("q094.stem.zh: 社员 が見つからない");
q094.stem.zh = q094.stem.zh.replace(/社员/g, "员工");
console.log(`  ✓ 2010h22h-q094 zh 「社员」→「员工」 ${before} 箇所 (同一中問の q093 訳と統一)`);
writeFileSync(TRP("2010h22h"), JSON.stringify(tr, null, 2) + "\n");

// ---------- (3)(5) 2010h22h generate_result key_guard ----------
const grHH = JSON.parse(readFileSync(GRP("2010h22h"), "utf-8"));
let n3 = 0;
for (const id of ["2010h22h-q097", "2010h22h-q098", "2010h22h-q099", "2010h22h-q100"]) {
  const r = grHH.results.find((x) => x.id === id);
  if (!r) throw new Error(`${id}: not in generate_result`);
  r.key_guard.figure_derivable = true;
  r.suspect = false;
  n3++;
}
console.log(`  ✓ 2010h22h 中問C ${n3} 問: D-141 の前文埋め込みで解答可能になったため final key_guard の figure_derivable=true / suspect=false へ更新 (round1 は履歴として不変)`);

const q090 = grHH.results.find((x) => x.id === "2010h22h-q090");
q090.key_guard.note_jp += "\n【S114d 訂正】本 note が WBS 図の所在を page-39 としていたのは誤り。page-39 は問90 本文と問91 で、WBS 図は中問A 冒頭の **page-38** にある (Rule A 指摘、実読確認)。";
console.log("  ✓ 2010h22h-q090 key_guard 注記の図所在ページを訂正 (page-39 → page-38)");
writeFileSync(GRP("2010h22h"), JSON.stringify(grHH, null, 2) + "\n");

// ---------- (4) tokubetsu q096 の裁決注記の事実誤りを訂正 ----------
const grTK = JSON.parse(readFileSync(GRP("2011h23tokubetsu"), "utf-8"));
const q096 = grTK.results.find((x) => x.id === "2011h23tokubetsu-q096");
const wrong = "なお生成時の note が言及した groups.json は**実在しない** (corpus にグループ機構は無い) ことを S114 で実測確認済。";
const right =
  "【S114d 訂正】直前の記述「groups.json は実在しない」は**誤り**。`data/ip/exams/groups.json` は実在する " +
  "(Session 73 / D-120「連問共有図グループモデル」、16 グループ)。ただし中身は中問ごとの**共有「図」** " +
  "(shared_figure: path / page_image / bbox_pct / caption) と member_qids であって**共有「本文」は持たず**、" +
  "`apps/web/src/lib/quiz/` からも `scripts/build-quiz-corpus.mjs` からも参照されていない " +
  "(= アプリの表示経路に接続されていない) というのが正しい。D-141 の前提「表示は 1 問単独」は成立するが、" +
  "主 context が `data/ip/quiz/` と `apps/web/` しか探さずに断定した誤りだった (Rule A 指摘)。" +
  "なお groups.json は 2011h23tokubetsu では mqC のみ登録・2010h22h は 0 グループで、**カバレッジ欠落**が別途ある。";
if (!q096.key_guard.note_jp.includes(wrong)) throw new Error("q096: 訂正対象の文が見つからない");
q096.key_guard.note_jp = q096.key_guard.note_jp.replace(wrong, right);
console.log("  ✓ 2011h23tokubetsu-q096 裁決注記の事実誤り (groups.json 不在) を訂正");
writeFileSync(GRP("2011h23tokubetsu"), JSON.stringify(grTK, null, 2) + "\n");

console.log("✓ quiz-fidfix-S114d-rulea 完了 → next: build-quiz-corpus / merge 両 exam");
