#!/usr/bin/env node
// Stage 6 / Quiz — S130 **T3** (D-150 §4 段 3、訳層照合: ⑤-2 excluded 392 題 = X track で jp を源照合した題) の採用差分を是正する。
// 源: S130 の訳層照合 run (Sonnet、batch 5、画像なし)。結果 JSON = evidence/phase5/stage_06_quiz_fidelity/t3_tr_fidelity_sn.json
//     マニフェスト = data/ip/quiz/.phase2/t3_tr_input.json (392 題)
//     CLEAN 389 / DISCREPANT 3 / 差分 19 (全 cosmetic) (evidence/quiz_T3_tr_fix_S130.md §2)
//
// 層・方針は quiz-fidfix-S130-t1 / t2 と同じ (subN で出現数を厳密に要求・0 回なら skip / sidecar と .phase1 tr_ の両方に同じ置換 /
// expl は .phase2 expl_tr_ を直して phase2-merge で再生成 / D-143 note は final に純粋後置・round1 不可触 / jp 3 層は読まない・書かない)。
//
// ── 採用差分 (evidence §4) ──
//   2023r05-q059 ア〜エ zh/en 選択肢頭の表名ラベル「会员：| 」/ "Member: | " を除去。X2 が jp から「会員 |」(源に無い表名、偽の列として描画) を
//                       除いたのに合わせる。除去後の描画は jp と同じ `tables` 1 枚・caption なし・列数一致 (parseChoiceWithHint で確認、evidence §3)。
//                       主キー注記「（主键）」/ "(PK)" は源の下線 (= 主キー) を訳層で表したもので、X2 の判断どおり保持 (不採用、§5)
//   2019r01a-q002 zh/en 題幹「受取配当金」= 受け取った配当 (営業外収益) を「应收股利」/ "dividends receivable" (未収の債権) と訳していたのを
//                       「股利收入」/ "dividend income" に (解説 correct / points[1] も追随)
//   2015h27a-q072 zh 題幹の記述 c「商品別」に付いた jp に無い補足「（单品）」を除去 (解説 correct の引用も追随)
//
// Run: node scripts/quiz-fidfix-S130-t3.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S130-t3.mjs --apply
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs <exam>  (対象 exam ごと)
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

// subN: 出現数 n を厳密に要求して全置換。0 回なら skip (冪等)、n と違えば中断。
// 事後確認は to 出現数が「置換前 − from 内に含まれていた分 + n」と完全一致 (to が from の部分列のときも成り立つ形)。
function subN(obj, key, from, to, n, where) {
  const s = obj?.[key];
  if (typeof s !== "string") throw new Error(`${where}: field ${key} missing`);
  const k = s.split(from).length - 1;
  if (k === 0) { skipped++; return false; }
  if (k !== n) throw new Error(`${where}: 「${from}」 occurs ${k}× (expected ${n}) — abort`);
  const next = s.split(from).join(to);
  const cnt = (x, y) => x.split(y).length - 1;
  if (cnt(next, to) !== cnt(s, to) - n * cnt(from, to) + n || next.includes(from)) throw new Error(`${where}: 置換後の事後確認に失敗 — abort`);
  obj[key] = next; applied++; log.push(`  ✓ ${where}: 「${from.slice(0, 40)}」→「${to.slice(0, 40)}」 ×${n}`); return true;
}

// [lang, field (stem | ア〜エ), from, to, n] — sidecar と .phase1 tr_ の両方に当てる
const FIX = {
  // ラベルの直後の第 1 列 (4 肢とも 会员编号 / Member Number) まで含めて置換する (subN は空文字への置換を事後確認できないため)
  "2023r05-q059": ["ア", "イ", "ウ", "エ"].flatMap((L) => [["zh", L, "会员：| 会员编号", "会员编号", 1], ["en", L, "Member: | Member Number", "Member Number", 1]]),
  "2019r01a-q002": [["zh", "stem", "持有股票的应收股利", "持有股票的股利收入", 2],
                    ["en", "stem", "the dividends receivable on its held shares increased", "the dividend income from its held shares increased", 1],
                    ["en", "stem", "the dividends receivable on held shares turned out", "the dividend income from held shares turned out", 1]],
  "2015h27a-q072": [["zh", "stem", "按商品（单品）的销售额排行榜", "按商品的销售额排行榜", 1]],
};
// [where (correct | d:ア〜エ | p:idx), lang, from, to, n] — .phase2 expl_tr_ (phase2-merge で explanations を再生成)
const EXPL = {
  "2019r01a-q002": [["correct", "zh", "应收股利包含在营业外收益中", "股利收入包含在营业外收益中", 1],
                    ["correct", "en", "Dividends receivable are included in non-operating income", "Dividend income is included in non-operating income", 1],
                    ["p:1", "zh", "应收股利包含在营业外收益中", "股利收入包含在营业外收益中", 1],
                    ["p:1", "en", "Dividends receivable are included in non-operating income", "Dividend income is included in non-operating income", 1]],
  "2015h27a-q072": [["correct", "zh", "按商品（单品）的销售额排行榜", "按商品的销售额排行榜", 1]],
};

const MARK = "fidfix-S130-t3";
const BANK = JSON.parse(readFileSync(P("data/ip/exams/question_bank.json"), "utf-8"));
const pg = (id) => { const b = (BANK.questions ?? BANK).find((x) => x.id === id); return `page-${String(b.source.page_number).padStart(2, "0")}`; };

// D-143: final の note_jp のみ追記。round1 は不可触。対象 = 正解肢の文字列が変わる題。
//   追記しない: 2019r01a-q002 / 2015h27a-q072 (題幹の cosmetic、選択肢不変)
const NOTE_APPEND = {
  "2023r05-q059": (p) => `（S130 T3: ${p} の X2 で jp 選択肢から除いた表名ラベル「会員 |」に対応する zh / en の「会员：」/ "Member:" (表見出しとして描画) が残っていたのを、jp・源どおり除去（ア〜エ）。主キー注記「（主键）」/ "(PK)" は源の下線を表すので保持。エは**正解肢**だがラベルの除去のみで、会員番号は店舗ごとに付与 = 主キーは 会員番号＋店舗コード、会員種別コードは会員ごとに決まるので会員表に残す = エという導出・correct_answer=エ は不変 — ${MARK}）`,
};

const exams = [...new Set([...Object.keys(FIX), ...Object.keys(EXPL)].map((id) => id.split("-q")[0]))].sort();
const TR = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/quiz/translations", `${e}.json`))]));
const noteExams = [...new Set(Object.keys(NOTE_APPEND).map((id) => id.split("-q")[0]))];
const GR = Object.fromEntries(noteExams.map((e) => [e, rj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`))]));
const T1 = new Map();
const tr1 = (id) => { if (!T1.has(id)) { const f = P("data/ip/quiz/.phase1", `tr_${id}.json`); T1.set(id, { f, d: existsSync(f) ? rj(f) : null }); } return T1.get(id).d; };
const EX = new Map();
const expl = (id) => { if (!EX.has(id)) { const f = P("data/ip/quiz/.phase2", `expl_tr_${id}.json`); EX.set(id, { f, d: rj(f) }); } return EX.get(id).d; };

for (const [id, list] of Object.entries(FIX)) {
  const t = TR[id.split("-q")[0]].questions[id], t1 = tr1(id);
  if (!t) throw new Error(`${id}: sidecar に無い`);
  for (const [L, field, from, to, n] of list) {
    if (field === "stem") { subN(t.stem, L, from, to, n, `${id} translations.stem.${L}`); if (t1) subN(t1.stem, L, from, to, n, `${id} .phase1 tr_.stem.${L}`); }
    else { subN(t.choices[field], L, from, to, n, `${id} translations.choices.${field}.${L}`); if (t1) subN(t1.choices.find((c) => c.letter === field), L, from, to, n, `${id} .phase1 tr_.choices.${field}.${L}`); }
  }
}
for (const [id, list] of Object.entries(EXPL)) {
  const tr = expl(id);
  for (const [w, L, from, to, n] of list) {
    const o = w === "correct" ? tr.correct : w.startsWith("d:") ? tr.distractors.find((d) => d.letter === w.slice(2)) : tr.points[Number(w.slice(2))];
    subN(o, L, from, to, n, `${id} expl_tr.${w}.${L}`);
  }
}

for (const { f, d } of T1.values()) if (d) wj(f, d);
for (const { f, d } of EX.values()) wj(f, d);
for (const e of exams) wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]);

for (const [id, mk] of Object.entries(NOTE_APPEND)) {
  const r = GR[id.split("-q")[0]].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(MARK)) { skipped++; continue; }
  r.key_guard.note_jp = `${r.key_guard.note_jp}${mk(pg(id))}`; applied++; log.push(`  ✓ ${id} final note: 追記 (${pg(id)}, round1 untouched)`);
}
for (const e of noteExams) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);

console.log(log.join("\n"));
console.log(`  exams: ${exams.join(" ")}`);
console.log(`  files ${DRY ? "to write" : "written"} (${written.length}): ${written.join(", ")}`);
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S130-t3: applied ${applied}, skipped ${skipped}`);
