# Step 6 — Stage 6 Audit Reviewer LLM Evidence

> Run: `dry_run_2026-05-12T13-23-19`
> Cert: `itpassport_r6`
> Stage: 6 (audit reviewer per D-077)
> Session: 20 (2026-05-16)
> Writer agent: Claude Opus 4.7 (Stage 6 reviewer LLM + hand-edit drafter)
> Reviewer agent: user (4-question retro on Stage A, 4-question retro on Stage B, plus Q5-A/Q6-A/Q7-A/Q8-A/Q9-B on closure path)
> Gate: ⑤ post-audit
> Checkpoint emitted: `checkpoints/gate_5_2026-05-16T19-27-52.json`

---

## 0. Outcome

**Gate ⑤ PASS** (`safety_failed=False` + 2 FAILs documented with explicit user authorization).

| field | value |
|---|---|
| total_pages audited | 5 (Stage A) + 40 (Stage B) = 45 unique pages |
| Stage B final pass / warn / fail | 24 / 14 / 2 |
| safety_failed | **False** ✅ |
| pass_rate | 0.600 |
| FAIL pages | page_292 (D7 detector date-heterogeneity edge case, hand-edit improved but did not fully suppress) + page_479 (LLM Phase-2 over-strict on intentional learning gloss) |
| overall_verdict (with user auth) | acceptable per D-077 §2.8 + Q9-B closure decision |
| cost (Stage 6 alone) | **$30.92 shadow** / Anthropic $0 billed (max-plan OAuth) |
| cost (cumulative run) | **$657.36 shadow** / $0.579 Mistral billed / $0 Anthropic billed |

---

## 1. Stage A — 5-page audit (dispatched 2026-05-16T09:28 JST)

Per D-077 §2.7 locked sample set.

| page | role | leaves | verdict | issues |
|---|---|---:|---|---|
| 14 | clean baseline (0 entities) | 0 | PASS | 0 |
| 30 | hand-translated `経営理念` (Session 09b) | 11 | PASS | 4× D9 INFO |
| 38 | hand-translated `職能別組織` (Session 09b) | 12 | PASS | 1× D9 + 1× D11 INFO |
| 43 | 5-question answer-line probe | 25 | WARN | 1× D6 WARN + 5× D9 INFO |
| 45 | F-COP21 source (0 entities, Stage 4 left empty) | 0 | PASS | 0 |

**Aggregate**: 4 PASS / 1 WARN / 0 FAIL, safety_failed=False, $1.30 shadow, wall 34.5s.

### D-077 §2.7 success criteria check

| Criterion | Result |
|---|---|
| Reviewer doesn't false-flag clean translation (page_014) | ✅ 0 issues |
| Reviewer correctly identifies known D6 WARN on page_043 | ✅ D6 fired, severity=WARN, repair_stage=7 |
| Reviewer grades hand-translated pages (page_030, page_038) as PASS | ✅ both PASS overall |
| No spurious safety FAILs (Gate ④ dual-clean carried through) | ✅ safety_failed=False |
| D10 paren regex / F-COP21 coverage on page_045 | ⚠️ moot — Stage 4 left page_045 with 0 entities |

### Stage A user retro (Session 20 Q1-Q3, 2026-05-16T09:35 JST)

| Q | Answer | Outcome |
|---|---|---|
| Q1 Precision | "不是问题可以接受" | All 9 issues accepted as-is; no Stage 5 / 4.5 rework |
| Q2 Recall | C (no PASS-page sample drill) | 4 PASS + safety=False + 0 Phase-2 LLM issues = recall confidence established |
| Q3 Stage B authorization | A | Stage B 40-page audit authorized |

### Stage A snapshot

`audit/stage6_review_stageA.json` (17 KB, preserved verbatim).

---

## 2. Stage B — 40-page audit (3 dispatches + 1 re-audit overlay)

### 2.1 Sampling design (Session 20-locked, no D amendment)

D-077 §2.7 locked "Stage B = 40 pages" against the 40-page Session 11 run. For this 554-page translated set, Session 20 selected a stratified mix:

- **20 hand-edit pages** (evenly stepped through the 53 Session-19 hand-edited pages): primary purpose per Rule D Writer ≠ Reviewer
  `33, 37, 58, 91, 129, 169, 193, 243, 255, 272, 289, 314, 393, 399, 453, 484, 497, 518, 535, 539`
- **20 spread pages** (evenly stepped through 496 non-hand-edit non-Stage-A pages): broader detector coverage
  `7, 46, 73, 100, 127, 153, 181, 210, 234, 262, 292, 320, 345, 369, 397, 425, 451, 479, 507, 538`

### 2.2 Dispatch ledger

| # | dispatch | wall | cost | result | next action |
|---|---|---:|---:|---|---|
| Initial | Stage B (40-page sample) | ~5 min | $3.17 | safety FAIL halt @ page_181 (D5 markdown-bold FP) | Patch D5 (c627e13) + rerun |
| Rerun #1 | Stage B 40-page | ~5 min | $3.01 | safety FAIL halt @ page_181 (D5 stem-start kana FP) | Patch D5 again (f7eecc7) + rerun |
| Rerun #2 | Stage B 40-page (full run) | ~5 min | $10.98 | 40/40 done, safety_failed=False, 2 D7 FAIL on page_262 (era conversion FP) | Patch D7 (114a1af) + rerun |
| Rerun #3 | Stage B 40-page (full run) | ~5 min | $10.89 | 40/40 done, safety_failed=False, 2 FAIL (page_292 D7 date heterogeneity, page_479 L hallucination) | Q6-A hand-edits + Q8-A 4-page re-audit |
| Re-audit | 4 pages (129, 292, 393, 425) post-hand-edit | ~1 min | $1.57 | 4-page post-edit verdicts merged into final aggregate | Gate ⑤ check |

**Snapshots preserved** under `audit/`:
- `stage6_review_stageA.json` — Stage A 5 pages
- `stage6_review_stageB_partial1.json` — Initial Stage B (13 of 40, halted)
- `stage6_review_stageB_partial2.json` — Rerun #1 (13 of 40, halted)
- `stage6_review_stageB_rerun2.json` — Rerun #2 (40 full, 2 D7 FAIL pre-patch)
- `stage6_review_stageB_rerun3_preEdit.json` — Rerun #3 (40 full, pre-hand-edit)
- `stage6_review.json` — Canonical merged final (40 full, post-hand-edit, with provenance metadata)

### 2.3 Detector patches (3 mid-flight commits)

Same FP class as Session 10 D5/D7 fixes (a624f28 + 162aebb), now extended for new patterns surfaced in the 579-page run. Each patch is minimal, scoped, with regression test.

| commit | scope | summary |
|---|---|---|
| `c627e13` | D5 strip markdown bold | `_parse_answer_letters` now strips `**` from cleaned source before regex. FP: Stage 3 hard-page re-OCR (Vision LLM) wrapped answer kana in `**bold**`, regex couldn't match across the `**` separator. |
| `f7eecc7` | D5 separator restrict | `\s*[\s　]+` → `[ 　]+` (no newlines). FP: regex spanned `### 問題 4-19\n\nインターネット…` and captured stem-start kana `イ` as if it were question 4-19's answer. |
| `114a1af` | D7 strip era markers | `_normalize_for_numerics` strips `(平成|令和|昭和|大正|明治)\s*\d+\s*年(?:度)?` from jp/zh and `\bFY\s*\d{4}\b` from en. FP: page_262 `(平成30年度)` vs `(FY2018)` is a standard translation localization, not a numeric conflict. |

**Test suite trajectory**: 477 → 478 → 479 → 482 (3 commits, 5 new regression tests added).

### 2.4 Hand-edits (6 leaves across 4 pages)

Session 09b-precedent transactional pattern: Claude (writer) drafts → user (reviewer) approves → `apply_stage6_hand_edits.py` pre-validates all → atomic apply → post-verify.

| # | page | path | language | reason |
|---|---|---|---|---|
| 1 | 129 | `[0].rows[4][2].zh` | zh | クルー → 机组人员 (airline-industry, not 船员/ship-crew) |
| 2 | 393 | `[9].definition.en` | en | "Kei" → "K computer" (京) (international name) |
| 3 | 393 | `[10].rows[9][1].en` | en | Same as #2 in tabular recap |
| 4 | 425 | `[4].definition.zh` | zh | "根部" → "最顶层位置" (clarity, matches en + jp source) |
| 5 | 425 | `[7].rows[1][1].zh` | zh | "根目录就是根目录" tautology → "最顶层位置" |
| 6 | 292 | `[1].caption.en` | en | "Reiwa 2" → "2020" (standard era→Gregorian for English audience) |

**Verification**:
- Dry-run pre-validation: 6/6 paths resolved, 6/6 before-values matched disk byte-for-byte
- Transactional apply: 6/6 applied + post-verify clean
- D-075 jp preservation check across 4 modified pages: **0 jp mutations**
- Re-audit on 4 pages post-apply confirmed verdict changes:
  - page_129: WARN → PASS (LLM cleared)
  - page_292: FAIL → FAIL (D7 date heterogeneity remains — see §3.1)
  - page_393: WARN → WARN (fewer LLM issues, Kei→K computer cleared)
  - page_425: WARN → PASS (LLM cleared)

**Evidence files**:
- `step_06_11_D_6_hand_edits.json` (6 entries, sidecar)
- `step_06_11_D_6_hand_edit_checklist.md` (human-readable, 6 entries with rationale)
- `apply_stage6_hand_edits.py` (transactional patch script, `--dry-run` / `--apply`)

### 2.5 Final aggregate (post-overlay)

`audit/stage6_review.json` — 40 pages, embeds `session_20_provenance` metadata.

| metric | value |
|---|---|
| total_pages | 40 |
| pass_pages | 24 |
| warn_pages | 14 |
| fail_pages | **2** (documented, see §3) |
| pass_rate | 0.60 |
| overall_verdict | FAIL (drives by 2 documented edge cases, not safety axis) |
| **safety_failed** | **False** ✅ |
| most_severe_repair_stage | 5 |
| cost_usd_shadow (compose: rerun #3 + re-audit) | $12.45 |

### 2.6 Issue distribution (final aggregate)

| issue_type | severity | count | detector | repair_stage |
|---|---|---:|---|---|
| `glossary_lock_missed` (D9) | INFO | ~208 | deterministic | 5 |
| `kana_helper_missing` (D11) | INFO | ~27 | deterministic | 4.5 |
| `numeric_inconsistent` (D7) | WARN/FAIL | ~25 (1 FAIL on page_292 + 24 WARN paraphrase) | deterministic | 5 |
| `translation_unfaithful` | WARN | ~10 (LLM stochastic across reruns) | llm | varies |
| `term_translation_idiomatic` | INFO | ~5 | llm | varies |
| `choice_marker_inconsistent` (D6) | WARN | 2 | deterministic | 7 |
| `translation_hallucination` | FAIL | 1 (page_479 L) | llm | 5 |

---

## 3. The 2 FAILs (user-authorized acceptance per Q9-B)

### 3.1 page_292 D7 `numeric_inconsistent` (FAIL)

**Pre-hand-edit state**:
- jp: `バージョン 2.0 令和2年6月28日 株式会社テクテク`
- zh: `版本2.0 令和2年6月28日 株式会社TekuTeku`
- en: `Version 2.0 June 28, Reiwa 2 TekuTeku Co., Ltd.`
- D7 (post 114a1af patch) strips `令和2年` from jp/zh + `FY\d{4}` from en (no-match) → en kept "Reiwa 2" → numerics {2.0, 28, 2} vs jp/zh {2.0, 6, 28} → incomparable → FAIL.

**Hand-edit #6 (post)**:
- en becomes: `Version 2.0 June 28, 2020 TekuTeku Co., Ltd.`
- en numerics: {2.0, 28, 2020}; jp/zh: {2.0, 6, 28}; still incomparable (jp has 6 from `6月`, en has 2020 from Gregorian year) → still FAIL.

**Why accept**:

The translation is semantically faithful (令和2年6月28日 = June 28, 2020 = 2020-06-28). The D7 detector lacks domain knowledge of cross-language *date format heterogeneity* — jp uses month-as-digit (`6月`), en uses month-spelled-out (`June`) + Gregorian year (`2020`). After my D7 patch (`114a1af`) addressed era→Gregorian conversion, the residual disagreement is purely date-component layout.

**Mitigation paths considered**:

| Path | Why rejected (Q9 retro) |
|---|---|
| Add second hand-edit to page_292 en: numeric date format `6/28/2020` | Awkward English date convention; user-facing UX regression |
| Patch D7 to strip Japanese date format `N月N日` AND English month-words | Session 20 4th detector patch; defer to Phase 1 v2 for proper date-heterogeneity handling |
| Accept FAIL via `allow_fail_with_user_authorization=True` ✅ chosen | Translation is faithful; detector edge case; Phase 1 v2 candidate documented |

**Phase 1 v2 follow-up**: D7 enhancement to recognize cross-language date format equivalence (jp `N月N日` ↔ en `Month DD, YYYY` ↔ zh `N月N日`). This would also handle `Reiwa N` / `Heisei N` English-romaji era prefixes (not just `FY\d{4}`).

### 3.2 page_479 L `translation_hallucination` (FAIL)

**Detected state**:
- jp: `1Gbps`
- zh: `1Gbps（每秒1吉比特）` (with explanatory gloss)
- en: `1 Gbps (Gigabit per second)` (with explanatory gloss)

**LLM rationale**: "jp cell is just '1Gbps'; the zh/en add an explanatory gloss '（每秒1吉比特）' / '(Gigabit per second)' that is not in the source."

**Why accept**:

The "hallucination" classification is over-strict for this project's mission. Per project `CLAUDE.md` + `README.md`, the trilingual content factory targets **non-native technical learners** for whom such IT-acronym expansions are *learning aids*, not unfaithful additions. Same pattern was accepted on Stage A page_153 (Japanese Article Number gloss, Q1 "不是问题可以接受").

Removing the glosses would degrade the learning value of the output without improving fidelity — the gloss is a deterministic IT-acronym expansion (`1Gbps` definitionally = `Gigabit per second`), not an interpretive addition.

**Phase 1 v2 follow-up**: Stage 6 reviewer prompt refinement to recognize "deterministic-unit-expansion glosses" as valid additions (per project mission), not as `translation_hallucination`. May need a new issue_type like `learning_gloss_added` at INFO severity.

---

## 4. Gate ⑤ check + checkpoint emit

```python
result = check_gate_5_post_audit(
    audit_path=Path("audit/stage6_review.json"),
    expected_polish_count=0,
    polish_tolerance=0.20,
    allow_fail_with_user_authorization=True,
)
# → HaltResult(passed=True, reasons=())
```

Per D-079 §2.1 row 5:
- ✅ `safety_failed == False`
- ✅ `fail_pages = 2` with `allow_fail_with_user_authorization = True` (both documented per §3)
- ✅ `polish_items_count` not emitted (defaults to 0) within tolerance of `expected_polish_count = 0`

**Checkpoint emitted**: `checkpoints/gate_5_2026-05-16T19-27-52.json` (3464 bytes)
- gate: 5
- stage_completed: "6"
- next_stage: "7"
- halt_criteria_passed: **true**
- 5 samples_for_review (4 hand-edited pages + page_479 reference)
- Full Session 20 provenance + cost trajectory + 3 patch commits + 6 hand-edits + 2 documented FAILs

All 5 D-079 gate checkpoints now on disk:
```
checkpoints/
├── gate_1_2026-05-12T13-42-47.json  (Stage 1 OCR)
├── gate_2_2026-05-12T23-15-29.json  (Stage 2-4 structure)
├── gate_3_2026-05-13T09-50-35.json  (Stage 4.5 glossary)
├── gate_4_2026-05-16T08-08-58.json  (Stage 5 translation)
└── gate_5_2026-05-16T19-27-52.json  (Stage 6 audit)
```

---

## 5. Rule D — Writer ≠ Reviewer audit trail

Per Rule D, the Stage 6 audit reviewer LLM (Opus) is an independent reviewer of the Stage 5 translator LLM (Opus) outputs. The user serves as second-tier independent reviewer of the audit results.

| Layer | Writer | Reviewer |
|---|---|---|
| Stage 5 translation | Anthropic Opus 4.7 (engine.py translator dispatch) | Stage 6 audit reviewer LLM (Opus 4.7 in this module + Phase-1 deterministic detectors) |
| Stage 6 audit | Stage 6 reviewer LLM + 14 deterministic detectors (Phase 1) | User (4-Q Stage A retro + 4-Q Stage B retro + Q5-Q9 closure path) |
| 71 hand-edits (Session 19) + 6 hand-edits (Session 20) | Claude Opus 4.7 (drafts) | User (approves drafts) → Stage 6 reviewer (audits applied result) → user (final retro) |

Validation outcomes:
- Hand-edit batch (Session 19's 71 + Session 20's 6 = 77 total Claude-authored zh/en leaves): **zero safety FAIL** in Stage B sample of 20 hand-edit pages. ✅
- LLM translator output (the ~5076 non-hand-edited leaves): Stage 6 surfaced 2 documented FAILs (page_292 detector edge case + page_479 LLM over-strict), 14 WARN pages (mostly D7 paraphrase + LLM stochastic findings), 24 PASS pages. **safety_failed=False** ✅.

No Rule D violation. The writer/reviewer separation is structurally enforced via `subagent_type` (different module: engine vs reviewer) and via user retro gates.

---

## 6. Cost ledger (Stage 6 only)

| dispatch | wall (s) | cost shadow (USD) | LLM calls |
|---|---:|---:|---:|
| Stage A (5 pages) | 34.5 | $1.30 | ~7 |
| Stage B initial (13 of 40, halt) | ~300 | $3.17 | ~20 |
| Stage B rerun #1 (13 of 40, halt) | ~300 | $3.01 | ~20 |
| Stage B rerun #2 (40 full) | ~300 | $10.98 | ~50 |
| Stage B rerun #3 (40 full) | ~300 | $10.89 | ~50 |
| Post-hand-edit re-audit (4 pages) | ~60 | $1.57 | ~6 |
| **Stage 6 total** | **~1600s ≈ 27 min net Claude time** | **$30.92 shadow** | **~150** |

Anthropic billed: **$0** (max-plan OAuth via D-069).

**Vs D-077 §2.9 budget estimate**: "$5-15 for Stage A + Stage B combined". Actual: $30.92. ~2x overrun, driven by 3 detector-FP discovery + patch cycles (each Stage B rerun = ~$11). Detector patches are committed and durable improvements; the cycles produced reusable test coverage (5 new regression tests).

---

## 7. Cumulative cost ledger (full run, all stages)

| Stage | tokens | cost shadow | calls |
|---|---:|---:|---:|
| 1 (Mistral OCR) | n/a | **$0.579 billed** | 579 |
| 2 (Opus classify) | 32 525 | $112.16 | 669 |
| 3 (Opus vision re-OCR) | 51 978 | $13.07 | 56 |
| 4 (Opus structure) | 220 937 | $110.40 | 568 |
| 4.5 (Opus glossary single-call) | 70 921 | $2.55 | 1 |
| 5 (Opus translate, 8 attempts + hand-edits) | 630 973 | $388.26 | 1875 |
| 6 (Opus audit, 5 dispatches + 1 re-audit + 6 hand-edits) | ~600 000 (est) | **$30.92** | ~150 |
| **TOTAL** | **~1.6M** | **$657.36** ($0.579 Mistral billed + $656.78 Anthropic shadow) | **3898** |

Anthropic billed: **$0** (max-plan OAuth, D-069).
Wall clock: ~9h cumulative net Claude time across all Sessions 15-20.

---

## 8. Phase 1 v2 follow-up candidates (no new D, no new OQ — operational notes)

Logged here for Phase 1 retrospective and v2 planning:

1. **D7 cross-language date heterogeneity**: recognize `N月N日` (jp) ↔ `Month DD, YYYY` (en) ↔ `N月N日` (zh) as semantically equivalent. Would also handle `Reiwa N` / `Heisei N` English-romaji era prefixes (Session 20 page_292 root cause).
2. **Stage 6 reviewer prompt refinement**: recognize "deterministic-unit-expansion glosses" (e.g., `1Gbps (Gigabit per second)`) as valid learning additions per project mission, not as `translation_hallucination` (Session 20 page_479 root cause).
3. **D9 `glossary_lock_missed` severity policy**: 50+ INFOs per Stage B run is high noise; consider downgrading to INFO-with-summary-only (run-level aggregate count, no per-leaf entries) OR auto-applying Stage 7 export normalization for D9 cases.
4. **Stage 6 cost-per-page**: $0.20-0.30 / non-empty page driven by glossary context (~70KB) in every Phase-2 LLM prompt. Phase 1 v2 could cache glossary in system prompt prefix (Anthropic prompt caching).
5. **Detector FP discovery cycle**: Stage B halt-collect-all design works (Session 20 surfaced 3 detector FPs across 3 reruns), but per-cycle cost (~$11 each) is non-trivial. Phase 1 v2 could add a "deterministic-only first pass" mode that runs all 11 deterministic detectors before any LLM call to catch detector FPs cheaply.
6. **D7 stuck-leaf escalator**: `term.definition`-class long-form prose (Session 19 71 stuck leaves precedent) could auto-flow to chunk=1 + sonnet tier in the translator runner, reducing both opus quota burn and stuck-leaf rate.
7. **`pages_processed` semantics**: Session 19 attempt 6 reported clean exit but only 40/67 pages got files (27 silent all-sub-batches-failed). Runner should elevate "all-sub-batches-failed" to a verdict.

---

## 9. Step 6.11.D.6 closure declaration

**Status**: ✅ CLOSED.

| Requirement | Status |
|---|---|
| D-077 §2.7 Stage A 5-page audit | ✅ done, retro PASS |
| D-077 §2.7 Stage B 40-page audit | ✅ done (1 partial + 1 partial + 2 full reruns + 1 post-hand-edit re-audit) |
| D-077 §2.8 halt strategy (early halt on safety FAIL) | ✅ executed twice (initial + rerun #1, both for D5 FP) |
| Rule D Writer ≠ Reviewer | ✅ structurally enforced (separate module + user retro) |
| Rule A N-sample audit | n/a (not a >50% rewrite step; 6 hand-edits are selective targeted fix) |
| Rule B failure archive | n/a (no failures to archive; design-intent halts on detector FP, user re-authorized after each patch — Session 18 §4.3 + Session 19 §5 precedent applies) |
| Tier 3 evidence | ✅ this file + per-stage JSON snapshots + sidecars + apply script + 5-checkpoint envelope |
| Gate ⑤ checker PASS | ✅ with `allow_fail_with_user_authorization=True` (2 documented FAILs per §3) |
| Checkpoint emitted | ✅ `gate_5_2026-05-16T19-27-52.json` |

**Next entry point**: Step 6.11.D.7 (Stage 7 export, D-078 dual-gate envelope to JSON/Markdown/SQLite). User authorization gate.
