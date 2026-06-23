#!/usr/bin/env node
// Stage 6 / Quiz (Session 100, D-140) — DETERMINISTIC OCR-garble detector.
//
// The Phase 2 pilot showed LLM key-guard flagging of cosmetic OCR corruption is
// NON-deterministic (Run2=5 / Run3=8, disjoint). This deterministic scan finds the
// same class of display corruption across all 2900 questions in one cheap pass via
// regex/heuristics — high recall, candidates then 主 context source-verify (q052) +
// drift-proof fix (quiz-phase2-stemfix style).
//
// Scans the DISPLAYED text (per the false-positive lesson): for the stem, that is
// stem_jp_clean (translation sidecar) if present, else raw stem_jp; for choices, the
// choices_jp (no clean fallback exists). figure-question table stems can legitimately
// contain markdown pipes / full-width spaces, handled per-pattern.
//
// Run:  node scripts/quiz-ocr-garble-scan.mjs [exam_id]   (default: all 29)
//       node scripts/quiz-ocr-garble-scan.mjs --json      (machine-readable to stdout)

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const QUESTIONS = path.join(ROOT, "data/ip/quiz/questions.json");
const TR_DIR = path.join(ROOT, "data/ip/quiz/translations");

const JP = "\\u3040-\\u30ff\\u3400-\\u9fff\\uff66-\\uff9f"; // hiragana/katakana/CJK/halfwidth-kana
const jpClass = (s) => new RegExp(s);

// Each pattern: {key, severity, test(value)→match|null, why}. Operates on a single field string.
const PATTERNS = [
  {
    key: "trailing_junk",
    severity: "high",
    // content followed by a run of spaces/full-width-spaces and/or a stray bracket/dot at end
    re: /[\s　]{2,}[\]・、。]?\s*$|[　\s]*[\]］・]\s*$/,
    why: "末尾の空白/]/・ OCR ゴミ",
  },
  { key: "period_comma", severity: "high", re: /。\s*[,，、]/, why: "「。,」連続 (OCR)" },
  // digit-zero adjacent to uppercase latin (O misread as 0): 0S, S0, 0RACLE, etc.
  { key: "zero_in_alpha", severity: "high", re: /(?<![0-9])0(?=[A-Z])|(?<=[A-Z])0(?![0-9])/, why: "英大文字に隣接する数字0 (O→0 OCR)" },
  // ASCII period directly after a JP char and before space/JP (should be 。/、)
  { key: "ascii_period_in_jp", severity: "medium", re: jpClass(`[${JP}][.](?=[\\s\\u3000${JP}]|$)`), why: "和文中の半角ピリオド (。/、 のOCR)" },
  // interior run of full-width spaces (not a leading/trailing markdown-table artifact)
  { key: "interior_fw_space", severity: "low", re: /[^\s　|]　{2,}[^\s　|]/, why: "語中の全角空白連続" },
  // page-number marker leaked into text: full-width 長音符/em-dash run + digits (e.g.
  // 「ーー 23 os」). NOT half-width hyphen (those are dates like 2022-04-10 = false pos).
  { key: "page_marker", severity: "high", re: /[ー—]{2,}\s*\d+\s*[a-z]*/, why: "頁番号マーカ混入 (ーー N os)" },
];
// NOTE: dropped `latin_blob_in_jp` — low precision (legit acronyms JIS/CIO/SLA… not in any
// finite allowlist). The garble it caught (0S, 0Q) is already covered by `zero_in_alpha`.

// figure/table stems legitimately use markdown pipes + full-width spaces in cells;
// for those, skip the interior_fw_space pattern (table alignment) but keep others.
function scanField(value, { isTableStem }) {
  const hits = [];
  for (const p of PATTERNS) {
    if (isTableStem && p.key === "interior_fw_space") continue;
    const m = p.test ? p.test(value) : (p.re.test(value) ? (value.match(p.re) || [""])[0] : null);
    if (m) hits.push({ pattern: p.key, severity: p.severity, why: p.why, snippet: String(m).slice(0, 40) });
  }
  return hits;
}

const onlyExam = process.argv.find((a) => /^\d{4}[a-z]/.test(a));
const asJson = process.argv.includes("--json");

const allQuestions = JSON.parse(readFileSync(QUESTIONS, "utf-8")).questions
  .filter((q) => !onlyExam || q.exam_id === onlyExam);

const trCache = new Map();
function cleanStem(q) {
  if (!trCache.has(q.exam_id)) {
    const f = path.join(TR_DIR, `${q.exam_id}.json`);
    trCache.set(q.exam_id, existsSync(f) ? JSON.parse(readFileSync(f, "utf-8")).questions : {});
  }
  const t = trCache.get(q.exam_id)[q.id];
  return (t && typeof t.stem_jp_clean === "string" && t.stem_jp_clean) || q.stem_jp || "";
}

const candidates = [];
for (const q of allQuestions) {
  const stem = cleanStem(q);
  const isTableStem = /\n\|/.test(stem); // markdown table present
  for (const h of scanField(stem, { isTableStem })) candidates.push({ id: q.id, field: "stem", ...h });
  for (const L of ["ア", "イ", "ウ", "エ"]) {
    const c = q.choices_jp?.[L];
    if (typeof c === "string") for (const h of scanField(c, { isTableStem: false })) candidates.push({ id: q.id, field: `choice.${L}`, ...h });
  }
}

const byPattern = candidates.reduce((m, c) => ((m[c.pattern] = (m[c.pattern] || 0) + 1), m), {});
const bySeverity = candidates.reduce((m, c) => ((m[c.severity] = (m[c.severity] || 0) + 1), m), {});
const affectedQuestions = new Set(candidates.map((c) => c.id)).size;

if (asJson) {
  process.stdout.write(JSON.stringify({ scanned: allQuestions.length, affectedQuestions, byPattern, bySeverity, candidates }, null, 2));
} else {
  console.log(`OCR-garble scan: ${allQuestions.length} questions${onlyExam ? ` (${onlyExam})` : " (all 29)"}`);
  console.log(`  candidate hits     : ${candidates.length}`);
  console.log(`  affected questions : ${affectedQuestions}`);
  console.log(`  by severity        : ${JSON.stringify(bySeverity)}`);
  console.log(`  by pattern         : ${JSON.stringify(byPattern, null, 0)}`);
  console.log(`\n  sample (first 25):`);
  for (const c of candidates.slice(0, 25)) {
    console.log(`    ${c.id} ${c.field} [${c.severity}/${c.pattern}] ${JSON.stringify(c.snippet)}`);
  }
}
