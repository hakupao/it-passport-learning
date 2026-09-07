#!/usr/bin/env node
// Stage 6 / Quiz — S117 ① pilot (2019r01a + 2024r06) の保真核験で出た差分 24 件 (双 pass 一致 23 + gp-only cosmetic 1) を是正する。
//
// 源: S117 log §9 / pilot 10 workflow (A = s7x 双 pass、B-note = note 起点 5 問、B-sample = 無作為 20 問×2 exam)。
// 各差分の source_text は双 pass (general-purpose / pr-review-toolkit:code-reviewer) が源ページを拡大実読して確定したもの。
//
// ══ 層 (S115 教訓「最上流も直さないと再生成で退行する」、D-143「merge の入力層が真相源」) ══
//   JP 表示テキスト : data/ip/quiz/questions.json / data/ip/exams/question_bank.json / data/ip/exams/by_year/<exam>.json
//                     (stem は translations sidecar の stem_jp_clean と .phase1/tr_<id>.json の stem_jp_clean にも同文がある)
//   zh/en 訳文       : data/ip/quiz/translations/<exam>.json + .phase1/tr_<id>.json  (JP 腐敗を写した訳だけ直す)
//                     ※ translations sidecar は **phase1 再 merge で再生成してはいけない** — Phase 1.5 (D-138) の stem_jp_clean と
//                       S110 以降の trfix は sidecar に直書きされており、.phase1/tr_ 入力層は stale (S117 実測: 再 merge で
//                       2019r01a 56 / 2024r06 40 フィールドが退行)。sidecar と入力層の両方に同じ置換を当てるのが正。
//                       explanations sidecar は逆に入力層 (.phase2) が真相源で、再 merge が正 (D-143)。
//   解説            : .phase2/expl_jp_<id>.json + .phase2/expl_tr_<id>.json → 再 merge で sidecar へ (sidecar 直編集はしない)
//   key_guard note  : .phase2/generate_result_<exam>.json の final note_jp を全文書き換え (D-143。round1 不可触)
//
// 置換は「from が当該フィールドに 1 回だけ存在する」ことを assert する (無ければ既に是正済み = skip、2 回以上なら abort)。
// Run: node scripts/quiz-fidfix-S117-pilot.mjs [--dry-run]

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry-run");
const P = (...s) => path.join(ROOT, ...s);
const rj = (f) => JSON.parse(readFileSync(f, "utf-8"));
const wj = (f, d) => { if (!DRY) writeFileSync(f, JSON.stringify(d, null, 2) + "\n"); };
let applied = 0, skipped = 0;
const log = [];

// 1 回だけ出現することを要求する置換 (0 回 = skip、2 回以上 = abort)
function sub(obj, key, from, to, where) {
  const s = obj?.[key];
  if (typeof s !== "string") { log.push(`  ⚠ ${where}: field ${key} missing`); return false; }
  // 冪等性: to が from を含む (例 サービ→サービス) と再実行で二重適用されるので、to が既に在れば適用済みとみなす
  if (to && to.includes(from) && s.includes(to)) { skipped++; log.push(`  = ${where}: 「${to.slice(0, 30)}」 already present (skip)`); return false; }
  const n = s.split(from).length - 1;
  if (n === 0) { skipped++; log.push(`  = ${where}: 「${from.slice(0, 30)}」 already absent (skip)`); return false; }
  if (n > 1) throw new Error(`${where}: 「${from}」 occurs ${n}× — abort (ambiguous)`);
  obj[key] = s.replace(from, to);
  applied++; log.push(`  ✓ ${where}: 「${from.slice(0, 40)}」→「${to.slice(0, 40)}」`);
  return true;
}

// ── 差分表 ─────────────────────────────────────────────────────────────────────────────────
// jp: [field, from, to]  (field = "stem" | "ア".."エ")   zh/en: 同形 (訳が腐敗を写している場合のみ)
const FIX = {
  "2019r01a-q022": {
    jp: [["イ", "オフィスの空調において、", "オフィスの自席にいながら、"], ["エ", "事前に決めた、", "事前に入力し、"]],
    zh: [["イ", "在办公室的空调系统中，", "身处办公室自己的座位上，就"], ["エ", "按事先设定的内容，", "事先输入后，"]],
    en: [["イ", "In an office air-conditioning system, the vacancy status", "While staying at one's own desk in the office, the vacancy status"],
         ["エ", "according to what was decided in advance,", "after entering the details in advance,"]],
  },
  "2019r01a-q025": { jp: [["イ", "維続", "継続"]] },
  "2019r01a-q026": {
    jp: [["stem", "生産するために部品B", "生産するためには部品B"], ["stem", "生産終了時に行い", "生産終了後に行い"],
         ["stem", "安全在庫量は，", "安全在庫は，"], ["stem", "生産開始時の在庫量", "生産開始前の在庫量"]],
    zh: [["stem", "生产结束时进行", "生产结束后进行"], ["stem", "安全库存量为", "安全库存为"], ["stem", "生产开始时的库存量", "生产开始前的库存量"]],
    en: [["stem", "ordered at the end of production each week", "ordered after production ends each week"],
         ["stem", "at the start of production in week 1", "before the start of production in week 1"]],
  },
  "2019r01a-q033": { jp: [["イ", "自動で行の", "自動で行う。"]] },
  "2019r01a-q040": { jp: [["ウ", "滞進的", "漸進的"], ["イ", "物差しととする", "物差しとする"]] },
  "2019r01a-q045": {
    jp: [["stem", "この作業を実現するのに", "この作業を実施するのに"]],
    zh: [["stem", "要实现这项工作", "要实施这项工作"]],
    en: [["stem", "appropriate for carrying out this work", "appropriate for performing this work"]],
  },
  "2019r01a-q049": { jp: [["イ", "実施するため，", "実施するので，"]] },
  "2019r01a-q050": { jp: [["ウ", "ISWS", "ISMS"]], zh: [["ウ", "ISWS", "ISMS"]], en: [["ウ", "ISWS", "ISMS"]] },
  "2019r01a-q058": {
    jp: [["イ", "デバイスドライバは再インストール", "デバイスドライバを再インストール"], ["エ", "メーカや種類を問わず", "メーカや機種を問わず"]],
    zh: [["エ", "无论厂商和种类如何", "无论厂商和机型如何"]],
    en: [["エ", "regardless of manufacturer or type", "regardless of manufacturer or model"]],
  },
  "2019r01a-q069": { jp: [["ア", "投稿するサービ", "投稿するサービス"]] },
  "2019r01a-q070": {
    jp: [["stem", "元の文字列は何か。", "元の文字列はどれか。"]],
    zh: [["stem", "原始字符串是什么？", "原始字符串是哪一个？"]],
    en: [["stem", "what is the original string?", "which is the original string?"]],
  },
  "2019r01a-q079": { jp: [["stem", "PさんQさん及び", "Pさん，Qさん及び"]] }, // clean 側のみ該当 (raw stem_jp は読点保持)
  "2024r06-q025": {
    jp: [["stem", "史跡にスマートフォン", "史跡などにスマートフォン"]],
    zh: [["stem", "对准史迹时", "对准史迹等时"]],
    en: [["stem", "pointed at a historic site,", "pointed at a historic site or similar place,"]],
  },
  "2024r06-q035": { jp: [["ウ", "才査", "審査"]] },
  "2024r06-q061": { jp: [["エ", "機能のーつで", "機能の一つで"], ["エ", "仕組みのの", "仕組みのこと"]] },
  "2024r06-q083": { jp: [["イ", "91/72", "5/72"]], zh: [["イ", "91/72", "5/72"]], en: [["イ", "91/72", "5/72"]] },
};

// 解説の書き換え (腐敗テキストを前提に書かれていた誤答理由 / caveat)
const EXPL = {
  "2019r01a-q050": { letter: "ウ",
    jp: "ISMS (情報セキュリティマネジメントシステム、JIS Q 27001/ISO/IEC 27001) は、組織の情報セキュリティを管理・改善するための仕組みであり、IT サービスの提供・運用を体系化した IT サービスマネジメントのフレームワークではない。問われているのは IT サービスマネジメントの「ベストプラクティスを集めた枠組み」なので、セキュリティ管理の枠組みである ISMS は誤り。",
    zh: "ISMS（信息安全管理体系，JIS Q 27001/ISO/IEC 27001）是用于管理和改进组织信息安全的机制，并不是把 IT 服务的提供与运维加以体系化的 IT 服务管理框架。本题问的是汇集了 IT 服务管理「最佳实践的框架」，因此作为安全管理框架的 ISMS 是错误的。",
    en: "ISMS (Information Security Management System, JIS Q 27001 / ISO/IEC 27001) is a framework for managing and improving an organization's information security, not a framework that systematizes the delivery and operation of IT services. The question asks for the framework that collects IT service management best practices, so ISMS, a security-management framework, is incorrect." },
  "2024r06-q083": { letter: "イ",
    jp: "5/72 (= 15/216) は、3回のうち「1の目がちょうど2回出る」確率 3×(1/6)²×(5/6) に相当する値であり、「1回も1の目が出ない」確率ではありません。求める確率は (5/6)³ = 125/216 なので誤りです。",
    zh: "5/72（= 15/216）相当于 3 次投掷中「恰好出现 2 次 1 点」的概率 3×(1/6)²×(5/6)，而不是「1 次也没有出现 1 点」的概率。所求概率是 (5/6)³ = 125/216，因此错误。",
    en: "5/72 (= 15/216) corresponds to the probability that a 1 comes up exactly twice in three rolls, 3 × (1/6)² × (5/6), not the probability that a 1 never comes up. The required probability is (5/6)³ = 125/216, so this is wrong." },
  "2024r06-q035": { letter: "ウ", stripJp: "なお「才査」は「審査」のOCR崩れ。" },
};

// key_guard final note の全文書き換え (D-143)。round1 には触れない。
const NOTES = {
  "2019r01a-q025": "図なしの知識問。設問は「経営者を対象」「サイバー攻撃から企業を守る観点」「経営者が認識すべき原則・取り組むべき項目を記載」と述べる。これは経済産業省と IPA が公表した「サイバーセキュリティ経営ガイドライン」の記述そのもの（経営者が認識すべき3原則＋重要10項目）。独立導出でも エ となり stored key と一致。stem・選択肢とも源と逐字一致 (S117: 選択肢イ「維続」→「継続」を page-11 実読 [双 pass 一致] で是正済、fidfix-S117-pilot)。round-1 は当該箇所を「誤答肢の OCR 揺れ・答えに影響なし」と記していた。",
  "2019r01a-q033": "図なし (has_figure=false) の概念問。RPA の定義「PC 上のルール化された定型操作をソフトウェアで自動化する技術」から直接導出可能。選択肢を照合すると、ソフトウェアが定型操作を代行し注文データを配送システムに転記する「ウ」だけが RPA に合致し、stored key「ウ」と一致する。stem・選択肢とも源と逐字一致 (S117: 選択肢イ末尾「自動で行の」→「自動で行う。」を page-15 実読 [双 pass 一致、行折り返し由来の欠落] で是正済、fidfix-S117-pilot)。round-1 は当該箇所を「cosmetic な choices 腐敗・答えに影響なし」と記していた。",
  "2019r01a-q040": "図は無く、stem と選択肢の概念照合だけで一意に導出できる。スクラムは複雑で変化の激しい問題に対応する反復的かつ漸進的なシステム開発フレームワークであり、選択肢ウが一致。ア=CMMI、イ=共通フレーム／SLCP、エ=PMBOK でいずれも不一致。derived_answer=ウ で stored key と一致。stem・選択肢とも源と逐字一致 (S117: 正解肢ウ「滞進的」→「漸進的」・肢イ「物差しととする」→「物差しとする」を page-18 実読 [双 pass 一致] で是正済、fidfix-S117-pilot。正解肢上の非語だったが、他 3 肢が別概念のため正解の見え方は不変)。round-1 は「滞進的」を「選択肢側の cosmetic な乱れ」と記していた。",
  "2019r01a-q069": "図なしの用語定義問題。トラックバックは、自分のブログ記事に別のブログ記事へのリンクを張った際に、リンク先のブログへ自動で通知する仕組み。この定義と一致するのは選択肢エのみで、stored key と一致。stem_jp_clean は null なので stem_jp が正。stem・選択肢とも源と逐字一致 (S117: 選択肢ア末尾「サービ」→「サービス」を page-31 実読 [双 pass 一致、行折り返し先頭 1 字の取りこぼし] で是正済、fidfix-S117-pilot)。round-1 は当該箇所を「選択肢側の cosmetic な欠落・正解に影響なし」と記していた。",
};

// ── 適用 ───────────────────────────────────────────────────────────────────────────────────
const exams = [...new Set(Object.keys(FIX).map((id) => id.split("-q")[0]))];
const Qdoc = rj(P("data/ip/quiz/questions.json"));
const Bdoc = rj(P("data/ip/exams/question_bank.json"));
const Barr = Bdoc.questions ?? Bdoc;
const BY = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/exams/by_year", `${e}.json`))]));
const TR = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/quiz/translations", `${e}.json`))]));
const GR = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`))]));

for (const [id, fx] of Object.entries(FIX)) {
  const exam = id.split("-q")[0];
  const q = Qdoc.questions.find((x) => x.id === id), b = Barr.find((x) => x.id === id), y = BY[exam].questions.find((x) => x.id === id);
  const t = TR[exam].questions[id];
  const t1f = P("data/ip/quiz/.phase1", `tr_${id}.json`); const t1 = existsSync(t1f) ? rj(t1f) : null;
  for (const [field, from, to] of fx.jp ?? []) {
    if (field === "stem") {
      for (const [obj, where] of [[q, "questions.stem_jp"], [b, "question_bank.stem_jp"], [y, "by_year.stem_jp"]]) sub(obj, "stem_jp", from, to, `${id} ${where}`);
      if (t?.stem_jp_clean) sub(t, "stem_jp_clean", from, to, `${id} translations.stem_jp_clean`);
      if (t1?.stem_jp_clean) sub(t1, "stem_jp_clean", from, to, `${id} .phase1 tr_.stem_jp_clean`);
    } else {
      for (const [obj, where] of [[q, "questions"], [b, "question_bank"], [y, "by_year"]]) sub(obj.choices_jp, field, from, to, `${id} ${where}.choices_jp.${field}`);
    }
  }
  for (const lang of ["zh", "en"]) for (const [field, from, to] of fx[lang] ?? []) {
    if (field === "stem") { sub(t.stem, lang, from, to, `${id} translations.stem.${lang}`); if (t1) sub(t1.stem, lang, from, to, `${id} .phase1 tr_.stem.${lang}`); }
    else { sub(t.choices[field], lang, from, to, `${id} translations.choices.${field}.${lang}`); if (t1) sub(t1.choices.find((c) => c.letter === field), lang, from, to, `${id} .phase1 tr_.choices.${field}.${lang}`); }
  }
  if (t1) wj(t1f, t1);
}
wj(P("data/ip/quiz/questions.json"), Qdoc);
wj(P("data/ip/exams/question_bank.json"), Bdoc);
for (const e of exams) { wj(P("data/ip/exams/by_year", `${e}.json`), BY[e]); wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]); }

// 解説 (merge 入力層のみ。sidecar は再 merge で追従)
for (const [id, ex] of Object.entries(EXPL)) {
  const jf = P("data/ip/quiz/.phase2", `expl_jp_${id}.json`), tf = P("data/ip/quiz/.phase2", `expl_tr_${id}.json`);
  const j = rj(jf), tr = rj(tf);
  const dj = j.distractors_jp.find((d) => d.letter === ex.letter), dt = tr.distractors.find((d) => d.letter === ex.letter);
  if (ex.stripJp) { sub(dj, "why_wrong_jp", ex.stripJp, "", `${id} expl_jp.${ex.letter} (caveat strip)`); }
  else {
    if (dj.why_wrong_jp !== ex.jp) { dj.why_wrong_jp = ex.jp; applied++; log.push(`  ✓ ${id} expl_jp.${ex.letter}: rewritten`); } else skipped++;
    if (dt.zh !== ex.zh || dt.en !== ex.en) { dt.zh = ex.zh; dt.en = ex.en; applied++; log.push(`  ✓ ${id} expl_tr.${ex.letter}: rewritten`); } else skipped++;
  }
  wj(jf, j); wj(tf, tr);
}

// key_guard final note (D-143)
for (const [id, note] of Object.entries(NOTES)) {
  const exam = id.split("-q")[0];
  const r = GR[exam].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard in generate_result`);
  if (r.key_guard.note_jp !== note) { r.key_guard.note_jp = note; applied++; log.push(`  ✓ ${id} generate_result final note_jp: rewritten (round1 untouched)`); } else skipped++;
}
for (const e of exams) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);

console.log(log.join("\n"));
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S117-pilot: applied ${applied}, skipped ${skipped}`);
console.log("  next: node scripts/quiz-phase2-merge.mjs <exam> (2019r01a, 2024r06; translations は再 merge 禁止) → node scripts/quiz-keys-crosscheck.mjs");
