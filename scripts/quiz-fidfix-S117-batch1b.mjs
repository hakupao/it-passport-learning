#!/usr/bin/env node
// Stage 6 / Quiz — S117 batch 1 の Rule D reviewer (reviewer-batch1-fix) 指摘 B1 (必修) + N1〜N3 を是正。
//   B1 2016h28h-q043 final note: 「。」区切りの文差し替えが、腐敗テキスト内の「。」で誤分割し前後の断片が残った → 該当区間を丸ごと差し替え
//   N1 2020r02o-q083 解説: 選択肢を「ディジタル」に直したのに解説 (distractor ア / points[1]) が「デジタル」のまま → 統一
//   N2 2020r02o-q095 解説 correct 三語: 「1 Gバイト＝10⁹ バイト」→ stem の「10³ Mバイト」と接続する表現へ
//   N3 2016h28h-q086 distractor エ en: 「Software that … downloads software」の重複を平文化
// 書込先はすべて .phase2 入力層 (D-143)。Run: node scripts/quiz-fidfix-S117-batch1b.mjs && node scripts/quiz-phase2-merge.mjs 2016h28h && node scripts/quiz-phase2-merge.mjs 2020r02o
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P2 = (f) => path.join(ROOT, "data/ip/quiz/.phase2", f);
const rj = (f) => JSON.parse(readFileSync(f, "utf-8")), wj = (f, d) => writeFileSync(f, JSON.stringify(d, null, 2) + "\n");
let n = 0;
const sub = (o, k, from, to, w) => { const s = o[k]; if (!s.includes(from)) { console.log(`  = ${w}: already`); return; } if (s.split(from).length !== 2) throw new Error(`${w}: not unique`); o[k] = s.replace(from, to); n++; console.log(`  ✓ ${w}`); };

// B1
{ const gf = P2("generate_result_2016h28h.json"); const g = rj(gf); const r = g.results.find((x) => x.id === "2016h28h-q043");
  const s = r.key_guard.note_jp; const a = s.indexOf("ただし選択肢エの末尾に OCR ノイズ「。"); const b = s.indexOf("』と推定。");
  if (a >= 0 && b > a) { r.key_guard.note_jp = s.slice(0, a) + "選択肢エ末尾の OCR ノイズ「” 宝一」は S117 に page-20 実読 (双 pass 一致) で除去済 (fidfix-S117-batch1)。" + s.slice(b + "』と推定。".length); n++; console.log("  ✓ q043 note splice repaired (round1 untouched)"); } else console.log("  = q043 note already clean");
  wj(gf, g); }
// N1
{ const f = P2("expl_jp_2020r02o-q083.json"); const j = rj(f); const d = j.distractors_jp.find((x) => x.letter === "ア");
  sub(d, "why_wrong_jp", "デジタルサイネージは、", "ディジタルサイネージは、", "q083 expl ア jp");
  const i = j.points_jp.findIndex((p) => p.includes("デジタルサイネージ＝")); if (i >= 0) { j.points_jp[i] = j.points_jp[i].replace("デジタルサイネージ＝", "ディジタルサイネージ＝"); n++; console.log("  ✓ q083 points[1] jp"); }
  wj(f, j); }
// N2
{ const jf = P2("expl_jp_2020r02o-q095.json"), tf = P2("expl_tr_2020r02o-q095.json"); const j = rj(jf), t = rj(tf);
  sub(j, "correct_jp", "転送するデータ量は 1 Gバイト＝10⁹ バイトで、", "転送するデータ量は 1 Gバイト＝10³ Mバイト＝10⁹ バイトで、", "q095 correct jp");
  sub(t.correct, "zh", "要传输的数据量为 1 GB＝10⁹ 字节，", "要传输的数据量为 1 GB＝10³ MB＝10⁹ 字节，", "q095 correct zh");
  sub(t.correct, "en", "The amount of data to transfer is 1 GB = 10⁹ bytes,", "The amount of data to transfer is 1 GB = 10³ MB = 10⁹ bytes,", "q095 correct en");
  wj(jf, j); wj(tf, t); }
// N3
{ const f = P2("expl_tr_2016h28h-q086.json"); const t = rj(f); const d = t.distractors.find((x) => x.letter === "エ");
  sub(d, "en", "Software that, when run, downloads software performing malicious operations is a method", "Downloading software that performs malicious operations when run is a method", "q086 エ en");
  wj(f, t); }
console.log(`✓ quiz-fidfix-S117-batch1b: ${n} changes`);
