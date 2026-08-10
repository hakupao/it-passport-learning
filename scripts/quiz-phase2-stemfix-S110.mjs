#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 — merge adjudication fixes, batch S110 (2014h26h).
//
// Provenance: generate `wf_6a2f5958-654` key-guard flagged 4 suspects (q091/q092/q093/q100).
// 主 context adjudicated by reading the IPA source pages directly (page-40 @2.7x, page-47 @2.7x)
// and re-deriving each answer independently.
//
// ══ THE 0→9 DIGIT-OCR CLUSTER ══
// This exam carries a systematic "0 misread as 9" corruption. Four separate stems are hit
// (q069 was already fixed in the s7x fidelity pass; q091 ×2, q092, q100 are fixed here):
//   q091  源「月間 400 台」「2,000 万円」   → dataset 499 台 / 2,090 万円
//   q092  源「1 台 10 万円」                → dataset 19 万円
//   q100  源「2,000 件」                    → dataset 2,900 件
// All three are answer-affecting; each restores agreement with the stored key except q100
// (see below). Independent re-derivations, from the corrected text:
//   q091  案A: 固定費 1,400 万円/月・変動費 6 万円/台 (表1, q089 リード文)
//         400P − (1,400 + 6×400) ≥ 2,000 → 400P ≥ 5,800 → P ≥ 14.5 万円 = 145,000 = イ ✓ key
//   q092  案B: 固定費 2,000 万円/月・変動費 5 万円/台
//         5N − 2,000 ≥ 2,000 → N ≥ 800。売上高 10×800 = 8,000 万円、
//         売上総利益 2,000 万円 → 率 = 2,000/8,000 = 25% = イ ✓ key
//   q100  顧客コードは 6 桁だが 6 桁目はチェックディジット (上位 5 桁から従属的に決まる)
//         ゆえ自由採番は 10^5 = 100,000 件。M = 5% = 5,000 件。M の 10% = 500 件は S にも
//         重複登録され移行しない。S = 2,000 件 → 移行 1,500 件。統合後 5,000 + 1,500
//         = 6,500 = **ア**
//
// ══ correct_answer CHANGE — the first one in the whole Phase 2 programme ══
// q100 の stored correct_answer は「イ」(7,000) だが、これは **誤登録**である。根拠 3 点:
//   (1) 公式解答 `data/ip/exams/answer_keys.json` の 2014h26h/100 = **ア**
//   (2) 源ページからの独立検算 = 6,500 = ア (上記)
//   (3) 四肢がちょうど 2×2 の罠マトリクスになっている:
//         ア 6,500  = チェックディジット考慮 ○ / 重複除外 ○  ← 唯一の正解
//         イ 7,000  = チェックディジット考慮 ○ / 重複除外 ✗  ← stored key はこれ
//         ウ 51,500 = チェックディジット考慮 ✗ / 重複除外 ○
//         エ 52,000 = チェックディジット考慮 ✗ / 重複除外 ✗
//       stored key「イ」は「重複を引き忘れた」典型的な誤答であり、設計上の罠そのもの。
// 生成された解説は源と公式解答の双方に一致する ア 前提で執筆済みなので、key を是正しないと
// 解説と stored key が自己矛盾したまま配信される。ユーザー承認のうえ是正する。
// ※ 本 corpus には他に 3 件の answer_keys ↔ questions.json 不一致があり
//   (2009h21a q12/q91, 2010h22a q91)、別スクリプトで同様に裁決・是正する。
//
// q093 は benign: key_guard matches_key=true、中問C の表1 が配信データに無い linkage-gap
// のみ (図/シナリオ再抽出 track)。テキスト是正なし。
//
// Run: node scripts/quiz-phase2-stemfix-S110.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const E = "2014h26h";
const TR = path.join(ROOT, `data/ip/quiz/translations/${E}.json`);
const q = (n) => `${E}-q${String(n).padStart(3, "0")}`;

// text replacements: target ∈ raw | clean | both | choice:X | tr.stem.zh | tr.stem.en
const FIXES = [
  // ---- q091 (page-40)
  { id: q(91), target: "raw", from: "月間 499 台製造", to: "月間 400 台製造", why: "answer-affecting: 製造台数 499→400 (OCR 0→9)" },
  { id: q(91), target: "raw", from: "売上総利益を 2, 090 万円", to: "売上総利益を 2, 000 万円", why: "answer-affecting: 目標売上総利益 2,090→2,000 (OCR 0→9)" },
  { id: q(91), target: "clean", from: "月間499台製造", to: "月間400台製造", why: "同上 (表示権威)" },
  { id: q(91), target: "clean", from: "売上総利益を2,090万円", to: "売上総利益を2,000万円", why: "同上 (表示権威)" },
  { id: q(91), target: "tr.stem.zh", from: "每月生产499台", to: "每月生产400台", why: "zh 追随" },
  { id: q(91), target: "tr.stem.zh", from: "销售毛利润达到2,090万日元", to: "销售毛利润达到2,000万日元", why: "zh 追随" },
  { id: q(91), target: "tr.stem.en", from: "When 499 units are manufactured", to: "When 400 units are manufactured", why: "en 追随" },
  { id: q(91), target: "tr.stem.en", from: "gross profit of 20,900,000 yen", to: "gross profit of 20,000,000 yen", why: "en 追随" },

  // ---- q092 (page-40)
  { id: q(92), target: "raw", from: "販売価格は, 1 台 19 万円", to: "販売価格は, 1 台 10 万円", why: "answer-affecting: 販売価格 19→10 万円 (OCR 0→9)" },
  { id: q(92), target: "clean", from: "販売価格は, 1台19万円", to: "販売価格は, 1台10万円", why: "同上 (表示権威)" },
  { id: q(92), target: "tr.stem.zh", from: "销售价格为每台19万日元", to: "销售价格为每台10万日元", why: "zh 追随" },
  { id: q(92), target: "tr.stem.en", from: "selling price of product H is 190,000 yen", to: "selling price of product H is 100,000 yen", why: "en 追随" },

  // ---- q100 (page-47)
  { id: q(100), target: "raw", from: "顧客テーブルには, 2,900件", to: "顧客テーブルには, 2,000件", why: "answer-affecting: ブランドS 登録件数 2,900→2,000 (OCR 0→9)" },
  { id: q(100), target: "tr.stem.zh", from: "客户表中登记了2,900件", to: "客户表中登记了2,000件", why: "zh 追随" },
  { id: q(100), target: "tr.stem.en", from: "table has 2,900 customer data records", to: "table has 2,000 customer data records", why: "en 追随" },
];

// correct_answer corrections (rare — see header). Asserted from → to so a re-run is a no-op.
const KEY_FIXES = [
  { id: q(100), from: "イ", to: "ア", why: "誤登録。公式 answer_keys.json = ア、源ページからの独立検算 = 6,500 = ア。stored「イ」は重複除外を怠った罠肢" },
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
  if (f.target.startsWith("tr.stem.")) {
    const lang = f.target.slice(8);
    if (!trEntry?.stem || typeof trEntry.stem[lang] !== "string") throw new Error(`${f.id}: tr.stem.${lang} missing`);
    if (applyOne(`tr.stem.${lang}`, () => trEntry.stem[lang], (v) => { trEntry.stem[lang] = v; }, f)) { changed++; trDirty = true; }
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

for (const k of KEY_FIXES) {
  const rec = byId.get(k.id);
  if (!rec) throw new Error(`${k.id}: not in question_bank.json`);
  if (rec.correct_answer === k.to) { console.log(`  ~ ${k.id} correct_answer: already ${k.to}, skip`); continue; }
  if (rec.correct_answer !== k.from) throw new Error(`${k.id} correct_answer: expected "${k.from}" but found "${rec.correct_answer}" — aborting`);
  rec.correct_answer = k.to;
  bankDirty = true; changed++;
  console.log(`  ★ ${k.id} correct_answer: ${k.from} → ${k.to} — ${k.why}`);
}

if (bankDirty) writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
if (trDirty) writeFileSync(TR, JSON.stringify(trDoc, null, 2) + "\n");
console.log(`✓ quiz-phase2-stemfix-S110: ${changed} edit(s) → run: node scripts/build-quiz-corpus.mjs`);
