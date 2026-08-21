#!/usr/bin/env node
// Stage 6 / Quiz — s7x DISPLAY-TEXT FIDELITY fixes, batch S112 (2012h24a).
//
// Provenance: two independent fidelity passes over the 14 s7x-resourced questions
//   pass 1 agentType general-purpose                 → 5 discrepant / 15 findings
//   pass 2 agentType pr-review-toolkit:code-reviewer → SAME 5 questions, (id,field)
//     全対 pass1 ⊇ pass2 で一致、pass1-only 1 件 (q010 イ 価値観念) は 主 context 実読で確認
//   evidence: evidence/phase5/stage_06_quiz_fidelity/s7x_fidelity_S112_2012h24a{,_pass2}.json
//   主 context 裁決: page-04 / 24 / 25 / 44 / 45 を実読して全 15 件を確認 (S112 §8)。
//
// Highlights:
//   q010 ウ (正解肢): 「企業の目的に適合した経営」→ dataset「企業活動に適合した経営」。
//     dataset 文も内容的に真なので既存ゲートに信号が出ない、本核験の狙いどおりの類。
//   q066 イ: 0.2 → 0.3 の数値置換 (2/3 字形 OCR)。0.2 も 0.3 も 2進で循環小数のため
//     正解エ(0.5) は不変 = semantic 止まり。
//   q096: stem 8 箇所 (変換→方法 / は・表現される→を・表現できる / 求めた→表現した+
//     「表現して」挿入 / 「必ず」「もし，」脱落 / 「1桁の」捏造 / ときの脱落+となり→で /
//     表現。→表す。 / つなげ→つなぎ)。
//   q098: 中問D 導入文「個人の顧客が」→「個人情報を顧客が」(主語のねじれ、B2C の意味が消失)。
//
// LAYERING: q010/q066 は clean なし → raw が表示層。q063/q096/q098 は clean が表示権威、
// raw も語句が特定できる場合は併修 (S110)。q096 raw は ASCII 引用符・(3) 後半欠落のため
// raw 側は存在する語句のみ是正。q098 の導入文は clean にしか無い → clean のみ。
//
// EDITORIAL RULE: semantic content only; keep each layer's existing punctuation/quote
// conventions (clean は「，」+「」、raw は「，」+ ASCII ")。
//
// Run: node scripts/quiz-fidfix-S112-2012h24a.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const E = "2012h24a";
const TR = path.join(ROOT, `data/ip/quiz/translations/${E}.json`);
const q = (n) => `${E}-q${String(n).padStart(3, "0")}`;

// ---- raw bank fixes (stem_jp / choices_jp) ----
const RAW_FIXES = [
  { id: q(10), field: "choice:イ", from: "共有する価値観念、思考・行動様式", to: "共有する価値観、思考・行動様式",
    why: "page-04: 源は「価値観」(衍字 OCR「念」)。pass1-only 発見を主 context 実読で確認" },
  { id: q(10), field: "choice:ウ", from: "企業活動に適合した経営が行われるように", to: "企業の目的に適合した経営が行われるように",
    why: "page-04: 源は「企業の目的に適合」。正解肢の semantic 置換 (dataset 文も真の類)" },
  { id: q(10), field: "choice:エ", from: "一市民として、その義務を負うべき", to: "一市民としての義務を負うべき",
    why: "page-04: 源は「としての義務」(「その」捏造)" },
  { id: q(63), field: "stem", from: "とユーザ ID 別カレントディレクトリは次のとおり", to: "とユーザ ID 別のカレントディレクトリは次のとおり",
    why: "page-24: 本文は「別の」(見出し〔ユーザ ID 別カレントディレクトリ〕は源も「の」なしで不動)" },
  { id: q(66), field: "choice:イ", from: "0.3", to: "0.2",
    why: "page-25: 源は 0.2 (2/3 字形 OCR)。ア0.1/ウ0.4/エ0.5 は一致、正解エ不変" },
  { id: q(96), field: "stem", from: "目的とする方法である。", to: "目的とする変換である。",
    why: "page-44: 源「変換である」" },
  { id: q(96), field: "stem", from: "図2に示す画像データを，何ビットで表現できるか。", to: "図2に示す画像データは，何ビットで表現されるか。",
    why: "page-44: 源は「は」+「表現されるか」" },
  { id: q(96), field: "stem", from: "(2)で表現した形式の値をつなげて表現していく。", to: "(2)で求めた形式の値をつなげていく。",
    why: "page-44: 源「求めた」/「表現して」は捏造" },
  { id: q(96), field: "stem", from: '区切りは1桁の"0"で表現', to: '区切りは"0"で表現',
    why: "page-44: 「1桁の」は源に無い追加" },
  { id: q(96), field: "stem", from: '2進数で表現した値 n は"10100"で，', to: '2進数で表現したときの値 n は"10100"となり，',
    why: "page-44: 源「表現したときの値」「となり，」" },
  { id: q(96), field: "stem", from: "連続する1で表す。なお，", to: "連続する1で表現。なお，",
    why: "page-44: 源は体言止め「表現。」" },
  { id: q(96), field: "stem", from: "n をつなぎ，結果は", to: "n をつなげ，結果は",
    why: "page-44: 源「つなげ，」" },
];

// ---- translations stem_jp_clean fixes ----
const CLEAN_FIXES = [
  { id: q(63), from: "とユーザ ID 別カレントディレクトリは次のとおり", to: "とユーザ ID 別のカレントディレクトリは次のとおり" },
  { id: q(96), from: "目的とする方法である。", to: "目的とする変換である。" },
  { id: q(96), from: "図2に示す画像データを，何ビットで表現できるか。", to: "図2に示す画像データは，何ビットで表現されるか。" },
  { id: q(96), from: "(2)で表現した形式の値をつなげて表現していく。", to: "(2)で求めた形式の値をつなげていく。" },
  { id: q(96), from: "画像データは白から始まるものとし，画像データが黒から始まる場合は，", to: "画像データは必ず白から始まるものとし，もし，画像データが黒から始まる場合は，" },
  { id: q(96), from: "区切りは1桁の「0」で表現", to: "区切りは「0」で表現" },
  { id: q(96), from: "2進数で表現した値 n は「10100」で，", to: "2進数で表現したときの値 n は「10100」となり，" },
  { id: q(96), from: "連続する1で表す。", to: "連続する1で表現。" },
  { id: q(96), from: "n をつなぎ，結果は", to: "n をつなげ，結果は" },
  { id: q(98), from: "個人情報を顧客がインターネット上", to: "個人の顧客がインターネット上" },
];

const bank = JSON.parse(readFileSync(RB, "utf-8"));
const byId = new Map((bank.questions ?? bank).map((x) => [x.id, x]));
const trDoc = JSON.parse(readFileSync(TR, "utf-8"));

let rawEdits = 0;
for (const f of RAW_FIXES) {
  const rec = byId.get(f.id);
  if (!rec) throw new Error(`${f.id}: not in question_bank`);
  const isChoice = f.field.startsWith("choice:");
  const letter = isChoice ? f.field.split(":")[1] : null;
  const cur = isChoice ? rec.choices_jp[letter] : rec.stem_jp;
  const n = cur.split(f.from).length - 1;
  if (n !== 1) throw new Error(`${f.id} ${f.field}: expected exactly 1 occurrence of «${f.from}», found ${n}`);
  const next = cur.replace(f.from, f.to);
  if (isChoice) rec.choices_jp[letter] = next;
  else rec.stem_jp = next;
  rawEdits++;
  console.log(`  ✓ ${f.id} [raw ${f.field}] ${f.why}`);
}

let cleanEdits = 0;
for (const f of CLEAN_FIXES) {
  const t = trDoc.questions[f.id];
  if (!t?.stem_jp_clean) throw new Error(`${f.id}: no stem_jp_clean`);
  const n = t.stem_jp_clean.split(f.from).length - 1;
  if (n !== 1) throw new Error(`${f.id} clean: expected exactly 1 occurrence of «${f.from}», found ${n}`);
  t.stem_jp_clean = t.stem_jp_clean.replace(f.from, f.to);
  cleanEdits++;
  console.log(`  ✓ ${f.id} [clean] «${f.from.slice(0, 24)}…»`);
}

writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
writeFileSync(TR, JSON.stringify(trDoc, null, 2) + "\n");
console.log(`✓ quiz-fidfix-S112-2012h24a: raw ${rawEdits} edits / clean ${cleanEdits} edits`);
console.log(`  next: node scripts/build-quiz-corpus.mjs && node scripts/quiz-fidfix-repair-prep.mjs ${E} <evidence>`);
