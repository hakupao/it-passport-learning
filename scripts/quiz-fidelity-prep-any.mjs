#!/usr/bin/env node
// Stage 6 / Quiz — S117: 任意の問番号集合に対する保真核験 input を作る (quiz-s7x-fidelity.workflow.mjs 互換)。
// s7x prep は `*_resourced_s7x` の問に固定されているため、note 起点掃引 (S114〜S116 常設順序 ④) の掛け直しや
// ① pilot の B 側 (S117 log §5) で「s7x と無関係な問番号」を渡すのに使う。是正後テキストで作り直せるよう毎回生成する。
//
// Run:  node scripts/quiz-fidelity-prep-any.mjs <exam_id> <label> <qnums: 1,2,3 | s7x | all> [--precrop]
//   → data/ip/quiz/.phase2/<label>_fidelity_input_<exam_id>.json
//
// --precrop (S119 U0 / D-146 §6): 題目領域を脚本で前裁断し、manifest に `question_crop_png` を持たせる。
//   核験 agent は「まず crop を Read、判読不能・切れている・問番号違いのときだけ源ページ」を見るので画像 Read が 1〜2 回/問に減る。
//   `source.question_bbox_pct` があればそれを使う。無い場合 (D-145: 現データは全問 **不在**) は 問N 見出し行を検出する:
//     問N の見出しは左余白 (body より ~60px 左) に出るので、exam 全ページの「行の最左インク x」分布から
//     head モード / body モードを求め、その間の帯 (strip) にインクがある行だけを拾う。
//     「問」の字内の横方向の切れ目で run が割れるため近接 run (<=8px) を併合し、1 行分の高さ (14〜44px) だけ残す。
//     さらに 2 つの絞り込み: (a) 見出し行は右端まで伸びる → 右端 < 45% 幅 は 〔マネジメント〕型の節見出しとして捨てる、
//     (b) 帯の最左インクが head モード近傍でなければ表の罫線などの誤検出として捨てる。
//   検出数がそのページの問数と一致しないときは **そのページ全問の crop を省く** (安全側に劣化 = agent は従来どおり源ページを読む)。
//   **中問 (chumon_groups.json の member) も crop を省く**: displayed_stem_jp が共有前文を併合済で、前文は別ページに在るため
//   帯には入らない。crop だけ読んだ agent が前文を「源に無い挿入」と誤報告し、fixer が正しい前文を消す経路になる (S119 U0 Rule D M-1)。
//   実測 (S119 U0): 2015h27a 40/42 ページ, 2016h28a 38/38, 2017h29h 38/39, 2018h30a 38/38 で一致。
//   不一致の残りは「bank の page_image がその問の 問N 見出しを含まないページを指す」跨ページ型で、crop 省略が正しい挙動。

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const KNOWN_FLAGS = new Set(["--precrop"]);
const unknown = argv.filter((a) => a.startsWith("--") && !KNOWN_FLAGS.has(a));
if (unknown.length) { console.error(`✗ unknown flag: ${unknown.join(", ")} (known: ${[...KNOWN_FLAGS].join(", ")})`); process.exit(1); }
const precrop = argv.includes("--precrop");
const [examId, label, spec] = argv.filter((a) => !a.startsWith("--"));
if (!examId || !label || !spec) { console.error("✗ usage: quiz-fidelity-prep-any.mjs <exam_id> <label> <qnums|s7x|all> [--precrop]"); process.exit(1); }

const bank = JSON.parse(readFileSync(path.join(ROOT, "data/ip/exams/question_bank.json"), "utf-8"));
const all = (bank.questions ?? bank).filter((q) => q.id.startsWith(`${examId}-`)).sort((a, b) => a.question_number - b.question_number);
if (!all.length) { console.error(`✗ no questions for ${examId}`); process.exit(1); }
const trFile = path.join(ROOT, "data/ip/quiz/translations", `${examId}.json`);
const tr = existsSync(trFile) ? JSON.parse(readFileSync(trFile, "utf-8")).questions : {};
/** アプリが実際に表示している題幹 (是正済 clean があればそれ)。crop 判定と manifest で同じ値を使う。 */
const displayedStem = (q) => tr[q.id]?.stem_jp_clean?.trim() || q.stem_jp;
/**
 * 内容判据 (S119 U0 Rule D M-1b): displayed が bank stem より大きく膨らんでいる = 前文/表が併合された徴候。
 * chumon 名簿は「代理判据」でしかなく、名簿外にも同型が全庫 27 題ある (例 2015h27a-q085: bank 90 字 → displayed 1032 字)。
 * この種の題に帯だけ渡すと、agent は帯外の前文を「源に無い挿入」と誤報告し、fixer が正しい前文を消す。
 */
const hasMergedPreamble = (q) => (displayedStem(q) ?? "").length > (q.stem_jp ?? "").length * 1.6 + 40;

let targets;
if (spec === "all") targets = all;
else if (spec === "s7x") targets = all.filter((q) => q.stem_resourced_s7x === true || q.choices_resourced_s7x === true);
else { const want = new Set(spec.split(",").map((n) => parseInt(n, 10))); targets = all.filter((q) => want.has(q.question_number)); if (targets.length !== want.size) console.warn(`  ⚠ ${want.size - targets.length} qnums not found`); }

// ─────────────────────────────── precrop ───────────────────────────────
const INK = 160;          // grey < INK をインクと見なす (源スキャンは白地に黒字)
const MERGE_GAP = 8;      // 「問」字内の切れ目で割れた run を併合する上限
const MIN_H = 14, MAX_H = 44;  // 見出し 1 行分の高さ (1432x2026 の源で実測 23〜26px)
const MIN_ROW_INK = 3;    // strip 内でこの画素数以上あれば「その行に見出しインクあり」
const MIN_RIGHT_FRAC = 0.45;   // 見出し行は右へ伸びる。これ未満は 〔節見出し〕
const LEFT_TOL_LO = 14, LEFT_TOL_HI = 18;  // 帯の最左インクが head モードからこの範囲内であること
const BAND_PAD_TOP = 8;   // 見出しの少し上から切る
const FOOTER_FRAC = 0.94; // これより下はノンブル (「− 39 −」) 帯として本文末尾探索から除く
const TAIL_PAD = 25;      // 最終帯は本文末尾 + これだけ

/** ページを greyscale raw で読み、行ごとの最左/最右インク x と画素数を返す。 */
async function rowProfile(sharp, png, withPixels) {
  const { data, info } = await sharp(png).greyscale().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, C = info.channels;
  const left = new Int32Array(H).fill(-1), right = new Int32Array(H).fill(-1), cnt = new Int32Array(H);
  for (let y = 0; y < H; y++) {
    let l = -1, r = -1, c = 0;
    for (let x = 0; x < W; x++) if (data[(y * W + x) * C] < INK) { if (l < 0) l = x; r = x; c++; }
    left[y] = l; right[y] = r; cnt[y] = c;
  }
  return { data: withPixels ? data : null, W, H, C, left, right, cnt };
}

const bucketModes = (vals) => {
  const h = {};
  for (const v of vals) { const b = Math.floor(v / 10) * 10; h[b] = (h[b] || 0) + 1; }
  return Object.entries(h).map(([k, v]) => [+k, v]).sort((a, b) => b[1] - a[1]);
};

/**
 * strip 内の行 run を併合・絞り込みして 問N 見出しの y 位置を返す。
 * headings   … 問N 見出し (帯の起点)
 * boundaries … 同じ左インデントだが右へ伸びない行 = 〔ストラテジ〕型の節見出し。
 *              見出しとしては採らないが、**帯の下端**としては使う (前問の帯尾に次節の見出しが混入するのを防ぐ)。
 *              〔対策〕のような設問**本文内**の小見出しは body インデントなので left フィルタで弾かれ、ここには入らない。
 */
function findHeadings(prof, headMode, bodyMode) {
  const { data, W, H, C, left, right } = prof;
  const xlo = Math.max(0, headMode - LEFT_TOL_LO), xhi = Math.floor((headMode + bodyMode) / 2);
  const raw = []; let s = -1;
  for (let y = 0; y < H; y++) {
    let c = 0;
    for (let x = xlo; x <= xhi; x++) if (data[(y * W + x) * C] < INK) c++;
    if (c >= MIN_ROW_INK) { if (s < 0) s = y; } else if (s >= 0) { raw.push({ top: s, bot: y - 1 }); s = -1; }
  }
  if (s >= 0) raw.push({ top: s, bot: H - 1 });
  const merged = [];
  for (const r of raw) { const L = merged[merged.length - 1]; if (L && r.top - L.bot - 1 <= MERGE_GAP) L.bot = r.bot; else merged.push({ ...r }); }
  const headings = [], boundaries = [];
  for (const r of merged) {
    const h = r.bot - r.top + 1;
    if (h < MIN_H || h > MAX_H) continue;
    let maxRight = -1, minLeft = Infinity;
    for (let y = r.top; y <= r.bot; y++) { if (right[y] > maxRight) maxRight = right[y]; if (left[y] >= 0 && left[y] < minLeft) minLeft = left[y]; }
    if (!(minLeft >= headMode - LEFT_TOL_LO && minLeft <= headMode + LEFT_TOL_HI)) continue;  // 罫線など
    if (maxRight < MIN_RIGHT_FRAC * W) { boundaries.push({ top: r.top, h }); continue; }      // 〔節見出し〕型
    headings.push({ top: r.top, h });
  }
  return { headings, boundaries };
}

/** 中問 (chumon) の member id 集合。crop 対象から外す (下の理由を参照)。 */
function chumonMemberIds() {
  const f = path.join(ROOT, "data/ip/quiz/chumon_groups.json");
  if (!existsSync(f)) { console.warn("  ⚠ precrop: chumon_groups.json が無い — 中問の除外ができません"); return new Set(); }
  const j = JSON.parse(readFileSync(f, "utf-8"));
  const groups = Array.isArray(j) ? j : (j.groups ?? []);
  const ids = new Set();
  for (const g of groups) for (const id of g.member_ids ?? []) ids.add(id);
  return ids;
}

/** exam 全体で 問N 見出しの帯を検出し、id → 裁断 PNG 絶対パスの Map を返す。 */
async function buildCrops(targetIds) {
  const sharp = createRequire(path.join(ROOT, "apps/web/package.json"))("sharp");
  // ページ → そのページに載る**全**問 (帯の境界は目標外の問にも依存するので all から作る)
  const byPage = new Map();
  for (const q of all) {
    const rel = q.source?.page_image; if (!rel) continue;
    if (!byPage.has(rel)) byPage.set(rel, []);
    byPage.get(rel).push(q);
  }
  const wanted = new Set(targetIds);
  const pages = [...byPage.entries()].filter(([, qs]) => qs.some((q) => wanted.has(q.id)));

  // pass 1: exam 全ページから「行の最左インク x」を集めて head/body モードを較正 (ページ単位だと図でモードが壊れる)
  const pool = [];
  for (const [rel] of byPage) {
    const png = path.join(ROOT, "data/ip/exams", rel);
    if (!existsSync(png)) continue;
    const { data, info } = await sharp(png).greyscale().raw().toBuffer({ resolveWithObject: true });
    const W = info.width, H = info.height, C = info.channels;
    for (let y = 0; y < H; y++) {
      let l = -1, c = 0;
      for (let x = 0; x < W && c < 6; x++) if (data[(y * W + x) * C] < INK) { if (l < 0) l = x; c++; }
      if (c > 5 && l >= 0) pool.push(l);
    }
  }
  const noCalib = (why) => { console.warn(`  ⚠ precrop: ${why} — 全問 crop 省略`); return { crops: new Map(), skip: { pages: pages.length, qPageMismatch: wanted.size, qChumon: 0, qMergedPreamble: 0, qThinBand: 0 } }; };
  if (pool.length < 50) return noCalib("ページのインクが少なすぎて較正できない");
  const modes = bucketModes(pool);
  const bodyMode = modes[0][0];
  const headCand = modes.filter(([k]) => k <= bodyMode - 20).sort((a, b) => b[1] - a[1]);
  if (!headCand.length) return noCalib("見出しモードを分離できない");
  const headMode = headCand[0][0];
  console.log(`  precrop calib: head=${headMode} body=${bodyMode} (${pages.length} pages in scope)`);

  const outDir = path.join(ROOT, "data/ip/quiz/.phase2/precrop", examId);
  mkdirSync(outDir, { recursive: true });
  const crops = new Map();
  const chumon = chumonMemberIds();
  const skip = { pages: 0, qPageMismatch: 0, qChumon: 0, qMergedPreamble: 0, qThinBand: 0 };

  // pass 2: 対象問を含むページだけ帯を切る
  for (const [rel, qs] of pages) {
    const png = path.join(ROOT, "data/ip/exams", rel);
    // pass 1 と同じ存在検査。欠落は crop を静かに省くのではなく、従来どおりの致命エラーにする。
    if (!existsSync(png)) throw new Error(`${qs[0].id}: source page image missing (${rel})`);
    const ordered = [...qs].sort((a, b) => a.question_number - b.question_number);
    const prof = await rowProfile(sharp, png, true);
    const { W, H, cnt } = prof;

    // (a) question_bbox_pct があればそれを優先 (D-145: 現データには存在しない。将来復活したときの経路)
    let bands = null;
    if (ordered.every((q) => q.source?.question_bbox_pct)) {
      bands = ordered.map((q) => {
        const b = q.source.question_bbox_pct;
        return { top: Math.max(0, Math.round(b.y1 * H)), bot: Math.min(H, Math.round(b.y2 * H)) };
      });
    } else {
      const { headings: heads, boundaries } = findHeadings(prof, headMode, bodyMode);
      if (heads.length !== ordered.length) {
        console.warn(`  ⚠ precrop skip ${rel.split("/").pop()} [page_mismatch]: detected ${heads.length}, expected ${ordered.length}`);
        skip.pages++; skip.qPageMismatch += ordered.filter((q) => wanted.has(q.id)).length; continue;
      }
      let lastInk = 0;
      for (let y = 0; y < Math.floor(H * FOOTER_FRAC); y++) if (cnt[y] > 5) lastInk = y;
      const tail = Math.min(H, lastInk + TAIL_PAD);
      // 帯の下端は「次の 問N 見出し」と「次の節見出し」の**早い方**。後者を無視すると
      // 帯尾に 〔ストラテジ〕 のような次節の見出しが混入する。
      const stops = [...heads.map((h) => h.top), ...boundaries.map((b) => b.top)].sort((a, b) => a - b);
      bands = heads.map((hd) => {
        const next = stops.find((t) => t > hd.top);
        return { top: Math.max(0, hd.top - BAND_PAD_TOP), bot: next === undefined ? tail : Math.max(0, next - BAND_PAD_TOP) };
      });
    }

    for (let i = 0; i < ordered.length; i++) {
      const q = ordered[i];
      if (!wanted.has(q.id)) continue;
      // 中問: displayed_stem_jp は共有前文を併合済 (例 2015h27a-q097 は bank 120 字 → displayed 784 字、
      // 前文は前ページ)。帯には前文が入らないため、crop だけを読んだ agent は前文全体を
      // 「源に無い挿入」として DISCREPANT 報告し、fixer が**正しい前文を削除**しかねない。
      // 回退条件 (判読不能/切れ/問番号違い) では検出できないので、ここで crop 自体を配らない。
      if (chumon.has(q.id)) { console.warn(`  ⚠ precrop skip ${q.id} [chumon]: 共有前文が帯外のため crop を配りません`); skip.qChumon++; continue; }
      // 名簿外でも displayed が膨らんでいれば同じ危険 (M-1b)。名簿と内容判据の和で外す。
      if (hasMergedPreamble(q)) { console.warn(`  ⚠ precrop skip ${q.id} [merged_preamble]: displayed ${displayedStem(q).length} 字 vs bank ${(q.stem_jp ?? "").length} 字 — 前文/表が帯外`); skip.qMergedPreamble++; continue; }
      const { top, bot } = bands[i];
      const height = bot - top;
      if (height < 40) { console.warn(`  ⚠ precrop skip ${q.id} [thin_band]: band too thin (${height}px)`); skip.qThinBand++; continue; }
      const dest = path.join(outDir, `${q.id}.png`);
      await sharp(png).extract({ left: 0, top, width: W, height }).toFile(dest);
      crops.set(q.id, dest);
    }
  }
  return { crops, skip };
}

let crops = new Map(), skip = { pages: 0, qPageMismatch: 0, qChumon: 0, qMergedPreamble: 0, qThinBand: 0 };
if (precrop) {
  const r = await buildCrops(targets.map((q) => q.id));
  crops = r.crops; skip = r.skip;
}

const samples = targets.map((q) => {
  const pageRel = q.source?.page_image;
  const pagePng = pageRel ? path.join(ROOT, "data/ip/exams", pageRel) : null;
  if (!pagePng || !existsSync(pagePng)) throw new Error(`${q.id}: source page image missing (${pageRel})`);
  const s = {
    id: q.id, question_number: q.question_number, source_page_png: pagePng,
    resourced: { stem: q.stem_resourced_s7x === true, choices: q.choices_resourced_s7x === true },
    displayed_stem_jp: displayedStem(q),
    displayed_choices_jp: q.choices_jp, correct_answer: q.correct_answer,
  };
  if (crops.has(q.id)) s.question_crop_png = crops.get(q.id);
  // 直前ページ (中問の共有前文はここに載る)。agent が回退第 4 条で読めるよう機械的に導いて渡す。
  const prev = pagePng.replace(/page-(\d+)\.png$/, (_, n) => `page-${String(Number(n) - 1).padStart(n.length, "0")}.png`);
  if (prev !== pagePng && existsSync(prev)) s.prev_page_png = prev;
  return s;
});
const out = path.join(ROOT, "data/ip/quiz/.phase2", `${label}_fidelity_input_${examId}.json`);
writeFileSync(out, JSON.stringify({ exam_id: examId, label, count: samples.length, samples }, null, 2) + "\n");
console.log(`✓ quiz-fidelity-prep-any ${examId} [${label}] ${samples.length}/${all.length} → ${path.relative(ROOT, out)}`);
if (precrop) {
  const qSkipped = skip.qPageMismatch + skip.qChumon + skip.qMergedPreamble + skip.qThinBand;
  console.log(`  precrop: ${crops.size}/${samples.length} questions cropped; skipped ${qSkipped} questions (page_mismatch ${skip.qPageMismatch} / chumon ${skip.qChumon} / merged_preamble ${skip.qMergedPreamble} / thin_band ${skip.qThinBand}), ${skip.pages} pages (page_mismatch)`);
}
console.log(`  qnums: ${samples.map((s) => s.question_number).join(",")}`);
