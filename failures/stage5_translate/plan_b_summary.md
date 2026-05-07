# Plan-B Stage 5 retry summary (Session 09b, 2026-05-07)

> Per 规则 B + D-032: aggregate failure-archive for the 3 Plan-B Stage 5
> retry attempts. Each attempt's partial outputs are preserved at
> `failures/stage5_translate/plan_b_attempt_NNN/page_*.partial.json`.
> The full execution narrative + per-step verdict lives in
> `evidence/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/step_05_audit.md`
> Plan-B section.

## Context

Plan-B re-ran Stage 5 from scratch after user retro caught Stage 5's
`_glossary_lookup` jp-mutation bug (D-075) + the patched glossary
(G1 set per user worksheet A.4.3). Same configuration as Session 09
attempt 006 (opus + chunk=8 + D-074 prompt) but on **regenerated**
structured/ inputs and **patched** glossary lock-table.

The 3 attempts here are NOT the same as the 5 attempts archived under
`failures/stage5_translate/stage5-2026-05-07-001..005.md` — those were
Session 09's iterative debugging that culminated in D-074. These 3 are
post-D-074 retries during Plan-B.

## Attempts ledger

| Attempt | Config | Result | Pages re-processed | Where archived |
|---|---|---|---|---|
| Plan-B attempt 001 | opus chunk=8, D-074 prompt + D-075 fix + patched glossary, all 40 pages | 31 untrans across 5 pages (page_030/033/038/044/050) | 40 | `plan_b_attempt_001/page_{030,033,038,044,050}.partial.json` |
| Plan-B attempt 002 | opus chunk=1 on the 5 affected pages | 3 untrans (page_030 ×1, page_038 ×2) | 5 | `plan_b_attempt_002/page_{030,038}.partial.json` |
| Plan-B attempt 003 | opus chunk=1 on the 2 remaining affected pages | 2 untrans (page_030 ×1, page_038 ×1) | 2 | (live state at time of hand-write fallback) |
| Hand-write fallback | claude-authored translations for the 2 stuck wrapper-definitions per user (A)→(B) plan | **0 untrans final** | 2 leaves edited in place | doc'd in `step_05_audit.md` Plan-B "Hand-translation evidence" + Sign-off |

## Why retries even with D-074 in place

The D-074 prompt clause (added in Session 09) said "always translate
the wrapper". It successfully fixed Session 09's stuck leaves on
page_038 (`職能別組織` definition wrapper). On Plan-B re-run with the
patched glossary, the SAME pattern recurred but **worse** at chunk=8
(31 fail vs the 11 fail originally on chunk=8 pre-D-074):

- The patched glossary entries are **longer** on average (e.g. COP21's
  zh went from `第21届联合国气候变化大会` to
  `《联合国气候变化框架公约》第21次缔约方会议（COP21）`).
- The system prompt embeds the glossary as JSON for every Stage 5
  call. Larger glossary content = denser context = more refusal noise
  on wrapper-definition inputs.

This validates user worksheet §D.4: "system prompt size correlates
with refusal" — filed as Phase-2 prompt-architecture exploration.

## Why hand-write was the right call

Two leaves remained stuck after **3** opus chunk=1 attempts (deterministic
refusal pattern). Continuing to retry would burn quota with diminishing
returns. User's pre-authorized (A)→(B) plan in the worksheet
"prompt-tune retry, then hand-write" justified the fallback.

The 2 hand-translations are recorded in:
- `evidence/.../step_05_audit.md` Plan-B section + Sign-off table
  (claude-drafted, user retro signoff slot kept open)
- The translated JSON files themselves (`page_030.json` ent[4]
  `definition` / `page_038.json` ent[2] `definition`)

## Cross-references

- `docs/decisions/D-075-stage5-jp-preservation.md`
- `docs/decisions/D-076-stage4-answer-line-parsing.md`
- `evidence/.../step_05_audit.md` (Plan-B section + Sign-off)
- `docs/discussion/2026-05-07-stage5-user-retro-worksheet.md` (user retro
  worksheet that triggered Plan-B)
- `docs/discussion/2026-05-07-session-09.md` §7 (Plan-B narrative)
- Pre-D-074 failures: `stage5-2026-05-07-001..005.md` (Session 09 saga)

## Sign-off

| Field | Value |
|---|---|
| Archive time | 2026-05-07T18:30+09:00 |
| Archived by | Claude main session (Opus 4.7 1M ctx) |
| Triggered new D | yes — D-075 + D-076 |
| RETROSPECTIVE.md inclusion | TBD (Step 6.12 Phase 1 retro) — this archive will inform §2 缺口 + §3 关键决策复盘 |
