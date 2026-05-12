"""Stage dispatcher + resume planner (per D-079 §2.4).

6.11.B.1 deliverable: pure planning core + idempotent ``--redo`` cleanup.
Given a stage id N, ``plan_resume`` returns the list of stages that
should execute to reach the next user gate (per D-079 §2.1), and where
that gate halts. Stages between gates auto-pass per D-079 §2.2.

Stage execution wiring, checkpoint emission, and gate halt-criteria
checks land in 6.11.B.2 + 6.11.B.3.
"""
from __future__ import annotations

import shutil
from dataclasses import dataclass
from pathlib import Path

# Canonical stage ids in pipeline order. All as strings because "4.5"
# is not an integer; uniform string handling avoids float-equality
# surprises (e.g. 4.5 == 4.5 is True today but mixing int / float in
# dict keys is a foot-gun).
STAGE_ORDER: tuple[str, ...] = ("1", "2", "3", "4", "4.5", "5", "6", "7")

# stage id → subdirectory under data/<cert_id>/runs/<run_id>/ where the
# stage's output lives (per D-053 + D-008 stage layout).
STAGE_DIRS: dict[str, str] = {
    "1": "ocr",
    "2": "classified",
    "3": "cleaned",
    "4": "structured",
    "4.5": "glossary",
    "5": "translated",
    "6": "audit",
    "7": "output",
}

# stage id → gate number that fires *after* that stage (per D-079 §2.1).
# Mechanical stages (2, 3) auto-pass; only 5 entries here.
GATE_AFTER_STAGE: dict[str, int] = {
    "1": 1,
    "4": 2,
    "4.5": 3,
    "5": 4,
    "6": 5,
}


@dataclass(frozen=True)
class ResumePlan:
    """Outcome of :func:`plan_resume`: stages to run + halt point."""

    stages_to_run: tuple[str, ...]
    halt_after_stage: str
    halt_at_gate: int | None  # None when running through to stage 7

    @property
    def next_resume_stage(self) -> str | None:
        """The stage id that the next ``--from`` would pass after this halt."""
        idx = STAGE_ORDER.index(self.halt_after_stage)
        if idx + 1 >= len(STAGE_ORDER):
            return None
        return STAGE_ORDER[idx + 1]


def parse_stage_id(value: str) -> str:
    """Validate + canonicalize a stage id.

    Raises ``ValueError`` for unknown values. Whitespace is stripped.
    """
    s = (value or "").strip()
    if s not in STAGE_ORDER:
        raise ValueError(
            f"unknown stage id {value!r}; valid ids = {list(STAGE_ORDER)}"
        )
    return s


def plan_resume(stage_from: str) -> ResumePlan:
    """Compute the run plan starting at ``stage_from``.

    Walks forward through :data:`STAGE_ORDER` from ``stage_from`` and
    stops at the first gate-bearing stage (or the end of the pipeline
    if none remain). Mechanical stages between gates are included in
    ``stages_to_run``.
    """
    start = parse_stage_id(stage_from)
    start_idx = STAGE_ORDER.index(start)
    stages: list[str] = []
    halt_after: str = start
    halt_gate: int | None = None
    for sid in STAGE_ORDER[start_idx:]:
        stages.append(sid)
        halt_after = sid
        if sid in GATE_AFTER_STAGE:
            halt_gate = GATE_AFTER_STAGE[sid]
            break
    return ResumePlan(
        stages_to_run=tuple(stages),
        halt_after_stage=halt_after,
        halt_at_gate=halt_gate,
    )


def stage_output_dir(stage_id: str, run_dir: Path) -> Path:
    """Resolve the on-disk output directory for ``stage_id``."""
    sid = parse_stage_id(stage_id)
    return run_dir / STAGE_DIRS[sid]


def clear_stage_output(stage_id: str, run_dir: Path) -> bool:
    """Remove the stage output dir; idempotent.

    Returns True if a directory was removed, False if nothing to remove.
    Raises ``ValueError`` if the target path exists but is not a
    directory (defensive: refuses to nuke unexpected files).
    """
    target = stage_output_dir(stage_id, run_dir)
    if not target.exists():
        return False
    if not target.is_dir():
        raise ValueError(
            f"expected directory at {target}, found non-directory entry"
        )
    shutil.rmtree(target)
    return True


def build_resume_command_hint(
    plan: ResumePlan, *, run_id: str, cert_id: str = "itpassport_r6"
) -> str | None:
    """Format the next resume command suggested at the halt point.

    Returns ``None`` when the plan reaches the end of the pipeline.
    """
    nxt = plan.next_resume_stage
    if nxt is None:
        return None
    return (
        f"uv run cert-extractor stage --from {nxt} "
        f"--run-id {run_id} --cert-id {cert_id}"
    )
