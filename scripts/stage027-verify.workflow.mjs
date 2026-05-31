export const meta = {
  name: 'stage027-verify',
  description: 'Stage 2.7 — independent SECOND blind transcription of candidate questions (Rule D adversarial lane: code-reviewer + Opus, never shown stored/first-blind)',
  phases: [
    { title: 'Verify', detail: 'one Opus code-reviewer agent per candidate question: focused verbatim transcription of 問NN from the source page, fully independent' },
  ],
};

// args (may arrive as JSON string): { cands: [ { id, qn, img }, ... ] }   img = absolute page image path
const A = typeof args === 'string' ? JSON.parse(args) : args;
const cands = (A && A.cands) || [];
const AGENT_TYPE = (A && A.agentType) || 'code-reviewer'; // 2nd blind = code-reviewer; 3rd blind tiebreak = general-purpose (independent lane)
log(`Stage 2.7 VERIFY: ${cands.length} candidate questions (independent blind read, Opus ${AGENT_TYPE})`);

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'qn', 'found_on_page', 'printed_stem', 'printed_choices', 'legibility'],
  properties: {
    id: { type: 'string' },
    qn: { type: 'integer' },
    found_on_page: { type: 'boolean' },
    printed_stem: { type: 'string', description: 'verbatim printed stem (Japanese; inline tables as markdown preserving every value). Empty if not found.' },
    printed_choices: {
      type: 'object',
      additionalProperties: false,
      required: ['ア', 'イ', 'ウ', 'エ'],
      properties: { 'ア': { type: 'string' }, 'イ': { type: 'string' }, 'ウ': { type: 'string' }, 'エ': { type: 'string' } },
      description: 'verbatim printed choices. Figure/table choice → faithful text prefixed [図]/[表]. Empty strings if not found.',
    },
    legibility: { type: 'string', enum: ['clear', 'partial', 'illegible'] },
  },
};

function buildPrompt(c) {
  return [
    'You are independently verifying ONE printed question from an IT Passport (ITパスポート) exam page.',
    'You are given NO reference/stored text — transcribe ONLY what is actually printed. Read carefully.',
    '',
    `VIEW this page image with the Read tool (you can see images): ${c.img}`,
    `Find question 問${c.qn} on this page (return id "${c.id}").`,
    '',
    `Transcribe 問${c.qn} VERBATIM:`,
    '  - printed_stem: the FULL stem text exactly as printed (Japanese). Reconstruct any INLINE table /',
    '    worksheet as a markdown table preserving EVERY printed value/label. Keep numbers/units exact.',
    '  - printed_choices: the four printed options ア/イ/ウ/エ exactly as printed. If an option is a',
    '    figure/table image, render it faithfully in text prefixed with [図]/[表].',
    '',
    'RULES: transcribe ONLY what you can read; NEVER use placeholders. If 問' + c.qn + ' is not on this page,',
    'set found_on_page=false and leave printed_* empty. legibility = clear/partial/illegible (be honest).',
    '',
    `Return { id:"${c.id}", qn:${c.qn}, found_on_page, printed_stem, printed_choices, legibility }.`,
  ].join('\n');
}

// THROTTLE in sequential batches (Opus vision caps at ~8 concurrent before rate/session limits trip).
const BATCH = (A && A.batch) || 6;
const results = [];
for (let i = 0; i < cands.length; i += BATCH) {
  const slice = cands.slice(i, i + BATCH);
  const batchResults = await parallel(
    slice.map((c) => () =>
      agent(buildPrompt(c), {
        label: 'verify:' + c.id,
        phase: 'Verify',
        agentType: AGENT_TYPE, // Rule D: different subagent_type from the blind transcriber (explore)
        model: 'opus',
        schema: SCHEMA,
      })
    )
  );
  results.push(...batchResults);
  log(`verify progress: ${Math.min(i + BATCH, cands.length)}/${cands.length}`);
}

const ok = results.filter(Boolean);
log(`verify done: ${ok.length}/${cands.length} candidates re-transcribed`);
return { verified: ok.length, requested: cands.length };
