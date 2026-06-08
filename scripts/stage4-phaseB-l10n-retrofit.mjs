#!/usr/bin/env node
/**
 * Stage 4 Phase B — 既存30 unit (pilot 12 + management 18) の横断 zh 用語 本土化リトロフィット。
 *
 * ユーザー三語ゲート判定 = 「本土標準形に換える + 既存30 unit 回改」。
 * translator prompt は別途更新済 (全量 technology/strategy 用)。本 script は既存三語の zh 統一。
 *
 * 置換 (zh のみ、和製→本土標準):
 *   成果物 → 交付物
 *   有效性确认 → 确认   (妥当性確認=validation の本土標準。验证=verification と対)
 * translation_{unit}.json (源) の zh 文字列を深さ優先で置換 → 影響 unit を re-merge。
 * 冪等 (既置換は no-op)。term_jp/日語/en 不変。確定的・LLM 不要 (D-132)。
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const UNITS = join(ROOT, "data/ip/textbook/units");
const PL = join(ROOT, "data/ip/textbook/.planning");

const REPLACE = [
  ["成果物", "交付物"],
  ["有效性确认", "确认"],
];

// 三語完成 unit (lang_status.zh=generated) を対象に、対応 translation 源があるもの
const triUnits = readdirSync(UNITS).filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(/\.json$/, ""))
  .filter((uid) => JSON.parse(readFileSync(join(UNITS, `${uid}.json`), "utf8")).lang_status?.zh === "generated");

// zh 文字列のみ置換する deep walker。
// translation schema: title.zh / unit_summary.zh / overview_intro.zh /
//   terms[].term_zh(直) + terms[].{definition,explanation,analogy,memory_hook}.zh /
//   summary.key_points[].zh / summary.memory_hooks[].zh
let totalRepl = 0;
const perUnit = [];
const changedUnits = [];
const missingTrans = [];

const applyRepl = (s) => {
  let out = s, n = 0;
  for (const [a, b] of REPLACE) {
    const parts = out.split(a);
    if (parts.length > 1) { n += parts.length - 1; out = parts.join(b); }
  }
  return [out, n];
};

// zh を持つキーを再帰置換: ".zh" で終わる string 値 + "term_zh"
function walk(node) {
  let n = 0;
  if (Array.isArray(node)) { for (const x of node) n += walk(x); return n; }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (typeof v === "string" && (k === "zh" || k === "term_zh")) {
        const [nv, c] = applyRepl(v);
        if (c > 0) { node[k] = nv; n += c; }
      } else if (v && typeof v === "object") {
        n += walk(v);
      }
    }
  }
  return n;
}

for (const uid of triUnits) {
  const tp = join(PL, `translation_${uid}.json`);
  if (!existsSync(tp)) { missingTrans.push(uid); continue; }
  const tr = JSON.parse(readFileSync(tp, "utf8"));
  const n = walk(tr);
  if (n > 0) {
    writeFileSync(tp, JSON.stringify(tr, null, 2));
    perUnit.push([uid, n]);
    changedUnits.push(uid);
    totalRepl += n;
  }
}

console.log("=== 横断 zh 本土化リトロフィット (既存30 unit) ===");
console.log(`対象三語 unit=${triUnits.length} | translation源欠落=${missingTrans.length}${missingTrans.length ? " (" + missingTrans.join(",") + ")" : ""}`);
console.log(`置換総数=${totalRepl} | 変更 unit=${changedUnits.length}`);
for (const [u, n] of perUnit) console.log(`  ✓ ${u}: ${n}置換`);

if (changedUnits.length) {
  console.log(`\n→ re-merge ${changedUnits.length} units...`);
  execFileSync("node", [join(ROOT, "scripts/stage4-phaseB-merge-translations.mjs"), ...changedUnits], { stdio: "inherit", cwd: ROOT });
}
console.log("\n完了。translator prompt は別途更新済 (全量 technology/strategy 用)。");
