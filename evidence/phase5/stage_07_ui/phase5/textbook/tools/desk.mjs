// node desk.mjs <base> <outdir> : element screenshot of <main> at 1280 for a few pages (reduced motion = last step)
import { createRequire } from "node:module";
const require = createRequire("/Volumes/DevSSD/Project/IT-Passport-Learning/apps/web/package.json");
const { chromium } = require("@playwright/test");
import fs from "node:fs";
const [base, dir] = process.argv.slice(2); fs.mkdirSync(dir, { recursive: true });
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" })).newPage();
for (const path of ["zh/textbook/strategy-01-01-u04", "en/textbook/management-10-27-u02", "en/textbook/management-08-25-u03", "zh/textbook/technology-22-60-u02", "en/textbook/technology-22-60-u04", "zh/glossary/t7569633ef1e706a7"]) {
  await p.goto(`${base}/${path}`); await p.evaluate(() => document.fonts.ready);
  await p.locator("main").first().screenshot({ path: `${dir}/${path.replaceAll("/", "_")}.png` });
}
await b.close();
