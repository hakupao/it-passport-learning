// D-217 H1-6 — the out/ scan's rules, each with a planted violation (so a 0 on the real tree is not
// vacuous) and the benign forms it must let through.
import { describe, expect, it } from "vitest";

import {
  checkAnalytics,
  checkForbidden,
  checkLimits,
  checkPaths,
  confirmCandidates,
  decodeText,
  MAX_FILE_BYTES,
  SourceIndex,
  stringLeaves,
} from "../outScan";
import { headersFile } from "../headers";

const f = (rel: string, size = 1) => ({ rel, size });

describe("(a) paths", () => {
  it("accepts every expected family", () => {
    const ok = [
      "404.html", "index.html", "_headers", "_redirects", "robots.txt", "sitemap.xml", "favicon.ico", "vercel.svg",
      "ja.html", "zh.txt", "en/practice.html", "en/practice.txt", "ja/practice/browse/technology-14-36.txt",
      "ja/textbook/management-08-25-u01.html", "zh/mock/run.html", "ja/practice/q/2009h21a-q054.html",
      "en/glossary/t00219f657aedbb32.html", "ja/glossary.txt", "data/quiz/2026r08.ja.json", "data/quiz/index.json",
      "data/quiz-expl/2009h21a-1.json", "quiz-figures/2009h21a-q012.webp", "quiz-figures/2010h22a-q005-cA.webp",
      "_next/static/chunks/09ae183edf975eaa.js", "_next/static/media/00e40eb57098def0-s.844e2ccf.woff2",
      "_next/static/NA5GKkajgDSU3Ubx5sTmV/_buildManifest.js",
    ];
    expect(checkPaths(ok.map((p) => f(p)))).toEqual([]);
  });

  it("flags anything else — a detail page payload, raw data, a stray file", () => {
    const bad = [
      "ja/practice/q/2009h21a-q054.txt", // pruned family (D-223)
      "zh/glossary/t00219f657aedbb32.txt",
      "data/ip/exams/question_bank.json",
      "exams/2009h21a/page-01.png",
      "ja/practice/q/2009h21a-q054.json",
      "data/quiz/../x.json",
      "secret.env",
      "ja/textbook/unit.pdf",
      "_next/server/app/page.js",
    ];
    expect(checkPaths(bad.map((p) => f(p))).map((x) => x.path)).toEqual(bad);
  });
});

describe("(b) forbidden keys and text", () => {
  it("JSON: any forbidden key anywhere, by parsing", () => {
    expect(checkForbidden("data/quiz/x.json", JSON.stringify({ q: [{ id: "a", key_guard: { suspect: true } }] })).map((x) => x.detail)).toEqual(["key key_guard"]);
    expect(checkForbidden("data/quiz/x.json", JSON.stringify({ stats: { n: 1 } })).map((x) => x.detail)).toEqual(["key stats"]);
    expect(checkForbidden("data/quiz/x.json", JSON.stringify({ title: "stats" }))).toEqual([]);
  });

  it("HTML / flight payload: a distinctive key in any quoted form (plain and escaped)", () => {
    for (const t of ['{"source_note":"x"}', 'self.__next_f.push([1,"{\\"note_jp\\":\\"x\\"}"])', '\\\\\\"round1\\\\\\"']) {
      expect(checkForbidden("ja/x.html", t), t).toHaveLength(1);
    }
  });

  it("generic keys: only in object position with a non-string value (the corpus forms)", () => {
    const bad = ['{"stats":{"n":1}}', ',\\"pages\\":[3,4]', '{"page":12}', ',"count":0'];
    const ok = [
      ',\\"stats\\":\\"{topics} topics · {units} units\\"', // the i18n message Textbook.stats
      '"aria-current":o?"page":void 0', // a JS ternary, not an object key
      '{"stats":"x"}',
    ];
    for (const t of bad) expect(checkForbidden("ja/x.html", t), t).toHaveLength(1);
    for (const t of ok) expect(checkForbidden("_next/static/chunks/a.js", t), t).toEqual([]);
  });

  it("forbidden text anywhere", () => {
    expect(checkForbidden("ja/x.html", "<img src=/data/ip/exams/a.png>").map((x) => x.detail.split(" … ")[0])).toEqual([
      'text "data/ip/"',
      'text "/exams/"',
    ]);
    expect(checkForbidden("ja/x.txt", "see the .pdf")).toHaveLength(1);
  });
});

describe("(c) source-only text", () => {
  const SOURCE = ["試験開始の合図があるまで、問題冊子を開いて中を見てはいけません。", "問1　ＩＴパスポート試験の過去問題の本文がここにあります。"];
  const CORPUS = ["問1　ＩＴパスポート試験の過去問題の本文がここにあります。"];

  function index(): SourceIndex {
    const ix = new SourceIndex();
    for (const s of SOURCE) ix.addSource(s);
    for (const s of CORPUS) ix.subtractCorpus(s);
    return ix;
  }

  it("finds source-only text in out/, also escaped inside the flight payload and HTML entities", () => {
    const ix = index();
    const planted = [
      "<p>試験開始の合図があるまで、問題冊子を開いて中を見てはいけません。</p>",
      'self.__next_f.push([1,"\\"text\\":\\"試験開始の合図があるまで、問題冊子を開いて\\""])',
      "<p>試験開始の合図が&amp;あるまで、問題冊子を開いて中を見てはいけません</p>",
    ];
    for (const t of planted) {
      const c = new Set(ix.candidates(t));
      expect(confirmCandidates(c, SOURCE, CORPUS).size, t).toBeGreaterThan(0);
    }
  });

  it("keeps an OCR sentence with an ASCII comma in one run (only : . ( ) and markup break a run)", () => {
    const ocr = "A 社の費用構造が図のとおりのとき, 損益分岐点売上高は何百万円か。";
    const ix = new SourceIndex();
    ix.addSource(ocr);
    expect(confirmCandidates(new Set(ix.candidates(`<p>${ocr}</p>`)), [ocr], []).size).toBeGreaterThan(0);
  });

  it("lets through text that is also in the corpora, short runs, and question ids", () => {
    const ix = index();
    expect(ix.candidates("<p>問1　ＩＴパスポート試験の過去問題の本文がここにあります。</p>")).toEqual([]);
    expect(ix.candidates("<p>試験開始の合図があるまで</p>")).toEqual([]); // < 20 characters
    const ids = new SourceIndex();
    ids.addSource("figures/2009h21a-q012.png");
    expect(ids.candidates('<img src="/quiz-figures/2009h21a-q012.webp">')).toEqual([]);
  });

  it("decodes JSON escapes and entities", () => {
    expect(decodeText('a\\"b\\\\nc &amp; &lt;x&gt; &#x27;')).toBe("a\"b\nc & <x> '");
    expect(stringLeaves({ a: "x", b: [1, "y", { c: "z" }] })).toEqual(["x", "y", "z"]);
  });
});

describe("(d) limits", () => {
  it("counts files and headroom; flags > 20,000 files and > 25 MiB", () => {
    const r = checkLimits([f("a", 10), f("b", 20)]);
    expect(r).toMatchObject({ findings: [], total: 2, bytes: 30, headroom: 19_998, largest: { rel: "b", size: 20 } });
    expect(checkLimits([f("big", MAX_FILE_BYTES + 1)]).findings).toHaveLength(1);
    expect(checkLimits(Array.from({ length: 20_001 }, (_, i) => f(`f${i}`))).findings).toHaveLength(1);
  });
});

describe("(e) analytics beacon ⇔ CSP", () => {
  it("passes when both or neither, fails on a mismatch", () => {
    expect(checkAnalytics(headersFile({ analytics: false }), 0, 10)).toEqual([]);
    expect(checkAnalytics(headersFile({ analytics: true }), 10, 10)).toEqual([]);
    expect(checkAnalytics(headersFile({ analytics: false }), 3, 10)).toHaveLength(1);
    expect(checkAnalytics(headersFile({ analytics: true }), 0, 10)).toHaveLength(1);
    expect(checkAnalytics("", 0, 10)).toHaveLength(1);
  });
});
