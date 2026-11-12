import { createRequire } from "node:module";
import { readdirSync, writeFileSync } from "node:fs";
const require = createRequire("/Volumes/DevSSD/Project/IT-Passport-Learning/apps/web/package.json");
const { chromium } = require("@playwright/test");
const dir = process.argv[2];
const b = await chromium.launch();
for (const l of ["ja", "zh", "en"]) {
  const files = readdirSync(dir).filter((f) => f.startsWith(l + "-") && f.endsWith(".cand.png")).sort();
  const html = `<body style="margin:0;display:grid;grid-template-columns:repeat(4,640px);gap:4px;background:#888">${files.map((f) => `<div style="background:#fff"><div style="font:bold 16px sans-serif;background:#ff0">${f}</div><img src="file://${dir}/${f}" style="width:640px"></div>`).join("")}</body>`;
  writeFileSync(`${dir}/sheet-${l}.html`, html);
  const p = await b.newPage({ viewport: { width: 2580, height: 1600 } });
  await p.goto(`file://${dir}/sheet-${l}.html`);
  await p.screenshot({ path: `${dir}/../sheet-${l}.png`, fullPage: true });
}
await b.close();
