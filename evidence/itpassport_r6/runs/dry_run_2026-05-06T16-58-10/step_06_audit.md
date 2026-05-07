# Stage 6 Audit — Trilingual Reviewer (itpassport_r6 / dry_run_2026-05-06T16-58-10)

> **STATUS = PRE-RUN SCAFFOLD** — Stage A (5 pages) and Stage B (40 pages)
> dispatch are user-gated. Detector + reviewer code + 103 unit tests pass.
> No LLM call has fired yet for Stage 6.
>
> Per D-077 (Stage 6 audit reviewer LLM design — two-pass deterministic + opus
> LLM, two-tier verdict, repair_stage tagging) + D-019 slow-pace + 规则 A
> (Stage 6 audits 100% of pages = full coverage, sample = N).

---

## D-062 fields

| # | Field | Value (pre-run scaffold) | Value (post-run) |
|---|---|---|---|
| 1 | `stage` | 6 (audit reviewer) | _post-run_ |
| 2 | `cert_id` | `itpassport_r6` | _post-run_ |
| 3 | `run_id` | `dry_run_2026-05-06T16-58-10` | _post-run_ |
| 4 | `total` | 40 pages × 382 trilingual leaves (post Plan-B) | _post-run_ |
| 5 | `N` | Stage A = 5 pages (014/030/038/043/045) → 100% leaf coverage on those pages. Stage B = 40 pages → 100% leaf coverage. | _post-run_ |
| 6 | `sample_ids` | Stage A: page_014 (clean control) + page_043 (5 questions / answer-line ground truth) + page_045 (term-heavy + F-COP21) + page_030 (hand-translation) + page_038 (hand-translation). Stage B: all 40 pages. | _post-run_ |
| 7 | `writer_agent` | n/a — Phase 1 detectors are deterministic Python; Phase 2 reviewer is opus LLM (the "writer" was Stage 5 = opus + D-074 prompt). | _post-run_ |
| 8 | `writer_prompt_version` | n/a (Stage 6 reviews Stage 5 output). | _post-run_ |
| 9 | `reviewer_agent` | Phase 1 = deterministic D1-D13 detectors (`pipeline/stage6_audit/detectors.py`). Phase 2 = `claude-opus-4-7` via `ReviewerEngine` + `REVIEWER_SYSTEM_PROMPT_V1`. Plus user retro per 规则 D. | _post-run_ |
| 10 | `reviewer_prompt_version` | `v1.0` (`pipeline/stage6_audit/prompts.py::REVIEWER_PROMPT_VERSION`). | _post-run_ |
| 11 | `pass_count` | TBD | _post-run_ |
| 12 | `fail_count` | TBD | _post-run_ |
| 13 | `pass_rate` | TBD (page-level; D-063 thresholds 0.90 / 0.80). | _post-run_ |
| 14 | `verdict` | TBD — two-tier (`translation_fidelity_verdict` + `learner_data_verdict`) + `overall_verdict`; safety-field FAIL forces FAIL. | _post-run_ |
| 15 | `failures` | TBD; archived to `failures/stage6_audit_review/` (per D-032 + 规则 B) for any LLM JSON-parse / sub-batch errors. | _post-run_ |
| 16 | `started_at` / `finished_at` | TBD | _post-run_ |
| 17 | `cost_estimate` | Stage A pre-run estimate: ~12 LLM calls × ~$0.05/call shadow = **~$0.60 shadow** + Stage B ~80 calls × ~$0.05 = **~$4.00 shadow**. Real billed = $0 (max-plan OAuth per D-069 + `feedback_quality_over_cost.md`). | _post-run actual_ |
| 18 | `git_sha` | Pre-run = HEAD `1ed07a6` (Session 09b close) + Session 10 commits 6.9.1-6.9.5 (this scaffold). | _post-run_ |

---

## Pre-run input snapshot

Computed from `data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/`:

```
translated/  : 40 pages × Trilingual leaves
structured/  : 40 pages (jp ground truth for D1 jp_mutation)
cleaned/     :  4 pages (page_002, page_016, page_043, page_047 — Stage 3 promoted)
ocr/         : 50 pages (Mistral OCR; D5 reads this when cleaned/ has no page entry)
glossary.json: 55 entries, 18 with kana_helper, 13 patches applied (Plan-B)
```

Stage A page-level breakdown:

| Page | Entities | Leaves | Source for D5 | Sub-batches @ chunk=4 |
|---|---|---|---|---|
| 014 | 2 | 14 | `ocr/page_014.md` | 1 |
| 030 | 6 | 11 | `ocr/page_030.md` | 2 |
| 038 | 7 | 12 | `ocr/page_038.md` | 2 |
| 043 | 5 | 25 | `cleaned/page_043.md` ✓ (post Plan-B promote; answer-line preserved) | 2 |
| 045 | 19 | 38 | `ocr/page_045.md` | 5 |
| **A total** | **39** | **100** | — | **12 LLM calls** |

Stage B = 40 pages, 161 entities, 382 leaves total (per Plan-B post-fix). Estimated LLM calls @ chunk=4: ≤ 80.

---

## Engine configuration (pre-run lock per D-077 §2.2)

| Knob | Value | Why |
|---|---|---|
| Phase 1 detectors | D1-D13 (deterministic) | Plan-B established that invariants must be checked deterministically (D-075 jp-mutation, D-076 answer_index). Phase 1 runs unconditionally per page. |
| Phase 2 reviewer model | `opus` (`claude-opus-4-7`) | User worksheet §D.3 explicit choice + Plan-B Stage 5 attempts proved opus is the only tier that holds on long-context exam content. |
| `chunk_size` | `4` entities/call | D-077 §2.2 lock. Smaller than Stage 5's 8 because Phase 2 prompt + per-entity context (cleaned/ slice + glossary slice) is heavier. |
| `tool_choice` mechanism | n/a — codebase pattern is system-prompt-driven JSON parsing (matches Stage 4/5). | Deviation from D-077 §2.2 wording — claude_agent_sdk path is agentic, not raw Messages API; prompt-driven JSON is the canonical project shape and avoids ToolUseBlock plumbing. Documented in session-10 §2 minor decisions. |
| Soft cap `anthropic_usd` | $999 (effectively disabled) | Per `feedback_quality_over_cost.md` + D-077 §2.9 dry-run override. Real billing = $0 max-plan OAuth. |
| Hard cap `anthropic_usd` | $999 | Same. |
| `max_retries` | 3 (transient JSON / API only; per D-063) | Content-level FAIL never auto-retries — that's user-retro territory. |
| Halt on safety FAIL | yes — completes current page, then halts run | D-077 §2.8. |

### Module layout (pre-run scaffold complete)

```
packages/extractor/src/cert_extractor/pipeline/stage6_audit/
  __init__.py            (exports public schema + tables)
  schema.py              (Stage6Issue / Stage6PageReview / Stage6RunSummary
                          + REPAIR_STAGE_BY_ISSUE_TYPE table; 29 unit tests)
  detectors.py           (D1-D13 + run_phase1 coordinator;
                          41 unit tests covering positive + negative paths)
  prompts.py             (REVIEWER_SYSTEM_PROMPT_V1 + USER_PROMPT_TEMPLATE
                          + REVIEWER_PROMPT_VERSION = "v1.0")
  reviewer.py            (ReviewerEngine + filter_glossary_slice
                          + parse_review_response; 22 unit tests with mocked
                          ClaudeClient)
  runner.py              (Stage6Audit orchestrator + Stage6Result;
                          11 unit tests with temp run dirs + mocked LLM)

packages/extractor/src/cert_extractor/cli.py
  + audit-trilingual subcommand (mirrors translate-entities shape;
                                 --pages / --chunk-size / --tier / --confirm)
```

Suite-wide test count post-scaffold: **315 / 315 pass** (212 base + 103 Stage 6).

---

## Stage A dispatch plan (user-gated)

Command (DO NOT execute without user `--confirm`):

```
uv run --project packages/extractor python -m cert_extractor.cli audit-trilingual \
    --translated-dir data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/translated \
    --structured-dir data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/structured \
    --cleaned-dir   data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/cleaned \
    --ocr-dir       data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/ocr \
    --glossary-path data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/glossary/glossary.json \
    --pages 14,30,38,43,45 \
    --tier opus \
    --chunk-size 4 \
    --anthropic-soft-usd 999 \
    --anthropic-hard-usd 999 \
    --confirm
```

Expected outputs:

- `data/.../audit/stage6_review.json` — `Stage6RunSummary` (Stage A subset).
- `data/.../cost.json` — appended with `by_stage[6]` entries.
- Console summary: per-page verdict + `most_severe_repair_stage` + `safety_failed`.

Halt conditions per D-077 §2.8:

- Phase 1 D2/D3 FAIL on a page → Phase 2 skipped for that page; run continues.
- Any safety-field FAIL → run halts after current page.
- LLM JSON parse error → archived to `failures/stage6_audit_review/` (file path TBD); run continues.

---

## Stage A user retro check-list (post-run)

| # | Check | Result |
|---|---|---|
| 1 | page_014 (clean control) → overall_verdict = PASS | TBD |
| 2 | page_043 → D5 detects 0/5 answer_index mismatches (post Plan-B fix; cleaned/ has correct answer line) | TBD |
| 3 | page_043 → D6 raises WARN for choice_marker_inconsistent (Q2, Q4, Q5 mixed markers per worksheet) | TBD |
| 4 | page_045 → D10 raises WARN for redundant_nested_parens (F-COP21 ent[16] en) — mitigation expected after glossary patch | TBD |
| 5 | page_045 → D9 (glossary_lock_missed) does NOT spuriously over-fire on 19 terms | TBD |
| 6 | page_030, page_038 (hand-translations) → Phase 2 LLM does NOT false-flag faithful zh/en | TBD |
| 7 | Cost: Stage A shadow ≤ $1 (estimate ~$0.60); real billed = $0 | TBD |
| 8 | LLM parse failures: 0 archived to `failures/stage6_audit_review/` | TBD |
| 9 | Recall: at least 1 issue raised on a page known to need work (e.g. page_045 F-COP21) | TBD |
| 10 | Precision: 0 issues on the clean baseline page_014 | TBD |

### Findings (Stage A) — post-run 2026-05-07T20:55+09:00

**Run summary**:

| Field | Value |
|---|---|
| pages_processed | 5 (014, 030, 038, 043, 045) |
| overall_verdict | **FAIL** |
| pass / warn / fail pages | **0 / 2 / 3** |
| pass_rate | 0.000 |
| safety_failed | True (page_045 → `Question.answer_index`) |
| most_severe_repair_stage | "4" |
| run_level_issues | 2 (D13 glossary surface_concept_split — INFO) |
| LLM calls | 12 |
| cost_shadow | $2.8734 (~$0.24/call — opus heavier than $0.05 pre-run estimate) |
| cumulative dry-run shadow | $50.32 |
| real billed | $0.05 Mistral / $0 Anthropic (max-plan OAuth) |
| halt_reason | page_045 safety FAIL — halted per D-077 §2.8 |

**Per-page result**:

| Page | Verdict | Fid | LD | Issues | Notable |
|---|---|---|---|---|---|
| 014 | FAIL | FAIL | PASS | 5 | **D7 false positive ×4** (circled numerals `①-⑥` not in regex); 1 INFO LLM (ITパスポート→护照) |
| 030 | WARN | PASS | WARN | 1 | D9 glossary_lock_missed (経営者→en) |
| 038 | FAIL | FAIL | WARN | 5 | 1 D7 numeric (need verify); 1 D9; 1 D11 INFO (kana_helper); **2 LLM unfaithful** (alternate-name + 手作業 idiom) |
| 043 | WARN | WARN | WARN | 7 | **D6 F-CHOICE-MARKER hit** ✓ on Q2 (`[A,A,ウ,ウ]`); 5× D9; 1 LLM unfaithful (CEO/CFO/CIO inconsistent style) |
| 045 | FAIL | PASS | FAIL | 7 | **D5 false positive safety FAIL** (0 questions on page; OCR has answer-explanation prose); 3× D9; 3× D11 INFO (kana_helper) |

#### True positives (real audit value)

- ✅ **F-CHOICE-MARKER caught**: page_043 entity[1] (Q2) zh choices use mixed `[uppercase, uppercase, katakana, katakana]` — exactly the worksheet §B.4.3 pattern.
- ✅ **LLM Phase 2 high-quality catches** (3 issues, all reasonable):
  - page_014 entity[1].rows[2][1].zh: zh "IT 护照" — Chinese-speaking IT learners typically retain "ITパスポート"/"IT Passport"; literal `护照` is awkward.
  - page_038 entity[2].definition.en: jp notes the alternate Japanese name `機能別組織`; en renders the alternate name as the same English term — alternate-Japanese-name fidelity issue.
  - page_038 entity[5].definition.zh: `手作業 → 人工作业` is technically correct but `手工操作` is more idiomatic for Chinese-speaking IT learners.
  - page_043 entity[4].choices[3].en: bare CEO/CFO/CIO style for choices A/B/C but choice D expanded → style inconsistency with the others.

#### False positives (detector bugs surfaced by real data)

| # | Detector | Symptom | Root cause | Fix |
|---|---|---|---|---|
| FP1 | **D7 numeric_inconsistent** | page_014 raises 4× FAIL on table rows 0-2 | Table jp uses Unicode circled numerals `①②③④⑤⑥` (U+2460-U+2465); D7 regex `\d+` doesn't match them; en uses `(1)(2)..`; jp_n={} vs en_n={"1",..} → FAIL | Extend `_FULLWIDTH_DIGIT_TRANS` (or equivalent normalization) to include circled `①-⑳ → 1-20`. |
| FP2 | **D5 answer_index_mismatch** | page_045 raises safety FAIL `Question.answer_index` despite page having 0 question entities | OCR text has answer-explanation prose ("解答 1-7\nウ ..." for previous page's questions bleeding into page_045 source); regex matches 6 answer markers; count mismatch fires; tagged as `Question.answer_index` safety field → halts run | Add early return: `if len(questions) == 0: return []`. Pages without question entities aren't D5 territory; an answer line with no questions is a Stage 4 / Stage 3 concern, not Stage 6. |

#### Ambiguous (low-precision but acceptable noise)

- **D9 glossary_lock_missed**: 8 WARN issues across pages 030/038/043/045. Some real (en lacks the locked term verbatim), some are reasonable paraphrases (e.g. en uses `Information` instead of literal `system`). Lower priority — WARN is non-blocking per D-077 §2.5; user retro can dismiss noisy ones. Phase-2 polish, not Stage A blocker.

#### Plan-B mitigation verified

- **F-COP21 NOT caught by D10** — but this is success, not failure. The glossary patch from Session 09b (worksheet C.4.2 (B+C) combined) replaced the locked en `(COP21 (21st Conference of the Parties))` with a non-nested form, so D10's `\([^()]*\([^()]*\)[^()]*\)` regex correctly finds nothing. The page_045 ent[16] inspection in glossary_translation_review_2026-05-07.md confirms the post-Plan-B en is clean.

#### Halt strategy verified

- D-077 §2.8 safety-FAIL fast-halt fired correctly on page_045 (no Stage A pages 014-043 cost was wasted; only page_045 itself completed). After the halt, the run aggregated and emitted Stage6RunSummary with `halt_reason` populated. `most_severe_repair_stage = "4"` correctly points to Stage 4 (where answer_index extraction belongs).

### Decision (Stage A) — 2026-05-07T20:55+09:00

**WARN with required fixes** — Stage A surfaces 2 deterministic-detector
false positives that must be patched before Stage B (would over-fire
across 40 pages otherwise) and confirms 1 LLM-Phase-2 prompt is producing
high-quality catches.

**Required fixes (no LLM cost; deterministic + tests)**:

1. **D7 fix**: extend digit normalization to handle circled numerals
   `①-⑳`. Add regression test: jp `①イメージ図` / zh `①示意图` / en
   `(1) Conceptual Diagram` → no issue.
2. **D5 fix**: short-circuit detector when page has 0 question entities.
   Add regression test: page with 0 questions + cleaned text containing
   answer markers → 0 issues.

**Optional polish (deferrable to Stage B retro)**:

3. **D9 noise reduction**: consider stripping case + leading punctuation
   in substring check; or relax to INFO when the leaf is non-Term prose.
   Current WARN level is acceptable for Stage A, becomes noisy at Stage B
   scale (40 pages × multi-glossary-key-per-leaf could emit 100+ WARNs).

**Re-run plan**: after fixes + new tests pass, re-run Stage A on the same
5 pages. Expected delta:

- page_014: 4 FAIL → expected 0-1 FAIL (only legitimate numeric issues if any).
- page_045: safety FAIL → expected: D5 silent; remaining issues stay (D9 + D11 INFO).
- F-CHOICE-MARKER catch on page_043 stays (D6 unchanged).
- LLM Phase 2 catches stay (Phase 2 unchanged).
- New cost: another ~$2.87 shadow. Total dry-run shadow → ~$53.

---

## Stage B dispatch plan (post Stage A user PASS)

```
uv run --project packages/extractor python -m cert_extractor.cli audit-trilingual \
    --translated-dir data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/translated \
    --structured-dir data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/structured \
    --cleaned-dir   data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/cleaned \
    --ocr-dir       data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/ocr \
    --glossary-path data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/glossary/glossary.json \
    --tier opus \
    --chunk-size 4 \
    --anthropic-soft-usd 999 \
    --anthropic-hard-usd 999 \
    --confirm
```

Expected ≤ 80 LLM calls; ~$4 shadow / $0 billed.

### Stage B reviewer audit plan (per 规则 A — pre-run)

Coverage = 100% (every page reviewed by Phase 1 + Phase 2 LLM + user retro).
Stage 6 is itself the audit lane, so the "audit-of-audit" comes from user
retro on this evidence file (per 规则 D).

For Stage B user retro, sample-check at least:

1. Every page where Phase 1 raised any FAIL — verify the call.
2. Every page where Phase 2 raised any FAIL — verify the call.
3. At least 5 pages with overall_verdict = PASS — verify no missed issues
   (recall check).
4. The full `run_level_issues` list (D13 glossary self-consistency).

---

## Failures (post-run)

(populated as Phase 2 LLM dispatches archive failures per 规则 B)

---

## Decision (post Stage A + Stage B)

(populated post-run; gates Step 6.10 Stage 7 export)

---

## Cross-references

- ADR: `docs/decisions/D-077-stage6-audit-reviewer.md` (this stage's spec; locked Session 10)
- ADR: `docs/decisions/D-061-reviewer-mapping.md` (reviewer agent type per stage)
- ADR: `docs/decisions/D-063-audit-failure-handling.md` (PASS/WARN/FAIL thresholds + safety field veto + retry semantics — D-077 §2.6 amends retry routing)
- ADR: `docs/decisions/D-075-stage5-jp-preservation.md` (D1 jp_mutation detector enforces continuously)
- ADR: `docs/decisions/D-076-stage4-answer-line-parsing.md` (D5 answer_index_mismatch enforces continuously)
- Code: `packages/extractor/src/cert_extractor/pipeline/stage6_audit/`
- Tests: `packages/extractor/tests/unit/test_pipeline_stage6_*.py` (103 tests)
- Memory: `feedback_quality_over_cost.md` (default to highest-quality / safest design choice; do not gate Stage 6 on shadow cost)

---

## Sign-off

| Role | Name | Time | Status |
|---|---|---|---|
| Pre-run scaffold author | Claude main session (Opus 4.7 1M ctx) | 2026-05-07T20:30+09:00 | scaffold ✅ (315 unit tests pass; 103 are Stage 6) |
| Stage A LLM dispatcher | (user-gated) | TBD | TBD |
| Stage A auditor | Claude main session | TBD | TBD |
| Stage A reviewer (规则 D 隔离) | user retro | TBD | TBD |
| Stage B LLM dispatcher | (user-gated) | TBD | TBD |
| Stage B auditor | Claude main session | TBD | TBD |
| Stage B reviewer (规则 D 隔离) | user retro | TBD | TBD |
| Final | user + Claude consensus | TBD | TBD |
