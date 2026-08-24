#!/usr/bin/env node
// Stage 6 / Quiz — s7x DISPLAY-TEXT FIDELITY fixes, batch S113 (2011h23a).
//
// Provenance: two independent fidelity passes over the 21 s7x-resourced questions
//   pass 1 agentType general-purpose                 → 6 discrepant / 11 findings
//   pass 2 agentType pr-review-toolkit:code-reviewer → SAME 6 questions, 実質 11/11 一致
//     (q040 は pass2 が 2 差分を 1 件に併合して報告、内容同一)
//   evidence: evidence/phase5/stage_06_quiz_fidelity/s7x_fidelity_S113_2011h23a{,_pass2}.json
//   主 context 裁決: page-13/15/23/27/33/34/43 を実読して全件確認 (S113 §6)。
//
// 全 11 件が非 answer-affecting (正解肢上の差分 0)。主な是正:
//   q032 エ「データ追加処理」→「データ追加作業」(語置換、zh/en 連帯)
//   q040 ウ「開発での取引の標準化」→「開発とその取引の適正化」(SLCP 定型文言の復元)
//   q064 stem 二文構成の復元「がある。四つの状態は」
//   q073 stem パターン “_%イ%ン_”→“%イ%ン_” (源に無い先頭 _ の削除。両パターンとも
//     正解はアのまま = 保真専用ゲートでしか捕まらない典型例。zh/en は verbatim 連帯)
//   q089 中問A lead: 汎用 wrapper「次の記述を読んで、問いに答えよ。」→ 源式
//     「中問A ディジタル画像に関する…問89 ～ 92 に答えよ。」(corpus 実測: 汎用 wrapper は
//     全 corpus で本問 1 件のみ、源式保持が 4 件 [2010h22a-q097 中問C 等] = 規約は源式) +
//     欠落一文「画素データを出力する処理の概要と圧縮する処理の概要は、…」の復元
//   q100 stem「のうち」→「を考え」/「目標の効果に達するかどうかは、」→「期待できる
//     効果が」/「引いた」→「差し引いた」(page-43 実読)
//
// LAYERING (S107 q082 / S112 精神): stem_jp_clean が表示権威。q064/q073/q089/q100 の raw は
// それぞれ別途腐敗している (q064 raw 手順の余り0=「そのまま」/ q073 raw 引用符崩壊 /
// q100 raw 表値・「大の場合」欠落) が、clean が源一致ゆえ raw は共通語句の編集のみ
// ("both") とし、raw 固有の腐敗は不動。
//
// NOT fixed here (deliberate):
//   q089 図1 キャプションの凡例「（■＝黒、□＝白）」— 源に無いが、ビットマップを
//     markdown 表へ文本化したことに伴う描画補助 (2012h24h q092 網掛け列挙と同クラス)。
//   q064/q073/q100 raw の固有腐敗 — clean 権威・raw 非表示。
//
// TRANSLATION LAYER: q032 (語 swap)・q073 (verbatim パターン) は決定的連帯。
// q040/q064/q089/q100 の zh/en 措辞は fidfix-repair workflow が判断。
//
// Run: node scripts/quiz-fidfix-S113-2011h23a.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const E = "2011h23a";
const TR = path.join(ROOT, `data/ip/quiz/translations/${E}.json`);
const q = (n) => `${E}-q${String(n).padStart(3, "0")}`;

const FIXES = [
  // ---- q032 (page-13) choice エ 語置換
  { id: q(32), kind: "choice", key: "エ",
    from: "データ追加処理に関する作業", to: "データ追加作業に関する作業",
    why: "semantic: 源は「データ追加作業に関する作業」(8 倍拡大で字形確認済)" },
  { id: q(32), kind: "tr_choice", key: "エ", lang: "zh",
    from: "数据追加处理相关作业", to: "数据追加作业相关作业", why: "連帯" },
  { id: q(32), kind: "tr_choice", key: "エ", lang: "en",
    from: "data addition processing performed", to: "data addition work performed", why: "連帯" },
  // ---- q040 (page-15) choice ウ SLCP 定型文言
  { id: q(40), kind: "choice", key: "ウ",
    from: "ソフトウェア開発での取引の標準化のために",
    to: "ソフトウェア開発とその取引の適正化のために",
    why: "semantic ×2: 源は「開発とその取引」並列 +「適正化」(共通フレームの定型)。zh/en は repair 対象" },
  // ---- q064 (page-23) stem 二文構成 (raw も同語句 → both)
  { id: q(64), kind: "stem", layer: "both",
    from: "四つの状態があり，四つの状態は",
    to: "四つの状態がある。四つの状態は",
    why: "cosmetic: 源は「がある。」で終止する二文構成。raw 固有の手順腐敗は clean 権威ゆえ不動" },
  // ---- q073 (page-27) stem ワイルドカードパターン (clean のみ、raw は引用符崩壊で別物)
  { id: q(73), kind: "stem", layer: "clean",
    from: "文字列全体が“_%イ%ン_”に一致",
    to: "文字列全体が“%イ%ン_”に一致",
    why: "semantic: 源パターンは “%イ%ン_” (8 倍拡大確認)。先頭 _ は源に無い。両パターンで正解ア不変" },
  { id: q(73), kind: "tr_stem", lang: "zh", from: "_%イ%ン_", to: "%イ%ン_", why: "連帯 (verbatim トークン)" },
  { id: q(73), kind: "tr_stem", lang: "en", from: "_%イ%ン_", to: "%イ%ン_", why: "連帯 (verbatim トークン)" },
  // ---- q089 (page-33/34) 中問A lead (clean のみ、raw は単問形で lead を持たない)
  { id: q(89), kind: "stem", layer: "clean",
    from: "次の記述を読んで、問いに答えよ。",
    to: "中問A　ディジタル画像に関する次の記述を読んで、問89 ～ 92 に答えよ。",
    why: "semantic: 源式 lead の復元 (corpus 規約 = 源式保持 4 件 vs 汎用 wrapper 本問のみ)" },
  { id: q(89), kind: "stem", layer: "clean",
    from: "| 7行 | □ | □ | ■ | ■ | ■ | □ | □ |\n\n〔画素データを出力する処理の概要〕",
    to: "| 7行 | □ | □ | ■ | ■ | ■ | □ | □ |\n\n画素データを出力する処理の概要と圧縮する処理の概要は、次のとおりである。\n\n〔画素データを出力する処理の概要〕",
    why: "semantic: 図1 直後の導入一文が丸ごと脱落していた (page-33 実読)" },
  // ---- q100 (page-43) stem ×3
  { id: q(100), kind: "stem", layer: "both",
    from: "販売促進策のうち、それぞれの",
    to: "販売促進策を考え、それぞれの",
    why: "semantic: 源は「四つの販売促進策を考え，」(A さんが立案した)。「のうち」は選抜の含意で源と別" },
  { id: q(100), kind: "stem", layer: "clean",
    from: "効果に関しては、目標の効果に達するかどうかは、大の場合、中の場合、小の場合に分け、",
    to: "効果に関しては、期待できる効果が大の場合、中の場合、小の場合に分け、",
    why: "semantic: 源は「期待できる効果が大の場合，…」。「目標の効果に達するかどうか」は源に無い別概念。raw は「大の場合」自体が欠落した別腐敗ゆえ clean のみ" },
  { id: q(100), kind: "stem", layer: "both",
    from: "期待値から費用を引いたものとする",
    to: "期待値から費用を差し引いたものとする",
    why: "cosmetic: 源は「差し引いた」" },
];

const bank = JSON.parse(readFileSync(RB, "utf-8"));
const byId = new Map((bank.questions ?? bank).map((x) => [x.id, x]));
const trDoc = JSON.parse(readFileSync(TR, "utf-8"));

const replaceOnce = (s, f, where) => {
  const n = s.split(f.from).length - 1;
  if (n !== 1) throw new Error(`${f.id} ${where}: expected exactly 1 occurrence of «${f.from}», found ${n}`);
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
  } else if (f.kind === "choice") {
    rec.choices_jp[f.key] = replaceOnce(rec.choices_jp[f.key], f, `choices_jp.${f.key}`);
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
console.log(`✓ quiz-fidfix-S113-2011h23a: raw ${counts.raw} / clean ${counts.clean} / choice ${counts.choice} / tr ${counts.tr}`);
console.log(`  next: node scripts/build-quiz-corpus.mjs; then fidfix-repair for q040/q064/q089/q100 zh/en`);
