#!/usr/bin/env node
// Stage 2.6 — 内容欠陥の修復 (D-121: duplicate_extraction 4 + choice_swap/choice_ocr)。
// 真値は原本ページから opus 転記員が一字転記。correct_answer は answer_keys と既一致のため不変。
// 原値温存: *_corrupted_backup、フラグ *_corrected_s72。句読点は bank 慣習(，。)に正規化。
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const BANK = path.join(ROOT, 'data/ip/exams/question_bank.json');
const BYYEAR = path.join(ROOT, 'data/ip/exams/by_year');
const tc = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ip/exams/.tmp/s026/true_content.json'), 'utf8'));

// bank 慣習へ句読点正規化 (転記員が使う 、 → ，)。読点のみ。句点。はそのまま。
const normP = (s) => (s == null ? s : s.replace(/、/g, '，'));

const bank = JSON.parse(fs.readFileSync(BANK, 'utf8'));
fs.copyFileSync(BANK, BANK + '.pre-s026-contentfix');

const DUPS = ['2009h21a-q088', '2018h30h-q008', '2018h30h-q100', '2010h22a-q008'];
const FIG = ['2018h30h-q100', '2010h22a-q008']; // 真の問に図表あり → has_figure=true + 裁剪待ち
const examOf = (id) => id.split('-q')[0];
const log = [];
const yearCache = {};
const loadYear = (e) => (yearCache[e] ||= JSON.parse(fs.readFileSync(path.join(BYYEAR, e + '.json'), 'utf8')));
const yq = (y) => (Array.isArray(y) ? y : y.questions);

function applyBoth(qid, fn) {
  const bq = bank.questions.find((q) => q.id === qid); fn(bq);
  const y = loadYear(examOf(qid)); const q2 = yq(y).find((q) => q.id === qid); if (q2) fn(q2);
}

for (const [qid, t] of Object.entries(tc)) {
  const isDup = DUPS.includes(qid);
  applyBoth(qid, (q) => {
    // stem (dup のみ true.stem あり)
    if (t.stem !== undefined) {
      const newStem = normP(t.stem);
      if (newStem !== q.stem_jp) {
        if (!q.stem_jp_corrupted_backup) q.stem_jp_corrupted_backup = q.stem_jp;
        q.stem_jp = newStem;
        q.stem_corrected_s72 = true;
      }
    }
    // choices: 実質相違のみ更新 (正規化後比較)
    if (t.choices) {
      let changed = false; const backup = {};
      for (const k of ['ア', 'イ', 'ウ', 'エ']) {
        const nv = normP(t.choices[k]);
        if (nv !== q.choices_jp[k]) { backup[k] = q.choices_jp[k]; q.choices_jp[k] = nv; changed = true; }
      }
      if (changed) {
        if (!q.choices_jp_corrupted_backup) q.choices_jp_corrupted_backup = backup;
        q.choices_corrected_s72 = true;
        if (isDup) q.duplicate_extraction_fixed_s72 = true;
      }
    }
    // 図表フラグ (裁剪は figure フェーズ)
    if (FIG.includes(qid) && t.has_figure === true && !q.has_figure) {
      q.has_figure = true; q.has_figure_restored_s72 = true; q.figure_pending_crop_s72 = true;
    }
  });
  log.push(`${isDup ? 'DUP' : 'CHOICE'} fix ${qid}${FIG.includes(qid) ? ' +has_figure' : ''}`);
}

fs.writeFileSync(BANK, JSON.stringify(bank, null, 2));
for (const [e, y] of Object.entries(yearCache)) fs.writeFileSync(path.join(BYYEAR, e + '.json'), JSON.stringify(y, null, 2));
console.log(log.join('\n'));
console.log('\nby_year updated:', Object.keys(yearCache).join(', '));
console.log('backup: question_bank.json.pre-s026-contentfix');
