export const meta = {
  name: 'stage027b-audit',
  description: 'Stage 2.7b — Rule A independent audit of the APPLIED second-pass repairs. A general-purpose Opus lane (distinct from the explore/code-reviewer blind lanes and from the mechanical apply → Rule D) views the hi-dpi page bands and judges whether the applied stem/choices faithfully match what is printed.',
  phases: [
    { title: 'AuditB', detail: 'per sampled repair: view hi-dpi bands, verdict match/minor_diff/mismatch vs applied text' },
  ],
};

// args (FILE MODE): { base, ids:[...], wave? }
//   base/<id>.json holds: { id, qn, page_number, applied_stem, applied_choices, images:[{tag,path}] }
const A = typeof args === 'string' ? JSON.parse(args) : args;
const base = A.base;
const ids = A.ids || [];
log(`Stage 2.7b Rule A audit: ${ids.length} applied repairs on Opus (general-purpose lane)`);

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'verdict', 'stem_ok', 'choices_ok', 'answer_consistent', 'issue'],
  properties: {
    id: { type: 'string' },
    verdict: { type: 'string', enum: ['match', 'minor_diff', 'mismatch'], description: 'match = applied text faithfully equals the printed text; minor_diff = same question/meaning, trivial artifact (punctuation, a stray char); mismatch = applied text is wrong (different content, wrong choice, garbled).' },
    stem_ok: { type: 'boolean' },
    choices_ok: { type: 'boolean' },
    answer_consistent: { type: 'boolean', description: 'true if the option at the given correct_answer letter (ア/イ/ウ/エ) is genuinely the correct answer to the question as printed. CRITICAL for choice swaps: confirm the letter→option mapping survived.' },
    issue: { type: 'string', description: 'if not match or answer inconsistent, describe precisely what differs (which choice, what it should say). Empty if all good.' },
  },
};

function buildPrompt(id, base) {
  return [
    'You are AUDITING a repaired IT Passport (ITパスポート) exam question against its source page image (Rule A independent check).',
    '',
    `STEP 1. Read this JSON file: ${base}/${id}.json`,
    '   Fields: "qn", "page_number", "applied_stem", "applied_choices" (the text STORED after repair), "correct_answer" (the official answer letter), "images".',
    'STEP 2. VIEW every image in "images" with the Read tool (high-resolution page bands; you can see images). Choices may be on the next page — check all images.',
    `STEP 3. Find 問<qn> on the images and compare the PRINTED stem + four options ア/イ/ウ/エ against the applied_stem / applied_choices.`,
    '',
    'Judge:',
    '  - verdict "match": the applied text faithfully equals what is printed (ignore pure whitespace / full-width vs half-width punctuation).',
    '  - verdict "minor_diff": same question and same meaning, but a trivial artifact remains (a stray latin word, one punctuation char).',
    '  - verdict "mismatch": the applied text is WRONG — different content, a wrong/duplicated/empty choice, or garbled.',
    '  - If the four options are GRAPHS/IMAGES (not text), judge whether the applied description is a fair representation; match if so.',
    '  - set stem_ok / choices_ok independently. In "issue", state precisely what is wrong (which choice, what it should be).',
    '',
    'CRITICAL — answer_consistent: the applied_choices are stored in printed order ア/イ/ウ/エ and the official',
    '  "correct_answer" letter was NOT changed by the repair. Work out the correct answer to the question from the',
    '  printed page yourself, then confirm the option sitting at the "correct_answer" letter really is that correct',
    '  answer. Set answer_consistent=false if the letter now points to a wrong option (e.g. a choice-set swap',
    '  reordered the options). This is the single most important check.',
    '',
    'Be skeptical and precise — this is the final quality gate. Return the structured object with id exactly as given.',
  ].join('\n');
}

const WAVE = (A && A.wave) || 6;
const out = [];
for (let i = 0; i < ids.length; i += WAVE) {
  const slice = ids.slice(i, i + WAVE);
  const res = await parallel(slice.map((id) => () => agent(buildPrompt(id, base), {
    label: `auditB:${id}`,
    phase: 'AuditB',
    agentType: 'general-purpose', // Rule D: distinct from blind lanes (explore/code-reviewer) and apply
    model: 'opus',
    schema: SCHEMA,
  })));
  out.push(...res.filter(Boolean));
  log(`auditB progress: ${Math.min(i + WAVE, ids.length)}/${ids.length}`);
}
log(`auditB done: ${out.length}/${ids.length}`);
return { audited: out.length, requested: ids.length };
