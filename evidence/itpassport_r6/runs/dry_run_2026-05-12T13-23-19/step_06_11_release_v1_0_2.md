# Step 6.11.E — Release Publication v1.0.2 Evidence (patch release)

> Run: `dry_run_2026-05-12T13-23-19`
> Cert: `itpassport_r6`
> Step: v1.0.2 patch-release publish (post-publication validation harvest)
> Tag: `itpassport-r6-v1.0.2`
> Release URL: https://github.com/hakupao/it-passport-learning/releases/tag/itpassport-r6-v1.0.2
> Published: 2026-05-18T02:45:00Z
> Target SHA: `c8c2c00c9eb448337fdc68011d3418995e2af116` (commit chain `2db596f → 9318e20 → c8c2c00`)
> Predecessor: `itpassport-r6-v1.0.0` published 2026-05-16T15:30:08Z on `820235c` (Session 22)
> Skipped intermediate: v1.0.1 in-tree candidate (iter-3..6) — never published as standalone Release

---

## 0. Outcome

**Phase 1 v1.0.2 published as a public GitHub Release.** Same trilingual
shape as v1.0.0; layered with **~736 JSON edit-units + 46 MD regens**
from post-publication deep validation (iter-3 → iter-8, 38 fix IDs F1-F38).

| field | value |
|---|---|
| Release tag | `itpassport-r6-v1.0.2` |
| Release name | `itpassport_r6 — Trilingual Edition v1.0.2` |
| Target SHA | `c8c2c00c9eb448337fdc68011d3418995e2af116` (commit 3 of the v1.0.2 harvest chain) |
| Asset count | **6** |
| Asset payload | **2.25 MB** total (1.81 MB zip + 5 sidecars) |
| Published at | `2026-05-18T02:45:00Z` |
| URL | https://github.com/hakupao/it-passport-learning/releases/tag/itpassport-r6-v1.0.2 |

---

## 1. v1.0.2 harvest summary (what's new vs v1.0.0)

| Iter | Coverage | Fixes | Edit-units | Verification chain |
|---|---|---|---|---|
| iter-3 | dual-track sample (~115 pages) | 535 | ~535 JSON | OCR-track + translation-track |
| iter-4 | R15 (30 fresh) + R17 (12) | F-iter4×2 | 4 JSON + 2 MD | R17 0 release-impacting |
| iter-5 | R18 (30 fresh, 9-slice) | F1-F8 | 48 JSON + 6 MD | R20 verifier blind |
| iter-6 | R20-FRESH (10 new) → R21 corrective | F9-F11 | 19 JSON + 2 MD | R22 critic blind |
| iter-7 | **R23 full corpus 554 / 554 pages (100 %)** | F12-F36 | **126 JSON + 34 MD** | R25 architect + qa-tester |
| iter-8 | R25-FRESH-RESCAN (15 new) → R26 corrective | F37-F38 | 4 JSON + 2 MD | R27 critic blind |
| **Total** | **100 %** | **38 release-impacting** | **~736 JSON + 46 MD** | **9 distinct subagent types (Rule D)** |

**LLM cost across iter-3 → iter-8: $0 billed** (max-plan OAuth per D-069
throughout).

Per-fix detail: `RETROSPECTIVE.md` §8 (iter-5+6, F1-F11) + §9 (iter-7+8,
F12-F38) + per-iteration convergence reports at
`validation/deep_validation_2026-05-17/iter_{4,5,7}/ITER*_CONVERGENCE_REPORT.md`.

---

## 2. Publication mechanics

### 2.1 Invocation

Forked `run_release_publish.py` (v1.0.0, Session 22) into
`run_release_publish_v1_0_2.py`. Only delta: `INTRO_MD` → v1.0.2 intro
path; `version` → `"v1.0.2"`. All other shapes (PublishInputs,
adr_ids, glossary/index/polish flatteners) identical, by design — the
`release.publish()` orchestrator from 6.11.C is unchanged so the
release-publish contract (D-081 §2.4) is honored on the same path that
v1.0.0 used.

### 2.2 Dry-run smoke check

```
[release-publish] mode = DRY-RUN
[release-publish] DONE
  tag          = itpassport-r6-v1.0.2
  asset_count  = 6
  total_bytes  = 2,356,191 (2.25 MB)
```

6 assets staged under `data/.../release/itpassport-r6-v1.0.2/`:

| File | Size | Notes |
|---|---:|---|
| `itpassport-r6-output-v1.0.2.zip` | 1,809,458 | full 554-page tree (carries iter-3..8 corrections in pages/) |
| `README.md` | 690 | unchanged from v1.0.0 |
| `index.json` | 114,123 | unchanged from v1.0.0 (Stage 6/7 not re-run) |
| `glossary.json` | 317,921 | carries F6 / F10 glossary fixes (g_161 + g_538 polysemy override) |
| `polish_items.json` | 113,584 | unchanged from v1.0.0 |
| `SHA256SUMS.txt` | 415 | regenerated for new zip + sidecars |

### 2.3 RELEASE_NOTES.md composition

Auto-composed by `cert_extractor.release.notes.compose_notes()` from:

- intro: `docs/release-notes/itpassport-r6-v1.0.2-intro.md` (newly authored, ~370 words; "What changed since v1.0.0" + "Verification cadence" + "Cost" + "Migration from v1.0.0 / v1.0.1" subsections)
- index_for_notes: pages=554 / entities=2224 / leaves=6059 / glossary terms=908 (carried from v1.0.0)
- stage6_summary: PASS(24) / WARN(14) / FAIL(2), safety_failed=False (carried from v1.0.0)
- stage7_summary: A=True, B=True (carried from v1.0.0)
- cost_for_notes: Mistral $0.5790 billed / Anthropic $0.0000 billed / shadow $657.3469 (carried from v1.0.0)
- ADRs: D-008, D-069, D-072, D-076, D-077, D-078, D-079, D-080, D-081 (same 9 ADR set as v1.0.0)
- git_context: SHA `c8c2c00...`, run_id `dry_run_2026-05-12T13-23-19`

Output: 4394 bytes. Body confirmed clean by Read of staged file before
`--confirm`.

### 2.4 Confirm + publish

User authorization via AskUserQuestion answer "GO：跳 --confirm 真发"
(blocked by auto-mode classifier), then re-authorized by user manual
invocation via `!`:

```
$ uv run python evidence/.../run_release_publish_v1_0_2.py --confirm
[release-publish] mode = CONFIRM (gh release create)
[release-publish] DONE
  tag         = itpassport-r6-v1.0.2
  release_url = https://github.com/hakupao/it-passport-learning/releases/tag/itpassport-r6-v1.0.2
```

### 2.5 Post-publish verification

```
$ gh release view itpassport-r6-v1.0.2 --json …
  tagName          = itpassport-r6-v1.0.2
  targetCommitish  = c8c2c00c9eb448337fdc68011d3418995e2af116
  publishedAt      = 2026-05-18T02:45:00Z
  assets           = 6 uploaded
    glossary.json                       317,921
    index.json                          114,123
    itpassport-r6-output-v1.0.2.zip   1,809,458
    polish_items.json                   113,584
    README.md                                690
    SHA256SUMS.txt                           415
```

All 6 asset sizes byte-for-byte match the staged versions. SHA256SUMS
manifest committed alongside the zip; client can verify with `sha256sum
-c SHA256SUMS.txt`.

---

## 3. What v1.0.2 does NOT change

- **v1.0.0 GitHub Release**: immutable, remains accessible at its
  original URL on `820235c`.
- **D-001 → D-081 ADR set**: zero new ADRs; iter-3..8 work documented
  in `RETROSPECTIVE.md` §8 + §9 as Rule-C addendum.
- **Output schema**: identical to v1.0.0 — no consumer migration
  required beyond `s/v1\.0\.0/v1.0.2/g` on download URLs.
- **Stage 6/7 verdict numbers**: carried verbatim from v1.0.0 build
  because Stage 6 + Stage 7 were not re-run for iter-3..8 (which would
  have cost real LLM dollars without changing downstream behavior).
  v1.0.2 intro §"What you get" explicitly documents this design choice.
- **Phase 1 closure**: Phase 1 was already ✅ DONE per Session 23. v1.0.2
  is a post-Phase-1 patch-release harvest, not a Phase 1 reopening.

---

## 4. Rule-D evolution (project history)

| Lifecycle | Subagent types in use |
|---|---|
| v1.0.0 build pipeline | (build/test/audit through dedicated executors per stage) |
| iter-3 (post-pub validation #1) | scientist (OCR + translation tracks) + various |
| iter-5 | **code-reviewer** ×9 + **analyst** triage |
| iter-6 | **verifier** ×2 (R20) + **critic** ×2 (R22) |
| iter-7 | **scientist** ×56 (R23) + **tracer** triage + **executor** fix-author + **architect** verify + **qa-tester** fresh-rescan |
| iter-8 | (parent-written R26) + **critic** (R27) |
| **Cumulative** | **9 distinct subagent types** — the strongest cross-reviewer separation in project history |

Reference list of the 9: `code-reviewer`, `analyst`, `verifier`,
`critic`, `scientist`, `tracer`, `executor`, `architect`, `qa-tester`.

---

## 5. Provenance

- This evidence file: `evidence/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/step_06_11_release_v1_0_2.md`
- Companion run script: `evidence/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/run_release_publish_v1_0_2.py`
- v1.0.2 intro: `docs/release-notes/itpassport-r6-v1.0.2-intro.md`
- Auto-composed body in staging: `data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/release/itpassport-r6-v1.0.2/RELEASE_NOTES.md`
- v1.0.0 reference: `evidence/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/step_06_11_release.md` (Session 22)
- Validation source-of-truth: `RETROSPECTIVE.md` §8 + §9 (Rule-C addendum)
- Per-iteration evidence: `validation/deep_validation_2026-05-17/iter_{4,5,7,8}/`

---

## 6. Sign-off

**Phase 1 v1.0.2 patch release ✅ published.** Public URL:
https://github.com/hakupao/it-passport-learning/releases/tag/itpassport-r6-v1.0.2

This was the deliverable promised by RETROSPECTIVE.md §9.7 "v1.0.2
patch-release candidate" — it is now actually published, not a candidate.
