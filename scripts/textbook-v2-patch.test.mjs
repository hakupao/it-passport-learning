// Stage 7 Phase 3 batch B3 (D-201 §0-4) — wording patches replayed by merge on the in-memory
// localised part (before assemble / validate): register / list / retire; before hit → applied,
// only after hit → skipped, neither → refused; base_sha256 ≠ the final loc part → refused (retire);
// compat fields and est_minutes follow the patched text; the pilot units are a frozen baseline.
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { applyPatches, FROZEN_FILE, parseField, readFrozen } from "./textbook-v2-patch.mjs";
import { dataPaths, partCounts, readJson, REPO, sha256File } from "./lib/textbook-v2.mjs";
import { fixture, journalText, jpPartOf, locPartOf, run, tempRoot, UNIT, writeJson } from "./lib/textbook-v2-testkit.mjs";

const TAG = "t1";

/** Temp data root + batch dir with manifest, parts and a PASS journal for the fixture. */
function setup() {
  const root = tempRoot();
  assert.equal(run("textbook-v2-prep.mjs", ["--unit", UNIT, "--data-root", root]).code, 0);
  const P = dataPaths(root);
  const loc = locPartOf(fixture());
  const jpFile = writeJson(path.join(P.parts(UNIT, TAG), `${UNIT}.jp.r0.json`), jpPartOf(loc));
  const locFile = writeJson(path.join(P.parts(UNIT, TAG), `${UNIT}.loc.r0.json`), loc);
  const jpSha = sha256File(jpFile);
  const locSha = sha256File(locFile);
  const counts = partCounts(loc);
  const journal = path.join(root, "journal.jsonl");
  writeFileSync(
    journal,
    journalText([
      { unit_id: UNIT, stage: "jp", round: 0, part: jpFile, sha256: jpSha, counts, validate_issues: 0 },
      { unit_id: UNIT, stage: "jp-review", round: 1, reviewed_round: 0, reviewed_sha256: jpSha, verdict: "PASS", issues: [] },
      { unit_id: UNIT, stage: "loc", round: 0, jp_round: 0, part: locFile, sha256: locSha, jp_sha256: jpSha, counts, validate_issues: 0, parity_diff: 0 },
      { unit_id: UNIT, stage: "loc-review", round: 1, reviewed_round: 0, reviewed_sha256: locSha, verdict: "PASS", issues: [] },
    ]),
  );
  const batch = mkdtempSync(path.join(tmpdir(), "tbv2-batch-"));
  return { root, P, journal, locFile, locSha, batch };
}
const patch = (s, args) => run("textbook-v2-patch.mjs", ["--unit", UNIT, "--batch-dir", s.batch, ...args]);
const merge = (s, extra = []) => run("textbook-v2-merge.mjs", ["--unit", UNIT, "--data-root", s.root, "--journal", s.journal, "--batch-dir", s.batch, ...extra]);
const patchFile = (s) => path.join(s.batch, "patches", `${UNIT}.json`);
const reg = (s, field, before, after, part = s.locFile) => patch(s, ["--register", "--part", part, "--field", field, "--before", before, "--after", after, "--reason", "Rule A L1: wording"]);

test("parseField: dotted / indexed paths, a (term) check on terms[i]", () => {
  assert.deepEqual(parseField("terms[2](回避).detail_zh"), [{ key: "terms" }, { index: 2, term: "回避" }, { key: "detail_zh" }]);
  assert.deepEqual(parseField("goals_en[1]"), [{ key: "goals_en" }, { index: 1 }]);
  assert.deepEqual(parseField("terms[0].fig.data.nodes[1].label.zh"), [{ key: "terms" }, { index: 0 }, { key: "fig" }, { key: "data" }, { key: "nodes" }, { index: 1 }, { key: "label" }, { key: "zh" }]);
  assert.throws(() => parseField("terms[x]"), /field/);
  assert.throws(() => parseField(""), /field/);
});

test("applyPatches: before hit → applied; only after → skipped; neither → refused; retired ignored; ambiguous → refused", () => {
  const part = { unit_id: UNIT, terms: [{ term: "回避", detail_zh: "甲乙丙" }] };
  const base = "0".repeat(64);
  const p = (o) => ({ id: "p01", status: "active", base_sha256: base, field: "terms[0](回避).detail_zh", reason: "r", ...o });
  const a = applyPatches(structuredClone(part), [p({ before: "乙", after: "丁" })], base);
  assert.equal(a.part.terms[0].detail_zh, "甲丁丙");
  assert.deepEqual(a.results.map((r) => r.outcome), ["applied"]);
  const b = applyPatches(structuredClone(part), [p({ before: "戊", after: "乙" })], base);
  assert.deepEqual(b.results.map((r) => r.outcome), ["skipped"]);
  assert.equal(b.part.terms[0].detail_zh, "甲乙丙");
  assert.throws(() => applyPatches(structuredClone(part), [p({ before: "戊", after: "己" })], base), /neither/);
  assert.throws(() => applyPatches({ ...structuredClone(part), terms: [{ term: "回避", detail_zh: "乙乙" }] }, [p({ before: "乙", after: "丁" })], base), /2 times/);
  assert.throws(() => applyPatches(structuredClone(part), [p({ field: "terms[0](軽減).detail_zh", before: "乙", after: "丁" })], base), /軽減/);
  const r = applyPatches(structuredClone(part), [p({ status: "retired", before: "戊", after: "己" })], base);
  assert.deepEqual(r.results, []);
  assert.throws(() => applyPatches(structuredClone(part), [p({ before: "乙", after: "丁", base_sha256: "1".repeat(64) })], base), /retire/);
});

test("register / list / retire: the file records base_sha256 of the loc part, no question text fields", () => {
  const s = setup();
  const w = readJson(s.locFile).terms[2].detail_zh.slice(0, 3);
  const r = reg(s, "terms[2](回避).detail_zh", w, `${w}（改）`);
  assert.equal(r.code, 0, r.out);
  const f = readJson(patchFile(s));
  assert.equal(f.unit_id, UNIT);
  assert.equal(f.patches.length, 1);
  assert.deepEqual(Object.keys(f.patches[0]).sort(), ["after", "base_sha256", "before", "field", "id", "reason", "status"]);
  assert.equal(f.patches[0].base_sha256, s.locSha);
  assert.equal(f.patches[0].id, "p01");
  assert.match(patch(s, ["--list"]).out, /p01 active .*terms\[2\]\(回避\)\.detail_zh/);
  // registering text that is not in the field (after the earlier patches) is refused
  assert.equal(reg(s, "terms[2](回避).detail_zh", "不存在的文字", "x").code, 1);
  // retire
  const t = patch(s, ["--retire", "p01", "--reason", "loc part regenerated"]);
  assert.equal(t.code, 0, t.out);
  assert.equal(readJson(patchFile(s)).patches[0].status, "retired");
  assert.equal(readJson(patchFile(s)).patches[0].retired_reason, "loc part regenerated");
  assert.match(patch(s, ["--list"]).out, /p01 retired/);
});

test("merge replays patches on the loc part: compat fields and est_minutes follow, validate 0, --write ok", () => {
  const s = setup();
  const loc = readJson(s.locFile);
  const zhBefore = loc.terms[2].detail_zh;
  const word = zhBefore.slice(0, 2);
  assert.equal(reg(s, "terms[2](回避).detail_zh", word, `${word}（改）`).code, 0);
  // a JP wording patch with enough characters to move est_minutes by at least one minute
  const jp = loc.terms[0].detail_jp;
  const longer = "前もって手を打てる点がこの活動の価値であり、事前に準備するほど事後の混乱を小さく抑えられるうえ、関係者全員が同じ見通しを持って作業を進められるという利点も生まれます";
  assert.equal(reg(s, "terms[0].detail_jp", "起きる前に手を打てる点がこの活動の価値です", longer).code, 0);
  const plain = merge(s, ["--batch-dir", mkdtempSync(path.join(tmpdir(), "tbv2-empty-"))]);
  assert.equal(plain.code, 0, plain.out);
  const estPlain = readJson(s.P.merged(UNIT)).overview.est_minutes;
  const r = merge(s);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /patch p01 applied/);
  assert.match(r.out, /patch p02 applied/);
  const u = readJson(s.P.merged(UNIT));
  assert.equal(u.terms[2].detail_zh, zhBefore.replace(word, `${word}（改）`));
  assert.equal(u.terms[2].explanation_zh, u.terms[2].detail_zh.replace(/\*\*|\[\[jp:|\]\]/g, ""));
  assert.ok(u.terms[0].detail_jp.includes(longer));
  assert.ok(u.terms[0].explanation_jp.includes(longer));
  assert.ok(u.overview.est_minutes > estPlain, `${u.overview.est_minutes} > ${estPlain}`);
  // the part file itself is never rewritten
  assert.equal(sha256File(s.locFile), s.locSha);
  const w = merge(s, ["--write"]);
  assert.equal(w.code, 0, w.out);
  assert.equal(readJson(s.P.unit(UNIT)).terms[2].detail_zh, u.terms[2].detail_zh);
  // a re-merge of the patched unit: patches still apply to the (unchanged) loc part
  assert.equal(merge(s, ["--write"]).code, 0);
});

test("merge: after already in the part → skipped; neither → refused", () => {
  const s = setup();
  const loc = readJson(s.locFile);
  const w = loc.terms[1].detail_en.split(" ").slice(0, 3).join(" ");
  writeJson(patchFile(s), { unit_id: UNIT, patches: [{ id: "p01", status: "active", base_sha256: s.locSha, field: "terms[1].detail_en", before: "NOT THERE", after: w, reason: "r" }] });
  const r = merge(s);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /patch p01 skipped/);
  writeJson(patchFile(s), { unit_id: UNIT, patches: [{ id: "p01", status: "active", base_sha256: s.locSha, field: "terms[1].detail_en", before: "NOT THERE", after: "NOR THIS", reason: "r" }] });
  const n = merge(s);
  assert.equal(n.code, 1, n.out);
  assert.match(n.out, /p01.*neither/);
});

test("merge: a patch registered on another loc part (regenerated) → refused, asks to retire", () => {
  const s = setup();
  assert.equal(reg(s, "terms[2](回避).detail_zh", readJson(s.locFile).terms[2].detail_zh.slice(0, 2), "替换").code, 0);
  const f = readJson(patchFile(s));
  f.patches[0].base_sha256 = "f".repeat(64);
  writeJson(patchFile(s), f);
  const r = merge(s, ["--write"]);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /p01.*base_sha256 ffffffffffff.*retire/s);
  // once retired, the merge goes through
  assert.equal(patch(s, ["--retire", "p01", "--reason", "part regenerated"]).code, 0);
  assert.equal(merge(s, ["--write"]).code, 0);
});

test("frozen baseline: the pilot units are listed; merge --write refuses them, a dry-run still works", () => {
  const frozen = readFrozen(path.dirname(FROZEN_FILE));
  assert.deepEqual(Object.keys(frozen).sort(), ["management-10-27-u01", "management-10-27-u02", "management-10-27-u03"]);
  const s = setup();
  // the real batch dir (default): UNIT = management-10-27-u03 is frozen
  const real = run("textbook-v2-merge.mjs", ["--unit", UNIT, "--data-root", s.root, "--journal", s.journal, "--write"]);
  assert.equal(real.code, 1, real.out);
  assert.match(real.out, /frozen baseline/);
  assert.equal(readJson(s.P.unit(UNIT)).schema_version, "stage4-unit-v1-trilingual", "units/ untouched");
  const dry = run("textbook-v2-merge.mjs", ["--unit", UNIT, "--data-root", s.root, "--journal", s.journal]);
  assert.equal(dry.code, 0, dry.out);
});

test("merge.mjs no longer carries the lowfix re-apply NOTE", () => {
  const src = readFileSync(path.join(REPO, "scripts/textbook-v2-merge.mjs"), "utf-8");
  assert.doesNotMatch(src, /reapply them|must reapply/);
  assert.ok(existsSync(FROZEN_FILE));
});
