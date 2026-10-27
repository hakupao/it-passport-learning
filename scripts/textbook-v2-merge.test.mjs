// Task 9 Step 3 — textbook-v2-merge.mjs on the fixture split into a JP part + a localised part with
// a synthetic journal: the merged unit == the fixture (compat fields = stripped new fields, written
// with validateV2's formulas) except est_minutes; dry-run never touches units/; --write needs the
// journal + both review PASSes and archives the v1 original once (never overwritten).
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { dataPaths, LANGS, partCounts, readJson } from "./lib/textbook-v2.mjs";
import { fixture, journalText, jpPartOf, locPartOf, run, tempRoot, UNIT, writeJson } from "./lib/textbook-v2-testkit.mjs";

/** Temp root with manifest + parts + journal. opts: { jpVerdict, locVerdict, mutateLoc, badCounts } */
function setup(opts = {}) {
  const root = tempRoot();
  assert.equal(run("textbook-v2-prep.mjs", ["--unit", UNIT, "--data-root", root]).code, 0);
  const P = dataPaths(root);
  const loc = locPartOf(fixture());
  const jp = jpPartOf(loc);
  opts.mutateLoc?.(loc);
  const jpFile = writeJson(path.join(P.parts(UNIT), `${UNIT}.jp.r0.json`), jp);
  const locFile = writeJson(path.join(P.parts(UNIT), `${UNIT}.loc.r0.json`), loc);
  const counts = partCounts(jp);
  const journal = path.join(root, "journal.jsonl");
  writeFileSync(
    journal,
    journalText([
      { unit_id: UNIT, stage: "jp", round: 0, part: jpFile, counts, validate_issues: 0 },
      { unit_id: UNIT, stage: "jp-review", round: 1, reviewed_round: 0, verdict: opts.jpVerdict ?? "PASS", issues: [] },
      { unit_id: UNIT, stage: "loc", round: 0, jp_round: 0, part: locFile, counts: opts.badCounts ? { ...counts, steps: 99 } : counts, validate_issues: 0, parity_diff: 0 },
      { unit_id: UNIT, stage: "loc-review", round: 1, reviewed_round: 0, verdict: opts.locVerdict ?? "PASS", issues: [] },
    ]),
  );
  return { root, P, journal };
}
const merge = (s, extra = []) => run("textbook-v2-merge.mjs", ["--unit", UNIT, "--data-root", s.root, ...extra]);

test("dry-run: merged unit == fixture except est_minutes; units/ untouched", () => {
  const s = setup();
  const before = readFileSync(s.P.unit(UNIT));
  const r = merge(s, ["--journal", s.journal]);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /dry-run: units\/ not touched/);
  assert.ok(before.equals(readFileSync(s.P.unit(UNIT))), "units/<id>.json unchanged");
  assert.ok(!existsSync(s.P.v1Original(UNIT)), "no archive in a dry-run");
  const merged = readJson(s.P.merged(UNIT));
  const want = fixture();
  assert.ok(Number.isInteger(merged.overview.est_minutes) && merged.overview.est_minutes >= 3);
  merged.overview.est_minutes = want.overview.est_minutes;
  assert.deepEqual(merged, want);
});

test("compat fields are the stripped new fields", () => {
  const s = setup();
  assert.equal(merge(s, ["--journal", s.journal]).code, 0);
  const u = readJson(s.P.merged(UNIT));
  const strip = (x) => x.replace(/\*\*|\[\[jp:|\]\]/g, "");
  for (const t of u.terms) {
    for (const l of LANGS) {
      assert.equal(t[`definition_${l}`], strip(t[`one_${l}`]));
      assert.equal(t[`explanation_${l}`], strip(t[`detail_${l}`]));
      assert.equal(t[`memory_hook_${l}`], t[`hook_${l}`] ? strip(t[`hook_${l}`]) : "");
      for (const k of [`definition_${l}`, `explanation_${l}`, `memory_hook_${l}`]) assert.doesNotMatch(t[k], /\*\*|\[\[/);
    }
    assert.deepEqual(t.inline_quiz, t.quiz);
    assert.equal(t.inline_fallback, false);
  }
  for (const l of LANGS) assert.deepEqual(u.summary[`key_points_${l}`], u[`key_points_${l}`].map(strip));
});

test("dry-run without --journal works from the newest parts, but --write refuses", () => {
  const s = setup();
  const r = merge(s);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /no --journal/);
  const w = merge(s, ["--write"]);
  assert.equal(w.code, 1, w.out);
  assert.match(w.out, /--write needs --journal/);
});

test("--write refuses without both review PASSes", () => {
  for (const o of [{ jpVerdict: "REVISE" }, { locVerdict: "REVISE" }]) {
    const s = setup(o);
    const before = readFileSync(s.P.unit(UNIT));
    const r = merge(s, ["--journal", s.journal, "--write"]);
    assert.equal(r.code, 1, r.out);
    assert.match(r.out, /not written/);
    assert.ok(before.equals(readFileSync(s.P.unit(UNIT))));
  }
});

test("a localised part that changed the Japanese, or a part that disagrees with its journal row, is refused", () => {
  const a = setup({ mutateLoc: (loc) => (loc.terms[0].one_jp += "追記") });
  const ra = merge(a, ["--journal", a.journal]);
  assert.equal(ra.code, 1, ra.out);
  assert.match(ra.out, /localised part ≠ JP part/);
  const b = setup({ badCounts: true });
  const rb = merge(b, ["--journal", b.journal]);
  assert.equal(rb.code, 1, rb.out);
  assert.match(rb.out, /≠ journal counts/);
});

test("--write: archives the v1 original once, writes the v2 unit; a re-merge keeps the archive", () => {
  const s = setup();
  const v1 = readFileSync(s.P.unit(UNIT), "utf-8");
  const r = merge(s, ["--journal", s.journal, "--write"]);
  assert.equal(r.code, 0, r.out);
  assert.equal(readFileSync(s.P.v1Original(UNIT), "utf-8"), v1);
  assert.equal(readJson(s.P.unit(UNIT)).schema_version, "textbook-unit-v2");
  assert.deepEqual(readJson(s.P.unit(UNIT)), readJson(s.P.merged(UNIT)));
  const again = merge(s, ["--journal", s.journal, "--write"]);
  assert.equal(again.code, 0, again.out);
  assert.equal(readFileSync(s.P.v1Original(UNIT), "utf-8"), v1, "archive still the v1 original");
  assert.equal(run("textbook-v2-validate.mjs", ["--unit", UNIT, "--data-root", s.root]).code, 0);
  assert.equal(run("textbook-v2-parity.mjs", ["--unit", UNIT, "--data-root", s.root]).code, 0);
});
