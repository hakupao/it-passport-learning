"""Unit tests for budget/cost.py (D-072)."""
import json
from pathlib import Path

from cert_extractor.budget.cost import CostTracker


def test_create_and_persist(tmp_path: Path):
    cost_path = tmp_path / "cost.json"
    tracker = CostTracker(cost_path, run_id="r1", cert_id="itpassport_r6")
    assert cost_path.exists() is False  # not flushed yet
    tracker.add_mistral(pages=10, usd=0.01, stage_id=1)
    assert cost_path.exists()
    data = json.loads(cost_path.read_text())
    assert data["run_id"] == "r1"
    assert data["current"]["mistral_pages"] == 10
    assert data["by_stage"]["1"]["calls"] == 10


def test_anthropic_accumulation(tmp_path: Path):
    tracker = CostTracker(tmp_path / "cost.json", "r1", "c1")
    tracker.add_anthropic(stage_id=5, tokens_input=1000, tokens_output=500, usd=0.0)
    tracker.add_anthropic(stage_id=5, tokens_input=2000, tokens_output=1000, usd=0.0)
    assert tracker.current.anthropic_tokens_input == 3000
    assert tracker.current.anthropic_tokens_output == 1500
    assert tracker.stage(5).calls == 2
    assert tracker.stage(5).tokens == 4500


def test_reload_from_disk(tmp_path: Path):
    cost_path = tmp_path / "cost.json"
    t1 = CostTracker(cost_path, "r1", "c1")
    t1.add_mistral(pages=5, usd=0.005)
    t1.add_fail(2)
    # New tracker reading the same file should restore state.
    t2 = CostTracker(cost_path, "r1", "c1")
    assert t2.current.mistral_pages == 5
    assert t2.current.fail_count == 2


def test_caps_set_persisted(tmp_path: Path):
    tracker = CostTracker(tmp_path / "cost.json", "r1", "c1")
    tracker.set_caps(
        soft={"wall_time_seconds": 7200, "mistral_usd": 5.0},
        hard={"wall_time_seconds": 28800, "mistral_usd": 20.0},
    )
    data = json.loads((tmp_path / "cost.json").read_text())
    assert data["caps"]["soft_warn_at"]["wall_time_seconds"] == 7200
