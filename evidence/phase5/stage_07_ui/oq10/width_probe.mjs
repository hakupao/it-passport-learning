import { createRequire } from "node:module";
const require = createRequire("/Volumes/DevSSD/Project/IT-Passport-Learning/apps/web/package.json");
const { chromium } = require("@playwright/test");
const [, , VW, ...ids] = process.argv;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: Number(VW), height: 1000 } });
for (const id of ids) {
  await p.goto(`http://localhost:3123/ja/practice?ids=${id}`, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  console.log(id, JSON.stringify(await p.evaluate(() => {
    const ul = document.querySelector("ul[data-layout]");
    const box = ul.querySelector('[data-fid~="choice-0"]');
    const cs = getComputedStyle(box);
    return { ul: ul.getBoundingClientRect().width, li: ul.children[0].getBoundingClientRect().width, box: box.getBoundingClientRect().width, font: cs.fontSize, fam: cs.fontFamily.slice(0, 40), main: document.querySelector("article")?.getBoundingClientRect().width };
  })));
}
await b.close();
