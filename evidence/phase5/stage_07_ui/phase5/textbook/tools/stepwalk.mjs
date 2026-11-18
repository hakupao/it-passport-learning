// every step of a few step figures at phone widths: stage / frame / controls height per step (no-jump check)
import { createRequire } from "node:module";
const require = createRequire("/Volumes/DevSSD/Project/IT-Passport-Learning/apps/web/package.json");
const { chromium } = require("@playwright/test");
const base = process.argv[2];
const cases = [["zh/textbook/strategy-01-01-u04", '[data-fig="flow"]:has([role=group])', 0], ["en/textbook/strategy-04-13-u02", '[data-fig="flow"]:has([role=group])', 1], ["en/textbook/management-10-27-u02", '[data-fig="tree"]:has([role=group])', 0], ["zh/textbook/management-10-27-u02", '[data-fig="tree"]:has([role=group])', 0], ["ja/textbook/strategy-04-13-u02", '[data-fig="flow"]:has([role=group])', 1]];
const b = await chromium.launch(); const p = await (await b.newContext({ reducedMotion: "reduce" })).newPage();
let jumps = 0;
for (const w of [320, 360, 375, 390]) for (const [path, sel, nth] of cases) {
  await p.setViewportSize({ width: w, height: 800 }); await p.goto(`${base}/${path}`); await p.evaluate(() => document.fonts.ready);
  const fig = p.locator(sel).nth(nth); const stage = fig.locator("[role=group]");
  const m = async () => stage.evaluate((s) => { const r = (e) => Math.round(e.getBoundingClientRect().height); const c = s.querySelector("p[aria-live]"); const ctl = s.lastElementChild; return { stage: r(s), frame: r(s.firstElementChild), cap: r(c.parentElement), ctl: r(ctl), ctlTop: Math.round(ctl.getBoundingClientRect().top - s.getBoundingClientRect().top), figSW: s.parentElement.scrollWidth - s.parentElement.clientWidth }; });
  const rows = [["last(SSR)", await m()]];
  await stage.locator("button").last().click(); rows.push(["1", await m()]);
  const n = await stage.locator("ol[aria-hidden] li").count();
  for (let i = 2; i <= n; i++) { await stage.locator("button").last().click(); rows.push([String(i), await m()]); }
  const frames = new Set(rows.map((r) => r[1].frame)), ctls = new Set(rows.map((r) => r[1].ctl)), tops = new Set(rows.map((r) => r[1].ctlTop));
  const jump = frames.size > 1 || ctls.size > 1;
  if (jump) jumps++;
  console.log(`${w} ${path}#${nth} n=${n} stage=${[...new Set(rows.map((r) => r[1].stage))]} frame=${[...frames]} ctl=${[...ctls]} ctlTop=${[...tops]} cap=${[...new Set(rows.map((r) => r[1].cap))]} figInnerScroll=${[...new Set(rows.map((r) => r[1].figSW))]}${jump ? "  <-- frame/controls height changes" : ""}`);
}
console.log("cases with frame/controls height change:", jumps);
await b.close();
