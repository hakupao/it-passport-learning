# evidence/

Per **Rule A** (`~/.claude/CLAUDE.md` `<personal_operating_principles>`): every pipeline step with >50 % compression or rewrite produces an N-sample independent audit, and the audit result lands under this directory. **This dir is committed.**

---

## Layout

```
evidence/
└── <cert_id>/
    └── runs/
        └── <run_id>/
            ├── step_NN_*.md     # narrative audit per step
            ├── audit/*.json     # raw audit JSON (Stage 6 reviewer outputs, etc.)
            ├── run_release_publish*.py  # release publication scripts
            └── page_*_hand_edit_*.md    # documented hand edits
```

---

## Current runs (IT パスポート, `cert_id = itpassport_r6`)

| Run | Status | Role |
|---|---|---|
| **`dry_run_2026-05-12T13-23-19/`** | 🟢 **canonical** | The production run that became v1.0.0 (`820235c`) and v1.0.2 (`c8c2c00`). All 5 D-079 gate checkpoints, all Stage 0–7 evidence, both release publish scripts. |
| `dry_run_2026-05-06T16-58-10/` | exploratory | Early 50-page dry-run (Sessions 06–08). Stage 1 OCR Stage B PASS evidence + initial pipeline shakedown. Useful as a reference data point; not a release source. |
| `dry_run_2026-05-12T09-48-06_polish_a/` | exploratory | Stage 6 Stage A 5-page audit baseline (Session 10). The 0-FAIL clean baseline before Stage B. |

**If you need the v1.0.0 / v1.0.2 audit trail**: read everything under `dry_run_2026-05-12T13-23-19/`.

---

## Read order

1. `step_00_unpack.md` → `step_07_export.md` for the linear pipeline narrative.
2. `step_06_audit.md` for the Stage 6 audit reviewer story (D-077).
3. `step_06_11_release.md` (v1.0.0) and `step_06_11_release_v1_0_2.md` (v1.0.2) for the publish path.
4. The `audit/` and `cost.json` files for machine-readable per-stage detail.

---

## What lives here vs. elsewhere

| Question | Read |
|---|---|
| "What's the live state of the project?" | `../docs/STATE.md` |
| "What failed and how was it recovered?" | `../failures/` (Rule B) |
| "What audit happened **after** v1.0.0 published?" | `../validation/` (iter-3 → iter-8) + `../RETROSPECTIVE.md` §8 + §9 |
| "What design decision drove this stage's audit?" | `../docs/decisions/` (e.g., D-058 / D-077 / D-079) |

---

## Conventions

- Filenames `step_NN_*` track the 8-stage pipeline (D-008). The `06_11` family covers Stage 6 audit reviewer + Step 6.11 Release publish.
- All audit JSON shapes are stable per D-058 / D-077 / D-081.
- No file in this dir may be deleted per Rule A (failures live in `../failures/` per Rule B; the two together form full traceability).
