#!/usr/bin/env node
// Stage 6 / Quiz — S127 A track **A2a** の対象リスト (0 token、冪等、読み取り専用)。
// 入力 = A1 走査結果 evidence/phase5/stage_06_quiz_fidelity/backlog_scan_A1_S127.json (scripts/quiz-backlog-scan-A1.mjs)。
//
// 対象 (team-lead 指示 / ユーザー承認):
//   (i)   0b 訳層の数字・略語          全区分
//   (ii)  1 見出し混入 の表示層 (jp / zh / en)   全区分 (jp_raw は学習者不可視なので除く)
//   (iii) pop (⑤-2 母数内) のみ:
//         0c jp 異常 (rare_kanji 除く) + 同 field の zh / en (tr_of_anomaly、rare_kanji だけで立ったものは除く)
//         7.space の散文類 (sub = prose / kanji / kata / particle)
//         0q.prose の jp / zh
//         T = fig_stem_mismatch_S127 ∪ T.num_raw_clean の題 (その題の T 候補を全部付ける)
//   除外: 2 cross (表示層外)。0a は段 3 / B track 側 (A1 §5)。
// 題単位で dedupe し、題ごとに A1 の候補 (= fixer に名指しで渡す候補) を付ける。
// **核験 agent には渡さない** (源を先に読む独立性のため。名指し候補は fixer / reviewer 用)。
//
// Run: node scripts/quiz-a2a-targets-S127.mjs
//   → data/ip/quiz/.phase2/a2a_targets_S127.json (prep-multi の入力)
//   → evidence/phase5/stage_06_quiz_fidelity/a2a_targets_S127.json (同内容の写し)
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P = (...s) => path.join(ROOT, ...s);
const A1_REL = "evidence/phase5/stage_06_quiz_fidelity/backlog_scan_A1_S127.json";
const MISMATCH_REL = "evidence/phase5/stage_06_quiz_keyaudit/fig_stem_mismatch_S127.json";
const OUTS = ["data/ip/quiz/.phase2/a2a_targets_S127.json", "evidence/phase5/stage_06_quiz_fidelity/a2a_targets_S127.json"];

const a1Buf = readFileSync(P(A1_REL));
const A1 = JSON.parse(a1Buf.toString("utf-8"));
const POP = JSON.parse(readFileSync(P("evidence/phase5/stage_06_quiz_fidelity/full52_population_S118.json"), "utf-8"));
const POP_EXAMS = new Set(Object.values(POP.exams).map((x) => x.exam_id));
const EXCLUDED = new Set(Object.values(POP.exams).flatMap((x) => x.excluded.map((e) => e.id)));
const sectorOf = (id) => (EXCLUDED.has(id) ? "excluded" : POP_EXAMS.has(id.replace(/-q\d+$/, "")) ? "pop" : "13exam");
const MISMATCH = new Map(JSON.parse(readFileSync(P(MISMATCH_REL), "utf-8")).map((x) => [x.id, x.note]));
const C = A1.candidates;
const DISP = new Set(["jp", "zh", "en"]);
const T7 = new Set(["prose", "kanji", "kata", "particle"]);

// 選択グループ: [名前, 候補 → 採否]
const pop = (h) => h.sector === "pop";
const GROUPS = [
  ["0b", (h) => h.type === "0b"],
  ["1_display", (h) => h.type === "1" && DISP.has(h.layer)],
  ["0c_pop", (h) => h.type === "0c" && pop(h) && (h.layer === "jp" ? h.rule !== "0c.rare_kanji" : h.sub !== "rare_kanji")],
  ["7_prose_pop", (h) => h.type === "7" && pop(h) && h.rule === "7.space" && T7.has(h.sub)],
  ["0q_prose_pop", (h) => h.type === "0q" && pop(h) && h.rule === "0q.prose" && (h.layer === "jp" || h.layer === "zh")],
];
const tIds = new Set([...MISMATCH.keys(), ...C.T.filter((h) => h.rule === "T.num_raw_clean").map((h) => h.id)]);
GROUPS.push(["T_pop", (h) => h.type === "T" && pop(h) && tIds.has(h.id)]);

const all = Object.entries(C).flatMap(([type, rows]) => rows.map((h) => ({ type, ...h })));
const byId = new Map();
const groupStats = {};
for (const [name, pred] of GROUPS) {
  const rows = all.filter(pred);
  groupStats[name] = { candidates: rows.length, fields: new Set(rows.map((h) => `${h.id}|${h.layer}|${h.field}`)).size, questions: new Set(rows.map((h) => h.id)).size };
  for (const h of rows) {
    if (!byId.has(h.id)) byId.set(h.id, { id: h.id, exam_id: h.exam, question_number: Number(h.id.slice(-3)), sector: h.sector, groups: new Set(), candidates: [] });
    const e = byId.get(h.id); e.groups.add(name);
    const c = { group: name, type: h.type, layer: h.layer, field: h.field, rule: h.rule, sub: h.sub ?? null, excerpt: h.excerpt };
    if (!e.candidates.some((x) => JSON.stringify(x) === JSON.stringify(c))) e.candidates.push(c);
  }
}
// T 対象で A1 の T 候補が無い pop 題 (fig_stem_mismatch のうち表の無い題) も critic の所見ごと載せる
for (const id of tIds) {
  const exam = id.replace(/-q\d+$/, "");
  const sector = sectorOf(id);
  if (sector !== "pop" || byId.get(id)?.groups.has("T_pop")) continue;
  if (!byId.has(id)) byId.set(id, { id, exam_id: exam, question_number: Number(id.slice(-3)), sector, groups: new Set(), candidates: [] });
  byId.get(id).groups.add("T_pop");
}
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const questions = [...byId.values()].sort((a, b) => cmp(a.id, b.id)).map((e) => ({
  ...e, groups: [...e.groups].sort(),
  fig_stem_mismatch_note: MISMATCH.get(e.id) ?? null,
  candidates: e.candidates.sort((x, y) => cmp(x.group, y.group) || cmp(x.layer, y.layer) || cmp(x.field, y.field) || cmp(x.rule, y.rule) || cmp(x.excerpt, y.excerpt)),
}));
const exams = {};
for (const q of questions) (exams[q.exam_id] ??= []).push(q.question_number);
// 題数は fallback (候補なしで載せた T 題) を含めて数え直す
for (const [name] of GROUPS) groupStats[name].questions = questions.filter((q) => q.groups.includes(name)).length;
const fieldsAll = new Set(questions.flatMap((q) => q.candidates.map((c) => `${q.id}|${c.layer}|${c.field}`)));
const bySector = (s) => questions.filter((q) => q.sector === s).length;

const out = {
  schema: "a2a_targets/1",
  script: "scripts/quiz-backlog-scan-A1.mjs → scripts/quiz-a2a-targets-S127.mjs",
  source: { a1: A1_REL, a1_sha256_16: createHash("sha256").update(a1Buf).digest("hex").slice(0, 16), fig_stem_mismatch: MISMATCH_REL },
  selection: {
    "0b": "0b 全ルール、全区分",
    "1_display": "1.head / 1.mid の jp・zh・en 層、全区分",
    "0c_pop": "pop の 0c: jp 層は rare_kanji 以外、zh/en の tr_of_anomaly は sub が rare_kanji だけのものを除く",
    "7_prose_pop": "pop の 7.space、sub = prose / kanji / kata / particle",
    "0q_prose_pop": "pop の 0q.prose、jp / zh 層",
    "T_pop": "pop の fig_stem_mismatch_S127 ∪ T.num_raw_clean の題 (その題の T 候補)",
    excluded: "2 cross (表示層外)、0a (段 3 / B track)、rare_kanji 単独",
  },
  counts: {
    questions: questions.length, fields: fieldsAll.size, exams: Object.keys(exams).length,
    by_sector: { pop: bySector("pop"), excluded: bySector("excluded"), "13exam": bySector("13exam") },
    by_group: groupStats,
  },
  exams: Object.fromEntries(Object.entries(exams).sort(([a], [b]) => cmp(a, b)).map(([k, v]) => [k, v.sort((x, y) => x - y)])),
  questions,
};
const body = JSON.stringify(out, null, 1) + "\n";
for (const o of OUTS) writeFileSync(P(o), body);
console.log(`A2a targets: ${questions.length} 題 / ${fieldsAll.size} field / ${Object.keys(exams).length} exam (pop ${out.counts.by_sector.pop} / excluded ${out.counts.by_sector.excluded} / 13exam ${out.counts.by_sector["13exam"]})`);
for (const [k, v] of Object.entries(groupStats)) console.log(`  ${k.padEnd(13)} ${String(v.questions).padStart(3)} 題 / ${String(v.fields).padStart(3)} field / ${v.candidates} 候補`);
for (const o of OUTS) console.log(`  → ${o}`);
