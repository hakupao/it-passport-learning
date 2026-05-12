"""Tests for checkpoint emitter (per D-079 §2.4, 6.11.B.2 TDD).

Exercises:
- Pydantic schema round-trip + gate-range constraint (1..5)
- emit writes to canonical path; resume_command threaded from B.1 plan
- checkpoints/ dir auto-created when absent
- tokyo_timestamp_slug filename-safe format (no colons)
- terminal-stage plan (no gate) rejected with clear error
"""
from __future__ import annotations

import re
from datetime import datetime
from zoneinfo import ZoneInfo

import pytest
from cert_extractor.pipeline.checkpoint import (
    Checkpoint,
    checkpoint_dir,
    emit_checkpoint,
    load_checkpoint,
    tokyo_timestamp_slug,
)
from cert_extractor.pipeline.stage_dispatch import plan_resume
from pydantic import ValidationError


def test_checkpoint_schema_round_trip_and_gate_range_constraint() -> None:
    cp = Checkpoint(
        gate=3,
        stage_completed="4.5",
        next_stage="5",
        halt_time="2026-05-12T14:30:05+09:00",
        summary={"pages_processed": 40, "cost_so_far": 0.16},
        halt_criteria_passed=True,
        samples_for_review=["data/x/runs/y/glossary/glossary.json"],
        resume_command="uv run cert-extractor stage --from 5 --run-id y",
    )
    parsed = Checkpoint.model_validate_json(cp.model_dump_json())
    assert parsed == cp

    # Gate ids outside 1..5 are rejected (per D-079 §2.1).
    for bad_gate in (0, 6, -1):
        with pytest.raises(ValidationError):
            Checkpoint(
                gate=bad_gate,
                stage_completed="4.5",
                next_stage="5",
                halt_time="2026-05-12T14:30:05+09:00",
                halt_criteria_passed=True,
                resume_command=None,
            )


def test_emit_checkpoint_writes_to_canonical_path_with_resume_hint(tmp_path) -> None:
    run_dir = tmp_path / "runs" / "r1"
    run_dir.mkdir(parents=True)
    plan = plan_resume("4.5")  # halts at Gate 3
    target = emit_checkpoint(
        plan,
        summary={"pages_processed": 40, "cost_so_far": 0.16},
        samples_for_review=["glossary/glossary.json"],
        halt_criteria_passed=True,
        run_dir=run_dir,
        run_id="r1",
        timestamp_slug="2026-05-12T14-30-05",
    )

    assert target == run_dir / "checkpoints" / "gate_3_2026-05-12T14-30-05.json"
    assert target.exists()

    cp = load_checkpoint(target)
    assert cp.gate == 3
    assert cp.stage_completed == "4.5"
    assert cp.next_stage == "5"
    assert cp.summary == {"pages_processed": 40, "cost_so_far": 0.16}
    assert cp.samples_for_review == ["glossary/glossary.json"]
    assert cp.halt_criteria_passed is True
    assert cp.resume_command is not None
    assert "--from 5" in cp.resume_command
    assert "--run-id r1" in cp.resume_command


def test_emit_checkpoint_creates_checkpoints_dir_if_missing(tmp_path) -> None:
    run_dir = tmp_path / "runs" / "r1"
    run_dir.mkdir(parents=True)
    assert not checkpoint_dir(run_dir).exists()

    plan = plan_resume("5")  # halts at Gate 4
    emit_checkpoint(
        plan,
        summary={},
        samples_for_review=[],
        halt_criteria_passed=True,
        run_dir=run_dir,
        run_id="r1",
        timestamp_slug="2026-05-12T15-00-00",
    )
    assert checkpoint_dir(run_dir).is_dir()


def test_tokyo_timestamp_slug_is_filename_safe() -> None:
    dt = datetime(2026, 5, 12, 14, 30, 5, tzinfo=ZoneInfo("Asia/Tokyo"))
    assert tokyo_timestamp_slug(dt=dt) == "2026-05-12T14-30-05"
    # Fresh call must also match the canonical pattern (no colons,
    # which break Windows filenames).
    fresh = tokyo_timestamp_slug()
    assert re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}", fresh)
    assert ":" not in fresh


def test_emit_checkpoint_refuses_terminal_plan_with_no_gate(tmp_path) -> None:
    run_dir = tmp_path / "runs" / "r1"
    run_dir.mkdir(parents=True)
    plan = plan_resume("7")  # terminal stage; no gate
    assert plan.halt_at_gate is None

    with pytest.raises(ValueError, match="cannot emit checkpoint"):
        emit_checkpoint(
            plan,
            summary={},
            samples_for_review=[],
            halt_criteria_passed=True,
            run_dir=run_dir,
            run_id="r1",
        )
