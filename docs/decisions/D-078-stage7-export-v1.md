# D-078 — Stage 7 export v1 design

| Field | Value |
|---|---|
| ID | D-078 |
| Title | Stage 7 export v1 design — per-page JSON + Markdown + sidecar polish_items + dual-gate invariant check |
| Status | **Locked** (2026-05-11, Session 12) |
| Phase / Stage | Phase 1, Step 6.10 |
| Supersedes | — |
| Amends | D-008 (Stage 7 pipeline spec — refines "JSON + JSONL + Markdown + SQLite" into v1 = JSON + Markdown only; JSONL + SQLite deferred) |
| Depends on | D-008 (stage 7 spec), D-046 (output via GitHub Release tag), D-050 (data/ gitignored), D-058 (D-062 envelope), D-076 (UNTRANSLATED + answer_index envelope), D-077 (Stage 6 audit reviewer, carries forward 18 WARN polish items) |
| ADR convention | per D-029 (major decisions get standalone ADR) |

---

## 1. Context

Step 6.9 Stage 6 closed at clean baseline (0 FAIL / 22 PASS / 18 WARN / safety_failed=False) on 2026-05-11. Step 6.10 Stage 7 export is the next pipeline step — converts `data/.../translated/page_NNN.json` + `glossary.json` + `audit/stage6_review.json` into releasable artifacts placed under `data/.../output/` and ultimately published as GitHub Release tag assets per D-046.

The original Stage 7 spec (D-008) lists 4 output formats (JSON / JSONL / Markdown / SQLite). For Step 6.10 dry-run validation, the user has scoped v1 to a smaller subset; deferred formats are tracked for v2.

The user posed 4 design questions at Session 12 open and provided answers via worksheet-style sign-off, with 2 explicit overrides during the proposal phase.

---

## 2. Decision

### 2.1 Output formats (v1 = JSON + Markdown only)

- **JSON**: canonical machine-readable artifact for Phase 2/3 consumers; per-page envelope + entity tree.
- **Markdown**: human-readable artifact for reviewers + git diff-friendly comparison; per-page file.
- **JSONL**: deferred to v2 (Anki / CSV consumer pattern).
- **SQLite**: deferred to v2 (Phase 2/3 learning-tool indexed access).

Rationale: v1 must cover the two most useful first-party consumers (canonical structured data + human review). The 2 deferred formats are derivable from JSON at any time without recapture.

### 2.2 File granularity = per-page

Output directory layout:

```
data/<cert_id>/runs/<run_id>/output/
├── index.json                      # top-level index + per-page summary
├── glossary.json                   # direct copy of stage 4.5 glossary
├── polish_items.json               # sidecar Stage 6 polish items (per §2.4)
├── README.md                       # release-notes-style overview
└── pages/
    ├── page_NNN.json               # per-page envelope + entities
    ├── page_NNN.md                 # per-page Markdown rendering
    └── ... (one pair per audited page)
```

Rationale: per-page granularity matches existing pipeline shape (`translated/page_NNN.json`); single-file mega-bundles bloat git-diff readability and complicate incremental updates when a single page is re-translated. Phase 3 web app can lazy-load pages individually.

### 2.3 Per-page JSON envelope

Each `pages/page_NNN.json` is wrapped in a self-describing envelope:

```json
{
  "schema_version": "v1",
  "cert_id": "<id>",
  "run_id": "<run_id>",
  "stage": 7,
  "page": <int>,
  "exported_at": "<ISO8601 with tz>",
  "stage6_verdict": "PASS" | "WARN",
  "leaf_count": <int>,
  "entities": [ <existing trilingual entity dicts> ],
  "polish_items_ref": null | "polish_items.json#pages/<NNN>"
}
```

Rationale: release artifacts must be self-describing. `translated/page_NNN.json` is a bare `list[entity]` with no schema_version / cert_id / audit traceability — adequate for internal pipeline staging but not for external consumers.

### 2.4 polish_items.json — sidecar (Q3 = C)

The 18 WARN + N INFO items carried forward from Stage 6 closure are emitted as a separate `polish_items.json` sidecar, **not** embedded as `quality_flags` fields on entities (which would have been Q3 = B).

Schema:

```json
{
  "schema_version": "v1",
  "cert_id": "<id>",
  "run_id": "<id>",
  "source": "stage6_review.json",
  "exported_at": "<ISO8601>",
  "totals": {"warn": <int>, "info": <int>, "run_level_info": <int>},
  "by_page": {
    "<NNN>": [<Stage6Issue dict subset>],
    ...
  },
  "run_level": [<Stage6Issue dict subset>]
}
```

`Stage6Issue` subset retained: `issue_id`, `issue_type`, `severity`, `repair_stage`, `entity_path`, `rationale`, `dimension`, `detector` — drop verbose `evidence` blob to keep sidecar small.

**FAIL severity is NOT included in the schema** — Stage 6 closure (D-077) guarantees `fail_pages = 0` before Stage 7 invocation. If Gate A (§2.6) ever surfaces a FAIL, the export is refused (release-gate behavior), so a FAIL never appears in the emitted artifact.

Rationale: consumers (Phase 2/3 learning tools) typically don't need polish metadata; only release reviewers and Phase 2 internal QA do. Sidecar keeps main artifact clean while preserving full audit detail.

### 2.5 Per-page Markdown layout — language-stacked sections with `[JP]` / `[ZH]` / `[EN]` markers (Q2 override)

Each `pages/page_NNN.md`:

```markdown
# Page NNN — <jp title> / <zh title> / <en title>

> cert: <cert_id> · stage 6 verdict: <PASS|WARN> · <leaf_count> leaves · <entity_count> entities

---

## [JP]
<jp rendering of each entity in document order>

---

## [ZH]
<zh rendering>

---

## [EN]
<en rendering>

---

<!-- entity anchors: {entity_id}-jp, {entity_id}-zh, {entity_id}-en -->
```

Marker convention: `[JP]` / `[ZH]` / `[EN]` (ASCII bracketed code, **not** emoji flags) per user override 2026-05-11.

Rationale (language-stacked vs three-column-parallel):
- narrow screen + GitHub render: stacked never overflows horizontally
- table/figure entities can be long; column form would clip or scroll-x
- consumer wanting parallel-column view can re-render from JSON at will
- glossary callouts inline when applicable; otherwise glossary.json is sidecar reference

### 2.6 Export-time invariant check — dual gate (Q4 = D)

Stage 7 runner runs two release gates **before** writing any output. Either gate failing → refuse to write + emit specific error pointing to page+entity_path.

#### Gate A — Stage 6 Phase-1 deterministic re-run (full D1-D13, per user override 2026-05-11)

Re-uses `cert_extractor.pipeline.stage6_audit.detectors.run_phase1` on the about-to-be-exported translated content. Re-runs all 13 deterministic detectors:

- D1 jp_mutation
- D2 untranslated_residue
- D3 schema_invalid
- D4 answer_index_out_of_range
- D5 answer_index_mismatch
- D6 choice_marker_inconsistent
- D7 numeric_inconsistent
- D8 glossary_lock_violated
- D9 glossary_lock_missed
- D10 redundant_nested_parens
- D11 kana_helper_missing
- D12 kana_helper_format
- D13 run-level glossary self-consistency

Acceptance: 0 FAIL severity issues across all pages (WARN/INFO are non-blocking and pass through to polish_items.json).

No LLM call. Pure Python, ~1 second runtime.

Rationale for "full D1-D13" (user-chosen) vs "only D-076 safety-tagged subset":
- defense-in-depth against post-closure manual edits to `translated/`
- cost is negligible (no LLM)
- catches Stage 6 closure regressions that would otherwise reach release

#### Gate B — Stage 7-specific contract self-check

After normalization, before write-out:

- ✓ `answer_index != -1` for every `Question` entity across all pages (D-076 envelope)
- ✓ Zero `UNTRANSLATED` sentinel residue across all jp/zh/en fields (D-076 envelope)
- ✓ Choice marker normalization applied: zh + en choices use `A./B./C./D.` (or `A）/B）` etc per export-emit convention); jp choices keep `ア./イ./ウ./エ.` (D6 rs=7 carry-forward from D-077)
- ✓ Every trilingual leaf has all three languages populated (no None / empty)
- ✓ Envelope `schema_version` / `cert_id` / `run_id` consistent across all `pages/page_NNN.json` + `index.json` + `polish_items.json`

### 2.7 CLI entry point

```bash
uv run --project packages/extractor python -m cert_extractor.cli export-trilingual \
    --translated-dir data/<cert_id>/runs/<run_id>/translated \
    --glossary-path  data/<cert_id>/runs/<run_id>/glossary/glossary.json \
    --audit-path     data/<cert_id>/runs/<run_id>/audit/stage6_review.json \
    --output-dir     data/<cert_id>/runs/<run_id>/output \
    --cert-id        <cert_id> \
    --run-id         <run_id> \
    --schema-version v1 \
    --formats        json,md \
    --confirm
```

Subcommand mirrors `audit-trilingual` / `translate-entities` shape (D-077 §2.7 convention).

`--formats` default = `json,md`; `--confirm` required to actually write (mirrors pipeline-stage convention; protects against accidental overwrite).

### 2.8 Module layout

```
packages/extractor/src/cert_extractor/pipeline/stage7_export/
├── __init__.py
├── schema.py        # ExportEnvelope, IndexEntry, IndexSummary,
│                    # PolishItem, PolishItemBundle, ReleaseGateResult
├── normalizers.py   # choice_marker_normalize, untranslated_scan
├── gates.py         # Gate A wrapper + Gate B contract checks
├── emitters.py      # emit_page_json, emit_page_md, emit_index_json,
│                    # emit_polish_items_json, emit_readme_md
└── runner.py        # Stage7Export orchestrator + Stage7Result
```

Test target: ≥ 40 new unit tests covering schema validation, normalizers (positive + negative), both gates (positive + every kind of failure), emitter shape, runner orchestration. Suite-wide goal: 324 + ≥ 40 = ≥ 364 pass.

---

## 3. Rejected alternatives

| Alternative | Reason |
|---|---|
| Emit all 4 formats (JSON + JSONL + Markdown + SQLite) in v1 | Q1 scoped to JSON + Markdown; JSONL/SQLite derivable from JSON at any time without recapture |
| Single big `itpassport_r6.json` for all 40 pages | Q2 chose per-page; large bundle bloats git-diff, complicates incremental re-translate |
| Bare `list[entity]` per-page JSON (no envelope) | Release artifacts must be self-describing — schema_version + cert_id + run_id + audit verdict are required for consumer reproducibility |
| Polish items embedded as `quality_flags` field on each entity | Q3 chose sidecar; embedding pollutes main artifact, most consumers don't need polish metadata |
| Three-language parallel-column Markdown | Narrow-screen / GitHub render overflow; tables/figures clip; stacked never overflows |
| Emoji flag language markers (🇯🇵🇨🇳🇬🇧) | User override 2026-05-11: prefer ASCII `[JP]/[ZH]/[EN]` for portability + plain-text grep-ability |
| Skip Gate A | Q4 = D requires both gates; defense-in-depth against post-closure manual edits |
| Gate A = only D-076 safety-tagged subset | User override 2026-05-11: full D1-D13 — cost is negligible (no LLM), catches all Stage 6 regression classes |
| Trust Stage 6 closure without re-check | Same as above; Stage 6 closure was on a specific point-in-time; manual edits to `translated/` between Stage 6 and Stage 7 are possible |
| Output committed to git instead of GitHub Release | D-046 already locked: output via tag + Release asset, not git history; D-050 gitignores `data/` |

---

## 4. Consequences

### Positive

- v1 scope is achievable in one session of focused TDD work (≥ 40 unit tests, no LLM dispatch needed, ~1-day Tier-3 deliverable)
- Release artifact is self-describing + auditable (schema_version + audit traceability + polish sidecar)
- Phase 2/3 consumers can lazy-load per-page; consumers needing flat bundle can stream-concatenate
- Dual-gate guards against post-closure regression on `translated/`

### Negative / trade-offs

- v1 doesn't yet cover JSONL / SQLite — Phase 2 (Anki) and Phase 3 (web-app indexed DB) need v2
- Per-page granularity = 40 + 40 + 5 + 1 = 86 files (40 JSON + 40 MD + index + glossary + polish_items + README) in release bundle; consumer must understand pagination — manageable but more setup than a single mega-bundle
- Markdown sectional (per-language stacked) makes side-by-side review harder; reviewers needing parallel comparison render from JSON

### Risks

- Choice marker normalization in Stage 7 means jp choices in JSON stay as ア/イ/ウ/エ while zh/en become A./B./C./D. — consumers must not assume cross-language marker symmetry
- Sidecar `polish_items.json` consumers must know to look there; otherwise polish items invisible

---

## 5. Acceptance criteria for Step 6.10 closure

1. ≥ 40 new unit tests in `test_pipeline_stage7_*.py`, full suite ≥ 364 pass (324 + 40)
2. CLI `export-trilingual --confirm` runs on the existing `dry_run_2026-05-06T16-58-10` run, both gates PASS, writes 40 + 40 + 4 = 84 files (plus pages/) under `data/.../output/`
3. Output sample (page_006.json + page_006.md) reviewed by user
4. `polish_items.json` contains 18 WARN items + 14 INFO items + 2 run-level INFO matching `stage6_review_stageB_rerun3_clean.json` exactly
5. Step 6.10 evidence: `evidence/.../step_07_export.md` with pre-run snapshot + post-run sample audit + sign-off
6. STATE.md sync: Step 6.10 ✅; Step 6.11 unblocked (full-book 579-page run + GitHub Release)

---

## 6. References

- D-008 — Stage 7 pipeline spec (4-format target; this ADR refines to v1 = 2-format)
- D-029 — major decisions get standalone ADR (this is one)
- D-046 — output via GitHub Release tag, not git history
- D-050 — `data/` gitignored; output sits there before release
- D-058 — D-062 envelope schema
- D-073 — Phase 1 launch strategy (Step 6.10 → 6.11 → Stage 7 production release)
- D-076 — UNTRANSLATED / answer_index = -1 envelope contracts
- D-077 — Stage 6 audit reviewer (carries 18 WARN polish items into Stage 7)
- D-019 — slow-pace 3a (this ADR followed: 4 questions posed → user answered → proposal → user partial override → lock)
- D-027 — decision-on-lock writeback (this ADR + Session 12 log + STATE.md updated same turn)
- Session 12 log: `docs/discussion/2026-05-11-session-12.md`
- Stage 6 closure evidence: `evidence/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/step_06_audit.md`

---

## 7. Sign-off

| Role | Name | Time | Status |
|---|---|---|---|
| Open-question poser | Claude main session (Opus 4.7 1M ctx) | 2026-05-11T18:30+09:00 | 4 Q posed per D-019 |
| User answerer | user | 2026-05-11 | 4 Q answered (Q1=JSON+MD, Q2=per-page, Q3=C, Q4=D) |
| Proposer | Claude main session | 2026-05-11 | proposal §1-§8 |
| User 2nd-round refiner | user | 2026-05-11 | 2 overrides (markers ASCII, Gate A full D1-D13) |
| Locker | Claude main session | 2026-05-11 | D-078 locked, this ADR |
| Implementer | TBD (Session 12 continuation) | TBD | TDD scaffolding pending |
| User final sign-off (Step 6.10 closure) | user | TBD | post implementation + tests + dry-run |
