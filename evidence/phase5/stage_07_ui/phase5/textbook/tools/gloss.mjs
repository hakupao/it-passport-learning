import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire("/Volumes/DevSSD/Project/IT-Passport-Learning/apps/web/package.json");
const { chromium } = require("@playwright/test");
const [base, outDir] = process.argv.slice(2);
// the 120 term pages with the longest en page title + every 12th of the rest
const files = fs.readdirSync(`${outDir}/en/glossary`).filter((f) => /^t[0-9a-f]+\.html$/.test(f));
const withLen = files.map((f) => { const h = fs.readFileSync(`${outDir}/en/glossary/${f}`, "utf8"); const m = h.match(/<h1[^>]*>(.*?)<\/h1>/s); return [f.replace(".html", ""), (m?.[1] ?? "").replace(/<[^>]+>/g, "").length]; }).sort((a, b) => b[1] - a[1]);
const pick = [...withLen.slice(0, 120), ...withLen.slice(120).filter((_, i) => i % 12 === 0)].map((x) => x[0]);
const pages = ["textbook", "glossary", ...pick.map((t) => `glossary/${t}`)];
const b = await chromium.launch(); const p = await b.newPage();
let n = 0; const bad = [];
for (const loc of ["ja", "zh", "en"]) for (const pg of pages) {
  await p.setViewportSize({ width: 375, height: 667 });
  await p.goto(`${base}/${loc}/${pg}`); await p.evaluate(() => document.fonts.ready);
  for (const w of [375, 320]) { await p.setViewportSize({ width: w, height: 667 }); n++;
    const sw = await p.evaluate(() => document.documentElement.scrollWidth); if (sw > w) bad.push(`${loc}/${pg} ${w} ${sw}`); }
}
console.log("checks", n, "pages", pages.length * 3, "overflow", bad.length, JSON.stringify(bad));
await b.close();
