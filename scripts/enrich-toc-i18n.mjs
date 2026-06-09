// Stage 6 (Session 85) — deterministic ToC i18n enrichment (D-110: JS, no LLM).
//
// The full unit_index.json (the reader's table-of-contents source) carries only
// JP labels (title_jp, major, medium). But the per-locale translations already
// exist elsewhere in the self-authored corpus:
//   - unit title_zh / title_en  → in each units/{id}.json
//   - major / medium zh + en     → in syllabus/knowledge_tree.json (by topic_id)
//
// This bakes those existing translations into the index so the reader ToC can be
// rendered per-locale WITHOUT a 244-file fan-out and WITHOUT any new translation
// (hence no Rule A semantic audit — it's a pure data join). The 小分類 topic name
// (name_jp) has NO translation anywhere (JP-only in the IPA syllabus too), so it
// is intentionally left JP — OQ-03 / D-019 decision.
//
// Invariant: this ONLY adds keys (title_zh/title_en on unit refs; major_zh/en +
// medium_zh/en on topics). It never reorders or removes anything. Idempotent.
//
// Usage:  node scripts/enrich-toc-i18n.mjs

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const IDX = path.join(ROOT, "data/ip/textbook/unit_index.json");
const UNITS_DIR = path.join(ROOT, "data/ip/textbook/units");
const KT = path.join(ROOT, "data/ip/syllabus/knowledge_tree.json");

const idx = JSON.parse(readFileSync(IDX, "utf8"));
const kt = JSON.parse(readFileSync(KT, "utf8"));

// topic_id -> { major:{jp,zh,en}, medium:{jp,zh,en} } via kt hierarchy walk
const ktByTopic = new Map();
for (const c of kt.categories) {
  for (const mj of c.major_categories) {
    for (const md of mj.medium_categories) {
      for (const t of md.topics) {
        ktByTopic.set(t.id, {
          major: { jp: mj.name_jp, zh: mj.name_zh, en: mj.name_en },
          medium: { jp: md.name_jp, zh: md.name_zh, en: md.name_en },
        });
      }
    }
  }
}

// unit_id -> { title_zh, title_en } from unit JSONs
const titleByUnit = new Map();
for (const f of readdirSync(UNITS_DIR)) {
  if (!f.endsWith(".json")) continue;
  const u = JSON.parse(readFileSync(path.join(UNITS_DIR, f), "utf8"));
  titleByUnit.set(u.unit_id, { zh: u.title_zh, en: u.title_en });
}

const report = { topics: 0, units: 0, topicFallback: [], unitFallback: [] };
const nonEmpty = (s) => typeof s === "string" && s.trim() !== "";

for (const t of idx.topics) {
  report.topics += 1;
  const kte = ktByTopic.get(t.topic_id);
  // major/medium translations (fallback to the JP value if absent → never blank)
  t.major_zh = kte && nonEmpty(kte.major.zh) ? kte.major.zh : t.major;
  t.major_en = kte && nonEmpty(kte.major.en) ? kte.major.en : t.major;
  t.medium_zh = kte && nonEmpty(kte.medium.zh) ? kte.medium.zh : t.medium;
  t.medium_en = kte && nonEmpty(kte.medium.en) ? kte.medium.en : t.medium;
  if (!kte || !nonEmpty(kte.major.zh) || !nonEmpty(kte.medium.zh)) {
    report.topicFallback.push(t.topic_id);
  }
  for (const u of t.units ?? []) {
    report.units += 1;
    const tt = titleByUnit.get(u.unit_id);
    u.title_zh = tt && nonEmpty(tt.zh) ? tt.zh : u.title_jp;
    u.title_en = tt && nonEmpty(tt.en) ? tt.en : u.title_jp;
    if (!tt || !nonEmpty(tt.zh) || !nonEmpty(tt.en)) {
      report.unitFallback.push(u.unit_id);
    }
  }
}

writeFileSync(IDX, JSON.stringify(idx, null, 2) + "\n");

console.log(
  `enriched: topics=${report.topics} units=${report.units} | ` +
    `topic-fallback=${report.topicFallback.length} unit-fallback=${report.unitFallback.length}`,
);
if (report.topicFallback.length) console.log("  topic fallback:", report.topicFallback);
if (report.unitFallback.length) console.log("  unit fallback:", report.unitFallback);
