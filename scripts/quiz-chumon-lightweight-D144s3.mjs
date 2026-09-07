#!/usr/bin/env node
// Stage 6 / Quiz — D-144 段 3(i) (S117): 中問 linkage-gap の **軽量組** を決定的に埋める。
//  B) 共有前文が同組の別設問の clean stem に既在する場合、その設問から前文ブロックを切り出して他メンバーに前置する (jp/zh/en)。
//     切り出しは「先頭〜設問固有文の直前」で、境界は設問ごとに固定文字列 (CUT) で与える (源ページ実読で確認済)。
//     分野見出し (〔マネジメント〕/〔管理〕/[Management] 等) は D-141 に従い埋め込まない。冪等: D-141 apply と同じく前文先頭 40 字の有無で判定。
//  A) 参照する 図N/表N が groups.json (D-120) の共有図として存在する場合、その PNG をメンバーの figure として挂ける (別脚本 -figs)。
// Run: node scripts/quiz-chumon-lightweight-D144s3.mjs [--dry-run]
import { readFileSync, writeFileSync } from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); const DRY = process.argv.includes("--dry-run");
const rj = (f) => JSON.parse(readFileSync(f, "utf-8")); const wj = (f, d) => { if (!DRY) writeFileSync(f, JSON.stringify(d, null, 2) + "\n"); };
const nsp = (s) => s.replace(/\s+/g, "");
const bank = new Map(rj(path.join(ROOT, "data/ip/exams/question_bank.json")).questions.map((q) => [q.id, q]));

// source: 前文を持つ設問 / cut: 各言語で「設問固有文」の開頭 (この直前までを前文とする) / strip: 先頭の分野見出し行 / targets: 前置先
const COPY = [
  { source: "2011h23a-q093", targets: ["2011h23a-q094", "2011h23a-q095", "2011h23a-q096"],
    cut: { jp: "〔A さんが書き出したメモ〕の(1)〜(5)を実施する順番", zh: "将〔A 先生记下的备忘录〕中的 (1)〜(5)", en: "When items (1) to (5) in [the memo Mr. A wrote out]" }, // memo-markers 是正後の表記 (①〜⑤ → (1)〜(5))
    strip: { jp: /^〔マネジメント〕\s*/, zh: /^〔管理〕\s*/, en: /^\[Management\]\s*/ } },
  { source: "2012h24a-q098", targets: ["2012h24a-q097", "2012h24a-q099"], // q099 は ASCII 括弧 [会員登録をする Web ページの仕組み] で参照 (スキャナが見落とした型)
    cut: { jp: "次に示す〔個人情報の適正管理に関する規程〕", zh: "对于下面所示〔关于个人信息妥善管理的规程〕", en: "For each clause of the following [Regulations" },
    strip: {} },
  // 第 2 弾 (探索 agent の棚卸しで判明した (a) 型、S117 §28)
  { source: "2011h23a-q089", targets: ["2011h23a-q090", "2011h23a-q091", "2011h23a-q092"],
    cut: { jp: "問 89 画素データを圧縮せずに出力した場合", zh: "问 89 在不压缩像素数据直接输出的情况下", en: "Q89 When the pixel data is output without compression" },
    strip: { jp: /^中問A[^\n]*\n\s*/, zh: /^中题A[^\n]*\n\s*/, en: /^Group Question A[^\n]*\n\s*/ } },
  { source: "2014h26h-q089", targets: ["2014h26h-q090", "2014h26h-q091", "2014h26h-q092"],
    cut: { jp: "案Aと案Bのどちらで製品Hの製造原価が低くなるのかは", zh: "对于产品 H，方案 A 与方案 B 中哪一个的制造成本更低", en: "Which of plan A or plan B yields a lower manufacturing cost" },
    strip: {} },
  // apply の probe (前文先頭 40 字) が q086 自身の本文に命中して skip された分 (Rule D 3(ii) ③) → 同組の q085 から複製
  { source: "2014h26a-q085", targets: ["2014h26a-q086"],
    cut: { jp: "Xソフトの開発が終了する日は", zh: "X 软件的开发结束日", en: "On which day, counting from the start" }, strip: {} },
  // section 型: source の stem の **末尾にある** 〔…〕節 (見出し行〜末尾) を前文として使う (2013h25a-q097 の〔要望事項〕 → q099 が【要望事項】と参照)
  { source: "2013h25a-q097", targets: ["2013h25a-q099"], section: { jp: "〔要望事項〕", zh: "〔需求事项〕", en: "[Requirements]" }, strip: {} },
];
let applied = 0, skipped = 0;
for (const c of COPY) {
  const exam = c.source.split("-q")[0]; const trf = path.join(ROOT, "data/ip/quiz/translations", `${exam}.json`); const doc = rj(trf);
  const src = doc.questions[c.source]; if (!src?.stem_jp_clean) throw new Error(`${c.source}: no stem_jp_clean`);
  const pre = {};
  for (const [lang, text] of [["jp", src.stem_jp_clean], ["zh", src.stem.zh], ["en", src.stem.en]]) {
    let p;
    if (c.section) { const i = text.indexOf(c.section[lang]); if (i < 0) throw new Error(`${c.source} ${lang}: section header not found`); p = text.slice(i).trim(); }
    else { const i = text.indexOf(c.cut[lang]); if (i < 0) throw new Error(`${c.source} ${lang}: cut marker not found`); p = text.slice(0, i).trimEnd(); }
    if (c.strip[lang]) p = p.replace(c.strip[lang], "").trimStart();
    if (p.length < 80) throw new Error(`${c.source} ${lang}: preamble too short (${p.length})`);
    pre[lang] = p;
  }
  const probe = nsp(pre.jp).slice(0, 40);
  for (const id of c.targets) {
    const t = doc.questions[id]; if (!t?.stem?.zh || !t?.stem?.en) throw new Error(`${id}: no tr stem`);
    if (!t.stem_jp_clean) { const b = bank.get(id); if (!b?.stem_jp) throw new Error(`${id}: no raw stem`); t.stem_jp_clean = b.stem_jp; console.log(`  ${id}: clean 新設 (raw を種に)`); }
    if (nsp(t.stem_jp_clean).includes(probe)) { skipped++; console.log(`  = ${id}: 既に前文あり`); continue; }
    // 前置先の先頭にある分野見出し (〔マネジメント〕等) は前文の後ろに残すと不自然なので落とす (D-141: 分野見出しは埋め込まない)
    const CAT = { jp: /^〔(ストラテジ|マネジメント|テクノロジ)〕\s*(問\d+\s*)?/, zh: /^〔(战略|管理|技术)〕\s*(问\s*\d+\s*)?/, en: /^\[(Strategy|Management|Technology)\]\s*(Q\d+\s*)?/ };
    const body = { jp: t.stem_jp_clean.trimStart().replace(CAT.jp, ""), zh: t.stem.zh.trimStart().replace(CAT.zh, ""), en: t.stem.en.trimStart().replace(CAT.en, "") };
    t.stem_jp_clean = `${pre.jp}\n\n${body.jp}`; t.stem.zh = `${pre.zh}\n\n${body.zh}`; t.stem.en = `${pre.en}\n\n${body.en}`;
    applied++; console.log(`  ✓ ${id}: ${c.source} の前文 (jp ${pre.jp.length} 字 / zh ${pre.zh.length} / en ${pre.en.length}) を前置`);
  }
  wj(trf, doc);
}
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-chumon-lightweight-D144s3: 前置 ${applied} 問 / skip ${skipped}`);
