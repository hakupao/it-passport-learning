import pw from "/Volumes/DevSSD/Project/IT-Passport-Learning/node_modules/.pnpm/@playwright+test@1.60.0/node_modules/@playwright/test/index.js"; const { chromium } = pw;
const b = await chromium.launch();
for (const l of ["ja","zh","en"]) {
  const p = await b.newPage({ viewport: { width: 360, height: 800 } });
  await p.goto(`http://127.0.0.1:3150/${l}/textbook`, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  console.log(l, JSON.stringify(await p.evaluate(() => { const H = document.querySelector("header"); const w = (s) => [...H.querySelector(s).children].map(e => +e.getBoundingClientRect().width.toFixed(1)); return { h: H.getBoundingClientRect().height, name: H.querySelector("a").getBoundingClientRect().width, nav: w("nav"), tools: w("nav ~ div") }; })));
  await p.close();
}
await b.close();
