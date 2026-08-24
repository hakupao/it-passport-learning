#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 — explfix3 S113 (2011h23a): 独立再核験が捕捉した「是正の取り残し」。
//
// 出所: explfix2 のパッチを別 subagent_type (feature-dev:code-reviewer) が図・ファイル実読で
// 再核験 → **判定 CONCERNS。2 件の残件はいずれも explfix2 自身が作った同型の連鎖断裂**。
// Rule D (writer ≠ reviewer) が機能した実例。
//
// (A) q099 — 解説本体は (1)(2)(3) に揃えたが、**translations の stem.zh / stem.en が
//     ①～③ のまま**だった。stem_jp_clean と choices と解説だけ直して訳文 stem を忘れる、
//     という **S112 q004 の教訓の 3 例目**。zh/en 学習者には「①～③ を並べよ」と表示され
//     ながら選択肢が (1)(2)(3) になる。
//
// (B) q069 — explfix2 は correct.en だけを源ラベルへ戻したが、
//     ① distractors.イ/エ.en が「grade A / grades B, C and F」のまま (同一文に列記号
//        B/C が登場し、まさに避けたかった衝突が残存)
//     ② **en の設問 stem 表が A/B/C/F のまま** (zh 表は 优/良/可/不可)
//     → correct.en だけ源ラベルにしたせいで「解説が語るラベルが表のどこにも無い」状態に
//        なり、**部分是正が無是正より悪化させた**。
//     方針: en 表は人名・科目名を英訳している (山田太郎→Taro Yamada、国語→Japanese) ので、
//     成績も**意味で英訳** = Excellent / Good / Pass / Fail に統一する。A/B/C/F は
//     成績体系の置換であり列記号とも衝突するため不採用。CJK をそのまま残す案も、
//     表内の他要素が全て英訳済みである以上一貫しない。correct.en も同じ語に揃え直す。
//
// (C) q092 key_guard note の盤面記述 (非表示の内部メタ) が不完全で、字面どおりの盤面では
//     圧縮文字数が 83 にしかならず記載の 93/76 を再現できない → 次の検証者を誤らせるため補完。
//     generate_result を直して再 merge する (sidecar 直編集では再 merge で戻るため)。
//
// Run: node scripts/quiz-phase2-explfix3-S113-2011h23a.mjs
//      (then: node scripts/quiz-phase2-merge.mjs 2011h23a && build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P2 = (f) => path.join(ROOT, "data/ip/quiz/.phase2", f);
const E = "2011h23a";
const TR = path.join(ROOT, `data/ip/quiz/translations/${E}.json`);
let edits = 0;

const replaceOnce = (s, from, to, where) => {
  const n = s.split(from).length - 1;
  if (n !== 1) throw new Error(`${where}: expected 1 occurrence of «${from}», found ${n}`);
  return s.replace(from, to);
};

const trDoc = JSON.parse(readFileSync(TR, "utf-8"));

// ---------- (A) q099 stem zh/en 番号体系 ----------
{
  const s = trDoc.questions[`${E}-q099`].stem;
  s.zh = replaceOnce(s.zh, "描述 ①～③ 时", "描述 (1)～(3) 时", "q099 stem.zh");
  s.en = replaceOnce(s.en, "When describing ① through ③ in the project plan",
    "When describing (1) through (3) in the project plan", "q099 stem.en");
  if (/[①②③]/.test(s.zh + s.en)) throw new Error("q099: ①②③ remain in stem tr");
  console.log("  ✓ q099 stem.zh / stem.en の ①～③ → (1)～(3) (残件 A)");
  edits += 2;
}

// ---------- (B) q069 en 成績ラベルを Excellent/Good/Pass/Fail に統一 ----------
{
  // (B-2) 設問 stem 表 (en)
  const s = trDoc.questions[`${E}-q069`].stem;
  const TABLE = [
    ["| 2 | Taro Yamada | A | C | C |", "| 2 | Taro Yamada | Excellent | Pass | Pass |"],
    ["| 3 | Hanako Suzuki | B | F | B |", "| 3 | Hanako Suzuki | Good | Fail | Good |"],
    ["| 4 | Jiro Sato | C | A | A |", "| 4 | Jiro Sato | Pass | Excellent | Excellent |"],
    ["| 100 | Umeko Tanaka | B | A | C |", "| 100 | Umeko Tanaka | Good | Excellent | Pass |"],
    ["| 102 | A | | | |", "| 102 | Excellent | | | |"],
    ["| 103 | B | | | |", "| 103 | Good | | | |"],
    ["| 104 | C | | | |", "| 104 | Pass | | | |"],
    ["| 105 | F | | | |", "| 105 | Fail | | | |"],
  ];
  for (const [from, to] of TABLE) {
    s.en = replaceOnce(s.en, from, to, `q069 stem.en «${from}»`);
    edits++;
  }
  console.log("  ✓ q069 stem.en 成績表 A/B/C/F → Excellent/Good/Pass/Fail (8 行、残件 B-2)");

  // (B-1) 解説 en
  const p = P2(`expl_tr_${E}-q069.json`);
  const doc = JSON.parse(readFileSync(p, "utf-8"));
  doc.correct.en = replaceOnce(doc.correct.en,
    "must shift from 優 (excellent) to 良 (good) to 可 (pass) to 不可 (fail)",
    "must shift from Excellent to Good to Pass to Fail", "q069 correct.en grades");
  doc.correct.en = replaceOnce(doc.correct.en,
    "how many students earned 良 (good) in English",
    "how many students earned Good in English", "q069 correct.en C103");
  const di = doc.distractors.find((x) => x.letter === "イ");
  const de = doc.distractors.find((x) => x.letter === "エ");
  if (!di || !de) throw new Error("q069 distractors イ/エ missing");
  di.en = replaceOnce(di.en,
    "keeps counting grade A and the rows for grades B, C and F are never counted correctly",
    "keeps counting Excellent and the rows for Good, Pass and Fail are never counted correctly",
    "q069 distractor イ.en");
  de.en = replaceOnce(de.en,
    "copying downward can only count grade A, so the rows for grades B, C and F come out wrong",
    "copying downward can only count Excellent, so the rows for Good, Pass and Fail come out wrong",
    "q069 distractor エ.en");
  const left = JSON.stringify(doc).match(/grade[s]? [ABCF][ ,.]/g);
  if (left) throw new Error(`q069: old letter grades remain: ${left.join(",")}`);
  writeFileSync(p, JSON.stringify(doc, null, 2) + "\n");
  console.log("  ✓ q069 解説 en (correct 2 + distractors イ/エ) を同一ラベルへ統一 (残件 B-1)");
  edits += 4;
}

writeFileSync(TR, JSON.stringify(trDoc, null, 2) + "\n");

// ---------- (C) q092 key_guard note の盤面記述を補完 ----------
{
  const grPath = P2(`generate_result_${E}.json`);
  const gr = JSON.parse(readFileSync(grPath, "utf-8"));
  const rec = gr.results.find((r) => r.id === `${E}-q092`);
  if (!rec) throw new Error("q092 not in generate_result");
  const FROM_A = "(3,3)(3,5)(5,3)(5,5)が黒（中央4列に縦の白帯）";
  const TO_A = "(3,3)(3,5)(5,3)(5,5)が黒・(3,4)(5,4)が白（中央の第4列 行2〜6 が縦の白帯）";
  if (rec.key_guard.note_jp.includes(TO_A)) {
    console.log("  = q092 key_guard note already corrected");
  } else if (rec.key_guard.note_jp.includes(FROM_A)) {
    rec.key_guard.note_jp = rec.key_guard.note_jp.replace(FROM_A, TO_A);
    writeFileSync(grPath, JSON.stringify(gr, null, 2) + "\n");
    console.log("  ✓ q092 key_guard note の盤面記述を補完 (字面どおりでは 93 文字を再現できなかった)");
    edits++;
  } else {
    console.log("  ! q092 key_guard note: 想定文字列が見つからず (drift) — 手動確認");
  }
}

console.log(`✓ quiz-phase2-explfix3-S113-2011h23a: ${edits} フィールド`);
console.log(`  next: node scripts/quiz-phase2-merge.mjs ${E} && node scripts/build-quiz-corpus.mjs`);
console.log(`  Rule D: 再核験は 3 巡目 (別 agent) を回すこと`);
