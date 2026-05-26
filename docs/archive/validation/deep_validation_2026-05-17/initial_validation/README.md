# initial_validation/

The **three-track dimensional audit** that kicked off `deep_validation_2026-05-17` — V1 OCR / V2 translation / V3 structure. Predates and motivates the iter-3 → iter-8 fix/convergence chain (which lives one level up).

Grouped here under D-082 §2.1D for hierarchy clarity: this is the "what does the v1.0.0 release content actually look like" audit; the sibling `iter_3/` … `iter_8/` are "fix everything we found, until convergence".

---

## Contents

| Path | What |
|---|---|
| `VALIDATION_REPORT.md` | The combined report. OVERALL=WARN. 3 verdict tables (V1/V2/V3) + per-track narrative + Phase 2 carry-forward. **Start here.** |
| `methodology/VALIDATION_METHODOLOGY.md` | The audit methodology — sample frame, scoring rubric, severity escalation, single-track WARN → global WARN rule |
| `sampling/` | Sample frames + seed for each track (100 pages V1, 300 leaves V2, 200 entities V3b) |
| `v1_ocr/` + `v1_ocr_summary.json` | V1 OCR quality track (sample 100, verdict WARN, 92.3 % avg fidelity, 4 % FAIL) |
| `v2_translation/` + `v2_translation_summary.json` | V2 raw translation quality (sample 300, PASS); also has 100 % programmatic output/ check |
| `v3a_pageclass_summary.json` | V3a page classification (sample 100, PASS, 96 % AGREE) |
| `v3b_entitytype/` + `v3b_entitytype_summary.json` | V3b entity type + section_path (sample 200, PASS, 99 % AGREE) |
| `v3c_section_path/` | V3c section_path 100 % programmatic depth-jump scan |
| `iter_2/` | Transitional pre-iter-3 round — early R2/R4/R6 batch prototypes that explored what `iter_3` later systematized |

---

## Read order

1. `VALIDATION_REPORT.md` §0 (executive summary) — get the headline verdicts in 30 s
2. `methodology/VALIDATION_METHODOLOGY.md` — understand the rubric before reading per-track detail
3. `v1_ocr_summary.json` then `v2_translation_summary.json` then `v3*_summary.json` for machine-readable verdicts
4. `iter_2/` only if you want pre-history; iter_3+ supersedes it

---

## What happened after this

The 4 V1 OCR FAIL pages + a handful of WARN-level translation defects + the structural notes seeded what became:

- **iter_3** — 535 release-impacting corrections (commit `5c559ba`)
- **iter_4** — 2 more (commit `9219d05`)
- **iter_5 + iter_6** — F1–F11
- **iter_7** — full-corpus, F12–F36
- **iter_8** — corrective, F37–F38; converged

→ shipped as **`itpassport-r6-v1.0.2`**.

See `../README.md` for the cumulative metrics + `../../../RETROSPECTIVE.md` §8 + §9 for the full synthesis.

---

## Why `v3a_pageclass/` has no detail dir

V3a's per-page evidence collapsed to the summary JSON at audit time — the worker output was small enough that splitting per-page would have produced 100 trivially-tiny files. So only the summary exists. The empty placeholder dir was removed during the D-082 reorg.
