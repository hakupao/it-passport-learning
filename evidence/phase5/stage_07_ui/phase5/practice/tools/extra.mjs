import pw from "/Volumes/DevSSD/Project/IT-Passport-Learning/node_modules/.pnpm/@playwright+test@1.60.0/node_modules/@playwright/test/index.js"; const { chromium } = pw;
const out = process.argv[2];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
// 30-question group, moved to question 25: the 答题卡 scrolls and keeps the current cell in view
const ids = Array.from({ length: 30 }, (_, i) => `2024r06-q${String(i + 1).padStart(3, "0")}`).join(",");
await p.goto(`http://127.0.0.1:3150/zh/practice?ids=${ids}&run=7`, { waitUntil: "networkidle" });
for (let i = 0; i < 40; i++) { await p.keyboard.press("ArrowRight"); if ((await p.locator("[data-progress]").getAttribute("data-progress")) !== "1/30") break; await p.waitForTimeout(250); }
for (let i = 0; i < 23; i++) { await p.keyboard.press("ArrowRight"); await p.waitForTimeout(60); }
await p.waitForTimeout(400);
const card = await p.evaluate(() => { const ol = document.querySelector("[data-answer-card]"); const cur = ol.querySelector('[data-current="true"]').getBoundingClientRect(); const r = ol.getBoundingClientRect(); return { progress: document.querySelector("[data-progress]").dataset.progress, scrollLeft: Math.round(ol.scrollLeft), curInView: cur.left >= r.left && cur.right <= r.right, sw: document.documentElement.scrollWidth }; });
console.log("card", JSON.stringify(card));
await p.screenshot({ path: `${out}/after-extra-30q-card-375x667.png` });
// single-question page
await p.goto(`http://127.0.0.1:3150/zh/practice/q/2024r06-q006`, { waitUntil: "networkidle" });
console.log("single stemW", await p.evaluate(() => Math.round(document.querySelector('[data-fid="stem"]').getBoundingClientRect().width)), "sw", await p.evaluate(() => document.documentElement.scrollWidth));
await p.screenshot({ path: `${out}/after-extra-single-375x667.png` });
await ctx.close(); await b.close();
