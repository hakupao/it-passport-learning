#!/usr/bin/env node
// Stage 6 / Quiz — S130 図 lane: 「選択肢が図そのもの」なのに表示が中立テキストだけだった 4 題に **選択肢単位の図** を付ける
// (S129 D-163 / D-168 の暫定処置「図ア〜図エ」の本処置)。D-144 段 2 (scripts/quiz-choicefig-D144s2.mjs) と同じデータ形:
// raw (question_bank / by_year) に `choice_figure_paths` = `figures/<id>-c{A..D}.png`、選択肢テキストは jp「図L」/ zh「图L」/ en「Figure L」、
// 複合図 `figure_path` は `composite_figure_path_retired` に退避して null。
// D144s2 との違い: 複合図の 2×2 自動分割ではなく、**源ページ** (data/ip/exams/pages/<exam>/page-NN.png) から主 context が
// 行・列のインク投影で実測した肢ごとの矩形 (px) を切り出す (q068 は 1×4 縦積みで 2×2 分割が使えない / 複合図より源ページの方が忠実)。
// 各矩形は字母 (ア〜エ) を含み、隣の肢・題幹・次問を含まない。切り出し後 trim → 白 14px 余白 (D144s2 と同じ)。
//
// 対象:
//   2013h25h-q068 (page-29、配線図 4 枚が縦積み) — 旧テキストは図の言語化 (choices_text_retired に退避)
//   2010h22h-q088 (page-36、例示図 + 2×2 の波形 4 枚) — 題幹が「図の時刻 1 から…」と例示図を参照するため、例示図だけを
//                  源ページから再裁断して figure_path に残す (figure_type="stem"、build-quiz-corpus / crosscheck A6 が共存を許す)。
//                  旧複合図は figures/<id>.png.pre-S130cf.bak に退避
//   2010h22a-q066 (page-25、有向グラフ 4 枚 2×2)
//   2009h21a-q048 (page-18、グラフ 4 枚 2×2)
// 併せて (S130 reviewer NIT): 2015h27a-q088 の図 (図ページ page-39) が選択肢アの 1 行目まで含んでいた → figure_bbox_pct の y2 を
//   0.52 → 0.43、y1 を 0.05 → 0.093 (上端の走査ノイズ y≈170 を外す。軸ラベル 4.0 上端 y≈200) (図3 キャプション下端 y=833 / ア 1 行目上端 y=919、ページ 2026px) にして源ページから再裁断 (trim + 16px、D144s3ii と同じ)。
// Rule D N2 追加: 2010h22h-q088 題幹末尾の例示図の言語化 (源に無い、例示図表示後は冗長) を bank / by_year / translations (stem_jp_clean・zh・en) から除去 (下の STEM_TAIL)。
// 2018h30h-q054 は対象外: 選択肢は a〜d の組合せ表で、4 グラフ a〜d は題幹の図 (evidence 参照)。
//
// 冪等: 裁断は源ページからの決定的処理 (再実行で同一バイト)。データ側は差分がある時だけ書き換え、applied を数える (2 回目は 0)。
// 下流: node scripts/build-quiz-corpus.mjs → node scripts/build-quiz-figures.mjs
// Run: node scripts/quiz-figfix-S130-choicefig.mjs [--dry-run]

import { readFileSync, writeFileSync, existsSync, copyFileSync } from "node:fs";
import path from "node:path"; import { fileURLToPath } from "node:url"; import { createRequire } from "node:module";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); const DRY = process.argv.includes("--dry-run");
const sharp = createRequire(path.join(ROOT, "apps/web/package.json"))("sharp");
const P = (...s) => path.join(ROOT, ...s); const rj = (f) => JSON.parse(readFileSync(f, "utf-8")); const wj = (f, d) => { if (!DRY) writeFileSync(f, JSON.stringify(d, null, 2) + "\n"); };
const EX = P("data/ip/exams");
const LETTERS = ["ア", "イ", "ウ", "エ"]; const SUFFIX = { ア: "A", イ: "B", ウ: "C", エ: "D" };
const TXT = { jp: (L) => `図${L}`, zh: (L) => `图${L}`, en: (L) => `Figure ${L}` };

// 矩形は源ページの px [left, top, right, bottom]。インク投影 (閾値 140) の実測値: 行帯・列帯は evidence/quiz_choicefig_S130.md の表。
const SPEC = {
  // 1432x2026。行帯 ア 465-733 / イ 783-1077 / ウ 1125-1393 / エ 1441-1743、列 字母 208-231 + 図 266-1224。題幹は y<380、ページ番号 y≈1890
  "2013h25h-q068": { page: "pages/2013h25h/page-29.png", choices: {
    ア: [190, 450, 1245, 758], イ: [190, 760, 1245, 1101], ウ: [190, 1103, 1245, 1417], エ: [190, 1419, 1245, 1765] } },
  // 1419x2020。例示図 x 505-951 / y 891-1164。肢の行帯 1235-1510 / 1564-1835、列 ア・ウ 205-714 / イ・エ 字母 732-754 + 図 794-1242
  "2010h22h-q088": { page: "pages/2010h22h/page-36.png", stem: [480, 870, 980, 1190], choices: {
    ア: [190, 1215, 723, 1537], イ: [723, 1215, 1260, 1537], ウ: [190, 1540, 723, 1855], エ: [723, 1540, 1260, 1855] } },
  // 1416x2020。行帯 1233-1472 / 1540-1778、列 ア・ウ 字母 195-216 + 図 259-575 / イ・エ 字母 727-749 + 図 791-1107。題幹は y<1160
  "2010h22a-q066": { page: "pages/2010h22a/page-25.png", choices: {
    ア: [180, 1210, 680, 1506], イ: [700, 1210, 1140, 1506], ウ: [180, 1506, 680, 1800], エ: [700, 1506, 1140, 1800] } },
  // 1439x2019。行帯 338-647 / 709-1014、列 ア・ウ 字母 207-231 + 図 264-622 / イ・エ 字母 737-764 + 図 794-1164 (x=710・1213 以右は走査の点ノイズ)
  "2009h21a-q048": { page: "pages/2009h21a/page-18.png", choices: {
    ア: [190, 325, 690, 678], イ: [725, 325, 1185, 678], ウ: [190, 680, 690, 1040], エ: [725, 680, 1185, 1040] } },
};
const BBOXFIX = { "2015h27a-q088": { x1: 0.05, y1: 0.093, x2: 0.85, y2: 0.43 } }; // 図ページ (source.figure_page_image) 相対 — D-145

async function crop(pageRel, [l, t, r, b], dest, pad) {
  const page = P("data/ip/exams", pageRel); const meta = await sharp(page).metadata();
  if (r > meta.width || b > meta.height) throw new Error(`${dest}: 矩形 ${[l, t, r, b]} がページ ${meta.width}x${meta.height} を超える`);
  const raw = await sharp(page).extract({ left: l, top: t, width: r - l, height: b - t }).png().toBuffer();
  const pipe = sharp(raw).trim({ threshold: 40 }).extend({ top: pad, bottom: pad, left: pad, right: pad, background: "#fff" }).png();
  const info = DRY ? (await pipe.toBuffer({ resolveWithObject: true })).info : await pipe.toFile(dest);
  if (info.width < 80 || info.height < 60) throw new Error(`${dest}: 切り出しが小さすぎる ${info.width}x${info.height}`);
  console.log(`  ${DRY ? "(dry) " : ""}${path.basename(dest)} ← ${pageRel} [${l},${t},${r},${b}] → ${info.width}x${info.height}`);
}
const pct = ([l, t, r, b], W, H) => ({ x1: +(l / W).toFixed(4), y1: +(t / H).toFixed(4), x2: +(r / W).toFixed(4), y2: +(b / H).toFixed(4) });
const backup = (rel) => { const f = P("data/ip/exams", rel), bak = `${f}.pre-S130cf.bak`; if (!DRY && existsSync(f) && !existsSync(bak)) copyFileSync(f, bak); return `${rel}.pre-S130cf.bak`; };

let applied = 0;
const set = (o, k, v, tag) => { if (JSON.stringify(o[k]) !== JSON.stringify(v)) { o[k] = v; applied++; console.log(`    ${tag}.${k} ← ${JSON.stringify(v).slice(0, 90)}`); } };
const Bd = rj(P("data/ip/exams/question_bank.json")); const BY = {}; const TR = {};
const layers = (id) => { const exam = id.split("-q")[0]; BY[exam] ??= rj(P("data/ip/exams/by_year", `${exam}.json`));
  const out = [[Bd.questions.find((q) => q.id === id), "question_bank"], [BY[exam].questions.find((q) => q.id === id), "by_year"]];
  for (const [o, w] of out) if (!o) throw new Error(`${id} missing in ${w}`); return out; };

for (const [id, s] of Object.entries(SPEC)) {
  const exam = id.split("-q")[0]; const { width: W, height: H } = await sharp(P("data/ip/exams", s.page)).metadata();
  const paths = {};
  for (const L of LETTERS) { paths[L] = `figures/${id}-c${SUFFIX[L]}.png`; await crop(s.page, s.choices[L], P("data/ip/exams", paths[L]), 14); }
  let stemRel = null;
  if (s.stem) { stemRel = `figures/${id}.png`; backup(stemRel); await crop(s.page, s.stem, P("data/ip/exams", stemRel), 16); }
  for (const [o, w] of layers(id)) {
    const tag = `${id} ${w}`;
    set(o, "choice_figure_paths", paths, tag);
    if (s.stem) {
      // 例示図を残す: figure_path は同じ名前のまま中身を例示図だけに再裁断、旧複合図は .bak に退避
      set(o, "composite_figure_path_retired", `${stemRel}.pre-S130cf.bak`, tag);
      set(o, "figure_path", stemRel, tag); set(o, "figure_type", "stem", tag); set(o, "figure_bbox_pct", pct(s.stem, W, H), tag);
    } else if (o.figure_path) { set(o, "composite_figure_path_retired", o.figure_path, tag); set(o, "figure_path", null, tag); }
    set(o, "has_figure", true, tag);
    if (!o.choices_text_retired && LETTERS.some((L) => o.choices_jp[L] !== TXT.jp(L))) set(o, "choices_text_retired", { ...o.choices_jp }, tag);
    set(o, "choices_jp", { ...o.choices_jp, ...Object.fromEntries(LETTERS.map((L) => [L, TXT.jp(L)])) }, tag);
  }
  TR[exam] ??= rj(P("data/ip/quiz/translations", `${exam}.json`));
  const t = TR[exam].questions[id]; const t1f = P("data/ip/quiz/.phase1", `tr_${id}.json`); const t1 = existsSync(t1f) ? rj(t1f) : null;
  for (const L of LETTERS) for (const lang of ["zh", "en"]) {
    if (t.choices[L][lang] !== TXT[lang](L)) { t.choices[L][lang] = TXT[lang](L); applied++; console.log(`    ${id} translations.${L}.${lang}`); }
    const c1 = t1?.choices?.find((c) => c.letter === L); if (c1 && c1[lang] !== TXT[lang](L)) { c1[lang] = TXT[lang](L); applied++; console.log(`    ${id} .phase1.${L}.${lang}`); }
  }
  if (t1) wj(t1f, t1);
}

for (const [id, box] of Object.entries(BBOXFIX)) {
  const [o0] = layers(id)[0]; const pageRel = o0.source.figure_page_image ?? o0.source.page_image;
  const { width: W, height: H } = await sharp(P("data/ip/exams", pageRel)).metadata();
  backup(o0.figure_path);
  await crop(pageRel, [Math.round(W * box.x1), Math.round(H * box.y1), Math.round(W * box.x2), Math.round(H * box.y2)], P("data/ip/exams", o0.figure_path), 16);
  for (const [o, w] of layers(id)) set(o, "figure_bbox_pct", box, `${id} ${w}`);
}

// Rule D N2: 2010h22h-q088 は例示図を表示するようになったため、S129 以前に題幹末尾へ入れた例示図の言語化 (源に無い) を全層から除く。
// 題幹本文 (「図の時刻 1 から…示す図はどれか。」= 図への参照) は残す。末尾の段落が期待どおりの文字列である時だけ除去 (assert-before-replace)、
// 既に除去済みなら何もしない。.phase1 の stem_jp_clean / zh / en は元から言語化を含まない (確認済み)。
const STEM_TAIL = { "2010h22h-q088": {
  jp: "\n\n[図] 例示図：縦軸「振幅」（下から 00, 01, 10, 11 の 4 段階），横軸「時刻」（1〜5）。波形は時刻1で 11 付近の山、時刻3付近で 00 の谷、時刻5付近で再び 11 へ上昇する曲線（標本化結果 11 01 00 10 11 に対応）。",
  clean: "\n\n（図）縦軸は「振幅」で，下から順に 00，01，10，11 の 4 段階。横軸は「時刻」で 1 から 5。波形は時刻 0 の振幅 10 から上昇して時刻 1 の手前で振幅 11 の山となり，時刻 3 の手前で振幅 00 の谷まで下がり，時刻 5 の手前で再び振幅 11 の山となる曲線。",
  zh: "\n\n（图）纵轴为「振幅」，自下而上依次为 00、01、10、11 共 4 个等级。横轴为「时刻」，从 1 到 5。波形从时刻 0 的振幅 10 开始上升，在时刻 1 之前形成振幅 11 的波峰，在时刻 3 之前下降至振幅 00 的波谷，在时刻 5 之前再次形成振幅 11 的波峰。",
  en: "\n\n(Figure) The vertical axis is “amplitude”, with four levels from bottom to top: 00, 01, 10, 11. The horizontal axis is “time”, from 1 to 5. The waveform rises from amplitude 10 at time 0, forms a peak at amplitude 11 just before time 1, drops to a trough at amplitude 00 just before time 3, and forms another peak at amplitude 11 just before time 5.",
  ends: { jp: "示す図はどれか。", clean: "示す図はどれか。", zh: "音频信号是哪个图？", en: "yields “01 00 10 11 01”?" } } };
const stripTail = (s, tail, end, tag) => {
  if (s.endsWith(tail)) { applied++; console.log(`    ${tag}: 例示図の言語化を除去`); return s.slice(0, -tail.length); }
  if (s.endsWith(end) && !/\n\n[[（(](図|图|Figure)/.test(s)) return s; // 除去済み
  throw new Error(`${tag}: 題幹末尾が想定と違う — 手で確認すること: ${JSON.stringify(s.slice(-80))}`);
};
for (const [id, t] of Object.entries(STEM_TAIL)) {
  for (const [o, w] of layers(id)) o.stem_jp = stripTail(o.stem_jp, t.jp, t.ends.jp, `${id} ${w}.stem_jp`);
  const exam = id.split("-q")[0]; TR[exam] ??= rj(P("data/ip/quiz/translations", `${exam}.json`)); const tr = TR[exam].questions[id];
  tr.stem_jp_clean = stripTail(tr.stem_jp_clean, t.clean, t.ends.clean, `${id} translations.stem_jp_clean`);
  for (const lang of ["zh", "en"]) tr.stem[lang] = stripTail(tr.stem[lang], t[lang], t.ends[lang], `${id} translations.stem.${lang}`);
}

wj(P("data/ip/exams/question_bank.json"), Bd);
for (const e of Object.keys(BY)) wj(P("data/ip/exams/by_year", `${e}.json`), BY[e]);
for (const e of Object.keys(TR)) wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]);
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-figfix-S130-choicefig: applied ${applied} field changes; next: node scripts/build-quiz-corpus.mjs && node scripts/build-quiz-figures.mjs`);
