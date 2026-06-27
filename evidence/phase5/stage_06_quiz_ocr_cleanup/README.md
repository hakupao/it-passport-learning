# Stage 6 / Quiz — deterministic OCR-garble cleanup (Session 101)

Startup word **「OCR 清理」** → Session-100 What's Next #1: drift-proof bulk cleanup of the
deterministic OCR-garble detector backlog.

## Pipeline

```
scripts/quiz-ocr-garble-scan.mjs   (S100) → backlog 74 hits / 55 Q
        │
scripts/quiz-ocr-cleanup-S101.fixes.mjs  → 主 context adjudication → ocr_cleanup_fixes_S101.json
        │                                    (58 real choice fixes + 7 FP groups; only `to` hand-authored)
scripts/_gen-ocr-verify-workflow-S101.mjs → embeds blind data → quiz-ocr-verify-S101.workflow.mjs
        │
Workflow wf_d188cc77-95b                   → blind re-derivation (58) + FP-confirm (7)
        │                                    → 57 agree / 1 disagree (q096) → 主 context source-read → corrected
scripts/quiz-ocr-cleanup-S101.mjs          → drift-proof full-field assert-replace on raw bank
        │
scripts/build-quiz-corpus.mjs              → regenerate committed questions.json
        │
scripts/quiz-ocr-garble-scan.mjs           → re-scan = 15 hits, EXACTLY the 7 FP questions (0 real garble)
```

## Files

| file | what |
|---|---|
| `adjudication_S101.md` | Rule A semantic-audit evidence: method, FP table, source-verified cases, workflow result, q096 catch. |
| `ocr_cleanup_fixes_S101.json` | machine-readable fix list (58 `{id,letter,cls,from,to,zh,en,page,why}` + 7 FP groups). |
| `verify_workflow_result_S101.json` | raw workflow output (blind re-derivation + FP-confirm, 65 agents). |

## Result

- **58 choices_jp fields** cleaned (zero_in_alpha 33 · ascii_period_in_jp 15 · trailing_junk 5 · page_marker 4 · period_comma 1).
- **15 detector hits remain = 7 documented false-positive questions** (RAID0 / ESSID `A0B1C2D3E4` / flow-diagram boxes / IPA list spacing) — independently confirmed false_positive 7/7.
- **questions.json diff = 58 insertions / 58 deletions, all choice-letter values; correct_answer 0 changed (all 2900); quiz_index + translations untouched.** Raw bank (gitignored) edited in sync.
- Verification: tsc 0 / eslint 0err (1 pre-existing warning) / vitest 463 / build + nft (see session log).

## Notable

- **q096 / 2020r02o ウ** — blind re-derivation overruled a 主 context over-correction. Source page-44 literally reads `ISO` (not `OSI`); the OCR `ISO0` only added a spurious trailing `0`. 主 context had anchored on the zh/en translations (which say OSI). Corrected to `ISO`. The zh/en `ISO→OSI` deviation is a **translation-fidelity backlog item** (distractor, correct_answer unaffected) — NOT patched into the JP source.
- **Determinism win**: the S100 conclusion (single-LLM cosmetic-garble detection is non-deterministic, Run2≠Run3) is reaffirmed — the deterministic detector found a stable, exhaustive backlog in one pass, and the cleanup is fully reproducible (`from`/`to` assert-replace).
