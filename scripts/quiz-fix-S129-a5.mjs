#!/usr/bin/env node
// Stage 6 / Quiz — S129 A5 unit: A3 (quiz-fix-S128-a3) の後続是正。A3 Rule D の MINOR / NIT と B3 ⑨ (evidence/quiz_A3_S128.md §10、evidence/quiz_B3_2014h26a_S128.md §4e)。
//
//   1. explanations (表示 field のみ) の D-157 / D-159 追随
//        D-157: 見出しの引用を stem と同じ 〔〕 に (jp 2 + zh 1)。旧字形の残りは key_guard.note_jp (非表示・D-143 で round1 不可触) だけなので触らない
//        D-159: 負数リテラルの負号を U+2212 に (jp / zh / en)。減算子・項目番号のハイフン (2012h24h-q085「価格-1」)・指数 (10^-9) は除外
//   2. 2023r05-q060 zh [程序] / 2022r04-q096 ［プログラム1/2］→ 源 (p28 / p43) どおり 〔プログラム〕 / 〔プログラム 1〕 (D-155 / D-157)
//   3. D-158 漏れ: 源に無い図ラベル行を削除 (2014h26a-q031/q042/q048 + 同型 7 題。全 10 題とも源 page 原寸で確認)
//   4. 2014h26a-q094 expl zh: 式の引用 〔…〕 を stem zh と同じ “…” 形 (演算子 ASCII、D-162) に
//   5. 2014h26h-q085 zh / en 設問文の誤訳 (「運用管理部門，販売部門から受領したデータ」= 両部門から受領) と jp 設問文の ASCII 読点 (源 p34 は「，」)。A4 の前文は不触
//   6. en の図表キャプション「Figure 1　」「Table 1　」「Fig. 3　」の全角空白 → ASCII 空白
//   7. 2011h23tokubetsu-q094 決定表のセル「–」(U+2013) を注記2・選択肢と同じ「－」に (源 p37 は同一記号)、expl jp の記号「−」も「－」に。
//      2021r03-q070 expl en の 「Author ← Book」 型 (ER の表記、コードではない) を “” に (D-156。2009h21a-q099 と揃える)
//   8. raw hygiene (不可視): 2012h24h-q005 stem_jp 4,800→4,000 (源 p03)、2022r04-q096 stem_jp「関数calcXをcalcY(1)」→「関数calcYを」(源 p43)
//   D-159 表示層の残り: 2015h27h-q085〜q088 前文 “－1” (源 p32「“−1”」退室) → U+2212
//
// 層・方針は quiz-fix-S128-a3 と同じ (sidecar 厳密 n / .phase1 max n / raw は崩れていない同文字列のみ / expl は .phase2 が真相源 → phase2-merge)。
// correct_answer は触らない (末尾で全 2900 題の不変を assert)。
//
// Run: node scripts/quiz-fix-S129-a5.mjs            (dry-run)
//      node scripts/quiz-fix-S129-a5.mjs --apply
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs <exam>   (expl を変えた exam ごと、末尾に表示)
//   → node scripts/quiz-chumon-groups-build.mjs
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = !process.argv.includes("--apply") || process.argv.includes("--dry-run");
const P = (...s) => path.join(ROOT, ...s);
const LOADED = new Map(), EOL = new Map();
const rj = (f) => { const raw = readFileSync(f, "utf-8"); const d = JSON.parse(raw); LOADED.set(f, JSON.stringify(d, null, 2)); EOL.set(f, raw.endsWith("\n") ? "\n" : ""); return d; };
const written = [];
const wj = (f, d) => {
  const next = JSON.stringify(d, null, 2);
  if (LOADED.get(f) === next) return;
  written.push(path.relative(ROOT, f));
  if (!DRY) writeFileSync(f, next + EOL.get(f));
};
const count = {}; let skipped = 0; const log = [];
const bump = (d, k) => { count[d] = (count[d] ?? 0) + k; };

// rep: from を全置換。k=0 → skip (冪等)。n 指定時は k===n、max 指定時は k<=max を要求。
function rep(obj, key, from, to, where, d, { n, max } = {}) {
  const s = obj?.[key];
  if (typeof s !== "string") return 0;
  const k = s.split(from).length - 1;
  if (k === 0) { skipped++; return 0; }
  if (n !== undefined && k !== n) throw new Error(`${where}: 「${from}」 occurs ${k}× (expected ${n}) — abort`);
  if (max !== undefined && k > max) throw new Error(`${where}: 「${from}」 occurs ${k}× (max ${max}) — abort`);
  obj[key] = s.split(from).join(to); bump(d, k); log.push(`  ✓ ${d} ${where}: 「${from.slice(0, 40)}」→「${to.slice(0, 40)}」 ×${k}`); return k;
}
// ラベル行の削除: 単独行として 1 回だけ現れることを要求。前後が空行なら空行を 1 つに詰める。
function delLine(obj, key, label, where, d) {
  const s = obj?.[key];
  if (typeof s !== "string" || !s.split("\n").includes(label)) { skipped++; return 0; }
  const L = s.split("\n"); const idx = L.reduce((a, x, i) => (x === label ? [...a, i] : a), []);
  if (idx.length !== 1) throw new Error(`${where}: ラベル「${label}」が単独行として ${idx.length} 回 — abort`);
  const i = idx[0]; L.splice(i, 1);
  if (i > 0 && L[i - 1] === "" && L[i] === "") L.splice(i, 1);
  obj[key] = L.join("\n"); bump(d, 1); log.push(`  ✓ ${d} ${where}: 行「${label}」を削除`); return 1;
}

// ── データ読込 ──────────────────────────────────────────────────────────────
const Qdoc = rj(P("data/ip/quiz/questions.json")); const Bdoc = rj(P("data/ip/exams/question_bank.json")); const Barr = Bdoc.questions;
const ANS0 = new Map(Qdoc.questions.map((q) => [q.id, q.correct_answer]));
const EXAMS = readdirSync(P("data/ip/quiz/translations")).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort();
const BY = {}, TR = {}, T1 = new Map(), XJ = new Map(), XT = new Map();
const by = (e) => (BY[e] ??= rj(P("data/ip/exams/by_year", `${e}.json`)));
const tr = (e) => (TR[e] ??= rj(P("data/ip/quiz/translations", `${e}.json`)));
const p1 = (id) => { if (!T1.has(id)) { const f = P("data/ip/quiz/.phase1", `tr_${id}.json`); T1.set(id, { f, d: existsSync(f) ? rj(f) : null }); } return T1.get(id).d; };
const xj = (id) => { if (!XJ.has(id)) { const f = P("data/ip/quiz/.phase2", `expl_jp_${id}.json`); XJ.set(id, { f, d: rj(f) }); } return XJ.get(id).d; };
const xt = (id) => { if (!XT.has(id)) { const f = P("data/ip/quiz/.phase2", `expl_tr_${id}.json`); XT.set(id, { f, d: rj(f) }); } return XT.get(id).d; };
const ex = (id) => id.split("-q")[0];
const raws = (id) => [[Qdoc.questions.find((x) => x.id === id), "questions"], [Barr.find((x) => x.id === id), "question_bank"], [by(ex(id)).questions.find((x) => x.id === id), "by_year"]];
const t = (id) => { const v = tr(ex(id)).questions[id]; if (!v) throw new Error(`${id}: translations に無い`); return v; };

// stem 層の置換。layer = clean (sidecar 厳密 n + .phase1 max n) / raw (3 層、max n: 崩れた raw は 0 で skip) / zh / en
function apply(d, id, layer, field, from, to, n = 1) {
  const T = t(id), T1d = p1(id);
  if (layer === "clean") {
    rep(T, "stem_jp_clean", from, to, `${id} translations.stem_jp_clean`, d, { n });
    if (T1d) rep(T1d, "stem_jp_clean", from, to, `${id} .phase1.stem_jp_clean`, d, { max: n });
  } else if (layer === "raw") {
    for (const [o, w] of raws(id)) field === "stem" ? rep(o, "stem_jp", from, to, `${id} ${w}.stem_jp`, d, { max: n }) : rep(o.choices_jp, field, from, to, `${id} ${w}.choices_jp.${field}`, d, { max: n });
  } else if (field === "stem") {
    rep(T.stem, layer, from, to, `${id} translations.stem.${layer}`, d, { n });
    if (T1d?.stem) rep(T1d.stem, layer, from, to, `${id} .phase1.stem.${layer}`, d, { max: n });
  } else {
    rep(T.choices[field], layer, from, to, `${id} translations.choices.${field}.${layer}`, d, { n });
    const c1 = T1d?.choices?.find((c) => c.letter === field); if (c1) rep(c1, layer, from, to, `${id} .phase1.choices.${field}.${layer}`, d, { max: n });
  }
}

// explanations の表示 field ([obj, key] の列)。key_guard (note_jp) は非表示なので対象外。
function explFields(id, lang) {
  if (lang === "jp") { const j = xj(id); return [[j, "correct_jp"], ...j.distractors_jp.map((x) => [x, "why_wrong_jp"]), ...j.points_jp.map((_, i) => [j.points_jp, i])]; }
  const x = xt(id); return [[x.correct, lang], ...x.distractors.map((o) => [o, lang]), ...x.points.map((o) => [o, lang])];
}
// 表示 field 全体での出現総数が n であることを要求して置換 (0 なら skip = 冪等)。from は文字列か RegExp (g)。
function explRep(d, id, lang, from, to, n) {
  const F = explFields(id, lang);
  const cnt = (s) => (typeof from === "string" ? s.split(from).length - 1 : (s.match(from) ?? []).length);
  const k = F.reduce((a, [o, key]) => a + cnt(o[key]), 0);
  if (k === 0) { skipped++; return; }
  if (k !== n) throw new Error(`${id} expl.${lang}: 「${from}」 occurs ${k}× (expected ${n}) — abort`);
  for (const [o, key] of F) o[key] = typeof from === "string" ? o[key].split(from).join(to) : o[key].replace(from, to);
  bump(d, k); log.push(`  ✓ ${d} ${id} expl.${lang}: 「${from}」→「${to}」 ×${k}`);
}

// ── 1. explanations D-157 ─────────────────────────────────────────────────
explRep("1-D157", "2011h23tokubetsu-q090", "jp", "[RFP の概要]", "〔RFP の概要〕", 1);
explRep("1-D157", "2011h23tokubetsu-q090", "jp", "[X 社からの提案]", "〔X 社からの提案〕", 1);
explRep("1-D157", "2012h24a-q090", "zh", "[系统导入研讨会备忘录]", "〔系统导入研讨会备忘录〕", 1);

// ── 1. explanations D-159 (負数リテラルのみ。n は表示 field 全体の総数) ──────
const M = "−";
const NEG_FW = /－(?=[0-9])/g;
const E159 = [
  // A3 是正題の引用 (2011h23tokubetsu 中問B / 2009h21h-q007)。q093 の －n はすべて負数 (L＝－1・J＝－30・J＝－5)
  ["2011h23tokubetsu-q093", "jp", NEG_FW, M, 8], ["2011h23tokubetsu-q093", "zh", NEG_FW, M, 8], ["2011h23tokubetsu-q093", "en", NEG_FW, M, 8],
  ["2011h23tokubetsu-q094", "zh", NEG_FW, M, 9], ["2011h23tokubetsu-q094", "en", NEG_FW, M, 9], // jp は既に U+2212。「＝－」の記号は数字が続かないので不触
  ["2009h21h-q007", "jp", "-10", `${M}10`, 5], ["2009h21h-q007", "zh", "-10", `${M}10`, 5], ["2009h21h-q007", "en", "-10", `${M}10`, 5], // 「16+4-2」の減算は不触
  // 同じ規則の他題 (解説自身の計算の負数)。8－10 / 650-700 の減算子は不触
  ["2012h24h-q100", "jp", "－10〜－1", `${M}10〜${M}1`, 1], ["2012h24h-q100", "jp", "=－2", `=${M}2`, 1],
  ["2012h24h-q100", "zh", "－10～－1", `${M}10～${M}1`, 1], ["2012h24h-q100", "zh", "=－2", `=${M}2`, 1],
  ["2012h24h-q100", "en", "between －10 and －1", `between ${M}10 and ${M}1`, 1], ["2012h24h-q100", "en", "=－2", `=${M}2`, 1],
  ["2010h22h-q021", "jp", "-50", `${M}50`, 3], ["2010h22h-q021", "zh", "-50", `${M}50`, 3], ["2010h22h-q021", "en", "-50", `${M}50`, 3],
  ["2010h22h-q082", "en", "and -1 do", `and ${M}1 do`, 1], // jp / zh は既に「−1」
  ["2011h23a-q092", "en", "-17", `${M}17`, 2], // jp / zh は既に「−17」
  ["2015h27h-q087", "jp", "-1", `${M}1`, 3], ["2015h27h-q087", "zh", "-1", `${M}1`, 3], ["2015h27h-q087", "en", "-1", `${M}1`, 3], // 退室 “−1” (源 p32)
];
for (const [id, lang, from, to, n] of E159) explRep("1-D159", id, lang, from, to, n);

// ── 2. 擬似言語の見出し (源 2023r05 p28「〔プログラム〕」/ 2022r04 p43「〔プログラム 1〕」「〔プログラム 2〕」) ─────
apply("2-heading", "2023r05-q060", "zh", "stem", "[程序]", "〔程序〕");
for (const k of ["1", "2"]) {
  apply("2-heading", "2022r04-q096", "clean", "stem", `［プログラム${k}］`, `〔プログラム ${k}〕`);
  apply("2-heading", "2022r04-q096", "raw", "stem", `［プログラム${k}］`, `〔プログラム ${k}〕`);
  apply("2-heading", "2022r04-q096", "zh", "stem", `［程序 ${k}］`, `〔程序 ${k}〕`);
}

// ── 3. D-158 漏れ: 源に無い図ラベル行 (源 page: 2014h26a p12/p17/p19、2009h21h p15/p37、2014h26h p27、2016h28a p28、2016h28h p05、2022r04 p41/p44) ─────
const D158 = {
  "2014h26a-q031": { clean: "［図］", zh: "［图］", en: "[Figure]" },
  "2014h26a-q042": { clean: "［図］", zh: "［图］", en: "[Figure]" },
  "2014h26a-q048": { clean: "[図] 処理方式の分類（ツリー）:", zh: "[图] 处理方式的分类（树状）:", en: "[Figure] Classification of processing methods (tree):" },
  "2009h21h-q037": { clean: "［図］アローダイアグラム", zh: "［图］箭线图", en: "[Figure] Arrow Diagram" },
  "2009h21h-q092": { clean: "[図] 流れ図（作成途中）:", zh: "[图] 流程图（制作途中）:", en: "[Figure] Flowchart (in progress):" },
  "2014h26h-q068": { clean: "[図] 階層構造のツリー（＊印がカレントディレクトリ）：", zh: "[图] 层次结构的树（＊号为当前目录）：", en: "[Figure] Tree of the hierarchical structure (＊ marks the current directory):" },
  "2016h28a-q075": { clean: "［図］ 階層構造図（左から右へ展開する木構造）:", zh: "［图］ 层次结构图（自左向右展开的树结构）:", en: "[Figure] Hierarchical structure diagram (a tree expanding from left to right):" },
  "2016h28h-q010": { clean: "〔図〕 左から右へ矢印でつながる五つのプロセス:", zh: "〔图〕 从左到右用箭头连接的五个流程:", en: "[Figure] Five processes connected left to right by arrows:" },
  "2022r04-q090": { clean: "[図] 木構造", zh: "[图] 树结构", en: "[Figure] Tree structure" },
  "2022r04-q097": { clean: "〔図〕IoTシステム構成図", zh: "〔图〕IoT 系统结构图", en: "[Figure] IoT system configuration diagram" },
};
for (const [id, labels] of Object.entries(D158)) {
  const T = t(id), T1d = p1(id);
  for (const [layer, label] of Object.entries(labels)) {
    const [o, o1, key] = layer === "clean" ? [T, T1d, "stem_jp_clean"] : [T.stem, T1d?.stem, layer];
    delLine(o, key, label, `${id} translations.${layer}`, "3-D158");
    if (o1?.[key]?.split("\n").includes(label)) delLine(o1, key, label, `${id} .phase1.${layer}`, "3-D158");
  }
}

// 同型 4 題 (源 2009h21a p26 / 2010h22h p24 / 2015h27a p20 / 2019h31h p11、いずれもラベル無し)。
// ラベルの後が図の言語化本文の 3 題はラベル (接頭辞) だけを外して本文を残す。2009h21a-q069 は後ろが AI の題名だけ (内容は次行以降の箇条) なので行ごと削除
const D158_PREFIX = {
  "2010h22h-q057": { clean: "[図] ", zh: "[图] ", en: "[Figure] " },
  "2015h27a-q048": { clean: "［図］", zh: "［图］", en: "[Figure] " },
  "2019h31h-q026": { clean: "[図] ", zh: "[图] ", en: "[Figure] " },
};
for (const [id, labels] of Object.entries(D158_PREFIX)) for (const [layer, label] of Object.entries(labels)) apply("3-D158", id, layer, "stem", `\n${label}`, "\n");
for (const [layer, label] of Object.entries({
  clean: "[図] メールクライアントとメールサーバ間，およびメールサーバ間のメール送受信の流れ",
  zh: "[图] 邮件客户端与邮件服务器之间，以及邮件服务器之间的邮件收发流程",
  en: "[Figure] The flow of sending and receiving email between the mail client and the mail server, and between mail servers",
})) {
  const T = t("2009h21a-q069"), T1d = p1("2009h21a-q069");
  const [o, o1, key] = layer === "clean" ? [T, T1d, "stem_jp_clean"] : [T.stem, T1d?.stem, layer];
  delLine(o, key, label, `2009h21a-q069 translations.${layer}`, "3-D158");
  if (o1?.[key]?.split("\n").includes(label)) delLine(o1, key, label, `2009h21a-q069 .phase1.${layer}`, "3-D158");
}

// ── 4. 2014h26a-q094 expl zh: 式の引用を stem zh (B3 是正後) と同じ “…” 形に ─────
for (const [from, to] of [
  ["〔平均（B53～G53）〕", "“平均(B53～G53)”"], ["〔B52＊B53〕", "“B52*B53”"], ["〔合计（B54～G54）〕", "“合计(B54～G54)”"],
  ["〔H54／H52〕", "“H54/H52”"], ["〔合计（B2～G36）／H52〕", "“合计(B2～G36)/H52”"],
]) explRep("4-q094zh", "2014h26a-q094", "zh", from, to, 1);

// ── 5. 2014h26h-q085 設問文 (源 p34「運用管理部門，販売部門から受領したデータを〔データ管理要領〕に沿って取り扱うとき，…適切でないものはどれか。」) ─────
apply("5-q085", "2014h26h-q085", "clean", "stem",
  "運用管理部門,販売部門から受領したデータを〔データ管理要領〕に沿って取り扱うとき,データの取扱いに関する記述として,適切でないものはどれか。",
  "運用管理部門，販売部門から受領したデータを〔データ管理要領〕に沿って取り扱うとき，データの取扱いに関する記述として，適切でないものはどれか。");
apply("5-q085", "2014h26h-q085", "zh", "stem",
  "运营管理部门按照《数据管理要领》处理从销售部门接收到的数据时,关于数据处理的描述,哪一项是不恰当的?",
  "按照〔数据管理要领〕处理从运营管理部门、销售部门接收到的数据时，关于数据处理的描述，不恰当的是哪一项？");
apply("5-q085", "2014h26h-q085", "en", "stem",
  "When the operations management department handles data received from the sales department in accordance with the \"Data Management Guidelines,\" which of the following descriptions of data handling is inappropriate?",
  "When data received from the operations management department and the sales department is handled in accordance with the [Data Management Guidelines], which of the following descriptions of data handling is inappropriate?");

// ── 6. en キャプションの全角空白 (sidecar + .phase1 の en、stem / choices) ─────
const CAP = /(Figure|Fig\.|Table)( \d+)?　/g;
const capFields = new Set();
for (const e of EXAMS) for (const [id, T] of Object.entries(tr(e).questions)) {
  const T1d = p1(id);
  const one = (o, k, where) => { if (typeof o?.[k] !== "string") return; const m = o[k].match(CAP); if (!m) return; o[k] = o[k].replace(CAP, "$1$2 "); bump("6-caption", m.length); capFields.add(where); };
  one(T.stem, "en", `${id} translations.stem.en`); one(T1d?.stem, "en", `${id} .phase1.stem.en`);
  for (const L of Object.keys(T.choices ?? {})) { one(T.choices[L], "en", `${id} translations.choices.${L}.en`); one(T1d?.choices?.find((c) => c.letter === L), "en", `${id} .phase1.choices.${L}.en`); }
}

// ── 7. 2011h23tokubetsu-q094 の「処理を実行しない」記号 = 「－」(注記2・選択肢・源 p37) / 2021r03-q070 expl en ─────
for (const layer of ["clean", "raw", "zh", "en"]) {
  apply("7-symbol", "2011h23tokubetsu-q094", layer, "stem", "| – | b |", "| － | b |");
  apply("7-symbol", "2011h23tokubetsu-q094", layer, "stem", "| – | – |", "| － | － |");
}
explRep("7-symbol", "2011h23tokubetsu-q094", "jp", /−(?![0-9])/g, "－", 17); // 「1割引=−」「b:−」等の記号。「−1」の負数は不触
for (const s of ["Author ← Book", "Publisher ← Author", "Publisher ← Author ← Book"]) explRep("7-D156", "2021r03-q070", "en", `「${s}」`, `“${s}”`, 1);

// ── 8. raw hygiene (不可視層。questions.json は tracked) ─────
apply("8-raw", "2012h24h-q005", "raw", "stem", "| 売上高 | 4,800 |", "| 売上高 | 4,000 |");
apply("8-raw", "2022r04-q096", "raw", "stem", "関数calcXをcalcY(1)", "関数calcYをcalcY(1)");
// 2013h25h-q061 売上表 (源 p26: H002 K02 80 / H006 K02 50。表示層 clean は源どおり。主 context 追加依頼 S129)
apply("8-raw", "2013h25h-q061", "raw", "stem", "| H002 | K02 | 60 |", "| H002 | K02 | 80 |");
apply("8-raw", "2013h25h-q061", "raw", "stem", "| H006 | K01 | 30 |", "| H006 | K02 | 50 |");

// ── D-159 表示層の残り: 2015h27h 中問A 前文 (A4 埋め込み、q085〜q088) ─────
for (const id of ["2015h27h-q085", "2015h27h-q086", "2015h27h-q087", "2015h27h-q088"]) {
  for (const layer of ["clean", "zh", "en", "raw"]) apply("D159-stem", id, layer, "stem", "“－1”", `“${M}1”`);
}

// ── 不変条件と書込み ───────────────────────────────────────────────────
for (const q of Qdoc.questions) if (ANS0.get(q.id) !== q.correct_answer) throw new Error(`${q.id}: correct_answer changed — abort`);
for (const b of Barr) if (b.correct_answer !== ANS0.get(b.id)) throw new Error(`${b.id}: bank correct_answer mismatch — abort`);
wj(P("data/ip/quiz/questions.json"), Qdoc); wj(P("data/ip/exams/question_bank.json"), Bdoc);
for (const e of Object.keys(BY)) wj(P("data/ip/exams/by_year", `${e}.json`), BY[e]);
for (const e of Object.keys(TR)) wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]);
for (const { f, d } of T1.values()) if (d) wj(f, d);
for (const { f, d } of [...XJ.values(), ...XT.values()]) wj(f, d);

const merge = [...new Set(written.filter((f) => /\.phase2\/expl_/.test(f)).map((f) => ex(path.basename(f).replace(/^expl_(jp|tr)_/, "").replace(/\.json$/, ""))))].sort();
if (process.argv.includes("-v")) console.log(log.join("\n"));
else console.log(log.filter((l) => !l.includes("6-caption")).join("\n"));
console.log(`  6-caption: ${count["6-caption"] ?? 0} 箇所 / ${capFields.size} field`);
console.log(`  phase2-merge 要: ${merge.join(" ")}`);
console.log(`  files ${DRY ? "to write" : "written"} (${written.length})`);
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fix-S129-a5: ${Object.entries(count).map(([k, v]) => `${k} ${v}`).join(" / ")}, skipped ${skipped}`);
