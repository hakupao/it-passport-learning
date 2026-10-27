// Task 9 Step 3 — textbook-v2-validate.mjs wraps validateV2 with the manifest's v1Terms + members:
// the fixture unit has 0 issues; breaks are reported with their codes and exit 1; JP-only parts are
// checked on the Japanese only; a localised part must be its JP part + zh / en; svg files must exist;
// a unit without goals / 総表 is rejected (UnitHeader would silently fall back to the v1 term list).
import assert from "node:assert/strict";
import path from "node:path";
import { test } from "node:test";

import { dataPaths } from "./lib/textbook-v2.mjs";
import { fixture, jpPartOf, locPartOf, run, tempRoot, UNIT, writeJson } from "./lib/textbook-v2-testkit.mjs";

const root = tempRoot();
assert.equal(run("textbook-v2-prep.mjs", ["--unit", UNIT, "--data-root", root]).code, 0);
const dir = dataPaths(root).planning(UNIT);
let n = 0;
const validate = (doc, flag = "--file", extra = []) => run("textbook-v2-validate.mjs", [flag, writeJson(path.join(dir, `t${n++}.json`), doc), "--data-root", root, ...extra]);

test("the fixture unit: 0 issues, exit 0", () => {
  const r = validate(fixture());
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /0 issues/);
});

test("--unit reads units/<id>.json (v1 there → schema issue, exit 1)", () => {
  const r = run("textbook-v2-validate.mjs", ["--unit", UNIT, "--data-root", root]);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /schema\s+schema_version/);
});

test("a broken unit: issues printed with their codes, exit 1", () => {
  const u = fixture();
  u.terms[0].detail_jp = "一文だけ。";
  u.terms[0].explanation_jp = "一文だけ。";
  const r = validate(u);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /sentences\s+terms\[0\]/);
});

test("missing goals / overview_rows / overview_cols are rejected (no silent v1 header fallback)", () => {
  for (const keys of [["goals_jp", "goals_zh", "goals_en"], ["overview_rows"], ["overview_cols_jp", "overview_cols_zh", "overview_cols_en"]]) {
    const u = fixture();
    for (const k of keys) delete u[k];
    const r = validate(u);
    assert.equal(r.code, 1, `${keys[0]}: ${r.out}`);
  }
  const u = fixture();
  u.overview_rows = [];
  assert.match(validate(u).out, /overview\s+overview_rows/);
});

test("an svg fig must point at an existing file", () => {
  const u = fixture();
  const t = u.terms.find((x) => x.fig?.kind === "svg");
  t.fig.data.path = "figures/no-such-figure.svg";
  t.figure.svg_path = "figures/no-such-figure.svg";
  const r = validate(u);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /svg-file .*no-such-figure\.svg/);
});

test("--part on a JP-only part: 0 issues, a counts line, and a JP break is 1 issue", () => {
  const jp = jpPartOf(locPartOf(fixture()));
  const ok = validate(jp, "--part");
  assert.equal(ok.code, 0, ok.out);
  assert.match(ok.out, /^counts \{"terms":6,"figs":6,"steps":\d+,"points":6,"pairs":1,"key_points":4,"goals":3\}$/m);
  jp.terms[2].detail_jp = "一文だけ。";
  const bad = validate(jp, "--part");
  assert.equal(bad.code, 1, bad.out);
  assert.equal(bad.out.split("\n").filter((l) => /^ {2}\S/.test(l)).length, 1, bad.out);
  assert.match(bad.out, /sentences\s+terms\[2\]/);
});

test("--part on a localised part with --jp: 0 issues; touching the Japanese is a loc-structure issue", () => {
  const loc = locPartOf(fixture());
  const jpFile = writeJson(path.join(dir, "jp-part.json"), jpPartOf(loc));
  const ok = validate(loc, "--part", ["--jp", jpFile]);
  assert.equal(ok.code, 0, ok.out);
  loc.terms[1].one_jp = loc.terms[1].one_jp.replace("。", "！");
  const bad = validate(loc, "--part", ["--jp", jpFile]);
  assert.equal(bad.code, 1, bad.out);
  assert.match(bad.out, /loc-structure\s+part\.terms\[1\]\.one_jp/);
});

test("usage errors exit 2", () => {
  assert.equal(run("textbook-v2-validate.mjs", ["--data-root", root]).code, 2);
  assert.equal(run("textbook-v2-validate.mjs", ["--unit", UNIT, "--file", "x", "--data-root", root]).code, 2);
  assert.equal(run("textbook-v2-validate.mjs", ["--file", "/nope.json", "--data-root", root]).code, 2);
});
