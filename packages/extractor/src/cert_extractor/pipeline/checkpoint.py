"""Checkpoint emitter for D-079 §2.4 user-confirmation gates.

6.11.B.2 deliverable: writes a structured JSON snapshot to
``data/<cert_id>/runs/<run_id>/checkpoints/gate_<N>_<timestamp>.json``
at every gate halt. The next ``stage --from N+1`` invocation will read
this file (6.11.B.3 work) to verify halt criteria + resume cleanly.

Schema follows D-079 §2.4 envelope: gate id, stage_completed,
next_stage, halt_time (Tokyo ISO 8601), summary dict, samples for
review, halt_criteria_passed bool, resume_command hint.
"""
from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

from pydantic import BaseModel, Field

from cert_extractor.pipeline.stage_dispatch import (
    ResumePlan,
    build_resume_command_hint,
)

_TOKYO = ZoneInfo("Asia/Tokyo")


def now_tokyo_iso() -> str:
    """ISO 8601 with Tokyo offset; used for the ``halt_time`` field.

    Example: ``2026-05-12T14:30:05+09:00``.
    """
    return datetime.now(tz=_TOKYO).isoformat(timespec="seconds")


def tokyo_timestamp_slug(*, dt: datetime | None = None) -> str:
    """Filename-safe Tokyo timestamp (e.g. ``2026-05-12T14-30-05``).

    Colons in ISO 8601 break Windows filenames; this slug substitutes
    dashes to stay portable. Matches the ``run_id`` timestamp format
    used elsewhere in the pipeline (per CLI ``dry_run`` convention).
    """
    if dt is None:
        dt = datetime.now(tz=_TOKYO)
    return dt.strftime("%Y-%m-%dT%H-%M-%S")


class Checkpoint(BaseModel):
    """D-079 §2.4 gate-halt checkpoint envelope.

    ``gate`` ranges 1..5 (the 5 user-confirmation gates). Terminal
    stage 7 reaches end-of-pipeline and emits no checkpoint.
    """

    gate: int = Field(ge=1, le=5)
    stage_completed: str
    next_stage: str | None
    halt_time: str
    summary: dict[str, Any] = Field(default_factory=dict)
    halt_criteria_passed: bool
    samples_for_review: list[str] = Field(default_factory=list)
    resume_command: str | None


def checkpoint_dir(run_dir: Path) -> Path:
    """Per-run checkpoint output directory."""
    return run_dir / "checkpoints"


def checkpoint_filename(gate: int, timestamp_slug: str) -> str:
    """Canonical checkpoint filename (per D-079 §2.4)."""
    return f"gate_{gate}_{timestamp_slug}.json"


def emit_checkpoint(
    plan: ResumePlan,
    *,
    summary: dict[str, Any],
    samples_for_review: list[str],
    halt_criteria_passed: bool,
    run_dir: Path,
    run_id: str,
    cert_id: str = "itpassport_r6",
    timestamp_slug: str | None = None,
    halt_time: str | None = None,
) -> Path:
    """Write a gate-halt checkpoint and return its path.

    Raises ``ValueError`` when ``plan.halt_at_gate is None`` (the plan
    runs to end-of-pipeline, e.g. ``--from 7``, with no gate to halt
    at). Auto-creates the ``checkpoints/`` directory.
    """
    if plan.halt_at_gate is None:
        raise ValueError(
            "cannot emit checkpoint for a plan that does not halt at a gate "
            "(terminal stage reaches end-of-pipeline)"
        )
    slug = timestamp_slug or tokyo_timestamp_slug()
    halt_ts = halt_time or now_tokyo_iso()

    cp = Checkpoint(
        gate=plan.halt_at_gate,
        stage_completed=plan.halt_after_stage,
        next_stage=plan.next_resume_stage,
        halt_time=halt_ts,
        summary=summary,
        halt_criteria_passed=halt_criteria_passed,
        samples_for_review=samples_for_review,
        resume_command=build_resume_command_hint(plan, run_id=run_id, cert_id=cert_id),
    )

    out_dir = checkpoint_dir(run_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    target = out_dir / checkpoint_filename(plan.halt_at_gate, slug)
    target.write_text(
        json.dumps(cp.model_dump(), ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return target


def load_checkpoint(path: Path) -> Checkpoint:
    """Parse a checkpoint JSON file (used by 6.11.B.3 resume logic)."""
    return Checkpoint.model_validate_json(path.read_text(encoding="utf-8"))
