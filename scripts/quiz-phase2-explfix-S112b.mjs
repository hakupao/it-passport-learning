#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 — S112 key_guard resolution for 2012h24a (after stemfix/trfix-S112b).
//
// Same contract as explfix-S112 (2013h25h): append 裁決 notes to note_jp, then flip the
// FINAL flags of the FIXED corruptions to post-fix reality (S110 explfix precedent).
// round1 stays untouched — merge's union(round1, final) is the anti-masking invariant.
// Linkage-gap-only items keep stem_corruption_suspected=true (the missing lead text /
// figure IS still missing); they go to the 図/シナリオ再抽出 track.
//
// No UI caveat strips needed this exam: a systematic scan found the corrupted-text
// references only inside key_guard.note_jp (non-UI).
//
// Run: node scripts/quiz-phase2-explfix-S112b.mjs   (then: node scripts/quiz-phase2-merge.mjs 2012h24a)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P2 = (f) => path.join(ROOT, "data/ip/quiz/.phase2", f);
const E = "2012h24a";

const RESOLVES = {
  [`${E}-q002`]: "【S112 裁決】選択肢イの代替テキストが DFD の決め手「データストア」を名指しする答えの漏洩だったため、中立記述「（図：円と平行な二重線を矢印で結んだ図）」へ差し替え (stemfix-S112b、エの誤描写も是正、zh/en は trfix-S112b)。図そのものの添付は図再抽出 track に登録 (page-02 の 4 図)。",
  [`${E}-q046`]: "【S112 裁決】no-op。page-17 実読で源自体が「プログラム内部のプログラム構造を分析し」と確認 — generator の「論理構造からの置換」推定は源が裏づけず棄却 (S109 q100 教訓の再演)。",
  [`${E}-q077`]: "【S112 裁決】stem「プ ロトコル」の語中空白は page-29 実読 (行折り返し由来) で「プロトコル」に是正済 (stemfix-S112b)。",
  [`${E}-q081`]: "【S112 裁決】stem「ど れか。」の語中空白は page-30 実読で「どれか。」に是正済 (stemfix-S112b)。",
  [`${E}-q085`]: "【S112 裁決】中問A 図1 (page-33 ワークシート) の未添付 + 群共有裁剪図の上端欠落 (見出し行・牛丼行)。テキスト是正不能、図再抽出 track に登録 (q085/q086/q087)。key ア は page-33 実読の独立導出で一致。",
  [`${E}-q087`]: "【S112 裁決】中問A 図1 未添付 (q085 と同根)。図再抽出 track に登録。key ウ は源実読の独立導出で一致。",
  [`${E}-q089`]: "【S112 裁決】中問B〔システム導入検討会のメモ〕本体 (page-38) の未取り込み。シナリオ再抽出 track に登録 (q089〜q092)。key イ は page-38 実読の独立導出で一致。raw の「〕]」残存は q090 と同時に別途扱い。",
  [`${E}-q090`]: "【S112 裁決】中問B メモ本体の未取り込み (q089 と同根)。シナリオ再抽出 track に登録。key ウ は源実読の独立導出で一致。",
  [`${E}-q091`]: "【S112 裁決】選択肢エ末尾の分野見出し断片「[マネジメント]〕」は page-39 実読で strip 済 (stemfix-S112b)。中問B メモ本体の未取り込みはシナリオ再抽出 track (q089〜q092)。",
  [`${E}-q092`]: "【S112 裁決】選択肢エの「人」混入と隣接問見出し断片「画像データの符号化」は page-40 実読で是正済 (stemfix-S112b、zh 入金金额→金额 / en payment amount→amount は trfix-S112b)。中問B メモ未取り込みはシナリオ再抽出 track。",
  [`${E}-q093`]: "【S112 裁決】中問C 図1/図2 (page-41) の未添付 (群共有図 _groups/2012h24a-mqC.png は実在)。図再抽出/再紐付 track に登録 (q093〜q096)。key ウ は源実読の独立導出で一致。",
  [`${E}-q094`]: "【S112 裁決】中問C 図2 未添付 (q093 と同根)。図再抽出 track に登録。key ウ は源実読の独立導出で一致。",
  [`${E}-q095`]: "【S112 裁決】中問C 図2 未添付 (q093 と同根)。図再抽出 track に登録。key エ は源実読の独立導出で一致。",
  [`${E}-q096`]: "【S112 裁決】raw stem の answer-affecting 級の罠 ((3) 前提「白→黒」反転 = literal 読みで 30=イ に着地 / 「ランレングス0」の 0 脱落 / (2) n の定義「値」→「桁数」) を page-44 実読で是正済 (stemfix-S112b)。表示権威 clean は S112 保真是正で既に源一致。中問C 図2 未添付は図再抽出 track (q093〜q096)。",
  [`${E}-q097`]: "【S112 裁決】中問D〔会員登録をするWebページの仕組み〕前文の clean 段階注入漏れ (本文は q098 clean に現存)。シナリオ再抽出/前文注入 track に登録 (q097/q099)。key イ は stem 単独でも導出可で一致。",
  [`${E}-q099`]: "【S112 裁決】raw の括弧混在「仕組み}】」・語中空白は是正済 (stemfix-S112b、clean 既正)。⑤ 参照先本文の未併記は中問D 前文注入 track (q097/q099)。key ウ は stem 単独で導出可で一致。",
};

const grPath = P2(`generate_result_${E}.json`);
const gr = JSON.parse(readFileSync(grPath, "utf-8"));
let resolved = 0;
for (const [id, note] of Object.entries(RESOLVES)) {
  const rec = gr.results.find((r) => r.id === id);
  if (!rec) throw new Error(`${id}: not in generate_result`);
  if (rec.key_guard.note_jp.includes("【S112 裁決】")) { console.log(`  = ${id} already resolved`); continue; }
  rec.key_guard.note_jp = `${rec.key_guard.note_jp}\n${note}`;
  resolved++;
  console.log(`  ✓ ${id} key_guard resolve`);
}

// FIXED corruptions → final flags to post-fix reality (linkage-gaps stay flagged)
const FIXED_FLAGS = {
  [`${E}-q002`]: { figure_derivable: true, derived_answer: "イ" },
  [`${E}-q046`]: { figure_derivable: true, derived_answer: "エ" }, // no-op 裁決: source-faithful, flag was a false positive
  [`${E}-q077`]: { figure_derivable: true, derived_answer: "ウ" },
  [`${E}-q081`]: { figure_derivable: true, derived_answer: "イ" },
  [`${E}-q091`]: { figure_derivable: true, derived_answer: "イ" },
  [`${E}-q099`]: { figure_derivable: true, derived_answer: "ウ" },
};
let flipped = 0;
for (const [id, want] of Object.entries(FIXED_FLAGS)) {
  const rec = gr.results.find((r) => r.id === id);
  const kg = rec.key_guard;
  if (kg.derived_answer !== want.derived_answer) throw new Error(`${id}: derived ${kg.derived_answer} ≠ ${want.derived_answer}`);
  if (kg.matches_key !== true) throw new Error(`${id}: matches_key is not true`);
  if (kg.stem_corruption_suspected === false && kg.figure_derivable === want.figure_derivable) { console.log(`  = ${id} flags already resolved`); continue; }
  kg.stem_corruption_suspected = false;
  kg.figure_derivable = want.figure_derivable;
  flipped++;
  console.log(`  ✓ ${id} final flags → corrupt=false`);
}
// q092: choice OCR fixed but 中問B linkage-gap remains → keep corrupt=true (honest)
// q096: raw fixed but 図2 unattached → keep corrupt=true + derivable=false (honest)

writeFileSync(grPath, JSON.stringify(gr, null, 2) + "\n");
console.log(`✓ quiz-phase2-explfix-S112b: resolves ${resolved} / flag flips ${flipped}`);
