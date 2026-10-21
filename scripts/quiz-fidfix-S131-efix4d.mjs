#!/usr/bin/env node
// Stage 6 / Quiz — S131 **efix4d** (解説是正 lane、D-176 / D-177: 1 unit = 1 exam): 解説全量監査 efull_4 (evidence/phase5/stage_06_quiz_phase2/
// ruleA_result_S131_efull_4.json) のうち 2019r01a の medium 2 題を是正する。evidence/quiz_efix4d_expl_S131.md。
//
// 層・方針は quiz-fidfix-S131-efix4b と同じ (subN・D-143 note 後置・note の全文で後置済み判定)。
// q027 は translations sidecar の題幹 (記述 a) にも同じ誤訳があるので、sidecar と .phase1 tr_ の両方を直す (TRFIX、ch = "stem")。
//
// ── 是正 (判定は evidence §1) ──
//   2019r01a-q027 zh: 委託先 (受託者) を「委托方」(委託する側) と訳していた → 受托方 (解説 4 箇所 + 題幹の記述 a)。
//   2019r01a-q029 要点 2 (jp): 「検索エンジンを最適化する側」→ 検索エンジンに向けて自社サイトを最適化する、サイト運営者側の対策。
//
// Run: node scripts/quiz-fidfix-S131-efix4d.mjs            (dry-run)
//      node scripts/quiz-fidfix-S131-efix4d.mjs --apply    (D-152 lock 取得後のみ)
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2019r01a
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
  // 2019r01a-q027 (zh)
  ["2019r01a-q027", "d:ア", "zh", "委托方", "受托方", 2],
  ["2019r01a-q027", "d:イ", "zh", "委托方", "受托方", 1],
  ["2019r01a-q027", "p:1", "zh", "委托方", "受托方", 1],
  // 2019r01a-q029 (jp)
  ["2019r01a-q029", "p:1", "jp", "「検索エンジンを最適化する側で使う対策」であって、", "検索エンジンに向けて自社サイトを最適化する、サイト運営者側の対策であって、", 1],
];

// translations sidecar (+ .phase1 tr_): [id, choice の字母 | "stem", lang, from, to, n]
const TRFIX = [
  ["2019r01a-q027", "stem", "zh", "变更个人信息录入业务的委托方", "变更个人信息录入业务的受托方", 1],
];

// ── D-143 note (final のみ後置、round1・既存 note・flag は不可触) ──
const MARK = "fidfix-S131-efix4d";
const E = "S131 efix4d 解説監査 (efull_4)";
const N = (id, s) => [id, () => `（${E}: ${s} — ${MARK}）`];
const NOTE_APPEND = [
  N("2019r01a-q027", "zh が委託先 (受託者) を「委托方」(委託する側) と訳していたのを「受托方」に改めた (誤答肢ア・イ・要点 2 の解説 4 箇所と、translations の題幹の記述 a)。b だけ = ウという導出・correct_answer=ウ は不変"),
  N("2019r01a-q029", "要点 2 の jp「検索エンジンを最適化する側で使う対策」は検索エンジン自体を最適化すると読めるため、「検索エンジンに向けて自社サイトを最適化する、サイト運営者側の対策」に改めた (jp、zh / en は既に正しい)。correct_answer=ウ は不変"),
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
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S131-efix4d: applied ${applied}, skipped ${skipped}`);
