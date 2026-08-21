#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 — S112 second-round fixes from Rule A (2013h25h).
//
// (1) q004 zh terminology (Rule A medium, the only non-low finding of `wf_5186622a-82e`):
//     the zh explanation labeled hosting as 主机托管 — but in mainland usage 主机托管
//     means colocation (= the Japanese ハウジング), so the two OPPOSITE concepts carried
//     near-identical labels. Mainland-standard: hosting = 主机租用, housing = 主机托管/
//     服务器托管. Minimal mechanical patch per the critic's specific guidance (S89 rule:
//     mediums are adopted; the critic's low/optional suggestions are NOT auto-adopted):
//     replace the hosting label 主机托管 → 主机租用 in the two flagged spots. The
//     housing label 服务器托管 stays. 主 context applies the patch, so a SEPARATE agent
//     re-verifies afterwards (S111 q076 pattern — no self-approval).
// (2) q019 raw stem (Rule A finding, source page-08 verified by both S112 fidelity passes
//     and the critic): raw table row ③「競争優位の確保に役立つ技術の発掘」 is an s7x
//     paraphrase of the source「競争優位の構築に役立つ技術の見極め」. stem_jp_clean
//     (the display authority) and zh/en and the explanation all already use the source
//     wording; only raw disagreed. Same layering as q007 (S110: fix raw when the phrase
//     is identifiable).
//
// Run: node scripts/quiz-phase2-explfix2-S112.mjs
//   (then: node scripts/build-quiz-corpus.mjs && node scripts/quiz-phase2-merge.mjs 2013h25h)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P2 = (f) => path.join(ROOT, "data/ip/quiz/.phase2", f);
const E = "2013h25h";

// ---- (1) q004 zh hosting label ----
const trPath = P2(`expl_tr_${E}-q004.json`);
const tr = JSON.parse(readFileSync(trPath, "utf-8"));
const FIXES = [
  {
    where: "distractors.エ.zh",
    get: () => tr.distractors.find((d) => d.letter === "エ"),
    key: "zh",
    from: "主机托管（hosting 服务，即所谓的租用服务器）",
    to: "主机租用（hosting 服务，即所谓的租用服务器）",
  },
  {
    where: "points[1].zh",
    get: () => tr.points[1],
    key: "zh",
    from: "主机托管（hosting）/ 服务器托管（housing）",
    to: "主机租用（hosting）/ 服务器托管（housing）",
  },
];
let edits = 0;
for (const f of FIXES) {
  const obj = f.get();
  if (!obj) throw new Error(`q004: ${f.where} missing`);
  const n = obj[f.key].split(f.from).length - 1;
  if (n !== 1) {
    if (obj[f.key].includes(f.to)) { console.log(`  = q004 ${f.where} already fixed`); continue; }
    throw new Error(`q004 ${f.where}: expected exactly 1 occurrence of «${f.from}», found ${n}`);
  }
  obj[f.key] = obj[f.key].replace(f.from, f.to);
  edits++;
  console.log(`  ✓ q004 ${f.where} 主机托管→主机租用 (hosting label)`);
}
if (edits) writeFileSync(trPath, JSON.stringify(tr, null, 2) + "\n");

// ---- (2) q019 raw stem ----
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const bank = JSON.parse(readFileSync(RB, "utf-8"));
const rec = (bank.questions ?? bank).find((x) => x.id === `${E}-q019`);
if (!rec) throw new Error("q019 not in bank");
const FROM = "| ③ | 競争優位の確保に役立つ技術の発掘 |";
const TO = "| ③ | 競争優位の構築に役立つ技術の見極め |";
if (rec.stem_jp.includes(TO)) {
  console.log("  = q019 raw already fixed");
} else {
  const n = rec.stem_jp.split(FROM).length - 1;
  if (n !== 1) throw new Error(`q019 raw: expected exactly 1 occurrence, found ${n}`);
  rec.stem_jp = rec.stem_jp.replace(FROM, TO);
  writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
  console.log("  ✓ q019 raw ③ 確保/発掘 → 構築/見極め (page-08 verbatim, clean/zh/en/解説は既に一致)");
}
console.log(`✓ quiz-phase2-explfix2-S112 done`);
