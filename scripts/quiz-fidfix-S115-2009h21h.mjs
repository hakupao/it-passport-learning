#!/usr/bin/env node
// Stage 6 / Quiz — s7x DISPLAY-TEXT FIDELITY fixes, batch S115 (2009h21h).
//
// Provenance A — s7x 保真核験 (双 pass, Rule D)。母数 24/100:
//   pass 1 agentType general-purpose                 → CLEAN 23 / DISCREPANT 1、差分 3
//   pass 2 agentType pr-review-toolkit:code-reviewer → CLEAN 23 / DISCREPANT 1、差分 3
//   **(id, field, text) 3/3 完全一致**、UNREADABLE 0、正解肢上 0、**answer_affecting 1**。
//   evidence: evidence/phase5/stage_06_quiz_fidelity/s7x_fidelity_S115_2009h21h{,_pass2}.json
//   主 context 裁決: page-41 を実読して 3 件すべて確認 (S115 §2)。
//
// ══ THE ANSWER-AFFECTING ONE — q096 選択肢イ (page-41) ══
// 設問は「女性会員の年代別時間帯推移グラフの分析として，適切なものはどれか」。
// 源の選択肢イは 「10 〜 14 時と比べ 14 〜 18 時の時間帯では，50 代の増加率が最も大きい。」
// dataset はこれを 「14〜18時と比べて18〜22時の時間帯では，**40代**の増加率が最も大きい。」
// に置き換えていた。**比較する 2 区間と対象年代の両方**が別物になっている。
//
// グラフの実数 (page-41 実読):
//   10〜14 時: 20代 15 / 30代 25 / 40代 75 / 50代 44
//   14〜18 時: 20代 35 / 30代 75 / 40代 53 / 50代 45
//   18〜22 時: 20代 50 / 30代 115 / 40代 220 / 50代 138
//
//   源のイ  (10〜14 → 14〜18): 20代 +133% / 30代 +200% / 40代 −29% / **50代 +2.3%**
//            → 50 代は最大でない ⇒ 誤り肢として正しく機能する。
//   dataset のイ (14〜18 → 18〜22): 20代 +43% / 30代 +53% / **40代 +315%** / 50代 +207%
//            → 40 代が実際に最大 ⇒ **真になってしまう**。
//   正解肢ア も真 (30代 +200% < 40代 +315%) なので、**正解が一意に定まらなくなっていた**。
// 双 pass とも独立に answer_affecting と判定し、主 context が源実読で確認した。
//
// 併せて同問の ウ (「比べて」→ 源「比べ」= 1 字追加) と エ (「入館者数」→ 源「入場者数」)。
// エ は設問文・横軸が「入館」なので **日本語として自然に見え**、保真核験だけが捕捉できる型。
//
// Provenance B — 決定的 junk スキャン (主 context, 全 100 問 × 表示層):
//   分野見出しの混入 3 件。うち **q094 選択肢エ 末尾の〔ストラテジ〕** は、S114 §1b で
//   「corpus 全 2900 問で選択肢への見出し混入は 2011h23tokubetsu-q091.エ と本件の 2 件のみ」
//   と特定されていた残り 1 件であり、本 session で corpus からこの型が消える。
//
// 中問 (q089〜100) のリンク切れは D-141 の 2 段で解消済:
//   ① quiz-chumon-normalize-S115.mjs (q097 の原典に無い見出しを剥がす)
//   ② quiz-chumon-preamble-apply.mjs (中問A/B/C の原典逐字前文を 12 問に前置)
//   これにより q089〜092 (LAN 構成と障害の状況設定)、q093〜096 (会員表/入館表/図2/
//   性別年代別利用者数一覧)、q097〜100 (F 社の通販業務と平均作業時間の表) が
//   **単体で解答可能**になる。とくに q094 は「表の性別年代別利用者数一覧の分析」を問うのに
//   当の表が corpus のどこにも無く、解答不能だった。
//
// Run: node scripts/quiz-fidfix-S115-2009h21h.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const E = "2009h21h";
const TR = path.join(ROOT, `data/ip/quiz/translations/${E}.json`);
const q = (n) => `${E}-q${String(n).padStart(3, "0")}`;

const FIXES = [
  // ═══════════ A. s7x 保真核験 — q096 (page-41) ═══════════
  {
    id: q(96), kind: "choice_jp", key: "イ",
    from: "14〜18時と比べて18〜22時の時間帯では，40代の増加率が最も大きい。",
    to: "10〜14時と比べ14〜18時の時間帯では，50代の増加率が最も大きい。",
    why: "**answer_affecting (双 pass 一致)**: 比較 2 区間と対象年代の両方が源と別物。dataset 版は 40代 +315% で真になり、正解肢ア と併せて二重正解になっていた",
  },
  {
    id: q(96), kind: "tr_choice", key: "イ", lang: "zh",
    from: "与14〜18时相比，在18〜22时这一时间段，40多岁的增长率最大。",
    to: "与10〜14时相比，在14〜18时这一时间段，50多岁的增长率最大。",
    why: "zh も同じ置換をしていた (二重正解が訳文にも波及)",
  },
  {
    id: q(96), kind: "tr_choice", key: "イ", lang: "en",
    from: "Compared with the 14-to-18 time slot, in the 18-to-22 time slot, those in their 40s have the largest increase rate.",
    to: "Compared with the 10-to-14 time slot, in the 14-to-18 time slot, those in their 50s have the largest increase rate.",
    why: "en も同じ置換をしていた",
  },
  {
    id: q(96), kind: "choice_jp", key: "ウ",
    from: "14〜18時と比べて18〜22時の時間帯では，30代の増加率が最も大きい。",
    to: "14〜18時と比べ18〜22時の時間帯では，30代の増加率が最も大きい。",
    why: "cosmetic (双 pass 一致): 源は連用中止形「比べ」。「て」1 字の追加。源はイ・ウとも「比べ」で統一されている",
  },
  {
    id: q(96), kind: "choice_jp", key: "エ",
    from: "時間帯が遅くなるとともに，すべての年代で入館者数が増加している。",
    to: "時間帯が遅くなるとともに，すべての年代で入場者数が増加している。",
    why: "semantic (双 pass 一致): 源は「入場者数」。設問文と横軸ラベルが「入館」なので自然に見え、保真核験だけが捕捉できる型",
  },
  {
    id: q(96), kind: "tr_choice", key: "エ", lang: "zh",
    from: "随着时间段变晚，所有年龄段的入馆人数都在增加。",
    to: "随着时间段变晚，所有年龄段的入场人数都在增加。",
    why: "zh も「入馆」。源の「入場」に合わせる (en は \"people entering\" で語の区別が無いため不変)",
  },

  // ═══════════ B. 決定的 junk スキャン (分野見出しの混入) ═══════════
  // corpus 規約は分野見出しの非前置 (2900 問中の残存はごく少数)。
  {
    id: q(91), kind: "stem", layer: "clean",
    from: "〔テクノロジ〕\nM さんは，障害の原因を特定するための手順を，",
    to: "M さんは，障害の原因を特定するための手順を，",
    why: "cosmetic: 分野見出しは設問本文ではない (corpus 規約は非前置)",
  },
  {
    id: q(91), kind: "tr_stem", lang: "en",
    from: "[Technology] Mr. M decided to draw a flowchart",
    to: "Mr. M decided to draw a flowchart",
    why: "en 側にも同じ見出しが混入していた (zh は既に無い)",
  },
  {
    id: q(92), kind: "stem", layer: "clean",
    from: "〔テクノロジ〕\n問92 Mさんは，今回の障害の原因を特定するための手順を，",
    to: "Mさんは，今回の障害の原因を特定するための手順を，",
    why: "cosmetic: 分野見出し + 設問番号「問92」の混入。corpus 規約はどちらも非前置",
  },
  {
    id: q(92), kind: "tr_stem", lang: "zh",
    from: "〔技术〕\n问92 M 先生想把用于确定本次故障原因的步骤，",
    to: "M 先生想把用于确定本次故障原因的步骤，",
    why: "zh 側にも同じ見出し + 設問番号が混入",
  },
  {
    id: q(92), kind: "tr_stem", lang: "en",
    from: "[Technology]\nQ92 Mr. M wants to complete, as a flowchart,",
    to: "Mr. M wants to complete, as a flowchart,",
    why: "en 側にも同じ見出し + 設問番号が混入",
  },
  {
    id: q(94), kind: "choice_jp", key: "エ",
    from: "年代別利用者数を比較すると, 男性女性ともに 50 代の利用者が最も多い。〔ストラテジ〕",
    to: "年代別利用者数を比較すると, 男性女性ともに 50 代の利用者が最も多い。",
    why: "cosmetic: 次ページの分野見出し〔ストラテジ〕が選択肢末尾に流れ込んでいた。**S114 §1b が特定した corpus 全 2900 問で 2 件だけの型の残り 1 件**。zh/en には波及なし",
  },
];

const bank = JSON.parse(readFileSync(RB, "utf-8"));
const byId = new Map((bank.questions ?? bank).map((x) => [x.id, x]));
const trDoc = JSON.parse(readFileSync(TR, "utf-8"));

const replaceOnce = (s, f, where) => {
  const n = s.split(f.from).length - 1;
  if (n !== 1) throw new Error(`${f.id} ${where}: expected exactly 1 occurrence of «${f.from.slice(0, 60)}…», found ${n}`);
  return s.replace(f.from, f.to);
};

const counts = { raw: 0, clean: 0, choice: 0, tr: 0 };
for (const f of FIXES) {
  const rec = byId.get(f.id);
  if (!rec) throw new Error(`${f.id}: not in question_bank`);
  const t = trDoc.questions[f.id];

  if (f.kind === "stem") {
    if (f.layer === "raw" || f.layer === "both") {
      rec.stem_jp = replaceOnce(rec.stem_jp, f, "raw");
      counts.raw++;
      console.log(`  ✓ ${f.id} [raw]      ${f.why}`);
    }
    if (f.layer === "clean" || f.layer === "both") {
      if (!t?.stem_jp_clean) throw new Error(`${f.id}: no stem_jp_clean`);
      t.stem_jp_clean = replaceOnce(t.stem_jp_clean, f, "clean");
      counts.clean++;
      console.log(`  ✓ ${f.id} [clean]    ${f.why}`);
    }
  } else if (f.kind === "choice_jp") {
    rec.choices_jp[f.key] = replaceOnce(rec.choices_jp[f.key], f, `choice_jp.${f.key}`);
    counts.choice++;
    console.log(`  ✓ ${f.id} [choice ${f.key}] ${f.why}`);
  } else if (f.kind === "tr_stem") {
    if (!t?.stem?.[f.lang]) throw new Error(`${f.id}: no tr stem ${f.lang}`);
    t.stem[f.lang] = replaceOnce(t.stem[f.lang], f, `tr_stem.${f.lang}`);
    counts.tr++;
    console.log(`  ✓ ${f.id} [tr ${f.lang}]    ${f.why}`);
  } else if (f.kind === "tr_choice") {
    if (!t?.choices?.[f.key]?.[f.lang]) throw new Error(`${f.id}: no tr choice ${f.key}.${f.lang}`);
    t.choices[f.key][f.lang] = replaceOnce(t.choices[f.key][f.lang], f, `tr_choice.${f.key}.${f.lang}`);
    counts.tr++;
    console.log(`  ✓ ${f.id} [tr ${f.key}.${f.lang}] ${f.why}`);
  }
}

writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
writeFileSync(TR, JSON.stringify(trDoc, null, 2) + "\n");
console.log(`✓ quiz-fidfix-S115-2009h21h: raw ${counts.raw} / clean ${counts.clean} / choice ${counts.choice} / tr ${counts.tr}`);
console.log(`  next: node scripts/build-quiz-corpus.mjs`);
