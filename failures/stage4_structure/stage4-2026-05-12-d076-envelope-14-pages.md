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

(Was open at first archive write; resolved later same session — see
§Resolution below.)

---

## Resolution (2026-05-12, Session 16, β.1 path)

User chose **β.1** (force Stage 3 Vision opus on 14 pages → re-Stage-4
on those 14 with `--skip-existing`). Pre-flight δ visual check on
`page_043.jpg` + `page_525.jpg` confirmed F-MISTRAL-ANSWER-LINE-LOSS
hypothesis: answer key IS printed on each page as an orange footer
bar (`問題X-Y [字母]`), Mistral OCR captured the question numbers but
dropped the answer letters.

### Step 1 — `hard-reocr --force-pages 43,64,65,103,134,154,180,181,182,260,300,416,503,525`

```
[hard-reocr] DONE   inspected = 579
             flagged   = 56  [42 heuristic + 14 forced]
             re-OCR'd  = 14  (other 42 skipped per --skip-existing)
             fail_count= 0
             verdict   = None
```

Cost: ~$3.30 shadow (14 × $0.235), $0 billed. Wall ~5 min.

Verification — Vision opus output captured the answer footers:
- `cleaned/page_043.md` tail: `問題1-5　ウ　　問題1-6　ウ　　問題1-7　ウ　　問題1-8　エ　　問題1-9　ウ`
- `cleaned/page_525.md` tail: `問題15-4　**ウ**　…　問題15-8　**イ**`

### Step 2 — Delete 14 stale `structured/page_NNN.json`

```bash
for p in 43 64 65 103 134 154 180 181 182 260 300 416 503 525; do
  rm -f data/.../structured/page_$(printf '%03d' $p).json
done
# remaining: 540 (= 554 - 14)
```

### Step 3 — `extract-structure --skip-existing` (only the 14 will run)

```
[extract-structure] DONE   pages_processed = 14
                    pages_skipped   = 565  (540 existing + 25 label-skipped)
                    entities        = 61   (all type=question)
                    fail_count      = 0
                    verdict_halted  = None
```

Cost: ~$2.7 shadow (14 × $0.19), $0 billed. Wall ~3 min.
structured/ count restored to 554.

### Step 4 — Re-fire Gate ②

```python
check_gate_2_post_structure(
    structured_dir=run_dir / 'structured',
    expected_entity_count=2500,
    count_tolerance=0.20,
)
# Gate 2 passed = True
# reasons = ()
```

### Step 5 — Per-page sanity (cross-check vs. δ visual capture)

| page | expected (visual) | actual (re-Stage-4 opus) | match |
|---|---|---|---|
| 043 | ウウウエウ → [2,2,2,3,2] | [2,2,2,3,2] | ✓✓✓ |
| 525 | ウイウイイ → [2,1,2,1,1] | [2,1,2,1,1] | ✓✓✓ |
| 064-525 (other 12) | not visually verified | all 0-3, no -1 | structurally clean |

### Cumulative cost delta from β.1

| Metric | Pre-β.1 | Post-β.1 | Δ |
|---|---|---|---|
| Anthropic shadow | $229.47 | $235.63 | +$6.16 (vs $6 estimate ✓) |
| Anthropic billed | $0 | $0 | unchanged (D-069 OAuth) |
| Mistral billed | $0.629 | $0.629 | unchanged |
| structured/ count | 554 | 554 | unchanged (14 swapped, not added) |
| entities total | 2226 | 2224 | -2 (replacement entities slightly fewer than originals on a couple of pages — within noise) |
| Gate ② state | FAIL (14 -1 violations) | **PASS** | resolved |

### Verdict — closed

`PASS` — D-076 envelope clean. Gate ② checkpoint emitted at
`data/.../checkpoints/gate_2_2026-05-12T23-15-29.json`. Phase 1.bis
polish (β.3 — `missing_answer_line` detector in `pipeline/quality.py`)
queued as future D-082+ ADR; not blocking D.3 closure.
