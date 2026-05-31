export const meta = {
  name: 'stage027-blind',
  description: 'Stage 2.7 — BLIND transcription of printed stem/choices from source pages (agent never sees stored text → cannot echo). Rule D read-only explore.',
  phases: [
    { title: 'Blind', detail: 'one read-only explore agent per page: transcribe printed 問NN stem+choices verbatim with NO reference text supplied' },
  ],
};

// args (may arrive as JSON string). Two modes — BOTH keep stored text away from the agent (echo-proof):
//   inline : { units: [ { img, exam, page_number, items:[{qn,id}] }, ... ] }
//   file   : { base: "/abs/.../blind_in", unit_ids: ["<exam>__page-NN", ...] }  ← agent Reads a stored-free file
const A = typeof args === 'string' ? JSON.parse(args) : args;
let tasks = [];
if (A && A.units && A.units.length) {
  tasks = A.units.map((u) => ({ kind: 'inline', u }));
} else if (A && A.base && A.unit_ids) {
  tasks = A.unit_ids.map((id) => ({ kind: 'file', file: `${A.base}/${id}.json`, unit_id: id }));
}
log(`Stage 2.7 BLIND transcription: ${tasks.length} pages on Opus (no stored text shown → echo-proof)`);

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['page_readable', 'transcriptions'],
  properties: {
    page_readable: { type: 'boolean' },
    transcriptions: {
      type: 'array',
      items: {
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
            description: 'verbatim printed choices. If a choice is a figure/table image, render faithfully prefixed [図]/[表]. Empty strings if not found.',
          },
          legibility: { type: 'string', enum: ['clear', 'partial', 'illegible'] },
        },
      },
    },
  },
};

const COMMON_INSTRUCTIONS = [
  'For EACH listed question number, find 問NN on the page and transcribe:',
  '  - printed_stem: the FULL stem text exactly as printed (Japanese). Reconstruct any INLINE table /',
  '    worksheet as a markdown table preserving EVERY printed value and label. Keep numbers/units exact.',
  '  - printed_choices: the four printed options ア / イ / ウ / エ exactly as printed. If an option is itself',
  '    a figure or table image, render it faithfully in text prefixed with [図] or [表].',
  '',
  'RULES:',
  '  - Transcribe ONLY what you can actually read on the image. NEVER output a placeholder like "[full text]".',
  '  - If 問NN is NOT printed on this page, set found_on_page=false, printed_stem="", all printed_choices "".',
  '  - legibility: "clear" if you read it confidently, "partial" if some chars uncertain, "illegible" if you',
  '    largely could not read it. Be honest — this drives downstream verification.',
  '  - Do not normalize or "fix" the text; transcribe faithfully (including any obvious print/OCR oddities you see).',
  '  - The "id" you return for each question MUST be the id given for that 問NN.',
  '',
  'Return { page_readable, transcriptions:[ one per listed question ] }.',
];

function header() {
  return [
    'You are TRANSCRIBING printed questions from an IT Passport (ITパスポート) exam PAGE IMAGE.',
    'CRITICAL: you are given NO reference/stored text. Transcribe ONLY what is actually printed on the image.',
    'This is a blind transcription — there is nothing to copy from, so read the image carefully.',
    '',
  ];
}

function buildPromptInline(u) {
  const list = u.items.map((it) => `  - 問${it.qn}  (return id "${it.id}")`).join('\n');
  return [
    ...header(),
    `VIEW this page image with the Read tool (you can see images): ${u.img}`,
    `Exam: ${u.exam}, page ${u.page_number}.`,
    '',
    'Transcribe these question numbers that should appear on this page:',
    list,
    '',
    ...COMMON_INSTRUCTIONS,
  ].join('\n');
}

function buildPromptFile(file) {
  return [
    ...header(),
    `STEP 1. Read this small JSON file (it contains ONLY the page image path + question numbers — NO question text): ${file}`,
    '   Fields: "img" (absolute page image path), "exam", "page_number", "items" (array of {qn, id}).',
    'STEP 2. VIEW the image at "img" with the Read tool (you can see images).',
    'STEP 3. For each entry in "items", transcribe 問<qn> blindly (return the matching "id").',
    '',
    ...COMMON_INSTRUCTIONS,
  ].join('\n');
}

// THROTTLE: process in sequential batches to cap peak concurrency well below the runtime's 8-slot cap.
// Running two 8-concurrent workflows at once (16 Opus vision agents) tripped API rate limits mid-run;
// a single workflow paced at BATCH=6 stays under the sustained-TPM ceiling that 40-page runs cleared.
const BATCH = (A && A.batch) || 6;
const results = [];
for (let i = 0; i < tasks.length; i += BATCH) {
  const slice = tasks.slice(i, i + BATCH);
  const batchResults = await parallel(
    slice.map((t) => () => {
      const prompt = t.kind === 'file' ? buildPromptFile(t.file) : buildPromptInline(t.u);
      const label = t.kind === 'file' ? 'blind:' + t.unit_id : 'blind:' + (t.u.img.split('/').pop().replace(/\.png$/, '')) + ':' + t.u.exam;
      return agent(prompt, {
        label,
        phase: 'Blind',
        agentType: 'explore',
        model: 'opus', // CRITICAL: default explore model cannot OCR dense JP (hallucinates blind); Opus reads accurately
        schema: SCHEMA,
      });
    })
  );
  results.push(...batchResults);
  log(`blind progress: ${Math.min(i + BATCH, tasks.length)}/${tasks.length} pages`);
}

const ok = results.filter(Boolean);
const tx = ok.flatMap((r) => r.transcriptions || []);
log(`blind done: ${ok.length}/${tasks.length} pages, ${tx.length} transcriptions`);

// NOTE: the workflow runtime journals each agent's RAW StructuredOutput ({page_readable, transcriptions}).
// Harvest/diff (stage027-blind-diff.mjs) keys by transcription.id and derives exam+page_image from the id,
// so we do NOT need to thread exam/page_image back through the return value.
return { pages_processed: ok.length, pages_requested: tasks.length, transcriptions_count: tx.length };
