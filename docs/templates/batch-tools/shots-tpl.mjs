// 截図 + 機械検査 (S138 shots-b06 を復元し、OQ-18 のはみ出し検査を追加)。args: outDir topic units(comma)
import pw from "/Volumes/DevSSD/Project/IT-Passport-Learning/node_modules/.pnpm/@playwright+test@1.60.0/node_modules/@playwright/test/index.js"; const { chromium } = pw;
const [out, topic, list] = process.argv.slice(2);
const units = list.split(",");
const b = await chromium.launch();
const bad = [], overflow = [];
for (const u of units) for (const l of ["ja", "zh", "en"]) for (const w of [1440, 390, 360, 320]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  const r = await p.goto(`http://127.0.0.1:3150/${l}/textbook/${topic}-${u}`, { waitUntil: "networkidle" });
  const txt = await p.locator("main").innerText();
  if (/\*\*|\[\[jp:|undefined/.test(txt) || r.status() !== 200) bad.push(`${u} ${l} ${w} ${r.status()}`);
  const sw = await p.evaluate(() => document.documentElement.scrollWidth);
  if (sw > w) overflow.push(`${u} ${l} ${w}: ${sw}`);
  if (w === 1440 || w === 390) await p.screenshot({ path: `${out}/${u}-${l}-${w}.png`, fullPage: true });
  await p.close();
}
await b.close();
console.log("shots done; raw-markup/err pages:", bad.length ? bad : 0, "; page overflow:", overflow.length ? overflow : 0);
