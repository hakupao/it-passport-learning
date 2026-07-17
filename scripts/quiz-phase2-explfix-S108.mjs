#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 batch S108 — explanation-sidecar caveat strip + key_guard
// resolution for 2016h28h q005 / q009 / q016 / q018 / q061 (five flagged OCR corruptions,
// all adjudicated by 主 context against source pages 03/05/08/09/28 and fixed in
// stemfix-S108 + trfix-S108). All key-invariant.
//
// Only q005's distractor エ explanation carried a stale OCR caveat (「なお…「= 吐」は OCR
// 由来…」) referencing the junk the user no longer sees after the choice strip → remove it
// (anchor→end slice + trim, S106 STRIP_CAVEATS pattern). q009/q016/q018/q061 explanations
// used the clean values with no caveat → no body edit.
//
// Layer 2 resolves each generate_result key_guard to post-fix reality (stem_corruption
// _suspected → false → merge yields STEM-CORRUPTION 0). Round-1 blind history preserved in
// the note.
//
// Idempotent. Run: node scripts/quiz-phase2-explfix-S108.mjs
//   (then: node scripts/quiz-phase2-verify-result.mjs 2016h28h 100
//     &&  node scripts/quiz-phase2-merge.mjs 2016h28h)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P2 = (f) => path.join(ROOT, "data/ip/quiz/.phase2", f);

// ---- Layer 1: strip stale OCR caveat (anchor → end, trim trailing whitespace) ------
const STRIP_CAVEATS = [
  { file: "expl_jp_2016h28h-q005.json", locate: (d) => [d.distractors_jp.find((x) => x.letter === "エ"), "why_wrong_jp"], anchor: "なお選択肢末尾の" },
  { file: "expl_tr_2016h28h-q005.json", locate: (d) => [d.distractors.find((x) => x.letter === "エ"), "zh"], anchor: "另外，选项末尾的" },
  { file: "expl_tr_2016h28h-q005.json", locate: (d) => [d.distractors.find((x) => x.letter === "エ"), "en"], anchor: "Note that the" },
];

let changed = 0;
const byFile = new Map();
for (const f of STRIP_CAVEATS) {
  if (!byFile.has(f.file)) byFile.set(f.file, JSON.parse(readFileSync(P2(f.file), "utf-8")));
  const doc = byFile.get(f.file);
  const [obj, key] = f.locate(doc);
  if (!obj || typeof obj[key] !== "string") throw new Error(`${f.file}: locate failed`);
  const cur = obj[key];
  const idx = cur.indexOf(f.anchor);
  if (idx === -1) { console.log(`  ~ ${f.file} ${key}: caveat already stripped, skip`); continue; }
  const stripped = cur.slice(0, idx).replace(/\s+$/, "");
  if (!stripped) throw new Error(`${f.file} ${key}: strip would empty the field — aborting`);
  obj[key] = stripped;
  changed++;
  console.log(`  ✓ ${f.file} ${key}: stripped stale OCR caveat`);
}

for (const [file, doc] of byFile) writeFileSync(P2(file), JSON.stringify(doc, null, 2) + "\n");

// ---- Layer 2: resolve key_guard in generate_result --------------------------------
const RESOLVED = {
  "2016h28h-q005": {
    figure_derivable: true, derived_answer: "ウ", matches_key: true, stem_corruption_suspected: false,
    note_jp: "概念問。ERP=業種・規模を問わず使う統合業務システム→ウ。stem 是正後 (S108: source page-03、raw choice エ 末尾の OCR junk「= 吐」を strip) は表示クリーン。key ウ 不変。round-1 は choice-OCR を捕捉し stem_corruption_suspected=true を立てたが、是正済のため解決 = suspect=false。",
  },
  "2016h28h-q009": {
    figure_derivable: true, derived_answer: "ア", matches_key: true, stem_corruption_suspected: false,
    note_jp: "知識問 (下請法 60 日ルール)。stem 是正後 (S108: source page-05、raw choices ア「69」/ウ「6」/エ「66」→ 全て「60」是正、イ は既に60) は 4 肢とも 60 日で表示クリーン。受領日から60日以内・検査終了問わず支払義務=ア が唯一適合=key と一致。round-1 は choices の数字 OCR (正解肢ア含む) を捕捉し stem_corruption_suspected=true を立てたが、是正済のため解決 = suspect=false。",
  },
  "2016h28h-q016": {
    figure_derivable: true, derived_answer: "エ", matches_key: true, stem_corruption_suspected: false,
    note_jp: "知識問。stem 是正後 (S108: source page-08、raw stem + tr zh/en の OCR「ISO 9991」→「ISO 9001」是正) は ISO 9001 = 品質マネジメントシステム規格 → 品質管理業務の標準化=エ が一意適合=key と一致。round-1 は stem の数字 OCR (0→9) を捕捉し stem_corruption_suspected=true を立てたが、是正済のため解決 = suspect=false。",
  },
  "2016h28h-q018": {
    figure_derivable: true, derived_answer: "ウ", matches_key: true, stem_corruption_suspected: false,
    note_jp: "表題。総時間2400分を C (利益/分) 高い順 Y(3)→W(2.5)→Z(2) に割当: Y=20×30=600, W=40×20=800 で1400分消費、残1000分÷50=Z 20個=ウ。stem 是正後 (S108: source page-09、stem_jp_clean の語句脱落「組立される」→「組立生産される」是正) は表示クリーン。表値は clean が源一致で不動。key ウ 不変。round-1 は clean の語句脱落を捕捉し stem_corruption_suspected=true を立てたが、是正済のため解決 = suspect=false。",
  },
  "2016h28h-q061": {
    figure_derivable: true, derived_answer: "ア", matches_key: true, stem_corruption_suspected: false,
    note_jp: "概念問。ランサムウェア=ファイルを使用不能にし復旧の金銭要求=ア。stem 是正後 (S108: source page-28、raw choice ウ「人入力」→「入力」の余分な人を除去) は表示クリーン。key ア 不変。round-1 は choice-OCR を捕捉し stem_corruption_suspected=true を立てたが、是正済のため解決 = suspect=false。",
  },
};

const grPath = P2("generate_result_2016h28h.json");
const gr = JSON.parse(readFileSync(grPath, "utf-8"));
let grChanged = false;
for (const [id, kg] of Object.entries(RESOLVED)) {
  const rec = gr.results.find((r) => r.id === id);
  if (!rec) throw new Error(`generate_result: ${id} not found`);
  if (rec.key_guard?.stem_corruption_suspected === false && rec.suspect === false && rec.key_guard?.matches_key === true) {
    console.log(`  ~ generate_result ${id} key_guard: already resolved, skip`);
    continue;
  }
  rec.key_guard = { ...kg };
  rec.key_guard_round1 = { ...kg };
  rec.suspect = false;
  grChanged = true;
  changed++;
  console.log(`  ✓ generate_result ${id}: key_guard + round1 resolved (derived ${kg.derived_answer} / suspect false)`);
}
if (grChanged) writeFileSync(grPath, JSON.stringify(gr, null, 2) + "\n");

console.log(`✓ quiz-phase2-explfix-S108: ${changed} change(s) → re-run verify-result + merge 2016h28h`);
