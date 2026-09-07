#!/usr/bin/env node
// Stage 6 / Quiz — S117 batch 2 の Rule D reviewer (reviewer-batch2-fix) 指摘 #1〜#5 を是正。
//   #1 .phase1/tr_2015h27a-q100 stem.zh: 既に状語があった入力層に batch2 が同義句を二重挿入 → 新挿入分を除去
//   #2 translations 2015h27a-q100 stem.en (+.phase1): 挿入後の時制衝突を平文化
//   #3 generate_result_2018h30h の final note 4 問: 是正記録の page 番号誤り (q048 21 / q064 30 / q070 32 / q097 41)
//   #4 generate_result_2015h27a q061 note: 差し替え後に残った「表示是正推奨」の文を除去 (除去済と矛盾)
//   #5 解説の正字法統一: 2018h30h-q054 ウォーターフォール→ウォータフォール、2015h27a-q098 ディスプレー→ディスプレイ (expl 入力層)
// Run: node scripts/quiz-fidfix-S117-batch2b.mjs && node scripts/quiz-phase2-merge.mjs 2018h30h && node scripts/quiz-phase2-merge.mjs 2015h27a
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P = (...s) => path.join(ROOT, ...s);
const rj = (f) => JSON.parse(readFileSync(f, "utf-8")), wj = (f, d) => writeFileSync(f, JSON.stringify(d, null, 2) + "\n");
let n = 0;
const sub = (o, k, from, to, w, all = false) => { const s = o[k]; if (!s.includes(from)) { console.log(`  = ${w}: already`); return; } if (!all && s.split(from).length !== 2) throw new Error(`${w}: not unique`); o[k] = all ? s.split(from).join(to) : s.replace(from, to); n++; console.log(`  ✓ ${w}`); };

// #1
{ const f = P("data/ip/quiz/.phase1/tr_2015h27a-q100.json"); const t = rj(f); sub(t.stem, "zh", "对于 A 先生要处理的 PC，对于A先生要处分的PC，", "对于 A 先生要处理的 PC，", ".phase1 q100 zh 二重挿入除去"); wj(f, t); }
// #2
const EN_FROM = "For the PCs Mr. A will dispose of, the software's manual shows that the processing speed of that software was found to be as shown below.";
const EN_TO = "For the PCs Mr. A will dispose of, the dedicated software's manual showed that its processing speed is as follows.";
{ const f = P("data/ip/quiz/translations/2015h27a.json"); const d = rj(f); sub(d.questions["2015h27a-q100"].stem, "en", EN_FROM, EN_TO, "translations q100 en"); wj(f, d);
  const f1 = P("data/ip/quiz/.phase1/tr_2015h27a-q100.json"); const t1 = rj(f1); sub(t1.stem, "en", EN_FROM, EN_TO, ".phase1 q100 en"); wj(f1, t1); }
// #3
{ const f = P("data/ip/quiz/.phase2/generate_result_2018h30h.json"); const g = rj(f);
  for (const [id, from, to] of [["2018h30h-q048", "page-22 実読", "page-21 実読"], ["2018h30h-q064", "page-28 実読", "page-30 実読"], ["2018h30h-q070", "page-31 実読", "page-32 実読"], ["2018h30h-q097", "page-43 実読", "page-41 実読"]]) {
    const r = g.results.find((x) => x.id === id); sub(r.key_guard, "note_jp", from, to, `${id} note page 番号`); }
  wj(f, g); }
// #4
{ const f = P("data/ip/quiz/.phase2/generate_result_2015h27a.json"); const g = rj(f); const r = g.results.find((x) => x.id === "2015h27a-q061");
  sub(r.key_guard, "note_jp", "答えには影響しないが choice-OCR cleanup track で表示是正推奨。", "", "q061 note 残句除去"); wj(f, g); }
// #5
for (const [id, from, to] of [["2018h30h-q054", "ウォーターフォール", "ウォータフォール"], ["2015h27a-q098", "ディスプレー", "ディスプレイ"]]) {
  for (const kind of ["expl_jp", "expl_tr"]) { const f = P("data/ip/quiz/.phase2", `${kind}_${id}.json`); const d = rj(f); let c = 0;
    const walk = (o) => { for (const k of Object.keys(o)) { if (typeof o[k] === "string" && o[k].includes(from)) { c += o[k].split(from).length - 1; o[k] = o[k].split(from).join(to); } else if (o[k] && typeof o[k] === "object") walk(o[k]); } }; walk(d);
    if (c) { n += c; console.log(`  ✓ ${id} ${kind}: 「${from}」→「${to}」 ×${c}`); } wj(f, d); } }
console.log(`✓ quiz-fidfix-S117-batch2b: ${n} changes`);
