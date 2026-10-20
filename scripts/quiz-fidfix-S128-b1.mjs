#!/usr/bin/env node
// Stage 6 / Quiz — S128 B track **B1** (2015h27h、100 問 / Sonnet 5 単 pass、D-150 §3) の差分を是正する。
// 源: S128 の workflow `wf_95c7c236-c87`。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_b1_2015h27h_sn.json
//     マニフェスト = data/ip/quiz/.phase2/b1_fidelity_input_2015h27h.json (precrop 93/100、skip 7 = page_mismatch 3 (page-08) + chumon 4 (mqB))
//     機械 diff = node scripts/quiz-fidelity-machdiff.mjs <manifest> <結果>
//               → same 487 / AGENT_MISSED 3 (q025 イ = 図説明の矢印欠落 (実残差)、q084 エ = 実残差、
//                 q092 = 中問前文を transcript に含めなかった偽陽性) / VERDICT_CONFLICT 0 / UNREADABLE 2 (q089 / q090、fixer が p37 で解消)
//
// 層・方針は quiz-fidfix-S122-u3a 〜 S127-u11 と同じ:
//   - translations sidecar は **再 merge 禁止** (S117 §10a 失敗②)。sidecar と .phase1 の両方に同じ置換を当てる
//   - stem は raw (questions / question_bank / by_year の stem_jp) と表示層 (stem_jp_clean) の**両方**に当てる。
//     片方にしか無い腐敗は assert-once の n===0 で自動 skip される
//   - explanations は .phase2 (expl_jp_ / expl_tr_) が真相源 → 是正後に quiz-phase2-merge で再生成 (D-143)
//   - key_guard note は **final のみ**、round1 不可触 (D-143 §3)。MARK 冪等
//   - sub() は置換後に **to の肯定確認** を assert する (S121 reviewer 指摘)
//
// 2015h27h の sidecar のキーは `stem` / `choices` / `stem_jp_clean` (100 題中 60 題) で、**`choices_jp_clean` は存在しない** (実測)。
// 選択肢は raw 3 層がそのまま出荷層。q028 / q074 / q080 は stem_jp_clean を持たない (raw stem が出荷層)。
//
// 適用ループ (sub / subN / FIX / expl 単一読み / NOTE_APPEND) は U11 から無変更で流用。追加は CHN (選択肢の多重出現、subN) のみ。
//
// 採用した差分 (evidence §6。源 crop / 源ページを原寸で独立実読して確認):
//   q025 stem   (p10) clean「[業務プロセス]」→ 源「〔業務プロセス〕」(raw は「[業務プロセス〕]」の別の崩れで N5)
//   q025 イ     (p10) 図説明「…→「検算担当者が伝票を集計」→「集計結果を照合」→「伝票つづり」」に源の分岐 (検算→伝票つづり) を補う (zh / en 追随、machdiff)
//   q028 stem   (p11) raw「情報システム として」→ 源「情報システムとして」(改行由来の空白、fixer 走査)
//   q034 ア     (p14) 「要託先」→ 源「委託先」
//   q042 エ     (p16) 「“全体最適"」→ 源「“全体最適”」
//   q043 stem   (p17) clean「記述である。a〜dのうち」→ 源「記述a〜dのうち」(s975 再構成の挿入。raw は別の崩れで N5)
//   q058 ウ     (p23) 末尾「␠␠.」(紙面の汚れの OCR 残渣) 除去
//   q074 stem   (p28) raw「防 止」→ 源「防止」(語中の改行由来空白、fixer 走査)
//   q080 stem   (p30) raw「CPUを システム」→ 源「CPUをシステム」(改行由来の空白、fixer 走査)
//   q084 エ     (p31) 「ソフトウェアだと見せかけて」→ 源「ソフトウェアと見せかけて」(machdiff)
//   q098 stem   (p45) 集合「性能」等 → 源 “性能” 等 ×3 (raw / clean / .phase1 (ASCII ") とも)
//   q100 ア〜エ (p46) 「［」(全角) → 源「[」×3 / 肢 (アは**正解肢**)。zh / en stem (1) の「[価格=1]」→ 源「価格=1」(括弧なし) に追随
//
// Run: node scripts/quiz-fidfix-S128-b1.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S128-b1.mjs --apply
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2015h27h
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

const FIX = {
  // ── 題幹 ────────────────────────────────────────────────────────────────────
  "2015h27h-q025": {
    jp: [
      ["stem", "[業務プロセス]", "〔業務プロセス〕"],
      // イ は図の説明文。源の図では「検算担当者が伝票を集計」から「集計結果を照合」と「伝票つづり」の 2 本が出て、「集計結果を照合」→「伝票つづり」もある。
      ["イ", "→「検算担当者が伝票を集計」→「集計結果を照合」→「伝票つづり」。", "→「検算担当者が伝票を集計」→分岐して「集計結果を照合」と「伝票つづり」、「集計結果を照合」→「伝票つづり」。"],
    ],
    zh: [["イ", "→「验算负责人汇总票据」→「核对汇总结果」→「票据装订簿」。", "→「验算负责人汇总票据」→分支为「核对汇总结果」和「票据装订簿」，「核对汇总结果」→「票据装订簿」。"]],
    en: [["イ", "→ \"Verification person tallies vouchers\" → \"Compare tally results\" → \"Voucher binder\".", "→ \"Verification person tallies vouchers\" → branches into \"Compare tally results\" and \"Voucher binder\"; \"Compare tally results\" → \"Voucher binder\"."]],
  },
  "2015h27h-q028": { jp: [["stem", "構築する情報システム として", "構築する情報システムとして"]] },
  "2015h27h-q043": { jp: [["stem", "に関する記述である。a〜dのうち", "に関する記述a〜dのうち"]] },
  "2015h27h-q074": { jp: [["stem", "盗聴を防 止する", "盗聴を防止する"]] },
  "2015h27h-q080": { jp: [["stem", "CPUを システム全体で", "CPUをシステム全体で"]] },
  // q098: sidecar / raw は「」、.phase1 の clean だけ ASCII " (A2b §6c の乖離)。どちらも源の “” に揃える。
  "2015h27h-q098": {
    jp: [
      ["stem", "集合「性能」，集合「価格」，集合「デザイン」", "集合“性能”，集合“価格”，集合“デザイン”"],
      ["stem", "集合\"性能\"，集合\"価格\"，集合\"デザイン\"", "集合“性能”，集合“価格”，集合“デザイン”"],
    ],
  },
  // q100: 源の手続 (1) は「件数表示（価格=1）」で角括弧なし。jp clean は源どおり、zh / en だけ括弧を補っていた。
  "2015h27h-q100": {
    zh: [["stem", "执行 件数显示（[价格=1]），", "执行 件数显示（价格=1），"]],
    en: [["stem", "Execute Count display ([Price=1]),", "Execute Count display (Price=1),"]],
  },
  // ── 選択肢 ──────────────────────────────────────────────────────────────────
  "2015h27h-q034": { jp: [["ア", "要託先が行う", "委託先が行う"]] },
  "2015h27h-q042": { jp: [["エ", "“全体最適\"の観点", "“全体最適”の観点"]] },
  "2015h27h-q058": { jp: [["ウ", "改ざんを検知する方式  .", "改ざんを検知する方式"]] },
  "2015h27h-q084": { jp: [["エ", "有用なソフトウェアだと見せかけて", "有用なソフトウェアと見せかけて"]] },
};
// 選択肢の多重出現 (subN、raw 3 層): q100 の全角「［」×3 / 肢。ア は **正解肢** (correct_answer=ア は不変)。
const CHN = { "2015h27h-q100": [["ア", "［", "[", 3], ["イ", "［", "[", 3], ["ウ", "［", "[", 3], ["エ", "［", "[", 3]] };

const MARK = "fidfix-S128-b1";
const pg = (id) => { const b = JSON.parse(readFileSync(P("data/ip/exams/question_bank.json"), "utf-8")).questions.find((x) => x.id === id); return `page-${String(b.source.page_number).padStart(2, "0")}`; };

// D-143: final の note_jp のみ追記。round1 は不可触。対象 = 語義是正 + 正解肢命中 (U3a〜U11 と同一方針)。
//   語義: q025 (イ 図説明) q034 q043 q084 / 正解肢命中: q100 (ア、括弧字種のみ)
//   追記しない (括弧・引用符・空白・残渣のみ、非正解肢): q025 stem 見出し (q025 は語義で追記) q028 q042 q058 q074 q080 q098
const NOTE_APPEND = {
  "2015h27h-q025": (p) => `（S128 B1: ${p} 実読で 題幹の見出し「[業務プロセス]」を源の「〔業務プロセス〕」に、選択肢イの図説明に源の分岐（「検算担当者が伝票を集計」→「伝票つづり」）を補う是正（zh / en も追随）。誤答肢の説明のみで、ファイリング処理→伝票つづり（データストア）→2 つの集計→照合 = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2015h27h-q034": (p) => `（S128 B1: ${p} 実読で 選択肢アの「要託先」を源の「委託先」に是正済み（上記の「残る」記述は是正前の状態）。誤答肢のため、自社が委託先の支援を受けて受入れテストを実施する = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2015h27h-q043": (p) => `（S128 B1: ${p} 実読で 題幹 clean の「記述である。a〜dのうち」を源の「記述a〜dのうち」に是正（再構成時に挿入された「である。」を除去）。a, c, d が適切 = ウという導出・correct_answer=ウ は不変 — ${MARK}）`,
  "2015h27h-q084": (p) => `（S128 B1: ${p} 実読で 選択肢エの「ソフトウェアだと見せかけて」を源の「ソフトウェアと見せかけて」に是正（源に無い「だ」を除去）。誤答肢（トロイの木馬）のため、XSS = アという導出・correct_answer=ア は不変 — ${MARK}）`,
  "2015h27h-q100": (p) => `（S128 B1: ${p} 実読で 選択肢ア〜エの全角「［」を源の「[」に是正（zh / en の手続 (1) の補われた角括弧も源どおり除去）。アは**正解肢**だが変更は括弧の字種のみで、w−x−y+z = 価格=1 かつ 性能=0 かつ デザイン=0 の件数という導出・correct_answer=ア は不変 — ${MARK}）`,
};

// ── 適用 ──────────────────────────────────────────────────────────────────────
const exams = [...new Set([...Object.keys(FIX), ...Object.keys(CHN)].map((id) => id.split("-q")[0]))];
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
for (const [id, list] of Object.entries(CHN)) {
  const exam = id.split("-q")[0];
  const qq = Qdoc.questions.find((x) => x.id === id), b = Barr.find((x) => x.id === id), y = BY[exam].questions.find((x) => x.id === id);
  for (const [L, from, to, n] of list) for (const [o, w] of [[qq, "questions"], [b, "question_bank"], [y, "by_year"]]) subN(o.choices_jp, L, from, to, n, `${id} ${w}.choices_jp.${L}`);
}
wj(P("data/ip/quiz/questions.json"), Qdoc); wj(P("data/ip/exams/question_bank.json"), Bdoc);
for (const e of exams) { wj(P("data/ip/exams/by_year", `${e}.json`), BY[e]); wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]); }

for (const [id, mk] of Object.entries(NOTE_APPEND)) {
  const r = GR[id.split("-q")[0]].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  r.key_guard.note_jp = `${r.key_guard.note_jp}${mk(pg(id))}`; applied++; log.push(`  ✓ ${id} final note: 追記 (${pg(id)}, round1 untouched)`);
}
for (const e of noteExams) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);

console.log(log.join("\n"));
console.log(`  files ${DRY ? "to write" : "written"} (${written.length}): ${written.join(", ")}`);
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S128-b1: applied ${applied}, skipped ${skipped}`);
