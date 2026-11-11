// Track L L2 — the pure detectors of scripts/lib/lang-leak.ts (node:test, as the other scripts/*.test.mjs;
// apps/web/vitest.config.ts only collects apps/web/src/**).
// Run: node --test scripts/lang-leak-scan.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";

import { emptyAllowance, enCjk, excerpt, jaLatinRun, jaSimp, maskAnnotations, sameAsJa, SIMP_ONLY, zhKana } from "./lib/lang-leak.ts";

test("zhKana: kana inside [[jp:…]] is allowed and counted, kana outside is a hit", () => {
  const al = emptyAllowance();
  assert.equal(zhKana("**数据库**[[jp:データベース]]是按规则组织的数据集合。", al), null);
  assert.deepEqual(al, { annotChars: 6, annotFields: 1, choiceLabels: 0 });
  const h = zhKana("日语写作「字を下げる」", emptyAllowance());
  assert.deepEqual(h?.chars, ["を", "げ", "る"]);
  assert.equal(h?.index, 6);
});

test("zhKana: ー outside an annotation is a hit; a hit of only ・ / ー is sub-tagged punct-only", () => {
  assert.deepEqual(zhKana("买方・主体", emptyAllowance()), { index: 2, chars: ["・"], subtag: "punct-only" });
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

test("jaLatinRun: ≥ 6 Latin words; 5 is not enough; URLs ignored", () => {
  assert.ok(jaLatinRun("略称は Payment Card Industry Data Security Standard である"));
  assert.equal(jaLatinRun("Plan Do Check Act Cycle の略"), null);
  assert.equal(jaLatinRun("参照 https://example.com/a/b/c/d/e/f/g"), null);
});

test("sameAsJa: identical and > 12 characters; ASCII / code siblings are excluded", () => {
  assert.equal(sameAsJa("ITパスポート 過去問ノート", "ITパスポート 過去問ノート"), "hit");
  assert.equal(sameAsJa("短い同一", "短い同一"), null);
  assert.equal(sameAsJa("IF(A2>3000, B2, C2)", "IF(A2>3000, B2, C2)"), "excluded");
  assert.equal(sameAsJa("ITパスポート 過去問ノート", "IT Passport notes"), null);
});

test("maskAnnotations keeps indices; excerpt is ±30 with ellipses", () => {
  const s = "ab[[jp:カナ]]cd";
  const m = maskAnnotations(s);
  assert.equal(m.text.length, s.length);
  assert.equal(m.text.indexOf("cd"), s.indexOf("cd"));
  assert.equal(excerpt("x".repeat(100), 50), `…${"x".repeat(60)}…`);
  assert.equal(excerpt("a\nb", 0), "a⏎b");
});
