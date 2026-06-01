#!/usr/bin/env node
/**
 * Stage 3 (G3) — build the syllabus mapping index that mappers Read.
 *
 * Source: data/ip/syllabus/knowledge_tree.json
 *   categories(3) → major_categories(9) → medium_categories(23) → topics(63) → terms(string[1413])
 *
 * Output: data/ip/syllabus/_mapping_index.json
 *   A flat list of the 63 小分類 (topics), each carrying full hierarchy context
 *   (category / major / medium names) + its objective + its 用語 list. This is the
 *   single reference file each mapper Reads (D-126 step 1: avoid prompt bloat/echo by
 *   reading a file rather than inlining all 1,413 terms per call).
 *
 * Deterministic. No agents. Run: node scripts/stage03-build-index.mjs
 */
import { readFileSync, writeFileSync } from 'fs';

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const SRC = `${ROOT}/data/ip/syllabus/knowledge_tree.json`;
const OUT = `${ROOT}/data/ip/syllabus/_mapping_index.json`;

const kt = JSON.parse(readFileSync(SRC, 'utf8'));

const topics = [];
for (const cat of kt.categories) {
  for (const mj of cat.major_categories || []) {
    for (const md of mj.medium_categories || []) {
      for (const tp of md.topics || []) {
        topics.push({
          id: tp.id,
          category: cat.id, // strategy | management | technology
          category_jp: cat.name_jp,
          major_jp: mj.name_jp,
          medium_jp: md.name_jp,
          name_jp: tp.name_jp,
          objective_jp: tp.objective_jp || '',
          terms: tp.terms || [],
        });
      }
    }
  }
}

const index = {
  version: kt.version,
  source: 'knowledge_tree.json',
  topic_count: topics.length,
  term_count: topics.reduce((n, t) => n + t.terms.length, 0),
  // a tiny legend so the mapper understands the id scheme without guessing
  id_scheme: 'topics are 小分類; primary_topic MUST be one of these ids; terms MUST be drawn from the matched topic(s) term lists',
  topics,
};

writeFileSync(OUT, JSON.stringify(index, null, 2));
console.log(`wrote ${OUT}`);
console.log(`topics: ${index.topic_count}  terms: ${index.term_count}`);
// sanity: every id unique, prefix is a known category
const ids = new Set();
let bad = 0;
for (const t of topics) {
  if (ids.has(t.id)) { console.error('DUP id', t.id); bad++; }
  ids.add(t.id);
  if (!['strategy', 'management', 'technology'].includes(t.category)) { console.error('bad category', t.id, t.category); bad++; }
}
console.log(bad === 0 ? 'sanity OK (unique ids, known categories)' : `SANITY FAIL: ${bad}`);
