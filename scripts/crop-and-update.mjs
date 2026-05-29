#!/usr/bin/env node
/**
 * Final step: crop figures and update question JSON with source tracing.
 * Uses merged mappings from data/ip/exams/mappings/final/*.json
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { execFileSync } from 'child_process';

const FINAL_DIR = 'data/ip/exams/mappings/final';
const PAGES_DIR = 'data/ip/exams/pages';
const FIGURES_DIR = 'data/ip/exams/figures';
const BY_YEAR_DIR = 'data/ip/exams/by_year';
const BANK_FILE = 'data/ip/exams/question_bank.json';

mkdirSync(FIGURES_DIR, { recursive: true });

// Step 1: Build source map from all final mappings
console.log('=== Building source map ===');

const sourceMap = new Map();
const cropJobs = [];

const finalFiles = readdirSync(FINAL_DIR).filter(f => f.endsWith('.json')).sort();

for (const ff of finalFiles) {
  const mapping = JSON.parse(readFileSync(join(FINAL_DIR, ff), 'utf8'));
  const examId = mapping.exam_id;

  for (const page of (mapping.pages || [])) {
    for (const q of page.questions) {
      const qId = `${examId}-q${String(q.q).padStart(3, '0')}`;

      const entry = {
        page_image: `pages/${examId}/${page.page}`,
        page_number: page.page_number
      };

      if (q.fig && q.fig_bbox) {
        entry.figure_bbox_pct = {
          x1: q.fig_bbox[0], y1: q.fig_bbox[1],
          x2: q.fig_bbox[2], y2: q.fig_bbox[3]
        };
        entry.figure_type = q.fig_type || null;
        entry.figure_path = `figures/${qId}.png`;

        const pageFile = join(PAGES_DIR, examId, page.page);
        const outFile = join(FIGURES_DIR, `${qId}.png`);

        if (existsSync(pageFile) && !existsSync(outFile)) {
          cropJobs.push({
            source: pageFile,
            output: outFile,
            bbox_pct: q.fig_bbox,
            id: qId
          });
        }
      }

      sourceMap.set(qId, entry);
    }
  }

  // Also map questions from question_pages that weren't in the pages array
  for (const [qs, pageNum] of Object.entries(mapping.question_pages || {})) {
    const qId = `${examId}-q${String(parseInt(qs)).padStart(3, '0')}`;
    if (!sourceMap.has(qId)) {
      const pageFile = `page-${String(pageNum).padStart(2, '0')}.png`;
      sourceMap.set(qId, {
        page_image: `pages/${examId}/${pageFile}`,
        page_number: pageNum
      });
    }
  }
}

console.log(`Source entries: ${sourceMap.size}`);
console.log(`Crop jobs: ${cropJobs.length}`);

// Step 2: Crop figures
if (cropJobs.length > 0) {
  console.log(`\n=== Cropping ${cropJobs.length} figures ===`);

  const pyScript = [
    'import json, sys',
    'from PIL import Image',
    'jobs = json.load(sys.stdin)',
    'ok = 0',
    'for j in jobs:',
    '    try:',
    '        img = Image.open(j["source"])',
    '        w, h = img.size',
    '        x1, y1, x2, y2 = j["bbox_pct"]',
    '        box = (max(0,int(x1*w)), max(0,int(y1*h)), min(w,int(x2*w)), min(h,int(y2*h)))',
    '        if box[2]>box[0] and box[3]>box[1]:',
    '            crop = img.crop(box)',
    '            crop.save(j["output"])',
    '            ok += 1',
    '        else:',
    '            print(f"  [warn] {j[\'id\']}: invalid bbox {box}", file=sys.stderr)',
    '    except Exception as e:',
    '        print(f"  [error] {j[\'id\']}: {e}", file=sys.stderr)',
    'print(f"Cropped {ok}/{len(jobs)} figures")',
  ].join('\n');

  execFileSync('python3', ['-c', pyScript], {
    input: JSON.stringify(cropJobs),
    stdio: ['pipe', 'inherit', 'inherit'],
    maxBuffer: 20 * 1024 * 1024
  });
} else {
  console.log('\nNo new figures to crop.');
}

// Step 3: Update question_bank.json
console.log('\n=== Updating question JSON ===');

const qb = JSON.parse(readFileSync(BANK_FILE, 'utf8'));
let updated = 0, figUpdated = 0;

for (const q of qb.questions) {
  const src = sourceMap.get(q.id);
  if (!src) continue;

  q.source = { page_image: src.page_image, page_number: src.page_number };
  updated++;

  if (src.figure_path) {
    q.figure_path = src.figure_path;
    q.figure_bbox_pct = src.figure_bbox_pct;
    q.figure_type = src.figure_type;
    figUpdated++;
  }
}

writeFileSync(BANK_FILE, JSON.stringify(qb, null, 2) + '\n');
console.log(`[question_bank] ${updated} source + ${figUpdated} figure paths`);

// Step 4: Update by_year files
let examUpdated = 0;
for (const ff of finalFiles) {
  const mapping = JSON.parse(readFileSync(join(FINAL_DIR, ff), 'utf8'));
  const examFile = join(BY_YEAR_DIR, `${mapping.exam_id}.json`);
  if (!existsSync(examFile)) continue;

  const exam = JSON.parse(readFileSync(examFile, 'utf8'));
  for (const q of exam.questions) {
    const src = sourceMap.get(q.id);
    if (!src) continue;
    q.source = { page_image: src.page_image, page_number: src.page_number };
    if (src.figure_path) {
      q.figure_path = src.figure_path;
      q.figure_bbox_pct = src.figure_bbox_pct;
      q.figure_type = src.figure_type;
    }
  }
  writeFileSync(examFile, JSON.stringify(exam, null, 2) + '\n');
  examUpdated++;
}

console.log(`[by_year] ${examUpdated} exam files updated`);

// Step 5: Stats
const figFiles = readdirSync(FIGURES_DIR).filter(f => f.endsWith('.png')).length;
console.log(`\n=== Done ===`);
console.log(`Questions with source: ${updated}/2900`);
console.log(`Figure images: ${figFiles}`);
