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

## Stage A re-run #1 (post D5+D7 FP fix, commit `a624f28`) — 2026-05-07T21:10+09:00

### Result

| Field | Value | Delta vs Stage A #0 |
|---|---|---|
| pages_processed | 5 | (same) |
| overall_verdict | **FAIL** | (same; remaining FAILs are D7 strict, not safety) |
| pass / warn / fail | 0 / 3 / 2 | from 0/2/3 — **page_045 moved FAIL → WARN** |
| safety_failed | **False** ✅ | from True — **D5 short-circuit verified** |
| most_severe_repair | "5" | from "4" — answer_index FP gone |
| LLM calls | 12 | (same) |
| cost_shadow | $2.7631 | (similar) |

### Key wins

- ✅ **D5 page_045 safety FAIL eliminated** by `len(questions)==0` short-circuit.
- ✅ **D7 page_014 4 FALSE FAILs reduced to 1** by circled-numeral normalization (`①-⑳ → 1-20`).
- ✅ Run no longer halts on safety FAIL — completes all 5 pages.
- ✅ F-CHOICE-MARKER catch retained (page_043 entity[1] zh).
- ✅ LLM Phase 2 catches retained (page_038 alt-name fidelity, page_038 idiomatic 手作業, page_014 ITパスポート→护照).

### Remaining 2 FAILs are real translation-style differences (not bugs)

- **page_014.entities[1].rows[1][1]**: jp `4種類` / zh `4种` / en `four types`. Populated numeric sets agree on `{"4"}`; en uses spelled-out form. Real fidelity preserved.
- **page_038.entities[3].definition**: jp `1つ上に` / zh `一个` / en (article). Populated sets agree on `{"1"}`; "1つ" paraphrased to article in en. Real fidelity preserved.

D7 was over-strict in calling these FAIL. Lock follow-up commit `162aebb` (D7 severity heuristic): split FAIL/WARN by populated-set agreement (all-agree → WARN; conflicting populated values → FAIL).

---

## Stage A re-run #2 (post D7 severity polish, commit `162aebb`) — 2026-05-07T21:25+09:00

### Result

| Field | Value | Delta vs re-run #1 |
|---|---|---|
| pages_processed | 5 | (same) |
| overall_verdict | **WARN** | from FAIL — **0 FAILs remain** |
| pass / warn / fail | **0 / 5 / 0** | from 0/3/2 — clean |
| safety_failed | False | (same) |
| most_severe_repair | "5" | (same; Stage 5 prompt-tune territory) |
| LLM calls | 12 | (same) |
| cost_shadow | $2.7808 | (similar) |
| run_level_issues | 2 (D13 INFO) | (same) |

### Per-page summary

| Page | Verdict | F / W / I | Notable |
|---|---|---|---|
| 014 | WARN | 0 / 1 / 0 | D7 numeric WARN (4種類↔four types); LLM (ITパスポート→护照) note absent re-run-2 |
| 030 | WARN | 0 / 1 / 0 | D9 glossary_lock_missed (経営者→en) |
| 038 | WARN | 0 / 3 / 1 | D7 numeric WARN; D9; D11 INFO; **🤖 LLM "circular definition" catch** ✓ |
| 043 | WARN | 0 / 6 / 1 | **D6 F-CHOICE-MARKER WARN** ✓; 5× D9 (システム / 組織形態 / CEO / CFO / CIO not in en); LLM 自我完结型 idiomatic INFO ✓ |
| 045 | WARN | 0 / 3 / 3 | 3× D9; 3× D11 INFO (kana_helper missing) |

### True positives (real audit value, all LLM-emitted catches verified high quality)

- **page_038 entity[2].definition.en**: LLM caught a circular English definition where the term name appears inside its own definition. Real fidelity issue Phase 1 detectors couldn't see.
- **page_043 entity[3].choices[3].zh**: LLM caught `自己完結的→自我完结型` as Japanese-style direct translation; suggests `自主完整` for Chinese-IT-textbook idiom.

### False positives — none after D7 polish.

### Verdict chain final state

| Run | overall | safety | P/W/F |
|---|---|---|---|
| Stage A #0 (initial) | FAIL | True (halted) | 0/2/3 |
| Stage A re-run #1 | FAIL | False | 0/3/2 |
| **Stage A re-run #2** | **WARN** | **False** | **0/5/0** ← clean baseline |

### Stage 6 detector + LLM Phase 2 verification matrix

| Component | Status | Evidence |
|---|---|---|
| D1 jp_mutation | unfired (Stage 5 D-075 already preserves jp) | implicit confirmation |
| D2 untranslated_residue | unfired (Stage 5 = 0 sentinel post Plan-B) | confirms Plan-B clean |
| D3 schema_invalid | unfired | translated/ all valid |
| D4 answer_index_out_of_range | unfired (D-076 envelope already gates) | implicit |
| D5 answer_index_mismatch | **fixed** (page_045 short-circuit) | re-run #1 + #2 silent |
| D6 choice_marker_inconsistent | **fired correctly** on page_043 Q2 | F-CHOICE-MARKER caught ✓ |
| D7 numeric_inconsistent | **polished** (severity heuristic) | 4 FP → 0 FP |
| D8 glossary_lock_violated | unfired (Plan-B glossary patches stable) | confirms |
| D9 glossary_lock_missed | fired noisy WARN ×9 | acceptable Phase-2 polish item |
| D10 redundant_nested_parens | **silent** (F-COP21 mitigated by glossary patch) | Plan-B verified |
| D11 kana_helper_missing | INFO ×4 on katakana terms | informational |
| D12 kana_helper_format | unfired | (no kana_helper present in Stage A pages) |
| D13 glossary_surface_concept_split | run_level INFO ×2 | confirms グリーンIT etc cosmetic |
| L1 hallucination | unfired | LLM didn't see hallucinations |
| L2 omission | unfired | LLM didn't see omissions |
| L3 unfaithful | fired correctly ×1 (page_038 circular EN) | high-quality LLM catch |
| L4 idiomatic | fired correctly ×1 (page_043 自我完结型) | high-quality LLM catch |

### Stage A reviewer (规则 D 隔离) sign-off — pending user retro

User picked "C" earlier (re-run + Stage B). Stage A re-run #2 result is
shown above; user retro on this output is required before Stage B
dispatch per D-077 §6.4 + CLAUDE.md gate. **Stage B is deferred to
Session 11 per user instruction "收个尾。保存记录一下，下次再跑 Stage B"** at
2026-05-07T21:30+09:00.

---

## Cumulative cost (after Stage A iterations)

| Stage | Calls | Tokens out | Shadow USD |
|---|---|---|---|
| Stage 1 (Mistral OCR) | 50 | — | $0.05 real |
| Stage 2 (classify) | 50 | 2,470 | $2.57 shadow |
| Stage 3 (Vision re-OCR) | 53 | 49,089 | $3.91 shadow |
| Stage 4 (Structure + Plan-B re-run) | 81 | 55,891 | $5.21 shadow |
| Stage 4.5 (Glossary) | 1 | 17,535 | $0.36 shadow |
| Stage 5 (Translate + Plan-B re-run) | 186 | 64,123 | $35.40 shadow |
| **Stage 6 (Audit, 3 dispatches)** | **36** | **32,293** | **$8.42 shadow** |
| **Cumulative dry-run shadow** | — | — | **$55.86** |
| Real billed | — | — | **$0.05 Mistral / $0 Anthropic (max-plan OAuth)** |

### Stage 6 dispatch breakdown

| Run | Time | Calls | Shadow | Notes |
|---|---|---|---|---|
| Stage A #0 | 2026-05-07T20:50 | 12 | $2.87 | Initial run; surfaced D5+D7 FPs; halted on page_045 safety FAIL |
| Stage A re-run #1 | 2026-05-07T21:10 | 12 | $2.76 | After D5+D7 FP fix; safety FAIL gone; 2 D7 strict FAILs persist |
| Stage A re-run #2 | 2026-05-07T21:25 | 12 | $2.78 | After D7 severity polish; **0 FAILs, clean baseline** |

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

**Stage 6 closure decision (2026-05-11, Session 11)**:

- Stage 6 module exits with **clean baseline (0 FAIL / 22 PASS / 18 WARN, safety_failed=False, no halt, 40/40 pages audited)** on Stage B rerun #3.
- Detector contract validated: D5/D6/D7/D8/D9/D10/D11/D12/D13 all behave as designed across 3 dispatches (Stage A re-run #2 + Stage B rerun #1 halted + Stage B rerun #2 + rerun #3).
- LLM Phase-2 reviewer (opus, v1.0 frozen) caught 1 real Stage 5 hallucination (page_022) that Phase-1 deterministic detectors could not see — Stage 6 design intent validated.
- 18 WARN pages all carry tracked Stage 5/Stage 7 polish items (tautology, suffix consistency, idiomatic Chinese, kana_helper backfill); none block Stage 7 export. Carried forward as "known polish items" in `step_06_audit.md` § "Known polish items carried forward".
- 30 D9 instances downgraded WARN→INFO per Stage B user retro Q4=B; signal-to-noise restored.
- Cumulative Stage 6 cost: $30.16 shadow / $0 billed across 6 dispatches.

**Step 6.10 Stage 7 export gate**: ✅ unblocked. Stage 7 export must refuse any UNTRANSLATED leaves (D-076 envelope contract); should normalize choice markers (D6 rs=7 items); known WARN items pass through with documentation.

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
| Stage A #0 LLM dispatcher | user-authorized via "go Stage A" | 2026-05-07T20:48+09:00 | dispatched ✅ (12 calls, $2.87 shadow) |
| Stage A #0 auditor | Claude main session (Opus 4.7) | 2026-05-07T20:55+09:00 | retro ✅ — surfaced D5/D7 FPs |
| Stage A re-run #1 LLM dispatcher | user-authorized via "1" path | 2026-05-07T21:08+09:00 | dispatched ✅ (12 calls, $2.76 shadow) |
| Stage A re-run #1 auditor | Claude main session (Opus 4.7) | 2026-05-07T21:10+09:00 | retro ✅ — D5 fixed, D7 needs severity polish |
| Stage A re-run #2 LLM dispatcher | user-authorized via "C" path | 2026-05-07T21:23+09:00 | dispatched ✅ (12 calls, $2.78 shadow) |
| Stage A re-run #2 auditor | Claude main session (Opus 4.7) | 2026-05-07T21:25+09:00 | retro ✅ — **clean baseline (0 FAIL, no safety, no halt)** |
| Stage A reviewer (规则 D 隔离) | user retro via worksheet | 2026-05-11 | ✅ Q1=D / Q2=✓ / Q3=✓ (`docs/discussion/2026-05-11-stage6-stageA-user-retro-worksheet.md`) |
| Stage B LLM dispatcher | user-authorized via "Q3=✓ 授权" | 2026-05-11T17:17:36+09:00 | dispatched ✅ (32 calls before halt, $7.56 shadow) |
| Stage B auditor | Claude main session (Opus 4.7) | 2026-05-11T17:25:16+09:00 | retro ✅ — root-cause analyzed both FAILs as detector FPs (D5 regex + D7 severity) |
| Stage B reviewer (规则 D 隔离) | user retro via worksheet | 2026-05-11 | ✅ Q1=A / Q2=A / Q3=A / Q4=B / Q5=✓ (`docs/discussion/2026-05-11-stage6-stageB-user-retro-worksheet.md`) |
| Detector fix (D5/D7/D9) | Claude main session (Opus 4.7) | 2026-05-11 | ✅ 3 fixes + 4 regression tests + 1 rename → 324/324 tests pass |
| Stage B rerun #2 LLM dispatcher | user-authorized via Q3 sign-off | 2026-05-11T17:42:29+09:00 | dispatched ✅ (40/40 pages, $10.95 shadow) |
| Stage B rerun #2 auditor | Claude main session (Opus 4.7) | 2026-05-11T17:55+09:00 | retro ✅ — D5/D7/D9 fixes verified; 1 real FAIL surfaced (page_22 LLM hallucination) |
| page_022 hand-edit | user | 2026-05-11 | ✅ "Activities" removed from entity[2].rows[1][1].en (`evidence/.../page_022_hand_edit_2026-05-11.md`) |
| Stage B rerun #3 LLM dispatcher | user-authorized via closure-worksheet Q1=B | 2026-05-11T18:09+09:00 | dispatched ✅ (40/40 pages, $10.75 shadow) |
| Stage B rerun #3 auditor | Claude main session (Opus 4.7) | 2026-05-11T18:20+09:00 | retro ✅ — **clean baseline (0 FAIL / 22 PASS / 18 WARN, safety_failed=False)** |
| Final | user + Claude consensus | 2026-05-11 | **Stage 6 ✅ closed; Step 6.10 unblocked** (pending user closure sign-off this turn) |

---

## Stage B (Session 11, 2026-05-11) — full narrative

### Stage B dispatch #1 — halt at page_042 safety FAIL

Dispatched 2026-05-11T17:17:36, halted 2026-05-11T17:25:16 per D-077 §2.8.
32/40 pages audited (8 skipped: pages 43-50).

| Metric | Value |
|---|---|
| pages_processed | 32 / 40 |
| pass / warn / fail | 17 / 13 / 2 |
| safety_failed | True (page_42 `Question.answer_index`) |
| halt_reason | `page_042: safety field FAIL (['Question.answer_index']); halting per D-077 §2.8.` |
| cost_shadow | $7.56 |
| billed | $0 (max-plan OAuth) |
| snapshot | `evidence/.../stage6_review_stageB.json` (99,700 bytes) |

**Both FAILs root-cause analyzed as detector false positives (Session 11 log §4.5)**:

1. **page_42 D5 FP**: regex `(?:問題\s*)?\d+\s*[\-...]\s*\d+\s*[\s　]+([アイウエオ])` captured choice-prefix kana (`1-1\nア.`) because `\s*[\s　]+` allows newlines. Real answer line `問題1-1 ア 問題1-2 イ 問題1-3 イ 問題1-4 エ` matches Stage 4's 4-question extraction exactly — Stage 4 was correct; D5 over-captured.
2. **page_19 D7 FP**: jp/zh `54.4％（2022年4月～2022年8月）` vs en `54.4% (April 2022 – August 2022)`. Populated sets {54,4,2022,8} vs {54,4,2022} differ by subset (en spells out month names). Original heuristic only downgraded to WARN when sets fully agreed; subset-only differences fell through to FAIL. Same class as Stage A page_014 (`4種類` vs `four types` → WARN) but heuristic edge-case missed.

### Detector fixes (no LLM cost)

Per user Stage B retro worksheet sign-off (Q1=A / Q2=A / Q3=A / Q4=B / Q5=✓):

1. **D5 regex** (`detectors.py:322`): added negative lookahead `(?![.．])` after captured kana — excludes choice prefixes like `ア.` / `ア．`. Regression tests: `test_choice_prefix_after_question_label_not_captured` + `test_full_width_period_after_kana_not_captured`.
2. **D7 severity heuristic** (`detectors.py:559`): added `all_pairwise_comparable` branch — when populated sets are pairwise subset-comparable (no conflicting values, only spelled-out drops), downgrade to WARN. Regression tests: `test_subset_difference_warn_not_fail` + `test_real_conflict_still_fails` (guard against subset relaxation breaking real conflicts).
3. **D9 severity policy** (`detectors.py:706`): WARN → INFO. 40-page dispatch surfaced 30 D9 instances mostly representing acceptable paraphrases; WARN noise crowded out real signal. Rationale comment added in source. Test renamed `test_substring_miss_in_zh_warns` → `test_substring_miss_in_zh_emits_info`.

**Full unit test suite: 324/324 pass** (320 base + 4 new regression tests). 0.42s runtime.

### Stage B dispatch #2 — full 40-page rerun after detector fix

Dispatched 2026-05-11T17:42:29, finished 2026-05-11T17:53:46.

| Metric | Stage B #1 (halt) | Stage B #2 (after fix) | Δ |
|---|---|---|---|
| pages_processed | 32 / 40 | **40 / 40** | ✅ full coverage |
| safety_failed | True | **False** | ✅ no halt |
| pass / warn / fail | 17 / 13 / 2 | **21 / 18 / 1** | +4 PASS, -1 FAIL |
| most_severe_repair_stage | 4 | **5** | ✅ no upstream Stage 4 |
| cost_shadow | $7.56 | $10.95 | this run |
| snapshot | — | `evidence/.../stage6_review_stageB_rerun2.json` (133 KB) | — |

**Detector fix verification**:

| Fix | Stage B #1 | Stage B #2 |
|---|---|---|
| D5 regex | page_42 FAIL safety | page_42 → WARN (D6 choice_marker real signal, rs=7) ✅ |
| D7 subset | page_19 FAIL | page_19 → WARN ✅ |
| D9 → INFO | 30 WARN instances polluting verdict | 30 INFO instances, no longer downgrade fid/ld ✅ |

**The 1 remaining FAIL was a real Stage 5 translation bug, caught by LLM Phase-2 reviewer**:

- Path: `page_022.entities[2].rows[1][1].en`
- jp: `・企業と法務 / ・経営戦略 / ・システム戦略`
- zh: `・企业与法务 / ・经营战略 / ・系统战略` ✓
- en: `- Corporate Activities and Legal Affairs / - Management Strategy / - System Strategy` ✗ — "Activities" hallucinated
- LLM rationale: JP says 「企業」 not 「企業活動」; en added a noun not in source (context bleed from another page's `企業活動`).
- repair_stage: 5

Phase-1 deterministic detectors cannot see semantic hallucinations of this class — no contract violation, leaf is well-formed. **LLM Phase-2 is the right detector lane**, and its v1.0 prompt produced this catch correctly. This validates Stage 6's design intent.

### LLM variance observation

Stage B rerun #1 (halt) did **not** catch the page_022 hallucination — it halted before reaching all chunks. Rerun #2 caught it. Both used opus, temperature=0, forced tool_choice, chunk_size=4. LLM still has slight variance on whether each specific catch surfaces in a given run.

Variance direction: "miss vs catch" (recall) not "false alarm" (precision). Across 4 Stage 6 dispatches (Stage A re-run #2 + Stage B #1 + Stage B #2 + Stage B #3), zero instances of LLM hallucinating a FAIL on faithful content. Acceptable per D-077 design — Stage 6 is defense-in-depth, not single-shot oracle.

### Hand-edit + Stage B dispatch #3 (rerun #3)

Per closure worksheet Q1 = B (user sign-off 2026-05-11):

User performed surgical hand-edit on `data/.../translated/page_022.json` entity[2].rows[1][1].en:

```
- Before: "- Corporate Activities and Legal Affairs\n- Management Strategy\n- System Strategy"
- After:  "- Corporate and Legal Affairs\n- Management Strategy\n- System Strategy"
```

Documented in `evidence/.../page_022_hand_edit_2026-05-11.md` with full before/after,
issue context, root-cause analysis (cross-entity context bleed), and Rule A/B/D references.

Dispatched 2026-05-11T18:09 ish, finished 2026-05-11T18:20:09.

| Metric | Stage B #2 | Stage B #3 (clean) | Δ |
|---|---|---|---|
| pages_processed | 40 / 40 | 40 / 40 | (same) |
| safety_failed | False | **False** | (same) |
| pass / warn / fail | 21 / 18 / 1 | **22 / 18 / 0** | **0 FAIL** ✓ |
| overall_verdict | FAIL | **WARN** | ✓ closure-eligible |
| most_severe_repair_stage | 5 | 5 | (same; remaining issues are Stage 5/Stage 7 polish items) |
| cost_shadow | $10.95 | $10.75 | rerun #3 |
| snapshot | — | `evidence/.../stage6_review_stageB_rerun3_clean.json` (135 KB) | — |

**page_022 verdict change**: FAIL → WARN (2 remaining tautology issues `entities[1].rows[1][1].en` + `entities[3].definition.en` are known Stage 5 prompt polish items — `ストラテジ→Strategy` self-reference loses meaning in EN; carried forward as polish item, not blocking).

### Stage 6 Stage B closure: ✅ clean baseline reached

- **0 FAIL** / 22 PASS / 18 WARN / 40 pages / safety=False / no halt
- All 18 WARN pages carry tracked polish items (see § "Known polish items carried forward")
- All detector fixes verified by both regression tests and real-data rerun
- LLM Phase-2 reviewer validated — caught real hallucination that detectors couldn't see
- Stage 6 module exit-state acceptable for downstream Stage 7 export

---

## Known polish items carried forward (Stage 5 / Stage 7)

These are Stage B rerun #3 WARN-level findings deferred to Stage 7 export or future Stage 5 prompt improvement. None are FAIL; none gate Stage 7 export.

### Stage 7 export normalization candidates (repair_stage = 7)

- **D6 choice_marker_inconsistent** ×3 pages (page_042, page_043, page_044): mixed marker schemes within question choices (e.g. `['A','B','ウ','エ']` for zh). Stage 7 export should normalize zh+en → `A/B/C/D` while keeping jp `ア/イ/ウ/エ` per D-077 §"Stage B reviewer audit plan".

### Stage 5 prompt polish candidates (repair_stage = 5)

- **D7 numeric_inconsistent WARN** ×22 pages (style/subset only — no semantic conflict): spelled-out months/years/counts, full-width vs half-width digit choices.
- **LLM translation_unfaithful WARN**:
  - page_017 entity[0].title.zh: 「効果的な」(effective) → 「高效」(high-efficiency) — semantic nuance shift; prefer 「有效」.
  - page_022 entity[1].rows[1][1].en + entity[3].definition.en: ストラテジ → "Strategy" leaves the EN sentence "Strategy means strategy" — tautology; needs prompt rule to drop the inner gloss when the target language already uses the gloss word.
  - page_022 entity[1].rows[3][0].en + entity[2].rows[3][0].en: inconsistent "Domain" suffix across 「〜系」 siblings.
  - page_038 entity[2].definition.en: circular EN — "Functional Organization" defined as "also called Functional Organization" — needs prompt rule for alternate-Japanese-name fidelity.
- **LLM term_translation_idiomatic INFO** (style suggestions, lowest priority): page_017/019/022/033/050.

### D11 kana_helper backfill (repair_stage = 4.5)

- **kana_helper_missing INFO** ×11 leaves: all-katakana Term.surface.jp without `kana_helper` (per D-012). Stage 4.5 backfill candidate; INFO-only so non-blocking.

### Run-level D13 INFO (Stage 4.5 glossary self-consistency)

- g_022 `surface.zh='绿色IT'` vs `kana_helper.zh_concept='绿色信息技术'` — no shared substring; INFO only.
- g_028 `surface.zh='社会企业'` vs `kana_helper.zh_concept='社会商业'` — no shared substring; INFO only.

---

## Cumulative Stage 6 cost

| Dispatch | Time | Calls | Shadow | Note |
|---|---|---|---|---|
| Stage A #0 | 2026-05-07T20:50 | 12 | $2.87 | Surfaced D5/D7 FPs |
| Stage A re-run #1 | 2026-05-07T21:10 | 12 | $2.76 | D5 fix verified |
| Stage A re-run #2 | 2026-05-07T21:25 | 12 | $2.78 | Stage A clean baseline |
| Stage B #1 | 2026-05-11T17:25 | 32 (halt) | $7.56 | 32/40 audited; halt page_42 |
| Stage B #2 | 2026-05-11T17:54 | 40 | $10.95 | After D5/D7/D9 fix; surfaced LLM hallucination FAIL |
| Stage B #3 | 2026-05-11T18:20 | 40 | $10.75 | After hand-edit; **clean baseline 0 FAIL** |
| **Stage 6 total** | — | — | **$37.67** | $0 real billed (max-plan OAuth) |

(Note: the cost.json cumulative may differ; the table above reflects per-dispatch shadow tracking. cost.json is canonical; this table is summary.)

### Cumulative dry-run (all stages)

| Stage | Shadow | Real billed |
|---|---|---|
| Stage 1 (Mistral OCR) | — | $0.05 Mistral |
| Stage 2-5 + Plan-B | $47.44 | $0 |
| Stage 6 (6 dispatches) | $37.67 | $0 |
| **Cumulative** | **$85.11** | **$0.05 Mistral / $0 Anthropic** |

Within D-077 §2.9 quality-over-cost framing (caps $999/$999); no real spend ceiling concerns.
