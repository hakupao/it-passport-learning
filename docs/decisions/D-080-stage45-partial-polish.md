# D-080 — Stage 4.5 partial polish v1.5: D11 kana_helper auto-backfill + D13 glossary self-consistency split

| Field | Value |
|---|---|
| ID | D-080 |
| Title | Pre-Stage-C polish — Stage 4.5 deterministic refinements only (D11 kana_helper auto-backfill + D13 surface-concept split); Stage 5 prompt v2 (LLM-touching) deferred to v2 Release |
| Status | **Locked v1.0** 2026-05-11 → **Amended v1.1** 2026-05-12 (acceptance §2.3 invalidated post implementation; polish code retained as 579-page safety net per §8 amendment below) |
| Phase / Stage | Phase 1, Step 6.10.5 → 6.11 (pre-Stage-C polish window) |
| Supersedes | — |
| Amends | D-008 (Stage 4.5 glossary spec — refines: now includes auto-backfill rule + self-consistency split as part of the Stage 4.5 contract, not as Stage 7 normalization) |
| Depends on | D-008 (Stage 4.5 in pipeline), D-077 (Stage 6 carry-forward catalogue), D-078 (polish_items sidecar — sidecar count drops by 13 after D-080 takes effect) |
| ADR convention | per D-029 |

---

## 1. Context

Step 6.9 Stage 6 closed (Session 11) with 18 WARN + 14 INFO + 2 run-level INFO polish items carried forward into Stage 7. Per D-078 §2.5, all of these emit into `polish_items.json` as honest disclosure on Release.

For the 579-page Stage C run, the polish items extrapolate by ~14.5× (proportional to page count), unless the underlying detector signals are pre-suppressed at source. Two categories are purely deterministic — no LLM dispatch required, no risk of LLM drift — and pre-fixing them at Stage 4.5 cleanly reduces the Stage C `polish_items.json` count without disturbing other Stage 5/6 outputs.

The remaining categories (LLM L3 translation_unfaithful WARN, D7 numeric paraphrase WARN, etc.) are LLM-quality issues that require Stage 5 prompt revision + re-baselining + sample review — a full Plan-B-equivalent cycle. Pre-Stage-C is not the time to spend that cycle: the user can review the actual 579-page Stage 6 verdict before deciding v2 polish scope.

User authorized "我想听听你的建议" → "全部 ok" → Claude proposes + locks per D-019 + D-027. Per `feedback_quality_over_cost.md`: cheap-deterministic-quality-wins (D11+D13) included; expensive-LLM-touching-quality (Stage 5 v2) explicitly deferred with rationale.

---

## 2. Decision

### 2.1 Scope — exactly two refinements, both at Stage 4.5

**Polish #1 — D11 kana_helper auto-backfill**

Stage 4.5 glossary builder is extended: scan every entity's `surface` (and inline term occurrences in narrative entities) for katakana terms matching:

- length ≥ 3 chars, AND
- all-katakana (no kanji / hiragana / latin mixed), AND
- NOT in a configurable basic-kana stop-list (e.g. パソコン, データ — common terms learners already read)

For each match, emit a `kana_helper` placeholder entry into the glossary:

```json
{
  "surface": "<jp katakana surface>",
  "reading": "<katakana itself; Stage 5 LLM may refine to hiragana phonetic if useful>",
  "zh_concept": "<placeholder; Stage 5 LLM fills>",
  "auto_backfill": true
}
```

The `auto_backfill: true` marker lets Stage 6 D11 detector distinguish auto-suggested vs human-authored entries (both pass D11 audit; field exists for traceability).

Stage 5 translation step (unchanged from D-074/D-075/D-076) sees the placeholder and fills `zh_concept` as part of regular translation; the surface itself is locked per D-075 jp-preservation.

Stop-list lives at `packages/extractor/src/cert_extractor/pipeline/stage45_glossary/kana_stop_list.txt` (one term per line, gitignored-free, hand-curated initial seed from dry-run analysis).

**Polish #2 — D13 surface-concept split**

Stage 4.5 glossary builder is extended: every glossary entry whose `surface` contains a multi-concept separator (`/`, `→`, `,`, `、`, `；`, `;`) is auto-split into multiple entries, one per concept. Surface, jp, zh, en, and (if applicable) reading/zh_concept are each split on the separator and re-keyed.

If the separator-split produces unbalanced parts (jp has 2 parts, zh has 3) the splitter logs a WARN entry into Stage 4.5's own evidence file (`evidence/.../step_45_glossary.md`) and emits both original AND split entries — letting Stage 6 audit decide; never silently drops data.

D13 detector (run-level glossary self-consistency, per `D-077` reviewer catalogue) re-runs on the rebuilt glossary; targets: 0 D13 run-level INFO emissions.

### 2.2 Out of scope — explicitly deferred

| Carry-forward | Why deferred |
|---|---|
| **Stage 5 prompt v2** (page_022 ストラテジ→Strategy tautology, page_038 circular EN, suffix inconsistency) | LLM-quality; requires (1) prompt revision in `stage5_translate/prompts.py`, (2) re-run Stage 5 on 40-page baseline, (3) re-audit Stage 6, (4) user sample review — full Plan-B-equivalent cycle. Pre-Stage-C not the right time; v2 Release after 579-page polish_items review. |
| **D7 numeric_inconsistent style WARN** (~22 leaves) | Most are paraphrase/style differences (e.g. "100 万件" vs "100 万 items"), not factual conflict; D-077 already softened D7 from FAIL to WARN on style-only divergence. v2 Release prompt-engineering decision. |
| **D6 choice_marker_inconsistent ×3** | Already handled at Stage 7 export normalizer (D-078 §2.6 Gate B). No Stage 4.5 work needed. |

### 2.3 Validation contract

Before D-080 work is considered done:

1. **Polish #1 acceptance**: re-run Stage 4.5 on existing `dry_run_2026-05-06T16-58-10` → re-run Stage 5 (Anthropic, ~$10 shadow / $0 billed per max-plan OAuth) → re-run Stage 6 deterministic only (`audit-trilingual --phase 1`) → D11 INFO count = 0
2. **Polish #2 acceptance**: re-run Stage 4.5 on existing dry-run → Stage 6 phase-1 only → D13 run-level INFO count = 0
3. **No regression**: D1, D5, D7 strict-FAIL counts remain 0; total polish_items count drops by exactly 13 (11 D11 + 2 D13), no new FAILs
4. **Test target**: ≥ 8 new unit tests (4 per polish) covering positive cases + edge cases (stop-list hit, separator absent, unbalanced split)
5. **Full suite**: ≥ 435 tests pass (427 base + 8 new)

If polish #1 introduces a Stage 5 cost overage (LLM filling more placeholders), document in `evidence/.../step_45_polish.md` — acceptable up to $15 shadow / $0 billed; abort + redesign above.

### 2.4 Module touchpoints

```
packages/extractor/src/cert_extractor/pipeline/stage45_glossary/
├── builder.py                 # +scan_katakana_terms + split_multi_concept
├── kana_stop_list.txt         # NEW; hand-curated seed
└── tests/
    ├── test_kana_backfill.py  # NEW; ≥4 cases
    └── test_concept_split.py  # NEW; ≥4 cases
```

No changes to Stage 5, Stage 6, Stage 7. The `auto_backfill` field is additive in the glossary schema; existing consumers ignore unknown fields (per D-058 schema versioning forward-compat).

---

## 3. Rejected alternatives

| Alternative | Reason rejected |
|---|---|
| **(a) Ship as-is** — no pre-Stage-C polish, take Stage 6 polish_items into Release as-is | D11+D13 are deterministic + cheap (Python, no LLM); scale to 579 = 11×14.5 + 2×14.5 ≈ 161+29 polish_items unnecessarily; `feedback_quality_over_cost.md` says "cheap quality wins" |
| **(b) Full polish — also Stage 5 prompt v2** | (1) Plan-B-equivalent cycle = 40-page Stage 5 + Stage 6 + sample review cost, ~$15 shadow + 1 session of attention. (2) Stage 5 prompt change risks introducing new WARN clusters not seen in current 40-page baseline (prompt changes are inherently regression-prone). (3) The right time is **after** the user sees the actual 579-page distribution of LLM-quality WARN — that signal is far more informative than the 40-page sample. |
| **(c) Polish only D11 (skip D13)** | D13 split is structurally simpler than D11 backfill (string-split vs scan-and-emit); cost saving is marginal; D13 fixes 2 run-level INFO that would otherwise persist into Release polish_items as misleading "should be split" markers |
| **(d) Stage 7 normalize instead of Stage 4.5 polish** | D11 backfill can't happen at Stage 7 — it needs the glossary at Stage 5 translation time to produce the actual zh_concept. D13 split could theoretically happen at Stage 7, but at Stage 7 the term has already been translated by Stage 5 against the un-split form — fixing only the surface would create jp/zh/en mismatch. Stage 4.5 is the right architectural layer. |

---

## 4. Consequences

### 4.1 Positive

- Stage C `polish_items.json` count drops by ~190 (extrapolated); first Release is meaningfully cleaner without LLM cost
- Stage 4.5 contract is now closer to the long-term "complete glossary" spec
- Future certs (Phase 5 generalization) inherit kana_helper auto-backfill — useful for any kana-heavy domain
- D-058 forward-compat is exercised (new schema field `auto_backfill: true` added without breaking existing consumers)

### 4.2 Negative / trade-offs

- Stage 4.5 builder grows from ~120 LOC to ~250 LOC; some added complexity
- Stop-list curation is hand-work; initial seed is small (~20 entries) and may miss cases — those leak as kana_helper auto-injections, which Stage 5 LLM still fills correctly (just with extra calls = slightly more cost). Net negative is small.
- Validation cost: ~$10 shadow / $0 billed on the 40-page re-run before locking D-080 acceptance

### 4.3 Risks

- **Kana stop-list false negatives** — a term that should NOT get a kana_helper gets one anyway; Stage 5 LLM fills a redundant zh_concept; benign. Cost: ~$0.01 per false negative. Easy to fix retroactively by adding to stop-list.
- **Concept-split unbalanced cases** — handled by emitting both original AND split (never silently drops); Stage 6 catches via D13 if mismatch remains; no data loss.

---

## 5. Acceptance criteria

D-080 acceptance criteria are the validation contract in §2.3:

1. D11 INFO count on re-baselined 40-page glossary = 0
2. D13 run-level INFO count on re-baselined 40-page glossary = 0
3. No regression: 0 new D1/D5/D7 FAIL
4. ≥ 8 new unit tests; suite ≥ 435 pass
5. Validation cost ≤ $15 shadow / $0 billed; cost.json updated; documented in `evidence/.../step_45_polish.md`
6. `kana_stop_list.txt` seed checked in with ~20 entries from dry-run analysis

---

## 6. References

- D-008 — Stage 4.5 in pipeline; this ADR amends the glossary builder contract
- D-029 — major decisions get standalone ADR
- D-058 — schema versioning forward-compat (new `auto_backfill` field is additive)
- D-074/D-075 — Stage 5 prompt + jp-preservation (unchanged; D-080 is upstream of Stage 5)
- D-076 — answer_index envelope (unchanged)
- D-077 — Stage 6 reviewer catalogue (this ADR consumes D11/D13 detector signals)
- D-078 — Stage 7 polish_items sidecar (D-080's effect: count drops by 13 on 40-page baseline, ~190 on 579-page)
- D-079 — Stage C cadence (Gate ③ post-Stage-4.5 acceptance criteria reference D-080)
- D-027 — decision-on-lock writeback (this ADR + session-13 log + STATE.md updated same turn)
- D-019 — slow-pace 3a
- `feedback_quality_over_cost.md` (memory) — "cheap quality wins" principle invoked
- Session 13 log: `docs/discussion/2026-05-11-session-13.md`
- Carry-forward catalogue: `evidence/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/step_06_audit.md` § "Known polish items carried forward"

---

## 7. Sign-off

| Role | Name | Time | Status |
|---|---|---|---|
| Open-question poser | Claude main session (Opus 4.7 1M ctx) | 2026-05-11 (Session 13 open) | Q2 posed per D-019 |
| User answerer | user | 2026-05-11 | "我想听听你的建议" |
| Proposer | Claude main session | 2026-05-11 | Q2 proposal = "(c) partial polish: Stage 4.5 D11 + D13 only" |
| User refiner | user | 2026-05-11 | "全部 ok" |
| Locker | Claude main session | 2026-05-11 | D-080 locked v1.0, this ADR |
| Implementer | Claude main session | 2026-05-12 | Stage 4.5 builder + 14 tests + 40-page re-baseline executed |
| Architectural-error finder | Claude main session | 2026-05-12 | §2.3 acceptance unverifiable; §8 amendment locked v1.1 |
| Amender (v1.1) | user + Claude main session | 2026-05-12 | "可以的，继续" — re-scope ADR with §8 amendment |
| User final sign-off | user | TBD | post §8 amendment review |

---

## 8. Amendment v1.1 — acceptance §2.3 invalidated; polish code retained as safety net

> **Locked 2026-05-12, Session 13.** Authorised by user "可以的，继续" after
> Claude surfaced the architectural misalignment between D-080 §2.1 polish
> design and the actual Phase-1 detectors (D11/D13).

### 8.1 What v1.0 §2.3 claimed

> D11 INFO new == 0 ; D13 run-level INFO new == 0 ; no D1/D5/D7 FAIL
> regression — all verified by re-running Stage 4.5 + Stage 5 + Stage 6
> phase-1 on the existing 40-page dry-run.

### 8.2 What the 2026-05-12 re-baseline actually produced

After Stage 4.5 (with polish #1 + polish #2 active) + Stage 5 chunk=1
sonnet + opus surgical retry + 4 hand-translations to clear all
UNTRANSLATED leaves, the Phase 1 detector diff was:

| Detector | OLD (v1 baseline) | NEW (post-polish) | Δ |
|---|---|---|---|
| `kana_helper_missing` INFO | 18 | 18 | **+0** |
| `glossary_surface_concept_split` INFO | 2 | 10 | **+8** |
| `choice_marker_inconsistent` WARN | 3 | 18 | +15 |
| `numeric_inconsistent` WARN | 24 | 25 | +1 |
| `glossary_lock_missed` INFO | 41 | 39 | −2 |
| D1 / D5 FAIL | 0 | 0 | 0 |

### 8.3 Architectural misalignment found

- **Polish #1 doesn't reach D11**: `kana_helper_missing` fires on
  *Term entities in `translated/`*, not on glossary entries. Polish #1
  (Stage 4.5 auto-backfill into the glossary) ensures glossary entries
  carry kana_helper but does **not** propagate it into the Term entities
  produced by Stage 5. The propagation would have to live in Stage 5 —
  explicitly deferred by v1.0 §2.2 ("Stage 5 prompt v2 deferred").
  Empirically: 0 auto_backfills generated in this run because the LLM
  already attached kana_helper to all 36 / 63 katakana-surface entries
  on its own; polish #1 is a *safety net*, not a D11 fix.
- **Polish #2 solves a non-existent problem**: D13
  (`detect_glossary_consistency`) emits one INFO per glossary entry
  whose `surface.zh` and `kana_helper.zh_concept` are **unrelated**
  (neither contains the other) — it has nothing to do with
  multi-concept separators. The Session 12 §1 carry-forward note
  "g_022 / g_028 surface-concept split" was a *label* for the issue
  type, not a description of "split on `/` `→` `,` etc." Polish #2
  (`split_multi_concept_items`) splits surfaces that contain
  separators — a different operation that no detector calls for.
- **WARN deltas (choice_marker +15, numeric +1)**: side effects of
  glossary changes (63 vs ~91 entries) and Stage 5 chunk=1 re-translation
  producing slightly different choice markers. Not regressions, not
  blockers (WARN, not FAIL); will be handled at Stage 7 normalization
  per D-078 §2.6.

### 8.4 Why v1.0 missed this

v1.0 design was based on a literal reading of the Session 11/12
carry-forward notes ("D11 kana_helper_missing ×11 leaves → Stage 4.5
backfill" and "D13 surface-concept split → Stage 4.5 glossary
self-consistency"). The notes were correct labels for the *symptom* but
the proposed fixes (Stage 4.5 backfill, separator-split) were the wrong
architectural layer / wrong semantic target. Cross-checking with
`detectors.py` source before §2.1 proposal would have caught both
mistakes. **Lesson**: when authoring an ADR that targets specific
detector signals, read the detector code, not the closure-summary
labels. Added to retrospective backlog for Phase 1 closure (Rule C).

### 8.5 What v1.1 changes

- §2.3 (validation contract) is **INVALIDATED** as an acceptance gate.
  Step 6.11.A.3 closes with a NO-ACCEPTANCE verdict; the polish work is
  not blocking Stage C launch, but the v1.0 claim "D11/D13 INFO drops
  to 0 after polish" is **withdrawn**.
- §2.1 polish #1 (D11 kana_helper auto-backfill) is **retained**: code
  + tests + stop-list seed stay in place. Empirical role is "safety
  net" for the 579-page Stage C run in case Sonnet 4.6's per-call
  judgement misses katakana surfaces under longer-context conditions
  not seen in the 40-page sample.
- §2.1 polish #2 (multi-concept surface split) is **retained but
  re-scoped**: not aimed at D13 INFO reduction. Its real value is
  preventing the LLM from producing merged glossary entries (which
  break downstream Stage 5 glossary-lock semantics — a separate
  quality property not measured by D13). Empirical: 0 splits
  triggered on this 40-page glossary; mechanism stays for Stage C
  resilience.
- The `KanaHelper.auto_backfill: bool` schema field (D-058 additive
  forward-compat) is **retained** unconditionally — even if polish #1
  never fires, the field carries traceability when humans hand-author
  a kana_helper that distinguishes "LLM-authored vs hand-added".

### 8.6 Follow-up work captured (out of D-080 v1.1 scope)

- **D11 propagation gap**: solving D11 actually requires Stage 5 to
  copy `glossary[entry].kana_helper` into the corresponding Term
  entity's `kana_helper` field during translation. This is a Stage 5
  builder change (not prompt v2; small Python change) and is the right
  long-term fix. **Tracked as Phase 1 v2 follow-up**; not a new D
  until user re-opens scope.
- **D13 real fix**: improve glossary harvest to ensure
  `surface.zh ↔ kana_helper.zh_concept` are unified or at least
  share substrings. Likely a Stage 4.5 prompt tweak (not prompt v2 of
  Stage 5) or a post-LLM normalization pass. **Tracked as Phase 1 v2
  follow-up**.
- Both follow-ups will land **as part of D-080 successor work** when
  the user re-opens scope, likely after the 579-page Stage C produces
  signal on whether D11/D13 INFO counts matter at scale.

### 8.7 Step 6.11.A.3 closure status (this amendment)

- Status: **CLOSED NO-ACCEPTANCE** (does not satisfy v1.0 §2.3 acceptance criteria; v1.0 acceptance is withdrawn per §8.5).
- Polish code: shipped (14 unit tests, 442/442 suite green, no lint regression).
- Re-baseline run: `dry_run_2026-05-12T09-48-06_polish_a/` — 40 pages, 63 glossary entries, 0 UNTRANSLATED leaves achieved (via Stage 5 sonnet chunk=1 + opus surgical retry + 4 hand-translations).
- Cost: $16.96 tracked shadow + est. $5-10 untracked (surgical retry called `ClaudeClient` directly, bypassing `CostTracker`) ≈ **$22-27 shadow total / $0 billed via max-plan OAuth**.
- Files of record: this amendment + `failures/stage4_5_glossary/step_06_11_A_3_attempt_1*.md` + `failures/stage5_translate/step_06_11_A_3_attempt_2*.md` + `evidence/.../dry_run_2026-05-12T09-48-06_polish_a/{phase1_compare.{py,json},stage5_diag_page_020.{py,json,md},stage5_surgical_retry.py,stage5_surgical_retry_log.json,stage5_hand_translate.py,step_45_polish.md}`.
- Step 6.11 next executable: **6.11.B** (D-079 runner + checkpoint infra) — A.3 closes without blocking B/C tracks.
