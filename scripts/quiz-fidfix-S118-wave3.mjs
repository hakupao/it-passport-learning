#!/usr/bin/env node
// Stage 6 / Quiz — S118 ⑤-2 全量保真核験 **波 3** (2017h29h 85 問 / 2018h30a 67 問、gp/cr 双 pass = 304 agent) の差分を是正する。
// 源: S118 log §38 の 4 workflow。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_S118_<exam>_<gp|cr>.json
//     機械 diff = scripts/quiz-fidelity-machdiff.mjs → AGENT_MISSED 生 7 / 去重 5 題、うち 5 題 (8 field) を採用 (偽陽性 0)。
//
// 層・方針は quiz-fidfix-S118-strat53.mjs / wave1 / wave2 と同じ:
//   - translations sidecar は **再 merge 禁止** (S117 §10a 失敗②)。sidecar と .phase1 の両方に同じ置換を当てる
//   - stem は raw (questions/bank/by_year の stem_jp) と表示層 (stem_jp_clean) の**両方**に当てる。片方にしか無い腐敗は
//     assert-once の n===0 で自動 skip される (例: 2017h29h-q043 の挿入読点は clean 層のみ、raw は源どおり)
//   - explanations は .phase2 (expl_jp_/expl_tr_) が真相源 → 是正後に quiz-phase2-merge で再生成 (D-143)
//   - key_guard note は **final のみ**、round1 不可触 (D-143 §3)。MARK 冪等
//   - 括弧・引用符は「源の字形が原寸走査で確定できるものだけ是正」(§41 の線引き)
//
// 採用した差分 (11 題 20 field。源ページ 9 枚を原解像度で実読して確認):
//   2017h29h-q014 choice.ア  「システムの状態の**居移**」→ 源「状態の**遷移**」(page-06)。zh「迁移」/ en "transitions" は既に忠実
//   2017h29h-q043 stem       源に無い読点の挿入「スコープに**は，**プロジェクトの」→「スコープには」(page-19)。
//                            **clean 層のみ**の混入 (raw stem_jp は源どおり)。machdiff 由来、双 pass 齊漏。波 1 §39 の
//                            「源に無い記号の挿入も計上」基準に従う
//   2017h29h-q070 choice.ウ  **answer_affecting**。「プログラムを**16**進数の数字列で表現する」→ 源「**10** 進数」(page-29)。
//                            源の「10 進数」は誰が見ても不適切な誤答肢だが、「16 進数」だと機械語ダンプの実務が実在するため
//                            正解肢ア と競合しうる。zh/en + 誤答肢ウ の解説 + 要点[1] を三語書換 (旧解説は 16 進数を論拠にしていた)
//   2017h29h-q071 stem       節見出し `[Aさんの電子メールの宛先設定]` → 源 `〔…〕` (page-30)。machdiff 由来。raw / clean 両層
//   2017h29h-q077 choice.ア  「様々な**入カ**条件」(U+30AB カタカナ カ) → 源「**入力**条件」(U+529B 漢字 力、page-32)。
//                            同一文内の「入力と出力」「出力結果」は既に U+529B。zh「输入条件」/ en "input conditions" は忠実
//   2017h29h-q090 stem       節見出し `[操作]` → 源 `〔操作〕`、および引用符 (page-36 実読)。
//                            源は表名 “商品” / “％” が U+201C-U+201D、値 ‘有’ ‘％うどん％’ ‘うどん％’ が U+2018-U+2019。
//                            dataset は全て 「」 に置換されていた → 波 2 の 2016h28h-q094 と同一規則で源の字形へ戻す。
//                            ％ の全半角は許容表記揺れなので ASCII % のまま (zh/en の引用符は ⑨-c で別途)
//   2018h30a-q037 choice.ウ  「プログラムに機能を**追加じた**。」→ 源「**追加した**。」(page-15)。zh/en は既に忠実
//   2018h30a-q079 stem       源に無い読点の挿入「どれか。ここで**，**データの左方」→ 源「ここでデータの左方」(page-32)。
//                            gp は audit 内に記録しつつ CLEAN 判定、cr は machdiff が捕捉。q043 と同族
//   2018h30a-q081 choice.イ/ウ/エ  丸数字の区切り「，」が全脱落「①②③」→ 源「①，②，③」(page-33)。machdiff 由来、双 pass 齊漏。
//                            §26 backlog の N6-a 同族 (2018h30a-q081 は名指しで登録済)。区切り字は同 exam の兄弟問
//                            2018h30a-q057 / q041 に合わせて jp/zh = U+FF0C、en = ASCII ", " (Rule D LOW-2 の混在回避)
//   2018h30a-q083 choice.エ  「ディジタル放送受信機に**同杜**されていて」→ 源「**同梱**」(page-33、原典は 梱 にルビ「こん」)。
//                            zh「一同附带」/ en "bundled" は既に忠実
//   2018h30a-q100 choice.ア  「各表の**先頭**から数えた」→ 源「各表の**先頭行**から数えた」(page-39)。zh/en も語を精密化
//
// 見送り (evidence に理由を明記):
//   2018h30a-q043 stem  **SOURCE_TYPOS**。源 page-18 は「プロジェクトコスト**マネンジメント**」(ン 1 字余分、IPA の誤植)。
//                       dataset は raw stem_jp が源どおり「マネンジメント」、表示層 (stem_jp_clean / .phase1) が
//                       「マネジメント」と正しい綴り = 学習者が読むのは正しい方。主 context 裁定 = 明白な源誤植は再現しない
//                       (学習者に有害) → **両層とも不変**。双 pass とも cosmetic として計上したが**データ不変**、
//                       evidence の SOURCE_TYPOS 節に登記して再掃引での再発火を防ぐ
//   2017h29h-q071 stem  〔宛先設定〕の 3 行 (To/Cc/Bcc) が 1 行に連結 — 改行/空白正規化クラス (波 2 の 2017h29a-q079 と同一)
//   2018h30a-q081 stem  ① 〜 ④ の 4 行が 1 行に連結 — 同上
//   2017h29h-q090 choice.ア/ウ  「a,b, c」「c, a,b」の読点後空白の欠落 — 空白クラス (⑤-4 R8 lane の射程、machdiff の既知盲点)
//   2017h29h-q090 zh/en stem   引用符 「」 の残存 — ⑨-c (波 2 q094 と同じ「zh/en は各言語の慣行に従う」保留)
//   clean 保有題の raw stem_jp 残存腐敗 (2017h29h-q043「事象 aeてc」/ 2018h30a-q081「①~ー④」「0pen」「0S」) — N5 系列
//
// Run: node scripts/quiz-fidfix-S118-wave3.mjs [--dry-run]
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2017h29h && node scripts/quiz-phase2-merge.mjs 2018h30a

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry-run");
const P = (...s) => path.join(ROOT, ...s);
const rj = (f) => JSON.parse(readFileSync(f, "utf-8"));
const wj = (f, d) => { if (!DRY) writeFileSync(f, JSON.stringify(d, null, 2) + "\n"); };
let applied = 0, skipped = 0; const log = [];

// assert-once: 対象文字列がちょうど 1 回だけ出ることを要求し、2 回以上なら中断 (誤爆防止)。
// 冪等: to ⊃ from で既に to が入っている、または from が 0 回なら skip。
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
  // ── 2017h29h ────────────────────────────────────────────────────────────
  "2017h29h-q014": { jp: [["ア", "システムの状態の居移を表記する。", "システムの状態の遷移を表記する。"]] },
  // clean 層のみ (raw stem_jp は源どおり読点なし → n===0 で skip される)
  "2017h29h-q043": { jp: [["stem", "スコープには，プロジェクトの成果物", "スコープにはプロジェクトの成果物"]] },
  "2017h29h-q070": {
    jp: [["ウ", "プログラムを16進数の数字列で表現する。", "プログラムを10進数の数字列で表現する。"]],
    zh: [["ウ", "机器语言用十六进制的数字串来表示程序。", "机器语言用十进制的数字串来表示程序。"]],
    en: [["ウ", "Machine language represents a program as a string of hexadecimal digits.", "Machine language represents a program as a string of decimal digits."]],
  },
  "2017h29h-q071": { jp: [["stem", "[Aさんの電子メールの宛先設定]", "〔Aさんの電子メールの宛先設定〕"]] },
  "2017h29h-q077": { jp: [["ア", "様々な入カ条件に対して", "様々な入力条件に対して"]] },
  "2017h29h-q090": {
    jp: [
      ["stem", "「商品」表に対して", "“商品”表に対して"],
      ["stem", "ここで、「%」は0文字以上", "ここで、“%”は0文字以上"],
      ["stem", "[操作]", "〔操作〕"],
      ["stem", "大盛が「有」でかつ商品名が「%うどん%」で", "大盛が‘有’でかつ商品名が‘%うどん%’で"],
      ["stem", "商品名が「うどん%」で", "商品名が‘うどん%’で"],
    ],
  },
  // ── 2018h30a ────────────────────────────────────────────────────────────
  "2018h30a-q037": { jp: [["ウ", "プログラムに機能を追加じた。", "プログラムに機能を追加した。"]] },
  "2018h30a-q079": { jp: [["stem", "ここで，データの左方", "ここでデータの左方"]] },
  "2018h30a-q081": {
    jp: [["イ", "①②③", "①，②，③"], ["ウ", "②④", "②，④"], ["エ", "③④", "③，④"]],
    zh: [["イ", "①②③", "①，②，③"], ["ウ", "②④", "②，④"], ["エ", "③④", "③，④"]],
    en: [["イ", "①②③", "①, ②, ③"], ["ウ", "②④", "②, ④"], ["エ", "③④", "③, ④"]],
  },
  "2018h30a-q083": { jp: [["エ", "ディジタル放送受信機に同杜されていて", "ディジタル放送受信機に同梱されていて"]] },
  "2018h30a-q100": {
    jp: [["ア", "各表の先頭から数えた", "各表の先頭行から数えた"]],
    zh: [["ア", "通过从各表开头数起的相同行位置", "通过从各表首行数起的相同行位置"]],
    en: [["ア", "by the same row position counted from the top of each table", "by the same row position counted from the first row of each table"]],
  },
};

// ── 解説 (.phase2 が真相源 → 再 merge) ─────────────────────────────────────
// q070 のみ。誤答肢ウ の解説と要点[1] が**腐敗した「16 進数」を前提**に「16 進数は人間向けの便宜表記にすぎない」と
// 論じていた。源は「10 進数」なので、機械語が 2 進数であることを根拠に「10 進数の数字列ではない」と論じ直す
// (16 進数の便宜表記は補足として残す — 学習上有用で、かつ受験者が混同しやすい点なので)。
const EXPL = {
  "2017h29h-q070": {
    distSub: {
      "ウ": {
        jp: [["機械語の本体は0と1の2進数 (ビット列) で表現されます。16進数は、その長い2進数を人間が読み書きしやすいように短くまとめて表記するための表現方法にすぎず、機械語そのものが16進数で表現されるわけではありません。したがって誤りです。",
              "機械語の本体は0と1の2進数 (ビット列) で表現されます。10進数の数字列で表現されるわけではないので誤りです。なお、長い2進数を人間が読み書きしやすいように短くまとめる表記としては16進数が使われますが、それも人間向けの便宜的な表記であって、機械語そのものが10進数や16進数であるわけではありません。"]],
        zh: [["来表示的。十六进制只不过是把那些冗长的二进制更简短地归并表示、以便于人类读写的一种表示方法，机器语言本身并非用十六进制来表示。因此该描述是错误的。",
              "来表示的，并不是用十进制的数字串来表示，因此该描述是错误的。顺带一提，为便于人类读写，人们常把冗长的二进制归并成十六进制来书写，但那同样只是面向人类的便捷记法，机器语言本身既不是十进制也不是十六进制。"]],
        en: [["of 0s and 1s. Hexadecimal is merely a way of writing those long binary numbers more compactly so that humans can read and write them more easily; machine language itself is not expressed in hexadecimal. Therefore the statement is incorrect.",
              "of 0s and 1s, not a string of decimal digits, so the statement is incorrect. Incidentally, hexadecimal is often used to write those long binary numbers more compactly for human readability, but that too is only a convenience for people; machine language itself is neither decimal nor hexadecimal."]],
      },
    },
    pointSub: [
      { idx: 1,
        jp: ["機械語は0と1の2進数で表される低水準言語であり、16進数表記は人間が読みやすくするための便宜的な表現にすぎない。",
             "機械語は0と1の2進数で表される低水準言語であり、10進数の数字列ではない (長い2進数を短くまとめる16進数表記も、あくまで人間向けの便宜的な表現)。"],
        zh: ["机器语言是用 0 和 1 的二进制表示的低级语言，十六进制表示法只是为方便人类阅读而采用的权宜表示方式。",
             "机器语言是用 0 和 1 的二进制表示的低级语言，并不是十进制的数字串（把长二进制归并书写的十六进制表示法，也只是为方便人类阅读而采用的权宜方式）。"],
        en: ["Machine language is a low-level language expressed in binary (0s and 1s); hexadecimal notation is merely a convenient representation to make it easier for humans to read.",
             "Machine language is a low-level language expressed in binary (0s and 1s), not a string of decimal digits; hexadecimal notation, used to write long binary values compactly, is likewise merely a convenience for human readers."] },
    ],
  },
};

const MARK = "fidfix-S118-wave3";
const pg = (id) => { const b = rj(P("data/ip/exams/question_bank.json")).questions.find((q) => q.id === id); return `page-${String(b.source.page_number).padStart(2, "0")}`; };

// D-143: final の note_jp のみ更新。round1 は不可触。
// 方針 (波 2 と同一): 語義是正 / 正解肢命中 / 既存 note が「腐敗なし」と明言している題 に限り 1 文を追記する (MARK 冪等)。
// 括弧・引用符・読点だけの表記是正 (q043 / q071 / q090 / q079 / q081) は追記しない — evidence に一覧化。
const NOTE_APPEND = {
  "2017h29h-q014": (p) => `（S118 ⑤-2 波3: ${p} 実読で 選択肢ア「システムの状態の居移」を源の「状態の遷移」に是正。zh/en は既に「迁移 / transitions」で忠実 — ${MARK}）`,
  "2017h29h-q070": (p) => `（S118 ⑤-2 波3: ${p} 実読で 選択肢ウ「16進数」を源の「10 進数」に是正（answer_affecting: 源の「10 進数」は明白な誤答肢だが「16 進数」だと機械語ダンプの実務があるため正解肢ア と競合しうる）。誤答肢ウ の解説と要点は 16 進数を論拠にしていたため三語で書換 — ${MARK}）`,
  "2017h29h-q077": (p) => `（S118 ⑤-2 波3: ${p} 実読で 選択肢ア の同形字「入カ条件」(カタカナ カ) を源の漢字「入力条件」に是正。同一文内の「入力と出力」「出力結果」は既に漢字 — ${MARK}）`,
  "2018h30a-q037": (p) => `（S118 ⑤-2 波3: ${p} 実読で 選択肢ウ「機能を追加じた」を源の「機能を追加した」に是正 — ${MARK}）`,
  "2018h30a-q083": (p) => `（S118 ⑤-2 波3: ${p} 実読で 選択肢エ「同杜されていて」を源の「同梱されていて」(原典は 梱 にルビ「こん」) に是正。zh/en は既に「一同附带 / bundled」で忠実 — ${MARK}）`,
  "2018h30a-q100": (p) => `（S118 ⑤-2 波3: ${p} 実読で 選択肢ア「各表の先頭から数えた」を源の「各表の先頭行から数えた」に是正し、zh/en も「首行 / the first row」に精密化 — ${MARK}）`,
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
    if (p.zh) { const [f, t] = p.zh; sub(tr.points[p.idx], "zh", f, t, `${id} expl_tr.points[${p.idx}].zh`); }
    if (p.en) { const [f, t] = p.en; sub(tr.points[p.idx], "en", f, t, `${id} expl_tr.points[${p.idx}].en`); }
  }
  wj(jf, j); wj(tf, tr);
}

for (const [id, mk] of Object.entries(NOTE_APPEND)) {
  const r = GR[id.split("-q")[0]].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  r.key_guard.note_jp = `${r.key_guard.note_jp}${mk(pg(id))}`; applied++; log.push(`  ✓ ${id} final note: 追記 (${pg(id)}, round1 untouched)`);
}
for (const e of noteExams) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);

console.log(log.join("\n"));
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S118-wave3: applied ${applied}, skipped ${skipped}`);
