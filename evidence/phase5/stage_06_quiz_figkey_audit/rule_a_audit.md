# Figure Answer-KEY Audit — Rule A report (pre-Phase-2 体检)

> Session 97 (2026-06-19). Plan: `PLAN.md`. Raw records: `audit_results.json`. Manifest: `manifest.json`.
> Decision question: are figure-question answer **keys** sound enough to start Phase 2, or is a full sweep needed first?

## TL;DR

- **Bad-key rate (strict, the sweep trigger): 0 / 40.** No sampled figure question has a
  `correct_answer` the figure contradicts.
- **The audit instrument is validated both ways** — it caught a planted wrong key (sensitivity)
  and cleared the two known-fixed controls (specificity). So "0 bad keys" is a real signal, not blind.
- **Recommendation: GO Phase 2** (keys are clean), with a per-question **key re-derivation guard
  folded into the Phase 2 pipeline** to mop up the statistical residual (95% upper bound ≤ ~22 of
  247) using the same vision work Phase 2 needs anyway — cheaper and tighter than a standalone sweep.
- **Separate finding (does NOT trigger the key-sweep per the strict rule):** non-key **choice**
  corruption is real and not rare — 2/40 confirmed in-sample (~5%), plus 2 controls. These don't
  change the right answer but do corrupt distractor text → affect display + Phase 2 explanation
  quality. Surfaced as backlog for user routing.

## Method (recap)

Population = **247** at-risk figure questions (`choices_resourced_s7x`* OR `figure_repaired`*, of
467 figure questions). Stratified deterministic **N=40** rate-sample (oversampling OCR-damage
severities; proportional-by-figure-type with floor) + calibration controls. Two-stage workflow
(`scripts/audit-figkey.workflow.mjs`): vision **audit** (`general-purpose`, reads crop +
authoritative full page, derives the answer *from the figure first*) → skeptical **verify**
(`oh-my-claudecode:critic`, ≠ auditor = Rule D; 2 independent skeptics on every BAD_KEY flag) →
**main-context adjudication** of disputes by reading the figure directly. 64 agents, ~10 min.

Strict bad-key definition (user-locked): only `choices_jp[correct_answer]` being contradicted by
the figure counts toward the rate / triggers a sweep. Pure choice-swaps (key still right) are logged.

## Result — rate sample (N=40)

| final status | n | meaning |
|---|---:|---|
| KEY_OK (verified + single-pass) | 38 | keyed choice IS the figure-correct answer (all high confidence) |
| CONFIRMED_SWAP_ONLY | 2 | key correct, a **non-keyed** choice is corrupted (q096, q078) |
| **CONFIRMED_BAD_KEY** | **0** | — |
| DISPUTED_BAD_KEY / NOT_DERIVABLE | 0 | every sampled question was derivable from its figure |

- **Bad-key rate = 0/40.** Wilson 95% CI **[0%, 8.76%]** (rule-of-three upper ≈ 7.5%).
  Projected to 247: point estimate **0**, 95% upper bound **≤ ~22** questions.
- All 40 were figure-derivable (including backlog suspects q099/q100/q090/q097 → all KEY_OK).
  Table-heavy, computational keys (break-even, P&L, spreadsheet, inventory) all recomputed correct.

## Calibration (instrument trustworthiness)

| control | role | expected | result | notes |
|---|---|---|---|---|
| `POISON-2009h21a-q013` | sensitivity | BAD_KEY | **CONFIRMED_BAD_KEY** ✅ | auditor + 2 verifiers independently derived ウ=300 (break-even 120/0.4), correctly ID'd planted ア=160 as the contribution-margin distractor |
| `2010h22h-q002` | specificity | CLEAN | **KEY_OK_VERIFIED** ✅ | independent re-derivation matched S96 (graph: A lower growth, higher 2008 margin → イ) |
| `2013h25a-q052` | specificity | CLEAN | **CLEAN (adjudicated)** ✅ | auditor false-positive: claimed page "ウ 0.18"; **main-context 5× read = ウ 0.10**. Stored 0.10 is correct; S94 conclusion stands. Verifier correctly said KEY_OK. |
| `2010h22h-q077` | adjudication | uncertain | non-key swap | key イ (series y=k²) correct; choices_jp **ア/イ descriptive text swapped** vs figure panels |

**Instrument scorecard:** sensitivity 1/1 (caught the planted bad key with correct reasoning);
**false-positive BAD_KEY flags: 0** (the one false-positive was a *swap* flag on q052's blurry
`0.10`→`0.18`, never a key flag). The q052 episode re-confirms the standing lesson (q002/q052):
single vision readers hallucinate low-res digits → the adjudication layer is load-bearing.

## Non-key choice corruption (separate finding — NOT a bad key)

Confirmed by my own figure reads (auditor flags re-verified, since q052 showed they can misread):

| id | defect | key | impact |
|---|---|---|---|
| `2009h21h-q096` | `choices_jp[イ]` mutated to a *different, coincidentally-true* statement (interval **and** age group differ from printed イ); stem inline table also garbled | ア ✅ correct | learner sees a wrong distractor; Phase 2 explanation of イ would be wrong |
| `2025r07-q078` | `choices_jp[ア]="1"` but figure prints **ア 2** | エ=9 ✅ correct | minor distractor value error |
| `2010h22h-q077` (control) | `choices_jp` ア/イ description text swapped vs figure panels | イ ✅ correct | distractor descriptions mislabeled |

Rate (in-sample, non-key swaps): **2/40 = 5%**, Wilson 95% CI [1.4%, 16.5%], projected to 247 ≈
**12** (range 3–41). The same s7x mechanism that mutates a non-keyed choice could, elsewhere,
mutate the *keyed* choice (→ a real bad key); the audit checked the keyed choice in all 40 and
found 0, but this is another reason to keep a key-derivation guard in Phase 2.

## Decision & recommendation

1. **Keys are clean → GO Phase 2.** Per the user's strict rule (only `correct_answer`-vs-figure
   triggers a sweep), 0/40 confirmed bad keys = clean. No standalone 247-key-sweep required.
2. **Fold a key re-derivation guard into Phase 2.** Phase 2 already re-derives each answer from the
   figure to write the explanation; have it **flag any question it cannot justify the keyed answer
   for** (cf. S89 q095 "Phase 2 解析生成で自然再検証"). This covers the ≤~22 residual with no extra
   vision pass and tighter coverage than sampling. (If instead the user wants a tighter pre-Phase-2
   bound, extend the sample to N≈80–120 or sweep all 247 — but that re-does work Phase 2 will do.)
3. **Choice-text corruption is a separate, lower-priority track.** Recommend a choices↔figure
   consistency pass (also foldable into Phase 2, since explanations discuss distractors). New backlog
   items: `2009h21h-q096`, `2025r07-q078`, `2010h22h-q077`. **`2013h25a-q052` is confirmed CLEAN**
   (remove any lingering doubt about ウ).

## Rule compliance

- **Rule A:** N=40 pre-registered in PLAN; independent vision sampling; evidence here + `audit_results.json`.
- **Rule D:** auditor (`general-purpose`) ≠ verifier (`oh-my-claudecode:critic`) ≠ adjudicator (main context). No self-review.
- **Rule B:** no failed *attempt* to archive (the q052 auditor false-positive was caught and is
  documented above, not a discarded work product). Invariants untouched: no bank/corpus writes this session.
