// usage: node measure.mjs <base> <out.jsonl> [unitFilter]
import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire("/Volumes/DevSSD/Project/IT-Passport-Learning/apps/web/package.json");
const { chromium } = require("@playwright/test");
const [base, outFile, filter] = process.argv.slice(2);
const idx = JSON.parse(fs.readFileSync("/Volumes/DevSSD/Project/IT-Passport-Learning/data/ip/textbook/unit_index.json", "utf8"));
let units = idx.topics.flatMap((t) => t.units.map((u) => u.unit_id));
if (filter) units = units.filter((u) => filter.split(",").includes(u));
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
const out = fs.createWriteStream(outFile);
for (const u of units) for (const loc of ["ja", "zh", "en"]) {
  await page.setViewportSize({ width: 390, height: 844 });
  const r = await page.goto(`${base}/${loc}/textbook/${u}`, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  for (const w of [390, 360, 320]) {
    await page.setViewportSize({ width: w, height: 844 });
    await page.waitForTimeout(30);
    const m = await page.evaluate(() => {
      const de = document.documentElement;
      const cw = de.clientWidth;
      const offenders = [];
      if (de.scrollWidth > cw) {
        for (const el of document.querySelectorAll("body *")) {
          const b = el.getBoundingClientRect();
          if (b.right > cw + 0.5 && b.width > 0) {
            // skip if inside a scroll container that clips it
            let p = el.parentElement, clipped = false;
            while (p && p !== document.body) { const s = getComputedStyle(p); if (/(auto|scroll|hidden|clip)/.test(s.overflowX) && p.getBoundingClientRect().right <= cw + 0.5) { clipped = true; break; } p = p.parentElement; }
            if (!clipped) offenders.push({ tag: el.tagName.toLowerCase(), cls: String(el.className?.baseVal ?? el.className).slice(0, 60), part: el.closest("[data-part]")?.getAttribute("data-part") ?? null, right: Math.round(b.right), text: (el.textContent || "").trim().slice(0, 40) });
          }
        }
      }
      return { sw: de.scrollWidth, cw, offenders: offenders.slice(-6) };
    });
    out.write(JSON.stringify({ u, loc, w, status: r?.status(), ...m }) + "\n");
  }
}
out.end();
await browser.close();
