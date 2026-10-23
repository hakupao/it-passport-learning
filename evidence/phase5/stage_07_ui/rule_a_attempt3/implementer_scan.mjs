// Rule A attempt 3 evidence scan (one-off, NOT committed). Local build at :3123, empty Redis env.
// Safety net OFF: overflow-wrap / word-break forced to normal on the choices, so only the layout
// rule keeps text inside its cell. Every question face is really rendered: chumon groups are opened
// at their first member and walked with the session's next button; other questions via ?ids=<id>.
// Modes: ja / zh (translation hidden), zh-tr / en-tr (translation shown via the toggle).
// Overflow = el.scrollWidth > el.clientWidth + 1 on the <li>, its <button> (non-table), the choice
// text box and each translated line. Stem tables that scroll horizontally are counted (allowed).
// Usage: node a3_scan.mjs <out.json> [mode,…]   env NET_ON=1 keeps the safety net (control run),
// ONLY=<id,…> limits the questions.
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";

const ROOT = "/Volumes/DevSSD/Project/IT-Passport-Learning";
const require = createRequire(`${ROOT}/apps/web/package.json`);
const { chromium } = require("@playwright/test");
const BASE = "http://localhost:3123";
const [, , OUT, modesArg] = process.argv;
const MODES = (modesArg ?? "ja,zh,zh-tr,en-tr").split(",");
const NEXT = { ja: /次の問題/, zh: /下一题/, en: /Next/ };
const NET_OFF =
  "ul[data-layout] *{overflow-wrap:normal !important;word-break:normal !important}" +
  // negative control: force the attempt-2 situation (4 columns everywhere)
  (process.env.NEG ? "ul[data-layout]{grid-template-columns:repeat(4,minmax(0,1fr)) !important}" : "");

const all = JSON.parse(readFileSync(`${ROOT}/data/ip/quiz/questions.json`, "utf8")).questions.map((q) => q.id);
const only = process.env.ONLY ? new Set(process.env.ONLY.split(",")) : null;
const groups = JSON.parse(readFileSync(`${ROOT}/data/ip/quiz/chumon_groups.json`, "utf8")).groups.map((g) =>
  [...g.member_ids].sort(),
);
const inGroup = new Set(groups.flat());
// units of work: a chumon group (walked) or a single question
const units = [
  ...groups.filter((g) => !only || g.some((id) => only.has(id))),
  ...all.filter((id) => !inGroup.has(id) && (!only || only.has(id))).map((id) => [id]),
];

const measure = () => {
  const over = (e) => !!e && e.scrollWidth > e.clientWidth + 1;
  const ul = document.querySelector("ul[data-layout]");
  const bad = [];
  for (const li of ul.children) {
    const table = !!li.querySelector("table");
    const btn = li.querySelector("button");
    const jp = li.querySelector('[data-fid~="choice-0"],[data-fid~="choice-1"],[data-fid~="choice-2"],[data-fid~="choice-3"]');
    const box = jp && getComputedStyle(jp).display === "inline" ? jp.parentElement : jp;
    const trs = [...li.querySelectorAll('[data-fid^="choice-tr-"],[data-fid*=" choice-tr-"]')].filter(
      (e) => getComputedStyle(e).display !== "inline",
    );
    if (over(li) || (!table && (over(btn) || over(box))) || trs.some(over)) bad.push(li.dataset.letter);
  }
  const scroll = [...document.querySelectorAll('[data-fid="stem"] table,[data-fid="stem-preamble"] table,[data-fid="stem-tr"] table')]
    .map((t) => t.parentElement)
    .filter(over).length;
  return {
    id: document.querySelector("article[id]")?.id,
    layout: ul.dataset.layout,
    bad,
    tr: document.querySelectorAll('[data-fid="stem-tr"]').length,
    scroll,
  };
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
await ctx.route(/api\.anthropic\.com/, (r) => r.abort());
// every full load starts a fresh session (no restore of an earlier visit's position); in-session
// navigation via the next button is client-side and keeps it
await ctx.addInitScript(() => {
  try {
    sessionStorage.clear();
  } catch {}
});

const res = {};
for (const mode of MODES) {
  const [locale, tr] = mode.split("-");
  const r = (res[mode] = { faces: 0, layouts: {}, overflow: [], stemScroll: [], missing: [], trMissing: 0 });
  let next = 0;
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      const page = await ctx.newPage();
      while (next < units.length) {
        const unit = units[next++];
        try {
          await page.goto(`${BASE}/${locale}/practice?ids=${unit[0]}`, { waitUntil: "networkidle" });
          for (let i = 0; i < unit.length; i++) {
            const id = unit[i];
            await page.waitForFunction((x) => document.querySelector("article[id]")?.id === x, id, { timeout: 15000 });
            await page.evaluate(() => document.fonts.ready);
            if (tr) {
              const t = page.locator("[data-translation-toggle]");
              for (let k = 0; k < 5 && (await t.getAttribute("aria-pressed")) !== "true"; k++) {
                await t.click();
                await page.waitForTimeout(150);
              }
              await page.waitForSelector('[data-fid="stem-tr"]', { timeout: 5000 });
            }
            const style = process.env.NET_ON ? null : await page.addStyleTag({ content: NET_OFF });
            const m = await page.evaluate(measure);
            if (style) await style.evaluate((e) => e.remove());
            r.faces++;
            r.layouts[m.layout] = (r.layouts[m.layout] ?? 0) + 1;
            if (tr && !m.tr) r.trMissing++;
            if (m.bad.length) r.overflow.push({ id, layout: m.layout, letters: m.bad });
            if (m.scroll) r.stemScroll.push(id);
            if (i + 1 < unit.length) await page.getByRole("button", { name: NEXT[locale] }).last().click({ timeout: 8000 });
          }
        } catch (e) {
          r.missing.push(`${unit[0]}: ${String(e).slice(0, 120)}`);
        }
      }
      await page.close();
    }),
  );
  console.log(
    `${mode}: faces ${r.faces}, layouts ${JSON.stringify(r.layouts)}, overflow ${r.overflow.length}, ` +
      `stem tables scrolling ${r.stemScroll.length}, missing ${r.missing.length}, tr missing ${r.trMissing}`,
  );
}
await browser.close();
writeFileSync(OUT, JSON.stringify(res, null, 1));
