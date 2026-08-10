#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 — display-text fixes for 2013h25a, batch S110.
//
// Source: the generate run's key_guard notes (`wf_31a49c29-025`) flagged
// stem_corruption_suspected on q048 / q051 / q083 / q093, all non-answer-affecting.
// 主 context triaged them plus a deterministic sweep of the whole exam.
//
// ── The intra-word space artifact ──
// This exam's raw stem_jp carries stray spaces inside words — an OCR line-wrap artifact.
// The generator counted 48/100 stems affected, which sounds alarming, but a deterministic
// sweep of what the learner actually SEES (stem_jp_clean when present, else stem_jp — the
// quizModel.ts rule) narrows it to **5**, because 43 are already repaired by the Phase 1
// clean pass. Of those 5, q012's 「単位 百万円」 is not a defect at all: it is the source's own
// spacing in the table's unit annotation, and the s7x fidelity audit confirmed it against
// page-05. That leaves the 4 genuine word splits fixed below.
//
// This is why the count in a generator note is not a work item on its own — it describes the
// raw layer, and the raw layer is not what ships.
//
// ── q083 ──
// choice エ reads 「見知らぬ差出入からの電子メール」. 「差出入」 is not a word; the source reads
// 「差出人」 (sender). A user-facing choice rendered as a non-word, so it is fixed even though
// it cannot change which option is correct.
//
// NOT fixed here: q093's raw-stem 「ファイ ル名」 — stem_jp_clean already reads 「ファイル名」 and
// clean is the display authority, so nothing reaches the learner (s7x fidelity pass returned
// CLEAN for q093 on page-40). q048/q051's read-mark normalisation (半角「,」vs 全角「，」) is a
// corpus-wide convention question, not a per-question defect → backlog.
//
// correct_answer is never touched. Idempotent (assert-once).
//
// Run: node scripts/quiz-phase2-stemfix-S110b.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const E = "2013h25a";
const TR = path.join(ROOT, `data/ip/quiz/translations/${E}.json`);
const q = (n) => `${E}-q${String(n).padStart(3, "0")}`;

const FIXES = [
  // ---- intra-word OCR line-wrap spaces that reach the learner (raw stem is displayed)
  { id: q(48), target: "raw", from: "初期設定し, 実行 環境を整備する", to: "初期設定し, 実行環境を整備する", why: "語中スペース 実行 環境→実行環境" },
  { id: q(51), target: "raw", from: "インデックスのうち, 一 つの表に対して", to: "インデックスのうち, 一つの表に対して", why: "語中スペース 一 つ→一つ" },
  { id: q(86), target: "raw", from: "締結した理由として, 適切 なものはどれか。", to: "締結した理由として, 適切なものはどれか。", why: "語中スペース 適切 な→適切な" },
  { id: q(88), target: "raw", from: "可能にする対策の 説明として", to: "可能にする対策の説明として", why: "語中スペース の 説明→の説明" },

  // ---- q083 choice エ: 「差出入」 is not a Japanese word; the source reads 「差出人」
  { id: q(83), target: "choice:エ", from: "見知らぬ差出入からの電子メール", to: "見知らぬ差出人からの電子メール", why: "字形 OCR 差出入→差出人 (誤答肢、key イ 不変)" },
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
console.log(`✓ quiz-phase2-stemfix-S110b: ${changed} field-edit(s) → run: node scripts/build-quiz-corpus.mjs`);
