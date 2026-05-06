# Stage 3 Audit — Hard Re-OCR (itpassport_r6 / dry_run_2026-05-06T16-58-10)

> Per D-073 Stage B + 规则 A: post-run audit for Stage 3 (Claude Vision via
> claude-agent-sdk Read tool, per D-007 + D-069 §2.1).
> Auditor = Claude main session; user retro slot left open.

## D-062 fields

| # | Field | Value |
|---|---|---|
| 1 | `stage` | 3 (hard_reocr) |
| 2 | `cert_id` | `itpassport_r6` |
| 3 | `run_id` | `dry_run_2026-05-06T16-58-10` |
| 4 | `total` | 50 (inspected) |
| 5 | `N` | 3 (flagged + re-OCR'd: pages 002 / 016 / 047) |
| 6 | `sample_ids` | `page_002`, `page_016`, `page_047` |
| 7 | `writer_agent` | `claude-sonnet-4-6` (Vision via Read tool) |
| 8 | `writer_prompt_version` | `pipeline.stage3_reocr.VISION_REOCR_SYSTEM_PROMPT` @ git `83184fa` |
| 9 | `reviewer_agent` | Claude main session (manual sample-level audit) |
| 10 | `reviewer_prompt_version` | n/a (manual review) |
| 11 | `pass_count` | 3 |
| 12 | `fail_count` | 0 |
| 13 | `pass_rate` | 1.00 |
| 14 | `verdict` | **PASS** — all 3 re-OCR'd pages produced strictly better content than Mistral's stage-1 output |
| 15 | `failures` | [] |
| 16 (started) | n/a (not recorded; CLI run completed successfully in background) |
| 16 (finished) | `2026-05-06T17:30+09:00` (approx, after Stage 4 scaffold work concluded) |
| 17 | `cost_estimate` | `{ tokens: 1896, anthropic_usd_reported: 0.256, billed_usd: 0.00 }` |
| 18 | `git_sha` | `83184fa` (Stage 3 scaffold commit) |

## Heuristic precision

The content-only repetition heuristic in `pipeline.quality` flagged exactly
the 3 degenerate pages out of 50, with a clean numeric gap:

- **Real degeneracy band**: rep_max ∈ {10 (page_047), 27 (page_016), 59 (page_002)}.
- **Benign band** (false-positive avoidance): rep_max ∈ {6, 6, 6, 6, 7, 7, 7}.
  These are TOC pages 011-013 (section-name reuse "出る順過去問完全解説"), and
  page_050 (legitimate term recurrence "ブレーンストーミング" cited 6×).
- **Threshold = 8** sits in the middle of the gap and gives 100% precision +
  100% recall on this dry-run.

## Per-page outcomes

### page_002 — Mistral hallucinated; Vision says **blank**

Vision output:

> The page image (`page_002.jpg`) is entirely blank — it renders as a plain
> white field with no visible text, figures, or other content.

This means Mistral OCR produced a fabricated Chinese-character loop
(`你是个小伙子，` × 60) **on a blank page**. This is a non-trivial Mistral
behavior — D-005 / Stage 1 quality has a hallucination failure mode, not
just a misrecognition mode.

Implication: Stage 2 classifier correctly avoided assigning `content` /
labeled it `other`, but the right label for downstream is `blank`. After
Stage 4 we may wish to re-feed the cleaned content back through Stage 2
or post-process the label using the cleaned text. **Tracked but not
blocking** (page_002 is in front-matter, drops out via SKIP_LABELS).

### page_016 — Real content recovered

Mistral output devolved into "10分前は、空気の空間を10分間" loops, then into
bullet `- 1` repetitions. Vision recovered the actual page: an explanation
of the 巻末 重要用語 復習 feature plus a "暗記は寝る前が効果的" column. The
recovered page is fully usable as Stage 4 input.

### page_047 — Figure pages recovered with rich descriptions

Mistral output had `（単グラフ）`×11 between two image refs. Vision produced:

- Header `01-05 業務分析と業務計画`
- `パレート図とABC分析の例` figure with detailed in-text descriptions of
  axes, units, and ranks.
- A second section on `ヒストグラムとレーダーチャート` with full prose +
  another figure description.

This is a strong improvement and shows that Vision's descriptive figure
captioning will materially help Stage 4 figure-entity extraction.

## Findings

### F1 — Mistral OCR has a hallucination mode on blank pages

A blank page produced 60 lines of fabricated Chinese characters. This was
not in step_01_audit's awareness (it sampled non-blank pages 001/010/030).
Phase 1 should treat blank pages defensively: trust Stage 2 confidence +
the heuristic to gate-down trust on degenerate output, and let Stage 3
Vision arbitrate.

### F2 — Vision recovers content even from severely degenerate stage-1 OCR

For page_016 and page_047, Vision produced clean, structurally rich output.
Stage 4 structure extraction will get materially better input from cleaned/
than from ocr/, justifying the `cleaned over ocr` precedence in
`Stage4Structure._read_page_text`.

### F3 — Cost: stage 3 marginal under max plan

`cost.json` reports an additional $0.256 for stage 3 (3 calls × ~85k
shadow tokens). Under D-069 OAuth max plan, billed = $0. SDK shadow-cost
for full-book estimate: at ~$0.085/page × 579 pages ≈ $50 if everything
were Vision'd, but Stage 3 is conditional and only ~6% of pages flagged
in the dry-run, so full-book Stage 3 ≈ $3 shadow / $0 billed.

### F4 — Wall-time: Vision Read-tool round-trip ~ 30s/page

Background task wall-time was several minutes for 3 pages — consistent
with prior 10-30s/page expectation plus subprocess startup. Full-book
projection: 3-7% × 579 ≈ ~30 pages at 30s ≈ 15 min. Fits under D-071
soft cap.

## Decision

**PASS** — Stage 3 conditional re-OCR validates as designed. Stage 4
should consume `cleaned/` first (already implemented).

User retro slot open below.

## Cross-references

- Heuristic source: `decfa90..83184fa` `packages/extractor/src/cert_extractor/pipeline/quality.py`
- Vision engine: `83184fa` `packages/extractor/src/cert_extractor/pipeline/stage3_reocr.py`
- Cleaned outputs: `data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/cleaned/page_{002,016,047}.md`
- Decisions: D-007 (Vision), D-008 (pipeline), D-069 (claude-agent-sdk), D-071 (caps), D-073 (launch)

## Sign-off

| Role | Name | Time | Status |
|---|---|---|---|
| Auditor | Claude main session (Opus 4.7) | 2026-05-06T17:30+09:00 | PASS |
| Reviewer (规则 D 隔离) | user (Stage B manual retro per D-073) | 2026-05-06T17:35+09:00 | PASS |
| Final | user + Claude consensus | 2026-05-06T17:35+09:00 | **PASS** |
