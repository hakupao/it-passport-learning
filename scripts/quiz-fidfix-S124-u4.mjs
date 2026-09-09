#!/usr/bin/env node
// Stage 6 / Quiz — S124 ⑤-2 全量保真掃引 **U4** (2019r01a、52 問 / Sonnet 5 単 pass) の差分を是正する。
// 源: S124 の workflow `wf_80761953-9cb`。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_u4_2019r01a_sn.json
//     マニフェスト = data/ip/quiz/.phase2/u4_fidelity_input_2019r01a.json
//     機械 diff = node scripts/quiz-fidelity-machdiff.mjs <manifest> <結果>
//               → same 260 / AGENT_MISSED 0 / VERDICT_CONFLICT 0 / coverage 52/52
//                 (**実残差 0・偽陽性 0** — U1〜U3b を通じて初の残差ゼロ unit。machdiff 由来の追加是正は無い)
//
// 層・方針は quiz-fidfix-S122-u3a / S123-u3b と同じ:
//   - translations sidecar は **再 merge 禁止** (S117 §10a 失敗②)。sidecar と .phase1 の両方に同じ置換を当てる
//   - stem は raw (questions / question_bank / by_year の stem_jp) と表示層 (stem_jp_clean) の**両方**に当てる
//   - explanations は .phase2 (expl_jp_ / expl_tr_) が真相源 → 是正後に quiz-phase2-merge で再生成 (D-143)。
//     **本 unit は書換 0 件** (下記 EXPL)
//   - key_guard note は **final のみ**、round1 不可触 (D-143 §3)。MARK 冪等
//   - sub() は置換後に **to の肯定確認** を assert する (S121 reviewer 指摘)
//
// **本 unit の是正はすべて `choices_jp` 上**であり、stem は 1 件も無い。2019r01a の sidecar / .phase1 は
// `choices_jp_clean` を**持たない** (実測: sidecar のキーは `stem_jp_clean` / `stem` / `choices` のみで、
// `choices` は zh・en だけを保持) ため、**選択肢は raw 3 層がそのまま出荷層**である。
// したがって下記 4 件はいずれも**学習者に見えていた**腐敗にあたる。
// 適用ループ本体は S122 / S123 で Rule D PASS 済のものを**逐字そのまま**流用している。
// stem 分岐と zh / en 分岐は本 unit では FIX に該当エントリが無いため実行されない (未実行であって未検証ではない)。
//
// 採用した差分 (4 題 / 4 論理差分。源を原寸〜30 倍で独立実読して確認):
//   2019r01a-q016 choice.イ  (page-08) 「行い システム」→ 源「行い，システム」(読点の脱落)。
//                            **イ は正解肢** (correct_answer=イ は不変)。8 倍実読で読点グリフを確認
//   2019r01a-q036 choice.ウ  (page-16) 「段階で ユーザニーズ」→ 源「段階で，ユーザニーズ」(読点の脱落)。
//                            **q036 は precrop 無し** (page-16 は detected 1 / expected 2 で安全側 skip) のため
//                            源ページ page-16.png を直接 8 倍実読
//   2019r01a-q041 choice.ア  (page-18) 「要件定義 システム開発」→ 源「要件定義，システム開発」(読点の脱落)。
//                            同一肢の他の 3 読点は健在で、2 番目だけが空白に落ちていた (8 倍実読で 4 読点すべて確認)
//   2019r01a-q097 choice.エ  (page-42) 「データの減失」→ 源「データの滅失」。**semantic**。
//                            30 倍実読 + 同 exam の実在 `減` (q074 / q086) との bitmap 対照で確定 (下記 §滅/減 の判別)
//
// jp 読点の字種は house rule の ASCII「, 」(D-147 §1 の jp 規則。同一肢の他の読点もすべて「, 」)。
//
// §滅/減 の判別 (q097。agent の主張を鵜呑みにせず独立に確定した手順):
//   源のグリフは 25×25px しかなく、`減` (氵+咸、内側に閉じた 口) と `滅` (氵+烕、内側は 火) の判別は
//   原寸では不能。以下 3 段で確定した:
//   (1) 30 倍 lanczos 拡大の直接実読 — 対象字の横棒の下は**左右に開いた 火** で、閉じた矩形 (口) が無い。
//       同 exam の実在 `減` (`2019r01a-q074` page-32「増減」) は同じ位置に**閉じた 口** が明瞭。
//   (2) **同一字の corpus 内基準線との対照** — 同 exam・同 font・同サイズの `減` 2 例
//       (q074 page-32 / q086 page-37「低減」) 同士の bitmap 不一致率は **11.1%** (64×64 二値、tight bbox 正規化)。
//       対象字 vs それぞれの `減` は **20.6% / 22.2%** = 同一字基準線の約 2 倍。`減`ではない。
//   (3) 言語・下流の裏取り — 「滅失」は標準語 (データ・物の消失)、「減失」は語彙として存在しない。
//       さらに本問の**解説は既に「データの滅失を防ぐ」と書かれており** (expl_jp の distractors エ)、
//       zh「防止数据丢失」/ en "prevent data loss" も源の語義。**別系統の工程が独立に「滅失」を保持**していた
//       (S123 §4g の `.phase1` 裏取りと同型)。→ 是正は解説と choices の既存の食い違いを**解消する**方向。
//   font 描画 (Hiragino) との照合も試みたが、書体差が字種差を上回り (全ペア 28〜36%) **判別に使えない**ため
//   根拠に採用していない (evidence §4d に明記)。
//
// 指示から外した点: **なし**。主 context の採用候補 4 件をすべて源実読で確認し、追加採用・非採用の変更は無い。
//
// 見送り (evidence §10 に理由を明記):
//   2019r01a-q041 choice.エ  「リスクの識別,コントロール」= ASCII 読点の**後に空白が無い** (他は「, 」)。
//                            区切りは**存在する**ので脱落ではなく空白の有無 → ⑤-4 R8 lane / 許容表記揺れ
//   2019r01a-q016 raw stem   「官公店」(源「官公庁」) / 「最 も」の語中空白 — clean 層は正で出荷層も clean。
//                            **N5 系列** (S123 §11 の「N5 のうち字が変わる型」台帳の対象)
//   2019r01a-q097 raw stem   「記述のう ち」の語中空白 — clean 層は正。N5 系列 (軽微)
//   読点「，」/「、」の字種差、英数字周囲の空白、全半角 — 従来どおり表記揺れ
//
// Run: node scripts/quiz-fidfix-S124-u4.mjs [--dry-run]
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2019r01a

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

const FIX = {
  // ── 読点の脱落 (jp 字種は house rule の ASCII「, 」) ────────────────────────
  // イ は **正解肢**。変更は区切り記号のみで correct_answer=イ は不変。
  "2019r01a-q016": { jp: [["イ", "行い システム", "行い, システム"]] },
  "2019r01a-q036": { jp: [["ウ", "段階で ユーザニーズ", "段階で, ユーザニーズ"]] },
  "2019r01a-q041": { jp: [["ア", "要件定義 システム開発", "要件定義, システム開発"]] },
  // ── 語義是正 (滅=消失 / 減=減少。§滅/減 の判別 参照) ────────────────────────
  // zh「防止数据丢失」/ en "prevent data loss" は既に源の語義 → 追随不要 (evidence §6)。
  "2019r01a-q097": { jp: [["エ", "データの減失", "データの滅失"]] },
};

// ── 解説 (.phase2 が真相源 → 再 merge) ─────────────────────────────────────
// **本 unit では解説の書換は 0 件**。
//  - q097: `expl_jp_2019r01a-q097.json` の distractors エ は **既に「データの滅失を防ぐ」**と源どおりで、
//    `expl_tr_` の zh「防止数据丢失」/ en "prevent data loss" も源の語義。追随の必要が無いばかりか、
//    本 unit の是正で **解説と choices の既存の食い違い (滅失 vs 減失) が解消される**。
//  - q016 / q036 / q041: 読点のみの是正で、解説は肢を逐字引用していない (機械確認済)。
const EXPL = {};

const MARK = "fidfix-S124-u4";
const pg = (id) => { const b = rj(P("data/ip/exams/question_bank.json")).questions.find((q) => q.id === id); return `page-${String(b.source.page_number).padStart(2, "0")}`; };

// D-143: final の note_jp のみ更新。round1 は不可触。
// 方針 (波 2 / 波 3 / U3a / U3b と同一): 語義是正 / 正解肢命中 / D-144 段 2 化 に限り追記する。
//   - q016 = **正解肢命中** → 追記 (波 2 `2016h28h-q089`「4 肢すべての読点…（正解肢エ を含む）」と同型の precedent)
//   - q097 = **語義是正** → 追記
//   - q036 / q041 = 誤答肢の記号のみの是正 → **追記しない** (evidence に一覧化)
// NOTE_SUB は本 unit では該当なし: 既存 final note のいずれも「腐敗が**ある**」と現在形で主張していない
// (q016 の note は raw stem の「官公店」に言及するが、本 unit はそれを触らないので矛盾しない)。
const NOTE_APPEND = {
  "2019r01a-q016": (p) => `（S124 ⑤-2 U4: ${p} 実読で 選択肢イ「行い システム」を源の「行い，システム」に是正（読点が空白に落ちていた）。**正解肢**だが変更は区切り記号のみで correct_answer=イ は不変、RFI の定義に基づく上記の導出も不変。zh「向供应商企业收集信息，掌握…」/ en は既に忠実。なお raw stem_jp の「官公店」(源「官公庁」) は本 unit の対象外で、出荷層の stem_jp_clean は従来どおり正 — ${MARK}）`,
  "2019r01a-q097": (p) => `（S124 ⑤-2 U4: ${p} 実読で 選択肢エ「データの減失」を源の「データの滅失」に是正（滅=消失・滅する / 減=減少 で語義が異なり、「減失」は語彙として存在しない）。同 exam の実在する「減」(q074 / q086) との字形対照で確定。誤答肢のため答え（ウ）には影響せず、本解説の「データの滅失を防ぐ」および zh「防止数据丢失」/ en "prevent data loss" は元から源の語義で書かれていたので、本是正は解説と選択肢本文の食い違いを解消する方向 — ${MARK}）`,
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
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S124-u4: applied ${applied}, skipped ${skipped}`);
