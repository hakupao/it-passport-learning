#!/usr/bin/env node
/**
 * Stage 4 Phase B — 第三批 (strategy) 日語ゲート Rule A low 5件の確定的修正適用。
 *
 * ユーザー日語ゲート判定 = 承認 + low 5件全修正 → 翻訳 (Rule A 100% accurate・0 medium/high が前提)。
 * 5件はいずれも表現/完備性 (事実誤りなし)。term 追加なし・明示 before/after・Rule B 归档・冪等。
 * high-fix (strat-fixes.mjs) 適用後の現状を before とする (固定資産は図文整合のため explanation/mermaid/keypoint 同期)。
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
  // ── low1: DE&I 公平性(Equity) を need-based に (平等=Equality 寄りを回避) ──
  {
    unit: "strategy-01-01-u06", term: "DE&I", field: "analogy_jp", kind: "low-precision",
    before: "必要な調理器具を平等に用意し(公平性)",
    after: "必要な調理器具をそれぞれに合わせて用意し(公平性)",
  },
  // ── low2: BI 「上位概念」断定を役割表現に緩和 ──
  {
    unit: "strategy-01-02-u12", term: "BI", field: "explanation_jp", kind: "low-precision",
    before: "BIが『データを意思決定に活かす上位概念』であり",
    after: "BIが『データを意思決定に活かす側の考え方』であり",
  },
  // ── low3: 固定資産 完備性 — 投資その他の資産(第3内訳)を補記 + 図文整合 (explanation/mermaid/keypoint) ──
  {
    unit: "strategy-01-03-u04", term: "固定資産", field: "explanation_jp", kind: "low-completeness",
    before: "形のない無形固定資産(特許権・ソフトウェアなど)に分けられます。なお、繰延資産は",
    after: "形のない無形固定資産(特許権・ソフトウェアなど)、長期保有の株式などの投資その他の資産に分けられます。なお、繰延資産は",
  },
  {
    unit: "strategy-01-03-u04", term: "固定資産", field: "mermaid", kind: "low-completeness",
    before: 'graph TD\n  A["固定資産"] --> B["有形固定資産"]\n  A --> C["無形固定資産"]\n  B --> B1["土地・建物・機械"]\n  C --> C1["特許権・ソフトウェア"]',
    after: 'graph TD\n  A["固定資産"] --> B["有形固定資産"]\n  A --> C["無形固定資産"]\n  A --> E["投資その他の資産"]\n  B --> B1["土地・建物・機械"]\n  C --> C1["特許権・ソフトウェア"]',
  },
  {
    unit: "strategy-01-03-u04", field: "summary_keypoint", idx: 0, kind: "low-completeness",
    before: "資産の部は流動資産(1年以内に現金化)・固定資産(長期保有)・繰延資産の3つに大きく分かれ、固定資産はさらに有形固定資産・無形固定資産に細分される。",
    after: "資産の部は流動資産(1年以内に現金化)・固定資産(長期保有)・繰延資産の3つに大きく分かれ、固定資産はさらに有形固定資産・無形固定資産・投資その他の資産に細分される。",
  },
  // ── low4: ディープフェイク 意図的生成と悪用を分離 ──
  {
    unit: "strategy-05-14-u09", term: "ディープフェイク", field: "explanation_jp", kind: "low-precision",
    before: "ディープフェイクは「人が悪用するために意図的に作る偽物」である違いを押さえましょう。",
    after: "ディープフェイクは「人が意図的に作る合成コンテンツ」で、特になりすましや偽情報の拡散など悪用が問題視される点の違いを押さえましょう。",
  },
  // ── low5: デジタルリテラシー デジタルディバイドの因果を多要因に緩和 (隣接 term と整合) ──
  {
    unit: "strategy-06-21-u01", term: "デジタルリテラシー", field: "explanation_jp", kind: "low-completeness",
    before: "このリテラシーの有無や差から生じるという因果関係を押さえておきましょう。",
    after: "このリテラシーの差なども一因となって生じる(機器・回線などの利用環境や所得・地域・年齢の差からも生じる)点を押さえておきましょう。",
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
  if (t[e.field] === e.after || (typeof t[e.field] === "string" && t[e.field].includes(e.after))) { skipped.push({ ...e, why: "already" }); continue; }
  if (typeof t[e.field] !== "string" || !t[e.field].includes(e.before)) { failed.push({ ...e, why: "before not found", got: (t[e.field] || "").slice(0, 80) }); continue; }
  t[e.field] = t[e.field].replace(e.before, e.after);
  applied.push(e);
}

for (const [u, doc] of docs) writeFileSync(cp(u), JSON.stringify(doc, null, 2));
if (failed.length) writeFileSync(join(FAILDIR, "low_before_mismatch.json"), JSON.stringify(failed, null, 2));

console.log("=== 第三批 strategy 日語ゲート low 5件 修正適用 ===");
console.log(`applied=${applied.length} skipped=${skipped.length} failed=${failed.length}`);
for (const a of applied) console.log(`  ✓ [${a.kind}] ${a.unit}${a.term ? "/" + a.term : ""} (${a.field})`);
for (const s of skipped) console.log(`  ⤳ skip ${s.unit}${s.term ? "/" + s.term : ""} (${s.field}): ${s.why}`);
for (const f of failed) console.log(`  ✗ FAIL ${f.unit}${f.term ? "/" + f.term : ""} (${f.field}): ${f.why}${f.got ? " | got: " + f.got : ""}`);
if (failed.length) { console.error("\n⚠ before 不一致 → failures/ 归档 (Rule B)。"); process.exit(1); }
console.log("\n修正は content_*.json に適用。次: re-assemble (5 unit) + re-render (固定資産図) → Rule D 再核験。");
