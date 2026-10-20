#!/usr/bin/env node
// Stage 6 / Quiz — S129 B track **B5** (2013h25a、100 問 / Sonnet 5 単 pass、D-150 §3) の差分を是正する。
// 源: S129 の workflow `wf_9930fcd7-f78`。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_b5_2013h25a_sn.json
//     マニフェスト = data/ip/quiz/.phase2/b5_fidelity_input_2013h25a.json (precrop 82/100、skip 18 = page_mismatch 1 (q092) + chumon 15 (q085〜q091 / q093〜q100) + merged_preamble 2 (q055 / q064))
//     機械 diff (S128 L1a 改修版) = node scripts/quiz-fidelity-machdiff.mjs <manifest> <結果>
//               → same 462 / AGENT_MISSED 18 / TRANSCRIPT_PREFIX 1 (q055、未裁定) / QUOTE_ASCII 1 (q014) / VERDICT_CONFLICT 0 / UNREADABLE 1 (q092、fixer が p38 を実読)
//               AGENT_MISSED はすべて既知型 (q052 = agent 題の同箇所、q055 / q067 / q098 = 図・表の言語化、q087 / q090 / q095 / q096 / q098 = 中問前文)
//
// 層・方針は quiz-fidfix-S122-u3a 〜 S128-b3 と同じ:
//   - translations sidecar は **再 merge 禁止** (S117 §10a 失敗②)。sidecar と .phase1 の両方に同じ置換を当てる
//   - stem は raw (questions / question_bank / by_year の stem_jp) と表示層 (stem_jp_clean) の**両方**に当てる。
//     片方にしか無い腐敗は assert-once の n===0 で自動 skip される
//   - explanations は .phase2 (expl_jp_ / expl_tr_) が真相源 → 是正後に quiz-phase2-merge で再生成 (D-143)
//   - key_guard note は **final のみ**、round1 不可触 (D-143 §3)。MARK 冪等
//   - sub() は置換後に **to の肯定確認** を assert する (S121 reviewer 指摘)
//
// 2013h25a の sidecar のキーは `stem` / `choices` / `stem_jp_clean` (100 題中 57 題) で、`choices_jp_clean` は存在しない (実測)。
// 選択肢は raw 3 層がそのまま出荷層。
// 中問 4 組 (mqA / mqB2 / mqC / mqD) は前文埋め込み済み。前文領域は触らず、from は設問文側の部分一致。
//
// 適用ループ (sub / FIX / NOTE_APPEND) は B3 から無変更で流用。EXPL は U6 の correctSub を足した。
//
// 採用した差分 (evidence §6。源 crop / 源ページを原寸で独立実読して確認):
//   q001 stem   (p02) 「A社は新たな」→ 源「A社では新たな」(「で」の脱落)
//   q014 stem   (p06) ASCII "販売の機会損失の低減" → 源 “…” (fixer 走査 / machdiff QUOTE_ASCII)
//   q017 イ     (p07) 「べンダ」(平仮名べ) → 源「ベンダ」
//   q018 stem   (p07) ASCII "脅威" → 源 “脅威”
//   q043 ア〜エ  (p15) 区切りを源の「，」に (イ〜エは読点の脱落 4 箇所、アは正解肢で ASCII「, 」の字種のみ)
//   q066 ウ     (p23) 源に無い「，複数のコアで」を削除 (zh / en 追随)
//   q074 ア     (p26) 「変えなかがら」→ 源「変えながら」
//   q075 ウ     (p26) 「復元」→ 源「復旧」(解説ウ jp 追随)
//   q085 stem   (p32) 「参加した以降の」→ 源「参加した6月以降の」(zh / en 追随)
//   q091 stem   (p37) 「掲載されている写真が違っている」の「」→ 源 “”
//   q094 stem   (p40) a〜c の「」×4 → 源 “”
//   q095 stem・ア〜エ (p41) 設問文「報告書」の「」→ 源 “”。選択肢は区切り “”、ア / イ の “_報告_” の先頭 _ を復元、
//               4 肢とも源に無い “_” (作成者氏名の直前) を削除、連結記号は表1 ③ と同じ ＋ (エは**正解肢**、zh / en 追随)
//   q100 ア     (p46) 源に無い「平均」を削除 (アは**正解肢**、zh / en・解説 correct 追随)
//
// Run: node scripts/quiz-fidfix-S129-b5.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S129-b5.mjs --apply
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2013h25a
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = !process.argv.includes("--apply") || process.argv.includes("--dry-run");
const P = (...s) => path.join(ROOT, ...s);
const LOADED = new Map();
const rj = (f) => { const d = JSON.parse(readFileSync(f, "utf-8")); LOADED.set(f, JSON.stringify(d, null, 2)); return d; };
const written = [];
const wj = (f, d) => {
  const next = JSON.stringify(d, null, 2);
  if (LOADED.get(f) === next) return;
  written.push(path.relative(ROOT, f));
  if (!DRY) writeFileSync(f, next + "\n");
};
let applied = 0, skipped = 0; const log = [];

function sub(obj, key, from, to, where) {
  const s = obj?.[key];
  if (typeof s !== "string") { log.push(`  ⚠ ${where}: field ${key} missing`); return false; }
  if (to && to.includes(from) && s.includes(to)) { skipped++; return false; }
  const n = s.split(from).length - 1;
  if (n === 0) { skipped++; return false; }
  if (n > 1) throw new Error(`${where}: 「${from}」 occurs ${n}× — abort`);
  const next = s.replace(from, to);
  if (to && !next.includes(to)) throw new Error(`${where}: 置換後に to 「${to.slice(0, 36)}」 が見つからない — abort`);
  obj[key] = next; applied++; log.push(`  ✓ ${where}: 「${from.slice(0, 40)}」→「${to.slice(0, 40)}」`); return true;
}

// q095 の連結記号。表1 ③ は “＋” を「前後の文字をつなげる記号」と定義し、jp / zh の表1 (A4 前文) は ＋、en の表1 は + で表示している。
// 選択肢は同じ題の表1 に揃える (D-162 は表計算式・擬似言語の算術演算子が対象で、本題の ＋ は問題文が定義する連結記号)。
const PLUS = { jp: "＋", zh: "＋", en: "+" };
const f95 = (L, parts) => parts.join(` ${PLUS[L]} `);

const FIX = {
  // ── 題幹 ────────────────────────────────────────────────────────────────────
  "2013h25a-q001": { jp: [["stem", "A社は新たなシステムの開発", "A社では新たなシステムの開発"]] },
  "2013h25a-q014": { jp: [["stem", "\"販売の機会損失の低減\"", "“販売の機会損失の低減”"]] },
  "2013h25a-q018": { jp: [["stem", "\"脅威\"", "“脅威”"]] },
  // q085: 源 p32「A さんが参加した6月以降の，」。前文 (1)「6 月からは A さんが参加し」は触らない。
  "2013h25a-q085": {
    jp: [["stem", "Aさんが参加した以降の，", "Aさんが参加した6月以降の，"]],
    zh: [["stem", "A加入之后，沟通渠道的总数", "A于6月加入之后，沟通渠道的总数"]],
    en: [["stem", "After person A joins, which", "After person A joined in June, which"]],
  },
  "2013h25a-q091": { jp: [["stem", "にある「掲載されている写真が違っている」に対して", "にある“掲載されている写真が違っている”に対して"]] },
  // q094: 源 p40 の a〜c は “”。前文 (“ひな形” 等) は既に “” で、設問文側だけが 「」 になっていた。zh は既に “”。
  "2013h25a-q094": {
    jp: [
      ["stem", "「ひな形」フォルダの「業務報告書（ひな形）」を開く", "“ひな形”フォルダの“業務報告書（ひな形）”を開く"],
      ["stem", "業務報告書を，「報告書」フォルダ内に複写", "業務報告書を，“報告書”フォルダ内に複写"],
      ["stem", "ファイル名を付けて，「報告書」フォルダに保存", "ファイル名を付けて，“報告書”フォルダに保存"],
    ],
  },
  // q095: 源 p41。設問文の「報告書」→ “報告書” (前文 (3)(5) と同じ字形)。選択肢は上の PLUS の注記どおり。
  //   zh / en の選択肢も同じ構造の崩れ (先頭 _ 脱落・余分な "_"・ASCII ") を持つので揃える。語 (作成者姓名 / report_ / author name) は解説と同じなので変えない。
  "2013h25a-q095": {
    jp: [
      ["stem", "「報告書」フォルダのファイルをファイル名で整列", "“報告書”フォルダのファイルをファイル名で整列"],
      ["ア", "\"関連_\" + n + \"報告_\" + yymm + w + \"_\" + 作成者氏名", f95("jp", ["“関連_”", "n", "“_報告_”", "yymm", "w", "作成者氏名"])],
      ["イ", "\"関連_\" + nn + \"報告_\" + yymm + w + \"_\" + 作成者氏名", f95("jp", ["“関連_”", "nn", "“_報告_”", "yymm", "w", "作成者氏名"])],
      ["ウ", "\"報告_\" + yymm + w + \"_\" + 作成者氏名 + \"_関連_\" + n", f95("jp", ["“報告_”", "yymm", "w", "作成者氏名", "“_関連_”", "n"])],
      ["エ", "\"報告_\" + yymm + w + \"_\" + 作成者氏名 + \"_関連_\" + nn", f95("jp", ["“報告_”", "yymm", "w", "作成者氏名", "“_関連_”", "nn"])],
    ],
    zh: [
      ["stem", "决定为「报告书」文件夹中的文件命名", "决定为“报告书”文件夹中的文件命名"],
      ["ア", "\"关联_\" + n + \"报告_\" + yymm + w + \"_\" + 作成者姓名", f95("zh", ["“关联_”", "n", "“_报告_”", "yymm", "w", "作成者姓名"])],
      ["イ", "\"关联_\" + nn + \"报告_\" + yymm + w + \"_\" + 作成者姓名", f95("zh", ["“关联_”", "nn", "“_报告_”", "yymm", "w", "作成者姓名"])],
      ["ウ", "\"报告_\" + yymm + w + \"_\" + 作成者姓名 + \"_关联_\" + n", f95("zh", ["“报告_”", "yymm", "w", "作成者姓名", "“_关联_”", "n"])],
      ["エ", "\"报告_\" + yymm + w + \"_\" + 作成者姓名 + \"_关联_\" + nn", f95("zh", ["“报告_”", "yymm", "w", "作成者姓名", "“_关联_”", "nn"])],
    ],
    en: [
      ["stem", "name the files in the \"Reports\" folder so that", "name the files in the “Reports” folder so that"],
      ["ア", "\"related_\" + n + \"report_\" + yymm + w + \"_\" + author name", f95("en", ["“related_”", "n", "“_report_”", "yymm", "w", "author name"])],
      ["イ", "\"related_\" + nn + \"report_\" + yymm + w + \"_\" + author name", f95("en", ["“related_”", "nn", "“_report_”", "yymm", "w", "author name"])],
      ["ウ", "\"report_\" + yymm + w + \"_\" + author name + \"_related_\" + n", f95("en", ["“report_”", "yymm", "w", "author name", "“_related_”", "n"])],
      ["エ", "\"report_\" + yymm + w + \"_\" + author name + \"_related_\" + nn", f95("en", ["“report_”", "yymm", "w", "author name", "“_related_”", "nn"])],
    ],
  },
  // ── 選択肢 ──────────────────────────────────────────────────────────────────
  "2013h25a-q017": { jp: [["イ", "発注先のべンダが共同で", "発注先のベンダが共同で"]] },
  "2013h25a-q043": {
    jp: [
      ["ア", "業務要件の定義, システム要件定義, ソフトウェア要件定義", "業務要件の定義，システム要件定義，ソフトウェア要件定義"],
      ["イ", "業務要件の定義 ソフトウェア要件定義 システム要件定義", "業務要件の定義，ソフトウェア要件定義，システム要件定義"],
      ["ウ", "システム要件定義, 業務要件の定義 ソフトウェア要件定義", "システム要件定義，業務要件の定義，ソフトウェア要件定義"],
      ["エ", "システム要件定義 ソフトウェア要件定義, 業務要件の定義", "システム要件定義，ソフトウェア要件定義，業務要件の定義"],
    ],
  },
  "2013h25a-q066": {
    jp: [["ウ", "クロック周波数を高くして，複数のコアで高速処理を実現する。", "クロック周波数を高くして高速処理を実現する。"]],
    zh: [["ウ", "临时提高时钟频率，用多个核心实现高速处理。", "临时提高时钟频率，实现高速处理。"]],
    en: [["ウ", ", achieving high-speed processing with multiple cores.", ", achieving high-speed processing."]],
  },
  "2013h25a-q074": { jp: [["ア", "順番に変えなかがらサーバに", "順番に変えながらサーバに"]] },
  "2013h25a-q075": { jp: [["ウ", "バックアップから復元できるようにする。", "バックアップから復旧できるようにする。"]] },
  "2013h25a-q100": {
    jp: [["ア", "取り出されていた平均時間を取得できる。", "取り出されていた時間を取得できる。"]],
    zh: [["ア", "以及被取出期间的平均时长。", "以及被取出期间的时长。"]],
    en: [["ア", "and the average length of time it was taken out can be obtained.", "and the length of time it was taken out can be obtained."]],
  },
};

// ── 解説 (.phase2 が真相源 → 再 merge) ─────────────────────────────────────
//  q100: correct は選択肢アの「取り出されていた平均時間」を引いて導出している → 源どおりの「時間」に追随 (zh / en も)。
//        イの why_wrong「回数と平均時間そのものは取得できる」はイ自身の文言 (源も「平均時間」) なので不変。
//  q075: why_wrong ウ jp の「復元できるようにする」は選択肢の言い換えなので源の「復旧」に揃える。zh「恢复」/ en "restored" は訳として正 → 不変。
const EXPL = {
  "2013h25a-q100": {
    correctSub: {
      jp: [["各イベントの〈戻した時刻 − 取り出した時刻〉を平均すれば「取り出されていた平均時間」が求められます。", "各イベントの〈戻した時刻 − 取り出した時刻〉から「取り出されていた時間」が求められます。"]],
      zh: [["把各次事件的〈放回时刻 − 取出时刻〉取平均，就能求出「被取出期间的平均时长」。", "由各次事件的〈放回时刻 − 取出时刻〉就能求出「被取出期间的时长」。"]],
      en: [["and averaging 〈time returned − time taken out〉 over those events gives the average length of time it was taken out.", "and 〈time returned − time taken out〉 for each event gives the length of time it was taken out."]],
    },
  },
  "2013h25a-q075": { dist: { ウ: { jp: ["バックアップを取得して破壊や改ざんから復元できるようにするのは", "バックアップを取得して破壊や改ざんから復旧できるようにするのは"] } } },
};

const MARK = "fidfix-S129-b5";
const pg = (id) => { const b = JSON.parse(readFileSync(P("data/ip/exams/question_bank.json"), "utf-8")).questions.find((x) => x.id === id); return `page-${String(b.source.page_number).padStart(2, "0")}`; };

// D-143: final の note_jp のみ追記。round1 は不可触。対象 = 語義是正 + 正解肢命中 + note が腐敗を述べている題。
//   語義: q001 q066 q074 q075 q085 q095 q100 / 正解肢命中: q043 (ア、字種のみ) q095 (エ) q100 (ア) / note 言及: q017 (「べンダ」)
//   追記しない (引用符・字種のみ、note に言及なし): q014 q018 q091 q094
const NOTE_APPEND = {
  "2013h25a-q001": (p) => `（S129 B5: ${p} 実読で 題幹の「A社は新たなシステムの開発」を源の「A社では…」に是正（「で」の脱落）。職務著作により A社の社員・派遣社員による開発 (③) だけが必要 = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2013h25a-q017": (p) => `（S129 B5: ${p} 実読で 選択肢イの「べンダ」(平仮名べ) を源の「ベンダ」に是正済み（上記の字形揺れの記述は是正前の状態）。誤答肢のため、RFP は依頼元が候補ベンダに提案を求めて作成する = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2013h25a-q043": (p) => `（S129 B5: ${p} 実読で 選択肢ア〜エの区切りを源の「，」に是正（イ〜エは読点 4 箇所の脱落で要件名が空白だけで並んでいた、アは ASCII「, 」の字種のみ）。アは**正解肢**だが変更は区切りのみで、業務要件→システム要件→ソフトウェア要件の順 = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2013h25a-q066": (p) => `（S129 B5: ${p} 実読で 選択肢ウの源に無い「，複数のコアで」を削除（zh / en 追随）。ウは負荷に応じたクロック周波数の一時引上げ (ターボ機能) の説明で誤り、一つの CPU 内の複数コアで別処理を並列実行 = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2013h25a-q074": (p) => `（S129 B5: ${p} 実読で 選択肢アの「変えなかがら」を源の「変えながら」に是正済み（上記の OCR 誤りの記述は是正前の状態）。誤答肢 (ポートスキャン) のため、修正プログラム提供前に脆弱性を突く = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2013h25a-q075": (p) => `（S129 B5: ${p} 実読で 選択肢ウの「復元」を源の「復旧」に是正（解説ウ jp 追随）。ウは可用性・完全性の対策で、暗号化 = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2013h25a-q085": (p) => `（S129 B5: ${p} 実読で 設問文の「Aさんが参加した以降の」に源の「6月」を補う（zh / en 追随）。参加前 6 本 → 4 人、A さん参加で 5 人 → 5×4÷2 = 10 = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2013h25a-q095": (p) => `（S129 B5: ${p} 実読で 選択肢ア〜エを源どおりに是正済み: 区切りを “”、ア / イの “_報告_” の先頭 _ を復元、4 肢とも源に無い “_” (作成者氏名の直前) を削除、連結記号は表1 ③ と同じ ＋（zh / en 追随）。設問文の「報告書」も源の “報告書” に。エは**正解肢**だが正誤を決める要素 (先頭が “報告_” か / 連番が nn か) は不変で、業務報告書と同じ先頭 + 上限 12 件に 2 桁 = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2013h25a-q100": (p) => `（S129 B5: ${p} 実読で 選択肢アの源に無い「平均」を削除し「取り出されていた時間を取得できる」に是正（zh / en・解説 correct 追随）。アは**正解肢**で、記録されるのは雑誌 ID・棚・取出し / 戻し時刻のみなので回数と取り出されていた時間は得られ、利用者属性 (イ・ウ) や実人数 (エ) は得られない = アという導出・correct_answer=ア は不変 — ${MARK}）`,
};
// ── 適用 ──────────────────────────────────────────────────────────────────────
const exams = [...new Set(Object.keys(FIX).map((id) => id.split("-q")[0]))];
const noteExams = [...new Set(Object.keys(NOTE_APPEND).map((id) => id.split("-q")[0]))];
const Qdoc = rj(P("data/ip/quiz/questions.json")); const Bdoc = rj(P("data/ip/exams/question_bank.json")); const Barr = Bdoc.questions ?? Bdoc;
const BY = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/exams/by_year", `${e}.json`))]));
const TR = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/quiz/translations", `${e}.json`))]));
const GR = Object.fromEntries(noteExams.map((e) => [e, rj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`))]));

for (const [id, fx] of Object.entries(FIX)) {
  const exam = id.split("-q")[0];
  const qq = Qdoc.questions.find((x) => x.id === id), b = Barr.find((x) => x.id === id), y = BY[exam].questions.find((x) => x.id === id), t = TR[exam].questions[id];
  const t1f = P("data/ip/quiz/.phase1", `tr_${id}.json`); const t1 = existsSync(t1f) ? rj(t1f) : null;
  for (const [field, from, to] of fx.jp ?? []) {
    if (field === "stem") {
      for (const [o, w] of [[qq, "questions.stem_jp"], [b, "question_bank.stem_jp"], [y, "by_year.stem_jp"]]) sub(o, "stem_jp", from, to, `${id} ${w}`);
      if (t?.stem_jp_clean) sub(t, "stem_jp_clean", from, to, `${id} translations.stem_jp_clean`);
      if (t1?.stem_jp_clean) sub(t1, "stem_jp_clean", from, to, `${id} .phase1 tr_.stem_jp_clean`);
    } else for (const [o, w] of [[qq, "questions"], [b, "question_bank"], [y, "by_year"]]) sub(o.choices_jp, field, from, to, `${id} ${w}.choices_jp.${field}`);
  }
  for (const lang of ["zh", "en"]) for (const [field, from, to] of fx[lang] ?? []) {
    if (field === "stem") { sub(t.stem, lang, from, to, `${id} translations.stem.${lang}`); if (t1) sub(t1.stem, lang, from, to, `${id} .phase1 tr_.stem.${lang}`); }
    else { sub(t.choices[field], lang, from, to, `${id} translations.choices.${field}.${lang}`); if (t1) sub(t1.choices.find((c) => c.letter === field), lang, from, to, `${id} .phase1 tr_.choices.${field}.${lang}`); }
  }
  if (t1) wj(t1f, t1);
}
wj(P("data/ip/quiz/questions.json"), Qdoc); wj(P("data/ip/exams/question_bank.json"), Bdoc);
for (const e of exams) { wj(P("data/ip/exams/by_year", `${e}.json`), BY[e]); wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]); }

// expl は id ごとに 1 回だけ読み、全ループで共有する。
const EXPLDOC = new Map();
const expl = (id) => {
  if (!EXPLDOC.has(id)) {
    const jf = P("data/ip/quiz/.phase2", `expl_jp_${id}.json`), tf = P("data/ip/quiz/.phase2", `expl_tr_${id}.json`);
    EXPLDOC.set(id, { jf, tf, j: rj(jf), tr: rj(tf) });
  }
  return EXPLDOC.get(id);
};
for (const [id, ex] of Object.entries(EXPL)) {
  const { j, tr } = expl(id);
  for (const [L, d] of Object.entries(ex.dist ?? {})) {
    const dj = j.distractors_jp.find((x) => x.letter === L), dt = tr.distractors.find((x) => x.letter === L);
    if (!dj || !dt) throw new Error(`${id} distractor ${L} missing`);
    if (d.jp) sub(dj, "why_wrong_jp", d.jp[0], d.jp[1], `${id} expl_jp.${L}`);
    if (d.zh) sub(dt, "zh", d.zh[0], d.zh[1], `${id} expl_tr.${L}.zh`);
    if (d.en) sub(dt, "en", d.en[0], d.en[1], `${id} expl_tr.${L}.en`);
  }
  if (ex.correctSub) {
    for (const [f, t] of ex.correctSub.jp ?? []) sub(j, "correct_jp", f, t, `${id} expl_jp.correct_jp`);
    for (const [f, t] of ex.correctSub.zh ?? []) sub(tr.correct, "zh", f, t, `${id} expl_tr.correct.zh`);
    for (const [f, t] of ex.correctSub.en ?? []) sub(tr.correct, "en", f, t, `${id} expl_tr.correct.en`);
  }
}
for (const { jf, tf, j, tr } of EXPLDOC.values()) { wj(jf, j); wj(tf, tr); }

for (const [id, mk] of Object.entries(NOTE_APPEND)) {
  const r = GR[id.split("-q")[0]].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  r.key_guard.note_jp = `${r.key_guard.note_jp}${mk(pg(id))}`; applied++; log.push(`  ✓ ${id} final note: 追記 (${pg(id)}, round1 untouched)`);
}
for (const e of noteExams) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);

console.log(log.join("\n"));
console.log(`  files ${DRY ? "to write" : "written"} (${written.length}): ${written.join(", ")}`);
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S129-b5: applied ${applied}, skipped ${skipped}`);
