#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 batch S110 — explanation + key_guard repair for 2013h25a.
//
// Layer 1 STRIP_CAVEATS (anchor → end): q083's distractor エ explanation ends with a note
//   telling the reader that the displayed choice says 「差出入」 and that the source reads
//   「差出人」. quiz-phase2-stemfix-S110b has now fixed the choice, so the note describes a
//   state that no longer exists and would just confuse the learner.
//
// Layer 2 resolves the key_guard notes of the five questions whose display text was repaired
//   in this batch. merge publishes the FINAL key_guard (S110 change) and keeps round-1
//   alongside it, so appending the resolution here means the shipped note describes reality
//   while the blind pre-fix derivation stays on record as key_guard.round1.
//
//   q048 / q051 / q086 / q088 — intra-word OCR line-wrap spaces removed from the raw stem
//   q083 — choice エ 差出入 → 差出人
//
// Nothing here touches correct_answer or any derivation; only the narrative is brought up to
// date. Idempotent.
//
// Run: node scripts/quiz-phase2-explfix-S110b.mjs
//   (then: node scripts/quiz-phase2-verify-result.mjs 2013h25a && node scripts/quiz-phase2-merge.mjs 2013h25a)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P2 = (f) => path.join(ROOT, "data/ip/quiz/.phase2", f);
const E = "2013h25a";

const dJp = (letter) => (d) => {
  const t = (d.distractors_jp ?? []).find((x) => x.letter === letter);
  return [t, "why_wrong_jp"];
};
const dTr = (letter, lang) => (d) => {
  const t = (d.distractors ?? []).find((x) => x.letter === letter);
  return [t, lang];
};

const STRIP_CAVEATS = [
  { file: `expl_jp_${E}-q083.json`, locate: dJp("エ"), anchor: "なお、この選択肢の表示文にある「差出入」は" },
  { file: `expl_tr_${E}-q083.json`, locate: dTr("エ", "zh"), anchor: "另外，该选项显示文本中的「差出入」是" },
  { file: `expl_tr_${E}-q083.json`, locate: dTr("エ", "en"), anchor: "Note that 差出入 in the displayed text" },
];

let changed = 0;
const byFile = new Map();
const load = (f) => {
  if (!byFile.has(f)) byFile.set(f, JSON.parse(readFileSync(P2(f), "utf-8")));
  return byFile.get(f);
};

for (const f of STRIP_CAVEATS) {
  const [obj, key] = f.locate(load(f.file));
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

// ---- Layer 2: append the resolution to the FINAL key_guard notes ---------------------
const RESOLUTIONS = {
  [`${E}-q048`]: "【S110 是正済】stem_jp の語中スペース「実行 環境」を「実行環境」へ是正 (quiz-phase2-stemfix-S110b)。この exam の raw stem_jp には OCR 改行由来の語中スペースが 48/100 問に存在するが、表示は stem_jp_clean 優先のため実際に学習者へ届いていたのは 5 問のみで、うち 4 問 (q048/q051/q086/q088) を是正、残る q012「単位 百万円」は源 (page-05) 自身の表注スペースゆえ不動。答えへの影響は元より無い。",
  [`${E}-q051`]: "【S110 是正済】stem_jp の語中スペース「一 つの表」を「一つの表」へ是正 (quiz-phase2-stemfix-S110b)。答えへの影響は元より無い。読点の字種 (半角「,」/全角「，」) の正規化は本 corpus 横断の規約課題として backlog に残す。",
  [`${E}-q083`]: "【S110 是正済】誤答肢エ の字形 OCR「見知らぬ差出入」を源どおり「見知らぬ差出人」へ是正 (quiz-phase2-stemfix-S110b)。「差出入」は日本語として存在しない語で、学習者に見せる表示文が壊れていた。解説エ の末尾にあった OCR 注記は是正により陳腐化したため三言語とも削除 (explfix-S110b)。key イ は不変。",
  [`${E}-q086`]: "【S110 是正済】stem_jp の語中スペース「適切 なものはどれか」を「適切なものはどれか」へ是正 (quiz-phase2-stemfix-S110b)。答えへの影響は元より無い。",
  [`${E}-q088`]: "【S110 是正済】stem_jp の語中スペース「対策の 説明として」を「対策の説明として」へ是正 (quiz-phase2-stemfix-S110b)。あわせて本問は訳文が JP 源から大きく逸脱していたため zh/en を全面再訳し、別 subagent_type が独立核験して PASS (詳細は failures/quiz_phase2_S110_2013h25a_q088_tr/)。図1 の linkage-gap は未解消のため figure_derivable は据え置き。",
};

const grPath = P2(`generate_result_${E}.json`);
const gr = JSON.parse(readFileSync(grPath, "utf-8"));
let grChanged = false;
for (const [id, add] of Object.entries(RESOLUTIONS)) {
  const rec = gr.results.find((r) => r.id === id);
  if (!rec) throw new Error(`generate_result_${E}: ${id} not found`);
  const cur = rec.key_guard?.note_jp ?? "";
  if (cur.includes("【S110 是正済】")) { console.log(`  ~ ${id} key_guard.note_jp: already resolved, skip`); continue; }
  rec.key_guard.note_jp = `${cur}\n${add}`;
  rec.key_guard.stem_corruption_suspected = false;
  grChanged = true;
  changed++;
  console.log(`  ✓ ${id} key_guard.note_jp: appended S110 resolution (stem_corruption_suspected → false)`);
}
if (grChanged) writeFileSync(grPath, JSON.stringify(gr, null, 2) + "\n");

console.log(`✓ quiz-phase2-explfix-S110b: ${changed} edit(s)`);
console.log(`  next: node scripts/quiz-phase2-verify-result.mjs ${E} && node scripts/quiz-phase2-merge.mjs ${E}`);
