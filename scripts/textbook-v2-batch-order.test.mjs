// Stage 7 Phase 3 batch B1 (D-201 §0-1) — textbook-v2-batch-order.mjs: topics except the pilot
// topic, by question count desc (ties by topic_id); only topics with > 5 units split into batches of
// ≤ 5 by unit order. Totals recomputed independently from unit_index.json / questions.json.
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { batchOrder, PILOT_TOPIC, renderMarkdown } from "./textbook-v2-batch-order.mjs";
import { dataPaths, readJson } from "./lib/textbook-v2.mjs";
import { run } from "./lib/textbook-v2-testkit.mjs";

const unit = (topic, n, terms) => ({ unit_id: `${topic}-u${String(n).padStart(2, "0")}`, title_jp: `T${n}`, terms: Array.from({ length: terms }, (_, i) => ({ term: `${topic}/${n}/${i}` })) });
const topicOf = (id, units) => ({ topic_id: id, name_jp: `name ${id}`, units: Array.from({ length: units }, (_, i) => unit(id, i + 1, 2)) });
const qs = (counts) => Object.entries(counts).flatMap(([t, n]) => Array.from({ length: n }, (_, i) => ({ id: `${t}-q${i}`, topic_id: t })));

test("order: question count desc, ties by topic_id; the pilot topic is left out", () => {
  const index = { topics: [topicOf("technology-01-02", 1), topicOf("strategy-01-01", 1), topicOf("management-10-27", 3), topicOf("technology-01-01", 1)] };
  const b = batchOrder(index, qs({ "technology-01-02": 5, "strategy-01-01": 9, "management-10-27": 99, "technology-01-01": 5 }));
  assert.deepEqual(b.map((x) => x.topic_id), ["strategy-01-01", "technology-01-01", "technology-01-02"]);
  assert.deepEqual(b.map((x) => x.id), ["b01", "b02", "b03"]);
  assert.ok(!b.some((x) => x.topic_id === PILOT_TOPIC));
});

test("split: only > 5 units, batches of ≤ 5 in unit order", () => {
  const index = { topics: [topicOf("strategy-01-01", 5), topicOf("strategy-01-02", 6), topicOf("strategy-01-03", 13)] };
  const b = batchOrder(index, qs({ "strategy-01-01": 3, "strategy-01-02": 2, "strategy-01-03": 1 }));
  assert.deepEqual(
    b.map((x) => [x.topic_id, x.units.map((u) => u.slice(-3))]),
    [
      ["strategy-01-01", ["u01", "u02", "u03", "u04", "u05"]],
      ["strategy-01-02", ["u01", "u02", "u03", "u04", "u05"]],
      ["strategy-01-02", ["u06"]],
      ["strategy-01-03", ["u01", "u02", "u03", "u04", "u05"]],
      ["strategy-01-03", ["u06", "u07", "u08", "u09", "u10"]],
      ["strategy-01-03", ["u11", "u12", "u13"]],
    ],
  );
  assert.deepEqual(b.map((x) => x.part), ["", "1/2", "2/2", "1/3", "2/3", "3/3"]);
  assert.deepEqual(b.map((x) => x.terms), [10, 10, 2, 10, 10, 6]);
});

test("real corpus: 62 topics / 241 units / 1402 terms / 78 batches / 12 split topics (recomputed)", () => {
  const P = dataPaths();
  const index = readJson(P.index);
  const questions = readJson(P.questions).questions;
  const b = batchOrder(index, questions);
  // independent recount straight from the index
  const rest = index.topics.filter((t) => t.topic_id !== PILOT_TOPIC);
  const units = rest.flatMap((t) => t.units);
  assert.equal(new Set(b.map((x) => x.topic_id)).size, rest.length);
  assert.equal(b.reduce((a, x) => a + x.units.length, 0), units.length);
  assert.equal(b.reduce((a, x) => a + x.terms, 0), units.reduce((a, u) => a + u.terms.length, 0));
  assert.equal(b.length, rest.reduce((a, t) => a + Math.ceil(t.units.length / 5), 0));
  // the plan's numbers (D-201)
  assert.equal(rest.length, 62);
  assert.equal(units.length, 241);
  assert.equal(b.reduce((a, x) => a + x.terms, 0), 1402);
  assert.equal(b.length, 78);
  assert.equal(new Set(b.filter((x) => x.part !== "").map((x) => x.topic_id)).size, 12);
  assert.ok(b.every((x) => x.units.length <= 5));
  assert.deepEqual([...new Set(b.map((x) => x.topic_id))].slice(0, 4), ["technology-23-63", "technology-23-62", "management-08-25", "strategy-01-02"]);
  assert.equal(new Set(b.flatMap((x) => x.units)).size, 241, "every unit exactly once");
});

test("CLI: deterministic bytes, --check passes on the committed doc, status cells survive a rewrite", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "tbv2-order-"));
  const out = path.join(dir, "batch_order.md");
  assert.equal(run("textbook-v2-batch-order.mjs", ["--out", out]).code, 0);
  const a = readFileSync(out, "utf-8");
  assert.equal(run("textbook-v2-batch-order.mjs", ["--out", out]).code, 0);
  assert.equal(readFileSync(out, "utf-8"), a);
  assert.equal(run("textbook-v2-batch-order.mjs", ["--out", out, "--check"]).code, 0);
  // a status written by hand is kept on regeneration
  writeFileSync(out, a.replace(/^\| b01 \|(.*)\| todo \|$/m, "| b01 |$1| done abc1234 a1 |"));
  assert.equal(run("textbook-v2-batch-order.mjs", ["--out", out]).code, 0);
  assert.match(readFileSync(out, "utf-8"), /^\| b01 \|.*\| done abc1234 a1 \|$/m);
  // the committed doc is current
  const committed = run("textbook-v2-batch-order.mjs", ["--check"]);
  assert.equal(committed.code, 0, committed.out);
});

test("renderMarkdown: one table row per batch with the seven columns", () => {
  const b = batchOrder({ topics: [topicOf("strategy-01-01", 2)] }, qs({ "strategy-01-01": 4 }));
  const md = renderMarkdown(b, new Map());
  assert.match(md, /^\| batch \| topic \| names \| units \| questions \| terms \| status \|$/m);
  assert.match(md, /^\| b01 \| strategy-01-01 \| name strategy-01-01 \| u01 u02 \| 4 \| 4 \| todo \|$/m);
});
