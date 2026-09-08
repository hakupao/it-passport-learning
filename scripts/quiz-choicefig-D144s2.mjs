#!/usr/bin/env node
// Stage 6 / Quiz — D-144 段 2 (S117): 「選択肢が図そのもの」の 3 題に **選択肢単位の図** を付ける。
//
// 対象 (S109/S112 で ②-a として登記): 2014h26a-q046 (役割分担マトリクス等 4 図、正解肢テキストが答えを書いていた) /
// 2014h26a-q086 (費用累計グラフ 4 枚、テキストは占位符) / 2012h24a-q002 (DFD 等 4 図、alt が答えを漏らす)。
// 前提: 複合図は **2×2 で ア=左上 / イ=右上 / ウ=左下 / エ=右下** (3 題とも源ページ実読で確認)。1×4 や別順の題に流用する場合は
// 象限→字母の対応を題ごとに与えること (脚本は図内の字母を読まない — Rule D NIT-8)。
// 手順: 既存の複合図 `data/ip/exams/figures/<id>.png` (4 図が 2×2 に並ぶ) から、設問文残渣を落として内容の外接矩形に
// トリムし、列・行の最大空白帯で 4 分割 → 各象限をトリム → `figures/<id>-c{A,B,C,D}.png` (ア→A … エ→D)。
// raw (question_bank / by_year) に `choice_figure_paths` を追加し、複合図 `figure_path` は外す (重複表示を避ける、has_figure は true のまま)。
// 選択肢テキストは中立な「図ア」/「图ア」/「Figure ア」に (源は図のみ。旧テキストは答えの漏洩・占位符・記述だった)。
// 下流: node scripts/build-quiz-corpus.mjs → node scripts/build-quiz-figures.mjs。
//
// S118 ⑤-2 波 1 追加: **2016h28a-q050** (特性要因図 / パレート図 / 散布図 / フローチャートの 4 図。dataset のテキスト肢が
//   図の名称そのもので、正解肢イ「パレート図」が答えを書いていた = ②-a 型)。源 page-19 実読で 2×2 配置を確認。
//   この複合図は **下部に次問「問51 …」の 1 行が残っている** ため `bottomCut` を新設した (topCut と対称、trim 前に落とす)。
//   既存 3 題の SPEC・産物は不変 (`--only <id>` で対象を絞れる)。
// S122 ⑤-2 U3a 追加: **2018h30h-q005** (状態遷移図 / DFD / E-R 図 / フローチャートの記法例 4 図。dataset のテキスト肢が
//   図の名称そのもので、正解肢イ「DFD」が**設問文と同語**だったため語句一致だけで答えが自明だった = ②-a 型)。
//   源 page-03 実読で 2×2 配置 (ア=左上 / イ=右上 / ウ=左下 / エ=右下) を確認。複合図は上端に前問 問4 の ウ/エ 行と
//   本問の題幹が残るため `topCut: 230`、下部残渣は無いため bottomCut 0。既存 4 題の SPEC・産物は不変。
// Run: node scripts/quiz-choicefig-D144s2.mjs [--dry-run] [--only <question-id>]

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path"; import { fileURLToPath } from "node:url"; import { createRequire } from "node:module";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); const DRY = process.argv.includes("--dry-run");
const ONLY = (() => { const i = process.argv.indexOf("--only"); return i >= 0 ? process.argv[i + 1] : null; })();
const sharp = createRequire(path.join(ROOT, "apps/web/package.json"))("sharp");
const P = (...s) => path.join(ROOT, ...s); const rj = (f) => JSON.parse(readFileSync(f, "utf-8")); const wj = (f, d) => { if (!DRY) writeFileSync(f, JSON.stringify(d, null, 2) + "\n"); };
const LETTERS = ["ア", "イ", "ウ", "エ"]; const SUFFIX = { ア: "A", イ: "B", ウ: "C", エ: "D" };
// topCut / bottomCut = 複合図の上端・下端に残った設問文の高さ (px)。主 context が源画像を実読して決めた。
const SPEC = {
  "2014h26a-q046": { topCut: 45 }, "2014h26a-q086": { topCut: 165 }, "2012h24a-q002": { topCut: 0 },
  "2016h28a-q050": { topCut: 0, bottomCut: 160 }, // 1289x1094、y=998-1024 に次問「問51 …」の 1 行。図の下端は y=873
  "2018h30h-q005": { topCut: 230 }, // 1261x1094、y=9-34 に前問「ウ ベンダ提案… / エ 利用者の要求…」、y=167-192 に題幹「問5 DFD の記述例…」。図の下端は y=922 で下部残渣なし → bottomCut 0
};
const TXT = { jp: (L) => `図${L}`, zh: (L) => `图${L}`, en: (L) => `Figure ${L}` };

const gap = (arr, lo, hi) => { let best = [0, 0], s = -1; const a = Math.floor(arr.length * lo), b = Math.floor(arr.length * hi); for (let i = a; i < b; i++) { if (arr[i] === 0) { if (s < 0) s = i; } else if (s >= 0) { if (i - s > best[1] - best[0]) best = [s, i]; s = -1; } } if (s >= 0 && b - s > best[1] - best[0]) best = [s, b]; return best; };

async function cropChoices(id, topCut, bottomCut = 0) {
  const file = P("data/ip/exams/figures", `${id}.png`); const meta = await sharp(file).metadata();
  const cut = await sharp(file).extract({ left: 0, top: topCut, width: meta.width, height: meta.height - topCut - bottomCut }).png().toBuffer();
  const trimmed = await sharp(cut).trim({ threshold: 40 }).png().toBuffer(); const { width: W, height: H } = await sharp(trimmed).metadata();
  const { data } = await sharp(trimmed).greyscale().raw().toBuffer({ resolveWithObject: true });
  const col = new Array(W).fill(0), row = new Array(H).fill(0);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (data[y * W + x] < 160) { col[x]++; row[y]++; }
  const cg = gap(col, 0.3, 0.7), rg = gap(row, 0.25, 0.75);
  if (cg[1] - cg[0] < 10 || rg[1] - rg[0] < 10) throw new Error(`${id}: 2×2 の空白帯が見つからない col=${cg} row=${rg}`);
  const xs = Math.round((cg[0] + cg[1]) / 2), ys = Math.round((rg[0] + rg[1]) / 2);
  const boxes = { ア: [0, 0, xs, ys], イ: [xs, 0, W - xs, ys], ウ: [0, ys, xs, H - ys], エ: [xs, ys, W - xs, H - ys] };
  const out = {};
  for (const L of LETTERS) {
    const [l, t, w, h] = boxes[L]; const q = await sharp(trimmed).extract({ left: l, top: t, width: w, height: h }).png().toBuffer();
    const dest = P("data/ip/exams/figures", `${id}-c${SUFFIX[L]}.png`);
    const pipe = sharp(q).trim({ threshold: 40 }).extend({ top: 14, bottom: 14, left: 14, right: 14, background: "#fff" }).png();
    const info = DRY ? await pipe.toBuffer({ resolveWithObject: true }).then((r) => r.info) : await pipe.toFile(dest);
    if (info.width < 80 || info.height < 60) throw new Error(`${id} ${L}: 切り出しが小さすぎる ${info.width}x${info.height}`);
    out[L] = `figures/${id}-c${SUFFIX[L]}.png`; console.log(`  ${DRY ? "(dry) " : ""}${id} ${L} → ${path.basename(dest)} ${info.width}x${info.height}`);
  }
  return out;
}

let applied = 0;
const Bd = rj(P("data/ip/exams/question_bank.json")); const BY = {}; const TR = {};
for (const [id, { topCut, bottomCut }] of Object.entries(SPEC)) {
  if (ONLY && id !== ONLY) continue;
  const exam = id.split("-q")[0];
  BY[exam] ??= rj(P("data/ip/exams/by_year", `${exam}.json`)); TR[exam] ??= rj(P("data/ip/quiz/translations", `${exam}.json`));
  const paths = await cropChoices(id, topCut, bottomCut ?? 0);
  for (const [o, w] of [[Bd.questions.find((q) => q.id === id), "question_bank"], [BY[exam].questions.find((q) => q.id === id), "by_year"]]) {
    if (!o) throw new Error(`${id} missing in ${w}`);
    if (JSON.stringify(o.choice_figure_paths) !== JSON.stringify(paths)) { o.choice_figure_paths = paths; applied++; }
    if (o.figure_path) { o.composite_figure_path_retired = o.figure_path; o.figure_path = null; applied++; console.log(`  ${id} ${w}: figure_path → null (複合図は選択肢図に置換、旧値は composite_figure_path_retired に保持)`); }
    o.has_figure = true;
    // 旧テキストは raw に退避してから上書き (Rule D NIT-9; 初回実行分は git HEAD の questions.json から補填した)
    if (!o.choices_text_retired && LETTERS.some((L) => o.choices_jp[L] !== TXT.jp(L))) { o.choices_text_retired = { ...o.choices_jp }; applied++; }
    for (const L of LETTERS) if (o.choices_jp[L] !== TXT.jp(L)) { o.choices_jp[L] = TXT.jp(L); applied++; }
  }
  const t = TR[exam].questions[id]; const t1f = P("data/ip/quiz/.phase1", `tr_${id}.json`); const t1 = existsSync(t1f) ? rj(t1f) : null;
  for (const L of LETTERS) for (const lang of ["zh", "en"]) {
    if (t.choices[L][lang] !== TXT[lang](L)) { t.choices[L][lang] = TXT[lang](L); applied++; }
    const c1 = t1?.choices?.find((c) => c.letter === L); if (c1 && c1[lang] !== TXT[lang](L)) { c1[lang] = TXT[lang](L); applied++; }
  }
  if (t1) wj(t1f, t1);
}
wj(P("data/ip/exams/question_bank.json"), Bd);
for (const e of Object.keys(BY)) { wj(P("data/ip/exams/by_year", `${e}.json`), BY[e]); wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]); }
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-choicefig-D144s2: applied ${applied} field changes; next: node scripts/build-quiz-corpus.mjs && node scripts/build-quiz-figures.mjs`);
