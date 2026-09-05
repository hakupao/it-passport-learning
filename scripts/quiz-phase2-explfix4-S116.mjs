#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 — explfix4 S116: 確認 Rule A (`wf_498422bd-568`) が挙げた技術的不正確を是正。
//
// 2009h21a-q078 正解解説: 「誤り訂正用のパリティを**別ディスク**に置く方式 (RAID 5 など)」は誤り。
// パリティを専用ディスクに固定配置するのは RAID 3/4 で、**RAID 5 は全ディスクに分散配置**する。
// IP 試験の合否には影響しない low だが、「RAID 5 = パリティ専用ディスク」という誤概念を
// 学習者に植え付けるため是正する (jp/zh/en 3 言語に同じ記述が伝播していた)。
//
// Run: node scripts/quiz-phase2-explfix4-S116.mjs
//   (then: node scripts/quiz-phase2-merge.mjs 2009h21a && node scripts/quiz-phase2-verify-result.mjs 2009h21a)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P2 = (f) => path.join(ROOT, "data/ip/quiz/.phase2", f);
const ID = "2009h21a-q078";

const EDITS = [
  { file: "jp", key: "correct_jp",
    from: "誤り訂正用のパリティを別ディスクに置く方式 (RAID 5 など)",
    to: "誤り訂正用のパリティを各ディスクに分散して持たせる方式 (RAID 5 など)" },
  { file: "tr", key: "zh",
    from: "把纠错用的奇偶校验位放在另一块硬盘上的方式（如 RAID 5）",
    to: "把纠错用的奇偶校验位分散存放在各块硬盘上的方式（如 RAID 5）" },
  { file: "tr", key: "en",
    from: "schemes that place error-correcting parity on a separate disk (such as RAID 5)",
    to: "schemes that distribute error-correcting parity across the disks (such as RAID 5)" },
];

let n = 0;
for (const e of EDITS) {
  const fp = P2(`expl_${e.file}_${ID}.json`);
  const doc = JSON.parse(readFileSync(fp, "utf-8"));
  const holder = e.file === "jp" ? doc : doc.correct;
  const cur = holder[e.key];
  if (typeof cur !== "string") throw new Error(`${e.file}.${e.key}: not a string`);
  if (!cur.includes(e.from)) {
    if (cur.includes(e.to)) { console.log(`  = ${e.file}.${e.key}: 既に是正済 → skip`); continue; }
    throw new Error(`${e.file}.${e.key}: from が見つからない — 中止`);
  }
  if (cur.split(e.from).length - 1 !== 1) throw new Error(`${e.file}.${e.key}: from が複数回出現 — 中止`);
  holder[e.key] = cur.replace(e.from, e.to);
  writeFileSync(fp, JSON.stringify(doc, null, 2) + "\n");
  n++;
  console.log(`  ✓ ${e.file}.${e.key}: RAID 5 = パリティ分散 に是正`);
}

// 是正後 assert: 「別ディスク/另一块硬盘/separate disk」+ RAID 5 の同居が残っていないこと
for (const f of ["jp", "tr"]) {
  const doc = JSON.parse(readFileSync(P2(`expl_${f}_${ID}.json`), "utf-8"));
  delete doc.key_guard; // 内部監査証跡は対象外
  const s = JSON.stringify(doc);
  for (const bad of ["パリティを別ディスクに置く", "放在另一块硬盘上", "parity on a separate disk"]) {
    if (s.includes(bad)) throw new Error(`${ID} [${f}]: 「${bad}」が残存`);
  }
}
console.log(`✓ quiz-phase2-explfix4-S116: ${n} フィールド是正`);
