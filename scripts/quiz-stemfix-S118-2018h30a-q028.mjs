#!/usr/bin/env node
// Stage 6 / Quiz — S118 page-12 follow-up: 2018h30a-q028 の raw stem_jp が、旧・破損版
// page-12.png (1432x1340, 冒頭3行欠落) からの再抽出 (stem_resourced_s7x) によって
// 冒頭を欠いた 53 字の残骸のままだった ("する業務や新規の業務を明確にして，…")。
// 完全文 (176 字相当、句読点は全角) は translations/2018h30a.json の stem_jp_clean に
// 既に格納されており (quizModel.mergeTranslation が表示時にこれで上書きするため学習者
// 表示は元々正しかった)、S118 で再生成した page-12.png の実読でも一致を確認済み。
// zh/en (data/ip/quiz/translations/2018h30a.json) も完全文の翻訳で一致。
//
// 本スクリプトは stem_jp_clean を正 (SOURCE OF TRUTH) として、raw 層 (by_year /
// question_bank) の stem_jp をそれに合わせる。stem_jp_corrupted_backup (OCR 由来、
// 半角読点混じり) は Rule B により不変のまま保持。
//
// 併せて data/ip/quiz/.phase2/generate_result_2018h30a.json の q028 key_guard.note_jp
// (final のみ、key_guard_round1 は S117 batch4 の慣例どおり不変) を更新: 「stem_jp は
// 冒頭欠落の腐敗版」という記述が本修正後は事実と異なるため、是正済みである旨に差し替える
// (quiz-fidfix-S117-batch4.mjs の NOTE_SENT 方式を踏襲、MARK で冪等)。
//
// Assert-once: 現在値が既知の破損 53 字と一致しない場合は例外 (drift guard)。既に正しい
// 場合は no-op。
//
// Run: node scripts/quiz-stemfix-S118-2018h30a-q028.mjs [--dry-run]
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2018h30a

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry-run");
const P = (...s) => path.join(ROOT, ...s);
const rj = (f) => JSON.parse(readFileSync(f, "utf-8"));
const wj = (f, d) => { if (!DRY) writeFileSync(f, JSON.stringify(d, null, 2) + "\n"); };

const ID = "2018h30a-q028";
const EXAM = "2018h30a";
const MARK = "stemfix-S118";
const BAD = "する業務や新規の業務を明確にして，システム化後の業務の全体像を作成するプロセスとして，適切なものはどれか。";

let applied = 0, skipped = 0;
const log = [];

function findIn(arr, id) {
  return (Array.isArray(arr) ? arr : Object.values(arr)).find((q) => q.id === id);
}

// ── 1. GOOD 文の確定 (stem_jp_clean を正とする) ─────────────────────────────
const trFile = P("data/ip/quiz/translations", `${EXAM}.json`);
const tr = rj(trFile);
const trEntry = tr.questions[ID];
const GOOD = trEntry?.stem_jp_clean;
if (!GOOD || GOOD.length < 100) {
  throw new Error(`${ID}: translations.stem_jp_clean missing or implausibly short — abort`);
}

// ── 2. raw 層 (by_year / question_bank) の stem_jp を是正 ───────────────────
function fixStem(doc, arr, label) {
  const q = findIn(arr, ID);
  if (!q) throw new Error(`${ID}: not found in ${label}`);
  if (q.stem_jp === GOOD) { skipped++; log.push(`  ~ ${label}.stem_jp: already correct, skip`); return; }
  if (q.stem_jp !== BAD) {
    throw new Error(`${label}.stem_jp: unexpected current value (neither known-bad nor already-fixed) — abort.\nCurrent: ${q.stem_jp}`);
  }
  q.stem_jp = GOOD;
  applied++;
  log.push(`  ✓ ${label}.stem_jp: 53字残骸 → 完全文 (${GOOD.length}字)`);
}

const byYearFile = P("data/ip/exams/by_year", `${EXAM}.json`);
const byYear = rj(byYearFile);
const byYearArr = byYear.questions ?? byYear;
fixStem(byYear, byYearArr, "by_year");

const bankFile = P("data/ip/exams/question_bank.json");
const bank = rj(bankFile);
const bankArr = bank.questions ?? bank;
fixStem(bank, bankArr, "question_bank");

// ── 3. translations.stem_jp_clean 自己整合チェック (既に GOOD のはずだが防御的) ──
if (trEntry.stem_jp_clean !== GOOD) {
  trEntry.stem_jp_clean = GOOD; applied++; log.push(`  ✓ translations.stem_jp_clean: updated to GOOD`);
} else {
  skipped++; log.push(`  ~ translations.stem_jp_clean: already correct, skip`);
}

// ── 4. generate_result の key_guard.note_jp (provenance, S117 batch4 方式) ──
const grFile = P("data/ip/quiz/.phase2", `generate_result_${EXAM}.json`);
const gr = rj(grFile);
const rec = gr.results.find((r) => r.id === ID);
if (!rec?.key_guard) throw new Error(`${ID}: no key_guard in generate_result`);

const STALE = /stem_jp は冒頭が欠落した腐敗版だが、OCR 除去済みの stem_jp_clean が完全な文で提示されているのでこれを正とする/;
if (rec.key_guard.note_jp.includes(MARK)) {
  skipped++; log.push(`  ~ generate_result.key_guard.note_jp: already carries ${MARK}, skip`);
} else if (!STALE.test(rec.key_guard.note_jp)) {
  log.push(`  ⚠ generate_result.key_guard.note_jp: stale sentence not found — leaving untouched`);
  skipped++;
} else {
  const sents = rec.key_guard.note_jp.split("。");
  const idx = sents.findIndex((s) => STALE.test(s));
  sents.splice(idx, 1, `stem_jp は S118 に page-12.png 再生成 (旧画像は 1432x1340 で問28冒頭3行欠落) 後の実読で完全文へ是正済み、stem_jp_clean と一致 (${MARK})`);
  rec.key_guard.note_jp = sents.join("。").replace(/。。/g, "。");
  applied++;
  log.push(`  ✓ generate_result.key_guard.note_jp: 腐敗記述 → 是正済み記述 (final のみ、key_guard_round1 不変)`);
}

// ── 書き込み ──────────────────────────────────────────────────────────────
wj(byYearFile, byYear);
wj(bankFile, bank);
wj(trFile, tr);
wj(grFile, gr);

console.log(log.join("\n"));
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-stemfix-S118-2018h30a-q028: applied ${applied}, skipped ${skipped}`);
console.log(`next: node scripts/build-quiz-corpus.mjs && node scripts/quiz-phase2-merge.mjs ${EXAM}`);
