#!/usr/bin/env node
// Stage 6 / Quiz — S117 (D-143 準拠 explfix): 中問前文の埋め込みで解答可能になった問の key_guard final フラグを真の値へ更新する。
// 対象: 2012h24a-q097 (S112 に「前文欠落」で stem_corruption_suspected=true。§27 で q098 の前文を複製し自完結になった)。
// 方針 (D-143): generate_result の final key_guard だけを更新、round1 不可触、note_jp に marker 付きの 1 文を追加 → 再 merge。
// Run: node scripts/quiz-explfix-S117-chumon.mjs [--dry-run] → node scripts/quiz-phase2-merge.mjs 2012h24a
import { readFileSync, writeFileSync } from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); const DRY = process.argv.includes("--dry-run"); const MARK = "explfix-S117-chumon";
const FIX = { "2012h24a-q097": { stem_corruption_suspected: false, note: "前文〔会員登録をするWebページの仕組み〕は S117 (D-144 段 3) で q098 の clean から複製して埋め込み、単独表示で解答可能になったため final の stem_corruption_suspected を false に更新 (round1 は不変)" } };
let n = 0;
for (const [id, f] of Object.entries(FIX)) {
  const exam = id.split("-q")[0]; const p = path.join(ROOT, "data/ip/quiz/.phase2", `generate_result_${exam}.json`); const g = JSON.parse(readFileSync(p, "utf-8")); const r = g.results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(MARK)) { console.log(`  = ${id}: already`); continue; }
  r.key_guard.stem_corruption_suspected = f.stem_corruption_suspected; r.key_guard.note_jp = r.key_guard.note_jp.replace(/。?\s*$/, "。") + `${f.note} (${MARK})。`; n++;
  if (!DRY) writeFileSync(p, JSON.stringify(g, null, 2) + "\n"); console.log(`  ✓ ${id}: final stem_corruption_suspected → ${f.stem_corruption_suspected}`);
}
console.log(`${DRY ? "(dry-run) " : "✓ "}explfix-S117-chumon: ${n}`);
