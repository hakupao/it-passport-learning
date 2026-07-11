#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 batch S106 — explanation-sidecar content fix + key_guard
// resolution for 2018h30h-q077, after Rule A (wf_28186bc3-d20) flagged 2 high issues
// on the POST-stemfix sample (the independent audit's core value: it read the fixed
// 500G stem and caught that the explanation still carried a stale 599G note).
//
// Root cause: q077 was an answer-affecting OCR stem corruption (599G→500G). The
// generator, following D-137-C, wrote the explanation for the official-key (500G)
// premise but appended a "(注: 表示 stem は「599G」だが…OCR 誤り)" caveat to
// correct.{jp,zh,en}. After 主 context fixed the stem to 500G (stemfix-S106 +
// trfix-S106, source page-34 read), that caveat became false/confusing (it cites
// 599G/1.8T which no longer appear) and the round-1 key_guard's suspect/matches_key
// =false no longer matches the corrected stem.
//
// Two-layer drift-proof fix (edit merge INPUTS, then re-run quiz-phase2-merge):
//   1. expl_jp/expl_tr q077 correct.* — strip the trailing 599G caveat (body math is
//      already all-500G and correct). assert-once substring replace.
//   2. generate_result_<exam> q077 key_guard + key_guard_round1 — resolve to the
//      post-fix reality (derived ウ / matches_key true / stem_corruption_suspected
//      false → merge yields suspect=false). The full round-1 history (blind エ on the
//      corrupt 599G stem, correctly caught) is preserved in the resolved note_jp + the
//      S106 adjudication evidence.
//
// Idempotent. Run: node scripts/quiz-phase2-explfix-S106.mjs  (then: node scripts/quiz-phase2-merge.mjs 2018h30h)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P2 = (f) => path.join(ROOT, "data/ip/quiz/.phase2", f);

// ---- Layer 1: strip stale 599G caveat from the explanation body -------------------
const CONTENT_FIXES = [
  {
    file: "expl_jp_2018h30h-q077.json",
    locate: (d) => [d, "correct_jp"],
    from: "正解。(注: 表示 stem は「599G」だが、選択肢と公式キー ウ=1.5T が成立するのは1台=500G のときであり、「599G」は本来「500G」の OCR 誤りと判断される。)",
    to: "正解。",
  },
  {
    file: "expl_tr_2018h30h-q077.json",
    locate: (d) => [d.correct, "zh"],
    from: "正确。（注：题面显示为「599G」，但只有当每台 = 500G 时，选项与官方答案ウ = 1.5T 才成立，因此「599G」应判定为「500G」的 OCR 误识。）",
    to: "正确。",
  },
  {
    file: "expl_tr_2018h30h-q077.json",
    locate: (d) => [d.correct, "en"],
    from: "so ウ is correct. (Note: the displayed stem reads 599 GB, but the choices and the official key ウ = 1.5 TB only hold when one drive = 500 GB, so 599 GB is judged to be an OCR error for 500 GB.)",
    to: "so ウ is correct.",
  },
];

let changed = 0;
const byFile = new Map();
for (const f of CONTENT_FIXES) {
  if (!byFile.has(f.file)) byFile.set(f.file, JSON.parse(readFileSync(P2(f.file), "utf-8")));
  const doc = byFile.get(f.file);
  const [obj, key] = f.locate(doc);
  if (!obj || typeof obj[key] !== "string") throw new Error(`${f.file}: locate failed`);
  const cur = obj[key];
  if (cur.includes(f.to) && !cur.includes(f.from)) {
    console.log(`  ~ ${f.file} ${key}: already patched, skip`);
    continue;
  }
  const n = cur.split(f.from).length - 1;
  if (n !== 1) throw new Error(`${f.file} ${key}: expected 1 occurrence of "${f.from}" but found ${n} — aborting`);
  obj[key] = cur.replace(f.from, f.to);
  changed++;
  console.log(`  ✓ ${f.file} ${key}: stripped 599G caveat`);
}

// ---- Layer 1b: strip stale trailing OCR caveats from DISTRACTOR explanations -------
// The generator appended "(注: …OCR…)" caveats to distractor explanations wherever it
// noticed choice corruption — including q040/q082, whose choices were NOT flagged via
// stem_corruption_suspected (so they slipped past the merge STEM-CORRUPTION list; the
// raw choices are fixed in stemfix-S106) and q051 (choice fixed in stemfix-S106). Now
// that the displayed choices are clean, these caveats reference garbage the user no
// longer sees. Each caveat is the trailing sentence/parenthetical → strip anchor..end.
const STRIP_CAVEATS = [
  { file: "expl_jp_2018h30h-q040.json", locate: (d) => [d.distractors_jp.find((x) => x.letter === "ア"), "why_wrong_jp"], anchor: "（なお選択肢冒頭の「1」" },
  { file: "expl_tr_2018h30h-q040.json", locate: (d) => [d.distractors.find((x) => x.letter === "ア"), "zh"], anchor: "（此外，选项开头的「1」" },
  { file: "expl_tr_2018h30h-q040.json", locate: (d) => [d.distractors.find((x) => x.letter === "ア"), "en"], anchor: "(Note: the" },
  { file: "expl_jp_2018h30h-q051.json", locate: (d) => [d.distractors_jp.find((x) => x.letter === "ウ"), "why_wrong_jp"], anchor: "(注: 選択肢末尾の「避次」" },
  { file: "expl_tr_2018h30h-q051.json", locate: (d) => [d.distractors.find((x) => x.letter === "ウ"), "zh"], anchor: "（注：选项末尾的「避次」" },
  { file: "expl_tr_2018h30h-q051.json", locate: (d) => [d.distractors.find((x) => x.letter === "ウ"), "en"], anchor: "(Note: the" },
  { file: "expl_jp_2018h30h-q082.json", locate: (d) => [d.distractors_jp.find((x) => x.letter === "ウ"), "why_wrong_jp"], anchor: "選択肢末尾の「ぜい」" },
  { file: "expl_tr_2018h30h-q082.json", locate: (d) => [d.distractors.find((x) => x.letter === "ウ"), "zh"], anchor: "选项末尾的「ぜい」" },
  { file: "expl_tr_2018h30h-q082.json", locate: (d) => [d.distractors.find((x) => x.letter === "ウ"), "en"], anchor: "The trailing" },
];

for (const f of STRIP_CAVEATS) {
  if (!byFile.has(f.file)) byFile.set(f.file, JSON.parse(readFileSync(P2(f.file), "utf-8")));
  const doc = byFile.get(f.file);
  const [obj, key] = f.locate(doc);
  if (!obj || typeof obj[key] !== "string") throw new Error(`${f.file}: strip locate failed`);
  const cur = obj[key];
  const idx = cur.indexOf(f.anchor);
  if (idx === -1) { console.log(`  ~ ${f.file} ${key}: caveat already stripped, skip`); continue; }
  const stripped = cur.slice(0, idx).replace(/\s+$/, "");
  if (!stripped) throw new Error(`${f.file} ${key}: strip would empty the field — aborting`);
  obj[key] = stripped;
  changed++;
  console.log(`  ✓ ${f.file} ${key}: stripped trailing OCR caveat`);
}

for (const [file, doc] of byFile) writeFileSync(P2(file), JSON.stringify(doc, null, 2) + "\n");

// ---- Layer 2: resolve q077 key_guard in generate_result --------------------------
const RESOLVED_KG = {
  figure_derivable: true,
  derived_answer: "ウ",
  matches_key: true,
  stem_corruption_suspected: false,
  note_jp:
    "RAID5 実効容量 = (4−1)×1台容量。stem 是正後 (S106: source page-34 実読で「500G」確定、raw bank + tr サイドカーの OCR「599G」→「500G」是正済) は 3×500=1500G=1.5T=ウ で公式キーと一致。round-1 は腐敗 stem「599G」で盲導出 エ・stem_corruption_suspected=true・matches_key=false を立てた (答えを左右する OCR 腐敗を正しく捕捉) が、源実読で 500G を確定し是正したため解決 = suspect=false。",
};

const grPath = P2("generate_result_2018h30h.json");
const gr = JSON.parse(readFileSync(grPath, "utf-8"));
const rec = gr.results.find((r) => r.id === "2018h30h-q077");
if (!rec) throw new Error("generate_result: 2018h30h-q077 not found");
if (rec.key_guard?.derived_answer === "ウ" && rec.key_guard?.matches_key === true && rec.suspect === false) {
  console.log("  ~ generate_result q077 key_guard: already resolved, skip");
} else {
  rec.key_guard = { ...RESOLVED_KG };
  rec.key_guard_round1 = { ...RESOLVED_KG };
  rec.suspect = false;
  writeFileSync(grPath, JSON.stringify(gr, null, 2) + "\n");
  changed++;
  console.log("  ✓ generate_result q077: key_guard + round1 resolved (derived ウ / matches_key true / suspect false)");
}

console.log(`✓ quiz-phase2-explfix-S106: ${changed} change(s) → re-run quiz-phase2-merge.mjs 2018h30h`);
