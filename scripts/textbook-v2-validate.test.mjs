// Task 9 Step 3 — textbook-v2-validate.mjs wraps validateV2 with the manifest's v1Terms + members:
// the fixture unit has 0 issues; breaks are reported with their codes and exit 1; JP-only parts are
// checked on the Japanese only; a localised part must be its JP part + zh / en; svg files must exist;
// a unit without goals / 総表 is rejected (UnitHeader would silently fall back to the v1 term list);
// the copy guard (S135 M3) flags past-question text reproduced in JP prose.
import assert from "node:assert/strict";
import path from "node:path";
import { test } from "node:test";

import { dataPaths, jpOnlyIssues, readJson, sha256File } from "./lib/textbook-v2.mjs";
import { fixture, jpPartOf, locPartOf, run, tempRoot, UNIT, writeJson } from "./lib/textbook-v2-testkit.mjs";

const root = tempRoot();
assert.equal(run("textbook-v2-prep.mjs", ["--unit", UNIT, "--data-root", root]).code, 0);
const dir = dataPaths(root).planning(UNIT);
let n = 0;
/** Write `doc` to a fresh file and validate it; { code, out, file }. */
const validate = (doc, flag = "--file", extra = []) => {
  const file = writeJson(path.join(dir, `t${n++}.json`), doc);
  return { ...run("textbook-v2-validate.mjs", [flag, file, "--data-root", root, ...extra]), file };
};
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

test("--part on a JP-only part: 0 issues, counts + sha256 lines, and a JP break is 1 issue", () => {
  const jp = jpPartOf(locPartOf(fixture()));
  const ok = validate(jp, "--part");
  assert.equal(ok.code, 0, ok.out);
  assert.match(ok.out, /^counts \{"terms":6,"figs":6,"steps":\d+,"points":6,"pairs":1,"key_points":4,"goals":3\}$/m);
  assert.match(ok.out, new RegExp(`^sha256 ${sha256File(ok.file)}$`, "m"));
  jp.terms[2].detail_jp = "一文だけ。";
  const bad = validate(jp, "--part");
  assert.equal(bad.code, 1, bad.out);
  assert.equal(bad.out.split("\n").filter((l) => /^ {2}\S/.test(l)).length, 1, bad.out);
  assert.match(bad.out, /sentences\s+terms\[2\]/);
});

test("--part on a localised part with --jp: 0 issues + jp_sha256; touching the Japanese is a loc-structure issue", () => {
  const loc = locPartOf(fixture());
  const jpFile = writeJson(path.join(dir, "jp-part.json"), jpPartOf(loc));
  const ok = validate(loc, "--part", ["--jp", jpFile]);
  assert.equal(ok.code, 0, ok.out);
  assert.match(ok.out, new RegExp(`^jp_sha256 ${sha256File(jpFile)}$`, "m"));
  loc.terms[1].one_jp = loc.terms[1].one_jp.replace("。", "！");
  const bad = validate(loc, "--part", ["--jp", jpFile]);
  assert.equal(bad.code, 1, bad.out);
  assert.match(bad.out, /loc-structure\s+part\.terms\[1\]\.one_jp/);
});

test("copy guard: 20+ normalised characters of a question stem / choice / explanation in JP prose → copy issue", () => {
  const m = readJson(dataPaths(root).manifest(UNIT));
  const q = m.questions[m.term_questions["転嫁"][0]];
  const norm = (s) => s.replace(/[\s\p{P}\p{S}]/gu, "");
  const stem = norm(q.stem_jp.join(""));
  const expl = norm(q.expl_correct_jp.join(""));
  const choice = norm(Object.values(q.choices_jp).sort((a, b) => b.length - a.length)[0]);
  const cases = [
    ["key_points_jp[0]", (u, t) => (u.key_points_jp[0] = t), stem],
    ["goals_jp[1]", (u, t) => (u.goals_jp[1] = t), expl],
    ["pairs[0].rows[0].a_jp", (u, t) => (u.pairs[0].rows[0].a_jp = t), choice.length >= 22 ? choice : expl.slice(30)],
  ];
  for (const [where, put, src0] of cases) {
    const src = src0.slice(0, 22);
    assert.equal(src.length, 22, where);
    const jp = jpPartOf(locPartOf(fixture()));
    // markup, spaces and punctuation inserted do not hide the copy
    put(jp, `**${src.slice(0, 6)}** ${src.slice(6, 12)}、${src.slice(12)}。`);
    const r = validate(jp, "--part");
    assert.equal(r.code, 1, r.out);
    assert.match(r.out, new RegExp(`copy\\s+${reEsc(where)}\\s+20\\+ characters copied from `), r.out);
  }
  // 19 characters is not a copy
  const jp = jpPartOf(locPartOf(fixture()));
  jp.key_points_jp[0] = `${expl.slice(0, 19)}。`;
  assert.doesNotMatch(validate(jp, "--part").out, /copy\s/);
});

test("jpOnlyIssues: drops issues that only concern zh / en, keeps jp and language-neutral ones", () => {
  const i = (code, field, message = "x") => ({ unitId: UNIT, code, field, message });
  const keep = [
    i("markup", "unit.goals_jp[0]"),
    i("overview", "overview_rows[0].extra"),
    i("fig", "terms[1](x).fig", "data.root.label: needs jp / zh / en plain text"),
    i("missing", "terms[0](x).detail_jp"),
    i("sentences", "terms[0](x).detail", "jp=4, en=1 (D-195 §1)"),
    i("markup", "terms[0](x).detail_zhx"),
  ];
  const drop = [
    i("markup", "terms[0](x).one_zh"),
    i("missing", "overview_rows[2].extra_zh[1]"),
    i("markup", "unit.goals_en[0]"),
    i("fig", "terms[1](x).fig.data.a.zh"),
    i("fig", "terms[1](x).fig.data.a.en"),
    i("sentences", "terms[0](x).detail", "en=1 (D-195 §1)"),
  ];
  assert.deepEqual(jpOnlyIssues([...keep, ...drop]), keep);
});

test("usage errors exit 2", () => {
  assert.equal(run("textbook-v2-validate.mjs", ["--data-root", root]).code, 2);
  assert.equal(run("textbook-v2-validate.mjs", ["--unit", UNIT, "--file", "x", "--data-root", root]).code, 2);
  assert.equal(run("textbook-v2-validate.mjs", ["--file", "/nope.json", "--data-root", root]).code, 2);
});
