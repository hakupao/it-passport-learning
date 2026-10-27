// Task 9 Step 3 — textbook-v2-validate.mjs wraps validateV2 with the manifest's v1Terms + members:
// the fixture unit has 0 issues; breaks are reported with their codes and exit 1; JP-only parts are
// checked on the Japanese only; a localised part must be its JP part + zh / en; svg files must exist;
// a unit without goals / 総表 is rejected (UnitHeader would silently fall back to the v1 term list);
// the copy guard (S135 M3, D-198) flags past-question text reproduced in JP prose.
import assert from "node:assert/strict";
import path from "node:path";
import { test } from "node:test";

import { copyIssues, dataPaths, jpOnlyIssues, loadKit, readJson, sha256File } from "./lib/textbook-v2.mjs";
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

test("copy guard D-198 (ii): 12+ normalised consecutive characters of a stem / choice → copy issue; 11 is not", () => {
  const m = readJson(dataPaths(root).manifest(UNIT));
  const norm = (x) => x.replace(/[\s\p{P}\p{S}]/gu, "");
  // a stem / choice run of 14 normalised characters that contains no glossary term
  const terms = [...new Set([...m.terms, ...Object.values(m.questions).flatMap((q) => q.terms)])];
  const runs = [];
  for (const [id, q] of Object.entries(m.questions)) {
    for (const [kind, text] of [["stem", q.stem_jp.join("")], ...Object.values(q.choices_jp).map((c) => ["choice", c])]) {
      const n = norm(text);
      for (let i = 0; i + 14 <= n.length; i += 7) {
        const w = n.slice(i, i + 14);
        if (!terms.some((t) => w.includes(norm(t)) || norm(t).includes(w.slice(0, 4)))) runs.push([id, kind, w]);
      }
    }
  }
  const stemRun = runs.find(([, k]) => k === "stem")[2];
  const choiceRun = runs.find(([, k, w]) => k === "choice" && w.length === 14)?.[2] ?? runs[1][2];
  const cases = [
    ["key_points_jp[0]", (u, t) => (u.key_points_jp[0] = t), stemRun.slice(0, 12)],
    ["pairs[0].rows[0].a_jp", (u, t) => (u.pairs[0].rows[0].a_jp = t), choiceRun.slice(0, 12)],
  ];
  for (const [where, put, src] of cases) {
    const jp = jpPartOf(locPartOf(fixture()));
    // markup, spaces and punctuation inserted do not hide the copy
    put(jp, `ここで **${src.slice(0, 4)}** ${src.slice(4, 8)}、${src.slice(8)}。`);
    const r = validate(jp, "--part");
    assert.equal(r.code, 1, r.out);
    assert.match(r.out, new RegExp(`copy\\s+${reEsc(where)}\\s+12\\+ characters copied from the stem / choices of `), r.out);
  }
  // 11 characters is not a copy
  const jp = jpPartOf(locPartOf(fixture()));
  jp.key_points_jp[0] = `ここで${stemRun.slice(0, 11)}。`;
  assert.doesNotMatch(validate(jp, "--part").out, /copy\s/);
});

test("copy guard D-198 (i): any other question text still available (e.g. an explanation in an older manifest) needs 20+", async () => {
  const { stripInline } = await loadKit();
  const expl = "あいうえおかきくけこさしすせそたちつてとなにぬねの";
  const manifest = { unit_id: UNIT, terms: [], questions: { "2009h21a-q001": { topic_id: "x", terms: [], stem_jp: ["無関係"], choices_jp: {}, correct_answer: "ア", expl_correct_jp: [expl] } } };
  const at = (n) => copyIssues({ unit_id: UNIT, goals_jp: [`前置き${expl.slice(0, n)}後書き`] }, manifest, stripInline);
  assert.equal(at(19).length, 0);
  assert.equal(at(20).length, 1);
  assert.match(at(20)[0].message, /^20\+ characters copied from 2009h21a-q001/);
});

test("copy guard: a glossary term itself is not a copy (masked before matching)", async () => {
  const { stripInline } = await loadKit();
  const manifest = { unit_id: UNIT, terms: ["プロジェクトコミュニケーションマネジメント"], questions: { q: { topic_id: "x", terms: [], stem_jp: ["プロジェクトコミュニケーションマネジメントの説明として適切なものはどれか。"], choices_jp: {}, correct_answer: "ア" } } };
  assert.deepEqual(copyIssues({ unit_id: UNIT, goals_jp: ["**プロジェクトコミュニケーションマネジメント**の役割を言える。"] }, manifest, stripInline), []);
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
