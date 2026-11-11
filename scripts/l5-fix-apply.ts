#!/usr/bin/env node
// Track L step L5 — the three residual leaks of the gate (main session decisions, evidence/phase5/hosting/L5_gate.md):
//   1. apps/web/messages/zh.json Mock.colKey 「正解」→「正确答案」 (D-192 column, not a D-189 shared label)
//   2. 2015h27a-q085 points[1].en "COUNTIF (条件计数)" → "COUNTIF (conditional count)"  (expl_tr → quiz-phase2-merge)
//   3. 2022r04-q074 stem.zh 「尾随（共连れ）」→「尾随（共連れ）」  (translations sidecar only, D-222.5)
// Same layers as scripts/l4-r2b-quiz-apply.ts. Each `before` must occur exactly once in its field (else abort, nothing
// written). zh.json is edited as text (one exact line) so the other lane's formatting is untouched.
//   4. (L5 review M-1) data/ip/textbook/unit_index.json topics[20].units[0].terms[6].order_reason_jp 「全題库」→「全題庫」 (typo,
//      simplified 库 in an internal ja field)
// Run: node --no-warnings scripts/l5-fix-apply.ts [--apply] [--only unit-index]   then (fix 2) node scripts/quiz-phase2-merge.mjs 2015h27a
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const P = (...s: string[]) => path.join(ROOT, ...s);
const APPLY = process.argv.includes("--apply");
const once = (s: string, before: string, where: string): void => {
  const n = s.split(before).length - 1;
  if (n !== 1) throw new Error(`${where}: "${before}" occurs ${n}× — abort`);
};

const writes: [string, string][] = [];
const ONLY = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : undefined;
if (!ONLY) {
// 1. zh.json Mock.colKey (text edit of the one line inside "Mock")
{
  const f = P("apps/web/messages/zh.json");
  const raw = readFileSync(f, "utf-8");
  const before = '"colKey": "正解"';
  once(raw, before, "zh.json");
  if (JSON.parse(raw).Mock?.colKey !== "正解") throw new Error("zh.json: Mock.colKey is not 正解 — abort");
  const next = raw.replace(before, '"colKey": "正确答案"');
  const a = JSON.parse(raw);
  a.Mock.colKey = "正确答案";
  if (JSON.stringify(a) !== JSON.stringify(JSON.parse(next))) throw new Error("zh.json: text edit changed more than Mock.colKey — abort");
  writes.push([f, next]);
}
// 2. expl_tr 2015h27a-q085 points[1].en
{
  const f = P("data/ip/quiz/.phase2/expl_tr_2015h27a-q085.json");
  const raw = readFileSync(f, "utf-8");
  const d = JSON.parse(raw);
  once(d.points[1].en, "COUNTIF (条件计数)", "2015h27a-q085 points[1].en");
  d.points[1].en = d.points[1].en.replace("COUNTIF (条件计数)", "COUNTIF (conditional count)");
  writes.push([f, `${JSON.stringify(d, null, 2)}\n`]);
}
// 3. translations 2022r04-q074 stem.zh
{
  const f = P("data/ip/quiz/translations/2022r04.json");
  const raw = readFileSync(f, "utf-8");
  const d = JSON.parse(raw);
  const q = d.questions["2022r04-q074"];
  once(q.stem.zh, "尾随（共连れ）", "2022r04-q074 stem.zh");
  q.stem.zh = q.stem.zh.replace("尾随（共连れ）", "尾随（共連れ）");
  const next = `${JSON.stringify(d, null, 2)}\n`;
  // the file must round-trip unchanged apart from this field (same serializer as the L4 rounds)
  const orig = JSON.parse(raw);
  orig.questions["2022r04-q074"].stem.zh = q.stem.zh;
  if (`${JSON.stringify(orig, null, 2)}\n` !== next) throw new Error("2022r04.json: serializer mismatch — abort");
  writes.push([f, next]);
}
}
// 4. unit_index typo (leaf-level check: only this leaf changes)
if (ONLY === "unit-index") {
  const f = P("data/ip/textbook/unit_index.json");
  const raw = readFileSync(f, "utf-8");
  const d = JSON.parse(raw);
  const t = d.topics[20].units[0].terms[6];
  once(t.order_reason_jp, "全題库", "unit_index order_reason_jp");
  t.order_reason_jp = t.order_reason_jp.replace("全題库", "全題庫");
  const next = `${JSON.stringify(d, null, 2)}\n`;
  const leaves = (v: unknown, at: string, o: Map<string, unknown>): Map<string, unknown> => {
    if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) leaves(x, `${at}.${k}`, o);
    else o.set(at, v);
    return o;
  };
  const A = leaves(JSON.parse(raw), "", new Map());
  const B = leaves(JSON.parse(next), "", new Map());
  const changed = [...new Set([...A.keys(), ...B.keys()])].filter((k) => A.get(k) !== B.get(k));
  if (changed.length !== 1 || changed[0] !== ".topics.20.units.0.terms.6.order_reason_jp") throw new Error(`unit_index: unexpected leaves ${changed.join(",")} — abort`);
  console.log(`leaf ${changed[0]}: ${JSON.stringify(A.get(changed[0]))} → ${JSON.stringify(B.get(changed[0]))}`);
  writes.push([f, next]);
}
for (const [f, next] of writes) {
  const changed = readFileSync(f, "utf-8") !== next;
  console.log(`${APPLY ? "write" : "dry-run"} ${path.relative(ROOT, f)} ${changed ? "changed" : "unchanged"}`);
  if (APPLY && changed) writeFileSync(f, next);
}
