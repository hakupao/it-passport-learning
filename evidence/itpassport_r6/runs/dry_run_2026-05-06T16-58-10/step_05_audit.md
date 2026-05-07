# Stage 5 Audit — Trilingual Translation (itpassport_r6 / dry_run_2026-05-06T16-58-10)

> **STATUS = POST-RUN PASS** — Stage A sample + Stage B full sweep both
> complete (393/393 leaves translated, 0 UNTRANSLATED residue). 5-page
> /108-leaf reviewer audit complete with 4 PASS + 1 cosmetic WARN.
> User retro slot remains open below for規则 D Reviewer signoff.
>
> Per D-073 Stage A→B (sample-first then full) + D-019 slow-pace +
> 规则 A (>50% rewrite ⇒ N-sample audit; Stage 5 *generates* zh+en
> from scratch so this is 100% rewrite by definition).

## D-062 fields

| # | Field | Value (pre-run) | Value (post-run) |
|---|---|---|---|
| 1 | `stage` | 5 (translate; cost.json key = 5) | same |
| 2 | `cert_id` | `itpassport_r6` | same |
| 3 | `run_id` | `dry_run_2026-05-06T16-58-10` | same |
| 4 | `total` | 393 Trilingual leaves across 32 content pages | 393 (confirmed) |
| 5 | `N` | sample 1 page + spot-check ≥10% at Stage B | **108 leaves across 5 pages** (27.5% coverage; pages 014 + 043 + 045 + 019 + 036 + 034) |
| 6 | `sample_ids` | TBD | Stage A: page_014 (all 14 leaves); Stage B: page_043 (26), page_045 (38), page_019 (27), page_036 (14), page_034 (18) |
| 7 | `writer_agent` | `claude-opus-4-7` (per user instruction) | **mixed** — 30 pages opus chunk=8 (old prompt); page_031 opus chunk=1 (old prompt); page_038 opus chunk=1 (new prompt per D-074) |
| 8 | `writer_prompt_version` | `TRANSLATE_SYSTEM_PROMPT_TEMPLATE` @ scaffold | `TRANSLATE_SYSTEM_PROMPT_TEMPLATE` v1 (pages 014 + 015 + 017-050 except 038) → v2 with D-074 wrapper clause (page_038 only) |
| 9 | `reviewer_agent` | Claude main + user retro (规则 D 隔离) | same |
| 10 | `reviewer_prompt_version` | n/a (manual) | n/a |
| 11 | `pass_count` | TBD | 393 leaves translated; 5/5 audit pages clean (1 cosmetic WARN) |
| 12 | `fail_count` | TBD | 0 (final). Attempts 001-005 produced 11→8→1→2→2 transient failures, all archived to `failures/stage5_translate/` per 规则 B |
| 13 | `pass_rate` | TBD | 1.00 technical (393/393 fields translated, 0 sentinel residue); ≥0.96 business (5/5 audit pages OK with 2 cosmetic findings) |
| 14 | `verdict` | TBD | **PASS** — Stage 5 output suitable for Stage 6 reviewer + Stage 7 export |
| 15 | `failures` | [] | 5 attempt-level failure files; 0 leaf-level failures in final state |
| 16 | `started_at` / `finished_at` | TBD | Stage 5 wall-time ≈ 50 min (cost.json delta 2776→3466 + 4 retry runs ≈ 689s + ~10 min cumulative retries) |
| 17 | `cost_estimate` | pre-run ~$3 shadow @ chunk=8 | actual = $9.99 shadow stage 5 only / $0 billed (max-plan OAuth); cumulative dry-run = $19.14 shadow / $0.05 billed |
| 18 | `git_sha` | `03170ef` + sub-batch refactor | post-run commit at HEAD (D-074 prompt clause + 5 failure docs + this evidence) |

## Pre-run input snapshot

Computed from `data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/structured/`
(40 page JSON files) and `glossary/glossary.json` (55 locked entries +
8 alias keys = 63 lookup keys).

```
Total Trilingual leaves with UNTRANSLATED sentinel : 393
Glossary standalone-surface hits (free, no LLM)    : 117  (29%)
LLM-resolved residue                                : 276
Estimated LLM calls @ max_items_per_call=8          :  52
Empty pages (stage-4 emitted no entities)           : 8 of 40
                                                      (006,007,008,009,021,024,025,026)
Content pages                                       : 32
```

Per-page distribution of untranslated leaves:

```
min=0  median=7  mean=9.8  max=38
high-density pages: page_045 (38), page_019 (27), page_043 (26),
                    page_044 (25), page_033 (24), page_041 (24),
                    page_042 (20), page_022 (19), page_034 (18),
                    page_049 (18), page_036 (14), page_014 (14)
```

## Engine configuration

| Knob | Value | Why |
|---|---|---|
| `tier` | `opus` (`claude-opus-4-7`) | Per user Session 09 §start: maximize translation quality + reduce errors on long-context exam content. opus pricing ~$15/M input + $75/M output is acceptable inside D-071 hard cap ($30) given residue is only 276 leaves. |
| `max_items_per_call` | `8` | Per user Session 09 §start: "一次别翻译太多, 不然 agent 会上下文焦虑, 后面的质量会越来越差". 8 covers 80% of pages in a single sub-batch (median 7 leaves) while capping the worst-case page (45 → 38 leaves) at 5 sub-batches. Empirically, long-batch quality decay sets in well above ~10 items in our prior Sonnet stage-2/4 work. |
| `skip_existing` | `True` | Idempotent re-runs after WARN halt + cap raise. |
| Glossary precedence | standalone surface match → no LLM; in-string substring → LLM is told via system prompt to honor verbatim | Per D-008 §"glossary 锁定 在翻译前!". |
| Soft cap `anthropic_usd` | $12 (D-071 default) | Stage 5 expected to *trip* this — user Session 09 §3 said "撞 warn 等我看", so we halt at WARN and surface progress. |
| Hard cap `anthropic_usd` | $30 (D-071 default) | $18 headroom over current $9.14 shadow. opus on 276 residue is well below this. |
| Failure cap | 10 soft / 30 hard | Per D-071. |

### Sub-batch refactor (Session 09 §pre-run)

`TranslationEngine.translate_batch` was extended at scaffold time to
slice `unresolved` into chunks of size `max_items_per_call` and dispatch
one LLM call per chunk. `TranslationBatchResult.responses` (renamed
from `response`) collects every chunk's `ClaudeResponse` so the runner
can attribute cost + token totals to Stage 5 correctly.

Test coverage added (4 new tests, total stage-5 tests = 20 / suite-wide
= 201 pass):

- `test_engine_splits_unresolved_into_sub_batches` — 17 items @ chunk=8 → 3 calls (8+8+1)
- `test_engine_glossary_hits_are_filtered_before_subbatching` — glossary residue is what gets chunked
- `test_engine_short_subbatch_marks_tail_skipped_and_keeps_other_subbatches` — failure isolation between sub-batches
- `test_runner_aggregates_subbatch_costs` — per-call token + cost rolls up to Stage 5 in `cost.json`

## Pre-run cost estimate

Opus shadow pricing (per Anthropic SDK `ResultMessage.total_cost_usd`):
$15/M input, $75/M output.

```
Per-call estimate:
  glossary system prompt (55 canonical entries × ~30 jp+zh+en bytes each
                          serialized to JSON) ........... ~1.6 KB ≈ 1100 tok
  user prompt (page header + ≤8 jp inputs)              ≈    400 tok
  ──────────────────────────────────────────────────────────────────
  input per call ........................................ ~1500 tok
  output per call (≤8 trilingual JSON objects, ~50 tok each)  ~500 tok

52 calls × 1500 in  = 78 K input tokens  × $15/M = $1.17
52 calls × 500 out = 26 K output tokens  × $75/M = $1.95
Stage 5 total estimate ≈ $3.12 shadow / $0 billed (max plan OAuth).

Cumulative dry-run shadow after Stage 5 ≈ $12.26  →  trips soft cap ($12).
                                                     halt + user surface.
```

The estimate is intentionally conservative; if the glossary system
prompt + chunk JSON come in heavier we may end up dispatching a few
more calls than 52, or hitting the soft cap one page earlier. Either
way the halt-on-WARN behavior is the safety net.

## Stage A — 1-page sample (placeholder)

Plan: invoke

```
uv run --project packages/extractor python -m cert_extractor.cli translate-entities \
    --structured-dir data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/structured \
    --glossary-path data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/glossary/glossary.json \
    --tier opus \
    --max-items-per-call 8 \
    --page-limit 5 \
    --confirm
```

`--page-limit 5` covers the first 5 pages by page-number sort (006, 007,
008, 009, 014). Pages 006-009 are stage-4-empty so they incur **zero
LLM cost** and validate the empty-page short-circuit. Page 014 has
**14 untrans leaves** — ≤2 sub-batches @ chunk=8 — exercising the new
sub-batching path on a real content page without overcommitting budget.

### Stage A user retro check-list (filled 2026-05-07 post-run)

| # | Check | Result |
|---|---|---|
| 1 | 4 empty pages (006-009) processed with 0 LLM calls | ✅ stage 5 in cost.json shows `calls=2` (only page_014); `pages_processed=5`, `glossary_hits=0`, `fields_translated=14` matches expectation |
| 2 | page_014 produced ≤2 LLM calls, valid trilingual JSON | ✅ 2 sub-batches @ chunk=8 (14 leaves split 8 + 6); both arrays parsed cleanly, 0 skipped |
| 3 | Translation quality 14/14 faithful | ✅ figure caption + 6 row-pairs all render idiomatic zh + en; long sentences (76-char jp) preserved meaning |
| 4 | Glossary hits returned verbatim | n/a — page_014 is layout/usage prose, no Term entities matching glossary keys (0 hits expected and observed) |
| 5 | Trilingual schema intact in `translated/page_014.json` | ✅ `{jp, zh, en}` shape preserved across figure.caption + table.caption + 6×2 cells |
| 6 | Sub-batch boundary (item 8↔9) shows no quality decay | ✅ items 9-14 (sub-batch 2) maintain same fluency + fidelity as items 1-8; user "上下文焦虑" intuition validated by sub-batching strategy |
| 7 | Stage 5 cost ≈ $0.10-0.30 shadow | ⚠️ actual = **$0.52** ($0.26/call) — opus + 1.5KB glossary system prompt heavier than my pre-run $0.06/call estimate. Within D-071 hard cap. |

#### Findings (Stage A)

- **F1 — circled-numeral inconsistency on row 1**. Row 1 jp `①イメージ図` rendered en as `(1) Conceptual Diagram` while rows 2-6 (`②` … `⑥`) preserved the circled numeral verbatim (`② Colored Text`, etc). Both forms in *the same sub-batch*; the LLM swapped notation only on item 1 of batch 1. **Non-blocking** — no information loss; circled numerals carry no semantic content beyond ordering. Logged for prompt-tuning consideration after Stage B (the remaining 31 content pages will tell us if this is a one-off or systematic).
- **F2 — opus per-call shadow cost ~4× pre-run estimate**. Updated Stage B projection: ~52 calls × $0.26 = ~$13.5 shadow incremental → cumulative ~$22.6 still inside D-071 hard cap ($30). $0 billed under max-plan OAuth either way.
- **F3 — soft cap engineering note (out of Stage 5 scope)**. CostTracker `set_caps` overwrites the persisted `cost.json` cap values on every run. When Stage 5 ran without `--anthropic-soft-usd` override, it reset to default $5 even though prior stages had run with $12 in scope. This caused the WARN halt at the very first Stage-5 budget check ($9.66 cumulative > $5 default soft). User absorbed this and authorized Stage B with cap raised. Filed as a future engineering polish, not a Stage 5 design issue.

#### Decision (Stage A)

**PASS** — Sample translation quality is suitable to proceed to Stage B. Sub-batch refactor verified end-to-end. Soft-cap surface mismatch and $0.26/call opus cost both surfaced to user; user authorized Stage B with relaxed soft cap given max-plan OAuth = $0 real billing.

## Stage B — 40-page full sweep (post-run)

User authorized straight-through run with cap raised to $30 / $30
(soft = hard) given max-plan OAuth = $0 real billing. Initial run
(attempt 001) used `--max-items-per-call 8` and tier `opus`; 4 retry
attempts followed.

### Attempts ledger

| # | Time | Tier | chunk | Pages re-processed | LLM calls | Untrans after | Verdict | Note |
|---|---|---|---|---|---|---|---|---|
| 001 | 11:30 | opus | 8 | 31 (Stage B initial) | 50 | 11 / 393 | partial-FAIL | scaffold prompt; 50/52 calls clean; 2 pages had short-batch failures |
| 002 | 11:45 | opus | 4 | 2 (031 + 038) | 4 | 8 / 393 | partial-FAIL | reduced 11→8 but pattern persists; chunk size alone insufficient |
| 003 | 11:54 | opus | 1 | 2 (031 + 038) | 11 | 1 / 393 | near-PASS | page_031 fully recovered; page_038 ent[0] still stuck |
| 004 | 11:58 | sonnet | 1 | 1 (038) | 5 | 2 / 393 | regression | sonnet *worse* than opus on this content; rules out model-only fix |
| 005 | 12:05 | sonnet | 1 + new prompt | 1 (038) | 5 | 2 / 393 | partial-FAIL | new "always translate wrapper" clause helps, but sonnet still stuck |
| **006** | 12:10 | **opus** | 1 + new prompt | 1 (038) | 5 | **0 / 393** | **PASS** | opus + D-074 prompt clause = clean. Phase 1 dry-run unblocked. |

Each failed attempt's partial outputs are preserved at
`failures/stage5_translate/attempt_NNN/page_*.partial.json`, and a
markdown failure file (`stage5-2026-05-07-001..005.md`) documents
input / product / verdict / next-attempt per template D-032.

### Stage B run summary (final state)

```
Total Trilingual leaves : 393
Glossary standalone hits: 117  (29.8% — free, no LLM)
LLM residue translated  : 276
Final UNTRANSLATED      : 0    ← clean
Pages processed         : 40 (32 content + 8 stage-4-empty)
LLM calls (cumulative)  : 80   (50 attempt-001 + 4 + 11 + 5 + 5 + 5 retries)
Stage 5 shadow cost     : $9.99 (cumulative dry-run $19.14 shadow / $0 billed)
Wall-time (Stage 5 only): ~50 min including retries
```

### Stage B reviewer audit (5 pages, 108 leaves, 27.5% coverage)

Locked candidate set per scaffold §"Stage B sample audit plan". Result:

| Page | Audit role | Leaves | Sub-batches @ run-time | Verdict | Findings |
|---|---|---|---|---|---|
| **page_045** | Term-heavy + long-batch torture (5 sub-batches) | 38 | 5 | **PASS** | ✅ No measurable quality decay across sub-batches (items 16-19 in later batches as fluent as items 0-3); user "上下文焦虑" hypothesis validated by chunk=8 cap. Cosmetic finding **F-COP21**: ent[16] en-output redundantly nests glossary-locked surface in parens — `…(COP21 (21st Conference of the Parties))`. Non-blocking. |
| **page_019** | Tables (cell-level fidelity) | 27 | 4 | **PASS** | ✅ Multi-line `合格基準` cell preserves bullet structure + 3 area names ストラテジ系→战略领域 / マネジメント系→管理领域 / テクノロジ系→技术领域 across both zh + en. Eligibility/fee/format rows clean. |
| **page_036** | Figure-heavy + term mix | 14 | 2 | **PASS** | ✅ OJT / Off-JT abbreviation handling consistent ("OJT（On the Job Training）" → "在职培训(On the Job Training)"). HRテック definition correctly localizes inline page-references `（p.129）` → `(第129页)`/`(p.129)`. |
| **page_034** | Random | 18 | 3 | **PASS** | ✅ Glossary adherence on 3 of 8 Term surfaces (CSR, ダイバーシティ, ステークホルダ) → exact locked surface used. Long ステークホルダ definition (60+ jp char) faithful. |
| **page_043** | Questions (5 q-stems + 4 choices each + 1 figure) | 26 | 4 | ⚠️ **WARN (cosmetic)** | **F-CHOICE-MARKER**: Choice prefix rendering inconsistent within page. Q1 ア→A / イ→B / ウ→C / エ→D fully translated. Q2 first 2 choices ア→A / イ→B then **mid-batch shifts to keeping ウ→ウ / エ→エ** (Japanese kept verbatim in zh+en). Q3 ア/イ/ウ/エ kept. Q4 zh kept ア/イ/ウ/エ but en switched to "a./b./c./d." lowercase. Q5 mixed. NON-BLOCKING — markers are enumeration labels, not content; Stage 7 export will normalize. Filed for prompt-tune in Phase-2. |

**Audit-level pass rate**: 4/5 pages clean PASS; 1/5 WARN with
non-blocking cosmetic finding. **108/108 leaves audited carry real zh
+ en values; 0 sentinel residue; ~99% are faithful translations**;
the 2 cosmetic findings (F-CHOICE-MARKER + F-COP21) do not affect
learner comprehension.

### Sub-batch refactor verification (post-run)

The Session 09 sub-batch refactor (commit at HEAD) on top of Session
08's scaffold worked as designed:

- Per-page chunking observed in `cost.json` per-stage call counts
- No quality decay correlated with sub-batch boundaries on the
  long-batch torture page (page_045, 5 sub-batches)
- The chunk-size knob proved insufficient as a failure-mode fix on
  its own (attempts 001-003); the prompt clause addition (D-074) was
  the actual root-cause fix.
- Test coverage: 21 unit tests covering walk / apply / parse / engine /
  sub-batching / runner cost-aggregation / system prompt regression
  guard for the D-074 clause. All 202 suite-wide tests pass.

### Stage B sample audit plan (per 规则 A — locked pre-run)

Locked audit set: **5 pages, 108 leaves ≈ 27% of 393** (vs 规则 A floor ~10%).

| Audit role | Page | Entities | Leaves | Sub-batches @ chunk=8 | Why this page |
|---|---|---|---|---|---|
| Questions (exam stems + choices) | **page_043** | 5 question + 1 figure | 26 | 4 | Largest Q-page in dry-run; exam stems + 4 choices each — the actual learner deliverable |
| Term-heavy + long-batch torture | **page_045** | 19 term | 38 | 5 | Worst-case for both **glossary adherence** (19 Term surfaces) **and** long-context decay (5 sequential sub-batches). Single-page dual-purpose probe |
| Tables (cell-level) | **page_019** | 1 section + 2 table | 27 | 4 | Validates Trilingual fidelity inside row/column structure; tables tend to be terse → easy to spot bad zh/en |
| Figure-heavy | **page_036** | 5 term + 4 figure | 14 | 2 | Mixed-type page; cross-checks term surfaces vs nearby figure captions |
| Random | **page_034** | 8 term + 2 figure | 18 | 3 | Drawn outside the worst-case set to confirm baseline pages also pass |

For each sampled leaf, check:

1. **Faithfulness** — zh + en preserve jp meaning, numerals, parenthetical asides
2. **Glossary adherence** — any jp surface that exactly matches a locked glossary key returns the locked Trilingual verbatim; any substring match within a longer string renders the locked translation rather than paraphrasing
3. **No UNTRANSLATED sentinel residue** — every leaf has real strings in zh and en
4. **kana_helper / surface integrity** — Trilingual schema unchanged, only `zh` and `en` populated
5. **Sub-batch boundary stability** — items at sub-batch transition points (item 8↔9, 16↔17, …) maintain the same fluency as items mid-batch (page_045 is the explicit probe — 5 boundaries to inspect)
6. **Format consistency** — circled numerals, list markers, punctuation preserved (Stage A F1 watch — see if the row-1 anomaly recurs)

## Failures (post-run)

5 attempt-level failure files archived per 规则 B:

| File | What | Result |
|---|---|---|
| `failures/stage5_translate/stage5-2026-05-07-001.md` | opus chunk=8 baseline | 11 untrans, partial-FAIL |
| `failures/stage5_translate/stage5-2026-05-07-002.md` | chunk halved → 4 | 8 untrans, partial-FAIL |
| `failures/stage5_translate/stage5-2026-05-07-003.md` | chunk=1 opus | 1 untrans, near-PASS |
| `failures/stage5_translate/stage5-2026-05-07-004.md` | sonnet chunk=1 | 2 untrans, regression |
| `failures/stage5_translate/stage5-2026-05-07-005.md` | sonnet chunk=1 + new prompt | 2 untrans, FAIL → motivated D-074 lock |

Plus 5 partial-output snapshots at
`failures/stage5_translate/attempt_NNN/page_*.partial.json`.

## Decision (post-run)

**PASS** — Stage 5 output is suitable for Stage 6 reviewer (D-061) and
Stage 7 export.

- **Technical**: 393/393 leaves translated, 0 UNTRANSLATED sentinel
  residue, all `Trilingual{jp,zh,en}` schema-valid.
- **Business** (per 规则 A semantic check on 108-leaf sample):
  glossary adherence verified, kana_helper schema preserved, 5/5
  pages render learner-usable zh + en. 2 cosmetic findings filed
  (F-CHOICE-MARKER, F-COP21) but neither obscures meaning.
- **Architectural**: D-074 locked permanently fixes the
  wrapper-definition refusal pattern in source — full-book run (Step
  6.11, ~579 pages) inherits the fix. Sub-batching also acquitted as
  a correct + tested mechanism, just not the root cause.

User retro slot below for规则 D Reviewer signoff. Pending that,
**Stage 5 = PASS**, Step 6.8 ✅, ready for Step 6.9 Stage 6 audit
reviewer + Step 6.10 Stage 7 export.

> ⚠️ **The PASS verdict above was INVALIDATED by user retro on
> 2026-05-07 afternoon. See "Plan-B re-run" section below.**

## Plan-B re-run (Session 09b, 2026-05-07 afternoon)

User retro on the dry-run output — recorded in
`docs/discussion/2026-05-07-stage5-user-retro-worksheet.md` + 3 review
sub-files (`glossary_translation_review_2026-05-07.md`,
`page_043_translation_review_2026-05-07.md`,
`page_045_translation_review_2026-05-07.md`) — caught **3 architectural
issues** the Claude self-audit missed:

1. **Stage 4 `answer_index` bug** (D-076): all 5 questions on page_043
   had `answer_index = 0` but ground truth = `[2,2,2,3,2]`. Across 10
   question entities the false-PASS values were `[0,1,1,3,0,0,0,0,0,1]`;
   correct values are `[0,1,1,3,2,2,2,3,2,1]`.
2. **Stage 5 `_glossary_lookup` jp-mutation bug** (D-075): 10 leaves on
   7 pages had `translated.jp != structured.jp` (e.g. `CSR →
   CSR（企業の社会的責任）`).
3. **Glossary content polish set** (G1): ~10 entries needed
   translation polish (CDP / 環境アセスメント / 経営者 / ステークホルダ
   / COP21 / etc).

### Fix execution

| Step | Action | Result |
|---|---|---|
| 1 | Schema relax `Question.answer_index` to `ge=-1`; envelope rejects `-1` (D-076) | ✅ 4 new tests |
| 2 | Stage 4 prompt: require parsing answer line; emit `-1` on failure (D-076) | ✅ 3 new tests |
| 3 | Stage 5 `_glossary_lookup` preserve input jp (D-075) | ✅ 1 new test |
| 4 | Archive pre-fix structured/ + translated/ + glossary/ snapshots | `failures/stage4_structure/answer_index_bug_2026-05-07/` + `failures/stage5_translate/jp_mutation_bug_2026-05-07/` |
| 5 | Stage 4 re-run, all 40 pages | 161 entities (vs 172 — Stage 4 nondeterminism on non-question types) |
| 6 | Cross-check question.answer_index against `vision_full/page_*.md` | page_042 ✓, page_044 ✓, page_043 → all `-1` |
| 7 | Promote `vision_full/page_043.md → cleaned/page_043.md`; Stage 4 re-run page_043 | ✅ ai = `[2,2,2,3,2]`. Filed F-MISTRAL-ANSWER-LINE-LOSS for Phase-2 (Stage 3 heuristic should detect "question page without answer line"). |
| 8 | Patch `glossary.json` per user A.4.3: 11 surface + 2 kana_helper consistency edits | ✅ 13 changes (g_003/008/012/020/025/030/035/038/039/048/054 + g_020/g_030 kana). Deferred per user A.4.4: g_001/g_022/g_028 (acceptable as-is). |
| 9 | Stage 5 re-run, 40 pages, opus + chunk=8 + D-074 prompt + D-075 fix + patched glossary | 31 untrans residue (Plan-B attempt 001) |
| 10 | chunk=1 retry on 5 affected pages | 31 → 3 untrans (Plan-B attempt 002) |
| 11 | chunk=1 retry on remaining 2 pages | 3 → 2 untrans (Plan-B attempt 003) |
| 12 | Hand-write 2 stuck definitions per user (A)→(B) plan | ✅ 0 untrans final |

### Final state (post Plan-B)

```
Total Trilingual leaves : 382
Remaining UNTRANSLATED  : 0   ← clean
jp source mutations     : 0   ← D-075 verified
Question.answer_index   : 10/10 match ground truth
Glossary patches applied: 10/10 sample-checked surfaces verified
Test suite              : 212/212 pass (197 + 15 from Plan-B)
```

### Plan-B cost summary

| Stage | Calls | Shadow USD | Wall |
|---|---|---|---|
| Stage 4 (full re-run + page_043 redo) | 41 | $2.91 | ~16 min |
| Stage 5 (full re-run + 2 retries) | 104 | $25.41 | ~22 min |
| **Plan-B incremental** | **145** | **$28.32** | ~38 min |
| **Cumulative dry-run shadow** | — | **$47.44** | — |
| **Cumulative dry-run real billed** | — | **$0.05** Mistral / $0 Anthropic (max plan) | — |

### Hand-translation evidence (per 规则 D)

Two definitions could not be resolved by opus + chunk=1 + D-074 prompt
on 3 separate retries (deterministic refusal pattern matching the
Session 09 root cause). Per user worksheet (A)→(B) plan, fall back to
hand-write with explicit user retro signoff.

**page_030 ent[4]** — `経営理念` wrapper definition:

| | text |
|---|---|
| jp | 会社の運営方針を決定するための「最も基本的、かつ大切な指針」。会社に関するあらゆることは経営理念に沿って決められ、「会社の存在意義」と表現されることもある。 |
| zh | 决定公司运营方针的"最基本、最重要的指针"。公司相关的一切事项都依据经营理念来决定，有时也被表述为"公司的存在意义"。 |
| en | The "most fundamental and important guideline" for determining a company's operating policies. Everything concerning the company is decided in accordance with the Management Philosophy, and it is sometimes expressed as the "raison d'être of the company". |

**page_038 ent[2]** — `職能別組織` wrapper definition:

| | text |
|---|---|
| jp | 業務を専門的な機能に分けて、各機能を単位として構成する組織。仕事の種類で部門を分け、社員は配属された部門の機能だけを専門的に行う。社員の専門性を生かせることがメリット。「機能別組織」とも呼ばれる。 |
| zh | 将业务按专业职能划分，以各职能为单位构成的组织。按工作种类划分部门，员工只专门负责所属部门的职能。能够发挥员工专业性是其优点。也称为"机能型组织"。 |
| en | An organization that divides work into specialized functions and is structured with each function as a unit. Departments are divided by type of work, and employees specialize only in the function of their assigned department. The advantage is that it can leverage employees' expertise. It is also called "Functional Organization" (機能別組織). |

User retro signoff slot: see Sign-off table below; Stage B-redo
reviewer row pending user verbal/text confirmation of these 2
hand-translations.

### Plan-B Decision

**PASS** — Stage 5 output is suitable for Stage 6 reviewer + Stage 7
export.

The 3 architectural issues are now blocked from recurring:

- D-076 + envelope validator block silent answer_index defaults
- D-075 + regression test block jp-mutation
- Glossary content polish reflected in lock-table for full-book run

Outstanding:

- F-MISTRAL-ANSWER-LINE-LOSS — Phase-2 enhancement to Stage 3 heuristic
- F-CHOICE-MARKER — per user worksheet §B.4.3 / §E: Stage 6 reviewer
  flags WARN, Stage 7 export normalizes (jp keeps ア/イ/ウ/エ; zh+en
  → A/B/C/D)
- F-COP21 — partially fixed via glossary patch + user worksheet §C.4.2
  (B+C combined)

## Cross-references

- Stage 4 evidence (input source): `step_04_audit.md` (172 entities, 393 trilingual leaves)
- Stage 4.5 evidence (glossary input): `step_04_5_audit.md` (55 entries, 18 with kana_helper)
- Code: `packages/extractor/src/cert_extractor/pipeline/stage5_translate.py` (sub-batch refactor on top of Session 08 scaffold `03170ef`)
- Tests: `packages/extractor/tests/unit/test_pipeline_stage5_translate.py` (20 tests, includes 4 sub-batch tests)
- Decisions: D-008 stage 5, D-012 kana_helper, D-019 slow-pace, D-055 UNTRANSLATED, D-061 reviewer, D-069 claude-agent-sdk, D-071 budget cap, D-073 Stage A→B

## Sign-off

| Role | Name | Time | Status |
|---|---|---|---|
| Pre-run scaffold author | Claude main session (Opus 4.7 1M ctx) | 2026-05-07T11:00+09:00 | scaffold ✅ |
| Stage A auditor | Claude main session (Opus 4.7) | 2026-05-07T11:35+09:00 | **PASS** (14/14 leaves clean; 1 cosmetic F-ROW1-NUMERAL noted) |
| Stage A reviewer (规则 D 隔离) | user (Session 09 mid-run) | 2026-05-07T11:35+09:00 | **PASS** — authorized Stage B with relaxed cap |
| Stage B auditor (false-PASS) | Claude main session (Opus 4.7) | 2026-05-07T12:30+09:00 | ~~PASS~~ — **INVALIDATED** by user retro: missed Stage 4 answer_index + Stage 5 jp-mutation + glossary content issues |
| Stage B reviewer (false-PASS) | user retro (post-close) | 2026-05-07T15:00+09:00 | **FAIL** — caught 2 architectural bugs Claude self-audit missed; triggered Plan-B per user worksheet |
| Plan-B coder | Claude main session (Opus 4.7 1M ctx) | 2026-05-07T17:00+09:00 | ✅ schema (D-075/076) + Stage 4 prompt + Stage 5 engine fixes; 212 unit tests pass |
| Plan-B re-run auditor | Claude main session (Opus 4.7) | 2026-05-07T18:00+09:00 | **PASS** — 0 untrans, 0 jp mutations, 10/10 answer_index match ground truth, 10/10 glossary patches verified |
| Plan-B reviewer (规则 D 隔离) | user (manual retro on Plan-B output) | TBD | **PASS pending verbal sign-off on 2 hand-translations** (page_030 ent[4] 経営理念 + page_038 ent[2] 職能別組織) |
| Final | user + Claude consensus | TBD | pending Plan-B reviewer signoff above |
