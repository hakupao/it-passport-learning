#!/usr/bin/env node
// Stage 6 / Quiz — D-144 段 3(ii)-A (S117): 裁切不良だった中問共有図 6 組を **源ページから再裁断**し、図を参照する 9 問に挂ける。
// bbox (ページ比率) は主 context が源ページを実読して決めた粗枠 → sharp.trim で余白を自動除去。旧 `_groups/<gid>.png` は .pre-D144s3ii.bak に退避、
// groups.json の shared_figure.bbox_pct / page_image を更新 (D-120 モデルの唯一の真相源を最新化)。
// Run: node scripts/quiz-chumon-recrop-D144s3ii.mjs [--dry-run]
import { readFileSync, writeFileSync, copyFileSync, existsSync } from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url"; import { createRequire } from "node:module";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); const DRY = process.argv.includes("--dry-run");
const sharp = createRequire(path.join(ROOT, "apps/web/package.json"))("sharp");
const rj = (f) => JSON.parse(readFileSync(f, "utf-8")); const wj = (f, d) => { if (!DRY) writeFileSync(f, JSON.stringify(d, null, 2) + "\n"); };
const EX = path.join(ROOT, "data/ip/exams"); const GF = path.join(EX, "groups.json"); const gdoc = rj(GF); const groups = gdoc.groups ?? gdoc;
// page: 源ページ / box: {x1,y1,x2,y2} ページ比率 (粗枠) / members: 図を挂ける問 (図無し・図N を参照)
const SPEC = {
  "2009h21a-mqC":  { page: "pages/2009h21a/page-40.png", box: { x1: 0.12, y1: 0.355, x2: 0.90, y2: 0.935 }, caption: "図1 販売管理業務に関するデータベースの構造 / 図2 請求書の様式", members: ["2009h21a-q098", "2009h21a-q099"] },
  "2012h24a-mqA":  { page: "pages/2012h24a/page-33.png", box: { x1: 0.17, y1: 0.28, x2: 0.82, y2: 0.475 }, caption: "図1 売上分析を行うためのワークシート", members: ["2012h24a-q085", "2012h24a-q087", "2012h24a-q088"] },
  "2013h25a-mqC":  { page: "pages/2013h25a/page-39.png", box: { x1: 0.17, y1: 0.415, x2: 0.89, y2: 0.645 }, caption: "表1 業務報告書のファイル名の形式とその表記ルール", members: ["2013h25a-q093", "2013h25a-q094", "2013h25a-q095", "2013h25a-q096"] },
  "2015h27a-mqC":  { page: "pages/2015h27a/page-42.png", box: { x1: 0.12, y1: 0.345, x2: 0.90, y2: 0.615 }, caption: "図1 アローダイアグラム", members: ["2015h27a-q094", "2015h27a-q095", "2015h27a-q096"] },
  "2015h27h-mqC":  { page: "pages/2015h27h/page-41.png", box: { x1: 0.24, y1: 0.395, x2: 0.74, y2: 0.78 }, caption: "図1 売上高の損益分析を行うためのワークシート", members: ["2015h27h-q093", "2015h27h-q094"] },
  // Rule D (段 3(i) 審閲) H-2 / M-2 / L-4 の追補
  "2009h21h-mqA":  { page: "pages/2009h21h/page-34.png", box: { x1: 0.33, y1: 0.33, x2: 0.70, y2: 0.51 }, caption: "図 LAN の構成", members: ["2009h21h-q089", "2009h21h-q090"] },
  "2011h23tokubetsu-mqC": { page: "pages/2011h23tokubetsu/page-39.png", box: { x1: 0.12, y1: 0.25, x2: 0.90, y2: 0.58 }, caption: "図1 懸賞ページ案", members: ["2011h23tokubetsu-q097", "2011h23tokubetsu-q098"] },
  "2013h25h-mqC":  { page: "pages/2013h25h/page-42.png", box: { x1: 0.10, y1: 0.20, x2: 0.92, y2: 0.925 }, caption: "図1 売上高の推移表 / 図2 売上高の推移グラフ", members: ["2013h25h-q093", "2013h25h-q094", "2013h25h-q095"] },
  // 前文 (第 2 弾) が「図1」を参照するため、図の無いメンバーにも共有図を挂ける
  "2013h25h-mqD":  { page: "pages/2013h25h/page-45.png", box: { x1: 0.20, y1: 0.455, x2: 0.80, y2: 0.655 }, caption: "図1 N社ショッピングサイトの経路図", members: ["2013h25h-q097", "2013h25h-q098", "2013h25h-q100"] },
  // 兄弟図 COPY_FROM で q100 に渡した q097 の図が上端・注記・題名欠け (Rule D ④) → 源ページから再裁断して q097/q100 両方に
  "2014h26h-mqD":  { page: "pages/2014h26h/page-44.png", box: { x1: 0.12, y1: 0.40, x2: 0.88, y2: 0.72 }, caption: "図1 移行作業のアローダイアグラム", members: ["2014h26h-q097", "2014h26h-q100"], all_members: ["2014h26h-q097", "2014h26h-q098", "2014h26h-q099", "2014h26h-q100"], label: "中問D" },
  // groups.json に無い組 (Verify 申し送り: 中問B の 図1 ルータを介した旧PCと現PCの接続、page-37) → 新規登録
  "2014h26a-mqA":  { page: "pages/2014h26a/page-34.png", box: { x1: 0.09, y1: 0.585, x2: 0.90, y2: 0.815 }, caption: "図1 Xソフトの開発作業のアローダイアグラム", members: ["2014h26a-q085", "2014h26a-q086", "2014h26a-q088"], all_members: ["2014h26a-q085", "2014h26a-q086", "2014h26a-q087", "2014h26a-q088"], label: "中問A" },
  "2014h26a-mqB":  { page: "pages/2014h26a/page-37.png", box: { x1: 0.27, y1: 0.65, x2: 0.72, y2: 0.835 }, caption: "図1 ルータを介した旧PCと現PCの接続", members: ["2014h26a-q089", "2014h26a-q090", "2014h26a-q091"], all_members: ["2014h26a-q089", "2014h26a-q090", "2014h26a-q091", "2014h26a-q092"], label: "中問B" },
};
const Bd = rj(path.join(EX, "question_bank.json")); const BY = {}; let n = 0;
for (const [gid, s] of Object.entries(SPEC)) {
  let g = groups.find((x) => x.group_id === gid);
  if (!g) { if (!s.all_members) throw new Error(`${gid} not in groups.json`); g = { group_id: gid, exam: gid.split("-")[0], label: s.label ?? gid, header_quote: null, shared_figure: {}, member_qids: s.all_members, owner_qid: null, added: "S117 D-144 段 3(ii)" }; groups.push(g); console.log(`  + groups.json: ${gid} を新規登録`); }
  const pagePng = path.join(EX, s.page); const meta = await sharp(pagePng).metadata();
  const left = Math.round(meta.width * s.box.x1), top = Math.round(meta.height * s.box.y1), width = Math.round(meta.width * (s.box.x2 - s.box.x1)), height = Math.round(meta.height * (s.box.y2 - s.box.y1));
  const raw = await sharp(pagePng).extract({ left, top, width, height }).png().toBuffer();
  const pipe = sharp(raw).trim({ threshold: 40 }).extend({ top: 16, bottom: 16, left: 16, right: 16, background: "#fff" }).png();
  const dest = path.join(EX, "figures/_groups", `${gid}.png`);
  const info = DRY ? (await pipe.toBuffer({ resolveWithObject: true })).info : (existsSync(dest) && !existsSync(dest + ".pre-D144s3ii.bak") && copyFileSync(dest, dest + ".pre-D144s3ii.bak"), await pipe.toFile(dest));
  console.log(`  ${DRY ? "(dry) " : ""}${gid}: ${s.page} ${JSON.stringify(s.box)} → ${info.width}x${info.height}`);
  g.shared_figure = { ...(g.shared_figure ?? {}), path: `figures/_groups/${gid}.png`, page_image: s.page, bbox_pct: s.box, caption: s.caption, recropped: "S117 D-144 段 3(ii)" };
  for (const id of s.members) {
    if (!(g.member_qids ?? []).includes(id)) throw new Error(`${id} not a member of ${gid}`);
    const exam = id.split("-q")[0]; BY[exam] ??= rj(path.join(EX, "by_year", `${exam}.json`));
    const qdest = path.join(EX, "figures", `${id}.png`);
    if (!DRY) { if (existsSync(qdest)) copyFileSync(qdest, qdest + ".pre-D144s3ii.bak"); copyFileSync(dest, qdest); }
    for (const [o, w] of [[Bd.questions.find((q) => q.id === id), "bank"], [BY[exam].questions.find((q) => q.id === id), "by_year"]]) {
      if (!o) throw new Error(`${id} missing in ${w}`);
      if (o.figure_path && o.figure_path !== `figures/${id}.png`) throw new Error(`${id} ${w}: has other figure ${o.figure_path}`);
      const before = JSON.stringify([o.has_figure, o.figure_path, o.figure_type, o.figure_bbox_pct, o.figure_group]);
      o.has_figure = true; o.figure_path = `figures/${id}.png`; o.figure_type = "shared"; o.figure_bbox_pct = s.box; o.figure_group = gid;
      if (o.composite_figure_path_retired === `figures/${id}.png`) o.composite_figure_path_retired = `figures/${id}.png.pre-D144s3ii.bak`; // 退避先の実体は .bak (Rule D LOW)
      if (before !== JSON.stringify([o.has_figure, o.figure_path, o.figure_type, o.figure_bbox_pct, o.figure_group])) { n++; console.log(`    ✓ ${id} ${w}: figure ← ${gid}`); }
    }
  }
}
wj(GF, gdoc); wj(path.join(EX, "question_bank.json"), Bd); for (const e of Object.keys(BY)) wj(path.join(EX, "by_year", `${e}.json`), BY[e]);
console.log(`${DRY ? "(dry-run) " : "✓ "}chumon-recrop: ${Object.keys(SPEC).length} groups / ${n} layer updates; next: build-quiz-corpus && build-quiz-figures`);
