#!/usr/bin/env node
// Stage 6 / Quiz — S131 **efix4a** (解説是正 lane、D-176: 1 unit = 1 exam): 解説全量監査 efull_4 (evidence/phase5/stage_06_quiz_phase2/
// ruleA_result_S131_efull_4.json) のうち 2018h30a の medium 4 題を是正する。evidence/quiz_efix4a_expl_S131.md。
//
// 層・方針は quiz-fidfix-S131-efix3 と同じ (subN で出現数を厳密に要求・0 回なら skip / expl は .phase2 expl_jp_ / expl_tr_ を直して
// phase2-merge で再生成 / D-143 note は final に純粋後置・round1 と既存 note・flag は不可触)。
//
// ── 是正 (判定は evidence §1) ──
//   2018h30a-q025 正解: 「営利・事業のための利用ではなく保護活動」を規制対象外の第二の理由にしていた → 生命・身体の保護は同意不要の例外の事由。
//   2018h30a-q051 ア: zh / en が「ブラウザだけで使える」(十分条件) を「ブラウザでしか使えない」(限定) に取り違え。
//   2018h30a-q067 正解・要点 1/2: 脅威を「外部からの原因」と定義 → 外部・内部を問わない (JIS Q 27000)。
//   2018h30a-q071 イ: SPEC は「仕様の略語」ではなく Standard Performance Evaluation Corporation とそのベンチマーク。
//
// Run: node scripts/quiz-fidfix-S131-efix4a.mjs            (dry-run: 全操作の from/to を表示、書込みなし)
//      node scripts/quiz-fidfix-S131-efix4a.mjs --apply    (D-152 lock 取得後のみ)
//   → node scripts/build-quiz-corpus.mjs
//   → node scripts/quiz-phase2-merge.mjs 2018h30a
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
  // 2018h30a-q025
  ["2018h30a-q025", "correct", "jp", "さらに、徘徊していた認知症の老人をクレジットカードの情報から本人特定して自宅へ送り届ける行為は、営利や事業のための利用ではなく、人の生命・身体を守るための公的な保護活動である。",
    "なお、人の生命・身体の保護は、本人の同意なしに目的外利用や第三者提供ができる例外の事由であって、法の適用対象から外れる理由ではない (2017 年改正以降は自治会などの非営利団体も個人情報取扱事業者に当たる)。", 1],
  ["2018h30a-q025", "correct", "zh", "此外，根据信用卡信息确认徘徊走失的认知症老人的身份并将其送回家中，这一行为并非出于营利或经营目的的利用，而是为保护他人生命与身体安全的公共保护活动。",
    "另外，保护人的生命与身体，是无需本人同意即可进行目的外利用或向第三方提供的例外事由，而不是不适用该法的理由（2017 年修订以后，自治会等非营利团体也属于个人信息处理经营者）。", 1],
  ["2018h30a-q025", "correct", "en", "Furthermore, identifying a wandering elderly person with dementia from their credit card information and escorting them home is not use for profit or business, but a public protective activity to safeguard a person's life and body.",
    "Note that protecting a person's life or body is a ground for exceptions that allow use beyond the stated purpose or provision to third parties without the person's consent; it is not a reason the Act does not apply (since the 2017 amendment, non-profit bodies such as neighborhood associations are also personal information handling business operators).", 1],
  // 2018h30a-q025 amend (Rule D): 「非営利団体も」→ 2017 年改正の 5,000 件要件の撤廃 (上の 3 行の適用後に当たる)
  ["2018h30a-q025", "correct", "jp", "(2017 年改正以降は自治会などの非営利団体も個人情報取扱事業者に当たる)", "(2017 年改正で 5,000 件要件が撤廃され、小規模な自治会なども個人情報取扱事業者に当たるようになった)", 1],
  ["2018h30a-q025", "correct", "zh", "（2017 年修订以后，自治会等非营利团体也属于个人信息处理经营者）", "（2017 年修订撤销了 5,000 件的门槛，小规模的自治会等也属于个人信息处理经营者）", 1],
  ["2018h30a-q025", "correct", "en", "(since the 2017 amendment, non-profit bodies such as neighborhood associations are also personal information handling business operators)", "(the 2017 amendment abolished the 5,000-record threshold, so even small bodies such as neighborhood associations became personal information handling business operators)", 1],
  // 2018h30a-q051
  ["2018h30a-q051", "d:ア", "zh", "「使邮件服务仅能通过 Web 浏览器使用」", "「只需 Web 浏览器即可使用邮件服务」", 1],
  ["2018h30a-q051", "d:ア", "en", "Making the service usable only through a web browser", "Making the service usable with just a web browser", 1],
  // 2018h30a-q067
  ["2018h30a-q067", "correct", "jp", "情報資産に損害を与えうる外部からの原因や事象を指す。", "情報資産に損害を与えうる原因や事象 (外部・内部を問わない) を指す。", 1],
  ["2018h30a-q067", "correct", "zh", "可能对信息资产造成损害的、来自外部的原因或事件。", "可能对信息资产造成损害的原因或事件（不论来自外部还是内部）。", 1],
  ["2018h30a-q067", "correct", "en", "A threat is an external cause or event that could cause damage to information assets.", "A threat is a cause or event, external or internal, that could cause damage to information assets.", 1],
  ["2018h30a-q067", "p:0", "jp", "情報資産に損害を与えうる外的な原因・事象", "情報資産に損害を与えうる原因・事象 (外部・内部を問わない)", 1],
  ["2018h30a-q067", "p:0", "zh", "可能对信息资产造成损害的外部原因或事件", "可能对信息资产造成损害的原因或事件（不论外部还是内部）", 1],
  ["2018h30a-q067", "p:0", "en", "Threat = an external cause or event that could cause damage", "Threat = a cause or event, external or internal, that could cause damage", 1],
  ["2018h30a-q067", "p:1", "jp", "外部で発生し資産を脅かす事象 (停電・災害・攻撃など) が脅威", "弱点に付け込んで資産に損害を起こす事象・行為 (停電・災害・攻撃・内部者の不正や誤操作など) が脅威", 1],
  ["2018h30a-q067", "p:1", "zh", "发生在外部、威胁资产的事件（停电、灾害、攻击等）属于威胁", "利用弱点对资产造成损害的事件或行为（停电、灾害、攻击、内部人员的违规或误操作等）属于威胁", 1],
  ["2018h30a-q067", "p:1", "en", "whereas events that occur externally and threaten assets (power outages, disasters, attacks, etc.) are threats", "whereas events or acts that exploit those weaknesses to damage assets (power outages, disasters, attacks, insider wrongdoing or operating mistakes, etc.) are threats", 1],
  // 2018h30a-q071
  ["2018h30a-q071", "d:イ", "jp", "SPEC は「仕様 (specification)」を意味する一般的な略語で、", "SPEC はコンピュータの性能評価ベンチマークを策定する非営利団体 (Standard Performance Evaluation Corporation)、およびそのベンチマーク (SPECint・SPECfp など) を指し、", 1],
  ["2018h30a-q071", "d:イ", "zh", "SPEC 是表示「规格 (specification)」的通用缩写，", "SPEC 指制定计算机性能评测基准的非营利组织（Standard Performance Evaluation Corporation）及其基准（SPECint、SPECfp 等），", 1],
  ["2018h30a-q071", "d:イ", "en", "SPEC is a common abbreviation meaning specification;", "SPEC refers to the Standard Performance Evaluation Corporation, a non-profit that develops computer performance benchmarks, and to its benchmarks (SPECint, SPECfp, etc.);", 1],
];

// translations sidecar (+ .phase1 tr_): 本 unit では無し
const TRFIX = [
  // amend (Rule D): 選択肢アの訳にも解説と同じ取り違え (jp は不変)
  ["2018h30a-q051", "ア", "zh", "使邮件服务仅能通过 Web 浏览器使用。", "只需 Web 浏览器即可使用邮件服务。", 1],
  ["2018h30a-q051", "ア", "en", "Make the email service usable only through a web browser.", "Make the email service usable with just a web browser.", 1],
];

// ── D-143 note (final のみ後置、round1・既存 note・flag は不可触) ──
const MARK = "fidfix-S131-efix4a";
const E = "S131 efix4a 解説監査 (efull_4)";
const N = (id, s) => [id, () => `（${E}: ${s} — ${MARK}）`];
// [id, () => note] の列。同じ題に 2 本 (初回 + Rule D 後の amend) あるので object にせず、後置済みかは note の全文で判定する。
const NOTE_APPEND = [
  [  "2018h30a-q025", () => `（S131 efix4a amend (Rule D): 上記 efix4a の注記「2017 年改正以降は自治会などの非営利団体も」を、2017 年改正で 5,000 件要件が撤廃され小規模な自治会なども個人情報取扱事業者に当たるようになった、という正確な形に改めた (jp / zh / en) — ${MARK}）`],
  [  "2018h30a-q051", () => `（S131 efix4a amend (Rule D): translations の選択肢アの zh / en にも同じ取り違えがあったので「只需 Web 浏览器即可使用邮件服务。」/ "usable with just a web browser" に改めた (jp は不変) — ${MARK}）`],
];
NOTE_APPEND.unshift(...[
  N("2018h30a-q025", "正解解説が「営利・事業のための利用ではなく生命・身体を守る保護活動」を規制対象外の第二の理由にしていたが、法の適用範囲を決めるのは行為主体で、生命・身体の保護は同意不要の例外の事由。その位置づけに改めた (jp / zh / en)。行為主体が警察 = エという導出・correct_answer=エ は不変"),
  N("2018h30a-q051", "誤答肢アの zh / en が「Web ブラウザだけで使えるようにする」(ブラウザさえあれば使える) を「ブラウザでしか使えない」と取り違えていたのを改めた (zh / en)。correct_answer は不変"),
  N("2018h30a-q067", "正解解説・要点 1/2 が脅威を「外部からの原因・事象」と定義していたのを、外部・内部を問わない (JIS Q 27000「望ましくないインシデントの潜在的な原因」) に改めた (jp / zh / en)。上記導出の「外部」も同じ訂正の対象。落雷による停電 = エという導出・correct_answer=エ は不変"),
  N("2018h30a-q071", "誤答肢イの SPEC を「仕様の一般的な略語」としていたのを、Standard Performance Evaluation Corporation とその性能評価ベンチマークに改めた (jp / zh / en)。correct_answer は不変"),
]);

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
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S131-efix4a: applied ${applied}, skipped ${skipped}`);
