// Task 9 Step 3 — textbook-v2-validate.mjs wraps validateV2 with the manifest's v1Terms + members:
// the fixture unit has 0 issues; breaks are reported with their codes and exit 1; JP-only parts are
// checked on the Japanese only; a localised part must be its JP part + zh / en; svg files must exist;
// a unit without goals / 総表 is rejected (UnitHeader would silently fall back to the v1 term list);
// the copy guard (S135 M3, D-198) flags past-question text reproduced in JP prose.
import assert from "node:assert/strict";
import path from "node:path";
import { test } from "node:test";

import { copyIssues, dataPaths, normCopy, estMinutes, jpOnlyIssues, loadKit, readJson, sha256File } from "./lib/textbook-v2.mjs";
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
        // no glossary term and no katakana / alphanumerics (masked as term-like, D-198 clarification)
        if (/[\u30A0-\u30FF\uFF66-\uFF9FA-Za-z0-9\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A]/.test(w)) continue;
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

test("D-198 masking: katakana runs of 4+ and alphanumeric tokens are terms, not expression", async () => {
  const { stripInline } = await loadKit();
  const q = (stem, choices = {}) => ({ unit_id: UNIT, terms: [], questions: { "2012h24a-q049": { topic_id: "x", terms: [], stem_jp: [stem], choices_jp: choices, correct_answer: "ア" } } });
  const hits = (m, text) => copyIssues({ unit_id: UNIT, goals_jp: [text] }, m, stripInline);
  // s135u02b-type hits: a term name + a particle / a short verb no longer counts
  assert.deepEqual(hits(q("クリティカルパスを見つけるための手法として，適切なものはどれか。"), "**クリティカルパス**を見つけると工期の短縮先が分かる。"), []);
  assert.deepEqual(hits(q("変更の管理はプロジェクト統合マネジメントの活動である。"), "変更の扱いはプロジェクト統合マネジメントで決める。"), []);
  assert.deepEqual(hits(q("ＷＢＳを作成する目的はどれか。", { ア: "PERT図で日程を計算する" }), "ＷＢＳを作成する前に PERT 図で日程を見る。"), []);
  assert.deepEqual(hits(q("ｸﾘﾃｨｶﾙﾊﾟｽを見つける手法"), "クリティカル・パスを見つける手法"), []);
  // genuine prose overlaps still fire, also across a short (< 4) katakana word
  assert.equal(hits(q("作業の前後関係と所要日数から全体の日程を求める図はどれか。"), "まず前後関係と所要日数から全体の日程を出す。").length, 1);
  assert.equal(hits(q("大きな作業をバラして細かい単位へ順に分けていく。"), "作業をバラして細かい単位へ順に並べる。").length, 1);
});

test("OQ-16: masked terms / katakana runs keep a run continuous (one placeholder per distinct token), so a katakana-heavy near-copy is caught", async () => {
  const { stripInline } = await loadKit();
  // own fixture modelled on the b02 u08 a1 miss: a headword (パスワード) and a non-headword katakana run (ヘルプデスク) inside the copied sentence
  const m = { unit_id: UNIT, terms: ["パスワード"], questions: { "2001h13a-q001": { topic_id: "x", terms: [], stem_jp: ["次のうち適切なものはどれか。"], choices_jp: { ア: "利用者のパスワードはヘルプデスク担当者にも口外しない。" }, correct_answer: "ア" } } };
  const hits = (text) => copyIssues({ unit_id: UNIT, goals_jp: [text] }, m, stripInline);
  // P は H 担当者にも口外しない = 13 (each masked token counts as 1) → copy; before OQ-16 the longest run was 担当者にも口外しない = 10
  const hit = hits("利用者パスワードはヘルプデスク担当者にも口外しない。");
  assert.equal(hit.length, 1);
  assert.match(hit[0].message, /^12\+ characters copied from the stem \/ choices of 2001h13a-q001: 「パスワードはヘルプデスク担当者にも口外しな…」/, "the excerpt shows the tokens, not placeholders");
  // 11 (P は H 担当者にも口外し) is not a copy
  assert.deepEqual(hits("利用者パスワードはヘルプデスク担当者にも口外せず。"), []);
  // different katakana words in the same slots do not match each other (per-token placeholders, not one shared mark)
  assert.deepEqual(hits("利用者のトークンはサービスデスク担当者にも口外しない。"), []);
  // half-width / full-width forms of the same token are the same token
  assert.equal(hits("利用者ﾊﾟｽﾜｰﾄﾞはﾍﾙﾌﾟﾃﾞｽｸ担当者にも口外しない。").length, 1);
});

test("OQ-16 Rule D: a run made mostly of masked tokens is not a copy; a masked kanji headword keeps the run; NFKC before stripping", async () => {
  const { stripInline } = await loadKit();
  const m = { unit_id: UNIT, terms: ["生体認証"], questions: { "2001h13a-q002": { topic_id: "x", terms: [], stem_jp: ["次のうち適切なものはどれか。"], choices_jp: { ア: "WBSとPERTとCPMとEVMをESとLFで管理する。", イ: "入室時に生体認証で本人を確かめてから扉を開ける。" }, correct_answer: "イ" } } };
  const hits = (text) => copyIssues({ unit_id: UNIT, goals_jp: [text] }, m, stripInline);
  // the same list of terms in the same order: 6 real characters (とととをとで) in the 12 → not a copy
  assert.deepEqual(hits("WBSとPERTとCPMとEVMをESとLFで扱う。"), []);
  // a kanji headword (term list, not TERMLIKE) is one placeholder inside a copied run: 入室時に G で本人を確かめてから = 14 → copy
  assert.equal(hits("入室時に生体認証で本人を確かめてから入る。").length, 1);
  // the headword alone is not a copy
  assert.deepEqual(hits("生体認証を使う。"), []);
  // NFKC first: a symbol produced by NFKC (㈱ → (株)) is stripped like any other
  assert.equal(normCopy("㈱生体", stripInline), "株生体");
});

test("copy guard B7: figure labels, step captions, 総表 extra cells and 易混 rows are checked too; est_minutes ignores figure text", async () => {
  const { stripInline } = await loadKit();
  const stem = "作業の前後関係と所要日数から全体の日程を求める図はどれか。";
  const manifest = { unit_id: UNIT, terms: [], questions: { "2012h24a-q049": { topic_id: "x", terms: [], stem_jp: [stem], choices_jp: {}, correct_answer: "ア" } } };
  const copied = "前後関係と所要日数から全体の日程"; // 16 normalised characters of the stem
  const fields = (p) => copyIssues(p, manifest, stripInline).map((i) => i.field);
  const base = () => jpPartOf(locPartOf(fixture()));
  assert.deepEqual(fields(base()), [], "the fixture itself has no copy");
  const tree = (p) => p.terms.findIndex((t) => t.fig?.kind === "tree");
  const table = (p) => p.terms.findIndex((t) => t.fig?.kind === "table");
  const cases = [
    [(p) => (p.terms[tree(p)].fig.data.root.label.jp = copied), (p) => `terms[${tree(p)}](${p.terms[tree(p)].term}).fig.data.root.label.jp`],
    [(p) => (p.terms[tree(p)].fig.steps[1].caption_jp = `まず${copied}を出す。`), (p) => `terms[${tree(p)}](${p.terms[tree(p)].term}).fig.steps[1].caption_jp`],
    [(p) => (p.terms[table(p)].fig.data.rows[0].cells[1].jp = copied), (p) => `terms[${table(p)}](${p.terms[table(p)].term}).fig.data.rows[0].cells[1].jp`],
    [(p) => (p.overview_rows[1].extra_jp[0] = copied), () => "overview_rows[1].extra_jp[0]"],
    [(p) => (p.pairs[0].rows[1].label_jp = copied), () => "pairs[0].rows[1].label_jp"],
    [(p) => (p.pairs[0].rows[0].b_jp = copied), () => "pairs[0].rows[0].b_jp"],
  ];
  for (const [put, where] of cases) {
    const p = base();
    put(p);
    assert.deepEqual(fields(p), [where(p)]);
  }
  // figure text is not reading prose: est_minutes does not count it
  const p = base();
  const before = estMinutes(p, stripInline);
  p.terms[tree(p)].fig.steps[1].caption_jp = "長".repeat(400);
  assert.equal(estMinutes(p, stripInline), before);
});

test("framing (batch 1 lesson) on a JP-only part: 3 jp exam-framing sentences → `framing points_jp`; zh / en issues dropped", () => {
  const jp = jpPartOf(locPartOf(fixture()));
  // the fixture already has one (転嫁: 「代表例として出題される」)
  jp.terms[0].points[0].text_jp = "以前の案件の一覧は、洗い出しの方法として問われる。";
  jp.terms[1].points[0].text_jp = "優先順位の決め方が適切とされる。";
  const r = validate(jp, "--part");
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /framing\s+points_jp\s+3 exam-framing/);
  assert.doesNotMatch(r.out, /points_(zh|en)/);
  // jpOnlyIssues itself
  const i = (field) => ({ unitId: UNIT, code: "framing", field, message: "x" });
  assert.deepEqual(jpOnlyIssues([i("points_jp"), i("points_zh"), i("points_en")]), [i("points_jp")]);
});

test("jp-origin (D-202): a loc part / unit whose one_zh drops [[jp:<headword>]] → issue, exit 1; a JP-only part never has it", () => {
  const loc = locPartOf(fixture());
  const t = loc.terms[2]; // 回避
  t.one_zh = t.one_zh.replace("[[jp:回避]]", "回避");
  const r = validate(loc, "--part");
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, new RegExp(`jp-origin\\s+${reEsc("terms[2](回避).one_zh")}\\s+no \\[\\[jp:回避\\]\\]`));
  assert.doesNotMatch(r.out, /one_en/);
  // the JP part of the fixture: zh / en mirrored from jp (no [[jp:]] at all) → no jp-origin issue, no warn
  const jp = validate(jpPartOf(locPartOf(fixture())), "--part");
  assert.equal(jp.code, 0, jp.out);
  assert.doesNotMatch(jp.out, /jp-origin/);
});

test("warn jp-origin (D-202): another headword in a 考点 without [[jp:]] in zh / en prints warn lines, exit unaffected", () => {
  // the fixture: 回避's mix point names 軽減 (jp) but its zh / en have no [[jp:軽減]]
  const r = validate(fixture());
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /0 issues .*2 warning\(s\)/);
  assert.match(r.out, new RegExp(`warn  jp-origin  ${reEsc("terms[2](回避).points[0].text_zh")}  軽減`));
  assert.match(r.out, new RegExp(`warn  jp-origin  ${reEsc("terms[2](回避).points[0].text_en")}  軽減`));
  const u = fixture();
  const p = u.terms[2].points[0];
  p.text_zh = p.text_zh.replace("减轻", "减轻（[[jp:軽減]]）");
  p.text_en = p.text_en.replace("Mitigation", "Mitigation ([[jp:軽減]])");
  const ok = validate(u);
  assert.equal(ok.code, 0, ok.out);
  assert.doesNotMatch(ok.out, /warn/);
});
