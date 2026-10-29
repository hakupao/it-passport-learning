// Stage 7 Phase 3 batch B6 (D-201 plan Task B6) — the zh term table: v1 term_zh conflicts over the corpus,
// the seeded data/ip/textbook/zh_terms.json, and the non-blocking WARN check (jp text names a table term →
// the zh text of the same field carries its mapped zh), in validate and over the committed v2 units.
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { dataPaths, readJson, zhTermWarnings } from "./lib/textbook-v2.mjs";
import { fixture, run, tempRoot, writeJson } from "./lib/textbook-v2-testkit.mjs";
import { OVERRIDES, PILOT_WORDS, probeV1, seedTable, termZhConflicts } from "./textbook-v2-zh-terms.mjs";

const P = dataPaths();
const units = () => readJson(P.index).topics.flatMap((t) => t.units.map((u) => readJson(P.unit(u.unit_id))));

test("conflicts: exactly MBO / E-R図 / デュアルシステム / デュプレックスシステム, recomputed from the unit files", () => {
  const c = termZhConflicts(units());
  assert.deepEqual(Object.keys(c).sort(), ["E-R図", "MBO", "デュアルシステム", "デュプレックスシステム"].sort());
  assert.deepEqual(c["MBO"].map((x) => x.unit_id), ["strategy-01-01-u06", "strategy-03-09-u04"]);
  // the swap (OQ-15): each system has both translations, crosswise in the two units
  const z = (t, u) => c[t].find((x) => x.unit_id === u).term_zh;
  assert.equal(z("デュアルシステム", "technology-16-43-u02"), z("デュプレックスシステム", "technology-16-44-u03"));
  assert.equal(z("デュプレックスシステム", "technology-16-43-u02"), z("デュアルシステム", "technology-16-44-u03"));
});

test("seed: conflict-free v1 term_zh + per-unit MBO + unified E-R図 + pilot words; the swapped pair excluded (OQ-15); deterministic", () => {
  const all = units();
  const t = seedTable(all);
  const headwords = new Map();
  for (const u of all) for (const x of u.terms) headwords.set(x.term, x.term_zh);
  // every conflict-free headword with its v1 term_zh
  for (const [jp, zh] of headwords) {
    if (["E-R図", "MBO", "デュアルシステム", "デュプレックスシステム"].includes(jp) || jp in OVERRIDES) continue;
    assert.equal(t.terms[jp], zh, jp);
  }
  assert.equal(t.terms["E-R図"], "E-R图");
  assert.deepEqual(t.per_unit["MBO"], { "strategy-01-01-u06": "MBO(目标管理)", "strategy-03-09-u04": "管理层收购（MBO）" });
  for (const jp of ["MBO", "デュアルシステム", "デュプレックスシステム"]) assert.equal(t.terms[jp], undefined, jp);
  for (const jp of ["デュアルシステム", "デュプレックスシステム"]) assert.match(t.excluded[jp], /OQ-15/);
  // pilot words: added where they are not headwords; a headword keeps its v1 term_zh
  assert.equal(t.terms["変更管理"], "变更管理");
  for (const [jp, zh] of Object.entries(PILOT_WORDS.global)) if (!headwords.has(jp)) assert.equal(t.terms[jp], zh, jp);
  for (const [jp, byUnit] of Object.entries(PILOT_WORDS.per_unit)) assert.deepEqual(t.per_unit[jp], byUnit, jp);
  assert.deepEqual(Object.keys(t.terms), Object.keys(t.terms).sort(), "sorted keys");
  assert.equal(JSON.stringify(seedTable(units())), JSON.stringify(t));
});

test("the committed data/ip/textbook/zh_terms.json is the seed (until edited by hand); --seed never overwrites a different table", () => {
  assert.deepEqual(readJson(P.zhTerms), seedTable(units()));
  const dir = mkdtempSync(path.join(tmpdir(), "tbv2-zh-"));
  const out = path.join(dir, "zh_terms.json");
  assert.equal(run("textbook-v2-zh-terms.mjs", ["--seed", "--out", out]).code, 0);
  const a = readFileSync(out, "utf-8");
  assert.equal(run("textbook-v2-zh-terms.mjs", ["--seed", "--out", out]).code, 0, "identical: ok");
  writeFileSync(out, a.replace("变更管理", "变更控制"));
  const r = run("textbook-v2-zh-terms.mjs", ["--seed", "--out", out]);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /hand-maintained/);
});

test("--conflicts prints the four conflicts as a markdown table", () => {
  const r = run("textbook-v2-zh-terms.mjs", ["--conflicts"]);
  assert.equal(r.code, 0, r.out);
  for (const jp of ["MBO", "E-R図", "デュアルシステム", "デュプレックスシステム"]) assert.match(r.out, new RegExp(`^\\| ${jp} \\|`, "m"));
  assert.match(r.out, /OQ-15/);
});

const TABLE = {
  terms: { 変更管理: "变更管理", "E-R図": "E-R图", リスク: "风险", プロジェクトリスクマネジメント: "项目风险管理", 結合点: "节点（结合点）" },
  per_unit: { MBO: { "x-01-01-u01": "MBO(目标管理)" } },
  excluded: { デュアルシステム: "OQ-15" },
};

test("zhTermWarnings: a table term in jp needs its zh in the same field's zh (whitespace / markup ignored, longest term first)", () => {
  const u = {
    unit_id: "x-01-01-u01",
    goals_jp: ["**変更管理**の手順を言える。", "E-R図を読める。"],
    goals_zh: ["能说出变更控制的步骤。", "能读懂 E-R 图。"],
    terms: [
      { term: "a", one_jp: "プロジェクトリスクマネジメントを行う。", one_zh: "开展**项目风险管理**（[[jp:プロジェクトリスクマネジメント]]）。", detail_jp: "MBO とデュアルシステム。", detail_zh: "目标管理与双重系统。" },
      { term: "b", fig: { data: { root: { label: { jp: "結合点", zh: "节点", en: "Node" } } } } },
    ],
  };
  const w = zhTermWarnings(u, TABLE);
  assert.deepEqual(
    w.map((x) => [x.field, x.term]),
    [["goals_zh[0]", "変更管理"]],
    JSON.stringify(w),
  );
  assert.equal(w[0].code, "zh-term");
  assert.match(w[0].message, /変更管理 → 变更管理/);
  // the (…) of a table value are alternatives; a per-unit entry only for its unit
  assert.deepEqual(zhTermWarnings({ ...u, unit_id: "y-01-01-u01" }, TABLE).map((x) => x.term), ["変更管理"]);
  const v = structuredClone(u);
  v.terms[0].detail_zh = "这一单元不提。";
  assert.deepEqual(zhTermWarnings(v, TABLE).map((x) => x.term), ["変更管理", "MBO"]);
  assert.deepEqual(zhTermWarnings(u, { terms: {} }), []);
});

test("validate prints zh-term WARN lines, not issues: exit 0, and merge / --write are not blocked", () => {
  const root = tempRoot();
  assert.equal(run("textbook-v2-prep.mjs", ["--unit", "management-10-27-u03", "--data-root", root]).code, 0);
  const u = fixture();
  writeJson(path.join(root, "textbook/zh_terms.json"), { terms: { [u.terms[2].term]: "完全不同的译名" }, per_unit: {}, excluded: {} });
  const r = run("textbook-v2-validate.mjs", ["--file", writeJson(path.join(root, "u.json"), u), "--data-root", root]);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /0 issues/);
  assert.match(r.out, /^\s*warn\s+zh-term\s+\S+\s+回避 → 完全不同的译名/m);
});

test("--check-units: every committed v2 unit (or --unit …) checked, warnings listed per unit", () => {
  const r = run("textbook-v2-zh-terms.mjs", ["--check-units"]);
  assert.ok(r.code === 0 || r.code === 1, r.out);
  for (const id of ["management-10-27-u01", "management-10-27-u02", "management-10-27-u03"]) assert.match(r.out, new RegExp(id));
  assert.doesNotMatch(r.out, /strategy-01-01-u01/, "v1 units are not checked");
  const one = run("textbook-v2-zh-terms.mjs", ["--check-units", "--unit", "management-10-27-u02"]);
  assert.doesNotMatch(one.out, /management-10-27-u01/);
  assert.equal(run("textbook-v2-zh-terms.mjs", ["--check-units", "--unit", "strategy-01-01-u01"]).code, 2, "a v1 unit is a usage error");
});

// ---- B6 review (F1 / F2 / F3 / F5) --------------------------------------------------------------

const probe = (jp, zh, terms, extra = {}) => zhTermWarnings({ unit_id: "x-01-01-u01", terms: [{ term: "h", one_jp: jp, one_zh: zh }], ...extra }, { terms, per_unit: {}, excluded: {} }).map((w) => w.term);

test("F1: a Latin entry needs a non-alphanumeric on both sides", () => {
  const T = { AP: "接入点", AND: "与", CA: "认证机构", CD: "光盘", ROM: "只读存储器", CASE: "计算机辅助软件工程" };
  assert.deepEqual(probe("GAP分析を行う。", "进行差距分析。", T), []);
  assert.deepEqual(probe("BRANDを守る。", "保护品牌。", T), []);
  assert.deepEqual(probe("SCANする。", "扫描。", T), []);
  assert.deepEqual(probe("CDROMを読む。", "读取光驱。", T), []);
  assert.deepEqual(probe("CASEツールを使う。", "使用工具。", T), ["CASE"]);
  assert.deepEqual(probe("CD と ROM。", "两种介质。", T), ["CD", "ROM"]);
  // an acronym kept as-is in the zh text is accepted
  assert.deepEqual(probe("OSを入れる。", "安装OS。", { OS: "操作系统" }), []);
});

test("F5: ・ is not part of a katakana run (a term next to ・ still matches)", () => {
  assert.deepEqual(probe("リスク・コスト・品質", "成本与质量", { リスク: "风险" }), ["リスク"]);
});

test("F2: kanji entries under 3 characters are checked only in a unit whose own headwords include them", () => {
  const T = { 項目: "数据项", 手続: "过程", 変更管理: "变更管理", パスワード: "口令（密码）" };
  assert.deepEqual(probe("この項目と手続を見る。", "看这一条和流程。", T), [], "polysemous short kanji: not global");
  assert.deepEqual(zhTermWarnings({ unit_id: "x-01-01-u01", terms: [{ term: "項目", one_jp: "項目を定義する。", one_zh: "定义条目。" }] }, { terms: T }).map((w) => w.term), ["項目"], "the unit's own headword");
  assert.deepEqual(probe("変更管理を行う。", "进行变更控制。", T), ["変更管理"], "≥ 3 characters: global");
  assert.deepEqual(probe("パスワードを変える。", "修改密码。", T), [], "both 口令 and 密码 accepted");
});

test("F2 seed decision: パスワード → 口令（密码） (v1 body text uses 密码 42× / 口令 13×; headword term_zh stays 口令)", () => {
  const t = seedTable(units());
  assert.equal(t.terms["パスワード"], "口令（密码）");
  assert.equal(t.terms["最適化"], "最优化（优化）");
  assert.equal(t.terms["アンケート"], "问卷调查（问卷）");
});

test("S137 u10 O1: 生体認証 → 生物特征认证 (b02 body text; not a headword), in the seed and the committed table", () => {
  assert.equal(seedTable(units()).terms["生体認証"], "生物特征认证");
  assert.equal(readJson(P.zhTerms).terms["生体認証"], "生物特征认证");
  assert.deepEqual(probe("生体認証を使う。", "使用生物特征认证。", { 生体認証: "生物特征认证" }), []);
  assert.deepEqual(probe("生体認証を使う。", "使用生物识别认证。", { 生体認証: "生物特征认证" }), ["生体認証"]);
});

test("--probe-v1: the check's noise on v1 definition / explanation pairs stays under 10% (15.2% before the B6 review)", (t) => {
  const all = units();
  const v1 = all.filter((u) => u.schema_version !== "textbook-unit-v2").length;
  // v1 units only: the pool shrinks with every batch rewritten to v2 (S137: 2662 pairs after b02) and ends at 0 when
  // every unit is v2 (B9 then decides the probe's fate). The floor scales with the v1 units left (≈11 pairs each)
  // and only guards against an empty / broken probe.
  if (v1 === 0) return t.skip("no v1 units left");
  const r = probeV1(all, readJson(P.zhTerms));
  assert.ok(r.pairs > v1 * 5, `${r.pairs} pairs for ${v1} v1 units`);
  // the share is noise below ~100 pairs (one hit in ten pairs is 10%)
  if (r.pairs >= 100) assert.ok(r.hit / r.pairs < 0.1, `${r.hit} / ${r.pairs}`);
  const top = new Map(r.top);
  for (const k of ["項目 → 数据项", "手続 → 过程", "分散 → 方差", "パスワード → 口令（密码）"]) assert.equal(top.get(k), undefined, k);
});

test("F3: prep writes the unit's relevant entries to <planning>/<id>/zh_terms.unit.json (same matcher, per_unit included)", () => {
  const root = tempRoot();
  const U = "management-10-27-u03";
  writeJson(path.join(root, "textbook/zh_terms.json"), {
    terms: { 回避: "规避", 軽減: "减轻", リスク: "风险", 項目: "数据项", 存在しない語句: "无", プロジェクトリスクマネジメント: "项目风险管理" },
    per_unit: { 保有: { [U]: "保留" }, MBO: { "strategy-01-01-u06": "MBO(目标管理)" } },
    excluded: { デュアルシステム: "OQ-15" },
  });
  assert.equal(run("textbook-v2-prep.mjs", ["--unit", U, "--data-root", root]).code, 0);
  const f = path.join(dataPaths(root).planning(U), "zh_terms.unit.json");
  const doc = readJson(f);
  assert.equal(doc.unit_id, U);
  assert.equal(doc.terms["回避"], "规避", "headword");
  assert.equal(doc.terms["プロジェクトリスクマネジメント"], "项目风险管理");
  assert.equal(doc.terms["リスク"], "风险", "katakana word in the unit's JP content");
  assert.equal(doc.terms["保有"], "保留", "per_unit for this unit");
  for (const k of ["MBO", "存在しない語句", "項目"]) assert.equal(doc.terms[k], undefined, k);
  const bytes = readFileSync(f, "utf-8");
  assert.equal(run("textbook-v2-prep.mjs", ["--unit", U, "--data-root", root]).code, 0);
  assert.equal(readFileSync(f, "utf-8"), bytes, "deterministic");
});
