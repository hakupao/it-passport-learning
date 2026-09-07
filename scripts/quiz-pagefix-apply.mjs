#!/usr/bin/env node
// Stage 6 / Quiz — D-145 §4: 設問ページ / 図ページの分離 (+ 裁断枠是正) を **判定 JSON から** raw 2 層に適用する (S118)。
//
// 背景 (D-145 §背景): `source.page_image` は「設問ページ」と「図ページ」を兼ねる単一ポインタで、
// `figure_bbox_pct` はそのページ相対。だから設問ページを直すと図の裁断がずれ、S115 の
// `2009h21h-q097` (設問 43 / 図 42) は是正 → 回退した (`quiz-fidfix-S115f-ruleA.mjs:77`)。
// D-145 は `source.figure_page_image` / `source.figure_page_number` (任意、欠如 = page_image と同じ) を足し、
// `figure_bbox_pct` を **図ページ相対**に固定した。本 script はその値を書く唯一の経路である。
//
// 入力 (⑦-1 の実読定案が産出): evidence/phase5/stage_06_quiz_fidelity/pagefix_S118_decisions.json
//   [{ id, question_page_number, figure_page_number|null, verdict,
//      [current_page_number], [current_page_image], [expect_page_number], [figure_bbox_pct_current],
//      [bbox_check: { verdict|status: "OK"|"BAD"|"n/a", proposed_bbox_pct, issue }], [figure_bbox_rebased], [evidence] }]
//   ({ decisions: [...] } 形の包みも受ける)
//
// ══ 2 つの独立した適用相 (それぞれ冪等・assert-once) ══
// (A) source 相 — 設問ページ / 図ページのポインタ
//   verdict = SPLIT_FIGURE  : page_* ← question_page_number、figure_page_* ← figure_page_number。
//             question_page_number が現在値と違えば設問ページも動く (S118 実測: 2014h26h-q089 / 2015h27h-q089 が 38→39)。
//   verdict = MOVE_QUESTION : page_* ← question_page_number。図を持つ問は figure_page_* ← **旧ページ**
//             (bbox は旧ページ実測なので裁断が生き残る)。旧ページは figure_page_number →
//             expect_page_number → current_page_number → 現在値 の順に決まる。bbox を新ページで測り直したなら
//             figure_bbox_rebased: true を付けると figure_page_* を書かない (既にあれば削除)。
//   verdict = KEEP          : ポインタは no-op (ただし (B) 相は走る)。
// (B) bbox 相 — `bbox_check.verdict === "BAD"` の時だけ `figure_bbox_pct` ← `proposed_bbox_pct`。
//   適用後、その図を**再裁断**して WebP を作り直す (--no-recrop で抑止)。裁断は 2 系統:
//     単独図      : 図ページから素の extract。box = (trunc(x1*w), trunc(y1*h), trunc(x2*w), trunc(y2*h))
//                   — 既存 crop 7/7 の寸法をこの式が再現することを S118 で実測 (旧 crop-and-update の PIL 式と同値)。
//     中問の共有図: D-120 の真相源 groups.json の `shared_figure` を再裁断 (trim+pad、chumon-recrop 式) し、
//                   `figures/_groups/<gid>.png` を全メンバーに複製。個別に裁断すると組の単一真相源が壊れる。
//
// 性質: 冪等 / assert-once (目標でも想定前状態でもない値は throw) / **2 層同時** (question_bank.json と
//       by_year/<exam>.json を同じ値に。ずれると crosscheck B6 が落ちる) /
//       stem・choices・correct_answer・has_figure・figure_type には一切触らない。
//
// Run:
//   node scripts/quiz-pagefix-apply.mjs --self-test    # 実データに触れず計画関数を検証
//   node scripts/quiz-pagefix-apply.mjs --dry-run      # 全件 before/after を印字、書かない
//   node scripts/quiz-pagefix-apply.mjs                # 適用 + 再裁断 + WebP 再生成
//   node scripts/quiz-pagefix-apply.mjs [--decisions <path>] [--only <id>,<id>] [--no-recrop]
// 後続: node scripts/quiz-keys-crosscheck.mjs   (B6 / B7)

import { readFileSync, writeFileSync, copyFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXAMS = path.join(ROOT, "data/ip/exams");
const BANK = path.join(EXAMS, "question_bank.json");
const BY_YEAR = path.join(EXAMS, "by_year");
const GROUPS = path.join(EXAMS, "groups.json");
const FIGURES = path.join(EXAMS, "figures");
const WEBP = path.join(ROOT, "apps/web/public/quiz-figures");
const DEFAULT_DECISIONS = path.join(ROOT, "evidence/phase5/stage_06_quiz_fidelity/pagefix_S118_decisions.json");

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const opt = (n, d = null) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const DRY = flag("--dry-run");
const SELF_TEST = flag("--self-test");
const NO_RECROP = flag("--no-recrop");
const ONLY = (opt("--only") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const DECISIONS_FILE = opt("--decisions", DEFAULT_DECISIONS);

const VERDICTS = new Set(["MOVE_QUESTION", "SPLIT_FIGURE", "KEEP"]);
const BOX_KEYS = ["x1", "y1", "x2", "y2"];
const rj = (f) => JSON.parse(readFileSync(f, "utf-8"));
const examOf = (id) => id.split("-q")[0];
const pageImageOf = (examId, n) => `pages/${examId}/page-${String(n).padStart(2, "0")}.png`;
const boxSig = (b) => (b && BOX_KEYS.every((k) => typeof b[k] === "number") ? JSON.stringify(BOX_KEYS.map((k) => b[k])) : "null");

// ── 純関数 (A) source 相: 目標の source を計算する (I/O 無し) ───────────────────────────
// cur / dec / hasFigure → { verdict, target|null, reason }。target=null は no-op。
export function planTarget(cur, dec, hasFigure) {
  const id = dec.id;
  if (!VERDICTS.has(dec.verdict)) throw new Error(`${id}: unknown verdict ${JSON.stringify(dec.verdict)}`);
  const qPage = dec.question_page_number;
  if (dec.verdict === "KEEP") {
    // KEEP は「記録が正しい」判定。設問ページが動く / 図ページが別 なら SPLIT_FIGURE のはずで、取り違えを弾く。
    if (Number.isInteger(qPage) && Number.isInteger(dec.current_page_number) && qPage !== dec.current_page_number)
      throw new Error(`${id}: KEEP なのに question_page_number(${qPage}) != current_page_number(${dec.current_page_number})`);
    if (Number.isInteger(dec.figure_page_number) && Number.isInteger(qPage) && dec.figure_page_number !== qPage)
      throw new Error(`${id}: KEEP なのに figure_page_number(${dec.figure_page_number}) != question_page_number(${qPage}) — SPLIT_FIGURE では?`);
    return { verdict: "KEEP", target: null, reason: "ポインタは正しい (no-op)" };
  }

  const examId = examOf(id);
  if (!Number.isInteger(qPage) || qPage < 1) throw new Error(`${id}: question_page_number が整数でない (${JSON.stringify(qPage)})`);

  let figPage = null;
  let reason = "";
  if (dec.verdict === "SPLIT_FIGURE") {
    if (!hasFigure) throw new Error(`${id}: SPLIT_FIGURE だが図を持たない (figure_bbox_pct が無い) — 図ページを書く意味が無い`);
    figPage = dec.figure_page_number;
    if (!Number.isInteger(figPage)) throw new Error(`${id}: SPLIT_FIGURE には figure_page_number (整数) が要る`);
    const moved = Number.isInteger(dec.current_page_number) && dec.current_page_number !== qPage;
    reason = moved ? `設問 ${dec.current_page_number}→${qPage} も是正 / 図 ${figPage} を分離` : `設問 ${qPage} 据置 / 図 ${figPage} を分離`;
  } else { // MOVE_QUESTION
    if (dec.figure_bbox_rebased === true) {
      if (Number.isInteger(dec.figure_page_number)) throw new Error(`${id}: figure_bbox_rebased=true と figure_page_number は同時指定できない`);
      reason = `設問 ${qPage} へ移動 / bbox は新ページで再実測済 (図ページ分離なし)`;
    } else if (!hasFigure) {
      reason = `設問 ${qPage} へ移動 (図なし)`;
    } else {
      // 図の bbox は **旧ページ** 実測。旧ページは判定 JSON が明示 → 現在値 の順。
      figPage = Number.isInteger(dec.figure_page_number) ? dec.figure_page_number
        : Number.isInteger(dec.expect_page_number) ? dec.expect_page_number
        : Number.isInteger(dec.current_page_number) ? dec.current_page_number
        : Number.isInteger(cur.page_number) && cur.page_number !== qPage ? cur.page_number
        : null;
      if (figPage === null) {
        throw new Error(`${id}: MOVE_QUESTION で図の旧ページを導出できない (page_number が既に ${qPage})。`
          + ` 判定 JSON に figure_page_number か expect_page_number/current_page_number を明記すること`);
      }
      reason = `設問 ${qPage} へ移動 / 図は旧ページ ${figPage} に据置 (bbox は旧ページ実測)`;
    }
  }

  if (figPage !== null && figPage === qPage) {
    throw new Error(`${id}: figure_page_number == question_page_number (${qPage}) — 既定 (欠如) と同義で雑音。D-145 §1 / B7(a)`);
  }

  const target = { page_image: pageImageOf(examId, qPage), page_number: qPage };
  if (figPage !== null) {
    target.figure_page_image = pageImageOf(examId, figPage);
    target.figure_page_number = figPage;
  }
  return { verdict: dec.verdict, target, reason };
}

// ── 純関数 (B) bbox 相: `bbox_check` から目標の figure_bbox_pct を計算する (I/O 無し) ────────
// 戻り値 { target|null, reason }。target=null は「bbox は触らない」。
export function planBbox(curBbox, dec) {
  const id = dec.id;
  const bc = dec.bbox_check;
  if (!bc) return { target: null, reason: "bbox_check 無し" };
  const st = bc.status ?? bc.verdict; // scout の出力は `verdict`、主 context の呼称は `status` — 両対応
  if (st === "OK" || st === "n/a" || st === "n_a" || st == null) return { target: null, reason: `bbox_check=${st ?? "none"} (据置)` };
  if (st !== "BAD") throw new Error(`${id}: bbox_check.status が未知の値 ${JSON.stringify(st)} (OK / BAD / n/a のみ)`);
  const p = bc.proposed_bbox_pct;
  if (!p || !BOX_KEYS.every((k) => typeof p[k] === "number")) throw new Error(`${id}: bbox_check=BAD だが proposed_bbox_pct が無い/不正`);
  if (!(p.x1 >= 0 && p.x1 < p.x2 && p.x2 <= 1)) throw new Error(`${id}: proposed_bbox_pct の x が不正 ${JSON.stringify(p)} (0<=x1<x2<=1)`);
  if (!(p.y1 >= 0 && p.y1 < p.y2 && p.y2 <= 1)) throw new Error(`${id}: proposed_bbox_pct の y が不正 ${JSON.stringify(p)} (0<=y1<y2<=1)`);
  if (!curBbox) throw new Error(`${id}: bbox_check=BAD だが現在 figure_bbox_pct が無い`);
  const target = { x1: p.x1, y1: p.y1, x2: p.x2, y2: p.y2 };
  return { target, reason: bc.issue ? `bbox 是正: ${bc.issue}` : "bbox 是正" };
}

const pagePart = (src) => {
  const o = { page_image: src?.page_image ?? null, page_number: src?.page_number ?? null };
  if (src?.figure_page_image !== undefined) o.figure_page_image = src.figure_page_image;
  if (src?.figure_page_number !== undefined) o.figure_page_number = src.figure_page_number;
  return o;
};

// ── --self-test: 実データに触れずインライン標本で計画関数を検証 ──────────────────────────
if (SELF_TEST) {
  let pass = 0;
  const eq = (label, got, want) => {
    const g = JSON.stringify(got), w = JSON.stringify(want);
    if (g !== w) { console.error(`✗ ${label}\n    got  ${g}\n    want ${w}`); process.exitCode = 1; } else { pass++; console.log(`  ✓ ${label}`); }
  };
  const throws = (label, fn, re) => {
    try { fn(); console.error(`✗ ${label}: throw しなかった`); process.exitCode = 1; }
    catch (e) { if (re && !re.test(e.message)) { console.error(`✗ ${label}: message 不一致 «${e.message}»`); process.exitCode = 1; } else { pass++; console.log(`  ✓ ${label} (throw: ${e.message.slice(0, 56)}…)`); } }
  };
  const box = (x1, y1, x2, y2) => ({ x1, y1, x2, y2 });

  console.log("── (A) source 相 ──");
  const q097cur = { page_image: "pages/2009h21h/page-42.png", page_number: 42 };
  eq("SPLIT_FIGURE 2009h21h-q097 (設問 42→43・図 42)",
    planTarget(q097cur, { id: "2009h21h-q097", current_page_number: 42, question_page_number: 43, figure_page_number: 42, verdict: "SPLIT_FIGURE" }, true).target,
    { page_image: "pages/2009h21h/page-43.png", page_number: 43, figure_page_image: "pages/2009h21h/page-42.png", figure_page_number: 42 });
  eq("SPLIT_FIGURE 設問ページ据置 (2012h24a-q093: 42 / 図 41)",
    planTarget({ page_image: "pages/2012h24a/page-42.png", page_number: 42 }, { id: "2012h24a-q093", current_page_number: 42, question_page_number: 42, figure_page_number: 41, verdict: "SPLIT_FIGURE" }, true).target,
    { page_image: "pages/2012h24a/page-42.png", page_number: 42, figure_page_image: "pages/2012h24a/page-41.png", figure_page_number: 41 });
  eq("MOVE_QUESTION 図あり → 旧ページを figure に退避",
    planTarget(q097cur, { id: "2009h21h-q097", question_page_number: 43, figure_page_number: null, verdict: "MOVE_QUESTION" }, true).target,
    { page_image: "pages/2009h21h/page-43.png", page_number: 43, figure_page_image: "pages/2009h21h/page-42.png", figure_page_number: 42 });
  eq("MOVE_QUESTION 図なし → figure_page_* を書かない",
    planTarget({ page_image: "pages/2010h22a/page-43.png", page_number: 43 }, { id: "2010h22a-q097", question_page_number: 44, figure_page_number: null, verdict: "MOVE_QUESTION" }, false).target,
    { page_image: "pages/2010h22a/page-44.png", page_number: 44 });
  eq("MOVE_QUESTION + figure_bbox_rebased → figure_page_* を書かない",
    planTarget(q097cur, { id: "2009h21h-q097", question_page_number: 43, figure_page_number: null, verdict: "MOVE_QUESTION", figure_bbox_rebased: true }, true).target,
    { page_image: "pages/2009h21h/page-43.png", page_number: 43 });
  eq("KEEP は no-op", planTarget(q097cur, { id: "x-q001", current_page_number: 42, question_page_number: 42, figure_page_number: 42, verdict: "KEEP" }, true).target, null);
  throws("KEEP なのに設問ページが動く判定は拒否",
    () => planTarget(q097cur, { id: "x-q001", current_page_number: 42, question_page_number: 43, figure_page_number: null, verdict: "KEEP" }, true), /KEEP なのに question_page_number/);
  throws("KEEP なのに図ページが別の判定は拒否",
    () => planTarget(q097cur, { id: "x-q001", current_page_number: 42, question_page_number: 42, figure_page_number: 41, verdict: "KEEP" }, true), /SPLIT_FIGURE では/);
  throws("figure == question ページは拒否 (B7(a) 雑音)",
    () => planTarget(q097cur, { id: "x-q001", question_page_number: 42, figure_page_number: 42, verdict: "SPLIT_FIGURE" }, true), /雑音/);
  throws("SPLIT_FIGURE で図を持たない問は拒否",
    () => planTarget(q097cur, { id: "x-q001", question_page_number: 43, figure_page_number: 42, verdict: "SPLIT_FIGURE" }, false), /図を持たない/);
  throws("SPLIT_FIGURE に figure_page_number 必須",
    () => planTarget(q097cur, { id: "x-q001", question_page_number: 43, figure_page_number: null, verdict: "SPLIT_FIGURE" }, true), /figure_page_number/);
  throws("旧ページ導出不能 (適用済 + 判定に旧ページ無し) は拒否",
    () => planTarget({ page_image: "pages/2009h21h/page-43.png", page_number: 43 }, { id: "2009h21h-q097", question_page_number: 43, figure_page_number: null, verdict: "MOVE_QUESTION" }, true), /導出できない/);
  throws("未知の verdict は拒否", () => planTarget(q097cur, { id: "x-q001", verdict: "NOPE" }, true), /unknown verdict/);
  throws("question_page_number が整数でない",
    () => planTarget(q097cur, { id: "x-q001", question_page_number: null, verdict: "MOVE_QUESTION" }, true), /整数でない/);

  console.log("── (B) bbox 相 ──");
  eq("bbox_check 無し → 据置", planBbox(box(0.1, 0.2, 0.8, 0.9), { id: "x-q001" }).target, null);
  eq("bbox_check=OK → 据置", planBbox(box(0.1, 0.2, 0.8, 0.9), { id: "x-q001", bbox_check: { verdict: "OK", proposed_bbox_pct: null } }).target, null);
  eq("bbox_check=n/a → 据置", planBbox(null, { id: "x-q001", bbox_check: { verdict: "n/a", proposed_bbox_pct: null } }).target, null);
  eq("bbox_check=BAD → proposed を採用 (status 表記)",
    planBbox(box(0.25, 0.39, 0.75, 0.6), { id: "2009h21h-q097", bbox_check: { status: "BAD", proposed_bbox_pct: box(0.19, 0.405, 0.8, 0.548) } }).target,
    box(0.19, 0.405, 0.8, 0.548));
  eq("bbox_check=BAD → proposed を採用 (verdict 表記)",
    planBbox(box(0.25, 0.39, 0.75, 0.6), { id: "2009h21h-q097", bbox_check: { verdict: "BAD", proposed_bbox_pct: box(0.19, 0.405, 0.8, 0.548) } }).target,
    box(0.19, 0.405, 0.8, 0.548));
  throws("BAD なのに proposed が無い",
    () => planBbox(box(0.1, 0.2, 0.8, 0.9), { id: "x-q001", bbox_check: { verdict: "BAD", proposed_bbox_pct: null } }), /proposed_bbox_pct/);
  throws("proposed の x1>=x2 は拒否",
    () => planBbox(box(0.1, 0.2, 0.8, 0.9), { id: "x-q001", bbox_check: { verdict: "BAD", proposed_bbox_pct: box(0.8, 0.2, 0.3, 0.9) } }), /x が不正/);
  throws("proposed が 1 を超えるのは拒否",
    () => planBbox(box(0.1, 0.2, 0.8, 0.9), { id: "x-q001", bbox_check: { verdict: "BAD", proposed_bbox_pct: box(0.1, 0.2, 0.8, 1.4) } }), /y が不正/);
  throws("未知の bbox_check 値は拒否",
    () => planBbox(box(0.1, 0.2, 0.8, 0.9), { id: "x-q001", bbox_check: { verdict: "MAYBE" } }), /未知の値/);
  throws("BAD だが現在 bbox が無い",
    () => planBbox(null, { id: "x-q001", bbox_check: { verdict: "BAD", proposed_bbox_pct: box(0.1, 0.2, 0.8, 0.9) } }), /現在 figure_bbox_pct が無い/);

  console.log(`\n${process.exitCode ? "✗" : "✓"} self-test: ${pass} assertions (実データ・実ファイル未参照)`);
  process.exit(process.exitCode ?? 0);
}

// ── 実適用 ────────────────────────────────────────────────────────────────────────
if (!existsSync(DECISIONS_FILE)) {
  console.error(`✗ quiz-pagefix-apply: 判定 JSON が無い — ${path.relative(ROOT, DECISIONS_FILE)}`);
  console.error(`  計画関数だけを検証するには:  node scripts/quiz-pagefix-apply.mjs --self-test`);
  process.exit(1);
}

const raw = rj(DECISIONS_FILE);
let decisions = Array.isArray(raw) ? raw : (raw.decisions ?? null);
if (!Array.isArray(decisions)) throw new Error(`${DECISIONS_FILE}: 配列でも {decisions:[...]} でもない`);
if (ONLY.length) decisions = decisions.filter((d) => ONLY.includes(d.id));
{
  const seen = new Set();
  for (const d of decisions) {
    if (typeof d?.id !== "string" || !d.id.includes("-q")) throw new Error(`判定 JSON に不正な id: ${JSON.stringify(d?.id)}`);
    if (seen.has(d.id)) throw new Error(`${d.id}: 判定 JSON に重複エントリ`);
    seen.add(d.id);
  }
}

const bankDoc = rj(BANK);
const bankById = new Map((bankDoc.questions ?? bankDoc).map((q) => [q.id, q]));
const byYearDocs = new Map();
const byYearRec = (id) => {
  const exam = examOf(id);
  if (!byYearDocs.has(exam)) {
    const f = path.join(BY_YEAR, `${exam}.json`);
    if (!existsSync(f)) throw new Error(`${id}: by_year/${exam}.json が無い`);
    byYearDocs.set(exam, { file: f, doc: rj(f) });
  }
  const { doc } = byYearDocs.get(exam);
  return (doc.questions ?? doc).find((q) => q.id === id) ?? null;
};

let srcApplied = 0, srcAlready = 0, srcNoop = 0, boxApplied = 0, boxAlready = 0, boxNoop = 0;
const touchedExams = new Set();
const bboxChanged = []; // { id, before, after }

for (const dec of decisions) {
  const id = dec.id;
  const bankQ = bankById.get(id);
  if (!bankQ) throw new Error(`${id}: question_bank に無い`);
  const yearQ = byYearRec(id);
  if (!yearQ) throw new Error(`${id}: by_year/${examOf(id)}.json に無い`);
  // 2 層が既にずれていたら、どちらを前状態とみなすべきか決められない → 止める (crosscheck B6 の領分)
  if (JSON.stringify(pagePart(bankQ.source)) !== JSON.stringify(pagePart(yearQ.source)))
    throw new Error(`${id}: question_bank と by_year の source が既にずれている — 先に B6 を直すこと`);
  if (boxSig(bankQ.figure_bbox_pct) !== boxSig(yearQ.figure_bbox_pct))
    throw new Error(`${id}: question_bank と by_year の figure_bbox_pct が既にずれている — 先に B6 を直すこと`);

  const hasFigure = Boolean(bankQ.figure_bbox_pct);

  // ── (A) source 相 ──
  const { verdict, target, reason } = planTarget(bankQ.source ?? {}, dec, hasFigure);
  if (target === null) { srcNoop++; console.log(`  · ${id}: ${verdict} — ${reason}`); }
  else {
    const before = pagePart(bankQ.source);
    if (JSON.stringify(before) === JSON.stringify(target)) { srcAlready++; console.log(`  = ${id}: source 既に目標状態`); }
    else {
      // assert-once: 目標でないなら「まだ figure_page_* が無い素の状態」+ 判定 JSON の観測値と一致
      if (before.figure_page_image !== undefined || before.figure_page_number !== undefined)
        throw new Error(`${id}: 既に figure_page_* があるが目標と異なる — 中止\n    現在 ${JSON.stringify(before)}\n    目標 ${JSON.stringify(target)}`);
      const expectNum = Number.isInteger(dec.expect_page_number) ? dec.expect_page_number
        : Number.isInteger(dec.current_page_number) ? dec.current_page_number : null;
      if (expectNum !== null && before.page_number !== expectNum)
        throw new Error(`${id}: 判定 JSON の適用前ページ ${expectNum} だが現在 ${before.page_number} — 中止 (判定が古い?)`);
      if (typeof dec.current_page_image === "string" && before.page_image !== dec.current_page_image)
        throw new Error(`${id}: 判定 JSON の current_page_image=${dec.current_page_image} だが現在 ${before.page_image} — 中止`);
      for (const rel of [target.page_image, target.figure_page_image].filter(Boolean))
        if (!existsSync(path.join(EXAMS, rel))) throw new Error(`${id}: ${rel} が存在しない`);

      console.log(`  ✓ ${verdict} ${id} — ${reason}`);
      console.log(`      source before ${JSON.stringify(before)}`);
      console.log(`      source after  ${JSON.stringify(target)}`);
      for (const rec of [bankQ, yearQ]) {
        rec.source = { ...(rec.source ?? {}) };
        rec.source.page_image = target.page_image;
        rec.source.page_number = target.page_number;
        if (target.figure_page_image !== undefined) {
          rec.source.figure_page_image = target.figure_page_image;
          rec.source.figure_page_number = target.figure_page_number;
        } else { delete rec.source.figure_page_image; delete rec.source.figure_page_number; }
      }
      touchedExams.add(examOf(id));
      srcApplied++;
    }
  }

  // ── (B) bbox 相 ── (KEEP でも走る: ポインタは正しいが裁断枠だけ悪い問がある)
  const bb = planBbox(bankQ.figure_bbox_pct ?? null, dec);
  if (bb.target === null) { boxNoop++; continue; }
  const curBox = bankQ.figure_bbox_pct;
  if (boxSig(curBox) === boxSig(bb.target)) { boxAlready++; console.log(`  = ${id}: figure_bbox_pct 既に目標状態`); continue; }
  if (dec.figure_bbox_pct_current && boxSig(curBox) !== boxSig(dec.figure_bbox_pct_current))
    throw new Error(`${id}: 判定 JSON の figure_bbox_pct_current ${JSON.stringify(dec.figure_bbox_pct_current)} と現在 ${JSON.stringify(curBox)} が違う — 中止 (判定が古い?)`);
  console.log(`  ✓ BBOX ${id} — ${bb.reason}`);
  console.log(`      bbox before ${JSON.stringify(curBox)}`);
  console.log(`      bbox after  ${JSON.stringify(bb.target)}`);
  for (const rec of [bankQ, yearQ]) rec.figure_bbox_pct = { ...bb.target };
  bboxChanged.push({ id, before: curBox, after: { ...bb.target } });
  touchedExams.add(examOf(id));
  boxApplied++;
}

if ((srcApplied || boxApplied) && !DRY) {
  writeFileSync(BANK, JSON.stringify(bankDoc, null, 2) + "\n");
  for (const [exam, { file, doc }] of byYearDocs) {
    if (!touchedExams.has(exam)) continue;
    writeFileSync(file, JSON.stringify(doc, null, 2) + "\n");
  }
}

console.log(`\n${DRY ? "(dry-run) " : "✓ "}quiz-pagefix-apply (判定 ${decisions.length} 件, ${path.relative(ROOT, DECISIONS_FILE)})`);
console.log(`  source 相 : 適用 ${srcApplied} / 既適用 ${srcAlready} / KEEP・no-op ${srcNoop}`);
console.log(`  bbox 相   : 適用 ${boxApplied} / 既適用 ${boxAlready} / 据置 ${boxNoop}`);
if (touchedExams.size) console.log(`  層        : question_bank.json + by_year/{${[...touchedExams].sort().join(",")}}.json${DRY ? " (未書込)" : ""}`);

// ── 再裁断 + WebP 再生成 ─────────────────────────────────────────────────────────
// 単独図      : 図ページから素の extract (trunc 式 = 旧 crop-and-update の PIL 式)。
// 中問の共有図: groups.json の shared_figure を再裁断 (trim+pad) して全メンバーに複製 (D-120 の単一真相源)。
if (bboxChanged.length && !DRY && !NO_RECROP) {
  const sharp = createRequire(path.join(ROOT, "apps/web/package.json"))("sharp");
  const gdoc = existsSync(GROUPS) ? rj(GROUPS) : null;
  const groups = gdoc ? (gdoc.groups ?? gdoc) : [];
  const groupById = new Map(groups.map((g) => [g.group_id, g]));
  const backup = (f) => { const b = f + ".pre-D145.bak"; if (existsSync(f) && !existsSync(b)) copyFileSync(f, b); };

  // 組ごとに畳む (同じ共有図を 4 回裁断しない)
  const groupJobs = new Map(); // gid → { box, members:Set }
  const soloJobs = [];
  for (const { id } of bboxChanged) {
    const q = bankById.get(id);
    const gid = q.figure_type === "shared" && q.figure_group && groupById.has(q.figure_group) ? q.figure_group : null;
    if (gid) {
      const j = groupJobs.get(gid) ?? { box: q.figure_bbox_pct, members: new Set(), ids: [] };
      if (boxSig(j.box) !== boxSig(q.figure_bbox_pct))
        throw new Error(`${gid}: 同じ組のメンバーに異なる目標 bbox — 組の共有図は 1 つなので矛盾 (${id})`);
      j.ids.push(id); groupJobs.set(gid, j);
    } else soloJobs.push(id);
  }

  console.log(`\n── 再裁断 (単独図 ${soloJobs.length} / 中問共有図 ${groupJobs.size} 組) ──`);
  for (const id of soloJobs) {
    const q = bankById.get(id);
    const b = q.figure_bbox_pct;
    const pageRel = q.source.figure_page_image ?? q.source.page_image;
    const pagePath = path.join(EXAMS, pageRel);
    const dest = path.join(FIGURES, `${id}.png`);
    const m = await sharp(pagePath).metadata();
    const L = Math.max(0, Math.trunc(b.x1 * m.width)), T = Math.max(0, Math.trunc(b.y1 * m.height));
    const R = Math.min(m.width, Math.trunc(b.x2 * m.width)), B = Math.min(m.height, Math.trunc(b.y2 * m.height));
    if (R <= L || B <= T) throw new Error(`${id}: 裁断枠が空 (${L},${T},${R},${B})`);
    const oldMeta = existsSync(dest) ? await sharp(dest).metadata() : null;
    backup(dest);
    await sharp(pagePath).extract({ left: L, top: T, width: R - L, height: B - T }).png().toFile(dest);
    const nm = await sharp(dest).metadata();
    console.log(`  ✓ ${id}: ${pageRel} ${oldMeta ? `${oldMeta.width}x${oldMeta.height}` : "—"} → ${nm.width}x${nm.height}`);
  }
  for (const [gid, j] of groupJobs) {
    const g = groupById.get(gid);
    const b = bankById.get(j.ids[0]).figure_bbox_pct;
    // 図ページは D-145 の member 側 (figure_page_image) と groups.json の shared_figure が一致していること
    const memberPage = bankById.get(j.ids[0]).source.figure_page_image ?? bankById.get(j.ids[0]).source.page_image;
    if (g.shared_figure?.page_image && g.shared_figure.page_image !== memberPage)
      throw new Error(`${gid}: groups.json の shared_figure.page_image=${g.shared_figure.page_image} と member の図ページ ${memberPage} が不一致`);
    const pagePath = path.join(EXAMS, memberPage);
    const m = await sharp(pagePath).metadata();
    const L = Math.round(m.width * b.x1), T = Math.round(m.height * b.y1);
    const W = Math.round(m.width * (b.x2 - b.x1)), H = Math.round(m.height * (b.y2 - b.y1));
    const rawBuf = await sharp(pagePath).extract({ left: L, top: T, width: W, height: H }).png().toBuffer();
    // chumon-recrop (D-144 段 3(ii)) と同じ後処理: 余白 trim → 16px 白パディング
    const pipe = sharp(rawBuf).trim({ threshold: 40 }).extend({ top: 16, bottom: 16, left: 16, right: 16, background: "#fff" }).png();
    const gdest = path.join(FIGURES, "_groups", `${gid}.png`);
    backup(gdest);
    const info = await pipe.toFile(gdest);
    console.log(`  ✓ ${gid}: ${memberPage} → ${info.width}x${info.height} (trim+pad)`);
    for (const mid of g.member_qids ?? []) {
      const mq = bankById.get(mid);
      if (!mq?.figure_path || mq.figure_path !== `figures/${mid}.png`) { console.log(`      · ${mid}: figure_path=${mq?.figure_path ?? "—"} — 複製せず`); continue; }
      const mdest = path.join(FIGURES, `${mid}.png`);
      backup(mdest); copyFileSync(gdest, mdest);
      console.log(`      ✓ ${mid} ← ${gid}`);
    }
    if (g.shared_figure) { g.shared_figure.bbox_pct = { ...b }; g.shared_figure.recropped = "S118 D-145"; }
  }
  if (groupJobs.size && gdoc) writeFileSync(GROUPS, JSON.stringify(gdoc, null, 2) + "\n");

  // WebP 再生成 — build-quiz-figures.mjs は出力ディレクトリを作り直すので、前後の md5 で変化した図を列挙する
  const md5dir = (d) => existsSync(d)
    ? new Map(readdirSync(d).filter((f) => f.endsWith(".webp")).map((f) => [f, createHash("md5").update(readFileSync(path.join(d, f))).digest("hex")]))
    : new Map();
  const before = md5dir(WEBP);
  console.log(`\n── WebP 再生成 (build-quiz-figures.mjs) ──`);
  execFileSync(process.execPath, [path.join(ROOT, "scripts/build-quiz-figures.mjs")], { stdio: "inherit", cwd: ROOT });
  const after = md5dir(WEBP);
  const changed = [...after].filter(([f, h]) => before.get(f) !== h).map(([f]) => f);
  const removed = [...before.keys()].filter((f) => !after.has(f));
  console.log(`  WebP: ${after.size} 件中 **${changed.length} 件が変化**${removed.length ? ` / ${removed.length} 件消滅` : ""}`);
  for (const f of changed) console.log(`    ~ apps/web/public/quiz-figures/${f} (${statSync(path.join(WEBP, f)).size} B)`);
  for (const f of removed) console.log(`    - ${f}`);
} else if (bboxChanged.length && (DRY || NO_RECROP)) {
  console.log(`\n(再裁断 ${DRY ? "dry-run" : "--no-recrop"} のため未実行 — 対象 ${bboxChanged.length} 図)`);
}

console.log(`\n  次: node scripts/quiz-keys-crosscheck.mjs   (B6 図メタ 2 層一致 / B7 ページポインタ健全性)`);
