#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 SCALE batch S109b (D-137 / D-140) — drift-proof STEM + CHOICES
// OCR corruption fixes for 2014h26a (平成26 秋期), adjudicated by 主 context against the
// source pages (page-11 / 15 / 18 / 24 / 25 / 51). All key-invariant.
//
// q029 is ANSWER-AFFECTING: the source (page-11 問29) reads 「取得費用が1,000万円で」, but the
// dataset carries 「1, 906万円」. Taken literally the dataset yields ROI ≈ 47.7%, which matches
// NONE of ア90.0 / イ100.0 / ウ110.0 / エ120.0 — i.e. the displayed question had no correct
// answer at all. With the source value: 保守 = 10万/年 → 正味利益 100万/年 → 10年で1,000万 →
// 1,000 ÷ 1,000 × 100 = 100.0% = イ, restoring agreement with the stored key.
// The raw formula was also corrupted (「利益 + 投下資本 X 160」→「利益 ÷ 投下資本 × 100」);
// stem_jp_clean already had it right, so only the raw needed the repair.
//
// q100 (jp verdict FAIL): the source asks 「…作業短縮時間を求めると何時間になるか。」 but the
// dataset rewrote it to 「…求めるのに最も適切なものはどれか。」, which strips the unit that the
// bare numeric choices (29 / 44 / 56 / 152) depend on.
//   ⚠ The generator additionally claimed the source choices carry a 「時間」 suffix and asked for
//   that to be logged as settled fact. 主 context read page-51: the source choices are BARE
//   numbers, exactly as stored. That claim is rejected and no choice edit is made — the same
//   lesson as S101/S107: a generator's reconstruction is a hypothesis until the source confirms it.
//
// Run: node scripts/quiz-phase2-stemfix-S109b.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const E = "2014h26a";
const TR = path.join(ROOT, `data/ip/quiz/translations/${E}.json`);
const q = (n) => `${E}-q${String(n).padStart(3, "0")}`;

// target: "choice:<letter>" | "raw" | "clean" | "both"
const FIXES = [
  // ---- q029 (page-11) ANSWER-AFFECTING ------------------------------------------
  { id: q(29), target: "raw", from: "取得費用が1, 906万円で", to: "取得費用が1,000万円で", why: "**answer-affecting** OCR 1,000→1,906 (source page-11 実読)" },
  { id: q(29), target: "clean", from: "取得費用が1,906万円で", to: "取得費用が1,000万円で", why: "**answer-affecting** 同上 (表示権威)" },
  { id: q(29), target: "raw", from: "投下資本利益率 (%) = 利益 + 投下資本 X 160", to: "投下資本利益率 (%) = 利益 ÷ 投下資本 × 100", why: "式の OCR 腐敗 (clean は既正)" },
  // ---- q036 (page-15) ------------------------------------------------------------
  { id: q(36), target: "raw", from: "C . (Check)", to: "C (Check)", why: "余分な半角ピリオド" },
  { id: q(36), target: "choice:ウ", from: "乏働率", to: "稼働率", why: "字形 OCR (正解肢)" },
  // ---- q045 (page-18) 規格番号 ---------------------------------------------------
  { id: q(45), target: "choice:ア", from: "ISO 9091", to: "ISO 9001", why: "規格番号 OCR" },
  { id: q(45), target: "choice:イ", from: "ISO 149661", to: "ISO 14001", why: "規格番号 OCR" },
  // ---- q059 (page-24) ------------------------------------------------------------
  { id: q(59), target: "choice:イ", from: "メールア ドレス", to: "メールアドレス", why: "余分な空白" },
  { id: q(59), target: "choice:イ", from: "メールボッ クス", to: "メールボックス", why: "余分な空白" },
  { id: q(59), target: "choice:イ", from: "満林", to: "満杯", why: "字形 OCR" },
  // ---- q061 (page-25) ------------------------------------------------------------
  { id: q(61), target: "choice:ウ", from: "業界標準の鐘形", to: "業界標準の雛形", why: "字形 OCR (源はルビ付き「雛形」)" },
  // ---- q062 (page-25) ------------------------------------------------------------
  { id: q(62), target: "choice:ウ", from: "想定外の影響がの現れて", to: "想定外の影響が現れて", why: "衍字「の」" },
  // ---- q100 (page-51) 設問形式 ----------------------------------------------------
  { id: q(100), target: "raw", from: "作業短縮時間を求めるのに最も適切なものはどれか。", to: "作業短縮時間を求めると何時間になるか。", why: "設問形式の改変。裸数値の選択肢が依存する単位「何時間」が失われていた" },
  { id: q(100), target: "raw", from: "1日の申請処理件数は10回とする", to: "A社の1日の平均申請回数は10回とする", why: "源の文言に復元" },
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
console.log(`✓ quiz-phase2-stemfix-S109b: ${changed} field-edit(s) → run: node scripts/build-quiz-corpus.mjs`);
