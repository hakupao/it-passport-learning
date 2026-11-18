// node shot.mjs <url> <w> <h> <out.png> [locator] [step1]   (GET only)
import { createRequire } from "node:module";
const require = createRequire("/Volumes/DevSSD/Project/IT-Passport-Learning/apps/web/package.json");
const { chromium } = require("@playwright/test");
const [url, w, h, out, sel, step1] = process.argv.slice(2);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2, reducedMotion: "reduce" });
const p = await ctx.newPage();
await p.goto(url); await p.evaluate(() => document.fonts.ready);
let elH = null;
if (sel) {
  const el = p.locator(sel).first();
  await el.scrollIntoViewIfNeeded();
  if (step1) await el.locator("button").last().click(); // reduced motion shows the last step; もう一度 → step 1
  await p.waitForTimeout(100);
  elH = await el.evaluate((e) => { const r = e.getBoundingClientRect(); window.scrollBy(0, r.top - 40); return Math.round(r.height); });
}
await p.waitForTimeout(150);
await p.screenshot({ path: out });
const info = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
console.log(out.split("/").pop(), JSON.stringify({ ...info, elH }));
await b.close();
