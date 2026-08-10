#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 batch S110 — explanation-sidecar repair + key_guard resolution
// for 2014h26h. All fixes adjudicated by 主 context against source pages 40 and 47.
//
// Layer 1a STRIP_CAVEATS (anchor → end): the generator, having read the source, wrote the
//   explanations against the CORRECT numbers and appended a caveat warning the reader that
//   the displayed stem showed different ones. quiz-phase2-stemfix-S110 has now fixed the
//   displayed stem, so these caveats are stale and would confuse the learner.
//     q091 correct.{jp,zh,en} — 「表示されている stem の「月間499台」「2,090万円」は OCR…」
//     q100 correct.{jp,zh,en} — 「本問の (1) は原典では「2,000件」…」
//
// Layer 1b REPLACE (mid-string parenthetical): same situation but the caveat sits inside a
//   sentence rather than at the end.
//     q092 correct.{jp,zh,en} — 「販売価格は原典では1台10万円です (…「19万円」は OCR 由来…)」
//
// Layer 2 resolves each generate_result key_guard to post-fix reality.
//   q100 flips to matches_key=true: BOTH of its defects are now fixed — the stem 2,900→2,000
//     (quiz-phase2-stemfix-S110) and the correct_answer イ→ア (same script; the stored key was
//     a mis-registration, contradicted by answer_keys.json AND by the source-derived 6,500).
//   q091 / q092 keep figure_derivable=false and therefore stay SUSPECT: their OCR flags are
//     cleared, but the 中問 (q089〜q092) linkage-gap is NOT fixed by any text edit — 表1
//     (案A/案B の固定費・変動費) lives only in the q089 lead text, so neither question can be
//     solved from its own delivered entry. Honest record; 図/シナリオ再抽出 track.
//
// Idempotent. Run: node scripts/quiz-phase2-explfix-S110.mjs
//   (then: node scripts/quiz-phase2-verify-result.mjs 2014h26h && node scripts/quiz-phase2-merge.mjs 2014h26h)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P2 = (f) => path.join(ROOT, "data/ip/quiz/.phase2", f);
const E = "2014h26h";

const jpCorrect = (d) => [d, "correct_jp"];
const trCorrect = (lang) => (d) => [d.correct, lang];

const STRIP_CAVEATS = [
  { file: `expl_jp_${E}-q091.json`, locate: jpCorrect, anchor: "【注記】表示されている stem の" },
  { file: `expl_tr_${E}-q091.json`, locate: trCorrect("zh"), anchor: "【注】题干中显示的" },
  { file: `expl_tr_${E}-q091.json`, locate: trCorrect("en"), anchor: "[Note] The “499 units per month”" },
  { file: `expl_jp_${E}-q100.json`, locate: jpCorrect, anchor: "【注記】本問の (1) は原典" },
  { file: `expl_tr_${E}-q100.json`, locate: trCorrect("zh"), anchor: "【注】本题的条件 (1) 在原始试题" },
  { file: `expl_tr_${E}-q100.json`, locate: trCorrect("en"), anchor: "[Note] Condition (1) of this question" },
];

const REPLACE = [
  {
    file: `expl_jp_${E}-q092.json`, locate: jpCorrect,
    from: "〔月間利益計画〕の販売価格は原典では1台10万円です (現在の表示テキストにある「19万円」は OCR 由来の誤りで, 正しくは10万円)。",
    to: "〔月間利益計画〕の販売価格は1台10万円です。",
  },
  {
    file: `expl_tr_${E}-q092.json`, locate: trCorrect("zh"),
    from: "〔月度利润计划〕中的销售价格在原始试题中为每台10万日元（当前显示文本中的「19万日元」是OCR导致的错误，正确值为10万日元）。",
    to: "〔月度利润计划〕中的销售价格为每台10万日元。",
  },
  {
    file: `expl_tr_${E}-q092.json`, locate: trCorrect("en"),
    from: "In the [Monthly Profit Plan], the selling price in the original exam paper is 100,000 yen per unit (the 「190,000 yen」 in the currently displayed text is an OCR error; the correct value is 100,000 yen).",
    to: "In the [Monthly Profit Plan], the selling price is 100,000 yen per unit.",
  },
];

let changed = 0;
const byFile = new Map();
const load = (f) => {
  if (!byFile.has(f)) byFile.set(f, JSON.parse(readFileSync(P2(f), "utf-8")));
  return byFile.get(f);
};

for (const f of STRIP_CAVEATS) {
  const [obj, key] = f.locate(load(f.file));
  if (!obj || typeof obj[key] !== "string") throw new Error(`${f.file}: locate failed`);
  const cur = obj[key];
  const idx = cur.indexOf(f.anchor);
  if (idx === -1) { console.log(`  ~ ${f.file} ${key}: caveat already stripped, skip`); continue; }
  const stripped = cur.slice(0, idx).replace(/\s+$/, "");
  if (!stripped) throw new Error(`${f.file} ${key}: strip would empty the field — aborting`);
  obj[key] = stripped;
  changed++;
  console.log(`  ✓ ${f.file} ${key}: stripped stale OCR caveat`);
}

for (const f of REPLACE) {
  const [obj, key] = f.locate(load(f.file));
  if (!obj || typeof obj[key] !== "string") throw new Error(`${f.file}: locate failed`);
  const cur = obj[key];
  if (cur.includes(f.to) && !cur.includes(f.from)) { console.log(`  ~ ${f.file} ${key}: already replaced, skip`); continue; }
  const n = cur.split(f.from).length - 1;
  if (n !== 1) throw new Error(`${f.file} ${key}: expected exactly 1 occurrence but found ${n} — aborting`);
  obj[key] = cur.replace(f.from, f.to);
  changed++;
  console.log(`  ✓ ${f.file} ${key}: removed inline OCR caveat`);
}

for (const [file, doc] of byFile) writeFileSync(P2(file), JSON.stringify(doc, null, 2) + "\n");

// ---- Layer 2: resolve key_guard in generate_result ---------------------------------
//
// q085 is a different kind of repair from the rest: nothing about the question changed, but
// the generator's key_guard note contains a **fabricated** linkage-gap claim. Rule A
// (`wf_66d1dd48-ab6`, severity=medium) caught it and 主 context confirmed it by reading
// page-34 at 2.4x: 問85 sits alone on that page and 〔データ管理要領〕 appears only inline in
// the stem as a document name — there is no separate boxed block anywhere on the page, so
// there is nothing "not carried over". Left as-is it would send a future session hunting for
// a figure that does not exist. The three real cosmetic OCR flags in the same note are kept.
const Q085_NOTE =
  "has_figure=false のため図は無く、stem_jp_clean と4選択肢だけで白紙から導出した。設問は「適切でないもの」を選ぶ否定形。" +
  "判定軸は『データを実際に受領したか』と『データ管理簿に記録したか』の2点である。ア=2種類の媒体を受領し、その事実を記録 → 現物が2つある以上どちらも管理対象なので適切。" +
  "ウ=管理簿記載の使用目的以外に使うことになったので、いったん返却し新しい目的で受領し直して記録 → 管理簿の記載と実際の使用目的を一致させる手順で適切。" +
  "エ=受領する前に依頼を取り消した → データは手元に存在せず、管理簿に記録すべき受領事実がないので適切。" +
  "イだけが『実際に受領した』のに『受領を記録しなかった』ケースで、使用しなかったことは記録免除の理由にならない。よって不適切は一意にイで、stored correct_answer と一致する。" +
  "stem_corruption_suspected=true とした理由 (いずれも答えを左右しない cosmetic な OCR 腐敗、表示テキスト是正の契機として申告): " +
  "(1) 選択肢アの「データ管理澄」は「データ管理簿」の誤り (他の3選択肢はすべて「データ管理簿」)、" +
  "(2) 選択肢エの末尾「[テクノロジ〕」は分野ラベルの混入で本文ではない、(3) 選択肢ウの「一且」は「一旦」の誤り。" +
  "【S110 訂正】round-1 の note にあった第4項『〔データ管理要領〕は原典の別枠への参照で、枠内本文が未取り込み (linkage gap)』は**誤り**。" +
  "主 context が source page-34 を 2.4 倍で実読したところ、問85 は当該ページに単独掲載され、〔データ管理要領〕は設問文中にインラインで書かれた文書名にすぎず、囲み枠・別表は原典に存在しない。" +
  "したがって linkage gap ではなく、図/シナリオ再抽出 track に登録すべき対象でもない (Rule A `wf_66d1dd48-ab6` が medium で指摘、実読で確認)。";

const RESOLVED = {
  [`${E}-q085`]: {
    figure_derivable: true, derived_answer: "イ", matches_key: true, stem_corruption_suspected: true,
    note_jp: Q085_NOTE,
  },
  [`${E}-q100`]: {
    figure_derivable: true, derived_answer: "ア", matches_key: true, stem_corruption_suspected: false,
    note_jp:
      "図なしの計算問。**本 corpus で初めて correct_answer 自体が誤登録だった問**。round-1 は 2 つの欠陥を同時に検出した: (a) 表示 stem の「2,900件」(源 page-47 は「2,000件」、0→9 の OCR)、(b) stored correct_answer「イ」が公式 answer_keys.json の「ア」と食い違う。主 context が source page-47 を 2.7 倍で実読し双方を確認 → S110 で是正済 (quiz-phase2-stemfix-S110)。" +
      "独立導出: 顧客コードは 6 桁だが 6 桁目はチェックディジット (上位 5 桁から従属) ゆえ自由採番は 10^5 = 100,000 件。ブランドM = その 5% = 5,000 件。M の 10% = 500 件は S にも重複登録され移行しない。S = 2,000 件 → 移行は 1,500 件。統合後 = 5,000 + 1,500 = **6,500 = ア**。" +
      "四肢がちょうど 2×2 の罠マトリクスになっている (ア=CD 考慮○/重複除外○ / イ=CD○・重複✗ / ウ=CD✗・重複○ / エ=両方✗) ため、stored「イ」は「重複を引き忘れた」典型的誤答であり、源からは正当化できない。解説は是正前から公式キー ア 前提で執筆済み。是正済のため解決 = suspect=false。",
  },
};

// q091 / q092: OCR flags cleared, but the 中問 linkage-gap is NOT fixed by any text edit
// → figure_derivable stays false so merge keeps them SUSPECT (honest record).
const RESOLVED_GAP = {
  [`${E}-q091`]: {
    figure_derivable: false, derived_answer: "イ", matches_key: true, stem_corruption_suspected: false,
    note_jp:
      "中問 (q089〜q092)。stem 是正後 (S110: source page-40、「月間499台」→「月間400台」・「2,090万円」→「2,000万円」、いずれも 0→9 の OCR で answer-affecting) は表示クリーン。" +
      "独立導出: 案A は表1 より固定費 1,400 万円/月・変動費 6 万円/台。400P −(1,400 + 6×400)≧ 2,000 → 400P ≧ 5,800 → P ≧ 14.5 万円 = 145,000 = **イ** で key と一致 (腐敗版だと 129,940 円となり最低の肢は ア になっていた)。zh/en の数値も追随是正済、解説末尾の stale OCR 注記は strip 済。" +
      "**figure_derivable=false は維持**: 計算に要る表1 は q089 のリード文にしかなく本問の配信エントリに未添付 (linkage-gap)。テキスト是正では解消しないため図/シナリオ再抽出 track の backlog。",
  },
  [`${E}-q092`]: {
    figure_derivable: false, derived_answer: "イ", matches_key: true, stem_corruption_suspected: false,
    note_jp:
      "中問 (q089〜q092)。stem 是正後 (S110: source page-40、〔月間利益計画〕(1) 「1台19万円」→「1台10万円」、0→9 の OCR で answer-affecting) は表示クリーン。" +
      "独立導出: 案B は固定費 2,000 万円/月・変動費 5 万円/台。5N − 2,000 ≧ 2,000 → N ≧ 800。売上高 = 10×800 = 8,000 万円、売上総利益 2,000 万円 → 率 = 2,000/8,000 = 25% = **イ** で key と一致 (腐敗版だと約 36.9% でどの肢にも着地しなかった)。zh/en も追随是正済、解説内の inline OCR 注記は除去済。" +
      "**figure_derivable=false は維持**: 案A/案B の原価前提 (表1) は q089 のリード文にあり本問の配信エントリに未添付 (linkage-gap)。図/シナリオ再抽出 track の backlog。",
  },
};

const grPath = P2(`generate_result_${E}.json`);
const gr = JSON.parse(readFileSync(grPath, "utf-8"));
let grChanged = false;
for (const [id, kg] of Object.entries({ ...RESOLVED, ...RESOLVED_GAP })) {
  const rec = gr.results.find((r) => r.id === id);
  if (!rec) throw new Error(`generate_result_${E}: ${id} not found`);
  if (JSON.stringify(rec.key_guard) === JSON.stringify(kg)) { console.log(`  ~ ${id} key_guard: already resolved, skip`); continue; }
  rec.key_guard = kg;
  grChanged = true;
  console.log(`  ✓ ${id} key_guard: resolved to post-fix reality (matches_key=${kg.matches_key}, figure_derivable=${kg.figure_derivable})`);
}
if (grChanged) writeFileSync(grPath, JSON.stringify(gr, null, 2) + "\n");

console.log(`✓ quiz-phase2-explfix-S110: ${changed} explanation field(s) + key_guard resolution`);
console.log(`  next: node scripts/quiz-phase2-verify-result.mjs ${E} && node scripts/quiz-phase2-merge.mjs ${E}`);
