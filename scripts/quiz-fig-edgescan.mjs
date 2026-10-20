#!/usr/bin/env node
// Stage 6 / D-150 §2 C track C0 (Session 127) — deterministic figure edge scan.
//
// 配信 webp (apps/web/public/quiz-figures/*.webp) 全数を sharp で greyscale 化し、
// 各辺の外周 2px 帯 (1 行/列ずつ) の暗画素率 (輝度 < 128) を測る。2 本の max が 2% を超える辺が
// 1 つでもあれば候補 (裁断が図の内容を横切っている疑い)。S126 の一回限りの走査 (530 枚 → 267 候補) と同一設定。
// 偽陽性が多い (S126 目視 6 → 実欠損 2) ので単独では修復判定に使わない。sweep (quiz-figcrop.workflow.mjs) の入口。
//
// sweep manifest は data/ip/quiz/.keyaudit/figsweep_input_S127.json (webp 単位、id = webp key)。
//
// Run from repo root:  node scripts/quiz-fig-edgescan.mjs
// Out: evidence/phase5/stage_06_quiz_keyaudit/fig_edgescan_S127.json

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sharp = createRequire(path.join(ROOT, "apps/web/package.json"))("sharp");

const WEBP_DIR = path.join(ROOT, "apps/web/public/quiz-figures");
const QUESTIONS = path.join(ROOT, "data/ip/quiz/questions.json");
const BANK = path.join(ROOT, "data/ip/exams/question_bank.json");
const OUT = path.join(ROOT, "evidence/phase5/stage_06_quiz_keyaudit/fig_edgescan_S127.json");

const DARK_LUMA = 128; // greyscale 0-255、これ未満を暗画素
const BAND_PX = 2; // 各辺の外周何本を見るか (本ごとの率の max を取る)
const RATIO_GT = 0.02; // 暗画素率がこれを超える辺を flag

// webp key → { question_id, kind, choice?, shared_with? }
const questions = JSON.parse(readFileSync(QUESTIONS, "utf-8")).questions;
const bankArr = (() => { const b = JSON.parse(readFileSync(BANK, "utf-8")); return b.questions ?? b; })();
const groupOf = new Map(bankArr.filter((q) => q.figure_group).map((q) => [q.id, q.figure_group]));
const groupMembers = new Map();
for (const [id, g] of groupOf) groupMembers.set(g, [...(groupMembers.get(g) ?? []), id]);
const owner = new Map();
for (const q of questions) {
  if (q.figure) {
    const g = groupOf.get(q.id);
    const others = g ? groupMembers.get(g).filter((id) => id !== q.id) : [];
    owner.set(q.figure, others.length
      ? { question_id: q.id, kind: "shared", figure_group: g, shared_with: others }
      : { question_id: q.id, kind: "main" });
  }
  for (const [letter, key] of Object.entries(q.choice_figures ?? {})) owner.set(key, { question_id: q.id, kind: "choice", choice: letter });
}

const files = readdirSync(WEBP_DIR).filter((f) => f.endsWith(".webp")).sort();
const candidates = [];
const unmapped = [];
for (const f of files) {
  const { data, info } = await sharp(path.join(WEBP_DIR, f)).greyscale().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, C = info.channels;
  const dark = (x, y) => data[(y * W + x) * C] < DARK_LUMA;
  const rowRatio = (y) => { let d = 0; for (let x = 0; x < W; x++) if (dark(x, y)) d++; return d / W; };
  const colRatio = (x) => { let d = 0; for (let y = 0; y < H; y++) if (dark(x, y)) d++; return d / H; };
  const band = (fn, idx) => Math.max(...idx.map(fn));
  const inner = [...Array(BAND_PX).keys()];
  const ratios = {
    top: band(rowRatio, inner),
    bottom: band(rowRatio, inner.map((i) => H - 1 - i)),
    left: band(colRatio, inner),
    right: band(colRatio, inner.map((i) => W - 1 - i)),
  };
  const flagged = Object.keys(ratios).filter((k) => ratios[k] > RATIO_GT);
  const key = f.replace(/\.webp$/, "");
  const o = owner.get(key);
  if (!o) unmapped.push(key);
  if (!flagged.length) continue;
  candidates.push({
    webp: path.relative(ROOT, path.join(WEBP_DIR, f)),
    key,
    ...(o ?? { question_id: null, kind: "unmapped" }),
    size: `${W}x${H}`,
    flagged_sides: flagged,
    ratios: Object.fromEntries(Object.entries(ratios).map(([k, v]) => [k, Number(v.toFixed(4))])),
  });
}

const byKind = (arr) => arr.reduce((m, c) => ({ ...m, [c.kind]: (m[c.kind] ?? 0) + 1 }), {});
const totalKinds = byKind(files.map((f) => owner.get(f.replace(/\.webp$/, "")) ?? { kind: "unmapped" }));
const out = {
  generated_by: "scripts/quiz-fig-edgescan.mjs",
  params: { dark_luma_lt: DARK_LUMA, band_px: BAND_PX, ratio_gt: RATIO_GT, webp_dir: path.relative(ROOT, WEBP_DIR) },
  total_webp: files.length,
  total_by_kind: totalKinds,
  candidate_count: candidates.length,
  candidate_by_kind: byKind(candidates),
  unmapped,
  candidates,
};
writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
console.log(`✓ edgescan: ${files.length} webp → ${candidates.length} candidates ${JSON.stringify(out.candidate_by_kind)} (unmapped ${unmapped.length})`);
console.log(`  out: ${path.relative(ROOT, OUT)}`);
