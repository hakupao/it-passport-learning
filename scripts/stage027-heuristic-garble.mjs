#!/usr/bin/env node
/**
 * Stage 2.7 Step 1 — heuristic garble scorer (free, all 2,900 questions).
 *
 * Scores stem_jp / choices_jp for OCR-garble signals via regex/statistics. This is a TRIAGE +
 * CROSS-CHECK signal only — the ground truth is the Step 2 full vision source-collation. In
 * particular, q085-type content_mismatch (clean text but wrong question) is INVISIBLE here and
 * MUST be caught by the vision pass. We deliberately favor precision-ish, transparent feature
 * flags over a black-box score.
 *
 * Usage: node scripts/stage027-heuristic-garble.mjs
 * Output: evidence/phase5/stage_027_heuristic_garble.json
 */
import { readFileSync, writeFileSync } from 'fs';

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const EXAMS = `${ROOT}/data/ip/exams`;

const qb = JSON.parse(readFileSync(`${EXAMS}/question_bank.json`, 'utf8'));
const Q = qb.questions;

// ── feature detectors ────────────────────────────────────────────────────────
// OCR table/line artifacts that almost never appear in clean IPA exam prose.
const MOJIBAKE_SYM = /[@|｜¥＼\\■□〓◇〇※†‡¦}{]|＿{2,}|_{2,}|—{2,}|‐{2,}/g;
// repeated/odd punctuation runs (clean text uses single 、。，．)
const PUNCT_NOISE = /[，、][ 　]*[，、]|[．。][ 　]*[．。]|・[ 　]*・[ 　]*・|[，、．。]{3,}/g;
// lowercase latin runs ≥4 that are unlikely to be legit (acronyms are uppercase; protocols short).
// We strip a small whitelist of genuinely-lowercase tokens that occur in IP exams.
const LATIN_WL = new Set(['www', 'http', 'https', 'com', 'jp', 'co', 'org', 'net', 'html', 'php', 'css', 'png', 'jpg', 'gif', 'pdf', 'and', 'or', 'not', 'true', 'false', 'null', 'void', 'int', 'char', 'else', 'then', 'main', 'sql', 'cpu', 'gpu', 'ram', 'rom', 'usb', 'cd', 'dvd', 'ip', 'os', 'ai', 'it', 'pc', 'led', 'pos', 'ec', 'gps', 'rfid', 'iot', 'api', 'url', 'cgi', 'cms', 'crm', 'erp', 'sla', 'oss', 'ssl', 'tls', 'dns', 'dhcp', 'ftp', 'smtp', 'pop', 'imap', 'lan', 'wan', 'vpn', 'nfc', 'qr', 'json', 'xml', 'csv', 'utf']);
const LATIN_RUN = /[a-z]{4,}/g;

// kanji that are common OCR mis-segmentation neighbours (soft signal only)
function pct(x, n) { return n ? (100 * x / n).toFixed(1) + '%' : '0%'; }

function scoreText(stem, choices) {
  const feats = {};
  let score = 0;
  const choiceVals = Object.values(choices || {});
  const choiceStr = choiceVals.join(' ');

  // 1. mojibake symbols in stem or choices
  const mojiStem = (stem.match(MOJIBAKE_SYM) || []).length;
  const mojiCh = (choiceStr.match(MOJIBAKE_SYM) || []).length;
  if (mojiStem + mojiCh > 0) { feats.mojibake_symbols = mojiStem + mojiCh; score += 3 * (mojiStem + mojiCh); }

  // 2. punctuation noise runs
  const pn = (stem.match(PUNCT_NOISE) || []).length + (choiceStr.match(PUNCT_NOISE) || []).length;
  if (pn > 0) { feats.punct_noise = pn; score += 2 * pn; }

  // 3. lowercase latin runs not whitelisted
  let latinHits = 0;
  for (const m of (stem + ' ' + choiceStr).matchAll(LATIN_RUN)) {
    if (!LATIN_WL.has(m[0])) latinHits++;
  }
  if (latinHits > 0) { feats.latin_runs = latinHits; score += 2 * latinHits; }

  // 4. choices embedded in stem: stem literally contains ≥2 of the choice strings
  //    (OCR appended the answer block into the stem text). High-signal for q012-type garble.
  let embedded = 0;
  for (const c of choiceVals) {
    const t = (c || '').trim();
    if (t.length >= 4 && stem.includes(t)) embedded++;
  }
  if (embedded >= 2) { feats.choices_in_stem = embedded; score += 4 * embedded; }

  // 5. choice-label sequence inside stem ("ア …イ …ウ …エ" appearing in the stem body)
  const labelSeq = /ア[\s\S]{1,40}イ[\s\S]{1,40}ウ[\s\S]{1,40}エ/.test(stem);
  if (labelSeq) { feats.choice_labels_in_stem = true; score += 4; }

  // 6. choice anomalies: empties, dup, extreme length spread, embedded newlines/markers
  const lens = choiceVals.map((c) => (c || '').length);
  if (lens.some((l) => l === 0)) { feats.empty_choice = true; score += 5; }
  const uniq = new Set(choiceVals.map((c) => (c || '').trim()));
  if (choiceVals.length >= 2 && uniq.size < choiceVals.length) { feats.duplicate_choice = true; score += 3; }
  if (lens.length >= 2) {
    const mx = Math.max(...lens), mn = Math.min(...lens);
    if (mx >= 8 && mn <= 1) { feats.choice_len_spread = `${mn}-${mx}`; score += 2; }
  }
  if (choiceVals.some((c) => /\n/.test(c || ''))) { feats.choice_newline = true; score += 2; }

  // 7. very short stem (likely truncated/garbled), excluding legit short ones
  if (stem.replace(/\s/g, '').length < 12) { feats.short_stem = stem.replace(/\s/g, '').length; score += 3; }

  // 8. isolated bracket noise mid-text  [ … ]  or 「 unbalanced
  const openB = (stem.match(/[\[［]/g) || []).length, closeB = (stem.match(/[\]］]/g) || []).length;
  if (openB + closeB > 0 && openB !== closeB) { feats.unbalanced_brackets = `${openB}/${closeB}`; score += 2; }

  // 9. digit-latin glued tokens like "B6" "0SS" "l0" inside otherwise-Japanese text (soft)
  const dl = (stem.match(/(?<![A-Za-z0-9])[A-Za-z][0-9]|[0-9][A-Za-z](?![A-Za-z0-9])/g) || []).length;
  if (dl >= 2) { feats.digit_latin_glue = dl; score += dl; }

  return { score, feats };
}

const CALC_RE = /(計算|求め|何円|何個|何日|何時間|幾つ|いくつ|何%|百分率|平均|標準偏差|割合|金額|単価|総額|台数|人数|回数|確率|速度|ビット|バイト|進数|0x|２進|二進|何ビット|スループット|稼働率|MTBF|MTTR)/;

const results = [];
for (const q of Q) {
  const { score, feats } = scoreText(q.stem_jp || '', q.choices_jp || {});
  results.push({
    id: q.id,
    exam: q.id.split('-')[0],
    qn: q.question_number,
    has_figure: !!q.has_figure,
    calc: CALC_RE.test(q.stem_jp || ''),
    group_id: q.group_id || null,
    score,
    flags: feats,
    flagged: score >= 4,
  });
}

results.sort((a, b) => b.score - a.score);

// ── population summary ────────────────────────────────────────────────────────
const flagged = results.filter((r) => r.flagged);
const byExam = {};
for (const r of flagged) byExam[r.exam] = (byExam[r.exam] || 0) + 1;
const featCount = {};
for (const r of results) for (const k of Object.keys(r.flags)) featCount[k] = (featCount[k] || 0) + 1;
const tiers = {
  high_score_ge12: results.filter((r) => r.score >= 12).length,
  mid_score_6_11: results.filter((r) => r.score >= 6 && r.score < 12).length,
  low_score_4_5: results.filter((r) => r.score >= 4 && r.score < 6).length,
  clean_score_lt4: results.filter((r) => r.score < 4).length,
};
const figFlag = flagged.filter((r) => r.has_figure || r.calc).length;

const summary = {
  generated_by: 'Stage 2.7 Step 1 heuristic garble scorer',
  total: results.length,
  flagged: flagged.length,
  flagged_pct: pct(flagged.length, results.length),
  flagged_fig_or_calc: figFlag,
  tiers,
  feature_counts: featCount,
  flagged_by_exam: Object.fromEntries(Object.entries(byExam).sort((a, b) => b[1] - a[1])),
  note: 'TRIAGE/CROSS-CHECK ONLY. Ground truth = Step 2 vision collation. q085-type content_mismatch is INVISIBLE to this scorer.',
};

writeFileSync(`${ROOT}/evidence/phase5/stage_027_heuristic_garble.json`,
  JSON.stringify({ summary, results }, null, 2));

console.log(JSON.stringify(summary, null, 2));
console.log('\n--- top 25 by score ---');
for (const r of results.slice(0, 25)) console.log(`${r.score}\t${r.id}\t${Object.keys(r.flags).join(',')}`);
