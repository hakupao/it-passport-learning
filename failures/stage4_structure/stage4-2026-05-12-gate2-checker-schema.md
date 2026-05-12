# Failure: `stage4_structure` / `stage4-2026-05-12-gate2-checker-schema`

> Per Rule B (failure archived, never deleted). Sibling case to
> `failures/stage1_ocr/stage1-2026-05-12-gate1-checker-schema.md` — same
> root pattern: B.3 gate checker reads a schema shape that diverges from
> the live emitter, ships green via dict-only fixtures, then crashes on
> first real-data evaluation.

## 元数据 / Metadata

| 字段 | 值 |
|---|---|
| `attempt_id` | `stage4-2026-05-12-gate2-checker-schema` |
| `stage` | `stage4_structure` (verification layer — `pipeline/halt_criteria.py`) |
| `timestamp` | `2026-05-12T18:15:00+09:00` (approx — first Gate ② evaluation after Stage 4 final resume) |
| `triggered_by` | `data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/structured/page_018.json` (first non-empty page → AttributeError) |
| `git_sha` | `a10cd53` (Session 15 close — pre-fix) |
| `model_or_tool` | `cert_extractor.pipeline.halt_criteria.check_gate_2_post_structure` (Python, 6.11.B.3 deliverable) |
| `cost_jpy_or_cny` | ¥0 — gate-checker bug, no LLM cost burned (LLM run already done) |
| `elapsed_minutes` | ~3 (detection + patch + new test + suite re-run + Gate ② rerun) |

---

## 输入 / Input

- **输入数据**: real `structured/page_NNN.json` emitted by `stage4_structure.py`
- **Schema actually emitted** (verified on `page_018.json`, top-level JSON array):

```json
[
  {
    "id": "itpassport_r6::section::p018::0",
    "type": "section",
    "title": {"jp": "...", "zh": "<UNTRANSLATED>", "en": "<UNTRANSLATED>"},
    ...
  },
  {
    "id": "itpassport_r6::figure::p018::1",
    "type": "figure",
    ...
  }
]
```

- **Schema the checker assumed** (B.3 unit-test fixture only):

```json
{"entities": [{"type": "section", ...}, ...]}
```

## 产物 / Output

```
AttributeError: 'list' object has no attribute 'get'
  at halt_criteria.py:108  → entities = payload.get("entities", [])
```

554 structured/ files; checker crashed on first non-empty file.

## 技术判定 / Technical verdict

`FAIL` — checker cannot evaluate Gate ② against real Stage 4 output.

## 业务判定 / Business verdict

`FAIL` — without Gate ② passing, D.3 closure is blocked. The actual entity
count + answer_index check could not run, masking whatever real semantic
issues exist (and indeed once patched, **a real D-076 envelope violation
surfaced on 14 pages** — see sibling failure file
`stage4-2026-05-12-d076-envelope-14-pages.md`).

## 修复 / Fix

`pipeline/halt_criteria.py:100-117` — read top-level list first, dict
fallback for back-compat:

```python
if isinstance(payload, list):
    entities = payload
elif isinstance(payload, dict):
    entities = payload.get("entities", [])
else:
    reasons.append(f"{path.name}: unexpected top-level type {type(payload).__name__}")
    continue
```

New test: `test_gate_2_reads_top_level_list_schema_from_real_structured_files`
in `tests/unit/test_pipeline_halt_criteria.py` — uses a faithful
top-level-list fixture (mirrors the real `page_018.json` shape).

## 验证 / Verification

```
uv run --project packages/extractor pytest packages/extractor/tests/unit -q
476 passed in 0.43s     (475 → 476, +1, 0 regressions)

# Gate ② re-fire on real data:
Gate 2 passed = False
reasons      = ("answer_index == -1 on 14 page(s): [...]",)
```

Checker now traverses all 554 files cleanly. The remaining FAIL is the
genuine D-076 envelope hit, not a checker crash — see the sibling
failure file.

## 下一 attempt 输入 / Next-attempt input

This file is closed (checker bug fixed + tested). The Phase 1 retro
should treat **gate-checker schema mismatch** as a category — TWO of
five Stage C gates (Gate ① + Gate ②) shipped with B.3 unit-test
fixtures that didn't match the live emitter shape. Recommended retro
take-away: B.3 deliverables must include at least one fixture sourced
from the canonical emitter (or its serialised reference output), not
hand-rolled JSON.
