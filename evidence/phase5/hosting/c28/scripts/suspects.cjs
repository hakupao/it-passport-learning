// S163 C28: list the suspect questions with their key_guard (final + round1) and whether the note claims missing stem info.
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "../../../../..");
const dir = path.join(ROOT, "data/ip/quiz/explanations");
const Q = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(ROOT, "data/ip/quiz/questions.json"))).questions.map((q) => [q.id, q]));
const rows = [];
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json")).sort()) {
  const d = JSON.parse(fs.readFileSync(path.join(dir, f)));
  for (const [id, e] of Object.entries(d.questions)) {
    const kg = e.key_guard; if (!kg?.suspect) continue;
    const r1 = kg.round1 ?? null;
    const notes = [kg.note_jp, r1?.note_jp].filter(Boolean).join(" ‖ ");
    rows.push({ id, has_figure: Q[id].has_figure, key: Q[id].correct_answer,
      final: { fd: kg.figure_derivable, da: kg.derived_answer, mk: kg.matches_key }, round1: r1 && { fd: r1.figure_derivable, da: r1.derived_answer, mk: r1.matches_key },
      missing_claim: /埋め込|取り込|含まれていない|欠落|記載がな|与えられていな|示されていな|無い|ない(ため|ので)/.test(notes), note: notes });
  }
}
fs.writeFileSync(path.join(ROOT, "evidence/phase5/hosting/c28/suspects.json"), JSON.stringify(rows, null, 1) + "\n");
const c = (p) => rows.filter(p).length;
console.log({ suspects: rows.length, has_figure: c((r) => r.has_figure), no_figure: c((r) => !r.has_figure), missing_claim: c((r) => r.missing_claim), missing_claim_no_figure: c((r) => r.missing_claim && !r.has_figure), final_mk_false: c((r) => r.final.mk === false), final_ok_round1_bad: c((r) => r.final.fd !== false && r.final.mk !== false) });
