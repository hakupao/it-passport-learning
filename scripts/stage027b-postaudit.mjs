#!/usr/bin/env node
/**
 * Stage 2.7b — POST-AUDIT adjudication. The Rule A audit (general-purpose lane) surfaced issues the
 * mechanical reconcile missed (chiefly: the NFKC+strip similarity is punctuation-blind, so comma↔period
 * garble and a choice-set swap on a figure-choice question slipped through). This patch applies ONLY the
 * corrections that the already-harvested DOUBLE-BLIND reads (A=explore, B=code-reviewer) corroborate, and
 * re-flags the ones we cannot fix from those reads (inline-table garbles → no clean double-blind source).
 *
 * Sourced from _reads_master.json (not hand-typed) where possible. INVARIANTS unchanged:
 * correct_answer / answer_keys / figure_path / group_id / source. History: *_jp_s027b2_prev keeps the
 * value this patch overwrites; the original pre-s027 *_corrupted_backup is untouched.
 *
 * Usage: node scripts/stage027b-postaudit.mjs [--commit]
 */
import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'fs';

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const EXAMS = `${ROOT}/data/ip/exams`;
const OUT = `${EXAMS}/.tmp/s027b`;
const COMMIT = process.argv.includes('--commit');

const reads = JSON.parse(readFileSync(`${OUT}/_reads_master.json`, 'utf8'));
const qb = JSON.parse(readFileSync(`${EXAMS}/question_bank.json`, 'utf8'));
const byId = new Map(qb.questions.map((q) => [q.id, q]));
const byYearCache = new Map();
const loadByYear = (e) => { if (!byYearCache.has(e)) byYearCache.set(e, JSON.parse(readFileSync(`${EXAMS}/by_year/${e}.json`, 'utf8'))); return byYearCache.get(e); };
const eachCopy = (id, fn) => { const q = byId.get(id); if (q) fn(q); const qy = loadByYear(id.split('-')[0]).questions.find((x) => x.id === id); if (qy) fn(qy); };

const log = [];

// helper: apply a choices replacement sourced from a blind lane read
function fixChoicesFromBlind(id, lane, severity, note) {
  const src = reads[`${id}__${lane}`];
  if (!src || !src.printed_choices) { console.error(`! ${id}: no blind ${lane} choices`); return; }
  const newCh = src.printed_choices;
  const q = byId.get(id);
  log.push({ id, kind: 'choices', severity, note, old: q.choices_jp, new: newCh });
  if (COMMIT) eachCopy(id, (x) => {
    if (!x.choices_jp_corrupted_backup) x.choices_jp_corrupted_backup = x.choices_jp;
    x.choices_jp_s027b2_prev = x.choices_jp; x.choices_jp = newCh;
    x.choices_resourced_s7xb = true; x.s027b_severity = severity; x.s027b_postaudit = true;
    delete x.s027_unresolved; delete x.s027_choice_anomaly;
  });
}
// helper: targeted string replace in stem (minimal, surgical)
function fixStemReplace(id, from, to, note) {
  const q = byId.get(id);
  if (!q.stem_jp.includes(from)) { console.error(`! ${id}: stem does not contain ${JSON.stringify(from)}`); return; }
  log.push({ id, kind: 'stem_replace', note, from, to });
  if (COMMIT) eachCopy(id, (x) => {
    if (x.stem_jp.includes(from)) { x.stem_jp_s027b2_prev = x.stem_jp; x.stem_jp = x.stem_jp.split(from).join(to); x.stem_resourced_s7xb = true; x.s027b_postaudit = true; }
  });
}
// helper: re-flag a question we cannot safely auto-fix (track as residual, never silently "fixed")
function reflag(id, note) {
  const q = byId.get(id);
  log.push({ id, kind: 'reflag', note });
  if (COMMIT) eachCopy(id, (x) => { delete x.s027b_verified_ok; x.s027_unresolved = true; x.s027b_stem_table_garble = true; });
}

// ── corrections (double-blind corroborated; see evidence/stage_027b_repair_audit) ──
// q025: figure-choice swap — stored choices were a DIFFERENT question's (情報セキュリティ). Both blind lanes
// read the four DFD-diagram descriptions; answer letter ア is correct for the page once choices are right.
fixChoicesFromBlind('2015h27h-q025', 'A', 'content_mismatch', 'choice-set swap: stored options belonged to another question; replaced with double-blind [図] DFD descriptions (answer ア now maps correctly)');
// q090: ウ/エ thousands-separator garble (2.000→2,000 / 3.400→3,400); NFKC strip hid it. Both lanes agree commas.
fixChoicesFromBlind('2010h22a-q090', 'A', 'ocr_garble_critical', 'thousands-separator garble in choices (period→comma); double-blind agree {1,300/1,600/2,000/3,400}');
// q089: choice ウ 発生顔度→発生頻度 + エ trailing 〔ストラテジ〕 bleed. Both lanes agree on the clean text.
fixChoicesFromBlind('2010h22a-q089', 'A', 'ocr_garble_critical', 'choice ウ 顔度→頻度 + drop trailing 〔ストラテジ〕 bleed; double-blind corroborated');
// q087: stem 一 garbled into ーー (いずれかーー方→いずれか一方). Surgical replace.
fixStemReplace('2015h27a-q087', 'いずれかーー方', 'いずれか一方', 'OCR: 一 rendered as ーー');

// ── re-flags (inline-table garble in stem; no clean double-blind table source → track, not silently clear) ──
reflag('2014h26a-q099', '図1/顧客表 inline-table reproductions in stem are garbled (顧客名→社員名); choices+answer correct, figure image authoritative');
reflag('2012h24h-q091', '表3 inline-table date error in stem (No.2 申込日 8月7日→9月2日); answer unaffected, shared-table → verify siblings');

// ── report ──
console.log(`${COMMIT ? 'APPLYING' : 'DRY-RUN'} post-audit adjudication: ${log.length} actions`);
for (const e of log) {
  if (e.kind === 'choices') console.log(`  CHOICES ${e.id} [${e.severity}]\n     OLD ${JSON.stringify(JSON.stringify(e.old).slice(0, 80))}\n     NEW ${JSON.stringify(JSON.stringify(e.new).slice(0, 80))}\n     (${e.note})`);
  else if (e.kind === 'stem_replace') console.log(`  STEM   ${e.id}  ${JSON.stringify(e.from)} → ${JSON.stringify(e.to)}  (${e.note})`);
  else console.log(`  REFLAG ${e.id}  (${e.note})`);
}

if (COMMIT) {
  const qbPath = `${EXAMS}/question_bank.json`;
  if (!existsSync(`${qbPath}.pre-s027b2`)) copyFileSync(qbPath, `${qbPath}.pre-s027b2`);
  writeFileSync(qbPath, JSON.stringify(qb, null, 2));
  for (const [exam, by] of byYearCache) {
    const p = `${EXAMS}/by_year/${exam}.json`;
    if (!existsSync(`${p}.pre-s027b2`)) copyFileSync(p, `${p}.pre-s027b2`);
    writeFileSync(p, JSON.stringify(by, null, 2));
  }
  writeFileSync(`${OUT}/_postaudit.json`, JSON.stringify(log, null, 2));
  console.log('committed. backups: *.pre-s027b2. log: _postaudit.json');
} else {
  console.log('(dry-run — re-run with --commit)');
}
