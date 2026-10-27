// S135 u02 attempt 2 (+ batch B5 loc seed) — textbook-v2-seed.mjs: the seed of a seeded run is a JP (or loc) part plus the review of
// exactly those bytes (reviewed_sha256) from the earlier run's journal; anything else is refused.
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { sha256File } from "./lib/textbook-v2.mjs";
import { fixture, journalText, jpPartOf, locPartOf, run, writeJson } from "./lib/textbook-v2-testkit.mjs";

const dir = mkdtempSync(path.join(tmpdir(), "tbv2-seed-"));
const jp1 = writeJson(path.join(dir, "u.jp.r1.json"), { ...jpPartOf(locPartOf(fixture())), round: 1 });
const sha = sha256File(jp1);
const ISSUES = [{ severity: "medium", where: "terms[0].detail_jp", rule: "転載", detail_jp: "骨格が題文と同じ", fix_jp: "事実から書き直す" }];
const journal = path.join(dir, "journal.jsonl");
writeFileSync(
  journal,
  journalText([
    { unit_id: "management-10-27-u03", stage: "jp-review", round: 1, reviewed_round: 0, reviewed_sha256: "0".repeat(64), verdict: "REVISE", issues: [] },
    { unit_id: "management-10-27-u03", stage: "jp-review", round: 2, reviewed_round: 1, reviewed_sha256: sha, verdict: "REVISE", issues: ISSUES },
  ]),
);
const seed = (part, round) => run("textbook-v2-seed.mjs", ["--part", part, "--journal", journal, "--review-round", String(round)]);

test("the review of exactly the seed's bytes: sha + issues printed, exit 0", () => {
  const r = seed(jp1, 2);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, new RegExp(`^seed_sha256 ${sha}$`, "m"));
  assert.match(r.out, /^review jp-review#2 REVISE 1 issue\(s\)$/m);
  assert.deepEqual(JSON.parse(r.out.slice(r.out.indexOf("["))), ISSUES);
});

test("a review of other bytes / another round, a changed seed, a non-JP part → exit 1", () => {
  assert.equal(seed(jp1, 1).code, 1, "round 1 reviewed a different draft");
  const changed = writeJson(path.join(dir, "u.jp.r1b.json"), { ...jpPartOf(locPartOf(fixture())), round: 1, goals_jp: ["改"] });
  assert.match(seed(changed, 2).out, /no jp-review #2/);
  const loc = writeJson(path.join(dir, "u.loc.r0.json"), locPartOf(fixture()));
  assert.match(seed(loc, 2).out, /no loc-review #2/, "a jp-review does not seed a loc part");
  const other = writeJson(path.join(dir, "u.x.json"), { ...locPartOf(fixture()), stage: "x" });
  assert.match(seed(other, 2).out, /a seed is a "jp" or "loc" part/);
});

test("usage errors exit 2", () => {
  assert.equal(run("textbook-v2-seed.mjs", ["--part", jp1, "--journal", journal]).code, 2);
  assert.equal(run("textbook-v2-seed.mjs", ["--part", "/nope.json", "--journal", journal, "--review-round", "2"]).code, 2);
  assert.equal(run("textbook-v2-seed.mjs", ["--part", jp1, "--journal", journal, "--review-round", "0"]).code, 2);
});

test("loc seed (B5): a loc part + the loc-review of exactly its bytes; prints the JP part next to it, checked by sha256", () => {
  const d = mkdtempSync(path.join(tmpdir(), "tbv2-seedloc-"));
  const locDoc = { ...locPartOf(fixture()), round: 1, jp_round: 0 };
  const jp0 = writeJson(path.join(d, "management-10-27-u03.jp.r0.json"), jpPartOf(locPartOf(fixture())));
  const loc1 = writeJson(path.join(d, "management-10-27-u03.loc.r1.json"), locDoc);
  const lsha = sha256File(loc1);
  const j = path.join(d, "journal.jsonl");
  const rows = (jpSha) => [
    { unit_id: "management-10-27-u03", stage: "jp", round: 0, part: jp0, sha256: sha256File(jp0) },
    { unit_id: "management-10-27-u03", stage: "loc", round: 1, jp_round: 0, part: loc1, sha256: lsha, jp_sha256: jpSha },
    { unit_id: "management-10-27-u03", stage: "loc-review", round: 2, reviewed_round: 1, reviewed_sha256: lsha, verdict: "REVISE", issues: ISSUES },
  ];
  writeFileSync(j, journalText(rows(sha256File(jp0))));
  const r = run("textbook-v2-seed.mjs", ["--part", loc1, "--journal", j, "--review-round", "2"]);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, new RegExp(`^seed_sha256 ${lsha}$`, "m"));
  assert.match(r.out, new RegExp(`^jp_part ${jp0}$`, "m"));
  assert.match(r.out, new RegExp(`^jp_sha256 ${sha256File(jp0)}$`, "m"));
  assert.match(r.out, /^review loc-review#2 REVISE 1 issue\(s\)$/m);
  assert.deepEqual(JSON.parse(r.out.slice(r.out.indexOf("["))), ISSUES);
  // the JP part changed since the seed was localised from it → refused
  writeFileSync(j, journalText(rows("0".repeat(64))));
  const bad = run("textbook-v2-seed.mjs", ["--part", loc1, "--journal", j, "--review-round", "2"]);
  assert.equal(bad.code, 1, bad.out);
  assert.match(bad.out, /JP part/);
  // a jp-review does not seed a loc part
  assert.equal(run("textbook-v2-seed.mjs", ["--part", loc1, "--journal", journal, "--review-round", "2"]).code, 1);
});
