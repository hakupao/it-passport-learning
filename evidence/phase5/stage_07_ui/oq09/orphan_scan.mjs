// OQ-09 orphan scan: render every question (ja, ?ids=<id>), record layout; for row4 faces count the
// rendered lines of each choice text and whether its last line holds a single glyph (orphan).
// Chumon groups are opened at their first member and walked with the next button (non-first members
// do not render by ?ids). Per row4 choice also: badBreak = a line boundary inside a non-CJK run, a line
// starting with closing punctuation or a line ending with an opening bracket; overflow = the text box
// scrolls horizontally.
// Usage: node orphan_scan.mjs <out.json> <viewportWidth> [base]   env ONLY=<id,...>
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";

const ROOT = "/Volumes/DevSSD/Project/IT-Passport-Learning";
const require = createRequire(`${ROOT}/apps/web/package.json`);
const { chromium } = require("@playwright/test");
const [, , OUT, VW = "1440", BASE = "http://localhost:3123"] = process.argv;
const all = JSON.parse(readFileSync(`${ROOT}/data/ip/quiz/questions.json`, "utf8")).questions.map((q) => q.id);
const only = process.env.ONLY ? new Set(process.env.ONLY.split(",")) : null;
const groups = JSON.parse(readFileSync(`${ROOT}/data/ip/quiz/chumon_groups.json`, "utf8")).groups.map((g) => [...g.member_ids].sort());
const inGroup = new Set(groups.flat());
const units = [
  ...groups.filter((g) => !only || g.some((id) => only.has(id))),
  ...all.filter((id) => !inGroup.has(id) && (!only || only.has(id))).map((id) => [id]),
];

const measure = () => {
  const ul = document.querySelector("ul[data-layout]");
  const out = { id: document.querySelector("article[id]")?.id, layout: ul?.dataset.layout, choices: [] };
  if (out.layout !== "row4") return out;
  for (const li of ul.children) {
    const box = li.querySelector('[data-fid~="choice-0"],[data-fid~="choice-1"],[data-fid~="choice-2"],[data-fid~="choice-3"]');
    const tops = new Map();
    const w = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
    let text = "";
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      const s = n.data;
      let i = 0;
      for (const ch of s) {
        const len = ch.length;
        if (!/\s/.test(ch)) {
          const r = document.createRange();
          r.setStart(n, i);
          r.setEnd(n, i + len);
          const rect = r.getClientRects()[0];
          if (rect) {
            const top = Math.round(rect.top);
            const k = [...tops.keys()].find((t) => Math.abs(t - top) <= 3) ?? top;
            tops.set(k, (tops.get(k) ?? "") + ch);
          }
        }
        text += ch;
        i += len;
      }
    }
    const lines = [...tops.entries()].sort((a, b) => a[0] - b[0]).map((e) => e[1]);
    const CJK = /[\p{Script=Han}\u3040-\u30FF\u31F0-\u31FF\u3000-\u303F\uFF00-\uFFDF\uFFEF]/u;
    const CLOSE = /^[、。，．：；！？）〕］｝〉》」』】・ーぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶ々,.)\]}!?%:]/u;
    const OPEN = /[（〔［｛〈《「『【([{]$/u;
    let badBreak = false;
    for (let k = 1; k < lines.length; k++) {
      const a = [...lines[k - 1]].at(-1), b = [...lines[k]][0];
      // a non-CJK pair across a break is only bad if no whitespace separated them in the source
      const joined = text.replace(/\s+/g, " ");
      const inWord = !CJK.test(a) && !CJK.test(b) && !joined.includes(a + " " + b);
      if (inWord || CLOSE.test(lines[k]) || OPEN.test(lines[k - 1])) badBreak = true;
    }
    out.choices.push({
      badBreak,
      overflow: box.scrollWidth > box.clientWidth + 1,
      L: li.dataset.letter,
      text,
      lines,
      orphan: lines.length > 1 && [...lines[lines.length - 1]].length === 1,
    });
  }
  return out;
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: Number(VW), height: 1000 } });
await ctx.route(/api\.anthropic\.com/, (r) => r.abort());
await ctx.addInitScript(() => {
  try {
    sessionStorage.clear();
  } catch {}
});
const res = { vw: Number(VW), faces: 0, layouts: {}, row4: [], missing: [] };
let next = 0;
await Promise.all(
  Array.from({ length: 6 }, async () => {
    const page = await ctx.newPage();
    while (next < units.length) {
      const unit = units[next++];
      try {
        await page.goto(`${BASE}/ja/practice?ids=${unit[0]}`, { waitUntil: "networkidle" });
        for (let i = 0; i < unit.length; i++) {
          const id = unit[i];
          await page.waitForFunction((x) => document.querySelector("article[id]")?.id === x, id, { timeout: 15000 });
          await page.evaluate(() => document.fonts.ready);
          if (process.env.CSS) await page.addStyleTag({ content: process.env.CSS });
          const m = await page.evaluate(measure);
          res.faces++;
          res.layouts[m.layout] = (res.layouts[m.layout] ?? 0) + 1;
          if (m.layout === "row4") res.row4.push(m);
          if (i + 1 < unit.length) await page.getByRole("button", { name: /次の問題/ }).last().click({ timeout: 8000 });
        }
      } catch (e) {
        res.missing.push(`${unit[0]}: ${String(e).slice(0, 120)}`);
      }
    }
    await page.close();
  }),
);
await browser.close();
const ch = res.row4.flatMap((q) => q.choices);
res.summary = {
  row4Questions: res.row4.length,
  questionsWithOrphan: res.row4.filter((q) => q.choices.some((c) => c.orphan)).length,
  orphanChoices: ch.filter((c) => c.orphan).length,
  badBreakChoices: ch.filter((c) => c.badBreak).length,
  overflowChoices: ch.filter((c) => c.overflow).length,
  questionsOver2Lines: res.row4.filter((q) => q.choices.some((c) => c.lines.length > 2)).length,
  lineHist: ch.reduce((h, c) => ((h[c.lines.length] = (h[c.lines.length] ?? 0) + 1), h), {}),
};
console.log(`vw ${VW}: faces ${res.faces}, layouts ${JSON.stringify(res.layouts)}, missing ${res.missing.length}`);
console.log(JSON.stringify(res.summary));
writeFileSync(OUT, JSON.stringify(res, null, 1));
