#!/usr/bin/env node
// Stage 6 / Quiz — S131 **efix4k** (解説是正 lane、D-176 / D-177: 1 unit = 1 exam): 解説全量監査 efull_5 (evidence/phase5/stage_06_quiz_phase2/
// ruleA_result_S131_efull_5.json) のうち 2026r08 の medium 2 題を是正する。evidence/quiz_efix4k_expl_S131.md。
//
// 層・方針は quiz-fidfix-S131-efix4d と同じ。translations sidecar は照合のみで同じ誤りは無し。
//
// ── 是正 (判定は evidence §1) ──
//   2026r08-q037 ウ: LOC 法が不向きな理由「量産的な計算を要する」→ 計画初期に行数そのものを精度よく予測できない点だけ。
//   2026r08-q089 ウ: 「a と b の語が入れ替わっている」は選択肢と合わない (ウは a:脆弱性 b:インシデント) → b に入る脆弱性が a に置かれている。
//
// Run: node scripts/quiz-fidfix-S131-efix4k.mjs            (dry-run)
//      node scripts/quiz-fidfix-S131-efix4k.mjs --apply    (D-152 lock 取得後のみ)
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
  // 2026r08-q037
  ["2026r08-q037", "d:ウ", "jp", "計画初期では行数自体を精度よく見積もれないうえ、量産的な計算を要するため、短時間での初期概算には不向きである。", "計画初期では行数そのものを精度よく予測できないため、短時間での初期概算には不向きである。", 1],
  ["2026r08-q037", "d:ウ", "zh", "在计划初期，行数本身就难以准确估算，而且还需要进行大量计算，因此不适合", "在计划初期，行数本身就难以准确预测，因此不适合", 1],
  ["2026r08-q037", "d:ウ", "en", "In the early planning phase the number of lines itself cannot be estimated accurately, and it also requires a large amount of calculation, so it is not suitable", "In the early planning phase the number of lines itself cannot be predicted accurately, so it is not suitable", 1],
  // 2026r08-q089
  ["2026r08-q089", "d:ウ", "jp", "a と b の語が入れ替わっている。「脆弱性」は弱点を意味するため本来 b の定義に当たり、", "本来 b に入る「脆弱性」が a に置かれている。「脆弱性」は弱点を意味するため b の定義に当たり、", 1],
  ["2026r08-q089", "d:ウ", "zh", "a 与 b 的词语颠倒了。「脆弱性」意为弱点，本应对应 b 的定义，", "本应填入 b 的「脆弱性」被放在了 a。「脆弱性」意为弱点，对应的是 b 的定义，", 1],
  ["2026r08-q089", "d:ウ", "en", "The words for a and b are swapped. ‘Vulnerability’ means a weakness, so it corresponds to the definition of b", "‘Vulnerability’, which belongs in b, has been placed in a. ‘Vulnerability’ means a weakness, so it corresponds to the definition of b", 1],
];

// translations sidecar (+ .phase1 tr_): 照合のみ、同じ誤りは無し
const TRFIX = [];

// ── D-143 note (final のみ後置、round1・既存 note・flag は不可触) ──
const MARK = "fidfix-S131-efix4k";
const E = "S131 efix4k 解説監査 (efull_5)";
const N = (id, s) => [id, () => `（${E}: ${s} — ${MARK}）`];
const NOTE_APPEND = [
  N("2026r08-q037", "誤答肢ウ (LOC 法) が不向きな理由に挙げていた「量産的な計算を要する」を削った (LOC 法は予測行数 × 生産性係数などの単純な算出)。理由は計画初期に行数そのものを精度よく予測できない点だけにした (jp / zh / en)。類似プロジェクト = エという導出・correct_answer=エ は不変"),
  N("2026r08-q089", "誤答肢ウの冒頭「a と b の語が入れ替わっている」は選択肢 (ウ = a:脆弱性 b:インシデント) と合わないため、「本来 b に入る『脆弱性』が a に置かれている」に改めた (jp / zh / en)。a:脅威 b:脆弱性 = イという導出・correct_answer=イ は不変"),
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
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S131-efix4k: applied ${applied}, skipped ${skipped}`);
