export const meta = {
  name: 'stage027-audit',
  description: 'Stage 2.7 Rule A — independent audit of APPLIED repairs vs source page (3rd lane: general-purpose + Opus)',
  phases: [{ title: 'Audit', detail: 'one Opus agent per sampled repaired question: does the APPLIED stem/choices faithfully match the printed page?' }],
};

const A = typeof args === 'string' ? JSON.parse(args) : args;
const cands = (A && A.cands) || [];
log(`Stage 2.7 Rule A audit: ${cands.length} applied repairs (independent 3rd lane)`);

const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['id', 'verdict', 'stem_ok', 'choices_ok', 'note'],
  properties: {
    id: { type: 'string' },
    verdict: { type: 'string', enum: ['match', 'minor_diff', 'mismatch', 'not_found'] },
    stem_ok: { type: 'boolean' },
    choices_ok: { type: 'boolean' },
    note: { type: 'string' },
  },
};

function prompt(c) {
  return [
    'You are auditing a REPAIRED IT Passport (ITパスポート) exam question against its SOURCE PAGE IMAGE.',
    'Judge whether the repaired text below faithfully matches what is actually printed on the page.',
    '',
    `VIEW the page image (Read tool, you can see images): ${c.img}`,
    `Find question 問${c.qn} on the page.`,
    '',
    'REPAIRED stem (to audit):',
    JSON.stringify(c.applied_stem),
    'REPAIRED choices (to audit):',
    JSON.stringify(c.applied_choices),
    '',
    'Compare the repaired text to the printed question 問' + c.qn + ':',
    '  - verdict "match": repaired stem AND choices faithfully match the printed question (trivial',
    '      whitespace/punctuation/zenkaku-hankaku differences are fine).',
    '  - verdict "minor_diff": same question, but a small wording/character imperfection remains',
    '      (e.g. one mistyped kanji, a duplicated word) that does NOT change the answer or meaning materially.',
    '  - verdict "mismatch": repaired text is the WRONG question or has meaning-changing errors.',
    '  - verdict "not_found": 問' + c.qn + ' is not on this page.',
    '  stem_ok / choices_ok: booleans for each.',
    '  note: one concise sentence (what differs, if anything).',
    '',
    `Return { id:"${c.id}", verdict, stem_ok, choices_ok, note }.`,
  ].join('\n');
}

const BATCH = 6;
const results = [];
for (let i = 0; i < cands.length; i += BATCH) {
  const slice = cands.slice(i, i + BATCH);
  const r = await parallel(slice.map((c) => () =>
    agent(prompt(c), { label: 'audit:' + c.id, phase: 'Audit', agentType: 'general-purpose', model: 'opus', schema: SCHEMA })));
  results.push(...r);
  log(`audit progress: ${Math.min(i + BATCH, cands.length)}/${cands.length}`);
}
const ok = results.filter(Boolean);
const dist = {}; for (const r of ok) dist[r.verdict] = (dist[r.verdict] || 0) + 1;
log(`audit done: ${ok.length}/${cands.length} | verdicts ${JSON.stringify(dist)}`);
return { audited: ok.length, verdicts: dist, results: ok };
