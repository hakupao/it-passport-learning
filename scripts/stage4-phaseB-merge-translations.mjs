#!/usr/bin/env node
/**
 * Stage 4 Phase B — 翻訳マージ (確定的, D-118 三語平铺)
 * translation_{unit}.json (zh/en) を units/{unit}.json に _zh/_en 平铺で結合。
 * term は term_jp で整合 (同数・同順を検証、不一致は fail)。lang_status を更新。
 *
 * 全量バッチ対応 (Session 82):
 *  - CLI args = 対象 unit id。空=translation_*.json が存在し未マージ (lang_status.zh!=='generated') の全 unit。
 *  - バッチ外 (未翻訳) unit の translation 欠落は error にしない (明示指定時のみ error)。
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const UNITS = join(ROOT, "data/ip/textbook/units");
const PL = join(ROOT, "data/ip/textbook/.planning");

const allIds = JSON.parse(readFileSync(join(ROOT, "data/ip/textbook/unit_index.json"), "utf8")).topics.flatMap((t) => t.units.map((u) => u.unit_id));
const TARGET = process.argv.slice(2);
const hasTrans = (uid) => existsSync(join(PL, `translation_${uid}.json`));
const alreadyMerged = (uid) => existsSync(join(UNITS, `${uid}.json`)) && JSON.parse(readFileSync(join(UNITS, `${uid}.json`), "utf8")).lang_status?.zh === "generated";
// 明示指定=そのまま / 既定=翻訳存在 かつ 未マージ
const ids = TARGET.length ? TARGET : allIds.filter((uid) => hasTrans(uid) && !alreadyMerged(uid));

let merged = 0;
const errors = [];
for (const uid of ids) {
  const up = join(UNITS, `${uid}.json`);
  const tp = join(PL, `translation_${uid}.json`);
  if (!existsSync(tp)) { errors.push(`${uid}: translation missing`); continue; }
  const u = JSON.parse(readFileSync(up, "utf8"));
  const tr = JSON.parse(readFileSync(tp, "utf8"));

  // 整合検証
  if (tr.terms.length !== u.terms.length) { errors.push(`${uid}: term count ${tr.terms.length}≠${u.terms.length}`); continue; }
  let aligned = true;
  for (let i = 0; i < u.terms.length; i++) if (tr.terms[i].term_jp !== u.terms[i].term) { aligned = false; errors.push(`${uid}: term[${i}] '${tr.terms[i].term_jp}'≠'${u.terms[i].term}'`); }
  if (!aligned) continue;

  // 平铺マージ
  u.title_zh = tr.title.zh; u.title_en = tr.title.en;
  u.unit_summary_zh = tr.unit_summary.zh; u.unit_summary_en = tr.unit_summary.en;
  u.overview.intro_zh = tr.overview_intro.zh; u.overview.intro_en = tr.overview_intro.en;
  u.terms.forEach((t, i) => {
    const x = tr.terms[i];
    t.term_zh = x.term_zh; t.term_en = x.term_en;
    t.definition_zh = x.definition.zh; t.definition_en = x.definition.en;
    t.explanation_zh = x.explanation.zh; t.explanation_en = x.explanation.en;
    t.analogy_zh = x.analogy.zh; t.analogy_en = x.analogy.en;
    t.memory_hook_zh = x.memory_hook.zh; t.memory_hook_en = x.memory_hook.en;
  });
  u.summary.key_points_zh = tr.summary.key_points.map((k) => k.zh);
  u.summary.key_points_en = tr.summary.key_points.map((k) => k.en);
  u.summary.memory_hooks_zh = tr.summary.memory_hooks.map((k) => k.zh);
  u.summary.memory_hooks_en = tr.summary.memory_hooks.map((k) => k.en);
  u.lang_status = { jp: "generated", zh: "generated", en: "generated" };
  u.schema_version = "stage4-unit-v1-trilingual";

  writeFileSync(up, JSON.stringify(u, null, 2));
  merged += 1;
}

console.log(`三語マージ: ${merged}/${ids.length} units`);
if (errors.length) { console.error("エラー:\n  " + errors.join("\n  ")); process.exit(1); }
console.log("全 unit に _jp/_zh/_en 平铺完了。lang_status=三語 generated。");
