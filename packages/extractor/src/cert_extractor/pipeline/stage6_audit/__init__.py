"""Stage 6 audit reviewer (per D-008 + D-061 + D-063 + D-077).

Two-pass audit pipeline over Stage 5 trilingual translation output:

- Phase 1: deterministic Python detectors (D1-D13) for invariants that
  Plan-B (Session 09b) showed an LLM cannot be trusted to verify.
- Phase 2: opus LLM reviewer (sub-batched, tool_use forced) for semantic
  judgments — hallucination, omission, unfaithful tone, idiomaticity.

Per D-077 §2.5 each page emits a two-tier verdict
(``translation_fidelity_verdict`` + ``learner_data_verdict``) plus an
``overall_verdict``. Per D-077 §2.4 every issue carries a deterministic
``repair_stage`` tag (``"4" / "4.5" / "5" / "7"``) so D-063 retry routing
knows which upstream stage to re-run.
"""
from cert_extractor.pipeline.stage6_audit.schema import (
    DIMENSION_BY_ISSUE_TYPE,
    KNOWN_ISSUE_TYPES,
    REPAIR_STAGE_BY_ISSUE_TYPE,
    Stage6Issue,
    Stage6IssueDetector,
    Stage6IssueDimension,
    Stage6IssueSeverity,
    Stage6PageReview,
    Stage6RunSummary,
)

__all__ = [
    "DIMENSION_BY_ISSUE_TYPE",
    "KNOWN_ISSUE_TYPES",
    "REPAIR_STAGE_BY_ISSUE_TYPE",
    "Stage6Issue",
    "Stage6IssueDetector",
    "Stage6IssueDimension",
    "Stage6IssueSeverity",
    "Stage6PageReview",
    "Stage6RunSummary",
]
