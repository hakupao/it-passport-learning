# failures/

Per **Rule B** (`~/.claude/CLAUDE.md` `<personal_operating_principles>`): every failed attempt is archived here, **never deleted**. Each archive contains the input + the produced artifact + the technical verdict + the business verdict + the next-attempt input. This dir is committed.

> Failure data is the most expensive resource on a re-run or a retro. Don't `rm`.

---

## Layout

```
failures/
├── stage1_ocr/
├── stage4_structure/
├── stage4_5_glossary/
└── stage5_translate/
    ├── attempt_001/
    ├── attempt_002/
    ├── attempt_003/
    ├── attempt_005/
    └── plan_b_attempt_002/
```

Each stage subdir holds failure archives for that pipeline stage. Within `stage5_translate/`, multi-attempt failures are nested per attempt; Plan-B variants live alongside.

---

## How a failure is archived

Per `docs/templates/failure-template.md` (D-032), each archive captures:

| Field | Purpose |
|---|---|
| Input | Exact stimuli that led to the failure (sample IDs, prompt version, model, params) |
| Produced artifact | What the failed attempt actually output, verbatim |
| Technical verdict | Why it's technically wrong (schema mismatch, exception, timeout, …) |
| Business verdict | Why it's wrong for the user / pipeline goal |
| Next-attempt input | What changed for the next attempt to address the failure |

This template ensures the failure is reproducible and the recovery is auditable.

---

## Cumulative failure stats (Phase 1)

| Stage | Archive count | Notes |
|---|---:|---|
| Stage 1 OCR | small | Gate ① schema-checker FP archives; B.3 checker patches |
| Stage 4 Structure | small | F-MISTRAL-ANSWER-LINE-LOSS recovery chain |
| Stage 4.5 Glossary | small | Single-call opus retries |
| Stage 5 Translate | large | Plan-B (Sessions 09a / 09b) + stuck-leaf escalation (Session 19) |

Total tracked files at last count: **107** across the 4 stage subdirs.

---

## See also

- Rule A successes: `../evidence/` (what passed the audit)
- Phase 1 retro on failure patterns: `../RETROSPECTIVE.md` §2.2 (Stage 7 firefight) + §5.5 (v2 backlog)
- Post-publication validation defects → `../validation/` (iter-3 → iter-8 + their convergence reports)
