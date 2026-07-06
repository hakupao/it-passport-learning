#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 batch S104 — explanation-sidecar content fixes (2020r02o),
// adjudicated by 主 context with figure self-read (q052 protocol) after Rule A
// (wf_d12ce866-9d2) flagged 2 medium findings. Patches .phase2 expl files
// (assert-once substring replace), then re-run quiz-phase2-merge.mjs 2020r02o.
//
// #1 q011 distractor ウ (jp+zh+en): explanation said "no arrow enters seating
//    guidance" but figure panel ウ HAS 受付→座席案内 (主 context figure read
//    confirms critic). Corrected to "the only arrow entering is 受付→座席案内";
//    the missing-reference-flows conclusion (and key エ) unchanged.
// #2 q055 correct_jp: activity A range typo 30〜50 → 30〜35 (figure = 30〜35;
//    arithmetic in same sentence already uses 30/35; zh/en already correct).
//
// Idempotent. Run: node scripts/quiz-phase2-explfix-S104.mjs

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P2 = (f) => path.join(ROOT, "data/ip/quiz/.phase2", f);

const FIXES = [
  {
    file: "expl_jp_2020r02o-q011.json",
    locate: (d) => [d.distractors_jp.find((x) => x.letter === "ウ"), "why_wrong_jp"],
    from: "さらに座席案内へ入る矢印が1本も無く、座席案内が",
    to: "さらに座席案内へ入る矢印は受付→座席案内の1本だけで、座席案内が",
  },
  {
    file: "expl_tr_2020r02o-q011.json",
    locate: (d) => [d.distractors.find((x) => x.letter === "ウ"), "zh"],
    from: "此外没有任何一条箭头进入引导座位, 未能表现出",
    to: "此外进入引导座位的箭头只有「接待→引导座位」一条, 未能表现出",
  },
  {
    file: "expl_tr_2020r02o-q011.json",
    locate: (d) => [d.distractors.find((x) => x.letter === "ウ"), "en"],
    from: "Furthermore, not a single arrow enters seating guidance, so the flows",
    to: "Furthermore, the only arrow entering seating guidance is “reception → seating guidance”, so the flows",
  },
  {
    file: "expl_jp_2020r02o-q055.json",
    locate: (d) => [d, "correct_jp"],
    from: "（30〜50、50〜60）",
    to: "（30〜35、50〜60）",
  },
];

let changed = 0;
const byFile = new Map();
for (const f of FIXES) {
  if (!byFile.has(f.file)) byFile.set(f.file, JSON.parse(readFileSync(P2(f.file), "utf-8")));
  const doc = byFile.get(f.file);
  const [obj, key] = f.locate(doc);
  if (!obj || typeof obj[key] !== "string") throw new Error(`${f.file}: locate failed`);
  const cur = obj[key];
  if (cur.includes(f.to) && !cur.includes(f.from)) {
    console.log(`  ~ ${f.file} ${key}: already patched, skip`);
    continue;
  }
  const n = cur.split(f.from).length - 1;
  if (n !== 1) throw new Error(`${f.file} ${key}: expected 1 occurrence of "${f.from}" but found ${n} — aborting`);
  obj[key] = cur.replace(f.from, f.to);
  changed++;
  console.log(`  ✓ ${f.file} ${key}`);
}
for (const [file, doc] of byFile) writeFileSync(P2(file), JSON.stringify(doc, null, 2) + "\n");
console.log(`✓ quiz-phase2-explfix-S104: ${changed} field(s) → re-run quiz-phase2-merge.mjs 2020r02o`);
