#!/usr/bin/env node
// Stage 6 / Quiz — s7x DISPLAY-TEXT FIDELITY fixes, batch S113 (2012h24h).
//
// Provenance: two independent fidelity passes over the 10 s7x-resourced questions
//   pass 1 agentType general-purpose                 → 4 discrepant / 12 findings
//   pass 2 agentType pr-review-toolkit:code-reviewer → SAME 4 questions, (id,field) 12/12
//     一致 + pass2-only 1 件 (q092 注記の休日列挙, cosmetic, 裁決=no-op 下記)
//   evidence: evidence/phase5/stage_06_quiz_fidelity/s7x_fidelity_S113_2012h24h{,_pass2}.json
//   主 context 裁決: page-18 / page-40 / page-42 / page-46 を実読して全件確認 (S113 §1)。
//
// THE CRITICAL ONE — q052 (page-18), answer_affecting:
//   源: 「数値の範囲を10進数で表したものはどれか」
//   dataset: 「16進数」。選択肢は 4 つとも 10 進表記なので、16進数と読むと
//   どの肢も設問に整合しない「表示上 正解が存在しない」設問だった
//   (S103 q036 / S109 q029 / S110 q069 / S112 q009 型)。severity は pass2 の
//   answer_affecting を採用 (pass1=semantic は「正解肢が移動しない」ことのみを根拠に
//   しており、「正解が存在しなくなる」型はこの系譜で一貫して answer_affecting)。
//   併せて錯乱肢 イ/エ の上限値も源に復元 (イ 255→256 / エ 127→128 = 源の
//   256/255・128/127 入れ替え設計の回復)。正解肢 ウ は源と逐字一致、key ウ 不変。
//
// LAYERING (S108/S110/S112 precedent): stem_jp_clean は表示権威 (quizModel.ts)。
//   q052 は clean なし → raw + choices_jp が表示層。
//   q092/q094/q099 は clean あり → clean を直し、raw にも同一語句が特定できる編集は
//   併せて直す ("both")。
//
// NOT fixed here (deliberate):
//   q092 raw の「Ｓさん」(源=Ｂさん) と日曜始まりでない別配列のカレンダ表 —
//     clean 側が源と一致しており raw は非表示 (S107 q082 精神)。
//   q092 clean 注記の「（網掛け＝休日：6，7，13，14，15，20，21，23，27，28日）」—
//     源の注記には無い列挙だが、内容は 図1 の網掛けセルと完全一致 (page-40 実読で
//     突合済) で、markdown 表に網掛けを表現できないことへの文本化注記。解答を
//     漏らさず、図なし表示でも設問を成立させる。pass2 も cosmetic 裁定 → 保持。
//   q099 raw の「B2〜N2」「積」「剰余」「計算式はどれか」(源=B2〜M2 / 空欄 /
//     剰余(R) / 式はどれか) — clean 側が源と一致しており raw は非表示。
//   q094 の括弧字形 ［…］ (源=〔…〕) — 両 pass とも表記揺れ扱い、変更しない。
//
// TRANSLATION LAYER (deterministic here; wording nuances go to fidfix-repair):
//   q052 zh/en の進数用語と肢イ/エ数値、q099 zh/en 表の I 列 8→0、
//   q092 (3)(4)(5) zh/en の「9月の」トークン削除 — いずれも verbatim トークンで
//   LLM 不要 (S112 q093 精神)。q092 の「ここで/開講される/受講申込みしている」の
//   訳文ニュアンスと q094 の「の」の要否は fidfix-repair workflow が判断する。
//
// Run: node scripts/quiz-fidfix-S113-2012h24h.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const E = "2012h24h";
const TR = path.join(ROOT, `data/ip/quiz/translations/${E}.json`);
const q = (n) => `${E}-q${String(n).padStart(3, "0")}`;

// kind: "stem" (layer raw|clean|both) / "choice_jp" (key) / "tr_stem" (lang) / "tr_choice" (key, lang)
const FIXES = [
  // ---- q052 (page-18) 2の補数の値域。answer_affecting。clean なし → raw が表示層。
  { id: q(52), kind: "stem", layer: "raw",
    from: "数値の範囲を16進数で表したものはどれか",
    to: "数値の範囲を10進数で表したものはどれか",
    why: "answer_affecting: 源は 10進数。選択肢は全て 10 進表記で、16進数では正解が存在しない" },
  { id: q(52), kind: "choice_jp", key: "イ",
    from: "－255 ～ 255", to: "－255 ～ 256",
    why: "semantic: 源の錯乱肢イは −255～256 (ア −256～255 との対称設計)" },
  { id: q(52), kind: "choice_jp", key: "エ",
    from: "－127 ～ 127", to: "－127 ～ 128",
    why: "semantic: 源の錯乱肢エは −127～128 (ウ −128～127 の入れ替え設計)" },
  { id: q(52), kind: "tr_stem", lang: "zh", from: "十六进制", to: "十进制",
    why: "連帯: JP 10進数 復元に追随" },
  { id: q(52), kind: "tr_stem", lang: "en", from: "in hexadecimal", to: "in decimal",
    why: "連帯: JP 10進数 復元に追随" },
  { id: q(52), kind: "tr_choice", key: "イ", lang: "zh", from: "－255 ～ 255", to: "－255 ～ 256", why: "連帯" },
  { id: q(52), kind: "tr_choice", key: "イ", lang: "en", from: "－255 to 255", to: "－255 to 256", why: "連帯" },
  { id: q(52), kind: "tr_choice", key: "エ", lang: "zh", from: "－127 ～ 127", to: "－127 ～ 128", why: "連帯" },
  { id: q(52), kind: "tr_choice", key: "エ", lang: "en", from: "－127 to 127", to: "－127 to 128", why: "連帯" },

  // ---- q092 (page-40) 取消・欠席の請求額。semantic ×6。clean 表示、raw 同語句 → both。
  { id: q(92), kind: "stem", layer: "both",
    from: "適切なものはどれか。なお，Ａ社は",
    to: "適切なものはどれか。ここで，Ａ社は",
    why: "semantic: 源は「ここで」(前提条件の提示、「なお」の補足付加ではない)" },
  { id: q(92), kind: "stem", layer: "both",
    from: "コースは営業日に開講する。9月のカレンダ",
    to: "コースは営業日に開講される。9月のカレンダ",
    why: "semantic: 源は受動「開講される」" },
  { id: q(92), kind: "stem", layer: "both",
    from: "(2) 3名ともに9月に開講するコースを1コースずつ受講申込みをした。",
    to: "(2) 3名ともに9月に開講されるコースを1コースずつ受講申込みしている。",
    why: "semantic: 源は「開講される」+「受講申込みしている」(状態)" },
  { id: q(92), kind: "stem", layer: "both",
    from: "コースＱを9月に申込んでいたが，9月12日",
    to: "コースＱを申し込んでいたが，9月12日",
    why: "semantic: 源に無い「9月に」(申込月) の捏造を削除。9月は開講月であって申込月ではない" },
  { id: q(92), kind: "stem", layer: "both",
    from: "コースＲを9月に申込んでいたが，9月19日",
    to: "コースＲを申し込んでいたが，9月19日",
    why: "semantic: 同上 (4)" },
  { id: q(92), kind: "stem", layer: "both",
    from: "コースＱを9月に申込んでいたが，当日欠席",
    to: "コースＱを申し込んでいたが，当日欠席",
    why: "semantic: 同上 (5)" },
  { id: q(92), kind: "tr_stem", lang: "zh", from: "申请了9月的课程Ｑ，但于9月12日", to: "申请了课程Ｑ，但于9月12日", why: "連帯: 9月捏造の削除 (3)" },
  { id: q(92), kind: "tr_stem", lang: "zh", from: "申请了9月的课程Ｒ", to: "申请了课程Ｒ", why: "連帯: 9月捏造の削除 (4)" },
  { id: q(92), kind: "tr_stem", lang: "zh", from: "申请了9月的课程Ｑ，但当天", to: "申请了课程Ｑ，但当天", why: "連帯: 9月捏造の削除 (5)" },
  { id: q(92), kind: "tr_stem", lang: "en", from: "Course Q in September, but cancelled", to: "Course Q, but cancelled", why: "連帯: 9月捏造の削除 (3)" },
  { id: q(92), kind: "tr_stem", lang: "en", from: "Course R in September", to: "Course R", why: "連帯: 9月捏造の削除 (4)" },
  { id: q(92), kind: "tr_stem", lang: "en", from: "Course Q in September, but was absent", to: "Course Q, but was absent", why: "連帯: 9月捏造の削除 (5)" },

  // ---- q094 (page-42) RFP 作成者。cosmetic ×2 (助詞「の」脱落)。clean==raw → both。
  { id: q(94), kind: "stem", layer: "both",
    from: "［事務所統合プロジェクトメンバ］",
    to: "［事務所統合プロジェクトのメンバ］",
    why: "cosmetic: 源は〔事務所統合プロジェクトのメンバ〕(「の」脱落の復元。括弧字形は表記揺れとして不動)" },
  { id: q(94), kind: "stem", layer: "both",
    from: "| 事務所統合プロジェクトリーダ | Aさん |",
    to: "| 事務所統合のプロジェクトリーダ | Aさん |",
    why: "cosmetic: 源は「事務所統合のプロジェクトリーダ」" },

  // ---- q099 (page-46) ISBN チェック数字。semantic ×1 (表 I 列 8→0)。
  { id: q(99), kind: "stem", layer: "both",
    from: "ISBN コード | 9 | 7 | 8 | 4 | 0 | 0 | 0 | 8 | 1 | 2 | 3 | 4 |",
    to: "ISBN コード | 9 | 7 | 8 | 4 | 0 | 0 | 0 | 0 | 1 | 2 | 3 | 4 |",
    why: "semantic: 源の I 列は 0 (F〜I 四連 0、和(S)=72 が算術裏付け。8 なら 96 で図と矛盾)" },
  { id: q(99), kind: "tr_stem", lang: "zh",
    from: "ISBN 编码 | 9 | 7 | 8 | 4 | 0 | 0 | 0 | 8 | 1 | 2 | 3 | 4 |",
    to: "ISBN 编码 | 9 | 7 | 8 | 4 | 0 | 0 | 0 | 0 | 1 | 2 | 3 | 4 |", why: "連帯" },
  { id: q(99), kind: "tr_stem", lang: "en",
    from: "ISBN code | 9 | 7 | 8 | 4 | 0 | 0 | 0 | 8 | 1 | 2 | 3 | 4 |",
    to: "ISBN code | 9 | 7 | 8 | 4 | 0 | 0 | 0 | 0 | 1 | 2 | 3 | 4 |", why: "連帯" },
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
console.log(`✓ quiz-fidfix-S113-2012h24h: raw ${counts.raw} / clean ${counts.clean} / choice ${counts.choice} / tr ${counts.tr}`);
console.log(`  next: node scripts/build-quiz-corpus.mjs; then fidfix-repair for q092/q094 zh/en wording`);
