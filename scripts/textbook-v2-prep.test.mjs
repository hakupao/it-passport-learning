// Task 9 Step 3 — textbook-v2-prep.mjs: deterministic manifest (two runs → identical bytes), the
// v1 glosses / headwords / questions it carries, and refusing a units file that is already v2.
// Run: node --test scripts/textbook-v2-*.test.mjs
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { dataPaths, readJson, REPO } from "./lib/textbook-v2.mjs";
import { FIXTURE_V1TERMS, fixture, run, tempRoot, UNIT } from "./lib/textbook-v2-testkit.mjs";

test("prep is deterministic: two runs write identical bytes", () => {
  const root = tempRoot();
  const r1 = run("textbook-v2-prep.mjs", ["--unit", UNIT, "--data-root", root]);
  assert.equal(r1.code, 0, r1.out);
  const f = dataPaths(root).manifest(UNIT);
  const a = readFileSync(f);
  const r2 = run("textbook-v2-prep.mjs", ["--unit", UNIT, "--data-root", root]);
  assert.equal(r2.code, 0, r2.out);
  assert.match(r2.out, /^= /m, "second run reports no change");
  assert.ok(a.equals(readFileSync(f)));
  // a fresh root gives the same bytes too (no timestamps / dir-dependent content)
  const other = tempRoot();
  assert.equal(run("textbook-v2-prep.mjs", ["--unit", UNIT, "--data-root", other]).code, 0);
  assert.ok(a.equals(readFileSync(dataPaths(other).manifest(UNIT))));
});

test("manifest carries the pre-rewrite glosses, headwords, questions, rules and the writer schema", () => {
  const root = tempRoot();
  assert.equal(run("textbook-v2-prep.mjs", ["--unit", UNIT, "--data-root", root]).code, 0);
  const m = readJson(dataPaths(root).manifest(UNIT));
  assert.deepEqual(m.v1_terms, readJson(FIXTURE_V1TERMS));
  assert.deepEqual(m.terms, fixture().terms.map((t) => t.term));
  assert.equal(m.v1.schema_version, "stage4-unit-v1-trilingual");
  assert.match(m.topic.objective_jp, /プロジェクトマネジメント/);
  assert.match(m.d195_lines.join("\n"), /^# D-195/);
  assert.equal(`${m.d195_lines.join("\n")}`, readFileSync(path.join(REPO, "docs/decisions/D-195-textbook-writing-and-figure-rules.md"), "utf-8"));
  assert.deepEqual(Object.keys(m.figures.kinds).sort(), ["compare", "flow", "network", "svg", "table", "tree"]);
  assert.match(m.figures.types_ts_lines.join("\n"), /export type FigSpec/);
  // S135 M2: long texts are line arrays, so no line of the pretty-printed manifest is long (Read truncates)
  const longest = Math.max(...readFileSync(dataPaths(root).manifest(UNIT), "utf-8").split("\n").map((l) => l.length));
  assert.ok(longest < 1000, `longest manifest line ${longest}`);
  assert.equal(m.output_schema.properties.stage.const, "jp");
  // every per-term question is a same-topic question listing the term; ids sorted
  const ids = Object.keys(m.questions);
  assert.deepEqual(ids, [...ids].sort());
  for (const [term, qs] of Object.entries(m.term_questions)) {
    assert.ok(qs.length > 0, term);
    for (const id of qs) assert.ok(m.questions[id].terms.includes(term), `${id} ${term}`);
  }
  // v1 challenge questions are included even when they list no unit term
  for (const id of m.v1.challenge_questions) assert.ok(m.questions[id], id);
  for (const id of m.chumon_members) if (m.questions[id]) assert.ok(m.questions[id].chumon_group, id);
  // members = the topic's whole registry, including members outside `questions`
  const reg = readJson(path.join(root, "quiz/chumon_groups.json")).groups.flatMap((g) => g.member_ids);
  const qs = readJson(path.join(root, "quiz/questions.json")).questions;
  const want = qs.filter((x) => x.topic_id === m.topic.topic_id && reg.includes(x.id)).map((x) => x.id).sort();
  assert.deepEqual(m.chumon_members, want);
  assert.ok(want.some((id) => !m.questions[id]), "some topic member lies outside the unit's questions");
  const q = m.questions[ids[0]];
  for (const k of ["stem_jp", "choices_jp", "correct_answer", "expl_correct_jp", "expl_points_jp"]) assert.ok(k in q, k);
});

test("prep refuses a units file that is already v2 (its v1 content would be lost)", () => {
  const root = tempRoot();
  writeFileSync(path.join(root, `textbook/units/${UNIT}.json`), JSON.stringify(fixture()));
  const r = run("textbook-v2-prep.mjs", ["--unit", UNIT, "--data-root", root]);
  assert.notEqual(r.code, 0);
  assert.match(r.out, /not v1/);
});
