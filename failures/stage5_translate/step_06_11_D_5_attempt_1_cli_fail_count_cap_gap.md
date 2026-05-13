# Failure: `stage5_translate` / `step_06_11_D_5_attempt_1_cli_fail_count_cap_gap`

> Per 规则 B + D-032: Step 6.11.D.5 attempt 1 (Stage 5 trilingual
> translation full-book dispatch) halted after 7 pages / 1 LLM call /
> 2 fields translated. Root cause = `translate-entities` CLI gap:
> missing `--fail-count-hard` / `--wall-time-hard` overrides that the
> other LLM-driven stages already had. Cumulative `fail_count = 50`
> (carried over from D.2 / D.3 / D.4 retries + Mistral OCR transients
> + Stage 4 force-OCR violations) exceeded the default D-071 hard cap
> of 30 on the very first `_budget_check` after the first translation
> call, returning `Verdict.FAIL` and breaking out of the page loop.
>
> Distinct from Session 17 §5 (D.4 cap-misframe): that one was a
> purely operational label artifact on a successful run; this one is a
> real halt that prevented the run from progressing without a CLI
> patch.

## 元数据 / Metadata

| 字段 | 值 |
|---|---|
| `attempt_id` | `step_06_11_D_5_attempt_1_cli_fail_count_cap_gap` |
| `stage` | `stage5_translate` |
| `timestamp` | 2026-05-13T~13:30+09:00 (Session 18 mid-flight) |
| `triggered_by` | Step 6.11.D.5 first dispatch following D.4 close |
| `git_sha` | `a44e8d2` (Session 17 close) at attempt time; CLI patch staged uncommitted afterward |
| `model_or_tool` | `claude-opus-4-7` via `claude-agent-sdk` (max-plan OAuth, D-069) |
| `cost_jpy_or_cny` | $0.41 shadow / $0 billed (1 opus call); Mistral N/A |
| `elapsed_minutes` | <1 (instant halt on first budget check post-call) |

## 输入 / Input

```
uv run --project packages/extractor python -m cert_extractor.cli translate-entities \
    --structured-dir data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/structured \
    --glossary-path data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/glossary/glossary.json \
    --cert-id itpassport_r6 \
    --tier opus \
    --max-items-per-call 8 \
    --anthropic-soft-usd 350 \
    --anthropic-hard-usd 500 \
    --skip-existing \
    --confirm
```

- 554 stage-4 structured pages on disk.
- 908 glossary entries loaded.
- Cumulative pre-run state: `anthropic_usd = $238.18`, `fail_count = 50`.
- Operator-set caps: anthropic soft $350, hard $500. **No fail_count
  override possible** — flag did not exist on `translate-entities`.

## 产物 / Product

CLI summary:
```
[translate-entities] DONE   pages_processed   = 7
                          pages_skipped     = 0
                          fields_translated = 2
                          glossary_hits     = 0
                          llm_calls         = 1
                          fail_count        = 0  (this-run failures only)
                          verdict_halted    = Verdict.FAIL
```

`cost.json` after attempt:
- `current.fail_count` = 50 (unchanged from pre-run cumulative)
- `by_stage["5"]` = `{tokens: 116, usd: 0.41492925, calls: 1}`
- `current.anthropic_usd` = $238.59

`translated/` written: 7 page files (page_007/008/009/014/015/017/018).
6 of them are content-empty stage-4 pages (no untranslated leaves)
that bypass the LLM entirely; 1 is page_014 with the actual call (2
fields).

## 技术判定 / Technical Verdict

**FAIL (CLI gap)** — runner correctly enforced D-071 hard cap. The
defect is the missing operator escape-hatch on `translate-entities`,
not a logic regression.

## 业务判定 / Business Verdict

**FAIL** — Cannot proceed to Gate ④ without a code-level fix to expose
the cap override.

## 失败模式分类 / Failure Mode

- [x] `cli-gap` — `translate-entities` is the only LLM-driven stage
  that lacked `--fail-count-soft/hard` and `--wall-time-soft/hard`
  flags. Pattern was already present on `classify-pages` /
  `hard-reocr` / `extract-structure` / `extract-glossary`; this
  command was missed during D-079 B.x scaffolding.
- [ ] `model-bug` — N/A.
- [ ] `prompt-issue` — N/A (the 1 LLM call returned successfully and
  produced clean output for page_014's 2 fields).
- [x] `cumulative-counter-semantics` — `fail_count` is run-cumulative
  across stages, not per-stage. After 5 prior stages contributed
  retries + transients, the counter is monotonically large by the
  time Stage 5 starts. Same root-cause class as Session 17 §5 cap-
  misframe (cost axis), now manifesting on the fail_count axis.

## 下一 attempt 输入

1. **Patch**: add `--fail-count-soft / --fail-count-hard /
   --wall-time-soft / --wall-time-hard` to `translate-entities` (mirror
   `classify-pages` lines 226-247 + `_build_monitor` plumbing). Done
   in same session.
2. **Regression test**:
   `tests/unit/test_cli_translate_entities_caps.py` asserts the 6 cap
   flags appear in `--help`. Suite 476 → 477 ✅.
3. **Re-fire** with bumped knobs:
   - `--fail-count-hard 200` (cushion above current cumulative 50;
     allows ~150 new transients before hard halt)
   - `--wall-time-hard 86400` (24h cushion above cumulative wall
     12 797s ≈ 3h33m; covers expected 1-3h Stage 5 wall + headroom)
   - Same anthropic caps ($350 soft / $500 hard).
   - `--skip-existing` keeps the 7 already-written pages (idempotent
     resume).

## 链接

- 上一次 (D.4 same-class label artifact, no archive): Session 17 §5
- patch site: `packages/extractor/src/cert_extractor/cli.py`
  `translate-entities` block
- regression test:
  `packages/extractor/tests/unit/test_cli_translate_entities_caps.py`
- 下一次: this same session, post-patch re-fire (in-progress)

## 签字

| 字段 | 值 |
|---|---|
| 归档时间 | 2026-05-13T~13:35+09:00 |
| 归档人 | Claude main session (Opus 4.7 1M ctx) |
| 是否触发新 D | no — CLI gap fix is mechanical mirror of existing pattern; no design decision changed. Tracked as Phase 1 v2 follow-up: "audit all LLM-driven CLI commands have full D-071 cap-override surface; document `fail_count` as run-cumulative semantics in D-071 ADR addendum if not already explicit". |
