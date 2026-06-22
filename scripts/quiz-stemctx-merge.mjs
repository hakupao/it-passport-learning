#!/usr/bin/env node
// Stage 6 / Quiz Phase 1.6 (Session 99) — apply context-injected stems (with 主 context corrections
// of the 2 critic faithfulness disputes) into translation sidecars.
//   q094: fix note 「三つの項目は順に記述」→「三つ目の項目は使用しない」(page-38 忠実)
//   q100: remove 「1Gバイト=1,000Mバイト」 (原典に無い追加文を削除)
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const res = JSON.parse(readFileSync(path.join(ROOT, "data/ip/quiz/.keyaudit/stemctx_results.json"), "utf-8")).results;
const A = Object.fromEntries(res.map((r) => [r.id, r.authored]));

function must(str, sub) { if (!str.includes(sub)) throw new Error(`assert: substring not found: ${sub.slice(0, 40)}`); return true; }

// ---- q094: correct the note in all 3 langs ----
const q94 = A["2010h22a-q094"];
const q94fix = [
  ["stem_jp_clean", "形式 1 の三つの項目は順に記述する", "形式 1 では三つ目の項目（対象区分の欄）は使用しない"],
  ["stem_zh", "格式 1 的三个项目按顺序记述", "格式 1 中第三个项目（对象类别栏）不使用"],
  ["stem_en", "The three items of Format 1 are written in this order", "In Format 1, the third item (the person-category field) is not used"],
];
for (const [k, from, to] of q94fix) { must(q94[k], from); q94[k] = q94[k].replace(from, to); }

// ---- q100: remove the 1G=1000M sentence in all 3 langs ----
const q100 = A["2015h27a-q100"];
const q100fix = [
  ["stem_jp_clean", "また,1Gバイト=1,000Mバイトとする。"],
  ["stem_zh", "另外，设1G字节=1,000M字节。"],
  ["stem_en", " Also, assume 1 GB = 1,000 MB."],
];
for (const [k, sub] of q100fix) { must(q100[k], sub); q100[k] = q100[k].replace(sub, ""); }

// ---- merge into sidecars ----
let updated = 0;
for (const [id, a] of Object.entries({ "2010h22a-q094": q94, "2015h27a-q100": q100 })) {
  const exam = id.replace(/-q\d+$/, "");
  const f = path.join(ROOT, `data/ip/quiz/translations/${exam}.json`);
  const tr = JSON.parse(readFileSync(f, "utf-8"));
  const tq = tr.questions[id];
  if (!tq) throw new Error(`${id} not in sidecar`);
  tq.stem_jp_clean = a.stem_jp_clean;
  tq.stem = { zh: a.stem_zh, en: a.stem_en };
  writeFileSync(f, JSON.stringify(tr, null, 2) + "\n");
  updated++;
  console.log(`✓ ${id}: stem_jp_clean + stem.zh/en updated (context injected, disputes corrected)`);
}
console.log(`✓ stemctx merge: ${updated} questions`);
