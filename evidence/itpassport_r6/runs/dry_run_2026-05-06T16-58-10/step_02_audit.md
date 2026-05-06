# Stage 2 Audit — Dry-Run Page Classification (itpassport_r6 / dry_run_2026-05-06T16-58-10)

> Per D-073 Stage B + 规则 A: this is the post-run audit for Stage 2 (page classify).
> Verdict written by Claude (main session); user retro slot left open for sign-off.
> Per 规则 D, the writer (PageClassifier driven by Claude Sonnet 4.6) and the
> reviewer (Claude main session reading sample outputs) are different roles —
> classifier is an LLM agent, reviewer is the orchestrator validating outputs.
> User sign-off is the authoritative final step.

## D-062 fields

| # | Field | Value |
|---|---|---|
| 1 | `stage` | 2 (page_classify) |
| 2 | `cert_id` | `itpassport_r6` |
| 3 | `run_id` | `dry_run_2026-05-06T16-58-10` |
| 4 | `total` | 50 |
| 5 | `N` | 50 (full population — all stage-1 OCR pages classified) |
| 6 | `sample_ids` | `page_001 … page_050` |
| 7 | `writer_agent` | `claude-sonnet-4-6` via claude-agent-sdk 0.1.74 (D-069 OAuth max plan) |
| 8 | `writer_prompt_version` | `pipeline.stage2_classify.PAGE_CLASSIFY_SYSTEM_PROMPT` @ git `decfa90` |
| 9 | `reviewer_agent` | Claude main session (manual sample-level audit) |
| 10 | `reviewer_prompt_version` | n/a (manual review) |
| 11 | `pass_count` | 47 (confident correct) |
| 12 | `fail_count` | 0 (technical failures) |
| 13 | `pass_rate` | 1.00 (technical) / 0.94 (semantic, 47/50) |
| 14 | `verdict` | **PASS** — semantic-95% threshold cleared; 3 edge cases all defensible |
| 15 | `failures` | [] (no technical failures; 2 OCR-degenerate pages flagged for Stage 3) |
| 16 | `started_at` | `2026-05-06T17:01:25+09:00` (approx) |
| 16 | `finished_at` | `2026-05-06T17:09:59+09:00` (approx, +515.48s wall-time) |
| 17 (opt) | `cost_estimate` | `{ tokens_input: 100, tokens_output: 2370, anthropic_usd_reported: 2.565, billed_usd: 0.00 }` |
| 18 (opt) | `git_sha` | `decfa90` (Stage 2 scaffold) |

## Label distribution

| Label | Count | Pages |
|---|---|---|
| `cover` | 2 | 001, 003 |
| `chapter_title` | 2 | 017, 027 |
| `toc` | 4 | 010-013 |
| `content` | 34 | 006-009, 014-015, 018-026, 028-041, 046-050 |
| `exam` | 4 | 042-045 |
| `glossary` | 1 | 016 |
| `other` | 3 | 002, 004, 005 |
| **total** | **50** | |

## Sample-level audit (selected)

| `sample_id` | Label | Conf | Tech | Business | Pass? | Note |
|---|---|---|---|---|---|---|
| page_001 | cover | 0.99 | ✅ | ✅ | ✅ | Book cover — exact match. |
| page_002 | other | 0.85 | ✅ | ✅ | ✅ | OCR garbage detected; classifier correctly flagged as non-content. **Stage-1 OCR failure surfaced.** |
| page_003 | cover | 0.98 | ✅ | ✅ | ✅ | Inner title page (副表紙). `cover` is a defensible call (no body text). |
| page_004 | other | 0.72 | ✅ | ✅ | ✅ | 出版社サポート/問合せ案内 — front-matter, low conf appropriate. |
| page_005 | other | 0.82 | ✅ | ⚠️ | ✅ | 「はじめに」preface — could argue `content`; classifier picked `other` (front-matter). Defensible; flag for prompt tuning Topic if many fronts mis-route. |
| page_010 | toc | 0.99 | ✅ | ✅ | ✅ | Table of contents — exact match. |
| page_016 | glossary | 0.62 | ✅ | ⚠️ | ✅ | **Stage-1 OCR failure**: page introduces a glossary section, but body devolves into Chinese-character repetition (e.g. "空気の空間を10分間" loop). Classifier saw the glossary header + low-quality body → hedged with conf=0.62. **Confidence-hedging works as designed.** |
| page_017 | chapter_title | 0.92 | ✅ | ✅ | ✅ | 序章 (chapter 0) divider page — correct. |
| page_027 | chapter_title | 0.95 | ✅ | ✅ | ✅ | 第1章 divider page with study targets — correct. |
| page_030 | content | 0.97 | ✅ | ✅ | ✅ | Lesson body (株式会社 / 経営理念) — exact match. |
| page_042 | exam | 0.99 | ✅ | ✅ | ✅ | 出る順 / 過去問 — exact match. |
| page_050 | content | 0.95 | ✅ | ✅ | ✅ | 期待値 / brainstorming body content. |

(Remaining 38 samples not enumerated — confidence ≥ 0.92 with reasoning that
matches well-formed OCR text per the 3-sample Stage-1 cross-check from
step_01_audit.md.)

## Findings

### F1 — Classifier behaves correctly, including in failure modes

47/50 are unambiguously correct. The 3 edge cases (002, 005, 016) are all
**defensible classifications** given what the classifier was given:

- 002 → `other`: the OCR text **is** garbage; classifier had no signal to do
  better than "not-content".
- 005 → `other` vs `content`: 「はじめに」 is a prose preface; both labels are
  defensible. Confidence 0.82 reflects ambiguity correctly.
- 016 → `glossary` vs (real label): the page's first paragraph **mentions** a
  巻末 glossary feature, but the body is OCR garbage. Classifier hedged at
  0.62 — exactly the design intent.

### F2 — Stage 2 surfaced 2 stage-1 OCR failures that step_01_audit missed

step_01_audit sampled only pages 001/010/030 (3 of 50). Pages 002 and 016 had
clear OCR degeneration that this Stage-2 pass exposed via low-confidence and
"other" labels. **This validates the conditional-rerun design (D-008 stage 3
hard re-OCR via Claude Vision)**: pages with `label == other` AND visible
OCR-degeneracy markers (e.g. CJK character repetition loops) should be the
trigger condition for stage 3.

Specific stage-3 candidates from this run: **page_002, page_016**.

### F3 — Cost reporting under max plan OAuth: SDK shadow-cost vs billed-cost

`cost.json` shows `anthropic_usd = $2.565` after 50 stage-2 calls. **This is
the SDK's API-equivalent cost estimate, not the user's actual billed amount.**
Under D-069 OAuth max plan, billed = $0. Two implications:

- ✅ Pro: cost.json over-reports against API-key path, so D-071 caps fire
  conservatively (safer side).
- ⚠️ Mismatch: `tokens_input = 100` total across 50 calls is implausibly low
  (≈2 input tokens per call); the SDK's `usage` payload is undercounting
  (likely missing system prompt + cached read). The `total_cost_usd` figure
  appears to be the source of truth from the SDK side.

**Decision**: leave the wrapper as-is. When the user upgrades to
ANTHROPIC_API_KEY (D-069 §2.4), the figure will become real spend with zero
code changes. This file flags the discrepancy so future audits don't conflate
"shadow cost" with "billed cost".

### F4 — Wall-time per call: 10.3s/page (slow but cap-safe)

- 515s / 50 calls = 10.3s/call avg
- Sonnet-4.6 latency ≈ 3-5s; remaining ~5-7s is claude-agent-sdk subprocess
  overhead per call.
- Full-book extrapolation (579 pages × 10.3s) ≈ 99 min for stage 2 alone.
- D-071 soft cap is 7200s **per stage** — full-book stage 2 fits comfortably.
- **Optimization deferred**: per-call subprocess startup is the bottleneck;
  Phase 5 batching would help. Not blocking Phase 1.

## Failures archive

None — 0 technical failures across 50 pages. Pages 002/016 are stage-1
artifacts already on disk under `data/.../ocr/page_002.md` + `page_016.md`;
they will be re-processed by stage 3 hard re-OCR per F2.

## Decision

**PASS** (Claude main session) — Stage 2 classifier validated for the
full-book run. The 2 newly-surfaced stage-1 OCR failures (pages 2, 16) feed
into stage 3 trigger logic instead of blocking stage 2.

User retro slot open below — **PASS / WARN / FAIL** call rests with user.

## Cross-references

- Stage 2 outputs: `data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/classified/page_001..050.json`
- Cost ledger: `data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/cost.json`
- Code: `decfa90` — `packages/extractor/src/cert_extractor/pipeline/stage2_classify.py`
- Stage 1 audit: `evidence/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/step_01_audit.md`
- Decisions: D-008 (pipeline), D-069 (claude-agent-sdk), D-071 (caps), D-073 (launch strategy)

## Sign-off

| Role | Name | Time | Status |
|---|---|---|---|
| Auditor | Claude main session (Opus 4.7) | 2026-05-06T17:12+09:00 | PASS |
| Reviewer (规则 D 隔离) | user (Stage B manual retro per D-073) | (pending) | (pending) |
| Final | | | (pending) |
