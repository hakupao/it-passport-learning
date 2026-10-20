#!/usr/bin/env node
// Stage 6 / Quiz — S130 X track **X4** (母数外 102 題: 2022r04 25 / 2024r06 28 / 2025r07 20 / 2026r08 29、Sonnet 5 単 pass、D-150 §3) の差分を是正する。
// 源: 結果 JSON = evidence/phase5/stage_06_quiz_fidelity/x4_fidelity_multi_sn.json (CLEAN 93 / DISCREPANT 9、cosmetic 14、正解肢上 1)
//     マニフェスト = data/ip/quiz/.phase2/x4_fidelity_input_multi.json (precrop 101/102、next/prev 102/102、中問 member 0)
//     機械 diff = node scripts/quiz-fidelity-machdiff.mjs <manifest> <結果>
//               → same 482 / AGENT_MISSED 25 / REPORTED 3 / TRANSCRIPT_PREFIX 0 / QUOTE_ASCII 4 / VERDICT_CONFLICT 0
//                 実残差 = 2026r08-q057 ア〜エ (QUOTE_ASCII、既知 NIT-2)。他は図言語化 (2022r04-q079 / q090 / q097)、
//                 a/b 組合せ選択肢の「/」「／」区切り (2022r04-q097、2025r07-q030 / q037、2026r08-q080 / q099)、
//                 空欄の枠 (2025r07-q071)、表の「―」(2026r08-q050) = 既知型 → 不変。
//
// 層・方針は quiz-fidfix-S130-x2 と同じ (sidecar 再 merge 禁止、stem は stem_jp_clean があればそれ・無ければ raw 3 層、
//   選択肢は raw 3 層 (choices_jp_clean は無い)、.phase1 tr_ は別文なら skip、D-143 は final のみ、MARK 冪等)。
//   D-170: 「、」→「，」は field 内で字形が混在するか、その field を既に書き換える場合に限る。field 全体が「、」の型は ⑨ (evidence §2)。
//   ASCII「, 」/「,」(空白なし) は exam 全体の型で不変 (⑨)。コード片 (宣言「整数型: i, j, k」・注釈 /* … */) の読点は混在判定に数えない
//   (主 context J-2) → 2022r04-q078 (散文「、」×6 + 注釈「場合, j」) は不変 (⑨)。
//
// 採用した差分 (evidence `evidence/quiz_X4_S130.md` §4。源 crop を原寸で独立実読して確認):
//   引用符 (D-155): 2022r04-q065 題幹「」・選択肢ア〜エ ASCII " (ア = **正解肢**)、2022r04-q098、2024r06-q030、
//                   2024r06-q093 (“従業員” ‘%葉_’ “_” “%”)、2025r07-q066、2026r08-q057 選択肢ア〜エ ASCII " (ウ = **正解肢**) → “” / ‘’
//   読点 (D-170): 2022r04-q065 / 2024r06-q093 / 2025r07-q066 (同 field を書き換える)
//   行分割残骸: 2025r07-q002「ガ⏎イドライン」、2022r04-q080「情報システム と」、2024r06-q061 イ「ハードディスク に」
//   読点脱落: 2024r06-q005 ウ「学術機関 他の企業」→「学術機関, 他の企業」(field の字種「, 」)
//   表示書式: 2022r04-q059 選択肢イ〜エ に ア と同じ表見出し行を補う (エ = **正解肢**、2019r01a-q060 / 2020r02o-q092 と同形)
//   bank のみ: 2024r06-q093 figure_description「福葉小春」→「稲葉小春」(非出荷・gitignore 層、源 p42、計上外)
//
// Run: node scripts/quiz-fidfix-S130-x4.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S130-x4.mjs --apply
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs <exam>  (2022r04 2024r06 2025r07 2026r08)
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

function subAll(obj, key, from, to, where, expect, loose = false) {
  const s = obj?.[key];
  if (typeof s !== "string") { log.push(`  ⚠ ${where}: field ${key} missing`); return false; }
  const n = s.split(from).length - 1;
  if (n === 0) { skipped++; return false; }
  if (loose && expect !== undefined && n !== expect) { skipped++; log.push(`  · ${where}: 「${from}」 ${n}× ≠ ${expect}× = 別文 → skip (sidecar が出荷層)`); return false; }
  if (expect !== undefined && n !== expect) throw new Error(`${where}: 「${from}」 が ${n}× (想定 ${expect}×) — abort`);
  obj[key] = s.split(from).join(to); applied++; log.push(`  ✓ ${where}: 「${from}」→「${to}」 ×${n}`); return true;
}
// op = [field, from, to] (1 回) / [field, from, to, n] (n 回ちょうど、一括)。loose = .phase1 tr_ (sidecar と別文のことがある → 回数不一致は skip)
const op = (o, key, [, from, to, n], where, loose = false) => (n === undefined ? sub(o, key, from, to, where) : subAll(o, key, from, to, where, n, loose));

// 2022r04-q059: 源 p27 は 1 枚の表 (見出し 平均値 / 中央値)。表示はアだけが見出し行を持ち、イ〜エは見出しなしの 1 行
//   (parseChoice では「イ | 40 | 20」が見出し行として描画され、列名が出ない)。zh / en は 4 肢とも見出しつき。
const Q059H = "[表] | | 平均値 | 中央値 |\n|---|---|---|\n";
const Q059 = { "イ": "| イ | 40 | 20 |", "ウ": "| ウ | 300 | 20 |", "エ": "| エ | 300 | 40 |" };
// 2026r08-q057: 源 p27 の選択肢 (“学生”表の学生番号，“成績”表の学生番号 …)。表示は 4 肢とも ASCII "。
const Q057 = {
  "ア": ["\"学生\"表の学生番号，\"成績\"表の学生番号", "“学生”表の学生番号，“成績”表の学生番号"],
  "イ": ["\"学生\"表の学生名，\"科目\"表の科目名", "“学生”表の学生名，“科目”表の科目名"],
  "ウ": ["\"成績\"表の学生番号と科目コード", "“成績”表の学生番号と科目コード"],
  "エ": ["\"成績\"表の成績", "“成績”表の成績"],
};

const FIX = {
  // ── 2022r04 ────────────────────────────────────────────────────────────────
  // q065: 源 p29「条件①～⑤によって，… “従業員”表と“部門”表を作成した。“従業員”表の主キーとして，…」。
  //   選択肢は “従業員番号” / “従業員番号”と“部門コード” (語間空白なし) / “従業員名” / “部門コード”。zh は既に “”、en の ASCII " は ⑨-c。
  "2022r04-q065": {
    jp: [["stem", "「", "“", 3], ["stem", "」", "”", 3], ["stem", "、", "，", 2],
      ["ア", "\"従業員番号\"", "“従業員番号”"],
      ["イ", "\"従業員番号\" と \"部門コード\"", "“従業員番号”と“部門コード”"],
      ["ウ", "\"従業員名\"", "“従業員名”"],
      ["エ", "\"部門コード\"", "“部門コード”"]],
  },
  // q080: 源 p36 は行末「情報システム」+ 行頭「と連動」(空白なし)。clean 無し → raw 3 層。
  "2022r04-q080": { jp: [["stem", "情報システム と連動", "情報システムと連動"]] },
  // q098: 源 p44 “従業員”表。zh「」は ⑨-c、en は既に “”。
  "2022r04-q098": { jp: [["stem", "「従業員」", "“従業員”"]] },
  "2022r04-q059": { jp: Object.entries(Q059).map(([L, row]) => [L, `[表] ${row}`, `${Q059H}${row}`]) },
  // ── 2024r06 ────────────────────────────────────────────────────────────────
  // q005 ウ: 源 p3「国や学術機関，他の企業など」。field の字種は「, 」(exam の型) → 「, 」を補う。zh / en は読点あり。
  "2024r06-q005": { jp: [["ウ", "国や学術機関 他の企業", "国や学術機関, 他の企業"]] },
  // q030: 源 p13 “我が社の収益性分析をしなさい”。clean 無し → raw 3 層。zh は既に “”、en の ASCII " は ⑨-c。
  "2024r06-q030": { jp: [["stem", "「我が社の収益性分析をしなさい」", "“我が社の収益性分析をしなさい”"]] },
  // q061 イ: 源 p27 は行末「ハードディ」+ 行頭「スクに」。
  "2024r06-q061": { jp: [["イ", "ハードディスク に", "ハードディスクに"]] },
  // q093: 源 p42 “従業員”表 / ‘%葉_’ (一重、D-155 = 題ごとに原典の字形、前例 2017h29h-q090 ‘%う…’) / “_” / “%”、読点「，」。
  //   zh「」は ⑨-c、en は “” (一重/二重の差は ⑨-c)。
  "2024r06-q093": {
    jp: [["stem", "「従業員」", "“従業員”"], ["stem", "「%葉_」", "‘%葉_’"], ["stem", "「_」", "“_”"], ["stem", "「%」", "“%”"],
      ["stem", "、", "，", 3]],
  },
  // ── 2025r07 ────────────────────────────────────────────────────────────────
  // q002: 源 p2 は行末「ガ」+ 行頭「イドライン」。表示 (raw 3 層、clean 無し) は語中で改行している。
  "2025r07-q002": { jp: [["stem", "ガ\nイドライン", "ガイドライン"]] },
  // q066: 源 p31 “ログイン記録”表及び“部署”表、読点「，」。表は源どおり (clean)。raw の表・日付は別文 (非出荷)。
  "2025r07-q066": { jp: [["stem", "「", "“", 2], ["stem", "」", "”", 2], ["stem", "、", "，", 3]] },
  // ── 2026r08 ────────────────────────────────────────────────────────────────
  // q057 (machdiff QUOTE_ASCII、U11 NIT-2): 選択肢 raw 3 層。題幹 (clean) は既に “”。下線 (主キー) は X2 J-4 裁定どおり不変。
  "2026r08-q057": { jp: Object.entries(Q057).map(([L, [from, to]]) => [L, from, to]) },
};

// 図説明層 (bank / by_year の figure_description、questions.json・web・AI 経路には載らない)。源 p42 の S006 は「稲葉小春」。
const FIGDESC = { "2024r06-q093": [["福葉小春", "稲葉小春"]] };

const MARK = "fidfix-S130-x4";

// D-143: final の note_jp のみ追記。round1 は不可触。対象 = 正解肢命中 + note が是正対象の字句に言及。
//   正解肢命中: 2022r04-q065 (ア) / 2022r04-q059 (エ) / 2026r08-q057 (ウ)
//   note 言及: 2025r07-q066 (「stem_jp_clean と完全一致する」)
const NOTE_APPEND = {
  "2022r04-q065": (p) => `（S130 X4: ${p} 実読で 題幹の「」と「、」を源の “” と「，」に、選択肢ア〜エの ASCII " を源の “” に是正（イは語間の空白も除去）。アは**正解肢**だが字形のみの変更で、条件①により従業員番号は重複しない → 主キー = 従業員番号 = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2022r04-q059": (p) => `（S130 X4: ${p} 実読で 選択肢イ〜エに アと同じ表の見出し行（平均値 / 中央値）を補う（源は 1 枚の表、表示はアだけが見出しを持ち イ〜エは列名なしで描画されていた）。エは**正解肢**だが値は不変で、平均 2,700÷9 = 300、中央値 = 5 番目の 40 = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2026r08-q057": (p) => `（S130 X4: ${p} 実読で 選択肢ア〜エの ASCII " を源の “” に是正。ウは**正解肢**だが字形のみの変更で、“成績”表の学生番号・科目コードがそれぞれ“学生”表・“科目”表を参照 = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2025r07-q066": (p) => `（S130 X4: ${p} 実読で 題幹の「ログイン記録」「部署」の「」と「、」を源の “” と「，」に是正（上記の「完全一致」は字形を除く）。失敗 (003, 001) と 09:00:00 以前の成功 (003, 002) → 3 部署 = イという導出・correct_answer=イ は不変 — ${MARK}）`,
};

// ── 適用 ──────────────────────────────────────────────────────────────────────
const exams = [...new Set([...Object.keys(FIX), ...Object.keys(FIGDESC)].map((id) => id.split("-q")[0]))].sort();
const noteExams = [...new Set(Object.keys(NOTE_APPEND).map((id) => id.split("-q")[0]))].sort();
const Qdoc = rj(P("data/ip/quiz/questions.json")); const Bdoc = rj(P("data/ip/exams/question_bank.json")); const Barr = Bdoc.questions ?? Bdoc;
const BY = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/exams/by_year", `${e}.json`))]));
const TR = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/quiz/translations", `${e}.json`))]));
const GR = Object.fromEntries(noteExams.map((e) => [e, rj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`))]));
const pg = (id) => `page-${String(Barr.find((x) => x.id === id).source.page_number).padStart(2, "0")}`;

for (const [id, fx] of Object.entries(FIX)) {
  const exam = id.split("-q")[0];
  const qq = Qdoc.questions.find((x) => x.id === id), b = Barr.find((x) => x.id === id), y = BY[exam].questions.find((x) => x.id === id), t = TR[exam].questions[id];
  const t1f = P("data/ip/quiz/.phase1", `tr_${id}.json`); const t1 = existsSync(t1f) ? rj(t1f) : null;
  for (const o of fx.jp ?? []) {
    const field = o[0];
    if (field === "stem") {
      // stem_jp_clean がある題は表示 = clean。raw は別文 (OCR 崩れ・ASCII 読点) なので触らない。
      if (t?.stem_jp_clean) { op(t, "stem_jp_clean", o, `${id} translations.stem_jp_clean`); if (t1?.stem_jp_clean) op(t1, "stem_jp_clean", o, `${id} .phase1 tr_.stem_jp_clean`, true); }
      else for (const [x, w] of [[qq, "questions.stem_jp"], [b, "question_bank.stem_jp"], [y, "by_year.stem_jp"]]) op(x, "stem_jp", o, `${id} ${w}`);
    } else for (const [x, w] of [[qq, "questions"], [b, "question_bank"], [y, "by_year"]]) op(x.choices_jp, field, o, `${id} ${w}.choices_jp.${field}`);
  }
  for (const lang of ["zh", "en"]) for (const o of fx[lang] ?? []) {
    const field = o[0];
    if (field === "stem") { op(t.stem, lang, o, `${id} translations.stem.${lang}`); if (t1) op(t1.stem, lang, o, `${id} .phase1 tr_.stem.${lang}`, true); }
    else { op(t.choices[field], lang, o, `${id} translations.choices.${field}.${lang}`); if (t1) op(t1.choices.find((c) => c.letter === field), lang, o, `${id} .phase1 tr_.choices.${field}.${lang}`, true); }
  }
  if (t1) wj(t1f, t1);
}
for (const [id, subs] of Object.entries(FIGDESC)) {
  const b = Barr.find((x) => x.id === id), y = BY[id.split("-q")[0]].questions.find((x) => x.id === id);
  for (const [from, to] of subs) for (const [x, w] of [[b, "question_bank"], [y, "by_year"]]) sub(x, "figure_description", from, to, `${id} ${w}.figure_description`);
}
wj(P("data/ip/quiz/questions.json"), Qdoc); wj(P("data/ip/exams/question_bank.json"), Bdoc);
for (const e of exams) { wj(P("data/ip/exams/by_year", `${e}.json`), BY[e]); wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]); }

for (const [id, mk] of Object.entries(NOTE_APPEND)) {
  const r = GR[id.split("-q")[0]].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if ((r.key_guard.note_jp ?? "").includes(MARK)) { skipped++; continue; }
  r.key_guard.note_jp = `${r.key_guard.note_jp ?? ""}${mk(pg(id))}`; applied++; log.push(`  ✓ ${id} final note: 追記 (${pg(id)}, round1 untouched)`);
}
for (const e of noteExams) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);

console.log(log.join("\n"));
console.log(`  files ${DRY ? "to write" : "written"} (${written.length}): ${written.join(", ")}`);
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S130-x4: applied ${applied}, skipped ${skipped}`);
