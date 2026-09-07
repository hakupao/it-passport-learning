#!/usr/bin/env node
// Stage 6 / Quiz — D-144 段 3(i)-A (S117): 中問の共有図 (groups.json, D-120) を、図を参照しながら図の無いメンバーに **題級 figure として挂ける**。
// 対象は主 context が `_groups/*.png` を実読して「共有図として完全 (図N の見出し・本体・キャプションが欠けていない)」と判定した 8 組 / 15 問。
// 不合格 6 組 (2009h21a-mqC 上端欠け+図2 無し / 2012h24a-mqA 表頭欠け / 2013h25a-mqC 表1 上端欠け / 2013h25h-mqD 上端欠け /
// 2015h27a-mqC 節点欠け / 2015h27h-mqC 右端・表頭欠け) は 段 3(ii) で源ページから再裁断する。
// 処理: `figures/_groups/<gid>.png` → `figures/<id>.png` に複製 (既存があれば .bak)、bank/by_year に has_figure=true / figure_path /
// figure_type="shared" / figure_bbox_pct=group の bbox / figure_group=gid。下流: build-quiz-corpus → build-quiz-figures。
// Run: node scripts/quiz-chumon-lightweight-figs-D144s3.mjs [--dry-run]
import { readFileSync, writeFileSync, copyFileSync, existsSync } from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); const DRY = process.argv.includes("--dry-run");
const rj = (f) => JSON.parse(readFileSync(f, "utf-8")); const wj = (f, d) => { if (!DRY) writeFileSync(f, JSON.stringify(d, null, 2) + "\n"); };
const EX = path.join(ROOT, "data/ip/exams"); const groups = (rj(path.join(EX, "groups.json")).groups ?? rj(path.join(EX, "groups.json")));
const ATTACH = {
  "2011h23tokubetsu-mqC": ["2011h23tokubetsu-q097", "2011h23tokubetsu-q098"],
  "2012h24a-mqC": ["2012h24a-q093", "2012h24a-q094", "2012h24a-q095", "2012h24a-q096"],
  "2013h25a-mqB": ["2013h25a-q088"],
  "2013h25h-mqC": ["2013h25h-q093", "2013h25h-q094", "2013h25h-q095"],
  "2015h27a-mqTech1": ["2015h27a-q087"],
  "2015h27a-mqTech2": ["2015h27a-q090", "2015h27a-q091", "2015h27a-q092"],
  "2015h27h-mqA": ["2015h27h-q085", "2015h27h-q086", "2015h27h-q088"],
  "2015h27h-mqD": ["2015h27h-q097", "2015h27h-q099", "2015h27h-q100"],
};
// 同組の別問が持つ図をそのまま共有する (前文の埋め込みで「図1」を参照するようになった問、S117 §28)
const COPY_FROM = { "2015h27h-q090": "2015h27h-q089", "2015h27h-q092": "2015h27h-q089", "2014h26h-q100": "2014h26h-q097" /* 図1 移行作業のアローダイアグラム (page-44) */ }; // 図1 ソフトウェア開発のアローダイアグラム (page-38)
const Bd = rj(path.join(EX, "question_bank.json")); const BY = {}; let n = 0;
for (const [id, srcId] of Object.entries(COPY_FROM)) {
  const src = path.join(EX, "figures", `${srcId}.png`); if (!existsSync(src)) throw new Error(`${srcId} figure missing`);
  const exam = id.split("-q")[0]; BY[exam] ??= rj(path.join(EX, "by_year", `${exam}.json`)); const dest = path.join(EX, "figures", `${id}.png`);
  if (!DRY) { if (existsSync(dest)) copyFileSync(dest, dest + ".pre-D144s3.bak"); copyFileSync(src, dest); }
  for (const [o, w] of [[Bd.questions.find((q) => q.id === id), "bank"], [BY[exam].questions.find((q) => q.id === id), "by_year"]]) {
    const s0 = Bd.questions.find((q) => q.id === srcId); if (!o || !s0) throw new Error(`${id}/${srcId} missing in ${w}`);
    if (o.figure_path && o.figure_path !== `figures/${id}.png`) throw new Error(`${id} ${w}: has other figure ${o.figure_path}`);
    const before = JSON.stringify([o.has_figure, o.figure_path, o.figure_type, o.figure_bbox_pct, o.figure_group]);
    o.has_figure = true; o.figure_path = `figures/${id}.png`; o.figure_type = "shared"; // 兄弟図の共有は常に shared (A6 の共存条件と揃える) o.figure_bbox_pct = s0.figure_bbox_pct ?? null; o.figure_group = `sibling:${srcId}`;
    if (before !== JSON.stringify([o.has_figure, o.figure_path, o.figure_type, o.figure_bbox_pct, o.figure_group])) { n++; console.log(`  ✓ ${id} ${w}: figure ← ${srcId}`); }
  }
}
for (const [gid, ids] of Object.entries(ATTACH)) {
  const g = groups.find((x) => x.group_id === gid); if (!g?.shared_figure?.path) throw new Error(`${gid}: no shared_figure`);
  const src = path.join(EX, g.shared_figure.path); if (!existsSync(src)) throw new Error(`${gid}: ${src} missing`);
  for (const id of ids) {
    if (!(g.member_qids ?? []).includes(id)) throw new Error(`${id} not a member of ${gid}`);
    const exam = id.split("-q")[0]; BY[exam] ??= rj(path.join(EX, "by_year", `${exam}.json`));
    const dest = path.join(EX, "figures", `${id}.png`);
    if (!DRY) { if (existsSync(dest)) copyFileSync(dest, dest + ".pre-D144s3.bak"); copyFileSync(src, dest); }
    for (const [o, w] of [[Bd.questions.find((q) => q.id === id), "bank"], [BY[exam].questions.find((q) => q.id === id), "by_year"]]) {
      if (!o) throw new Error(`${id} missing in ${w}`);
      if (o.figure_path && o.figure_path !== `figures/${id}.png`) throw new Error(`${id} ${w}: already has figure ${o.figure_path}`);
      const before = JSON.stringify([o.has_figure, o.figure_path, o.figure_type, o.figure_bbox_pct, o.figure_group]);
      o.has_figure = true; o.figure_path = `figures/${id}.png`; o.figure_type = "shared"; o.figure_bbox_pct = g.shared_figure.bbox_pct ?? o.figure_bbox_pct ?? null; o.figure_group = gid;
      if (before !== JSON.stringify([o.has_figure, o.figure_path, o.figure_type, o.figure_bbox_pct, o.figure_group])) { n++; console.log(`  ✓ ${id} ${w}: figure ← ${gid} (${g.shared_figure.caption})`); }
    }
  }
}
wj(path.join(EX, "question_bank.json"), Bd); for (const e of Object.keys(BY)) wj(path.join(EX, "by_year", `${e}.json`), BY[e]);
console.log(`${DRY ? "(dry-run) " : "✓ "}chumon-lightweight-figs: ${n} layer updates; next: node scripts/build-quiz-corpus.mjs && node scripts/build-quiz-figures.mjs`);
