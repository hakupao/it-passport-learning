#!/usr/bin/env node
// Stage 6 / Quiz — S130 ⑨ 読点・範囲記号の全庫走査 (D-170 で後回しにした「exam 全体が 、 の型」を 1 回の決定的走査で揃える)。
// 範囲設計 = evidence/quiz_punct_sweep_scope_S130.md。本 script は **既定 dry-run** (書込みなし、field ごとの before/after と集計を出す)。
//
// 源の字形 (29 exam × 2 頁以上を原寸で実読、tesseract jpn は ，を ASCII , に潰すので OCR は 、/ 読点族の区別にしか使えない):
//   読点 = 全 exam 全頁で全角 ，(U+FF0C)。「、」は 0 (OCR の 、 は全て誤認識、2010h22a p35 / 2010h22h p26 / 2018h30h p25 を実読で確認)。
//   組合せ選択肢「a，b，c」「A，X，Z」「①，②」・引用の列挙「“/”，“.”」・英字の列挙「入力 A，B」も ，。
//   範囲 = 波形 (例「問93 ～ 96」「A2～H11」)。走査像から U+FF5E / U+301C は判別できない → 既存の題ごと是正 (X3 2020r02o-q079/q094) と同じ ～ に寄せる。
//
// 規則 (表示される jp の題幹 / 選択肢、保護区間の外だけ):
//   R1 「、」→「，」 (D-170 ⑨)
//   R2 ASCII「,」(+ 直後の半角空白) →「，」。ただし 英数字,英数字 (空白なし: 1,200 / w,w,b) と英文 (英単語, 英字) は不変
//   R3 範囲の「〜」(U+301C) / 「~」→「～」(U+FF5E)
// 保護区間 (不変、件数だけ報告): ``` 囲み・`code`・URL・擬似言語の行 (D-155、← / ○ / if / for … で始まる行)・
//   表計算の式 (関数名(…) と セル番地を含む括弧、D-162 — 区切りの字形は原典が ，でも式は ASCII の型を保つ。範囲記号 〜 だけは R3 を当てる)・
//   ASCII だけの引用 “…” "…" '…' (D-166 リテラル・検索パターン)・SQL 行・中問前文の registry probe 窓 (D-167、chumon_groups.json の
//   probe が committed evidence 由来 → 窓内を変えると A7 / --check が落ちる)。窓・COPY cut marker に対象字形がある field は丸ごと据え置く
//   (窓の外だけ変えると field 内混在になる)。
// 層: 題幹 = questions.json / question_bank.json / by_year の stem_jp + translations stem_jp_clean + .phase1 tr_ stem_jp_clean (各層に同じ関数を独立適用)、
//     選択肢 = 3 raw 層の choices_jp (出荷層)。解説 jp (AI 生成の散文、源が無い) と zh / en は対象外 (件数のみ報告)。
// assert: 正規化 (，、, → , / 〜～~ → ~ / 読点後の半角空白除去) で before == after、parseStemBlocks / parseChoice(WithHint zh・en) の構造不変、
//         raw 3 層の before 一致 (不一致は報告して各層に独立適用)、apply 後 questions.json == question_bank.json。
//
// Run: node scripts/quiz-punct-sweep-S130.mjs                 (dry-run: 集計 + 抽検 20 + data/ip/quiz/.phase2/punct_sweep_S130_dryrun.json)
//      node scripts/quiz-punct-sweep-S130.mjs --tier=r1        (R1 だけ。r1 / r1r3 / all、既定 all)
//      node scripts/quiz-punct-sweep-S130.mjs --apply          (data lock を持つ lane だけ。→ build-quiz-corpus → keys-crosscheck → chumon-groups-build --check)
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P = (...s) => path.join(ROOT, ...s);
const DRY = !process.argv.includes("--apply") || process.argv.includes("--dry-run");
const TIER = (process.argv.find((a) => a.startsWith("--tier=")) ?? "--tier=all").slice(7);
if (!["r1", "r1r3", "all"].includes(TIER)) throw new Error(`unknown --tier=${TIER}`);
const RULES = { R1: true, R2: TIER === "all", R3: TIER !== "r1" };
const { parseChoice, parseChoiceWithHint, parseStemBlocks } = await import(pathToFileURL(P("apps/web/src/lib/quiz/quizRichText.ts")).href);

const LOADED = new Map();
const rj = (f) => { const d = JSON.parse(readFileSync(f, "utf-8")); LOADED.set(f, JSON.stringify(d, null, 2)); return d; };
const written = [];
const wj = (f, d) => {
  const next = JSON.stringify(d, null, 2);
  if (LOADED.get(f) === next) return;
  written.push(path.relative(ROOT, f));
  if (!DRY) writeFileSync(f, next + "\n");
};

// ── 保護区間 ────────────────────────────────────────────────────────────────
const FUNCS = "合計|平均|最大|最小|個数|条件付個数|条件付合計|表引き|照合検索|照合一致|水平照合|垂直照合|整数部|剰余|平方根|標準偏差|順位|切上げ|切捨て|四捨五入|論理積|論理和|否定|文字列結合|IF|[A-Z][A-Za-z]+";
const FUNC_AT = new RegExp(`(?:${FUNCS})[(（]`, "g");
const CELL = /\$?[A-Z]{1,2}\$?\d+/;
const CODE_HEAD = /^[ \t　]*(?:○|◆|⋮|if\b|elseif\b|else\b|endif\b|for\b|endfor\b|while\b|endwhile\b|do\b|return\b|整数型|実数型|文字列型|文字型|論理型|大域)/;
const CODE_LINE = new RegExp(`${CODE_HEAD.source}|←|\\b(?:SELECT|FROM|WHERE|INSERT|UPDATE|LIKE)\\b`);
const OPEN = { "(": ")", "（": "）" };

function closeParen(s, i) { // s[i] は開き括弧。対応する閉じ括弧の index (無ければ行末)
  let depth = 0;
  for (let k = i; k < s.length; k++) {
    if (s[k] === "\n") return k - 1;
    if (OPEN[s[k]]) depth++;
    else if (s[k] === ")" || s[k] === "）") { if (--depth === 0) return k; }
  }
  return s.length - 1;
}

function protectMask(s, freeze) {
  const m = new Array(s.length).fill(null);
  const mark = (a, b, why) => { for (let k = Math.max(0, a); k <= Math.min(b, s.length - 1); k++) m[k] ??= why; };
  for (const x of s.matchAll(/```[\s\S]*?(```|$)/g)) mark(x.index, x.index + x[0].length - 1, "code-fence");
  for (const x of s.matchAll(/`[^`\n]+`/g)) mark(x.index, x.index + x[0].length - 1, "code-inline");
  for (const x of s.matchAll(/https?:\/\/[^\s“”"、，]+/g)) mark(x.index, x.index + x[0].length - 1, "url");
  let off = 0;
  // ← は擬似言語の代入。ただし「。」を含む行は散文 (2010h22a-q048「矢印 (←——)」・2010h22h-q053「“x←y”は,」)
  for (const line of s.split("\n")) { if (CODE_LINE.test(line) && !(/←/.test(line) && !CODE_HEAD.test(line) && /。/.test(line))) mark(off, off + line.length - 1, "code-line"); off += line.length + 1; }
  for (const x of s.matchAll(FUNC_AT)) { const p = x.index + x[0].length - 1; mark(x.index, closeParen(s, p), "formula"); }
  for (const x of s.matchAll(/[(（]/g)) { const e = closeParen(s, x.index), body = s.slice(x.index + 1, e); if (CELL.test(body) && /[:：,<>=≦≧＜＞*／/+-]/.test(body) && !/[ぁ-ん]/.test(body)) mark(x.index, e, "formula"); }
  for (const x of s.matchAll(/“([^”\n]*)”|"([^"\n]*)"|'([^'\n]*)'/g)) if (/^[\x20-\x7e]*$/.test(x[1] ?? x[2] ?? x[3])) mark(x.index, x.index + x[0].length - 1, "ascii-quote");
  if (freeze) mark(freeze[0], freeze[1], "chumon-probe");
  return m;
}

// probe (空白除去後の先頭 40 字) が s の中で占める元の区間 [a, b]。無ければ null。
function probeSpan(s, probe) {
  const idx = [], chars = [];
  for (let k = 0; k < s.length; k++) if (!/\s/.test(s[k])) { idx.push(k); chars.push(s[k]); }
  const at = chars.join("").indexOf(probe);
  return at < 0 ? null : [idx[at], idx[at + probe.length - 1]];
}

const isAsciiWordChar = (c) => /[A-Za-z]/.test(c ?? "");
// 「英文」= 直前の語が小文字を含む英字 3 字以上、直後も英字 (例 "Plan, Do")。「a, b」「A, X」のような 1 字の列挙は英文ではない (源は ，)
function englishAt(s, i) {
  let a = i - 1; while (a >= 0 && s[a] === " ") a--;
  let st = a; while (st >= 0 && isAsciiWordChar(s[st])) st--;
  const prev = s.slice(st + 1, a + 1);
  let n = i + 1; while (n < s.length && s[n] === " ") n++;
  return prev.length >= 3 && /[a-z]/.test(prev) && isAsciiWordChar(s[n]);
}

/** 1 field の走査。edits = 置換した箇所、kept = 保護区間・例外で据え置いた対象字形 */
function sweep(s, freeze) {
  const m = protectMask(s, freeze);
  let out = ""; const edits = [], kept = [];
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const tgt = c === "、" || c === "," || c === "〜" || c === "~";
    if (!tgt) { out += c; continue; }
    // 式の中の範囲記号は R3 の対象 (D-162「範囲記号は原典どおり」= 源は散文と同じ波形、2013h25h p43「合計(B4～B13)」)。
    //   式を保護したまま散文側だけ ～ にすると 2013h25h-q096 のように field 内で 〜 / ～ が混在する。
    if (m[i] && !(m[i] === "formula" && (c === "〜" || c === "~"))) { kept.push({ at: i, ch: c, why: m[i] }); out += c; continue; }
    if (c === "、") { if (RULES.R1) { edits.push({ at: i, rule: "R1", from: c }); out += "，"; } else out += c; continue; }
    if (c === ",") {
      if (/\d/.test(s[i - 1] ?? "") && /\d/.test(s[i + 1] ?? "")) { kept.push({ at: i, ch: c, why: "digit,digit" }); out += c; continue; }
      // 英数字,英数字 (空白なし) = データ・出力のリテラル (2011h23a-q089〜092「w,w,b,…」は「コンマを含めて 97 文字」と数える)
      //   ただし run の語が全て 1 字の記号 a〜f / A〜F (組合せ選択肢「a,b,c」・題幹「a,b に入れる」「A,B に分けた」、源は ，) なら列挙として R2。
      if (/[A-Za-z0-9]/.test(s[i - 1] ?? "") && /[A-Za-z0-9]/.test(s[i + 1] ?? "")) {
        let a = i; while (a > 0 && /[A-Za-z0-9,]/.test(s[a - 1])) a--;
        let b = i; while (b < s.length - 1 && /[A-Za-z0-9,]/.test(s[b + 1])) b++;
        if (!s.slice(a, b + 1).split(",").filter(Boolean).every((w) => /^[a-fA-F]$/.test(w))) { kept.push({ at: i, ch: c, why: "ascii-tight" }); out += c; continue; }
      }
      if (englishAt(s, i)) { kept.push({ at: i, ch: c, why: "english" }); out += c; continue; }
      if (!RULES.R2) { out += c; continue; }
      let j = i + 1; while (s[j] === " " || s[j] === "\t") j++;
      const ascii = /[\x21-\x7e]/.test(s[i - 1] ?? "") && /[\x21-\x7e]/.test(s[j] ?? "");
      edits.push({ at: i, rule: ascii ? "R2-ascii-list" : "R2", from: s.slice(i, j) }); out += "，"; i = j - 1; continue;
    }
    // 〜 / ~ : 範囲 (前後が非空白) だけ
    const prev = s.slice(0, i).trimEnd().slice(-1), next = s.slice(i + 1).trimStart()[0];
    if (!prev || !next || prev === "\n" || next === "\n") { kept.push({ at: i, ch: c, why: "not-range" }); out += c; continue; }
    if (RULES.R3) { edits.push({ at: i, rule: "R3", from: c }); out += "～"; } else out += c;
  }
  return { out, edits, kept };
}

const canon = (s) => s.replace(/[，、,][ \t]*/g, ",").replace(/[〜～~]/g, "~");
const shapeStem = (s) => JSON.stringify(parseStemBlocks(s).map((b) => b.kind === "code" ? ["code", b.text] : b.kind === "table" ? ["table", b.header?.length, b.rows?.length] : [b.kind]));
const shapeChoice = (c) => JSON.stringify(c.kind === "pairs" ? ["pairs", c.cells.map((x) => x.key)] : c.kind === "table" ? ["table", c.header?.length, c.rows?.length] : c.kind === "tables" ? ["tables", c.tables.map((t) => t.header.length)] : [c.kind]);

// ── 読込 ──────────────────────────────────────────────────────────────────
const Qdoc = rj(P("data/ip/quiz/questions.json")); const Bdoc = rj(P("data/ip/exams/question_bank.json")); const Barr = Bdoc.questions ?? Bdoc;
const Bmap = new Map(Barr.map((x) => [x.id, x]));
const exams = [...new Set(Qdoc.questions.map((q) => q.id.split("-q")[0]))].sort();
const BY = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/exams/by_year", `${e}.json`))]));
const TR = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/quiz/translations", `${e}.json`))]));
const GROUPS = JSON.parse(readFileSync(P("data/ip/quiz/chumon_groups.json"), "utf-8")).groups;
// scripts/quiz-chumon-groups-build.mjs の COPY 表の jp cut marker (写し。marker 内に対象字形があるのは 2011h23a-q093「(1)〜(5)」だけ)
const COPY_MARKERS = ["〔A さんが書き出したメモ〕の(1)〜(5)を実施する順番", "次に示す〔個人情報の適正管理に関する規程〕", "画素データを圧縮せずに出力した場合", "案Aと案Bのどちらで製品Hの製造原価が低くなるのかは", "Xソフトの開発が終了する日は"];
const PROBE = new Map(); for (const g of GROUPS) for (const id of g.member_ids) PROBE.set(id, { key: g.key, probe: g.probe.jp, origin: g.origin });

const rep = { tier: TIER, per_exam: {}, fields: [], raw_divergent: [], probe_frozen: [], parse_changed: [], kept_by_reason: {}, kept_ctx: {}, edit_ctx: {}, explanations_jp: {}, zh: {} };
const ex = (e) => (rep.per_exam[e] ??= { stems: 0, choices: 0, stems_changed: 0, choices_changed: 0, R1: 0, R2: 0, "R2-ascii-list": 0, R3: 0, kept: 0, mixed_before: 0 });
const glyphSet = (s) => [s.includes("，") && "，", s.includes("、") && "、", /,(?!\d)|(?<!\d),/.test(s) && ","].filter(Boolean).join("");
let applied = 0;

function apply(obj, key, where, freezeProbe) {
  const s = obj?.[key];
  if (typeof s !== "string") return null;
  let r = sweep(s, freezeProbe ? probeSpan(s, freezeProbe) : null);
  // probe 窓に対象字形が残る field は丸ごと据え置く (窓の外だけ変えると field 内で字形が混在する = D-170 の混在禁止に反する)。
  if (r.kept.some((k) => k.why === "chumon-probe")) r = { out: s, edits: [], kept: [...r.kept.filter((k) => k.why !== "chumon-probe"), ...r.edits.map((d) => ({ at: d.at, ch: d.from[0], why: "chumon-probe-field" })), ...r.kept.filter((k) => k.why === "chumon-probe")] };
  // lightweight-copy の cut marker (chumon-groups-build の COPY 表) を崩す field も丸ごと据え置く (marker が消えると再生成が throw)。
  else if (COPY_MARKERS.some((mk) => s.includes(mk) && !r.out.includes(mk))) r = { out: s, edits: [], kept: [...r.kept, ...r.edits.map((d) => ({ at: d.at, ch: d.from[0], why: "copy-marker-field" }))] };
  if (canon(r.out) !== canon(s)) throw new Error(`${where}: 正規化後に before ≠ after — abort`);
  if (freezeProbe && probeSpan(s, freezeProbe) && !probeSpan(r.out, freezeProbe)) throw new Error(`${where}: probe 窓が崩れた — abort`);
  if (r.out !== s) { obj[key] = r.out; applied++; }
  return r;
}

for (const q of Qdoc.questions) {
  const id = q.id, e = id.split("-q")[0], b = Bmap.get(id), y = BY[e].questions.find((x) => x.id === id), t = TR[e].questions[id];
  const t1f = P("data/ip/quiz/.phase1", `tr_${id}.json`); const t1 = existsSync(t1f) ? rj(t1f) : null;
  const pr = PROBE.get(id)?.probe;
  // 題幹: 表示層で記録、全層に同関数を適用
  const clean = t?.stem_jp_clean?.trim() ? t.stem_jp_clean : null;
  const raws = [[q, "questions"], [b, "question_bank"], [y, "by_year"]];
  if (new Set(raws.map(([o]) => o.stem_jp)).size > 1) rep.raw_divergent.push(`${id} stem`);
  const dispBefore = clean ?? q.stem_jp;
  const shapeBefore = shapeStem(dispBefore);
  const rDisp = apply(clean ? t : q, clean ? "stem_jp_clean" : "stem_jp", `${id} display stem`, pr);
  const dispAfter = clean ? t.stem_jp_clean : q.stem_jp;
  if (shapeStem(dispAfter) !== shapeBefore) rep.parse_changed.push(`${id} stem`);
  for (const [o, w] of raws) if (!(o === q && !clean)) apply(o, "stem_jp", `${id} ${w}.stem_jp`, pr);
  if (t1?.stem_jp_clean) apply(t1, "stem_jp_clean", `${id} .phase1 tr_.stem_jp_clean`, pr);
  if (t1) wj(t1f, t1);
  if (pr && rDisp.kept.some((k) => k.why === "chumon-probe")) rep.probe_frozen.push({ id, group: PROBE.get(id).key, kept: rDisp.kept.filter((k) => k.why === "chumon-probe").map((k) => k.ch).join("") });
  const E = ex(e); E.stems++; if (dispAfter !== dispBefore) E.stems_changed++;
  if (glyphSet(dispBefore).length > 1) E.mixed_before++;
  record(e, `${id} stem`, dispBefore, dispAfter, rDisp);
  // 選択肢: raw 3 層 (出荷層 = questions.json)
  for (const L of Object.keys(q.choices_jp)) {
    if (new Set(raws.map(([o]) => o.choices_jp?.[L])).size > 1) rep.raw_divergent.push(`${id} ${L}`);
    const before = q.choices_jp[L];
    const hintBefore = ["zh", "en"].map((l) => t?.choices?.[L]?.[l] ? shapeChoice(parseChoiceWithHint(t.choices[L][l], before)) : "");
    let r0 = null;
    for (const [o, w] of raws) { const r = apply(o.choices_jp, L, `${id} ${w}.choices_jp.${L}`, null); if (o === q) r0 = r; }
    const after = q.choices_jp[L];
    if (shapeChoice(parseChoice(after)) !== shapeChoice(parseChoice(before))) rep.parse_changed.push(`${id} ${L}`);
    const hintAfter = ["zh", "en"].map((l) => t?.choices?.[L]?.[l] ? shapeChoice(parseChoiceWithHint(t.choices[L][l], after)) : "");
    if (hintAfter.join() !== hintBefore.join()) rep.parse_changed.push(`${id} ${L} (zh/en hint)`);
    E.choices++; if (after !== before) E.choices_changed++;
    if (glyphSet(before).length > 1) E.mixed_before++;
    record(e, `${id} ${L}`, before, after, r0);
  }
}

function record(e, where, before, after, r) {
  const E = ex(e);
  for (const d of r.edits) E[d.rule]++;
  E.kept += r.kept.length;
  const ctx = (at) => `${where}: ${before.slice(Math.max(0, at - 14), at + 14).replace(/\n/g, "⏎")}`;
  for (const k of r.kept) {
    rep.kept_by_reason[k.why] = (rep.kept_by_reason[k.why] ?? 0) + 1;
    (rep.kept_ctx[k.why] ??= []).push(ctx(k.at));
  }
  for (const d of r.edits) if (d.rule !== "R1" && d.rule !== "R2") (rep.edit_ctx[d.rule] ??= []).push(ctx(d.at));
  if (before !== after) rep.fields.push({ where, rules: [...new Set(r.edits.map((d) => d.rule))], before, after });
}

// apply 後: A7 相当 (全組・全メンバーの translations stem_jp_clean が空白除去後に jp probe を含む) と COPY marker の残存
for (const g of GROUPS) for (const id of g.member_ids) {
  const s = TR[id.split("-q")[0]].questions[id]?.stem_jp_clean;
  if (typeof s === "string" && !s.replace(/\s+/g, "").includes(g.probe.jp)) throw new Error(`${id}: group ${g.key} の jp probe が表示 stem から消えた — abort`);
}
for (const mk of COPY_MARKERS) if (!Object.values(TR).some((d) => Object.values(d.questions).some((t) => t.stem_jp_clean?.includes(mk)))) throw new Error(`COPY marker「${mk}」が stem_jp_clean から消えた — abort`);

// apply 後: questions.json と bank の題幹・選択肢が一致すること (build-quiz-corpus の再生成と同値)
for (const q of Qdoc.questions) {
  const b = Bmap.get(q.id);
  if (q.stem_jp !== b.stem_jp && !rep.raw_divergent.includes(`${q.id} stem`)) throw new Error(`${q.id}: questions.json ≠ bank stem after sweep`);
  for (const L of Object.keys(q.choices_jp)) if (q.choices_jp[L] !== b.choices_jp[L] && !rep.raw_divergent.includes(`${q.id} ${L}`)) throw new Error(`${q.id} ${L}: questions.json ≠ bank after sweep`);
}

// ── 対象外の計数: 解説 jp (.phase2 が真相源) と zh 層 ───────────────────────
const cnt = (s, re) => (s.match(re) ?? []).length;
for (const q of Qdoc.questions) {
  const e = q.id.split("-q")[0], f = P("data/ip/quiz/.phase2", `expl_jp_${q.id}.json`);
  const X = (rep.explanations_jp[e] ??= { fields: 0, with_touten: 0, touten: 0, with_fw_comma: 0, ascii_comma_sp: 0, wave_301c: 0 });
  if (existsSync(f)) {
    const j = JSON.parse(readFileSync(f, "utf-8"));
    for (const s of [j.correct_jp, ...j.distractors_jp.map((d) => d.why_wrong_jp), ...j.points_jp]) {
      if (typeof s !== "string") continue;
      X.fields++; if (s.includes("、")) X.with_touten++; X.touten += cnt(s, /、/g); if (s.includes("，")) X.with_fw_comma++; X.ascii_comma_sp += cnt(s, /, /g); X.wave_301c += cnt(s, /〜/g);
    }
  }
  const t = TR[e].questions[q.id], Z = (rep.zh[e] ??= { fields: 0, fw_comma: 0, ascii_comma_cjk: 0, touten: 0 });
  for (const s of [t?.stem?.zh, ...Object.values(t?.choices ?? {}).map((c) => c?.zh)]) {
    if (typeof s !== "string") continue;
    Z.fields++; Z.fw_comma += cnt(s, /，/g); Z.touten += cnt(s, /、/g); Z.ascii_comma_cjk += cnt(s, /(?<=[一-鿿]),\s*|,\s*(?=[一-鿿])/g);
  }
}

// ── 出力 ──────────────────────────────────────────────────────────────────
wj(P("data/ip/quiz/questions.json"), Qdoc); wj(P("data/ip/exams/question_bank.json"), Bdoc);
for (const e of exams) { wj(P("data/ip/exams/by_year", `${e}.json`), BY[e]); wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]); }

const tot = Object.values(rep.per_exam).reduce((a, E) => { for (const k in E) a[k] = (a[k] ?? 0) + E[k]; return a; }, {});
console.log(`exam | stems chg/all | choices chg/all | R1 、 | R2 , | R2 ascii-list | R3 〜~ | kept | mixed_before`);
for (const [e, E] of Object.entries(rep.per_exam)) console.log(`${e} | ${E.stems_changed}/${E.stems} | ${E.choices_changed}/${E.choices} | ${E.R1} | ${E.R2} | ${E["R2-ascii-list"]} | ${E.R3} | ${E.kept} | ${E.mixed_before}`);
console.log(`TOTAL | ${tot.stems_changed}/${tot.stems} | ${tot.choices_changed}/${tot.choices} | ${tot.R1} | ${tot.R2} | ${tot["R2-ascii-list"]} | ${tot.R3} | ${tot.kept} | ${tot.mixed_before}`);
console.log(`kept_by_reason ${JSON.stringify(rep.kept_by_reason)}`);
console.log(`raw_divergent ${rep.raw_divergent.length} / parse_changed ${rep.parse_changed.length}${rep.parse_changed.length ? ": " + rep.parse_changed.join(", ") : ""}`);
console.log(`probe_frozen ${rep.probe_frozen.length}: ${rep.probe_frozen.map((p) => `${p.id}(${p.kept})`).join(" ")}`);
// 抽検 20 (seed 固定 LCG、fields から非復元抽出)
let seed = 130; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const pool = [...rep.fields]; rep.samples = [];
for (let k = 0; k < 20 && pool.length; k++) rep.samples.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
rep.totals = tot;
writeFileSync(P("data/ip/quiz/.phase2", `punct_sweep_S130_${TIER}_dryrun.json`), JSON.stringify(rep, null, 2) + "\n");
console.log(`  files ${DRY ? "to write" : "written"} (${written.length})`);
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-punct-sweep-S130 [tier=${TIER}]: fields changed ${rep.fields.length}, layer writes ${applied} — report data/ip/quiz/.phase2/punct_sweep_S130_${TIER}_dryrun.json`);
