#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 — stem/choices fixes, batch S113 (2011h23a), post-generate 裁決.
//
// Provenance: generate `wf_5bd9b218-fab` の key_guard flag 8 問を主 context が裁決。
// 全て源実読で確認済 (page-10/11/14/15/34/41/43)。correct_answer 変更 0。
// 本 exam は matches_key=false が 0 件 (=answer-affecting 級の腐敗なし)。
//
// 是正 (全て user-facing・非 answer-affecting):
//   q027 ウ 余分な半角ピリオド「では.,」→「では, 」/ エ「経貼」→「経由」(page-11)
//   q036 イ「a, bc」→「a, b, c」(page-14。読点脱落で 3 要素が 2 要素に見えていた)
//   q038 ア「過去のりリスク」→「過去のリスク」(page-15。衍字「り」)
//   q099 clean〔店舗の課題と要望〕の角括弧復元 + 項目番号 ①〜③→(1)〜(3)、
//     choices も ①→②→③ 形式から (1)→(2)→(3) 形式へ (jp/zh/en、page-43 実読)。
//     源は一貫して半角 (1)(2)(3) で、参照先の〔店舗の課題と要望〕も同表記。
//     中問C 共通記述を後日添付したとき番号体系が食い違わないようにする。
//
// NOT fixed here (deliberate — 本 session で 4 回下したのと同じ裁定):
//   q024 raw stem の 3手目列「値引きする/広告する」(源=広告する/広告しない) —
//     **clean 側は源と一致** (広告しない 4 箇所を確認)、raw は非表示 (S107 q082 精神)。
//     数値は無傷で literal 導出も 9=イ のままゆえ「答えを反転させる罠」ではない。
//     raw を直すのは answer-affecting な罠に限る、という S112 の線を維持。
//   q099 raw の「〔店舗の課題と要望})」「①)」— 同上 (clean 権威)。
//   q015 / q098 — figure_derivable=false は概念問への benign over-flag、腐敗なし。
//   q090 — 中問A 前提部 (圧縮ルール・図1) の未取り込み。q089 clean には現存する
//     ため注入のみで直る軽量ケースだが、テキスト増殖を伴うため図/シナリオ再抽出
//     track に登録 (S112 q097/q099 と同じ扱い)。
//
// Run: node scripts/quiz-phase2-stemfix-S113-2011h23a.mjs  (then: build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const E = "2011h23a";
const TR = path.join(ROOT, `data/ip/quiz/translations/${E}.json`);
const q = (n) => `${E}-q${String(n).padStart(3, "0")}`;

const FIXES = [
  // ---- q027 (page-11) choice OCR ×2
  { id: q(27), kind: "choice", key: "ウ",
    from: "教えるだけでは.,不正", to: "教えるだけでは, 不正",
    why: "cosmetic: 余分な半角ピリオドの混入 (源は読点のみ)" },
  { id: q(27), kind: "choice", key: "エ",
    from: "インターネット経貼で", to: "インターネット経由で",
    why: "cosmetic: 貼→由 字形 OCR。zh/en は元から clean" },
  // ---- q036 (page-14) choice イ 読点脱落
  { id: q(36), kind: "choice", key: "イ",
    from: "a, bc", to: "a, b, c",
    why: "cosmetic: b と c の間の読点脱落 (源は a, b, c。zh/en は元から a, b, c)" },
  // ---- q038 (page-15) choice ア 衍字
  { id: q(38), kind: "choice", key: "ア",
    from: "過去のりリスクチェックリスト", to: "過去のリスクチェックリスト",
    why: "cosmetic: 衍字「り」(他 3 肢は「過去のリスクチェックリスト」)" },
  // ---- q099 (page-43) 角括弧 + 項目番号体系
  { id: q(99), kind: "stem", layer: "clean",
    from: "Aさんは, 店舗の課題と要望に関する施策",
    to: "Aさんは, 〔店舗の課題と要望〕に関する施策",
    why: "cosmetic: 源は〔…〕付きの資料名 (角括弧の脱落)" },
  { id: q(99), kind: "stem", layer: "clean",
    from: "プロジェクト計画書に①〜③を記述する",
    to: "プロジェクト計画書に(1)〜(3)を記述する",
    why: "cosmetic: 源の項目番号は半角 (1)(2)(3)。参照先〔店舗の課題と要望〕と体系を揃える" },
  { id: q(99), kind: "choice", key: "ア", from: "①→②→③", to: "(1)→(2)→(3)", why: "cosmetic: 番号体系" },
  { id: q(99), kind: "choice", key: "イ", from: "①→③→②", to: "(1)→(3)→(2)", why: "cosmetic: 番号体系 (正解肢)" },
  { id: q(99), kind: "choice", key: "ウ", from: "②→③→①", to: "(2)→(3)→(1)", why: "cosmetic: 番号体系" },
  { id: q(99), kind: "choice", key: "エ", from: "③→①→②", to: "(3)→(1)→(2)", why: "cosmetic: 番号体系" },
  { id: q(99), kind: "tr_choice", key: "ア", lang: "zh", from: "①→②→③", to: "(1)→(2)→(3)", why: "連帯" },
  { id: q(99), kind: "tr_choice", key: "ア", lang: "en", from: "①→②→③", to: "(1)→(2)→(3)", why: "連帯" },
  { id: q(99), kind: "tr_choice", key: "イ", lang: "zh", from: "①→③→②", to: "(1)→(3)→(2)", why: "連帯" },
  { id: q(99), kind: "tr_choice", key: "イ", lang: "en", from: "①→③→②", to: "(1)→(3)→(2)", why: "連帯" },
  { id: q(99), kind: "tr_choice", key: "ウ", lang: "zh", from: "②→③→①", to: "(2)→(3)→(1)", why: "連帯" },
  { id: q(99), kind: "tr_choice", key: "ウ", lang: "en", from: "②→③→①", to: "(2)→(3)→(1)", why: "連帯" },
  { id: q(99), kind: "tr_choice", key: "エ", lang: "zh", from: "③→①→②", to: "(3)→(1)→(2)", why: "連帯" },
  { id: q(99), kind: "tr_choice", key: "エ", lang: "en", from: "③→①→②", to: "(3)→(1)→(2)", why: "連帯" },
];

const bank = JSON.parse(readFileSync(RB, "utf-8"));
const byId = new Map((bank.questions ?? bank).map((x) => [x.id, x]));
const trDoc = JSON.parse(readFileSync(TR, "utf-8"));

const replaceOnce = (s, f, where) => {
  const n = s.split(f.from).length - 1;
  if (n !== 1) throw new Error(`${f.id} ${where}: expected exactly 1 occurrence of «${f.from}», found ${n}`);
  return s.replace(f.from, f.to);
};

const counts = { stem: 0, choice: 0, tr: 0 };
for (const f of FIXES) {
  const rec = byId.get(f.id);
  if (!rec) throw new Error(`${f.id}: not in question_bank`);
  const t = trDoc.questions[f.id];
  if (f.kind === "stem") {
    if (!t?.stem_jp_clean) throw new Error(`${f.id}: no stem_jp_clean`);
    t.stem_jp_clean = replaceOnce(t.stem_jp_clean, f, "clean");
    counts.stem++;
    console.log(`  ✓ ${f.id} [clean]    ${f.why}`);
  } else if (f.kind === "choice") {
    rec.choices_jp[f.key] = replaceOnce(rec.choices_jp[f.key], f, `choices_jp.${f.key}`);
    counts.choice++;
    console.log(`  ✓ ${f.id} [choice ${f.key}] ${f.why}`);
  } else if (f.kind === "tr_choice") {
    if (!t?.choices?.[f.key]?.[f.lang]) throw new Error(`${f.id}: no tr choice ${f.key}.${f.lang}`);
    t.choices[f.key][f.lang] = replaceOnce(t.choices[f.key][f.lang], f, `tr_choice.${f.key}.${f.lang}`);
    counts.tr++;
    console.log(`  ✓ ${f.id} [tr ${f.key}.${f.lang}] ${f.why}`);
  }
}

writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
writeFileSync(TR, JSON.stringify(trDoc, null, 2) + "\n");
console.log(`✓ quiz-phase2-stemfix-S113-2011h23a: clean ${counts.stem} / choice ${counts.choice} / tr ${counts.tr}`);
console.log(`  next: node scripts/build-quiz-corpus.mjs`);
