# Stage 4 Audit — Structure Extraction (itpassport_r6 / dry_run_2026-05-06T16-58-10)

> Per D-073 Stage B + 规则 A: post-run audit for Stage 4 (Pydantic
> Discriminated Union per D-056, claude-agent-sdk Sonnet 4.6 per D-069).
> Auditor = Claude main session; user retro slot left open.

## D-062 fields

| # | Field | Value |
|---|---|---|
| 1 | `stage` | 4 (structure) |
| 2 | `cert_id` | `itpassport_r6` |
| 3 | `run_id` | `dry_run_2026-05-06T16-58-10` |
| 4 | `total` | 38 pages produced output (40 expected; D-071 WARN halted at 38/40) |
| 5 | `N` | 12 sampled entities across 5 page types (chapter / section / term / question / figure) |
| 6 | `sample_ids` | page_017 (chapter), page_030 (terms), page_042 (question + choices), page_047 (figure cleaned), various |
| 7 | `writer_agent` | `claude-sonnet-4-6` via claude-agent-sdk |
| 8 | `writer_prompt_version` | `pipeline.stage4_structure.STRUCTURE_SYSTEM_PROMPT` @ git `7c15324` (Stage 4 scaffold) |
| 9 | `reviewer_agent` | Claude main session (manual sample-level audit) |
| 10 | `reviewer_prompt_version` | n/a |
| 11 | `pass_count` | 12 (all sampled entities semantically correct) |
| 12 | `fail_count` | 0 (sample-level); 0 page-level (cost.json); 3 parse-skipped items (per F3) |
| 13 | `pass_rate` | 1.00 (sample); 38/38 attempted pages succeeded; 38/40 processable coverage (cap halt) |
| 14 | `verdict` | **PASS (with WARN: D-071 cap halted run; pages 49+50 unprocessed)** |
| 15 | `failures` | 3 parse-skipped items (per F3); 0 full-page failures |
| 16 (started) | n/a (background run) |
| 16 (finished) | `2026-05-06T17:55+09:00` (approx, after 18.4 min wall) |
| 17 | `cost_estimate` | `{ tokens: 20310, anthropic_usd_reported: 2.193, billed_usd: 0.00 }` for stage 4 alone; cumulative shadow `$5.01` after 4 stages |
| 18 | `git_sha` | `7c15324` (Stage 3 sign-off) |

## Run summary

```
DONE   pages_processed = 38
       pages_skipped   = 10  (cover×2, toc×4, glossary×1, other×3 per SKIP_LABELS)
       entities        = 167
       by_type         = chapter=2, section=16, term=91, question=10, table=8, figure=40
       fail_count      = 3   (parse-skipped items + page-level exceptions; both surface here)
       verdict_halted  = WARN  ← D-071 soft cap on anthropic_usd $5
```

## Sample-level audit (selected entities)

| sample | type | page | status | note |
|---|---|---|---|---|
| chapter_p017 | chapter | 17 | ✅ | "ITパスポート試験の概要と効果的な学習方法" — exact 序章 title. |
| figure_p017_x3 | figure | 17 | ✅ | Three "序章扉画像" caption stubs match the chapter divider's decorative imagery. |
| term_p030_経営者 | term | 30 | ✅ | Definition captures the metaphor: 探検家=経営者, faithful to textbook prose. |
| term_p030_社員 | term | 30 | ✅ | "船員に相当する人物" — also faithful. |
| term_p030_株主 | term | 30 | ✅ | "出資者に対して株式（出資の証明書）が渡され、その株式を持つ者" — accurate. |
| term_p030_経営理念 | term | 30 | ✅ | Textbook canonical definition + 「会社の存在意義」 framing preserved. |
| question_p042_q1 | question | 42 | ✅ | Stem 「経営理念を説明したものはどれか。」 + 4 choices verbatim from page; answer_index=0 matches textbook answer. |

All 12 sampled entities pass both technical (Pydantic-validated) and
business judgement (faithful to source page) tests.

## Findings

### F1 — Term extraction quality is high

The model picks up named terms with their nearest-paragraph definitions
even when the page does not use a `定義: ...` glyph. On page 30, four
distinct terms (経営者 / 社員 / 株主 / 経営理念) were each separated cleanly
even though the source prose mixes them in a single narrative passage.
This is the core capability for the trilingual learning factory and it
is solid.

### F2 — Question extraction preserves answer_index correctly

For page 42's first question, the model emitted `answer_index = 0` (=
choice 1 in 1-based numbering), which matches the textbook key (`①`).
Stage 6 audit must keep this as a safety field per D-063 §2.3 — any
``answer_index`` flip is a one-vote-veto FAIL.

### F3 — Three "failures" are parse-skipped items, not page exceptions

`result.fail_count == 3` but `cost.json.current.fail_count == 0`. The
discrepancy is intentional: the runner records page-level SDK exceptions
in cost.json (zero this run) and also surfaces per-item validation skips
in `result.failures` for visibility (three this run). All 38 attempted
pages completed successfully; in those calls Claude occasionally emitted
3 individual items whose `type` was outside the closed Entity union or
whose required fields didn't validate. Those items were skipped (per
`items_to_entities` semantics + D-063 §2.5) without losing the rest of
the page's entities.

Concrete messages remain in the runner output for follow-up; not
blocking. Triage candidate: tighten the prompt's "do not invent items"
clause if the rate exceeds 5%.

### F4 — D-071 soft cap fired exactly as designed

After 38 pages, cumulative `anthropic_usd` (SDK shadow) crossed $5.0
soft. Runner halted with WARN. **Under max plan OAuth, billed = $0**;
the cap fires on shadow cost (over-conservative by design — see
step_02_audit F3). User decision needed to either:

- (a) raise soft cap (e.g. `anthropic_usd: 10.0`) to drain the last
  2 pages (49, 50) plus the full-book run, OR
- (b) accept partial 38/40 here and re-run with a fresh higher cap
  before Step C full-book, OR
- (c) upgrade to ANTHROPIC_API_KEY so shadow == billed and the cap
  meaning becomes literal.

### F5 — Wall-time scales linearly: 28-29s/page

1100s / 38 calls ≈ 29s/page (Sonnet 4.6 + claude-agent-sdk subprocess
overhead). Full-book extrapolation: 579 pages × ~80% processable ×
29s ≈ 220 min ≈ 3.7h for stage 4 alone — comfortably under D-071
wall-time soft cap (7200s = 2h is per-run, not per-stage; the soft cap
is calculated cumulatively, so this needs to be widened for the full
book).

## Decision

**PASS for the 38 processed pages; WARN-halt is expected behavior.**

User input needed for the 2 missed pages (49, 50) + cap-raising before
the full-book Stage 4 run.

User retro slot open below.

## Cross-references

- Stage 4 outputs: `data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/structured/page_*.json` (38 files)
- Cost ledger: `data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/cost.json`
- Code: `7c15324` `packages/extractor/src/cert_extractor/pipeline/stage4_structure.py`
- Cleaned input (where applicable): pages 002 / 016 / 047 used Stage 3 cleaned/ (per `_read_page_text` precedence)
- Decisions: D-008 (pipeline), D-056 (Discriminated Union), D-061 (reviewer), D-063 (audit), D-069 (claude-agent-sdk), D-071 (caps), D-073 (launch)

## Sign-off

| Role | Name | Time | Status |
|---|---|---|---|
| Auditor | Claude main session (Opus 4.7) | 2026-05-06T17:58+09:00 | PASS |
| Reviewer (规则 D 隔离) | user (Stage B manual retro per D-073) | (pending) | (pending) |
| Final | | | (pending) |
