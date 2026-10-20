#!/usr/bin/env node
// Stage 6 / Quiz — S130 **T1** (D-150 §4 段 3 = 方式 D、訳層照合) の対象リスト (0 token、冪等、読み取り専用)。
// 形は quiz-a2b-targets-S127.mjs の出力と同じ (quiz-tr-prep-S127.mjs がそのまま読む)。
//
// 対象: S128〜S129 の B track で jp 層を源照合した 13 exam の全題 (B_UNITS)、ただし A2b で照合済の題
//       (a2b_targets_S127.json の questions[].id) を除く。
// jp_history: B1 の親 (BASE) と HEAD の jp 表示層 (stem = stem_jp_clean 優先、choices = choices_jp) を比べ、
//       field が normStr 非等価に変わった題に付ける (旧 jp → 新 jp は BASE → HEAD の正味の差。間の A3 / A4 / A5 の
//       jp 変更も含む)。touched_by = その field を normStr 非等価に変えた BASE..HEAD の data commit (git log、unit 名付き)。
//       normStr で等しくなる変更 (空白・引用符字種等) は非計上 (件数だけ記録) — A2b と同じ。
//
// Run: node scripts/quiz-tr-targets-S130.mjs
//   → data/ip/quiz/.phase2/t1_targets_S130.json
//   → evidence/phase5/stage_06_quiz_fidelity/t1_targets_S130.json (同内容の写し)
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normStr } from "./quiz-choice-defect-scan.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P = (...s) => path.join(ROOT, ...s);
const OUTS = ["data/ip/quiz/.phase2/t1_targets_S130.json", "evidence/phase5/stage_06_quiz_fidelity/t1_targets_S130.json"];
const A2B_REL = "data/ip/quiz/.phase2/a2b_targets_S127.json";

// B track の unit (S128〜S129)。exam → unit
const B_UNITS = [
  ["B1", "2015h27h"], ["B2", "2014h26h"], ["B3", "2014h26a"], ["B4", "2013h25h"], ["B5", "2013h25a"], ["B6", "2012h24h"], ["B7", "2012h24a"],
  ["B8", "2011h23tokubetsu"], ["B9", "2011h23a"], ["B10", "2010h22h"], ["B11", "2010h22a"], ["B12", "2009h21h"], ["B13", "2009h21a"],
];
const UNIT_OF = new Map(B_UNITS.map(([u, e]) => [e, u]));
const B1_COMMIT = "6c1f38e";
const sh = (...a) => execFileSync("git", ["-C", ROOT, ...a], { encoding: "utf-8", maxBuffer: 1 << 28 }).trim();
const BASE = sh("rev-parse", "--short", `${B1_COMMIT}^`);
const HEAD = sh("rev-parse", "--short", "HEAD");

const git = (rev, rel) => {
  try { return JSON.parse(execFileSync("git", ["-C", ROOT, "show", `${rev}:${rel}`], { encoding: "utf-8", maxBuffer: 1 << 28 })); }
  catch { return null; }
};
const SNAP = new Map();
/** rev 時点の jp 表示層 (13 exam のみ): id → { stem, "choice.ア", … } */
function display(rev) {
  if (SNAP.has(rev)) return SNAP.get(rev);
  const Q = git(rev, "data/ip/quiz/questions.json").questions.filter((q) => UNIT_OF.has(q.exam_id));
  const tr = {};
  for (const e of UNIT_OF.keys()) tr[e] = git(rev, `data/ip/quiz/translations/${e}.json`)?.questions ?? {};
  const m = new Map();
  for (const q of Q) {
    const c = tr[q.exam_id][q.id]?.stem_jp_clean;
    m.set(q.id, { stem: c?.trim() ? c : q.stem_jp, ...Object.fromEntries(Object.entries(q.choices_jp ?? {}).map(([k, v]) => [`choice.${k}`, v])) });
  }
  SNAP.set(rev, m);
  return m;
}
/** before → after で normStr 非等価に変わった field: id → [field, …]、および変わった題 (自明含む) */
function diff(before, after) {
  const any = new Set(), sem = new Map();
  for (const [id, now] of after) {
    const old = before.get(id) ?? {};
    for (const f of [...new Set([...Object.keys(old), ...Object.keys(now)])].sort()) {
      if (old[f] === now[f]) continue;
      any.add(id);
      if (normStr(old[f]) === normStr(now[f])) continue;           // 空白・引用符字種だけの変更は訳に効かない
      if (!sem.has(id)) sem.set(id, []);
      sem.get(id).push(f);
    }
  }
  return { any, sem };
}

const a2bBuf = readFileSync(P(A2B_REL));
const A2B_IDS = new Set(JSON.parse(a2bBuf.toString("utf-8")).questions.map((q) => q.id));

// BASE..HEAD の data commit ごとの寄与 (touched_by 用)
const COMMITS = sh("log", "--reverse", "--format=%h %s", `${BASE}..${HEAD}`, "--", "data/ip/quiz/questions.json", "data/ip/quiz/translations")
  .split("\n").filter(Boolean).map((l) => {
    const [h, ...s] = l.split(" ");
    const m = s.join(" ").match(/\b(B\d+|A\d+[a-z]?)\b/);
    return { commit: h, unit: m ? m[1] : "?" };
  });
const touched = new Map();   // `${id}|${field}` → [unit@commit]
const commitStats = [];
for (const c of COMMITS) {
  const { any, sem } = diff(display(`${c.commit}^`), display(c.commit));
  for (const [id, fs] of sem) for (const f of fs) { const k = `${id}|${f}`; if (!touched.has(k)) touched.set(k, []); touched.get(k).push(`${c.unit}@${c.commit}`); }
  commitStats.push({ ...c, changed_questions: any.size, nontrivial_questions: sem.size });
}

const before = display(BASE), after = display(HEAD);
const net = diff(before, after);
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const questions = [];
let excludedA2b = 0;
for (const id of [...after.keys()].sort(cmp)) {
  if (A2B_IDS.has(id)) { excludedA2b++; continue; }
  const exam_id = id.replace(/-q\d+$/, ""), unit = UNIT_OF.get(exam_id);
  const jp_history = (net.sem.get(id) ?? []).map((f) => ({
    // unit = その field を変えた commit の unit (例 "B2" / "A4" / "A3+B5")。commit が拾えない正味差分 (往復等) は exam の B unit
    unit: [...new Set((touched.get(`${id}|${f}`) ?? []).map((t) => t.split("@")[0]))].join("+") || unit, commit: `${BASE}..${HEAD}`, field: f, old_jp: before.get(id)?.[f] ?? null, new_jp: after.get(id)[f] ?? null, touched_by: touched.get(`${id}|${f}`) ?? [],
  }));
  questions.push({ id, exam_id, question_number: Number(id.slice(-3)), sector: "13exam", unit, sources: [jp_history.length ? "B_jp_fix" : "B_verified"], jp_history });
}
const exams = {};
for (const q of questions) (exams[q.exam_id] ??= []).push(q.question_number);
const cnt = (pred) => questions.filter(pred).length;
const out = {
  schema: "a2b_targets/1",
  script: "scripts/quiz-tr-targets-S130.mjs",
  decision: "D-150 §4 段 3 (方式 D) T1 — B track 13 exam",
  source: { base: BASE, head: HEAD, b1_commit: B1_COMMIT, b_units: B_UNITS.map(([unit, exam_id]) => ({ unit, exam_id })), commits: COMMITS,
    a2b_excluded_from: A2B_REL, a2b_sha256_16: createHash("sha256").update(a2bBuf).digest("hex").slice(0, 16) },
  definition: {
    B_verified: "B track (S128〜S129) で jp 層を源照合した 13 exam の題 (A2b 照合済を除く)",
    B_jp_fix: "うち BASE (B1 の親) → HEAD で jp 表示層の field が normStr 非等価に変わった題 (jp_history = 正味の 旧 → 新、touched_by = 変えた commit)",
    trivial_excluded: "normStr で等しくなる変更 (空白・引用符字種・読点字種) だけの field は jp_history に載せない",
  },
  commit_stats: commitStats,
  counts: {
    questions: questions.length, exams: Object.keys(exams).length, excluded_a2b: excludedA2b,
    jp_fix_any: cnt((q) => q.jp_history.length > 0), jp_fix_fields: questions.reduce((s, q) => s + q.jp_history.length, 0),
    net_changed_incl_trivial: net.any.size,
    by_unit: Object.fromEntries(B_UNITS.map(([u]) => [u, { questions: cnt((q) => q.unit === u), jp_fix: cnt((q) => q.unit === u && q.jp_history.length > 0) }])),
  },
  exams: Object.fromEntries(Object.entries(exams).sort(([a], [b]) => cmp(a, b)).map(([k, v]) => [k, v.sort((x, y) => x - y)])),
  questions,
};
const body = JSON.stringify(out, null, 1) + "\n";
for (const o of OUTS) writeFileSync(P(o), body);
console.log(`T1 targets: ${questions.length} 題 / ${Object.keys(exams).length} exam (A2b 照合済除外 ${excludedA2b}) — jp 是正 ${out.counts.jp_fix_any} 題 / ${out.counts.jp_fix_fields} field (${BASE}..${HEAD}、自明含む変更 ${net.any.size} 題)`);
for (const [u, e] of B_UNITS) console.log(`  ${u.padEnd(4)} ${e.padEnd(17)} ${String(out.counts.by_unit[u].questions).padStart(3)} 題 / jp 是正 ${out.counts.by_unit[u].jp_fix}`);
for (const c of commitStats) console.log(`  ${c.commit} ${c.unit.padEnd(4)} jp 変更 ${String(c.changed_questions).padStart(3)} 題 / 計上 ${c.nontrivial_questions}`);
for (const o of OUTS) console.log(`  → ${o}`);
