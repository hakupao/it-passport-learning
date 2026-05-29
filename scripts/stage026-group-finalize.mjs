#!/usr/bin/env node
/**
 * Stage 2.6 F-2 (D-120) — finalize shared-figure groups.
 * Reads group_discover.json + group_verify_results.json (PASS/FAIL). For each PASS group:
 *   - owner_qid set  → shared_figure.path = figures/<owner>.png (existing crop reused).
 *   - owner_qid null → move groups_staging/<group_id>.png → figures/_groups/<group_id>.png.
 *   - write a groups.json entry {group_id, exam, label, header_quote, shared_figure{path,page_image,bbox_pct,caption}, member_qids}.
 *   - stamp group_id onto each member question in question_bank + by_year (does NOT alter has_figure of pure members).
 * Backs up question_bank. FAIL groups are skipped and reported.
 * Usage: node scripts/stage026-group-finalize.mjs
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, renameSync } from 'fs';

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const EXAMS = `${ROOT}/data/ip/exams`;
const FIG_DIR = `${EXAMS}/.tmp/s026/fig`;
const STAGING = `${FIG_DIR}/groups_staging`;
const FIGURES = `${EXAMS}/figures`;
const GROUPS_FIG = `${FIGURES}/_groups`;
const BY_YEAR_DIR = `${EXAMS}/by_year`;
const BANK_FILE = `${EXAMS}/question_bank.json`;
const GROUPS_FILE = `${EXAMS}/groups.json`;

const disc = (JSON.parse(readFileSync(`${FIG_DIR}/group_discover.json`, 'utf8')).results) || [];
const verify = (JSON.parse(readFileSync(`${FIG_DIR}/group_verify_results.json`, 'utf8')).results) || [];
const cands = JSON.parse(readFileSync(`${FIG_DIR}/group_candidates.json`, 'utf8')).groups;
const ownerOf = new Map(cands.map((g) => [g.group_id, g.owner_qid]));
const labelOf = new Map(cands.map((g) => [g.group_id, g.label]));
const verdictOf = new Map(verify.map((v) => [v.group_id, v.verdict]));

mkdirSync(GROUPS_FIG, { recursive: true });
const backup = `${BANK_FILE}.pre-s026-groups`;
if (!existsSync(backup)) copyFileSync(BANK_FILE, backup);

const groupEntries = [];
const skipped = [];
const memberGroup = new Map(); // qid -> group_id

for (const r of disc) {
  if (!r || !r.group_id) continue;
  const v = verdictOf.get(r.group_id);
  if (v !== 'PASS') { skipped.push({ group_id: r.group_id, verdict: v || 'no-verdict' }); continue; }
  const sf = r.shared_figure || {};
  if (!sf.present) { skipped.push({ group_id: r.group_id, verdict: 'no-figure' }); continue; }
  const owner = ownerOf.get(r.group_id) || null;
  let path;
  if (owner) {
    path = `figures/${owner}.png`;
  } else {
    const src = `${STAGING}/${r.group_id}.png`;
    const dst = `${GROUPS_FIG}/${r.group_id}.png`;
    if (existsSync(src)) { copyFileSync(src, dst); path = `figures/_groups/${r.group_id}.png`; }
    else { skipped.push({ group_id: r.group_id, verdict: 'staging-missing' }); continue; }
  }
  const entry = {
    group_id: r.group_id,
    exam: r.group_id.split('-')[0],
    label: labelOf.get(r.group_id) || null,
    header_quote: r.header_quote || null,
    shared_figure: { path, page_image: sf.page_image || null, bbox_pct: sf.bbox || null, caption: sf.caption || null },
    member_qids: r.member_qids || [],
    owner_qid: owner,
  };
  groupEntries.push(entry);
  for (const qid of entry.member_qids) memberGroup.set(qid, r.group_id);
}

function apply(q) {
  if (memberGroup.has(q.id)) { q.group_id = memberGroup.get(q.id); return true; }
  return false;
}

const qb = JSON.parse(readFileSync(BANK_FILE, 'utf8'));
let stamped = 0;
for (const q of qb.questions) if (apply(q)) stamped++;
writeFileSync(BANK_FILE, JSON.stringify(qb, null, 2) + '\n');

const exams = new Set([...memberGroup.keys()].map((id) => id.split('-')[0]));
let files = 0;
for (const exam of exams) {
  const f = `${BY_YEAR_DIR}/${exam}.json`;
  if (!existsSync(f)) continue;
  const data = JSON.parse(readFileSync(f, 'utf8'));
  for (const q of data.questions) apply(q);
  writeFileSync(f, JSON.stringify(data, null, 2) + '\n');
  files++;
}

const groupsDoc = {
  version: '1.0',
  generated_by: 'Session 73 Stage 2.6 D-120 (連問共有図グループモデル)',
  description: 'Each group = a 中問 (case-study block) sharing one preamble figure. Member questions reference it via question_bank.group_id; the figure is stored once (no duplication).',
  group_count: groupEntries.length,
  groups: groupEntries.sort((a, b) => a.group_id.localeCompare(b.group_id)),
};
writeFileSync(GROUPS_FILE, JSON.stringify(groupsDoc, null, 2) + '\n');

console.log('=== group-finalize (D-120) ===');
console.log(`backup: ${backup}`);
console.log(`groups written: ${groupEntries.length} → ${GROUPS_FILE}`);
console.log(`  owner-reused figures: ${groupEntries.filter((g) => g.owner_qid).length} | new _groups crops: ${groupEntries.filter((g) => !g.owner_qid).length}`);
console.log(`member group_id stamped: ${stamped} questions | by_year files: ${files}`);
if (skipped.length) console.log(`SKIPPED (not finalized): ${skipped.map((s) => s.group_id + '(' + s.verdict + ')').join(', ')}`);
