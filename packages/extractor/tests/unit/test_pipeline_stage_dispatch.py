"""Tests for stage_dispatch (per D-079 §2.4, 6.11.B.1 TDD).

Exercises:
- canonical-id parsing + rejection
- multi-stage planner walk (stages 2 → 3 → 4 halts at Gate ②)
- single-stage planner walk (stage 4.5 halts at Gate ③)
- terminal-stage planner (stage 7, no further gate)
- --redo cleanup: removes existing dir, idempotent on absent
"""
from __future__ import annotations

import pytest
from cert_extractor.pipeline.stage_dispatch import (
    STAGE_ORDER,
    build_resume_command_hint,
    clear_stage_output,
    parse_stage_id,
    plan_resume,
    stage_output_dir,
)


def test_parse_stage_id_accepts_all_canonical_ids() -> None:
    for sid in STAGE_ORDER:
        assert parse_stage_id(sid) == sid
    # Whitespace tolerated (CLI args sometimes carry a trailing space).
    assert parse_stage_id(" 4.5 ") == "4.5"


def test_parse_stage_id_rejects_unknown_values() -> None:
    for bad in ("0", "8", "4.6", "x", "", "1.0"):
        with pytest.raises(ValueError, match="unknown stage id"):
            parse_stage_id(bad)


def test_plan_resume_from_2_runs_stages_2_3_4_halts_at_gate_2() -> None:
    plan = plan_resume("2")
    assert plan.stages_to_run == ("2", "3", "4")
    assert plan.halt_after_stage == "4"
    assert plan.halt_at_gate == 2
    assert plan.next_resume_stage == "4.5"
    hint = build_resume_command_hint(plan, run_id="r1", cert_id="itpassport_r6")
    assert hint is not None
    assert "--from 4.5" in hint
    assert "--run-id r1" in hint


def test_plan_resume_from_4_5_runs_stage_4_5_only_halts_at_gate_3() -> None:
    plan = plan_resume("4.5")
    assert plan.stages_to_run == ("4.5",)
    assert plan.halt_after_stage == "4.5"
    assert plan.halt_at_gate == 3
    assert plan.next_resume_stage == "5"


def test_plan_resume_from_7_runs_stage_7_only_no_gate() -> None:
    plan = plan_resume("7")
    assert plan.stages_to_run == ("7",)
    assert plan.halt_after_stage == "7"
    assert plan.halt_at_gate is None
    assert plan.next_resume_stage is None
    # End-of-pipeline: no further resume command.
    assert build_resume_command_hint(plan, run_id="r1") is None


def test_clear_stage_output_removes_existing_stage_dir(tmp_path) -> None:
    run_dir = tmp_path / "runs" / "r1"
    run_dir.mkdir(parents=True)
    target = stage_output_dir("4.5", run_dir)
    target.mkdir()
    (target / "glossary.json").write_text("{}", encoding="utf-8")

    # First call removes the dir, returns True.
    assert clear_stage_output("4.5", run_dir) is True
    assert not target.exists()

    # Second call is idempotent: returns False, no error.
    assert clear_stage_output("4.5", run_dir) is False
