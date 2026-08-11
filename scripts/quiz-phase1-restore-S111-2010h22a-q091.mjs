#!/usr/bin/env node
// Stage 6 / Quiz — restore 2010h22a-q091, which had been overwritten with a copy of 問89.
//
// ══ WHAT HAPPENED ══
// S110's corpus-wide answer_keys ↔ questions cross-check flagged 2010h22a-q091 as a key
// mismatch (answer_keys=ア, questions=エ). It was not a key error. Reading the source showed:
//
//   - dataset q089 and q091 carry the SAME stem — 問89's text — with q091 holding a slightly
//     reworded variant of it.
//   - the real 問91 (source page-37) was absent from the dataset entirely.
//   - q091's stored figure is 表2 出力結果表, which belongs to 問90/問92, not 問91.
//
// The cause is recoverable from the record itself: q091 still carries
// `stem_jp_corrupted_backup` and `choices_jp_corrupted_backup` from before the s7x pass, and
// those backups hold the REAL 問91 — stem and all four choices matching source page-37
// verbatim. What the backup also shows is why it went wrong: the table in the stem had been
// OCR'd into garbage ("| ce | w | s | ro | | Cc | 1m | 8 | iso |..."). The s7x "repair" saw an
// unusable question and replaced the whole thing with the neighbouring 問89.
//
// This is the S96 lesson in its most extreme form: an upstream "repair" can move away from the
// source, and here it substituted a different question rather than fixing the broken one.
// The pre-repair backup was right and the repair was wrong.
//
// ══ WHY ア ══
// Independently derived by 主 context from source page-35 (表1 料金表) + page-37 (result table),
// not taken from answer_keys:
//   Rule: size class = max(3辺計 class, 重量 class); 表1 gives C/D prices per class.
//   C 60cm/5kg  → class 1 → C-1 = 1,150, but output was 1,400 (= C-2)  → WRONG
//   C 101cm/8kg → class 3 (101>100) → C-3 = 1,800, output 1,800        → ok
//   D 60cm/5kg  → class 1 → D-1 = 1,800, but output was 2,350 (= D-2)  → WRONG
//   D 101cm/8kg → class 3 → D-3 = 3,400, output 3,400                  → ok
//   Both wrong rows are exactly 「3辺計が60cmで重量が5kg」 → **ア**.
//   イ is false (both class-3 rows are correct), エ is false (D is wrong too), ウ is false.
// This agrees with answer_keys.json, so the stored エ (which belonged to the duplicated 問89
// content) is replaced by ア.
//
// ══ WHAT THIS SCRIPT DOES ══
//   1. stem_jp    ← real 問91 stem + the result table, linearised as markdown
//   2. choices_jp ← the pre-s7x backup (already verbatim-correct against page-37)
//   3. correct_answer エ → ア
//   4. stem_jp_clean ← same display text as stem_jp (it currently holds 表2, the wrong figure's
//      table). This exam embeds its tables in stem_jp_clean — q090 and q092 both do.
//   5. figure      ← re-crop from page-37 (the stored PNG is 表2, belonging to 問90/問92)
//
// zh/en are NOT touched here — they still translate the 問89 duplicate and are retranslated in
// a separate reviewed step. The pre-fix record is archived under failures/ first (Rule B).
//
// Idempotent. Run: node scripts/quiz-phase1-restore-S111-2010h22a-q091.mjs
//   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const ID = "2010h22a-q091";
const TR = path.join(ROOT, "data/ip/quiz/translations/2010h22a.json");
const PAGE = path.join(ROOT, "data/ip/exams/pages/2010h22a/page-37.png");
const FIG = path.join(ROOT, "data/ip/exams/figures/2010h22a-q091.png");
const ARCHIVE = path.join(ROOT, "failures", "quiz_phase1_S111_2010h22a_q091_duplicate");

// verified against page-37 at 4x
const STEM = `次の表は，テストデータ（地区，3辺計，重量）を用いて実際にテストを行った結果の一部である。この結果の判断として，適切なものはどれか。

| 地区 | 3辺計（cm） | 重量（kg） | 出力結果（円） |
|---|---|---|---|
| C | 60 | 5 | 1,400 |
| C | 101 | 8 | 1,800 |
| D | 60 | 5 | 2,350 |
| D | 101 | 8 | 3,400 |`;

const EXPECTED_CHOICES = {
  ア: "3辺計が60cmで重量が5kgのときの出力結果に誤りがある。",
  イ: "サイズ区分が区分3のときの出力結果に誤りがある。",
  ウ: "出力結果に誤りはない。",
  エ: "地区Cの出力結果だけに誤りがある。",
};

// bbox verified by eye at 4x: the whole table, no stem/choice text bleeding in
const CROP_PCT = { left: 28.8, top: 32.65, right: 67.5, bottom: 49.85 };

const bank = JSON.parse(readFileSync(RB, "utf-8"));
const list = bank.questions ?? bank;
const rec = list.find((x) => x.id === ID);
if (!rec) throw new Error(`${ID}: not in question_bank.json`);

const done = rec.stem_jp === STEM && rec.correct_answer === "ア";
if (done) {
  console.log(`  ~ ${ID}: already restored, skip`);
} else {
  // guard: only run against the known-bad duplicate state
  if (!rec.stem_jp.includes("表 2 の出力結果表を作成した理由")) {
    throw new Error(`${ID}: stem is neither the 問89 duplicate nor the restored text — aborting`);
  }
  const backup = rec.choices_jp_corrupted_backup;
  if (!backup) throw new Error(`${ID}: choices_jp_corrupted_backup missing — cannot verify restoration`);
  for (const [k, v] of Object.entries(EXPECTED_CHOICES)) {
    if (backup[k] !== v) throw new Error(`${ID}: backup choice ${k} does not match the source-verified text — aborting`);
  }

  // Rule B: keep the pre-fix record
  mkdirSync(ARCHIVE, { recursive: true });
  const before = path.join(ARCHIVE, "question_bank_entry.BEFORE.json");
  if (!existsSync(before)) writeFileSync(before, JSON.stringify(rec, null, 2) + "\n");
  if (existsSync(FIG) && !existsSync(path.join(ARCHIVE, "figure.BEFORE.png"))) {
    copyFileSync(FIG, path.join(ARCHIVE, "figure.BEFORE.png"));
  }

  rec.stem_jp = STEM;
  rec.choices_jp = { ...EXPECTED_CHOICES };
  if (rec.correct_answer !== "ア") {
    console.log(`  ★ ${ID} correct_answer: ${rec.correct_answer} → ア (independent derivation + answer_keys)`);
    rec.correct_answer = "ア";
  }
  rec.figure_bbox_pct = CROP_PCT;
  rec.restored_s111 = "問89 の複製で上書きされていたものを、s7x 前バックアップ + 源 page-37 実読から復元 (S111)";
  writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
  console.log(`  ✓ ${ID}: stem_jp + choices_jp restored from the pre-s7x backup (source-verified)`);
}

// ---- figure: re-crop the real 問91 table from page-37 --------------------------------
const figIsWrong = !existsSync(path.join(ARCHIVE, "figure.RESTORED.marker"));
if (figIsWrong) {
  if (!existsSync(PAGE)) throw new Error(`missing source page ${PAGE}`);
  const py = `
from PIL import Image
im = Image.open(${JSON.stringify(PAGE)})
w, h = im.size
box = (int(w*${CROP_PCT.left / 100}), int(h*${CROP_PCT.top / 100}), int(w*${CROP_PCT.right / 100}), int(h*${CROP_PCT.bottom / 100}))
im.crop(box).save(${JSON.stringify(FIG)})
print("cropped", box)
`;
  const out = execFileSync("python3", ["-c", py], { encoding: "utf-8" });
  mkdirSync(ARCHIVE, { recursive: true });
  writeFileSync(path.join(ARCHIVE, "figure.RESTORED.marker"), out);
  console.log(`  ✓ ${ID}: figure re-cropped from page-37 (was 表2, which belongs to 問90/問92) — ${out.trim()}`);
} else {
  console.log(`  ~ ${ID}: figure already re-cropped, skip`);
}

// ---- stem_jp_clean: this exam embeds its tables there (cf. q090 / q092) ---------------
const trDoc = JSON.parse(readFileSync(TR, "utf-8"));
const entry = trDoc.questions?.[ID];
if (!entry) throw new Error(`${ID}: translation entry missing`);
if (entry.stem_jp_clean === STEM) {
  console.log(`  ~ ${ID} stem_jp_clean: already restored, skip`);
} else {
  const archivedTr = path.join(ARCHIVE, "translation_entry.BEFORE.json");
  mkdirSync(ARCHIVE, { recursive: true });
  if (!existsSync(archivedTr)) writeFileSync(archivedTr, JSON.stringify(entry, null, 2) + "\n");
  entry.stem_jp_clean = STEM;
  writeFileSync(TR, JSON.stringify(trDoc, null, 2) + "\n");
  console.log(`  ✓ ${ID} stem_jp_clean: replaced (held 表2, the wrong figure's table)`);
}

console.log(`✓ quiz-phase1-restore-S111-2010h22a-q091 → next: node scripts/build-quiz-corpus.mjs`);
console.log(`  NOTE: stem.zh / stem.en / choices tr still describe the 問89 duplicate — retranslate separately.`);
