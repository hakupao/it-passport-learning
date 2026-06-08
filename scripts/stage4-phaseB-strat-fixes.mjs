#!/usr/bin/env node
/**
 * Stage 4 Phase B — 第三批 (strategy) 日語生成 FAIL/Rule A 指摘の確定的修正適用。
 *
 * 子批1 で content-jp workflow が strategy-01-03-u04 を FAIL 判定:
 *   reviewer(code-reviewer/opus, Rule D) が会計上の HIGH 事実誤りを捕捉。
 *   = 固定資産の mermaid/explanation が「繰延資産を固定資産の下位区分」と誤記。
 *     実際は貸借対照表 資産の部 = 流動資産・固定資産・繰延資産 の3並列大区分で、
 *     繰延資産は固定資産の子ではない。固定資産の内訳は有形固定資産・無形固定資産(・投資その他の資産)。
 *     しかも同一 unit 内の繰延資産解説・key_points[2] は正しく「別枠の第3区分」=内部矛盾。
 *
 * 修正 = 固定資産側を繰延資産と独立させる (3箇所): explanation_jp / mermaid / summary_keypoint[0]。
 * content_{unit}.json を source-of-truth に明示 before/after で適用 (Rule B 归档、冪等)。
 * 確定的・LLM 不要 (D-132)。Rule D 再核は別 pass (code-reviewer/opus ≠ writer)。
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const cp = (u) => join(ROOT, `data/ip/textbook/.planning/content_${u}.json`);
const FAILDIR = join(ROOT, "failures/stage_04_strat_fixes");
mkdirSync(FAILDIR, { recursive: true });

const EDITS = [
  // ── HIGH: 固定資産 explanation — 繰延資産を内訳から外し独立第3区分と明示 ──
  {
    unit: "strategy-01-03-u04", term: "固定資産", field: "explanation_jp", kind: "high-factual",
    before: "、形のない無形固定資産(特許権・ソフトウェアなど)、特殊な繰延資産に分けられます。試験では、この3区分への分類や、土地が減価償却の対象外である点がよく問われます。",
    after: "、形のない無形固定資産(特許権・ソフトウェアなど)に分けられます。なお、繰延資産は固定資産の内訳ではなく、資産の部で流動資産・固定資産と並ぶ独立した第3の区分である点に注意しましょう。試験では、有形・無形固定資産の区分や、土地が減価償却の対象外である点がよく問われます。",
  },
  // ── HIGH: 固定資産 mermaid — 繰延資産ノード(D,D1)を削除 ──
  {
    unit: "strategy-01-03-u04", term: "固定資産", field: "mermaid", kind: "high-factual",
    before: 'graph TD\n  A["固定資産"] --> B["有形固定資産"]\n  A --> C["無形固定資産"]\n  A --> D["繰延資産"]\n  B --> B1["土地・建物・機械"]\n  C --> C1["特許権・ソフトウェア"]\n  D --> D1["創立費・開業費"]',
    after: 'graph TD\n  A["固定資産"] --> B["有形固定資産"]\n  A --> C["無形固定資産"]\n  B --> B1["土地・建物・機械"]\n  C --> C1["特許権・ソフトウェア"]',
  },
  // ── HIGH: summary key_points[0] — 資産の部 3区分・固定資産は有形/無形に細分 (key_points[2] と整合) ──
  {
    unit: "strategy-01-03-u04", field: "summary_keypoint", idx: 0, kind: "high-factual",
    before: "資産は流動資産(1年以内に現金化)と固定資産(長期保有)に大きく分かれ、固定資産はさらに有形・無形・繰延に細分される。",
    after: "資産の部は流動資産(1年以内に現金化)・固定資産(長期保有)・繰延資産の3つに大きく分かれ、固定資産はさらに有形固定資産・無形固定資産に細分される。",
  },
];

const docs = new Map();
const load = (u) => { if (!docs.has(u)) docs.set(u, JSON.parse(readFileSync(cp(u), "utf8"))); return docs.get(u); };
const applied = [], skipped = [], failed = [];

for (const e of EDITS) {
  const doc = load(e.unit);
  if (e.field === "summary_keypoint") {
    const arr = doc.summary_jp.key_points_jp;
    if (arr[e.idx] === e.after) { skipped.push({ ...e, why: "already" }); continue; }
    if (arr[e.idx] !== e.before) { failed.push({ ...e, why: "before mismatch", got: arr[e.idx] }); continue; }
    arr[e.idx] = e.after; applied.push(e); continue;
  }
  const t = doc.terms.find((x) => x.term === e.term);
  if (!t) { failed.push({ ...e, why: "term not found" }); continue; }
  if (t[e.field] === e.after) { skipped.push({ ...e, why: "already" }); continue; }
  if (typeof t[e.field] !== "string" || !t[e.field].includes(e.before)) { failed.push({ ...e, why: "before not found", got: (t[e.field] || "").slice(0, 80) }); continue; }
  t[e.field] = t[e.field].replace(e.before, e.after);
  applied.push(e);
}

for (const [u, doc] of docs) writeFileSync(cp(u), JSON.stringify(doc, null, 2));
if (failed.length) writeFileSync(join(FAILDIR, "before_mismatch.json"), JSON.stringify(failed, null, 2));

console.log("=== 第三批 strategy 日語 FAIL 修正適用 ===");
console.log(`applied=${applied.length} skipped=${skipped.length} failed=${failed.length}`);
for (const a of applied) console.log(`  ✓ [${a.kind}] ${a.unit}${a.term ? "/" + a.term : ""} (${a.field})`);
for (const s of skipped) console.log(`  ⤳ skip ${s.unit}${s.term ? "/" + s.term : ""} (${s.field}): ${s.why}`);
for (const f of failed) console.log(`  ✗ FAIL ${f.unit}${f.term ? "/" + f.term : ""} (${f.field}): ${f.why}${f.got ? " | got: " + f.got : ""}`);
if (failed.length) { console.error("\n⚠ before 不一致 → failures/ 归档 (Rule B)。"); process.exit(1); }
console.log("\n修正は content_*.json に適用。次: Rule D 再核験 (code-reviewer/opus) → batch assemble に合流。");
