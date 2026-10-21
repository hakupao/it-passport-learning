#!/usr/bin/env node
// Stage 6 / Quiz — S131 **efix4f** (解説是正 lane、D-176 / D-177: 1 unit = 1 exam): 解説全量監査 efull_4 (evidence/phase5/stage_06_quiz_phase2/
// ruleA_result_S131_efull_4.json) のうち 2021r03 の medium 2 題 (指摘 4 件) を是正する。evidence/quiz_efix4f_expl_S131.md。
//
// 層・方針は quiz-fidfix-S131-efix4d と同じ。translations sidecar は照合のみで同じ誤りは無し。
//
// ── 是正 (判定は evidence §1) ──
//   2021r03-q020 正解・要点 2: 特徴の自動抽出を「教師なし学習」としていた → 深層学習のように人が特徴量を設計せず自動で抽出する点。
//   2021r03-q058 正解: サークル型ゲートを回転バー式と混同 → 円筒形ブース・入口と出口の扉が同時に開かない・内部一人を確認。
//                要点 2: アンチパスバックを物理的な一人ずつの通過と混同 → 入退室記録の整合で共連れを検知・抑止する論理的対策。
//
// Run: node scripts/quiz-fidfix-S131-efix4f.mjs            (dry-run)
//      node scripts/quiz-fidfix-S131-efix4f.mjs --apply    (D-152 lock 取得後のみ)
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2021r03
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
  // 2021r03-q020
  ["2021r03-q020", "correct", "jp", "(とくに正解ラベルを与えず特徴を見つけ出す教師なし学習)", "(とくに深層学習のように、人が特徴量を設計せずにデータから自動で抽出する点)", 1],
  ["2021r03-q020", "correct", "zh", "（尤其是不给出正确标签、自行找出特征的无监督学习）", "（尤其是像深度学习那样，不由人来设计特征量，而是从数据中自动提取）", 1],
  ["2021r03-q020", "correct", "en", "(in particular unsupervised learning, which finds features without being given correct labels)", "(in particular, as in deep learning, features are extracted automatically from the data without people designing them)", 1],
  ["2021r03-q020", "p:1", "jp", "正解ラベルを与えずデータから特徴を抽出する形は「教師なし学習」に相当し、画像認識では大量の画像から特徴量を学習する点が要点。",
    "人が特徴量を設計しなくてもデータから自動で抽出できる (深層学習) のが機械学習の特徴で、画像認識では大量の画像から特徴量を学習する点が要点。", 1],
  ["2021r03-q020", "p:1", "zh", "不给出正确标签、从数据中提取特征的形式相当于「无监督学习」，在图像识别中，从大量图像中学习特征量是要点。",
    "无需人来设计特征量、可以从数据中自动提取（深度学习），这是机器学习的特点；在图像识别中，从大量图像中学习特征量是要点。", 1],
  ["2021r03-q020", "p:1", "en", "Extracting features from data without being given correct labels corresponds to “unsupervised learning,” and in image recognition the key point is learning feature quantities from a large number of images.",
    "A feature of machine learning is that features can be extracted automatically from data without people designing them (deep learning), and in image recognition the key point is learning feature quantities from a large number of images.", 1],
  // 2021r03-q058
  ["2021r03-q058", "correct", "jp", "サークル型（回転式）のセキュリティゲートは、回転バーで区切られた一区画に一人ずつしか入れず、認証しないと回転しない構造のため、",
    "サークル型のセキュリティゲートは円筒形のブースで、入口側と出口側の扉が同時には開かず、重量センサなどで内部に一人だけいることを確認してから出口側が開く構造のため、", 1],
  ["2021r03-q058", "correct", "zh", "环形（旋转式）安全闸门由旋转杆隔出的每个区间只能容纳一人，且不认证就无法旋转，",
    "环形安全闸门是圆筒形的隔间，入口侧和出口侧的门不会同时打开，并通过重量传感器等确认内部只有一人后才打开出口侧，", 1],
  ["2021r03-q058", "correct", "en", "A circle-type (rotating) security gate divides space with a rotating bar so that only one person fits in each section, and it will not rotate without authentication;",
    "A circle-type security gate is a cylindrical booth whose entrance-side and exit-side doors never open at the same time, and it opens the exit side only after confirming, with a weight sensor or the like, that just one person is inside;", 1],
  ["2021r03-q058", "p:1", "jp", "サークル型セキュリティゲートやアンチパスバックは、一人ずつ通過を強制し二重入場・共連れを物理的に阻止する代表的な物理セキュリティ対策。",
    "サークル型セキュリティゲートは一人ずつの通過を物理的に強制して共連れを防ぐ。アンチパスバックは入退室の記録の整合を確認し (入室記録の無い ID では退室させない)、共連れを検知・抑止する論理的な対策で、両者を区別して押さえる。", 1],
  ["2021r03-q058", "p:1", "zh", "环形安全闸门和反潜回（Anti-passback）强制逐人通过，是在物理上阻止重复入场与尾随的代表性物理安全措施。",
    "环形安全闸门在物理上强制逐人通过以防止尾随。反潜回（Anti-passback）则是核对出入室记录是否一致（没有入室记录的 ID 不允许出室）、从而检测和抑制尾随的逻辑性对策，两者要区分开来。", 1],
  ["2021r03-q058", "p:1", "en", "Circle-type security gates and anti-passback enforce one-at-a-time passage and are representative physical security measures that physically block double entry and tailgating.",
    "A circle-type security gate physically enforces one-at-a-time passage to prevent tailgating. Anti-passback is a logical control that checks the consistency of entry and exit records (an ID with no entry record cannot exit) to detect and deter tailgating; distinguish the two.", 1],
];

// translations sidecar (+ .phase1 tr_): 照合のみ、同じ誤りは無し
const TRFIX = [];

// ── D-143 note (final のみ後置、round1・既存 note・flag は不可触) ──
const MARK = "fidfix-S131-efix4f";
const E = "S131 efix4f 解説監査 (efull_4)";
const N = (id, s) => [id, () => `（${E}: ${s} — ${MARK}）`];
const NOTE_APPEND = [
  N("2021r03-q020", "正解解説・要点 2 が特徴の自動抽出を「正解ラベルを与えない教師なし学習」としていたが、選択肢イはラベルの有無に触れておらず、要点は深層学習で人が特徴量を設計せず自動で抽出する点。その形に改めた (jp / zh / en)。correct_answer=イ は不変"),
  N("2021r03-q058", "正解解説がサークル型ゲートを回転バー式と混同していたのを、円筒形ブースで入口と出口の扉が同時に開かず内部に一人だけいることを確認する構造に改め、要点 2 ではアンチパスバックを入退室記録の整合で共連れを検知・抑止する論理的対策としてゲートと区別した (jp / zh / en)。correct_answer=ア は不変"),
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
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S131-efix4f: applied ${applied}, skipped ${skipped}`);
