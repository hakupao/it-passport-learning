import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";
const J = (f) => JSON.parse(readFileSync(f, "utf8"));
// manual re-classification of the cases the string matcher could not place (see H5_fidelity.md §3)
const manual = (id, mode, h) => {
  const added = (h.added ?? []).join("");
  if (mode === "nojs" && /Loading the questions…|問題を読み込んでいます…|正在读取题目…/.test(added)) return "expected:H1-3 (D-217) 練習の入口・session は query 依存で browser 側描画、静的 HTML は読込 1 行 (JS 有りでは一致)";
  if (/个人编号/.test(added) && (h.removed ?? []).join("").match(/个人番号|我的编号/)) return "expected:L4 content (zh 个人番号/我的编号 → 个人编号、cade606e; 単元 term_zh / unit_index title_zh から合成された文字列)";
  return null;
};
const slim = (classified, rawResults, l4) => classified.pages.map((p) => {
  const raw = rawResults.find((r) => r.id === p.id);
  const o = { id: p.id, path: p.path, touchedSources: p.touchedSources };
  for (const [m, v] of Object.entries(p.modes)) {
    const rm = raw.modes[m];
    o[m] = {
      mainEqual: rm.mainDiff.length === 0, chromeEqual: rm.chromeDiff.length === 0, mainNodes: rm.mainNodes, mainChars: rm.mainChars,
      meta: v.classes.filter((c) => c.where.startsWith("meta")).map((c) => ({ key: c.where.slice(5), class: c.class.startsWith("UNEXPLAINED") && c.where === "meta.title" ? "expected:L4 content (zh title_zh 我的编号法 → 个人编号法、unit_index.json)" : c.class, ...(c.where === "meta.title" || c.where === "meta.answered" ? { detail: c.detail } : {}) })),
      hunks: v.classes.filter((c) => !c.where.startsWith("meta")).map((c) => ({ where: c.where, class: (c.class.startsWith("L4?") || c.class.startsWith("UNEX")) ? (manual(p.id, m, c.hunk) ?? c.class) : c.class, at: c.hunk.at, removed: c.hunk.removed.length > 12 ? [...c.hunk.removed.slice(0, 12), `…(+${c.hunk.removed.length - 12})`] : c.hunk.removed, added: c.hunk.added })),
    };
    if (l4) { const x = l4.find((r) => r.id === p.id); if (x) o[m].mainCodeBranchData = { mainEqual: x.modes[m].mainDiff.length === 0, chromeEqual: x.modes[m].chromeDiff.length === 0, metaOtherThanCanonicalHreflangScripts: Object.keys(x.modes[m].meta).filter((k) => !["canonical", "hreflang", "scripts"].includes(k)) }; }
  }
  return o;
});
const shots = (dir) => Object.fromEntries(readdirSync(dir).filter((f) => f.endsWith(".main.png")).map((f) => { const b = f.slice(0, -9); return [b, execSync(`cmp -s ${dir}/${f} ${dir}/${b}.cand.png && echo same || echo diff`).toString().trim()]; }));
const out = {
  step: "H5", generated: new Date().toISOString(),
  baseline: "main 1956a486 (next build + next start :3160、別 worktree、.env.local なし)",
  baseline2: "main のコード + hosting-cf の data/ip・apps/web/messages (L4 の内容変更を差し引いた対照)",
  candidate: "hosting-cf 87c8c2d6 の out/ (pnpm build、16,195 ファイル) を scripts/local-cf.ts :3150 で配信",
  extractor: "Playwright chromium; js = load + network 静穏 600 ms (上限 12 s), nojs = javaScriptEnabled:false (= 生 HTML); 本文 = <main> 内の text node (script/style/noscript/template 除外、空白正規化)、chrome = body の <main> 外",
  sampleSeed: 20261115,
};
out.textbook = {
  pages: 735, summaryVsMain: JSON.parse(readFileSync("textbook.sum.txt", "utf8").split("\n")[0]),
  summaryVsMainCodeBranchData_rerunOf120: J("textbook-rerun-l4data.out.json").length,
  pagesWithDiff: slim(J("textbook.classified.json"), J("textbook.out.json"), J("textbook-rerun-l4data.out.json")).filter((p) => !p.js.mainEqual || !p.nojs.mainEqual || p.js.meta.some((m) => !/canonical|hreflang|scripts/.test(m.key)) || !p.js.chromeEqual),
  equalPages: J("textbook.out.json").filter((r) => r.modes.js.mainDiff.length === 0 && r.modes.nojs.mainDiff.length === 0).map((r) => r.id),
};
out.samples = slim(J("samples-main.classified.json"), J("samples-main.out.json"), J("samples-l4data.out.json"));
out.seeded = slim(J("seeded-main.classified.json"), J("seeded-main.out.json"), J("seeded-l4data.out.json"));
out.answered = slim(J("answer-main.classified.json"), J("answer-main.out.json"), J("answer-l4data.out.json"));
out.screenshotsByteEqual = { vsMain: shots("shots-main"), vsMainCodeBranchData: shots("shots-l4data") };
writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
const all = [...out.textbook.pagesWithDiff, ...out.samples, ...out.seeded, ...out.answered];
const t = {};
for (const p of all) for (const m of ["js", "nojs"]) if (p[m]) { for (const h of p[m].hunks) { const k = `${m}|${h.where}|${h.class.slice(0, 40)}`; t[k] = (t[k] ?? 0) + 1; } }
console.log(JSON.stringify(t, null, 1));
console.log("unexplained:", JSON.stringify(all.flatMap((p) => ["js", "nojs"].flatMap((m) => (p[m]?.hunks ?? []).filter((h) => !h.class.startsWith("expected")).map((h) => p.id + " " + m)))));
