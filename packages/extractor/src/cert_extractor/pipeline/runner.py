"""Stage 0+1 dry-run runner (per D-073 Stage A subset / D-070 dry-run scope).

This runner intentionally implements **only stage 0 (unpack) and stage 1 (OCR)**
— per D-070, dry-run scope is a single chapter / ~50 pages of stage 0+1 only.
The full-book stage 0~7 runner is separate and lands after dry-run user retro.

Budget enforcement (D-071) and cost tracking (D-072) are wired in: the runner
honors soft / hard caps and writes ``cost.json`` after every page.
"""
from __future__ import annotations

import time
from dataclasses import dataclass, field
from pathlib import Path

from cert_extractor.audit.verdict import Verdict
from cert_extractor.budget.cost import CostTracker
from cert_extractor.budget.monitor import BudgetMonitor
from cert_extractor.plugins.base import OCREngine, SourceReader


@dataclass
class DryRunResult:
    """Outcome of a stage 0+1 dry-run."""

    run_id: str
    cert_id: str
    chapter_index: int | None
    pages_unpacked: int
    pages_ocrd: int
    output_dir: str
    cost_path: str
    halted_verdict: Verdict | None = None
    fail_count: int = 0
    failures: list[str] = field(default_factory=list)


class Stage0_1DryRunner:
    """Coordinates source unpack + Mistral OCR for a dry-run.

    Does **not** invoke any audit (per D-070 dry-run only validates OCR
    quality at user-review time, not via reviewer LLM).
    """

    def __init__(
        self,
        source_plugin: SourceReader,
        ocr_plugin: OCREngine,
        budget_monitor: BudgetMonitor | None = None,
    ):
        self.source = source_plugin
        self.ocr = ocr_plugin
        self.monitor = budget_monitor or BudgetMonitor()

    def run(
        self,
        source_path: str,
        run_dir: Path | str,
        cert_id: str,
        run_id: str,
        chapter_index: int | None = None,
        page_limit: int | None = 50,
    ) -> DryRunResult:
        """Execute stage 0 (unpack) + stage 1 (OCR) for a dry-run."""
        run_dir = Path(run_dir)
        raw_dir = run_dir / "raw" / "pages"
        ocr_dir = run_dir / "ocr"
        raw_dir.mkdir(parents=True, exist_ok=True)
        ocr_dir.mkdir(parents=True, exist_ok=True)

        cost_path = run_dir / "cost.json"
        tracker = CostTracker(cost_path, run_id=run_id, cert_id=cert_id)
        tracker.set_caps(
            soft={
                "wall_time_seconds": self.monitor.soft.wall_time_seconds,
                "mistral_usd": self.monitor.soft.mistral_usd,
                "anthropic_usd": self.monitor.soft.anthropic_usd,
                "fail_count": self.monitor.soft.fail_count,
            },
            hard={
                "wall_time_seconds": self.monitor.hard.wall_time_seconds,
                "mistral_usd": self.monitor.hard.mistral_usd,
                "anthropic_usd": self.monitor.hard.anthropic_usd,
                "fail_count": self.monitor.hard.fail_count,
            },
        )

        # Stage 0: unpack
        t0 = time.monotonic()
        page_list = self.source.list_pages(source_path, str(raw_dir))
        tracker.add_wall_time(time.monotonic() - t0)

        # Apply page limit (dry-run scope per D-070).
        pages = page_list.pages
        if page_limit is not None:
            pages = pages[:page_limit]

        # Stage 1: OCR each page.
        failures: list[str] = []
        ocrd = 0
        verdict: Verdict | None = None

        for page_path in pages:
            t1 = time.monotonic()
            try:
                result = self.ocr.ocr_page(page_path)
            except Exception as exc:
                failures.append(f"{page_path}: {type(exc).__name__}: {exc}")
                tracker.add_fail()
                tracker.add_wall_time(time.monotonic() - t1)
                verdict = self._budget_check(tracker)
                if verdict in (Verdict.FAIL, Verdict.WARN):
                    break
                continue

            tracker.add_mistral(pages=1, usd=result.cost_usd, stage_id=1)
            tracker.add_wall_time(time.monotonic() - t1)

            page_name = Path(page_path).stem
            (ocr_dir / f"{page_name}.md").write_text(result.text, encoding="utf-8")
            ocrd += 1

            verdict = self._budget_check(tracker)
            if verdict in (Verdict.FAIL, Verdict.WARN):
                break

        return DryRunResult(
            run_id=run_id,
            cert_id=cert_id,
            chapter_index=chapter_index,
            pages_unpacked=len(page_list.pages),
            pages_ocrd=ocrd,
            output_dir=str(run_dir),
            cost_path=str(cost_path),
            halted_verdict=verdict if verdict in (Verdict.FAIL, Verdict.WARN) else None,
            fail_count=len(failures),
            failures=failures,
        )

    def _budget_check(self, tracker: CostTracker) -> Verdict:
        return self.monitor.check(
            {
                "wall_time_seconds": tracker.current.wall_time_seconds,
                "mistral_usd": tracker.current.mistral_usd,
                "anthropic_usd": tracker.current.anthropic_usd,
                "fail_count": tracker.current.fail_count,
            }
        )
