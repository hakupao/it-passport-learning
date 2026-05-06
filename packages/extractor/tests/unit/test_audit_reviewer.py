"""Unit tests for audit/reviewer.py (D-061)."""
import pytest

from cert_extractor.audit.reviewer import (
    REVIEWER_MAP,
    ReviewerHistory,
    select_reviewer,
)


class TestMapping:
    def test_default_stage1_ocr_scientist_sonnet(self):
        assert select_reviewer(stage=1) == ("scientist", "sonnet")

    def test_default_stage4_structure_code_reviewer_sonnet(self):
        assert select_reviewer(stage=4) == ("code-reviewer", "sonnet")

    def test_default_stage6_audit_verifier_sonnet(self):
        assert select_reviewer(stage=6) == ("verifier", "sonnet")

    def test_unknown_stage_raises(self):
        with pytest.raises(KeyError):
            select_reviewer(stage=99)


class TestPromotion:
    def test_consecutive_fail_promotes_to_opus(self):
        history = ReviewerHistory(consecutive_fails=1)
        assert select_reviewer(stage=4, history=history)[1] == "opus"

    def test_safety_field_fail_promotes_to_opus(self):
        history = ReviewerHistory(has_safety_field_fail=True)
        assert select_reviewer(stage=4, history=history)[1] == "opus"

    def test_first_onboarding_promotes_to_opus(self):
        history = ReviewerHistory(is_first_onboarding=True)
        assert select_reviewer(stage=4, history=history)[1] == "opus"


class TestDemotion:
    def test_5_pass_non_critical_demotes_to_haiku(self):
        history = ReviewerHistory(consecutive_passes=5, is_critical=False)
        assert select_reviewer(stage=4, history=history)[1] == "haiku"

    def test_5_pass_but_critical_stays_sonnet(self):
        history = ReviewerHistory(consecutive_passes=5, is_critical=True)
        assert select_reviewer(stage=4, history=history)[1] == "sonnet"

    def test_4_pass_does_not_demote(self):
        history = ReviewerHistory(consecutive_passes=4, is_critical=False)
        assert select_reviewer(stage=4, history=history)[1] == "sonnet"


class TestOverride:
    def test_yaml_override_wins(self):
        result = select_reviewer(stage=5, override=("verifier", "opus"))
        assert result == ("verifier", "opus")


class TestMappingIntegrity:
    def test_only_audit_required_stages_present(self):
        # Per D-060: stages {1, 3, 4, 5, 6} are audit-required.
        assert set(REVIEWER_MAP.keys()) == {1, 3, 4, 5, 6}

    def test_all_default_models_are_sonnet(self):
        for spec in REVIEWER_MAP.values():
            assert spec.default_model == "sonnet"
