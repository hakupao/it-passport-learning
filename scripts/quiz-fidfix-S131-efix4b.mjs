#!/usr/bin/env node
// Stage 6 / Quiz — S131 **efix4b** (解説是正 lane、D-176: 1 unit = 1 exam): 解説全量監査 efull_4 (evidence/phase5/stage_06_quiz_phase2/
// ruleA_result_S131_efull_4.json) のうち 2018h30h の medium 2 題を是正する。evidence/quiz_efix4b_expl_S131.md。
//
// 層・方針は quiz-fidfix-S131-efix4a と同じ (subN・D-143 note 後置・note の全文で後置済み判定)。translations sidecar は照合のみで、
// 同じ誤りは無かった (q074 の stem / choices、q089 の choices に 32/64 ビットの定義・Wi-Fi Direct の記述なし)。
//
// ── 是正 (判定は evidence §1) ──
//   2018h30h-q074 正解・要点 1: 32/64 ビットを「アドレスのビット幅」と定義 → データ幅 (レジスタ長)、アドレスのビット数も一般に対応。
//   2018h30h-q089 ア: Wi-Fi Direct をアドホックモードの例にしていた → 別技術 (片方の端末がグループオーナーとして AP 役)。
//
// Run: node scripts/quiz-fidfix-S131-efix4b.mjs            (dry-run)
//      node scripts/quiz-fidfix-S131-efix4b.mjs --apply    (D-152 lock 取得後のみ)
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2018h30h
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
  // 2018h30h-q074
  ["2018h30h-q074", "correct", "jp", "CPU の「32ビット/64ビット」はアドレスを一度に扱えるビット幅を指し、これがメモリ空間の理論上限を決めます。",
    "CPU の「32ビット/64ビット」は一度に処理できるデータの幅 (レジスタ長) を表し、アドレスのビット数も一般にこれに対応するため、メモリ空間の理論上限が決まります。", 1],
  ["2018h30h-q074", "correct", "zh", "CPU 的「32位/64位」指的是一次能够处理的地址位宽，它决定了内存空间的理论上限。",
    "CPU 的「32位/64位」表示一次能够处理的数据宽度（寄存器长度），地址的位数一般也与之对应，因此决定了内存空间的理论上限。", 1],
  ["2018h30h-q074", "correct", "en", "A CPU being 32-bit or 64-bit refers to the bit width of addresses it can handle at once, and this decides the theoretical upper limit of memory space.",
    "A CPU being 32-bit or 64-bit refers to the width of data it can process at once (its register length); the number of address bits generally corresponds to it, which decides the theoretical upper limit of memory space.", 1],
  ["2018h30h-q074", "p:0", "jp", "CPU の 32ビット/64ビットは一度に扱えるアドレスのビット幅であり、", "CPU の 32ビット/64ビットは一度に処理できるデータの幅 (レジスタ長) で、アドレスのビット数も一般にこれに対応し、", 1],
  ["2018h30h-q074", "p:0", "zh", "CPU 的 32位/64位是一次能够处理的地址位宽，", "CPU 的 32位/64位是一次能够处理的数据宽度（寄存器长度），地址位数一般也与之对应，", 1],
  ["2018h30h-q074", "p:0", "en", "The 32-bit or 64-bit of a CPU is the bit width of addresses it can handle at once, and it decides", "The 32-bit or 64-bit of a CPU is the width of data it can process at once (its register length); the number of address bits generally corresponds to it, and this decides", 1],
  // 2018h30h-q089
  ["2018h30h-q089", "d:ア", "jp", "「アドホックモード」(Wi-Fi Direct など) の説明であり、", "「アドホックモード」の説明であり (Wi-Fi Direct も AP なしで端末同士をつなぐが、片方の端末がグループオーナーとして AP の役割を担う別の技術)、", 1],
  ["2018h30h-q089", "d:ア", "zh", "是「自组网（ad hoc）模式」（如 Wi-Fi Direct）的说明，", "是「自组网（ad hoc）模式」的说明（Wi-Fi Direct 也不经过接入点直接连接终端，但由一方终端作为组主承担接入点的角色，是另一种技术），", 1],
  ["2018h30h-q089", "d:ア", "en", "describes “ad hoc mode” (such as Wi-Fi Direct), which is", "describes “ad hoc mode” (Wi-Fi Direct also connects terminals without an access point, but it is a different technology in which one terminal acts as the group owner and takes the access point's role), which is", 1],
];

// translations sidecar (+ .phase1 tr_): 照合のみ、同じ誤りは無し
const TRFIX = [];

// ── D-143 note (final のみ後置、round1・既存 note・flag は不可触) ──
const MARK = "fidfix-S131-efix4b";
const E = "S131 efix4b 解説監査 (efull_4)";
const N = (id, s) => [id, () => `（${E}: ${s} — ${MARK}）`];
const NOTE_APPEND = [
  N("2018h30h-q074", "正解解説・要点 1 が CPU の 32/64 ビットを「アドレスを一度に扱えるビット幅」と定義していたのを、一度に処理できるデータの幅 (レジスタ長) で、アドレスのビット数も一般にこれに対応する、に改めた (jp / zh / en)。a だけ = アという導出・correct_answer=ア は不変"),
  N("2018h30h-q089", "誤答肢アが Wi-Fi Direct をアドホックモードの例にしていたのを、AP なしで直接つなぐ点は同じだが片方の端末がグループオーナーとして AP 役を担う別技術、と書き分けた (jp / zh / en)。correct_answer=ウ は不変"),
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
  subN(t.choices[ch], Lg, from, to, n, `${id} translations.choices.${ch}.${Lg}`);
  const f1 = P("data/ip/quiz/.phase1", `tr_${id}.json`);
  if (existsSync(f1)) {
    if (!T1.has(f1)) T1.set(f1, rj(f1));
    subN(T1.get(f1).choices.find((c) => c.letter === ch), Lg, from, to, n, `${id} .phase1 tr_.choices.${ch}.${Lg}`);
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
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S131-efix4b: applied ${applied}, skipped ${skipped}`);
