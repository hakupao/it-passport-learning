#!/usr/bin/env node
// Stage 6 / Quiz — S130 X track **X3** (母数外 88 題: 2019r01a 48 / 2020r02o 40、Sonnet 5 単 pass、D-150 §3) の差分を是正する。
// 源: S130 の workflow `wf_dcadc3ca-7da`。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/x3_fidelity_multi_sn.json
//     マニフェスト = data/ip/quiz/.phase2/x3_fidelity_input_multi.json (precrop 82/88、next/prev 88/88)
//     機械 diff = node scripts/quiz-fidelity-machdiff.mjs <manifest> <結果>
//               → same 424 / AGENT_MISSED 16 / REPORTED 0 / TRANSCRIPT_PREFIX 0 / QUOTE_ASCII 0 / VERDICT_CONFLICT 0 (exit 0)
//                 実残差 = 2019r01a-q017 イ の読点脱落のみ。他は a/b 組合せ選択肢の「/」区切り (q065 / 2020r02o-q041 / q081)、
//                 表の見出し行の補い (2019r01a-q034 / 2020r02o-q033、A4 体裁差)、q082 の図の code block (描画補助)。
//
// 層・方針は quiz-fidfix-S129-b13 と同じ (sidecar 再 merge 禁止、stem は raw 3 層 + stem_jp_clean、key_guard note は final のみ、MARK 冪等)。
// 2 exam とも sidecar のキーは `stem` / `choices` / `stem_jp_clean`。`choices_jp_clean` は無い → 選択肢は raw 3 層が出荷層。中問なし。
// 読点: ASCII「, 」は exam 全体の型 (⑨、不変)。「、」→「，」は D-170 により field 内で字形が混在するか、その field を既に書き換える場合だけ
//   (本 unit では 2020r02o-q071 のみ)。「、」だけで一貫した field (2019r01a-q005 q022 q035 q058 選択肢、2020r02o-q033 q037 q048 q095) は ⑨。
// stem の全置換 (allJp) は表示層 (stem_jp_clean) に件数 assert で当て、raw は同じ件数のときだけ当てる (raw が別文の題は skip を記録)。
//
// 採用した差分 (evidence `evidence/quiz_X3_S130.md` §4。源 crop / 源ページを原寸で独立実読して確認):
//   引用符 (D-155): 2019r01a-q070「EGE」「FAX」、q082「020」、q099「?」「*」「データ」、2020r02o-q057「社員」、q071 式 → “”
//   語中空白: 2019r01a-q058「適 切」、2020r02o-q021「戦 略」、q083「投 影」、q070 ウ「データ を」
//   読点: 2019r01a-q017 イ 脱落 (machdiff)、2020r02o-q070 ア / ウ・q018 エ「,」→「, 」(field 内混在)、2020r02o-q071「、」→「，」(D-170)
//   D-162: 2019r01a-q076 式の ＊ ／ → * / (範囲の「：」は原典どおり)     範囲記号 (D-155): 2020r02o-q079「①~④」・q094「①~③」→「～」
//   zh / en: 2019r01a-q099 選択肢 ア〜エの訳揺れ (イ / エ が未訳、ア / ウ だけ [表] 付き) を解説と同じ 数据 / data に統一 (エ = **正解肢**)、
//            en の「」 (D-156): 2019r01a-q099 題幹・解説、2020r02o-q071 題幹・解説
//
// Run: node scripts/quiz-fidfix-S130-x3.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S130-x3.mjs --apply
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2019r01a && node scripts/quiz-phase2-merge.mjs 2020r02o
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

function subAll(obj, key, from, to, where, expect) {
  const s = obj?.[key];
  if (typeof s !== "string") { log.push(`  ⚠ ${where}: field ${key} missing`); return false; }
  const n = s.split(from).length - 1;
  if (n === 0) { skipped++; return false; }
  if (expect !== undefined && n !== expect) throw new Error(`${where}: 「${from}」 が ${n}× (想定 ${expect}×) — abort`);
  obj[key] = s.split(from).join(to); applied++; log.push(`  ✓ ${where}: 「${from}」→「${to}」 ×${n}`); return true;
}

// q099: 源 p43 の表は ?データ* 等。sidecar の zh / en はア / ウだけ訳して [表] / [table] を付け、イ / エ は jp のまま (エ = 正解肢)。
//   解説 zh / en は ?数据* / ?data* で書かれている → 選択肢をそれに揃え、接頭辞は他題の zh / en (q065 等) と同じく外す。
const Q099 = {
  "ア": ["[表] a: ?数据*　b: ?数据", "a: ?数据*　b: ?数据", "[table] a: ?data*　b: ?data", "a: ?data*　b: ?data"],
  "イ": ["a: ?データ*　b: *データ", "a: ?数据*　b: *数据", "a: ?データ*　b: *データ", "a: ?data*　b: *data"],
  "ウ": ["[表] a: *数据*　b: ?数据", "a: *数据*　b: ?数据", "[table] a: *data*　b: ?data", "a: *data*　b: ?data"],
  "エ": ["a: *データ*　b: *データ", "a: *数据*　b: *数据", "a: *データ*　b: *データ", "a: *data*　b: *data"],
};

const Q099_P1 = [["ア", "a: ?データ*　b: ?データ", "a: ?数据*　b: ?数据", "a: ?data*　b: ?data"], ["ウ", "a: *データ*　b: ?データ", "a: *数据*　b: ?数据", "a: *data*　b: ?data"]];

// jp: [field, from, to] = sub (raw 3 層 + clean)。jpAll: [field, from, to, expect] = 表示層に件数 assert で全置換。
const FIX = {
  // ── 2019r01a 題幹 ───────────────────────────────────────────────────────────
  // q058: 源 crop「記述のうち，適切なもの」(行分割残骸)。clean 無し。
  "2019r01a-q058": { jp: [["stem", "うち, 適 切なもの", "うち, 適切なもの"]] },
  // q070: 源 p30 は “EGE”、表見出し “FAX”。zh「」は ⑨-c、en は既に “”。
  "2019r01a-q070": {
    jp: [["stem", "結果が「EGE」であるとき", "結果が“EGE”であるとき"]],
    jpAll: [["stem", "「FAX」", "“FAX”", 2]],
  },
  // q076 (D-162): 源 p33 は “B$1＊合計(B$3：B3)／個数(B$3：B3)”。演算子だけ ASCII、範囲の「：」は原典どおり。
  "2019r01a-q076": {
    jp: [["stem", "B$1＊合計(B$3：B3)／個数(B$3：B3)", "B$1*合計(B$3：B3)/個数(B$3：B3)"]],
    zh: [["stem", "B$1＊合计(B$3：B3)／计数(B$3：B3)", "B$1*合计(B$3：B3)/计数(B$3：B3)"]],
    en: [["stem", "B$1＊SUM(B$3：B3)／COUNT(B$3：B3)", "B$1*SUM(B$3：B3)/COUNT(B$3：B3)"]],
  },
  // q082: 源 p35 は “020”。clean の図の言語化の括弧 (「020」に続く先頭の□ 等) は不変 (§4c、描画補助・桁数を書かない) だが、
  //   引用符は field 内で揃える (3 箇所)。zh「」は ⑨-c、en は既に “”。
  "2019r01a-q082": { jpAll: [["stem", "「020」", "“020”", 3]] },
  // q099: 源 p43 は “?” “*” “データ”×2。
  "2019r01a-q099": {
    jp: [["stem", "任意の1文字を表す「?」と，長さゼロ以上の任意の文字列を表す「*」を", "任意の1文字を表す“?”と，長さゼロ以上の任意の文字列を表す“*”を"]],
    jpAll: [["stem", "「データ」", "“データ”", 2]],
    // .phase1 の tr_ は 4 肢とも jp のまま (接頭辞なし) → ア / ウはその形の from も足す (sidecar では n=0 で skip)。
    zh: [...Object.entries(Q099).map(([L, [zf, zt]]) => [L, zf, zt]), ...Q099_P1.map(([L, f, zt]) => [L, f, zt])],
    en: [
      ...Object.entries(Q099).map(([L, [, , ef, et]]) => [L, ef, et]),
      ...Q099_P1.map(([L, f, , et]) => [L, f, et]),
      ["stem", "that use the「?」symbol representing any single character and the「*」symbol", "that use the “?” symbol representing any single character and the “*” symbol"],
      ["stem", "all strings containing“データ”(data) match", "all strings containing “データ” (data) match"],
      ["stem", "all strings ending with“データ”(data) match", "all strings ending with “データ” (data) match"],
    ],
  },
  // ── 2019r01a 選択肢 (raw = 出荷層) ───────────────────────────────────────────
  // q017 イ: 源 crop「導入することで，既存商品」(machdiff 実残差、agent CLEAN)。field の字種「, 」。
  "2019r01a-q017": { jp: [["イ", "導入することで既存商品", "導入することで, 既存商品"]] },
  // ── 2020r02o 題幹 ───────────────────────────────────────────────────────────
  // q021 / q083: 源 crop は「戦略的」「投影し」(行分割残骸)。clean 無し。
  "2020r02o-q021": { jp: [["stem", "事業の戦 略的位置付け", "事業の戦略的位置付け"]] },
  "2020r02o-q083": { jp: [["stem", "映像などを投 影し", "映像などを投影し"]] },
  // q057: 源 crop は “社員” 表。
  "2020r02o-q057": { jp: [["stem", "管理する「社員」表", "管理する“社員”表"]] },
  // q071: 源 p32 は 式“条件付個数 (B2:D2,＞15000)” と「，」×3。field を引用符で書き換えるので「、」も当てる (D-170)。
  //   ＞ は ASCII > のまま (D-162 範囲注記: 式中で ASCII に同字がある記号は ASCII 側)。
  "2020r02o-q071": {
    jp: [["stem", "式「条件付個数(B2:D2,>15000)」を", "式“条件付個数(B2:D2,>15000)”を"]],
    jpAll: [["stem", "、", "，", 3]],
    en: [["stem", "the formula 「CountIf(B2:D2,>15000)」 in cell E2", "the formula “CountIf(B2:D2,>15000)” in cell E2"]],
  },
  // q079: 源 crop「①～④」(範囲記号は原典どおり、D-155)。raw は OCR 崩れの別文 → skip。
  "2020r02o-q079": { jp: [["stem", "次の①~④のうち", "次の①～④のうち"]] },
  // q094: 源 crop「①～③のインシデント」(q079 と同型、PHASE 2 の残存語走査で追加)。raw は OCR 崩れの別文 → skip。
  "2020r02o-q094": { jp: [["stem", "における①~③のインシデント", "における①～③のインシデント"]] },
  // ── 2020r02o 選択肢 ────────────────────────────────────────────────────────
  // q018 エ / q070 ア ウ: 源 p09 / p32 は「，」。field の字種「, 」に揃える。q070 ウは行分割残骸「データ を」も。
  "2020r02o-q018": { jp: [["エ", "製品,システム", "製品, システム"]] },
  "2020r02o-q070": {
    jp: [
      ["ア", "することなく,入力された", "することなく, 入力された"],
      ["ウ", "まとめたデータ を順次作成し,直前の", "まとめたデータを順次作成し, 直前の"],
      ["ウ", "関連付け,矛盾なく", "関連付け, 矛盾なく"],
    ],
  },
};

// ── 解説 (.phase2 が真相源 → 再 merge) ─────────────────────────────────────
//  q070: jp の暗号文字列の引用「EGE」等 → 題幹の字形 “” (B13 q062 の tmb / tjh と同型)。zh「」は ⑨-c、en は既に “”。
//  q082: jp「020」→ “020”。     q071: jp の式の引用 → “”、en「CountIf(…)」→ “” (D-156)。
//  q076: 式の ＊ ／ → * / (D-162、jp / zh / en。q076 の解説の ＊ ／ はすべて式の中、確認済み)。
//  q099: en の「」→ “” (D-156)。jp / zh の「?」等は ⑨ (§9)。
const EXPL = {
  "2019r01a-q070": { allJp: [["「EGE」", "“EGE”"], ["「DEB」", "“DEB”"], ["「CGG」", "“CGG”"], ["「GKK」", "“GKK”"], ["「IKI」", "“IKI”"]] },
  "2019r01a-q082": { allJp: [["「020」", "“020”"]] },
  "2020r02o-q071": { allJp: [["「条件付個数(B2:D2,>15000)」", "“条件付個数(B2:D2,>15000)”"]], allEn: [["「CountIf(B2:D2,>15000)」", "“CountIf(B2:D2,>15000)”"]] },
  "2019r01a-q076": { all: [["＊", "*"], ["／", "/"]] },
  "2019r01a-q099": { allEn: [["「", "“"], ["」", "”"]] },
};

const MARK = "fidfix-S130-x3";

// D-143: final の note_jp のみ追記。round1 は不可触。対象 = 正解肢命中 + note が是正対象の字句・是正前の表示に言及。
//   正解肢命中: 2019r01a-q099 (エ zh / en)
//   note 言及: q070 (「EGE」・「stem は源と逐字一致」) q076 (式 ＊／) q082 (「020」) q099 (「?」「*」・「choices_jp と図の表は一致」)
//   追記しない: 字種・空白のみで note が是正対象に言及しない題 (q017 q058 / 2020r02o 全題 = note 空)
const NOTE_APPEND = {
  "2019r01a-q070": (p) => `（S130 X3: ${p} 実読で 題幹の「EGE」「FAX」の引用符を源の “” に是正（解説の暗号文字列の引用も追随、上記の「逐字一致」は字形を除く）。EGE → DEB = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2019r01a-q076": (p) => `（S130 X3: ${p} 実読で 式の演算子 ＊ ／ を D-162 により ASCII の * / に揃えた（題幹 jp / zh / en・解説、上記の式は是正前の字形）。C5 = 1,000×18÷3 = 6,000 = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2019r01a-q082": (p) => `（S130 X3: ${p} 実読で 題幹の「020」の引用符を源の “” に是正（解説も）。図の言語化の括弧（各注記が指す□の範囲）は源図の括弧・引出線の範囲どおりで桁数を書かないため不変。3 + 10 = 13 桁 = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2019r01a-q099": (p) => `（S130 X3: ${p} 実読で 題幹の「?」「*」「データ」の引用符を源の “” に是正。zh / en の選択肢はイ / エだけ未訳・ア / ウだけ [表] 付きだったのを解説と同じ 数据 / data の表記に統一し、en の「」も “” に（D-156）。エは**正解肢**だが訳の表記統一のみで、a = *データ* / b = *データ = エという導出・correct_answer=エ は不変 — ${MARK}）`,
};
// ── 適用 ──────────────────────────────────────────────────────────────────────
const exams = [...new Set(Object.keys(FIX).map((id) => id.split("-q")[0]))];
const noteExams = [...new Set(Object.keys(NOTE_APPEND).map((id) => id.split("-q")[0]))];
const Qdoc = rj(P("data/ip/quiz/questions.json")); const Bdoc = rj(P("data/ip/exams/question_bank.json")); const Barr = Bdoc.questions ?? Bdoc;
const BY = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/exams/by_year", `${e}.json`))]));
const TR = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/quiz/translations", `${e}.json`))]));
const GR = Object.fromEntries(noteExams.map((e) => [e, rj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`))]));
const pg = (id) => `page-${String(Barr.find((x) => x.id === id).source.page_number).padStart(2, "0")}`;

for (const [id, fx] of Object.entries(FIX)) {
  const exam = id.split("-q")[0];
  const qq = Qdoc.questions.find((x) => x.id === id), b = Barr.find((x) => x.id === id), y = BY[exam].questions.find((x) => x.id === id), t = TR[exam].questions[id];
  const t1f = P("data/ip/quiz/.phase1", `tr_${id}.json`); const t1 = existsSync(t1f) ? rj(t1f) : null;
  const raw = [[qq, "questions"], [b, "question_bank"], [y, "by_year"]];
  for (const [field, from, to] of fx.jp ?? []) {
    if (field === "stem") {
      for (const [o, w] of raw) sub(o, "stem_jp", from, to, `${id} ${w}.stem_jp`);
      if (t?.stem_jp_clean) sub(t, "stem_jp_clean", from, to, `${id} translations.stem_jp_clean`);
      if (t1?.stem_jp_clean) sub(t1, "stem_jp_clean", from, to, `${id} .phase1 tr_.stem_jp_clean`);
    } else for (const [o, w] of raw) sub(o.choices_jp, field, from, to, `${id} ${w}.choices_jp.${field}`);
  }
  for (const [field, from, to, expect] of fx.jpAll ?? []) {
    if (field === "stem") {
      // 表示層 = clean があれば clean (件数 assert)、無ければ raw。.phase1 と raw は件数が同じときだけ (別文なら skip を記録)。
      if (t?.stem_jp_clean) subAll(t, "stem_jp_clean", from, to, `${id} translations.stem_jp_clean`, expect);
      const rest = [...(t1?.stem_jp_clean ? [[t1, "stem_jp_clean", ".phase1 tr_.stem_jp_clean"]] : []), ...raw.map(([o, w]) => [o, "stem_jp", `${w}.stem_jp`])];
      for (const [o, k, w] of rest) {
        const n = o[k].split(from).length - 1;
        if (t?.stem_jp_clean && n !== expect) { if (n) log.push(`  · ${id} ${w}: 別文 (「${from}」×${n}) — skip`); skipped++; continue; }
        subAll(o, k, from, to, `${id} ${w}`, expect);
      }
    } else for (const [o, w] of raw) subAll(o.choices_jp, field, from, to, `${id} ${w}.choices_jp.${field}`, expect);
  }
  for (const lang of ["zh", "en"]) for (const [field, from, to] of fx[lang] ?? []) {
    if (field === "stem") { sub(t.stem, lang, from, to, `${id} translations.stem.${lang}`); if (t1) sub(t1.stem, lang, from, to, `${id} .phase1 tr_.stem.${lang}`); }
    else { sub(t.choices[field], lang, from, to, `${id} translations.choices.${field}.${lang}`); if (t1) sub(t1.choices.find((c) => c.letter === field), lang, from, to, `${id} .phase1 tr_.choices.${field}.${lang}`); }
  }
  if (t1) wj(t1f, t1);
}
wj(P("data/ip/quiz/questions.json"), Qdoc); wj(P("data/ip/exams/question_bank.json"), Bdoc);
for (const e of exams) { wj(P("data/ip/exams/by_year", `${e}.json`), BY[e]); wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]); }

for (const [id, ex] of Object.entries(EXPL)) {
  const jf = P("data/ip/quiz/.phase2", `expl_jp_${id}.json`), tf = P("data/ip/quiz/.phase2", `expl_tr_${id}.json`);
  const j = rj(jf), tr = rj(tf);
  const jpAll = (from, to) => {
    subAll(j, "correct_jp", from, to, `${id} expl_jp.correct`);
    for (const d of j.distractors_jp) subAll(d, "why_wrong_jp", from, to, `${id} expl_jp.${d.letter}`);
    j.points_jp.forEach((_, i) => subAll(j.points_jp, i, from, to, `${id} expl_jp.points[${i}]`));
  };
  const trAll = (L, from, to) => {
    subAll(tr.correct, L, from, to, `${id} expl_tr.correct.${L}`);
    for (const d of tr.distractors) subAll(d, L, from, to, `${id} expl_tr.${d.letter}.${L}`);
    for (const [i, pt] of tr.points.entries()) subAll(pt, L, from, to, `${id} expl_tr.points[${i}].${L}`);
  };
  for (const [from, to] of ex.allJp ?? []) jpAll(from, to);
  for (const [from, to] of ex.allEn ?? []) trAll("en", from, to);
  for (const [from, to] of ex.all ?? []) { jpAll(from, to); trAll("zh", from, to); trAll("en", from, to); }
  wj(jf, j); wj(tf, tr);
}

for (const [id, mk] of Object.entries(NOTE_APPEND)) {
  const r = GR[id.split("-q")[0]].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  r.key_guard.note_jp = `${r.key_guard.note_jp}${mk(pg(id))}`; applied++; log.push(`  ✓ ${id} final note: 追記 (${pg(id)}, round1 untouched)`);
}
for (const e of noteExams) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);

console.log(log.join("\n"));
console.log(`  files ${DRY ? "to write" : "written"} (${written.length}): ${written.join(", ")}`);
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S130-x3: applied ${applied}, skipped ${skipped}`);
