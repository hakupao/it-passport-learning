#!/usr/bin/env node
// Stage 6 / Quiz — S125 ⑤-2 全量保真掃引 **U9** (2024r06、72 問 / Sonnet 5 単 pass) の差分を是正する。
// 源: S125 の workflow `wf_35e2fa62-0ea`。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u9_2024r06_sn.json
//     マニフェスト = data/ip/quiz/.phase2/u9_fidelity_input_2024r06.json (precrop 68/72、4 問は crop 無し → 源ページ直読)
//     機械 diff = node scripts/quiz-fidelity-machdiff.mjs <manifest> <結果>
//               → same 360 / AGENT_MISSED 0 / VERDICT_CONFLICT 0
//
// 層・方針は quiz-fidfix-S122-u3a 〜 S125-u8 と同じ:
//   - translations sidecar は **再 merge 禁止** (S117 §10a 失敗②)。sidecar と .phase1 の両方に同じ置換を当てる
//     (tr_2024r06-q085 は .phase1 に stem_jp_clean キーが無い [sidecar のみ] ので clean は sidecar だけに当たる — 実測)
//   - stem は raw (questions / question_bank / by_year の stem_jp) と表示層 (stem_jp_clean) の**両方**に当てる。
//     片方にしか無い腐敗は assert-once の n===0 で自動 skip される
//   - explanations は .phase2 (expl_jp_ / expl_tr_) が真相源 → 是正後に quiz-phase2-merge で再生成 (D-143)
//   - key_guard note は **final のみ**、round1 不可触 (D-143 §3)。MARK 冪等
//   - sub() は置換後に **to の肯定確認** を assert する (S121 reviewer 指摘)
//
// 2024r06 の sidecar / .phase1 のキーは `stem` / `choices` / `stem_jp_clean` (50 題) で、**`choices_jp_clean` は存在しない** (実測)。
// したがって選択肢は raw 3 層がそのまま出荷層であり、下記の選択肢是正はすべて**学習者に見えていた**腐敗にあたる。
//
// U8 からの変更 (U8 Rule D NIT の反映。それ以外の適用ループは U8 から逐字流用):
//   (1) NIT-1: 置換 0 のファイルは書き戻さない。読込時の JSON.stringify(d,null,2) を控え、wj で差があるときだけ書く
//       (.phase1 は 2 space pretty 形式だが直列化差を避けるため [Rule D NIT-1 で記述訂正]バイト比較ではなく正規化文字列で比較)
//   (2) NIT-2: pointSub の zh / en も対象要素が欠落していれば throw (jp と対称)
//   (3) subN() を追加: 解説の文字列リテラル引用 (q062「AABAB」ほか / q085「100」) は 1 field 内に複数回出るため、
//       **出現数を厳密に assert** したうえで全置換する (sub() の assert-once はそのまま)
//
// 採用した差分 (5 題 / 11 論理差分 = agent の 10 件 + 指示で名指しの q062 空白 1。源 crop / 源ページを原寸〜8 倍で独立実読して確認):
//   2024r06-q012 choice.ア (page-07) 「大学,研究機関企業など」→ 源「大学，研究機関，企業など」(読点脱落、同じ置換で house rule「, 」)。**ア は正解肢**
//   2024r06-q059 choice.ア (page-26、crop 無し) 「19cnm 程度」→ 源「10cm 程度」(斜線入りゼロ 0→9 + 「m」前の「n」挿入)。
//                          zh「约 10cm」/ en "about 10 cm" は既に正。解説アの OCR 注記を jp / zh / en から除去
//   2024r06-q062 stem      (page-28) clean「[プログラム]」→ 源「〔プログラム〕」(raw は「[プログラム】〕」→ 同じく是正、zh「[程序]」→「〔程序〕」)
//   2024r06-q062 stem      (page-28) clean「「AABAB」」→ 源 “AABAB” (raw の ASCII "AABAB" も、zh / en も)
//   2024r06-q062 stem      (page-28) clean の擬似言語の文字列リテラル「」「A」「B」→ “”“A”“B” (zh / en も。raw は N5 で据置)。
//                          源の擬似言語本文のリテラルは等幅書体で開き・閉じとも 99 形 (q62e/g/h 8 倍) — ASCII " の書体表示とみられる。
//                          題幹 “AABAB” / q085 の注釈 “1” と揃えて “” に統一 (evidence §4b、**Rule D 確認点**)
//   2024r06-q062 stem      (page-28) clean「convert(arrayInput) として」→ 源「convert(arrayInput)として」(raw は既に空白無しで n=0 skip)
//   2024r06-q082 choice.エ (page-37) 「クラウドサービスヘへログイン」→ 源「クラウドサービスへログイン」(片仮名「ヘ」の挿入)
//   2024r06-q085 stem      (page-38) clean「「100」」「文字「1」」→ 源 “100” / “1” (raw の ASCII "100" / "1" も、zh / en も)。
//                          raw「[プログラム]」→「〔プログラム〕」(U8 reviewer NIT-3 で名指し。clean は既に〔〕)
//
// jp 読点の字種は house rule の ASCII「, 」(D-147 §1)。
//
// 見送り (evidence §10 に理由を明記):
//   en「[Program]」(corpus 9/9 が [Program] で各言語の体裁) / 2023r05-q060 zh「[程序]」(U8 で ⑨-c 保留、本 unit 範囲外)
//   q062 raw の N5 残存 (「stringOutput で ""」「i†」「未尾」ほか、clean が出荷層)
//   expl_jp_*.json 内の key_guard.note_jp (q059「19cnm」/ q062「AABAB」/ q085「100」) — merge が読まず**非出荷** (⑨ 継続)
//   解説の地の文の「」引用 (q062「要素が1と等しい」/ en「the element equals 1」等) — 文字列リテラルではない
//
// Run: node scripts/quiz-fidfix-S125-u9.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S125-u9.mjs --apply
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2024r06
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// 既定 = dry-run (読取専用)。`--apply` で書き込む (S125 指示)。
const DRY = !process.argv.includes("--apply") || process.argv.includes("--dry-run");
const P = (...s) => path.join(ROOT, ...s);
// NIT-1: 読込時の正規化文字列を控え、変化したファイルだけを書く。
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

// assert-once: 対象文字列がちょうど 1 回だけ出ることを要求し、2 回以上なら中断 (誤爆防止)。
// 冪等: to ⊃ from で既に to が入っている、または from が 0 回なら skip。
// S121 reviewer 指摘: 置換が「本当に to を書けた」ことを肯定確認する (to が空でない場合のみ)。
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

// subN: 出現数 n を厳密に要求して全置換する (解説の文字列リテラル引用用)。0 回なら skip (冪等)、n と違えば中断。
function subN(obj, key, from, to, n, where) {
  const s = obj?.[key];
  if (typeof s !== "string") throw new Error(`${where}: field ${key} missing`);
  const k = s.split(from).length - 1;
  if (k === 0) { skipped++; return false; }
  if (k !== n) throw new Error(`${where}: 「${from}」 occurs ${k}× (expected ${n}) — abort`);
  const next = s.split(from).join(to);
  if (next.split(to).length - 1 < n) throw new Error(`${where}: 置換後に to 「${to}」 が ${n} 回見つからない — abort`);
  obj[key] = next; applied++; log.push(`  ✓ ${where}: 「${from}」→「${to}」 ×${n}`); return true;
}

const FIX = {
  // ── 題幹: 括弧・引用符・空白 (擬似言語、clean が出荷層) ────────────────────────
  // q062: raw は「[プログラム】〕」(clean の「[プログラム]」行は raw で n=0 skip、raw 行は clean で n=0 skip)。
  //       リテラル「」「A」「B」は clean にのみある (raw は N5 の崩れ「で ""」「"A”」で据置)。「AABAB」は raw では ASCII。
  "2024r06-q062": {
    jp: [
      ["stem", "[プログラム]", "〔プログラム〕"],
      ["stem", "[プログラム】〕", "〔プログラム〕"],
      ["stem", "戻り値が「AABAB」になる", "戻り値が“AABAB”になる"],
      ["stem", "戻り値が \"AABAB\" になる", "戻り値が “AABAB” になる"],
      ["stem", "convert(arrayInput) として", "convert(arrayInput)として"],
      ["stem", "stringOutput ← 「」", "stringOutput ← “”"],
      ["stem", "末尾 に 「A」 を", "末尾 に “A” を"],
      ["stem", "末尾 に 「B」 を", "末尾 に “B” を"],
    ],
    zh: [
      ["stem", "[程序]", "〔程序〕"],
      ["stem", "使返回值为「AABAB」", "使返回值为“AABAB”"],
      ["stem", "stringOutput ← 「」", "stringOutput ← “”"],
      ["stem", "的末尾追加 「A」", "的末尾追加 “A”"],
      ["stem", "的末尾追加 「B」", "的末尾追加 “B”"],
    ],
    en: [
      ["stem", "makes the return value 「AABAB」?", "makes the return value “AABAB”?"],
      ["stem", "stringOutput ← 「」", "stringOutput ← “”"],
      ["stem", "append 「A」 to", "append “A” to"],
      ["stem", "append 「B」 to", "append “B” to"],
    ],
  },
  // q085: clean の「」→“”。raw は ASCII "100" / "1" と「[プログラム]」(clean は既に〔〕)。
  "2024r06-q085": {
    jp: [
      ["stem", "引数として「100」を受け取る", "引数として“100”を受け取る"],
      ["stem", "引数として\"100\"を受け取る", "引数として“100”を受け取る"],
      ["stem", "// 例: 文字「1」であれば", "// 例: 文字“1”であれば"],
      ["stem", "// 例: 文字\"1\"であれば", "// 例: 文字“1”であれば"],
      ["stem", "[プログラム]", "〔プログラム〕"],
    ],
    zh: [
      ["stem", "例如，接收「100」作为参数时", "例如，接收“100”作为参数时"],
      ["stem", "若为字符「1」则转换", "若为字符“1”则转换"],
    ],
    en: [
      ["stem", "when it receives 「100」 as an argument", "when it receives “100” as an argument"],
      ["stem", "the character 「1」 is converted", "the character “1” is converted"],
    ],
  },
  // ── 選択肢 ──────────────────────────────────────────────────────────────────
  // q012: ア は **正解肢** (correct_answer=ア は不変)。読点脱落の復元と同 from 内の読点を house rule に。
  "2024r06-q012": { jp: [["ア", "推進し, 大学,研究機関企業など, 官民", "推進し, 大学, 研究機関, 企業など, 官民"]] },
  // q059: 斜線入りゼロの 0→9 誤読 (U5 / U7 / U8 に続く)。zh / en は既に 10cm。
  "2024r06-q059": { jp: [["ア", "19cnm 程度の近距離", "10cm 程度の近距離"]] },
  // q082: 片仮名「ヘ」(U+30D8) の挿入。
  "2024r06-q082": { jp: [["エ", "クラウドサービスヘへログイン", "クラウドサービスへログイン"]] },
};

// ── 解説 (.phase2 が真相源 → 再 merge) ─────────────────────────────────────
//  - q059: 誤答肢アの OCR 注記は是正後に偽 → jp・zh・en から除去 (U7 `2022r04-q014` / U8 `2023r05-q024` precedent)
//  - q062 / q085: 解説が引く設問の文字列リテラル (戻り値・出力文字・引数) を題幹の是正に揃えて「」→“” (subN、出現数 assert)。
//      q062 の「BBABA」「BABAA」「ABABB」は誤答肢から導いた戻り値で、同じ文字列リテラルとして揃える。
//      地の文の「」引用 (「要素が1と等しい」/ en「the element equals 1」/ 見出し語) は不変。
const LIT62 = ["「AABAB」", "「BBABA」", "「BABAA」", "「ABABB」", "「A」", "「B」"];
const q = (s) => `“${s.slice(1, -1)}”`;
const EXPL = {
  "2024r06-q059": {
    distSub: {
      ア: {
        jp: [["の説明であり、OCR とは無関係。(記載の「19cnm 程度」は OCR 化けで本来「10cm 程度」と思われる)", "の説明であり、OCR とは無関係。"]],
        zh: [["与 OCR 无关。（原文所记的「19cnm 程度」疑为 OCR 乱码，本应为「约 10cm」）", "与 OCR 无关。"]],
        en: [["which has nothing to do with OCR. (The stated 「19cnm」 appears to be an OCR garble and should read about 10 cm.)", "which has nothing to do with OCR."]],
      },
    },
  },
};
// subN の対象 (field パスごとの期待出現数は適用前に実測して固定)。
const LITSUB = {
  "2024r06-q062": { lits: LIT62 },
  "2024r06-q085": { lits: ["「100」"] },
};

const MARK = "fidfix-S125-u9";
const pg = (id) => { const b = JSON.parse(readFileSync(P("data/ip/exams/question_bank.json"), "utf-8")).questions.find((x) => x.id === id); return `page-${String(b.source.page_number).padStart(2, "0")}`; };

// D-143: final の note_jp のみ更新。round1 は不可触。
// 方針 (U3a〜U8 と同一): 語義是正 / 正解肢命中 に限り追記する。
//   - 語義: q059 q082 / 正解肢命中: q012
//   - 追記しない (題幹の括弧・引用符・空白のみ): q062 / q085
const NOTE_APPEND = {
  "2024r06-q012": (p) => `（S125 ⑤-2 U9: ${p} 実読で 選択肢アの「大学,研究機関企業など」を源の「大学，研究機関，企業など」に是正（読点の脱落で「研究機関企業」が 1 語に見えていた）。ア は**正解肢**だが変更は区切り記号のみで、国際化・多様化の推進と産学官の連携・人材の移動 = イノベーションの原則という導出・correct_answer=ア は不変 — ${MARK}）`,
  "2024r06-q059": (p) => `（S125 ⑤-2 U9: ${p} 実読で 選択肢アの「19cnm 程度」を源の「10cm 程度」に是正（源の 0 は斜線入りゼロ）し、解説アの OCR 注記を jp / zh / en から除去。誤答肢（NFC の説明）のため、印刷・手書き文字を認識してテキストデータに変換する = OCR という導出・答え（イ）は不変 — ${MARK}）`,
  "2024r06-q082": (p) => `（S125 ⑤-2 U9: ${p} 実読で 選択肢エの「クラウドサービスヘへログイン」を源の「クラウドサービスへログイン」に是正（源に無い片仮名「ヘ」の挿入）。誤答肢（リスクベース認証の説明）のため、クラウドサービス固有の管理策の実施を認証する制度 = ISMS クラウドセキュリティ認証という導出・答え（イ）は不変 — ${MARK}）`,
};
const NOTE_SUB = {};
// ── 適用 ──────────────────────────────────────────────────────────────────────
const exams = [...new Set(Object.keys(FIX).map((id) => id.split("-q")[0]))];
const noteExams = [...new Set([...Object.keys(NOTE_APPEND), ...Object.keys(NOTE_SUB)].map((id) => id.split("-q")[0]))];
const Qdoc = rj(P("data/ip/quiz/questions.json")); const Bdoc = rj(P("data/ip/exams/question_bank.json")); const Barr = Bdoc.questions ?? Bdoc;
const BY = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/exams/by_year", `${e}.json`))]));
const TR = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/quiz/translations", `${e}.json`))]));
const GR = Object.fromEntries(noteExams.map((e) => [e, rj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`))]));

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
  for (const [L, d] of Object.entries(ex.distSub ?? {})) {
    const dj = j.distractors_jp.find((x) => x.letter === L), dt = tr.distractors.find((x) => x.letter === L);
    for (const [f, t] of d.jp ?? []) sub(dj, "why_wrong_jp", f, t, `${id} expl_jp.${L}`);
    for (const [f, t] of d.zh ?? []) sub(dt, "zh", f, t, `${id} expl_tr.${L}.zh`);
    for (const [f, t] of d.en ?? []) sub(dt, "en", f, t, `${id} expl_tr.${L}.en`);
  }
  if (ex.correctSub) {
    for (const [f, t] of ex.correctSub.jp ?? []) sub(j, "correct_jp", f, t, `${id} expl_jp.correct_jp`);
    for (const [f, t] of ex.correctSub.zh ?? []) sub(tr.correct, "zh", f, t, `${id} expl_tr.correct.zh`);
    for (const [f, t] of ex.correctSub.en ?? []) sub(tr.correct, "en", f, t, `${id} expl_tr.correct.en`);
  }
  for (const p of ex.pointSub ?? []) {
    if (p.jp) { const [f, t] = p.jp; const arr = j.points_jp; if (typeof arr?.[p.idx] !== "string") throw new Error(`${id} points_jp[${p.idx}] missing`);
      const box = { v: arr[p.idx] }; if (sub(box, "v", f, t, `${id} expl_jp.points[${p.idx}]`)) arr[p.idx] = box.v; }
    // NIT-2: zh / en も要素欠落で throw (jp と対称)。
    for (const L of ["zh", "en"]) if (p[L]) { const [f, t] = p[L]; if (typeof tr.points?.[p.idx]?.[L] !== "string") throw new Error(`${id} expl_tr.points[${p.idx}].${L} missing`);
      sub(tr.points[p.idx], L, f, t, `${id} expl_tr.points[${p.idx}].${L}`); }
  }
  wj(jf, j); wj(tf, tr);
}

// 解説の文字列リテラル: 出荷される field (correct / distractors / points) だけを走査。key_guard (非出荷) は触らない。
// 期待出現数は field ごとに適用前の実数を数えて固定する (EXPECT)。再実行時は 0 回 → skip。
const EXPECT = {
  "2024r06-q062": {
    "jp.correct_jp": { "「AABAB」": 2, "「A」": 1, "「B」": 1 },
    "jp.distractors.ア": { "「AABAB」": 1, "「BBABA」": 1 },
    "jp.distractors.イ": { "「AABAB」": 1, "「BABAA」": 1 },
    "jp.distractors.ウ": { "「AABAB」": 1, "「ABABB」": 1 },
    "jp.points.0": { "「A」": 1, "「B」": 1 },
    "jp.points.1": { "「AABAB」": 1 },
    "zh.correct": { "「AABAB」": 2, "「A」": 1, "「B」": 1 }, "en.correct": { "「AABAB」": 2, "「A」": 1, "「B」": 1 },
    "zh.distractors.ア": { "「AABAB」": 1, "「BBABA」": 1 }, "en.distractors.ア": { "「AABAB」": 1, "「BBABA」": 1 },
    "zh.distractors.イ": { "「AABAB」": 1, "「BABAA」": 1 }, "en.distractors.イ": { "「AABAB」": 1, "「BABAA」": 1 },
    "zh.distractors.ウ": { "「AABAB」": 1, "「ABABB」": 1 }, "en.distractors.ウ": { "「AABAB」": 1, "「ABABB」": 1 },
    "zh.points.0": { "「A」": 1, "「B」": 1 }, "en.points.0": { "「A」": 1, "「B」": 1 },
    "zh.points.1": { "「AABAB」": 1 }, "en.points.1": { "「AABAB」": 1 },
  },
  "2024r06-q085": {
    "jp.correct_jp": { "「100」": 1 }, "jp.distractors.イ": { "「100」": 1 },
    "zh.correct": { "「100」": 1 }, "en.correct": { "「100」": 1 },
    "zh.distractors.イ": { "「100」": 1 }, "en.distractors.イ": { "「100」": 1 },
  },
};
for (const [id, { lits }] of Object.entries(LITSUB)) {
  const jf = P("data/ip/quiz/.phase2", `expl_jp_${id}.json`), tf = P("data/ip/quiz/.phase2", `expl_tr_${id}.json`); const j = rj(jf), tr = rj(tf);
  const slots = [["jp.correct_jp", j, "correct_jp"], ["zh.correct", tr.correct, "zh"], ["en.correct", tr.correct, "en"]];
  for (const d of j.distractors_jp) slots.push([`jp.distractors.${d.letter}`, d, "why_wrong_jp"]);
  for (const d of tr.distractors) for (const L of ["zh", "en"]) slots.push([`${L}.distractors.${d.letter}`, d, L]);
  const pj = j.points_jp.map((v) => ({ v }));
  pj.forEach((b, i) => slots.push([`jp.points.${i}`, b, "v"]));
  tr.points.forEach((pt, i) => { for (const L of ["zh", "en"]) slots.push([`${L}.points.${i}`, pt, L]); });
  const exp = EXPECT[id];
  for (const [name, o, k] of slots) {
    const want = exp[name] ?? {};
    for (const lit of lits) {
      const n = want[lit] ?? 0;
      const have = o[k].split(lit).length - 1;
      if (n === 0) { if (have !== 0) throw new Error(`${id} ${name}: 「${lit}」 が想定外に ${have} 回 — abort`); continue; }
      subN(o, k, lit, q(lit), n, `${id} ${name}`);
    }
  }
  pj.forEach((b, i) => { j.points_jp[i] = b.v; });
  for (const name of Object.keys(exp)) if (!slots.some(([s]) => s === name)) throw new Error(`${id}: slot ${name} missing`);
  wj(jf, j); wj(tf, tr);
}

for (const [id, mk] of Object.entries(NOTE_APPEND)) {
  const r = GR[id.split("-q")[0]].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  r.key_guard.note_jp = `${r.key_guard.note_jp}${mk(pg(id))}`; applied++; log.push(`  ✓ ${id} final note: 追記 (${pg(id)}, round1 untouched)`);
}
for (const [id, mk] of Object.entries(NOTE_SUB)) {
  const r = GR[id.split("-q")[0]].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  const [from, to] = mk(pg(id));
  if (!sub(r.key_guard, "note_jp", from, to, `${id} final note`)) throw new Error(`${id}: note segment not found`);
}
for (const e of noteExams) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);

console.log(log.join("\n"));
console.log(`  files ${DRY ? "to write" : "written"} (${written.length}): ${written.join(", ")}`);
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S125-u9: applied ${applied}, skipped ${skipped}`);
