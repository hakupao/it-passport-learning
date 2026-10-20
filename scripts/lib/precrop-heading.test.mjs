// Run: node --test scripts/lib/
import { test } from "node:test";
import assert from "node:assert/strict";
import { pageParity, bucketModes, pickHeadMode, chooseParityCalib, parseHeadingQnum, checkQnums, sameQnum } from "./precrop-heading.mjs";

test("pageParity", () => {
  assert.equal(pageParity("pages/2022r04/page-08.png"), "even");
  assert.equal(pageParity("pages/2022r04/page-19.png"), "odd");
  assert.equal(pageParity("pages/x/cover.png"), null);
});

test("bucketModes counts 10px buckets", () => {
  assert.deepEqual(bucketModes([150, 154, 159, 230, 231]), [[150, 3], [230, 2]]);
});

test("pickHeadMode: page votes beat row count (S123 2019h31h figure-frame case)", () => {
  // body 230 (most rows); bucket 170 has more rows (one big figure page) but bucket 150 is on more pages
  const pool = [...Array(100).fill(230), ...Array(60).fill(170), ...Array(40).fill(150)];
  const r = pickHeadMode(pool, { 150: 12, 170: 1 });
  assert.equal(r.bodyMode, 230);
  assert.equal(r.headMode, 150);
});

test("pickHeadMode: failure modes", () => {
  assert.match(pickHeadMode([1, 2, 3], {}).error, /少なすぎ/);
  assert.match(pickHeadMode(Array(60).fill(200), {}).error, /分離できない/);
});

test("chooseParityCalib", () => {
  const global = { headMode: 150, bodyMode: 230, votes: "" };
  // 2022r04 偶数頁: 綴じ代で 160 に寄り、150 の得票なし → パリティ側を採る
  assert.equal(chooseParityCalib(global, { headMode: 160, bodyMode: 230 }, { 160: 17, 170: 9 }).headMode, 160);
  // 2018h30h 偶数頁: 150=17p / 140=16p のほぼ同票 → 全体 (140) を維持
  const g2 = { headMode: 140, bodyMode: 210 };
  const r = chooseParityCalib(g2, { headMode: 150, bodyMode: 210 }, { 150: 17, 140: 16 });
  assert.equal(r.headMode, 140);
  assert.match(r.fallback, /global head 140/);
  // パリティ側の較正失敗 → 全体
  assert.equal(chooseParityCalib(global, { error: "3 pages" }, {}).fallback, "3 pages");
});

test("parseHeadingQnum: OCR variants seen on real pages", () => {
  assert.equal(parseHeadingQnum("問13 情"), 13);
  assert.equal(parseHeadingQnum("間14 市"), 14);       // 問 → 間 誤読
  assert.equal(parseHeadingQnum("問9 2"), 9);          // 本文先頭が数字でも問字直後を採る
  assert.equal(parseHeadingQnum("問 100"), 100);
  assert.equal(parseHeadingQnum("- 問1"), 1);
  assert.equal(parseHeadingQnum("同79"), 79);          // 問 → 同 誤読
  assert.equal(parseHeadingQnum("癌75 ブ"), 75);       // 問 → 癌 誤読 (2009h21a page-28)
  assert.equal(parseHeadingQnum("問190 :"), 190);      // 100 の誤読。範囲外でも数は返し、照合 (sameQnum) に任せる
  assert.equal(parseHeadingQnum("間 199"), 199);
  assert.equal(parseHeadingQnum("Ms"), null);
  assert.equal(parseHeadingQnum("〔【ストラ3"), null); // 先頭に数字無し = 節見出しの誤検出 (2009h21a page-39)
  assert.equal(parseHeadingQnum("ア API 3"), null);
  assert.equal(parseHeadingQnum(""), null);
  assert.equal(parseHeadingQnum("問0"), null);
});

test("checkQnums: U6 page-24 (count matched, band wrong) is rejected", () => {
  const r = checkQnums([51, 52], [52, 53]);
  assert.equal(r.ok, false);
  assert.deepEqual(r.mismatches.map((m) => m.found), [51, 52]);
});

test("checkQnums: null = heading not confirmed → page rejected", () => {
  assert.deepEqual(checkQnums([13, null], [13, 14]), { ok: false, mismatches: [], verified: 1, exact: 1, noise: 0, unconfirmed: 1 });
  assert.equal(checkQnums([null, null], [95, 96]).ok, false);   // 2009h21a page-39: 〔ストラテジ系〕×2 を見出しと誤検出
  assert.equal(checkQnums([13], [13, 14]).ok, false);
});

test("sameQnum: measured OCR digit confusions are tolerated, offsets are not", () => {
  assert.equal(sameQnum(19, 10), true);    // 0 → 9 (2022r04 page-05)
  assert.equal(sameQnum(82, 32), true);    // 3 → 8 (2022r04 page-15)
  assert.equal(sameQnum(199, 100), true);
  assert.equal(sameQnum(51, 52), false);   // U6 誤帯
  assert.equal(sameQnum(9, 10), false);    // 桁数違い
  assert.equal(sameQnum(41, 4), false);
});

test("checkQnums: confusable reads verify, U6 offset still rejected", () => {
  const r = checkQnums([79, 71], [70, 71]);
  assert.equal(r.ok, true);
  assert.equal(r.verified, 2);
  assert.equal(r.exact, 1);
  assert.equal(checkQnums([51, 52], [52, 53]).ok, false);
});

test("checkQnums: digit drops (11→1) are noise, adjacent-page offsets are mismatches", () => {
  const r = checkQnums([1, 12], [11, 12]);   // 2009h21h page-08 実測
  assert.equal(r.ok, true);
  assert.equal(r.noise, 1);
  assert.equal(checkQnums([49, 50, 51], [52, 53, 54]).ok, false);  // 前頁ぶん (3 問) ずれ
  assert.equal(checkQnums([16], [15]).ok, false);                  // 差 1 の誤読は安全側 skip
});
