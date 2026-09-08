#!/usr/bin/env node
// Stage 6 / Quiz — S122 ⑤-2 全量保真掃引 **U3a** (2018h30h、70 問 / Sonnet 5 単 pass) の差分を是正する。
// 源: S122 の workflow `wf_fb2409c7-386`。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u3a_2018h30h_sn.json
//     マニフェスト = data/ip/quiz/.phase2/u3a_fidelity_input_2018h30h.json
//     機械 diff = node scripts/quiz-fidelity-machdiff.mjs <manifest> <結果> → same 345 / AGENT_MISSED 5 (**偽陽性 5**、是正対象外)
//
// 層・方針は quiz-fidfix-S118-wave1 / wave2 / wave3 と同じ:
//   - translations sidecar は **再 merge 禁止** (S117 §10a 失敗②)。sidecar と .phase1 の両方に同じ置換を当てる
//   - stem は raw (questions / question_bank / by_year の stem_jp) と表示層 (stem_jp_clean) の**両方**に当てる。
//     片方にしか無い腐敗は assert-once の n===0 で自動 skip される (本 unit では q096 が該当 — raw は別系統の重腐敗)
//   - explanations は .phase2 (expl_jp_ / expl_tr_) が真相源 → 是正後に quiz-phase2-merge で再生成 (D-143)
//   - key_guard note は **final のみ**、round1 不可触 (D-143 §3)。MARK 冪等
//   - 括弧・引用符は「源の字形が原寸で確定できるものだけ是正」(S118 §41 の線引き)
//   - S121 reviewer 指摘: sub() は置換後に **to の肯定確認** (to が空でなければ結果に to を含む) を assert する
//
// 採用した差分 (8 題 / 13 論理差分。源ページ 6 枚 + 複合図 1 枚を原寸で実読して確認):
//   2018h30h-q001 stem       (page-02) 「」×5 → 源の “ ” (U+201C/U+201D)。原寸 6 倍で 5 箇所すべての字形を確認。
//                            間の読点「、」↔ 源「，」は字種差 = 表記揺れなので不変。zh/en の 「」 は ⑨-c 保留で不変
//   2018h30h-q030 choice.ウ  (page-14) 「電子メールが**度となく**」→ 源「**幾度**となく」(「幾」の脱落)。semantic。
//                            zh「多次反复地」/ en "repeatedly many times" は既に忠実 → 追随不要
//   2018h30h-q035 choice.エ  (page-16) 文末「。**垢**」→ 源「。」(源に無い漢字 1 字の混入)。原寸 5 倍で文末が
//                            「必要ではない。」で終わることを確認。zh/en に「垢」相当の混入なし → 追随不要
//   2018h30h-q062 choice.エ  (page-29) 「マルチブート␣×6.」→ 源「マルチブート」。原寸 5 倍で該当位置には
//                            印刷文字が無く紙面の微小な染み 1 点のみ (OCR が「.」と誤読) を確認。zh/en は clean
//   2018h30h-q063 choice.ア  (page-29) **正解肢**。「使用しない。␣×49.」→ 源「使用しない。」。同上の染み由来。
//                            correct_answer=ア は不変
//   2018h30h-q085 choice.イ/ウ/エ (page-38) 丸数字の区切りが全脱落「①②」→ 源「①, ②」ほか。
//                            **区切り字種は同 exam の兄弟問 2018h30h-q072 に合わせる** (下記 §字種 参照)
//   2018h30h-q096 stem       (page-41) 源に無い読点の挿入「に対して**、**“8”」→ 源「に対して␣“8”」(源は空白のみ)。
//                            空白は同題 q085 clean の引用符前後と同じ U+0020。**clean 層のみ** (raw は別系統の重腐敗
//                            「“8 7, “17,。す67, “73”」で from が 0 回 → assert-once が自動 skip)
//   2018h30h-q005 choices    **D-144 段 2 ②-a** (2016h28a-q050 と同型)。本スクリプトでは choices を触らず、
//                            `scripts/quiz-choicefig-D144s2.mjs --only 2018h30h-q005` が choice_figures 化する。
//                            本スクリプトの担当は key_guard final note への 1 文追記のみ (下記 NOTE_APPEND)
//
// 丸数字区切りの字種 (q085) — 波 3 §4e と同一規則「同 exam の兄弟問に合わせる」を適用した結果:
//   同 exam の 2018h30h-q072 (源 page-33 実読で q085 と**同一の区切り字形**) の dataset は
//   jp = "①, ③" (ASCII カンマ+半角空白) / zh = "①、③" (U+3001) / en = "①, ③"。
//   → q085 も **jp = "①, ②" / zh = "①、②" / en = "①, ②"** とする。波 3 (2018h30a) が U+FF0C を採ったのは
//   当該 exam の兄弟問 q041/q057 が U+FF0C だったからであり、規則は「兄弟問に合わせる」の方。
//   (Rule D MINOR-1 訂正: 本 exam の jp 区切りは U+FF0C 67 / ASCII 321 / 、7 と既に混在しており、q006/q008/q074/q079 は
//   同構造で U+FF0C。「U+FF0C だと新規混在」は偽。採用理由は丸数字列挙の直近兄弟問 q072 準拠の 1 点のみ。)
//
// 見送り (evidence §見送り に理由を明記):
//   2018h30h-q043 stem   machdiff 残差は表示層の箇条書き記号「- 」(図の言語化、D-141 型) — **データ不変**
//   2018h30h-q005 stem   machdiff 残差は transcript の「[図]」接頭辞 — 偽陽性、データ不変
//   読点「，」/「、」の字種差、英数字周囲の空白、全半角 — 従来どおり表記揺れ
//   q001 zh/en stem の 「」 — ⑨-c (「zh/en は各言語の慣行に従う」保留。en 側は特に要検討として backlog へ)
//
// Run: node scripts/quiz-fidfix-S122-u3a.mjs [--dry-run]
//   → node scripts/quiz-choicefig-D144s2.mjs --only 2018h30h-q005
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2018h30h
//   → node scripts/build-quiz-figures.mjs

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry-run");
const P = (...s) => path.join(ROOT, ...s);
const rj = (f) => JSON.parse(readFileSync(f, "utf-8"));
const wj = (f, d) => { if (!DRY) writeFileSync(f, JSON.stringify(d, null, 2) + "\n"); };
const SP = (n) => " ".repeat(n); // OCR が拾った空白列を字数で明示する (目視で数え間違えないため)
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
  obj[key] = next; applied++; log.push(`  ✓ ${where}: 「${from.slice(0, 36)}」→「${to.slice(0, 36)}」`); return true;
}

const FIX = {
  // ── 引用符 (源 “ ” U+201C/U+201D、page-02 原寸 6 倍実読) ────────────────────
  // 「市場浸透」は同一 stem に 2 回出るため、from を前後の文脈まで伸ばして assert-once を満たす。
  "2018h30h-q001": {
    jp: [
      ["stem", "事業戦略を「市場浸透」", "事業戦略を“市場浸透”"],
      ["stem", "「新製品開発」", "“新製品開発”"],
      ["stem", "「市場開拓」", "“市場開拓”"],
      ["stem", "「多角化」", "“多角化”"],
      ["stem", "「市場浸透」の事例", "“市場浸透”の事例"],
    ],
  },
  // ── 語義是正 ────────────────────────────────────────────────────────────────
  "2018h30h-q030": { jp: [["ウ", "電子メールが度となく送られてきた。", "電子メールが幾度となく送られてきた。"]] },
  // ── junk 除去 (源に無い文字・記号) ─────────────────────────────────────────
  "2018h30h-q035": { jp: [["エ", "他の事象は必要ではない。垢", "他の事象は必要ではない。"]] },
  "2018h30h-q062": { jp: [["エ", `マルチブート${SP(6)}.`, "マルチブート"]] },
  "2018h30h-q063": { jp: [["ア", `利用では使用しない。${SP(49)}.`, "利用では使用しない。"]] },
  // ── 丸数字の区切り (源 page-38、字種は同 exam 兄弟問 q072 準拠) ─────────────
  "2018h30h-q085": {
    jp: [["イ", "①②", "①, ②"], ["ウ", "②③④", "②, ③, ④"], ["エ", "③④", "③, ④"]],
    zh: [["イ", "①②", "①、②"], ["ウ", "②③④", "②、③、④"], ["エ", "③④", "③、④"]],
    en: [["イ", "①②", "①, ②"], ["ウ", "②③④", "②, ③, ④"], ["エ", "③④", "③, ④"]],
  },
  // ── 源に無い読点の挿入 (clean 層のみ。raw は別系統の重腐敗で n===0 → skip) ──
  "2018h30h-q096": { jp: [["stem", "に対して、“8”", "に対して “8”"]] },
};

// ── 解説 (.phase2 が真相源 → 再 merge) ─────────────────────────────────────
// **本 unit では解説の書換は 0 件**。q005 の解説 (expl_jp_/expl_tr_2018h30h-q005) を jp/zh/en で全文精査した結果、
// correct_jp・distractors_jp・points_jp のいずれも**図の内容**を論拠にしており (「イ の図は、処理1 と 処理2 という
// 2つの円(処理)が、データA→データB→データC という矢印(データフロー)で…」)、旧テキスト肢のラベル
// (「イ DFD」「ア 状態遷移図」等) を論拠にした箇所は無い。zh/en も同様。よって choice_figures 化後もそのまま成立する。
const EXPL = {};

const MARK = "fidfix-S122-u3a";
const pg = (id) => { const b = rj(P("data/ip/exams/question_bank.json")).questions.find((q) => q.id === id); return `page-${String(b.source.page_number).padStart(2, "0")}`; };

// D-143: final の note_jp のみ更新。round1 は不可触。
// 方針 (波 2 / 波 3 と同一): 語義是正 / 正解肢命中 / D-144 段 2 化 に限り追記する。
// junk・記号のみの表記是正 (q001 / q035 / q062 / q085 / q096) は追記しない — evidence に一覧化。
const NOTE_APPEND = {
  "2018h30h-q005": (p) => `（S122 ⑤-2 U3a: ${p} と複合図を実読。源の 4 肢は**図のみ**で、dataset のテキスト肢が図の名称そのものだったため正解肢イ「DFD」が設問文と同語で答えを書いていた。D-144 段 2 ②-a として choice_figures 化し、テキストは中立な「図ア」〜「図エ」に置換済。上記の導出は元から図の内容に基づいており不変 — ${MARK}）`,
  "2018h30h-q030": (p) => `（S122 ⑤-2 U3a: ${p} 実読で 選択肢ウ「電子メールが度となく」を源の「幾度となく」に是正（「幾」の脱落）。誤答肢のため答えには影響せず、zh「多次反复地」/ en "repeatedly many times" は既に忠実 — ${MARK}）`,
};
// NOTE_SUB = 腐敗テキストを現在形で述べている区間だけを差し替える (波 1 の 2015h27a-q062 と同型)。
// q063 の final note は「選択肢アの末尾に空白＋『.』のOCRノイズが**ある**」と現在形で述べており、
// 本 unit で除去する以上、純粋な後置では note が事実と矛盾する。よって当該区間を過去形へ差し替える。
const NOTE_SUB = {
  "2018h30h-q063": (p) => [
    "なお選択肢アの末尾に空白＋『.』のOCRノイズがあるが、これは選択肢側の cosmetic ノイズで意味・答えに影響せず、",
    `なお選択肢ア（正解肢）の末尾にあった空白＋『.』のOCRノイズは S122 ⑤-2 U3a に ${p} 実読で除去済（源には印刷文字が無く紙面の微小な染み 1 点のみ、${MARK}）。除去前も選択肢側の cosmetic ノイズで意味・答えに影響せず、`,
  ],
};

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
for (const [id, mk] of Object.entries(NOTE_SUB)) {
  const r = GR[id.split("-q")[0]].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  const [from, to] = mk(pg(id));
  if (!sub(r.key_guard, "note_jp", from, to, `${id} final note`)) throw new Error(`${id}: note segment not found`);
}
for (const e of noteExams) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);

console.log(log.join("\n"));
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S122-u3a: applied ${applied}, skipped ${skipped}`);
