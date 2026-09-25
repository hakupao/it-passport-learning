#!/usr/bin/env node
// Stage 6 / Quiz — S125 ⑤-2 全量保真掃引 **U6** (2021r03、88 問 / Sonnet 5 単 pass) の差分を是正する。
// 源: S125 の workflow `wf_180a2db0-a1b`。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u6_2021r03_sn.json
//     マニフェスト = data/ip/quiz/.phase2/u6_fidelity_input_2021r03.json (precrop 85/88、page-13 / 23 / 25 は skip → 源ページ直読)
//     機械 diff = node scripts/quiz-fidelity-machdiff.mjs <manifest> <結果>
//               → same 433 / AGENT_MISSED 2 / VERDICT_CONFLICT 0 / UNREADABLE skipped 1 / coverage 88/88
//                 (**MISSED 2 はどちらも実残差**: q070 表示 stem の読点脱落 / q100 stem 先頭の見出し「問100　」混入。下記で是正)
//
// **前段**: 本 script の前に `quiz-pagefix-apply.mjs --decisions evidence/phase5/stage_06_quiz_fidelity/pagefix_S125_u6_decisions.json`
//   で q051 (23→24) / q053 (24→25) の `source.page_*` を是正する (D-145 §4 の一本道、evidence §4n)。
//   本 script の key_guard note に書くページ (`pg()`) は question_bank の現在値を読むので、前段の後に走らせること。
//
// 層・方針は quiz-fidfix-S122-u3a / S123-u3b / S124-u4 / S125-u5 と同じ:
//   - translations sidecar は **再 merge 禁止** (S117 §10a 失敗②)。sidecar と .phase1 の両方に同じ置換を当てる
//   - stem は raw (questions / question_bank / by_year の stem_jp) と表示層 (stem_jp_clean) の**両方**に当てる。
//     片方にしか無い腐敗は assert-once の n===0 で自動 skip される (q008 / q070 は clean のみ、q100 は raw のみ — 下記)
//   - explanations は .phase2 (expl_jp_ / expl_tr_) が真相源 → 是正後に quiz-phase2-merge で再生成 (D-143)
//   - key_guard note は **final のみ**、round1 不可触 (D-143 §3)。MARK 冪等
//   - sub() は置換後に **to の肯定確認** を assert する (S121 reviewer 指摘)
//
// 2021r03 の sidecar / .phase1 のキーは `stem` / `choices` / `stem_jp_clean` (64 題) で、**`choices_jp_clean` は存在しない** (実測)。
// したがって選択肢は raw 3 層がそのまま出荷層であり、下記の選択肢是正はすべて**学習者に見えていた**腐敗にあたる。
// 適用ループ本体は S122〜S125-u5 で Rule D PASS 済のものを**逐字そのまま**流用している。
// 本 unit では stem 分岐・EXPL 分岐 (correctSub) が実行される。zh / en 分岐・distSub・pointSub は未実行 (zh / en は全件既に源の語義)。
//
// 採用した差分 (13 題 / 16 論理差分 — agent の 14 件 + machdiff 実残差 2 件。源 crop / 源ページを原寸〜2 倍で独立実読して確認):
//   2021r03-q004 choice.イ   (page-03) 末尾「␣×14「」→ 除去 (源に無い記号)
//   2021r03-q004 choice.ウ   (page-03) 末尾「␣×15「」→ 除去 (同上)
//   2021r03-q008 stem        (page-04) clean 層「影響を及ぼす」→ 源「影響を与える」(語句置換)。raw は「影響をほ与.るる」で n=0 skip (N5)。
//                            解説 correct_jp の**鉤括弧で設問を引いた箇所**「残る大半に影響を及ぼす」のみ追随
//   2021r03-q010 choice.エ   (page-05) 末尾「= 呈」→ 除去。**エ は正解肢** (correct_answer 不変)
//   2021r03-q011 choice.ア   (page-06) 文末「…作業に適」→ 源「…作業に適している。」(行送りでの脱落)
//   2021r03-q013 choice.エ   (page-07) 「契約者ごどとに」→ 源「契約者ごとに」
//   2021r03-q016 choice.イ   (page-08) 「全体␣␣␣'を」→ 源「全体を」(源に無い空白 3 + ASCII ')
//   2021r03-q016 choice.エ   (page-08) 末尾「ーg 一」→ 除去 (同ページ下端のノンブル「— 8 —」の混入と見られる)
//   2021r03-q024 choice.ア   (page-12) 「とらわれない和柔軟な」→ 源「とらわれない柔軟な」。**ア は正解肢**
//   2021r03-q051 choice.イ   (page-24) 「保有すする」→ 源「保有する」
//   2021r03-q051 choice.ウ   (page-24) 「toT を」→ 源「IoT を」
//   2021r03-q060 choice.エ   (page-28) 末尾「ー弟一」→ 除去 (ノンブル「— 28 —」の混入と見られる)。「利用者 ID」の空白は表記揺れで不変
//   2021r03-q065 choice.ウ   (page-30) 「のぞでかれない」→ 源「のぞかれない」
//   2021r03-q070 stem        (page-33) clean 層「a と b が 1 対多」→ 源「aとbが，1対多」の読点を復元 (machdiff 由来)。raw は既に「が, 1対多」
//   2021r03-q072 choice.ウ   (page-34) 「キャリアグリゲーション」→ 源「キャリアアグリゲーション」。zh「载波聚合」/ en "Carrier aggregation" /
//                            解説 (jp・zh・en) は既に正しい用語
//   2021r03-q100 stem        (page-45) 先頭の見出し「問100　」(U+3000) 混入 → 除去 (machdiff 由来、U3b `2019h31h-q001` precedent)。q100 は clean を持たず raw が出荷層
//
// jp 読点の字種は house rule の ASCII「, 」(D-147 §1)。
//
// 指示から外した点: **なし**。
//
// 見送り (evidence §10 に理由を明記):
//   2021r03-q008 解説の他の「及ぼす」4 箇所 — 解説者自身の地の文 (U3b q015 / U5 q100 precedent)。zh「产生影响」/ en "influences" は中立
//   expl_jp_*.json 内の key_guard.note_jp (「= 呈」「ーg 一」「和柔軟」「ー弟一」「のぞでかれ」「ほ与.るる」等に言及) — merge が読まず**非出荷** (⑨ 継続)
//   raw stem の N5 残存 (clean が出荷層): q008「影響をほ与.るる」/ q070 raw の崩れ / q065「'シャドーIT」(源紙面の汚れ由来)
//   q100 の全角「，」(stem・choices とも) — q100 だけ由来が違う (house rule 化されていない)。字種は表記揺れ扱いで不変 (⑨ 登記)
//   英数字周囲の空白 (q060「利用者 ID」ほか)、読点字種 — 従来どおり表記揺れ
//
// Run: node scripts/quiz-pagefix-apply.mjs --decisions evidence/phase5/stage_06_quiz_fidelity/pagefix_S125_u6_decisions.json --no-recrop
//      node scripts/quiz-fidfix-S125-u6.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S125-u6.mjs --apply
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2021r03

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// 既定 = dry-run (読取専用)。`--apply` で書き込む (S125 指示)。
const DRY = !process.argv.includes("--apply") || process.argv.includes("--dry-run");
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

const FIX = {
  // ── 語義是正・誤字 (字の挿入 / 脱落) ──────────────────────────────────────────
  // q008: clean のみ。raw「影響をほ与.るる」は from と一致せず n=0 skip (N5)。zh「产生影响」/ en "influences" は不変。
  "2021r03-q008": { jp: [["stem", "残る大半の消費者に影響を及ぼすグループ", "残る大半の消費者に影響を与えるグループ"]] },
  // q011: 源は「…作業に適」で行が折れ、次行頭が「している。」。dataset は次行を落としていた。zh / en は既に完全文。
  "2021r03-q011": { jp: [["ア", "工場での非定型的な作業に適", "工場での非定型的な作業に適している。"]] },
  "2021r03-q013": { jp: [["エ", "契約者ごどとに", "契約者ごとに"]] },
  // q024: ア は **正解肢** (correct_answer=ア は不変)。zh「灵活工作方式」/ en "flexible way of working" は既に源の語義。
  "2021r03-q024": { jp: [["ア", "とらわれない和柔軟な", "とらわれない柔軟な"]] },
  "2021r03-q051": { jp: [["イ", "技術を保有すするベンダ", "技術を保有するベンダ"], ["ウ", "toT を採用した", "IoT を採用した"]] },
  "2021r03-q065": { jp: [["ウ", "のぞでかれないように", "のぞかれないように"]] },
  // q072: zh「载波聚合」/ en "Carrier aggregation" / 解説 jp「キャリアアグリゲーション」は既に正しい用語。
  "2021r03-q072": { jp: [["ウ", "キャリアグリゲーション", "キャリアアグリゲーション"]] },
  // ── 源に無い記号・文字の混入 (末尾ごみ / ノンブル) ────────────────────────────
  "2021r03-q004": {
    jp: [
      ["イ", "例文データベース" + " ".repeat(14) + "「", "例文データベース"],
      ["ウ", "画像入力装置" + " ".repeat(15) + "「", "画像入力装置"],
    ],
  },
  // q010: エ は **正解肢** (correct_answer=エ は不変)。
  "2021r03-q010": { jp: [["エ", "時間軸とともに示したもの= 呈", "時間軸とともに示したもの"]] },
  "2021r03-q016": {
    jp: [
      ["イ", "物流チャネル全体   'を効果的に", "物流チャネル全体を効果的に"],
      ["エ", "店舗展開を行うことーg 一", "店舗展開を行うこと"],
    ],
  },
  "2021r03-q060": { jp: [["エ", "ログインできる。ー弟一", "ログインできる。"]] },
  // ── 読点の脱落 / 見出しの混入 (machdiff 由来) ─────────────────────────────────
  // q070: clean のみ。raw は「a とb が, 1対多」で既に読点あり → n=0 skip。
  "2021r03-q070": { jp: [["stem", "a と b が 1 対多", "a と b が, 1 対多"]] },
  // q100: clean を持たない → raw 3 層が出荷層。U3b `2019h31h-q001`「問1 」と同型。
  "2021r03-q100": { jp: [["stem", "問100　システムの経済性", "システムの経済性"]] },
};

// ── 解説 (.phase2 が真相源 → 再 merge) ─────────────────────────────────────
//  - q008: correct_jp の「設問の三条件「2番目に早い」「自ら価値を評価」「残る大半に影響を及ぼす」」は**鉤括弧で設問を引いている**ので
//          是正後の stem に合わせる。他の「及ぼす」(地の文 3 箇所 + distractor イ) は解説者の言葉で不変。
const EXPL = {
  "2021r03-q008": { correctSub: { jp: [["「残る大半に影響を及ぼす」", "「残る大半に影響を与える」"]] } },
};

const MARK = "fidfix-S125-u6";
const pg = (id) => { const b = rj(P("data/ip/exams/question_bank.json")).questions.find((q) => q.id === id); return `page-${String(b.source.page_number).padStart(2, "0")}`; };

// D-143: final の note_jp のみ更新。round1 は不可触。
// 方針 (波 2 / 波 3 / U3a / U3b / U4 / U5 と同一): 語義是正 / 正解肢命中 に限り追記する。
//   - 語義: q008 q011 q013 q051 q065 q072 / 正解肢命中: q010 q024 (q024 は両方)
//   - 追記しない (誤答肢の記号・junk のみ、または stem の読点・見出しのみ): q004 / q016 / q060 / q070 / q100
// 2021r03 の generate_result は本 unit の 13 問すべてで final note が空文字。空への追記も純粋後置
// (`final.startsWith(round1)` は round1="" で真) で、merge は final≠round1 のため round1 ブロックを併記する (D-143 の設計どおり)。
const NOTE_APPEND = {
  "2021r03-q008": (p) => `（S125 ⑤-2 U6: ${p} 実読で 表示 stem の「影響を及ぼす」を源の「影響を与える」に是正（語句の置換）。解説の設問引用「残る大半に影響を及ぼす」も追随。語義は同じで、2 番目に早くオピニオンリーダーとなる群 = アーリーアダプタという導出・答え（ア）は不変 — ${MARK}）`,
  "2021r03-q010": (p) => `（S125 ⑤-2 U6: ${p} 実読で 選択肢エ末尾の「= 呈」を除去（源に無い文字の混入）。**正解肢**だが変更はごみの除去のみで correct_answer=エ は不変 — ${MARK}）`,
  "2021r03-q011": (p) => `（S125 ⑤-2 U6: ${p} 実読で 選択肢アの文末「…作業に適」を源の「…作業に適している。」に是正（行送りでの脱落）。誤答肢のため答え（エ）には影響せず、zh / en は既に完全文 — ${MARK}）`,
  "2021r03-q013": (p) => `（S125 ⑤-2 U6: ${p} 実読で 選択肢エの「契約者ごどとに」を源の「契約者ごとに」に是正（源に無い「ど」の挿入）。誤答肢のため答え（ウ）には影響しない — ${MARK}）`,
  "2021r03-q024": (p) => `（S125 ⑤-2 U6: ${p} 実読で 選択肢アの「とらわれない和柔軟な」を源の「とらわれない柔軟な」に是正（源に無い「和」の挿入）。**正解肢**だが語義は変わらず correct_answer=ア は不変。zh / en は既に源の語義 — ${MARK}）`,
  "2021r03-q051": (p) => `（S125 ⑤-2 U6: ${p} 実読で 選択肢イの「保有すする」を源の「保有する」に、選択肢ウの「toT」を源の「IoT」に是正。いずれも誤答肢で、固定された短期間のサイクルを繰り返すのがアジャイルという導出・答え（エ）は不変。あわせて source ページ記録を page-23 → page-24 に是正（問51 は page-24 に掲載） — ${MARK}）`,
  "2021r03-q065": (p) => `（S125 ⑤-2 U6: ${p} 実読で 選択肢ウの「のぞでかれない」を源の「のぞかれない」に是正（源に無い「で」の挿入）。誤答肢のため答え（エ）には影響しない — ${MARK}）`,
  "2021r03-q072": (p) => `（S125 ⑤-2 U6: ${p} 実読で 選択肢ウの「キャリアグリゲーション」を源の「キャリアアグリゲーション」（Carrier Aggregation）に是正（「ア」の脱落）。zh / en / 解説は既に正しい用語。誤答肢のため答え（ア）には影響しない — ${MARK}）`,
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
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S125-u6: applied ${applied}, skipped ${skipped}`);
