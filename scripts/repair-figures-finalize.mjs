#!/usr/bin/env node
/**
 * Session 71 — Figure repair: finalize (deterministic, main-loop, after verify rounds converge).
 * Applies the converged repair outcome to the real data:
 *   - PASS figures: re-crop (padded bbox) into figures/{id}.png (overwriting), update question_bank + by_year
 *   - confirmed NO-FIGURE: strip has_figure/figure_* fields, archive old crop
 *   - unresolved: leave data as-is, just report (manual follow-up)
 * Old (bad) crops are archived to figures/_rejected/ before overwrite (Rule B spirit).
 *
 * Input contract: data/ip/exams/.tmp/repair/finalize_input.json
 *   { pass:[{id, page_path, bbox:{x1,y1,x2,y2}}], no_figure:[{id, reason}], unresolved:[{id, reason}] }
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync, copyFileSync } from 'fs';
import { execFileSync } from 'child_process';

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const FIGURES_DIR = `${ROOT}/data/ip/exams/figures`;
const REJECTED_DIR = `${FIGURES_DIR}/_rejected`;
const BY_YEAR_DIR = `${ROOT}/data/ip/exams/by_year`;
const BANK_FILE = `${ROOT}/data/ip/exams/question_bank.json`;
const INPUT = `${ROOT}/data/ip/exams/.tmp/repair/finalize_input.json`;

const fin = JSON.parse(readFileSync(INPUT, 'utf8'));
const pass = fin.pass || [];
const noFig = fin.no_figure || [];
const unresolved = fin.unresolved || [];
mkdirSync(REJECTED_DIR, { recursive: true });

// 1. Archive old crops for everything we're touching (Rule B: keep failed artifacts)
const touched = [...pass, ...noFig].map((x) => x.id);
let archived = 0;
for (const id of touched) {
  const cur = `${FIGURES_DIR}/${id}.png`;
  if (existsSync(cur)) { copyFileSync(cur, `${REJECTED_DIR}/${id}.png`); archived++; }
}

// 2. Re-crop PASS figures (padded bbox) -> overwrite figures/{id}.png
let cropped = 0;
if (pass.length) {
  const jobs = pass.map((p) => ({ id: p.id, page_path: p.page_path, bbox: p.bbox, output: `${FIGURES_DIR}/${p.id}.png` }));
  const py = [
    'import json, sys',
    'from PIL import Image',
    'jobs = json.load(sys.stdin); ok = 0',
    'for j in jobs:',
    '    try:',
    '        img = Image.open(j["page_path"]); w,h = img.size; b = j["bbox"]',
    '        box = (max(0,int(b["x1"]*w)), max(0,int(b["y1"]*h)), min(w,int(b["x2"]*w)), min(h,int(b["y2"]*h)))',
    '        if box[2]>box[0] and box[3]>box[1]:',
    '            img.crop(box).save(j["output"]); ok += 1',
    '        else: print(f"  [warn] {j[\'id\']}: bad box {box}", file=sys.stderr)',
    '    except Exception as e: print(f"  [error] {j[\'id\']}: {e}", file=sys.stderr)',
    'print(ok)',
  ].join('\n');
  const out = execFileSync('python3', ['-c', py], { input: JSON.stringify(jobs), maxBuffer: 50 * 1024 * 1024 }).toString();
  cropped = parseInt(out.trim().split('\n').pop(), 10) || 0;
}

// 2b. Remove orphan PNGs for demoted (no-figure) questions (already archived above)
let removed = 0;
for (const n of noFig) {
  const f = `${FIGURES_DIR}/${n.id}.png`;
  if (existsSync(f)) { try { renameSync(f, `${REJECTED_DIR}/${n.id}.demoted.png`); removed++; } catch {} }
}

// 3. Update JSON (question_bank + by_year)
const passMap = new Map(pass.map((p) => [p.id, p]));
const noFigSet = new Set(noFig.map((n) => n.id));

function applyToQuestion(q) {
  if (passMap.has(q.id)) {
    const p = passMap.get(q.id);
    q.has_figure = true;
    q.figure_path = `figures/${q.id}.png`;
    q.figure_bbox_pct = p.bbox;          // store the bbox actually used (padded)
    q.figure_repaired = true;            // provenance flag (Session 71)
    // cross-page specials: the figure lives on a different page than originally mapped.
    // D-145: 設問ページ (`source.page_image`) は **潰さない**。図ページは `source.figure_page_*` に書く。
    // (旧実装は source を丸ごと上書きして設問ページの記録と question_bbox_pct を失っていた。
    //  その経路で書かれた 5 問 = `figure_source_corrected` は D-145 §6 で ⑦-1 の実読定案に回した)
    if (p.page_image) {
      const src = (q.source ??= {});
      if (src.page_image === p.page_image) {
        // 図ページ == 設問ページ → 既定 (欠如) に戻す。「跨ページを是正した」印も一緒に降ろす
        // (Rule D LOW-4: フィールドを消して flag だけ残すと、跨ページでない問が跨ページ扱いで名簿に載る)
        delete src.figure_page_image; delete src.figure_page_number;
        delete q.figure_source_corrected;
      } else {
        const m = /page-(\d+)\.png$/.exec(p.page_image);
        if (!m) throw new Error(`${q.id}: page_image «${p.page_image}» が pages/<exam>/page-NN.png 形でない (D-145 B7)`);
        src.figure_page_image = p.page_image;
        src.figure_page_number = parseInt(m[1], 10);
        q.figure_source_corrected = true;
      }
    }
    return 'pass';
  }
  if (noFigSet.has(q.id)) {
    q.has_figure = false;
    delete q.figure_path;
    delete q.figure_bbox_pct;
    delete q.figure_type;
    delete q.figure_description;
    q.figure_repaired = true;
    return 'nofig';
  }
  return null;
}

const qb = JSON.parse(readFileSync(BANK_FILE, 'utf8'));
let qbPass = 0, qbNo = 0;
for (const q of qb.questions) { const r = applyToQuestion(q); if (r === 'pass') qbPass++; else if (r === 'nofig') qbNo++; }
writeFileSync(BANK_FILE, JSON.stringify(qb, null, 2) + '\n');

// by_year: group ids by exam
const examIds = new Set(touched.map((id) => id.split('-')[0]));
let examFiles = 0;
for (const exam of examIds) {
  const f = `${BY_YEAR_DIR}/${exam}.json`;
  if (!existsSync(f)) continue;
  const data = JSON.parse(readFileSync(f, 'utf8'));
  for (const q of data.questions) applyToQuestion(q);
  writeFileSync(f, JSON.stringify(data, null, 2) + '\n');
  examFiles++;
}

console.log('=== finalize ===');
console.log(`archived old crops: ${archived} → ${REJECTED_DIR}`);
console.log(`re-cropped PASS figures: ${cropped}/${pass.length}`);
console.log(`question_bank: ${qbPass} figures repaired, ${qbNo} demoted to no-figure`);
console.log(`by_year files updated: ${examFiles}`);
console.log(`unresolved (manual follow-up): ${unresolved.length}${unresolved.length ? ' → ' + unresolved.map((u) => u.id).join(', ') : ''}`);
