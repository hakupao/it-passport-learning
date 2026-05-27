#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const REVIEWS_DIR = 'data/ip/exams/reviews';
const BY_YEAR_DIR = 'data/ip/exams/by_year';
const BANK_FILE = 'data/ip/exams/question_bank.json';

const stats = { exams: 0, fixes: 0, missing: 0, figures: 0, errors: [] };

const reviewFiles = readdirSync(REVIEWS_DIR).filter(f => f.endsWith('_review.json'));
console.log(`Found ${reviewFiles.length} review files\n`);

for (const rf of reviewFiles.sort()) {
  const examId = rf.replace('_review.json', '');
  const examFile = join(BY_YEAR_DIR, `${examId}.json`);

  let review, exam;
  try {
    review = JSON.parse(readFileSync(join(REVIEWS_DIR, rf), 'utf8'));
    exam = JSON.parse(readFileSync(examFile, 'utf8'));
  } catch (e) {
    stats.errors.push(`${examId}: parse error — ${e.message}`);
    continue;
  }

  let fixCount = 0, missCount = 0, figCount = 0;

  // Apply fixes — supports two formats:
  // Format A: { question_number, corrected_fields: { stem_jp, choices_jp, ... } }
  // Format B: { question_number, field: "stem_jp" | "choices_jp.ア", corrected: "..." }
  if (review.fixes) {
    for (const fix of review.fixes) {
      const qIdx = exam.questions.findIndex(q => q.question_number === fix.question_number);
      if (qIdx === -1) {
        stats.errors.push(`${examId} Q${fix.question_number}: fix target not found in JSON`);
        continue;
      }
      const q = exam.questions[qIdx];

      // Format B: field-level fix with "field" + "corrected"
      if (fix.field && fix.corrected !== undefined) {
        if (fix.field === 'stem_jp') {
          q.stem_jp = fix.corrected;
          fixCount++;
        } else if (fix.field.startsWith('choices_jp.')) {
          const key = fix.field.replace('choices_jp.', '');
          q.choices_jp[key] = fix.corrected;
          fixCount++;
        } else if (fix.field === 'has_figure') {
          q.has_figure = fix.corrected;
          fixCount++;
        } else if (fix.field === 'figure_description') {
          q.figure_description = fix.corrected;
          figCount++;
        } else if (fix.field === 'choices_jp' && typeof fix.corrected === 'object') {
          for (const [key, val] of Object.entries(fix.corrected)) {
            if (val) q.choices_jp[key] = val;
          }
          fixCount++;
        }
        continue;
      }

      // Format A: corrected_fields object
      const cf = fix.corrected_fields || fix;

      if (cf.stem_jp && cf.stem_jp !== q.stem_jp) {
        q.stem_jp = cf.stem_jp;
        fixCount++;
      }
      if (cf.choices_jp && typeof cf.choices_jp === 'object') {
        for (const [key, val] of Object.entries(cf.choices_jp)) {
          if (val && q.choices_jp[key] !== val) {
            q.choices_jp[key] = val;
          }
        }
        fixCount++;
      }
      if (cf.has_figure !== undefined && cf.has_figure !== q.has_figure) {
        q.has_figure = cf.has_figure;
        fixCount++;
      }
      if (cf.figure_description && cf.figure_description !== q.figure_description) {
        q.figure_description = cf.figure_description;
        figCount++;
      }
    }
  }

  // Add missing questions (replace if fake Q100 exists from OCR)
  if (review.missing_questions) {
    for (const mq of review.missing_questions) {
      const existIdx = exam.questions.findIndex(q => q.question_number === mq.question_number);
      if (existIdx !== -1) {
        exam.questions.splice(existIdx, 1);
      }
      exam.questions.push({
        id: `${examId}-q${String(mq.question_number).padStart(3, '0')}`,
        question_number: mq.question_number,
        stem_jp: mq.stem_jp,
        choices_jp: mq.choices_jp,
        correct_answer: mq.correct_answer || null,
        has_figure: mq.has_figure || false,
        figure_description: mq.figure_description || null,
        syllabus_refs: []
      });
      missCount++;
    }
  }

  // Apply figure updates
  if (review.figure_updates) {
    for (const fu of review.figure_updates) {
      const q = exam.questions.find(q => q.question_number === fu.question_number);
      if (!q) continue;
      if (fu.has_figure !== undefined) q.has_figure = fu.has_figure;
      if (fu.figure_description) q.figure_description = fu.figure_description;
      figCount++;
    }
  }

  // Remove ghost questions (Q>100) and sort
  exam.questions = exam.questions.filter(q => q.question_number >= 1 && q.question_number <= 100);
  exam.questions.sort((a, b) => a.question_number - b.question_number);
  exam.question_count = exam.questions.length;

  writeFileSync(examFile, JSON.stringify(exam, null, 2) + '\n', 'utf8');

  console.log(`${examId}: fix=${fixCount} miss=${missCount} fig=${figCount} → ${exam.questions.length}q`);
  stats.exams++;
  stats.fixes += fixCount;
  stats.missing += missCount;
  stats.figures += figCount;
}

// Rebuild question_bank.json
console.log('\nRebuilding question_bank.json...');
const allQuestions = [];
const yearFiles = readdirSync(BY_YEAR_DIR).filter(f => f.endsWith('.json')).sort();
for (const yf of yearFiles) {
  const d = JSON.parse(readFileSync(join(BY_YEAR_DIR, yf), 'utf8'));
  allQuestions.push(...d.questions);
}

const bank = {
  total_exams: yearFiles.length,
  total_questions: allQuestions.length,
  questions: allQuestions
};
writeFileSync(BANK_FILE, JSON.stringify(bank, null, 2) + '\n', 'utf8');

console.log(`\n=== DONE ===`);
console.log(`Exams processed: ${stats.exams}`);
console.log(`Fixes applied: ${stats.fixes}`);
console.log(`Missing added: ${stats.missing}`);
console.log(`Figure updates: ${stats.figures}`);
console.log(`question_bank.json: ${bank.total_questions} questions from ${bank.total_exams} exams`);
if (stats.errors.length > 0) {
  console.log(`\nWarnings (${stats.errors.length}):`);
  stats.errors.forEach(e => console.log(`  ⚠ ${e}`));
}
