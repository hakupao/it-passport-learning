export const meta = {
  name: 'stage027-collate',
  description: 'Stage 2.7 — full vision source-collation of stored stem/choices vs source page images (Rule D: read-only explore agents)',
  phases: [
    { title: 'Collate', detail: 'one read-only explore agent per page unit: view source page, compare stored stem/choices, classify defects, transcribe true text for criticals' },
  ],
};

// args (Session 73 lesson: args may arrive as a JSON string):
//   { unit_files: ["/abs/.../<exam>__page-NN.json", ...] }                      ← explicit full paths, OR
//   { base: "/abs/.../units", unit_ids: ["<exam>__page-NN", ...] }              ← compact (base + stems)
const A = typeof args === 'string' ? JSON.parse(args) : args;
let unitFiles = (A && A.unit_files) || [];
if ((!unitFiles || !unitFiles.length) && A && A.base && A.unit_ids) {
  unitFiles = A.unit_ids.map((u) => `${A.base}/${u}.json`);
}
log(`Stage 2.7 collation: ${unitFiles.length} page units (read-only explore agents, 1 page/agent)`);

const VERDICT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['unit_id', 'page_readable', 'verdicts'],
  properties: {
    unit_id: { type: 'string' },
    page_readable: { type: 'boolean', description: 'true if the page image opened and printed text was legible' },
    verdicts: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'qn', 'found_on_page', 'printed_stem', 'printed_choices', 'classification', 'stem_ok', 'choices_ok', 'confidence', 'issue', 'notes'],
        properties: {
          id: { type: 'string' },
          qn: { type: 'integer' },
          found_on_page: { type: 'boolean', description: 'true if question number 問<qn> is actually printed on THIS page image' },
          printed_stem: { type: 'string', description: 'the stem text as PRINTED on the page, transcribed VERBATIM (Japanese; reconstruct inline tables as markdown preserving every value). NEVER a placeholder. If found_on_page is false, empty string.' },
          printed_choices: {
            type: 'object',
            additionalProperties: false,
            required: ['ア', 'イ', 'ウ', 'エ'],
            properties: { 'ア': { type: 'string' }, 'イ': { type: 'string' }, 'ウ': { type: 'string' }, 'エ': { type: 'string' } },
            description: 'the four choices as PRINTED, transcribed VERBATIM. If a choice is a figure/table image, give a faithful textual rendering prefixed with [図]/[表]. NEVER a placeholder like "[full text]". If found_on_page is false, all empty strings.',
          },
          classification: {
            type: 'string',
            enum: ['clean', 'ocr_garble_minor', 'ocr_garble_critical', 'content_mismatch', 'choices_garble', 'page_mismatch'],
          },
          stem_ok: { type: 'boolean', description: 'does stored_stem faithfully match printed_stem (ignoring trivial whitespace/zenkaku-hankaku/quote-style)?' },
          choices_ok: { type: 'boolean', description: 'do all four stored_choices faithfully match printed_choices?' },
          confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
          issue: { type: 'string', description: 'brief description of the discrepancy; empty string if clean' },
          notes: { type: 'string' },
        },
      },
    },
  },
};

function buildPrompt(unitFile) {
  return [
    'You are auditing OCR-extracted IT Passport (ITパスポート) exam questions against their SOURCE PAGE IMAGE.',
    'This is a read-only verification task. Be meticulous, literal, and HONEST — never invent text.',
    '',
    `STEP 1. Read this unit file (JSON): ${unitFile}`,
    '   It describes ONE source page: exam id, page_image_abs (absolute path), and a `questions` array.',
    '   Each question has: id, qn (question number), stored_stem, stored_choices (ア/イ/ウ/エ),',
    '   correct_answer (CONTEXT ONLY — never judge or change it), has_figure, figure_abs, group_id,',
    '   group_shared_figure_abs, group_header_quote, and heuristic flags (heur_score/heur_flags).',
    '',
    'STEP 2. VIEW the page image at page_image_abs (use the Read tool on the .png — you can see images).',
    '   For figure-referencing questions you MAY also view figure_abs / group_shared_figure_abs for context.',
    '   The PAGE IMAGE is the single source of truth for the printed text.',
    '',
    'STEP 3 (TRANSCRIBE FIRST — do this BEFORE judging). For EACH question in the unit, locate it on the page',
    '   by its printed number (問' + 'NN / 問 NN) and TRANSCRIBE what is actually printed:',
    '   - printed_stem = the full stem text exactly as printed (Japanese; reconstruct any INLINE table/worksheet',
    '       as a markdown table preserving EVERY printed value/label).',
    '   - printed_choices = the four printed choices ア/イ/ウ/エ exactly as printed. If a choice is itself a',
    '       figure/table image, render it faithfully in text prefixed with [図]/[表].',
    '   ABSOLUTE RULES: transcribe ONLY what you can actually read. NEVER output a placeholder such as',
    '   "[full text]" or "[choice from page]". If the page is illegible or the question number is NOT on this',
    '   page, set found_on_page=false, leave printed_* empty, confidence="low", and explain in notes.',
    '   Known case: 2010h22h source pages are systematically offset by ±1; if 問NN is absent here, say so.',
    '',
    'STEP 4 (COMPARE stored vs printed) — judge each question by SUBSTANCE, choice-by-choice:',
    '   - "clean": stored_stem AND all four stored_choices faithfully match what is printed. Trivial',
    '       whitespace / line-break / zenkaku-hankaku / quote-style (“ ” vs 「」) differences are clean.',
    '       A faithful markdown-table reconstruction that preserves all values is clean. A correctly',
    '       extracted question whose figure lives in a SEPARATE crop is clean (separate figures are out of scope).',
    '   - "ocr_garble_minor": cosmetic OCR noise that does NOT change meaning or solvability (a stray space,',
    '       one misread punctuation, light katakana noise). A solver would still answer correctly.',
    '   - "ocr_garble_critical": OCR errors that CHANGE meaning / corrupt numbers, dates, units, an inline',
    '       table/worksheet/code block, or make the question unsolvable (garbled tables, 90%→99%, B6→86,',
    '       OS→05, swapped digits, mojibake runs replacing real words, truncated/extra fragments).',
    '   - "content_mismatch": stored text is a DIFFERENT question than the one printed for this number — it',
    '       may read cleanly and be self-consistent yet be the WRONG question. THIS IS THE MOST IMPORTANT',
    '       CLASS. Detect it by comparing the ACTUAL TASK being asked and the ACTUAL choice texts, NOT the',
    '       topic. WARNING: 中問/group questions (group_id set) often SHARE a topic with neighbours — do NOT',
    '       assume a match just because the subject (e.g. ICカード, データベース) is the same; verify the task',
    '       and the choices line up item-by-item.',
    '   - "choices_garble": the stem matches but the choices are corrupted, swapped, or belong to a different',
    '       question (e.g. stored choices are "a,b/a,c/..." index refs while the page prints full-text choices).',
    '   - "page_mismatch": the question number is not present on this page (found_on_page=false).',
    '',
    'STEP 5. Output per question: id, qn, found_on_page, printed_stem, printed_choices, classification,',
    '   stem_ok (stored matches printed?), choices_ok (all four match?), confidence (high/medium/low for your',
    '   judgement — be honest, use low when unsure), issue (one concise sentence; empty if clean), notes.',
    '   NEVER propose changing correct_answer / answer keys — they are authoritative and out of scope.',
    '   Only STEM PROSE + INLINE TABLES + CHOICES are in scope; separate figure crops are not.',
    '',
    'Return the structured object: { unit_id, page_readable, verdicts:[ ... one per question ... ] }.',
  ].join('\n');
}

const results = await parallel(
  unitFiles.map((uf) => () =>
    agent(buildPrompt(uf), {
      label: 'collate:' + uf.split('/').pop().replace(/\.json$/, ''),
      phase: 'Collate',
      agentType: 'explore',
      schema: VERDICT_SCHEMA,
    })
  )
);

const ok = results.filter(Boolean);
const allVerdicts = ok.flatMap((r) => r.verdicts || []);
const classCounts = {};
for (const v of allVerdicts) classCounts[v.classification] = (classCounts[v.classification] || 0) + 1;
const nonClean = allVerdicts.filter((v) => v.classification !== 'clean');

log(`collation done: ${ok.length}/${unitFiles.length} units, ${allVerdicts.length} verdicts, ${nonClean.length} non-clean`);

return {
  units_processed: ok.length,
  units_requested: unitFiles.length,
  questions_verdicted: allVerdicts.length,
  class_counts: classCounts,
  unit_results: ok, // full per-unit verdicts (caller writes to disk; clean verdicts are compact)
};
