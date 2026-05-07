"""Unit tests for Stage 6 audit reviewer schema (D-077 §2.3 + §2.4 + §2.5)."""
from __future__ import annotations

import pytest
from cert_extractor.audit.verdict import DEFAULT_SAFETY_FIELDS, Verdict
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
from pydantic import ValidationError

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


def _issue(
    *,
    issue_type: str = "translation_unfaithful",
    severity: Stage6IssueSeverity = Stage6IssueSeverity.WARN,
    detector: Stage6IssueDetector = Stage6IssueDetector.llm,
    entity_path: str = "page_014.entities[0].caption",
    safety_field: str | None = None,
    rationale: str = "demo",
    issue_id: str = "L3-page_014-0001",
    evidence: dict[str, str] | None = None,
) -> Stage6Issue:
    return Stage6Issue(
        id=issue_id,
        issue_type=issue_type,
        severity=severity,
        dimension=DIMENSION_BY_ISSUE_TYPE[issue_type],
        repair_stage=REPAIR_STAGE_BY_ISSUE_TYPE[issue_type],
        detector=detector,
        entity_path=entity_path,
        evidence=evidence or {"jp": "demo", "zh": "demo", "en": "demo"},
        rationale=rationale,
        safety_field=safety_field,
    )


def _page_review_kwargs() -> dict:
    return dict(
        cert_id="itpassport_r6",
        run_id="dry_run_2026-05-06T16-58-10",
        page=14,
        leaves_audited=14,
        leaves_total=14,
        reviewer_model="claude-opus-4-7",
        reviewer_prompt_version="v1.0",
        started_at="2026-05-07T20:00:00+09:00",
        finished_at="2026-05-07T20:00:30+09:00",
        cost_usd_shadow=0.42,
    )


# ---------------------------------------------------------------------------
# Tables
# ---------------------------------------------------------------------------


class TestRepairStageTable:
    def test_known_issue_types_match_repair_stage_table_keys(self):
        assert set(KNOWN_ISSUE_TYPES) == set(REPAIR_STAGE_BY_ISSUE_TYPE.keys())

    def test_known_issue_types_match_dimension_table_keys(self):
        assert set(KNOWN_ISSUE_TYPES) == set(DIMENSION_BY_ISSUE_TYPE.keys())

    def test_repair_stage_values_are_closed_set(self):
        assert set(REPAIR_STAGE_BY_ISSUE_TYPE.values()) <= {"4", "4.5", "5", "7"}

    def test_required_phase1_issue_types_present(self):
        # The 13 deterministic detectors of D-077 §2.1.
        for t in (
            "jp_mutation",
            "untranslated_residue",
            "schema_invalid",
            "answer_index_out_of_range",
            "answer_index_mismatch",
            "choice_marker_inconsistent",
            "numeric_inconsistent",
            "glossary_lock_violated",
            "glossary_lock_missed",
            "redundant_nested_parens",
            "kana_helper_missing",
            "kana_helper_unexpected",
            "kana_helper_format",
            "glossary_surface_concept_split",
        ):
            assert t in KNOWN_ISSUE_TYPES, f"missing deterministic issue_type {t}"

    def test_required_phase2_issue_types_present(self):
        # The 4 LLM detector categories of D-077 §2.1.
        for t in (
            "translation_hallucination",
            "translation_omission",
            "translation_unfaithful",
            "term_translation_idiomatic",
        ):
            assert t in KNOWN_ISSUE_TYPES, f"missing llm issue_type {t}"

    def test_safety_class_issue_types_route_to_stage_4(self):
        # Per D-077 §2.4: answer_index_* must repair at Stage 4.
        assert REPAIR_STAGE_BY_ISSUE_TYPE["answer_index_out_of_range"] == "4"
        assert REPAIR_STAGE_BY_ISSUE_TYPE["answer_index_mismatch"] == "4"

    def test_jp_mutation_routes_to_stage_5(self):
        assert REPAIR_STAGE_BY_ISSUE_TYPE["jp_mutation"] == "5"

    def test_choice_marker_routes_to_stage_7_export_normalize(self):
        assert REPAIR_STAGE_BY_ISSUE_TYPE["choice_marker_inconsistent"] == "7"

    def test_kana_helper_issues_route_to_stage_4_5(self):
        for t in ("kana_helper_missing", "kana_helper_unexpected", "kana_helper_format"):
            assert REPAIR_STAGE_BY_ISSUE_TYPE[t] == "4.5"


# ---------------------------------------------------------------------------
# Stage6Issue validation
# ---------------------------------------------------------------------------


class TestStage6IssueValidation:
    def test_minimal_issue_constructs(self):
        i = _issue()
        assert i.severity == Stage6IssueSeverity.WARN
        assert i.dimension == Stage6IssueDimension.fidelity
        assert i.repair_stage == "5"
        assert i.detector == Stage6IssueDetector.llm

    def test_unknown_issue_type_rejected(self):
        with pytest.raises(ValidationError):
            Stage6Issue(
                id="X-1",
                issue_type="not_a_real_issue_type",
                severity=Stage6IssueSeverity.WARN,
                dimension=Stage6IssueDimension.fidelity,
                repair_stage="5",
                detector=Stage6IssueDetector.llm,
                entity_path="page_014.entities[0]",
                evidence={"jp": "x", "zh": "y", "en": "z"},
                rationale="x",
            )

    def test_repair_stage_inconsistent_with_issue_type_rejected(self):
        with pytest.raises(ValidationError):
            Stage6Issue(
                id="L3-1",
                issue_type="translation_unfaithful",  # routes to 5
                severity=Stage6IssueSeverity.WARN,
                dimension=Stage6IssueDimension.fidelity,
                repair_stage="4",  # WRONG
                detector=Stage6IssueDetector.llm,
                entity_path="page_014.entities[0].caption",
                evidence={"jp": "x", "zh": "y", "en": "z"},
                rationale="x",
            )

    def test_dimension_inconsistent_with_issue_type_rejected(self):
        with pytest.raises(ValidationError):
            Stage6Issue(
                id="D1-1",
                issue_type="jp_mutation",  # learner_data
                severity=Stage6IssueSeverity.FAIL,
                dimension=Stage6IssueDimension.fidelity,  # WRONG
                repair_stage="5",
                detector=Stage6IssueDetector.deterministic,
                entity_path="page_045.entities[0].surface.jp",
                evidence={"jp": "x", "zh": "y", "en": "z"},
                rationale="x",
            )

    def test_safety_field_must_be_in_default_safety_set(self):
        with pytest.raises(ValidationError):
            _issue(safety_field="Some.Made.Up.Field")

    def test_safety_field_recognized(self):
        i = _issue(
            issue_type="answer_index_mismatch",
            severity=Stage6IssueSeverity.FAIL,
            detector=Stage6IssueDetector.deterministic,
            entity_path="page_043.entities[0].answer_index",
            safety_field="Question.answer_index",
        )
        assert i.safety_field == "Question.answer_index"
        assert i.safety_field in DEFAULT_SAFETY_FIELDS


# ---------------------------------------------------------------------------
# Verdict composition (D-077 §2.5)
# ---------------------------------------------------------------------------


class TestComposePageVerdicts:
    def test_no_issues_pass(self):
        page = Stage6PageReview.from_issues(issues=[], **_page_review_kwargs())
        assert page.translation_fidelity_verdict == Verdict.PASS
        assert page.learner_data_verdict == Verdict.PASS
        assert page.overall_verdict == Verdict.PASS
        assert page.most_severe_repair_stage is None
        assert page.safety_field_failed == []

    def test_only_info_keeps_pass(self):
        page = Stage6PageReview.from_issues(
            issues=[_issue(issue_type="kana_helper_format", severity=Stage6IssueSeverity.INFO)],
            **_page_review_kwargs(),
        )
        assert page.learner_data_verdict == Verdict.PASS
        assert page.overall_verdict == Verdict.PASS

    def test_warn_only_warns(self):
        page = Stage6PageReview.from_issues(
            issues=[_issue(issue_type="translation_unfaithful", severity=Stage6IssueSeverity.WARN)],
            **_page_review_kwargs(),
        )
        assert page.translation_fidelity_verdict == Verdict.WARN
        assert page.learner_data_verdict == Verdict.PASS
        assert page.overall_verdict == Verdict.WARN

    def test_fail_in_fidelity_fails_overall(self):
        page = Stage6PageReview.from_issues(
            issues=[
                _issue(
                    issue_type="translation_hallucination",
                    severity=Stage6IssueSeverity.FAIL,
                ),
            ],
            **_page_review_kwargs(),
        )
        assert page.translation_fidelity_verdict == Verdict.FAIL
        assert page.learner_data_verdict == Verdict.PASS
        assert page.overall_verdict == Verdict.FAIL

    def test_fail_in_learner_data_fails_overall(self):
        page = Stage6PageReview.from_issues(
            issues=[
                _issue(
                    issue_type="jp_mutation",
                    severity=Stage6IssueSeverity.FAIL,
                    detector=Stage6IssueDetector.deterministic,
                    entity_path="page_045.entities[0].surface.jp",
                    safety_field="Term.surface.jp",
                )
            ],
            **_page_review_kwargs(),
        )
        assert page.learner_data_verdict == Verdict.FAIL
        assert page.overall_verdict == Verdict.FAIL
        assert page.safety_field_failed == ["Term.surface.jp"]

    def test_most_severe_repair_stage_picks_smallest_on_tie(self):
        # FAIL @ stage 4 (answer_index) + FAIL @ stage 5 (jp_mutation): stage 4 wins.
        kw = _page_review_kwargs()
        kw["page"] = 43
        page = Stage6PageReview.from_issues(
            issues=[
                _issue(
                    issue_type="answer_index_mismatch",
                    severity=Stage6IssueSeverity.FAIL,
                    detector=Stage6IssueDetector.deterministic,
                    entity_path="page_043.entities[0].answer_index",
                    safety_field="Question.answer_index",
                    issue_id="D5-page_043-0001",
                ),
                _issue(
                    issue_type="jp_mutation",
                    severity=Stage6IssueSeverity.FAIL,
                    detector=Stage6IssueDetector.deterministic,
                    entity_path="page_043.entities[2].stem.jp",
                    issue_id="D1-page_043-0001",
                ),
            ],
            **kw,
        )
        assert page.most_severe_repair_stage == "4"

    def test_most_severe_picks_fail_over_warn(self):
        kw = _page_review_kwargs()
        page = Stage6PageReview.from_issues(
            issues=[
                _issue(
                    issue_type="redundant_nested_parens",  # WARN, repair 7
                    severity=Stage6IssueSeverity.WARN,
                    detector=Stage6IssueDetector.deterministic,
                    issue_id="D10-page_045-0001",
                ),
                _issue(
                    issue_type="translation_omission",  # FAIL, repair 5
                    severity=Stage6IssueSeverity.FAIL,
                    issue_id="L2-page_045-0001",
                ),
            ],
            **kw,
        )
        assert page.most_severe_repair_stage == "5"


class TestSafetyOverride:
    def test_safety_failed_aggregated(self):
        kw = _page_review_kwargs()
        kw["page"] = 43
        page = Stage6PageReview.from_issues(
            issues=[
                _issue(
                    issue_type="answer_index_mismatch",
                    severity=Stage6IssueSeverity.FAIL,
                    detector=Stage6IssueDetector.deterministic,
                    entity_path="page_043.entities[0].answer_index",
                    safety_field="Question.answer_index",
                    issue_id="D5-page_043-0001",
                ),
                _issue(
                    issue_type="jp_mutation",
                    severity=Stage6IssueSeverity.FAIL,
                    detector=Stage6IssueDetector.deterministic,
                    entity_path="page_043.entities[2].surface.jp",
                    safety_field="Term.surface.jp",
                    issue_id="D1-page_043-0001",
                ),
            ],
            **kw,
        )
        assert set(page.safety_field_failed) == {"Question.answer_index", "Term.surface.jp"}
        assert page.overall_verdict == Verdict.FAIL


# ---------------------------------------------------------------------------
# Stage6RunSummary aggregation
# ---------------------------------------------------------------------------


class TestStage6RunSummary:
    def _make_pages(self) -> list[Stage6PageReview]:
        clean = Stage6PageReview.from_issues(issues=[], **_page_review_kwargs())

        warn_page_kw = _page_review_kwargs()
        warn_page_kw["page"] = 45
        warn_page_kw["cost_usd_shadow"] = 1.10
        warn = Stage6PageReview.from_issues(
            issues=[
                _issue(
                    issue_type="redundant_nested_parens",
                    severity=Stage6IssueSeverity.WARN,
                    detector=Stage6IssueDetector.deterministic,
                    entity_path="page_045.entities[16].definition.en",
                    issue_id="D10-page_045-0001",
                )
            ],
            **warn_page_kw,
        )

        fail_page_kw = _page_review_kwargs()
        fail_page_kw["page"] = 43
        fail_page_kw["cost_usd_shadow"] = 1.5
        fail = Stage6PageReview.from_issues(
            issues=[
                _issue(
                    issue_type="answer_index_mismatch",
                    severity=Stage6IssueSeverity.FAIL,
                    detector=Stage6IssueDetector.deterministic,
                    entity_path="page_043.entities[0].answer_index",
                    safety_field="Question.answer_index",
                    issue_id="D5-page_043-0001",
                )
            ],
            **fail_page_kw,
        )
        return [clean, warn, fail]

    def test_aggregate_pass_warn_fail_counts(self):
        summary = Stage6RunSummary.from_pages(
            cert_id="itpassport_r6",
            run_id="dry_run_2026-05-06T16-58-10",
            pages=self._make_pages(),
            started_at="2026-05-07T20:00:00+09:00",
            finished_at="2026-05-07T20:01:00+09:00",
        )
        assert summary.total_pages == 3
        assert summary.pass_pages == 1
        assert summary.warn_pages == 1
        assert summary.fail_pages == 1
        assert summary.pass_rate == pytest.approx(1 / 3)

    def test_safety_failed_propagates_to_run_summary(self):
        summary = Stage6RunSummary.from_pages(
            cert_id="itpassport_r6",
            run_id="dry_run_2026-05-06T16-58-10",
            pages=self._make_pages(),
            started_at="2026-05-07T20:00:00+09:00",
            finished_at="2026-05-07T20:01:00+09:00",
        )
        assert summary.safety_failed is True
        assert summary.overall_verdict == Verdict.FAIL
        assert summary.most_severe_repair_stage == "4"

    def test_clean_run_passes(self):
        clean_only = [Stage6PageReview.from_issues(issues=[], **_page_review_kwargs())]
        summary = Stage6RunSummary.from_pages(
            cert_id="itpassport_r6",
            run_id="dry_run_2026-05-06T16-58-10",
            pages=clean_only,
            started_at="2026-05-07T20:00:00+09:00",
            finished_at="2026-05-07T20:00:10+09:00",
        )
        assert summary.overall_verdict == Verdict.PASS
        assert summary.safety_failed is False
        assert summary.pass_rate == 1.0

    def test_cost_usd_shadow_total_sums(self):
        summary = Stage6RunSummary.from_pages(
            cert_id="itpassport_r6",
            run_id="dry_run_2026-05-06T16-58-10",
            pages=self._make_pages(),
            started_at="2026-05-07T20:00:00+09:00",
            finished_at="2026-05-07T20:01:00+09:00",
        )
        assert summary.cost_usd_shadow_total == pytest.approx(0.42 + 1.10 + 1.5)


# ---------------------------------------------------------------------------
# Serialization
# ---------------------------------------------------------------------------


class TestSerialization:
    def test_page_review_round_trips_via_json(self):
        page = Stage6PageReview.from_issues(
            issues=[
                _issue(
                    issue_type="redundant_nested_parens",
                    severity=Stage6IssueSeverity.WARN,
                    detector=Stage6IssueDetector.deterministic,
                    entity_path="page_045.entities[16].definition.en",
                    issue_id="D10-page_045-0001",
                )
            ],
            **_page_review_kwargs(),
        )
        raw = page.model_dump_json()
        page2 = Stage6PageReview.model_validate_json(raw)
        assert page2 == page

    def test_run_summary_round_trips_via_json(self):
        clean = Stage6PageReview.from_issues(issues=[], **_page_review_kwargs())
        summary = Stage6RunSummary.from_pages(
            cert_id="itpassport_r6",
            run_id="dry_run_2026-05-06T16-58-10",
            pages=[clean],
            started_at="2026-05-07T20:00:00+09:00",
            finished_at="2026-05-07T20:00:10+09:00",
        )
        raw = summary.model_dump_json()
        summary2 = Stage6RunSummary.model_validate_json(raw)
        assert summary2 == summary
