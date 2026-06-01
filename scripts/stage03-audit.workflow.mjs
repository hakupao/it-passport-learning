export const meta = {
  name: 'stage03-audit',
  description: 'Stage 3 (G3) — Rule A independent audit of resolved mappings. code-reviewer (3rd subagent_type, ≠ both mappers, Rule D) judges whether each proposed primary_topic + terms is correct for the question. Read-only.',
  phases: [
    { title: 'Audit', detail: 'code-reviewer judges each proposed mapping against the question + syllabus index', model: 'opus' },
  ],
};

// args: { indexPath, auditFile, model:"opus", agentType:"code-reviewer", chunk:10 }
const A = typeof args === 'string' ? JSON.parse(args) : args;
const INDEX = A.indexPath;
const AUDIT = A.auditFile;
const MODEL = A.model || 'opus';
const AGENT = A.agentType || 'code-reviewer';
const CHUNK = A.chunk || 10; // items per auditor agent (one agent reviews CHUNK items)
const NITEMS = A.nItems || 20;

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['verdicts'],
  properties: {
    verdicts: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'primary_verdict', 'terms_verdict', 'notes'],
        properties: {
          id: { type: 'string' },
          primary_verdict: { type: 'string', enum: ['correct', 'acceptable', 'wrong'], description: 'correct=best topic; acceptable=defensible though another may fit better; wrong=clearly mis-mapped' },
          suggested_primary: { type: 'string', description: 'if acceptable/wrong, the topic id you would assign instead (else omit or empty)' },
          terms_verdict: { type: 'string', enum: ['ok', 'partial', 'bad', 'na'], description: 'ok=terms capture the concept; partial=missing/extra; bad=wrong; na=no terms needed' },
          notes: { type: 'string', description: 'one short line of reasoning (Japanese ok)' },
        },
      },
    },
  },
};

function buildPrompt(slice, lo, hi) {
  return [
    'You are an INDEPENDENT auditor (Rule A) checking the syllabus mapping of IT Passport (ITパスポート) exam questions.',
    'You did NOT produce these mappings. Judge them critically and honestly — your job is to catch mis-mappings.',
    '',
    `STEP 1. Read the syllabus index (the 63 小分類 + their 用語): ${INDEX}`,
    `STEP 2. Read the audit input file: ${AUDIT}`,
    `   It has an "items" array. AUDIT ONLY items with index ${lo}..${hi - 1} (0-based), i.e. these ${slice.length} ids:`,
    `   ${slice.map((it) => it.id).join(', ')}`,
    '   Each item has: id, stem_jp, choices_jp, correct_answer, has_figure, figure_description,',
    '   and "proposed" = { primary_topic, primary_name, secondary_topics, terms }.',
    'STEP 3. For EACH of those items, judge:',
    '   - primary_verdict: is proposed.primary_topic the BEST 小分類 for what this question tests?',
    '       "correct" = yes, best fit. "acceptable" = defensible but another topic arguably fits better.',
    '       "wrong" = clearly mis-mapped. Use the stem + choices + correct_answer to decide what knowledge is tested.',
    '   - suggested_primary: if acceptable or wrong, give the topic id you would assign (must exist in the index).',
    '   - terms_verdict: do proposed.terms capture the concept the question hinges on?',
    '       "ok" / "partial" (missing or extra) / "bad" (wrong terms) / "na" (no terms warranted).',
    '   - notes: one short line of why.',
    '',
    'Be strict but fair: adjacent-topic ambiguity is "acceptable", not "wrong". Reserve "wrong" for genuine errors.',
    `Return { verdicts:[ one per audited id, ${slice.length} total ] }.`,
  ].join('\n');
}

// The workflow sandbox has no fs. Each auditor agent Reads auditFile for full item detail; the
// workflow only needs item ids (args.items=[{id},...]) to slice chunks and name the audited ids.
const ITEMS = A.items || [];
log(`Stage 3 Rule A audit: ${ITEMS.length} items, chunk ${CHUNK}, ${AGENT} on ${MODEL}`);

const results = [];
for (let lo = 0; lo < ITEMS.length; lo += CHUNK) {
  const hi = Math.min(lo + CHUNK, ITEMS.length);
  const slice = ITEMS.slice(lo, hi);
  const r = await agent(buildPrompt(slice, lo, hi), {
    label: `audit:${lo}-${hi - 1}`,
    phase: 'Audit',
    agentType: AGENT,
    model: MODEL,
    schema: SCHEMA,
  });
  if (r) results.push(r);
}
const verdicts = results.flatMap((r) => r.verdicts || []);
log(`audit done: ${verdicts.length} verdicts`);
return { audited: verdicts.length, requested: ITEMS.length };
