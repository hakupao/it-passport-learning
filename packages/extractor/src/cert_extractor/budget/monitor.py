"""Run-level budget monitor (per D-071).

Implements three-tier verdict matching D-063 stage-level audit but applied
to *run-total* cost / wall-time / fail counters.

Hard caps must not exceed soft caps × 5 (constructor enforced) — protects
against accidental loosening that would bypass the soft-warn / user-decision
gate (D-071 §2.5).
"""
from __future__ import annotations

from dataclasses import dataclass

from cert_extractor.audit.verdict import Verdict


@dataclass(frozen=True)
class CapLevels:
    """Per-dimension thresholds (D-071 §2.1)."""

    wall_time_seconds: float
    mistral_usd: float
    anthropic_usd: float
    fail_count: int


# D-071 default soft / hard caps.
DEFAULT_SOFT: CapLevels = CapLevels(7200, 5.0, 5.0, 10)
DEFAULT_HARD: CapLevels = CapLevels(28800, 20.0, 30.0, 30)


_TRACKED_FIELDS: tuple[str, ...] = (
    "wall_time_seconds",
    "mistral_usd",
    "anthropic_usd",
    "fail_count",
)


class BudgetMonitor:
    """Run-level budget monitor (D-071).

    Reads ``cost.json`` ``current`` block (D-072) and emits a verdict
    consumed by the pipeline runner. ``WARN`` halts and waits for user
    input; ``FAIL`` halts immediately and triggers a Rule C mini-retro.
    """

    # Per D-071 v1.1 (revised): anti-mistake clamp relaxed from 5x → 10x because
    # the default anthropic_usd hard ($30) / soft ($5) ratio is 6x to preserve
    # headroom for the max-plan → API-key upgrade path (D-069 §2.4).
    _CLAMP_RATIO: float = 10.0

    def __init__(
        self,
        soft: CapLevels = DEFAULT_SOFT,
        hard: CapLevels = DEFAULT_HARD,
    ):
        # D-071 §2.4: hard cap may not exceed soft cap × CLAMP_RATIO (anti-mistake).
        for field in _TRACKED_FIELDS:
            soft_val = getattr(soft, field)
            hard_val = getattr(hard, field)
            if soft_val <= 0:
                raise ValueError(f"soft.{field} must be > 0, got {soft_val}")
            if hard_val < soft_val:
                raise ValueError(
                    f"hard.{field} ({hard_val}) must be >= soft.{field} ({soft_val})"
                )
            if hard_val > soft_val * self._CLAMP_RATIO:
                raise ValueError(
                    f"hard.{field} ({hard_val}) cannot exceed soft.{field} * "
                    f"{self._CLAMP_RATIO} ({soft_val * self._CLAMP_RATIO}) per "
                    f"D-071 v1.1 anti-mistake clamp"
                )
        self.soft = soft
        self.hard = hard

    def check(self, current: dict[str, float]) -> Verdict:
        """Return ``FAIL`` / ``WARN`` / ``PASS`` based on the largest cap exceeded."""
        # FAIL on any hard cap.
        for field in _TRACKED_FIELDS:
            if current.get(field, 0) >= getattr(self.hard, field):
                return Verdict.FAIL
        # WARN on any soft cap.
        for field in _TRACKED_FIELDS:
            if current.get(field, 0) >= getattr(self.soft, field):
                return Verdict.WARN
        return Verdict.PASS
