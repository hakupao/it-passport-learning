# Figure Answer-KEY Audit — PLAN (pre-Phase-2 体检)

> Rule A semantic-sampling plan. Written **before** results. Session 97 (2026-06-19).
> Goal: decide whether the figure-question answer **keys** are sound enough to start Phase 2
> (解析預生成), or whether a full sweep of the at-risk population is needed first.

## Why now

Phase 1 (translation backfill, 29/29) is complete. Phase 2 will generate trilingual
explanations that **assume `correct_answer` is right**. If a figure question's key is wrong,
Phase 2 will confidently justify a wrong answer. The s7x OCR-repair step has already been
shown to swap choices **against** the figure twice (S94 q052, S96 q002) while leaving the
keyed letter unchanged — a silent wrong-key class. So audit the keys before Phase 2.

## Population (the "247")

At-risk figure questions = `has_figure` AND (`choices_resourced_s7x`* OR `figure_repaired`*).
Verified count = **247** (of 467 figure questions). These are exactly the questions whose
choices were re-sourced (q002 failure mode) or whose figure was repaired.

Source of truth: `data/ip/exams/question_bank.json`. Images:
`data/ip/exams/figures/<id>.png` (crop) + `data/ip/exams/pages/<exam>/page-NN.png` (full page).

## Definitions (locked with user, strict)

| verdict | meaning | counts toward bad-key rate? |
|---|---|---|
| **BAD_KEY** | `choices_jp[correct_answer]` is NOT the answer the figure supports | **YES** (numerator) |
| KEY_OK | keyed choice IS the figure-correct answer | no |
| CHOICES_SWAP_ONLY | keyed answer still right, other choices mislabeled vs figure | no (log + corpus-fix candidate) |
| NOT_DERIVABLE | answer cannot be derived from the figure (missing/conceptual) | no (manual/backlog) |

**Decision rule** (user, strict): only `correct_answer` contradicting the figure triggers a
full sweep. Pure choices-swaps are logged + corpus-fixed but do **not** force a full re-derive.

## Sampling (N = 40, stratified, deterministic)

- N = **40** rate-sample (denominator), `scripts/audit-figkey-manifest.mjs` (no RNG; FNV-hash order).
- Stratified by `s027_severity`, oversampling the OCR-damage buckets:
  content_mismatch 14 / ocr_garble_critical 12 / escalate_resolved 8 / none 6.
- Within each severity: proportional-by-`figure_type` with floor 1 (rare-type coverage).
- Tie-break prefers `choices_resourced_s7x` (q002 mode): 37/40 carry it. 17 exams covered.
- Composition (built): table 20, diagram 7, flowchart 4, chart 3, code 3, none 3.

### Calibration (NOT in the rate denominator)
- **Specificity controls** (should read CLEAN): `2010h22h-q002` (S96 fix), `2013h25a-q052` (S94 fix).
- **Adjudication control**: `2010h22h-q077` (backlog "reversal" suspected; main-context pre-read
  says key イ = series y=p² IS figure-correct — expectation uncertain).
- **Poisoned sensitivity control** (must be flagged BAD_KEY): `POISON-2009h21a-q013`, real key ウ
  (break-even 120/0.4 = 300), planted key ア(=160). Synthetic; never written to the bank.

## Method (workflow `scripts/audit-figkey.workflow.mjs`)

1. **Audit** (44 × `general-purpose` vision agents): read crop + **authoritative full page**,
   derive the answer **from the figure first** (the corpus text/order may be corrupted — q002/q052
   lesson), then check the keyed letter.
2. **Verify** (`oh-my-claudecode:critic`, ≠ auditor → Rule D), skeptical & independent:
   - BAD_KEY → **2** skeptics (recompute lens + steelman-the-key lens); default KEY_OK unless the
     figure *unambiguously* contradicts (guards against q002-critic#1-style false positives).
   - CHOICES_SWAP_ONLY → 1; NOT_DERIVABLE/UNCERTAIN → 1 (try to derive); KEY_OK → 1 on a
     deterministic 1/3 (false-negative guard); all controls/poison always re-verified.
   - Vote combine → `CONFIRMED_BAD_KEY` / `DISPUTED_BAD_KEY` / `KEY_OK_*` / `CONFIRMED_SWAP_ONLY` / `NOT_DERIVABLE`.
3. **Adjudicate** (main context): every `DISPUTED_*` is resolved by me reading the full page
   directly (the q002/q052 highest-authority protocol).

## Decision thresholds (recommendation; user routes final)

- **0 confirmed bad keys** in sample (poison caught, controls clean) → estimate upper bound of
  bad-key rate via Wilson 95% CI; if upper bound acceptable → **recommend GO Phase 2**.
- **≥1 confirmed bad key** → project rate + CI over 247 → **recommend full sweep** of all 247.
- Any DISPUTED → adjudicate before concluding. Any failed calibration (poison missed / control
  mis-flagged) → audit instrument is unreliable → re-run / escalate, do not trust the rate.

## Outputs
- `manifest.json` (selection + image paths), `audit_results.json` (per-item records),
  `rule_a_audit.md` (findings + rate + decision). Failures → `failures/` (Rule B).
