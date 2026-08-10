#!/usr/bin/env node
// Stage 6 / Quiz — s7x DISPLAY-TEXT FIDELITY fixes, batch S110 (2014h26h).
//
// Provenance: two independent fidelity passes over the 18 s7x-resourced questions
//   pass 1 agentType general-purpose                 → 8 discrepant / 23 findings
//   pass 2 agentType pr-review-toolkit:code-reviewer → SAME 8 questions, and every
//     (id, field) pair matched 14/14 (only finding granularity differed)
//   evidence: evidence/phase5/stage_06_quiz_fidelity/s7x_fidelity_S110_2014h26h{,_pass2}.json
//   主 context 裁決: page-15 / 28 / 31 / 36 / 43 / 46 を 2.6〜3.0x で実読 (S110 §1)。
//
// THE CRITICAL ONE — q069 (page-28), the only answer_affecting cluster:
//   源: 「60,000 時間運用した」「60,000 時間目であった」「MTTR を 60 時間とすると」
//   dataset: 66,000 / 69,000 / 69 (0→6 と 0→9 の二種の桁 OCR)
//   源の値なら 60,000 − 100×60 = 54,000、54,000/100 = 540 = 選択肢イ = stored key。
//   腐敗版では 591 (66,000 基準) / 621 (69,000 基準) でア480・イ540・ウ599.4・エ600 の
//   どれにも着地せず、「表示上 正解が存在しない」設問になっていた (S103 q036 / S109 q029 型)。
//   correct_answer は触っていない — 是正で key との整合が回復する。
//
// LAYERING (S108 precedent): stem_jp_clean は表示権威 (quizModel.ts)。clean を持つ問は
// clean を直し、raw stem も語句が特定できる場合は併せて直す (q096/q099)。choices_jp は
// raw bank が唯一の表示元なので bank を直す。correct_answer は never touched.
//
// NOT fixed here (deliberate — 別 track):
//   q087 stem 「適切でないもの」の下線 — 源には下線があるが、本 corpus は下線表現を一切
//     持たない (questions.json の <u> 出現数 0)。q087 固有の欠陥ではなく全 corpus の
//     表現規約ギャップなので backlog へ。
//   q097 stem 図1→表への線形化 (Phase 1.5 が意図的に生成、内容は図に忠実) と、
//     注記第4行「（　）内の数値は各作業に要する時間を表す。」の脱落 — 線形化で（　）表記
//     自体が消えているため、この一文を復元すると存在しない記法を指すことになる。
//   q097 中問D 前文 (P社シナリオ段落) の非添付 — 図/シナリオ再抽出 track (2015h27a と同根)。
//
// EDITORIAL RULE (same as quiz-fidfix-S109): semantic content only; keep the dataset's
// existing punctuation/spacing conventions.
//
// Run: node scripts/quiz-fidfix-S110-2014h26h.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const E = "2014h26h";
const TR = path.join(ROOT, `data/ip/quiz/translations/${E}.json`);
const q = (n) => `${E}-q${String(n).padStart(3, "0")}`;

const FIXES = [
  // ---- q042 (page-15) WBS 要素分解。正解肢アと誤答肢イの両方が置換されていた。
  {
    id: q(42), target: "choice:ア",
    from: "それらが管理できるレベルで要素分解することが望ましい。",
    to: "それらが管理できるレベルまで要素分解をすることが望ましい。",
    why: "正解肢: 「レベルまで」→「レベルで」の助詞置換 + 「要素分解を」の「を」脱落",
  },
  {
    id: q(42), target: "choice:イ",
    from: "システム開発を要素分解する場合は，成果物を発注先が作成するか自社で作成するかで成果物の要素分解を全て発注先に一任する。",
    to: "システム開発を外部に発注する場合は，成果物を発注先が作成するので成果物の要素分解を全て発注先に一任する。",
    why: "誤答肢の前提が丸ごと別語句に (外部に発注する→要素分解する / 作成するので→作成するか自社で作成するかで)",
  },

  // ---- q069 (page-28) MTBF。**answer-affecting ×3**。
  { id: q(69), target: "raw", from: "してから66,000時間運用した", to: "してから60,000時間運用した", why: "answer-affecting: 総運用時間 66,000→60,000 (OCR 0→6)" },
  { id: q(69), target: "raw", from: "完了した時点が69,000時間目", to: "完了した時点が60,000時間目", why: "answer-affecting: 最終修復完了時点 69,000→60,000 (OCR 0→9)" },
  { id: q(69), target: "raw", from: "MTTRを69時間とすると", to: "MTTRを60時間とすると", why: "answer-affecting: MTTR 69→60。是正後 (60,000−100×60)/100 = 540 = key イ" },

  // ---- q081 (page-31) 無線LAN。ア/イ/ウ が別文に置換 (イ は正解肢)。
  { id: q(81), target: "choice:ア", from: "1台のPCしか使用することができない。", to: "PC以外では使用することができない。", why: "誤答肢: 否定対象が「対応機器の種類」→「接続台数」に変わっていた" },
  { id: q(81), target: "choice:イ", from: "1対1から通信できる動作モードがある。", to: "1対1でなら通信できる動作モードがある。", why: "正解肢: 限定の「でなら」→起点の「から」" },
  { id: q(81), target: "choice:ウ", from: "暗号化の規格は1種類しかない。", to: "暗号化の規格は1種類に統一されている。", why: "誤答肢: 述語置換 (統一されている→しかない)" },

  // ---- q087 (page-36) 図2 の網掛け帯。dataset は P1/P2 を 6 コマで打ち切っており、
  //      同じ表の最終行 (時間帯C=P1+P2+P3 / 時間帯D=P2+P3+P4) と矛盾していた。
  {
    id: q(87), target: "clean",
    from: "| 勤務パターン1 | P1 | P1 | P1 | P1 | P1 | P1 | | | | | | |",
    to: "| 勤務パターン1 | P1 | P1 | P1 | P1 | P1 | P1 | P1 | P1 | P1 | | | |",
    why: "図2: パターン1 の網掛けは源では 9〜17 の 9 コマ (dataset は 9〜14 の 6 コマで時間帯C が欠落)",
  },
  {
    id: q(87), target: "clean",
    from: "| 勤務パターン2 | | | | P2 | P2 | P2 | P2 | P2 | P2 | | | |",
    to: "| 勤務パターン2 | | | | P2 | P2 | P2 | P2 | P2 | P2 | P2 | P2 | P2 |",
    why: "図2: パターン2 の網掛けは源では 12〜20 の 9 コマ (dataset は 12〜17 で時間帯D が欠落)",
  },
  { id: q(87), target: "clean", from: "注 P1～P4は勤務パターン", to: "注記 P1～P4は勤務パターン", why: "注記ラベル 注→注記 (図2)" },
  { id: q(87), target: "clean", from: "注 Q1～Q4は時間帯別", to: "注記 Q1～Q4は時間帯別", why: "注記ラベル 注→注記 (表1)" },

  // ---- q088 (page-37) 源は長音符なしの「特売コーナ」(IPA/JIS 外来語表記)。
  { id: q(88), target: "clean", from: "M社で計画している特売コーナーでは、", to: "M社で計画している特売コーナでは、", why: "長音符の付加 コーナ→コーナー (1 箇所目)" },
  { id: q(88), target: "clean", from: "　特売コーナーで紹介した商品は、", to: "　特売コーナで紹介した商品は、", why: "長音符の付加 コーナ→コーナー (2 箇所目)" },

  // ---- q096 (page-43) 稟議システム。**S109 q062 と同クラス** — 上位概念への言い換えで
  //      日本語として自然かつ内容的にも真になるため、既存のどのゲートにも信号が出ない。
  { id: q(96), target: "raw", from: "東議シンステムによって", to: "稟議システムによって", why: "raw stem の字形 OCR (東議シンステム)" },
  { id: q(96), target: "clean", from: "ワークフローシステムによって", to: "稟議システムによって", why: "表示 stem が上位概念に言い換えられていた (源: 稟議システム、前問 q095 も稟議で統一)" },
  { id: q(96), target: "choice:ア", from: "申請，同意，承認が実施された日時", to: "申請，同意，差戻し，承認が実施された日時", why: "誤答肢の列挙から「差戻し，」が脱落 (エ の差戻し回数との対応手掛かり)" },
  { id: q(96), target: "choice:イ", from: "申請から承認まで掛かった時間", to: "申請から承認までに掛かった時間", why: "助詞「に」の脱落" },

  // ---- q099 (page-46) 中問D。
  { id: q(99), target: "both", from: "移行プロジェクトで作成した図に示す", to: "移行プロジェクトで作成した図1に示す", why: "参照名から図番号「1」が脱落 (中問D には図1・表1・表2 が併存)" },
  { id: q(99), target: "choice:ウ", from: "b: 対策案2 ／ c: 対策案4", to: "b: 対策案2 ／ c: 対策案3", why: "誤答肢ウ の c が源と別 (源: 対策案3)。key イ=対策案1+4 は不変" },
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
console.log(`✓ quiz-fidfix-S110-2014h26h: ${changed} field-edit(s) → run: node scripts/build-quiz-corpus.mjs`);
