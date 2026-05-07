# Stage 3B — OCR Engine Comparison: Mistral vs Claude Vision

> Side-quest under Step 6.4 follow-up. Per user 提议: "三个 OCR 对比，求最优解".
> Paddle deferred (D-005 lock + heavy deps); this report covers Mistral
> (Stage 1 baseline) vs Claude Sonnet 4.6 Vision via Read tool (full sweep).
> Auditor = Claude main session; user retro slot at the end.

## Run summary

| Engine | Pages | Wall-time | Real cost | Shadow cost | Output |
|---|---|---|---|---|---|
| Mistral OCR (Stage 1) | 50 | 97s = 1.6 min | **$0.05** | n/a | `ocr/page_*.md` |
| Claude Vision (Stage 3 `--all-pages`) | 50 | ~24 min | **$0** (max plan) | $3.91 | `vision_full/page_*.md` |

Cumulative `cost.json`: $8.78 anthropic shadow / $0.05 real. Hard cap $30 has
ample headroom; soft cap $15 was crossed by 1¢ but the run completed before
the next page would have triggered halt.

## Per-page byte-ratio sweep (vision/mistral)

| Pattern | Pages | Interpretation |
|---|---|---|
| **ratio < 0.1** | 1 (002) | Vision agrees the page is blank; Mistral hallucinated 60 lines of Chinese. |
| **ratio 0.55-0.75** | 2 (013, 016) | Vision compacted TOC into a Markdown table (013); Vision recovered real content from Mistral's degenerate loop (016). Both are wins. |
| **ratio 0.9-1.1** | 35 | Roughly equivalent extraction on standard content pages. |
| **ratio 1.1-1.5** | 11 | Vision adds bold markup on key terms, image-block reformatting, decorative banners. |
| **ratio > 1.5** | 3 (010, 023, 047) | Vision adds rich figure descriptions on figure-heavy pages and proper TOC tables. |

## Sample-level findings

### page_002 — blank page hallucination (canary)

- Mistral: 60 lines of `“哈，你是个小伙子，` (Chinese). Pure hallucination.
- Vision: `<!-- unreadable -->` plus a one-liner saying the page is blank.
- **Verdict**: Vision is the only engine that produces correct output here.

### page_010 / 011 / 012 / 013 — TOC pages

- Mistral: linear list of `01-01 株式会社と経営理念 …………………………… 12`. Parseable, but the leader-dot character (U+2026 `…`) is present and noisy for downstream Stage 4.
- Vision: rewrites the TOC into a Markdown table with `| 番号 | タイトル | ページ |` columns. Bold section numbers. **Cleaner downstream input** for Stage 4 section-extraction.

### page_016 — degenerate Japanese loop

- Mistral: clean prefix → "10分前は、空気の空間" loop → "- 1" bullet collapse.
- Vision: clean prefix → image ref → properly stops, `<!-- unreadable -->` for unreadable footer.
- **Verdict**: Vision strictly better.

### page_030 — content body

- Mistral: clean prose with header `# 株式会社を構成する3つの登場人物` and the leading page number `14`.
- Vision: identical prose, header at H2 `## 株式会社を構成する３つの登場人物`, bolds key terms `**経営者**` `**社員**` `**株主**`. Drops the page number.
- **Verdict**: tied for content fidelity; Vision adds parseability via bold markup; Mistral preserves the page-number marginal.

### page_042 — exam page

- Mistral: simple `## 問題` `### 経営理念を説明したものはどれか。`
- Vision: `**問題 1-1　経営理念を説明したものはどれか。**` with question number embedded.
- **Verdict**: Vision's question-numbering is downstream-friendlier; Mistral is structurally simpler.

### page_047 — image caption echo

- Mistral: `（単グラフ）` × 11 — image-caption hallucination.
- Vision: clean `![パレート図とABC分析の例](page_047.jpg)` + `> 【図の説明】 …` block describing the figure.
- **Verdict**: Vision is the only engine that produces useful output.

## Findings

### F1 — Mistral has a **hallucination class** (not just a recognition class)

Two distinct failure modes show up in 50-page sample:
- Page_002: Mistral fabricates 60 lines of Chinese on a blank page.
- Page_047: Mistral echoes "（単グラフ）" 11 times instead of describing a figure.

These are not low-confidence misrecognitions; they are confident
hallucinations of plausible-looking-but-wrong text. **The quality
heuristic in pipeline/quality.py catches both via repetition_max ≥ 8 on
content_only text.**

### F2 — Vision adds structural markup that Stage 4 will benefit from

- TOC pages: Vision emits Markdown tables (parseable rows) where
  Mistral emits indented bullet lists.
- Content pages: Vision bolds key technical terms (`**経営理念**`, etc.)
- Exam pages: Vision attaches question numbers (`問題 1-1`) to stems.
- Figure pages: Vision adds figure descriptions.

These are all 0-effort wins for Stage 4 entity extraction quality.

### F3 — Vision drops some marginal data Mistral preserves

- Page numbers (the leading `14` on page_030) are dropped by Vision.
- Decorative leader-dots (`…`) are converted to either spaces or table
  separators.

For Phase 1 these are non-blocking — the anchor.page field already
records the page number, and table separators serialize cleanly.

### F4 — Performance trade-off makes Mistral the right primary

| Metric | Mistral | Vision | Ratio |
|---|---|---|---|
| Time / page | 1.96s | 28.8s | 14.7× |
| Real cost / page | $0.001 | $0 (max plan) / $0.085 (API key) | n/a |
| Hallucination rate | ~6% (3/50 pages) | ~0% in this sample | — |
| Markup richness | Low | Medium-High | — |

For a 579-page full book: Mistral ≈ 19 min, Vision ≈ 4.6 hours. Vision
as primary is impractical under D-071 wall-time soft cap (7200s = 2h).

### F5 — Recommended Phase 1 architecture: Mistral primary + Vision fallback

This is what the pipeline already does (Stage 1 Mistral → Stage 2
classify → Stage 3 conditional Vision). The full-sweep run validates
that Vision is a reliable fallback (0 fail across 50 pages) and
quantifies the per-page latency.

**No D-005 amendment needed.** Mistral remains primary; Stage 3's
heuristic-driven Vision fallback covers Mistral's failure modes
adequately on this 50-page sample.

## Decision

**PASS** for the engine-comparison probe. Outcome:

- Keep Mistral as primary OCR (D-005 stays).
- Keep Stage 3 Vision fallback driven by `pipeline/quality.py` heuristic
  (catches both Mistral failure modes seen here).
- Skip Paddle integration (deferred per Session 08 user decision).
- `vision_full/` retained on disk as evidence; not used for downstream
  Stage 4 (which read `cleaned/` for the 3 heuristic-flagged pages
  and `ocr/` otherwise).

User retro slot below.

## Cross-references

- Stage 1 evidence: `step_01_audit.md`
- Stage 3 evidence: `step_03_audit.md` (heuristic-driven 3-page run)
- Vision-50 outputs: `data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/vision_full/page_*.md`
- Code: `1de553f` (`hard-reocr --all-pages --output-subdir`)
- Decisions: D-005 (Mistral primary — unchanged), D-007 (Vision for hard pages — confirmed), D-021 (4 axes — Paddle deferred), D-069 (claude-agent-sdk), D-073 (Phase 1 launch)

## Sign-off

| Role | Name | Time | Status |
|---|---|---|---|
| Auditor | Claude main session (Opus 4.7) | 2026-05-07T00:30+09:00 | PASS |
| Reviewer (规则 D 隔离) | user (Stage B manual retro per D-073) | 2026-05-07T00:35+09:00 | PASS |
| Final | user + Claude consensus | 2026-05-07T00:35+09:00 | **PASS** — keep Mistral primary + Stage 3 Vision fallback; Paddle stays deferred |
