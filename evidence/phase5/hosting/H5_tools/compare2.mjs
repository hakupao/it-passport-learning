// H5 Rule A: body-text comparison of baseline (main, next start) vs candidate (out/, local-cf).
// usage: node compare.mjs <paths.json> <out.json> [--modes js,nojs] [--conc 4] [--shots dir]
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const require = createRequire("/Volumes/DevSSD/Project/IT-Passport-Learning/apps/web/package.json");
const { chromium } = require("@playwright/test");

const [, , pathsFile, outFile, ...rest] = process.argv;
const opt = (k, d) => { const i = rest.indexOf(k); return i >= 0 ? rest[i + 1] : d; };
const MODES = opt("--modes", "js,nojs").split(",");
const CONC = Number(opt("--conc", "4"));
const SHOTS = opt("--shots", "");
const INIT = opt("--init", "") ? readFileSync(opt("--init", ""), "utf8") : "";
const BASE = { main: "http://127.0.0.1:3160", cand: "http://127.0.0.1:3150" };
const items = JSON.parse(readFileSync(pathsFile, "utf8")); // [{id, path, kind}]
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

function extract() {
  const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"]);
  const collect = (root, exclude) => {
    const out = [];
    if (!root) return out;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    outer: for (let n; (n = w.nextNode()); ) {
      for (let p = n.parentElement; p && p !== root.parentElement; p = p.parentElement) {
        if (SKIP.has(p.tagName) || (exclude && p === exclude)) continue outer;
      }
      const t = n.nodeValue.replace(/\s+/g, " ").trim();
      if (t) out.push(t);
    }
    return out;
  };
  const main = document.querySelector("main");
  const q = (s, a) => document.querySelector(s)?.getAttribute(a) ?? null;
  return {
    lang: document.documentElement.lang,
    title: document.title,
    canonical: q('link[rel="canonical"]', "href"),
    robots: q('meta[name="robots"]', "content"),
    description: q('meta[name="description"]', "content"),
    hreflang: [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => `${l.hreflang}=${l.href}`),
    scripts: [...document.querySelectorAll("script[src]")].map((s) => s.getAttribute("src")).filter((s) => !s.startsWith("/_next/")),
    main: collect(main),
    chrome: collect(document.body, main),
  };
}

function diff(a, b) {
  // trim common prefix/suffix, then LCS on the middle
  let s = 0;
  while (s < a.length && s < b.length && a[s] === b[s]) s++;
  let e = 0;
  while (e < a.length - s && e < b.length - s && a[a.length - 1 - e] === b[b.length - 1 - e]) e++;
  const A = a.slice(s, a.length - e), B = b.slice(s, b.length - e);
  if (!A.length && !B.length) return [];
  if (A.length * B.length > 4e6) return [{ at: s, removed: A, added: B, note: "too large for LCS" }];
  const n = A.length, m = B.length;
  const L = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const hunks = [];
  let cur = null, i = 0, j = 0;
  const flush = () => { if (cur) hunks.push(cur); cur = null; };
  while (i < n || j < m) {
    if (i < n && j < m && A[i] === B[j]) { flush(); i++; j++; }
    else if (j < m && (i >= n || L[i][j + 1] >= L[i + 1][j])) { (cur ??= { at: s + i, removed: [], added: [] }).added.push(B[j++]); }
    else { (cur ??= { at: s + i, removed: [], added: [] }).removed.push(A[i++]); }
  }
  flush();
  return hunks;
}

const browser = await chromium.launch();
const ctx = {};
for (const mode of MODES) for (const side of ["main", "cand"]) {
  const c = await browser.newContext({ javaScriptEnabled: mode === "js", locale: "ja-JP", viewport: { width: 1280, height: 900 } });
  // Vercel analytics beacons (main only; removed by design in H1-5) never settle locally: abort them.
  await c.route("**/_vercel/**", (r) => r.abort());
  if (INIT) await c.addInitScript(INIT);
  ctx[`${mode}:${side}`] = c;
}

async function load(mode, side, item) {
  const page = await ctx[`${mode}:${side}`].newPage();
  const errors = [];
  let answered = null;
  page.on("pageerror", (e) => errors.push(String(e.message).slice(0, 200)));
  try {
    let inflight = 0, last = Date.now();
    page.on("request", () => { inflight++; last = Date.now(); });
    const fin = () => { inflight--; last = Date.now(); };
    page.on("requestfinished", fin); page.on("requestfailed", fin);
    const resp = await page.goto(BASE[side] + item.path, { waitUntil: "load", timeout: 45000 });
    if (mode === "js") {
      const t0 = Date.now();
      await page.waitForTimeout(item.wait ?? 400);
      while (Date.now() - t0 < 12000 && !(inflight <= 0 && Date.now() - last > 600)) await page.waitForTimeout(100);
      if (item.action === "answer") {
        // answer with key 1 (= ア) until the 解答栏 appears, then wait for the explanation fetch to settle
        const t1 = Date.now();
        while (Date.now() - t1 < 10000 && !(await page.locator('[data-fid="answer"]').count())) {
          await page.keyboard.press("1");
          await page.waitForTimeout(300);
        }
        answered = (await page.locator('[data-fid="answer"]').count()) > 0;
        await page.waitForTimeout(800);
        const t2 = Date.now();
        while (Date.now() - t2 < 10000 && !(inflight <= 0 && Date.now() - last > 600)) await page.waitForTimeout(100);
      }
    }
    const data = await page.evaluate(extract);
    if (SHOTS && mode === "js") await page.screenshot({ path: `${SHOTS}/${item.id}.${side}.png`, fullPage: false });
    return { answered, status: resp?.status() ?? null, finalPath: new URL(page.url()).pathname + new URL(page.url()).search, errors, ...data };
  } catch (err) {
    return { error: String(err.message).slice(0, 300), errors };
  } finally {
    await page.close();
  }
}

const results = [];
let next = 0, done = 0;
async function worker() {
  while (next < items.length) {
    const item = items[next++];
    const r = { ...item, modes: {} };
    for (const mode of MODES) {
      const [a, b] = await Promise.all([load(mode, "main", item), load(mode, "cand", item)]);
      const meta = {};
      for (const k of ["answered", "status", "finalPath", "lang", "title", "canonical", "robots", "description", "hreflang", "scripts", "error"]) {
        const x = JSON.stringify(a[k] ?? null), y = JSON.stringify(b[k] ?? null);
        if (x !== y) meta[k] = { main: a[k] ?? null, cand: b[k] ?? null };
      }
      r.modes[mode] = {
        mainNodes: [a.main?.length ?? 0, b.main?.length ?? 0],
        mainChars: [(a.main ?? []).join("").length, (b.main ?? []).join("").length],
        mainDiff: diff(a.main ?? [], b.main ?? []),
        mainJoinedEqual: (a.main ?? []).join("").replace(/\s+/g, "") === (b.main ?? []).join("").replace(/\s+/g, ""),
        chromeJoinedEqual: (a.chrome ?? []).join("").replace(/\s+/g, "") === (b.chrome ?? []).join("").replace(/\s+/g, ""),
        chromeDiff: diff(a.chrome ?? [], b.chrome ?? []),
        meta,
        pageErrors: { main: a.errors, cand: b.errors },
        ...(item.keepText ? { text: { main: a.main, cand: b.main } } : {}),
      };
    }
    results.push(r);
    if (++done % 25 === 0) console.error(`${done}/${items.length}`);
  }
}
await Promise.all(Array.from({ length: CONC }, worker));
await browser.close();
results.sort((x, y) => x.id.localeCompare(y.id));
writeFileSync(outFile, JSON.stringify(results, null, 1));
const sum = {};
for (const r of results) for (const [m, v] of Object.entries(r.modes)) {
  const s = (sum[m] ??= { pages: 0, mainEqual: 0, mainJoinedEqual: 0, chromeEqual: 0, metaEqual: 0, errors: 0 });
  if (v.mainJoinedEqual) s.mainJoinedEqual++; if (v.meta.error || v.meta.status) s.errors++;
  s.pages++; if (!v.mainDiff.length) s.mainEqual++; if (!v.chromeDiff.length) s.chromeEqual++; if (!Object.keys(v.meta).length) s.metaEqual++;
}
console.log(JSON.stringify(sum));
