#!/usr/bin/env node
/**
 * Stage 4 Phase B — unit 装配 (確定的, D-118 schema)
 *
 * LLM 日語正文 (content_{unit}.json) + quiz/figure fixtures + ToC 骨格 → units/{unit_id}.json。
 * 本工程は日語のみ (_jp)。翻訳 (_zh/_en) は日語ゲート承認後の別 pass。
 * Mermaid は source を載せ svg_path を予約 (rendered=false)。B5 (render) が SVG 生成 + rendered 更新。
 *
 * 全量バッチ対応 (Session 82):
 *  - CLI args = 対象 unit id (空=content が存在する全 unit)。
 *  - 既に三語 (lang_status.zh==='generated') の unit は明示指定なき限り skip
 *    (pilot 既存三語 unit を日語のみに巻き戻すクロバリング事故を防止)。
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const rd = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));

const toc = rd("data/ip/textbook/unit_index.json");
const fixturesArr = rd("data/ip/textbook/.planning/quiz_fixtures.json").units;
const fixturesById = new Map(fixturesArr.map((f) => [f.unit_id, f]));

const TARGET = new Set(process.argv.slice(2)); // 空=全 content 存在 unit
const estMinutes = (n) => Math.round(n * 2.5 + 3); // ~15分/unit 目安 (D-115)

let written = 0;
const missing = [];
const skipped = [];
const summaryRows = [];

for (const topic of toc.topics) {
  for (const unit of topic.units) {
    const uid = unit.unit_id;
    if (TARGET.size && !TARGET.has(uid)) continue;
    const cp = `data/ip/textbook/.planning/content_${uid}.json`;
    if (!existsSync(join(ROOT, cp))) { if (TARGET.has(uid)) missing.push(uid); continue; }
    // クロバリング防止: 明示指定なき三語完成 unit は skip
    const up0 = `data/ip/textbook/units/${uid}.json`;
    if (!TARGET.has(uid) && existsSync(join(ROOT, up0)) && rd(up0).lang_status?.zh === "generated") { skipped.push(uid); continue; }
    const content = rd(cp);
    const fx = fixturesById.get(uid);
    const inlineByTerm = new Map((fx?.inline_quiz || []).map((x) => [x.term, x]));

    let figIdx = 0;
    const terms = content.terms.map((t) => {
      const iq = inlineByTerm.get(t.term);
      let figure = null;
      if (t.needs_figure && t.mermaid) {
        figIdx += 1;
        figure = {
          mermaid: t.mermaid,
          svg_path: `figures/${uid}-t${String(figIdx).padStart(2, "0")}.svg`,
          rendered: false,
        };
      }
      return {
        term: t.term,
        definition_jp: t.definition_jp,
        explanation_jp: t.explanation_jp,
        analogy_jp: t.analogy_jp,
        memory_hook_jp: t.memory_hook_jp,
        inline_quiz: iq ? iq.question_ids : [],
        inline_fallback: iq ? iq.fallback : false,
        figure,
      };
    });

    const unitDoc = {
      schema_version: "stage4-unit-v1-jp",
      unit_id: uid,
      topic_id: topic.topic_id,
      category: topic.category,
      title_jp: unit.title_jp,
      unit_summary_jp: unit.summary_jp,
      order_in_topic: topic.unit_order.indexOf(uid) + 1,
      prerequisites: unit.prerequisites || [],
      overview: {
        intro_jp: content.overview_jp.intro_jp,
        freq_badge: unit.node_freq_badge,
        est_minutes: estMinutes(terms.length),
      },
      terms,
      summary: {
        memory_hooks_jp: content.summary_jp.memory_hooks,
        key_points_jp: content.summary_jp.key_points_jp,
      },
      challenge_questions: fx ? fx.challenge_questions : [],
      source_figures: fx ? fx.source_figures : [],
      lang_status: { jp: "generated", zh: "pending", en: "pending" },
    };

    writeFileSync(join(ROOT, `data/ip/textbook/units/${uid}.json`), JSON.stringify(unitDoc, null, 2));
    written += 1;
    summaryRows.push({ uid, terms: terms.length, figs: terms.filter((t) => t.figure).length, inline: terms.filter((t) => t.inline_quiz.length).length, challenge: unitDoc.challenge_questions.length, srcFigs: unitDoc.source_figures.length });
  }
}

console.log("=== unit 装配 (日語) ===");
for (const r of summaryRows) console.log(`[${r.uid}] terms=${r.terms} gen_fig=${r.figs} inline=${r.inline} challenge=${r.challenge} src_fig=${r.srcFigs}`);
console.log(`\n書込 ${written} units → data/ip/textbook/units/`);
if (skipped.length) console.log(`⤳ skip (既に三語完成、上書き回避): ${skipped.length}件`);
if (missing.length) console.log(`⚠ content 欠落 (未生成): ${missing.join(", ")}`);
