// Track L L2 / L5 — the pure detectors and the allow-list gate of scripts/lib/lang-leak.ts, and the gate CLI on the
// real corpus (node:test, as the other scripts/*.test.mjs; apps/web/vitest.config.ts only collects apps/web/src/**).
// Run: node --test scripts/lang-leak-scan.test.ts
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import { build, contexts } from "./l5-build-allowlist.ts";
import { ALLOW_FILE, derivedGuard } from "./lang-leak-scan.ts";
import {
  detect,
  emptyAllowance,
  enCjk,
  excerpt,
  gate,
  jaLatinRun,
  jaSimp,
  keySetDiff,
  maskAnnotations,
  sameAsJa,
  SIMP_ONLY,
  zhJpForm,
  zhJpWords,
  zhKana,
  type AllowEntry,
  type AllowFile,
  type Group,
  type Lang,
  type RuleId,
  type Tag,
} from "./lib/lang-leak.ts";

test("zhKana: kana inside [[jp:…]] is allowed and counted, kana outside is a hit (one run per stretch)", () => {
  const al = emptyAllowance();
  assert.equal(zhKana("**数据库**[[jp:データベース]]是按规则组织的数据集合。", al), null);
  assert.deepEqual(al, { annotChars: 6, annotFields: 1, choiceLabels: 0, bracketChars: 0 });
  const h = zhKana("日语写作「字を下げる」", emptyAllowance());
  assert.deepEqual(h?.chars, ["を", "げ", "る"]);
  assert.deepEqual(h?.runs, [{ index: 6, text: "を" }, { index: 8, text: "げる" }]);
  assert.equal(h?.index, 6);
});

test("zhKana: ー outside an annotation is a hit; a hit of only ・ / ー is sub-tagged punct-only", () => {
  assert.deepEqual(zhKana("买方・主体", emptyAllowance()), { index: 2, chars: ["・"], runs: [{ index: 2, text: "・" }], subtag: "punct-only" });
  assert.equal(zhKana("[[jp:サーバー]]", emptyAllowance()), null);
  assert.equal(zhKana("ー", emptyAllowance())?.subtag, "punct-only");
});

test("choice labels ア–エ standing alone (or joined by ・) are allowed and counted, not inside a katakana word", () => {
  const al = emptyAllowance();
  assert.equal(zhKana("正确答案是ウ。选项ア・エ错误。", al), null);
  assert.equal(al.choiceLabels, 3);
  assert.deepEqual(zhKana("アクセスポイント（接入点）", emptyAllowance())?.chars.slice(0, 2), ["ア", "ク"]);
  assert.equal(enCjk("Choice ウ is correct.", emptyAllowance()), null);
});

test("halfwidth katakana and the phonetic extensions count as kana", () => {
  assert.ok(zhKana("ﾃﾞｰﾀ", emptyAllowance()));
  assert.ok(zhKana("ㇰ", emptyAllowance()));
});

test("enCjk: kanji and kana outside [[jp:…]]; kanji inside an annotation count into its allowance", () => {
  const al = emptyAllowance();
  assert.equal(enCjk("A [[jp:作業分解構成図]] lists the work.", al), null);
  assert.equal(al.annotChars, 7);
  assert.equal(enCjk("𠮷", emptyAllowance())?.chars[0], "𠮷");
  assert.deepEqual(enCjk("known in Japanese as 請負契約", emptyAllowance())?.chars, ["請", "負", "契", "約"]);
  assert.equal(enCjk("Area (%) — “quoted”, full-width （ok）", emptyAllowance()), null);
});

test("jaSimp: simplified-only characters; Japanese characters that look simplified are not in the list", () => {
  assert.deepEqual(jaSimp("这个问题")?.chars, ["这", "问", "题"]);
  for (const c of "会学点数件硬理准网") assert.ok(!SIMP_ONLY.includes(c), c);
  assert.equal(jaSimp("会議で学習した点数を処理する"), null);
});

test("jaSimp: any simplified-only Han (in GB2312, not in Shift_JIS) outside the list — 东 / 车 / 库 (L5 review M-1)", () => {
  assert.deepEqual(jaSimp("东京の本社")?.runs, [{ index: 0, text: "东" }]);
  assert.deepEqual(jaSimp("正解车")?.runs, [{ index: 2, text: "车" }]);
  assert.deepEqual(jaSimp("全題库では頻出")?.chars, ["库"]);
  assert.equal(jaSimp("東京の本社で車を使う。全題庫では頻出"), null);
  const g = grp({ ja: "東京ではなく东京", zh: "东京", en: "Tokyo" });
  assert.deepEqual(failRules([g]), ["R-ja-simp"]);
});

test("jaLatinRun: ≥ 6 Latin words of ≥ 2 letters; 5 words or 1-letter tokens are not enough; URLs ignored", () => {
  assert.ok(jaLatinRun("略称は Payment Card Industry Data Security Standard である"));
  assert.equal(jaLatinRun("Plan Do Check Act Cycle の略"), null);
  assert.equal(jaLatinRun("画素 w,b,w,b,w,w,b,b,w の並び"), null);
  assert.equal(jaLatinRun("参照 https://example.com/a/b/c/d/e/f/g"), null);
});

test("sameAsJa: identical and > minLen characters (12 by default, 0 for ui-messages); ASCII / code siblings are excluded", () => {
  assert.equal(sameAsJa("ITパスポート 過去問ノート", "ITパスポート 過去問ノート"), "hit");
  assert.equal(sameAsJa("短い同一", "短い同一"), null);
  assert.equal(sameAsJa("短い同一", "短い同一", 0), "hit");
  assert.equal(sameAsJa("IF(A2>3000, B2, C2)", "IF(A2>3000, B2, C2)"), "excluded");
  assert.equal(sameAsJa("ITパスポート 過去問ノート", "IT Passport notes"), null);
});

test("zhJpForm: Japanese glyph forms (outside GB2312, inside Shift_JIS); 〇 / 瞭 and plain Chinese are not; quiz brackets masked unless they hold simplified Han", () => {
  assert.deepEqual(zhJpForm("系统構成図", emptyAllowance(), false)?.runs, [{ index: 2, text: "構" }, { index: 4, text: "図" }]); // 成 is also Chinese
  assert.equal(zhJpForm("〇字符串型: 瞭望员 系统构成图", emptyAllowance(), false), null);
  assert.equal(zhJpForm("[[jp:構成図]]", emptyAllowance(), false), null);
  const al = emptyAllowance();
  assert.equal(zhJpForm("合同不符责任（契約不適合責任）、（日语称为「最高情報責任者」）", al, true), null);
  assert.equal(al.bracketChars, 5);
  assert.deepEqual(zhJpForm("即“稟議系统”", emptyAllowance(), true)?.runs, [{ index: 2, text: "稟議" }]);
  assert.ok(zhJpForm("合同不符责任（契約不適合責任）", emptyAllowance(), false), "textbook fields: brackets are not masked");
});

test("zhJpWords: fail / warn tiers, [[jp:]] masked, 部署 only with 部署 in the ja sibling", () => {
  assert.deepEqual(zhJpWords("正解为ア，交给担当者", "").fail.map((r) => r.text), ["正解", "担当者"]);
  assert.deepEqual(zhJpWords("由他来担当，满足构成要件", "").warn.map((r) => r.text), ["要件", "担当"]);
  assert.deepEqual(zhJpWords("[[jp:正解]]", "").fail, []);
  assert.deepEqual(zhJpWords("系统部署到云上", "クラウドに配置").fail, []);
  assert.deepEqual(zhJpWords("各部署的社员", "部署と社員").fail.map((r) => r.text), ["部署", "社员"]);
});

test("maskAnnotations keeps indices; excerpt is ±30 with ellipses", () => {
  const s = "ab[[jp:カナ]]cd";
  const m = maskAnnotations(s);
  assert.equal(m.text.length, s.length);
  assert.equal(m.text.indexOf("cd"), s.indexOf("cd"));
  assert.equal(excerpt("x".repeat(100), 50), `…${"x".repeat(60)}…`);
  assert.equal(excerpt("a\nb", 0), "a⏎b");
});

// ---- the gate on synthetic groups ------------------------------------------------------------------------

const F = "data/ip/quiz/explanations/2099x.json";
const grp = (vals: Partial<Record<Lang, string>>, o: { source?: string; at?: string; tag?: Tag; file?: string } = {}): Group => {
  const at = o.at ?? "questions.2099x-q001.correct";
  const members: Group["members"] = {};
  for (const [l, v] of Object.entries(vals) as [Lang, string][]) members[l] = { path: `${at}.${l === "ja" ? "jp" : l}`, value: v, scan: true };
  return { source: o.source ?? "quiz-explanations", file: o.file ?? F, pattern: "p", tag: o.tag ?? "content", members };
};
const clean = { ja: "正解はアである。", zh: "正确答案是ア。", en: "The answer is ア." };
const allowOf = (entries: AllowEntry[] = [], scope_exclusions: AllowFile["scope_exclusions"] = []): AllowFile => ({ schema: "lang-allow-1", categories: {}, scope_exclusions, entries });
const failRules = (groups: Group[], allow = allowOf()): RuleId[] => [...new Set(gate(detect(groups).hits, allow).failures.map((h) => h.rule))].sort();

test("gate: a clean trilingual group passes with an empty allow-list", () => {
  assert.deepEqual(failRules([grp(clean)]), []);
});

test("gate: each FAIL rule fails on a synthetic leak", () => {
  const cases: [RuleId, Group][] = [
    ["R-zh-kana", grp({ ...clean, zh: "正确答案是ア，因为データ不对。" })],
    ["R-en-cjk", grp({ ...clean, en: "The answer is ア (正確)." })],
    ["R-ja-simp", grp({ ...clean, ja: "正解は这个。" })],
    ["R-empty", grp({ ...clean, en: " " })],
    ["R-same", grp({ ...clean, zh: "正解はアである。これは長い同一の文です。", ja: "正解はアである。これは長い同一の文です。" })],
    ["R-zh-jpform", grp({ ...clean, zh: "正确答案是ア，见構成図。" })],
    ["R-zh-jpword", grp({ ...clean, zh: "正解是ア。" })],
  ];
  for (const [rule, g] of cases) assert.ok(failRules([g]).includes(rule), rule);
  // ui-messages R-same has no length floor
  const ui = (v: string): Group => ({ source: "ui-messages", file: "x", pattern: "Mock.colKey", tag: "content", members: { ja: { path: "Mock.colKey", value: v, scan: true, file: "apps/web/messages/ja.json" }, zh: { path: "Mock.colKey", value: v, scan: true, file: "apps/web/messages/zh.json" }, en: { path: "Mock.colKey", value: "Key", scan: true, file: "apps/web/messages/en.json" } } });
  assert.deepEqual(failRules([ui("解答")]), ["R-same"]);
});

test("gate: WARN rules and punct-only runs never fail, but are reported", () => {
  const g = grp({ ja: "略称は Payment Card Industry Data Security Standard である", zh: "串联・并联，满足构成要件", en: "Series and parallel." });
  const r = gate(detect([g]).hits, allowOf());
  assert.deepEqual(r.failures, []);
  assert.deepEqual([...new Set(r.warn.map((h) => h.rule))].sort(), ["R-ja-latin-run", "R-zh-jpword-ctx"]);
  assert.equal(r.punct.length, 1);
});

test("gate: an allow entry covers its own path + text only (not another path, not other text at the path, not extra occurrences)", () => {
  const leak = (at: string, zh: string) => grp({ ...clean, zh }, { at });
  const A = "questions.2099x-q001.correct";
  const entry: AllowEntry = { rule: "R-zh-kana", source: "quiz-explanations", file: F, path: `${A}.zh`, text: "ムダ", count: 1, category: "bracket-original", reason: "test" };
  assert.deepEqual(failRules([leak(A, "浪费（ムダ）")], allowOf([entry])), []);
  assert.deepEqual(failRules([leak("questions.2099x-q002.correct", "浪费（ムダ）")], allowOf([entry])), ["R-zh-kana"], "same text, other path");
  assert.deepEqual(failRules([leak(A, "浪费（ムリ）")], allowOf([entry])), ["R-zh-kana"], "other text, same path");
  assert.deepEqual(failRules([leak(A, "浪费（ムダ），还是ムダ")], allowOf([entry])), ["R-zh-kana"], "one more occurrence than count");
  assert.deepEqual(failRules([leak(A, "浪费（ムダ）"), leak(A.replace("correct", "points[0]"), "ムダ")], allowOf([entry])), ["R-zh-kana"]);
  const stale = gate(detect([grp(clean)]).hits, allowOf([entry])).stale;
  assert.equal(stale.length, 1, "an entry that matches nothing is reported stale");
  const empty: AllowEntry = { ...entry, rule: "R-empty", path: `${A}.en`, text: "" };
  assert.deepEqual(failRules([grp({ ...clean, en: "" })], allowOf([empty])), ["R-empty"], "R-empty cannot be allow-listed");
});

test("gate: scope exclusions by source + tag / path; derivedGuard fails a derived run its unit's content does not carry", () => {
  const TB = "data/ip/textbook/units/x-u01.json";
  const content = grp({ ja: "A", zh: "**数据库**[[jp:データベース]]是数据集合。", en: "x" }, { source: "textbook-units", file: TB, at: "terms[0].one" });
  const derivedOk = grp({ ja: "A", zh: "数据库（データベース）是数据集合。", en: "x" }, { source: "textbook-units", file: TB, at: "terms[0].definition", tag: "derived" });
  const derivedBad = grp({ ja: "A", zh: "数据库（データベース）是ログ集合。", en: "x" }, { source: "textbook-units", file: TB, at: "terms[1].definition", tag: "derived" });
  const ex = [{ id: "derived", source: "textbook-units", tag: "derived" as Tag, reason: "test" }];
  const groups = [content, derivedOk, derivedBad];
  const hits = detect(groups).hits;
  const r = gate(hits, allowOf([], ex));
  assert.deepEqual(r.failures, []);
  assert.ok((r.excluded.get("derived") ?? 0) >= 2);
  assert.deepEqual(derivedGuard(groups, hits).map((h) => `${h.path} ${h.text}`), ["terms[1].definition.zh ログ"]);
  const derivedBlank = grp({ ja: "A", zh: "", en: "x" }, { source: "textbook-units", file: TB, at: "terms[2].definition", tag: "derived" });
  assert.deepEqual(failRules([derivedBlank], allowOf([], ex)), ["R-empty"], "an exclusion never hides a blank field");
  const note = grp({ ja: "zh が「这个」と訳していた" }, { at: "questions.2099x-q001.key_guard.note", tag: "ja-only" });
  assert.deepEqual(failRules([note], allowOf([], [{ id: "kg", source: "quiz-explanations", path_re: "\\.key_guard\\.", reason: "test" }])), []);
  assert.deepEqual(failRules([note]), ["R-ja-simp"]);
});

test("keySetDiff: zh / en must have exactly the ja leaf keys (missing and extra)", () => {
  const d = keySetDiff({ ja: { A: { x: "1", y: "2" }, B: ["a", "b"] }, zh: { A: { x: "1" }, B: ["a", "b"], C: "c" }, en: { A: { x: "1", y: "2" }, B: ["a", "b"] } });
  assert.deepEqual(d, [
    { lang: "zh", missing: ["A.y"], extra: ["C"] },
    { lang: "en", missing: [], extra: [] },
  ]);
});

// ---- the gate CLI on the real corpus -------------------------------------------------------------------------

test("gate CLI: exits 0 on the current corpus with scripts/fixtures/lang-allow.json", () => {
  const root = path.resolve(import.meta.dirname, "..");
  const r = spawnSync(process.execPath, ["--no-warnings", "scripts/lang-leak-scan.ts", "--gate"], { cwd: root, encoding: "utf-8" });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /lang-leak gate: PASS/);
});

// ---- the allow-list generator cannot absorb new leaks (L5 review M-2) -----------------------------------------

const ROOT = path.resolve(import.meta.dirname, "..");
const FIXTURE = JSON.parse(readFileSync(path.join(ROOT, ALLOW_FILE), "utf-8")) as AllowFile;
const at = (file: string, p: string, vals: Partial<Record<Lang, string>>, source = "quiz-explanations"): Group => {
  const members: Group["members"] = {};
  for (const [l, v] of Object.entries(vals) as [Lang, string][]) members[l] = { path: `${p}.${l === "ja" ? "jp" : l}`, value: v, scan: true };
  return { source, file, pattern: "p", tag: "content", members };
};
const tb = (file: string, base: string, vals: Partial<Record<Lang, string>>): Group => {
  const members: Group["members"] = {};
  for (const [l, v] of Object.entries(vals) as [Lang, string][]) members[l] = { path: `${base}_${l === "ja" ? "jp" : l}`, value: v, scan: true };
  return { source: "textbook-units", file, pattern: "p", tag: "content", members };
};
const unclaimedOf = (groups: Group[]) => {
  const { hits } = detect(groups);
  return build(hits, contexts(groups), FIXTURE).unclaimed.map((h) => `${h.rule} ${h.path} ${h.text}`);
};

test("generator: the reviewer's absorption cases stay unclaimed (the gate keeps failing on them)", () => {
  const EX = (e: string) => `data/ip/quiz/explanations/${e}.json`;
  // unbracketed 二重化 (an L4 LEAK word) in a question that has a bracketed 二重化 elsewhere
  assert.deepEqual(unclaimedOf([at(EX("2018h30a"), "questions.2018h30a-q082.correct", { ja: "二重化", zh: "服务器采用二重化。", en: "x" })]), ["R-zh-jpword questions.2018h30a-q082.correct.zh 二重化"]);
  // a new 多重化 (kept word) at a location that was not reviewed
  assert.deepEqual(unclaimedOf([at(EX("2013h25a"), "questions.2013h25a-q001.correct", { ja: "多重化", zh: "采用多重化。", en: "x" })]), ["R-zh-jpword questions.2013h25a-q001.correct.zh 多重化"]);
  // a Japanese sentence in a bracket-original question, not in brackets
  assert.deepEqual(unclaimedOf([at(EX("2022r04"), "questions.2022r04-q040.distractors.イ", { ja: "これ", zh: "共通框架（共通フレーム）。これが正しいです", en: "x" })]), ["R-zh-kana questions.2022r04-q040.distractors.イ.zh これが", "R-zh-kana questions.2022r04-q040.distractors.イ.zh しいです"]);
  // new kana in a tb-jp-unmarked unit
  assert.deepEqual(unclaimedOf([tb("data/ip/textbook/units/strategy-03-10-u07.json", "terms[0].detail", { ja: "A", zh: "这是定价策略のです", en: "x" })]), ["R-zh-kana terms[0].detail_zh のです"]);
  // a D-189 key whose value is no longer exactly the label
  const ui = (v: Partial<Record<Lang, string>>): Group => ({ source: "ui-messages", file: "apps/web/messages/{ja,zh,en}.json", pattern: "Practice.correct", tag: "content", members: Object.fromEntries((Object.entries(v) as [Lang, string][]).map(([l, x]) => [l, { path: "Practice.correct", value: x, scan: true, file: `apps/web/messages/${l}.json` }])) });
  assert.deepEqual(unclaimedOf([ui({ ja: "正解", zh: "正解です", en: "正解" })]), ["R-zh-kana Practice.correct です", "R-zh-jpword Practice.correct 正解"]);
  assert.deepEqual(unclaimedOf([ui({ ja: "正解", zh: "正解", en: "正解" })]), [], "the exact D-189 value is still claimed");
});

test("generator: a claim that is not in the fixture is reported as new (the CLI refuses it without --accept-new)", () => {
  const g = at("data/ip/quiz/explanations/2026r08.json", "questions.2026r08-q031.points[0]", { ja: "ムダ", zh: "即浪费（ムダ）", en: "x" });
  const { hits } = detect([g]);
  const r = build(hits, contexts([g]), FIXTURE);
  assert.deepEqual(r.unclaimed, []);
  assert.deepEqual(r.added.map((e) => `${e.category} ${e.path} ${e.text}`), ["bracket-original questions.2026r08-q031.points[0].zh ムダ"]);
  const cli = spawnSync(process.execPath, ["--no-warnings", "scripts/l5-build-allowlist.ts"], { cwd: ROOT, encoding: "utf-8" });
  assert.equal(cli.status, 0, cli.stdout + cli.stderr);
  assert.match(cli.stdout, /new claims 0, dropped 0/);
});

test("gate CLI: a stale allow entry (its leak was fixed) fails, with the refresh command", () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "lang-allow-"));
  const f = path.join(dir, "allow.json");
  const stale: AllowEntry = { rule: "R-zh-kana", source: "quiz-explanations", file: "data/ip/quiz/explanations/2022r04.json", path: "questions.2022r04-q074.correct.zh", text: "れ", count: 1, category: "bracket-original", reason: "test" };
  writeFileSync(f, JSON.stringify({ ...FIXTURE, entries: [...FIXTURE.entries, stale] }));
  const r = spawnSync(process.execPath, ["--no-warnings", "scripts/lang-leak-scan.ts", "--gate", "--allow", f], { cwd: ROOT, encoding: "utf-8" });
  assert.equal(r.status, 1);
  assert.match(r.stdout, /FAIL stale allow entries/);
  assert.match(r.stdout, /refresh: node --no-warnings scripts\/l5-build-allowlist\.ts --write/);
});
