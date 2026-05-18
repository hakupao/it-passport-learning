# deep_validation_2026-05-17

The first (and so far only) post-publication validation event. Triggered 2026-05-17 by user `/oh-my-claudecode:ultragoal` directive:

> "请你从专业 IT 从事者+教育者+读者三重属性, 帮我 validate 一下 phase1 的产物, 三种语言都要, 如果发现错误就请你溯源找到源头错误并改正. 记住, 请逐字逐句的阅读. 请进行多轮阅读迭代, 直到没有找出来错误."

…followed 2026-05-18 by clarification escalating from sampling to full corpus:

> "我希望是全量的, 逐字逐句的检测, 而不是抽查, 请派发多个 agent 同步进行."

---

## Iter status table

| Iter | Scope | Approach | Outcome | Convergence report |
|---|---|---|---|---|
| **initial** (V1/V2/V3) | 3 dimensional tracks | 100 page sample / 300 leaf sample / 200 entity sample | OVERALL=WARN; 0 leaks in `output/`; 4 OCR FAIL pages | `initial_validation/VALIDATION_REPORT.md` |
| **iter_2** | transitional | early R2/R4/R6 round prototypes | superseded by iter_3 systematic chain | (no convergence report; lives in `initial_validation/iter_2/`) |
| **iter_3** | 115 fresh pages (R9–R14) | dual-track | 535 release-impacting corrections | commit `5c559ba` (no standalone report — see commit body) |
| **iter_4** | 40 fresh pages (R15+R17) | 6 parallel agents (3 Sonnet OCR + 3 Opus translation) | 2 release-impacting (F-iter4) | `iter_4/ITER4_CONVERGENCE_REPORT.md` |
| **iter_5** | 30 fresh pages (R18) | 9 parallel `code-reviewer` (3 perspective × 3 lang) → `analyst` triage | F1–F8 (48 JSON + 6 MD) | `iter_5/ITER5_CONVERGENCE_REPORT.md` |
| **iter_6** | 10 brand-new pages (R20-FRESH) → R21 corrective | 2 `verifier` blind → 2 `critic` blind | F9–F11 (19 JSON + 2 MD) — converges iter-5 | `iter_5/ITER5_CONVERGENCE_REPORT.md` (combined) |
| **iter_7** | **554 / 554 pages (full corpus)** | **56 `scientist` agents in 6 parallel batches** → `tracer` triage → `architect` + `qa-tester` verify | F12–F36 (126 JSON + 34 MD) | `iter_7/ITER7_FULLCORPUS_CONVERGENCE_REPORT.md` |
| **iter_8** | 2 corrective + glossary re-verify | `critic` blind (R27) | F37–F38 (4 JSON + 2 MD); **0 release-impacting → CONVERGED** | covered in `iter_7/ITER7_FULLCORPUS_CONVERGENCE_REPORT.md` §5–§6 |

---

## Cumulative metrics

| Metric | Value |
|---|---|
| Fresh pages audited (distinct) | **554 / 554 = 100 %** |
| Agent dispatches (rough) | **~80** total across iter-3 → iter-8 |
| Release-impacting fixes applied | **38** fix IDs (F1–F38) |
| JSON edit-units | **~736** |
| MD regenerations | **46** |
| LLM billed | **$0** (max-plan OAuth per D-069) |
| Distinct Rule-D subagent types | **9** (code-reviewer / analyst / verifier / critic / scientist / tracer / executor / architect / qa-tester) |
| Wall time (net Claude) | iter-3..8 cumulative ~3–4 h |
| Output → publication | **`itpassport-r6-v1.0.2`** (2026-05-18T02:45:00Z on `c8c2c00`) |

---

## Subdir map

| Path | Purpose |
|---|---|
| `initial_validation/` | The 3-track dimensional audit (V1 OCR + V2 translation + V3a/b/c structure) + sampling + methodology + the transitional `iter_2/`. See its own README. |
| `iter_3/` … `iter_8/` | Fix/convergence chain. Each iter has its own R-numbered audit/fix/verify rounds; the strongest-evidence dirs are `iter_5/`, `iter_7/`, `iter_8/`. |
| `scripts/` | Reusable fix-application + sample-build + aggregation scripts. The `rN_apply_fixes.py` family is round-keyed; the `build_iter*_sample.py` family is iter-keyed. |
| `logs/` | Operational logs (renamed from `_logs/` per D-082). |

---

## Phase 2 backlog seeded by this validation

15 systemic patterns surfaced across iter-3 → iter-8 → fed into `RETROSPECTIVE.md` §5.5 / §8.4 / §9.5 as v2 redesign inputs. See those sections for the full list (sentence-as-term boundary leaks, glossary polysemy, OCR boundary contamination, jp-kanji-in-zh systemic, ZH sibling-term collisions, surface↔definition coherence, etc.).
