#!/usr/bin/env node
// Stage 6 / Quiz — s7x DISPLAY-TEXT FIDELITY fixes, batch S110 (2013h25a).
//
// Provenance: two independent fidelity passes over the 6 s7x-resourced questions
//   pass 1 agentType general-purpose                 → 1 discrepant / 2 findings
//   pass 2 agentType pr-review-toolkit:code-reviewer → SAME question, SAME 2 findings (2/2)
//   evidence: evidence/phase5/stage_06_quiz_fidelity/s7x_fidelity_S110_2013h25a{,_pass2}.json
//   主 context 裁決: page-38.png を 2.2x で実読し両差分を確証 (S110 §2)。
//
// Both findings are on the q092 stem; the four choices (ア案1〜エ案4) and correct_answer=エ
// are untouched, so neither is answer-affecting. Fixed BEFORE explanation generation, so
// there is no explanation layer to repair — only the zh/en sidecar, which was translated
// from the corrupted JP (「W先生」/「最佳评价」, "Mr. W"/"best evaluation") and is handled by
// quiz-fidfix-repair-{prep,apply}.
//
// EDITORIAL RULE (same as quiz-fidfix-S109): semantic content only; keep the dataset's
// existing punctuation/spacing conventions. correct_answer is never touched.
//
// Run: node scripts/quiz-fidfix-S110-2013h25a.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const E = "2013h25a";
const TR = path.join(ROOT, `data/ip/quiz/translations/${E}.json`);
const q = (n) => `${E}-q${String(n).padStart(3, "0")}`;

const FIXES = [
  // q092 (page-38) 〔ストラテジ〕中問。両 pass + 主 context 実読が一致。
  { id: q(92), target: "both", from: "問92 Wさんは", to: "問92 Mさんは", why: "登場人物のイニシャル W→M (源: 「M さん」)" },
  {
    id: q(92), target: "both",
    from: "最も良い評価を得る案はどれか。",
    to: "最も高い評価を得る案はどれか。",
    why: "形容詞 良い→高い (源: 「最も高い評価」。評価点の高低を問う設問)",
  },
];

const bank = JSON.parse(readFileSync(RB, "utf-8"));
const byId = new Map((bank.questions ?? bank).map((x) => [x.id, x]));
const trDoc = JSON.parse(readFileSync(TR, "utf-8"));

let changed = 0, bankDirty = false, trDirty = false;

const applyOne = (label, getter, setter, f) => {
  const cur = getter();
  if (typeof cur !== "string") throw new Error(`${f.id} ${label}: field missing`);
  if (cur.includes(f.to) && !cur.includes(f.from)) { console.log(`  ~ ${f.id} ${label}: already fixed, skip`); return false; }
  const n = cur.split(f.from).length - 1;
  if (n !== 1) throw new Error(`${f.id} ${label}: expected exactly 1 occurrence of "${f.from}" but found ${n} — aborting`);
  setter(cur.replace(f.from, f.to));
  console.log(`  ✓ ${f.id} ${label}: ${f.why}`);
  return true;
};

for (const f of FIXES) {
  const rec = byId.get(f.id);
  if (!rec) throw new Error(`${f.id}: not in question_bank.json`);
  const trEntry = trDoc.questions?.[f.id];
  if (f.target.startsWith("choice:")) {
    const L = f.target.slice(7);
    if (applyOne(`choice.${L}`, () => rec.choices_jp[L], (v) => { rec.choices_jp[L] = v; }, f)) { changed++; bankDirty = true; }
    continue;
  }
  if (f.target === "raw" || f.target === "both") {
    if (applyOne("stem_jp(raw)", () => rec.stem_jp, (v) => { rec.stem_jp = v; }, f)) { changed++; bankDirty = true; }
  }
  if (f.target === "clean" || f.target === "both") {
    if (!trEntry || typeof trEntry.stem_jp_clean !== "string") throw new Error(`${f.id}: stem_jp_clean missing`);
    if (applyOne("stem_jp_clean", () => trEntry.stem_jp_clean, (v) => { trEntry.stem_jp_clean = v; }, f)) { changed++; trDirty = true; }
  }
}

if (bankDirty) writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
if (trDirty) writeFileSync(TR, JSON.stringify(trDoc, null, 2) + "\n");
console.log(`✓ quiz-fidfix-S110-2013h25a: ${changed} field-edit(s) → run: node scripts/build-quiz-corpus.mjs`);
