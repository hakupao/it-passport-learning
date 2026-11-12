import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
const require = createRequire("/Volumes/DevSSD/Project/IT-Passport-Learning/apps/web/package.json");
const { chromium } = require("@playwright/test");
const paths = JSON.parse(readFileSync(process.argv[2], "utf8"));
const A = "http://127.0.0.1:3170", B = "http://127.0.0.1:3171";
const browser = await chromium.launch();
const mk = async () => { const c = await browser.newContext({ locale: "ja-JP", viewport: { width: 1280, height: 900 } }); await c.route("**/_vercel/**", r => r.abort()); return c; };
const ca = await mk(), cb = await mk();
function ex() {
  const norm = s => (s ?? "").replace(/\s+/g, " ").trim();
  const m = document.querySelector("main");
  const rel = h => { try { const u = new URL(h, location.href); return u.origin === location.origin ? u.pathname + u.search + u.hash : u.href; } catch { return h; } };
  return {
    title: document.title,
    desc: document.querySelector('meta[name=description]')?.content ?? null,
    robots: document.querySelector('meta[name=robots]')?.content ?? null,
    mainText: norm(m?.innerText),
    mainHtmlLen: m?.innerHTML.length ?? 0,
    links: [...document.querySelectorAll("a[href]")].map(a => rel(a.getAttribute("href")) + "|" + norm(a.textContent)),
    imgs: [...document.querySelectorAll("img")].map(i => rel(i.getAttribute("src")) + "|" + (i.alt ?? "")),
    svgs: document.querySelectorAll("main svg").length,
    svgText: norm([...document.querySelectorAll("main svg")].map(s => s.textContent).join(" ")),
    headerText: norm(document.querySelector("header")?.innerText),
    navText: norm([...document.querySelectorAll("nav")].map(n => n.innerText).join(" | ")),
    buttons: [...document.querySelectorAll("button")].map(b => norm(b.innerText || b.getAttribute("aria-label"))),
  };
}
const res = [];
for (const p of paths) {
  const g = async (c, base) => { const pg = await c.newPage(); const r = await pg.goto(base + p, { waitUntil: "load", timeout: 45000 }); await pg.waitForTimeout(1500); const d = await pg.evaluate(ex); d.status = r.status(); await pg.close(); return d; };
  const [a, b] = await Promise.all([g(ca, A), g(cb, B)]);
  const diffs = {};
  for (const k of Object.keys(a)) if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) {
    if (Array.isArray(a[k])) { const sa = new Set(a[k]), sb = new Set(b[k]); diffs[k] = { onlyMain: a[k].filter(x => !sb.has(x)).slice(0, 8), onlyCand: b[k].filter(x => !sa.has(x)).slice(0, 8), n: [a[k].length, b[k].length] }; }
    else diffs[k] = typeof a[k] === "string" && a[k].length > 200 ? { lens: [a[k].length, b[k].length], firstDiffAt: [...a[k]].findIndex((c, i) => c !== b[k][i]), ctxMain: a[k].slice(Math.max(0,[...a[k]].findIndex((c, i) => c !== b[k][i]) - 30), [...a[k]].findIndex((c, i) => c !== b[k][i]) + 60), ctxCand: b[k].slice(Math.max(0,[...a[k]].findIndex((c, i) => c !== b[k][i]) - 30), [...a[k]].findIndex((c, i) => c !== b[k][i]) + 60) } : { main: a[k], cand: b[k] };
  }
  res.push({ p, diffs });
  console.log(p, Object.keys(diffs).join(",") || "EQUAL");
}
await browser.close();
writeFileSync(process.argv[3], JSON.stringify(res, null, 1));
