#!/usr/bin/env node
// Stage 6 / Quiz — trsweep 再訳の適用 (S115)。
//
// `quiz-phase2-trsweep-apply.mjs` の安全弁 (核験が PASS 以外なら書かない) が 3 件とも作動したため、
// 核験の指摘を 2 ラウンドかけて反映した是正版を、本スクリプトで適用する。
//
// ══ 経緯 (Rule D の 4 段) ══
//   writer   = general-purpose               (再訳の起草)
//   auditor  = pr-review-toolkit:code-reviewer (JP↔訳文の保真監査)
//   verify 1 = feature-dev:code-reviewer      → 3 件とも CONCERNS (terminology_correct=false)
//   verify 2 = oh-my-claudecode:code-reviewer → R1: CONCERNS 2 / FAIL 1、R2: PASS 1 / CONCERNS 2
//
// R1 で **主 context の置換適用順序のバグ**が捕捉された:
//   2009h21h-q049 で「结合测试（集成测试）→集成测试（结合测试）」の後に「结合测试→集成测试」を
//   走らせたため括弧内まで潰れ「集成测试（集成测试）」という同語反復になっていた。
//   → 教訓: 括弧内をガードするか、置換順序を「裸語 → 主従逆転」にする。
//
// R2 の必須指摘をすべて反映済み。核験は「反映後は再核験不要 (局所的な語句差し替えで
// 周辺構文への影響なし)」と明記している。2009h21h-q061 は R2 で **PASS**。
//
// ══ Rule B ══
// 上書き前の disk 版を failures/ ではなく **evidence/ の before スナップショット**として退避する
// (これは失敗 attempt ではなく「置き換えられた版」なので、Rule B の失敗アーカイブとは別枠)。
// 核験が CONCERNS を出した中間版 (R1 の是正版) は failures/ に残す。
//
// Run: node scripts/quiz-trsweep-apply-S115.mjs   (then: merge → verify-result)

import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P2 = path.join(ROOT, "data/ip/quiz/.phase2");
const EV = path.join(ROOT, "evidence/phase5/stage_06_quiz_fidelity/trsweep_S115_before");

const IDS = ["2010h22a-q007", "2009h21h-q049", "2009h21h-q061"];
const SHAPE = { top: "correct,distractors,id,points", points: "en,zh", distractors: "en,letter,zh" };

mkdirSync(EV, { recursive: true });
let n = 0;
for (const id of IDS) {
  const src = path.join(P2, `retr_fixed_${id}.json`);
  const dst = path.join(P2, `expl_tr_${id}.json`);
  if (!existsSync(src)) throw new Error(`${id}: 是正版 ${src} が無い`);
  if (!existsSync(dst)) throw new Error(`${id}: 適用先 ${dst} が無い`);

  const doc = JSON.parse(readFileSync(src, "utf-8"));
  // スキーマ assert (disk の expl_tr と同形であること)
  const top = Object.keys(doc).sort().join(",");
  const pk = [...new Set(doc.points.flatMap((p) => Object.keys(p)))].sort().join(",");
  const dk = [...new Set(doc.distractors.flatMap((x) => Object.keys(x)))].sort().join(",");
  if (top !== SHAPE.top) throw new Error(`${id}: top keys {${top}} ≠ {${SHAPE.top}}`);
  if (pk !== SHAPE.points) throw new Error(`${id}: points keys {${pk}} ≠ {${SHAPE.points}}`);
  if (dk !== SHAPE.distractors) throw new Error(`${id}: distractors keys {${dk}} ≠ {${SHAPE.distractors}}`);
  if (doc.id !== id) throw new Error(`${id}: doc.id=${doc.id} 不一致`);

  // JP 源との件数照合 (merge と同じ不変条件を適用前に確認)
  const jp = JSON.parse(readFileSync(path.join(P2, `expl_jp_${id}.json`), "utf-8"));
  if (doc.points.length !== jp.points_jp.length) throw new Error(`${id}: points ${doc.points.length} ≠ jp ${jp.points_jp.length}`);
  const jpLetters = jp.distractors_jp.map((x) => x.letter).sort().join("");
  const trLetters = doc.distractors.map((x) => x.letter).sort().join("");
  if (jpLetters !== trLetters) throw new Error(`${id}: distractors 字母 ${trLetters} ≠ jp ${jpLetters}`);
  for (const f of [doc.correct.zh, doc.correct.en, ...doc.points.flatMap((p) => [p.zh, p.en]), ...doc.distractors.flatMap((x) => [x.zh, x.en])]) {
    if (typeof f !== "string" || !f.trim()) throw new Error(`${id}: 空フィールドがある`);
  }

  copyFileSync(dst, path.join(EV, `expl_tr_${id}.BEFORE.json`));
  writeFileSync(dst, JSON.stringify(doc, null, 2) + "\n");
  n++;
  console.log(`  ✓ ${id}: 是正版を適用 (before を evidence/.../trsweep_S115_before/ へ退避)`);
}
console.log(`✓ quiz-trsweep-apply-S115: ${n} 件適用`);
console.log(`  next: node scripts/quiz-phase2-merge.mjs <exam> → verify-result`);
