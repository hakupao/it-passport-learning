#!/usr/bin/env node
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { execFileSync } from 'child_process';
import 'dotenv/config';

const PAGES_DIR = 'data/ip/exams/pages';
const BY_YEAR_DIR = 'data/ip/exams/by_year';
const BANK_FILE = 'data/ip/exams/question_bank.json';
const FIGURES_DIR = 'data/ip/exams/figures';
const MAPPING_DIR = 'data/ip/exams/mappings';

const client = new Anthropic();
const PAGES_PER_BATCH = 3;
const CONCURRENT_BATCHES = 4;
const INTER_BATCH_DELAY_MS = 500;

const VISION_PROMPT = `You are analyzing pages from a Japanese IT Passport exam paper.

For each page image, identify all questions and their vertical positions.

Return a JSON array with one object per page:
[
  {
    "page": "page-03.png",
    "page_number": 3,
    "questions": [
      {
        "q": 5,
        "y1": 0.55,
        "y2": 0.98,
        "fig": false
      },
      {
        "q": 6,
        "y1": 0.02,
        "y2": 0.54,
        "fig": true,
        "fig_bbox": [0.08, 0.18, 0.92, 0.45],
        "fig_type": "table"
      }
    ]
  }
]

Rules:
- y1/y2 = top/bottom of the FULL question area (including choices) as fraction of page height (0.0=top, 1.0=bottom)
- fig_bbox = [x1, y1, x2, y2] as fractions of page width/height — bounding box of the figure ONLY
- fig = true when question has a visual element: table, chart, graph, diagram, flowchart, network diagram, code block, or formula with special layout
- fig_type: "table" | "chart" | "diagram" | "flowchart" | "code" | "formula" | "other"
- Pages with no questions (instructions, answer sheets): return empty questions array
- Return ONLY valid JSON, no markdown fences, no commentary`;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function processPageBatch(examId, pageFiles, pagesDir) {
  const content = [];

  for (const pf of pageFiles) {
    const pageNum = parseInt(pf.match(/\d+/)[0]);
    const imgData = readFileSync(join(pagesDir, pf));
    const base64 = imgData.toString('base64');

    content.push(
      { type: 'text', text: `--- ${pf} (page ${pageNum}) ---` },
      { type: 'image', source: { type: 'base64', media_type: 'image/png', data: base64 } }
    );
  }

  content.push({ type: 'text', text: VISION_PROMPT });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content }]
  });

  const text = response.content[0].text;
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error(`No JSON in response for ${examId}: ${pageFiles.join(',')}`);

  return JSON.parse(jsonMatch[0]);
}

async function processExam(examId) {
  const mappingFile = join(MAPPING_DIR, `${examId}.json`);

  if (existsSync(mappingFile)) {
    console.log(`  [skip] ${examId}`);
    return JSON.parse(readFileSync(mappingFile, 'utf8'));
  }

  const pagesDir = join(PAGES_DIR, examId);
  const pages = readdirSync(pagesDir)
    .filter(f => f.endsWith('.png'))
    .sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]));

  console.log(`\n[${examId}] ${pages.length} pages`);

  const batches = [];
  for (let i = 0; i < pages.length; i += PAGES_PER_BATCH) {
    batches.push(pages.slice(i, i + PAGES_PER_BATCH));
  }

  const allPages = [];

  for (let i = 0; i < batches.length; i += CONCURRENT_BATCHES) {
    const slice = batches.slice(i, i + CONCURRENT_BATCHES);
    const promises = slice.map(batch => processPageBatch(examId, batch, pagesDir));
    const results = await Promise.all(promises);

    for (const pageResults of results) {
      allPages.push(...pageResults);
    }

    const qCount = results.flat().reduce((s, r) => s + r.questions.length, 0);
    const batchEnd = Math.min(i + CONCURRENT_BATCHES, batches.length);
    console.log(`  batches ${i + 1}-${batchEnd}/${batches.length}: ${qCount} questions`);

    if (i + CONCURRENT_BATCHES < batches.length) await sleep(INTER_BATCH_DELAY_MS);
  }

  const mapping = {
    exam_id: examId,
    total_pages: pages.length,
    total_questions: allPages.reduce((s, p) => s + p.questions.length, 0),
    pages: allPages
  };

  writeFileSync(mappingFile, JSON.stringify(mapping, null, 2) + '\n');
  console.log(`  [saved] ${examId}: ${mapping.total_questions} questions mapped`);
  return mapping;
}

function cropFigures(allMappings) {
  mkdirSync(FIGURES_DIR, { recursive: true });

  const cropJobs = [];

  for (const mapping of allMappings) {
    const examId = mapping.exam_id;
    for (const page of mapping.pages) {
      for (const q of page.questions) {
        if (!q.fig || !q.fig_bbox) continue;

        const pageFile = join(PAGES_DIR, examId, page.page);
        if (!existsSync(pageFile)) continue;

        const qId = `${examId}-q${String(q.q).padStart(3, '0')}`;
        const outFile = join(FIGURES_DIR, `${qId}.png`);

        if (existsSync(outFile)) continue;

        cropJobs.push({ source: pageFile, output: outFile, bbox_pct: q.fig_bbox, id: qId });
      }
    }
  }

  if (cropJobs.length === 0) {
    console.log('\nNo new figures to crop.');
    return;
  }

  console.log(`\nCropping ${cropJobs.length} figures...`);

  const pyScript = [
    'import json, sys',
    'from PIL import Image',
    'jobs = json.load(sys.stdin)',
    'for j in jobs:',
    '    img = Image.open(j["source"])',
    '    w, h = img.size',
    '    x1, y1, x2, y2 = j["bbox_pct"]',
    '    box = (int(x1*w), int(y1*h), int(x2*w), int(y2*h))',
    '    crop = img.crop(box)',
    '    crop.save(j["output"])',
    '    print(f"  cropped {j[\'id\']}")',
  ].join('\n');

  execFileSync('python3', ['-c', pyScript], {
    input: JSON.stringify(cropJobs),
    stdio: ['pipe', 'inherit', 'inherit'],
    maxBuffer: 10 * 1024 * 1024
  });

  console.log(`  [done] ${cropJobs.length} figures cropped`);
}

function updateQuestionJson(allMappings) {
  const qb = JSON.parse(readFileSync(BANK_FILE, 'utf8'));

  const sourceMap = new Map();
  for (const mapping of allMappings) {
    const examId = mapping.exam_id;
    for (const page of mapping.pages) {
      for (const q of page.questions) {
        const qId = `${examId}-q${String(q.q).padStart(3, '0')}`;
        const entry = {
          page_image: `pages/${examId}/${page.page}`,
          page_number: page.page_number,
          question_bbox_pct: { y1: q.y1, y2: q.y2 }
        };
        if (q.fig && q.fig_bbox) {
          entry.figure_bbox_pct = { x1: q.fig_bbox[0], y1: q.fig_bbox[1], x2: q.fig_bbox[2], y2: q.fig_bbox[3] };
          entry.figure_type = q.fig_type || null;
          entry.figure_path = `figures/${qId}.png`;
        }
        sourceMap.set(qId, entry);
      }
    }
  }

  let updated = 0;
  for (const q of qb.questions) {
    const src = sourceMap.get(q.id);
    if (src) {
      q.source = { page_image: src.page_image, page_number: src.page_number, question_bbox_pct: src.question_bbox_pct };
      if (src.figure_path) {
        q.figure_path = src.figure_path;
        q.figure_bbox_pct = src.figure_bbox_pct;
        q.figure_type = src.figure_type;
      }
      updated++;
    }
  }

  writeFileSync(BANK_FILE, JSON.stringify(qb, null, 2) + '\n');
  console.log(`\n[question_bank] ${updated}/${qb.questions.length} questions updated`);

  for (const mapping of allMappings) {
    const examId = mapping.exam_id;
    const examFile = join(BY_YEAR_DIR, `${examId}.json`);
    if (!existsSync(examFile)) continue;

    const exam = JSON.parse(readFileSync(examFile, 'utf8'));
    for (const q of exam.questions) {
      const src = sourceMap.get(q.id);
      if (src) {
        q.source = { page_image: src.page_image, page_number: src.page_number, question_bbox_pct: src.question_bbox_pct };
        if (src.figure_path) {
          q.figure_path = src.figure_path;
          q.figure_bbox_pct = src.figure_bbox_pct;
          q.figure_type = src.figure_type;
        }
      }
    }
    writeFileSync(examFile, JSON.stringify(exam, null, 2) + '\n');
  }
  console.log(`[by_year] ${allMappings.length} exam files updated`);
}

async function main() {
  mkdirSync(MAPPING_DIR, { recursive: true });

  const examDirs = readdirSync(PAGES_DIR)
    .filter(d => !d.startsWith('.') && existsSync(join(PAGES_DIR, d)))
    .sort();

  console.log(`=== Question-to-Page Mapping + Figure Extraction ===`);
  console.log(`Exams: ${examDirs.length} | Pages dir: ${PAGES_DIR}\n`);

  const targetExam = process.argv[2];
  const examsToProcess = targetExam ? [targetExam] : examDirs;

  const allMappings = [];

  for (const examId of examsToProcess) {
    if (!examDirs.includes(examId)) {
      console.error(`Exam ${examId} not found in ${PAGES_DIR}`);
      continue;
    }
    const mapping = await processExam(examId);
    allMappings.push(mapping);
  }

  cropFigures(allMappings);
  updateQuestionJson(allMappings);

  const totalFigs = allMappings.reduce((s, m) =>
    s + m.pages.reduce((s2, p) => s2 + p.questions.filter(q => q.fig).length, 0), 0);
  console.log(`\n=== Done ===`);
  console.log(`Mapped: ${allMappings.reduce((s, m) => s + m.total_questions, 0)} questions`);
  console.log(`Figures: ${totalFigs} identified and cropped`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
