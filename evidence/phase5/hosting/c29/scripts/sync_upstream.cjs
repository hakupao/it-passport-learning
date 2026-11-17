// S164 C29 Rule D MEDIUM: c20-quiz-apply.ts read .phase1 choices as an object (they are [{letter,zh,en}]) and never
// touched .phase1.5 stems, so the C29 translations patches did not reach those gitignored upstream sources.
// Same rule as the fixed script: rewrite a source only when it holds exactly the pre-patch text.
// Run: node evidence/phase5/hosting/c29/scripts/sync_upstream.cjs  (repo root)
const fs = require("fs");
const R = JSON.parse(fs.readFileSync("evidence/phase5/hosting/c29/apply_report.json", "utf8"));
const res = [];
for (const fl of R.fields.filter((f) => f.layer === "translations")) {
  const one = (file, pick) => {
    if (!fs.existsSync(file)) return "no file";
    const raw = fs.readFileSync(file, "utf8"), t = JSON.parse(raw), o = pick(t);
    if (o?.[fl.lang] === fl.after) return "already";
    if (o?.[fl.lang] !== fl.before) return "differs (left)";
    o[fl.lang] = fl.after;
    fs.writeFileSync(file, JSON.stringify(t, null, raw.startsWith("{\n  ") ? 2 : 0) + (raw.endsWith("\n") ? "\n" : ""));
    return "fixed";
  };
  const L = fl.where.slice(2);
  const r = { id: fl.id, where: fl.where, lang: fl.lang,
    phase1: one(`data/ip/quiz/.phase1/tr_${fl.id}.json`, (t) => fl.where === "stem" ? t.stem : (Array.isArray(t.choices) ? t.choices.find((c) => c.letter === L) : t.choices?.[L])) };
  if (fl.where === "stem") r.phase1_5 = one(`data/ip/quiz/.phase1.5/stem_${fl.id}.json`, (t) => t.stem);
  res.push(r);
}
fs.writeFileSync("evidence/phase5/hosting/c29/upstream_sync.json", JSON.stringify(res, null, 1) + "\n");
console.log(res.map((r) => `${r.id} ${r.where} ${r.lang} p1=${r.phase1}${r.phase1_5 ? " p1.5=" + r.phase1_5 : ""}`).join("\n"));
