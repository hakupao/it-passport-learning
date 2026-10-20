#!/usr/bin/env node
// Stage 6 / Quiz — S130 **T1 / T2** (D-150 §4 段 3 = 方式 D、訳層照合) の対象リスト (0 token、冪等、読み取り専用)。
// 形は quiz-a2b-targets-S127.mjs の出力と同じ (quiz-tr-prep-S127.mjs がそのまま読む)。
//
// 対象 (TRACKS):
//   t1: S128〜S129 の B track で jp 層を源照合した 13 exam の全題。A2b 照合済 (a2b_targets_S127.json) を除く。
//   t2: ⑤-2 population 16 exam (full52_population_S118.json の excluded 以外)。A2b / T1 照合済を除く。
// jp_history: BASE (track の最初の data commit の親) と HEAD の jp 表示層 (stem = stem_jp_clean 優先、choices = choices_jp) を比べ、
//       field が normStr 非等価に変わった題に付ける (旧 jp → 新 jp は BASE → HEAD の正味の差。間の他 track の
//       jp 変更も含む)。touched_by = その field を normStr 非等価に変えた BASE..HEAD の data commit (git log、unit 名付き)。
//       normStr で等しくなる変更 (空白・引用符字種等) は非計上 (件数だけ記録) — A2b と同じ。
//
// Run: node scripts/quiz-tr-targets-S130.mjs <t1|t2> [--out <path>]
//   → data/ip/quiz/.phase2/<label>_targets_S130.json
//   → evidence/phase5/stage_06_quiz_fidelity/<label>_targets_S130.json (同内容の写し)
//   --out  その 1 path にだけ書く (回帰確認用)
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normStr } from "./quiz-choice-defect-scan.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P = (...s) => path.join(ROOT, ...s);
const A2B_REL = "data/ip/quiz/.phase2/a2b_targets_S127.json";
const POP_REL = "evidence/phase5/stage_06_quiz_fidelity/full52_population_S118.json";
const T1_REL = "data/ip/quiz/.phase2/t1_targets_S130.json";

// track ごとの設定。units = [unit, exam]、base = 比較の起点 (その commit の親)
const TRACKS = {
  // B track の unit (S128〜S129)。BASE = B1 の親
  t1: {
    units: [
      ["B1", "2015h27h"], ["B2", "2014h26h"], ["B3", "2014h26a"], ["B4", "2013h25h"], ["B5", "2013h25a"], ["B6", "2012h24h"], ["B7", "2012h24a"],
      ["B8", "2011h23tokubetsu"], ["B9", "2011h23a"], ["B10", "2010h22h"], ["B11", "2010h22a"], ["B12", "2009h21h"], ["B13", "2009h21a"],
    ],
    first: "6c1f38e", sector: "13exam", exclude: [A2B_REL], tag: "B",
    decision: "D-150 §4 段 3 (方式 D) T1 — B track 13 exam",
    verified: "B track (S128〜S129) で jp 層を源照合した 13 exam の題 (A2b 照合済を除く)",
  },
  // ⑤-2 (S118 波 1〜3 + U3a〜U11) の population。BASE = ⑤-2 最初の data commit (波 1〜3 ce3e31e) の親 = 母数確定時点
  t2: {
    units: [
      ["wave1-3", "2015h27a"], ["wave1-3", "2016h28a"], ["wave1-3", "2016h28h"], ["wave1-3", "2017h29a"], ["wave1-3", "2017h29h"], ["wave1-3", "2018h30a"],
      ["U3a", "2018h30h"], ["U3b", "2019h31h"], ["U4", "2019r01a"], ["U5", "2020r02o"], ["U6", "2021r03"], ["U7", "2022r04"],
      ["U8", "2023r05"], ["U9", "2024r06"], ["U10", "2025r07"], ["U11", "2026r08"],
    ],
    first: "ce3e31e", sector: "pop", exclude: [A2B_REL, T1_REL], pop: true, tag: "fiveTwo",
    decision: "D-150 §4 段 3 (方式 D) T2 — ⑤-2 population 16 exam",
    verified: "⑤-2 population (full52_population_S118 の excluded 以外) の題 (A2b / T1 照合済を除く)",
  },
};
const argv = process.argv.slice(2);
const outOpt = argv.indexOf("--out") >= 0 ? argv.splice(argv.indexOf("--out"), 2)[1] : null;
const LABEL = argv[0] ?? "t1";
const T = TRACKS[LABEL];
if (!T || argv.length > 1) { console.error("✗ usage: quiz-tr-targets-S130.mjs [t1|t2] [--out <path>]"); process.exit(2); }
const OUTS = outOpt ? [outOpt] : [`data/ip/quiz/.phase2/${LABEL}_targets_S130.json`, `evidence/phase5/stage_06_quiz_fidelity/${LABEL}_targets_S130.json`];
const UNITS = T.units;
const UNIT_OF = new Map(UNITS.map(([u, e]) => [e, u]));
const sh = (...a) => execFileSync("git", ["-C", ROOT, ...a], { encoding: "utf-8", maxBuffer: 1 << 28 }).trim();
const BASE = sh("rev-parse", "--short", `${T.first}^`);
const HEAD = sh("rev-parse", "--short", "HEAD");

const git = (rev, rel) => {
  try { return JSON.parse(execFileSync("git", ["-C", ROOT, "show", `${rev}:${rel}`], { encoding: "utf-8", maxBuffer: 1 << 28 })); }
  catch { return null; }
};
const SNAP = new Map();
/** rev 時点の jp 表示層 (track の exam のみ): id → { stem, "choice.ア", … } */
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

const exclBufs = T.exclude.map((rel) => [rel, readFileSync(P(rel))]);
const EXCL = new Map();   // id → 除外理由 (照合済の targets)
for (const [rel, buf] of exclBufs) for (const q of JSON.parse(buf.toString("utf-8")).questions) if (!EXCL.has(q.id)) EXCL.set(q.id, rel);
if (T.pop) for (const x of Object.values(JSON.parse(readFileSync(P(POP_REL), "utf-8")).exams)) for (const e of x.excluded) EXCL.set(e.id, "pop_excluded");

// BASE..HEAD の data commit ごとの寄与 (touched_by 用)
const COMMITS = sh("log", "--reverse", "--format=%h %s", `${BASE}..${HEAD}`, "--", "data/ip/quiz/questions.json", "data/ip/quiz/translations")
  .split("\n").filter(Boolean).map((l) => {
    const [h, ...s] = l.split(" ");
    const subj = s.join(" "), m = subj.match(/\b(B\d+|A\d+[a-z]?|U\d+[a-z]?)\b/);
    return { commit: h, unit: m ? m[1] : /波 1〜3/.test(subj) ? "wave1-3" : /pagefix/.test(subj) ? "pagefix" : "?" };
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
const excluded = {};
for (const id of [...after.keys()].sort(cmp)) {
  if (EXCL.has(id)) { const r = EXCL.get(id); excluded[r] = (excluded[r] ?? 0) + 1; continue; }
  const exam_id = id.replace(/-q\d+$/, ""), unit = UNIT_OF.get(exam_id);
  const jp_history = (net.sem.get(id) ?? []).map((f) => ({
    // unit = その field を変えた commit の unit (例 "B2" / "A4" / "A3+B5")。commit が拾えない正味差分 (往復等) は exam の unit
    unit: [...new Set((touched.get(`${id}|${f}`) ?? []).map((t) => t.split("@")[0]))].join("+") || unit, commit: `${BASE}..${HEAD}`, field: f, old_jp: before.get(id)?.[f] ?? null, new_jp: after.get(id)[f] ?? null, touched_by: touched.get(`${id}|${f}`) ?? [],
  }));
  questions.push({ id, exam_id, question_number: Number(id.slice(-3)), sector: T.sector, unit, sources: [jp_history.length ? `${T.tag}_jp_fix` : `${T.tag}_verified`], jp_history });
}
const exams = {};
for (const q of questions) (exams[q.exam_id] ??= []).push(q.question_number);
const cnt = (pred) => questions.filter(pred).length;
const out = {
  schema: "a2b_targets/1",
  script: "scripts/quiz-tr-targets-S130.mjs",
  decision: T.decision,
  source: { base: BASE, head: HEAD, first_commit: T.first, units: UNITS.map(([unit, exam_id]) => ({ unit, exam_id })), commits: COMMITS,
    excluded_from: exclBufs.map(([rel, buf]) => ({ path: rel, sha256_16: createHash("sha256").update(buf).digest("hex").slice(0, 16) })), ...(T.pop ? { population: POP_REL } : {}) },
  definition: {
    [`${T.tag}_verified`]: T.verified,
    [`${T.tag}_jp_fix`]: `うち BASE (${T.first} の親) → HEAD で jp 表示層の field が normStr 非等価に変わった題 (jp_history = 正味の 旧 → 新、touched_by = 変えた commit)`,
    trivial_excluded: "normStr で等しくなる変更 (空白・引用符字種・読点字種) だけの field は jp_history に載せない",
  },
  commit_stats: commitStats,
  counts: {
    questions: questions.length, exams: Object.keys(exams).length, excluded,
    jp_fix_any: cnt((q) => q.jp_history.length > 0), jp_fix_fields: questions.reduce((s, q) => s + q.jp_history.length, 0),
    net_changed_incl_trivial: net.any.size,
    by_unit: Object.fromEntries([...new Set(UNITS.map(([u]) => u))].map((u) => [u, { questions: cnt((q) => q.unit === u), jp_fix: cnt((q) => q.unit === u && q.jp_history.length > 0) }])),
  },
  exams: Object.fromEntries(Object.entries(exams).sort(([a], [b]) => cmp(a, b)).map(([k, v]) => [k, v.sort((x, y) => x - y)])),
  questions,
};
const body = JSON.stringify(out, null, 1) + "\n";
for (const o of OUTS) writeFileSync(path.resolve(ROOT, o), body);
console.log(`${LABEL} targets: ${questions.length} 題 / ${Object.keys(exams).length} exam (除外 ${JSON.stringify(excluded)}) — jp 是正 ${out.counts.jp_fix_any} 題 / ${out.counts.jp_fix_fields} field (${BASE}..${HEAD}、自明含む変更 ${net.any.size} 題)`);
for (const [u, e] of UNITS) console.log(`  ${u.padEnd(7)} ${e.padEnd(17)} ${String(cnt((q) => q.exam_id === e)).padStart(3)} 題 / jp 是正 ${cnt((q) => q.exam_id === e && q.jp_history.length > 0)}`);
for (const c of commitStats) console.log(`  ${c.commit} ${c.unit.padEnd(7)} jp 変更 ${String(c.changed_questions).padStart(3)} 題 / 計上 ${c.nontrivial_questions}`);
for (const o of OUTS) console.log(`  → ${o}`);
