// S124 実測用 (0 token): explanations 全層を D-147 正規表現で走査し、非 D-147 形の丸数字区切りを数える。evidence/quiz_marunum_expl_D147_S124.md §2。
import { readFileSync, readdirSync } from "node:fs";
const IDS = ["2010h22a-q097","2012h24a-q058","2013h25a-q001","2013h25a-q044","2013h25h-q081","2014h26a-q056","2014h26h-q076","2015h27h-q070","2016h28a-q067","2016h28h-q066","2016h28h-q099","2017h29a-q031","2018h30a-q041","2018h30a-q057","2018h30a-q081","2018h30h-q072","2018h30h-q085","2019h31h-q062","2019r01a-q089","2019r01a-q096","2020r02o-q079","2020r02o-q098","2022r04-q052"];
const RE = /([①-⑳])([ \t　]*[,，、]?[ \t　]*)(?=[①-⑳])/g;
const cp = (s) => s === "" ? "NONE" : [...s].map(c => c === " " ? "SP" : c === "　" ? "IDSP" : "U+" + c.codePointAt(0).toString(16).toUpperCase()).join("");
const OK = { jp: ", ", zh: "、", en: ", " };
const set = new Set(IDS);
const dir = "data/ip/quiz/explanations";
const rows = []; const agg = {}; let totalTexts = 0;
const walk = (id, path, val, lang) => {
  if (typeof val === "string") {
    totalTexts++;
    const bad = [];
    for (const m of val.matchAll(RE)) if (m[2] !== OK[lang]) bad.push(cp(m[2]));
    if (bad.length) rows.push({ id, path, lang, in23: set.has(id), seps: [...new Set(bad)].join("|"), n: bad.length });
    return;
  }
  if (Array.isArray(val)) return val.forEach((v, i) => walk(id, `${path}[${i}]`, v, lang));
  if (val && typeof val === "object") for (const [k, v] of Object.entries(val)) {
    const l = ["jp","zh","en"].includes(k) ? k : (k === "note_jp" ? "jp" : lang);
    walk(id, path ? `${path}.${k}` : k, v, l);
  }
};
for (const f of readdirSync(dir)) {
  const E = JSON.parse(readFileSync(`${dir}/${f}`, "utf8"));
  for (const [id, q] of Object.entries(E.questions)) walk(id, "", q, "jp");
}
const in23 = rows.filter(r => r.in23), out = rows.filter(r => !r.in23);
console.log("texts scanned:", totalTexts);
console.log("hits in 23 問:", in23.length, "fields /", new Set(in23.map(r=>r.id)).size, "問");
console.log("hits outside 23 問:", out.length, "fields /", new Set(out.map(r=>r.id)).size, "問");
const tally = (rs) => { const t = {}; for (const r of rs) { const k = r.lang + ":" + r.seps; t[k] = (t[k]||0)+r.n; } return t; };
console.log("in23 tally:", tally(in23)); console.log("out tally:", tally(out));
console.log("--- in23 detail"); for (const r of in23) console.log(r.id, r.path, r.lang, r.seps, r.n);
console.log("--- out sample (first 25)"); for (const r of out.slice(0,25)) console.log(r.id, r.path, r.lang, r.seps, r.n);
console.log("out 問 ids:", [...new Set(out.map(r=>r.id))].join(" "));
