#!/usr/bin/env node
// Stage 7 Phase 1 (D-190 §0-21): 教科書ユニットの予想所要時間 (分) を 1 ファイルに集める (決定的・冪等)。
//
// 出所: data/ip/textbook/units/<unit_id>.json の overview.est_minutes。
// 単元一覧の正は unit_index.json (topics[].unit_order)。index にある単元のファイルが無い /
// est_minutes が正の有限数でない → throw (黙って 0 分や欠落にしない)。
// 出力: data/ip/textbook/unit_minutes.json = { schema_version: 1, minutes: { <unit_id>: <分> } }
//       unit_id 昇順 (コード単位順) なので再生成はバイト単位で一致する。
// 今日ページ / 領域ページはこの小さなファイルだけを読み、244 単元の本文 JSON を開かない。
//
// Run: node scripts/textbook-unit-minutes-build.mjs [--check]
//      --check … 書き込まず、既存ファイルとの差分の有無だけを報告 (差分ありなら exit 1)

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TB = path.join(ROOT, "data/ip/textbook");
const OUT = path.join(TB, "unit_minutes.json");
const CHECK = process.argv.includes("--check");

const rj = (f) => JSON.parse(readFileSync(f, "utf-8"));

const index = rj(path.join(TB, "unit_index.json"));
const unitIds = index.topics.flatMap((t) => t.unit_order ?? []);
if (new Set(unitIds).size !== unitIds.length) throw new Error("unit_index.json: unit_order に重複した unit_id がある");

const minutes = {};
for (const id of [...unitIds].sort()) {
  const f = path.join(TB, "units", `${id}.json`);
  if (!existsSync(f)) throw new Error(`${id}: unit_index にあるが units/${id}.json が無い`);
  const u = rj(f);
  if (u.unit_id !== id) throw new Error(`units/${id}.json: unit_id=${JSON.stringify(u.unit_id)} がファイル名と不一致`);
  const m = u.overview?.est_minutes;
  if (typeof m !== "number" || !Number.isFinite(m) || m <= 0) {
    throw new Error(`${id}: overview.est_minutes=${JSON.stringify(m)} (正の有限数でない)`);
  }
  minutes[id] = m;
}

const doc = { schema_version: 1, minutes };
const text = JSON.stringify(doc, null, 2) + "\n";
const vals = Object.values(minutes);
console.log(
  `unit_minutes: ${vals.length} 単元 — 合計 ${vals.reduce((a, b) => a + b, 0)} 分 (min ${Math.min(...vals)} / max ${Math.max(...vals)})`,
);

const prev = existsSync(OUT) ? readFileSync(OUT, "utf-8") : null;
if (CHECK) {
  if (prev === text) { console.log(`= ${path.relative(ROOT, OUT)} は生成結果と一致`); process.exit(0); }
  console.error(`✗ ${path.relative(ROOT, OUT)} が生成結果と不一致 (${prev === null ? "ファイルなし" : "内容差"}) — 再生成してください`);
  process.exit(1);
}
if (prev === text) console.log(`= ${path.relative(ROOT, OUT)} 変更なし (冪等)`);
else { writeFileSync(OUT, text); console.log(`✓ ${path.relative(ROOT, OUT)} を${prev === null ? "作成" : "更新"}`); }
