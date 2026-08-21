#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 — S112 translation-layer fixes (2012h24a), paired with stemfix-S112b.
//
// q092 エ: the corrupted JP「人金額」had been translated as 入金金额 / payment amount —
//   restore to 金额 / amount (the JP fix removed the stray 人; the tail fragment
//   「画像データの符号化」 was never translated, so zh/en need no strip).
// q002 イ/エ: the alt-text neutralization (answer-leak removal) must land in all three
//   languages or the zh/en learner still gets the leak.
//
// All deterministic verbatim replacements — no LLM in the write path.
//
// Run: node scripts/quiz-phase2-trfix-S112b.mjs

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const E = "2012h24a";
const TR = path.join(ROOT, `data/ip/quiz/translations/${E}.json`);

const FIXES = [
  { id: `${E}-q092`, letter: "エ", lang: "zh",
    from: "引入根据使用区间设定入金金额的功能，并推进其自动化。",
    to: "引入根据使用区间设定金额的功能，并推进其自动化。" },
  { id: `${E}-q092`, letter: "エ", lang: "en",
    from: "Introduce a function that sets the payment amount based on the route section used, and proceed to automate it.",
    to: "Introduce a function that sets the amount based on the route section used, and proceed to automate it." },
  { id: `${E}-q002`, letter: "イ", lang: "zh",
    from: "（图：由圆和箭头构成的、带数据存储的处理图）",
    to: "（图：用箭头连接圆和平行双线的图）" },
  { id: `${E}-q002`, letter: "イ", lang: "en",
    from: "(Figure: a process diagram with data stores, made of circles and arrows)",
    to: "(Figure: a diagram in which circles and parallel double lines are connected by arrows)" },
  { id: `${E}-q002`, letter: "エ", lang: "zh",
    from: "（图：由平行线和斜线（箭头）构成的符号图）",
    to: "（图：斜线汇入水平箭头的图）" },
  { id: `${E}-q002`, letter: "エ", lang: "en",
    from: "(Figure: a symbol diagram made of parallel lines and slanted lines (arrows))",
    to: "(Figure: a diagram in which slanted lines merge into a horizontal arrow)" },
];

const doc = JSON.parse(readFileSync(TR, "utf-8"));
let edits = 0;
for (const f of FIXES) {
  const c = doc.questions[f.id]?.choices?.[f.letter];
  if (!c) throw new Error(`${f.id} choices ${f.letter} missing`);
  if (c[f.lang] === f.to) { console.log(`  = ${f.id} ${f.letter}.${f.lang} already fixed`); continue; }
  if (c[f.lang] !== f.from) throw new Error(`${f.id} ${f.letter}.${f.lang} unexpected: ${c[f.lang]}`);
  c[f.lang] = f.to;
  edits++;
  console.log(`  ✓ ${f.id} ${f.letter}.${f.lang}`);
}
writeFileSync(TR, JSON.stringify(doc, null, 2) + "\n");
console.log(`✓ quiz-phase2-trfix-S112b: ${edits} fields`);
