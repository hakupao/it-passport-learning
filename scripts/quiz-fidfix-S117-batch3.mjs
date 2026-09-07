#!/usr/bin/env node
// Stage 6 / Quiz — S117 ① 本番 batch 3 (2016h28a / 2018h30a / 2019h31h / 2021r03) の保真核験差分を是正する。
// 源: S117 log §17 の 14 workflow (A = s7x 双 pass 50 問、B-note = 7 問)。差分 31 (双 pass 一致 30 + 片側 1: 2019h31h-q086 読点)。
// 層・方針は quiz-fidfix-S117-batch2.mjs と同じ (translations 再 merge 禁止 / explanations は .phase2 → 再 merge / note は差し替え文に token を含めず marker 冪等)。
// 見送りなし (2019h31h-q086 は clean/zh のみ: raw stem_jp は別の腐敗で表示層に出ないため触らない)。
// Run: node scripts/quiz-fidfix-S117-batch3.mjs [--dry-run] → node scripts/quiz-phase2-merge.mjs {2016h28a,2018h30a,2019h31h,2021r03}

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry-run");
const P = (...s) => path.join(ROOT, ...s);
const rj = (f) => JSON.parse(readFileSync(f, "utf-8"));
const wj = (f, d) => { if (!DRY) writeFileSync(f, JSON.stringify(d, null, 2) + "\n"); };
let applied = 0, skipped = 0; const log = [];

function sub(obj, key, from, to, where) {
  const s = obj?.[key];
  if (typeof s !== "string") { log.push(`  ⚠ ${where}: field ${key} missing`); return false; }
  if (to && to.includes(from) && s.includes(to)) { skipped++; return false; }
  const n = s.split(from).length - 1;
  if (n === 0) { skipped++; return false; }
  if (n > 1) throw new Error(`${where}: 「${from}」 occurs ${n}× — abort`);
  obj[key] = s.replace(from, to); applied++; log.push(`  ✓ ${where}: 「${from.slice(0, 36)}」→「${to.slice(0, 36)}」`); return true;
}

const FIX = {
  // 2016h28a
  "2016h28a-q013": { jp: [["エ", "業績比較を行う。ーー", "業績比較を行う。"]] },
  "2016h28a-q024": { jp: [["ア", "競争カレベル", "競争力レベル"], ["ア", "プロットする。MN", "プロットする。"]] },
  "2016h28a-q054": {
    jp: [["ウ", "情報処理の環境での管理", "情報処理の現場での管理"], ["ウ", "尺度としての基準を定めた", "尺度として用いるための基準を定めた"]],
    zh: [["ウ", "在判断信息处理环境中管理是否恰当时所使用的尺度标准", "在判断信息处理现场中的管理是否恰当时用作尺度的标准"]],
    en: [["ウ", "in an information processing environment.", "at information processing sites."]],
  },
  "2016h28a-q058": { jp: [["ア", "指標の一)", "指標の一つ"], ["ウ", "記憶装軒", "記憶装置"]] },
  "2016h28a-q060": { jp: [["イ", "などがある。             -", "などがある。"]] },
  "2016h28a-q073": {
    jp: [["ウ", "社内ネットワークから接続しようとするPC", "社内のネットワークに接続しようとするPC"], ["エ", "セキュリティが保護された部屋", "セキュリティで保護された部屋"]],
    zh: [["ウ", "试图从公司内部网络连接的PC感染病毒", "试图连接到公司内部网络的PC感染病毒"]],
    en: [["ウ", "attempting to connect from the internal company network", "attempting to connect to the internal company network"]],
  },
  "2016h28a-q082": { jp: [["stem", "と表示されるセルの数は幾つか。", "と表示されたセルの数は幾つか。"]] },
  // 2018h30a
  "2018h30a-q002": { jp: [["エ", "リピート", "リベート"]], zh: [["エ", "重复购买", "回扣（返利）"]], en: [["エ", "Repeat purchase", "Rebate"]] },
  "2018h30a-q019": { jp: [["ウ", "営業利益率は増加している。", "営業利益率も増加している。"]] },
  "2018h30a-q025": { jp: [["エ", "徒条していた", "徘徊していた"]] },
  "2018h30a-q062": { jp: [["ア", "鍵ペプア", "鍵ペア"]] },
  "2018h30a-q091": { jp: [["エ", "IEEE 892.11", "IEEE 802.11"]] },
  // 2019h31h
  "2019h31h-q013": { jp: [["stem", "1か月当たりのWebサイトへの来訪者は", "Webサイトへの毎月の来訪者は"]] },
  "2019h31h-q025": { jp: [["stem", "資本回転率が2回のとき", "資本回転率が2.0回のとき"]], zh: [["stem", "资本周转率为2次", "资本周转率为2.0次"]], en: [["stem", "capital turnover ratio is 2 times", "capital turnover ratio is 2.0 times"]] },
  "2019h31h-q035": { jp: [["ア", "広告  .を長期間", "広告を長期間"]] },
  "2019h31h-q068": { jp: [["stem", "脆弱性の評価が表のとおり", "脆弱性の評価値が表のとおり"], ["stem", "重み付けずに", "重み付けせずに"]], zh: [["stem", "威胁及脆弱性的评价如表所示", "威胁及脆弱性的评价值如表所示"]] },
  "2019h31h-q086": { jp: [["stem", "通信速度は [ a ]。 消費電力は [ b ]。", "通信速度は [ a ]，消費電力は [ b ]。"]], zh: [["stem", "通信速度 [ a ]。 功耗 [ b ]。", "通信速度 [ a ]，功耗 [ b ]。"]] },
  // 横断: 表示層走査で見つかった同族 (末尾の余剰長音記号、2016h28a-q013 と同型)
  "2020r02o-q035": { jp: [["ア", "ウォークスルーー", "ウォークスルー"]] },
  // 2021r03
  "2021r03-q046": { jp: [["エ", "障害の度回時間", "障害の復旧時間"]] },
  "2021r03-q095": { jp: [["イ", "商品A，商品B，商品D", "商品A，商品B，商品C，商品D"]], zh: [["イ", "商品A，商品B，商品D", "商品A，商品B，商品C，商品D"]], en: [["イ", "Product A, Product B, Product D", "Product A, Product B, Product C, Product D"]] },
  "2021r03-q099": {
    jp: [["ア", "リスクの対応策を分類", "リスクへの対応策を分類"], ["ウ", "リスク分析において、リスクの評価方法", "リスク評価において、リスクの評価方法"], ["エ", "客観的な数値で示す手法", "客観的な数値で表す手法"]],
    zh: [["ウ", "这是在风险分析中对风险的评价方法所做的分类", "这是在风险评价中对风险的评价方法所做的分类"]],
    en: [["ウ", "a classification of risk evaluation methods in risk analysis;", "a classification of risk evaluation methods in risk evaluation;"]],
  },
};

const EXPL = {
  "2018h30a-q002": { distractors: { "エ": {
    jp: "リベート（割戻し・販売奨励金）は、一定期間の取引実績に応じて販売代金の一部を後から払い戻す販売促進策であり、価格・取引条件に関わる概念である。競合他社製品との差別化ポイントを明確にする活動とは無関係である。",
    zh: "回扣（返利、销售奖励金）是按一定期间的交易实绩，事后返还部分货款的促销手段，属于价格与交易条件层面的概念。它与明确相对于竞争对手产品的差异化着眼点的活动无关。",
    en: "A rebate (a refund or sales incentive) is a sales-promotion measure that returns part of the purchase price afterwards according to the transaction volume over a period; it is a concept about price and trading terms. It has nothing to do with clarifying the points of differentiation from competitors' products." } } },
  "2021r03-q095": { distractors: { "イ": {
    jp: "商品Bと商品Cは正しいが、商品Aと商品Dを含めている点が誤り。商品Aは5月分18,000円で20,000円未満。商品Dは5月の売上日が無く (唯一の売上は4/30で4月) 集計対象0円。売上日で絞らず、または配達日 (5/2) と取り違えると商品Dを含めてしまう典型的な誤り。",
    zh: "商品B和商品C是正确的，但把商品A和商品D也包含进来是错误的。商品A的5月部分为18,000日元，不足20,000日元。商品D没有5月的销售日（唯一的一笔销售是4/30，属于4月），合计对象为0日元。不按销售日筛选，或者把它与送货日（5/2）弄混，就会把商品D包含进来，这是典型的错误。",
    en: "Product B and Product C are correct, but including Product A and Product D is wrong. Product A's May portion is 18,000 yen, less than 20,000 yen. Product D has no sales date in May (its only sale is 4/30, which is April), so its aggregated amount is 0 yen. Not filtering by sales date, or confusing it with the delivery date (5/2), leads to the typical mistake of including Product D." } } },
  "2018h30a-q062": { distSub: { "ア": { jp: [[" (なお本選択肢の「鍵ペプア」は「鍵ペア」の OCR 誤字)", ""]], zh: [["(另外，本选项日文原文中的「鍵ペプア」是「鍵ペア」即密钥对的 OCR 误字)", ""]], en: [[" (Note: the original Japanese choice contains an OCR typo, 「鍵ペプア」 for 「鍵ペア」, i.e. key pair.)", ""]] } } },
  "2018h30a-q091": { distSub: { "エ": { jp: [["なお選択肢原文の「892.11」は「802.11」の OCR 誤りだが、いずれにせよ無線 LAN の相互接続認定を指す説明で WAN の定義ではない。", ""]], zh: [["另外，选项原文中的「892.11」是「802.11」的 OCR 误识，但无论如何它都是指无线 LAN 互操作性认定的说明，并非 WAN 的定义。", ""]], en: [[" Note that 「892.11」in the original choice text is an OCR error for 「802.11」, but in any case it is a description referring to wireless LAN interoperability certification, not the definition of a WAN.", ""]] } } },
  "2021r03-q046": { distSub: { "エ": { jp: [["「障害の復旧時間」(原文「度回時間」は復旧時間の OCR 腐敗) は、", "「障害の復旧時間」は、"]] } } },
  "2016h28a-q054": { distSub: { "ウ": { jp: [["情報処理環境での管理の適切性", "情報処理の現場での管理の適切性"]], zh: [["在判断信息处理环境中管理是否恰当时", "在判断信息处理现场中的管理是否恰当时"]], en: [["in an information processing environment also refer", "at information processing sites also refer"]] } } },
  "2016h28a-q073": { distSub: { "ウ": { jp: [["社内ネットワークから接続しようとする PC", "社内のネットワークに接続しようとする PC"]], zh: [["试图从公司内部网络连接的PC感染病毒", "试图连接到公司内部网络的PC感染病毒"]], en: [["attempting to connect from the internal company network", "attempting to connect to the internal company network"]] }, "エ": { jp: [["セキュリティが保護された部屋", "セキュリティで保護された部屋"]] } } },
  "2021r03-q099": { distSub: { "ウ": { jp: [["4語は「リスク分析」で評価方法を分類したものではなく", "4語は「リスク評価」で評価方法を分類したものではなく"]], zh: [["不是在「风险分析」中对评价方法所做的分类", "不是在「风险评价」中对评价方法所做的分类"]], en: [["not a classification of evaluation methods in “risk analysis,”", "not a classification of evaluation methods in “risk evaluation,”"]] }, "エ": { jp: [["脆弱性を客観的な数値で示す手法", "脆弱性を客観的な数値で表す手法"]] } } },
};

const MARK = "fidfix-S117-batch3";
const pg = (id) => { const b = rj(P("data/ip/exams/question_bank.json")).questions.find((q) => q.id === id); return `page-${String(b.source.page_number).padStart(2, "0")}`; }; // page 番号は source から機械的に取る (batch2b の教訓)
const NOTE_SENT = {
  "2016h28a-q013": { match: /ーー/, replace: (p) => `選択肢エ末尾の余剰長音記号は S117 に ${p} 実読 (双 pass 一致) で除去済 (${MARK})` },
  "2016h28a-q024": { match: /MN|競争カ/, replace: (p) => `選択肢アの末尾ノイズ「MN」と「競争力」のカタカナ同形字は S117 に ${p} 実読 (双 pass 一致) で是正済 (${MARK})` },
  "2016h28a-q058": { match: /指標の一\)|装軒/, replace: (p) => `選択肢ア・ウ末尾の字形誤り (「一つ」「記憶装置」) は S117 に ${p} 実読 (双 pass 一致) で是正済 (${MARK})` },
  "2016h28a-q060": { match: /末尾の「-」/, replace: (p) => `正解肢イ末尾のスキャン汚れ由来の記号は S117 に ${p} 実読 (双 pass 一致) で除去済 (${MARK})` },
  "2018h30a-q025": { match: /徒条/, replace: (p) => `正解肢エ「徘徊」の字形誤りは S117 に ${p} 実読 (双 pass 一致) で是正済 (${MARK})` },
  "2018h30a-q062": { match: /ペプア/, replace: (p) => `選択肢ア「鍵ペア」の混入字は S117 に ${p} 実読 (双 pass 一致) で是正済 (${MARK})` },
  "2018h30a-q091": { match: /892/, replace: (p) => `選択肢エの規格番号の字形誤り (0→9) は S117 に ${p} 実読 (双 pass 一致) で IEEE 802.11 に是正済 (${MARK})` },
  "2019h31h-q035": { match: /広告  \./, replace: (p) => `選択肢アに混入していたスキャン汚れ由来の記号は S117 に ${p} 実読 (双 pass 一致) で除去済 (${MARK})` },
};
// 2021r03-q095: 腐敗を述べた 2 文 (「配信 JSON の…脱落」「正しい文言の推定…」) を 1 文に差し替え
const NOTE_MULTI = { "2021r03-q095": { matches: [/商品C が脱落/, /正しい文言の推定/], replace: (p) => `選択肢イの「商品C」脱落は S117 に ${p} 実読 (双 pass 一致) で jp/zh/en とも是正済 (${MARK})` } };

// ── 適用 ──────────────────────────────────────────────────────────────────────
const exams = [...new Set(Object.keys(FIX).map((id) => id.split("-q")[0]))];
const Qdoc = rj(P("data/ip/quiz/questions.json")); const Bdoc = rj(P("data/ip/exams/question_bank.json")); const Barr = Bdoc.questions ?? Bdoc;
const BY = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/exams/by_year", `${e}.json`))]));
const TR = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/quiz/translations", `${e}.json`))]));
const GR = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`))]));

for (const [id, fx] of Object.entries(FIX)) {
  const exam = id.split("-q")[0];
  const q = Qdoc.questions.find((x) => x.id === id), b = Barr.find((x) => x.id === id), y = BY[exam].questions.find((x) => x.id === id), t = TR[exam].questions[id];
  const t1f = P("data/ip/quiz/.phase1", `tr_${id}.json`); const t1 = existsSync(t1f) ? rj(t1f) : null;
  for (const [field, from, to] of fx.jp ?? []) {
    if (field === "stem") {
      for (const [o, w] of [[q, "questions.stem_jp"], [b, "question_bank.stem_jp"], [y, "by_year.stem_jp"]]) sub(o, "stem_jp", from, to, `${id} ${w}`);
      if (t?.stem_jp_clean) sub(t, "stem_jp_clean", from, to, `${id} translations.stem_jp_clean`);
      if (t1?.stem_jp_clean) sub(t1, "stem_jp_clean", from, to, `${id} .phase1 tr_.stem_jp_clean`);
    } else for (const [o, w] of [[q, "questions"], [b, "question_bank"], [y, "by_year"]]) sub(o.choices_jp, field, from, to, `${id} ${w}.choices_jp.${field}`);
  }
  for (const lang of ["zh", "en"]) for (const [field, from, to] of fx[lang] ?? []) {
    if (field === "stem") { sub(t.stem, lang, from, to, `${id} translations.stem.${lang}`); if (t1) sub(t1.stem, lang, from, to, `${id} .phase1 tr_.stem.${lang}`); }
    else { sub(t.choices[field], lang, from, to, `${id} translations.choices.${field}.${lang}`); if (t1) sub(t1.choices.find((c) => c.letter === field), lang, from, to, `${id} .phase1 tr_.choices.${field}.${lang}`); }
  }
  if (t1) wj(t1f, t1);
}
wj(P("data/ip/quiz/questions.json"), Qdoc); wj(P("data/ip/exams/question_bank.json"), Bdoc);
for (const e of exams) { wj(P("data/ip/exams/by_year", `${e}.json`), BY[e]); wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]); }

for (const [id, ex] of Object.entries(EXPL)) {
  const jf = P("data/ip/quiz/.phase2", `expl_jp_${id}.json`), tf = P("data/ip/quiz/.phase2", `expl_tr_${id}.json`); const j = rj(jf), tr = rj(tf);
  for (const [L, d] of Object.entries(ex.distractors ?? {})) { const dj = j.distractors_jp.find((x) => x.letter === L), dt = tr.distractors.find((x) => x.letter === L);
    if (dj.why_wrong_jp !== d.jp) { dj.why_wrong_jp = d.jp; applied++; log.push(`  ✓ ${id} expl_jp.${L}: rewritten`); } else skipped++;
    if (dt.zh !== d.zh || dt.en !== d.en) { dt.zh = d.zh; dt.en = d.en; applied++; log.push(`  ✓ ${id} expl_tr.${L}: rewritten`); } else skipped++; }
  for (const [L, d] of Object.entries(ex.distSub ?? {})) { const dj = j.distractors_jp.find((x) => x.letter === L), dt = tr.distractors.find((x) => x.letter === L);
    for (const [f, t] of d.jp ?? []) sub(dj, "why_wrong_jp", f, t, `${id} expl_jp.${L}`); for (const [f, t] of d.zh ?? []) sub(dt, "zh", f, t, `${id} expl_tr.${L}.zh`); for (const [f, t] of d.en ?? []) sub(dt, "en", f, t, `${id} expl_tr.${L}.en`); }
  wj(jf, j); wj(tf, tr);
}

for (const [id, nf] of Object.entries(NOTE_SENT)) {
  const exam = id.split("-q")[0]; const r = GR[exam].results.find((x) => x.id === id); if (!r?.key_guard) throw new Error(id);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  const sents = r.key_guard.note_jp.split("。"); const idx = sents.findIndex((s) => nf.match.test(s));
  if (idx < 0) { log.push(`  ⚠ ${id}: note sentence not found`); skipped++; continue; }
  sents.splice(idx, 1, nf.replace(pg(id))); r.key_guard.note_jp = sents.join("。").replace(/。。/g, "。"); applied++; log.push(`  ✓ ${id} final note: 1 文差し替え (${pg(id)}, round1 untouched)`);
}
for (const [id, nf] of Object.entries(NOTE_MULTI)) {
  const exam = id.split("-q")[0]; const r = GR[exam].results.find((x) => x.id === id);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  let sents = r.key_guard.note_jp.split("。"); const idxs = nf.matches.map((m) => sents.findIndex((s) => m.test(s))).filter((i) => i >= 0).sort((a, b) => a - b);
  if (!idxs.length) { log.push(`  ⚠ ${id}: note sentences not found`); skipped++; continue; }
  sents = sents.filter((_, i) => !idxs.includes(i)); sents.splice(idxs[0], 0, nf.replace(pg(id)));
  r.key_guard.note_jp = sents.join("。").replace(/。。/g, "。"); applied++; log.push(`  ✓ ${id} final note: ${idxs.length} 文を 1 文に差し替え (${pg(id)}, round1 untouched)`);
}
// Rule D 審閲 MAJOR-1: 2021r03-q095 の final note に「腐敗を検出」「stem_corruption_suspected=true とし人間の是正契機」の 2 文が
// 現在形で残り、直前の「是正済」文と矛盾していた。marker 冪等の後段として、該当 2 文を無条件に除去する (除去後は match しないので冪等)。
const NOTE_PRUNE = { "2021r03-q095": [/図照合を拡張すると腐敗を検出/, /stem_corruption_suspected=true とし人間の是正契機/] };
for (const [id, pats] of Object.entries(NOTE_PRUNE)) {
  const r = GR[id.split("-q")[0]].results.find((x) => x.id === id);
  const before = r.key_guard.note_jp.split("。"); const after = before.filter((s) => !pats.some((p) => p.test(s)));
  if (after.length === before.length) { skipped++; continue; }
  r.key_guard.note_jp = after.join("。").replace(/。。/g, "。"); applied++; log.push(`  ✓ ${id} final note: 矛盾 ${before.length - after.length} 文を除去 (round1 untouched)`);
}
// D-143 §3: final の boolean は是正後の真の値へ (Rule D 審閲 MAJOR-1)。2021r03-q095 は選択肢イの商品C 脱落を理由に final で
// stem_corruption_suspected=true が立っていたが、本 batch で選択肢を是正したため false に戻す (round1 は不変)。
const BOOL = { "2021r03-q095": { stem_corruption_suspected: false } };
for (const [id, b] of Object.entries(BOOL)) {
  const r = GR[id.split("-q")[0]].results.find((x) => x.id === id);
  for (const [k, v] of Object.entries(b)) { if (r.key_guard[k] === v) { skipped++; continue; } r.key_guard[k] = v; applied++; log.push(`  ✓ ${id} final key_guard.${k} → ${v} (round1 untouched)`); }
}
for (const e of exams) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);

console.log(log.join("\n"));
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S117-batch3: applied ${applied}, skipped ${skipped}`);
