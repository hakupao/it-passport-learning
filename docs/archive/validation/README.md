# validation/

**Post-publication** deep validation of Phase 1 output. This is the long second-review chain run after v1.0.0 shipped to GitHub Releases.

> Not to be confused with `evidence/` (Rule A, per-stage audit **during** the build) or `failures/` (Rule B, archive of failed attempts during the build). `validation/` is **post-build**, content-quality-oriented.

---

## What's here

```
validation/
└── deep_validation_2026-05-17/
    ├── README.md                      # per-iter table + entry pointers
    ├── initial_validation/            # the 3-track dimensional audit (V1 OCR / V2 translation / V3 structure)
    ├── iter_3/  …  iter_8/            # fix/convergence chain
    ├── scripts/                       # reusable fix + sample-build scripts
    └── logs/                          # operational logs
```

Only one validation event so far — the 2026-05-17 → 2026-05-18 chain that took Phase 1 from v1.0.0 → v1.0.2.

---

## Cumulative outcome

- **205 distinct fresh pages** sample-audited through iter-3 + iter-4 + iter-5 + iter-6
- **554 / 554 pages** atomic-leaf audited in iter-7 (full corpus, 100 %)
- **~736 JSON edit-units + 46 MD regenerations** applied as iter-3..8 surgical fixes
- **38 release-impacting fix IDs** (F1–F38)
- **$0 LLM billed** across ~80 reviewer + fix-writer agent dispatches (max-plan OAuth per D-069)
- **9 distinct Rule-D subagent types** used in cross-reviewer chain (strongest Rule-D compliance in project history)
- Output → published as **`itpassport-r6-v1.0.2`** on 2026-05-18

Full narrative: `RETROSPECTIVE.md` §8 (iter-5+6) + §9 (iter-7+8).

---

## Read order

1. `deep_validation_2026-05-17/README.md` — iter timeline + status table
2. `deep_validation_2026-05-17/initial_validation/VALIDATION_REPORT.md` — the kickoff three-track report (V1/V2/V3) that motivated iter-3
3. `deep_validation_2026-05-17/iter_3/...iter_7/ITER*_CONVERGENCE_REPORT.md` — per-iter narrative
4. `../RETROSPECTIVE.md` §8 + §9 — final synthesis appended to Phase 1 retro

---

## See also

- Released artifacts → [GitHub Releases](https://github.com/hakupao/it-passport-learning/releases)
- Phase 1 retrospective → [`../RETROSPECTIVE.md`](../RETROSPECTIVE.md)
- Live project state → [`../docs/STATE.md`](../docs/STATE.md)
