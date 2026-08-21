#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 — S112 explanation fixes (2013h25h), after stemfix-S112.
//
// (1) q015 distractor ウ: the generated explanation carried an OCR caveat
//     (「生産工程問」は「生産工程間」の誤り) in jp/zh/en. stemfix-S112 fixed the choice
//     text itself, so the caveat now describes a corruption that no longer exists — strip
//     the sentence in all three languages (S106 distractor-caveat-strip pattern).
// (2) key_guard resolution notes: append a dated resolution to note_jp in
//     generate_result for every question whose flagged corruption was fixed (or
//     adjudicated no-op) this session, so the merged sidecar publishes a narrative that
//     matches the shipped text (S110 §5(a): merge publishes FINAL key_guard; the
//     suspect flag itself stays union(round1, final) — masking-proof).
//
// Run: node scripts/quiz-phase2-explfix-S112.mjs   (then: node scripts/quiz-phase2-merge.mjs 2013h25h)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P2 = (f) => path.join(ROOT, "data/ip/quiz/.phase2", f);
const E = "2013h25h";

// ---- (1) q015 caveat strip (jp/zh/en) ----
const STRIPS = [
  { file: `expl_jp_${E}-q015.json`, kind: "jp", letter: "ウ",
    sentence: "なお、この選択肢の「生産工程問」は「生産工程間」の OCR 誤りである。" },
  { file: `expl_tr_${E}-q015.json`, kind: "zh", letter: "ウ",
    sentence: "另外，该选项中的「生産工程問」是「生産工程間」（生产工序之间）的 OCR 误识。" },
  { file: `expl_tr_${E}-q015.json`, kind: "en", letter: "ウ",
    sentence: " Note also that 「生産工程問」 in this choice is an OCR error for 「生産工程間」 (between production processes)." },
];

for (const s of STRIPS) {
  const p = P2(s.file);
  const doc = JSON.parse(readFileSync(p, "utf-8"));
  const d = s.kind === "jp"
    ? doc.distractors_jp.find((x) => x.letter === s.letter)
    : doc.distractors.find((x) => x.letter === s.letter);
  if (!d) throw new Error(`q015 ${s.kind} distractor ${s.letter} missing`);
  const key = s.kind === "jp" ? "why_wrong_jp" : s.kind;
  if (!d[key].includes(s.sentence)) {
    if (d[key].includes("生産工程問")) throw new Error(`q015 ${s.kind}: caveat text drifted — manual check`);
    console.log(`  = q015 caveat [${s.kind}] already stripped`);
    continue;
  }
  d[key] = d[key].replace(s.sentence, "").replace(/\s+$/, "");
  writeFileSync(p, JSON.stringify(doc, null, 2) + "\n");
  console.log(`  ✓ q015 caveat strip [${s.kind}]`);
}

// ---- (2) key_guard resolution notes in generate_result ----
const RESOLVES = {
  [`${E}-q007`]: "【S112 裁決】raw stem の「18 時間」は page-04 実読で「10 時間とするとき」に是正済 (stemfix-S112)。stem_jp_clean は元から源一致で表示は無傷だった。",
  [`${E}-q015`]: "【S112 裁決】選択肢ウ「生産工程問」は page-06 実読で「生産工程間」に是正済 (stemfix-S112)。解説の OCR caveat も撤去済 (explfix-S112)。",
  [`${E}-q017`]: "【S112 裁決】選択肢エ「チケット の」の語中空白は page-07 実読で「チケットの」に是正済 (stemfix-S112)。",
  [`${E}-q046`]: "【S112 裁決】stem「場 合」の語中空白は page-19 実読で「場合」に是正済 (stemfix-S112)。",
  [`${E}-q056`]: "【S112 裁決】final key_guard 自身が round-1 の「感圧式」腐敗疑いを原典照合で撤回済み。是正不要 (no-op)。",
  [`${E}-q062`]: "【S112 裁決】正解肢イ「要求すもる」は page-26 実読で「要求する」に是正済 (stemfix-S112)。",
  [`${E}-q063`]: "【S112 裁決】round-1 の分かち書き疑いは stem_jp_clean で修復済みだったことを final が確認。是正不要 (no-op)。",
  [`${E}-q093`]: "【S112 裁決】stem の計算式 D1+C2-B2 は page-43 実読で B14+C2-B2 に是正済 (stemfix-S112、zh/en は trfix-S112)。図1/図2 の未紐付は中問C クラスタとして図再抽出 track に登録 (q093/q094/q095)。",
  [`${E}-q018`]: "【S112 裁決】figure_derivable=false は概念問への benign over-flag (図は選択肢対照表そのもの)。derived=イ=key 一致、是正不要。",
  [`${E}-q085`]: "【S112 裁決】中問A リード文 (page-35) の未取り込みによる語句脱落。テキスト是正では回収不能、シナリオ再抽出 track に登録 (q085/q088)。key ウ は独立導出で一致。",
  [`${E}-q088`]: "【S112 裁決】中問A リード文 (page-35) の未取り込み。シナリオ再抽出 track に登録 (q085/q088)。key イ は独立導出で一致。",
  [`${E}-q090`]: "【S112 裁決】中問B 共通前提 (page-39 基本サービス(a)〜(d)・要望(1)〜(5)) の未取り込み。シナリオ再抽出 track に登録 (q089〜q092)。key イ は源実読の独立導出で一致。",
  [`${E}-q091`]: "【S112 裁決】中問B 共通前提の未取り込み (q090 と同根)。シナリオ再抽出 track に登録。key エ は源実読の独立導出で一致。",
  [`${E}-q092`]: "【S112 裁決】中問B 共通前提の未取り込み (q090 と同根)。シナリオ再抽出 track に登録。key ウ は源実読の独立導出で一致。",
  [`${E}-q095`]: "【S112 裁決】中問C 図1/図2 (page-42) の未紐付。図再抽出 track に登録 (q093/q094/q095)。key エ は page-42 実読の独立導出で一致。",
  [`${E}-q097`]: "【S112 裁決】中問D 前文+図1 (page-45) の未取り込み。図/シナリオ再抽出 track に登録。key ウ は page-45/46 実読の独立導出で一致。",
};

const grPath = P2(`generate_result_${E}.json`);
const gr = JSON.parse(readFileSync(grPath, "utf-8"));
let resolved = 0;
for (const [id, note] of Object.entries(RESOLVES)) {
  const rec = gr.results.find((r) => r.id === id);
  if (!rec) throw new Error(`${id}: not in generate_result`);
  if (rec.key_guard.note_jp.includes("【S112 裁決】")) { console.log(`  = ${id} already resolved`); continue; }
  rec.key_guard.note_jp = `${rec.key_guard.note_jp}\n${note}`;
  resolved++;
  console.log(`  ✓ ${id} key_guard resolve`);
}
// ---- (3) boolean resolution for the SIX FIXED corruptions (S110 explfix precedent):
// the shipped text no longer contains these corruptions, so the published FINAL key_guard
// must say stem_corruption_suspected=false. round1 stays untouched — merge's
// suspect/corruption union(round1, final) is the anti-masking invariant and the report
// keeps listing them; the sidecar publishes final truth + round1 history side by side.
// q093 keeps figure_derivable=false: the OCR is fixed but 図1 is still unattached
// (S110 RESOLVED_GAP pattern). Linkage-gap-only items (q085/q088/q090-092/q095/q097)
// keep stem_corruption_suspected=true — the missing lead text IS still missing.
const FIXED_FLAGS = {
  [`${E}-q007`]: { figure_derivable: true, derived_answer: "ア" },
  [`${E}-q015`]: { figure_derivable: true, derived_answer: "イ" },
  [`${E}-q017`]: { figure_derivable: true, derived_answer: "イ" },
  [`${E}-q046`]: { figure_derivable: true, derived_answer: "イ" },
  [`${E}-q062`]: { figure_derivable: true, derived_answer: "イ" },
  [`${E}-q093`]: { figure_derivable: false, derived_answer: "イ" },
};
let flipped = 0;
for (const [id, want] of Object.entries(FIXED_FLAGS)) {
  const rec = gr.results.find((r) => r.id === id);
  if (!rec) throw new Error(`${id}: not in generate_result`);
  const kg = rec.key_guard;
  if (kg.derived_answer !== want.derived_answer) throw new Error(`${id}: derived_answer ${kg.derived_answer} ≠ expected ${want.derived_answer}`);
  if (kg.matches_key !== true) throw new Error(`${id}: matches_key is not true`);
  if (kg.stem_corruption_suspected === false && kg.figure_derivable === want.figure_derivable) {
    console.log(`  = ${id} flags already resolved`);
    continue;
  }
  kg.stem_corruption_suspected = false;
  kg.figure_derivable = want.figure_derivable;
  flipped++;
  console.log(`  ✓ ${id} final flags → corrupt=false, derivable=${want.figure_derivable}`);
}

writeFileSync(grPath, JSON.stringify(gr, null, 2) + "\n");
console.log(`✓ quiz-phase2-explfix-S112: caveat strips 3 / key_guard resolves ${resolved} / flag flips ${flipped}`);
