#!/usr/bin/env node
/**
 * Stage 4 Phase A — review 永続化 (確定的, 非 LLM, D-132)
 *
 * 背景: phaseA-planning.workflow の reviewer は `code-reviewer` (read-only, Write 不可, Rule D 設計)
 * のため review_{id}.json を自身で書けない。よって review は workflow 返回値経由で永続化する。
 *
 * 入力: workflow が返した reviews[] を main loop が落盘した JSON ファイル
 *       (配列 or {reviews:[...]} のどちらも受理)。各要素 = { topic_id, rounds, final_review, history_verdicts }。
 * 出力: data/ip/textbook/.planning/review_{topic_id}.json (pilot と同形)。
 *
 * plan_{id}.json は planner agent (general-purpose, Write 可) が既にディスクへ書込済のため、本 script は触らない。
 *
 * 使用: node scripts/stage4-phaseA-persist.mjs <reviews.json>
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "data/ip/textbook/.planning");

const src = process.argv[2];
if (!src) {
  console.error("usage: node scripts/stage4-phaseA-persist.mjs <reviews.json>");
  process.exit(1);
}
if (!existsSync(src)) throw new Error(`reviews file not found: ${src}`);

const raw = JSON.parse(readFileSync(src, "utf8"));
const reviews = Array.isArray(raw) ? raw : Array.isArray(raw.reviews) ? raw.reviews : null;
if (!reviews) throw new Error("input must be an array or { reviews: [...] }");

let written = 0;
const skipped = [];
for (const r of reviews) {
  if (!r || !r.topic_id) { skipped.push(r); continue; }
  // review_{id}.json の正準形 (pilot と一致): topic_id, rounds, final_review, history_verdicts のみ。
  const out = {
    topic_id: r.topic_id,
    rounds: r.rounds ?? (r.history_verdicts?.length ?? 0),
    final_review: r.final_review,
    history_verdicts: r.history_verdicts ?? [],
  };
  if (!out.final_review || typeof out.final_review.verdict !== "string") {
    throw new Error(`malformed review for ${r.topic_id}: missing final_review.verdict`);
  }
  writeFileSync(join(OUT_DIR, `review_${r.topic_id}.json`), JSON.stringify(out, null, 2));
  written++;
}

console.log(`=== Phase A review 永続化完了 ===`);
console.log(`書込: ${written} 件 → ${OUT_DIR}/review_*.json`);
if (skipped.length) console.warn(`スキップ (topic_id 無): ${skipped.length} 件`);
const verdicts = reviews.filter((r) => r?.final_review?.verdict).reduce((m, r) => {
  const v = r.final_review.verdict; m[v] = (m[v] || 0) + 1; return m;
}, {});
console.log(`verdict 内訳: ${Object.entries(verdicts).map(([k, v]) => `${k}=${v}`).join(" / ") || "(なし)"}`);
