export const meta = {
  name: 'audit-figkey',
  description: 'Vision audit of figure-question answer KEYS (pre-Phase-2): derive each answer from the figure, flag keys the figure contradicts; adversarially verify every flag.',
  phases: [
    { title: 'Audit', detail: 'one vision agent per question derives the answer from the figure and checks the keyed letter' },
    { title: 'Verify', detail: 'independent skeptical critics re-derive flagged/uncertain/control items' },
  ],
};

// ---------------- schemas ----------------
const LETTER = { type: 'string', description: 'ア / イ / ウ / エ, or "none" if no choice matches the figure, or "unsure"' };
const AUDIT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    figure_legible: { type: 'boolean', description: 'could you actually read the figure for THIS question on the full page?' },
    question_kind: { type: 'string', enum: ['compute_from_table', 'select_correct_graph_or_diagram', 'read_value_from_figure', 'conceptual_figure_illustrative', 'other'] },
    figure_correct_answer_desc: { type: 'string', description: 'the answer you derive from the FIGURE ALONE (a value, or which graph/diagram is correct and why) — state this BEFORE looking at the key' },
    figure_correct_letter: LETTER,
    keyed_letter: { type: 'string' },
    keyed_choice_text: { type: 'string', description: 'the text of choices_jp[keyed_letter] as given' },
    keyed_matches_figure: { type: 'boolean', description: 'TRUE iff the content the keyed letter points to IS the answer the figure supports' },
    choices_consistent_with_figure: { type: 'boolean', description: 'are ALL choice labels consistent with the figure (no anti-figure swap/mislabel)?' },
    verdict: { type: 'string', enum: ['KEY_OK', 'BAD_KEY', 'CHOICES_SWAP_ONLY', 'NOT_DERIVABLE', 'UNCERTAIN'] },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    derivation: { type: 'string', description: 'step-by-step derivation citing concrete figure content (numbers/labels/curve shapes you actually saw)' },
    anomalies: { type: 'string', description: 'mis-crop, OCR garble, choice<->figure mismatch, or "none"' },
  },
  required: ['id', 'figure_legible', 'question_kind', 'figure_correct_answer_desc', 'figure_correct_letter', 'keyed_letter', 'keyed_matches_figure', 'choices_consistent_with_figure', 'verdict', 'confidence', 'derivation'],
};
const VERIFY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    figure_legible: { type: 'boolean' },
    independent_answer_desc: { type: 'string', description: 'answer derived from the figure FROM SCRATCH, before considering the auditor claim' },
    independent_figure_correct_letter: LETTER,
    verifier_verdict: { type: 'string', enum: ['KEY_OK', 'BAD_KEY', 'CHOICES_SWAP_ONLY', 'NOT_DERIVABLE', 'UNCERTAIN'] },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    reasoning: { type: 'string' },
  },
  required: ['id', 'figure_legible', 'independent_answer_desc', 'independent_figure_correct_letter', 'verifier_verdict', 'confidence', 'reasoning'],
};

// ---------------- prompts ----------------
const LESSON = `CRITICAL LESSON (from prior failures q002/q052): the corpus text (choices_jp ordering, stem) may itself be CORRUPTED by an OCR-repair step that swapped choices against the figure. The FIGURE on the FULL PAGE is the only ground truth. Do NOT assume choices_jp is in the right order. Also: crops can be mis-bboxed (wrong region). Read the crop AND the full page; if they disagree, trust the full page region indicated by the bbox. Independent readers have also HALLUCINATED figure contents — read carefully, cite exact numbers/labels you actually see, and say so if illegible.`;

function auditPrompt(it) {
  const bbox = it.figure_bbox_pct ? `figure_bbox_pct on the page (x1,y1,x2,y2 as fractions): ${JSON.stringify(it.figure_bbox_pct)}` : 'no bbox';
  return `You are auditing whether the ANSWER KEY of one IT-Passport exam figure-question is consistent with its figure.

${LESSON}

STEP 1 — Read the images with the Read tool (both are PNGs you can view):
  - crop (isolated figure for this question): ${it.crop_abs || '(none)'}
  - FULL PAGE (authoritative; contains several questions): ${it.page_abs || '(none)'}
  This question is number ${it.question_number} on that page. ${bbox}. Locate it by its number/stem.

STEP 2 — Question data (the stem may contain an inline table; treat the FIGURE as authoritative if they differ):
  id: ${it.id}
  figure_type: ${it.figure_type}
  stem_jp:
"""
${it.stem_jp}
"""
  choices_jp (as stored — order may be corrupted!): ${JSON.stringify(it.choices_jp, null, 0)}
  stored correct_answer (the KEY under audit): ${it.correct_answer}

STEP 3 — From the FIGURE ALONE, work out the correct answer (compute the value / decide which graph or diagram is right). Write that as figure_correct_answer_desc and figure_correct_letter. Do this BEFORE trusting the key.

STEP 4 — Decide:
  - keyed_matches_figure = TRUE iff choices_jp["${it.correct_answer}"] is exactly the answer the figure supports.
  - verdict:
      KEY_OK             = keyed choice IS the figure-correct answer (even if other choices are mislabeled).
      BAD_KEY            = the figure-correct answer is NOT what choices_jp["${it.correct_answer}"] says (a different letter holds it, or no choice holds it). THIS is the thing we must catch.
      CHOICES_SWAP_ONLY  = keyed answer is still correct, but OTHER choices are anti-figure / mislabeled.
      NOT_DERIVABLE      = the answer cannot be determined from the figure (figure missing/illegible, or it is a conceptual question the figure only illustrates, or the source data the stem references is absent).
      UNCERTAIN          = figure legible but you cannot confidently derive the answer.
  Be conservative: only say BAD_KEY when the figure UNAMBIGUOUSLY contradicts the keyed choice. Report exact figure contents in derivation.`;
}

function verifyPrompt(it, audit, lens) {
  return `You are an INDEPENDENT skeptical verifier for one IT-Passport figure-question answer-key audit. Re-derive the answer YOURSELF from the figure; do not defer to the auditor.

${LESSON}

The auditor reported verdict="${audit.verdict}" (confidence ${audit.confidence}); their figure-derived answer: "${audit.figure_correct_answer_desc}" (letter ${audit.figure_correct_letter}); their note: ${audit.anomalies || 'none'}.
${lens}

Read both images with the Read tool:
  - crop: ${it.crop_abs || '(none)'}
  - FULL PAGE (authoritative): ${it.page_abs || '(none)'}  — this question is number ${it.question_number}.

Question data:
  id: ${it.id}
  figure_type: ${it.figure_type}
  stem_jp:
"""
${it.stem_jp}
"""
  choices_jp (order may be corrupted): ${JSON.stringify(it.choices_jp, null, 0)}
  stored correct_answer (KEY under audit): ${it.correct_answer}

Derive the figure-correct answer from scratch (independent_answer_desc + letter). Then give verifier_verdict using the SAME definitions: KEY_OK / BAD_KEY / CHOICES_SWAP_ONLY / NOT_DERIVABLE / UNCERTAIN. Historically, false "BAD_KEY" claims came from misreading the figure — default to KEY_OK unless the figure unambiguously contradicts choices_jp["${it.correct_answer}"]. Cite the exact figure values you see.`;
}

const LENS_RECOMPUTE = 'LENS: recompute / re-derive the answer entirely from scratch from the figure, ignoring the auditor\'s arithmetic.';
const LENS_STEELMAN = 'LENS: actively try to DEFEND the stored key — find the most charitable reading of the figure under which choices_jp[key] is correct. Only conclude BAD_KEY if even the steelman fails.';
const LENS_DERIVE = 'LENS: the auditor could not derive this. Try hard to derive it from the figure; if it genuinely cannot be derived from the figure, confirm NOT_DERIVABLE and say why.';

// ---------------- run ----------------
const items = (args && args.items) || [];
log(`figure-key audit: ${items.length} items (sample+controls+poison)`);

const records = await pipeline(
  items,
  // Stage 1 — audit
  (it) => agent(auditPrompt(it), { label: `audit:${it.id}`, phase: 'Audit', agentType: 'general-purpose', schema: AUDIT_SCHEMA }),
  // Stage 2 — conditional skeptical verification
  async (audit, it, index) => {
    if (!audit) return { id: it.id, role: it.role, control_expect: it.control_expect || null, poison_real_key: it.poison_real_key || null, audit: null, verifiers: [], final_status: 'AUDIT_FAILED' };
    const forceVerify = it.role !== 'rate'; // controls + poison always double-checked
    let verifiers = [];
    const run = (lens) => agent(verifyPrompt(it, audit, lens), { label: `verify:${it.id}`, phase: 'Verify', agentType: 'oh-my-claudecode:critic', schema: VERIFY_SCHEMA });

    if (audit.verdict === 'BAD_KEY') {
      verifiers = (await parallel([() => run(LENS_RECOMPUTE), () => run(LENS_STEELMAN)])).filter(Boolean);
    } else if (audit.verdict === 'CHOICES_SWAP_ONLY') {
      verifiers = (await parallel([() => run(LENS_RECOMPUTE)])).filter(Boolean);
    } else if (audit.verdict === 'NOT_DERIVABLE' || audit.verdict === 'UNCERTAIN') {
      verifiers = (await parallel([() => run(LENS_DERIVE)])).filter(Boolean);
    } else if (audit.verdict === 'KEY_OK' && (forceVerify || index % 3 === 0)) {
      verifiers = (await parallel([() => run(LENS_RECOMPUTE)])).filter(Boolean);
    }

    // ---- combine into a final status ----
    const vBad = verifiers.filter((v) => v.verifier_verdict === 'BAD_KEY').length;
    const vOk = verifiers.filter((v) => v.verifier_verdict === 'KEY_OK').length;
    const vSwap = verifiers.filter((v) => v.verifier_verdict === 'CHOICES_SWAP_ONLY').length;
    let final_status;
    if (audit.verdict === 'BAD_KEY') {
      if (vBad >= 2) final_status = 'CONFIRMED_BAD_KEY';
      else if (vBad === 1) final_status = 'DISPUTED_BAD_KEY';
      else final_status = 'KEY_OK_AUDITOR_FALSE_POSITIVE';
    } else if (audit.verdict === 'CHOICES_SWAP_ONLY') {
      final_status = vBad >= 1 ? 'DISPUTED_BAD_KEY' : (vSwap >= 1 ? 'CONFIRMED_SWAP_ONLY' : 'DISPUTED_SWAP');
    } else if (audit.verdict === 'NOT_DERIVABLE' || audit.verdict === 'UNCERTAIN') {
      if (vBad >= 1) final_status = 'DISPUTED_BAD_KEY';
      else if (vOk >= 1) final_status = 'KEY_OK_VERIFIER_DERIVED';
      else final_status = 'NOT_DERIVABLE';
    } else { // KEY_OK
      if (verifiers.length === 0) final_status = 'KEY_OK_SINGLE_PASS';
      else if (vBad >= 1) final_status = 'DISPUTED_BAD_KEY';
      else final_status = 'KEY_OK_VERIFIED';
    }
    return {
      id: it.id, role: it.role, stratum: it.stratum, figure_type: it.figure_type,
      control_expect: it.control_expect || null, poison_real_key: it.poison_real_key || null,
      audit, verifiers, final_status,
    };
  },
);

// ---------------- summarize ----------------
const ok = records.filter(Boolean);
const rate = ok.filter((r) => r.role === 'rate');
const tally = (arr) => arr.reduce((m, r) => ((m[r.final_status] = (m[r.final_status] || 0) + 1), m), {});
const badStatuses = ['CONFIRMED_BAD_KEY', 'DISPUTED_BAD_KEY'];
const summary = {
  total: ok.length,
  rate_sample_n: rate.length,
  rate_by_final_status: tally(rate),
  rate_confirmed_bad: rate.filter((r) => r.final_status === 'CONFIRMED_BAD_KEY').length,
  rate_disputed: rate.filter((r) => r.final_status === 'DISPUTED_BAD_KEY').length,
  needs_adjudication: ok.filter((r) => r.final_status.startsWith('DISPUTED')).map((r) => r.id),
  controls: ok.filter((r) => r.role === 'control').map((r) => ({ id: r.id, expect: r.control_expect, got: r.final_status, audit_verdict: r.audit?.verdict })),
  poison: ok.filter((r) => r.role === 'poison').map((r) => ({ id: r.id, expect: r.control_expect, got: r.final_status, audit_verdict: r.audit?.verdict, audit_letter: r.audit?.figure_correct_letter })),
};
log(`done. rate sample: ${JSON.stringify(summary.rate_by_final_status)}; confirmed_bad=${summary.rate_confirmed_bad}, disputed=${summary.rate_disputed}; poison=${JSON.stringify(summary.poison)}`);
return { summary, records: ok };
