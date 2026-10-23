// Reviewer (attempt 3) independent scan. Net OFF. Coverage = article ids actually rendered.
// Detection A: scrollWidth > clientWidth+1 on li / button / text box / tr line.
// Detection B: geometric — every text node's client rects must lie inside its <li> (and <button>) box.
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
const ROOT = "/Volumes/DevSSD/Project/IT-Passport-Learning";
const require = createRequire(`${ROOT}/apps/web/package.json`);
const { chromium } = require("@playwright/test");
const BASE = process.env.BASE || "http://localhost:3138";
const W = +(process.env.W || 1440);
const [, , OUT, modesArg] = process.argv;
const MODES = (modesArg || "ja,zh-tr").split(",");
const NET_OFF = "ul[data-layout] *{overflow-wrap:normal !important;word-break:normal !important}" + (process.env.NEG ? "ul[data-layout]{grid-template-columns:repeat(4,minmax(0,1fr)) !important}" : "");
const all = JSON.parse(readFileSync(`${ROOT}/data/ip/quiz/questions.json`, "utf8")).questions.map((q) => q.id);
const groups = JSON.parse(readFileSync(`${ROOT}/data/ip/quiz/chumon_groups.json`, "utf8")).groups.map((g) => g.member_ids);
const only = process.env.ONLY ? new Set(process.env.ONLY.split(",")) : null;
const inGroup = new Set(groups.flat());
const units = [
  ...groups.filter((g) => !only || g.some((x) => only.has(x))).map((g) => ({ first: g[0], n: g.length })),
  ...all.filter((id) => !inGroup.has(id) && (!only || only.has(id))).map((id) => ({ first: id, n: 1 })),
];
const NEXT = { ja: /次の問題/, zh: /下一题/, en: /Next/ };
const measure = () => {
  const ul = document.querySelector("ul[data-layout]");
  const sw = (e) => !!e && e.scrollWidth > e.clientWidth + 1;
  const out = { id: document.querySelector("article[id]")?.id, layout: ul.dataset.layout, a: [], b: [], netOk: true, trLines: 0 };
  for (const li of ul.children) {
    const hasTable = !!li.querySelector("table");
    const btn = li.querySelector("button");
    const jp = li.querySelector('[data-fid^="choice-"]:not([data-fid^="choice-tr"])');
    if (jp) { const cs = getComputedStyle(jp); if (cs.overflowWrap !== "normal" || cs.wordBreak !== "normal") out.netOk = false; }
    const trs = [...li.querySelectorAll('[data-fid^="choice-tr-"]')];
    out.trLines += trs.length;
    const box = li.querySelector("button > span:nth-of-type(2)");
    if (sw(li) || (!hasTable && (sw(btn) || sw(box))) || trs.some(sw)) out.a.push(li.dataset.letter);
    if (hasTable) continue;
    const lr = li.getBoundingClientRect(), br = (box || btn || li).getBoundingClientRect();
    const walker = document.createTreeWalker(box || li, NodeFilter.SHOW_TEXT);
    let worst = 0;
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent.trim()) continue;
      const r = document.createRange(); r.selectNodeContents(n);
      for (const q of r.getClientRects()) worst = Math.max(worst, q.right - Math.min(lr.right, br.right), Math.max(lr.left, br.left) - q.left);
    }
    if (worst > 1) out.b.push(`${li.dataset.letter}+${Math.round(worst)}px`);
  }
  out.tr = !!document.querySelector('[data-fid="stem-tr"]');
  return out;
};
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: W, height: 1000 } });
await ctx.route(/api\.anthropic\.com/, (r) => r.abort());
await ctx.addInitScript(() => { try { sessionStorage.clear(); } catch {} });
const res = {};
for (const mode of MODES) {
  const [locale, tr] = mode.split("-");
  const r = (res[mode] = { faces: 0, covered: new Set(), layouts: {}, overA: [], overB: [], netBad: [], trMissing: [], errors: [] });
  let k = 0;
  await Promise.all(Array.from({ length: 6 }, async () => {
    const page = await ctx.newPage();
    while (k < units.length) {
      const u = units[k++];
      try {
        await page.goto(`${BASE}/${locale}/practice?ids=${u.first}`, { waitUntil: "networkidle" });
        let prev = null;
        for (let i = 0; i < u.n; i++) {
          await page.waitForFunction((p) => { const a = document.querySelector("article[id]"); return a && a.id !== p && document.querySelector("ul[data-layout] > li"); }, prev, { timeout: 15000 });
          await page.evaluate(() => document.fonts.ready);
          if (tr) {
            const t = page.locator("[data-translation-toggle]");
            for (let j = 0; j < 5 && (await t.getAttribute("aria-pressed")) !== "true"; j++) { await t.click(); await page.waitForTimeout(120); }
            await page.waitForSelector('[data-fid="stem-tr"]', { timeout: 5000 }).catch(() => {});
          }
          const st = await page.addStyleTag({ content: NET_OFF });
          const m = await page.evaluate(measure);
          await st.evaluate((e) => e.remove());
          r.faces++; r.covered.add(m.id); prev = m.id;
          r.layouts[m.layout] = (r.layouts[m.layout] || 0) + 1;
          if (!m.netOk) r.netBad.push(m.id);
          if (tr && (!m.tr || m.trLines < 4)) r.trMissing.push(`${m.id}:${m.tr}/${m.trLines}`);
          if (m.a.length) r.overA.push(`${m.id}[${m.layout}] ${m.a.join(",")}`);
          if (m.b.length) r.overB.push(`${m.id}[${m.layout}] ${m.b.join(",")}`);
          if (i + 1 < u.n) await page.getByRole("button", { name: NEXT[locale] }).last().click({ timeout: 8000 });
        }
      } catch (e) { r.errors.push(`${u.first}: ${String(e).slice(0, 140)}`); }
    }
    await page.close();
  }));
  r.missing = all.filter((id) => !r.covered.has(id)); r.covered = r.covered.size;
  console.log(`${mode}@${W}: faces ${r.faces} covered ${r.covered} missing ${r.missing.length} layouts ${JSON.stringify(r.layouts)} overA ${r.overA.length} overB ${r.overB.length} netBad ${r.netBad.length} trMissing ${r.trMissing.length} errors ${r.errors.length}`);
}
await browser.close();
writeFileSync(OUT, JSON.stringify(res, null, 1));
