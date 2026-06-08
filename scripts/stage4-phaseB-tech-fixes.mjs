#!/usr/bin/env node
/**
 * Stage 4 Phase B — 第二批 (technology) 日語ゲート Rule A 指摘の確定的修正適用。
 *
 * ユーザー日語ゲート判定 = 承認 + medium 1 + 境界 low 3 修正 → 翻訳。
 * content_{unit}.json を source-of-truth に明示 before/after で適用 (Rule B 归档、冪等)。
 * memory_hook_jp 変更時は summary.memory_hooks の "term: hook" 行も同期 (前批 sync 漏れ教訓)。
 * 確定的・LLM 不要 (D-132)。Rule D 再核は別 pass。
 *
 * field 種別: explanation_jp / memory_hook_jp / definition_jp(term) /
 *             summary_keypoint{idx} / overview_intro(content.overview_jp.intro_jp)
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const cp = (u) => join(ROOT, `data/ip/textbook/.planning/content_${u}.json`);
const FAILDIR = join(ROOT, "failures/stage_04_tech_fixes");
mkdirSync(FAILDIR, { recursive: true });

const EDITS = [
  // ── medium: リスク対応 低減 欠落 (term 追加不可=prose で明示) ──
  {
    unit: "technology-23-62-u02", term: "リスク対応", field: "explanation_jp", kind: "medium-completeness",
    before: "具体的な選択肢として、本ユニットで学ぶリスク回避・保有・移転・共有・分散があり、その中から組み合わせて選びます。",
    after: "具体的な選択肢として、本ユニットで学ぶリスク回避・保有・移転・共有・分散に加え、リスクの発生確率や影響度を下げる『低減(軽減)』があり、これらから組み合わせて選びます(回避はリスク源を断つ、低減はリスクを残しつつ影響を小さくする点が異なります)。",
  },
  {
    unit: "technology-23-62-u02", term: "リスク対応", field: "memory_hook_jp", kind: "medium-completeness",
    before: "リスク対応といえば回避・保有・移転・共有・分散から対処を選ぶこと",
    after: "リスク対応といえば回避・低減・保有・移転・共有・分散などから対処を選ぶこと",
  },
  {
    unit: "technology-23-62-u02", field: "summary_keypoint", idx: 0, kind: "medium-completeness",
    before: "リスク対応はリスクアセスメント(特定→分析→評価)の後に行う「どう対処するか」を決める段階で、回避・保有・移転・共有・分散の選択肢を束ねる上位概念。",
    after: "リスク対応はリスクアセスメント(特定→分析→評価)の後に行う「どう対処するか」を決める段階で、回避・低減・保有・移転・共有・分散などの選択肢を束ねる上位概念。",
  },
  {
    unit: "technology-23-62-u02", field: "overview_intro", kind: "medium-completeness",
    before: "その具体的な選択肢(回避・保有・移転・共有・分散)を学びます。",
    after: "その具体的な選択肢(回避・保有・移転・共有・分散など)を学びます。",
  },
  // ── low: 制御 根拠なし「最頻出」断定 + freq_badge 低頻 不整合 ──
  {
    unit: "technology-15-40-u01", term: "制御", field: "explanation_jp", kind: "low-consistency",
    before: "本ユニットの5大機能の中で出題頻度が最も高く、他の4機能すべてに指示を出す中心的な存在です。",
    after: "本ユニットで扱う5大機能の中心的な存在で、他の4機能すべてに指示を出します。",
  },
  // ── low: DDR3 SDRAM クロック領域 ──
  {
    unit: "technology-15-41-u02", term: "DDR3 SDRAM", field: "explanation_jp", kind: "low-precision",
    before: "SDRAMはCPUの動作タイミングに同期して動くDRAMで",
    after: "SDRAMはクロック信号に同期して動作するDRAMで",
  },
  // ── low: IrDA リモコン类比 明確化 ──
  {
    unit: "technology-15-42-u02", term: "IrDA", field: "explanation_jp", kind: "low-clarity",
    before: "かつての携帯電話どうしのアドレス交換やテレビのリモコン的な機器間通信などに使われました。",
    after: "かつての携帯電話どうしのアドレス交換など、近距離の機器間データ通信に使われました。",
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
  if (e.field === "overview_intro") {
    const cur = doc.overview_jp.intro_jp;
    if (cur.includes(e.after)) { skipped.push({ ...e, why: "already" }); continue; }
    if (!cur.includes(e.before)) { failed.push({ ...e, why: "before not found", got: cur.slice(0, 80) }); continue; }
    doc.overview_jp.intro_jp = cur.replace(e.before, e.after); applied.push(e); continue;
  }
  const t = doc.terms.find((x) => x.term === e.term);
  if (!t) { failed.push({ ...e, why: "term not found" }); continue; }
  if (t[e.field] === e.after || (typeof t[e.field] === "string" && t[e.field].includes(e.after))) { skipped.push({ ...e, why: "already" }); continue; }
  if (typeof t[e.field] !== "string" || !t[e.field].includes(e.before)) { failed.push({ ...e, why: "before not found", got: (t[e.field] || "").slice(0, 80) }); continue; }
  t[e.field] = t[e.field].replace(e.before, e.after);
  applied.push(e);
  if (e.field === "memory_hook_jp") {
    const hooks = doc.summary_jp.memory_hooks;
    const i = hooks.findIndex((h) => h.startsWith(e.term + ":"));
    if (i >= 0) hooks[i] = `${e.term}: ${e.after}`;
    else failed.push({ ...e, why: "summary hook sync target not found" });
  }
}

for (const [u, doc] of docs) writeFileSync(cp(u), JSON.stringify(doc, null, 2));
if (failed.length) writeFileSync(join(FAILDIR, "before_mismatch.json"), JSON.stringify(failed, null, 2));

console.log("=== 第二批 technology Rule A 修正適用 ===");
console.log(`applied=${applied.length} skipped=${skipped.length} failed=${failed.length}`);
for (const a of applied) console.log(`  ✓ [${a.kind}] ${a.unit}${a.term ? "/" + a.term : ""} (${a.field})`);
for (const s of skipped) console.log(`  ⤳ skip ${s.unit}${s.term ? "/" + s.term : ""} (${s.field}): ${s.why}`);
for (const f of failed) console.log(`  ✗ FAIL ${f.unit}${f.term ? "/" + f.term : ""} (${f.field}): ${f.why}${f.got ? " | got: " + f.got : ""}`);
if (failed.length) { console.error("\n⚠ before 不一致 → failures/ 归档 (Rule B)。"); process.exit(1); }
console.log("\n修正は content_*.json に適用。次: re-assemble (4 unit) + re-render。");
