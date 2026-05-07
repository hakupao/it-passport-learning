"""Stage 6 audit reviewer schema (per D-077 §2.3 + §2.4 + §2.5).

Three Pydantic models:

- ``Stage6Issue`` — one finding from a Phase 1 deterministic detector or
  Phase 2 LLM reviewer. Carries the closed-enum ``issue_type``, the
  ``dimension`` (fidelity / learner_data) it belongs to, the
  ``repair_stage`` it routes to (4 / 4.5 / 5 / 7), the ``severity``
  (FAIL / WARN / INFO), and optional ``safety_field`` flag if the
  finding hits the D-063 safety set.

- ``Stage6PageReview`` — the per-page verdict. Two-tier:
  ``translation_fidelity_verdict`` + ``learner_data_verdict``, plus a
  derived ``overall_verdict`` (FAIL > WARN > PASS, with safety override
  forcing FAIL). Use the ``from_issues`` classmethod to compose.

- ``Stage6RunSummary`` — the run-level rollup over all per-page
  reviews. Use ``from_pages`` to compose.

The closed enums (``KNOWN_ISSUE_TYPES``, ``DIMENSION_BY_ISSUE_TYPE``,
``REPAIR_STAGE_BY_ISSUE_TYPE``) are the single source of truth for
issue-type to dimension/repair_stage routing. Phase 1 detectors and
Phase 2 LLM reviewer both consume these tables; the LLM emits only an
``issue_type`` (closed enum), and Python looks up ``dimension`` +
``repair_stage`` from the table.
"""
from __future__ import annotations

import enum
from typing import Literal, Self

from pydantic import BaseModel, ConfigDict, Field, model_validator

from cert_extractor.audit.verdict import DEFAULT_SAFETY_FIELDS, Verdict
from cert_extractor.schema.common import Trilingual  # noqa: F401  (re-exported for downstream)

# ---------------------------------------------------------------------------
# Closed enums
# ---------------------------------------------------------------------------

# Severity ordering: FAIL > WARN > INFO. INFO does not push verdict away
# from PASS; WARN pushes to WARN; FAIL pushes to FAIL.
_SEVERITY_RANK: dict[str, int] = {"INFO": 0, "WARN": 1, "FAIL": 2}


class Stage6IssueSeverity(str, enum.Enum):
    """Issue severity (FAIL > WARN > INFO ranking enforced by ``_SEVERITY_RANK``)."""

    FAIL = "FAIL"
    WARN = "WARN"
    INFO = "INFO"


class Stage6IssueDimension(str, enum.Enum):
    fidelity = "fidelity"
    learner_data = "learner_data"


class Stage6IssueDetector(str, enum.Enum):
    deterministic = "deterministic"
    llm = "llm"


# ---------------------------------------------------------------------------
# Issue type tables (single source of truth — D-077 §2.4)
# ---------------------------------------------------------------------------

# Issue type → repair_stage. Adding a new issue_type requires (a) extending
# this table, (b) extending DIMENSION_BY_ISSUE_TYPE, (c) updating the LLM
# tool schema enum if the detector is llm-emitted.
REPAIR_STAGE_BY_ISSUE_TYPE: dict[str, Literal["4", "4.5", "5", "7"]] = {
    # learner_data — Phase 1 deterministic
    "jp_mutation": "5",
    "untranslated_residue": "5",
    "schema_invalid": "5",
    "answer_index_out_of_range": "4",
    "answer_index_mismatch": "4",
    "choice_marker_inconsistent": "7",
    "glossary_lock_violated": "5",
    "glossary_lock_missed": "5",
    "kana_helper_missing": "4.5",
    "kana_helper_unexpected": "4.5",
    "kana_helper_format": "4.5",
    "glossary_surface_concept_split": "4.5",
    # fidelity — Phase 1 deterministic
    "numeric_inconsistent": "5",
    "redundant_nested_parens": "7",
    # fidelity — Phase 2 llm
    "translation_hallucination": "5",
    "translation_omission": "5",
    "translation_unfaithful": "5",
    "term_translation_idiomatic": "4.5",
}

# Issue type → dimension. Mirrors REPAIR_STAGE_BY_ISSUE_TYPE keys.
DIMENSION_BY_ISSUE_TYPE: dict[str, Stage6IssueDimension] = {
    # learner_data
    "jp_mutation": Stage6IssueDimension.learner_data,
    "untranslated_residue": Stage6IssueDimension.learner_data,
    "schema_invalid": Stage6IssueDimension.learner_data,
    "answer_index_out_of_range": Stage6IssueDimension.learner_data,
    "answer_index_mismatch": Stage6IssueDimension.learner_data,
    "choice_marker_inconsistent": Stage6IssueDimension.learner_data,
    "glossary_lock_violated": Stage6IssueDimension.learner_data,
    "glossary_lock_missed": Stage6IssueDimension.learner_data,
    "kana_helper_missing": Stage6IssueDimension.learner_data,
    "kana_helper_unexpected": Stage6IssueDimension.learner_data,
    "kana_helper_format": Stage6IssueDimension.learner_data,
    "glossary_surface_concept_split": Stage6IssueDimension.learner_data,
    # fidelity
    "numeric_inconsistent": Stage6IssueDimension.fidelity,
    "redundant_nested_parens": Stage6IssueDimension.fidelity,
    "translation_hallucination": Stage6IssueDimension.fidelity,
    "translation_omission": Stage6IssueDimension.fidelity,
    "translation_unfaithful": Stage6IssueDimension.fidelity,
    "term_translation_idiomatic": Stage6IssueDimension.fidelity,
}

KNOWN_ISSUE_TYPES: tuple[str, ...] = tuple(REPAIR_STAGE_BY_ISSUE_TYPE.keys())


_REPAIR_STAGE_SORT_KEY: dict[str, float] = {"4": 4.0, "4.5": 4.5, "5": 5.0, "7": 7.0}


# ---------------------------------------------------------------------------
# Stage6Issue
# ---------------------------------------------------------------------------


class Stage6Issue(BaseModel):
    """One Stage 6 finding (Phase 1 deterministic or Phase 2 LLM)."""

    model_config = ConfigDict(extra="forbid", strict=True, use_enum_values=False)

    id: str = Field(..., min_length=1, description="Stable issue id (e.g. 'D5-page_043-0001').")
    issue_type: str = Field(
        ..., min_length=1, description="Closed enum; see KNOWN_ISSUE_TYPES."
    )
    severity: Stage6IssueSeverity
    dimension: Stage6IssueDimension
    repair_stage: Literal["4", "4.5", "5", "7"]
    detector: Stage6IssueDetector
    entity_path: str = Field(
        ...,
        min_length=1,
        description="Dotted path inside the page; e.g. 'page_043.entities[0].choices[2].zh'.",
    )
    evidence: dict[str, str] = Field(
        ...,
        description="Free-form evidence — typically jp/zh/en quotes plus 'expected'.",
    )
    rationale: str = Field(..., min_length=1)
    safety_field: str | None = Field(
        default=None,
        description=(
            "If set, must be a member of D-063 DEFAULT_SAFETY_FIELDS; flags the "
            "issue as a safety-set violation that forces overall verdict to FAIL."
        ),
    )
    proposed_fix: str | None = Field(default=None)
    detector_confidence: float | None = Field(default=None, ge=0.0, le=1.0)

    @model_validator(mode="after")
    def _consistency(self) -> Self:
        if self.issue_type not in REPAIR_STAGE_BY_ISSUE_TYPE:
            raise ValueError(
                f"Unknown issue_type {self.issue_type!r}; "
                f"must be one of {sorted(KNOWN_ISSUE_TYPES)}"
            )
        expected_stage = REPAIR_STAGE_BY_ISSUE_TYPE[self.issue_type]
        if self.repair_stage != expected_stage:
            raise ValueError(
                f"repair_stage={self.repair_stage!r} inconsistent with "
                f"issue_type={self.issue_type!r}; expected {expected_stage!r}"
            )
        expected_dimension = DIMENSION_BY_ISSUE_TYPE[self.issue_type]
        if self.dimension != expected_dimension:
            raise ValueError(
                f"dimension={self.dimension!r} inconsistent with "
                f"issue_type={self.issue_type!r}; expected {expected_dimension!r}"
            )
        if self.safety_field is not None and self.safety_field not in DEFAULT_SAFETY_FIELDS:
            raise ValueError(
                f"safety_field={self.safety_field!r} not in D-063 default safety set "
                f"({sorted(DEFAULT_SAFETY_FIELDS)})"
            )
        return self


# ---------------------------------------------------------------------------
# Stage6PageReview
# ---------------------------------------------------------------------------


def _verdict_from_severity(max_severity: Stage6IssueSeverity | None) -> Verdict:
    if max_severity is None or max_severity == Stage6IssueSeverity.INFO:
        return Verdict.PASS
    if max_severity == Stage6IssueSeverity.WARN:
        return Verdict.WARN
    return Verdict.FAIL


def _max_severity(
    issues: list[Stage6Issue], dimension: Stage6IssueDimension
) -> Stage6IssueSeverity | None:
    relevant = [i for i in issues if i.dimension == dimension]
    if not relevant:
        return None
    return max(relevant, key=lambda i: _SEVERITY_RANK[i.severity.value]).severity


def _most_severe_repair_stage(issues: list[Stage6Issue]) -> str | None:
    """Return the repair_stage of the most severe issue, with smallest stage
    number winning ties. Returns None if no issues."""
    if not issues:
        return None
    top_rank = max(_SEVERITY_RANK[i.severity.value] for i in issues)
    top_issues = [i for i in issues if _SEVERITY_RANK[i.severity.value] == top_rank]
    return min(
        (i.repair_stage for i in top_issues),
        key=lambda stage: _REPAIR_STAGE_SORT_KEY[stage],
    )


class Stage6PageReview(BaseModel):
    """Per-page Stage 6 verdict (D-077 §2.5)."""

    model_config = ConfigDict(extra="forbid", strict=True, use_enum_values=False)

    cert_id: str = Field(..., min_length=1)
    run_id: str = Field(..., min_length=1)
    stage: Literal[6] = 6
    page: int = Field(..., ge=1)
    leaves_audited: int = Field(..., ge=0)
    leaves_total: int = Field(..., ge=0)
    translation_fidelity_verdict: Verdict
    learner_data_verdict: Verdict
    overall_verdict: Verdict
    most_severe_repair_stage: Literal["4", "4.5", "5", "7"] | None = None
    issues: list[Stage6Issue] = Field(default_factory=list)
    reviewer_model: str = Field(..., min_length=1)
    reviewer_prompt_version: str = Field(..., min_length=1)
    started_at: str = Field(..., min_length=1)
    finished_at: str = Field(..., min_length=1)
    cost_usd_shadow: float = Field(..., ge=0.0)
    safety_field_failed: list[str] = Field(default_factory=list)

    @classmethod
    def from_issues(
        cls,
        *,
        cert_id: str,
        run_id: str,
        page: int,
        leaves_audited: int,
        leaves_total: int,
        issues: list[Stage6Issue],
        reviewer_model: str,
        reviewer_prompt_version: str,
        started_at: str,
        finished_at: str,
        cost_usd_shadow: float,
    ) -> Stage6PageReview:
        """Compose a per-page review from a list of issues, deriving the
        two-tier verdict + overall verdict + most_severe_repair_stage +
        safety_field_failed list."""
        fidelity_v = _verdict_from_severity(
            _max_severity(issues, Stage6IssueDimension.fidelity)
        )
        learner_v = _verdict_from_severity(
            _max_severity(issues, Stage6IssueDimension.learner_data)
        )

        safety_failed_paths: list[str] = []
        seen_safety: set[str] = set()
        for issue in issues:
            if (
                issue.severity == Stage6IssueSeverity.FAIL
                and issue.safety_field is not None
                and issue.safety_field not in seen_safety
            ):
                safety_failed_paths.append(issue.safety_field)
                seen_safety.add(issue.safety_field)

        if safety_failed_paths:
            learner_v = Verdict.FAIL

        # Overall = max of the two tiers, with FAIL > WARN > PASS.
        if Verdict.FAIL in (fidelity_v, learner_v):
            overall = Verdict.FAIL
        elif Verdict.WARN in (fidelity_v, learner_v):
            overall = Verdict.WARN
        else:
            overall = Verdict.PASS

        return cls(
            cert_id=cert_id,
            run_id=run_id,
            page=page,
            leaves_audited=leaves_audited,
            leaves_total=leaves_total,
            translation_fidelity_verdict=fidelity_v,
            learner_data_verdict=learner_v,
            overall_verdict=overall,
            most_severe_repair_stage=_most_severe_repair_stage(issues),
            issues=list(issues),
            reviewer_model=reviewer_model,
            reviewer_prompt_version=reviewer_prompt_version,
            started_at=started_at,
            finished_at=finished_at,
            cost_usd_shadow=cost_usd_shadow,
            safety_field_failed=safety_failed_paths,
        )


# ---------------------------------------------------------------------------
# Stage6RunSummary
# ---------------------------------------------------------------------------


class Stage6RunSummary(BaseModel):
    """Run-level rollup over per-page reviews (D-077 §2.5).

    ``run_level_issues`` carries findings that aren't tied to a single
    page — currently the D13 glossary self-consistency detector. They
    contribute to ``overall_verdict`` and ``safety_failed`` but not to
    page-level ``pass_rate``."""

    model_config = ConfigDict(extra="forbid", strict=True, use_enum_values=False)

    cert_id: str = Field(..., min_length=1)
    run_id: str = Field(..., min_length=1)
    stage: Literal[6] = 6
    pages: list[Stage6PageReview] = Field(default_factory=list)
    total_pages: int = Field(..., ge=0)
    pass_pages: int = Field(..., ge=0)
    warn_pages: int = Field(..., ge=0)
    fail_pages: int = Field(..., ge=0)
    pass_rate: float = Field(..., ge=0.0, le=1.0)
    overall_verdict: Verdict
    safety_failed: bool
    most_severe_repair_stage: Literal["4", "4.5", "5", "7"] | None = None
    started_at: str = Field(..., min_length=1)
    finished_at: str = Field(..., min_length=1)
    cost_usd_shadow_total: float = Field(..., ge=0.0)
    run_level_issues: list[Stage6Issue] = Field(default_factory=list)

    @classmethod
    def from_pages(
        cls,
        *,
        cert_id: str,
        run_id: str,
        pages: list[Stage6PageReview],
        started_at: str,
        finished_at: str,
        run_level_issues: list[Stage6Issue] | None = None,
    ) -> Stage6RunSummary:
        total = len(pages)
        pass_count = sum(1 for p in pages if p.overall_verdict == Verdict.PASS)
        warn_count = sum(1 for p in pages if p.overall_verdict == Verdict.WARN)
        fail_count = sum(1 for p in pages if p.overall_verdict == Verdict.FAIL)
        pass_rate = pass_count / total if total else 1.0

        rli = list(run_level_issues or [])
        rli_has_fail = any(i.severity == Stage6IssueSeverity.FAIL for i in rli)
        rli_has_warn = any(i.severity == Stage6IssueSeverity.WARN for i in rli)
        rli_safety_failed = any(
            i.severity == Stage6IssueSeverity.FAIL and i.safety_field is not None
            for i in rli
        )

        safety_failed = any(p.safety_field_failed for p in pages) or rli_safety_failed

        if fail_count or safety_failed or rli_has_fail:
            overall = Verdict.FAIL
        elif warn_count or rli_has_warn:
            overall = Verdict.WARN
        else:
            overall = Verdict.PASS

        candidate_stages: list[str] = [
            p.most_severe_repair_stage
            for p in pages
            if p.most_severe_repair_stage is not None
            and p.overall_verdict in (Verdict.FAIL, Verdict.WARN)
        ]
        if rli:
            candidate_stages.extend(
                i.repair_stage for i in rli
                if i.severity in (Stage6IssueSeverity.FAIL, Stage6IssueSeverity.WARN)
            )
        if candidate_stages:
            most_severe = min(
                candidate_stages, key=lambda s: _REPAIR_STAGE_SORT_KEY[s]
            )
        else:
            most_severe = None

        return cls(
            cert_id=cert_id,
            run_id=run_id,
            pages=list(pages),
            total_pages=total,
            pass_pages=pass_count,
            warn_pages=warn_count,
            fail_pages=fail_count,
            pass_rate=pass_rate,
            overall_verdict=overall,
            safety_failed=safety_failed,
            most_severe_repair_stage=most_severe,
            started_at=started_at,
            finished_at=finished_at,
            cost_usd_shadow_total=sum(p.cost_usd_shadow for p in pages),
            run_level_issues=rli,
        )
