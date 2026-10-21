#!/usr/bin/env node
// Stage 6 / Quiz — S131 **efix4c** (解説是正 lane、D-176 / D-177: 1 unit = 1 exam): 解説全量監査 efull_4 (evidence/phase5/stage_06_quiz_phase2/
// ruleA_result_S131_efull_4.json) のうち 2019h31h の medium 2 題を是正する。evidence/quiz_efix4c_expl_S131.md。
//
// 層・方針は quiz-fidfix-S131-efix4b と同じ (subN・D-143 note 後置・note の全文で後置済み判定)。translations sidecar は照合のみで同じ誤りは無し。
//
// ── 是正 (判定は evidence §1) ──
//   2019h31h-q055 正解・要点 1: 監査の工程順を題幹の列挙順のまま断定 → 計画立案→監査手続の実施 (監査証拠の入手と評価)→報告書→フォローアップ。
//   2019h31h-q064 要点 2: 「完全性・信頼性」を 3 要素の一つとして並べていた → 3 要素 = 機密性・完全性・可用性、誤り訂正は伝送の信頼性の工夫。
//
// Run: node scripts/quiz-fidfix-S131-efix4c.mjs            (dry-run)
//      node scripts/quiz-fidfix-S131-efix4c.mjs --apply    (D-152 lock 取得後のみ)
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2019h31h
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
  // 2019h31h-q055
  ["2019h31h-q055", "correct", "jp", "システム監査は、計画立案→監査証拠の入手と評価→監査手続の実施→監査報告書の作成→フォローアップ、の順で進む。",
    "システム監査は、計画立案→監査手続の実施 (監査証拠の入手と評価)→監査報告書の作成→フォローアップ、の順で進む (題幹は工程を列挙しているだけで、順序は述べていない)。", 1],
  ["2019h31h-q055", "correct", "zh", "系统审计按照 制定审计计划→获取与评价审计证据→实施审计程序→编制审计报告书→跟进 的顺序进行。",
    "系统审计按照 制定审计计划→实施审计程序（获取与评价审计证据）→编制审计报告书→跟进 的顺序进行（题干只是列举各流程，并未说明顺序）。", 1],
  ["2019h31h-q055", "correct", "en", "A systems audit proceeds in the order: drawing up the audit plan → obtaining and evaluating audit evidence → performing audit procedures → preparing the audit report → follow-up.",
    "A systems audit proceeds in the order: drawing up the audit plan → performing audit procedures (obtaining and evaluating audit evidence) → preparing the audit report → follow-up (the stem only lists the processes and does not state their order).", 1],
  ["2019h31h-q055", "p:0", "jp", "監査計画の立案→監査証拠の入手と評価→監査手続の実施→監査報告書の作成→フォローアップ。", "監査計画の立案→監査手続の実施 (監査証拠の入手と評価)→監査報告書の作成→フォローアップ。", 1],
  ["2019h31h-q055", "p:0", "zh", "制定审计计划→获取与评价审计证据→实施审计程序→编制审计报告书→跟进。", "制定审计计划→实施审计程序（获取与评价审计证据）→编制审计报告书→跟进。", 1],
  ["2019h31h-q055", "p:0", "en", "drawing up the audit plan → obtaining and evaluating audit evidence → performing audit procedures → preparing the audit report → follow-up.", "drawing up the audit plan → performing audit procedures (obtaining and evaluating audit evidence) → preparing the audit report → follow-up.", 1],
  // 2019h31h-q064
  ["2019h31h-q064", "p:1", "jp", "情報セキュリティの 3 要素の区別: 可用性 (使い続けられる) / 完全性・信頼性 (正しさ・誤り訂正) / 機密性 (暗号化・アクセス制限)。誤り訂正や暗号化・ウイルス検査は可用性向上策ではない。",
    "情報セキュリティの 3 要素は機密性・完全性・可用性。誤り訂正は通信の誤り制御 (伝送の信頼性を高める工夫)、暗号化は機密性、ウイルス検査はマルウェア対策で、いずれも可用性向上策ではない。", 1],
  ["2019h31h-q064", "p:1", "zh", "区分信息安全的三要素：可用性（能够持续使用）／完整性・可靠性（正确性・纠错）／机密性（加密・访问限制）。纠错、加密和病毒检查都不是提高可用性的手段。",
    "信息安全的三要素是机密性、完整性、可用性。纠错是通信的差错控制（提高传输可靠性的措施），加密对应机密性，病毒检查是恶意软件对策，都不是提高可用性的手段。", 1],
  ["2019h31h-q064", "p:1", "en", "Distinguish the three elements of information security: availability (can keep being used) / integrity and reliability (correctness and error correction) / confidentiality (encryption and access restriction). Error correction, encryption, and virus scanning are not measures for improving availability.",
    "The three elements of information security are confidentiality, integrity, and availability. Error correction is error control in communication (a measure for transmission reliability), encryption serves confidentiality, and virus scanning is a malware countermeasure; none of them is a measure for improving availability.", 1],
];

// translations sidecar (+ .phase1 tr_): 照合のみ、同じ誤りは無し
const TRFIX = [];

// ── D-143 note (final のみ後置、round1・既存 note・flag は不可触) ──
const MARK = "fidfix-S131-efix4c";
const E = "S131 efix4c 解説監査 (efull_4)";
const N = (id, s) => [id, () => `（${E}: ${s} — ${MARK}）`];
const NOTE_APPEND = [
  N("2019h31h-q055", "正解解説・要点 1 が監査の工程順を題幹の列挙順のまま「証拠の入手と評価→手続の実施」と断定していたのを、計画立案→監査手続の実施 (監査証拠の入手と評価)→報告書→フォローアップ に改めた (jp / zh / en)。フォローアップ = エという導出・correct_answer=エ は不変"),
  N("2019h31h-q064", "要点 2 が「完全性・信頼性」を情報セキュリティの 3 要素の一つとして並べていたのを、3 要素 = 機密性・完全性・可用性とし、誤り訂正は伝送の信頼性の工夫と分けた (jp / zh / en)。correct_answer=ア は不変"),
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
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S131-efix4c: applied ${applied}, skipped ${skipped}`);
