#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 batch S107 — explanation-sidecar caveat strip + key_guard
// resolution for 2017h29a q009 / q016 / q040 (three OCR stem-number corruptions, all
// adjudicated by 主 context against source pages 05 / 08 / 17 and fixed in stemfix-S107
// + trfix-S107).
//
// Two of the three explanations (q016, q040) carry a stale "(注: …OCR…)" caveat inside
// correct.{jp,zh,en}: the generator, following D-137-C, computed with the CORRECT source
// value but appended a parenthetical flagging that the *displayed* stem showed the
// corrupt value. Now that the displayed stem is corrected, those caveats reference a
// value the user no longer sees → strip them (same pattern as explfix-S106 q077). q009's
// explanation body already used the clean figures with no caveat → no body edit.
//
// Two-layer drift-proof fix (edit merge INPUTS, then re-run quiz-phase2-merge):
//   1. expl_jp/expl_tr correct.* — strip the stale OCR caveat (assert-once substring).
//   2. generate_result_2017h29a q009/q016/q040 key_guard + round1 — resolve to the
//      post-fix reality (derived answer / matches_key true / stem_corruption false →
//      merge yields suspect=false). The round-1 blind-derivation history is preserved in
//      the resolved note_jp + the S107 adjudication evidence.
//
// Idempotent. Run: node scripts/quiz-phase2-explfix-S107.mjs
//   (then: node scripts/quiz-phase2-verify-result.mjs 2017h29a 100
//     &&  node scripts/quiz-phase2-merge.mjs 2017h29a)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P2 = (f) => path.join(ROOT, "data/ip/quiz/.phase2", f);

// ---- Layer 1: strip stale OCR caveats from the explanation body -------------------
const CONTENT_FIXES = [
  // q016 correct.{jp,zh,en}: trailing "(注: 156万円 は 150万円 の OCR 誤り…)" parenthetical.
  {
    file: "expl_jp_2017h29a-q016.json",
    locate: (d) => [d, "correct_jp"],
    from: "（注: 表示 stem の固定費「156万円」は原典「150万円」のOCR由来の誤りとみられる。150万円で計算すると損益分岐点は正確に300万円となる。）",
    to: "",
  },
  {
    file: "expl_tr_2017h29a-q016.json",
    locate: (d) => [d.correct, "zh"],
    from: "（注：题干中显示的固定成本「156 万日元」应为原始资料「150 万日元」的 OCR 误识。按 150 万日元计算，盈亏平衡点恰好为 300 万日元。）",
    to: "",
  },
  {
    file: "expl_tr_2017h29a-q016.json",
    locate: (d) => [d.correct, "en"],
    from: " (Note: the fixed cost '156' shown in the stem appears to be an OCR error for the original '150'. Using 150, the break-even point comes out to exactly 300.)",
    to: "",
  },
  // q040 correct.{jp,zh,en}: mid-sentence "(注: 作業日数は20日が正)" parenthetical.
  {
    file: "expl_jp_2017h29a-q040.json",
    locate: (d) => [d, "correct_jp"],
    from: "(注: 設問の作業日数は20日が正)",
    to: "",
  },
  {
    file: "expl_tr_2017h29a-q040.json",
    locate: (d) => [d.correct, "zh"],
    from: "（注：本题的作业天数应为 20 天）",
    to: "",
  },
  {
    file: "expl_tr_2017h29a-q040.json",
    locate: (d) => [d.correct, "en"],
    from: " (note: the correct number of work days in this problem is 20 days)",
    to: "",
  },
];

let changed = 0;
const byFile = new Map();
for (const f of CONTENT_FIXES) {
  if (!byFile.has(f.file)) byFile.set(f.file, JSON.parse(readFileSync(P2(f.file), "utf-8")));
  const doc = byFile.get(f.file);
  const [obj, key] = f.locate(doc);
  if (!obj || typeof obj[key] !== "string") throw new Error(`${f.file}: locate failed`);
  const cur = obj[key];
  if (!cur.includes(f.from)) {
    console.log(`  ~ ${f.file} ${key}: caveat already stripped, skip`);
    continue;
  }
  const n = cur.split(f.from).length - 1;
  if (n !== 1) throw new Error(`${f.file} ${key}: expected 1 occurrence of caveat but found ${n} — aborting`);
  const next = cur.replace(f.from, f.to);
  if (!next.trim()) throw new Error(`${f.file} ${key}: strip would empty the field — aborting`);
  obj[key] = next;
  changed++;
  console.log(`  ✓ ${f.file} ${key}: stripped stale OCR caveat`);
}

for (const [file, doc] of byFile) writeFileSync(P2(file), JSON.stringify(doc, null, 2) + "\n");

// ---- Layer 2: resolve q009/q016/q040 key_guard in generate_result ----------------
// After source-read fixes, each stem is clean and the keyed answer follows uniquely, so
// stem_corruption_suspected → false and (for the two answer-affecting ones) matches_key →
// true. Round-1 blind history is preserved in each note.
const RESOLVED = {
  "2017h29a-q009": {
    figure_derivable: true, derived_answer: "イ", matches_key: true, stem_corruption_suspected: false,
    note_jp: "計算問。stem 是正後 (S107: source page-05 実読で販売価格1,000円/10,000個→1,000千円/12,000個→1,800千円を確定、raw bank + tr サイドカーの OCR 数値を是正済) は 限界利益=(1,800−1,000)千÷(12,000−10,000)個=400円/個 → 変動費=1,000−400=600=イ で公式キーと一致。round-1 は腐敗数値 (1,099/10,999/12,900/1,860) で選択肢に一致せず stem_corruption_suspected=true を立てた (答えを左右する OCR 腐敗を正しく捕捉) が、源実読で正値を確定し是正したため解決 = suspect=false。",
  },
  "2017h29a-q016": {
    figure_derivable: true, derived_answer: "イ", matches_key: true, stem_corruption_suspected: false,
    note_jp: "計算問。stem 是正後 (S107: source page-08 実読で固定費150万円を確定、raw bank + tr zh/en の OCR「156」→「150」を是正済) は 変動費=400−50−150=200, 限界利益率=(400−200)/400=0.5, 損益分岐点=150÷0.5=300=イ で公式キーと厳密一致。round-1 は腐敗値156で概算 302.9→最近接イに寄せ matches_key=true, stem_corruption_suspected=true を立てたが、源実読で150を確定し是正したため解決 = suspect=false。",
  },
  "2017h29a-q040": {
    figure_derivable: true, derived_answer: "ア", matches_key: true, stem_corruption_suspected: false,
    note_jp: "仕事算。stem 是正後 (S107: source page-17 実読で作業日数20日を確定、raw bank + tr サイドカーの OCR「26日」→「20日」を是正済) は A:B:C=2:1:3, A+B=3で仕事量=3×20=60, A+C=5で60÷5=12=ア で公式キーと一致。round-1 は腐敗値26日で 78÷5=15.6 となり選択肢に一致せず derived=unsure・matches_key=false・stem_corruption_suspected=true を立てた (答えを左右する OCR 腐敗を正しく捕捉) が、源実読で20日を確定し是正したため解決 = suspect=false。",
  },
};

const grPath = P2("generate_result_2017h29a.json");
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
  console.log(`  ✓ generate_result ${id}: key_guard + round1 resolved (derived ${kg.derived_answer} / matches_key true / suspect false)`);
}
if (grChanged) writeFileSync(grPath, JSON.stringify(gr, null, 2) + "\n");

console.log(`✓ quiz-phase2-explfix-S107: ${changed} change(s) → re-run verify-result + merge 2017h29a`);
