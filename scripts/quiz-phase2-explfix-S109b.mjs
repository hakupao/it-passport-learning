#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 batch S109b — explanation repair + key_guard resolution for 2014h26a.
// All fixes adjudicated by 主 context against source pages 11 / 15 / 18 / 24 / 25 / 51.
//
// Layer 1 STRIP: OCR caveats that describe corruption the learner no longer sees after
//   stemfix-S109b. q029 carried the caveat twice (an opening 「掲載本文の…は OCR 由来の誤り」
//   and a closing 「参考までに…47.7%」); q045 ア/イ carried 「(選択肢では「ISO 9091」と誤記)」;
//   q061 ウ carried 「なお…「鐘形」は「雛形」の誤字」. 3 languages each.
//
// Layer 2 RESOLVE: key_guard for the seven text-corrected questions. q029 is the important
//   one — it was the only genuine `matches_key=false` of the exam, caused purely by the
//   1,906/1,000 OCR (literal reading matched no choice), so it resolves to derived イ.
//
//   NOT resolved (honest records kept): q085 / q087 / q088 / q090 / q091 / q098 — these are
//   中問 A/B/D preamble・表1・図1 linkage gaps that no text edit repairs. They keep
//   figure_derivable=false (and stay SUSPECT) so the sidecar does not claim a completeness
//   the delivered data does not have.
//
// Idempotent. Run: node scripts/quiz-phase2-explfix-S109b.mjs
//   (then: node scripts/quiz-phase2-verify-result.mjs 2014h26a && node scripts/quiz-phase2-merge.mjs 2014h26a)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P2 = (f) => path.join(ROOT, "data/ip/quiz/.phase2", f);
const E = "2014h26a";
const q = (n) => `${E}-q${String(n).padStart(3, "0")}`;

// {id, where: "correct"|"distractor:<letter>", lang, from, to}
const EDITS = [
  // ---- q029: opening + closing OCR caveats -------------------------------------
  { id: q(29), where: "correct", lang: "jp", from: "はじめに注意点として、掲載本文の取得費用「1,906万円」は OCR 由来の誤りで、原典 (平成26年度秋期 問29) の取得費用は1,000万円です。以下は原典の1,000万円で説明します。", to: "" },
  { id: q(29), where: "correct", lang: "jp", from: "参考までに、本文の「1,906万円」のまま計算すると約47.7%となり、選択肢のいずれにも一致しません。", to: "" },
  { id: q(29), where: "correct", lang: "zh", from: "首先需要注意，题干中刊载的取得费用「1,906万日元」是 OCR 造成的错误，原始试题（平成26年度秋期 问29）的取得费用为1,000万日元。以下按原始试题的1,000万日元进行说明。", to: "" },
  { id: q(29), where: "correct", lang: "zh", from: "作为参考，如果按题干中的「1,906万日元」计算，结果约为47.7%，与任何一个选项都不一致。", to: "" },
  { id: q(29), where: "correct", lang: "en", from: "First, a caution: the acquisition cost of 19.06 million yen printed in the question text is an OCR error; in the original exam (Heisei 26 Autumn, Question 29) the acquisition cost is 10 million yen. The explanation below uses the original figure of 10 million yen. ", to: "" },
  { id: q(29), where: "correct", lang: "en", from: " For reference, if you calculate with the 19.06 million yen shown in the question text, you get about 47.7%, which matches none of the choices.", to: "" },
  // ---- q045 ア/イ: 「誤記」 parentheticals ---------------------------------------
  { id: q(45), where: "distractor:ア", lang: "jp", from: "ISO 9001 (選択肢では「ISO 9091」と誤記) は", to: "ISO 9001 は" },
  { id: q(45), where: "distractor:ア", lang: "zh", from: "ISO 9001（选项中误写为 ISO 9091）是", to: "ISO 9001 是" },
  { id: q(45), where: "distractor:ア", lang: "en", from: "ISO 9001 (written incorrectly as ISO 9091 in the choice) is", to: "ISO 9001 is" },
  { id: q(45), where: "distractor:イ", lang: "jp", from: "ISO 14001 (選択肢では「ISO 149661」と誤記) は", to: "ISO 14001 は" },
  { id: q(45), where: "distractor:イ", lang: "zh", from: "ISO 14001（选项中误写为 ISO 149661）是", to: "ISO 14001 是" },
  { id: q(45), where: "distractor:イ", lang: "en", from: "ISO 14001 (written incorrectly as ISO 149661 in the choice) is", to: "ISO 14001 is" },
  // ---- q061 ウ: 「鐘形」 typo note ----------------------------------------------
  { id: q(61), where: "distractor:ウ", lang: "jp", from: "なお、この選択肢の「鐘形」は「雛形 (ひな形、テンプレート)」の誤字と考えられる。", to: "" },
  { id: q(61), where: "distractor:ウ", lang: "zh", from: "另外，该选项日文原文中的「鐘形」应是「雛形（模板、样板）」的错字。", to: "" },
  { id: q(61), where: "distractor:ウ", lang: "en", from: " Note that 「鐘形」 in the Japanese text of this choice is considered to be a typo for 「雛形」 (a template or model form).", to: "" },
];

const docs = new Map();
const load = (f) => {
  if (!docs.has(f)) docs.set(f, JSON.parse(readFileSync(P2(f), "utf-8")));
  return docs.get(f);
};

let changed = 0;
const touched = new Set();

for (const e of EDITS) {
  const jp = e.lang === "jp";
  const file = jp ? `expl_jp_${e.id}.json` : `expl_tr_${e.id}.json`;
  const doc = load(file);
  let holder, key;
  if (e.where === "correct") {
    holder = jp ? doc : doc.correct;
    key = jp ? "correct_jp" : e.lang;
  } else {
    const L = e.where.slice(11);
    holder = jp ? doc.distractors_jp?.find((d) => d.letter === L) : doc.distractors?.find((d) => d.letter === L);
    key = jp ? "why_wrong_jp" : e.lang;
  }
  if (!holder || typeof holder[key] !== "string") throw new Error(`${e.id} ${e.where}.${e.lang}: target missing`);
  const cur = holder[key];
  if (!cur.includes(e.from)) { console.log(`  ~ ${e.id} ${e.where}.${e.lang}: already applied, skip`); continue; }
  const n = cur.split(e.from).length - 1;
  if (n !== 1) throw new Error(`${e.id} ${e.where}.${e.lang}: expected 1 occurrence, found ${n} — aborting`);
  const next = cur.replace(e.from, e.to).replace(/\s{2,}/g, " ").trim();
  if (!next) throw new Error(`${e.id} ${e.where}.${e.lang}: edit would empty the field — aborting`);
  holder[key] = next;
  touched.add(file);
  changed++;
  console.log(`  ✓ ${e.id} ${e.where}.${e.lang}`);
}

for (const f of touched) writeFileSync(P2(f), JSON.stringify(docs.get(f), null, 2) + "\n");

// ---- Layer 2: key_guard resolution ------------------------------------------------
const R = (derived, note) => ({ figure_derivable: true, derived_answer: derived, matches_key: true, stem_corruption_suspected: false, note_jp: note });

const RESOLVED = {
  [q(29)]: R("イ", "計算問。**本 exam 唯一の真の matches_key=false**。原因は表示 stem の取得費用が OCR で 1,000万円→1,906万円 に腐敗しており、字面どおり計算すると ROI≒47.7% で ア90.0/イ100.0/ウ110.0/エ120.0 のいずれにも着地せず、表示上「正解が存在しない」状態だったこと。主 context が source page-11 を実読し「取得費用が1,000万円で」を確定 → stemfix-S109b で raw/clean/zh/en を是正 (式の raw 腐敗「利益 + 投下資本 X 160」→「利益 ÷ 投下資本 × 100」も同時是正)。是正後: 保守 10万/年 → 正味利益 100万/年 → 10年で1,000万 → 1,000÷1,000×100 = 100.0% = イ で stored key と一致。解説の OCR 注記 (冒頭・末尾の2箇所×3言語) も strip 済 → 解決。"),
  [q(36)]: R("ウ", "概念問 (PDCA)。stem 是正後 (S109b: source page-15、stem の余分な半角ピリオド「C . (Check)」→「C (Check)」、正解肢ウの字形 OCR「乏働率」→「稼働率」) は表示クリーン。障害回数・回復時間を測定し稼働率を算出して目標値と比較する=Check=ウ が key と一致。round-1 の flag は是正済のため解決。"),
  [q(45)]: R("エ", "概念問 (システム監査)。stem 是正後 (S109b: source page-18、選択肢の規格番号 OCR「ISO 9091」→「ISO 9001」/「ISO 149661」→「ISO 14001」) は表示クリーン。情報システムのリスクに対するコントロールの整備・運用状況を検証評価する=エ が key と一致。解説の「誤記」注記も strip 済 → 解決。"),
  [q(59)]: R("エ", "概念問 (バッファオーバフロー)。stem 是正後 (S109b: source page-24、誤答肢イの「満林」→「満杯」+ 余分な空白2箇所) は表示クリーン。入力用データ領域を超えるサイズのデータで想定外の動作をさせる=エ が key と一致。round-1 の flag は是正済のため解決。"),
  [q(61)]: R("エ", "概念問 (情報セキュリティポリシ)。stem 是正後 (S109b: source page-25、誤答肢ウの字形 OCR「鐘形」→「雛形」) は表示クリーン。基本方針は組織全体で統一すべき=エ が key と一致。解説の誤字注記も strip 済 → 解決。"),
  [q(62)]: R("ア", "概念問 (ペネトレーションテスト)。stem 是正後 (S109b: source page-25、誤答肢ウの衍字「影響がの現れて」→「影響が現れて」) は表示クリーン。実際に攻撃・侵入を試みて弱点を発見する=ア が key と一致。round-1 の flag は是正済のため解決。"),
  [q(100)]: R("ウ", "計算問。stem 是正後 (S109b: source page-51 実読、設問形式「求めるのに最も適切なものはどれか」→ 源の「求めると何時間になるか」、および「1日の申請処理件数」→「A社の1日の平均申請回数」) は表示クリーン。**generator は併せて「源の選択肢は 29時間/44時間/… と単位付き」と主張し確定事項として登記を求めたが、主 context の page-51 実読では選択肢は裸数値 29/44/56/152 で dataset と一致**しており、この主張は棄却して choices は不動とした (単位は設問文側の「何時間」が担う)。計算: 申請者 9分×200件=1,800分 + 事務全体 32分×20日=640分 + 承認 1分×200件=200分 + 経理全体 12時間=720分 = 3,360分 = 56時間 = ウ で key と一致。"),
};

const grPath = P2(`generate_result_${E}.json`);
const gr = JSON.parse(readFileSync(grPath, "utf-8"));
let grChanged = false;
for (const [id, kg] of Object.entries(RESOLVED)) {
  const rec = gr.results.find((r) => r.id === id);
  if (!rec) throw new Error(`generate_result_${E}: ${id} not found`);
  if (rec.key_guard?.note_jp === kg.note_jp && rec.suspect === false) { console.log(`  ~ generate_result ${id}: already resolved, skip`); continue; }
  rec.key_guard = { ...kg };
  rec.key_guard_round1 = { ...kg };
  rec.suspect = false;
  grChanged = true;
  changed++;
  console.log(`  ✓ generate_result ${id}: key_guard resolved (derived ${kg.derived_answer})`);
}
if (grChanged) writeFileSync(grPath, JSON.stringify(gr, null, 2) + "\n");

console.log(`✓ quiz-phase2-explfix-S109b: ${changed} change(s) → re-run verify-result + merge (${E})`);
