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

## 2024r06 — ✅ COMPLETE
- generate first hit a **session-limit spike (3am JST)** mid-translate (jp PASS 100 done, persist failed).
  A `resumeFromRunId: wf_c0923724-9df` after the limit recovered finished it: **100/100, jp PASS 100,
  tr PASS 95 / CONCERNS 5** (only the failed translates/tr-reviews/persist re-ran; cached gen reused).
- verify-result 100/100 → merge: explained 100/100, missing 0, **suspect 1 (q097), stem-corruption 0** (no fix needed).
- q097 = benign suspect (figure_derivable=false OSS concept Q, derived=key=イ).
- **Rule A (N=24: all 14 figures + suspect + 9 plain, `wf_abe0c13e-ba5`): accurate 24/24 · none 18 / low 6 · 0 med/high · key_guard_valid all true · bad key 0.** low 6 = zh-terminology polish (定型业务→常规, 采购周期→提前期, PERT 结合点→节点, cluster 团簇→簇, 漏数→漏数了) + one hedged distractor-explanation nuance (q057). Detail: `ruleA_result_S102_2024r06.json`.

## 2023r05 — ✅ COMPLETE (4 OCR fixes + 1 FP)
- generate (full run `wf_ab7480bd-696`, limit held): **100/100, jp PASS 100, tr PASS 92 / CONCERNS 8**.
- verify-result 100/100 → merge: explained 100/100, missing 0, suspect 1 (q056), stem-corruption 5 flagged.
- **4 real OCR corruptions fixed drift-proof** (all source-read at high mag, q052 protocol):
  - **q004** (stem number, *answer-consistency*): 利用料 **306→300**万円/年. Source page-03 = 300 (only 300 makes a listed choice consistent: X>1000→イ). Displayed via `stem_jp_clean`; the Phase 1 translator carried 306 into zh/en too → fixed in `stem_jp_clean` + `stem.zh` + `stem.en` (`quiz-phase2-trfix-S102.mjs`). key イ unchanged.
  - **q021** (choices ア): "もっていれば**ぱば**"→"もっていれば" (source page-10). key ウ unchanged, zh clean.
  - **q023** (stem number): ISO/IEC **19519→19510** (source page-10 = 19510, BPMN's real standard). No `stem_jp_clean` → raw `stem_jp` fixed; zh/en carried 19519 → fixed in sidecar. key イ unchanged.
  - **q056** (choices イ, *answer-affecting*): corrupted "…実施，実施…認証するものを認証する組織はない。" → source page-25 "…適切に実施されていることを認証するものである。" key イ unchanged, zh/en clean.
- **q075 = FALSE POSITIVE** (no fix to displayed text): the generator (single vision pass) misread source condition (1) as "128点以上"; **主 context high-mag crop (page-35, sharp 3×) + Rule A critic 8× zoom both confirm the source is "120点以上"** (round 0). The clean stem + 4 choices are all 120 and internally consistent; answer ウ is threshold-independent. The only blemish was the internal `key_guard.note_jp` falsely claiming 128 (a false-alarm `stem_corruption_suspected`) — never UI-rendered, q075 `suspect=false`. **Resolved**: patched `generate_result` q075 key_guard (stem_corruption_suspected→false, note→corrected) + re-merge. Lesson reconfirmed (S98/S99): single vision pass misreads low-res digits; high-mag source-read is load-bearing.
- Fix layers: `quiz-phase2-stemfix-S102.mjs` (raw bank: q023 stem + q021/q056 choices) + `quiz-phase2-trfix-S102.mjs` (translation sidecar: q004 + q023 numbers). **questions.json diff = 3 lines (q021/q023/q056), correct_answer 0 changes, quiz_index unchanged. translations/2023r05.json diff = 5 fields (q004×3 + q023×2).**
- **Rule A (N=24: all 14 figures + suspect q056 + 9 plain incl. fixed q021/q056, `wf_ac09e74e-fd7`): accurate 23/24 · none 16 / low 7 · medium 1 (=q075 FP, now resolved) · bad key 0.** critic independently confirmed q021/q056 choices are now clean. 7 low = zh polish + stale key_guard notes on now-fixed q021/q056 + minor explanation-prose nuances (q013/q037/q059). Detail: `ruleA_result_S102_2023r05.json`.

## Verification (GREEN, whole batch)
- tsc 0 err · eslint 0 err (pre-existing tTerm warning 1) · vitest **463 passed / 2 skipped** · next build exit 0 (27 routes) · **nft IPA-leak 0** (quiz routes trace `data/ip/quiz` only).

## Cross-batch notes
- **Benign suspect over-flag** (ships a conservative "key-guard couldn't confirm" caveat on confidently-derived no-figure concept Qs): q058 (2026r08), q097 (2024r06), q056 (2023r05). Key is correct in all. Optional scale refinement (per S100): narrow merge suspect to `figure_derivable=false && has_figure=true`. Left as-is for pilot parity — **user decision**.
- **zh-terminology polish backlog** (low, no correctness impact, Phase 1 terms established): 课题→任务 / 宽→广 / 差分备份→差异备份 / 上位→上一级 / 定型业务→常规 / 采购周期→提前期 / 团簇→簇 / 导入→部署 / 排他控制→并发控制. Not fixed per-explanation this batch.

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
