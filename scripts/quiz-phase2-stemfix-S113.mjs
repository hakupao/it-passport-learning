#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 — stem/choices fixes, batch S113 (2012h24h), post-generate 裁決.
//
// Provenance: generate `wf_18de0afc-538` の key_guard flag 12 問を主 context が裁決。
// 全て源実読で確認済 (page-02/05/08/30/38/42/43/45)。correct_answer 変更 0。
//
// THE CRITICAL ONE — q001 (page-02), answer-affecting 級:
//   源: 表「単位 万円」A案 = 固定費 1,000 / 変動費 3。dataset は変動費「1万円」。
//   腐敗値では A案利益 8,000万 > B案 6,000万 = リテラル導出ウ で stored key イ と矛盾
//   (key_guard が matches_key=false で人間裁決を要求した唯一の問)。
//   源の 3万円 では両案とも総費用 4,000万円・利益 6,000万円で一致 = イ が回復。
//   key イ 不変。zh (1万日元)/en (10,000 yen) も同値腐敗ゆえ決定的連帯。
//
// Choice-OCR 是正 (全て user-facing、非 answer-affecting、源実読確認済):
//   q003 エ 末尾junk「= 2 なーー」/ q012 ア 衍字「の」/ q083 ウ 余分アポストロフィ+
//   エ 半角閉じ引用符 / q090 ウ 8,900→8,000・エ 15,900→15,000 (000→900 桁 OCR、
//   zh/en 連帯) / q093 エ 次問見出し「〔【ストラテジ]〕」混入 / q095 エ 賓→客 字形
//   (来賓用会議室、zh/en 連帯) / q098 ウ 客→容 字形 + エ 見出し「[テクノロジ〕」混入。
//   q022 stem 熟語内空白「設 定」→「設定」。
//
// NOT fixed here (deliberate):
//   q089 表2 の結合セル表現「| a |  |  |  |」— 源は 4 列にまたがる結合セルに a 1 個。
//     裁剪図が添付済みで学習者は真の結合セルを図で見る。markdown を「a,a,a,a」にすると
//     図と矛盾し、注記追加は源に無いテキストの増殖 → 図権威で no-op (S89 最小主義)。
//   q089 raw stem_jp の表2 2行目 Y,Y,N,N (源=Y,N,Y,N) — clean が源一致、raw 非表示
//     (S107 q082 精神)。
//   q022/q030 等の半角読点「, 」・語間空白 (39-81 問に分布) — corpus 一律の正規化差、
//     本 exam 固有でない → backlog (q022 の熟語内空白のみ表示欠陥として是正)。
//   中問B (q089-q092 前文+表1、q090 は全欠) / 中問C (q093-q096 前書き+要件) の
//     linkage-gap — テキスト是正不能、図/シナリオ再抽出 track へ登記。
//
// Run: node scripts/quiz-phase2-stemfix-S113.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const E = "2012h24h";
const TR = path.join(ROOT, `data/ip/quiz/translations/${E}.json`);
const q = (n) => `${E}-q${String(n).padStart(3, "0")}`;

const FIXES = [
  // ---- q001 (page-02) answer-affecting 級。clean なし → raw が表示層。
  { id: q(1), kind: "stem",
    from: "| A案 | 1,000万円 | 1万円 |", to: "| A案 | 1,000万円 | 3万円 |",
    why: "answer-affecting級: 源は変動費 3 (単位万円)。1万円では利益がA案8,000万>B案6,000万でリテラル導出ウ=keyイと矛盾。3万円で両案利益6,000万=イ回復" },
  { id: q(1), kind: "tr_stem", lang: "zh",
    from: "| A方案 | 1,000万日元 | 1万日元 |", to: "| A方案 | 1,000万日元 | 3万日元 |", why: "連帯" },
  { id: q(1), kind: "tr_stem", lang: "en",
    from: "| Plan A | 10,000,000 yen | 10,000 yen |", to: "| Plan A | 10,000,000 yen | 30,000 yen |", why: "連帯" },
  // ---- q003 (page-02) エ 末尾 OCR junk
  { id: q(3), kind: "choice", key: "エ",
    from: "リバースエンジニアリング= 2 なーー", to: "リバースエンジニアリング",
    why: "cosmetic: 源のエは「リバースエンジニアリング」のみ、末尾junk除去。zh/en 既clean" },
  // ---- q012 (page-05) ア 衍字
  { id: q(12), kind: "choice", key: "ア",
    from: "ビジネスクラスの利用を薦めるの。", to: "ビジネスクラスの利用を薦める。",
    why: "cosmetic: 源は「薦める。」、衍字「の」除去。zh/en 既clean" },
  // ---- q022 (page-08) stem 熟語内空白
  { id: q(22), kind: "stem",
    from: "目標を設 定する際に", to: "目標を設定する際に",
    why: "cosmetic: 源の改行位置由来の熟語内空白 (源は「設定」)" },
  // ---- q083 (page-30) ウ/エ 引用符 OCR
  { id: q(83), kind: "choice", key: "ウ",
    from: "“ファイル所有者以外'” のアクセス権", to: "“ファイル所有者以外” のアクセス権",
    why: "cosmetic: 源は“…”のみ、余分な半角アポストロフィ除去" },
  { id: q(83), kind: "choice", key: "エ",
    from: '“ファイル所有者" のアクセス権', to: "“ファイル所有者” のアクセス権",
    why: "cosmetic: 閉じ引用符が半角\"、源は全角”" },
  // ---- q090 (page-38) ウ/エ 000→900 桁 OCR (zh/en 連帯)
  { id: q(90), kind: "choice", key: "ウ",
    from: "受講料は8,900円", to: "受講料は8,000円",
    why: "semantic: 源は8,000円 (000→900 桁 OCR)。正解イの一意性不変 (正値は9,000円でウは元々誤答肢)" },
  { id: q(90), kind: "choice", key: "エ",
    from: "受講料は15,900円", to: "受講料は15,000円",
    why: "semantic: 源は15,000円 (000→900 桁 OCR)" },
  { id: q(90), kind: "tr_choice", key: "ウ", lang: "zh", from: "8,900日元", to: "8,000日元", why: "連帯" },
  { id: q(90), kind: "tr_choice", key: "ウ", lang: "en", from: "8,900 yen", to: "8,000 yen", why: "連帯" },
  { id: q(90), kind: "tr_choice", key: "エ", lang: "zh", from: "15,900日元", to: "15,000日元", why: "連帯" },
  { id: q(90), kind: "tr_choice", key: "エ", lang: "en", from: "15,900 yen", to: "15,000 yen", why: "連帯" },
  // ---- q093 (page-42) エ 次問分野見出しの混入
  { id: q(93), kind: "choice", key: "エ",
    from: "審査を依頼する文書〔【ストラテジ]〕", to: "審査を依頼する文書",
    why: "cosmetic: 問94 の分野見出し〔ストラテジ〕が OCR で吸い込まれた混入。zh/en 既clean" },
  // ---- q095 (page-43) エ 賓→客 字形 OCR (zh/en 連帯)
  { id: q(95), kind: "choice", key: "エ",
    from: "来客用会議室の予約可否", to: "来賓用会議室の予約可否",
    why: "semantic: 源は「来賓用会議室」(page-41 要件(2)(4) とも一貫)。賓→客 字形 OCR" },
  { id: q(95), kind: "tr_choice", key: "エ", lang: "zh", from: "来客用会议室", to: "来宾用会议室", why: "連帯" },
  { id: q(95), kind: "tr_choice", key: "エ", lang: "en", from: "visitor meeting room", to: "guest meeting room", why: "連帯" },
  // ---- q098 (page-45) ウ 客→容 字形 + エ 見出し混入
  { id: q(98), kind: "choice", key: "ウ",
    from: "容が書店で書籍を探す際に", to: "客が書店で書籍を探す際に",
    why: "cosmetic: 源は「客」。客→容 字形 OCR。zh 顾客/en customer 既correct" },
  { id: q(98), kind: "choice", key: "エ",
    from: "図書分類が明確になる。[テクノロジ〕", to: "図書分類が明確になる。",
    why: "cosmetic: 分野見出し〔テクノロジ〕の混入 (q093 エ と同クラス)。zh/en 既clean" },
];

const bank = JSON.parse(readFileSync(RB, "utf-8"));
const byId = new Map((bank.questions ?? bank).map((x) => [x.id, x]));
const trDoc = JSON.parse(readFileSync(TR, "utf-8"));

const replaceOnce = (s, f, where) => {
  const n = s.split(f.from).length - 1;
  if (n !== 1) throw new Error(`${f.id} ${where}: expected exactly 1 occurrence of «${f.from}», found ${n}`);
  return s.replace(f.from, f.to);
};

const counts = { stem: 0, choice: 0, tr: 0 };
for (const f of FIXES) {
  const rec = byId.get(f.id);
  if (!rec) throw new Error(`${f.id}: not in question_bank`);
  const t = trDoc.questions[f.id];
  if (f.kind === "stem") {
    rec.stem_jp = replaceOnce(rec.stem_jp, f, "stem_jp");
    counts.stem++;
    console.log(`  ✓ ${f.id} [stem]     ${f.why}`);
  } else if (f.kind === "choice") {
    rec.choices_jp[f.key] = replaceOnce(rec.choices_jp[f.key], f, `choices_jp.${f.key}`);
    counts.choice++;
    console.log(`  ✓ ${f.id} [choice ${f.key}] ${f.why}`);
  } else if (f.kind === "tr_stem") {
    if (!t?.stem?.[f.lang]) throw new Error(`${f.id}: no tr stem ${f.lang}`);
    t.stem[f.lang] = replaceOnce(t.stem[f.lang], f, `tr_stem.${f.lang}`);
    counts.tr++;
    console.log(`  ✓ ${f.id} [tr ${f.lang}]    ${f.why}`);
  } else if (f.kind === "tr_choice") {
    if (!t?.choices?.[f.key]?.[f.lang]) throw new Error(`${f.id}: no tr choice ${f.key}.${f.lang}`);
    t.choices[f.key][f.lang] = replaceOnce(t.choices[f.key][f.lang], f, `tr_choice.${f.key}.${f.lang}`);
    counts.tr++;
    console.log(`  ✓ ${f.id} [tr ${f.key}.${f.lang}] ${f.why}`);
  }
}

writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
writeFileSync(TR, JSON.stringify(trDoc, null, 2) + "\n");
console.log(`✓ quiz-phase2-stemfix-S113: stem ${counts.stem} / choice ${counts.choice} / tr ${counts.tr}`);
console.log(`  next: node scripts/build-quiz-corpus.mjs`);
