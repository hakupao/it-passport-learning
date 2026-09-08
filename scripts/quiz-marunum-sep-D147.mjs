#!/usr/bin/env node
// D-147 — 丸数字列挙 (①②③) の**区切り字種**を出荷層で統一する決定的脚本。
// ADR: docs/decisions/D-147-marunum-separator.md (Session 123 lock)
//
// 何をするか (D-147 §1 / §3 / §4):
//   選択肢 (choices) の中で **丸数字 [①-⑳] と丸数字の間にある区切りだけ**を、言語ごとの規範字種に正規化する。
//     jp = ASCII コンマ + 半角空白「①, ②」  (D-147 §1: データセットの読点多数派 ≈65% + house rule + PASS 済 10 問不触)
//     zh = 中文頓号「①、②」                (D-147 §3: 並列は中文規範の頓号)
//     en = ASCII コンマ + 半角空白「①, ②」  (D-147 §3。ただし「① and ②」形は自然英語として**適合扱い**で書換えない)
//   区切りの**脱落** (「①②」) も D-147 §2 により是正対象 (源には区切りがあるため)。
//
// 何をしないか:
//   - **題幹 (stem) は一切触らない** (D-147 §4)。「①〜③」等のレンジ表記も対象外
//   - 区切りが**区切り記号以外のテキスト**である場合は触らない。正規表現が spaces + `[,，、]` 1 個しか
//     区切りとして受け付けないため、以下は構造的に不変:
//       「①と②」(日本語接続詞) / 「① and ②」「①and②」(英語接続詞、D-147 §3) / 「①→②」(順序矢印) /
//       「(②, ③) と (④, ⑤, ⑥)」の 「) と (」 / 「(②、③) 和 (④…」の 「）和（」 (中国語接続詞)
//   - en の数字様式 (① vs (1)) の統一は D-147 §3 で対象外 (⑨)。「(1) and (2)」形は丸数字を含まないので
//     正規表現に一切ヒットしない
//   - 対象は下記 IDS の **23 問のホワイトリストのみ**。他問・他 exam は触らない
//
// 対象 23 問の根拠 (S123 実測、D-147 §背景の 10 / 10 / 1 / 2 と一致):
//   jp 区切り  ASCII「, 」7 + ASCII「,」3 = **10** / 全角「，」U+FF0C **10** / 中文「、」U+3001 **1** / **脱落 2**
//   「①と②」(2013h25a-q087) / 「①→②」(2010h22a-q098) / 「①and②」(2011h23tokubetsu-q059) /
//   「d：③ e：①」(2010h22h-q095) / 表ヘッダの ①②③ (2020r02o-q094) は「丸数字の**組合せ**選択肢」ではないので
//   23 問に含めない (D-147 §背景の母数と一致する)。
//
// 層 (D-147 §4「choices 三層 + zh/en」):
//   jp  : data/ip/quiz/questions.json / data/ip/exams/question_bank.json / data/ip/exams/by_year/<exam>.json の choices_jp
//         (sidecar `choices_jp_clean` は 23 問すべてに**存在しない**ことを実測済 — 存在すれば自動で対象に入る)
//   zh/en: data/ip/quiz/translations/<exam>.json の choices.<L>.{zh,en}
//          + data/ip/quiz/.phase1/tr_<id>.json の choices[].{zh,en}
//          ※ sidecar は **再 merge 禁止** (S117 §10a 失敗②) のため、sidecar と .phase1 の両方に同じ正規化を当てる
//
// Run: node scripts/quiz-marunum-sep-D147.mjs            # dry-run 既定 (書込まない)
//      node scripts/quiz-marunum-sep-D147.mjs --apply    # 書込む

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APPLY = process.argv.includes("--apply");
const P = (...s) => path.join(ROOT, ...s);
const rj = (f) => JSON.parse(readFileSync(f, "utf-8"));
const wj = (f, d) => { if (APPLY) writeFileSync(f, JSON.stringify(d, null, 2) + "\n"); };

// D-147 §背景の実測で確定した 23 問 (丸数字の組合せが選択肢になっている問)。
const IDS = [
  "2010h22a-q097", "2012h24a-q058", "2013h25a-q001", "2013h25a-q044", "2013h25h-q081",
  "2014h26a-q056", "2014h26h-q076", "2015h27h-q070", "2016h28a-q067", "2016h28h-q066",
  "2016h28h-q099", "2017h29a-q031", "2018h30a-q041", "2018h30a-q057", "2018h30a-q081",
  "2018h30h-q072", "2018h30h-q085", "2019h31h-q062", "2019r01a-q089", "2019r01a-q096",
  "2020r02o-q079", "2020r02o-q098", "2022r04-q052",
];
const SEP = { jp: ", ", zh: "、", en: ", " };
const LETTERS = ["ア", "イ", "ウ", "エ"];

// 丸数字 → (空白* 区切り記号? 空白*) → 丸数字 の「間」だけを置換する。
// 区切りとして受け付けるのは半角/全角空白と `,` `，` `、` の 1 個まで。それ以外の文字 (と / and / → / ) 等) が
// 挟まると先読み [①-⑳] が外れて**一切マッチしない** = 構造的に安全。
const RE = /([①-⑳])([ \t　]*[,，、]?[ \t　]*)(?=[①-⑳])/g;
const norm = (s, lang) => (typeof s === "string" ? s.replace(RE, (_m, a) => a + SEP[lang]) : s);

const cp = (s) => (s === "" ? "(none)" : [...s].map((c) => (c === " " ? "SP" : c === "　" ? "IDSP" : "U+" + c.codePointAt(0).toString(16).toUpperCase())).join(""));
const seps = (o, lang) => {
  const set = new Set();
  for (const L of LETTERS) { const v = o?.[L]; const str = lang === "jp" ? v : v?.[lang];
    if (typeof str !== "string") continue;
    for (const m of str.matchAll(RE)) set.add(cp(m[2])); }
  return [...set].join(" | ") || "-";
};

let changed = 0, fields = 0; const rows = []; const touchedExams = new Set();

const Qdoc = rj(P("data/ip/quiz/questions.json"));
const Bdoc = rj(P("data/ip/exams/question_bank.json")); const Barr = Bdoc.questions ?? Bdoc;
const exams = [...new Set(IDS.map((id) => id.split("-q")[0]))];
const BY = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/exams/by_year", `${e}.json`))]));
const TR = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/quiz/translations", `${e}.json`))]));

for (const id of IDS) {
  const exam = id.split("-q")[0];
  const q = Qdoc.questions.find((x) => x.id === id);
  const b = Barr.find((x) => x.id === id);
  const y = BY[exam].questions.find((x) => x.id === id);
  const t = TR[exam].questions[id];
  if (!q || !b || !y || !t) throw new Error(`${id}: layer missing (q=${!!q} bank=${!!b} by_year=${!!y} sidecar=${!!t})`);
  const t1f = P("data/ip/quiz/.phase1", `tr_${id}.json`); const t1 = existsSync(t1f) ? rj(t1f) : null;

  const before = { jp: seps(q.choices_jp, "jp"), zh: seps(t.choices, "zh"), en: seps(t.choices, "en") };
  let n = 0;

  // 三層 (+ sidecar の jp clean があれば) の jp
  for (const [o, w] of [[q.choices_jp, "questions"], [b.choices_jp, "question_bank"], [y.choices_jp, "by_year"], [t.choices_jp_clean, "sidecar.choices_jp_clean"]]) {
    if (!o) continue;
    for (const L of LETTERS) { const v = o[L]; if (typeof v !== "string") continue; const nv = norm(v, "jp"); if (nv !== v) { o[L] = nv; n++; } }
    void w;
  }
  // zh / en (sidecar + .phase1)
  for (const lang of ["zh", "en"]) {
    for (const L of LETTERS) {
      const c = t.choices?.[L]; if (c && typeof c[lang] === "string") { const nv = norm(c[lang], lang); if (nv !== c[lang]) { c[lang] = nv; n++; } }
      const c1 = t1?.choices?.find?.((x) => x.letter === L);
      if (c1 && typeof c1[lang] === "string") { const nv = norm(c1[lang], lang); if (nv !== c1[lang]) { c1[lang] = nv; n++; } }
    }
  }

  const after = { jp: seps(q.choices_jp, "jp"), zh: seps(t.choices, "zh"), en: seps(t.choices, "en") };
  rows.push({ id, n, before, after, jp: LETTERS.map((L) => q.choices_jp[L]).join(" / ") });
  fields += n; if (n) { changed++; touchedExams.add(exam); }
  if (t1 && n) wj(t1f, t1);
}

if (fields) {
  wj(P("data/ip/quiz/questions.json"), Qdoc);
  wj(P("data/ip/exams/question_bank.json"), Bdoc);
  for (const e of exams) { wj(P("data/ip/exams/by_year", `${e}.json`), BY[e]); wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]); }
}

console.log(`D-147 丸数字区切り正規化 — 対象 ${IDS.length} 問 / jp="${SEP.jp}" zh="${SEP.zh}" en="${SEP.en}"\n`);
console.log("id".padEnd(22) + "n  " + "jp before → after".padEnd(30) + "zh before → after");
for (const r of rows) {
  console.log(r.id.padEnd(22) + String(r.n).padEnd(3) +
    `${r.before.jp} → ${r.after.jp}`.padEnd(30) + `${r.before.zh} → ${r.after.zh}`);
}
console.log(`\n変更のあった問: ${changed} / ${IDS.length}、書換 field 数: ${fields}`);
console.log(`${APPLY ? "✓ applied" : "(dry-run) 書込んでいません — --apply で適用"}`);
