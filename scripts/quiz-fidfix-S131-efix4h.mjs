#!/usr/bin/env node
// Stage 6 / Quiz — S131 **efix4h** (解説是正 lane、D-176 / D-177: 1 unit = 1 exam): 解説全量監査 efull_5 (evidence/phase5/stage_06_quiz_phase2/
// ruleA_result_S131_efull_5.json) のうち 2023r05 の medium 5 題 + key_guard_invalid 2 題 (q023 medium・q004 low) を是正する。
// evidence/quiz_efix4h_expl_S131.md。
//
// 層・方針は quiz-fidfix-S131-efix4d と同じ。translations sidecar は照合のみで同じ誤りは無し。
// key_guard_invalid の 2 題は key_guard / round1 の値・既存 note に触れず、D-143 note を final に後置して訂正を記録する。
//
// ── 是正 (判定は evidence §1) ──
//   2023r05-q055 エ: 「最初の不足40人日との混同」→ 不足は 10 人日。150 − 10 = 140 人日を残作業とした誤り (140 ÷ 10 = 14)。
//   2023r05-q064 要点 2 (jp): 「代入演算子は「+」」→ 演算子は「+」(代入は「←」)。
//   2023r05-q082 ウ: 「OSS のソースコード入手が無償なのは正しい」→ 多くは無償だが無償は OSS の要件ではない。
//   2023r05-q100 ウ (en): 「intersection (product)」→ intersection (関係代数の product は直積)。
//   2023r05-q023 note: 「設問は ISO/IEC 19519」は陳腐化 (19519 は Phase 0 の stem に実在し、S102 4dbac44 で 19510 に是正済み)。
//   2023r05-q004 note: 「stem_jp_clean も 306 のまま」は陳腐化 (表示の stem_jp_clean は 300、raw の stem_jp は OCR 原文の 306)。
//
// Run: node scripts/quiz-fidfix-S131-efix4h.mjs            (dry-run)
//      node scripts/quiz-fidfix-S131-efix4h.mjs --apply    (D-152 lock 取得後のみ)
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2023r05
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

// subN: 出現数 n を厳密に要求して全置換。0 回なら skip (冪等)、n と違えば中断。事後確認つき (quiz-fidfix-S130-n9b と同じ)。
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

// [id, where (correct | d:ア〜エ | p:idx), lang (jp | zh | en), from, to, n]
const EXPL = [
  // 2023r05-q055
  ["2023r05-q055", "d:エ", "jp", "最初の不足40人日との混同など、残作業量の算定を誤った値です。", "全体150人日から、既に消化した40人日ではなく最初の5日間の不足分10人日を引いて、残作業を140人日とした誤り (140÷10日＝14名) です。", 1],
  ["2023r05-q055", "d:エ", "zh", "这是与最初的不足 40 人日相混淆等、对剩余工作量的算定出错而得到的数值。", "这是从全部 150 人日中减去的不是已完成的 40 人日、而是最初 5 天的不足量 10 人日，把剩余工作量算成 140 人日的错误（140÷10 天＝14 人）。", 1],
  ["2023r05-q055", "d:エ", "en", "This value comes from miscalculating the remaining workload, such as confusing it with the initial shortfall of 40 person-days.", "This value comes from subtracting from the total of 150 person-days not the 40 person-days already completed but the 10 person-day shortfall of the first 5 days, giving a remaining workload of 140 person-days (140 ÷ 10 days = 14 people).", 1],
  // 2023r05-q064 (jp)
  ["2023r05-q064", "p:1", "jp", "代入演算子は「+」", "演算子は「+」", 1],
  // 2023r05-q082
  ["2023r05-q082", "d:ウ", "jp", "OSS のソースコード入手が無償なのは正しいが、", "多くの OSS は無償で入手できるが無償であることは OSS の要件ではなく、また", 1],
  ["2023r05-q082", "d:ウ", "zh", "OSS 的源代码可免费获取这点正确，但", "许多 OSS 可以免费获取，但免费并不是 OSS 的必要条件；而且", 1],
  ["2023r05-q082", "d:ウ", "en", "It is true that obtaining the OSS source code is free of charge, but paid maintenance support", "Many OSS products can be obtained free of charge, but being free is not a requirement of OSS; moreover, paid maintenance support", 1],
  // 2023r05-q100 (en)
  ["2023r05-q100", "d:ウ", "en", "a set operation like intersection (product)", "a set operation like intersection", 1],
];

// translations sidecar (+ .phase1 tr_): 照合のみ、同じ誤りは無し
const TRFIX = [];

// ── D-143 note (final のみ後置、round1・既存 note・flag は不可触) ──
const MARK = "fidfix-S131-efix4h";
const E = "S131 efix4h 解説監査 (efull_5)";
const N = (id, s) => [id, () => `（${E}: ${s} — ${MARK}）`];
// q023 の note は Rule D (N1) で差し替えた。初版は「誤検出」としていたが、19519 は Phase 0 の stem に実在し S102 (4dbac44) で是正済み
// → 陳腐化が正しい。初版を後置済みの状態では下の「差替え」で置き換え、新しい状態では NOTE_APPEND が新版を直接後置する (冪等)。
const Q023_NOTE_V1 = "key_guard の訂正 (監査で key_guard_valid=false): 上記 note の「設問は『国際規格 ISO/IEC 19519』とする」「OCR 腐敗 (19510→19519) の疑い」は誤検出で、現在の stem_jp・stem_jp_clean とも「ISO/IEC 19510」と正しく書かれている。stem_corruption_suspected=true は根拠が無いが、flag と既存 note は D-143 の union 則で保持する。BPMN = イという導出・correct_answer=イ は不変";
const Q023_NOTE = "key_guard の訂正 (監査で key_guard_valid=false): 上記 note の「設問は『国際規格 ISO/IEC 19519』とする」は生成時点の stem については正しかった (Phase 0 の stem_jp は 19519) が、S102 (4dbac44) で stem / zh / en を「ISO/IEC 19510」に是正済みのため陳腐化している。現在の stem_jp・stem_jp_clean・sidecar とも 19510 で、表示 stem の是正は不要。flag と既存 note は D-143 の union 則で保持する。BPMN = イという導出・correct_answer=イ は不変";
const NOTE_APPEND = [
  N("2023r05-q055", "誤答肢エの「最初の不足40人日との混同」は誤り (最初の 5 日間の不足は 50 − 40 = 10 人日、40 人日は消化済みの量)。150 − 10 = 140 人日を残作業とした誤り (140 ÷ 10 日 = 14 名) に改めた (jp / zh / en)。残作業 110 人日 ÷ 10 日 = 11 名 = イという導出・correct_answer=イ は不変"),
  N("2023r05-q064", "要点 2 の jp「代入演算子は「+」」を「演算子は「+」」に改めた (+ は加算演算子、代入は「←」。zh / en は既に正しい)。correct_answer=ウ は不変"),
  N("2023r05-q082", "誤答肢ウの「OSS のソースコード入手が無償なのは正しい」は、無償が OSS の要件であるかのように読める (OSD・GPL は有償頒布を認める) ため、多くは無償だが無償は要件ではない、に改めた (jp / zh / en)。correct_answer=ア は不変"),
  N("2023r05-q100", "誤答肢ウの en「intersection (product)」の (product) を削った (関係代数の product は直積で、共通集合とは別の演算)。correct_answer=エ は不変"),
  N("2023r05-q023", Q023_NOTE),
  N("2023r05-q004", "key_guard の訂正 (監査で key_guard_valid=false): 上記 note の「stem_jp / stem_jp_clean とも 306 のまま」は陳腐化している。表示に使う stem_jp_clean は「利用料は300万円/年」に是正済みで、306 が残るのは OCR 原文として保持している raw の stem_jp だけ。flag と既存 note は D-143 の union 則で保持する。分岐点 X > 1,000 = イという導出・correct_answer=イ は不変"),
];

// ── 適用 ──
const EXP = new Map();
const explPair = (id) => {
  if (!EXP.has(id)) {
    const jf = P("data/ip/quiz/.phase2", `expl_jp_${id}.json`), tf = P("data/ip/quiz/.phase2", `expl_tr_${id}.json`);
    EXP.set(id, { jf, tf, j: rj(jf), tr: rj(tf) });
  }
  return EXP.get(id);
};
const explField = (id, w, Lg) => {
  const { j, tr } = explPair(id);
  if (Lg === "jp") {
    if (w === "correct") return [j, "correct_jp"];
    if (w.startsWith("d:")) return [j.distractors_jp.find((d) => d.letter === w.slice(2)), "why_wrong_jp"];
    return [j.points_jp, Number(w.slice(2))];
  }
  const o = w === "correct" ? tr.correct : w.startsWith("d:") ? tr.distractors.find((d) => d.letter === w.slice(2)) : tr.points[Number(w.slice(2))];
  return [o, Lg];
};
for (const [id, w, Lg, from, to, n] of EXPL) { const [o, k] = explField(id, w, Lg); subN(o, k, from, to, n, `${id} expl_${Lg === "jp" ? "jp" : "tr"}.${w}.${Lg}`); }

const TR = {}; const T1 = new Map();
for (const [id, ch, Lg, from, to, n] of TRFIX) {
  const e = id.split("-q")[0];
  TR[e] ??= rj(P("data/ip/quiz/translations", `${e}.json`));
  const t = TR[e].questions[id];
  if (!t) throw new Error(`${id}: sidecar に無い`);
  // ch = "stem" なら題幹、それ以外は選択肢の字母
  subN(ch === "stem" ? t.stem : t.choices[ch], Lg, from, to, n, `${id} translations.${ch === "stem" ? "stem" : `choices.${ch}`}.${Lg}`);
  const f1 = P("data/ip/quiz/.phase1", `tr_${id}.json`);
  if (existsSync(f1)) {
    if (!T1.has(f1)) T1.set(f1, rj(f1));
    const d1 = T1.get(f1);
    subN(ch === "stem" ? d1.stem : d1.choices.find((c) => c.letter === ch), Lg, from, to, n, `${id} .phase1 tr_.${ch === "stem" ? "stem" : `choices.${ch}`}.${Lg}`);
  }
}

for (const { jf, tf, j, tr } of EXP.values()) { wj(jf, j); wj(tf, tr); }
for (const e of Object.keys(TR)) wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]);
for (const [f, d] of T1) wj(f, d);

const GR = {};
// 差替え: q023 の初版 note (後置済みなら) を新版に置き換える
{
  GR["2023r05"] ??= rj(P("data/ip/quiz/.phase2", "generate_result_2023r05.json"));
  const r = GR["2023r05"].results.find((x) => x.id === "2023r05-q023");
  subN(r.key_guard, "note_jp", `（${E}: ${Q023_NOTE_V1} — ${MARK}）`, `（${E}: ${Q023_NOTE} — ${MARK}）`, 1, "2023r05-q023 final note 差替え (Rule D N1)");
}
for (const [id, mk] of NOTE_APPEND) {
  const e = id.split("-q")[0];
  GR[e] ??= rj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`));
  const r = GR[e].results.find((x) => x.id === id);
  if (!r?.key_guard) throw new Error(`${id}: no key_guard`);
  if (r.key_guard.note_jp.includes(mk())) { skipped++; continue; }
  r.key_guard.note_jp = `${r.key_guard.note_jp}${mk()}`; applied++; log.push(`  ✓ ${id} final note: 追記 (round1・flag untouched)`);
}
for (const e of Object.keys(GR)) wj(P("data/ip/quiz/.phase2", `generate_result_${e}.json`), GR[e]);

console.log(log.join("\n"));
console.log(`  files ${DRY ? "to write" : "written"} (${written.length}): ${written.join(", ")}`);
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S131-efix4h: applied ${applied}, skipped ${skipped}`);
