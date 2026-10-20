#!/usr/bin/env node
// Stage 6 / Quiz — S127 A track **A2b** (D-150 §4 段 3 = 方式 D、訳層照合 pilot) の対象リスト (0 token、冪等、読み取り専用)。
//
// 対象:
//   (i)  ⑤-2 (波 1〜3 + U3a〜U11) と A2a で **jp 表示層を是正した題**。
//        各 unit の data commit (UNITS、固定) について、親と commit の jp 表示層 (stem = stem_jp_clean 優先、
//        choices = choices_jp) を git show で比べ、field が変わった題を拾う。
//        normStr (quiz-choice-defect-scan.mjs: NFKC・空白削除・読点/引用符/括弧の統一) で等しくなる変更
//        (空白・ASCII " → “” 等) は訳に効かないので**非計上** (件数だけ記録)。
//        是正履歴 (unit / commit / field / 旧 jp → 新 jp) を題に付ける — tr-fidelity agent に渡す。
//   (ii) A1 の 0a 優先 (word / char / num / ins かつ prose) の pop 題 (A1 §5)。
// 題単位で dedupe。zh / en は現行値を照合対象にする (prep で manifest に載せる)。
//
// Run: node scripts/quiz-a2b-targets-S127.mjs
//   → data/ip/quiz/.phase2/a2b_targets_S127.json
//   → evidence/phase5/stage_06_quiz_fidelity/a2b_targets_S127.json (同内容の写し)
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normStr } from "./quiz-choice-defect-scan.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P = (...s) => path.join(ROOT, ...s);
const OUTS = ["data/ip/quiz/.phase2/a2b_targets_S127.json", "evidence/phase5/stage_06_quiz_fidelity/a2b_targets_S127.json"];
const A1_REL = "evidence/phase5/stage_06_quiz_fidelity/backlog_scan_A1_S127.json";

// jp を是正した data commit (git log -- data/ip/quiz/questions.json data/ip/quiz/translations、734697d..70f5d6f)
const UNITS = [
  ["wave1-3", "ce3e31e"], ["U3a", "cbac3ea"], ["U3b", "3d35ee9"], ["U4", "d697b6e"], ["U5", "dc03c27"], ["U6", "818497d"],
  ["U7", "33cf9be"], ["U8", "15d50bc"], ["U9", "c698a79"], ["U10", "7aa7af8"], ["U11", "afbfcd0"], ["A2a", "70f5d6f"],
];

const git = (rev, rel) => {
  try { return JSON.parse(execFileSync("git", ["-C", ROOT, "show", `${rev}:${rel}`], { encoding: "utf-8", maxBuffer: 1 << 28 })); }
  catch { return null; }
};
const SNAP = new Map();
/** rev 時点の jp 表示層: id → { stem, "choice.ア", … } */
function display(rev) {
  if (SNAP.has(rev)) return SNAP.get(rev);
  const Q = git(rev, "data/ip/quiz/questions.json").questions;
  const tr = {};
  for (const e of [...new Set(Q.map((q) => q.exam_id))]) tr[e] = git(rev, `data/ip/quiz/translations/${e}.json`)?.questions ?? {};
  const m = new Map();
  for (const q of Q) {
    const c = tr[q.exam_id][q.id]?.stem_jp_clean;
    m.set(q.id, { stem: c?.trim() ? c : q.stem_jp, ...Object.fromEntries(Object.entries(q.choices_jp ?? {}).map(([k, v]) => [`choice.${k}`, v])) });
  }
  SNAP.set(rev, m);
  return m;
}

const POP = JSON.parse(readFileSync(P("evidence/phase5/stage_06_quiz_fidelity/full52_population_S118.json"), "utf-8"));
const POP_EXAMS = new Set(Object.values(POP.exams).map((x) => x.exam_id));
const EXCLUDED = new Set(Object.values(POP.exams).flatMap((x) => x.excluded.map((e) => e.id)));
const sectorOf = (id) => (EXCLUDED.has(id) ? "excluded" : POP_EXAMS.has(id.replace(/-q\d+$/, "")) ? "pop" : "13exam");

const byId = new Map();
const entry = (id) => {
  if (!byId.has(id)) byId.set(id, { id, exam_id: id.replace(/-q\d+$/, ""), question_number: Number(id.slice(-3)), sector: sectorOf(id), sources: new Set(), jp_history: [], a1_0a: [] });
  return byId.get(id);
};
const unitStats = [];
for (const [unit, commit] of UNITS) {
  const before = display(`${commit}^`), after = display(commit);
  const any = new Set(), sem = new Set();
  for (const [id, now] of after) {
    const old = before.get(id) ?? {};
    for (const f of Object.keys(now).sort()) {
      if (old[f] === now[f]) continue;
      any.add(id);
      if (normStr(old[f]) === normStr(now[f])) continue;           // 空白・引用符字種だけの変更は訳に効かない
      sem.add(id);
      const e = entry(id); e.sources.add(unit === "A2a" ? "A2a_jp_fix" : "fiveTwo_jp_fix");
      e.jp_history.push({ unit, commit, field: f, old_jp: old[f] ?? null, new_jp: now[f] });
    }
  }
  unitStats.push({ unit, commit, changed_questions: any.size, nontrivial_questions: sem.size });
}

const a1Buf = readFileSync(P(A1_REL));
const A1 = JSON.parse(a1Buf.toString("utf-8"));
for (const h of A1.candidates["0a"]) {
  if (h.sector !== "pop" || !/^(word|char|num|ins)\/prose\//.test(h.sub ?? "")) continue;
  const e = entry(h.id); e.sources.add("A1_0a_pop");
  e.a1_0a.push({ rule: h.rule, sub: h.sub, excerpt: h.excerpt });
}

const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const questions = [...byId.values()].sort((a, b) => cmp(a.id, b.id)).map((e) => ({ ...e, sources: [...e.sources].sort() }));
const exams = {};
for (const q of questions) (exams[q.exam_id] ??= []).push(q.question_number);
const cnt = (pred) => questions.filter(pred).length;
const has = (s) => (q) => q.sources.includes(s);
const out = {
  schema: "a2b_targets/1",
  script: "scripts/quiz-a2b-targets-S127.mjs",
  decision: "D-150 §4 段 3 (方式 D) pilot",
  source: { units: UNITS.map(([u, c]) => ({ unit: u, commit: c })), a1: A1_REL, a1_sha256_16: createHash("sha256").update(a1Buf).digest("hex").slice(0, 16) },
  definition: {
    fiveTwo_jp_fix: "⑤-2 の unit commit で jp 表示層の field が normStr 非等価に変わった題",
    A2a_jp_fix: "A2a commit 70f5d6f で同上",
    A1_0a_pop: "A1 0a の word/char/num/ins かつ prose、pop",
    trivial_excluded: "normStr で等しくなる変更 (空白・引用符字種・読点字種) だけの題は計上しない",
  },
  unit_stats: unitStats,
  counts: {
    questions: questions.length, exams: Object.keys(exams).length,
    fiveTwo_jp_fix: cnt(has("fiveTwo_jp_fix")), A2a_jp_fix: cnt(has("A2a_jp_fix")), A1_0a_pop: cnt(has("A1_0a_pop")),
    jp_fix_any: cnt((q) => q.jp_history.length > 0), overlap_jpfix_and_0a: cnt((q) => q.jp_history.length > 0 && q.sources.includes("A1_0a_pop")),
    by_sector: { pop: cnt((q) => q.sector === "pop"), excluded: cnt((q) => q.sector === "excluded"), "13exam": cnt((q) => q.sector === "13exam") },
  },
  exams: Object.fromEntries(Object.entries(exams).sort(([a], [b]) => cmp(a, b)).map(([k, v]) => [k, v.sort((x, y) => x - y)])),
  questions,
};
const body = JSON.stringify(out, null, 1) + "\n";
for (const o of OUTS) writeFileSync(P(o), body);
console.log(`A2b targets: ${questions.length} 題 / ${Object.keys(exams).length} exam — ⑤-2 jp 是正 ${out.counts.fiveTwo_jp_fix} / A2a jp 是正 ${out.counts.A2a_jp_fix} / A1 0a pop ${out.counts.A1_0a_pop} (jp 是正 ∩ 0a ${out.counts.overlap_jpfix_and_0a})`);
for (const u of unitStats) console.log(`  ${u.unit.padEnd(8)} ${u.commit}  jp 変更 ${String(u.changed_questions).padStart(3)} 題 / 計上 ${u.nontrivial_questions}`);
for (const o of OUTS) console.log(`  → ${o}`);
