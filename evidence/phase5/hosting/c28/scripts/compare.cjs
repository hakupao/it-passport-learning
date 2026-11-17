// S163 C28 (D-235): compare the 4 blind re-check batches with the answer key; write data/ip/quiz/key_recheck.json.
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "../../../../..");
const Q = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(ROOT, "data/ip/quiz/questions.json"))).questions.map((q) => [q.id, q]));
const rows = [1, 2, 3, 4].flatMap((b) => JSON.parse(fs.readFileSync(path.join(ROOT, `evidence/phase5/hosting/c28/recheck_b${b}.json`))));
const ins = [1, 2, 3, 4].flatMap((b) => JSON.parse(fs.readFileSync(path.join(ROOT, `evidence/phase5/hosting/c28/input_b${b}.json`)))).map((x) => x.id);
if (rows.length !== 84 || rows.some((r, i) => r.id !== ins[i])) throw new Error("batch rows ≠ inputs");
const rechecks = {}, mismatch = [];
for (const r of rows) {
  const key = Q[r.id].correct_answer;
  if (r.derived_answer !== key) mismatch.push({ id: r.id, key, derived: r.derived_answer, confidence: r.confidence, reasoning_jp: r.reasoning_jp });
  rechecks[r.id] = { derived_answer: r.derived_answer, info_sufficient: r.info_sufficient, confidence: r.confidence, by: "S163 C28 blind re-derivation (critic opus, display info only)", note_jp: r.reasoning_jp };
}
fs.writeFileSync(path.join(ROOT, "data/ip/quiz/key_recheck.json"), JSON.stringify({ schema_version: "quiz-key-recheck-v1", note: "D-235: blind re-derivation of key_guard suspect entries from what the practice page shows (stem_jp_clean, choices, quiz-figures). Read by quiz-phase2-merge → key_guard.recheck; cleared = derived = key ∧ info_sufficient ∧ confidence ≠ low.", rechecks }, null, 1) + "\n");
fs.writeFileSync(path.join(ROOT, "evidence/phase5/hosting/c28/mismatch.json"), JSON.stringify(mismatch, null, 1) + "\n");
console.log({ n: rows.length, match: rows.length - mismatch.length, mismatch: mismatch.length, low: rows.filter((r) => r.confidence === "low").length, insufficient: rows.filter((r) => !r.info_sufficient).length });
for (const m of mismatch) console.log(m.id, "key", m.key, "derived", m.derived, m.confidence, "|", m.reasoning_jp.slice(0, 200));
