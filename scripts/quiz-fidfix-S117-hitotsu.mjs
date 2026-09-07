#!/usr/bin/env node
// Stage 6 / Quiz — S117: 決定的 OCR 崩れクラス「ーつ」(カタカナ長音 U+30FC + つ) → 「一つ」(漢数字 U+4E00)。
// pilot (2024r06-q061 エ「機能のーつで」) で出た字形クラスを、S116 の教訓「指摘された箇所ではなくクラスで全文を再走査する」に従い
// corpus 横断で是正する (reviewer-pilot-fix が同族 2 件を指摘 → 走査で 18 問)。日本語で「ーつ」が正しい並びは存在しないため決定的に置換できる。
// 層: questions.json / question_bank / by_year / translations stem_jp_clean / .phase1 tr_ stem_jp_clean (S115 教訓)。zh/en は影響なし (「一つ」の訳は既に正)。
// Run: node scripts/quiz-fidfix-S117-hitotsu.mjs [--dry-run]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry-run");
const rj = (f) => JSON.parse(readFileSync(f, "utf-8")), wj = (f, d) => { if (!DRY) writeFileSync(f, JSON.stringify(d, null, 2) + "\n"); };
const RE = /ーつ/g; let n = 0; const touched = new Map();
const fix = (obj, key, where) => { const s = obj?.[key]; if (typeof s !== "string" || !RE.test(s)) { RE.lastIndex = 0; return; } RE.lastIndex = 0; const c = (s.match(RE) || []).length; obj[key] = s.replace(RE, "一つ"); n += c; touched.set(where, c); };
const Q = rj(path.join(ROOT, "data/ip/quiz/questions.json")); const B = rj(path.join(ROOT, "data/ip/exams/question_bank.json")); const Barr = B.questions ?? B;
const exams = new Set(); const byCache = {}, trCache = {};
for (const q of Q.questions) {
  const hit = RE.test(JSON.stringify([q.stem_jp, q.choices_jp])); RE.lastIndex = 0; if (!hit) continue;
  const e = q.exam_id; exams.add(e);
  byCache[e] ??= rj(path.join(ROOT, "data/ip/exams/by_year", `${e}.json`)); trCache[e] ??= rj(path.join(ROOT, "data/ip/quiz/translations", `${e}.json`));
  const b = Barr.find((x) => x.id === q.id), y = byCache[e].questions.find((x) => x.id === q.id), t = trCache[e].questions[q.id];
  for (const [o, w] of [[q, "questions"], [b, "question_bank"], [y, "by_year"]]) { fix(o, "stem_jp", `${q.id} ${w}.stem_jp`); for (const L of Object.keys(o.choices_jp)) fix(o.choices_jp, L, `${q.id} ${w}.choices_jp.${L}`); }
  if (t?.stem_jp_clean) fix(t, "stem_jp_clean", `${q.id} translations.stem_jp_clean`);
  const t1f = path.join(ROOT, "data/ip/quiz/.phase1", `tr_${q.id}.json`); if (existsSync(t1f)) { const t1 = rj(t1f); if (t1.stem_jp_clean) { fix(t1, "stem_jp_clean", `${q.id} .phase1 tr_.stem_jp_clean`); wj(t1f, t1); } }
}
wj(path.join(ROOT, "data/ip/quiz/questions.json"), Q); wj(path.join(ROOT, "data/ip/exams/question_bank.json"), B);
for (const e of exams) { wj(path.join(ROOT, "data/ip/exams/by_year", `${e}.json`), byCache[e]); wj(path.join(ROOT, "data/ip/quiz/translations", `${e}.json`), trCache[e]); }
for (const [w, c] of touched) console.log(`  ✓ ${w} ×${c}`);
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S117-hitotsu: ${n} replacements in ${touched.size} fields / ${exams.size} exams`);
