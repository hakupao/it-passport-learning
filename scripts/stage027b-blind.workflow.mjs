export const meta = {
  name: 'stage027b-blind',
  description: 'Stage 2.7b — double-blind hi-dpi/multi-page re-read of the 71 residual flags. Two independent blind lanes (A=explore, B=code-reviewer), both Opus, never shown stored text → echo-proof. Each question gets page-N bands + page-N+1 bands so multi-page choices are recoverable.',
  phases: [
    { title: 'Blind2', detail: 'per question: 2 independent Opus blind transcriptions across hi-dpi page bands (N + N+1)' },
  ],
};

// args (FILE MODE — manifest too big to inline): { base, ids:[...], wave? }
//   base = abs dir holding one stored-free JSON per question: <base>/<id>.json
//          (fields: id, qn, exam, page_number, has_next_page, has_figure, figure_type, images:[{tag,path}])
//   Each agent Reads its own file (NO stored text inside → echo-proof), then Reads the band images.
const A = typeof args === 'string' ? JSON.parse(args) : args;
const base = A.base;
const ids = A.ids || [];
log(`Stage 2.7b double-blind: ${ids.length} questions × 2 lanes on Opus (hi-dpi bands, file-mode, echo-proof)`);

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['key', 'id', 'found', 'category', 'printed_stem', 'printed_choices', 'choices_are_images', 'found_pages', 'legibility'],
  properties: {
    key: { type: 'string', description: 'echo back exactly the key given to you (e.g. "2015h27a-q086__A")' },
    id: { type: 'string', description: 'echo back the question id' },
    found: { type: 'boolean', description: 'true if you located 問NN on the provided images' },
    category: {
      type: 'string',
      enum: ['text_question', 'figure_choices', 'figure_in_stem', 'not_found'],
      description: 'text_question = stem AND all 4 choices are printed TEXT you can transcribe verbatim; figure_choices = the four options ア/イ/ウ/エ are themselves graphs/diagrams/images (NOT transcribable as plain text); figure_in_stem = stem contains a figure/table but the 4 choices are text; not_found = could not locate the question.',
    },
    printed_stem: { type: 'string', description: 'verbatim printed stem (Japanese). Reconstruct any INLINE table as markdown preserving every value. Empty string if not found / not applicable.' },
    printed_choices: {
      type: 'object', additionalProperties: false,
      required: ['ア', 'イ', 'ウ', 'エ'],
      properties: { 'ア': { type: 'string' }, 'イ': { type: 'string' }, 'ウ': { type: 'string' }, 'エ': { type: 'string' } },
      description: 'verbatim printed text of each option. If an option is a figure/graph image, set choices_are_images=true and put a faithful SHORT description prefixed [図]/[表] here. Empty strings if not found.',
    },
    choices_are_images: { type: 'boolean', description: 'true if the four options are graphs/diagrams/images rather than plain text' },
    found_pages: { type: 'string', description: 'which page number(s) you actually read the stem and choices from (e.g. "stem p37, choices p38")' },
    legibility: { type: 'string', enum: ['clear', 'partial', 'illegible'] },
    notes: { type: 'string' },
  },
};

function buildPrompt(id, lane, key, base) {
  return [
    'You are TRANSCRIBING one question from an IT Passport (ITパスポート) past exam, from HIGH-RESOLUTION page-band images.',
    'CRITICAL: you are given NO reference/stored text. There is nothing to copy — read the images carefully and transcribe ONLY what is actually printed.',
    '',
    `STEP 1. Read this small JSON file (it contains ONLY metadata + image paths — NO question text): ${base}/${id}.json`,
    '   Fields: "qn" (question number), "page_number", "has_next_page", "images" (array of {tag, path}).',
    `STEP 2. The target question is 問<qn> (id ${id}). Its stem is around page <page_number>.`,
    '   If "has_next_page" is true this question MAY be multi-page — its choices ア/イ/ウ/エ can continue onto the NEXT',
    '   page (next-page bands are included in "images"). You MUST check them: many of these questions had their',
    '   choices truncated precisely because the choices live on the following page.',
    'STEP 3. VIEW every image in "images" with the Read tool (you can see images). They overlap; use whichever shows each part most clearly.',
    '',
    'TASK:',
    '  1. Locate 問<qn> across the images (it may start on one band and continue on another / the next page).',
    '  2. Classify "category":',
    '       - text_question: the stem AND all four options ア/イ/ウ/エ are printed TEXT.',
    '       - figure_choices: the four options are GRAPHS/DIAGRAMS/IMAGES (e.g. four curves, four flowcharts) — NOT plain text.',
    '       - figure_in_stem: the stem includes a figure/table image, but the four options are text.',
    '       - not_found: you could not locate it.',
    '  3. Transcribe printed_stem verbatim (Japanese). Reconstruct any inline table/worksheet as a markdown table, every value exact.',
    '  4. Transcribe the four printed_choices ア/イ/ウ/エ verbatim. Keep numbers, symbols (≦ ≧ etc.), spreadsheet formulas, and units EXACT.',
    '       - If the options are images/graphs, set choices_are_images=true and give a faithful SHORT description prefixed [図] or [表].',
    '',
    'RULES:',
    '  - Transcribe ONLY what you can actually read. NEVER output a placeholder like "[full text]" or invented content.',
    '  - Do NOT normalize or "fix" text; transcribe faithfully including any oddities.',
    '  - legibility: "clear" if confident, "partial" if some chars uncertain, "illegible" if you largely could not read it.',
    `  - Return key EXACTLY "${key}" and id "${id}".`,
    '',
    'Return the structured object.',
  ].join('\n');
}

// concurrency: this machine caps a workflow at 8 concurrent agents (= validated Opus vision ceiling).
// process 4 questions per wave (= 8 agents) so we never exceed sustained-TPM that tripped rate limits.
const WAVE = (A && A.wave) || 4;
const out = [];
for (let i = 0; i < ids.length; i += WAVE) {
  const slice = ids.slice(i, i + WAVE);
  const thunks = [];
  for (const id of slice) {
    for (const lane of ['A', 'B']) {
      const key = `${id}__${lane}`;
      thunks.push(() => agent(buildPrompt(id, lane, key, base), {
        label: `blind2:${id}:${lane}`,
        phase: 'Blind2',
        agentType: lane === 'A' ? 'explore' : 'code-reviewer', // Rule D: two different subagent types
        model: 'opus', // dense JP OCR requires Opus
        schema: SCHEMA,
      }));
    }
  }
  const waveRes = await parallel(thunks);
  out.push(...waveRes.filter(Boolean));
  log(`blind2 progress: ${Math.min(i + WAVE, ids.length)}/${ids.length} questions`);
}

const ok = out.filter(Boolean);
log(`blind2 done: ${ok.length}/${ids.length * 2} reads`);
return { reads: ok.length, requested: ids.length * 2 };
