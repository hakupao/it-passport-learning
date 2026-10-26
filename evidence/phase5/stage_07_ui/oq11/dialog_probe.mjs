import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
const require = createRequire("/Volumes/DevSSD/Project/IT-Passport-Learning/apps/web/package.json");
const { chromium } = require("@playwright/test");
const [, , BASE = "http://localhost:3123"] = process.argv;
const qs = JSON.parse(readFileSync("/Volumes/DevSSD/Project/IT-Passport-Learning/data/ip/quiz/questions.json", "utf8")).questions;
const groups = new Set(JSON.parse(readFileSync("/Volumes/DevSSD/Project/IT-Passport-Learning/data/ip/quiz/chumon_groups.json", "utf8")).groups.flatMap((g) => g.member_ids));
const ids = qs.filter((q) => q.figure && !groups.has(q.id)).map((q) => q.id).filter((_, i) => i % 60 === 0).slice(0, 6);
const b = await chromium.launch();
for (const [w, h] of [[1440, 1000], [390, 844], [768, 1024]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  for (const id of ids) {
    await p.goto(`${BASE}/ja/practice?ids=${id}`, { waitUntil: "networkidle" });
    await p.locator("[data-fid=figure]").first().click();
    await p.waitForSelector("dialog[open] img");
    await p.waitForFunction(() => document.querySelector("dialog[open] img").complete);
    const r = await p.evaluate(() => {
      const d = document.querySelector("dialog[open]").getBoundingClientRect();
      return { l: Math.round(d.left), r: Math.round(innerWidth - d.right), t: Math.round(d.top), b: Math.round(innerHeight - d.bottom), w: Math.round(d.width), h: Math.round(d.height) };
    });
    const ok = Math.abs(r.l - r.r) <= 1 && Math.abs(r.t - r.b) <= 1 && r.l >= 0 && r.t >= 0;
    console.log(w, id, JSON.stringify(r), ok ? "CENTRED" : "OFF");
    await p.keyboard.press("Escape");
  }
  await p.close();
}
await b.close();
