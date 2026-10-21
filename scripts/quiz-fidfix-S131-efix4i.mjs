#!/usr/bin/env node
// Stage 6 / Quiz — S131 **efix4i** (解説是正 lane、D-176 / D-177: 1 unit = 1 exam): 解説全量監査 efull_5 (evidence/phase5/stage_06_quiz_phase2/
// ruleA_result_S131_efull_5.json) のうち 2024r06 の medium 3 題 + key_guard_invalid 1 題 (q097 low) を是正する。evidence/quiz_efix4i_expl_S131.md。
//
// 層・方針は quiz-fidfix-S131-efix4d と同じ。translations sidecar は照合のみで同じ誤りは無し。
// key_guard_invalid の q097 は key_guard / round1 の値・既存 note・suspect に触れず、D-143 note を final に後置して記録する。
//
// ── 是正 (判定は evidence §1) ──
//   2024r06-q009 イ・要点 2: 観察で文化を類推する手法の名称「フィールドワーク」→ エスノグラフィ (フィールドワークはその手段)。
//   2024r06-q012 イ: 責任の分担の記述を「公平性、説明責任及び透明性の原則」に帰属 → 「人間中心の原則」。
//   2024r06-q055 ア: 「監査は完成・運用中のシステムを評価する立場」→ 独立した立場でライフサイクル全体を点検・評価、要件を決める当事者ではない。
//   2024r06-q097 note: suspect=true は figure_derivable=false (図なし題で立った flag) から来ており、導出・key 一致に疑いは無い。
//
// Run: node scripts/quiz-fidfix-S131-efix4i.mjs            (dry-run)
//      node scripts/quiz-fidfix-S131-efix4i.mjs --apply    (D-152 lock 取得後のみ)
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2024r06
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

// subN: 出現数 n を厳密に要求して全置換。0 回なら skip (冪等)、n と違えば中断。事後確認つき (quiz-fidfix-S130-n9b と同じ)。
function subN(obj, key, from, to, n, where) {
  const s = obj?.[key];
  if (typeof s !== "string") throw new Error(`${where}: field ${key} missing`);
  const k = s.split(from).length - 1;
  if (k === 0) { skipped++; return false; }
  if (k !== n) throw new Error(`${where}: 「${from}」 occurs ${k}× (expected ${n}) — abort`);
  const next = s.split(from).join(to);
  const cnt = (x, y) => x.split(y).length - 1;
  if (cnt(next, to) !== cnt(s, to) - n * cnt(from, to) + n || next.includes(from)) throw new Error(`${where}: 置換後の事後確認に失敗 — abort`);
  obj[key] = next; applied++; log.push(`  ✓ ${where}: 「${from.slice(0, 40)}」→「${to.slice(0, 40)}」 ×${n}`); return true;
}

// [id, where (correct | d:ア〜エ | p:idx), lang (jp | zh | en), from, to, n]
const EXPL = [
  // 2024r06-q009
  ["2024r06-q009", "d:イ", "jp", "「フィールドワーク（現地調査）」の説明です。", "「エスノグラフィ」(参与観察やフィールドワークによって集団の文化を理解する手法) の説明です。", 1],
  ["2024r06-q009", "d:イ", "zh", "这是「现场调查（fieldwork）」的说明。", "这是「民族志（ethnography，通过参与观察、实地调查来理解群体文化的方法）」的说明。", 1],
  ["2024r06-q009", "d:イ", "en", "is the description of fieldwork (a field survey).", "is the description of ethnography (a method of understanding a group's culture through participant observation and fieldwork).", 1],
  ["2024r06-q009", "p:1", "jp", "フィールドワーク（観察による文化類推）", "エスノグラフィ（参与観察・フィールドワークによる文化の類推）", 1],
  ["2024r06-q009", "p:1", "zh", "现场调查（通过观察推断文化）", "民族志（通过参与观察、实地调查推断文化）", 1],
  ["2024r06-q009", "p:1", "en", "fieldwork (inferring culture through observation)", "ethnography (inferring culture through participant observation and fieldwork)", 1],
  // 2024r06-q012
  ["2024r06-q012", "d:イ", "jp", "これは「公平性、説明責任及び透明性の原則」（説明責任・アカウンタビリティ）に関するもの。", "これは「人間中心の原則」(AI の利用は人が判断・決定し、結果の責任は関係者が分担して負う) に関するもの。", 1],
  ["2024r06-q012", "d:イ", "zh", "这属于「公平性、问责性及透明性原则」（问责性／accountability）的内容，", "这属于「以人为本原则」（AI 的使用由人来判断和决定，其结果的责任由相关方分担）的内容，", 1],
  ["2024r06-q012", "d:イ", "en", "it concerns the “Principle of Fairness, Accountability, and Transparency” (accountability), not", "it concerns the “Human-Centric Principle” (people judge and decide on the use of AI, and the parties involved share responsibility for its results), not", 1],
  // 2024r06-q055
  ["2024r06-q055", "d:ア", "jp", "監査は完成・運用中のシステムを評価する立場で、要件を決める立場ではない。", "監査は独立した立場でシステムを (開発中のものを含むライフサイクル全体にわたって) 点検・評価するもので、要件を決める当事者ではない。", 1],
  ["2024r06-q055", "d:ア", "zh", "审计处于对已完成、运行中的系统进行评估的立场，而不是决定需求的立场。", "审计是以独立的立场对系统（包括开发中在内的整个生命周期）进行检查和评价，而不是决定需求的当事方。", 1],
  ["2024r06-q055", "d:ア", "en", "An audit is in the position of evaluating a completed or operating system, not of deciding its requirements.", "An audit checks and evaluates the system from an independent position (across its whole life cycle, including development), and is not the party that decides its requirements.", 1],
];

// translations sidecar (+ .phase1 tr_): 照合のみ、同じ誤りは無し
const TRFIX = [];

// ── D-143 note (final のみ後置、round1・既存 note・flag は不可触) ──
const MARK = "fidfix-S131-efix4i";
const E = "S131 efix4i 解説監査 (efull_5)";
const N = (id, s) => [id, () => `（${E}: ${s} — ${MARK}）`];
const NOTE_APPEND = [
  N("2024r06-q009", "誤答肢イ・要点 2 が、観察で慣習・嗜好・文化を類推する手法を「フィールドワーク」と呼んでいたのを、標準名称の「エスノグラフィ」(フィールドワークはそのデータ収集の手段) に改めた (jp / zh / en)。correct_answer=ア は不変"),
  N("2024r06-q012", "誤答肢イ (関係者が責任を分担して負う) の帰属を「公平性、説明責任及び透明性の原則」から、原則の本文どおり「人間中心の原則」に改めた (jp / zh / en)。correct_answer=ア は不変"),
  N("2024r06-q055", "誤答肢アの「監査は完成・運用中のシステムを評価する立場」はシステム監査の対象を狭めるため、独立した立場でライフサイクル全体 (開発中を含む) を点検・評価する、要件を決める当事者ではない、に改めた (jp / zh / en)。correct_answer=ウ は不変"),
  N("2024r06-q097", "key_guard の記録 (監査で key_guard_valid=false): suspect=true は、final・round1 とも figure_derivable=false になっていることから来ている。本問は図の無い概念問で、題幹と選択肢だけから導出できる (Android・FreeBSD・Linux = OSS、iOS = 非 OSS → a, b, d = イ、stored key と一致、腐敗なし)。figure_derivable=false と suspect=true は実態に合わないが、flag は D-143 の union 則で保持する。correct_answer=イ は不変"),
];

// ── 適用 ──
const EXP = new Map();
const explPair = (id) => {
  if (!EXP.has(id)) {
    const jf = P("data/ip/quiz/.phase2", `expl_jp_${id}.json`), tf = P("data/ip/quiz/.phase2", `expl_tr_${id}.json`);
    EXP.set(id, { jf, tf, j: rj(jf), tr: rj(tf) });
  }
  return EXP.get(id);
};
const explField = (id, w, Lg) => {
  const { j, tr } = explPair(id);
  if (Lg === "jp") {
    if (w === "correct") return [j, "correct_jp"];
    if (w.startsWith("d:")) return [j.distractors_jp.find((d) => d.letter === w.slice(2)), "why_wrong_jp"];
    return [j.points_jp, Number(w.slice(2))];
  }
  const o = w === "correct" ? tr.correct : w.startsWith("d:") ? tr.distractors.find((d) => d.letter === w.slice(2)) : tr.points[Number(w.slice(2))];
  return [o, Lg];
};
for (const [id, w, Lg, from, to, n] of EXPL) { const [o, k] = explField(id, w, Lg); subN(o, k, from, to, n, `${id} expl_${Lg === "jp" ? "jp" : "tr"}.${w}.${Lg}`); }

const TR = {}; const T1 = new Map();
for (const [id, ch, Lg, from, to, n] of TRFIX) {
  const e = id.split("-q")[0];
  TR[e] ??= rj(P("data/ip/quiz/translations", `${e}.json`));
  const t = TR[e].questions[id];
  if (!t) throw new Error(`${id}: sidecar に無い`);
  // ch = "stem" なら題幹、それ以外は選択肢の字母
  subN(ch === "stem" ? t.stem : t.choices[ch], Lg, from, to, n, `${id} translations.${ch === "stem" ? "stem" : `choices.${ch}`}.${Lg}`);
  const f1 = P("data/ip/quiz/.phase1", `tr_${id}.json`);
  if (existsSync(f1)) {
    if (!T1.has(f1)) T1.set(f1, rj(f1));
    const d1 = T1.get(f1);
    subN(ch === "stem" ? d1.stem : d1.choices.find((c) => c.letter === ch), Lg, from, to, n, `${id} .phase1 tr_.${ch === "stem" ? "stem" : `choices.${ch}`}.${Lg}`);
  }
}

for (const { jf, tf, j, tr } of EXP.values()) { wj(jf, j); wj(tf, tr); }
for (const e of Object.keys(TR)) wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]);
for (const [f, d] of T1) wj(f, d);

const GR = {};
for (const [id, mk] of NOTE_APPEND) {
  const e = id.split("-q")[0];
  GR[e] ??= rj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`));
  const r = GR[e].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(mk())) { skipped++; continue; }
  r.key_guard.note_jp = `${r.key_guard.note_jp}${mk()}`; applied++; log.push(`  ✓ ${id} final note: 追記 (round1・flag untouched)`);
}
for (const e of Object.keys(GR)) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);

console.log(log.join("\n"));
console.log(`  files ${DRY ? "to write" : "written"} (${written.length}): ${written.join(", ")}`);
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S131-efix4i: applied ${applied}, skipped ${skipped}`);
