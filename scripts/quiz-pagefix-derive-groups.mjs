#!/usr/bin/env node
// Stage 6 / Quiz — D-145: 中問の共有図から **決定的に** 図ページ判定を導出する (S118)。
//
// 背景: D-120 の中問モデルでは、共有図の真相源は `data/ip/exams/groups.json` の
// `shared_figure {path, page_image, bbox_pct, caption}` である。`quiz-chumon-recrop-D144s3ii.mjs` は
// 共有図を **組のページ** から裁断してメンバーに複製し、メンバーの `figure_bbox_pct` にも
// **組のページ基準の bbox** を書く。ところがメンバーの `source.page_image` は各自の**設問ページ**なので、
// D-145 以前は「bbox の基準ページ」と「記録されたページ」が食い違ったまま放置されていた
// (S118 実測。図側消費は設問ページを図ページと誤認して vision に渡す)。
//
// 本 script は実読を必要としない。「メンバーの図 == 組の共有図」が **bbox の逐字一致**で機械的に確認できるので、
// 図ページ = 組の `shared_figure.page_image` が決定的に従う。出力は quiz-pagefix-apply.mjs が読む判定 JSON。
//
// 抽出条件 (3 つ全て):
//   1. `figure_group` が groups.json の group_id に解決し、その `shared_figure.page_image` がある
//   2. メンバーの `figure_type === "shared"` (自前の図を持つメンバーを除外する)
//   3. メンバーの `figure_bbox_pct` が `shared_figure.bbox_pct` と**逐字一致** (= その図は組の共有図そのもの)
//   かつ 実効図ページ (`figure_page_image ?? page_image`) が組のページと**異なる** (既に一致なら出力しない)
// 2 か 3 を満たさないのに 1 だけ満たす問は「要調査」として stderr に出し、**判定には含めない**。
//
// Run:
//   node scripts/quiz-pagefix-derive-groups.mjs              # 導出して evidence/.../pagefix_S118_groups_derived.json に書く
//   node scripts/quiz-pagefix-derive-groups.mjs --print      # 書かずに要約だけ
//   node scripts/quiz-pagefix-derive-groups.mjs --check      # **適用前のみ**: 既存ファイルが再生成結果と逐字一致するか
//   node scripts/quiz-pagefix-derive-groups.mjs --assert-clean  # **常設ゲート**: 導出が 0 件 (= 全メンバーの図ページが整合) を要求
// 後続: node scripts/quiz-pagefix-apply.mjs --decisions evidence/phase5/stage_06_quiz_fidelity/pagefix_S118_groups_derived.json --dry-run
//
// 注意: 出力 JSON は **適用時点の記録** (scout の実読判定ファイルと同じ性格)。適用後は導出が 0 件になるので
// `--check` は落ちる ← 想定どおり。適用後に回す常設ゲートは `--assert-clean` の方。

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXAMS = path.join(ROOT, "data/ip/exams");
const OUT = path.join(ROOT, "evidence/phase5/stage_06_quiz_fidelity/pagefix_S118_groups_derived.json");
const CHECK = process.argv.includes("--check");
const PRINT = process.argv.includes("--print");
const ASSERT_CLEAN = process.argv.includes("--assert-clean");

const rj = (f) => JSON.parse(readFileSync(f, "utf-8"));
const BOX = ["x1", "y1", "x2", "y2"];
const boxSig = (b) => (b && BOX.every((k) => typeof b[k] === "number") ? JSON.stringify(BOX.map((k) => b[k])) : "null");
const pageNumOf = (rel) => { const m = /^pages\/([^/]+)\/page-(\d+)\.png$/.exec(rel ?? ""); return m ? { exam: m[1], n: parseInt(m[2], 10) } : null; };

const bank = (d => d.questions ?? d)(rj(path.join(EXAMS, "question_bank.json")));
const groups = (d => d.groups ?? d)(rj(path.join(EXAMS, "groups.json")));
const gById = new Map(groups.map((g) => [g.group_id, g]));

const decisions = [];
const siblingMismatch = [];
const skipped = { alreadyConsistent: [], notShared: [], bboxMismatch: [], noGroup: [], noSharedPage: [] };

for (const q of bank) {
  const gid = q.figure_group;
  if (!gid) continue;
  // `sibling:<id>` は「兄弟問から図を複製した」印 (groups.json に組は無い)。図ページは兄弟問のそれを継承する。
  if (gid.startsWith("sibling:")) {
    const sibId = gid.slice("sibling:".length);
    const sib = bank.find((x) => x.id === sibId);
    if (!sib) { skipped.noGroup.push(`${q.id} (${gid} — 兄弟問が bank に無い)`); continue; }
    const sibFig = sib.source?.figure_page_image ?? sib.source?.page_image;
    const myFig = q.source?.figure_page_image ?? q.source?.page_image;
    if (sibFig === myFig) skipped.alreadyConsistent.push(q.id);
    else siblingMismatch.push(`${q.id} (図ページ ${myFig} だが兄弟 ${sibId} は ${sibFig})`);
    continue;
  }
  const g = gById.get(gid);
  if (!g) { skipped.noGroup.push(`${q.id} (${gid})`); continue; }
  const sp = g.shared_figure?.page_image;
  if (!sp) { skipped.noSharedPage.push(q.id); continue; }

  const effFig = q.source?.figure_page_image ?? q.source?.page_image;
  if (effFig === sp) { skipped.alreadyConsistent.push(q.id); continue; }
  if (q.figure_type !== "shared") { skipped.notShared.push(`${q.id} (type=${q.figure_type ?? "—"})`); continue; }
  if (boxSig(q.figure_bbox_pct) !== boxSig(g.shared_figure?.bbox_pct)) { skipped.bboxMismatch.push(q.id); continue; }

  const cur = pageNumOf(q.source?.page_image);
  const fig = pageNumOf(sp);
  if (!cur || !fig) throw new Error(`${q.id}: page_image の形が不正 (${q.source?.page_image} / ${sp})`);
  if (cur.exam !== fig.exam) throw new Error(`${q.id}: 設問ページ (${cur.exam}) と組のページ (${fig.exam}) の exam が違う`);
  if (!existsSync(path.join(EXAMS, sp))) throw new Error(`${q.id}: 組のページ PNG が無い (${sp})`);
  if (cur.n === fig.n) throw new Error(`${q.id}: 図ページ == 設問ページ (${cur.n}) なのに文字列が違う`);

  decisions.push({
    id: q.id,
    exam_id: cur.exam,
    current_page_number: cur.n,
    current_page_image: q.source.page_image,
    question_page_number: cur.n,          // 設問ページは動かさない (実読していないので触らない)
    figure_page_number: fig.n,
    has_figure: Boolean(q.has_figure),
    figure_bbox_pct_current: q.figure_bbox_pct,
    verdict: "SPLIT_FIGURE",
    evidence: `決定的導出 (実読なし): figure_group=${gid} の shared_figure.page_image=${sp}、`
      + `かつ figure_type=shared・figure_bbox_pct が組の bbox と逐字一致 → 本問の figure_bbox_pct は ${sp} 相対。`
      + `設問ページ ${cur.n} は記録どおりで動かさない。`,
    bbox_check: { verdict: "OK", figure_page_measured_pct: null, issue: "bbox は組の共有図と逐字一致のため据置", proposed_bbox_pct: null },
    derived_by: "scripts/quiz-pagefix-derive-groups.mjs",
    group_id: gid,
  });
}

decisions.sort((a, b) => a.id.localeCompare(b.id));
const text = JSON.stringify(decisions, null, 2) + "\n";

const byExam = decisions.reduce((m, d) => (m[d.exam_id] = (m[d.exam_id] ?? 0) + 1, m), {});
console.log(`quiz-pagefix-derive-groups: SPLIT_FIGURE ${decisions.length} 件 / ${Object.keys(byExam).length} exam`);
for (const [e, n] of Object.entries(byExam).sort()) console.log(`  ${e}: ${n}`);
console.log(`  除外: 既に一致 ${skipped.alreadyConsistent.length} / type!=shared ${skipped.notShared.length} / bbox 不一致 ${skipped.bboxMismatch.length} / group 未解決 ${skipped.noGroup.length} / shared_figure.page_image 無し ${skipped.noSharedPage.length}`);
for (const [k, v] of Object.entries(skipped)) {
  if (k === "alreadyConsistent" || !v.length) continue;
  console.error(`  [要確認] ${k}: ${v.join(", ")}`);
}

if (ASSERT_CLEAN) {
  // ══ 常設ゲート ══
  // (A) 中問の共有図メンバーで「bbox の基準ページ (組のページ) と記録された図ページ」が食い違うものが 0 件。
  //     新しい組を登録したり chumon-recrop を回した後にここが赤くなれば、図側消費が設問ページを図と誤認する状態に戻っている。
  // (B) 委託済の判定 JSON 2 本に載る **全 SPLIT_FIGURE の id** が、今も bank と by_year の両方で
  //     判定どおりの figure_page_* を持っている。(A) だけでは中問の共有図メンバーしか守れず、
  //     散題 (2009h21h-q097 / 2014h26h-q089 / 2015h27h-q089) と sibling 組は無防備だった (Rule D 批 2 指摘)。
  //     欠如は合法な既定値なので crosscheck B7 では消失を捕まえられない ← このゲートが唯一の砦。
  const problems = [];
  for (const d of decisions) problems.push(`[A] ${d.id}: 図ページが組のページ (${d.figure_page_number}) と未整合`);
  for (const m of siblingMismatch) problems.push(`[A] ${m}`);

  const DEC_FILES = [
    path.join(ROOT, "evidence/phase5/stage_06_quiz_fidelity/pagefix_S118_decisions.json"),
    OUT,
  ];
  const byYearCache = new Map();
  const byYearRec = (id) => {
    const exam = id.split("-q")[0];
    if (!byYearCache.has(exam)) {
      const f = path.join(EXAMS, "by_year", `${exam}.json`);
      byYearCache.set(exam, existsSync(f) ? (z => z.questions ?? z)(rj(f)) : null);
    }
    return byYearCache.get(exam)?.find((q) => q.id === id) ?? null;
  };
  const bankById = new Map(bank.map((q) => [q.id, q]));
  let covered = 0;
  for (const f of DEC_FILES) {
    if (!existsSync(f)) { problems.push(`[B] 判定 JSON が無い: ${path.relative(ROOT, f)}`); continue; }
    const arr = (z => Array.isArray(z) ? z : (z.decisions ?? []))(rj(f));
    for (const d of arr) {
      if (d.verdict !== "SPLIT_FIGURE") continue;
      covered++;
      const want = { n: d.figure_page_number, img: `pages/${d.id.split("-q")[0]}/page-${String(d.figure_page_number).padStart(2, "0")}.png` };
      for (const [layer, rec] of [["question_bank", bankById.get(d.id)], ["by_year", byYearRec(d.id)]]) {
        if (!rec) { problems.push(`[B] ${d.id}: ${layer} に無い`); continue; }
        const s = rec.source ?? {};
        if (s.figure_page_number !== want.n || s.figure_page_image !== want.img)
          problems.push(`[B] ${d.id}: ${layer} の figure_page_* が判定と違う — 実 ${JSON.stringify({ image: s.figure_page_image ?? null, number: s.figure_page_number ?? null })} / 判定 ${JSON.stringify({ image: want.img, number: want.n })} (${path.basename(f)})`);
      }
    }
  }

  if (problems.length) {
    console.error(`✗ D-145 図ページの常設ゲートが ${problems.length} 件で落ちた:`);
    for (const p of problems.slice(0, 60)) console.error(`  ${p}`);
    if (problems.length > 60) console.error(`  … +${problems.length - 60} more`);
    console.error(`  是正: node scripts/quiz-pagefix-apply.mjs  /  node scripts/quiz-pagefix-apply.mjs --decisions ${path.relative(ROOT, OUT)}`);
    process.exit(1);
  }
  console.log(`✓ D-145 図ページ常設ゲート: (A) 中問の共有図メンバー全員が組のページと整合 / (B) 判定 JSON の SPLIT_FIGURE ${covered} 件が bank・by_year 両層で判定どおり`);
} else if (CHECK) {
  if (!existsSync(OUT)) { console.error(`✗ ${path.relative(ROOT, OUT)} が無い`); process.exit(1); }
  if (readFileSync(OUT, "utf-8") !== text) { console.error(`✗ ${path.relative(ROOT, OUT)} は生成結果と一致しない`); process.exit(1); }
  console.log(`✓ ${path.relative(ROOT, OUT)} は生成結果と一致`);
} else if (!PRINT) {
  writeFileSync(OUT, text);
  console.log(`✓ 書込: ${path.relative(ROOT, OUT)}`);
}
