"""Cost tracking dataclasses (per D-072).

Per-stage cost is the source of truth (lives inside evidence file field 16,
per D-062). The aggregator ``cost.json`` is what ``BudgetMonitor`` reads.

This module models the JSON shape and provides helpers to update / persist it;
it does NOT do the network/LLM accounting itself — that lives in the
plugin / pipeline layer where the SDK responses are observed.
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo


@dataclass
class StageCost:
    """Per-stage rollup, mirrored from evidence file field 16 (D-062)."""

    tokens: int = 0
    usd: float = 0.0
    calls: int = 0


@dataclass
class CostSummary:
    """Run-total accounting (D-072 §2.2 ``current`` block)."""

    wall_time_seconds: float = 0.0
    mistral_pages: int = 0
    mistral_usd: float = 0.0
    anthropic_tokens_input: int = 0
    anthropic_tokens_output: int = 0
    anthropic_usd: float = 0.0
    fail_count: int = 0


@dataclass
class CostFile:
    """Top-level ``cost.json`` shape (D-072 §2.2)."""

    run_id: str
    cert_id: str
    started_at: str = field(
        default_factory=lambda: datetime.now(tz=ZoneInfo("Asia/Tokyo")).isoformat()
    )
    current: CostSummary = field(default_factory=CostSummary)
    by_stage: dict[int, StageCost] = field(default_factory=dict)
    caps: dict[str, dict[str, float]] = field(default_factory=dict)


class CostTracker:
    """File-backed accumulator for ``cost.json`` (per D-072).

    The on-disk file is the canonical state — every mutation flushes to disk
    so that an interrupted run leaves a recoverable summary for the
    ``BudgetMonitor``.
    """

    def __init__(self, path: Path | str, run_id: str, cert_id: str):
        self.path = Path(path)
        if self.path.exists():
            self._state = self._load()
        else:
            self._state = CostFile(run_id=run_id, cert_id=cert_id)

    @property
    def current(self) -> CostSummary:
        return self._state.current

    def stage(self, stage_id: int) -> StageCost:
        return self._state.by_stage.setdefault(stage_id, StageCost())

    def add_mistral(self, pages: int, usd: float, stage_id: int = 1) -> None:
        self._state.current.mistral_pages += pages
        self._state.current.mistral_usd += usd
        s = self.stage(stage_id)
        s.calls += pages
        s.usd += usd
        self._flush()

    def add_anthropic(
        self,
        stage_id: int,
        tokens_input: int,
        tokens_output: int,
        usd: float,
        calls: int = 1,
    ) -> None:
        self._state.current.anthropic_tokens_input += tokens_input
        self._state.current.anthropic_tokens_output += tokens_output
        self._state.current.anthropic_usd += usd
        s = self.stage(stage_id)
        s.tokens += tokens_input + tokens_output
        s.usd += usd
        s.calls += calls
        self._flush()

    def add_wall_time(self, seconds: float) -> None:
        self._state.current.wall_time_seconds += seconds
        self._flush()

    def add_fail(self, count: int = 1) -> None:
        self._state.current.fail_count += count
        self._flush()

    def set_caps(self, soft: dict[str, float], hard: dict[str, float]) -> None:
        self._state.caps = {"soft_warn_at": soft, "hard_halt_at": hard}
        self._flush()

    def to_dict(self) -> dict:
        return {
            "run_id": self._state.run_id,
            "cert_id": self._state.cert_id,
            "started_at": self._state.started_at,
            "current": self._state.current.__dict__,
            "by_stage": {
                str(k): v.__dict__ for k, v in self._state.by_stage.items()
            },
            "caps": self._state.caps,
        }

    def _flush(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps(self.to_dict(), indent=2), encoding="utf-8")

    def _load(self) -> CostFile:
        raw = json.loads(self.path.read_text(encoding="utf-8"))
        cf = CostFile(
            run_id=raw["run_id"],
            cert_id=raw["cert_id"],
            started_at=raw.get("started_at", ""),
            caps=raw.get("caps", {}),
        )
        cur = raw.get("current", {})
        cf.current = CostSummary(**{k: cur.get(k, 0) for k in CostSummary().__dict__})
        for k, v in raw.get("by_stage", {}).items():
            cf.by_stage[int(k)] = StageCost(**{f: v.get(f, 0) for f in StageCost().__dict__})
        return cf
