#!/usr/bin/env node
// Stage 6 / Quiz — S128 A3 unit: D-156〜D-160 の文字是正 (L2b `evidence/S128_L2b_scans.md` / L2e `evidence/S128_L2e_textbook_numbers.md`)。
//
//   D-157 節見出しの括弧 = 原典どおり 〔〕。jp 7 題 (2015h27h-q025 は B1 で是正済) + zh は jp に追随 (L2b の 14 題 − 2009h21h-q091 [D-158 へ] + 是正 8 題の zh)。en は [ ] のまま
//   D-158 AI が付加した図ラベルを削除。源に図キャプション「図1」「図2」がある 2 題 (2010h22a-q072 / 2013h25a-q052) は括弧だけ外して
//         corpus のキャプション形「図1　…」に揃える (図1/図2 の対応を保つ)。キャプションの無い 7 題はラベル行ごと削除
//   D-159 負号 = U+2212。U+FF0D / ASCII - の負数リテラルだけ (表の値・代入値・選択肢の範囲の下限)。減算子・ハイフン・「－は処理を実行しない」の記号は除外
//   D-160 figure_description の腐敗 7 題を源どおりに是正。bank / by_year と、textbook の複写 (units の source_figures / figure_index / .planning/quiz_fixtures) を同値に
//   D-156 en の「」→ “”。式・関数・セル式・ワイルドカード / LIKE パターン・コード片を囲むものは除外 (EN_EXCLUDE)
//
// 層・方針は quiz-fidfix-S128-b1 と同じ:
//   - translations sidecar は再 merge 禁止。sidecar と .phase1 tr_ に同じ置換 (.phase1 側は出現数が少なくてよい。0 なら skip)
//   - raw (questions / question_bank / by_year の stem_jp・choices_jp) は、表示層と同じ文字列が崩れずにある箇所だけ当てる。
//     崩れた raw (例 2020r02o-q094「[インシデント]〕」) は不可視なので触らない (N5)
//   - explanations は .phase2 expl_tr_ が真相源 → 是正後に quiz-phase2-merge で再生成
//   - key_guard note は final のみ、round1 不可触 (D-143 §3)。正解肢の字形だけを変えた 2 題に追記。MARK 冪等
//   - correct_answer は触らない (末尾で全 2900 題の不変を assert)
//
// Run: node scripts/quiz-fix-S128-a3.mjs            (dry-run: 全操作を表示、書込みなし)
//      node scripts/quiz-fix-S128-a3.mjs --apply
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs <exam>   (expl_tr_ / note を変えた exam ごと)
//   → node scripts/quiz-chumon-groups-build.mjs
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = !process.argv.includes("--apply") || process.argv.includes("--dry-run");
const P = (...s) => path.join(ROOT, ...s);
const LOADED = new Map(), EOL = new Map();
// 末尾改行の有無は元ファイルに従う (textbook の units / figure_index は末尾改行なし)
const rj = (f) => { const raw = readFileSync(f, "utf-8"); const d = JSON.parse(raw); LOADED.set(f, JSON.stringify(d, null, 2)); EOL.set(f, raw.endsWith("\n") ? "\n" : ""); return d; };
const written = [];
const wj = (f, d) => {
  const next = JSON.stringify(d, null, 2);
  if (LOADED.get(f) === next) return;
  written.push(path.relative(ROOT, f));
  if (!DRY) writeFileSync(f, next + EOL.get(f));
};
const count = { 156: 0, 157: 0, 158: 0, 159: 0, 160: 0, note: 0 }; let skipped = 0; const log = [];

// rep: from を全置換。k=0 → skip (冪等)。n 指定時は k===n を、max 指定時は k<=max を要求。事後に to の出現数 +k を確認。
function rep(obj, key, from, to, where, d, { n, max } = {}) {
  const s = obj?.[key];
  if (typeof s !== "string") return 0;
  const k = s.split(from).length - 1;
  if (k === 0) { skipped++; return 0; }
  if (n !== undefined && k !== n) throw new Error(`${where}: 「${from}」 occurs ${k}× (expected ${n}) — abort`);
  if (max !== undefined && k > max) throw new Error(`${where}: 「${from}」 occurs ${k}× (max ${max}) — abort`);
  const before = to ? s.split(to).length - 1 : 0;
  const next = s.split(from).join(to);
  if (to && next.split(to).length - 1 < before + k) throw new Error(`${where}: 置換後の to 「${to}」 の出現数が不足 — abort`);
  obj[key] = next; count[d] += k; log.push(`  ✓ D-${d} ${where}: 「${from.slice(0, 30)}」→「${to.slice(0, 30)}」 ×${k}`); return k;
}
// ラベル行の削除: 「\n<label>\n\n」→「\n」、無ければ「\n<label>\n」→「\n」(直後が本文の行)。
function delLine(obj, key, label, where) {
  const s = obj?.[key];
  if (typeof s !== "string" || !s.includes(label)) { skipped++; return 0; }
  for (const from of [`\n${label}\n\n`, `\n${label}\n`]) {
    if (s.split(from).length - 1 === 1) {
      const next = s.replace(from, "\n");
      if (next.includes(label) || /\n{3,}/.test(next) && !/\n{3,}/.test(s)) throw new Error(`${where}: 削除後の検査に失敗 — abort`);
      obj[key] = next; count[158]++; log.push(`  ✓ D-158 ${where}: 行「${label}」を削除`); return 1;
    }
  }
  throw new Error(`${where}: ラベル「${label}」が単独行として 1 回だけ現れない — abort`);
}

// ── データ読込 ──────────────────────────────────────────────────────────────
const Qdoc = rj(P("data/ip/quiz/questions.json")); const Bdoc = rj(P("data/ip/exams/question_bank.json")); const Barr = Bdoc.questions;
const ANS0 = new Map(Qdoc.questions.map((q) => [q.id, q.correct_answer]));
const EXAMS = readdirSync(P("data/ip/quiz/translations")).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort();
const BY = {}, TR = {}, T1 = new Map();
const by = (e) => (BY[e] ??= rj(P("data/ip/exams/by_year", `${e}.json`)));
const tr = (e) => (TR[e] ??= rj(P("data/ip/quiz/translations", `${e}.json`)));
const p1 = (id) => { if (!T1.has(id)) { const f = P("data/ip/quiz/.phase1", `tr_${id}.json`); T1.set(id, { f, d: existsSync(f) ? rj(f) : null }); } return T1.get(id).d; };
const ex = (id) => id.split("-q")[0];
const raws = (id) => [[Qdoc.questions.find((x) => x.id === id), "questions"], [Barr.find((x) => x.id === id), "question_bank"], [by(ex(id)).questions.find((x) => x.id === id), "by_year"]];
const t = (id) => { const v = tr(ex(id)).questions[id]; if (!v) throw new Error(`${id}: translations に無い`); return v; };

// 層ごとの置換。layer = clean (stem_jp_clean: sidecar + .phase1) / raw (stem_jp 3 層) / zh / en (stem: sidecar + .phase1)。
// field = "stem" か選択肢記号。sidecar 側は n (既定 1) を厳密に、.phase1 側は max n。
function apply(d, id, layer, field, from, to, n = 1) {
  const T = t(id), T1d = p1(id);
  if (layer === "clean") {
    rep(T, "stem_jp_clean", from, to, `${id} translations.stem_jp_clean`, d, { n });
    if (T1d) rep(T1d, "stem_jp_clean", from, to, `${id} .phase1.stem_jp_clean`, d, { max: n });
  } else if (layer === "raw") {
    for (const [o, w] of raws(id)) field === "stem" ? rep(o, "stem_jp", from, to, `${id} ${w}.stem_jp`, d, { n }) : rep(o.choices_jp, field, from, to, `${id} ${w}.choices_jp.${field}`, d, { n });
  } else {
    if (field === "stem") {
      rep(T.stem, layer, from, to, `${id} translations.stem.${layer}`, d, { n });
      if (T1d?.stem) rep(T1d.stem, layer, from, to, `${id} .phase1.stem.${layer}`, d, { max: n });
    } else {
      rep(T.choices[field], layer, from, to, `${id} translations.choices.${field}.${layer}`, d, { n });
      const c1 = T1d?.choices?.find((c) => c.letter === field); if (c1) rep(c1, layer, from, to, `${id} .phase1.choices.${field}.${layer}`, d, { max: n });
    }
  }
}

// ── D-157 節見出しの括弧 ───────────────────────────────────────────────────
// [id, layer, from, to, n]。raw は表示層と同じ文字列が崩れずにある 2 題だけ (2012h24h-q094 / 2015h27a-q071)。
const D157 = [
  ["2010h22h-q098", "clean", "[S社の状況]", "〔S社の状況〕"], ["2010h22h-q098", "zh", "[S 公司的状况]", "〔S 公司的状况〕"],
  ["2012h24a-q090", "clean", "[システム導入検討会のメモ]", "〔システム導入検討会のメモ〕"], ["2012h24a-q090", "zh", "[系统导入研讨会备忘录]", "〔系统导入研讨会备忘录〕"],
  ["2012h24a-q099", "clean", "[会員登録をする Web ページの仕組み]", "〔会員登録をする Web ページの仕組み〕"], ["2012h24a-q099", "zh", "[会员注册的 Web 页面机制]", "〔会员注册的 Web 页面机制〕"],
  ["2012h24h-q094", "clean", "［事務所統合プロジェクトのメンバ］", "〔事務所統合プロジェクトのメンバ〕"], ["2012h24h-q094", "raw", "［事務所統合プロジェクトのメンバ］", "〔事務所統合プロジェクトのメンバ〕"],
  ["2012h24h-q094", "zh", "［办公室整合项目成员］", "〔办公室整合项目成员〕"], ["2012h24h-q094", "zh", "［与会议室预约相关的需求］", "〔与会议室预约相关的需求〕"],
  ["2013h25a-q099", "clean", "【要望事項】", "〔要望事項〕", 2], ["2013h25a-q099", "zh", "【需求事项】", "〔需求事项〕", 2],
  ["2015h27a-q071", "clean", "[処理一覧]", "〔処理一覧〕"], ["2015h27a-q071", "raw", "[処理一覧]", "〔処理一覧〕"], ["2015h27a-q071", "zh", "[处理一览]", "〔处理一览〕"],
  ["2020r02o-q094", "clean", "[インシデント]", "〔インシデント〕"], ["2020r02o-q094", "zh", "[事件]", "〔事件〕"],
  ["2015h27h-q025", "zh", "[业务流程]", "〔业务流程〕"],
  // L2b の zh 不一致 14 題 (jp は既に 〔〕。2009h21h-q091 は D-158 で行ごと削除)
  ["2012h24h-q093", "zh", "［与会议室预约相关的需求］", "〔与会议室预约相关的需求〕"], ["2012h24h-q095", "zh", "［与会议室预约相关的需求］", "〔与会议室预约相关的需求〕"],
  ["2012h24h-q096", "zh", "［与会议室预约相关的需求］", "〔与会议室预约相关的需求〕"],
  ["2015h27a-q007", "zh", "【对策】", "〔对策〕"], ["2020r02o-q068", "zh", "【应对措施】", "〔应对措施〕"],
  ["2016h28h-q040", "zh", "[报告规则]", "〔报告规则〕"], ["2016h28h-q051", "zh", "[条件]", "〔条件〕"],
  ["2017h29a-q079", "zh", "[收件人]", "〔收件人〕"], ["2017h29a-q096", "zh", "[案例]", "〔案例〕"],
  ["2017h29h-q071", "zh", "[A 的电子邮件收件人设置]", "〔A 的电子邮件收件人设置〕"], ["2017h29h-q090", "zh", "[操作]", "〔操作〕"],
  ["2019h31h-q053", "zh", "[前提]", "〔前提〕"], ["2019h31h-q096", "zh", "[指定方法]", "〔指定方法〕"],
];
for (const [id, layer, from, to, n] of D157) apply(157, id, layer, "stem", from, to, n ?? 1);

// ── D-158 AI の図ラベル ───────────────────────────────────────────────────
// 源に図キャプション (図1 / 図2) がある 2 題: 括弧だけ外してキャプション形に。raw (不可視の「[図]」系の言語化層) は触らない。
const D158_CAPTION = [
  ["2010h22a-q072", [["clean", "【図1】", "図1　"], ["clean", "【図2】", "図2　"], ["zh", "【图1】", "图1　"], ["zh", "【图2】", "图2　"], ["en", "[Figure 1] ", "Figure 1　"], ["en", "[Figure 2] ", "Figure 2　"]]],
  ["2013h25a-q052", [["clean", "[図1] ", "図1　"], ["clean", "[図2] ", "図2　"], ["zh", "[图1] ", "图1　"], ["zh", "[图2] ", "图2　"], ["en", "[Figure 1] ", "Figure 1　"], ["en", "[Figure 2] ", "Figure 2　"]]],
];
for (const [id, list] of D158_CAPTION) for (const [layer, from, to] of list) apply(158, id, layer, "stem", from, to);
// 源にキャプションも見出しも無い 7 題: ラベル行を削除 (2010h22h-q035 の 〔凡例〕 は源にあるので残す)。
const D158_DELETE = {
  "2010h22h-q035": { clean: "〔図：アローダイアグラム（作業＝作業日数）〕", zh: "〔图：箭线图（边＝作业天数）〕", en: "[Figure: Arrow diagram (edge = working days)]" },
  "2015h27a-q008": { clean: "【図：DFD】", zh: "【图：DFD】", en: "[Figure: DFD]" },
  "2016h28h-q078": { clean: "［図：TCP/IPネットワーク構成］", zh: "［图：TCP/IP 网络构成］", en: "[Figure: TCP/IP network configuration]" },
  "2023r05-q086": { clean: "〔図：ハイブリッド暗号方式の手順〕", zh: "〔图：混合加密方式的步骤〕", en: "[Figure: Hybrid cryptography procedure]" },
  "2009h21h-q091": { clean: "［流れ図］", zh: "[流程图]", en: "[Flowchart]" },
  "2010h22h-q050": { clean: "［流れ図（フローチャート）の一部］", zh: "［流程图（流程图）的一部分］", en: "[Part of the flowchart]" },
  "2022r04-q079": { clean: "[流れ図]", zh: "[流程图]" },
};
for (const [id, labels] of Object.entries(D158_DELETE)) {
  const T = t(id), T1d = p1(id);
  for (const [layer, label] of Object.entries(labels)) {
    if (layer === "clean") { delLine(T, "stem_jp_clean", label, `${id} translations.stem_jp_clean`); if (T1d?.stem_jp_clean?.includes(label)) delLine(T1d, "stem_jp_clean", label, `${id} .phase1.stem_jp_clean`); }
    else { delLine(T.stem, layer, label, `${id} translations.stem.${layer}`); if (T1d?.stem?.[layer]?.includes(label)) delLine(T1d.stem, layer, label, `${id} .phase1.stem.${layer}`); }
  }
}

// ── D-159 負号 → U+2212 ──────────────────────────────────────────────────
const M = "−";
// [id, field, {layer: [[from, to, n]]}]。n は sidecar / raw の厳密な出現数。
const D159 = [
  ["2009h21h-q007", "stem", { raw: [["| -10 |", `| ${M}10 |`, 1]], clean: [["| -10 |", `| ${M}10 |`, 1]], zh: [["| -10 |", `| ${M}10 |`, 1]], en: [["| -10 |", `| ${M}10 |`, 1]] }],
  ["2017h29a-q020", "stem", { raw: [["| -20 |", `| ${M}20 |`, 2]], clean: [["| -20 |", `| ${M}20 |`, 2]], zh: [["| -20 |", `| ${M}20 |`, 2]], en: [["| -20 |", `| ${M}20 |`, 2]] }],
  // 2011h23tokubetsu 中問B (q093〜q096): 前文 (1)「合計金額に－1を代入する」、決定表、図1 の「L＝－1」、q095 選択肢 e:－1。源 page-35/36 で負の 1。
  ["2011h23tokubetsu-q093", "stem", { clean: [["に－1を", `に${M}1を`, 1], ["L＝－1", `L＝${M}1`, 1]], raw: [["L＝－1", `L＝${M}1`, 1]], zh: [["赋值 －1", `赋值 ${M}1`, 1], ["L＝－1", `L＝${M}1`, 1]], en: [["assign －1", `assign ${M}1`, 1], ["L＝－1", `L＝${M}1`, 1]] }],
  ["2011h23tokubetsu-q094", "stem", { clean: [["に－1を", `に${M}1を`, 2]], raw: [["に－1を", `に${M}1を`, 1]], zh: [["赋值 －1", `赋值 ${M}1`, 1], ["赋值－1", `赋值${M}1`, 1]], en: [["assign －1", `assign ${M}1`, 1], ["Assign －1", `Assign ${M}1`, 1]] }],
  ["2011h23tokubetsu-q095", "stem", { clean: [["に－1を", `に${M}1を`, 1]], zh: [["赋值 －1", `赋值 ${M}1`, 1]], en: [["assign －1", `assign ${M}1`, 1]] }],
  ["2011h23tokubetsu-q096", "stem", { clean: [["に－1を", `に${M}1を`, 1]], zh: [["赋值 －1", `赋值 ${M}1`, 1]], en: [["assign －1", `assign ${M}1`, 1]] }],
  ["2011h23tokubetsu-q095", "イ", { raw: [["e:－1", `e:${M}1`, 1]], zh: [["e:－1", `e:${M}1`, 1]], en: [["e:－1", `e:${M}1`, 1]] }],
  ["2011h23tokubetsu-q095", "エ", { raw: [["e:－1", `e:${M}1`, 1]], zh: [["e:－1", `e:${M}1`, 1]], en: [["e:－1", `e:${M}1`, 1]] }],
  // 2012h24h-q052: 選択肢の範囲の下限 (源 page-18「−256 〜 255」等)。ウ は正解肢 (字形のみ)。
  ...[["ア", "256"], ["イ", "255"], ["ウ", "128"], ["エ", "127"]].map(([L, v]) => ["2012h24h-q052", L, { raw: [[`－${v}`, `${M}${v}`, 1]], zh: [[`－${v}`, `${M}${v}`, 1]], en: [[`－${v}`, `${M}${v}`, 1]] }]),
];
for (const [id, field, layers] of D159) for (const [layer, list] of Object.entries(layers)) for (const [from, to, n] of list) {
  if (layer === "clean" && field !== "stem") throw new Error("clean は stem のみ");
  apply(159, id, layer, field, from, to, n);
}

// ── D-160 figure_description ─────────────────────────────────────────────
// 源 (page PNG 原寸) から: 2019r01a p03 / 2026r08 p03 / 2021r03 p23 / 2012h24h p03 / 2013h25h p48 / 2012h24a p34 / 2015h27a p38 (問題文の基準値) + p39 (図3 本体)
const FD = {
  "2019r01a-q002": [
    "損益計算書（単位：億円）：売上高1000，売上原価788，販売費及び一般管理費138，営業外収益20，営業外費用16，特別利益2，特別損失1，法人税等58",
    "損益計算書（単位：億円）：売上高1000，売上原価780，販売費及び一般管理費130，営業外収益20，営業外費用16，特別利益2，特別損失1，法人税，住民税及び事業税50",
  ],
  "2026r08-q003": [
    "市況が好転・悪化の2列と投資戦略a・bの2行からなる利益予測表。投資戦略a：好転20，悪化−15。投資戦略b：好転5，悪化8。",
    "市況が好転・悪化の2列と投資戦略a・bの2行からなる利益予測表。投資戦略a：好転20，悪化−15。投資戦略b：好転5，悪化0。",
  ],
  "2021r03-q050": [
    "【条件】移動：片道68秒。PCの起動の流れ：A 電源を入れる（3秒・手作業）→ B 起動処理（156秒・自動処理）→ C ログイン操作（19秒・手作業）→ D ログイン後の起動処理（?秒・自動処理）→（起動終了）。プリンタの起動の流れ：E 電源を入れる（3秒・手作業）→ 起動処理（68秒・自動処理）→（起動終了）。",
    "〔条件〕移動：片道60秒。PCの起動の流れ：（起動開始）→ A 電源を入れる（3秒・手作業）→ B ログイン画面起動処理（150秒・自動処理）→ C ログイン操作（10秒・手作業）→ D ログイン後のアプリケーション起動処理（60秒・自動処理）→（起動終了）。プリンタの起動の流れ：（起動開始）→ E 電源を入れる（3秒・手作業）→ F 起動処理（60秒・自動処理）→（起動終了）。",
  ],
  "2012h24h-q005": [
    "損益計算資料の表。売上高4,800百万円、変動製造費1,400百万円、変動販売費600百万円、固定費800百万円が記載されている。",
    "損益計算資料の表。売上高4,000百万円、変動製造費1,400百万円、変動販売費600百万円、固定費800百万円が記載されている。",
  ],
  // 流れの構造ごと誤り → 源の 12 本の矢印を全部書き直す (Rule A: 全面書換え 1 題、evidence に源との対照)
  "2013h25h-q099": [
    "C社サイトからのアクセス追跡図（図2）。C社サイト→トップページ3,000件。トップページから：商品紹介1,800件、キャンペーン情報2,000件（一部重複）。商品紹介から購入手続400件→購入手続完了50件→完了860件。キャンペーン情報から購入手続500件→完了300件。各ページからの離脱数あり。",
    "C社サイトからのアクセスの追跡図（図2）。C社サイト→トップページ3,000件。トップページ→商品紹介1,000件、商品紹介→トップページ400件。トップページ→キャンペーン情報2,000件、キャンペーン情報→トップページ800件。キャンペーン情報→商品紹介500件。商品紹介→購入手続100件、購入手続→商品紹介50件。キャンペーン情報→購入手続300件、購入手続→キャンペーン情報20件。購入手続→購入手続完了180件。購入手続完了→商品紹介100件。",
  ],
  "2012h24a-q086": [
    "粗利益比率計算用ワークシート。図1の売上分析表にG列（粗利益比率）が追加された形式。牛丼39.9%・親子丼14.9%・カツ丼28.3%・カレー16.6%・合計100.0%の数値が表示されている。",
    "粗利益比率計算用ワークシート。図1の売上分析表にG列（粗利益比率）が追加された形式。牛丼30.9%・親子丼14.9%・カツ丼25.8%・カレー28.3%・合計100.0%の数値が表示されている。",
  ],
  "2015h27a-q088": [
    "散布図（図3）。横軸：相関係数（0.1〜0.9）、縦軸：評価平均（2.0〜4.0）。相関係数0.5、評価平均3.6の基準線で4象限に分割。質問項目1〜5の位置をプロット。",
    "散布図（図3）。横軸：相関係数（0.1〜0.9）、縦軸：評価平均（2.0〜4.0）。相関係数0.5、評価平均3.0の基準線で4象限に分割。質問項目1〜5の位置をプロット。",
  ],
};
const fdHits = {};
function fdWalk(o, file) {
  if (Array.isArray(o)) { for (const v of o) fdWalk(v, file); return; }
  if (!o || typeof o !== "object") return;
  for (const [k, v] of Object.entries(o)) {
    if (k === "figure_description" && typeof v === "string") {
      for (const [id, [from, to]] of Object.entries(FD)) {
        if (v === from) { o[k] = to; count[160]++; (fdHits[id] ??= []).push(file); log.push(`  ✓ D-160 ${id} ${file}`); }
        else if (v === to) skipped++;
      }
    } else fdWalk(v, file);
  }
}
for (const id of Object.keys(FD)) { const b = Barr.find((x) => x.id === id); if (b.figure_description !== FD[id][0] && b.figure_description !== FD[id][1]) throw new Error(`${id}: bank の figure_description が想定外 — abort`); }
fdWalk(Barr, "question_bank");
for (const e of [...new Set(Object.keys(FD).map(ex))]) fdWalk(by(e).questions, `by_year/${e}`);
const TB = {};
for (const f of [...readdirSync(P("data/ip/textbook/units")).filter((x) => x.endsWith(".json")).map((x) => `data/ip/textbook/units/${x}`), "data/ip/textbook/figure_index.json", "data/ip/textbook/.planning/quiz_fixtures.json"]) {
  const s = readFileSync(P(f), "utf-8");
  if (!Object.values(FD).some(([from]) => s.includes(JSON.stringify(from).slice(1, -1)))) continue;
  TB[f] = rj(P(f)); fdWalk(TB[f], f);
}

// ── D-156 en 「」→ “” ────────────────────────────────────────────────────
// 除外: 「」の中身が関数式 / セル式 / ワイルドカード・LIKE パターン / コード片 / 擬似言語の代入。中身の文字そのものが式の一部として読まれうるため (D-151 の除外に準ずる)。
const EN_EXCLUDE = [
  [/^[A-Za-z]+\(/, "関数式"],                                   // IF(…) / SUM(…) / CountIf(…)
  [/^\(?\$?[A-Z]{1,2}\$?\d+.*[+\-*/]/, "セル式"],              // (B2+C2)/2 / D2/D$14 / F$14*E2
  [/^[^\s]*[%*?][^\s]*$/, "ワイルドカード / LIKE パターン"],   // %udon% / udon% / % / * / ? / *data
  [/^\s|\s$|src=/, "コード片"],                                // <img src=「 　　a　　 ￥s01.jpeg 」>
  [/←/, "擬似言語の代入"],
];
const enExcluded = [];
function convEn(s, where) {
  if (!s.includes("「") && !s.includes("」")) return s;
  const out = s.replace(/「([^「」]*)」/g, (m, inner) => {
    const hit = EN_EXCLUDE.find(([re]) => re.test(inner));
    if (hit) { enExcluded.push(`${where}: 「${inner}」 (${hit[1]})`); return m; }
    count[156]++; return `“${inner}”`;
  });
  return out;
}
const enFields = new Set(), enExpl = new Set();
for (const e of EXAMS) for (const [id, T] of Object.entries(tr(e).questions)) {
  const T1d = p1(id);
  const doOne = (o, k, where) => { if (typeof o?.[k] !== "string") return; const next = convEn(o[k], where); if (next !== o[k]) { o[k] = next; enFields.add(where); } };
  doOne(T.stem, "en", `${id} translations.stem.en`); doOne(T1d?.stem, "en", `${id} .phase1.stem.en`);
  for (const L of Object.keys(T.choices ?? {})) { doOne(T.choices[L], "en", `${id} translations.choices.${L}.en`); doOne(T1d?.choices?.find((c) => c.letter === L), "en", `${id} .phase1.choices.${L}.en`); }
}
const EXPL = {};
for (const f of readdirSync(P("data/ip/quiz/.phase2")).filter((x) => /^expl_tr_.*\.json$/.test(x))) {
  const full = P("data/ip/quiz/.phase2", f); const s = readFileSync(full, "utf-8");
  if (!s.includes("「")) continue;
  const d = rj(full); const id = d.id;
  const walk = (o, p) => { if (!o || typeof o !== "object") return; for (const [k, v] of Object.entries(o)) {
    if (k === "en" && typeof v === "string") { const next = convEn(v, `${id} expl_tr${p}.en`); if (next !== v) { o[k] = next; enExpl.add(id); } } else walk(v, `${p}.${k}`); } };
  walk(d, ""); EXPL[full] = d;
}

// ── key_guard final note (正解肢の字形のみ変更した 2 題) ───────────────
const MARK = "fix-S128-a3";
const NOTE_APPEND = {
  "2011h23tokubetsu-q095": "（S128 A3: page-35/36/38 実読で 前文 (1) と選択肢イ・エの負号「－1」を U+2212「−1」に統一（D-159）。イは**正解肢**だが変更は負号の字形のみで、合計金額 L の導出・correct_answer=イ は不変 — " + MARK + "）",
  "2012h24h-q052": "（S128 A3: page-18 実読で 選択肢ア〜エの範囲の下限の負号「－」を U+2212「−」に統一（D-159）。ウは**正解肢**だが変更は負号の字形のみで、8 ビット 2 の補数の範囲 −128〜127 = ウという導出・correct_answer=ウ は不変 — " + MARK + "）",
};
const GR = {};
for (const [id, note] of Object.entries(NOTE_APPEND)) {
  const e = ex(id); GR[e] ??= rj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`));
  const r = GR[e].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  r.key_guard.note_jp += note; count.note++; log.push(`  ✓ note ${id} final: 追記 (round1 untouched)`);
}

// ── 不変条件と書込み ───────────────────────────────────────────────────
for (const q of Qdoc.questions) if (ANS0.get(q.id) !== q.correct_answer) throw new Error(`${q.id}: correct_answer changed — abort`);
for (const b of Barr) if (b.correct_answer !== ANS0.get(b.id)) throw new Error(`${b.id}: bank correct_answer mismatch — abort`);
wj(P("data/ip/quiz/questions.json"), Qdoc); wj(P("data/ip/exams/question_bank.json"), Bdoc);
for (const e of Object.keys(BY)) wj(P("data/ip/exams/by_year", `${e}.json`), BY[e]);
for (const e of Object.keys(TR)) wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]);
for (const { f, d } of T1.values()) if (d) wj(f, d);
for (const [f, d] of Object.entries(TB)) wj(P(f), d);
for (const [f, d] of Object.entries(EXPL)) wj(f, d);
for (const [e, d] of Object.entries(GR)) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), d);

const merge = [...new Set([...[...enExpl].map(ex), ...Object.keys(GR)])].sort();
if (process.argv.includes("-v")) console.log(log.join("\n"));
else console.log(log.filter((l) => !l.includes("D-156")).join("\n"));
console.log(`  D-156 en: 「」→“” ${count[156]} 対 / sidecar・.phase1 ${enFields.size} field / expl_tr ${enExpl.size} 題、除外 ${enExcluded.length} 対`);
for (const x of enExcluded) console.log(`    除外 ${x}`);
console.log(`  D-160 hits: ${Object.entries(fdHits).map(([id, fs]) => `${id}=${fs.length}`).join(" ")}`);
console.log(`  phase2-merge 要: ${merge.join(" ")}`);
console.log(`  files ${DRY ? "to write" : "written"} (${written.length})`);
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fix-S128-a3: D-156 ${count[156]} / D-157 ${count[157]} / D-158 ${count[158]} / D-159 ${count[159]} / D-160 ${count[160]} / note ${count.note}, skipped ${skipped}`);
