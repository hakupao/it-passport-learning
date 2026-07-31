#!/usr/bin/env node
// Stage 6 / Quiz — s7x DISPLAY-TEXT FIDELITY fixes, batch S109 (2015h27h).
//
// Provenance of every fix below (Rule A/D):
//   pass 1  = quiz-s7x-fidelity.workflow (agentType general-purpose)      → 40 discrepancies
//   pass 2  = same workflow, agentType pr-review-toolkit:code-reviewer    → 39, independent
//             39/40 of pass 1 reproduced verbatim by pass 2; the single pass-1-only item
//             (q062 stem 「二つの集合AとB」) was confirmed by 主 context on page-24.
//   主 context source reads: q014 (page-06), q027 (page-11), q100 (page-46), q062 (page-24),
//             q086 (page-34) — all four agent readings confirmed exactly, including the
//             q027 ア cross-question bleed from 問26 and the q014 answer-affecting flip.
//   evidence: evidence/phase5/stage_06_quiz_fidelity/s7x_fidelity_S109_2015h27h{,_pass2}.json
//
// Why these are invisible to every existing gate: the Phase 2 key-guard, the in-pipeline
// reviewer and the Rule A critic all reason about the stem/choices AS GIVEN and never
// re-read the source page for non-figure questions. A choice rewritten into a different but
// still well-formed (sometimes still TRUE) statement therefore produces no signal anywhere.
//
// EDITORIAL RULE: change the semantic content only; keep the dataset's existing punctuation
// (、 vs ，) and spacing conventions, so the diff shows what actually differs from IPA rather
// than a wave of cosmetic churn. Bracket style (［x]) in q100 is likewise left as-is.
//
// correct_answer is never touched. q014 is answer-affecting only in the sense that the
// CORRUPTED text made distractor ウ true alongside key ア; restoring the source text makes
// ア uniquely correct again — the stored key ア was right all along.
//
// Run: node scripts/quiz-fidfix-S109.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const TR = path.join(ROOT, "data/ip/quiz/translations/2015h27h.json");
const E = "2015h27h";
const q = (n) => `${E}-q${String(n).padStart(3, "0")}`;

// target: "choice:<letter>" | "raw" | "clean" | "both"  (both = raw stem_jp AND stem_jp_clean)
const FIXES = [
  // ---- q004 (page-03) 正解肢ウ: 企業内SNS導入目的の核心語 ------------------------
  { id: q(4), target: "choice:ウ", from: "気軽に有益な人脈", to: "業務上有益な人脈", why: "正解肢: 気軽に→業務上" },
  // ---- q005 (page-03) CSF/モニタリングの誤答肢 -----------------------------------
  { id: q(5), target: "choice:イ", from: "経営計画における目標を達成", to: "経営計画で設定した目標を達成", why: "における→で設定した" },
  { id: q(5), target: "choice:ウ", from: "目標に対して順調に進行し", to: "目標に沿って遂行され", why: "順調に進行→沿って遂行" },
  // ---- q007 (page-04) 請負契約 --------------------------------------------------
  { id: q(7), target: "choice:ウ", from: "システム開発などで、委託者", to: "システム開発などに際して、委託者", why: "正解肢: などで→などに際して" },
  { id: q(7), target: "choice:エ", from: "汎用パッケージ導入の義務を受ける者が", to: "汎用パッケージ導入の委託を受けた者が", why: "義務を受ける→委託を受けた" },
  { id: q(7), target: "choice:エ", from: "自己の権限と責任によって", to: "自己の裁量と責任によって", why: "請負の要件語 権限→裁量" },
  // ---- q008 (page-04) 企画プロセス ----------------------------------------------
  { id: q(8), target: "choice:ウ", from: "システムの運用時の操作や環境などの評価基準を設定する。", to: "システムの応答時間や処理時間の評価基準を設定する。", why: "選択肢丸ごと別内容" },
  { id: q(8), target: "choice:エ", from: "仕様などの要件を文書化する。", to: "仕様などに関する要件を文書化する。", why: "「に関する」脱落" },
  // ---- q011 (page-05) 歩留り ----------------------------------------------------
  { id: q(11), target: "clean", from: "部品Yの歩留りが表のとおり", to: "部品Y，部品Zの歩留りが表のとおり", why: "「，部品Z」脱落 (表にZ=50%あり)" },
  { id: q(11), target: "both", from: "3個の部品Yと1個の部品Z", to: "3個の部品Y及び1個の部品Z", why: "と→及び" },
  { id: q(11), target: "both", from: "それぞれ原材料から製造", to: "それぞれの原材料から製造", why: "「の」脱落" },
  // ---- q014 (page-06) JIS: ANSWER-AFFECTING -------------------------------------
  { id: q(14), target: "choice:ウ", from: "国が定める標準を集めた規格", to: "民間団体が定めた標準を集めた規格", why: "**answer-affecting**: 腐敗版ウは真になり key ア と並立していた (主 context page-06 実読)" },
  // ---- q019 (page-08) SSL/SNS/SIS/SEO ------------------------------------------
  { id: q(19), target: "choice:ア", from: "個人情報を確保するために", to: "個人情報の安全を確保するために", why: "「の安全」脱落" },
  { id: q(19), target: "choice:ア", from: "インターネット上で情報を秘匿する仕組みのこと。", to: "インターネット上で情報を暗号化して送受信する仕組みである。", why: "暗号化送受信→秘匿 に丸められていた" },
  { id: q(19), target: "choice:イ", from: "インターネット上で提供することを目的とする", to: "インターネット上で実現することを目的とする", why: "提供→実現" },
  { id: q(19), target: "choice:ウ", from: "確保・維持するための経営情報システムのこと。", to: "確保・維持することを目的とした経営情報システムである。", why: "文末表現の改変" },
  { id: q(19), target: "choice:エ", from: "キーワード検索したとき、", to: "キーワード検索したときに、", why: "正解肢: 「に」脱落" },
  // ---- q022 (page-09) CSR --------------------------------------------------------
  { id: q(22), target: "both", from: "c 地域の砂漠化防止", to: "c 地球の砂漠化防止", why: "地球→地域 の一字置換 (両 pass が字形確認)" },
  // ---- q027 (page-11) シミュレーション -------------------------------------------
  { id: q(27), target: "choice:ア", from: "作業間の順序関係とともに解散する最短のプロジェクト期間を求める。", to: "作業間の順序関係から，最短のプロジェクト期間を求める。", why: "同ページ問26ア「問題解決とともに解散する組織」からの逐字混入 (主 context 実読で確認)" },
  { id: q(27), target: "choice:ウ", from: "年間販売実績と今後の商圏人口", to: "年間販売実績額と今後の商圏人口", why: "正解肢: 「額」脱落" },
  { id: q(27), target: "choice:エ", from: "平均故障寿命間隔と", to: "平均故障発生時間間隔と", why: "MTBF の原典表現" },
  { id: q(27), target: "choice:エ", from: "平均修理所要時間、修理回数や修理担当者数を", to: "平均修理所要時間、修理担当者数を", why: "源に無い「修理回数や」を除去" },
  { id: q(27), target: "choice:エ", from: "平均修理時間を求める。", to: "平均修理待ち時間を求める。", why: "「待ち」脱落" },
  // ---- q035 (page-14) 設問形式 ---------------------------------------------------
  { id: q(35), target: "both", from: "有効な作業はどれか。", to: "有効な作業として，適切なものはどれか。", why: "設問指示形式の脱落" },
  // ---- q036 (page-15) IT職種 -----------------------------------------------------
  { id: q(36), target: "choice:ウ", from: "データセンタなどの施設や設備を管理する。", to: "データセンタなどの施設を管理する。", why: "正解肢: 源に無い「や設備」を除去" },
  { id: q(36), target: "choice:ア", from: "人的資源を管理する。", to: "人的資源などを管理する。", why: "「など」脱落" },
  // ---- q037 (page-15) BCP --------------------------------------------------------
  { id: q(37), target: "choice:イ", from: "策定した内容を、要員に対する", to: "災害の発生を想定して、要員に対する", why: "文頭が別内容 (源: 災害の発生を想定して)" },
  // ---- q039 (page-16) システム監査 ------------------------------------------------
  { id: q(39), target: "choice:イ", from: "監査記録に基づいて評価", to: "監査証拠に基づいて評価", why: "正解肢: 監査記録→監査証拠" },
  { id: q(39), target: "choice:ア", from: "監査証拠が無い部分は", to: "監査証拠がない部分は", why: "無い→ない" },
  // ---- q062 (page-24) 集合: 源は X/Y の総称記法を使う ------------------------------
  { id: q(62), target: "both", from: "二つの集合A，Bについて", to: "二つの集合AとBについて", why: "A，B→AとB" },
  { id: q(62), target: "clean", from: "ここで，(A∩B)は，AとBの両方に属する部分集合（積集合），", to: "ここで，（X∩Y）は，XとYの両方に属する部分（積集合），", why: "Phase1 が源の総称記法 X/Y を A/B に正規化していた (源は X/Y、主 context page-24 実読)" },
  { id: q(62), target: "clean", from: "(A∪B)は，A又はBの少なくとも一方に属する部分集合（和集合）である。", to: "（X∪Y）は，X又はYの少なくとも一方に属する部分（和集合）を表す。", why: "同上 + 「部分集合」→「部分」・文末「である」→「を表す」" },
  { id: q(62), target: "raw", from: "(A∩B)は，XとYの両方に属する部分集合（積集合），", to: "（X∩Y）は，XとYの両方に属する部分（積集合），", why: "raw も (A∩B) 誤り + 「部分集合」→「部分」" },
  { id: q(62), target: "raw", from: "(A∪Y)は，X又はYの少なくとも一方に属する部分集合（和集合）である。", to: "（X∪Y）は，X又はYの少なくとも一方に属する部分（和集合）を表す。", why: "raw の (A∪Y) は源の (X∪Y)" },
  // ---- q081 (page-32) ISMS/継続的改善 ---------------------------------------------
  { id: q(81), target: "both", from: "一過性の活動より改善", to: "一過性の活動でなく改善", why: "より→でなく (意味が反転していた)" },
  // ---- q084 (page-33) インジェクション ---------------------------------------------
  { id: q(84), target: "choice:イ", from: "入力項目にDBの操作コマンド", to: "入力項目にOSの操作コマンド", why: "OS コマンドインジェクションが SQL 側にすり替わっていた" },
  // ---- q085 (page-34) 表参照順 -----------------------------------------------------
  { id: q(85), target: "both", from: "→は表を参照する順番を表す。", to: "→は表を参照する順番を示している。", why: "表す→示している" },
  // ---- q088 (page-35) 中問A --------------------------------------------------------
  { id: q(88), target: "choice:エ", from: "区画への入室の回数を、", to: "区画への社員の入室の回数を、", why: "「社員の」脱落" },
  // ---- q100 (page-46) 論理式 (bracket style は dataset 慣例を維持) -------------------
  { id: q(100), target: "choice:イ", from: "（［性能=1] or ［価格=1] and ［デザイン=0]）", to: "（［性能=0] or ［価格=1] or ［デザイン=0]）", why: "性能=1→0 かつ and→or (源: 全て or)" },
  { id: q(100), target: "choice:ウ", from: "（［性能=1] and ［価格=0] or ［デザイン=1]）", to: "（［性能=1] and ［価格=0] and ［デザイン=1]）", why: "or→and (源: 全て and)" },
  { id: q(100), target: "choice:エ", from: "（［性能=1] or ［価格=1] or ［デザイン=1]）", to: "（［性能=1] or ［価格=0] or ［デザイン=1]）", why: "価格=1→0" },
  { id: q(100), target: "clean", from: "件数表示（[価格=1]）を実行し", to: "件数表示（価格=1）を実行し", why: "源の手続(1)は角括弧なし" },
];

const bank = JSON.parse(readFileSync(RB, "utf-8"));
const questions = bank.questions ?? bank;
const byId = new Map(questions.map((x) => [x.id, x]));
const trDoc = JSON.parse(readFileSync(TR, "utf-8"));

let changed = 0;
let bankDirty = false;
let trDirty = false;

const applyOne = (label, getter, setter, f) => {
  const cur = getter();
  if (typeof cur !== "string") throw new Error(`${f.id} ${label}: field missing`);
  if (cur.includes(f.to) && !cur.includes(f.from)) {
    console.log(`  ~ ${f.id} ${label}: already fixed, skip`);
    return false;
  }
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
    if (!trEntry || typeof trEntry.stem_jp_clean !== "string") throw new Error(`${f.id}: stem_jp_clean missing (target ${f.target})`);
    if (applyOne("stem_jp_clean", () => trEntry.stem_jp_clean, (v) => { trEntry.stem_jp_clean = v; }, f)) { changed++; trDirty = true; }
  }
}

if (bankDirty) writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
if (trDirty) writeFileSync(TR, JSON.stringify(trDoc, null, 2) + "\n");
console.log(`✓ quiz-fidfix-S109: ${changed} field-edit(s) → run: node scripts/build-quiz-corpus.mjs`);
