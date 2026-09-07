#!/usr/bin/env node
// Stage 6 / Quiz — S118 ⑤-4 後段: 走査器 (scripts/quiz-choice-defect-scan.mjs) の
// **R8a (片仮名語中の半角空白) / R8c (仮名文中の半角空白)** を corpus 全量 (29 exam) で決定的に是正する。
//
// 何を直すか: OCR の行折返しが残した「語の途中の半角空白」。
//   「シリアルイ ンタフェース」→「シリアルインタフェース」/「該当する ものはどれか」→「該当するものはどれか」
//   置換ではなく **その半角空白 1 個の削除のみ**。空白以外の文字は 1 字も動かさない (下記 INVARIANT)。
//
// 何を直さないか (S118 Rule D 独立審査 + 本器の実読で確定):
//   - **R8b (漢語中の半角空白) は対象外**。`2015h27a-q097` 型の AND 検索式は空白が構文であり、
//     また「物理的 人的」「調達 開発,製造」型は空白が **読点の脱落を隠している** ので、削除ではなく
//     読点補完が要る。R8b は源照合 (⑤-3) 側の射程。本器は R8b の命中位置を一切触らず、
//     field ごとに R8b 命中数が前後で不変であることを assert する。
//   - **IPA 擬似言語ブロック (`〔プログラム〕` / `[プログラム]` 以降の行)**。
//     「i を 1 から arrayInput の要素数 まで 1 ずつ増やす」「stringOutput の末尾 に 「A」 を追加する」
//     「i ÷ 3 の余り が 0 と等しい」の空白は IPA 公式表記の字句区切りであり、削除は源の逐語再現を壊す。
//     ⚠ これは S118 の走査器校正 (evidence/quiz_choice_defect_scan_S118.md §b-2「R8c FP 0%」) が
//        20 件抽検では捕まえられなかった **真の FP クラス (9 件 / 182)**。本器で除外し、evidence に登記した。
//   - **D-144 段 3 の生成図キャプション行 (`（図: …）`)**。OCR 由来ではなく生成テキストなので
//     「行折返しの残渣」という欠陥定義に当たらない (1 件: `2009h21a-q036`)。
//   - markdown 表 / `[表]` チップを含む field (走査器の noTable と同一判定)、全角空白 (版面上の正当な区切り)。
//
// 層 (S117/S118 fidfix 慣行 = quiz-fidfix-S117-batch4.mjs / quiz-fidfix-S118-strat53.mjs と同じ):
//   raw   `stem_jp` / `choices_jp[ア|イ|ウ|エ]` … data/ip/quiz/questions.json
//                                              + data/ip/exams/question_bank.json
//                                              + data/ip/exams/by_year/<exam>.json   (B5 の 3 層一致を保つ)
//   clean `stem_jp_clean`                     … data/ip/quiz/translations/<exam>.json (sidecar)
//                                              + data/ip/quiz/.phase1/tr_<id>.json    (stale 入力層。再 merge 禁止のため両方に当てる)
//   zh / en は不可触。解説 (.phase2 expl_*) も不可触 (引用の有無は evidence の grep で確認済)。
//
// field の選定は **表示層** で行う (走査器と同一: stem = clean があれば clean、無ければ raw / choice = raw)。
// 選定された field については、その JP テキストを持つ **全ての層** に同じ規則を当てる。
// clean が存在する stem では raw の方が汚れている (清書時に既に消えた空白がある) ため、raw 側の削除数が
// clean 側より多くなることがある — 最上流まで是正を届かせるのが S117 B5 の要求なので、これは意図的。
//
// INVARIANT (field × 層ごとに assert、1 つでも破れたら throw して中断):
//   1. after.replace(/ /g,"") === before.replace(/ /g,"")   (半角空白の削除以外は起きていない)
//   2. 全角空白 U+3000 の個数が不変
//   3. R8b の命中数が不変
//   4. 削除した各位置が実際に半角空白であり、連続空白でない (連続空白は想定外 → 中断)
//   5. 再走査で R8a/R8c の命中が 0 (収束)
//
// 冪等: 2 回目の実行は命中 0 → applied 0。
//
// Run:
//   node scripts/quiz-r8-spacefix-S118.mjs --dry-run
//   node scripts/quiz-r8-spacefix-S118.mjs
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-keys-crosscheck.mjs
// 詳細ログ (field ごとの before/after 全文) は data/ip/quiz/.phase2/r8_spacefix_S118.json (gitignored)。
//   --dry-run 時は …dryrun.json に分けて書くので、後から dry-run しても適用時のログを潰さない。

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { RULES, buildFields } from "./quiz-choice-defect-scan.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry-run");
const P = (...s) => path.join(ROOT, ...s);
const rj = (f) => JSON.parse(readFileSync(f, "utf-8"));
const wj = (f, d) => { if (!DRY) { mkdirSync(path.dirname(f), { recursive: true }); writeFileSync(f, JSON.stringify(d, null, 2) + "\n"); } };

// ── 走査器から規則そのものを借りる (パターンは一切広げない) ────────────────────────
const RULE = Object.fromEntries(RULES.map((r) => [r.id, r]));
for (const id of ["R8a", "R8b", "R8c"]) if (!RULE[id]) throw new Error(`rule ${id} missing in quiz-choice-defect-scan.mjs`);
// 走査器 scanQuestion の noTable 判定と同一 (走査器側は非 export なので同義の 1 行を持つ)。
const hasTable = (s) => /(^|\n)\s*\|/.test(String(s)) || /^\s*\[表\]/.test(String(s));
// 逐語再現が要る IPA 擬似言語ブロックの開始行。以降の行は全て保護する。
// 判定は走査器 quiz-choice-defect-scan.mjs の PROG_MARK と同一 (表記ゆれ許容: `[プログラム]`
// `〔プログラム〕` `［プログラム1］` `〔正六角形描画プログラム〕`、OCR 化けの `[プログラム】〕`、
// 題名がコード先頭と同行の形。`[表] …プログラム…` の表チップは閉じ括弧があるので当たらない)。
const PROG_MARK = /^\s*[\[〔［【][^\]］】〕\n]{0,10}プログラム/;
// D-144 段 3 の生成図キャプション行。
const FIG_CAPTION = /^\s*[（(]図/;

/** 保護対象の行 (擬似言語ブロック内 / 生成図キャプション) を bool 配列で返す。 */
function protectedLines(lines) {
  const prog = lines.findIndex((l) => PROG_MARK.test(l));
  return lines.map((l, i) => (prog >= 0 && i >= prog) || FIG_CAPTION.test(l));
}

/**
 * 文字列に対する R8a/R8c の命中位置 (保護行を除く)。
 * 走査器の正規表現は改行を跨がないので、行単位に当てても field 全体に当てるのと同一結果になる。
 */
function r8acHits(s) {
  const t = String(s ?? "");
  if (!t || hasTable(t)) return [];
  const lines = t.split("\n");
  const prot = protectedLines(lines);
  const out = [];
  let base = 0;
  for (let i = 0; i < lines.length; i++) {
    if (!prot[i]) for (const id of ["R8a", "R8c"]) for (const h of RULE[id].run(lines[i])) out.push({ index: base + h.index, rule: id, line: i });
    base += lines[i].length + 1;
  }
  return out.sort((a, b) => a.index - b.index);
}

/** 保護を掛けない生の R8a/R8c 命中 (走査器と完全同一の見え方。残渣の計数用)。 */
function r8acRaw(s) {
  const t = String(s ?? "");
  if (!t || hasTable(t)) return [];
  return [...RULE.R8a.run(t).map((h) => ({ ...h, rule: "R8a" })), ...RULE.R8c.run(t).map((h) => ({ ...h, rule: "R8c" }))];
}

const r8bCount = (s) => { const t = String(s ?? ""); return !t || hasTable(t) ? 0 : RULE.R8b.run(t).length; };
const ctx = (s, i) => `${s.slice(Math.max(0, i - 8), i)}␣${s.slice(i + 1, i + 9)}`;

/** 1 つの文字列から R8a/R8c の半角空白を削る。INVARIANT を全て assert する。 */
function fixString(before, where) {
  const src = String(before);
  let cur = src;
  const removed = [];
  for (let iter = 0; iter < 8; iter++) {
    const hits = r8acHits(cur);
    if (!hits.length) break;
    for (const h of [...hits].reverse()) {                       // 後方から消して index のずれを避ける
      if (cur[h.index] !== " ") throw new Error(`${where}: index ${h.index} は半角空白ではない (${JSON.stringify(cur.slice(h.index - 2, h.index + 3))})`);
      if (cur[h.index + 1] === " " || cur[h.index - 1] === " ") throw new Error(`${where}: index ${h.index} が連続空白 — 想定外なので中断`);
      removed.push({ rule: h.rule, ctx: ctx(cur, h.index) });
      cur = cur.slice(0, h.index) + cur.slice(h.index + 1);
    }
  }
  if (r8acHits(cur).length) throw new Error(`${where}: 削除が収束しなかった`);
  if (cur.replace(/ /g, "") !== src.replace(/ /g, "")) throw new Error(`${where}: 半角空白以外が変化した`);
  const fw = (x) => (x.match(/　/g) ?? []).length;
  if (fw(cur) !== fw(src)) throw new Error(`${where}: 全角空白の個数が ${fw(src)}→${fw(cur)} に変化した`);
  if (r8bCount(cur) !== r8bCount(src)) throw new Error(`${where}: R8b 命中数が ${r8bCount(src)}→${r8bCount(cur)} に変化した`);
  if (src.length - cur.length !== removed.length) throw new Error(`${where}: 削除数 ${removed.length} と長さ差 ${src.length - cur.length} が一致しない`);
  return { out: cur, removed };
}

// ── 対象 field の選定 (表示層) ────────────────────────────────────────────────
const Qdoc = rj(P("data/ip/quiz/questions.json"));
const Bdoc = rj(P("data/ip/exams/question_bank.json"));
const Barr = Bdoc.questions ?? Bdoc;
const bankById = new Map(Barr.map((q) => [q.id, q]));

const trCache = new Map();
const trDoc = (exam) => {
  if (!trCache.has(exam)) {
    const f = P("data/ip/quiz/translations", `${exam}.json`);
    trCache.set(exam, existsSync(f) ? rj(f) : null);
  }
  return trCache.get(exam);
};
const byCache = new Map();
const byDoc = (exam) => {
  if (!byCache.has(exam)) byCache.set(exam, rj(P("data/ip/exams/by_year", `${exam}.json`)));
  return byCache.get(exam);
};

/** 選定: 走査器と同じ表示層で R8a/R8c (保護行を除く) が当たる field。 */
const targets = [];         // {id, exam, field}
const excluded = [];        // 保護によって除外した命中 (evidence 用)
for (const q of Qdoc.questions) {
  const t = trDoc(q.exam_id)?.questions?.[q.id];
  const fields = buildFields(q, t?.stem_jp_clean);
  for (const [field, text] of Object.entries(fields)) {
    const s = String(text ?? "");
    if (!s || hasTable(s)) continue;
    const kept = r8acHits(s);
    const all = r8acRaw(s);
    if (all.length !== kept.length) {
      const keptIdx = new Set(kept.map((h) => h.index));
      for (const h of all) if (!keptIdx.has(h.index)) excluded.push({ id: q.id, field, rule: h.rule, ctx: ctx(s, h.index) });
    }
    if (kept.length) targets.push({ id: q.id, exam: q.exam_id, field });
  }
}

// ── 適用 ─────────────────────────────────────────────────────────────────────
let applied = 0, skipped = 0;
const perLayer = {};        // layer → 削除数
const detail = [];          // evidence 用 before/after
const touchedExams = new Set(), phase1Files = new Map();

const bump = (layer, n) => { perLayer[layer] = (perLayer[layer] ?? 0) + n; };

/** obj[key] を fixString で置換。変化が無ければ skip。 */
function fixField(obj, key, where, layer, id, field) {
  if (!obj || typeof obj[key] !== "string") { if (obj) console.warn(`  ⚠ ${where}: field ${key} missing`); return; }
  const before = obj[key];
  const { out, removed } = fixString(before, where);
  if (!removed.length) { skipped++; return; }
  obj[key] = out;
  applied += removed.length;
  bump(layer, removed.length);
  detail.push({ id, field, layer, removed: removed.map((r) => `${r.rule} ${r.ctx}`), before, after: out });
  console.log(`  ✓ ${where}: -${removed.length}  ${removed.map((r) => `[${r.rule}] ${r.ctx}`).join(" / ")}`);
}

for (const { id, exam, field } of targets) {
  touchedExams.add(exam);
  const q = Qdoc.questions.find((x) => x.id === id);
  const b = bankById.get(id);
  const yArr = byDoc(exam).questions ?? byDoc(exam);
  const y = yArr.find((x) => x.id === id);

  if (field === "stem") {
    // raw 3 層 (B5 の 3 層一致対象)
    fixField(q, "stem_jp", `${id} questions.stem_jp`, "questions.json", id, field);
    fixField(b, "stem_jp", `${id} question_bank.stem_jp`, "question_bank.json", id, field);
    fixField(y, "stem_jp", `${id} by_year.stem_jp`, "by_year", id, field);
    // clean 2 層 (存在すれば)
    const t = trDoc(exam)?.questions?.[id];
    if (typeof t?.stem_jp_clean === "string") fixField(t, "stem_jp_clean", `${id} translations.stem_jp_clean`, "translations", id, field);
    const p1f = P("data/ip/quiz/.phase1", `tr_${id}.json`);
    if (existsSync(p1f)) {
      const p1 = phase1Files.get(p1f) ?? rj(p1f);
      phase1Files.set(p1f, p1);
      if (typeof p1.stem_jp_clean === "string") fixField(p1, "stem_jp_clean", `${id} .phase1 tr_.stem_jp_clean`, ".phase1", id, field);
    }
  } else {
    const L = field.replace("choice.", "");
    // 選択肢は raw 3 層のみ (jp の clean サイドカーは存在しない)
    fixField(q.choices_jp, L, `${id} questions.choices_jp.${L}`, "questions.json", id, field);
    fixField(b?.choices_jp, L, `${id} question_bank.choices_jp.${L}`, "question_bank.json", id, field);
    fixField(y?.choices_jp, L, `${id} by_year.choices_jp.${L}`, "by_year", id, field);
  }
}

// ── 書き出し ─────────────────────────────────────────────────────────────────
if (applied) {
  wj(P("data/ip/quiz/questions.json"), Qdoc);
  wj(P("data/ip/exams/question_bank.json"), Bdoc);
  for (const exam of touchedExams) {
    wj(P("data/ip/exams/by_year", `${exam}.json`), byDoc(exam));
    const t = trDoc(exam);
    if (t) wj(P("data/ip/quiz/translations", `${exam}.json`), t);
  }
  for (const [f, d] of phase1Files) wj(f, d);
}
// 詳細ログは --dry-run でも書く (適用前に全 before/after を読めるようにするため)。出力先は gitignored。
const logFile = P("data/ip/quiz/.phase2", DRY ? "r8_spacefix_S118.dryrun.json" : "r8_spacefix_S118.json");
mkdirSync(path.dirname(logFile), { recursive: true });
writeFileSync(logFile, JSON.stringify({
  generated_at: new Date().toISOString(),
  dry_run: DRY,
  target_fields: targets.length,
  target_questions: new Set(targets.map((t) => t.id)).size,
  applied_deletions: applied,
  per_layer: perLayer,
  excluded_hits: excluded,
  detail,
}, null, 2) + "\n");

// ── 要約 ─────────────────────────────────────────────────────────────────────
const byExam = {};
for (const t of targets) byExam[t.exam] = (byExam[t.exam] ?? 0) + 1;
console.log("");
console.log(`対象 field ${targets.length} / 設問 ${new Set(targets.map((t) => t.id)).size} / exam ${Object.keys(byExam).length}`);
console.log(`層別削除数: ${Object.entries(perLayer).map(([k, v]) => `${k}=${v}`).join(" ") || "(なし)"}`);
console.log(`保護により除外した命中: ${excluded.length} 件`);
for (const e of excluded) console.log(`  – ${e.id} ${e.field} [${e.rule}] ${e.ctx}`);
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-r8-spacefix-S118: applied ${applied}, skipped ${skipped}`);
