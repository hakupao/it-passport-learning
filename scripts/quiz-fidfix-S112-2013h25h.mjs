#!/usr/bin/env node
// Stage 6 / Quiz — s7x DISPLAY-TEXT FIDELITY fixes, batch S112 (2013h25h).
//
// Provenance: two independent fidelity passes over the 10 s7x-resourced questions
//   pass 1 agentType general-purpose                 → 3 discrepant / 7 findings
//   pass 2 agentType pr-review-toolkit:code-reviewer → SAME 3 questions, (id,field) 7/7
//     一致 + pass2-only 1 件 (q061 表名の引用記号 “…”→「…」, cosmetic)
//   evidence: evidence/phase5/stage_06_quiz_fidelity/s7x_fidelity_S112_2013h25h{,_pass2}.json
//   主 context 裁決: page-05 / page-26 / page-44 を実読して全 7 件を確認 (S112 §1)。
//
// THE CRITICAL ONE — q009 (page-05), answer_affecting ×2:
//   源: 「固定費は年間3,000万円」「変動費が5,000円」
//   dataset: 3,990万円 / 5,999円 (0→9 の桁 OCR、2014h26h q069 と同じ系統)
//   源の値なら 30,000,000 ÷ (20,000−5,000) = 2,000 = 選択肢イ = stored key。
//   腐敗版では 39,900,000 ÷ 14,001 ≈ 2,850 でどの肢にも着地しない
//   「表示上 正解が存在しない」設問だった (S103 q036 / S109 q029 / S110 q069 型)。
//   correct_answer は触っていない — 是正で key との整合が回復する。
//
// LAYERING (S108/S110 precedent): stem_jp_clean は表示権威 (quizModel.ts)。clean を持つ
// q061/q096 は clean を直し、raw stem も同一語句が特定できるため併せて直す。q009 は clean
// を持たず raw stem_jp が表示されるので raw を直す。
//
// NOT fixed here (deliberate):
//   q061 表名の引用記号 — 源は “売上”“顧客” だが、corpus 全体で “…”表 は 0 件、
//     「…」表 が 5 件 (本 exam q055 含む)。表名鉤括弧は corpus 一律の表示規約であり
//     q061 固有の欠陥ではない (S110 q087 下線ギャップと同じ扱い、backlog 登記のみ)。
//   q061/q096 の raw stem 内の表 OCR 腐敗 (q061 H002=60/H006=K01,30、q096 表数値・
//     4月行欠落・E2 式) — clean 側の表は源と一致しており raw は非表示 (S107 q082 精神)。
//
// EDITORIAL RULE (same as quiz-fidfix-S109/S110): semantic content only; keep the
// dataset's existing punctuation/spacing conventions (源「，」→ dataset「、」のまま).
//
// Run: node scripts/quiz-fidfix-S112-2013h25h.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const E = "2013h25h";
const TR = path.join(ROOT, `data/ip/quiz/translations/${E}.json`);
const q = (n) => `${E}-q${String(n).padStart(3, "0")}`;

// layer: "raw" = question_bank stem_jp / "clean" = translations stem_jp_clean / "both"
const FIXES = [
  // ---- q009 (page-05) 損益分岐点。answer_affecting ×2。clean なし → raw が表示層。
  {
    id: q(9), layer: "raw",
    from: "必要な固定費は年間3,990万円である",
    to: "必要な固定費は年間3,000万円である",
    why: "answer_affecting: 源は 3,000万円 (0→9 桁 OCR)。是正で イ=2,000 が導出可能に",
  },
  {
    id: q(9), layer: "raw",
    from: "1個当たりの変動費が5,999円であるとき",
    to: "1個当たりの変動費が5,000円であるとき",
    why: "answer_affecting: 源は 5,000円 (0→9 桁 OCR)。上と合わせて損益分岐点計算が回復",
  },
  // ---- q061 (page-26) 関係データベース。semantic ×1。
  {
    id: q(61), layer: "both",
    from: "売上金額の合計を降順に整列する。得られた",
    to: "売上金額の合計を降順に整列した。得られた",
    why: "semantic: 源は過去形「整列した。」(操作済みの結果を問う体裁)。key イ 不変",
  },
  // ---- q096 (page-44) ワークシート。semantic ×4。
  {
    id: q(96), layer: "both",
    from: "月ごとに売上目標を設定して目標達成を管理するため",
    to: "月ごとに売上目標を定めて目標達成を管理するため",
    why: "semantic: 源は「定めて」",
  },
  {
    id: q(96), layer: "both",
    from: "次の図の各月の売上傾向から",
    to: "次の図のように、各月の売上傾向から",
    why: "semantic: 「のように，」脱落で図への係り受けが変質していた",
  },
  {
    id: q(96), layer: "both",
    from: "目標売上高を算出する次のワークシート",
    to: "目標売上高を計算する次のワークシート",
    why: "semantic: 源は「計算する」(本問は「計算式」を問う設問で語が呼応)",
  },
  {
    id: q(96), layer: "both",
    from: "セル F14 に入力する計算式は、適切なものはどれか。",
    to: "セル F14 に入力する計算式として、適切なものはどれか。",
    why: "semantic: 源は定型「として，適切なものはどれか」。「は」置換は二重ハの非文",
  },
];

const bank = JSON.parse(readFileSync(RB, "utf-8"));
const byId = new Map((bank.questions ?? bank).map((x) => [x.id, x]));
const trDoc = JSON.parse(readFileSync(TR, "utf-8"));

let rawEdits = 0, cleanEdits = 0;
for (const f of FIXES) {
  const applyRaw = f.layer === "raw" || f.layer === "both";
  const applyClean = f.layer === "clean" || f.layer === "both";

  if (applyRaw) {
    const rec = byId.get(f.id);
    if (!rec) throw new Error(`${f.id}: not in question_bank`);
    const n = rec.stem_jp.split(f.from).length - 1;
    if (n !== 1) throw new Error(`${f.id} raw: expected exactly 1 occurrence of «${f.from}», found ${n}`);
    rec.stem_jp = rec.stem_jp.replace(f.from, f.to);
    rawEdits++;
    console.log(`  ✓ ${f.id} [raw]   ${f.why}`);
  }
  if (applyClean) {
    const t = trDoc.questions[f.id];
    if (!t?.stem_jp_clean) throw new Error(`${f.id}: no stem_jp_clean`);
    const n = t.stem_jp_clean.split(f.from).length - 1;
    if (n !== 1) throw new Error(`${f.id} clean: expected exactly 1 occurrence of «${f.from}», found ${n}`);
    t.stem_jp_clean = t.stem_jp_clean.replace(f.from, f.to);
    cleanEdits++;
    console.log(`  ✓ ${f.id} [clean] ${f.why}`);
  }
}

writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
writeFileSync(TR, JSON.stringify(trDoc, null, 2) + "\n");
console.log(`✓ quiz-fidfix-S112-2013h25h: raw ${rawEdits} edits / clean ${cleanEdits} edits`);
console.log(`  next: node scripts/build-quiz-corpus.mjs && node scripts/quiz-fidfix-repair-prep.mjs ${E} <evidence>`);
