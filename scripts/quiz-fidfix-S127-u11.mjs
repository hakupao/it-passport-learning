#!/usr/bin/env node
// Stage 6 / Quiz — S127 ⑤-2 全量保真掃引 **U11** (2026r08、71 問 / Sonnet 5 単 pass) の差分を是正する。
// 源: S127 の workflow `wf_326d0bb2-9e3`。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u11_2026r08_sn.json
//     マニフェスト = data/ip/quiz/.phase2/u11_fidelity_input_2026r08.json (precrop 61/71、skip 10 = page_mismatch 9 + merged_preamble 1)
//     機械 diff = node scripts/quiz-fidelity-machdiff.mjs <manifest> <結果>
//               → same 352 / AGENT_MISSED 3 (q072 = 下線の文字化 (主キー) の描画補助、q074 = 問文の表後への移動、
//                 q078 ウ = 実残差) / VERDICT_CONFLICT 0
//
// 層・方針は quiz-fidfix-S122-u3a 〜 S126-u10 と同じ:
//   - translations sidecar は **再 merge 禁止** (S117 §10a 失敗②)。sidecar と .phase1 の両方に同じ置換を当てる
//   - stem は raw (questions / question_bank / by_year の stem_jp) と表示層 (stem_jp_clean) の**両方**に当てる。
//     片方にしか無い腐敗は assert-once の n===0 で自動 skip される
//   - explanations は .phase2 (expl_jp_ / expl_tr_) が真相源 → 是正後に quiz-phase2-merge で再生成 (D-143)
//   - key_guard note は **final のみ**、round1 不可触 (D-143 §3)。MARK 冪等
//   - sub() は置換後に **to の肯定確認** を assert する (S121 reviewer 指摘)
//
// 2026r08 の sidecar のキーは `stem` / `choices` / `stem_jp_clean` (100 題中 54 題) で、**`choices_jp_clean` は存在しない** (実測)。
// 選択肢は raw 3 層がそのまま出荷層 → 下記の選択肢是正はすべて**学習者に見えていた**腐敗。
// q032 / q040 / q066 / q084 / q090 / q094 は stem_jp_clean を持たない (raw stem が出荷層)。
// 2026r08 の generate_result の final note_jp は 100 題中 98 題が空文字 (実測) → 追記後の final は MARK 文のみになる。
//
// 適用ループ (sub / subN / FIX / STEMN / expl 単一読み / NOTE_APPEND) は U10 から無変更で流用。
//
// 採用した差分 (evidence §6。源 crop / 源ページを原寸で独立実読して確認):
//   q025 stem   (p11) clean「"ビッグデータ"」→ 源 “ビッグデータ” (fixer 走査、agent CLEAN。raw は「"ビッグデー タ”」の崩れで N5)
//   q032 ア/イ/ウ (p14) 「販売才とだ民Lた」→「販売することにした」/「( 社」→「C 社」/「加エ」→「加工」(ウは**正解肢**)。
//                 zh / en イ は「C」を落として訳していた → 追随
//   q040 ウ     (p18) 「回避" で対応」→ 源「“回避”で対応」
//   q041 ア/ウ  (p19) 「をも・ たせない」→「をもたせない」/「その他理的」→「その倫理的」(ウは**正解肢**)
//   q049 イ/ウ/エ (p23) 「におからない」→「にならない」/ 末尾「␠×5「」「␠×7「」除去
//   q066 stem   (p31) 「複雑な操作」→ 源「煩雑な操作」(zh「复杂」/ en "complex" と解説の題幹引用も追随)
//   q070 イ     (p34) 「模僚」→ 源「模倣」(zh「为防止再次发生」/ en "preventing recurrence" は誤読を「再発」と推測した訳 → 追随)
//   q072 stem   (p35) clean「「口座」表，「顧客」表及び「取引明細」表」→ 源 “” (raw は別の崩れで N5、.phase1 は既に “”)
//   q078 ウ     (p38) 「キャリアグリゲーション」→ 源「キャリアアグリゲーション」(machdiff 実残差)
//   q082 ア/エ  (p39) 末尾「␠×13「」/「ー 39 一␠×5“」除去 (アは**正解肢**)
//   q084 ア〜エ (p40) ASCII " ×6 → 源 “…” ×3 組 (fixer 走査、agent CLEAN。エは**正解肢**)
//   q090 イ     (p44) 「という "信頼の輪"によって」→ 源「という“信頼の輪”によって」
//   q091 イ     (p45) 末尾「␠×16「」除去
//   q094 stem   (p46) raw の閉じ引用符 ASCII " ×4 → 源 ” (STEMN)
//
// Run: node scripts/quiz-fidfix-S127-u11.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S127-u11.mjs --apply
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2026r08
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

// subN: 出現数 n を厳密に要求して全置換。0 回なら skip (冪等)、n と違えば中断。
// 事後確認は「置換前の to 出現数 + n」と完全一致。
function subN(obj, key, from, to, n, where) {
  const s = obj?.[key];
  if (typeof s !== "string") throw new Error(`${where}: field ${key} missing`);
  const k = s.split(from).length - 1;
  if (k === 0) { skipped++; return false; }
  if (k !== n) throw new Error(`${where}: 「${from}」 occurs ${k}× (expected ${n}) — abort`);
  const before = s.split(to).length - 1;
  const next = s.split(from).join(to);
  if (next.split(to).length - 1 !== before + n) throw new Error(`${where}: 置換後の to 「${to}」 の出現数が ${before}+${n} と一致しない — abort`);
  obj[key] = next; applied++; log.push(`  ✓ ${where}: 「${from}」→「${to}」 ×${n}`); return true;
}

// q084: 開き / 閉じが同じ ASCII " なので subN は使えない。選択肢全文を from にして (assert-once)、
// to は " の対を “…” に置き換えたもの。対の数は 3 を要求する。
const Q84 = (s) => {
  if ((s.match(/"/g) || []).length !== 6) throw new Error(`q084: ASCII " が 6 個でない — abort: ${s.slice(0, 30)}`);
  return [s, s.replace(/"([^"]*)"/g, "“$1”")];
};

const FIX = {
  // ── 題幹 ────────────────────────────────────────────────────────────────────
  "2026r08-q025": { jp: [["stem", "情報資産を\"ビッグデータ\"と定義", "情報資産を“ビッグデータ”と定義"]] },
  "2026r08-q066": {
    jp: [["stem", "複雑な操作を簡単に", "煩雑な操作を簡単に"]],
    zh: [["stem", "使复杂的操作能够简单完成", "使繁琐的操作能够简单完成"]],
    en: [["stem", "lets you perform complex operations easily", "lets you perform cumbersome operations easily"]],
  },
  "2026r08-q072": { jp: [["stem", "「口座」表，「顧客」表及び「取引明細」表", "“口座”表，“顧客”表及び“取引明細”表"]] },
  // q094: clean 無し → raw stem が出荷層。閉じ引用符の ASCII " ×4 → ” (subN、下の STEMN)。
  // ── 選択肢 ──────────────────────────────────────────────────────────────────
  // q032: ウ は **正解肢** (correct_answer=ウ は不変)。
  "2026r08-q032": {
    jp: [
      ["ア", "安価な商品を全国で販売才とだ民Lた。", "安価な商品を全国で販売することにした。"],
      ["イ", "業界3位の( 社と", "業界3位の C 社と"],
      ["ウ", "金属加エメーカー", "金属加工メーカー"],
    ],
    zh: [["イ", "决定与行业排名第3的公司进行经营合并", "决定与行业排名第3的C公司进行经营合并"]],
    en: [["イ", "decided to merge with the third-largest company in order", "decided to merge with C, the third-largest company, in order"]],
  },
  "2026r08-q040": { jp: [["ウ", "全てを回避\" で対応する。", "全てを“回避”で対応する。"]] },
  // q041: ウ は **正解肢** (correct_answer=ウ は不変)。
  "2026r08-q041": { jp: [["ア", "責任をも・ たせないと", "責任をもたせないと"], ["ウ", "その他理的な行動", "その倫理的な行動"]] },
  "2026r08-q049": {
    jp: [
      ["イ", "中途半端におからないように", "中途半端にならないように"],
      ["ウ", `常に参加する。${" ".repeat(5)}「`, "常に参加する。"],
      ["エ", `募って確定する。${" ".repeat(7)}「`, "募って確定する。"],
    ],
  },
  "2026r08-q070": {
    jp: [["イ", "模僚を防ぐために", "模倣を防ぐために"]],
    zh: [["イ", "为防止再次发生而不用于", "为防止模仿而不用于"]],
    en: [["イ", "for the purpose of preventing recurrence.", "for the purpose of preventing imitation."]],
  },
  "2026r08-q078": { jp: [["ウ", "キャリアグリゲーション", "キャリアアグリゲーション"]] },
  // q082: ア は **正解肢** (correct_answer=ア は不変)。
  "2026r08-q082": { jp: [["ア", `誤差を小さくする。${" ".repeat(13)}「`, "誤差を小さくする。"], ["エ", `処理速度を高める。ー 39 一${" ".repeat(5)}“`, "処理速度を高める。"]] },
  // q084: エ は **正解肢** (correct_answer=エ は不変)。
  "2026r08-q084": {
    jp: [
      ["ア", ...Q84("\"HDD とSSD は記憶装置である\"と入力した後に，\"HDD の台数を増やすと記憶容量が増える\"と入力した。出力は，\"SSD の台数を増やすと記憶容量が増える\"となった。")],
      ["イ", ...Q84("\"HDD は台数を増やすと記憶容量が増える\"と入力した後に，\"記憶装置は台数を増やすと記憶容量が増える\"と入力した。出力は，\"HDD は記憶装置である\"となった。")],
      ["ウ", ...Q84("\"記憶装置である HDD は記憶容量をもつ\"と入力し，同時に\"記憶装置であるSSD は記憶容量をもつ\"と入力した。出力は，\"全ての記憶装置は記憶容量をもつ\"となった。")],
      ["エ", ...Q84("\"全ての記憶装置は記憶容量をもつ\"と入力した後に，\"HDD は記憶装置である\"と入力した。出力は，\"HDD は記憶容量をもつ\"となった。")],
    ],
  },
  "2026r08-q090": { jp: [["イ", "という \"信頼の輪\"によって", "という“信頼の輪”によって"]] },
  "2026r08-q091": { jp: [["イ", `全て同じになる。${" ".repeat(16)}「`, "全て同じになる。"]] },
};
// raw stem の多重出現 (subN、3 層): q094 閉じ引用符。
const STEMN = { "2026r08-q094": [["対策\"", "対策”", 4]] };

// ── 解説 (.phase2 が真相源 → 再 merge) ─────────────────────────────────────
//  q066 のみ: correct の「設問の『…複雑な操作を…』という説明」は題幹の直接引用 → 源の「煩雑」に追随 (U9 §4b の線引き)。
//    ア / ウ / エ と points の「複雑な設定や操作」等は解説者自身の語 → 不変。
const EXPL = {
  "2026r08-q066": {
    correct: {
      jp: ["設問の「質問に答えていく対話形式によって、複雑な操作を簡単に行えるようにする機能」", "設問の「質問に答えていく対話形式によって、煩雑な操作を簡単に行えるようにする機能」"],
      zh: ["题目中「通过依次回答提问的对话形式，使复杂的操作能够简单完成的功能」", "题目中「通过依次回答提问的对话形式，使繁琐的操作能够简单完成的功能」"],
      en: ["namely a function that makes complex operations easy through an interactive question-and-answer format", "namely a function that makes cumbersome operations easy through an interactive question-and-answer format"],
    },
  },
};

const MARK = "fidfix-S127-u11";
const pg = (id) => { const b = JSON.parse(readFileSync(P("data/ip/exams/question_bank.json"), "utf-8")).questions.find((x) => x.id === id); return `page-${String(b.source.page_number).padStart(2, "0")}`; };

// D-143: final の note_jp のみ追記。round1 は不可触。対象 = 語義是正 + 正解肢命中 (U3a〜U10 と同一方針)。
//   語義: q032 q041 q049 q066 q070 q078 / 正解肢命中: q032 (ウ) q041 (ウ) q082 (ア) q084 (エ、引用符のみ)
//   追記しない (括弧・引用符・空白・残渣のみ、非正解肢): q025 q040 q072 q090 q091 q094
const NOTE_APPEND = {
  "2026r08-q032": (p) => `（S127 ⑤-2 U11: ${p} 実読で 選択肢アの「販売才とだ民Lた」を源の「販売することにした」、イの「( 社」を源の「C 社」（zh / en も C を補う）、ウの「加エ」を源の「加工」に是正。ウは**正解肢**だが変更は字形のみで、自社固有の加工技術を生かし高級レストラン向けという限定市場に絞る = ニッチ戦略という導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2026r08-q041": (p) => `（S127 ⑤-2 U11: ${p} 実読で 選択肢ウの「その他理的な行動」を源の「その倫理的な行動」に是正し、アの「をも・ たせない」の源に無い「・」と空白を除去。ウは**正解肢**で、取締役会等が規範を策定し率先して遵守しないと倫理的な行動が徹底されない = リーダーシップに関するリスクという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2026r08-q049": (p) => `（S127 ⑤-2 U11: ${p} 実読で 選択肢イの「中途半端におからない」を源の「中途半端にならない」に是正し、ウ・エ末尾の空白・「「」（OCR 残渣）を除去。いずれも誤答肢のため、議事録を作成して関係者と共有する = 適切という導出・答え（ア）は不変 — ${MARK}）`,
  "2026r08-q066": (p) => `（S127 ⑤-2 U11: ${p} 実読で 題幹の「複雑な操作」を源の「煩雑な操作」に是正（zh / en と解説の題幹引用も追随）。質問に答える対話形式で操作を簡単にする = ウィザードという導出・答え（イ）は不変 — ${MARK}）`,
  "2026r08-q070": (p) => `（S127 ⑤-2 U11: ${p} 実読で 選択肢イの「模僚」を源の「模倣」に是正（zh / en は誤読を「再発」と推測して訳していたため「模倣」に追随）。誤答肢のため、事象の報告経路と仕組みをあらかじめ用意する = 適切という導出・答え（エ）は不変 — ${MARK}）`,
  "2026r08-q078": (p) => `（S127 ⑤-2 U11: ${p} 実読で 選択肢ウの「キャリアグリゲーション」を源の「キャリアアグリゲーション」に是正（「ア」の脱落）。誤答肢のため、外気温を電気信号に変換する = センサーという導出・答え（エ）は不変 — ${MARK}）`,
  "2026r08-q082": (p) => `（S127 ⑤-2 U11: ${p} 実読で 選択肢ア末尾の空白・「「」と、エ末尾のページ番号残渣「ー 39 一」・空白・「“」（OCR 残渣）を除去。アは**正解肢**だが変更は文末の残渣のみで、各ノードの重みを調整して誤差を小さくする = バックプロパゲーションという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2026r08-q084": (p) => `（S127 ⑤-2 U11: ${p} 実読で 選択肢ア〜エの引用符 ASCII " を源の “…” に是正。エは**正解肢**だが変更は引用符の字種のみで、一般規則と個別の事実から結論を導く = 演繹推論という導出・correct_answer=エ は不変 — ${MARK}）`,
};

// ── 適用 ──────────────────────────────────────────────────────────────────────
const exams = [...new Set([...Object.keys(FIX), ...Object.keys(STEMN)].map((id) => id.split("-q")[0]))];
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
for (const [id, list] of Object.entries(STEMN)) {
  const exam = id.split("-q")[0];
  const qq = Qdoc.questions.find((x) => x.id === id), b = Barr.find((x) => x.id === id), y = BY[exam].questions.find((x) => x.id === id), t = TR[exam].questions[id];
  if (t?.stem_jp_clean) throw new Error(`${id}: stem_jp_clean が在る — STEMN は raw 出荷層専用`);
  for (const [from, to, n] of list) for (const [o, w] of [[qq, "questions.stem_jp"], [b, "question_bank.stem_jp"], [y, "by_year.stem_jp"]]) subN(o, "stem_jp", from, to, n, `${id} ${w}`);
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
  if (ex.correct) {
    const [cj, cz, ce] = [ex.correct.jp, ex.correct.zh, ex.correct.en];
    if (cj) sub(j, "correct_jp", cj[0], cj[1], `${id} expl_jp.correct_jp`);
    if (cz) sub(tr.correct, "zh", cz[0], cz[1], `${id} expl_tr.correct.zh`);
    if (ce) sub(tr.correct, "en", ce[0], ce[1], `${id} expl_tr.correct.en`);
  }
  for (const [L, d] of Object.entries(ex.dist ?? {})) {
    const dj = j.distractors_jp.find((x) => x.letter === L), dt = tr.distractors.find((x) => x.letter === L);
    if (!dj || !dt) throw new Error(`${id} distractor ${L} missing`);
    if (d.jp) sub(dj, "why_wrong_jp", d.jp[0], d.jp[1], `${id} expl_jp.${L}`);
    if (d.zh) sub(dt, "zh", d.zh[0], d.zh[1], `${id} expl_tr.${L}.zh`);
    if (d.en) sub(dt, "en", d.en[0], d.en[1], `${id} expl_tr.${L}.en`);
  }
  for (const p of ex.points ?? []) {
    if (p.jp) { const [f, t] = p.jp; const arr = j.points_jp; if (typeof arr?.[p.idx] !== "string") throw new Error(`${id} points_jp[${p.idx}] missing`);
      const box = { v: arr[p.idx] }; if (sub(box, "v", f, t, `${id} expl_jp.points[${p.idx}]`)) arr[p.idx] = box.v; }
    for (const L of ["zh", "en"]) if (p[L]) { const [f, t] = p[L]; if (typeof tr.points?.[p.idx]?.[L] !== "string") throw new Error(`${id} expl_tr.points[${p.idx}].${L} missing`);
      sub(tr.points[p.idx], L, f, t, `${id} expl_tr.points[${p.idx}].${L}`); }
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
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S127-u11: applied ${applied}, skipped ${skipped}`);
