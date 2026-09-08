#!/usr/bin/env node
// Stage 6 / Quiz — S123 ⑤-2 全量保真掃引 **U3b** (2019h31h、87 問 / Sonnet 5 単 pass) の差分を是正する。
// 源: S123 の workflow `wf_f840c3f7-511`。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u3b_2019h31h_sn.json
//     マニフェスト = data/ip/quiz/.phase2/u3b_fidelity_input_2019h31h.json
//     機械 diff = node scripts/quiz-fidelity-machdiff.mjs <manifest> <結果> → same 417 / AGENT_MISSED 18
//                 (**偽陽性 13** = 表型選択肢 q052/q072/q082 ×4 + q053 stem の表体裁 / **非採用 4** = q059 表 cell 末尾句点 /
//                  **実残差 1** = q001 stem 先頭「問1 」混入 — agent は CLEAN、crop の見出しと同語のため見逃し)
//
// 層・方針は quiz-fidfix-S122-u3a と同じ:
//   - translations sidecar は **再 merge 禁止** (S117 §10a 失敗②)。sidecar と .phase1 の両方に同じ置換を当てる
//   - stem は raw (questions / question_bank / by_year の stem_jp) と表示層 (stem_jp_clean) の**両方**に当てる。
//     片方にしか無い腐敗は assert-once の n===0 で自動 skip される (本 unit では q007 / q062 / q096 の raw が該当 — 別系統の重腐敗)
//   - explanations は .phase2 (expl_jp_ / expl_tr_) が真相源 → 是正後に quiz-phase2-merge で再生成 (D-143)。**本 unit は書換 0 件** (下記 EXPL)
//   - key_guard note は **final のみ**、round1 不可触 (D-143 §3)。MARK 冪等
//   - 括弧・引用符は「源の字形が原寸で確定できるものだけ是正」(S118 §41 の線引き)
//   - sub() は置換後に **to の肯定確認** を assert する (S121 reviewer 指摘)
//
// 採用した差分 (9 題 / 17 論理差分 [S123 Rule D MINOR-3 訂正]。源 crop 9 枚を原寸〜8 倍で独立実読して確認):
//   2019h31h-q001 stem       (page-02) 先頭に見出し「問1 」が混入 → 除去。**q001 は stem_jp_clean を持たず raw が出荷層**
//                            なので学習者に見えていた。machdiff 由来の唯一の実残差
//   2019h31h-q007 stem       (page-04) 「」×4 → 源の “ ” (U+201C/U+201D)。原寸 4 倍で 4 対すべての字形を確認。
//                            **あわせて 4 項目間の区切り脱落も是正** (源は “財務”，“顧客”… と読点あり / dataset は区切り無し)。
//                            区切り字種は D-147 の jp 規則 = ASCII「, 」。下記 §指示から外した点 (a)
//   2019h31h-q015 stem       (page-07) 「多品種**少量**生産」→ 源「多品種**大量**生産」。semantic。zh/en も追随
//                            (zh 小批量→大批量 / en low-volume→high-volume)。解説は追随不要 (下記 EXPL)
//   2019h31h-q034 stem       (page-14) 「（単位 円）」→ 源「単位　円」(源に括弧は無い)。波 2 `2017h29a-q001` の
//                            「単位　万円／日」precedent と同型。zh/en は当該 precedent と同じく**不変** (⑨-c)
//   2019h31h-q037 choice.イ  (page-15) 「問題が**な**生じるので」→ 源「問題が生じるので」(源に無い「な」の挿入)。semantic。
//                            zh「就会给项目带来问题」/ en "problems arise" は既に忠実 → 追随不要
//   2019h31h-q053 stem       (page-21) 「[前提]」→ 源「〔前提〕」(亀甲括弧、8 倍で字形確定)。波 1 precedent (〔 288 / 【 11)
//   2019h31h-q062 stem       (page-25) 「方式のうち」→ 源「方式**①〜③**のうち」。semantic (肢が参照する範囲の脱落)。
//                            zh/en も追随。波ダッシュ字種は下記 §波ダッシュ 参照
//   2019h31h-q062 choices    (page-25) 丸数字の区切りが全脱落「①②」→ 源「①, ②」ほか 4 肢。**ウ は正解肢**
//                            (correct_answer=ウ は不変)。字種は **D-147**: jp「, 」/ zh「、」/ en は「(1) and (2)」形で
//                            丸数字を持たないため対象外 (D-147 §3「and 形は適合扱い」)
//   2019h31h-q064 choice.ウ  (page-26) 「行い␣ウイルスが」→ 源「行い，ウイルスが」(読点の脱落)。jp 字種は house rule の ASCII「, 」
//   2019h31h-q096 stem       (page-39) 「[指定方法]」→ 源「〔指定方法〕」+ 「」×6 対 → 源の “ ”。
//                            **.phase1 の stem_jp_clean は既に “ ” を保持**しており (括弧のみ [ ])、
//                            腐敗は sidecar 側の下流工程で入ったことが裏取りできる (evidence §4g)
//
// 波ダッシュの字種 (q062「①〜③」) — U3a §4e と同一規則「同 exam の兄弟問に合わせる」を適用した結果:
//   本 exam 2019h31h の丸数字レンジは **`2019h31h-q082` が「①〜③」= U+301C** (同一 exam・同一構文「①〜③で使われている」)。
//   exam 内の波ダッシュ実測も U+301C 5 問 (q004/q016/q029/q043/q082) vs U+FF5E 2 問 (q061/q068) で U+301C 優位。
//   corpus 横断の丸数字レンジも U+301C 11 / U+FF5E 9 / ASCII 1 で U+301C が多数派。→ **U+301C** を採用。
//   源の紙面からは U+301C と U+FF5E を画素で判別できない (どちらも同一の全角波形) ため、字種は house rule でしか決められない。
//
// 指示から外した点 (evidence §6 / §13 に明記):
//   (a) **q007 の区切り脱落を追加採用**。主 context の採用リストは q007 を「「」→“ ”」のみとしていたが、源 page-04 の
//       原寸 4 倍実読で 4 項目の間に読点が実在し dataset では全脱落していることを確認した。区切り脱落は D-147 §2 が
//       「源に区切りがある以上 cosmetic 差分として計上・是正」と規定する型で、本 unit の q062 / q064 と同一クラス。
//       引用符だけ直して区切りを残すと同一 stem 内で処置が割れるため、同時に是正した。
//   (b) **q084 ウ「；」は非採用**。下記 §見送り の画素計測による。
//
// 見送り (evidence §10 に理由を明記):
//   2019h31h-q084 choice.ウ  agent は「共有して」直後を「；」(ドット付き) と主張。**原寸〜12 倍 + 画素計測で非採用**。
//                            当該ドット (n=9px, x[922..924], mean grey 118) は読点本体 (n=26px, x[918..921], mean grey 82) に対し
//                            **水平中心が +3.4px ずれ / 面積 65% / 淡い**。同 exam の実在コロン `q053`「生産性：」は
//                            2 点とも x[437..440] で**中心ずれ 0.0px・面積同一 (14px)・濃度同一 (78)**。
//                            さらに page-34 の空白余白帯にも同型の孤立斑点 (n=11, 4x4, mean 117) が実在 → **紙面の染み**と判定。
//                            源は「，」で dataset の「, 」は許容表記揺れ → **データ不変**
//   2019h31h-q082 stem       箇条書きによる図の言語化 (D-141 型、has_figure=true) — **データ不変**
//   2019h31h-q059 choices    表型 cell 末尾の句点 (表の一行化に伴う体裁差、主 context 裁定で非採用) — **データ不変**
//   表型選択肢 13 件 (q052/q072/q082 ×4 + q053 stem)  machdiff の既知型偽陽性 — **データ不変**
//   読点「，」/「、」の字種差、英数字周囲の空白、全半角 — 従来どおり表記揺れ
//   q007 / q096 の zh・en 引用符、q034 zh・en の「（单位：日元）」、q053 / q096 zh・en の [ ] — ⑨-c 保留 (波 2 precedent と同じ)
//
// Run: node scripts/quiz-fidfix-S123-u3b.mjs [--dry-run]
//   → node scripts/quiz-marunum-sep-D147.mjs --apply
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2019h31h

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

const WD = "〜"; // WAVE DASH — §波ダッシュ 参照 (同 exam 兄弟問 q082 準拠)

const FIX = {
  // ── 見出しの混入 (raw が出荷層。stem_jp_clean を持たない題) ──────────────────
  "2019h31h-q001": { jp: [["stem", "問1 リスクアセスメント", "リスクアセスメント"]] },
  // ── 引用符 (源 “ ” U+201C/U+201D、page-04 原寸 4 倍実読) + 区切り脱落 (§指示から外した点 a) ──
  "2019h31h-q007": {
    jp: [["stem", "ために,「財務」「顧客」「業務プロセス」「学習と成長」",
                  "ために, “財務”, “顧客”, “業務プロセス”, “学習と成長”"]],
  },
  // ── 語義是正 ────────────────────────────────────────────────────────────────
  "2019h31h-q015": {
    jp: [["stem", "多品種少量生産を効率的に行う", "多品種大量生産を効率的に行う"]],
    zh: [["stem", "多品种小批量生产", "多品种大批量生产"]],
    en: [["stem", "high-variety, low-volume production", "high-variety, high-volume production"]],
  },
  "2019h31h-q037": { jp: [["イ", "問題がな生じるので", "問題が生じるので"]] },
  // ── 源に無い括弧の挿入 (波 2 `2017h29a-q001`「単位　万円／日」precedent) ────
  "2019h31h-q034": { jp: [["stem", "（単位 円）", "単位　円"]] },
  // ── 亀甲括弧 (源 〔 〕 U+3014/U+3015、8 倍で字形確定) ────────────────────────
  "2019h31h-q053": { jp: [["stem", "[前提]", "〔前提〕"]] },
  // ── 肢が参照する範囲の脱落 (semantic) + 丸数字区切りの脱落 (D-147) ───────────
  "2019h31h-q062": {
    jp: [
      ["stem", "取り扱うための方式のうち", `取り扱うための方式①${WD}③のうち`],
      ["ア", "①②", "①, ②"],
      ["イ", "①②③", "①, ②, ③"],
      ["ウ", "①③", "①, ③"],
      ["エ", "②③", "②, ③"],
    ],
    zh: [
      ["stem", "当作一块来处理的方式中", `当作一块来处理的方式①${WD}③中`],
      ["ア", "①②", "①、②"],
      ["イ", "①②③", "①、②、③"],
      ["ウ", "①③", "①、③"],
      ["エ", "②③", "②、③"],
    ],
    // en の肢は「(1) and (2)」形で丸数字を持たない → D-147 §3「and 形は適合扱い」で不変。stem のみ範囲を補う。
    en: [["stem", "Among the methods for logically treating", "Among the methods (1) to (3) for logically treating"]],
  },
  // ── 読点の脱落 (jp 字種は house rule の ASCII「, 」) ────────────────────────
  "2019h31h-q064": { jp: [["ウ", "行い ウイルスが", "行い, ウイルスが"]] },
  // ── 亀甲括弧 + 引用符 (源 “ ”。.phase1 clean は既に “ ” を保持 = 裏取り) ──────
  "2019h31h-q096": {
    jp: [
      ["stem", "[指定方法]", "〔指定方法〕"],
      ["stem", "「ディレクトリ名/…/ディレクトリ名/ファイル名」", "“ディレクトリ名/…/ディレクトリ名/ファイル名”"],
      ["stem", "順に 「/」 で区切って", "順に “/” で区切って"],
      ["stem", "後に 「/」 とファイル名", "後に “/” とファイル名"],
      ["stem", "は 「.」 で表す", "は “.” で表す"],
      ["stem", "は 「..」 で表す", "は “..” で表す"],
      ["stem", "始まりが 「/」 のときは", "始まりが “/” のときは"],
    ],
  },
};

// ── 解説 (.phase2 が真相源 → 再 merge) ─────────────────────────────────────
// **本 unit では解説の書換は 0 件**。
//  - q015: expl_jp の 少量 は `distractors_jp[2]`「セル生産方式は多品種少量生産には適するが、JIT・かんばんを取り込む
//    リーン生産方式とは異なる」= **セル生産方式についての独立に正しい記述**であり、stem の「大量/少量」の写しではない。
//    correct_jp / points_jp / key_guard は 少量・大量 のいずれにも言及しない。stem が「大量」になると当該記述は
//    むしろエを退ける根拠として**強まる**ため、追随不要。zh (小批量) / en (low-volume) も同じ理由で不変。
//  - q062: expl は肢を「①③」「①②」等と引用するが、U3a の `2018h30h-q085` (区切りを「②, ③, ④」に是正した後も
//    expl の引用は「②③④」のまま Rule D PASS) と同一 precedent で**引用は追随させない**。⑨ backlog に横断登記 (evidence §11)。
//  - q037 / q064: zh・en とも既に源に忠実 (「就会给项目带来问题」/ "problems arise"、zh 読点あり)。
const EXPL = {};

const MARK = "fidfix-S123-u3b";
const pg = (id) => { const b = rj(P("data/ip/exams/question_bank.json")).questions.find((q) => q.id === id); return `page-${String(b.source.page_number).padStart(2, "0")}`; };

// D-143: final の note_jp のみ更新。round1 は不可触。
// 方針 (波 2 / 波 3 / U3a と同一): 語義是正 / 正解肢命中 / D-144 段 2 化 に限り追記する。
// junk・記号のみの表記是正 (q001 / q007 / q034 / q053 / q064 / q096) は追記しない — evidence に一覧化。
// NOTE_SUB は本 unit では該当なし: 既存 final note のいずれも「腐敗が**ある**」と現在形で主張していない
// (q053 の note は raw の「59本」「4万円日」に言及するが、本 unit はそれを触らないので矛盾しない)。
const NOTE_APPEND = {
  "2019h31h-q015": (p) => `（S123 ⑤-2 U3b: ${p} 実読で stem を源の「多品種**大量**生産」に是正（dataset は「少量」で語義が反転していた）。リーン生産方式の判別根拠は JIT・かんばんの有無なので導出・答え（イ）は不変。zh「多品种大批量生产」/ en "high-variety, high-volume production" も追随。なお選択肢エの解説にある「セル生産方式は多品種少量生産に適する」はセル生産方式についての独立に正しい記述で、是正後もそのまま成立する — ${MARK}）`,
  "2019h31h-q037": (p) => `（S123 ⑤-2 U3b: ${p} 実読で 選択肢イ「問題が**な**生じるので」を源の「問題が生じるので」に是正（源に無い「な」の挿入）。誤答肢のため答えには影響せず、zh「就会给项目带来问题」/ en "problems arise in the project" は既に忠実 — ${MARK}）`,
  "2019h31h-q062": (p) => `（S123 ⑤-2 U3b: ${p} 実読で stem を源の「方式①${WD}③のうち」に是正（肢が参照する範囲 ①${WD}③ が脱落していた）。あわせて 4 肢の丸数字区切りの脱落を D-147 に従い jp「①, ③」/ zh「①、③」に是正（正解肢ウを含むが correct_answer=ウ は不変、en は「(1) and (3)」形で D-147 §3 の適合扱い）。上記の導出は RAID の冗長性のみに基づいており不変 — ${MARK}）`,
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
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S123-u3b: applied ${applied}, skipped ${skipped}`);
