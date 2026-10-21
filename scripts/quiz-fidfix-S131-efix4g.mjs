#!/usr/bin/env node
// Stage 6 / Quiz — S131 **efix4g** (解説是正 lane、D-176 / D-177: 1 unit = 1 exam): 解説全量監査 efull_5 (evidence/phase5/stage_06_quiz_phase2/
// ruleA_result_S131_efull_5.json) のうち 2022r04 の medium 5 題 (指摘 6 件) を是正する。evidence/quiz_efix4g_expl_S131.md。
//
// 層・方針は quiz-fidfix-S131-efix4d と同じ。translations sidecar は照合のみで同じ誤りは無し。
//
// ── 是正 (判定は evidence §1) ──
//   2022r04-q022 エ: 「製品ミックス (プロダクトポートフォリオ)」の同一視 → プロダクトミックス (線形計画法などによる最適な生産・販売計画)。
//   2022r04-q068 エ: ANY 接続が存在しないかのような断定 → エは ANY 接続の説明でゲスト SSID ではない、ANY 接続拒否・SSID ステルスで防ぐ対象。
//   2022r04-q074 正解・要点 1: アンチパスバックが共連れに効く理由をカード又貸しで説明 → 共連れで入った者の ID は入室記録が無く退室が拒否される。
//   2022r04-q084 イ: 「レーザ光でディスクを回転させ」→ モータで回転させ、レーザ光で読み書き。
//   2022r04-q094 ウ・要点 2: 感熱方式と熱転写方式の混同 → 熱転写 = インクを溶かす、感熱 = 感熱紙を発色。
//
// Run: node scripts/quiz-fidfix-S131-efix4g.mjs            (dry-run)
//      node scripts/quiz-fidfix-S131-efix4g.mjs --apply    (D-152 lock 取得後のみ)
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2022r04
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
  // 2022r04-q022
  ["2022r04-q022", "d:エ", "jp", "製品ミックス (プロダクトポートフォリオ) の最適化", "プロダクトミックス (線形計画法などによる最適な生産・販売計画) の最適化", 1],
  ["2022r04-q022", "d:エ", "zh", "产品组合（产品投资组合，product portfolio）优化", "产品组合（product mix，用线性规划等求出的最优生产与销售计划）优化", 1],
  ["2022r04-q022", "d:エ", "en", "the product mix (product portfolio)", "the product mix (an optimal production and sales plan found with methods such as linear programming)", 1],
  // 2022r04-q068
  ["2022r04-q068", "d:エ", "jp", "SSID 欄を空欄にすれば SSID を知らなくてもつながる、というのは誤り。SSID を隠す設定 (SSID ステルス / ブロードキャスト停止) があっても、接続には正しい SSID の入力が必要であり、ゲスト SSID の説明でもない。",
    "エは ANY 接続 (SSID を空欄や ANY にして周囲のアクセスポイントにつなぐ機能) の説明で、ゲスト SSID の機能ではない。ANY 接続はルータ側で ANY 接続拒否を設定していなければ実際につながるため、セキュリティ上は ANY 接続拒否や SSID ステルスで防ぐ対象である。", 1],
  ["2022r04-q068", "d:エ", "zh", "认为把 SSID 设置栏留空、即使不知道 SSID 也能连上，这是错误的。即使有隐藏 SSID 的设置（SSID 隐藏／停止广播），连接时仍需要输入正确的 SSID，而且这也不是对访客 SSID 的说明。",
    "エ是 ANY 连接（把 SSID 留空或设为 ANY，连接到周围接入点的功能）的说明，并不是访客 SSID 的功能。只要路由器一侧没有设置拒绝 ANY 连接，ANY 连接实际上是可以连上的，因此在安全上它是要用拒绝 ANY 连接或隐藏 SSID 来防范的对象。", 1],
  ["2022r04-q068", "d:エ", "en", "The claim that leaving the SSID setting field blank lets you connect even without knowing the SSID is wrong. Even if there is a setting that hides the SSID (SSID stealth / broadcast suppression), connecting still requires entering the correct SSID, and this is not a description of a guest SSID either.",
    "エ describes ANY connection (a function that connects to nearby access points with the SSID left blank or set to ANY), not the guest SSID function. ANY connection actually works unless the router is set to refuse it, so from a security standpoint it is something to block with ANY-connection refusal or SSID stealth.", 1],
  // 2022r04-q074
  ["2022r04-q074", "correct", "jp", "これにより、一人が認証して入室したあとに ID カードを外へ又貸ししても、そのカードは既に「入室済み」扱いのため再入室が拒否され、一人の認証で複数人が続けて入る共連れ (ピギーバック) を防止できる。",
    "一人の認証で複数人が続けて入る共連れ (ピギーバック) で入った者の ID には入室記録が無いので、退室 (とその後の入室) の認証が拒否され、不正な入室が発覚する。これが共連れの検知・抑止になる (入室済みのカードを外へ又貸しして再入室させる行為も、同じ仕組みで拒否される)。", 1],
  ["2022r04-q074", "correct", "zh", "这样一来，即使某人认证进入后把 ID 卡借给外面的人使用，由于该卡已被视为「已进入」状态，再次进入会被拒绝，从而防止一次认证让多人接连进入的尾随（piggyback）。",
    "通过尾随（piggyback，一次认证让多人接连进入）进入的人，其 ID 没有入室记录，因此出室（以及之后的入室）认证会被拒绝，非法入室就会暴露，从而检测和抑制尾随（把已进入的卡借给外面的人再次进入，也会被同一机制拒绝）。", 1],
  ["2022r04-q074", "correct", "en", "As a result, even if a person who has authenticated and entered lends their ID card to someone outside, the card is already treated as having entered, so re-entry is refused, which prevents tailgating (piggybacking) where several people enter one after another on a single authentication.",
    "A person who got in by tailgating (piggybacking, where several people enter one after another on a single authentication) has no entry record on their ID, so their exit (and any later entry) is refused at authentication; this exposes the unauthorized entry and so detects and deters tailgating (lending an already-entered card to someone outside for re-entry is refused by the same mechanism).", 1],
  ["2022r04-q074", "p:0", "jp", "入室済み ID の再入室 (カード又貸し) を拒否して共連れ (ピギーバック) を防ぐ", "入室記録の無い ID の退室を拒否して共連れ (ピギーバック) を検知・抑止する (入室済み ID の再入室も拒否する)", 1],
  ["2022r04-q074", "p:0", "zh", "拒绝已进入 ID 的再次进入（卡片转借），以防止尾随（piggyback）", "拒绝没有入室记录的 ID 出室，以检测和抑制尾随（piggyback）（已进入 ID 的再次进入也会被拒绝）", 1],
  ["2022r04-q074", "p:0", "en", "refuses re-entry by an already-entered ID (card lending), thereby preventing tailgating (piggybacking)", "refuses exit by an ID with no entry record, thereby detecting and deterring tailgating (piggybacking) (re-entry by an already-entered ID is also refused)", 1],
  // 2022r04-q084
  ["2022r04-q084", "d:イ", "jp", "レーザ光でディスクを回転させ読み書きする。", "ディスクをモータで回転させ、レーザ光で読み書きする。", 1],
  ["2022r04-q084", "d:イ", "zh", "通过激光旋转盘片来读写。", "由电机旋转盘片、用激光读写。", 1],
  ["2022r04-q084", "d:イ", "en", "that is read and written by spinning the disc with a laser beam.", "in which the disc is spun by a motor and read and written with a laser beam.", 1],
  // 2022r04-q094
  ["2022r04-q094", "d:ウ", "jp", "熱転写（感熱・溶融型）プリンタの説明です。ラベルやレシートなどで使われる方式で、", "熱転写（溶融型）プリンタの説明です。ラベルなどの印字に使われる方式で (レシートで多いのは、インクを使わず感熱紙を発色させる感熱方式)、", 1],
  ["2022r04-q094", "d:ウ", "zh", "热转印（热敏·热熔型）打印机的说明。这是标签、小票等常用的方式，", "热转印（热熔型）打印机的说明。这是标签等常用的方式（小票多用不使用墨水、让热敏纸显色的热敏方式），", 1],
  ["2022r04-q094", "d:ウ", "en", "a thermal-transfer (thermal / meltable-type) printer. It is used for labels, receipts, and the like, and", "a thermal-transfer (meltable-type) printer. It is used for printing labels and the like (receipts mostly use the direct thermal method, which uses no ink and makes thermal paper change color), and", 1],
  ["2022r04-q094", "p:1", "jp", "熱転写・感熱（熱でインクを溶かす）", "熱転写（熱でインクを溶かす）・感熱（感熱紙を熱で発色させる）", 1],
  ["2022r04-q094", "p:1", "zh", "热转印·热敏（用热熔化墨水）", "热转印（用热熔化墨水）·热敏（用热使热敏纸显色）", 1],
  ["2022r04-q094", "p:1", "en", "thermal-transfer and thermal (heat melts the ink)", "thermal-transfer (heat melts the ink) / direct thermal (heat colors thermal paper)", 1],
];

// translations sidecar (+ .phase1 tr_): 照合のみ、同じ誤りは無し
const TRFIX = [];

// ── D-143 note (final のみ後置、round1・既存 note・flag は不可触) ──
const MARK = "fidfix-S131-efix4g";
const E = "S131 efix4g 解説監査 (efull_5)";
const N = (id, s) => [id, () => `（${E}: ${s} — ${MARK}）`];
const NOTE_APPEND = [
  N("2022r04-q022", "誤答肢エの「製品ミックス (プロダクトポートフォリオ)」は PPM と混同させるため、「プロダクトミックス (線形計画法などによる最適な生産・販売計画)」に改めた (jp / zh / en)。correct_answer は不変"),
  N("2022r04-q068", "誤答肢エが「SSID を空欄にしてもつながらない」と断定していたが、エは実在する ANY 接続の説明 (ルータが ANY 接続拒否をしていなければつながる)。ゲスト SSID の機能ではない、ANY 接続拒否・SSID ステルスで防ぐ対象、という形に改めた (jp / zh / en)。correct_answer=ア は不変"),
  N("2022r04-q074", "正解解説・要点 1 がアンチパスバックの共連れ防止をカードの又貸し (再入室拒否) で説明していたが、共連れの同行者はカードを使わない。共連れで入った者の ID には入室記録が無く退室が拒否され、不正入室が発覚して検知・抑止になる、という仕組みに改めた (jp / zh / en)。correct_answer=ア は不変"),
  N("2022r04-q084", "誤答肢イの「レーザ光でディスクを回転させ」を「ディスクをモータで回転させ、レーザ光で読み書きする」に改めた (jp / zh / en)。correct_answer は不変"),
  N("2022r04-q094", "誤答肢ウ・要点 2 が感熱方式と熱転写方式を混同していた (熱転写 = 熱でインクを溶かす、感熱 = インクを使わず感熱紙を発色) のを分け、レシートの例は感熱方式と注記した (jp / zh / en)。correct_answer=ア は不変"),
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
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S131-efix4g: applied ${applied}, skipped ${skipped}`);
