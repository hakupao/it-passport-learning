"""Unit tests for budget/monitor.py (D-071)."""
import pytest

from cert_extractor.audit.verdict import Verdict
from cert_extractor.budget.monitor import (
    DEFAULT_HARD,
    DEFAULT_SOFT,
    BudgetMonitor,
    CapLevels,
)


class TestDefaultThresholds:
    def test_default_caps_match_d071(self):
        # Per D-071 §2.1
        assert DEFAULT_SOFT.wall_time_seconds == 7200
        assert DEFAULT_SOFT.mistral_usd == 5.0
        assert DEFAULT_SOFT.fail_count == 10
        assert DEFAULT_HARD.wall_time_seconds == 28800
        assert DEFAULT_HARD.mistral_usd == 20.0
        assert DEFAULT_HARD.fail_count == 30


class TestVerdict:
    def setup_method(self):
        self.monitor = BudgetMonitor()

    def test_zero_usage_passes(self):
        assert self.monitor.check({"wall_time_seconds": 0}) == Verdict.PASS

    def test_below_soft_passes(self):
        assert (
            self.monitor.check(
                {
                    "wall_time_seconds": 1000,
                    "mistral_usd": 1.0,
                    "anthropic_usd": 1.0,
                    "fail_count": 0,
                }
            )
            == Verdict.PASS
        )

    def test_at_soft_warns(self):
        assert (
            self.monitor.check(
                {
                    "wall_time_seconds": 7200,  # = soft cap
                    "mistral_usd": 0,
                    "anthropic_usd": 0,
                    "fail_count": 0,
                }
            )
            == Verdict.WARN
        )

    def test_at_hard_fails(self):
        assert (
            self.monitor.check(
                {
                    "wall_time_seconds": 28800,  # = hard cap
                }
            )
            == Verdict.FAIL
        )

    def test_above_hard_fails(self):
        assert (
            self.monitor.check(
                {
                    "mistral_usd": 25.0,  # > hard 20
                }
            )
            == Verdict.FAIL
        )

    def test_only_one_dim_over_hard_is_enough(self):
        # All others are 0; fail_count alone triggers FAIL.
        assert self.monitor.check({"fail_count": 30}) == Verdict.FAIL


class TestAntiMistakeClamp:
    """Per D-071 v1.1: hard cap may not exceed soft cap × 10."""

    def test_default_caps_pass_clamp(self):
        # The shipped defaults (anthropic 5/30 ratio 6) must validate cleanly.
        BudgetMonitor()  # no exception

    def test_hard_cannot_exceed_soft_times_10(self):
        bad_hard = CapLevels(
            wall_time_seconds=7200 * 11,  # > soft × 10
            mistral_usd=50,
            anthropic_usd=50,
            fail_count=100,
        )
        with pytest.raises(ValueError, match="cannot exceed"):
            BudgetMonitor(soft=DEFAULT_SOFT, hard=bad_hard)

    def test_hard_below_soft_rejected(self):
        bad_hard = CapLevels(
            wall_time_seconds=1000,  # < soft 7200
            mistral_usd=20,
            anthropic_usd=30,
            fail_count=30,
        )
        with pytest.raises(ValueError, match="must be >="):
            BudgetMonitor(soft=DEFAULT_SOFT, hard=bad_hard)

    def test_soft_must_be_positive(self):
        bad_soft = CapLevels(
            wall_time_seconds=0,
            mistral_usd=5,
            anthropic_usd=5,
            fail_count=10,
        )
        with pytest.raises(ValueError, match="must be > 0"):
            BudgetMonitor(soft=bad_soft)

    def test_hard_at_soft_x10_accepted(self):
        ok_hard = CapLevels(
            wall_time_seconds=7200 * 10,
            mistral_usd=50,
            anthropic_usd=50,
            fail_count=100,
        )
        # Should not raise.
        BudgetMonitor(soft=DEFAULT_SOFT, hard=ok_hard)
