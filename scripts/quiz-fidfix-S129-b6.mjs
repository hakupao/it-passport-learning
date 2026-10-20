#!/usr/bin/env node
// Stage 6 / Quiz — S129 B track **B6** (2012h24h、100 問 / Sonnet 5 単 pass、D-150 §3) の差分を是正する。
// 源: S129 の workflow `wf_57537237-389`。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_b6_2012h24h_sn.json
//     マニフェスト = data/ip/quiz/.phase2/b6_fidelity_input_2012h24h.json (precrop 84/100、skip 16 = chumon 16 (q085〜q100))
//     機械 diff (S128 L1a 改修版) = node scripts/quiz-fidelity-machdiff.mjs <manifest> <結果>
//               → same 481 / AGENT_MISSED 12 (q052 ア〜エ = A3 の U+2212 統一、q086 = 表3 の ⋮ (実残差)、
//                 q087 / q090 / q091 / q092 / q095 / q096 / q100 = 中問前文) / QUOTE_ASCII 4 (q069 ア〜エ、実残差) / VERDICT_CONFLICT 0
//
// 層・方針は quiz-fidfix-S122-u3a 〜 S129-b4 と同じ:
//   - translations sidecar は **再 merge 禁止** (S117 §10a 失敗②)。sidecar と .phase1 の両方に同じ置換を当てる
//   - stem は raw (questions / question_bank / by_year の stem_jp) と表示層 (stem_jp_clean) の**両方**に当てる。
//     片方にしか無い腐敗は assert-once の n===0 で自動 skip される
//   - key_guard note は **final のみ**、round1 不可触 (D-143 §3)。MARK 冪等
//   - sub() は置換後に **to の肯定確認** を assert する (S121 reviewer 指摘)
//
// 2012h24h の sidecar のキーは `stem` / `choices` / `stem_jp_clean` (100 題中 50 題)。`choices_jp_clean` は無い → 選択肢は raw 3 層が出荷層。
// 中問 4 組 (mqA〜mqD) は前文埋め込み済み。前文領域 (mqB の「、」を含む) は触らず、from は設問文側の部分一致。
// raw `2012h24h-q005` (4,800) は A5 の担当 → 本是正器は q005 に触れない。
//
// 適用ループ (sub / FIX / expl 単一読み / NOTE_APPEND) は B4 から流用。EXPL に correct_jp の置換 (1 行) を足した。
//
// 採用した差分 (evidence §6。源 crop / 源ページを原寸で独立実読して確認):
//   q001 stem   (p02) 表の右肩「単位　万円」を補い、セルの「万円」を除く (B3 q001 / 2014h26a の「単位　円」形)
//   q017 ア〜エ  (p07) 読点「, 」「.,」→ 源「，」、エ「保有すする」→ 源「保有する」
//   q037 stem   (p13) 「依頼した。 監査終了後」の空白 (fixer 走査)
//   q048 ア     (p16) 「自身~ では」→ 源「自身では」
//   q058 stem   (p20) 「」→ 源 “” ×3、表題「商品」を補う (zh / en 表題追随)
//   q069 stem・ア〜エ (p24) 「検索条 件」の空白、選択肢の ASCII " → 源 “” (zh / en も “”、D-151 / D-156)
//   q075 イ     (p26) 「定型に沿って」→ 源「定型に従って」(**正解肢**、解説 correct_jp の引用も追随)
//   q081 stem   (p29) 源に無い読点 ×2 を除く
//   q086 stem   (p33) 表3 の省略記号「…」→ 源「⋮」(字形のみ、3 行目の列 0 も ⋮。結合セルは展開しない = S113 q089 裁決 / 主 context 裁定。zh / en 追随)
//   q087 stem   (p34) 表4 の省略記号「…」→ 源「⋮」×3 行 (PHASE 2 の残存語走査で追加、zh / en 追随)
//   q089 stem   (p37) 「Y」「N」→ 源 “Y” “N” (前文・設問文の「、」は registry probe 整合のため不変)
//   q092 stem   (p40) 図1 注記の源に無い括弧書き (休日の日付列挙) を削除 (D-158、図 webp で網掛けが見える。zh / en 追随)
//
// Run: node scripts/quiz-fidfix-S129-b6.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S129-b6.mjs --apply
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2012h24h
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = !process.argv.includes("--apply") || process.argv.includes("--dry-run");
const P = (...s) => path.join(ROOT, ...s);
const LOADED = new Map();
const rj = (f) => { const d = JSON.parse(readFileSync(f, "utf-8")); LOADED.set(f, JSON.stringify(d, null, 2)); return d; };
const written = [];
const wj = (f, d) => {
  const next = JSON.stringify(d, null, 2);
  if (LOADED.get(f) === next) return;
  written.push(path.relative(ROOT, f));
  if (!DRY) writeFileSync(f, next + "\n");
};
let applied = 0, skipped = 0; const log = [];

function sub(obj, key, from, to, where) {
  const s = obj?.[key];
  if (typeof s !== "string") { log.push(`  ⚠ ${where}: field ${key} missing`); return false; }
  if (to && to.includes(from) && s.includes(to)) { skipped++; return false; }
  const n = s.split(from).length - 1;
  if (n === 0) { skipped++; return false; }
  if (n > 1) throw new Error(`${where}: 「${from}」 occurs ${n}× — abort`);
  const next = s.replace(from, to);
  if (to && !next.includes(to)) throw new Error(`${where}: 置換後に to 「${to.slice(0, 36)}」 が見つからない — abort`);
  obj[key] = next; applied++; log.push(`  ✓ ${where}: 「${from.slice(0, 40)}」→「${to.slice(0, 40)}」`); return true;
}


const FIX = {
  // ── 題幹 ────────────────────────────────────────────────────────────────────
  // q001: clean 無し (raw = 出荷層)。源 p02 は表の右肩に「単位　万円」、セルは数値のみ。zh / en のセル「万日元」/ yen 換算は訳として正 → 不追随。
  "2012h24h-q001": {
    jp: [
      ["stem", "どれか。\n\n| 案 |", "どれか。\n\n単位　万円\n\n| 案 |"],
      ["stem", "| A案 | 1,000万円 | 3万円 |\n| B案 | 2,000万円 | 2万円 |", "| A案 | 1,000 | 3 |\n| B案 | 2,000 | 2 |"],
    ],
  },
  "2012h24h-q037": { jp: [["stem", "依頼した。 監査終了後", "依頼した。監査終了後"]] },
  // q058: 表題「商品」は源 p20 の表の左上。図 (表) も表示される。zh「」は ⑨-c 繰越し (B4 q061 と同じ)、en は既に “”。
  "2012h24h-q058": {
    jp: [
      ["stem", "次の「商品」表から，仕入先が「A社」で価格が140円以上の商品，及び仕入先が「B社」で", "次の“商品”表から，仕入先が“A社”で価格が140円以上の商品，及び仕入先が“B社”で"],
      ["stem", "全て挙げたものはどれか。\n\n| 商品コード |", "全て挙げたものはどれか。\n\n商品\n\n| 商品コード |"],
    ],
    zh: [["stem", "全部商品名？\n\n| 商品代码 |", "全部商品名？\n\n商品\n\n| 商品代码 |"]],
    en: [["stem", "product names obtained?\n\n| Product code |", "product names obtained?\n\nProducts\n\n| Product code |"]],
  },
  "2012h24h-q069": {
    jp: [
      ["stem", "検索条 件", "検索条件"],
      ["ア", "（\"札幌\" AND \"函館\"） AND \"日本料理\"", "（“札幌” AND “函館”） AND “日本料理”"],
      ["イ", "（\"札幌\" AND \"函館\"） OR \"日本料理\"", "（“札幌” AND “函館”） OR “日本料理”"],
      ["ウ", "（\"札幌\" OR \"函館\"） AND \"日本料理\"", "（“札幌” OR “函館”） AND “日本料理”"],
      ["エ", "（\"札幌\" OR \"函館\"） OR \"日本料理\"", "（“札幌” OR “函館”） OR “日本料理”"],
    ],
    zh: [
      ["ア", "（\"札幌\" AND \"函馆\"） AND \"日本料理\"", "（“札幌” AND “函馆”） AND “日本料理”"],
      ["イ", "（\"札幌\" AND \"函馆\"） OR \"日本料理\"", "（“札幌” AND “函馆”） OR “日本料理”"],
      ["ウ", "（\"札幌\" OR \"函馆\"） AND \"日本料理\"", "（“札幌” OR “函馆”） AND “日本料理”"],
      ["エ", "（\"札幌\" OR \"函馆\"） OR \"日本料理\"", "（“札幌” OR “函馆”） OR “日本料理”"],
    ],
    en: [
      ["ア", "(\"Sapporo\" AND \"Hakodate\") AND \"Japanese cuisine\"", "(“Sapporo” AND “Hakodate”) AND “Japanese cuisine”"],
      ["イ", "(\"Sapporo\" AND \"Hakodate\") OR \"Japanese cuisine\"", "(“Sapporo” AND “Hakodate”) OR “Japanese cuisine”"],
      ["ウ", "(\"Sapporo\" OR \"Hakodate\") AND \"Japanese cuisine\"", "(“Sapporo” OR “Hakodate”) AND “Japanese cuisine”"],
      ["エ", "(\"Sapporo\" OR \"Hakodate\") OR \"Japanese cuisine\"", "(“Sapporo” OR “Hakodate”) OR “Japanese cuisine”"],
    ],
  },
  "2012h24h-q081": {
    jp: [
      ["stem", "サーバのデータを，サーバのハードウェア障害", "サーバのデータをサーバのハードウェア障害"],
      ["stem", "サーバ障害時には，障害が発生した", "サーバ障害時には障害が発生した"],
    ],
  },
  // q086: 源 p33 の表3 は縦の省略記号 ⋮。字形だけ是正し、結合セル「価格」は 3 行目に展開しない (S113 q089 裁決、S129 主 context 裁定)。
  "2012h24h-q086": {
    jp: [["stem", "| … | … | … | … |\n| 性能 | … | … | … |\n| サービス | … | … | … |", "| ⋮ | ⋮ | ⋮ | ⋮ |\n| 性能 | ⋮ | ⋮ | ⋮ |\n| サービス | ⋮ | ⋮ | ⋮ |"]],
    zh: [["stem", "| … | … | … | … |\n| 性能 | … | … | … |\n| 服务 | … | … | … |", "| ⋮ | ⋮ | ⋮ | ⋮ |\n| 性能 | ⋮ | ⋮ | ⋮ |\n| 服务 | ⋮ | ⋮ | ⋮ |"]],
    en: [["stem", "| … | … | … | … |\n| Performance | … | … | … |\n| Service | … | … | … |", "| ⋮ | ⋮ | ⋮ | ⋮ |\n| Performance | ⋮ | ⋮ | ⋮ |\n| Service | ⋮ | ⋮ | ⋮ |"]],
  },
  // q087: 源 p34 の表4 も q086 と同じ縦の ⋮ (PHASE 2 の残存語走査で検出。machdiff は前文 row 0 で表比較が止まり拾えなかった)。字形のみ、zh / en 追随。
  "2012h24h-q087": {
    jp: [
      ["stem", "| 価格 | … | … | … |", "| 価格 | ⋮ | ⋮ | ⋮ |"],
      ["stem", "| 性能 | … | … | … |", "| 性能 | ⋮ | ⋮ | ⋮ |"],
      ["stem", "| サービス | … | … | … |", "| サービス | ⋮ | ⋮ | ⋮ |"],
    ],
    zh: [
      ["stem", "| 价格 | … | … | … |", "| 价格 | ⋮ | ⋮ | ⋮ |"],
      ["stem", "| 性能 | … | … | … |", "| 性能 | ⋮ | ⋮ | ⋮ |"],
      ["stem", "| 服务 | … | … | … |", "| 服务 | ⋮ | ⋮ | ⋮ |"],
    ],
    en: [
      ["stem", "| Price | … | … | … |", "| Price | ⋮ | ⋮ | ⋮ |"],
      ["stem", "| Performance | … | … | … |", "| Performance | ⋮ | ⋮ | ⋮ |"],
      ["stem", "| Service | … | … | … |", "| Service | ⋮ | ⋮ | ⋮ |"],
    ],
  },
  // q089: 引用符の字種のみ。読点「、」(源「，」) は mqB 前文と同じ表記で registry probe と整合させるため不変。zh「」/ en «» は ⑨-c。
  "2012h24h-q089": { jp: [["stem", "真のとき「Y」、偽のとき「N」と", "真のとき“Y”、偽のとき“N”と"]] },
  // q092: 源 p40 の注記は「注記　網掛けをしている日が休日である」のみ。図1 (webp) で網掛けが見えるので、括弧書きの日付列挙は削除 (D-158)。
  //   zh「（网格阴影）」/ en "(gray)" は「網掛け」の訳注で日付情報を持たない → 不変。
  "2012h24h-q092": {
    jp: [["stem", "休日である（網掛け＝休日：6，7，13，14，15，20，21，23，27，28日）", "休日である"]],
    zh: [["stem", "休息日（带底纹＝休息日：6、7、13、14、15、20、21、23、27、28日）", "休息日"]],
    en: [["stem", "are holidays (shaded = holidays: the 6th, 7th, 13th, 14th, 15th, 20th, 21st, 23rd, 27th, 28th).", "are holidays."]],
  },
  // ── 選択肢 ──────────────────────────────────────────────────────────────────
  // q017: 源 p07 は 4 肢とも「，」。2012h24h raw の ASCII「, 」は exam 全体の型 (⑨) だが、本題は「.,」の是正と併せて 4 肢を揃える (prep §3)。
  "2012h24h-q017": {
    jp: [
      ["ア", "加わることで, 混乱や摩擦が生じることがあるが, 有形", "加わることで，混乱や摩擦が生じることがあるが，有形"],
      ["イ", "委託することによって.,企業本来", "委託することによって，企業本来"],
      ["ウ", "技術提携, 生産や販売の委託, 合弁会社の設立などによって, 複数", "技術提携，生産や販売の委託，合弁会社の設立などによって，複数"],
      ["エ", "保有すすることによって, 本社機能", "保有することによって，本社機能"],
    ],
  },
  // q048: 読点「, 」は exam 全体の型 (⑨) で不変、「~ 」の残渣のみ除く。
  "2012h24h-q048": { jp: [["ア", "自身~ では制御できない", "自身では制御できない"]] },
  // q075: zh「按照固定格式」/ en "in a fixed format" は源の意味で正 → 不追随。
  "2012h24h-q075": { jp: [["イ", "定型に沿って記述できる", "定型に従って記述できる"]] },
};

// ── 解説 (.phase2 が真相源 → 再 merge) ─────────────────────────────────────
//  q075: correct_jp が選択肢イの文言をそのまま引用している → 引用箇所だけ「従って」に揃える (本文の「項目を定型に沿って記述し」は地の文で不変)。
const EXPL = {
  "2012h24h-q075": { correct: { jp: ["「Webページの見出しやリンク，要約などを定型に沿って記述できるフォーマットの総称」", "「Webページの見出しやリンク，要約などを定型に従って記述できるフォーマットの総称」"] } },
};

const MARK = "fidfix-S129-b6";
const pg = (id) => { const b = JSON.parse(readFileSync(P("data/ip/exams/question_bank.json"), "utf-8")).questions.find((x) => x.id === id); return `page-${String(b.source.page_number).padStart(2, "0")}`; };

// D-143: final の note_jp のみ追記。round1 は不可触。対象 = 語義是正 + 正解肢命中 + note が腐敗 / 原典一致を述べている題。
//   語義: q017 (エ) q058 (表題) q075 q092 / 正解肢命中: q075 (イ、語) q017 (ウ、読点のみ) q069 (ウ、引用符のみ)
//   note 言及: q001 (「単位」注記の欠落・「単位：万円」の提案) q017 (選択肢のノイズ) q048 (「自身~ では」) q058 / q081 / q086 / q092 (clean が原典と完全一致) q069 (「検索条 件」)
//   追記しない (空白・引用符のみ、note に言及なし): q037 q089
const NOTE_APPEND = {
  "2012h24h-q001": (p) => `（S129 B6: ${p} 実読で 表の右肩の「単位　万円」を補い、セルの「万円」を除いて源の形に揃えた（上記の「単位：万円」を補う提案はこの形で実施。値は不変）。両案とも利益 6,000万円で等しい = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2012h24h-q017": (p) => `（S129 B6: ${p} 実読で 上記の選択肢のノイズを是正済み: イの「.,」→「，」、エの「保有すする」→源の「保有する」、ア〜エの読点を源の「，」に統一。ウは**正解肢**だが変更は読点の字種のみで、独自性を維持した連携 = アライアンス = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2012h24h-q048": (p) => `（S129 B6: ${p} 実読で 選択肢アの「自身~ では」を源の「自身では」に是正済み（上記の半角チルダの記述は是正前の状態）。PM の任命と責任・権限の明確化 = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2012h24h-q058": (p) => `（S129 B6: ${p} 実読で 題幹の引用符「」を源の “” に是正し、表の表題「商品」を補った（zh / en も表題追随。上記の「stem_jp_clean と一致」は引用符の字種と表題を除く）。チョコレート・リンゴ・コーヒー = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2012h24h-q069": (p) => `（S129 B6: ${p} 実読で 題幹の「検索条 件」の改行由来の空白を除去し、選択肢ア〜エの ASCII " を源の “” に是正（zh / en も “”）。ウは**正解肢**だが変更は引用符の字種のみで、(“札幌” OR “函館”) AND “日本料理” = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2012h24h-q075": (p) => `（S129 B6: ${p} 実読で 選択肢イの「定型に沿って」を源の「定型に従って」に是正。イは**正解肢**だが語の置換のみで意味は同じ。見出し・リンク・要約を定型で記述するフォーマットの総称 = RSS = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2012h24h-q081": (p) => `（S129 B6: ${p} 実読で 題幹の源に無い読点 2 箇所（「データを，」「障害時には，」）を除去（上記の「完全一致」は読点を除く）。日曜フル + 平日差分 + 外部メディア保管 = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2012h24h-q086": (p) => `（S129 B6: ${p} 実読で 表3 の省略記号「…」を源の縦の「⋮」に是正（字形のみ、zh / en 追随。上記の「完全に一致」は省略記号の字形を除く）。C(4,2)=6 × 3 項目 = 18 = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2012h24h-q092": (p) => `（S129 B6: ${p} 実読で 図1 の注記に付いていた源に無い括弧書き（網掛け＝休日の日付列挙）を削除し、源の「注記　網掛けをしている日が休日である」に揃えた（D-158、zh / en 追随。網掛けは表示図で見える。上記の「網掛け日の明示」は是正前の状態）。文京 7,200円 / 大阪 請求なし / 東京 7,200円 = アという導出・correct_answer=ア は不変 — ${MARK}）`,
};
// ── 適用 ──────────────────────────────────────────────────────────────────────
const exams = [...new Set(Object.keys(FIX).map((id) => id.split("-q")[0]))];
const noteExams = [...new Set(Object.keys(NOTE_APPEND).map((id) => id.split("-q")[0]))];
const Qdoc = rj(P("data/ip/quiz/questions.json")); const Bdoc = rj(P("data/ip/exams/question_bank.json")); const Barr = Bdoc.questions ?? Bdoc;
const BY = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/exams/by_year", `${e}.json`))]));
const TR = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/quiz/translations", `${e}.json`))]));
const GR = Object.fromEntries(noteExams.map((e) => [e, rj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`))]));

for (const [id, fx] of Object.entries(FIX)) {
  const exam = id.split("-q")[0];
  const qq = Qdoc.questions.find((x) => x.id === id), b = Barr.find((x) => x.id === id), y = BY[exam].questions.find((x) => x.id === id), t = TR[exam].questions[id];
  const t1f = P("data/ip/quiz/.phase1", `tr_${id}.json`); const t1 = existsSync(t1f) ? rj(t1f) : null;
  for (const [field, from, to] of fx.jp ?? []) {
    if (field === "stem") {
      for (const [o, w] of [[qq, "questions.stem_jp"], [b, "question_bank.stem_jp"], [y, "by_year.stem_jp"]]) sub(o, "stem_jp", from, to, `${id} ${w}`);
      if (t?.stem_jp_clean) sub(t, "stem_jp_clean", from, to, `${id} translations.stem_jp_clean`);
      if (t1?.stem_jp_clean) sub(t1, "stem_jp_clean", from, to, `${id} .phase1 tr_.stem_jp_clean`);
    } else for (const [o, w] of [[qq, "questions"], [b, "question_bank"], [y, "by_year"]]) sub(o.choices_jp, field, from, to, `${id} ${w}.choices_jp.${field}`);
  }
  for (const lang of ["zh", "en"]) for (const [field, from, to] of fx[lang] ?? []) {
    if (field === "stem") { sub(t.stem, lang, from, to, `${id} translations.stem.${lang}`); if (t1) sub(t1.stem, lang, from, to, `${id} .phase1 tr_.stem.${lang}`); }
    else { sub(t.choices[field], lang, from, to, `${id} translations.choices.${field}.${lang}`); if (t1) sub(t1.choices.find((c) => c.letter === field), lang, from, to, `${id} .phase1 tr_.choices.${field}.${lang}`); }
  }
  if (t1) wj(t1f, t1);
}
wj(P("data/ip/quiz/questions.json"), Qdoc); wj(P("data/ip/exams/question_bank.json"), Bdoc);
for (const e of exams) { wj(P("data/ip/exams/by_year", `${e}.json`), BY[e]); wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]); }

// expl は id ごとに 1 回だけ読み、全ループで共有する。
const EXPLDOC = new Map();
const expl = (id) => {
  if (!EXPLDOC.has(id)) {
    const jf = P("data/ip/quiz/.phase2", `expl_jp_${id}.json`), tf = P("data/ip/quiz/.phase2", `expl_tr_${id}.json`);
    EXPLDOC.set(id, { jf, tf, j: rj(jf), tr: rj(tf) });
  }
  return EXPLDOC.get(id);
};
for (const [id, ex] of Object.entries(EXPL)) {
  const { j, tr } = expl(id);
  if (ex.correct?.jp) sub(j, "correct_jp", ex.correct.jp[0], ex.correct.jp[1], `${id} expl_jp.correct`);
  for (const [L, d] of Object.entries(ex.dist ?? {})) {
    const dj = j.distractors_jp.find((x) => x.letter === L), dt = tr.distractors.find((x) => x.letter === L);
    if (!dj || !dt) throw new Error(`${id} distractor ${L} missing`);
    if (d.jp) sub(dj, "why_wrong_jp", d.jp[0], d.jp[1], `${id} expl_jp.${L}`);
    if (d.zh) sub(dt, "zh", d.zh[0], d.zh[1], `${id} expl_tr.${L}.zh`);
    if (d.en) sub(dt, "en", d.en[0], d.en[1], `${id} expl_tr.${L}.en`);
  }
}
for (const { jf, tf, j, tr } of EXPLDOC.values()) { wj(jf, j); wj(tf, tr); }

for (const [id, mk] of Object.entries(NOTE_APPEND)) {
  const r = GR[id.split("-q")[0]].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  r.key_guard.note_jp = `${r.key_guard.note_jp}${mk(pg(id))}`; applied++; log.push(`  ✓ ${id} final note: 追記 (${pg(id)}, round1 untouched)`);
}
for (const e of noteExams) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);

console.log(log.join("\n"));
console.log(`  files ${DRY ? "to write" : "written"} (${written.length}): ${written.join(", ")}`);
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S129-b6: applied ${applied}, skipped ${skipped}`);
