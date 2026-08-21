#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 — S112 second-round fixes for 2012h24a, from Rule A `wf_a4a40326-e82`
// (medium 3 / 34、S89 方針: medium 採用・low の任意提案 不採用)。
//
// (1) q092 correct.jp/zh/en の陳腐化注記 strip — 解説末尾の「補足 (表示上の注意)」が
//     stemfix-S112b で既に是正した選択肢エの腐敗を現在形で学習者に案内していた
//     (fix-checklist「是正後は本文注記も整合」の本文側の取り残し。S112b で体系 caveat
//     スキャンを省いた手落ちを Rule A が捕捉 — スキャンは本 fix 前に実施済、他の残留は
//     q066 の数学的例示のみ = 誤検知)。
// (2) q023 zh の hosting ラベル — 主机托管 (大陸慣用では colocation = 本問の正解側の
//     ハウジング) を hosting の見出し語にしていたため、識別軸が中国語読者に逆さに読めた。
//     2013h25h-q004 と同クラス (S112 で 2 exam 連続 2 例目 = 横断 D 候補の傍証)。
//     минimal fix: hosting 側 2 箇所 → 主机租用。housing=机房托管 は stem 訳から解説まで
//     全鎖一貫しており不動 (q004 の教訓: 設問レコード全体をスコープに連鎖を確認済 —
//     本問の choices は A社/B社 の表で hosting 語を含まず、断裂は生じない)。
// (3) key_guard note の中問範囲の事実誤り — groups.json 実測 (mqA = q085〜q088) に基づき、
//     S112b resolve の「(q085/q086/q087)」と generator note の「問88〜問91」を訂正
//     (Rule A medium: 誤範囲のまま再抽出すると q088 誤紐付け・q092 取りこぼしの実害)。
//
// Run: node scripts/quiz-phase2-explfix2-S112b.mjs   (then: node scripts/quiz-phase2-merge.mjs 2012h24a)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P2 = (f) => path.join(ROOT, "data/ip/quiz/.phase2", f);
const E = "2012h24a";

// ---- (1) q092 stale caveat strip ----
const jp92Path = P2(`expl_jp_${E}-q092.json`);
const tr92Path = P2(`expl_tr_${E}-q092.json`);
const jp92 = JSON.parse(readFileSync(jp92Path, "utf-8"));
const tr92 = JSON.parse(readFileSync(tr92Path, "utf-8"));
const STRIPS = [
  { doc: jp92, get: () => jp92.correct_jp, set: (v) => (jp92.correct_jp = v), anchor: " ／ 補足 (表示上の注意): " },
  { doc: tr92, get: () => tr92.correct.zh, set: (v) => (tr92.correct.zh = v), anchor: "／ 补充（显示上的注意）：" },
  { doc: tr92, get: () => tr92.correct.en, set: (v) => (tr92.correct.en = v), anchor: " ／ Supplementary note (about the displayed text): " },
];
for (const s of STRIPS) {
  const cur = s.get();
  const i = cur.indexOf(s.anchor);
  if (i === -1) {
    if (/OCR|表示上の注意|显示上的注意|Supplementary note/.test(cur)) throw new Error("q092 caveat anchor drifted — manual check");
    console.log("  = q092 caveat already stripped");
    continue;
  }
  s.set(cur.slice(0, i).replace(/\s+$/, ""));
  console.log("  ✓ q092 caveat strip");
}
writeFileSync(jp92Path, JSON.stringify(jp92, null, 2) + "\n");
writeFileSync(tr92Path, JSON.stringify(tr92, null, 2) + "\n");

// ---- (2) q023 zh hosting label ----
const tr23Path = P2(`expl_tr_${E}-q023.json`);
const tr23 = JSON.parse(readFileSync(tr23Path, "utf-8"));
const F23 = [
  { get: () => tr23.distractors.find((d) => d.letter === "イ"), key: "zh",
    from: "服务商把自己的服务器租给用户的形态是主机托管服务（hosting，即租用服务器）",
    to: "服务商把自己的服务器租给用户的形态是主机租用服务（hosting，即租用服务器）" },
  { get: () => tr23.points[1], key: "zh",
    from: "与主机托管服务（hosting）的区分",
    to: "与主机租用服务（hosting）的区分" },
];
for (const f of F23) {
  const obj = f.get();
  if (!obj) throw new Error("q023 target missing");
  if (obj[f.key].includes(f.to)) { console.log("  = q023 already fixed"); continue; }
  const n = obj[f.key].split(f.from).length - 1;
  if (n !== 1) throw new Error(`q023: expected 1 occurrence of «${f.from.slice(0, 30)}», found ${n}`);
  obj[f.key] = obj[f.key].replace(f.from, f.to);
  console.log("  ✓ q023 zh hosting 主机托管→主机租用");
}
writeFileSync(tr23Path, JSON.stringify(tr23, null, 2) + "\n");

// ---- (3) note range corrections in generate_result ----
const grPath = P2(`generate_result_${E}.json`);
const gr = JSON.parse(readFileSync(grPath, "utf-8"));
const NOTE_FIXES = [
  { id: `${E}-q085`, from: "図再抽出 track に登録 (q085/q086/q087)", to: "図再抽出 track に登録 (中問A = q085〜q088、groups.json 実測)" },
  { id: `${E}-q087`, from: "中問A 図1 未添付 (q085 と同根)。図再抽出 track に登録。", to: "中問A 図1 未添付 (q085 と同根、中問A = q085〜q088)。図再抽出 track に登録。" },
  { id: `${E}-q090`, from: "【S112 裁決】中問B メモ本体の未取り込み (q089 と同根)。", to: "【S112 裁決】中問B メモ本体の未取り込み (q089 と同根)。【範囲訂正】note 冒頭の「問88〜問91」は誤りで、正しくは 中問B = 問89〜問92 (groups.json 実測: q088 は中問A 所属。Rule A medium 指摘)。" },
];
for (const f of NOTE_FIXES) {
  const rec = gr.results.find((r) => r.id === f.id);
  if (!rec) throw new Error(`${f.id} not found`);
  if (rec.key_guard.note_jp.includes(f.to)) { console.log(`  = ${f.id} note already corrected`); continue; }
  const n = rec.key_guard.note_jp.split(f.from).length - 1;
  if (n !== 1) throw new Error(`${f.id}: expected 1 occurrence of «${f.from.slice(0, 30)}», found ${n}`);
  rec.key_guard.note_jp = rec.key_guard.note_jp.replace(f.from, f.to);
  console.log(`  ✓ ${f.id} note range corrected`);
}
writeFileSync(grPath, JSON.stringify(gr, null, 2) + "\n");
console.log("✓ quiz-phase2-explfix2-S112b done");
