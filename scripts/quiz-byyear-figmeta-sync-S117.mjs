#!/usr/bin/env node
// Stage 6 / Quiz — S117 (D-144 段 2 Rule D MEDIUM-2): by_year (最上流) の図メタデータを question_bank に同期する。
// 実測 7 問で by_year が旧値のまま: 2010h22a-q089〜q092 の source (S111 の復元は bank だけを直した)、q091 の figure_bbox_pct
// (問89 用の旧 bbox — bbox 再裁断を回すと誤図が戻る)、2009h21a-q095 / 2013h25a-q097 / 2019h31h-q061 の has_figure (S99 figfix で bank のみ false)。
// 対象フィールド: has_figure / figure_path / figure_bbox_pct / figure_type / source / choice_figure_paths / composite_figure_path_retired。
// 以後は crosscheck B6 が監視する。Run: node scripts/quiz-byyear-figmeta-sync-S117.mjs [--dry-run]
import { readFileSync, writeFileSync, readdirSync } from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); const DRY = process.argv.includes("--dry-run");
const rj = (f) => JSON.parse(readFileSync(f, "utf-8")); const BY = path.join(ROOT, "data/ip/exams/by_year");
const bank = new Map(rj(path.join(ROOT, "data/ip/exams/question_bank.json")).questions.map((q) => [q.id, q]));
const F = ["has_figure", "figure_path", "figure_bbox_pct", "figure_type", "source", "choice_figure_paths", "composite_figure_path_retired"];
let n = 0, qs = 0;
for (const f of readdirSync(BY).filter((x) => x.endsWith(".json")).sort()) {
  const p = path.join(BY, f); const d = rj(p); let touched = false;
  for (const y of d.questions) { const b = bank.get(y.id); if (!b) continue; let qt = false;
    for (const k of F) { const a = JSON.stringify(y[k] ?? null), c = JSON.stringify(b[k] ?? null); if (a !== c) { if (b[k] === undefined) delete y[k]; else y[k] = b[k]; n++; qt = true; console.log(`  ${y.id}.${k}: ${a.slice(0, 60)} → ${c.slice(0, 60)}`); } }
    if (qt) { qs++; touched = true; } }
  if (touched && !DRY) writeFileSync(p, JSON.stringify(d, null, 2) + "\n");
}
console.log(`${DRY ? "(dry-run) " : "✓ "}by_year figure-meta sync: ${qs} 問 / ${n} フィールド`);
