#!/usr/bin/env node
// Stage 6 / Quiz — S116b: `key_guard.note_jp` 起点の掛け直しで捕らえた 2009h21a の欠陥是正。
//
// ══ 経緯 (常設順序 ④⑤) ══
// s7x 保真核験は本回 **30/30 CLEAN・差分 0** だったが、それは `*_resourced_s7x` の 30 問だけの話。
// generate 後に `key_guard.note_jp` を全 100 問走査すると、**未是正の表示層欠陥が 10 問**出た。
// **s7x の射程外にある問の選択肢腐敗は、note スキャンだけが捕らえる**という射程の限界の実例。
//
// その 10 問を s7x 保真核験 workflow に掛け直した (双 pass, Rule D):
//   `wf_baff2a88-b58` (general-purpose) / `wf_884f5a9f-32a` (pr-review-toolkit:code-reviewer)
//   → **両 pass とも CLEAN 1 / DISCREPANT 9・差分 17 件で一致**、**正解肢上 4 件**、
//     answer_affecting 0、UNREADABLE 0。
//
// ══ 欠陥の 2 系統 ══
// (A) **字形の置換 (semantic)** — いずれも日本語として成立しない非語になっていた:
//     q006 ウ 設罰→設置 / q063 イ デークタ→データ / q078 ア 硬故障性→耐故障性 /
//     q078 イ 科体→筐体 / q085 エ 披認証者→被認証者
//     **q078 ア は正解肢**で、RAID の主目的である「耐故障性」という語そのものが壊れていた。
// (B) **右余白のスキャン汚れを OCR が文字と誤認した幻字 (cosmetic)** — 7 問 9 箇所。
//     「「」「」」「-」「ーー」が末尾に付着。q085 エ は**ページ下部のノンブル「− 30 −」まで
//     選択肢に流れ込んで**いた (S114 §8b / S115 の 2009h21h-q084 と同型)。
//
// **本回は幻字が 7 問に及び、Phase 2 で最も密度が高い**。2009 年度秋のスキャン品質に起因する
// 系統的なもので、個別の OCR ミスではない。
//
// zh/en への波及: 全件とも訳文は既に正しい (翻訳者が腐敗を暗黙に補正) ため tr 修正なし。
//
// Run: node scripts/quiz-fidfix-S116b-caveat.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const q = (n) => `2009h21a-q${String(n).padStart(3, "0")}`;

const FIXES = [
  // ── (A) 字形の置換 (semantic)
  [q(6), "ウ", "設罰したサーバ", "設置したサーバ", "semantic (双 pass 一致): 源「設置した」→「設罰した」= 非語。肢エの「設置し運用する」と対になる語"],
  [q(63), "イ", "デークタ更新の際に", "データ更新の際に", "semantic (双 pass 一致・**正解肢**): 源「データ更新」→「デークタ更新」= タ と ク が入れ替わった非語"],
  [q(78), "ア", "高速性や硬故障性を高める。", "高速性や耐故障性を高める。", "semantic (双 pass 一致・**正解肢**): 源「耐故障性」→「硬故障性」= 非語。**RAID の主目的である耐障害性の語そのものが壊れていた**"],
  [q(78), "イ", "小容量の科体に収納し", "小容量の筐体に収納し", "semantic (双 pass 一致): 源「筐体」(ルビ「きょう」付き)→「科体」= 別字・非語"],
  [q(85), "エ", "披認証者のディジタル署名", "被認証者のディジタル署名", "semantic (双 pass 一致): 源「被認証者」(肢ウと同語)→「披認証者」= 非語"],

  // ── (B) 幻字・ノンブル混入 (cosmetic)
  [q(6), "イ", "保守業務を行うサービス         -", "保守業務を行うサービス", "cosmetic (双 pass 一致): 末尾に源に無いハイフン様の記号"],
  [q(6), "ウ", "貸し出すサービス              「     「", "貸し出すサービス", "cosmetic (双 pass 一致): 末尾に源に無い鉤括弧 2 個"],
  [q(6), "エ", "設置し運用 。するサービス", "設置し運用するサービス", "cosmetic (双 pass 一致・**正解肢**): 源は改行位置で「設置し運用」/「するサービス」。dataset は間に句点が混入し文が途中で切れて見えた"],
  [q(32), "エ", "ソフトウェア方式設計         ーー", "ソフトウェア方式設計", "cosmetic (双 pass 一致): 末尾に源に無い長音記号 2 個"],
  [q(53), "エ", "記録する。         「「", "記録する。", "cosmetic (双 pass 一致): 末尾に源に無い鉤括弧 2 個"],
  [q(58), "ア", "クッキー   「", "クッキー", "cosmetic (双 pass 一致): 末尾に源に無い鉤括弧"],
  [q(58), "イ", "スパイウェア            「", "スパイウェア", "cosmetic (双 pass 一致): 末尾に源に無い鉤括弧"],
  [q(63), "イ", "しないようにする。   「", "しないようにする。", "cosmetic (双 pass 一致・**正解肢**): 末尾に源に無い鉤括弧"],
  [q(70), "エ", "400   」", "400", "cosmetic (双 pass 一致): 末尾に源に無い閉じ鉤括弧"],
  [q(78), "イ", "設置スペースを小さくする。     「", "設置スペースを小さくする。", "cosmetic (双 pass 一致): 末尾に源に無い鉤括弧"],
  [q(85), "エ", "安全に送付する。ー 30 一   「             _", "安全に送付する。", "cosmetic (双 pass 一致): **ページ下部のノンブル「− 30 −」が選択肢に流れ込んで**いた + 幻字"],
  [q(96), "エ", "4      ーー", "4", "cosmetic (双 pass 一致): 末尾に源に無い長音記号 2 個"],
];

const bank = JSON.parse(readFileSync(RB, "utf-8"));
const byId = new Map((bank.questions ?? bank).map((x) => [x.id, x]));
let n = 0;
for (const [id, L, from, to, why] of FIXES) {
  const rec = byId.get(id);
  if (!rec) throw new Error(`${id}: not in question_bank`);
  const cur = rec.choices_jp[L];
  if (!cur.includes(from)) {
    if (cur.includes(to)) { console.log(`  = ${id}.${L}: 既に是正済`); continue; }
    throw new Error(`${id}.${L}: «${from}» が見つからない\n  actual: ${JSON.stringify(cur)}`);
  }
  const c = cur.split(from).length - 1;
  if (c !== 1) throw new Error(`${id}.${L}: «${from}» occurs ${c} times`);
  rec.choices_jp[L] = cur.replace(from, to);
  n++;
  console.log(`  ✓ ${id} [choice ${L}] ${why}`);
}
writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
console.log(`✓ quiz-fidfix-S116b-caveat: choice ${n}`);
