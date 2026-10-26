// zoom dialog: centring, horizontal overflow, close button visible without scrolling, Esc / backdrop close
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
const require = createRequire("/Volumes/DevSSD/Project/IT-Passport-Learning/apps/web/package.json");
const { chromium } = require("@playwright/test");
const [, , BASE = "http://localhost:3123"] = process.argv;
const qs = JSON.parse(readFileSync("/Volumes/DevSSD/Project/IT-Passport-Learning/data/ip/quiz/questions.json", "utf8")).questions;
const groups = new Set(JSON.parse(readFileSync("/Volumes/DevSSD/Project/IT-Passport-Learning/data/ip/quiz/chumon_groups.json", "utf8")).groups.flatMap((g) => g.member_ids));
const ids = qs.filter((q) => q.figure && !groups.has(q.id)).map((q) => q.id).filter((_, i) => i % 60 === 0).slice(0, 6);
const b = await chromium.launch();
const out = [];
for (const [w, h] of [[1440, 900], [1280, 600], [390, 844], [360, 800], [844, 390]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  for (const id of ids) {
    await p.goto(`${BASE}/ja/practice?ids=${id}`, { waitUntil: "networkidle" });
    await p.locator("[data-fid=figure]").first().click();
    await p.waitForSelector("dialog[open] img");
    await p.waitForFunction(() => document.querySelector("dialog[open] img").complete);
    const r = await p.evaluate(() => {
      const d = document.querySelector("dialog[open]");
      const x = d.getBoundingClientRect();
      const btn = d.querySelector("button").getBoundingClientRect();
      return {
        centred: Math.abs(x.left - (innerWidth - x.right)) <= 1 && Math.abs(x.top - (innerHeight - x.bottom)) <= 1 && x.left >= 0 && x.top >= 0,
        hOverflow: d.scrollWidth > d.clientWidth + 1,
        vScroll: d.scrollHeight > d.clientHeight + 1,
        closeVisible: btn.bottom <= x.bottom && btn.top >= x.top,
        aspect: (() => { const i = d.querySelector("img"); const a = i.naturalWidth / i.naturalHeight, b = i.clientWidth / i.clientHeight; return Math.abs(a - b) / a < 0.02; })(),
      };
    });
    await p.keyboard.press("Escape");
    const escClosed = await p.evaluate(() => !document.querySelector("dialog[open]"));
    await p.locator("[data-fid=figure]").first().click();
    await p.waitForSelector("dialog[open]");
    await p.mouse.click(2, 2);
    const backdropClosed = await p.evaluate(() => !document.querySelector("dialog[open]"));
    out.push({ vp: `${w}x${h}`, id, ...r, escClosed, backdropClosed });
  }
  await p.close();
}
await b.close();
const bad = (k, v) => out.filter((o) => o[k] !== v).map((o) => `${o.vp} ${o.id}`);
console.log(`faces ${out.length}`);
for (const [k, v] of [["centred", true], ["hOverflow", false], ["closeVisible", true], ["escClosed", true], ["backdropClosed", true], ["vScroll", false], ["aspect", true]])
  console.log(k, "fail", bad(k, v).length, JSON.stringify(bad(k, v).slice(0, 8)));
