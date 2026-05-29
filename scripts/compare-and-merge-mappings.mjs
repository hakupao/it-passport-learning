#!/usr/bin/env node
/**
 * Compare OCR (Pass 1) and Vision (Pass 2) page mappings,
 * merge into a final mapping, and produce a diff report.
 *
 * Priority: Vision wins on disagreements (verified more accurate).
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const MAPPING_DIR = 'data/ip/exams/mappings';
const FINAL_DIR = 'data/ip/exams/mappings/final';

mkdirSync(FINAL_DIR, { recursive: true });

const ocrFiles = readdirSync(MAPPING_DIR).filter(f => f.endsWith('_pages.json'));
const examIds = ocrFiles.map(f => f.replace('_pages.json', '')).sort();

const stats = { exams: 0, total_qs: 0, agree: 0, disagree: 0, vision_only: 0, ocr_only: 0 };
const allDiffs = [];

for (const examId of examIds) {
  const ocrFile = join(MAPPING_DIR, `${examId}_pages.json`);
  const visFile = join(MAPPING_DIR, `${examId}_vision.json`);

  if (!existsSync(visFile)) {
    console.log(`[skip] ${examId} — no vision mapping`);
    continue;
  }

  const ocr = JSON.parse(readFileSync(ocrFile, 'utf8'));
  const vis = JSON.parse(readFileSync(visFile, 'utf8'));

  const merged = {
    exam_id: examId,
    method: 'merged_ocr_vision',
    total_pages: vis.total_pages || ocr.total_pages,
    question_pages: {},
    pages: vis.pages || [],
    diffs: []
  };

  let examAgree = 0, examDisagree = 0;

  for (let q = 1; q <= 100; q++) {
    const qs = String(q);
    const op = ocr.question_pages?.[qs];
    const vp = vis.question_pages?.[qs];

    if (vp != null) {
      merged.question_pages[qs] = vp;
    } else if (op != null) {
      merged.question_pages[qs] = op;
      stats.ocr_only++;
    }

    if (op != null && vp != null) {
      if (op === vp) {
        examAgree++;
        stats.agree++;
      } else {
        examDisagree++;
        stats.disagree++;
        const diff = { exam: examId, q, ocr: op, vision: vp, delta: Math.abs(op - vp) };
        merged.diffs.push(diff);
        allDiffs.push(diff);
      }
    } else if (vp != null && op == null) {
      stats.vision_only++;
    }

    stats.total_qs++;
  }

  writeFileSync(join(FINAL_DIR, `${examId}.json`), JSON.stringify(merged, null, 2) + '\n');

  const pct = ((examAgree / (examAgree + examDisagree)) * 100).toFixed(1);
  console.log(`[${examId}] agree=${examAgree} disagree=${examDisagree} (${pct}%)`);
  stats.exams++;
}

// Summary report
const report = {
  generated: new Date().toISOString(),
  exams_compared: stats.exams,
  total_questions: stats.total_qs,
  agreement: stats.agree,
  disagreement: stats.disagree,
  agreement_rate: ((stats.agree / (stats.agree + stats.disagree)) * 100).toFixed(1) + '%',
  vision_only: stats.vision_only,
  ocr_only: stats.ocr_only,
  diffs_by_delta: {},
  all_diffs: allDiffs.sort((a, b) => a.exam.localeCompare(b.exam) || a.q - b.q)
};

for (const d of allDiffs) {
  const key = `delta_${d.delta}`;
  report.diffs_by_delta[key] = (report.diffs_by_delta[key] || 0) + 1;
}

writeFileSync(join(MAPPING_DIR, 'comparison_report.json'), JSON.stringify(report, null, 2) + '\n');

console.log(`\n=== Summary ===`);
console.log(`Exams: ${stats.exams}`);
console.log(`Agree: ${stats.agree} | Disagree: ${stats.disagree} | Rate: ${report.agreement_rate}`);
console.log(`Delta distribution:`, report.diffs_by_delta);
console.log(`Vision-only: ${stats.vision_only} | OCR-only: ${stats.ocr_only}`);
console.log(`\nFinal mappings: ${FINAL_DIR}/`);
console.log(`Report: ${MAPPING_DIR}/comparison_report.json`);
