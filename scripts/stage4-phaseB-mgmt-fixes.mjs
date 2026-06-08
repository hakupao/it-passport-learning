#!/usr/bin/env node
/**
 * Stage 4 Phase B — 第一批 (management) 日語ゲート Rule A 指摘の確定的修正適用。
 *
 * 入力: critic/opus の Rule A 監査 (evidence/.../stage_04_content_jp_mgmt/audit.md) の
 *   medium 1件 + low 6件 の suggested_fix を、content_{unit}.json に明示 before/after で適用。
 * Rule D: 修正案の起草=writer 役 (main agent)、本スクリプトは機械適用、再核験=code-reviewer (別 pass)。
 * Rule B: before 不一致 (既適用でない) は failures/ に归档し未適用として報告 (黙って飛ばさない)。
 * 冪等: before 不在かつ after 既在 → already-applied として skip。
 *
 * 確定的・LLM 不要 (D-132)。content を source of truth に修正 → 別途 re-assemble + re-render。
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const cp = (u) => join(ROOT, `data/ip/textbook/.planning/content_${u}.json`);
const FAILDIR = join(ROOT, "failures/stage_04_mgmt_fixes");
mkdirSync(FAILDIR, { recursive: true });

// 各 edit: {unit, term, field, before, after, kind}
// field=summary_keypoint は {idx} で content.summary_jp.key_points_jp[idx]、
// field=memory_hook_jp は term hook + summary.memory_hooks の "term: hook" も同期更新。
const EDITS = [
  // ── 1. 品質特性 (medium: 図8特性 + low: 非機能要件断定) ──
  {
    unit: "management-08-25-u01", term: "品質特性", field: "mermaid", kind: "medium-figure",
    before: 'graph TD; A["品質特性"]; A --> B["機能適合性"]; A --> C["性能効率性"]; A --> D["使用性"]; A --> E["信頼性"]; A --> F["セキュリティ"]; A --> G["保守性"]; A --> H["移植性"]',
    after: 'graph TD; A["品質特性"]; A --> B["機能適合性"]; A --> C["性能効率性"]; A --> I["互換性"]; A --> D["使用性"]; A --> E["信頼性"]; A --> F["セキュリティ"]; A --> G["保守性"]; A --> H["移植性"]',
  },
  {
    unit: "management-08-25-u01", term: "品質特性", field: "explanation_jp", kind: "low-completeness",
    before: "代表的には機能適合性・性能効率性・使用性(使いやすさ)・信頼性・セキュリティ・保守性・移植性などがあり、非機能要件を体系立てて考えるためのものさしになります。",
    after: "代表的には機能適合性・性能効率性・互換性・使用性(使いやすさ)・信頼性・セキュリティ・保守性・移植性などがあり(JIS X 25010 では8特性)、ソフトウェアの品質を体系立てて考えるためのものさしになります(非機能要件を考える際の指針にもなります)。",
  },
  {
    unit: "management-08-25-u01", field: "summary_keypoint", idx: 1, kind: "low-completeness",
    before: "品質特性は非機能要件を体系化した品質の評価軸で、機能適合性・性能効率性・使用性・信頼性・保守性・移植性などがある。",
    after: "品質特性はソフトウェアの品質を評価する軸で、機能適合性・性能効率性・互換性・使用性・信頼性・保守性・移植性などがある(JIS X 25010 では8特性)。",
  },
  // ── 2. 共同レビュー (low: 階層断定→並列) ──
  {
    unit: "management-08-25-u02", term: "共同レビュー", field: "explanation_jp", kind: "low-precision",
    before: "コードレビューは検証対象がコードに限定された具体例で、共同レビューはより広い成果物を対象とする上位概念といえます。",
    after: "共同レビューは関係者が共同で広範な成果物を評価するレビューで、コードレビューは対象をコードに絞ったレビューの一種です(両者は対象範囲が異なります)。",
  },
  {
    unit: "management-08-25-u02", term: "共同レビュー", field: "explanation_jp", kind: "low-precision",
    before: "代表例としてウォークスルー(作成者主導で説明しながら確認)やインスペクション(役割を決めて公式に検証)といった手法名も押さえると有利です。",
    after: "代表的なレビュー技法としてウォークスルー(作成者主導で説明しながら確認)やインスペクション(役割を決めて公式に検証)といった手法名も押さえると有利です。",
  },
  // ── 3. 妥当性確認テスト (low: 言回し) ──
  {
    unit: "management-08-25-u04", term: "妥当性確認テスト", field: "explanation_jp", kind: "low-wording",
    before: "妥当性確認=要求への適合(作るべきものは正しかったか)",
    after: "妥当性確認=要求への適合(求められたものを作れたか)",
  },
  // ── 4. XP (low: 4→5価値補足) ──
  {
    unit: "management-09-26-u03", term: "XP", field: "explanation_jp", kind: "low-completeness",
    before: "価値(コミュニケーション・シンプルさ・フィードバック・勇気)を重視する点も特徴です。",
    after: "価値(初版で定義されたコミュニケーション・シンプルさ・フィードバック・勇気の4つ。後に「尊重」を加えて5つとされた)を重視する点も特徴です。",
  },
  // ── 5. レトロスペクティブ (low: 正式名称→公式イベント) ──
  {
    unit: "management-09-26-u05", term: "レトロスペクティブ", field: "definition_jp", kind: "low-precision",
    before: "ふりかえりの英語呼称で、スクラムにおける改善活動の正式名称。",
    after: "ふりかえりの英語呼称で、スクラムの公式イベント(スプリントレトロスペクティブ)として行う改善活動。",
  },
  // ── 6. グリーンIT (low: フック両面性) ──
  {
    unit: "management-11-30-u01", term: "グリーンIT", field: "memory_hook_jp", kind: "low-completeness",
    before: "グリーンITといえばITで環境負荷を減らす省エネの取り組み",
    after: "グリーンITといえば機器の省電力(ITの省エネ化)とITによる社会の省エネ化の両面で環境負荷を減らす取り組み",
  },
  // ── 7. システム監査 (low: フックに助言追加) ──
  {
    unit: "management-12-31-u01", term: "システム監査", field: "memory_hook_jp", kind: "low-completeness",
    before: "システム監査といえば情報システムを独立した立場で点検・評価する監査",
    after: "システム監査といえば情報システムを独立した立場で点検・評価し改善を助言する監査",
  },
  // ── 8. (Rule D 再核験 指摘 / summary 同期漏れ修正) ──
  // u01 key_points[1]: 「8特性」と宣言しつつ7列挙 (セキュリティ欠落) → セキュリティ追記で8揃え
  {
    unit: "management-08-25-u01", field: "summary_keypoint", idx: 1, kind: "ruleD-sync",
    before: "品質特性はソフトウェアの品質を評価する軸で、機能適合性・性能効率性・互換性・使用性・信頼性・保守性・移植性などがある(JIS X 25010 では8特性)。",
    after: "品質特性はソフトウェアの品質を評価する軸で、機能適合性・性能効率性・互換性・使用性・信頼性・セキュリティ・保守性・移植性などがある(JIS X 25010 では8特性)。",
  },
  // u02 key_points[2]: explanation は並列化済だが key_point に「上位概念」断定が残存 → 並列表現へ
  {
    unit: "management-08-25-u02", field: "summary_keypoint", idx: 2, kind: "ruleD-sync",
    before: "コードレビューはコードを対象とする具体例、共同レビューは関係者が成果物全般を点検する上位概念。",
    after: "コードレビューは対象をコードに絞ったレビュー、共同レビューは関係者が成果物全般を共同で点検するレビューで、対象範囲が異なる。",
  },
];

const docs = new Map();
const load = (u) => { if (!docs.has(u)) docs.set(u, JSON.parse(readFileSync(cp(u), "utf8"))); return docs.get(u); };

const applied = [], skipped = [], failed = [];

for (const e of EDITS) {
  const doc = load(e.unit);
  if (e.field === "summary_keypoint") {
    const arr = doc.summary_jp.key_points_jp;
    if (arr[e.idx] === e.after) { skipped.push({ ...e, why: "already-applied" }); continue; }
    if (arr[e.idx] !== e.before) { failed.push({ ...e, why: "before mismatch", got: arr[e.idx] }); continue; }
    arr[e.idx] = e.after; applied.push(e); continue;
  }
  const t = doc.terms.find((x) => x.term === e.term);
  if (!t) { failed.push({ ...e, why: "term not found" }); continue; }
  if (t[e.field] === e.after || (typeof t[e.field] === "string" && t[e.field].includes(e.after))) { skipped.push({ ...e, why: "already-applied" }); continue; }
  if (typeof t[e.field] !== "string" || !t[e.field].includes(e.before)) { failed.push({ ...e, why: "before not found", got: (t[e.field] || "").slice(0, 80) }); continue; }
  t[e.field] = t[e.field].replace(e.before, e.after);
  applied.push(e);
  // memory_hook は summary.memory_hooks の "term: hook" も同期
  if (e.field === "memory_hook_jp") {
    const hooks = doc.summary_jp.memory_hooks;
    const i = hooks.findIndex((h) => h.startsWith(e.term + ":"));
    if (i >= 0) hooks[i] = `${e.term}: ${e.after}`;
    else failed.push({ ...e, why: "summary hook entry not found for sync" });
  }
}

for (const [u, doc] of docs) writeFileSync(cp(u), JSON.stringify(doc, null, 2));

// Rule B: 失敗を归档
if (failed.length) writeFileSync(join(FAILDIR, "before_mismatch.json"), JSON.stringify(failed, null, 2));

console.log("=== 第一批 management Rule A 修正適用 ===");
console.log(`applied=${applied.length} skipped(既適用)=${skipped.length} failed=${failed.length}`);
for (const a of applied) console.log(`  ✓ [${a.kind}] ${a.unit}${a.term ? "/" + a.term : ""} (${a.field})`);
for (const s of skipped) console.log(`  ⤳ skip ${s.unit}${s.term ? "/" + s.term : ""} (${s.field}): ${s.why}`);
for (const f of failed) console.log(`  ✗ FAIL ${f.unit}${f.term ? "/" + f.term : ""} (${f.field}): ${f.why}${f.got ? " | got: " + f.got : ""}`);
if (failed.length) { console.error("\n⚠ before 不一致あり → failures/stage_04_mgmt_fixes/ 归档。未適用 (Rule B)。"); process.exit(1); }
console.log("\n修正は content_*.json に適用。次: re-assemble (7 unit) + re-render。");
