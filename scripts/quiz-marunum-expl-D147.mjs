#!/usr/bin/env node
// D-147 §6 (S124 拡張) — 丸数字列挙の区切り字種を **解説層** でも統一する決定的脚本 (attempt 2)。
// ADR: docs/decisions/D-147-marunum-separator.md §6 (Session 124)。choices 側は quiz-marunum-sep-D147.mjs (S123)。
// attempt 1 の失敗: failures/quiz_marunum_expl_S124_attempt_1.md (散文の節境界の読点を列挙区切りと誤認 4 field、
//   note_jp 内の zh 引用に jp 字種 1 field)。
//
// 背景 (S124 §0 実測): S123 で choices を「①, ②」に統一した結果、同じ 23 問の解説 (distractors の「①②」引用、
//   correct の「①②③のうち」等) が旧形のまま残り、同一問内で旧新併存になった (2019h31h-q062 が実例)。
//
// 何をするか: D-147 と**同一の 23 問ホワイトリスト**で、解説の真相源 (.phase2) の
//   jp : expl_jp_<id>.json  correct_jp / distractors_jp[].why_wrong_jp / points_jp[]   → 「①, ②」
//   zh : expl_tr_<id>.json  correct.zh / distractors[].zh / points[].zh                  → 「①、②」
//   en : expl_tr_<id>.json  correct.en / distractors[].en / points[].en                  → 「①, ②」(「and」形は不変)
//   を書換え、`quiz-phase2-merge.mjs <exam>` で sidecar data/ip/quiz/explanations/<exam>.json を再生成する
//   (S124 で 15 exam の merge 冪等性 = git diff 0 を事前確認済)。
//
// 節境界ガード (attempt 2、散文に当てるための必須条件):
//   置換は丸数字の**連 (run)** 単位で判定する。run = 丸数字が (空白* [,，、]? 空白*) だけを挟んで連続する最大列。
//   次のいずれかに該当する run を 1 つでも含む **field は丸ごと不触** (SKIP 一覧に出す、人間確認へ。
//   同じ文の中で新旧の区切りが混ざるのを防ぐため run 単位ではなく field 単位で止める):
//     (a) run 内の区切りが混在   例「②③、⑧」= 「②③」は列挙、「、⑧」は文の読点 (別の節)
//     (b) run 内で丸数字が重複   例「④，④」「②④，②」= 列挙ではなく節の切れ目
//   choices (S123) は裸の列挙で節境界が存在しないため、このガードは choices 脚本には不要だった。
//
// 何をしないか:
//   - **key_guard の note_jp (final / round1) は対象外**。内部メタで zh/en の引用を含み (「zh「①、③」」)、
//     字種だけの変更で D-143 の round1 併記を増やすため (attempt 1 MAJOR-2 / MINOR-2)
//   - 正規表現の構造的安全性は D-147 脚本と同じ: 「①と③」「① and ③」「①→②」「①〜③」は run を構成しない
//   - 23 問以外 (題幹項目を散文で引用する 34 問) は範囲外 (D-147 §5 / S124 ユーザー判断)
//
// Run: node scripts/quiz-marunum-expl-D147.mjs            # dry-run 既定 (書込まない)
//      node scripts/quiz-marunum-expl-D147.mjs --apply    # 全 field 書込 → 影響 exam の phase2-merge 再実行

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APPLY = process.argv.includes("--apply");
const P = (...s) => path.join(ROOT, ...s);
const rj = (f) => JSON.parse(readFileSync(f, "utf-8"));
const wj = (f, d) => { if (APPLY) writeFileSync(f, JSON.stringify(d, null, 2) + "\n"); };

// D-147 の 23 問 (quiz-marunum-sep-D147.mjs と同一リスト)
const IDS = [
  "2010h22a-q097", "2012h24a-q058", "2013h25a-q001", "2013h25a-q044", "2013h25h-q081",
  "2014h26a-q056", "2014h26h-q076", "2015h27h-q070", "2016h28a-q067", "2016h28h-q066",
  "2016h28h-q099", "2017h29a-q031", "2018h30a-q041", "2018h30a-q057", "2018h30a-q081",
  "2018h30h-q072", "2018h30h-q085", "2019h31h-q062", "2019r01a-q089", "2019r01a-q096",
  "2020r02o-q079", "2020r02o-q098", "2022r04-q052",
];
const SEP = { jp: ", ", zh: "、", en: ", " };
const RUN = /[①-⑳](?:[ \t　]*[,，、]?[ \t　]*[①-⑳])+/g;      // 丸数字の連
const SEG = /([①-⑳])([ \t　]*[,，、]?[ \t　]*)(?=[①-⑳])/g;    // run 内の「丸数字 + 区切り」
const cp = (s) => (s === "" ? "NONE" : [...s].map((c) => (c === " " ? "SP" : c === "　" ? "IDSP" : "U+" + c.codePointAt(0).toString(16).toUpperCase())).join(""));

// 1 文字列を正規化。戻り値 { text, changed:[区切り字種], skipped:[run] }
export function normalize(s, lang) {
  const changed = [], skipped = [];
  if (typeof s !== "string") return { text: s, changed, skipped };
  const text = s.replace(RUN, (run) => {
    const nums = [...run].filter((c) => /[①-⑳]/.test(c));
    const seps = [...run.matchAll(SEG)].map((m) => m[2]);
    const mixed = new Set(seps).size > 1, dup = new Set(nums).size < nums.length;
    if (mixed || dup) { skipped.push(`${run}${mixed ? "[MIXED]" : ""}${dup ? "[DUP]" : ""}`); return run; }
    if (seps.every((x) => x === SEP[lang])) return run;
    changed.push(...new Set(seps.map(cp)));
    return run.replace(SEG, (_m, a) => a + SEP[lang]);
  });
  // SKIP run を 1 つでも含む field は原文を返す (同一文内で新旧の区切りが混ざるのを API 単体でも防ぐ)
  return skipped.length ? { text: s, changed: [], skipped } : { text, changed, skipped };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  let changedQ = 0, fields = 0, nSkip = 0; const rows = []; const skips = []; const touchedExams = new Set(); const pending = [];

  const fix = (obj, key, lang, label, acc, id) => {
    const v = obj?.[key]; if (typeof v !== "string") return;
    const r = normalize(v, lang);
    for (const sk of r.skipped) skips.push(`${id} ${label} run=「${sk}」 ctx=…${v.slice(Math.max(0, v.indexOf(sk.replace(/\[.*$/, "")) - 10), v.indexOf(sk.replace(/\[.*$/, "")) + 14)}…`);
    if (r.skipped.length || r.text === v) return;          // SKIP field は normalize() が原文を返す
    obj[key] = r.text; acc.push(`${label}[${[...new Set(r.changed)].join("|")}]`);
  };

  for (const id of IDS) {
    const exam = id.split("-q")[0];
    const jf = P("data/ip/quiz/.phase2", `expl_jp_${id}.json`), tf = P("data/ip/quiz/.phase2", `expl_tr_${id}.json`);
    if (!existsSync(jf) || !existsSync(tf)) throw new Error(`${id}: .phase2 expl_jp/expl_tr missing`);
    const j = rj(jf), tr = rj(tf); const acc = [];
    fix(j, "correct_jp", "jp", "correct.jp", acc, id);
    for (const d of j.distractors_jp ?? []) fix(d, "why_wrong_jp", "jp", `dist.${d.letter}.jp`, acc, id);
    (j.points_jp ?? []).forEach((_, i) => fix(j.points_jp, i, "jp", `points[${i}].jp`, acc, id));
    for (const lang of ["zh", "en"]) {
      fix(tr.correct, lang, lang, `correct.${lang}`, acc, id);
      for (const d of tr.distractors ?? []) fix(d, lang, lang, `dist.${d.letter}.${lang}`, acc, id);
      (tr.points ?? []).forEach((p, i) => fix(p, lang, lang, `points[${i}].${lang}`, acc, id));
    }
    rows.push({ id, n: acc.length, acc }); fields += acc.length;
    if (acc.length) { changedQ++; touchedExams.add(exam); pending.push([jf, j], [tf, tr]); }
  }
  nSkip = skips.length;

  console.log(`D-147 §6 解説層 丸数字区切り正規化 (attempt 2) — 対象 ${IDS.length} 問 / jp="${SEP.jp}" zh="${SEP.zh}" en="${SEP.en}"\n`);
  for (const r of rows) console.log(r.id.padEnd(16) + String(r.n).padStart(3) + "  " + (r.acc.join(" ") || "-"));
  console.log(`\n変更のあった問: ${changedQ} / ${IDS.length}、書換 field 数: ${fields}、影響 exam: ${[...touchedExams].sort().join(" ") || "-"}`);
  console.log(`節境界ガードで SKIP した run: ${nSkip} (置換せず、人間確認へ)`);
  for (const s of skips) console.log("  SKIP " + s);

  if (APPLY && pending.length) {
    for (const [f, d] of pending) wj(f, d);                     // 全 field を先に書き切る
    for (const exam of [...touchedExams].sort()) {              // それから merge (失敗時は stderr を透過して停止)
      execFileSync(process.execPath, [P("scripts/quiz-phase2-merge.mjs"), exam], { stdio: ["ignore", "pipe", "inherit"] });
      console.log(`  ✓ phase2-merge ${exam}`);
    }
  }
  console.log(`${APPLY ? "✓ applied" : "(dry-run) 書込んでいません — --apply で適用"}`);
}
