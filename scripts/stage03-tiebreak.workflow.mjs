export const meta = {
  name: 'stage03-tiebreak',
  description: 'Stage 3 (G3) — 3rd-pass adjudication of escalated mappings (D-126). analyst (3rd subagent_type, ≠ both mappers and ≠ auditor, Rule D) sees the question + the two candidate primaries and picks the best (or a different valid id if both wrong).',
  phases: [
    { title: 'Tiebreak', detail: 'analyst adjudicates each contested question', model: 'opus' },
  ],
};

// args: { indexPath, tiebreakFile, model:"opus", agentType:"analyst", chunk:12, items:[{id},...] }
const A = typeof args === 'string' ? JSON.parse(args) : args;
const INDEX = A.indexPath;
const TBFILE = A.tiebreakFile;
const MODEL = A.model || 'opus';
const AGENT = A.agentType || 'analyst';
const CHUNK = A.chunk || 12;
const THROTTLE = A.throttle || 8;
const ITEMS = A.items || [];

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['decisions'],
  properties: {
    decisions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'chosen_primary', 'secondary_topics', 'terms', 'confidence', 'reason'],
        properties: {
          id: { type: 'string' },
          chosen_primary: { type: 'string', description: 'the BEST 小分類 id — usually candidate A or B, but a DIFFERENT valid index id if both candidates are wrong. MUST exist in the index.' },
          secondary_topics: { type: 'array', items: { type: 'string' }, description: '0–2 other valid ids substantially involved; must not include chosen_primary' },
          terms: { type: 'array', items: { type: 'string' }, description: '0–N 用語 copied VERBATIM from the matched topic(s) term lists in the index' },
          confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
          reason: { type: 'string', description: 'one short line (Japanese ok)' },
        },
      },
    },
  },
};

function buildPrompt(slice, lo, hi) {
  return [
    'You are the DECIDING (3rd) adjudicator for IT Passport (ITパスポート) exam questions where two independent',
    'mappers disagreed on which syllabus 小分類 the question primarily tests. Decide correctly and independently.',
    '',
    `STEP 1. Read the syllabus index (the 63 小分類 + their 用語): ${INDEX}`,
    `STEP 2. Read the tie-break input file: ${TBFILE}`,
    `   AUDIT ONLY items at index ${lo}..${hi - 1} (0-based) — these ${slice.length} ids:`,
    `   ${slice.map((it) => it.id).join(', ')}`,
    '   Each item has: id, stem_jp, choices_jp, correct_answer, has_figure, figure_description,',
    '   and "candidates" = the disagreeing proposals [{src:"A",primary,valid,terms},{src:"B",primary,...}]',
    '   (a single candidate means one pass dropped the item — confirm or correct it).',
    'STEP 3. For EACH item decide:',
    '   - chosen_primary: the 小分類 id that BEST matches the knowledge the question tests. Prefer one of the',
    '       candidates, BUT if BOTH are wrong (or one is marked valid:false), choose the correct valid index id instead.',
    '       Use stem + choices + correct_answer to determine the actual concept tested.',
    '   - secondary_topics: 0–2 other valid ids genuinely involved (cross-topic). [] if single-topic. Not chosen_primary.',
    '   - terms: the precise 用語 the question hinges on, copied VERBATIM from the chosen topic(s) term lists. [] if none fit.',
    '   - confidence: high / medium / low (low for figure-only or genuinely ambiguous).',
    '   - reason: one short line.',
    '',
    'RULES: chosen_primary and every secondary MUST be ids that literally exist in the index. terms MUST be exact',
    'strings from the index. Never invent ids or terms. Decide every listed id.',
    `Return { decisions:[ one per listed id, ${slice.length} total ] }.`,
  ].join('\n');
}

log(`Stage 3 tie-break: ${ITEMS.length} contested items, chunk ${CHUNK}, ${AGENT} on ${MODEL}`);

const chunks = [];
for (let lo = 0; lo < ITEMS.length; lo += CHUNK) chunks.push([lo, Math.min(lo + CHUNK, ITEMS.length)]);

const results = [];
for (let i = 0; i < chunks.length; i += THROTTLE) {
  const wave = chunks.slice(i, i + THROTTLE);
  const r = await parallel(wave.map(([lo, hi]) => () => {
    const slice = ITEMS.slice(lo, hi);
    return agent(buildPrompt(slice, lo, hi), { label: `tiebreak:${lo}-${hi - 1}`, phase: 'Tiebreak', agentType: AGENT, model: MODEL, schema: SCHEMA });
  }));
  results.push(...r.filter(Boolean));
  log(`tiebreak progress: ${Math.min((i + THROTTLE) * CHUNK, ITEMS.length)}/${ITEMS.length}`);
}
const decisions = results.flatMap((r) => r.decisions || []);
log(`tiebreak done: ${decisions.length} decisions`);
return { decided: decisions.length, requested: ITEMS.length };
