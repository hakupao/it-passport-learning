#!/usr/bin/env node
// Stage 6 / Quiz — S117: 前文前置 (D-141 apply) の後に**前文と設問本文の間**へ残った分野見出し行 (〔ストラテジ〕等 / 〔战略〕等 / [Strategy] 等) と
// 直後の「問NN」「问 NN」「QNN」プレフィックスを剥がす (S115/S116 normalize の同型)。先頭にある分野見出しは D-141 の対象外 (前文の無い単独問) なので触らない。
// Run: node scripts/quiz-chumon-normalize-S117.mjs [--dry-run]
import { readFileSync, writeFileSync, readdirSync } from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); const DRY = process.argv.includes("--dry-run");
const DIR = path.join(ROOT, "data/ip/quiz/translations");
const RE = {
  jp: /\n[ \t　]*〔(ストラテジ|マネジメント|テクノロジ)〕[^\n]*\n[ \t　]*(問[ \t　]*\d+[ \t　]*)?/g,
  zh: /\n[ \t　]*[〔\[［](战略|管理|技术|策略|科技)[〕\]］][^\n]*\n[ \t　]*(问[ \t　]*\d+[ \t　]*)?/g, // 半角 [技术] 変種も (Rule D 3(ii) 復験 LOW)
  en: /\n[ \t]*\[(Strategy|Management|Technology)\][^\n]*\n[ \t]*(Q\d+[ \t]*)?/g,
};
// 中問の見出し行 (「中問A　…に答えよ。」/「中题A　…」/「Group Question A …」) は D-141 で埋め込まない → 先頭にあれば落とす (2011h23a-q089、S116 由来)
const CHUMON_HEAD = { jp: /^[\s　]*中問[A-DＡ-Ｄ][^\n]*(答えよ|答えなさい)[^\n]*\n+/, zh: /^[\s　]*中题[A-DＡ-Ｄ][^\n]*\n+/, en: /^[\s]*Group Question [A-D][^\n]*\n+/ };
let n = 0;
for (const f of readdirSync(DIR).filter((x) => x.endsWith(".json")).sort()) {
  const p = path.join(DIR, f); const doc = JSON.parse(readFileSync(p, "utf-8")); let touched = false;
  for (const [id, t] of Object.entries(doc.questions)) {
    for (const [lang, get, set] of [["jp", () => t.stem_jp_clean, (v) => (t.stem_jp_clean = v)], ["zh", () => t.stem?.zh, (v) => (t.stem.zh = v)], ["en", () => t.stem?.en, (v) => (t.stem.en = v)]]) {
      const s = get(); if (!s) continue; let out = s.replace(RE[lang], "\n\n").replace(/\n{3,}/g, "\n\n");
      { const o2 = out.replace(CHUMON_HEAD[lang], ""); if (o2 !== out) { out = o2; console.log(`  ✓ ${id} ${lang}: 中問見出し行を除去`); } }
      // 前文の前置で同じ段落 (表1 など) が二重になったものを除去: 60 字以上の段落が空白無視で同一なら後の方を落とす (Rule D 3(ii) ①: 2012h24h-q089)
      { const paras = out.split("\n\n"); const seen = new Set(); const kept = []; let dup = 0;
        for (let i = 0; i < paras.length; i++) { const para = paras[i]; const k = para.replace(/\s+/g, "");
          const isCaption = /^(表|図|Table|Figure|图)\s*\d/.test(para.trim()) && k.length < 60;
          const nextIsTable = i + 1 < paras.length && /^\s*\|/.test(paras[i + 1]);
          // 本体の二重 / 二重の表本体に付くキャプション / 表本体が既に除去されて孤立した二重キャプション (次段落が表でない)
          if (seen.has(k) && (k.length >= 60 || (isCaption && (!nextIsTable || seen.has(paras[i + 1].replace(/\s+/g, "")))))) { dup++; continue; }
          seen.add(k); kept.push(para); }
        if (dup) { out = kept.join("\n\n"); console.log(`  ✓ ${id} ${lang}: 二重段落 ${dup} を除去`); } }
      // 中問メンバー (2009〜2015 の q085–q100) の先頭にある分野見出し行 + 問NN は D-141 に従い落とす (前文の有無に関わらず、同組内で表示を揃える; Rule D 3(ii) LOW)
      { const n = parseInt(id.slice(-3), 10); const yr = parseInt(id.slice(0, 4), 10);
        if (n >= 85 && yr <= 2015) { const LEAD = { jp: /^[\s　]*〔(ストラテジ|マネジメント|テクノロジ)〕[^\n]*\n[\s　]*(問[ \t　]*\d+[ \t　]*)?/, zh: /^[\s　]*〔(战略|管理|技术|策略|科技)〕[^\n]*\n[\s　]*(问[ \t　]*\d+[ \t　]*)?/, en: /^[\s]*\[(Strategy|Management|Technology)\][^\n]*\n[\s]*(Q\d+[ \t]*)?/ };
          const o2 = out.replace(LEAD[lang], ""); if (o2 !== out) { out = o2; console.log(`  ✓ ${id} ${lang}: 先頭の分野見出し/問番号を除去`); } } }
      if (out !== s) { set(out); n++; touched = true; }
    }
  }
  if (touched && !DRY) writeFileSync(p, JSON.stringify(doc, null, 2) + "\n");
}
console.log(`${DRY ? "(dry-run) " : "✓ "}chumon-normalize-S117: ${n} fields`);
