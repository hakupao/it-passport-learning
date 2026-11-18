import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire("/Volumes/DevSSD/Project/IT-Passport-Learning/apps/web/package.json");
const { chromium } = require("@playwright/test");
const idx = JSON.parse(fs.readFileSync("/Volumes/DevSSD/Project/IT-Passport-Learning/data/ip/textbook/unit_index.json", "utf8"));
const units = idx.topics.flatMap((t) => t.units.map((u) => u.unit_id));
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 320, height: 600 } });
for (const loc of ["en", "ja", "zh"]) {
  const bad = { 26: [], 24: [], 22: [] };
  for (const u of units) {
    await p.goto(`http://127.0.0.1:3161/${loc}/textbook/${u}`); await p.evaluate(() => document.fonts.ready);
    for (const fs of [26, 24, 22]) {
      const r = await p.evaluate((fs) => { const h = document.querySelector("main h1"); h.style.overflowWrap = "normal"; h.style.fontSize = fs + "px"; return [h.scrollWidth, h.clientWidth, h.textContent]; }, fs);
      if (r[0] > r[1]) bad[fs].push(u + " " + r[2]);
    }
  }
  console.log(loc, JSON.stringify(bad, null, 1));
}
await b.close();
