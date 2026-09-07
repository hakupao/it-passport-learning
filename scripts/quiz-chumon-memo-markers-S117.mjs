#!/usr/bin/env node
// Stage 6 / Quiz — S117 (Rule D M-1): 2011h23a 中問B の〔A さんが書き出したメモ〕は源 (page-37) では (1)〜(5) だが、q093 の clean (S1xx) が
// ①〜⑤ に置き換えていた。その clean を前文として q094–q096 に複製した結果、q096 の 表2 (文書記号 ①〜⑤) と記号が衝突し、
// 設問文の「メモの(3)」とも噛み合わない。→ q093〜q096 の **前文部分** (と q093 自身の設問文) の ①〜⑤ を (1)〜(5) に戻す (jp/zh)。
// q096 の表2 (文書記号) は前文の後ろにあるので触らない。en は既に (1)〜(5)。Run: node scripts/quiz-chumon-memo-markers-S117.mjs [--dry-run]
import { readFileSync, writeFileSync } from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); const DRY = process.argv.includes("--dry-run");
const f = path.join(ROOT, "data/ip/quiz/translations/2011h23a.json"); const doc = JSON.parse(readFileSync(f, "utf-8"));
const MAP = { "①": "(1)", "②": "(2)", "③": "(3)", "④": "(4)", "⑤": "(5)" };
const conv = (s) => s.replace(/[①-⑤]/g, (c) => MAP[c]).replace(/\(1\)[〜～]\(5\)/g, "(1)〜(5)");
// 前文の終端 = この語句の直前 (q094–096); q093 は全文 (文書記号の表を持たない)
const END = { jp: "M社では，通販システムを稼働させる前に", zh: "M公司计划在网购系统正式运行之前" };
let n = 0;
for (const id of ["2011h23a-q093", "2011h23a-q094", "2011h23a-q095", "2011h23a-q096"]) {
  const t = doc.questions[id];
  for (const [lang, get, set] of [["jp", () => t.stem_jp_clean, (v) => (t.stem_jp_clean = v)], ["zh", () => t.stem.zh, (v) => (t.stem.zh = v)]]) {
    const s = get(); if (!s) continue; let out;
    if (id === "2011h23a-q096") { const i = s.indexOf(END[lang]); if (i < 0) throw new Error(`${id} ${lang}: boundary not found`); out = conv(s.slice(0, i)) + s.slice(i); }
    else out = conv(s);
    if (out !== s) { set(out); n++; console.log(`  ✓ ${id} ${lang}: ①〜⑤ → (1)〜(5) (${(s.match(/[①-⑤]/g) || []).length - (out.match(/[①-⑤]/g) || []).length} 箇所)`); }
  }
}
if (!DRY) writeFileSync(f, JSON.stringify(doc, null, 2) + "\n");
console.log(`${DRY ? "(dry-run) " : "✓ "}memo-markers: ${n} fields`);
