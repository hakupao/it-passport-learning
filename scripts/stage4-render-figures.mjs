#!/usr/bin/env node
/**
 * Stage 4 Phase B — Mermaid → SVG レンダ (D-131-E track1)
 *
 * units/*.json の term.figure.mermaid を mmdc で SVG 化 → data/ip/textbook/figures/。
 * 成功: figure.rendered=true。失敗: 「無図」に降格 (figure=null) + .mmd と error を
 * failures/ に归档 (Rule B)。units json を更新。確定的・LLM 不要 (D-132)。
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const UNITS = join(ROOT, "data/ip/textbook/units");
const FIG = join(ROOT, "data/ip/textbook/figures");
const TMP = join(ROOT, "data/ip/textbook/.planning/mmd");
const FAILDIR = join(ROOT, "failures/stage_04_figures");
const MMDC = join(ROOT, "node_modules/.bin/mmdc");
mkdirSync(FIG, { recursive: true });
mkdirSync(TMP, { recursive: true });
mkdirSync(FAILDIR, { recursive: true });

// 全量バッチ対応 (Session 82): CLI args=対象 unit id (空=全 unit)。既レンダ図は skip。
const TARGET = new Set(process.argv.slice(2));
const unitFiles = readdirSync(UNITS).filter((f) => f.endsWith(".json")).filter((f) => !TARGET.size || TARGET.has(f.replace(/\.json$/, "")));
let ok = 0, fail = 0, total = 0, skip = 0;
const failures = [];

for (const uf of unitFiles) {
  const path = join(UNITS, uf);
  const doc = JSON.parse(readFileSync(path, "utf8"));
  let changed = false;
  for (const t of doc.terms) {
    if (!t.figure || !t.figure.mermaid) continue;
    total += 1;
    // 既レンダ skip (pilot 等を再生成しない、冪等)
    if (t.figure.rendered === true && existsSync(join(FIG, t.figure.svg_path.split("/").pop()))) { skip += 1; continue; }
    const base = t.figure.svg_path.split("/").pop().replace(/\.svg$/, "");
    const mmd = join(TMP, base + ".mmd");
    const out = join(FIG, base + ".svg");
    writeFileSync(mmd, t.figure.mermaid);
    try {
      execFileSync(MMDC, ["-i", mmd, "-o", out, "-q"], { stdio: "pipe", timeout: 60000 });
      t.figure.rendered = true;
      ok += 1;
      changed = true;
    } catch (e) {
      // 降格 + 归档 (Rule B)
      const err = (e.stderr ? e.stderr.toString() : "") + (e.message || "");
      writeFileSync(join(FAILDIR, base + ".mmd"), t.figure.mermaid);
      writeFileSync(join(FAILDIR, base + ".error.txt"), err.slice(0, 4000));
      failures.push({ unit: doc.unit_id, term: t.term, base, error: err.split("\n")[0].slice(0, 120) });
      t.figure = null; // 無図に降格
      fail += 1;
      changed = true;
    }
  }
  if (changed) writeFileSync(path, JSON.stringify(doc, null, 2));
}

console.log("=== Mermaid → SVG レンダ ===");
console.log(`total=${total} ok=${ok} fail=${fail} skip(既レンダ)=${skip}`);
if (failures.length) {
  console.log("失敗 (降格+归档 failures/stage_04_figures/):");
  for (const f of failures) console.log(`  [${f.unit}] ${f.term} (${f.base}): ${f.error}`);
}
console.log(`SVG → data/ip/textbook/figures/`);
