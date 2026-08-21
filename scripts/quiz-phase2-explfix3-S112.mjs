#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 — S112 third-round fixes (2013h25h), from the independent
// re-verify `wf_a0bac3a5-dd1` (Rule D: 主 context のパッチを別 agent が検証)。
//
// (1) q004 FAIL の是正 — explfix2 のパッチ伝播漏れ。解説の hosting ラベルは 主机租用 に
//     直したが、**ユーザー可視の選択肢訳** translations/2013h25h.json の エ zh が
//     「主机托管」のまま残り、選択肢→解説の連鎖が断裂していた (しかも選択肢ラベルが
//     解説内の反対概念 服务器托管=housing と衝突)。エ zh → 主机租用。en「Hosting」は正しく不変。
//     ※ hosting/housing の zh 訳語は corpus 横断で 3 系統併存が判明 (textbook
//     strategy-06-20-u03 = 主机托管/机房托管、2016h28h 等 = 主机托管)。横断統一は
//     D 候補としてユーザー判断待ち backlog。本 fix は本 exam 内の整合のみ回復する。
// (2) q019 note_jp の陳腐化是正 (再核験の非ブロッキング指摘) — explfix2 で raw も源文言に
//     揃えたため「stem_jp 側の『確保に役立つ技術の発掘』は言い換えで、clean が正」が
//     現データに対する誤った現在形主張になった。過去形の解決記述へ差し替え。
//     merge 元 (.phase2/expl_jp) を直す — sidecar だけ直すと再マージで復活する。
//
// Run: node scripts/quiz-phase2-explfix3-S112.mjs   (then: node scripts/quiz-phase2-merge.mjs 2013h25h)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const E = "2013h25h";

// ---- (1) q004 choice エ zh ----
const trPath = path.join(ROOT, `data/ip/quiz/translations/${E}.json`);
const tr = JSON.parse(readFileSync(trPath, "utf-8"));
const c = tr.questions[`${E}-q004`]?.choices?.["エ"];
if (!c) throw new Error("q004 choices エ missing");
if (c.zh === "主机租用") {
  console.log("  = q004 choice エ zh already fixed");
} else {
  if (c.zh !== "主机托管") throw new Error(`q004 choice エ zh unexpected: ${c.zh}`);
  if (c.en !== "Hosting") throw new Error(`q004 choice エ en unexpected: ${c.en}`);
  c.zh = "主机租用";
  writeFileSync(trPath, JSON.stringify(tr, null, 2) + "\n");
  console.log("  ✓ q004 choice エ zh 主机托管→主机租用 (解説と連鎖回復)");
}

// ---- (2) q019 note_jp past-tense resolution ----
const jpPath = path.join(ROOT, `data/ip/quiz/.phase2/expl_jp_${E}-q019.json`);
const jp = JSON.parse(readFileSync(jpPath, "utf-8"));
const FROM = "(stem_jp 側の「確保に役立つ技術の発掘」は言い換えで、clean が正)";
const TO = "(raw stem_jp 側にあった s7x 言い換え「確保に役立つ技術の発掘」は S112 explfix2 で源文言に是正済み、全層一致)";
if (jp.key_guard.note_jp.includes(TO)) {
  console.log("  = q019 note already updated");
} else {
  const n = jp.key_guard.note_jp.split(FROM).length - 1;
  if (n !== 1) throw new Error(`q019 note: expected exactly 1 occurrence, found ${n}`);
  jp.key_guard.note_jp = jp.key_guard.note_jp.replace(FROM, TO);
  writeFileSync(jpPath, JSON.stringify(jp, null, 2) + "\n");
  console.log("  ✓ q019 note_jp 過去形の解決記述へ");
}

// keep generate_result in sync for q019 (merge may source key_guard from it)
const grPath = path.join(ROOT, `data/ip/quiz/.phase2/generate_result_${E}.json`);
const gr = JSON.parse(readFileSync(grPath, "utf-8"));
const rec = gr.results.find((r) => r.id === `${E}-q019`);
if (rec?.key_guard?.note_jp?.includes(FROM)) {
  rec.key_guard.note_jp = rec.key_guard.note_jp.replace(FROM, TO);
  writeFileSync(grPath, JSON.stringify(gr, null, 2) + "\n");
  console.log("  ✓ q019 generate_result note_jp も同期");
} else {
  console.log("  = q019 generate_result note already consistent");
}
console.log("✓ quiz-phase2-explfix3-S112 done");
