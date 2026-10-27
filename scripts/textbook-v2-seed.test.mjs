// S135 u02 attempt 2 — textbook-v2-seed.mjs: the seed of a seeded run is a JP part plus the jp-review of
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
  assert.match(seed(loc, 2).out, /a seed is a "jp" part/);
});

test("usage errors exit 2", () => {
  assert.equal(run("textbook-v2-seed.mjs", ["--part", jp1, "--journal", journal]).code, 2);
  assert.equal(run("textbook-v2-seed.mjs", ["--part", "/nope.json", "--journal", journal, "--review-round", "2"]).code, 2);
  assert.equal(run("textbook-v2-seed.mjs", ["--part", jp1, "--journal", journal, "--review-round", "0"]).code, 2);
});
