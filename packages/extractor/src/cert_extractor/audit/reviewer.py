"""Reviewer agent dispatch (per D-061).

Stage → reviewer + model tier mapping. The mapping is a single source of
truth declared here; ADR ``D-061-reviewer-mapping.md`` documents the
governance process for editing it.

Promotion / demotion rules (D-061 §2.2):

- promote to ``opus`` on consecutive FAIL, safety-field FAIL, or first-time
  cert onboarding;
- demote to ``haiku`` on 5+ consecutive PASS for non-critical stages;
- otherwise default to ``sonnet``.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

ModelTier = Literal["haiku", "sonnet", "opus"]
ReviewerName = Literal["scientist", "code-reviewer", "verifier"]


@dataclass(frozen=True)
class ReviewerSpec:
    reviewer: ReviewerName
    default_model: ModelTier


# Per D-061 §2.1 — stage IDs match the audit-required stages of D-060.
REVIEWER_MAP: dict[int, ReviewerSpec] = {
    1: ReviewerSpec("scientist", "sonnet"),       # OCR
    3: ReviewerSpec("scientist", "sonnet"),       # Hard Re-OCR (conditional)
    4: ReviewerSpec("code-reviewer", "sonnet"),   # Structure
    5: ReviewerSpec("scientist", "sonnet"),       # Translate
    6: ReviewerSpec("verifier", "sonnet"),        # Audit
}


@dataclass
class ReviewerHistory:
    """Per-stage history used by promotion / demotion rules (D-061 §2.2).

    Implementations populate this from cost.json + evidence files.
    """

    consecutive_fails: int = 0
    consecutive_passes: int = 0
    has_safety_field_fail: bool = False
    is_first_onboarding: bool = False
    is_critical: bool = True


def select_reviewer(
    stage: int,
    history: ReviewerHistory | None = None,
    override: tuple[ReviewerName, ModelTier] | None = None,
) -> tuple[ReviewerName, ModelTier]:
    """Pick reviewer + model tier for a given stage.

    Per D-061: pipeline YAML may override on a per-stage basis. Otherwise
    the mapping table is consulted and the model tier may be promoted /
    demoted based on ``history``.
    """
    if override is not None:
        return override

    spec = REVIEWER_MAP.get(stage)
    if spec is None:
        raise KeyError(
            f"Stage {stage} is not in the audit-required set "
            f"({sorted(REVIEWER_MAP)} per D-060/D-061)"
        )

    if history is None:
        return spec.reviewer, spec.default_model

    # Promotion (priority: safety > consecutive fail > onboarding)
    if history.has_safety_field_fail:
        return spec.reviewer, "opus"
    if history.consecutive_fails >= 1:
        return spec.reviewer, "opus"
    if history.is_first_onboarding:
        return spec.reviewer, "opus"

    # Demotion
    if history.consecutive_passes >= 5 and not history.is_critical:
        return spec.reviewer, "haiku"

    return spec.reviewer, spec.default_model
