# Failure: `stage1_ocr` / `stage1-2026-05-12-gate1-checker-schema`

> Per Rule B (failure archived, never deleted) — even though this failure was
> in a **gate-checker**, not in the OCR product itself, archiving keeps the
> shape of the bug + the fix on disk for the Phase 1 retro and future-Phase
> regression hygiene.

## 元数据 / Metadata

| 字段 | 值 |
|---|---|
| `attempt_id` | `stage1-2026-05-12-gate1-checker-schema` |
| `stage` | `stage1_ocr` (verification layer — `pipeline/halt_criteria.py`) |
| `timestamp` | `2026-05-12T13:40:00+09:00` |
| `triggered_by` | `data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/cost.json` (first real 579-page Stage C run) |
| `git_sha` | `6f5310e` (Session 14 close — pre-fix) |
| `model_or_tool` | `cert_extractor.pipeline.halt_criteria.check_gate_1_post_ocr` (Python, 6.11.B.3 deliverable) |
| `cost_jpy_or_cny` | ¥0 — gate-checker bug, no LLM cost burned |
| `elapsed_minutes` | ~5 (detection + patch + suite re-run + Gate ① rerun) |

---

## 输入 / Input

- **输入数据**: real `cost.json` emitted by `pipeline/runner.py:_emit_cost_json` after 579-page Mistral OCR
- **Schema actually emitted** (canonical, also matches prior 50-page baseline at `dry_run_2026-05-06T16-58-10/cost.json`):

```json
{
  "run_id": "dry_run_2026-05-12T13-23-19",
  "cert_id": "itpassport_r6",
  "current": {
    "wall_time_seconds": 1026.35,
    "mistral_pages": 579,
    "mistral_usd": 0.579,
    "anthropic_usd": 0.0,
    "fail_count": 0
  },
  "by_stage": {"1": {"usd": 0.579, "calls": 579}},
  "caps": { ... }
}
```

- **Checker call site**:

```python
check_gate_1_post_ocr(
    raw_dir=run_dir / "raw" / "pages",
    ocr_dir=run_dir / "ocr",
    cost_path=run_dir / "cost.json",
    expected_mistral_usd=0.579,
    cost_tolerance=0.10,
)
```

---

## 产物 / Product (the bug)

`HaltResult(passed=False, reasons=("mistral cost $0.0000 outside $0.579 ± 10%",))`

Root cause — `halt_criteria.py` line 68 (pre-fix):

```python
cost = json.loads(cost_path.read_text(encoding="utf-8"))
mistral = float(cost.get("mistral_usd", 0.0))   # ← reads flat key
```

Real cost.json nests under `current` → `cost.get("mistral_usd")` returns `None`
→ default `0.0` → 0.0 vs expected $0.579 → FAIL.

Page-count parity ✅, zero-byte absence ✅ — only cost field was misread.

---

## 技术判定 / Technical Verdict

`FAIL` — checker function returned `passed=False` against a fully-healthy
579-page OCR product. The OCR pipeline itself produced exactly the expected
579 raw images + 579 OCR markdown files + $0.579 cost at zero failures; the
gate-checker rejected a real PASS.

## 业务判定 / Business Verdict

`FAIL` — would have blocked legitimate D.3 progress. A naive operator
might have re-run Stage 1 (burning another $0.58) trying to "fix" the
nonexistent cost discrepancy. Tight failure-mode: false-negative at the
gate boundary.

## 失败模式分类 / Failure Mode

- [x] `schema-violation` — checker grammar diverged from emitter grammar
- [x] `regression` — silent: B.3 unit tests passed using a flat-schema
  fixture that did **not** reflect the canonical `runner.py` emission shape
- [ ] (not LLM / not data / not infra)

---

## 根因 / Root Cause

**Test fixture wrote a non-canonical cost.json shape.** The 6.11.B.3 unit
test (`test_gate_1_passes_with_matching_pages_and_cost_in_band`) used a
hand-rolled `{"mistral_usd": 0.058}` minimal fixture. That shape never
existed in production — `runner.py:_emit_cost_json` emits the nested
`{current: {mistral_usd: ...}}` shape, identical across the 50-page Stage A
baseline and the new 579-page Stage C run.

When B.3 shipped, the test was self-consistent (fixture matched checker),
so unit tests passed. But neither shape matched the actual `pipeline/`
emitter. Suite 461/461 was a green-on-fiction baseline.

**Mitigation**: tests at the contract boundary between modules should use
realistic fixtures — copy a real `cost.json` (or a faithful schema-subset
of one) rather than invent a minimal stub.

---

## 修复 / Fix

### Patch — `pipeline/halt_criteria.py`

Read nested first, flat fallback for back-compat:

```python
current = cost.get("current") if isinstance(cost.get("current"), dict) else None
if current is not None and "mistral_usd" in current:
    mistral = float(current["mistral_usd"])
else:
    mistral = float(cost.get("mistral_usd", 0.0))
```

### Patch — `tests/unit/test_pipeline_halt_criteria.py`

Added `test_gate_1_reads_nested_current_mistral_usd_from_real_cost_json`
using a realistic nested fixture (`current: {wall_time_seconds, mistral_pages,
mistral_usd, anthropic_usd, fail_count}` + top-level `run_id, cert_id,
by_stage`). Locks the canonical schema contract.

Existing flat-schema tests kept (the fallback path still must work) — they
now serve as legacy regression rather than primary contract.

### Verification

```
uv run --project packages/extractor pytest packages/extractor/tests/unit -q
474 passed in 0.44s          (473 → 474, +1 new test, 0 regressions)

uvx ruff check packages/extractor/src/cert_extractor/pipeline/halt_criteria.py \
                packages/extractor/tests/unit/test_pipeline_halt_criteria.py
All checks passed!
```

### Gate ① re-fire after fix

```
Gate 1 passed = True
reasons = ()
checkpoint emitted: data/.../checkpoints/gate_1_2026-05-12T13-42-47.json
```

---

## 下一 attempt 输入 / Input for next attempt

N/A — this is a checker bug fix, not an OCR re-run input. The original OCR
product at `data/.../dry_run_2026-05-12T13-23-19/{raw,ocr}/` is fully valid
and carries forward into D.3. No data re-run needed.

---

## 链回 / Cross-refs

- Patch lines: `pipeline/halt_criteria.py:67-78` (post-fix; pre-fix at git SHA `6f5310e`)
- New test: `tests/unit/test_pipeline_halt_criteria.py::test_gate_1_reads_nested_current_mistral_usd_from_real_cost_json`
- Gate ① checkpoint: `data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/checkpoints/gate_1_2026-05-12T13-42-47.json`
- Session log: `docs/discussion/2026-05-12-session-15.md` (this session)
