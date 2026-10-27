// Task 9 Step 3 — textbook-v2-merge.mjs on the fixture split into a JP part + a localised part with
// a synthetic journal: the merged unit == the fixture (compat fields = stripped new fields, written
// with validateV2's formulas) except est_minutes; dry-run never touches units/; --write needs the
// journal + both review PASSes on the merged bytes (sha256), 0 issues (copy guard included), and
// archives the v1 original once (never overwritten).
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { dataPaths, LANGS, partCounts, readJson, sha256File } from "./lib/textbook-v2.mjs";
import { fixture, journalText, jpPartOf, locPartOf, run, tempRoot, UNIT, writeJson } from "./lib/textbook-v2-testkit.mjs";

const TAG = "t1";

/** The four journal rows of a run whose parts are on disk now. */
function rowsFor(jpFile, locFile, opts = {}) {
  const jpSha = sha256File(jpFile);
  const locSha = sha256File(locFile);
  const counts = partCounts(readJson(jpFile));
  return [
    { unit_id: UNIT, stage: "jp", round: 0, part: jpFile, sha256: jpSha, counts, validate_issues: 0 },
    { unit_id: UNIT, stage: "jp-review", round: 1, reviewed_round: 0, reviewed_sha256: jpSha, verdict: opts.jpVerdict ?? "PASS", issues: [] },
    { unit_id: UNIT, stage: "loc", round: 0, jp_round: 0, part: locFile, sha256: locSha, jp_sha256: jpSha, counts: opts.badCounts ? { ...counts, steps: 99 } : counts, validate_issues: 0, parity_diff: 0 },
    { unit_id: UNIT, stage: "loc-review", round: 1, reviewed_round: 0, reviewed_sha256: locSha, verdict: opts.locVerdict ?? "PASS", issues: [] },
  ];
}

/** Temp root with manifest + run-tagged parts + journal. opts: { jpVerdict, locVerdict, mutateLoc, badCounts, unit } */
function setup(opts = {}) {
  const root = tempRoot();
  assert.equal(run("textbook-v2-prep.mjs", ["--unit", UNIT, "--data-root", root]).code, 0);
  const P = dataPaths(root);
  const loc = locPartOf(opts.unit ?? fixture());
  const jp = jpPartOf(loc);
  opts.mutateLoc?.(loc);
  const jpFile = writeJson(path.join(P.parts(UNIT, TAG), `${UNIT}.jp.r0.json`), jp);
  const locFile = writeJson(path.join(P.parts(UNIT, TAG), `${UNIT}.loc.r0.json`), loc);
  const journal = path.join(root, "journal.jsonl");
  writeFileSync(journal, journalText(rowsFor(jpFile, locFile, opts)));
  return { root, P, journal, jpFile, locFile };
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
  merged.overview.est_minutes = want.overview.est_minutes;
  assert.deepEqual(merged, want);
});

test("est_minutes = max(3, ceil(JP chars of one+detail+analogy+hook+考点+易混 rows+key points+goals / 80))", () => {
  const s = setup();
  assert.equal(merge(s, ["--journal", s.journal]).code, 0);
  const u = fixture();
  const strip = (x) => x.replace(/\*\*|\[\[jp:|\]\]/g, "").replace(/\s/g, "");
  const texts = [
    ...u.goals_jp,
    ...u.key_points_jp,
    ...u.terms.flatMap((t) => [t.one_jp, t.detail_jp, t.analogy_jp, t.hook_jp ?? "", ...t.points.map((p) => p.text_jp)]),
    ...u.pairs.flatMap((p) => p.rows.flatMap((r) => [r.label_jp, r.a_jp, r.b_jp])),
  ];
  const n = texts.reduce((a, x) => a + strip(x).length, 0);
  assert.equal(readJson(s.P.merged(UNIT)).overview.est_minutes, Math.max(3, Math.ceil(n / 80)));
});

test("compat fields are the stripped new fields; analogy is stripped too", () => {
  const s = setup({ mutateLoc: (loc) => (loc.terms[1].analogy_zh = `**${loc.terms[1].analogy_zh}**`) });
  merge(s, ["--journal", s.journal]);
  const u = readJson(s.P.merged(UNIT));
  const strip = (x) => x.replace(/\*\*|\[\[jp:|\]\]/g, "");
  assert.doesNotMatch(u.terms[1].analogy_zh, /\*\*/);
  for (const t of u.terms) {
    for (const l of LANGS) {
      assert.equal(t[`definition_${l}`], strip(t[`one_${l}`]));
      assert.equal(t[`explanation_${l}`], strip(t[`detail_${l}`]));
      assert.equal(t[`memory_hook_${l}`], t[`hook_${l}`] ? strip(t[`hook_${l}`]) : "");
      for (const k of [`definition_${l}`, `explanation_${l}`, `memory_hook_${l}`, `analogy_${l}`]) assert.doesNotMatch(t[k], /\*\*|\[\[/);
    }
    assert.deepEqual(t.inline_quiz, t.quiz);
    assert.equal(t.inline_fallback, false);
  }
  for (const l of LANGS) assert.deepEqual(u.summary[`key_points_${l}`], u[`key_points_${l}`].map(strip));
});

test("dry-run without --journal works from the run's newest parts (--run-tag), but --write refuses", () => {
  const s = setup();
  assert.equal(merge(s).code, 1, "no journal and no run tag");
  const r = merge(s, ["--run-tag", TAG]);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /no --journal/);
  const w = merge(s, ["--run-tag", TAG, "--write"]);
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

test("tamper: same structure counts, different text after the review → sha256 mismatch, refused", () => {
  const s = setup();
  const loc = readJson(s.locFile);
  loc.terms[0].detail_en = loc.terms[0].detail_en.replace("risk", "danger");
  writeJson(s.locFile, loc);
  assert.deepEqual(partCounts(loc), partCounts(readJson(s.jpFile)));
  const r = merge(s, ["--journal", s.journal, "--write"]);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /sha256 .* ≠ journal/);
});

test("stale journal + new parts (a rerun into the same files) → refused", () => {
  const s = setup();
  const loc = readJson(s.locFile);
  const jp = readJson(s.jpFile);
  jp.terms[0].one_jp += "（改）";
  loc.terms[0].one_jp = jp.terms[0].one_jp;
  writeJson(s.jpFile, jp);
  writeJson(s.locFile, loc);
  const r = merge(s, ["--journal", s.journal]);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /journal is from another run|changed after/);
});

test("a localised part that changed the Japanese, or disagrees with its journal counts, is refused", () => {
  const a = setup({ mutateLoc: (loc) => (loc.terms[0].one_jp += "追記") });
  const ra = merge(a, ["--journal", a.journal]);
  assert.equal(ra.code, 1, ra.out);
  assert.match(ra.out, /localised part ≠ JP part/);
  const b = setup({ badCounts: true });
  const rb = merge(b, ["--journal", b.journal]);
  assert.equal(rb.code, 1, rb.out);
  assert.match(rb.out, /≠ journal counts/);
});

test("several --journal files (resume): rows merged, a later row replaces an earlier one", () => {
  const s = setup({ locVerdict: "REVISE" });
  const rows = rowsFor(s.jpFile, s.locFile);
  const j1 = path.join(s.root, "j1.jsonl");
  const j2 = path.join(s.root, "j2.jsonl");
  writeFileSync(j1, journalText([...rows.slice(0, 3), { ...rows[3], verdict: "REVISE" }]));
  writeFileSync(j2, journalText([rows[3]])); // the resumed run re-did the translation review: PASS
  assert.equal(merge(s, ["--journal", j1, "--write"]).code, 1);
  const r = merge(s, ["--journal", j1, "--journal", j2, "--write"]);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /reviews: jp PASS \/ loc PASS/);
});

test("copy guard: a stored JP sentence copied from a past question blocks --write", () => {
  const s0 = setup();
  const m = readJson(s0.P.manifest(UNIT));
  const stem = m.questions[m.term_questions["回避"][0]].stem_jp.join("");
  const u = fixture();
  u.terms[2].detail_jp = `${stem.slice(0, 30)}。${u.terms[2].detail_jp}`;
  u.terms[2].explanation_jp = u.terms[2].detail_jp;
  const s = setup({ unit: u });
  const r = merge(s, ["--journal", s.journal, "--write"]);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /copy\s+terms\[2\]\(回避\)\.detail_jp/);
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
  // units/ reverted to the v1 original (rollback) → a later --write works and keeps the archive
  writeFileSync(s.P.unit(UNIT), v1);
  const back = merge(s, ["--journal", s.journal, "--write"]);
  assert.equal(back.code, 0, back.out);
  assert.equal(readFileSync(s.P.v1Original(UNIT), "utf-8"), v1);
  assert.equal(readJson(s.P.unit(UNIT)).schema_version, "textbook-unit-v2");
});

test("stale manifest: units/ holds a v1 that differs from manifest.v1 → refused, nothing written", () => {
  const s = setup();
  const cur = readJson(s.P.unit(UNIT));
  cur.overview.est_minutes += 1;
  writeJson(s.P.unit(UNIT), cur);
  const before = readFileSync(s.P.unit(UNIT));
  const r = merge(s, ["--journal", s.journal, "--write"]);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /manifest is stale/);
  assert.ok(before.equals(readFileSync(s.P.unit(UNIT))));
  assert.ok(!existsSync(s.P.v1Original(UNIT)));
});
