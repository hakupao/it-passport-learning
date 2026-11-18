import { createRequire } from "node:module";
const require = createRequire("/Volumes/DevSSD/Project/IT-Passport-Learning/apps/web/package.json");
const { chromium } = require("@playwright/test");
const b = await chromium.launch(); const p = await b.newPage();
for (const [path, w] of [["en/textbook/management-08-25-u03",320],["ja/textbook/technology-22-60-u02",320],["zh/textbook/technology-22-60-u02",320],["en/textbook/technology-22-60-u02",320],["en/textbook/technology-22-60-u04",320]]) {
  await p.setViewportSize({ width: w, height: 844 }); await p.goto("http://127.0.0.1:3161/" + path); await p.evaluate(() => document.fonts.ready);
  const r = await p.evaluate(() => { const res = [document.documentElement.scrollWidth];
    const s1 = document.createElement("style"); s1.textContent = "main h1{overflow-wrap:break-word}"; document.head.append(s1); res.push(document.documentElement.scrollWidth);
    const s2 = document.createElement("style"); s2.textContent = "main p{overflow-wrap:break-word}"; document.head.append(s2); res.push(document.documentElement.scrollWidth);
    const long = [...document.querySelectorAll("main p")].filter(e => e.scrollWidth > e.clientWidth).length; return [...res, long]; });
  console.log(path, w, "orig/h1fix/+pfix", JSON.stringify(r));
}
await b.close();
