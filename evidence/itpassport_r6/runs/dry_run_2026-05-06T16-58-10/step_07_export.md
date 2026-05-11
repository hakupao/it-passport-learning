# Stage 7 Export — Trilingual Release Bundle (itpassport_r6 / dry_run_2026-05-06T16-58-10)

> **STATUS = STEP 6.10 ✅ CLOSED** (2026-05-11) — dual gates passed; 84 files written; user sample-review sign-off received ("ok通过").
>
> Per D-078 (Stage 7 export v1 design — per-page JSON + Markdown + sidecar polish_items + dual release gate). All-deterministic — no LLM dispatch this stage; cost = $0.

---

## D-062 fields

| # | Field | Value |
|---|---|---|
| 1 | `stage` | 7 (export) |
| 2 | `cert_id` | `itpassport_r6` |
| 3 | `run_id` | `dry_run_2026-05-06T16-58-10` |
| 4 | `total` | 40 pages × 161 entities × 382 trilingual leaves |
| 5 | `N` | 100% coverage (Stage 7 emits every leaf; sample-review N TBD by user worksheet) |
| 6 | `sample_ids` | Stage 6 carry-forward: page_014 (clean control); page_022 (post-hand-edit + D6 normalization); page_038 (LLM unfaithful carry); page_043 (D6 choice marker normalize); page_045 (D11 kana_helper backfill candidates). User sample-review subset TBD. |
| 7 | `writer_agent` | n/a — Stage 7 is deterministic Python (no LLM). Stage 5 + Stage 6 closure are the upstream writers. |
| 8 | `writer_prompt_version` | n/a |
| 9 | `reviewer_agent` | Phase 1 + Phase 2 gates: `cert_extractor.pipeline.stage7_export.gates.run_gate_a` (full Stage 6 D1-D13 re-run) + `run_gate_b` (Stage 7 contract self-check). Plus user retro per 规则 D. |
| 10 | `reviewer_prompt_version` | n/a — deterministic |
| 11 | `pass_count` / `fail_count` | gate_a_passed=True, gate_b_passed=True (40/40 pages clean) |
| 12 | `pass_rate` | 1.000 (both gates) |
| 13 | `verdict` | **PASS** — 0 gate failures across 40 pages |
| 14 | `failures` | None |
| 15 | `started_at` / `finished_at` | 2026-05-11T19:00:00+09:00 (local wall-clock, dispatch <1 s) |
| 16 | `cost_estimate` | $0 shadow / $0 billed (deterministic; no LLM) |
| 17 | `git_sha` | `fdd1ee9` + Session 12 implementation (commits pending) |

---

## Pre-run input snapshot

Computed from `data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/`:

```
translated/  : 40 pages, 161 entities, 382 trilingual leaves
structured/  : 40 pages (jp ground truth for Gate A D1)
cleaned/     :  4 pages (page_002 / page_016 / page_043 / page_047 — Stage 3 promoted)
glossary.json: 55 entries (13 Plan-B patches, 2 hand-translations stable)
audit/stage6_review.json: Stage B rerun #3 clean baseline (22 PASS / 18 WARN / 0 FAIL / safety=False)
output/      : will be (re)created
```

---

## Engine configuration (D-078 §2.7 + §2.8)

| Knob | Value | Why |
|---|---|---|
| Output formats | JSON + Markdown (v1) | D-078 §2.1 / user Q1; JSONL + SQLite deferred to v2 |
| File granularity | per-page (`pages/page_NNN.{json,md}`) + 4 top-level files | D-078 §2.2 / user Q2 |
| JSON envelope | `schema_version=v1` + cert_id + run_id + page + exported_at + stage6_verdict + leaf_count + entities + polish_items_ref | D-078 §2.3 |
| Markdown layout | language-stacked `[JP] / [ZH] / [EN]` ASCII markers | D-078 §2.5 / user override |
| polish_items shape | sidecar (`polish_items.json`); FAIL excluded; evidence blob dropped | D-078 §2.4 / user Q3=C |
| Gate A | full D1-D13 Phase-1 re-run; **pre-normalize** (so D1 jp_mutation sees Stage 6 closure jp) | D-078 §2.6 / user Q4 + user override on full D1-D13 |
| Gate B | 4 contract checks: answer_index != -1 / UNTRANSLATED scan / canonical choice markers / fully-populated trilingual | D-078 §2.6 |
| Choice marker normalize | jp = `ア．イ．ウ．エ．` (full-width period) / zh+en = `A. B. C. D.` (half-width period) | D6 rs=7 carry-forward |
| Refusal contract | any gate failure → 0 files written; cli exits with error | D-078 §2.6 release-gate |

---

## Module + test layout

```
packages/extractor/src/cert_extractor/pipeline/stage7_export/
  __init__.py
  schema.py        (ExportEnvelope, IndexEntry, IndexSummary, PolishItem,
                    PolishItemBundle, ReleaseGateResult; 25 unit tests)
  normalizers.py   (choice_marker normalize, untranslated_scan,
                    iter_trilingual_dicts; 37 unit tests)
  gates.py         (run_gate_a, run_gate_b, run_both_gates; 14 unit tests)
  emitters.py      (emit_page_json, emit_page_md, emit_index_json,
                    emit_polish_items, emit_readme_md; 18 unit tests)
  runner.py        (Stage7Export orchestrator, Stage7Result;
                    9 unit tests — incl. half-width-jp regression)

packages/extractor/src/cert_extractor/cli.py
  + export-trilingual subcommand
```

Total Stage 7 tests: **103**. Full suite: **427 / 427 pass** (324 base + 103 Stage 7).

---

## Dispatch outcome — clean baseline ✅

CLI invocation (executed 2026-05-11):

```bash
uv run --project packages/extractor python -m cert_extractor.cli export-trilingual \
    --translated-dir data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/translated \
    --structured-dir data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/structured \
    --cleaned-dir   data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/cleaned \
    --glossary-path data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/glossary/glossary.json \
    --audit-path    data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/audit/stage6_review.json \
    --output-dir    data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/output \
    --confirm
```

### Result

| Field | Value |
|---|---|
| gate_a_passed | **True** (full D1-D13, 40 pages, 0 FAIL) |
| gate_b_passed | **True** (B1+B2+B3+B4 all 0 failures) |
| passed | **True** |
| pages_written | **40** |
| files_written | **84** (40 JSON + 40 MD + index.json + polish_items.json + README.md + glossary.json) |
| choices_normalized | **10** (Stage 6 D6 carry-forward marker fixes applied) |
| wall-clock | < 1 s |
| cost | $0 shadow / $0 billed |

### Files emitted

```
output/
├── index.json           (8.5 KB; schema_version=v1, totals + 40 IndexEntry rows)
├── glossary.json        (18.7 KB; verbatim copy of Stage 4.5 output)
├── polish_items.json    (44.6 KB; by_page=… + run_level=…; 102 items total)
├── README.md            (release-notes overview)
└── pages/
    ├── page_006.json    (envelope-wrapped trilingual entities)
    ├── page_006.md      (language-stacked Markdown)
    ├── ... × 40 pages
    └── page_050.md
```

### Bug surfaced + fixed during real-data dry-run

Stage 7 runner originally ran `normalize_all_questions` **before** Gate A, which caused page_042 + page_044 to FAIL D1 jp_mutation because Stage 7's full-width period substitution (`ア.` → `ア．`) made translated.jp diverge from structured.jp.  Fix: re-ordered to **Gate A → normalize → Gate B** (D-078 §2.6 + §2.7 amended same turn; runner docstring + module docstring updated; regression test `test_half_width_jp_marker_does_not_trigger_d1_jp_mutation` added).  Caught by real-data dispatch; this is exactly the kind of integration miss Stage 7 §2.6 dual gate is designed to surface early.

---

## Pre-sample audit checklist (user retro, post-run)

| # | Check | Expected | Result |
|---|---|---|---|
| 1 | All 40 pages have `pages/page_NNN.json` + `pages/page_NNN.md` | ✅ pair | 80 files in `pages/` |
| 2 | `index.json.totals.pages == 40` | yes | yes |
| 3 | `index.json.stage6_summary.fail_pages == 0` | yes | yes |
| 4 | `polish_items.json.by_page` keys are 3-digit zero-padded page strings | yes | yes |
| 5 | `polish_items.json` excludes FAIL severity entries | yes (Gate A guarantees) | yes |
| 6 | Choice markers normalized on Stage 6 D6 carry-forward pages (042 / 043 / 044) | yes (10 normalizations) | yes |
| 7 | `glossary.json` is verbatim copy of Stage 4.5 output | byte-identical | yes (shutil.copyfile) |
| 8 | Markdown uses `[JP]/[ZH]/[EN]` (not emoji flags) | yes (D-078 §2.5) | yes |
| 9 | No `UNTRANSLATED` residue in any emitted JSON | yes (Gate B B2) | yes |
| 10 | All Question.answer_index != -1 in emitted JSON | yes (Gate B B1) | yes |

---

## Sample IDs for user review (per D-078 §5.3)

Suggested sample subset for user sign-off (5 pages, ~13% coverage; mix of PASS/WARN + special cases):

1. **page_006** — clean PASS control (term-only chapter intro)
2. **page_022** — WARN with normalize applied + post-hand-edit (Plan-B Stage 6 closure correction lives here)
3. **page_038** — WARN with LLM L3 unfaithful (circular EN definition; carried forward as polish item)
4. **page_043** — WARN with D6 choice-marker normalization applied; multi-question page
5. **page_050** — last audited page; trailing edge sanity

Sample-review focus per page:
- JSON: schema_version="v1"; cert_id + run_id correct; envelope shape matches D-078 §2.3
- Markdown: `[JP] / [ZH] / [EN]` sections present; entities render in document order; tables format
- Cross-reference: `polish_items_ref` points to a valid `polish_items.json#pages/NNN` slot iff that page has issues

---

## Decision (post-run)

**Step 6.10 ✅ CLOSED** (2026-05-11, Session 12). User sample-review sign-off received ("ok通过") on suggested 5-page subset (page_006 / 014 / 022 / 038 / 043).

- Both gates PASS on real 40-page data.
- Output bundle at `data/.../output/` ready for Step 6.11 (全本 579 页 + GitHub Release tag per D-046).
- 18 WARN polish items + 14 INFO + 2 run-level INFO carry forward as documented sidecar in `polish_items.json`; release notes (README.md) point reviewers at the sidecar.

Step 6.11 entry-point unlocked.

---

## Cross-references

- ADR: `docs/decisions/D-078-stage7-export-v1.md` (this stage's spec; locked Session 12)
- ADR: `docs/decisions/D-008` (Stage 7 4-format target; D-078 amends to v1 = 2-format)
- ADR: `docs/decisions/D-046` (output via GitHub Release tag; Step 6.11 territory)
- ADR: `docs/decisions/D-050` (data/ gitignored; output stays under data/.../output/ pre-release)
- ADR: `docs/decisions/D-076` (envelope: UNTRANSLATED + answer_index = -1 hard refusal)
- ADR: `docs/decisions/D-077` (Stage 6 closure; 18 WARN polish items carried into Stage 7)
- Code: `packages/extractor/src/cert_extractor/pipeline/stage7_export/`
- Tests: `packages/extractor/tests/unit/test_pipeline_stage7_*.py` (103 tests)
- Session log: `docs/discussion/2026-05-11-session-12.md`

---

## Sign-off

| Role | Name | Time | Status |
|---|---|---|---|
| Designer | Claude main session (Opus 4.7 1M ctx) + user (4-Q + 2-override) | 2026-05-11T18:30 | ✅ D-078 ADR locked |
| Implementer | Claude main session (Opus 4.7) | 2026-05-11T19:00 | ✅ 5 modules + 103 unit tests + CLI; full suite 427/427 pass |
| Gate A reviewer (D1-D13 re-run) | Stage 7 runner | 2026-05-11T19:00 | ✅ 0 FAIL across 40 pages |
| Gate B reviewer (contract self-check) | Stage 7 runner | 2026-05-11T19:00 | ✅ 0 contract violations |
| Real-data dry-run | Claude main session | 2026-05-11T19:00 | ✅ 84 files written |
| Bug surfaced + fixed | Claude main session | 2026-05-11T19:00 | ✅ Gate A ordering fix + regression test |
| User sample-review (规则 D) | user | 2026-05-11 | ✅ PASS — "ok通过" on 5-page subset |
| Step 6.10 closure | user + Claude consensus | 2026-05-11 | **✅ CLOSED** — Step 6.11 unblocked |
