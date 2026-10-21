#!/usr/bin/env node
// Stage 6 / Quiz — S131 **efix4j** (解説是正 lane、D-176 / D-177: 1 unit = 1 exam): 解説全量監査 efull_5 (evidence/phase5/stage_06_quiz_phase2/
// ruleA_result_S131_efull_5.json) のうち 2025r07 の medium 3 題を是正する。evidence/quiz_efix4j_expl_S131.md。
//
// 層・方針は quiz-fidfix-S131-efix4d と同じ。q023 (題幹の記述 b) と q051 (選択肢イ) は translations sidecar にも同じ誤訳があるので、
// sidecar と .phase1 tr_ の両方を直す。
//
// ── 是正 (判定は evidence §1) ──
//   2025r07-q023 zh: 執行役員を「执行董事」(取締役である業務執行取締役) と訳していた → 执行官 (解説 4 箇所 + 題幹の記述 b)。
//   2025r07-q033 イ・要点 2: 運転装置不要をレベル 5 だけの特徴とし、イを「レベル 4 と 5 の混在」としていた → イはレベル 4 の記述。
//   2025r07-q051 zh: 委託会社 (開発を請け負った側) を「委托公司」(委託する側) と訳していた → 受托公司（外包公司）(解説 + 選択肢イ)。
//
// Run: node scripts/quiz-fidfix-S131-efix4j.mjs            (dry-run)
//      node scripts/quiz-fidfix-S131-efix4j.mjs --apply    (D-152 lock 取得後のみ)
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2025r07
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
  // 2025r07-q023 (zh)
  ["2025r07-q023", "correct", "zh", "执行董事", "执行官", 2],
  ["2025r07-q023", "d:エ", "zh", "执行董事", "执行官", 1],
  ["2025r07-q023", "p:0", "zh", "执行董事", "执行官", 1],
  // 2025r07-q033
  ["2025r07-q033", "d:イ", "jp", "「ハンドルやペダルなどの運転装置は不要」かつ「自動運転できる地域は限られる」という記述は、より上位のレベルの特徴を混在させたもの。運転装置が一切不要なのは人間の運転を全く前提としないレベル5「完全運転自動化」に相当し、地域・条件が限定されるのはレベル4「高度運転自動化」の特徴である。",
    "「人間が運転する必要がなく運転装置は不要」かつ「自動運転できる地域は限られる」という記述は、限定された地域で運転装置の無い車両が無人で走るレベル4「高度運転自動化」の説明である (運転装置が不要なことはレベル5 だけの特徴ではない)。", 1],
  ["2025r07-q033", "d:イ", "zh", "「方向盘和踏板等驾驶装置不需要」且「可以自动驾驶的区域有限」这一描述，混合了更高级别的特征。完全不需要驾驶装置对应于完全不以人类驾驶为前提的级别5「完全自动驾驶」，而区域、条件受限则是级别4「高度自动驾驶」的特征。",
    "「人类无需驾驶、不需要驾驶装置」且「可以自动驾驶的区域有限」这一描述，是在限定区域内由没有驾驶装置的车辆无人行驶的级别4「高度自动驾驶」的说明（不需要驾驶装置并不只是级别5的特征）。", 1],
  ["2025r07-q033", "d:イ", "en", "The statement that “driving devices such as a steering wheel and pedals are unnecessary” and “the areas where autonomous driving is possible are limited” mixes together features of higher levels. Driving devices being entirely unnecessary corresponds to Level 5, “full driving automation,” which does not assume human driving at all, while having areas and conditions limited is a feature of Level 4, “high driving automation.”",
    "The statement that “the human does not need to drive and driving devices are unnecessary” and “the areas where autonomous driving is possible are limited” describes Level 4, “high driving automation,” in which vehicles without driving devices run unmanned within limited areas (not needing driving devices is not a feature of Level 5 alone).", 1],
  ["2025r07-q033", "p:1", "jp", "レベル5は運転装置不要の完全自動運転", "レベル5は領域・条件の限定が無い完全自動運転", 1],
  ["2025r07-q033", "p:1", "zh", "级别5是无需驾驶装置的完全自动驾驶", "级别5是不限定区域和条件的完全自动驾驶", 1],
  ["2025r07-q033", "p:1", "en", "Level 5 is full autonomous driving that requires no driving devices", "Level 5 is full autonomous driving with no limits on area or conditions", 1],
  // 2025r07-q051 (zh)
  ["2025r07-q051", "d:イ", "zh", "承担开发的委托公司的员工", "承担开发的受托公司（外包公司）的员工", 1],
];

// translations sidecar (+ .phase1 tr_): [id, choice の字母 | "stem", lang, from, to, n]
const TRFIX = [
  ["2025r07-q023", "stem", "zh", "引入执行董事（执行役员）制度", "引入执行官（执行役员）制度", 1],
  ["2025r07-q051", "イ", "zh", "承担财务系统开发的委托公司的员工", "承担财务系统开发的受托公司（外包公司）的员工", 1],
];

// ── D-143 note (final のみ後置、round1・既存 note・flag は不可触) ──
const MARK = "fidfix-S131-efix4j";
const E = "S131 efix4j 解説監査 (efull_5)";
const N = (id, s) => [id, () => `（${E}: ${s} — ${MARK}）`];
const NOTE_APPEND = [
  N("2025r07-q023", "zh が執行役員を「执行董事」(取締役会の構成員である業務執行取締役) と訳し、取締役会と執行の分離が董事同士の分離に読めていたのを「执行官」に改めた (正解解説・誤答肢エ・要点 1 の 4 箇所と、translations の題幹の記述 b)。b, c = ウという導出・correct_answer=ウ は不変"),
  N("2025r07-q033", "誤答肢イを「レベル 5 とレベル 4 の特徴の混在」とし、運転装置不要をレベル 5 だけの特徴としていたが、限定地域で運転装置の無い車両が無人で走る形態はレベル 4 の典型。イをレベル 4 の記述とし、要点 2 のレベル 5 も「領域・条件の限定が無い完全自動運転」に改めた (jp / zh / en)。correct_answer=ア は不変"),
  N("2025r07-q051", "zh が委託会社 (開発を請け負った側) を「委托公司」(委託する側) と訳していたのを「受托公司（外包公司）」に改めた (誤答肢イの解説と translations の選択肢イ)。correct_answer=エ は不変"),
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
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S131-efix4j: applied ${applied}, skipped ${skipped}`);
