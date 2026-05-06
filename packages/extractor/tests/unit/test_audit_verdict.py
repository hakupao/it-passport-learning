"""Unit tests for audit/verdict.py (D-063)."""
import pytest

from cert_extractor.audit.verdict import (
    DEFAULT_SAFETY_FIELDS,
    Verdict,
    determine_verdict,
)


class TestThresholds:
    def test_pass_at_or_above_90pct(self):
        assert determine_verdict(9, 1) == Verdict.PASS  # 90%
        assert determine_verdict(95, 5) == Verdict.PASS  # 95%

    def test_warn_band_80_to_90(self):
        assert determine_verdict(8, 2) == Verdict.WARN  # 80%
        assert determine_verdict(85, 15) == Verdict.WARN  # 85%

    def test_fail_below_80(self):
        assert determine_verdict(7, 3) == Verdict.FAIL  # 70%

    def test_below_warn_threshold_is_fail(self):
        assert determine_verdict(70, 30) == Verdict.FAIL  # 70%


class TestSafetyFieldVeto:
    def test_safety_field_failure_forces_fail_even_at_pass_rate(self):
        # 99% pass rate but Question.answer_index failed → FAIL
        v = determine_verdict(
            pass_count=99,
            fail_count=1,
            failed_safety_fields={"Question.answer_index"},
        )
        assert v == Verdict.FAIL

    def test_non_safety_field_failure_does_not_veto(self):
        # 99% pass rate, non-safety failure → still PASS
        v = determine_verdict(
            pass_count=99,
            fail_count=1,
            failed_safety_fields={"Term.definition.en"},
        )
        assert v == Verdict.PASS

    def test_default_safety_fields_includes_critical_set(self):
        for required in (
            "Question.answer_index",
            "Term.surface.jp",
            "Entity.type",
            "Envelope.cert_id",
            "Envelope.schema_version",
        ):
            assert required in DEFAULT_SAFETY_FIELDS


class TestEdgeCases:
    def test_empty_sample_set_raises(self):
        with pytest.raises(ValueError):
            determine_verdict(0, 0)

    def test_all_pass(self):
        assert determine_verdict(10, 0) == Verdict.PASS

    def test_all_fail(self):
        assert determine_verdict(0, 10) == Verdict.FAIL

    def test_custom_thresholds(self):
        v = determine_verdict(
            pass_count=8,
            fail_count=2,
            pass_threshold=0.95,
            warn_threshold=0.85,
        )
        # 80% < 85% → FAIL with custom warn threshold
        assert v == Verdict.FAIL
