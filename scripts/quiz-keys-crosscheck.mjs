#!/usr/bin/env node
// Stage 6 / Quiz — S117: 正解 key と成果物の交叉核対 (決定的、LLM なし)。
//
// 背景: S98/S99/S110/S111/S116 で correct_answer を 3 層 (question_bank / answer_keys / by_year) + 派生
// questions.json にまたがって是正してきた。S116 は「交叉核対 mismatch 0/2900」を keyfix script の中で
// その場限りに確認していただけで、常設ゲートが無かった (backlog ⑥)。本 script はそれを常設化する。
//
// ══ Layer A: committed data だけで走る (CI で常時) ══
//   A1 questions.json: 2900 問・id 一意・correct_answer ∈ {ア,イ,ウ,エ}・choices_jp が 4 肢揃う
//   A2 explanations/<exam>.json: 全問にエントリ・distractors の字母集合 == 非正解 3 肢・key_guard.suspect が boolean
//   A3 translations/<exam>.json: 全問にエントリ・choices の字母集合 == questions の 4 肢
//   A4 quiz_index.json: stats.questions == 2900・exams 29・各 exam の question_count == 実数
//   A5 D-142 禁止語: zh (quiz sidecar + textbook units) に 主机托管 / 服务器托管 / 托管（hosting） が無い
//   A2 には sidecar top-level の suspect_count / stem_corruption_count と実数の一致も含む
//
// ══ Layer B: raw (gitignored) がある時だけ走る (ローカル gate) ══
//   B1 questions.correct_answer == question_bank.correct_answer
//   B2 questions.correct_answer == answer_keys[exam].answers[n]
//   B3 questions.correct_answer == by_year/<exam>.json の correct_answer
//   B4 explanations の key_guard が .phase2/generate_result から決定的に導かれる状態にある (round1 は差分時のみ publish かつ一致、
//      final の derived フィールド一致、stem_corruption_suspected / suspect は union 則) — D-143: explfix は round1 に触れない
//   raw が無い環境では Layer B を「skipped (raw absent)」と明示して exit 0 — ただし --require-raw を付けると exit 1。
//
// Run:  node scripts/quiz-keys-crosscheck.mjs [--committed-only] [--require-raw]

import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const Q = path.join(ROOT, "data/ip/quiz");
const RAW = path.join(ROOT, "data/ip/exams");
const LETTERS = ["ア", "イ", "ウ", "エ"];
const COMMITTED_ONLY = process.argv.includes("--committed-only");
const REQUIRE_RAW = process.argv.includes("--require-raw");

const problems = [];
function bad(layer, msg) { problems.push(`[${layer}] ${msg}`); }
const rj = (p) => JSON.parse(readFileSync(p, "utf-8"));

// ───────────────────────── Layer A ─────────────────────────
const questions = rj(path.join(Q, "questions.json")).questions;
const byExam = new Map();
{
  const ids = new Set();
  for (const q of questions) {
    if (ids.has(q.id)) bad("A1", `${q.id}: duplicate id`);
    ids.add(q.id);
    if (!LETTERS.includes(q.correct_answer)) bad("A1", `${q.id}: correct_answer '${q.correct_answer}' not in ア/イ/ウ/エ`);
    const ck = Object.keys(q.choices_jp ?? {}).sort().join("");
    if (ck !== LETTERS.slice().sort().join("")) bad("A1", `${q.id}: choices_jp letters = ${ck}`);
    if (!byExam.has(q.exam_id)) byExam.set(q.exam_id, []);
    byExam.get(q.exam_id).push(q);
  }
  if (questions.length !== 2900) bad("A1", `questions.json has ${questions.length} questions (expected 2900)`);
}

for (const [exam, qs] of byExam) {
  // A2 explanations
  const ef = path.join(Q, "explanations", `${exam}.json`);
  if (!existsSync(ef)) { bad("A2", `${exam}: explanations sidecar missing`); }
  else {
    const e = rj(ef);
    for (const q of qs) {
      const ent = e.questions[q.id];
      if (!ent) { bad("A2", `${q.id}: no explanation entry`); continue; }
      const want = LETTERS.filter((L) => L !== q.correct_answer).join("");
      const got = Object.keys(ent.distractors ?? {}).sort().join("");
      if (got !== want) bad("A2", `${q.id}: distractors=${got} but non-correct letters=${want} (key=${q.correct_answer})`);
      if (typeof ent.key_guard?.suspect !== "boolean") bad("A2", `${q.id}: key_guard.suspect not boolean`);
    }
    if (e.count !== qs.length) bad("A2", `${exam}: sidecar count=${e.count} vs ${qs.length}`);
    const nSus = Object.values(e.questions).filter((x) => x.key_guard?.suspect === true).length;
    const nSc = Object.values(e.questions).filter((x) => x.key_guard?.stem_corruption_suspected === true).length;
    if (e.suspect_count !== nSus) bad("A2", `${exam}: suspect_count=${e.suspect_count} but ${nSus} entries have suspect=true`);
    if (e.stem_corruption_count !== nSc) bad("A2", `${exam}: stem_corruption_count=${e.stem_corruption_count} but ${nSc} entries have stem_corruption_suspected=true`);
  }
  // A3 translations
  const tf = path.join(Q, "translations", `${exam}.json`);
  if (!existsSync(tf)) { bad("A3", `${exam}: translations sidecar missing`); }
  else {
    const t = rj(tf);
    for (const q of qs) {
      const ent = t.questions[q.id];
      if (!ent) { bad("A3", `${q.id}: no translation entry`); continue; }
      const got = Object.keys(ent.choices ?? {}).sort().join("");
      if (got !== LETTERS.slice().sort().join("")) bad("A3", `${q.id}: translation choices letters=${got}`);
    }
  }
}

// A4 quiz_index
{
  const idx = rj(path.join(Q, "quiz_index.json"));
  if (idx.stats?.questions !== questions.length) bad("A4", `quiz_index.stats.questions=${idx.stats?.questions} vs ${questions.length}`);
  if ((idx.exams ?? []).length !== byExam.size) bad("A4", `quiz_index.exams=${idx.exams?.length} vs ${byExam.size}`);
  for (const ex of idx.exams ?? []) {
    const n = byExam.get(ex.exam_id)?.length ?? 0;
    if (ex.question_count !== n) bad("A4", `${ex.exam_id}: quiz_index question_count=${ex.question_count} vs ${n}`);
  }
}

// A5 D-142 禁止語 — quiz sidecar の `.zh` と、教科書 unit の `*_zh` (文字列/文字列配列) の両方を見る
{
  const BAN = /主机托管|服务器托管|(?<![主机房服务器])托管（hosting）/; // D-142 禁止語 + gloss 無し「托管（hosting）」の再発
  const walkZh = (o, p, id, inheritZh = false) => {
    if (o && typeof o === "object") {
      for (const k of Object.keys(o)) {
        const isZh = inheritZh || k === "zh" || k.endsWith("_zh");
        const v = o[k];
        if (typeof v === "string") { if (isZh && BAN.test(v)) bad("A5", `${id} ${p}.${k}: D-142 禁止語 (主机托管/服务器托管)`); }
        else walkZh(v, p + "." + k, id, Array.isArray(v) && isZh);
      }
    }
  };
  for (const dir of ["translations", "explanations"]) {
    for (const f of readdirSync(path.join(Q, dir)).filter((x) => x.endsWith(".json"))) {
      const doc = rj(path.join(Q, dir, f));
      for (const [id, q] of Object.entries(doc.questions)) walkZh(q, "", id);
    }
  }
  const UNITS = path.join(ROOT, "data/ip/textbook/units");
  if (existsSync(UNITS)) for (const f of readdirSync(UNITS).filter((x) => x.endsWith(".json"))) walkZh(rj(path.join(UNITS, f)), "", `textbook/${f}`);
}

// ───────────────────────── Layer B ─────────────────────────
let rawStatus = "skipped (--committed-only)";
if (!COMMITTED_ONLY) {
  const RB = path.join(RAW, "question_bank.json");
  const AK = path.join(RAW, "answer_keys.json");
  const BY = path.join(RAW, "by_year");
  const P2 = path.join(Q, ".phase2");
  const rawPresent = existsSync(RB) && existsSync(AK) && existsSync(BY);
  if (!rawPresent) {
    rawStatus = "skipped (raw absent)";
    if (REQUIRE_RAW) bad("B", "raw data absent but --require-raw given");
  } else {
    rawStatus = "ran";
    const bank = new Map((rj(RB).questions ?? rj(RB)).map((q) => [q.id, q.correct_answer]));
    const ak = rj(AK);
    const byYear = new Map();
    for (const exam of byExam.keys()) {
      const f = path.join(BY, `${exam}.json`);
      if (!existsSync(f)) { bad("B3", `${exam}: by_year file missing`); continue; }
      const d = rj(f);
      const arr = Array.isArray(d) ? d : (d.questions ?? Object.values(d));
      for (const r of arr) byYear.set(r.id, r.correct_answer);
    }
    for (const q of questions) {
      const [exam] = q.id.split("-q");
      const n = String(parseInt(q.id.slice(-3), 10));
      if (!bank.has(q.id)) bad("B1", `${q.id}: not in question_bank`);
      else if (bank.get(q.id) !== q.correct_answer) bad("B1", `${q.id}: questions=${q.correct_answer} question_bank=${bank.get(q.id)}`);
      const ans = ak[exam]?.answers ?? ak[exam];
      if (!ans) bad("B2", `${exam}: not in answer_keys`);
      else if (ans[n] !== q.correct_answer) bad("B2", `${q.id}: questions=${q.correct_answer} answer_keys=${ans[n]}`);
      if (byYear.has(q.id) && byYear.get(q.id) !== q.correct_answer) bad("B3", `${q.id}: questions=${q.correct_answer} by_year=${byYear.get(q.id)}`);
    }
    // B4 key_guard integrity (D-143) — sidecar の key_guard は generate_result から決定的に導かれるはず。
    //   (i) round1 は「final と異なる時に限り必ず publish、かつ全フィールド一致」(merge の round1Differs 則を再計算)。
    //       → explfix が round1 を書き換えた / sidecar から round1 を削った、の両方を検出する。
    //   (ii) final の figure_derivable / derived_answer / matches_key / note_jp は generate_result と一致、
    //        stem_corruption_suspected は union(round1, final)、suspect は union 則 (matches_key=false or figure_derivable=false)。
    //        note_jp も比較する: D-143 §1 で explfix の書込先は generate_result のみ (sidecar 直編集禁止) なので、
    //        merge 済みの sidecar と一致しないのは「explfix 後に merge していない」か「sidecar を直に触った」のどちらか。
    //        ④ で是正した drift の主成分 (18 問) はまさに note_jp だった (reviewer 推奨)。
    if (existsSync(P2)) {
      const R1_FIELDS = ["figure_derivable", "derived_answer", "matches_key", "stem_corruption_suspected", "note_jp"];
      for (const exam of byExam.keys()) {
        const gr = path.join(P2, `generate_result_${exam}.json`);
        const ef = path.join(Q, "explanations", `${exam}.json`);
        if (!existsSync(gr) || !existsSync(ef)) continue;
        const byId = new Map(rj(gr).results.filter((r) => r?.id && r.key_guard).map((r) => [r.id, r]));
        for (const [id, ent] of Object.entries(rj(ef).questions)) {
          const r = byId.get(id);
          if (!r) { bad("B4", `${id}: no key_guard in generate_result`); continue; }
          const kgF = r.key_guard, kg1 = r.key_guard_round1 || kgF;
          const differs = kg1 !== kgF && R1_FIELDS.some((k) => kg1[k] !== kgF[k]);
          const pub = ent.key_guard ?? {};
          if (differs) {
            if (!pub.round1) bad("B4", `${id}: round1 differs from final in generate_result but sidecar publishes no round1 (削除 or 旧 merge)`);
            else for (const k of R1_FIELDS) if ((pub.round1[k] ?? null) !== (kg1[k] ?? null)) bad("B4", `${id}: round1.${k} differs from generate_result (explfix は round1 に触れない — D-143)`);
          } else if (pub.round1) bad("B4", `${id}: sidecar publishes round1 but generate_result round1 == final`);
          for (const k of ["figure_derivable", "derived_answer", "matches_key", "note_jp"]) {
            if ((pub[k] ?? null) !== (kgF[k] ?? null)) bad("B4", `${id}: final.${k}=${JSON.stringify(pub[k])} vs generate_result ${JSON.stringify(kgF[k])} (再 merge 未実施?)`);
          }
          const sc = kg1.stem_corruption_suspected === true || kgF.stem_corruption_suspected === true;
          if (pub.stem_corruption_suspected !== sc) bad("B4", `${id}: stem_corruption_suspected=${pub.stem_corruption_suspected} vs union ${sc}`);
          const sus = kg1.matches_key === false || kg1.figure_derivable === false || kgF.matches_key === false || kgF.figure_derivable === false;
          if (pub.suspect !== sus) bad("B4", `${id}: suspect=${pub.suspect} vs union ${sus}`);
        }
      }
    }
  }
}

// ───────────────────────── report ─────────────────────────
console.log(`quiz-keys-crosscheck: questions=${questions.length} exams=${byExam.size} layerB=${rawStatus}`);
if (problems.length) {
  console.error(`✗ ${problems.length} problem(s):`);
  for (const p of problems.slice(0, 200)) console.error(`  ${p}`);
  if (problems.length > 200) console.error(`  … +${problems.length - 200} more`);
  process.exit(1);
}
console.log(`✓ all invariants hold (A1–A5${rawStatus === "ran" ? ", B1–B4" : ""})`);
