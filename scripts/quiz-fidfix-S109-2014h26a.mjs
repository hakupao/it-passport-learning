#!/usr/bin/env node
// Stage 6 / Quiz — s7x DISPLAY-TEXT FIDELITY fixes, batch S109 (2014h26a).
//
// Provenance: two independent fidelity passes over the 24 s7x-resourced questions
//   pass 1 agentType general-purpose            → 10 discrepant / 16 findings
//   pass 2 agentType pr-review-toolkit:code-reviewer → same 10 questions reproduced
//   evidence: evidence/phase5/stage_06_quiz_fidelity/s7x_fidelity_S109_2014h26a{,_pass2}.json
//
// NOT fixed here (cannot be repaired by text — figure-linkage backlog):
//   q046 ア/イ/ウ/エ — the source choices are four DIAGRAMS (bar chart / flow chart / R-C
//     matrix / hierarchy chart). The dataset replaced them with generated labels
//     (「ガントチャート」…「組織図」). pass 2 rates ウ answer_affecting: the label names the
//     answer outright, so the "read the diagram and identify the RAM" task is destroyed.
//   q086 ア/イ/ウ/エ — the source choices are four cumulative-cost step graphs; the dataset
//     holds indistinguishable placeholders 「費用累計グラフ（ア）」…（エ）. As displayed the
//     question is unanswerable (answer_affecting).
//   q086 図1 (アローダイアグラム) reference sentence — absent from the delivered stem.
//   These belong to the 図/シナリオ再抽出 track, not to any text fix.
//
// EDITORIAL RULE (same as quiz-fidfix-S109): semantic content only; keep the dataset's
// existing punctuation/spacing conventions. correct_answer is never touched.
//
// Run: node scripts/quiz-fidfix-S109-2014h26a.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const E = "2014h26a";
const TR = path.join(ROOT, `data/ip/quiz/translations/${E}.json`);
const q = (n) => `${E}-q${String(n).padStart(3, "0")}`;

const FIXES = [
  // q009 (page-04) BtoC の助詞。両 pass が拡大で「で」を確認。
  { id: q(9), target: "choice:エ", from: "企業と消費者の行う取引", to: "企業と消費者で行う取引", why: "助詞 の→で" },
  // q024 (page-09) 委託先選定の手順
  { id: q(24), target: "both", from: "委託先の選定に至る手順", to: "委託先の選定に関する手順", why: "至る→関する (選定後の工程も含む設問)" },
  { id: q(24), target: "choice:ウ", from: "c→a→d→b", to: "c→a→b→d", why: "誤答肢の並び順 (源: c→a→b→d)" },
  // q051 (page-20) ワンタイムパスワード — 正解肢
  { id: q(51), target: "choice:ウ", from: "盗聴されたパスワード再利用による", to: "盗聴したパスワード利用による", why: "正解肢: 受動化 + 源に無い「再」の付加" },
  // q086 (page-34) 中問A 前文: 設定文と「前作業」の定義がまるごと要約に置換されていた
  {
    id: q(86), target: "clean",
    from: "Xソフトの開発に関する各作業を表1に示す。各作業は前作業が終了すればすぐに開始する。",
    to: "機械メーカのS社では，製品Xに組み込むソフトウェア（以下，Xソフトという）の開発作業A〜Hを表1のように計画した。ここで，前作業とは当該作業を開始する前に終了していなければならない作業のことであり，各作業は前作業が終了すればすぐに開始する。",
    why: "S社/製品X/「Xソフト」の定義/作業A〜H + 「前作業」の定義節が脱落していた (表1の前作業列を読むための唯一の定義)",
  },
  // q087 (page-36) 作業H 短縮の費用/日数。エ は源イの文言と重複していた。
  { id: q(87), target: "choice:イ", from: "費用を4追加することで，作業Hを1日間短縮できる。", to: "費用を2追加することで，作業Hを3日間短縮できる。", why: "数値2箇所 (源: 2追加/3日間)" },
  { id: q(87), target: "choice:エ", from: "費用を2追加することで，作業Hを3日間短縮できる。", to: "費用を3追加することで，作業Hを3日間短縮できる。", why: "追加費用 2→3 (源のイと重複していた)" },
  // q089 (page-38) 中問B
  { id: q(89), target: "both", from: "に設定するESSIDと", to: "に設定されているESSIDと", why: "設定する→設定されている (既設定の組合せを問う設問)" },
  // q090 (page-39) 源に無い前置き文 (導出値 2,400M バイトを与えてしまう) を除去
  { id: q(90), target: "clean", from: "Sさんが，2,400Mバイトの画像ファイルを旧PCから現PCに無線LAN経由で転送したい。旧PCに保管してある", to: "旧PCに保管してある", why: "源に無い一文の挿入。2,400M は 2M×2,000×0.6 の受験者導出値で、原文はこれを与えない" },
  // q091 (page-39) 誤答肢の数値 (両 pass がスラッシュ付きゼロを確認)
  { id: q(91), target: "choice:エ", from: "28", to: "20", why: "OCR 0→8 (源: 20)" },
  // q099 (page-50) 他動詞→自動詞
  { id: q(99), target: "both", from: "dに入る適切なもの", to: "dに入れる適切なもの", why: "「れ」脱落 入れる→入る" },
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
console.log(`✓ quiz-fidfix-S109-2014h26a: ${changed} field-edit(s) → run: node scripts/build-quiz-corpus.mjs`);
