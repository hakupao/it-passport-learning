"""Audit verdict determination (per D-063).

Three-tier verdict:

- ``PASS`` (rate >= 0.90): accept + archive failures + continue pipeline.
- ``WARN`` (0.80 <= rate < 0.90): warn + archive + halt for user decision.
- ``FAIL`` (rate < 0.80): force full-stage rerun.

Safety field override (D-063 §2.3): any safety field FAIL upgrades verdict to FAIL
regardless of pass rate.
"""
from __future__ import annotations

from enum import Enum


class Verdict(str, Enum):
    """Three-tier verdict (D-063)."""

    PASS = "PASS"
    WARN = "WARN"
    FAIL = "FAIL"


DEFAULT_PASS_THRESHOLD: float = 0.90
DEFAULT_WARN_THRESHOLD: float = 0.80

# Per D-063 §2.3 default safety fields (cert-specific extension via YAML).
DEFAULT_SAFETY_FIELDS: frozenset[str] = frozenset({
    "Question.answer_index",
    "Term.surface.jp",
    "Entity.type",
    "Envelope.cert_id",
    "Envelope.schema_version",
})


def determine_verdict(
    pass_count: int,
    fail_count: int,
    failed_safety_fields: set[str] | frozenset[str] = frozenset(),
    safety_fields: set[str] | frozenset[str] = DEFAULT_SAFETY_FIELDS,
    pass_threshold: float = DEFAULT_PASS_THRESHOLD,
    warn_threshold: float = DEFAULT_WARN_THRESHOLD,
) -> Verdict:
    """Compute the three-tier audit verdict per D-063.

    Args:
        pass_count: Number of audit samples that passed.
        fail_count: Number of audit samples that failed.
        failed_safety_fields: Names of safety fields that produced any failure.
        safety_fields: Configured safety field set (default per D-063).
        pass_threshold: Lower bound for ``PASS`` (default 0.90).
        warn_threshold: Lower bound for ``WARN`` (default 0.80).

    Returns:
        ``Verdict.FAIL`` if any safety field failed (one-vote veto), or if pass
        rate is below ``warn_threshold``. ``Verdict.WARN`` if pass rate is in
        the ``[warn_threshold, pass_threshold)`` band. ``Verdict.PASS`` otherwise.

    Raises:
        ValueError: If ``pass_count + fail_count == 0``.
    """
    if pass_count + fail_count == 0:
        raise ValueError("Cannot determine verdict on empty sample set")

    # Safety-field one-vote veto (D-063 §2.3).
    if failed_safety_fields & safety_fields:
        return Verdict.FAIL

    rate = pass_count / (pass_count + fail_count)
    if rate >= pass_threshold:
        return Verdict.PASS
    if rate >= warn_threshold:
        return Verdict.WARN
    return Verdict.FAIL
