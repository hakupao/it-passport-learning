#!/usr/bin/env node
// Stage 6 / Quiz — S130 X track **X2** (母数外 97 題: 2018h30a 33 / 2018h30h 30 / 2019h31h 13 / 2021r03 12 / 2023r05 9、Sonnet 5 単 pass) の差分を是正する。
// 源: S130 の workflow `wf_0adc0580-57f`。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/x2_fidelity_multi_sn.json
//     マニフェスト = data/ip/quiz/.phase2/x2_fidelity_input_multi.json (precrop 93/97、中問 member 0)
//     機械 diff = node scripts/quiz-fidelity-machdiff.mjs <manifest> <結果>
//               → same 462 / AGENT_MISSED 10 / REPORTED 13 / TRANSCRIPT_PREFIX 0 / QUOTE_ASCII 1 / VERDICT_CONFLICT 0 / UNREADABLE 0
//                 実残差 = 2019h31h-q025 (QUOTE_ASCII、"利益÷資本")。2023r05-q059 ア〜ウ は採用した表名ラベル「会員 |」の同型、
//                 2021r03-q074 は不変裁定の「（ループ端）」、2019h31h-q013 / q026 は表見出し・図言語化 (U3b q034 型)、2019h31h-q061 は組合せ表の一行化。
//
// 層・方針は quiz-fidfix-S129-b13 と同じ (sidecar 再 merge 禁止、raw 3 層 + stem_jp_clean + sidecar zh/en + .phase1、D-143 は final のみ)。
// 本 unit の追加: 1 field 内の同一字種を数で縛って一括置換する op (第 4 要素 = 想定回数)。「、」→「，」・「」→“” はこれで当てる
//   (n=0 は skip = 冪等、n≠想定 は abort)。
//   D-170: 「、」→「，」は field 内で字形が混在するか、その field を既に書き換える場合に限る。field 全体が「、」の型 (源は「，」) は
//   コーパス全体の決定的走査で後日一括 (⑨) → 本 unit から外した: 2018h30h-q073 / 2019h31h-q012 / 2021r03-q029 エ / q099 ア〜エ / 2023r05-q077 / q086 stem。
//   ASCII「, 」は exam 全体の型で不変 (⑨)。
//   図言語化 (源に対応文が無い) の中の「、」「」は不変 (B8 q015 ウ / q099 型): 2019h31h-q026、2018h30h-q054、2023r05-q086 の箇条書き。
//
// 採用した差分 (evidence §4。源 crop / 源ページを原寸で独立実読して確認):
//   「」→“” (jp 表示): 2018h30a-q085 / 2018h30h-q060 / 2019h31h-q058 / q078 / q098 / 2021r03-q095 / 2023r05-q059 / q075     2019h31h-q025 ASCII " → “” (raw)
//   「、」→「，」(D-170: 混在 or 同 field を書き換える題のみ): 2019h31h-q078 / 2021r03-q038 (+「a, b」) / q074 / 2023r05-q059 / q075
//   2021r03-q074 〔注〕→（注） (jp / zh)     2018h30h-q017「。 」     2018h30a-q057 / 2018h30h-q072「~」→「～」(D-162 範囲記号は原典どおり)
//   2023r05-q059 選択肢ア〜エ の表名ラベル「会員 |」除去 (表示では列「会員」になる、エ = **正解肢**)、zh / en の生 HTML <u></u> 除去
//   2023r05-q075 選択肢ア〜エ >= → ≧、"合格" → '合格' (3 層、同型 2019h31h-q098 と同じ字形、ウ = **正解肢**、解説の >= も)
//   2023r05-q086 選択肢ア〜エ「共通鍵」→「共通」等 (源の表は 共通 / 公開 / 秘密、図は「[a] 鍵」、3 層、ア = **正解肢**)
//
// Run: node scripts/quiz-fidfix-S130-x2.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S130-x2.mjs --apply
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs <exam>  (2018h30a 2018h30h 2019h31h 2021r03 2023r05)
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

function subAll(obj, key, from, to, where, expect, loose = false) {
  const s = obj?.[key];
  if (typeof s !== "string") { log.push(`  ⚠ ${where}: field ${key} missing`); return false; }
  const n = s.split(from).length - 1;
  if (n === 0) { skipped++; return false; }
  if (loose && expect !== undefined && n !== expect) { skipped++; log.push(`  · ${where}: 「${from}」 ${n}× ≠ ${expect}× = 別文 → skip (sidecar が出荷層)`); return false; }
  if (expect !== undefined && n !== expect) throw new Error(`${where}: 「${from}」 が ${n}× (想定 ${expect}×) — abort`);
  obj[key] = s.split(from).join(to); applied++; log.push(`  ✓ ${where}: 「${from}」→「${to}」 ×${n}`); return true;
}
// op = [field, from, to] (1 回) / [field, from, to, n] (n 回ちょうど、一括)。loose = .phase1 tr_ (sidecar と別文のことがある → 回数不一致は skip)
const op = (o, key, [, from, to, n], where, loose = false) => (n === undefined ? sub(o, key, from, to, where) : subAll(o, key, from, to, where, n, loose));

// 2023r05-q059: 源 p27 の選択肢は枠だけで表名は無い。表示の「[表] 会員 | 会員番号 | …」は parseChoice で列「会員」として描画される。
const Q059 = { "ア": "会員番号 | 会員名 |", "イ": "会員番号 | 会員名 | 会員種別コード |", "ウ": "会員番号 | 店舗コード | 会員名 |", "エ": "会員番号 | 店舗コード | 会員名 | 会員種別コード |" };
// 2023r05-q059 zh / en: 主キー注記をセル内へ ([from, to] を zh / en の順に)。
const Q059PK = {
  "ア": [["会员：| 会员编号 | 会员姓名 |（主键：会员编号）", "会员：| 会员编号（主键） | 会员姓名 |"],
    ["Member: | Member Number | Member Name | (primary key: Member Number)", "Member: | Member Number (PK) | Member Name |"]],
  "イ": [["会员：| 会员编号 | 会员姓名 | 会员类别代码 |（主键：会员编号）", "会员：| 会员编号（主键） | 会员姓名 | 会员类别代码 |"],
    ["Member: | Member Number | Member Name | Member Type Code | (primary key: Member Number)", "Member: | Member Number (PK) | Member Name | Member Type Code |"]],
  "ウ": [["会员：| 会员编号 | 店铺代码 | 会员姓名 |（主键：会员编号 + 店铺代码）", "会员：| 会员编号（主键） | 店铺代码（主键） | 会员姓名 |"],
    ["Member: | Member Number | Store Code | Member Name | (primary key: Member Number + Store Code)", "Member: | Member Number (PK) | Store Code (PK) | Member Name |"]],
  "エ": [["会员：| 会员编号 | 店铺代码 | 会员姓名 | 会员类别代码 |（主键：会员编号 + 店铺代码）", "会员：| 会员编号（主键） | 店铺代码（主键） | 会员姓名 | 会员类别代码 |"],
    ["Member: | Member Number | Store Code | Member Name | Member Type Code | (primary key: Member Number + Store Code)", "Member: | Member Number (PK) | Store Code (PK) | Member Name | Member Type Code |"]],
};
// 2023r05-q086: 源 p40 の表の値。表示は各語に「鍵」を補っている (図の空欄は「[a] 鍵」「受信者の [b] 鍵」)。
const Q086 = {
  "ア": [["共通", "公開"], ["共享", "公开"], ["symmetric", "public"]],
  "イ": [["共通", "秘密"], ["共享", "私有"], ["symmetric", "private"]],
  "ウ": [["公開", "共通"], ["公开", "共享"], ["public", "symmetric"]],
  "エ": [["公開", "秘密"], ["公开", "私有"], ["public", "private"]],
};

const FIX = {
  // ── 題幹 (jp 表示 = stem_jp_clean、無ければ raw 3 層) ─────────────────────────
  // 源 p34 “担当社員”表，“地区”表及び“顧客”表 / “顧客”表はどれか。zh「」は ⑨-c、en は既に “”。下線 (実線 / 破線) は ⑨ (§4c、添付図に有り)。
  "2018h30a-q085": { jp: [["stem", "「", "“", 4], ["stem", "」", "”", 4]] },
  // 源 p24 は ①～③ (D-162: 範囲記号は原典どおり)。raw は「① ~ ③」で別文 → skip。
  "2018h30a-q057": { jp: [["stem", "①~③", "①～③"]] },
  // 源 p09 は同一行「…行った。分析結果のうち」(clean 無し、raw = 出荷層)。
  "2018h30h-q017": { jp: [["stem", "分析を行った。 分析結果", "分析を行った。分析結果"]] },
  // 源 p28 “評価”欄 / 文字“×” / 文字“○”。選択肢の式中の '○' は源どおり。
  "2018h30h-q060": { jp: [["stem", "「", "“", 3], ["stem", "」", "”", 3]] },
  "2018h30h-q072": { jp: [["stem", "①~④", "①～④"]] },
  // QUOTE_ASCII (machdiff)。源 p10 “利益÷資本”。clean 無し → raw 3 層。en の ASCII " は ⑨-c。
  "2019h31h-q025": { jp: [["stem", "\"利益÷資本\"", "“利益÷資本”"]] },
  // 源 p23 “デフォルトゲートウェイ”。〔ネットワーク構成〕の言語化は描画補助で不変 (§4b)。
  "2019h31h-q058": { jp: [["stem", "「デフォルトゲートウェイ」", "“デフォルトゲートウェイ”"]] },
  "2019h31h-q078": { jp: [["stem", "「", "“", 4], ["stem", "」", "”", 4], ["stem", "、", "，", 1]] },
  "2019h31h-q098": { jp: [["stem", "「", "“", 2], ["stem", "」", "”", 2]] },
  // 源 p18「次の記述中の a，b に入れる」「システム監査は，」。field 内の「, 」1 個も「，」に揃える (field が源と同字種で一様になる)。
  "2021r03-q038": { jp: [["stem", "a, bに入れる", "a，bに入れる"], ["stem", "、", "，", 2]] },
  // 源 p35: 読点「，」、注は (注)。「変換（ループ端）」は記号形の言語化で不変 (§4b)。zh も〔注〕→（注）、en は既に (Note)。
  "2021r03-q074": {
    // Rule D NIT-1: 同 field を書き換えるので、ループ端の「k：1, 1, 3」の ASCII 読点も源の「，」に (D-170、zh は不変)。
    jp: [["stem", "、", "，", 9], ["stem", "〔注〕", "（注）", 3], ["stem", "k：1, 1, 3", "k：1，1，3"]],
    zh: [["stem", "〔注〕", "（注）", 3]],
  },
  "2021r03-q095": { jp: [["stem", "「", "“", 2], ["stem", "」", "”", 2]] },
  "2023r05-q059": {
    jp: [["stem", "「", "“", 5], ["stem", "」", "”", 5], ["stem", "、", "，", 6],
      ...Object.entries(Q059).map(([L, t]) => [L, `[表] 会員 | ${t}`, `[表] ${t}`])],
    // zh / en の選択肢は <u>…</u> を生 HTML で持つ (corpus 唯一、quizRichText は HTML を描画しない)。「（主键：…）」の描画補助は残す。
    // Rule D MINOR: 末尾の「（主键：…）」/ "(primary key: …)" は parseChoiceWithHint で余分な見出しセル (= 偽の列) になる。別行に出すと
    // text / table になり三語同形 (tables:1) が崩れる → 2018h30h-q081 の前例どおりセル内の「（主键）」/ " (PK)" に移す (列数は jp と一致)。
    zh: ["ア", "イ", "ウ", "エ"].flatMap((L) => [[L, "<u>", "", L < "ウ" ? 1 : 2], [L, "</u>", "", L < "ウ" ? 1 : 2], [L, ...Q059PK[L][0]]]),
    en: ["ア", "イ", "ウ", "エ"].flatMap((L) => [[L, "<u>", "", L < "ウ" ? 1 : 2], [L, "</u>", "", L < "ウ" ? 1 : 2], [L, ...Q059PK[L][1]]]),
  },
  // 源 p35: 題幹は “合格”/“不合格” と「，」、選択肢は ≧ と '合格'。同型 2019h31h-q098 の表示 (3 層とも ≧ / '…') に揃える。
  "2023r05-q075": {
    jp: [["stem", "「", "“", 2], ["stem", "」", "”", 2], ["stem", "、", "，", 5],
      ...["ア", "イ", "ウ", "エ"].flatMap((L) => [[L, ">=", "≧", 1], [L, "\"", "'", 4]])],
    zh: ["ア", "イ", "ウ", "エ"].flatMap((L) => [[L, ">=", "≧", 1], [L, "\"", "'", 4]]),
    en: ["ア", "イ", "ウ", "エ"].flatMap((L) => [[L, ">=", "≧", 1], [L, "\"", "'", 4]]),
  },
  "2023r05-q086": {
    jp: [...Object.entries(Q086).map(([L, [[a, b]]]) => [L, `a：${a}鍵，b：${b}鍵`, `a：${a}，b：${b}`])],
    zh: Object.entries(Q086).map(([L, [, [a, b]]]) => [L, `a：${a}密钥，b：${b}密钥`, `a：${a}，b：${b}`]),
    en: Object.entries(Q086).map(([L, [, , [a, b]]]) => [L, `a: ${a} key, b: ${b} key`, `a: ${a}, b: ${b}`]),
  },
  // ── 選択肢 (raw = 出荷層) ───────────────────────────────────────────────────
};

// ── 解説 (.phase2 が真相源 → 再 merge) ─────────────────────────────────────
//  2023r05-q075: 解説の条件式 (A2+B2)>=120 を選択肢の字形 ≧ に (jp / zh / en、B13 q093 と同型)。
//  2023r05-q086: 解説の「a：共通鍵、b：公開鍵」は解説者の概念語 (共通鍵暗号) として正しく、選択肢の引用ではない → 不変 (§4a)。
const EXPL = {
  "2023r05-q075": { all: [[">=", "≧"]] },
};

const MARK = "fidfix-S130-x2";

// D-143: final の note_jp のみ追記。round1 は不可触。対象 = 語義是正 + 正解肢命中 + note が是正対象の字句・是正前の表示に言及。
//   語義: q059 (表名ラベル = 偽の列) / 正解肢命中: 2023r05-q059 (エ) q075 (ウ) q086 (ア)
//   note 言及: 2019h31h-q078 / 2021r03-q095 (「stem_jp_clean は…と完全一致」) 2018h30a-q057 (「stem_jp_clean は源と整合」)
const NOTE_APPEND = {
  "2023r05-q059": (p) => `（S130 X2: ${p} 実読で 題幹の「」と「、」を源の “” と「，」に是正し、選択肢ア〜エ の先頭の表名ラベル「会員 |」（源の枠に無く、表示では列「会員」になる）を除去。zh / en の選択肢の生 HTML <u></u> も除去（主キーの括弧書きは保持）。エは**正解肢**だが属性集合は不変で、会員番号は店舗ごとに付与 → 主キー {会員番号, 店舗コード}、会員種別コードを持つ = エという導出・correct_answer=エ は不変 — ${MARK}）`,
  "2023r05-q075": (p) => `（S130 X2: ${p} 実読で 題幹の「」と「、」を源の “” と「，」に、選択肢ア〜エ（zh / en・解説も）の >= と "合格" を源の ≧ と '合格' に是正（同型 2019h31h-q098 と同じ字形）。ウは**正解肢**だが字形のみの変更で、(1) 又は (2) = 論理和、真側が '合格' = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2023r05-q086": (p) => `（S130 X2: ${p} 実読で 選択肢ア〜エ（zh / en も）の「共通鍵」「公開鍵」「秘密鍵」を源の表の値「共通」「公開」「秘密」に是正（図の空欄は「[a] 鍵」）。アは**正解肢**だが補われた「鍵」の除去のみで、メッセージは共通鍵、共通鍵は受信者の公開鍵で暗号化 = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2019h31h-q078": (p) => `（S130 X2: ${p} 実読で 題幹の「社員」「部署」の「」と「、」を源の “” と「，」に是正（上記の「完全一致」は字形を除く）。相違は H002・H003 の 2 人 = イという導出・correct_answer=イ は不変 — ${MARK}）`,
  "2021r03-q095": (p) => `（S130 X2: ${p} 実読で 題幹の「商品」「売上」の「」を源の “” に是正（上記の「完全一致」は字形を除く）。商品B・商品C = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2018h30a-q057": (p) => `（S130 X2: ${p} 実読で 題幹の「①~③」を源の「①～③」に是正（上記の「源と整合」は字形を除く）。②③ = エという導出・correct_answer=エ は不変 — ${MARK}）`,
};

// D-143 の純粋後置を守るため、既存の追記句の訂正は別の後置で行う (Rule D MINOR、B13 NOTE_CORR と同型)。
//   NOTE_APPEND の q059 の文は初版のまま残す (新規 HEAD からの適用でも live と同じ note になる)。
const NOTE_CORR = {
  "2023r05-q059": "（S130 X2 訂正: 上記追記の初版は zh / en の主キー括弧書きを末尾に「保持」としたが、表示では余分な列になるため Rule D MINOR によりセル内の「（主键）」/「(PK)」に移した — fidfix-S130-x2-corr）",
};
// ── 適用 ──────────────────────────────────────────────────────────────────────
const exams = [...new Set(Object.keys(FIX).map((id) => id.split("-q")[0]))];
const noteExams = [...new Set(Object.keys(NOTE_APPEND).map((id) => id.split("-q")[0]))];
const Qdoc = rj(P("data/ip/quiz/questions.json")); const Bdoc = rj(P("data/ip/exams/question_bank.json")); const Barr = Bdoc.questions ?? Bdoc;
const BY = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/exams/by_year", `${e}.json`))]));
const TR = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/quiz/translations", `${e}.json`))]));
const GR = Object.fromEntries(noteExams.map((e) => [e, rj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`))]));
const pg = (id) => `page-${String(Barr.find((x) => x.id === id).source.page_number).padStart(2, "0")}`;

for (const [id, fx] of Object.entries(FIX)) {
  const exam = id.split("-q")[0];
  const qq = Qdoc.questions.find((x) => x.id === id), b = Barr.find((x) => x.id === id), y = BY[exam].questions.find((x) => x.id === id), t = TR[exam].questions[id];
  const t1f = P("data/ip/quiz/.phase1", `tr_${id}.json`); const t1 = existsSync(t1f) ? rj(t1f) : null;
  for (const o of fx.jp ?? []) {
    const field = o[0];
    if (field === "stem") {
      // stem_jp_clean がある題は表示 = clean。raw は別文 (OCR 崩れ・ASCII 読点) なので n=0 で skip、偶然の一致で n≠想定なら abort。
      if (t?.stem_jp_clean) { op(t, "stem_jp_clean", o, `${id} translations.stem_jp_clean`); if (t1?.stem_jp_clean) op(t1, "stem_jp_clean", o, `${id} .phase1 tr_.stem_jp_clean`, true); }
      else for (const [x, w] of [[qq, "questions.stem_jp"], [b, "question_bank.stem_jp"], [y, "by_year.stem_jp"]]) op(x, "stem_jp", o, `${id} ${w}`);
    } else for (const [x, w] of [[qq, "questions"], [b, "question_bank"], [y, "by_year"]]) op(x.choices_jp, field, o, `${id} ${w}.choices_jp.${field}`);
  }
  for (const lang of ["zh", "en"]) for (const o of fx[lang] ?? []) {
    const field = o[0];
    if (field === "stem") { op(t.stem, lang, o, `${id} translations.stem.${lang}`); if (t1) op(t1.stem, lang, o, `${id} .phase1 tr_.stem.${lang}`, true); }
    else { op(t.choices[field], lang, o, `${id} translations.choices.${field}.${lang}`); if (t1) op(t1.choices.find((c) => c.letter === field), lang, o, `${id} .phase1 tr_.choices.${field}.${lang}`, true); }
  }
  if (t1) wj(t1f, t1);
}
wj(P("data/ip/quiz/questions.json"), Qdoc); wj(P("data/ip/exams/question_bank.json"), Bdoc);
for (const e of exams) { wj(P("data/ip/exams/by_year", `${e}.json`), BY[e]); wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]); }

for (const [id, ex] of Object.entries(EXPL)) {
  const jf = P("data/ip/quiz/.phase2", `expl_jp_${id}.json`), tf = P("data/ip/quiz/.phase2", `expl_tr_${id}.json`);
  const j = rj(jf), tr = rj(tf);
  for (const [from, to] of ex.all ?? []) {
    subAll(j, "correct_jp", from, to, `${id} expl_jp.correct`);
    for (const d of j.distractors_jp) subAll(d, "why_wrong_jp", from, to, `${id} expl_jp.${d.letter}`);
    j.points_jp.forEach((_, i) => subAll(j.points_jp, i, from, to, `${id} expl_jp.points[${i}]`));
    for (const L of ["zh", "en"]) {
      subAll(tr.correct, L, from, to, `${id} expl_tr.correct.${L}`);
      for (const d of tr.distractors) subAll(d, L, from, to, `${id} expl_tr.${d.letter}.${L}`);
      for (const [i, pt] of tr.points.entries()) subAll(pt, L, from, to, `${id} expl_tr.points[${i}].${L}`);
    }
  }
  wj(jf, j); wj(tf, tr);
}

for (const [id, mk] of Object.entries(NOTE_APPEND)) {
  const r = GR[id.split("-q")[0]].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if ((r.key_guard.note_jp ?? "").includes(MARK)) { skipped++; continue; }
  r.key_guard.note_jp = `${r.key_guard.note_jp ?? ""}${mk(pg(id))}`; applied++; log.push(`  ✓ ${id} final note: 追記 (${pg(id)}, round1 untouched)`);
}
for (const [id, txt] of Object.entries(NOTE_CORR)) {
  const r = GR[id.split("-q")[0]].results.find((x) => x.id === id);
  if (r.key_guard.note_jp.includes("fidfix-S130-x2-corr")) { skipped++; continue; }
  if (!r.key_guard.note_jp.includes(MARK)) throw new Error(`${id}: 訂正の対象の追記が無い — abort`);
  r.key_guard.note_jp = `${r.key_guard.note_jp}${txt}`; applied++; log.push(`  ✓ ${id} final note: 訂正を後置 (round1 untouched)`);
}
for (const e of noteExams) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);

console.log(log.join("\n"));
console.log(`  files ${DRY ? "to write" : "written"} (${written.length}): ${written.join(", ")}`);
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S130-x2: applied ${applied}, skipped ${skipped}`);
