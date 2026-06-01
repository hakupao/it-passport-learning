export const meta = {
  name: 'stage03-map',
  description: 'Stage 3 (G3) — DOUBLE-PASS knowledge mapping: 2 independent mappers (different subagent_type, Rule D) map each exam question to syllabus 小分類 primary + secondary[] + 用語 tags. Text-only (Opus). Runtime journals each StructuredOutput; harvest reads the journal.',
  phases: [
    { title: 'MapA', detail: 'pass A (general-purpose): map each batch to primary/secondary/terms', model: 'opus' },
    { title: 'MapB', detail: 'pass B (explore): independent second mapping of the same batches', model: 'opus' },
  ],
};

// args (may arrive as JSON string):
//   { indexPath, batchDir, batchFiles:["pilot/batch_000.json",...], model:"opus", throttle:8,
//     passes:[{pass:"A",agentType:"general-purpose"},{pass:"B",agentType:"explore"}] }
const A = typeof args === 'string' ? JSON.parse(args) : args;
const INDEX = A.indexPath;
const BATCHDIR = A.batchDir;
const FILES = A.batchFiles || [];
const MODEL = A.model || 'opus';
const THROTTLE = A.throttle || 8;
const PASSES = A.passes || [
  { pass: 'A', agentType: 'general-purpose' },
  { pass: 'B', agentType: 'explore' },
];

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['pass', 'batch', 'mappings'],
  properties: {
    pass: { type: 'string', description: 'echo back the pass label given in the prompt (A or B)' },
    batch: { type: 'string', description: 'echo back the batch label given in the prompt' },
    mappings: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'primary_topic', 'secondary_topics', 'terms', 'confidence'],
        properties: {
          id: { type: 'string', description: 'the question id (exactly as given)' },
          primary_topic: { type: 'string', description: 'the SINGLE 小分類 id this question primarily tests; MUST be one of the 63 ids in the index' },
          secondary_topics: { type: 'array', items: { type: 'string' }, description: '0–2 OTHER 小分類 ids also substantially involved; valid ids; must NOT include primary_topic' },
          terms: { type: 'array', items: { type: 'string' }, description: '0–N 用語 copied VERBATIM from the matched topic(s) term lists in the index; the specific concept(s) the question hinges on' },
          confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
        },
      },
    },
  },
};

function buildPrompt(file, passLabel, batchLabel) {
  return [
    'You map IT Passport (ITパスポート) past-exam questions to the OFFICIAL SYLLABUS (シラバス Ver.6.5).',
    'Your judgment must be based on WHAT KNOWLEDGE each question tests — use the stem, the four choices, and the correct answer together (the correct answer often pinpoints the exact concept).',
    '',
    `STEP 1. Read the syllabus index (reference): ${INDEX}`,
    '   It is a flat list of the 63 小分類 (topics). Each topic has: id (e.g. "technology-12-..."), category (strategy|management|technology),',
    '   category_jp/major_jp/medium_jp (hierarchy context), name_jp, objective_jp, and terms[] (its 用語 list).',
    `STEP 2. Read the question batch: ${BATCHDIR}/${file}`,
    '   Fields per item: id, question_number, stem_jp, choices_jp{ア,イ,ウ,エ}, correct_answer, has_figure, figure_description.',
    'STEP 3. For EACH question in the batch, output a mapping:',
    '   - primary_topic: the SINGLE 小分類 id whose content the question MOST directly tests. MUST be one of the 63 index ids.',
    '   - secondary_topics: 0–2 OTHER 小分類 ids the question also substantially involves (cross-topic questions). Empty [] if single-topic.',
    '       Must be valid index ids and must NOT repeat primary_topic.',
    '   - terms: the specific 用語 the question hinges on, copied VERBATIM from the term list(s) of the matched topic(s) in the index.',
    '       0–N. Choose precise terms (the concept actually being tested), not every loosely related term. [] if none fit cleanly.',
    '   - confidence: "high" (clear, unambiguous), "medium" (reasonable, some ambiguity), "low" (figure-only / unclear / best guess).',
    '',
    'RULES:',
    '   - primary_topic and every secondary_topic MUST be ids that literally exist in the index. NEVER invent or guess an id format.',
    '   - terms MUST be exact strings present in the index term lists. Do not paraphrase, translate, or invent terms.',
    '   - For figure questions with sparse stems, use figure_description + choices; if genuinely undecidable, pick the best primary and set confidence "low".',
    '   - Map EVERY question in the batch — return one mapping object per item, same id.',
    `   - Echo pass="${passLabel}" and batch="${batchLabel}" in your output.`,
    '',
    `Return { pass:"${passLabel}", batch:"${batchLabel}", mappings:[ one per question ] }.`,
  ].join('\n');
}

// Flatten (pass × file) into one task list so the two passes INTERLEAVE (≈halves wall-clock vs
// pass-outer). Independence is preserved — each agent is blind to every other regardless of order.
const tasks = [];
for (const p of PASSES) for (const file of FILES) tasks.push({ p, file });
log(`Stage 3 mapping: ${tasks.length} tasks (${FILES.length} batches × ${PASSES.length} passes) on ${MODEL}, throttle ${THROTTLE}`);

const results = [];
for (let i = 0; i < tasks.length; i += THROTTLE) {
  const slice = tasks.slice(i, i + THROTTLE);
  const batchResults = await parallel(
    slice.map(({ p, file }) => () => {
      const batchLabel = file.replace(/^.*\//, '').replace(/\.json$/, '');
      const phase = p.pass === 'A' ? 'MapA' : p.pass === 'B' ? 'MapB' : `Map${p.pass}`;
      return agent(buildPrompt(file, p.pass, batchLabel), {
        label: `map${p.pass}:${batchLabel}`,
        phase, // explicit per-agent phase → correct grouping despite interleaving
        agentType: p.agentType,
        model: MODEL,
        schema: SCHEMA,
      });
    })
  );
  results.push(...batchResults.filter(Boolean));
  log(`progress: ${Math.min(i + THROTTLE, tasks.length)}/${tasks.length} tasks`);
}

const ok = results.filter(Boolean);
const totalMappings = ok.reduce((n, r) => n + (r.mappings ? r.mappings.length : 0), 0);
log(`mapping done: ${ok.length}/${FILES.length * PASSES.length} agent results, ${totalMappings} mappings total`);
// Runtime journals each agent's raw StructuredOutput {pass,batch,mappings} to <run_dir>/journal.jsonl.
// Harvest (stage03-harvest.mjs) keys by `${pass}::${id}` to separate the two passes.
return { agent_results: ok.length, requested: FILES.length * PASSES.length, mappings: totalMappings };
