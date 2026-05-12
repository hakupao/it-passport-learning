# Failure: `stage4_structure` / `stage4-2026-05-12-d076-envelope-14-pages`

> Per Rule B (failure archived, never deleted). This is the **substantive**
> Gate ② FAIL after the checker schema bug was fixed (sibling file
> `stage4-2026-05-12-gate2-checker-schema.md`). 14 of 554 structured
> pages emitted `question` entities with `answer_index == -1`, violating
> the D-076 envelope contract for downstream Stage 7 export.
>
> Root cause is **F-MISTRAL-ANSWER-LINE-LOSS** — already a known
> Phase-2 polish item from Session 09b Plan-B (carried forward as
> deferred). This run reproduces it on 14 different pages including
> `page_043` (the original Session-09b reproducer).

## 元数据 / Metadata

| 字段 | 值 |
|---|---|
| `attempt_id` | `stage4-2026-05-12-d076-envelope-14-pages` |
| `stage` | `stage4_structure` |
| `timestamp` | `2026-05-12T18:20:00+09:00` (Gate ② evaluation post checker fix) |
| `triggered_by` | `data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/structured/page_{043,064,065,103,134,154,180,181,182,260,300,416,503,525}.json` |
| `git_sha` | `a10cd53` (Session 15 close) + Session 16 in-progress patches |
| `model_or_tool` | Stage 4 `extract-structure` with `claude-opus-4-7` (per D-069 max-plan OAuth, $0 billed) |
| `cost_jpy_or_cny` | $0 billed; ~$5 shadow attributable to these 14 of 554 calls |
| `elapsed_minutes` | n/a — discovered post-completion via Gate ② |

---

## 输入 / Input

- 14 pages with `question` entities where Mistral OCR (Stage 1) did NOT
  preserve the answer-key line, and Stage 4 fell back to the D-076
  sentinel `answer_index = -1`.
- **None of the 14 pages were flagged by Stage 3 hard-reocr heuristic**
  (the `repetition_max >= 8` heuristic in `pipeline/quality.py` does
  not detect missing-answer-line failures — different signal).
- Stage 3 flagged set: `[2, 16, 47, 62, 75, 78, 79, 92, 94, 106, 150,
  162, 186, 200, 241, 249, 251, 267, 269, 270, 274, 278, 280, 289, 295,
  384, 412, 414, 429, 441, 445, 464, 493, 501, 515, 516, 518, 520, 521,
  547, 566, 576]` — intersection with the 14 = ∅.

## 产物 / Output

```python
# Sample violating entity (page_043, question[0]):
{
  "id": "itpassport_r6::question::p043::0",
  "type": "question",
  "stem": {"jp": "企業の人事機能の向上や、…", "zh": "<UNTRANSLATED>", "en": "<UNTRANSLATED>"},
  "choices": [
    {"jp": "ア. e-ラーニング", ...},
    {"jp": "イ. FinTech", ...},
    {"jp": "ウ. HRTech", ...},
    {"jp": "エ. ...", ...}
  ],
  "answer_index": -1   # <-- D-076 sentinel; would be rejected by Stage 7 export
}
```

## 技术判定 / Technical verdict

`FAIL` — Gate ② per D-079 §2.1 row 2 + D-076 envelope. Checker output:

```
Gate 2 passed = False
reasons = ("answer_index == -1 on 14 page(s): ['page_043.json',
  'page_064.json', 'page_065.json', 'page_103.json',
  'page_134.json']...",)
```

Cumulative entity count = 2226 across 554 structured files (well within
`expected_entity_count=2500 ± 20%`); only the answer_index check fails.

## 业务判定 / Business verdict

`FAIL` — Stage 7 export will reject these 14 pages by D-076 envelope.
Without remediation, the final `output/` release would be missing
question entities for 14 textbook pages. **Cannot autonomously proceed
to D.4 (Stage 4.5 glossary)** — D-073 + D-079 require user gate on
Gate ② FAIL.

## Sibling / context

- Original Session 09b Plan-B fix (D-076) was for `page_022` jp-mutation
  + `page_043` `[0,0,0,0,0]` answer_index fallback. The `[0,0,0,0,0]`
  case was fixed by re-running Stage 4 on a 40-page sample after
  prompt + envelope tightening. This 579-page run shows the
  envelope correctly emits `-1` (per D-076 design — sentinel, not
  silent default), and the upstream Stage 1 / Stage 3 pipeline is the
  remaining gap.
- Session 09b classified this as **F-MISTRAL-ANSWER-LINE-LOSS — Phase-2
  Stage 3 heuristic enhancement**, deferred. This Gate ② FAIL is the
  first time the deferred item creates a hard gate stop.

## 修复候选 / Remediation options (open — user decision)

1. **Force-Stage-3 reocr on the 14 pages** with `--force-pages
   43,64,65,103,134,154,180,181,182,260,300,416,503,525`, then delete
   the corresponding `structured/page_NNN.json` and re-run Stage 4 with
   `--skip-existing`. Expected cost: ~$3 Vision opus + ~$3 structure
   opus = ~$6 shadow / $0 billed.
2. **Hand-edit** answer_index values for the 14 pages by reading
   `raw/pages/page_NNN.jpg` directly (Plan-B-style, mirrors Session
   09b's `page_022` hand-edit flow). Doc per
   `evidence/.../page_NNN_hand_edit_2026-05-12.md` per D-027.
3. **Investigate Stage 3 heuristic** to add a `missing_answer_line`
   detector to `pipeline/quality.py` that triggers on question pages
   without the `正解：[アイウエ]` pattern (or equivalent), then re-run
   Stage 3 + Stage 4. Larger code change; higher quality long-term.
4. **Hybrid**: option 1 for tactical D.3 closure + option 3 as a Phase
   1.bis polish to prevent recurrence on future Stage C runs.

## 下一 attempt 输入 / Next-attempt input

User has not yet authorised any of the above. This file stays open.
When the user picks an option, append §"Resolution" with the chosen
path + actual outcome.
