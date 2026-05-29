#!/usr/bin/env node
// Stage 2.6 — 確実欠陥の即時修復 (D-119: 確実→即時修+backup)。ユーザー承認済(今すぐ適用)。
// 対象: stem 復元 4 + has_figure 降格 + figure_path 孤児切離し。
// 原値温存: stem_jp_corrupted_backup / has_figure_demoted_s72 / figure_path_rejected_s72、修正フラグ *_corrected_s72。
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const BANK = path.join(ROOT, 'data/ip/exams/question_bank.json');
const BYYEAR = path.join(ROOT, 'data/ip/exams/by_year');
const FIGREJ = path.join(ROOT, 'data/ip/exams/figures/_rejected');
const findings = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ip/exams/.tmp/s026/phaseB_findings.json'), 'utf8'));
const byFinding = Object.fromEntries(findings.map((f) => [f.qid, f]));
fs.mkdirSync(FIGREJ, { recursive: true });

const bank = JSON.parse(fs.readFileSync(BANK, 'utf8'));
// backup
fs.copyFileSync(BANK, BANK + '.pre-s026-clearfix');

const examOf = (id) => id.split('-q')[0];
const log = [];

const RECOVER = ['2009h21a-q099', '2010h22h-q045', '2011h23tokubetsu-q045', '2018h30h-q001'];
const DEMOTE = ['2010h22h-q045', '2011h23tokubetsu-q045', '2019r01a-q096', '2021r03-q001', '2024r06-q053'];
const DETACH_PATH = ['2010h22h-q099']; // has_figure 既 false, figure_path が孤児

// by_year ロード
const yearCache = {};
const loadYear = (exam) => {
  if (!yearCache[exam]) yearCache[exam] = JSON.parse(fs.readFileSync(path.join(BYYEAR, exam + '.json'), 'utf8'));
  return yearCache[exam];
};
const yearQuestions = (y) => (Array.isArray(y) ? y : y.questions);

function applyToBoth(qid, fn) {
  const bq = bank.questions.find((q) => q.id === qid);
  if (!bq) throw new Error('not in bank: ' + qid);
  fn(bq);
  const y = loadYear(examOf(qid));
  const yq = yearQuestions(y).find((q) => q.id === qid);
  if (yq) fn(yq);
  else log.push(`WARN ${qid} not in by_year`);
}

// 1) stem 復元
for (const qid of RECOVER) {
  const tru = byFinding[qid]?.true_stem;
  if (!tru) throw new Error('no true_stem for ' + qid);
  applyToBoth(qid, (q) => {
    if (!q.stem_jp_corrupted_backup) q.stem_jp_corrupted_backup = q.stem_jp;
    q.stem_jp = tru;
    q.stem_corrected_s72 = true;
  });
  log.push(`RECOVER stem ${qid} (len ${tru.length})`);
}

// 2) has_figure 降格 true->false
for (const qid of DEMOTE) {
  applyToBoth(qid, (q) => {
    if (q.has_figure === true) {
      q.has_figure_demoted_s72 = true;
      q.has_figure = false;
    }
  });
  log.push(`DEMOTE has_figure->false ${qid}`);
}

// 3) figure_path 孤児切離し (Rule B: _rejected 退避)
for (const qid of DETACH_PATH) {
  applyToBoth(qid, (q) => {
    const fp = q.figure_path;
    if (fp) {
      const abs = path.join(ROOT, 'data/ip/exams', fp);
      const base = path.basename(fp);
      if (fs.existsSync(abs)) {
        const dest = path.join(FIGREJ, base);
        if (!fs.existsSync(dest)) fs.renameSync(abs, dest);
        q.figure_path_rejected_s72 = 'figures/_rejected/' + base;
      }
      q.figure_path = null;
      q.figure_detached_s72 = true;
    }
  });
  log.push(`DETACH figure_path ${qid} -> _rejected`);
}

// 書き戻し
fs.writeFileSync(BANK, JSON.stringify(bank, null, 2));
for (const [exam, y] of Object.entries(yearCache)) {
  fs.writeFileSync(path.join(BYYEAR, exam + '.json'), JSON.stringify(y, null, 2));
}

console.log(log.join('\n'));
console.log('\nupdated by_year files:', Object.keys(yearCache).join(', '));
console.log('backup: question_bank.json.pre-s026-clearfix');
