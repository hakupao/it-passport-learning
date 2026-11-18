// Rule D L-2: at step 1 on a phone, an unreached node's label is not found by find-in-page and stays hidden under forced colors
import { createRequire } from "node:module";
const require = createRequire("/Volumes/DevSSD/Project/IT-Passport-Learning/apps/web/package.json");
const { chromium } = require("@playwright/test");
const b = await chromium.launch();
for (const forced of ["none", "active"]) {
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce", forcedColors: forced })).newPage();
  await p.goto(`${process.argv[2]}/zh/textbook/strategy-01-01-u04`); await p.evaluate(() => document.fonts.ready);
  const st = p.locator('[data-fig="flow"]:has([role=group])').first().locator("[role=group]");
  await st.locator("button").last().click();
  const r = await st.evaluate((s) => { const off = [...s.querySelectorAll('[data-off="true"]')]; window.getSelection().removeAllRanges();
    return { offNodes: off.length, labelVisibility: [...new Set(off.map((li) => getComputedStyle(li.firstElementChild ?? li).visibility))], findDo: window.find("Do 执行"), findPlan: (window.getSelection().removeAllRanges(), window.find("Plan 计划")) }; });
  console.log(`forcedColors=${forced}`, JSON.stringify(r));
}
await b.close();
