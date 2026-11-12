// H5: fixed-seed sample of non-textbook pages (seed 20261115, mulberry32)
import { readdirSync, writeFileSync } from "node:fs";
const OUT = "/Volumes/DevSSD/Project/IT-Passport-Learning/apps/web/out";
let a = 20261115 >>> 0;
const rnd = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const html = (d) => readdirSync(`${OUT}/${d}`).filter((f) => f.endsWith(".html")).map((f) => f.slice(0, -5)).sort();
const items = [];
for (const l of ["ja", "zh", "en"]) {
  const terms = html(`${l}/glossary`), cats = html(`${l}/practice/browse`), qs = html(`${l}/practice/q`);
  const S = (kind, path) => items.push({ id: `${l}-${String(items.filter((x) => x.locale === l).length + 1).padStart(2, "0")}-${kind}`, kind, locale: l, path, keepText: true, wait: 1200 });
  S("today", `/${l}`);
  S("practice-entry", `/${l}/practice`);
  S("mock-entry", `/${l}/mock`);
  S("glossary-list", `/${l}/glossary`);
  S("glossary-detail", `/${l}/glossary/${pick(terms)}`);
  S("browse-list", `/${l}/practice/browse`);
  S("browse-detail", `/${l}/practice/browse/${pick(cats)}`);
  S("record", `/${l}/record`);
  S("settings", `/${l}/settings`);
  S("sensei", `/${l}/sensei`);
  // supplementary (not part of the 30): question detail ×2, practice session (ids, fixed order) ×1
  const Sx = (kind, path) => items.push({ id: `${l}-x${items.filter((x) => x.locale === l && x.supp).length + 1}-${kind}`, kind, locale: l, path, supp: true, keepText: true, wait: 1500 });
  Sx("question-detail", `/${l}/practice/q/${pick(qs)}`);
  Sx("question-detail", `/${l}/practice/q/${pick(qs)}`);
  Sx("practice-session", `/${l}/practice?ids=${[pick(qs), pick(qs), pick(qs)].join(",")}`);
}
writeFileSync(process.argv[2], JSON.stringify(items, null, 1));
console.log(items.map((x) => `${x.id} ${x.path}`).join("\n"));
