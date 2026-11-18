// args: baseURL outDir tag(before|after)
import pw from "/Volumes/DevSSD/Project/IT-Passport-Learning/node_modules/.pnpm/@playwright+test@1.60.0/node_modules/@playwright/test/index.js"; const { chromium } = pw;
import fs from "node:fs";
const [base, out, tag] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const IDS = ["2024r06-q006","2024r06-q018","2024r06-q056","2024r06-q059","2024r06-q063","2024r06-q070","2024r06-q011","2024r06-q014","2024r06-q015","2024r06-q021"].join(",");
const VPS = [[375,667],[390,844],[412,915]];
const b = await chromium.launch();
const metrics = [];
for (const [w,h] of VPS) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  await p.goto(`${base}/zh/practice?ids=${IDS}&run=1`, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  const m = await p.evaluate(() => {
    const r = (s) => document.querySelector(s)?.getBoundingClientRect();
    const stem = r('[data-fid="stem"]'), hdr = r("header"), bar = document.querySelector("[data-answer-card]")?.parentElement?.getBoundingClientRect();
    const lis = [...document.querySelectorAll("article li[data-letter]")].map(li => Math.round(li.getBoundingClientRect().bottom));
    return { stemW: Math.round(stem?.width), header: Math.round(hdr?.height), topBar: Math.round(bar?.height), choiceBottoms: lis, sw: document.documentElement.scrollWidth };
  });
  await p.screenshot({ path: `${out}/${tag}-a-question-${w}x${h}.png` });
  const btn = p.locator('article li[data-letter="ア"] button');
  for (let i = 0; i < 40; i++) { await btn.click(); if ((await btn.getAttribute("aria-pressed")) === "true") break; await p.waitForTimeout(250); }
  await p.waitForTimeout(1800);
  const m2 = await p.evaluate(() => { const n = document.querySelector('[data-nav="next"]').getBoundingClientRect(); return { nextTop: Math.round(n.top), nextBottom: Math.round(n.bottom), vh: innerHeight, scrollY: Math.round(scrollY) }; });
  await p.screenshot({ path: `${out}/${tag}-b-answered-${w}x${h}.png` });
  await p.goto(`${base}/zh/textbook`, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  const hh = await p.evaluate(() => Math.round(document.querySelector("header").getBoundingClientRect().height));
  await p.screenshot({ path: `${out}/${tag}-c-header-${w}x${h}.png` });
  metrics.push({ vp: `${w}x${h}`, ...m, ...m2, textbookHeader: hh });
  await ctx.close();
}
await b.close();
fs.writeFileSync(`${out}/${tag}-metrics.json`, JSON.stringify(metrics, null, 1));
console.log(JSON.stringify(metrics));
