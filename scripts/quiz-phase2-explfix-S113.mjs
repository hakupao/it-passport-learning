#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 — explfix S113 (2012h24h): key_guard resolution before merge.
//
// S110 §5(a) 準拠: merge は FINAL (裁決後) の key_guard を sidecar に publish し、round-1 は
// key_guard_round1 に併記される。suspect の union(round1, final) は不変 = anti-masking。
// 本 script は generate_result の final key_guard に裁決注記を追記し、是正済みの腐敗 flag を
// 解決状態に flip する。解説本文の caveat strip は本 exam では 0 件 (体系スキャン済、
// generator が「注記は key_guard に一元化」規律を遵守)。
//
// q001 は本 exam 唯一の matches_key=false だった。stemfix-S113 で stem を源値 (変動費 3万円)
// に是正済みのため、final は literal 導出=イ=stored key を反映する (round1 に腐敗時の物語が残る)。
//
// Run: node scripts/quiz-phase2-explfix-S113.mjs   (then: node scripts/quiz-phase2-merge.mjs 2012h24h)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const E = "2012h24h";
const grPath = path.join(ROOT, `data/ip/quiz/.phase2/generate_result_${E}.json`);

const RESOLVES = {
  [`${E}-q001`]: "【S113 裁決】表の A案変動費「1万円」は page-02 実読 (単位 万円、A案=3) で「3万円」に是正済 (stemfix-S113、zh/en 連帯)。是正後は literal 導出=イ=stored key が回復 (両案とも利益 6,000万円で一致)。round1 の matches_key=false は腐敗時の記録として保存。",
  [`${E}-q003`]: "【S113 裁決】選択肢エ末尾の junk「= 2 なーー」は page-02 実読で strip 済 (stemfix-S113)。zh/en は元から clean。",
  [`${E}-q012`]: "【S113 裁決】選択肢ア末尾の衍字「の」は page-05 実読で「薦める。」に是正済 (stemfix-S113)。",
  [`${E}-q022`]: "【S113 裁決】stem 熟語内空白「設 定」は page-08 実読で「設定」に是正済 (stemfix-S113)。半角読点は corpus 一律の正規化差として不動。",
  [`${E}-q030`]: "【S113 裁決】stem 熟語内空白「ものはど れか」は「ものはどれか」に是正済 (stemfix-S113b、q022 と同クラス)。半角読点「, 」(57 問に分布) は corpus 一律の正規化差として不動 (backlog)。",
  [`${E}-q083`]: "【S113 裁決】選択肢ウの余分アポストロフィ・エの半角閉じ引用符は page-30 実読 (源は全角“…”) で是正済 (stemfix-S113)。",
  [`${E}-q089`]: "【S113 裁決】表2 3行目の結合セル (4 列にまたがる a 1 個) は裁剪図が添付済みで図が権威、markdown 平坦化「| a | | | |」は補充表示として不動 (a,a,a,a 化は図と矛盾、注記追加は源に無いテキストの増殖)。raw stem_jp の表2 2行目 Y,Y,N,N は clean が源一致 (Y,N,Y,N) ゆえ不動 (S107 q082 精神)。中問B 共通前提 (page-36 割引規定①〜③) の未取り込みはシナリオ再抽出 track に登録 (q089〜q092)。key エ は page-36/37 実読の独立導出で一致。",
  [`${E}-q090`]: "【S113 裁決】選択肢ウ 8,900→8,000円・エ 15,900→15,000円 (000→900 桁 OCR) は page-38 実読で是正済 (stemfix-S113、zh/en 連帯)。中問B 共通前提 (page-36 割引規定+表1 研修コース表) の丸ごと欠落は残存 — レコード単体では解答不能のままであり、シナリオ再抽出 track に登録 (最優先クラス、q090 は表1 も無い)。key イ は源実読の独立導出で一致。",
  [`${E}-q092`]: "【S113 裁決】stem は s7x 保真是正済 (fidfix-S113: ここで/開講される/受講申込みしている/「9月に」捏造削除、生成前に適用)。figure_derivable=false は料金表・請求規定が中問B 前文 (page-36/37) にのみ存在するため = シナリオ再抽出 track (q089〜q092)。key ア は独立導出で一致。",
  [`${E}-q093`]: "【S113 裁決】選択肢エ末尾の見出し混入「〔【ストラテジ]〕」は page-42 実読で strip 済 (stemfix-S113)。中問C 前書き (page-41 P社・要件(1)〜(4)) の未取り込みはシナリオ再抽出 track に登録 (q093〜q096)。key ア は独立導出で一致。",
  [`${E}-q095`]: "【S113 裁決】選択肢エ「来客用会議室」は page-43 実読で「来賓用会議室」に是正済 (賓→客 字形 OCR、stemfix-S113、zh 来宾用会议室/en guest meeting room 連帯)。中問C 前書きの未取り込みはシナリオ再抽出 track (q093〜q096)。key エ は独立導出で一致。",
  [`${E}-q098`]: "【S113 裁決】選択肢ウ「容が」→「客が」(字形 OCR)・エ末尾の見出し混入「[テクノロジ〕」strip は page-45 実読で是正済 (stemfix-S113)。zh/en は元から clean。",
};

// Final flag flips for FIXED corruptions. Linkage-gap-only / gap-remaining items keep
// stem_corruption_suspected=true (the missing lead text IS still missing): q089/q090/q093/q095.
// q092 final is already corrupt=false (fidelity fixes applied pre-generate).
const FIXED_FLAGS = {
  [`${E}-q001`]: { derived_answer: "イ", matches_key: true, figure_derivable: true },
  [`${E}-q003`]: { derived_answer: "イ", matches_key: true, figure_derivable: true },
  [`${E}-q012`]: { derived_answer: "エ", matches_key: true, figure_derivable: true },
  [`${E}-q022`]: { derived_answer: "イ", matches_key: true, figure_derivable: true },
  [`${E}-q030`]: { derived_answer: "ア", matches_key: true, figure_derivable: true },
  [`${E}-q083`]: { derived_answer: "イ", matches_key: true, figure_derivable: true },
  [`${E}-q098`]: { derived_answer: "ア", matches_key: true, figure_derivable: true },
};

const gr = JSON.parse(readFileSync(grPath, "utf-8"));
let resolved = 0, flipped = 0;

for (const [id, note] of Object.entries(RESOLVES)) {
  const rec = gr.results.find((r) => r.id === id);
  if (!rec) throw new Error(`${id}: not in generate_result`);
  if (rec.key_guard.note_jp.includes("【S113 裁決】")) { console.log(`  = ${id} already resolved`); continue; }
  rec.key_guard.note_jp = `${rec.key_guard.note_jp}\n${note}`;
  resolved++;
  console.log(`  ✓ ${id} key_guard resolve`);
}

for (const [id, want] of Object.entries(FIXED_FLAGS)) {
  const rec = gr.results.find((r) => r.id === id);
  if (!rec) throw new Error(`${id}: not in generate_result`);
  const kg = rec.key_guard;
  if (kg.derived_answer !== want.derived_answer && !(id === `${E}-q001` && kg.derived_answer === "ウ")) {
    throw new Error(`${id}: derived_answer ${kg.derived_answer} unexpected`);
  }
  if (kg.stem_corruption_suspected === false && kg.matches_key === want.matches_key && kg.derived_answer === want.derived_answer) {
    console.log(`  = ${id} flags already resolved`);
    continue;
  }
  kg.stem_corruption_suspected = false;
  kg.matches_key = want.matches_key;
  kg.derived_answer = want.derived_answer;
  kg.figure_derivable = want.figure_derivable;
  flipped++;
  console.log(`  ✓ ${id} final flags → corrupt=false, derived=${want.derived_answer}, matches_key=${want.matches_key}`);
}

writeFileSync(grPath, JSON.stringify(gr, null, 2) + "\n");
console.log(`✓ quiz-phase2-explfix-S113: key_guard resolves ${resolved} / flag flips ${flipped} / caveat strips 0 (体系スキャン済・該当なし)`);
console.log(`  next: node scripts/quiz-phase2-merge.mjs ${E}`);
