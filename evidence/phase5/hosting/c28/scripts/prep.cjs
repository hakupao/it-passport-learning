// S163 C28 (D-235): blind re-check inputs — only what the practice page shows (displayed stem, choices, figure files).
// No answer key, no explanation, no key_guard. 4 batches of the 84 suspects.
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "../../../../..");
const FIG = path.join(ROOT, "apps/web/public/quiz-figures");
const figs = fs.readdirSync(FIG);
const Q = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(ROOT, "data/ip/quiz/questions.json"))).questions.map((q) => [q.id, q]));
const ids = JSON.parse(fs.readFileSync(path.join(ROOT, "evidence/phase5/hosting/c28/suspects.json"))).map((r) => r.id);
const tr = {};
const items = ids.map((id) => {
  const ex = id.slice(0, id.indexOf("-q"));
  tr[ex] ??= JSON.parse(fs.readFileSync(path.join(ROOT, `data/ip/quiz/translations/${ex}.json`))).questions;
  const q = Q[id];
  const bases = [q.figure, id].filter(Boolean);
  const files = figs.filter((f) => bases.some((b) => f === `${b}.webp` || f.startsWith(`${b}-c`))).map((f) => `apps/web/public/quiz-figures/${f}`);
  return { id, stem_jp: tr[ex][id]?.stem_jp_clean?.trim() ? tr[ex][id].stem_jp_clean : q.stem_jp /* = quizModel.ts display rule */, choices_jp: q.choices_jp, figures: [...new Set(files)] };
});
const N = 4, per = Math.ceil(items.length / N);
for (let b = 0; b < N; b++) fs.writeFileSync(path.join(ROOT, `evidence/phase5/hosting/c28/input_b${b + 1}.json`), JSON.stringify(items.slice(b * per, (b + 1) * per), null, 1) + "\n");
console.log(items.length, "with figures:", items.filter((i) => i.figures.length).length, "has_figure but no file:", items.filter((i) => Q[i.id].has_figure && !i.figures.length).map((i) => i.id));
