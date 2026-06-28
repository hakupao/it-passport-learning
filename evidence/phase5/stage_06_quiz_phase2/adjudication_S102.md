# Phase 2 SCALE — Session 102 adjudication (D-137 / D-140)

Batch: **2026r08 / 2024r06 / 2023r05** (latest-first 3, after pilot 2025r07). Writer `general-purpose`
≠ in-pipeline reviewer `feature-dev:code-reviewer` ≠ Rule A critic `pr-review-toolkit:code-reviewer`
≠ 主 context 裁決 (Rule D/A). Drift-proof stem fixes via `quiz-phase2-stemfix-S102.mjs`
(assert exactly-once → raw bank → build-quiz-corpus regenerate).

> **Environment note (S102)**: the `oh-my-claudecode:*` agent types prior sessions used
> (`code-reviewer`, `critic`) are NOT registered in this session. The generate + ruleA
> workflows were remapped to `feature-dev:code-reviewer` (in-pipeline reviewer) and
> `pr-review-toolkit:code-reviewer` (Rule A critic) — three distinct subagent_types preserving
> Rule D/A separation. The first generate run failed fast on the missing agent type (gen ran,
> review threw); resumed via `resumeFromRunId` after the remap (cached gen reused).

---

## 2026r08 — ✅ COMPLETE (committed checkpoint)

- generate (resume `wf_05394eed-82a`): **100/100 · jp PASS 100 · tr PASS 95 / CONCERNS 5 · suspect 1**.
- **Persist** (new self-persist phase): `generate_result_2026r08.json` written by the workflow
  (S100's manual step is now turnkey). `quiz-phase2-verify-result.mjs` = 100/100 well-formed.
- merge: explained 100/100, missing 0, **suspect 1 (q058), stem-corruption 1 (q001)**.

### q001 — stem corruption (cosmetic, FIXED drift-proof)
- DISPLAYED JP = raw `stem_jp` (no `stem_jp_clean` for this q; 46/100 of 2026r08 lack a clean stem).
- Garbled: "…必要となる可能性のあるもの**はどれか。**全て挙げたものはどれか。" (doubled どれか).
- **Source page-02 (read at high mag, q052 protocol)**: official = "…必要となる可能性のあるもの**だけを，**全て挙げたものはどれか。" (standard IPA 'select-all' phrasing). OCR dropped 「だけを，」 + inserted spurious 「どれか。」.
- Fix: `quiz-phase2-stemfix-S102.mjs` → `可能性のあるものはどれか。全て挙げたものはどれか。` → `可能性のあるものだけを，全て挙げたものはどれか。`. **questions.json diff = 1 line, correct_answer ア unchanged, quiz_index/translations untouched. zh/en already clean** (Phase 1 translator saw through the garble).
- **Independently confirmed by Rule A**: the q001 critic audited the CORRECTED stem and found it grammatically clean (its note references the pre-fix form) → fix landed correctly.

### q058 — suspect (benign, NO action)
- `figure_derivable=false` concept question (no figure), `derived_answer=ア = key`, `matches_key=true`, `stem_corruption_suspected=false`. The suspect flag is only the conservative `figure_derivable=false` rule firing on a no-figure Q. Rule A critic agreed: over-conservative flag, `key_guard_valid=true` (no figure-miss). Ships a mild "key-guard couldn't confirm" caveat (pilot parity; benign).

### Rule A (N=24: all 13 figures + 1 suspect + 10 plain) — `wf_568d1824-9df`
- **accurate 24/24 · severity none 18 / low 6 · medium 0 / high 0 · key_guard_valid all true · every independent_answer = keyed answer (bad key 0).**
- 6 low = zh-terminology polish (课题→任务 / 宽→广 / 差分备份→差异备份 / 上位→上一级), one distractor example-calc rounding nuance (q044, hedged 約/など), and the q058 benign-over-flag note. **None affect correctness/answer.**
- Detail: `ruleA_result_S102_2026r08.json`.

### Verification (GREEN, post-fix)
- tsc 0 err · eslint 0 err (pre-existing tTerm warning 1) · vitest **463 passed / 2 skipped** · next build exit 0 (27 routes) · **nft IPA-leak 0** (quiz routes trace `data/ip/quiz` only).

---

## 2024r06 — ⏸ PARTIAL (resume needed after session/daily limit reset 3am JST)
- generate (`wf_c0923724-9df`): **jp PASS 100** (gen + JP review complete), but **session limit hit
  3am JST** mid-translate → tr `null 87 / translate_failed 13`, **persist failed**.
- On disk (gitignored `.phase2/`): expl_jp 100, expl_tr 92, generate_result MISSING.
- **suspect (round-1 harvested)**: q097 (OSS license concept Q, figure_derivable=false, derived=key=イ → benign).
- **Resume plan**: `Workflow({scriptPath: quiz-phase2-generate.workflow.mjs, resumeFromRunId: "wf_c0923724-9df"})` after the limit resets — cached 100 gen + JP review reused, re-runs the 8 failed translates + tr-review + persist. Then verify-result → merge → adjudicate → Rule A.

## 2023r05 — ⏳ PENDING (input prepped: 100 q, 14 figures)

---

## Pipeline hardening (S102, turnkey for the remaining 28-exam scale)
- **Self-persist**: generate workflow now writes `generate_result_<exam>.json` itself (compact:
  full key_guard for flagged, trimmed note_jp='' for clean) — closes S100's manual gap.
- **Deterministic post-check**: `quiz-phase2-verify-result.mjs` validates the persisted result
  (count, well-formed final+round1 key_guard, in-exam ids, expl files present) before merge.
- **Compact launch spec**: generate accepts `{exam_id, count, figure_nums}`; ruleA accepts
  `{exam_id, qnums, figure_nums}` — transcription-safe (verified ids are contiguous q001..q100).
- **Token-cost finding**: Phase 2 generate ≈ 16M tok/exam; 3 exams (~50M) exceeds the daily limit.
  Completed 1 full + 1 partial before the cap → recommend **1–2 exams/session** for Phase 2 scale.
