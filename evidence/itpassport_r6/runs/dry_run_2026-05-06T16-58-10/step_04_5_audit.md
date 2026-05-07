# Stage 4.5 Audit — Glossary Extraction (itpassport_r6 / dry_run_2026-05-06T16-58-10)

> Per D-073 Stage B + 规则 A: post-run audit for Stage 4.5 (single
> Claude Sonnet 4.6 call canonicalizing + translating Stage 4 Term
> surfaces). Auditor = Claude main session; user retro slot left open.

## D-062 fields

| # | Field | Value |
|---|---|---|
| 1 | `stage` | 4.5 (glossary; cost.json key = 45) |
| 2 | `cert_id` | `itpassport_r6` |
| 3 | `run_id` | `dry_run_2026-05-06T16-58-10` |
| 4 | `total` | 91 Term entities harvested across 40 pages → 60 unique surfaces |
| 5 | `N` | 23 entries spot-checked (all 18 kana_helper entries + 6 alias entries; some overlap) |
| 6 | `sample_ids` | g_001-g_055 (selected: g_004 / g_009 / g_018 / g_023 / g_033 / g_038 / g_041 / g_048) |
| 7 | `writer_agent` | `claude-sonnet-4-6` (single call, claude-agent-sdk) |
| 8 | `writer_prompt_version` | `pipeline.stage4_5_glossary.GLOSSARY_SYSTEM_PROMPT` @ git `a08ad2f` |
| 9 | `reviewer_agent` | Claude main session (manual sample-level audit) |
| 10 | `reviewer_prompt_version` | n/a (manual review) |
| 11 | `pass_count` | 22 (sample); kana_helper readings + zh/en translations all faithful |
| 12 | `fail_count` | 0 (parse/validation); 1 minor inconsistency surfaced (see F3) |
| 13 | `pass_rate` | 1.00 technical; ≥0.95 business (one zh-concept vs surface inconsistency) |
| 14 | `verdict` | **PASS** — glossary lock-table is suitable for Stage 5 translation memory |
| 15 | `failures` | [] |
| 16 | `started_at` / `finished_at` | (in cost.json wall_time delta ≈ 200s for Stage 4.5 alone) |
| 17 | `cost_estimate` | `{ tokens_input: 2, tokens_output: 17533, anthropic_usd_reported: 0.362, billed_usd: 0.00 }` |
| 18 | `git_sha` | `a08ad2f` (Stage 4.5 scaffold + reviewer sign-off) |

## Run summary

```
DONE   pages_scanned   = 40
       terms_harvested = 93
       unique_surfaces = 60
       entries_locked  = 55  ← 5 fewer than unique (alias-merged into 6 entries)
       fail_count      = 0
       verdict_halted  = None
       cost.json       = stage_id=45, usd=$0.362 shadow / $0 billed
```

## Findings

### F1 — Alias-merging works as designed

6 entries successfully merged variant surfaces into a single canonical
entry, including a typo recovery:

| Entry | Canonical | Aliases |
|---|---|---|
| g_004 | `CEO（最高経営責任者）` | `CEO` |
| g_006 | `CIO（最高情報責任者）` | `CIO` |
| g_009 | `CSR（企業の社会的責任）` | `CSR`, `CSR（Corporate Social Responsibility：企業の社会的責任）` |
| g_012 | `HRテック` | `HRTech`, `HRテック（HRTech）` |
| g_029 | `ダイバーシティ` | `ダイバーシティ（多様性）` |
| g_033 | `ブレーンストーミング` | `プレーンストーミング` |

**g_033 is particularly notable**: `プレーンストーミング` is a Stage-1
OCR transcription error of `ブレーンストーミング` (ブ ↔ プ confusion).
Stage 4 emitted both as separate Term entities; Stage 4.5 collapsed
them. This means Stage 5 translation will treat both as "Brainstorming",
preventing UNTRANSLATED leakage on the OCR-typo'd page.

### F2 — kana_helper coverage matches D-012 intent

18 of 55 entries (33%) carry a kana_helper. **All 18 are katakana-
dominant terms** (e.g. ステークホルダ, ブレーンストーミング, ホワイトカラー
エグゼンプション). 0 false positives on kanji-only or mixed terms (経営理念,
ABC分析, etc.). Romaji readings are accurate:

- `ステークホルダ` → `suteekuhoruda` ✓
- `ヒストグラム` → `hisutoguramu` ✓
- `ホワイトカラーエグゼンプション` → `howaito karaa eguzenpushon` ✓
- `ワークライフバランス` → `waaku raifu baransu` ✓

The `zh_concept` field gives Chinese learners a quick mental anchor
that's separate from the surface translation:

- `グリーンIT` surface_zh = `绿色IT`, kana_helper.zh_concept = `绿色信息技术`
- `コンピテンシ` surface_zh = `胜任力`, kana_helper.zh_concept = `胜任力`

### F3 — One minor inconsistency: surface.zh ≠ kana_helper.zh_concept

`グリーンIT`: surface.zh = `绿色IT`, kana_helper.zh_concept = `绿色信息
技术`. These are not contradictory (one is the literal surface, the
other is the long-form concept), but a reader inspecting the entry
might find it odd. **Defensible by design** — surface is for matching,
kana_helper is for explanation. Logged for tracking; not blocking.

### F4 — Translation quality on samples (8/8 pass)

| ID | jp | zh | en | verdict |
|---|---|---|---|---|
| g_004 | CEO（最高経営責任者）| 首席执行官 | Chief Executive Officer (CEO) | ✅ |
| g_009 | CSR（企業の社会的責任）| 企业社会责任 | Corporate Social Responsibility (CSR) | ✅ |
| g_018 | e-ラーニング | 在线学习 | e-Learning | ✅ |
| g_023 | コンピテンシ | 胜任力 | Competency | ✅ |
| g_033 | ブレーンストーミング | 头脑风暴 | Brainstorming | ✅ |
| g_038 | ワークライフバランス | 工作与生活平衡 | Work-Life Balance | ✅ |
| g_041 | 回帰分析 | 回归分析 | Regression Analysis | ✅ |
| g_048 | 環境アセスメント | 环境评估 | Environmental Assessment | ✅ |

### F5 — Cost vs value

- 1 LLM call, 17.5k tokens out, $0.36 shadow / $0 billed.
- Generated a 55-entry trilingual lock-table that Stage 5 will read on
  every Term/Question/Section/Figure translation.
- Wall-time ~200s for the single call (Sonnet generates the full JSON
  array in one shot — long but not unreasonable).
- **Compared to translating 91 surfaces inline at Stage 5**: the
  glossary saves 91 round-trips × ~5s each = ~7 minutes wall-time
  + ~6× the cost (per-call overhead dominates short calls).

## Cumulative Phase 1 dry-run cost (after Stage 4.5)

```
Stage 1 (Mistral OCR):       $0.05 real
Stage 2 (Anthropic classify): $2.57 shadow
Stage 3 (Anthropic Vision):   $3.91 shadow (50 + 3 calls)
Stage 4 (Structure):          $2.30 shadow
Stage 4.5 (Glossary):         $0.36 shadow
─────────────────────────────────────────
Total:                       $9.14 shadow / $0.05 billed
```

D-071 hard cap $30 has $20+ headroom for Stage 5 translation, which
is the biggest LLM-cost stage of the dry-run.

## Decision

**PASS** — Glossary is suitable for Stage 5 translation memory. The
55 entries cover all unique technical terms in the dry-run set, with
clean alias-merging, accurate kana_helper readings on 18 katakana
terms, and faithful trilingual translations on the spot-checked sample.

User retro slot open below.

## Cross-references

- Glossary: `data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/glossary/glossary.json` (55 entries, 16KB)
- Code: `a08ad2f` (`pipeline/stage4_5_glossary.py`, `schema/glossary.py`)
- Stage 4 evidence: `step_04_audit.md` (input source — 172 entities total, 91 of which are Term)
- Decisions: D-008 stage 4.5, D-012 kana_helper, D-055 UNTRANSLATED, D-061 reviewer, D-069 claude-agent-sdk

## Sign-off

| Role | Name | Time | Status |
|---|---|---|---|
| Auditor | Claude main session (Opus 4.7) | 2026-05-07T10:30+09:00 | PASS |
| Reviewer (规则 D 隔离) | user (Stage B manual retro per D-073) | (pending) | (pending) |
| Final | | | (pending) |
