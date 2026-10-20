// Stage 6 / D-150 §2 C track C0 (Session 127) — edgescan 候補 → figcrop sweep manifest (webp 単位、id = webp key)。
// 入力: evidence/phase5/stage_06_quiz_keyaudit/fig_edgescan_S127.json (先に quiz-fig-edgescan.mjs)
// 出力: data/ip/quiz/.keyaudit/figsweep_{input,items}_S127.json
// 盲検対照は repo に置かない (sweep agent から見えないように): --controls <json> で渡すと、その known_defect/negative の id を
// items に含める (edgescan 候補でなければ追加)。対照ファイル自体は読むだけで、出力には対照の印を一切残さない。
// Run from repo root:  node scripts/quiz-figsweep-manifest-S127.mjs [--controls <path>]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXAMS = path.join(ROOT, "data/ip/exams");
const scan = JSON.parse(readFileSync(path.join(ROOT, "evidence/phase5/stage_06_quiz_keyaudit/fig_edgescan_S127.json"), "utf-8"));
const qs = new Map(JSON.parse(readFileSync(path.join(ROOT, "data/ip/quiz/questions.json"), "utf-8")).questions.map((q) => [q.id, q]));
const bank = (() => { const b = JSON.parse(readFileSync(path.join(EXAMS, "question_bank.json"), "utf-8")); return new Map((b.questions ?? b).map((q) => [q.id, q])); })();
const ci = process.argv.indexOf("--controls");
const controls = ci >= 0 ? JSON.parse(readFileSync(path.resolve(process.argv[ci + 1]), "utf-8")) : { known_defect: [], negative: [] };
const keys = scan.candidates.map((c) => c.key);
const extra = [...controls.known_defect, ...controls.negative].map((c) => c.id).filter((k) => !keys.includes(k));
if (extra.length) throw new Error(`controls not in edgescan candidates (add their scan rows first): ${extra.join(", ")}`);
keys.sort();
const missing = [];
const questions = keys.map((key) => {
  const c = scan.candidates.find((x) => x.key === key);
  const q = qs.get(c.question_id), b = bank.get(c.question_id);
  const pageRel = b.source?.figure_page_image ?? b.source?.page_image;
  const item = {
    id: key,
    question_id: c.question_id,
    question_number: b.question_number,
    figure_kind: c.kind,
    stem_jp: q.stem_jp,
    choices_jp: q.choices_jp,
    figure_png: path.join(EXAMS, "figures", `${key}.png`),
    figure_webp: path.join(ROOT, c.webp),
    figure_page_png: path.join(EXAMS, pageRel),
  };
  if (c.kind === "choice") { item.choice = c.choice; item.choice_text_jp = q.choices_jp?.[c.choice]; }
  if (c.kind === "shared") item.shared_with = c.shared_with.map((id) => ({ id, question_number: bank.get(id)?.question_number, stem_jp: qs.get(id)?.stem_jp ?? bank.get(id)?.stem_jp }));
  for (const p of [item.figure_png, item.figure_webp, item.figure_page_png]) if (!existsSync(p)) missing.push(p);
  return item;
});
const kinds = questions.reduce((m, q) => ({ ...m, [q.figure_kind]: (m[q.figure_kind] ?? 0) + 1 }), {});
const OUTDIR = path.join(ROOT, "data/ip/quiz/.keyaudit");
writeFileSync(path.join(OUTDIR, "figsweep_input_S127.json"), JSON.stringify({ batch: "figsweep_S127", source: "evidence/phase5/stage_06_quiz_keyaudit/fig_edgescan_S127.json", count: questions.length, by_kind: kinds, questions }, null, 2) + "\n");
writeFileSync(path.join(OUTDIR, "figsweep_items_S127.json"), JSON.stringify(questions.map((q) => ({ id: q.id })), null, 2) + "\n");
console.log({ count: questions.length, kinds, controls_checked: controls.known_defect.length + controls.negative.length, missing });
