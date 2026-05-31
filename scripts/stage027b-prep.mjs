#!/usr/bin/env node
/**
 * Stage 2.7b — PREP for the hi-dpi / multi-page second pass over the 71 residual flags
 * (62 s027_unresolved + 9 s027_choice_anomaly).
 *
 * Root cause learned in Session 74 (validated on 2015h27a-q086): the residual defects are
 * dominated by (a) MULTI-PAGE questions whose choices spill onto page N+1 (the page-unit blind
 * scan saw only page N → emptied/garbled choices), and (b) dense table / formula / figure-choice
 * blocks that the 173dpi page could not resolve. A 300dpi FULL page does NOT help Claude vision
 * (it downsamples to ~1.15MP either way) — only a CROP to a sub-region raises effective resolution.
 *
 * This script, per flagged question:
 *   - resolves source page N (and N+1 if it exists) from <exam>_ip_qs.pdf
 *   - renders, for each needed page, a 300dpi FULL image + 3 overlapping horizontal BANDS
 *     (top/mid/bot) via pdftoppm -x/-y/-W/-H (no external crop tool needed)
 *   - emits manifest_blind.json (image paths + qn/id ONLY — NO stored text → echo-proof for the
 *     blind transcription agents) and stored_ref.json (stored stem/choices + *_corrupted_backup,
 *     used ONLY by the main-loop reconcile, never shown to agents).
 *
 * Output: data/ip/exams/.tmp/s027b/{hidpi/<exam>/page-NN-{full,top,mid,bot}.png, manifest_blind.json, stored_ref.json}
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { execFileSync } from 'child_process';

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const EXAMS = `${ROOT}/data/ip/exams`;
const OUT = `${EXAMS}/.tmp/s027b`;
const HIDPI = `${OUT}/hidpi`;
const DPI = 300;

const qb = JSON.parse(readFileSync(`${EXAMS}/question_bank.json`, 'utf8'));
const flagged = qb.questions.filter((q) => q.s027_unresolved || q.s027_choice_anomaly);
console.log(`flagged questions: ${flagged.length}`);

// pdf page count cache
const pdfPages = new Map();
const pageCount = (exam) => {
  if (!pdfPages.has(exam)) {
    const info = execFileSync('pdfinfo', [`${ROOT}/data/ip/sources/exams/${exam}_ip_qs.pdf`]).toString();
    pdfPages.set(exam, parseInt(info.match(/Pages:\s+(\d+)/)[1], 10));
  }
  return pdfPages.get(exam);
};

// collect unique (exam,page) to render: page N and N+1 for every flagged question
const need = new Map(); // key exam|page -> {exam,page}
for (const q of flagged) {
  const exam = q.id.split('-')[0];
  const n = q.source && q.source.page_number;
  if (!n) { console.error(`! ${q.id} has no source.page_number`); continue; }
  const max = pageCount(exam);
  for (const p of [n, n + 1]) {
    if (p >= 1 && p <= max) need.set(`${exam}|${p}`, { exam, page: p });
  }
}
console.log(`unique pages to render (N + N+1): ${need.size}`);

const dims = (png) => {
  const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', png]).toString();
  return { w: +out.match(/pixelWidth:\s+(\d+)/)[1], h: +out.match(/pixelHeight:\s+(\d+)/)[1] };
};

// render one page: full + 3 bands. returns the relative paths produced.
function renderPage(exam, page) {
  const dir = `${HIDPI}/${exam}`;
  mkdirSync(dir, { recursive: true });
  const pdf = `${ROOT}/data/ip/sources/exams/${exam}_ip_qs.pdf`;
  const base = `${dir}/page-${page}`;
  const fullPng = `${base}-full.png`;
  if (!existsSync(fullPng)) {
    execFileSync('pdftoppm', ['-png', '-r', String(DPI), '-f', String(page), '-l', String(page), '-singlefile', pdf, `${base}-full`]);
  }
  const { w, h } = dims(fullPng);
  // 3 overlapping bands (~45% height each)
  const bands = [
    ['top', 0, Math.round(h * 0.45)],
    ['mid', Math.round(h * 0.28), Math.round(h * 0.45)],
    ['bot', Math.round(h * 0.55), h - Math.round(h * 0.55)],
  ];
  for (const [name, y, bh] of bands) {
    const p = `${base}-${name}.png`;
    if (!existsSync(p)) {
      execFileSync('pdftoppm', ['-png', '-r', String(DPI), '-f', String(page), '-l', String(page), '-singlefile',
        '-x', '0', '-y', String(y), '-W', String(w), '-H', String(bh), pdf, `${base}-${name}`]);
    }
  }
  return { full: fullPng, top: `${base}-top.png`, mid: `${base}-mid.png`, bot: `${base}-bot.png` };
}

// render all needed pages
let rendered = 0;
const pageImgs = new Map(); // exam|page -> {full,top,mid,bot}
for (const { exam, page } of need.values()) {
  pageImgs.set(`${exam}|${page}`, renderPage(exam, page));
  rendered++;
  if (rendered % 20 === 0) console.log(`  rendered ${rendered}/${need.size} pages`);
}
console.log(`rendered ${rendered} pages × 4 imgs`);

// build manifests
const manifestBlind = [];
const storedRef = {};
for (const q of flagged) {
  const exam = q.id.split('-')[0];
  const n = q.source.page_number;
  const max = pageCount(exam);
  const imgN = pageImgs.get(`${exam}|${n}`);
  const imgN1 = (n + 1 <= max) ? pageImgs.get(`${exam}|${n + 1}`) : null;
  // curated image set for the agent: stem+same-page (N full/mid/bot) + spilled choices (N+1 top/full)
  const images = [
    { tag: `page${n}-full`, path: imgN.full },
    { tag: `page${n}-mid`, path: imgN.mid },
    { tag: `page${n}-bot`, path: imgN.bot },
  ];
  if (imgN1) {
    images.push({ tag: `page${n + 1}-top`, path: imgN1.top });
    images.push({ tag: `page${n + 1}-full`, path: imgN1.full });
  }
  manifestBlind.push({
    id: q.id,
    qn: q.question_number,
    exam,
    page_number: n,
    has_next_page: !!imgN1,
    has_figure: !!q.has_figure,
    figure_type: q.figure_type || null,
    images,
  });
  storedRef[q.id] = {
    qn: q.question_number,
    stem_jp: q.stem_jp,
    choices_jp: q.choices_jp,
    correct_answer: q.correct_answer,
    stem_backup: q.stem_jp_corrupted_backup || null,
    choices_backup: q.choices_jp_corrupted_backup || null,
    flag: q.s027_choice_anomaly ? 'anomaly' : 'unresolved',
    resourced: !!(q.stem_resourced_s7x || q.choices_resourced_s7x),
    figure_description: q.figure_description || null,
  };
}

mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/manifest_blind.json`, JSON.stringify(manifestBlind, null, 2));
writeFileSync(`${OUT}/stored_ref.json`, JSON.stringify(storedRef, null, 2));
console.log(`wrote manifest_blind.json (${manifestBlind.length}) + stored_ref.json`);
console.log(`done. images under ${HIDPI}`);
