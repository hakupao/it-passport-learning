// Task 9 Step 3 / Review Focus 7 — textbook-v2-parity.mjs: the fixture has 0 diff; dropping one
// language's step caption / goal / pair row / 考点 is reported at that location with exit 1.
import assert from "node:assert/strict";
import path from "node:path";
import { test } from "node:test";

import { fixture, locPartOf, run, tempRoot, writeJson } from "./lib/textbook-v2-testkit.mjs";

const dir = tempRoot();
let n = 0;
const parity = (doc, flag = "--file") => run("textbook-v2-parity.mjs", [flag, writeJson(path.join(dir, `p${n++}.json`), doc)]);

test("the fixture: 0 diff, exit 0", () => {
  const r = parity(fixture());
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /0 diff/);
  assert.equal(parity(locPartOf(fixture()), "--part").code, 0);
});

test("one language loses a step caption → that figure's steps differ", () => {
  const u = fixture();
  const i = u.terms.findIndex((t) => Array.isArray(t.fig?.steps));
  const steps = u.terms[i].fig.steps.length;
  delete u.terms[i].fig.steps[1].caption_en;
  const r = parity(u);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, new RegExp(`terms\\[${i}\\]\\([^)]+\\)\\.fig\\.steps\\s+jp=${steps} zh=${steps} en=${steps - 1}`));
});

test("goals / pair rows / 考点 / figure labels / overview cells: each drop is reported", () => {
  const cases = [
    [(u) => u.goals_zh.pop(), /goals\s+jp=3 zh=2 en=3/],
    [(u) => (u.pairs[0].rows[0].b_en = ""), /pairs\[0\]\.rows\s+jp=2 zh=2 en=1/],
    [(u) => (u.terms[0].points[0].text_zh = ""), /terms\[0\]\([^)]+\)\.points\s+jp=1 zh=0 en=1/],
    [(u) => delete u.terms.find((t) => t.fig?.kind === "tree").fig.data.root.label.zh, /\.fig\.labels\s+jp=\d+ zh=\d+ en=\d+/],
    [(u) => u.overview_rows[2].extra_en.push("x"), /overview_rows\[2\]\.extra\s+jp=1 zh=1 en=2/],
  ];
  for (const [mutate, re] of cases) {
    const u = fixture();
    mutate(u);
    const r = parity(u);
    assert.equal(r.code, 1, r.out);
    assert.match(r.out, re);
  }
});
