#!/usr/bin/env node
// Stage 6 / Quiz — S131 **efix4e** (解説是正 lane、D-176 / D-177: 1 unit = 1 exam): 解説全量監査 efull_4 (evidence/phase5/stage_06_quiz_phase2/
// ruleA_result_S131_efull_4.json) のうち 2020r02o の medium 2 題を是正する。evidence/quiz_efix4e_expl_S131.md。
//
// 層・方針は quiz-fidfix-S131-efix4d と同じ (subN・D-143 note 後置・note の全文で後置済み判定・TRFIX は "stem" も可)。
// q039 は translations sidecar の題幹にも同じ誤訳があるので、sidecar と .phase1 tr_ の両方を直す。
//
// ── 是正 (判定は evidence §1) ──
//   2020r02o-q026 ア: 「カーテンの不燃化」は選択肢本文の「防炎品に取り替え」と違う (防炎 ≠ 不燃) → 防炎品への取替え。
//   2020r02o-q039 zh: 「対応時間」(受付時間帯) を「响应时间」(SLA の応答時間) と訳していた → 服务时间 (解説 2 箇所 + 題幹)。
//
// Run: node scripts/quiz-fidfix-S131-efix4e.mjs            (dry-run)
//      node scripts/quiz-fidfix-S131-efix4e.mjs --apply    (D-152 lock 取得後のみ)
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2020r02o
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
  // 2020r02o-q026
  ["2020r02o-q026", "d:ア", "jp", "カーテンの不燃化や", "カーテンなどの防炎品への取替えや", 1],
  ["2020r02o-q026", "d:ア", "zh", "把窗帘换成不燃材料", "把窗帘等换成阻燃用品", 1],
  ["2020r02o-q026", "d:ア", "en", "Making curtains non-flammable and", "Replacing curtains and similar items with flame-retardant products and", 1],
  // 2020r02o-q039 (zh)
  ["2020r02o-q039", "correct", "zh", "将响应时间扩大到24小时", "将服务时间扩大到24小时", 1],
  ["2020r02o-q039", "d:イ", "zh", "规定响应时间等服务水平", "规定服务时间等服务水平", 1],
];

// translations sidecar (+ .phase1 tr_): [id, choice の字母 | "stem", lang, from, to, n]
const TRFIX = [
  ["2020r02o-q039", "stem", "zh", "正在考虑将响应时间扩大到24小时", "正在考虑将服务时间扩大到24小时", 1],
];

// ── D-143 note (final のみ後置、round1・既存 note・flag は不可触) ──
const MARK = "fidfix-S131-efix4e";
const E = "S131 efix4e 解説監査 (efull_4)";
const N = (id, s) => [id, () => `（${E}: ${s} — ${MARK}）`];
const NOTE_APPEND = [
  N("2020r02o-q026", "誤答肢アの「カーテンの不燃化」は選択肢本文の「防炎品に取り替え」と違う (防炎 = 燃えにくい加工、不燃 = 燃えない、消防法上の別概念) ため、「カーテンなどの防炎品への取替え」に改めた (jp / zh / en)。correct_answer=ウ は不変"),
  N("2020r02o-q039", "zh が「対応時間」(ヘルプデスクの受付時間帯) を「响应时间」(SLA の応答時間という別指標) と訳していたのを「服务时间」に改めた (正解解説・誤答肢イと、translations の題幹)。correct_answer=エ は不変"),
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
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S131-efix4e: applied ${applied}, skipped ${skipped}`);
