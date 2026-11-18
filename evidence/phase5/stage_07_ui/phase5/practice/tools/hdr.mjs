import pw from "/Volumes/DevSSD/Project/IT-Passport-Learning/node_modules/.pnpm/@playwright+test@1.60.0/node_modules/@playwright/test/index.js"; const { chromium } = pw;
const b = await chromium.launch();
for (const w of [375, 390, 412]) for (const l of ["ja","zh","en"]) {
  const p = await b.newPage({ viewport: { width: w, height: 800 } });
  await p.goto(`http://127.0.0.1:3150/${l}/textbook`, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  const r = await p.evaluate(() => { const H = document.querySelector("header"); const q = (s) => { const e = H.querySelector(s); const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; };
    return { h: Math.round(H.getBoundingClientRect().height), name: q("a"), nav: q("nav"), tools: q("nav ~ div") }; });
  console.log(w, l, JSON.stringify(r));
  await p.close();
}
await b.close();
