#!/usr/bin/env node
/**
 * Stage 4 Phase B — 第一批 (management) 三語ゲート Rule A 翻訳指摘の確定的 zh 本土化微調。
 *
 * ユーザー三語ゲート判定 = 承認 + 2安全微調のみ (横断用語ポリシーは全量 prompt で別途決定)。
 * translation_{unit}.json (源) の zh フィールドに明示 before/after で適用 → 別途 re-merge。
 * Rule B: before 不一致は failures/ 归档。冪等: after 既在で skip。確定的・LLM 不要 (D-132)。
 *
 * 対象 (Rule A audit_translation.md の安全 single-field 2件、意味影響なし・本土自然さのみ):
 *  1. 共同レビュー analogy.zh: 「发表」→「演示」(本土自然)
 *  2. ファンクションポイント法 explanation.zh: 「实绩数据」→「历史数据」(本土自然)
 * (横断: 成果物/交付物・有效性确认/确认 は単独変更せず、全量 translator prompt で一括決定)
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const tp = (u) => join(ROOT, `data/ip/textbook/.planning/translation_${u}.json`);
const FAILDIR = join(ROOT, "failures/stage_04_mgmt_l10n");
mkdirSync(FAILDIR, { recursive: true });

const EDITS = [
  { unit: "management-08-25-u02", term_jp: "共同レビュー", field: "analogy", before: "就像发表前", after: "就像演示前" },
  { unit: "management-08-25-u05", term_jp: "ファンクションポイント法", field: "explanation", before: "过去的实绩数据", after: "过去的历史数据" },
];

const docs = new Map();
const load = (u) => { if (!docs.has(u)) docs.set(u, JSON.parse(readFileSync(tp(u), "utf8"))); return docs.get(u); };
const applied = [], skipped = [], failed = [];

for (const e of EDITS) {
  const doc = load(e.unit);
  const t = doc.terms.find((x) => x.term_jp === e.term_jp);
  if (!t) { failed.push({ ...e, why: "term not found" }); continue; }
  const cur = t[e.field]?.zh;
  if (typeof cur !== "string") { failed.push({ ...e, why: "field.zh missing" }); continue; }
  if (cur.includes(e.after)) { skipped.push({ ...e, why: "already-applied" }); continue; }
  if (!cur.includes(e.before)) { failed.push({ ...e, why: "before not found", got: cur.slice(0, 60) }); continue; }
  t[e.field].zh = cur.replace(e.before, e.after);
  applied.push(e);
}

for (const [u, doc] of docs) writeFileSync(tp(u), JSON.stringify(doc, null, 2));
if (failed.length) writeFileSync(join(FAILDIR, "before_mismatch.json"), JSON.stringify(failed, null, 2));

console.log("=== 第一批 management zh 本土化微調 ===");
console.log(`applied=${applied.length} skipped=${skipped.length} failed=${failed.length}`);
for (const a of applied) console.log(`  ✓ ${a.unit}/${a.term_jp} (${a.field}.zh): ${a.before}→${a.after}`);
for (const s of skipped) console.log(`  ⤳ skip ${s.unit}/${s.term_jp}: ${s.why}`);
for (const f of failed) console.log(`  ✗ FAIL ${f.unit}/${f.term_jp}: ${f.why}${f.got ? " | got: " + f.got : ""}`);
if (failed.length) { console.error("\n⚠ before 不一致 → failures/ 归档 (Rule B)。"); process.exit(1); }
console.log("\n適用済。次: re-merge (u02, u05)。");
