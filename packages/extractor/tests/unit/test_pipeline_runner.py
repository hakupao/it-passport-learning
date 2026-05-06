"""Unit tests for pipeline.runner.Stage0_1DryRunner with mocked plugins."""
import json
from pathlib import Path

import pytest
from pydantic import BaseModel

from cert_extractor.audit.verdict import Verdict
from cert_extractor.budget.monitor import BudgetMonitor, CapLevels
from cert_extractor.pipeline.runner import Stage0_1DryRunner
from cert_extractor.plugins.base import (
    OCREngine,
    OCRResult,
    PageList,
    SourceReader,
)


class _DummyConfig(BaseModel):
    pass


class _MockSource(SourceReader):
    description = "mock"
    supported_axes = ["source"]
    config_schema = _DummyConfig
    __cert_extractor_min_version__ = "0.1.0"

    def __init__(self, num_pages: int = 5):
        self.num_pages = num_pages

    def list_pages(self, source_path: str, output_dir: str) -> PageList:
        out = Path(output_dir)
        out.mkdir(parents=True, exist_ok=True)
        pages = []
        for i in range(1, self.num_pages + 1):
            p = out / f"page_{i:03d}.jpg"
            p.write_bytes(b"fake")
            pages.append(str(p))
        return PageList(pages=pages, metadata={"image_entries": self.num_pages})


class _MockOCR(OCREngine):
    description = "mock"
    supported_axes = ["ocr"]
    config_schema = _DummyConfig
    __cert_extractor_min_version__ = "0.1.0"

    def __init__(self, fail_after: int | None = None):
        self.fail_after = fail_after
        self.calls = 0

    def ocr_page(self, page_path: str) -> OCRResult:
        self.calls += 1
        if self.fail_after is not None and self.calls > self.fail_after:
            raise RuntimeError("fake OCR failure")
        return OCRResult(
            text=f"# OCR for {Path(page_path).name}\n\nfake text",
            cost_usd=0.001,
            pages_processed=1,
        )


def test_happy_path(tmp_path: Path):
    runner = Stage0_1DryRunner(source_plugin=_MockSource(num_pages=3), ocr_plugin=_MockOCR())
    result = runner.run(
        source_path="dummy",
        run_dir=tmp_path / "run1",
        cert_id="test_cert",
        run_id="run1",
        page_limit=10,
    )
    assert result.pages_unpacked == 3
    assert result.pages_ocrd == 3
    assert result.fail_count == 0
    assert result.halted_verdict is None

    # Output files exist
    ocr_dir = tmp_path / "run1" / "ocr"
    assert (ocr_dir / "page_001.md").read_text().startswith("# OCR for page_001.jpg")
    assert (tmp_path / "run1" / "cost.json").exists()


def test_page_limit_respected(tmp_path: Path):
    runner = Stage0_1DryRunner(source_plugin=_MockSource(num_pages=10), ocr_plugin=_MockOCR())
    result = runner.run(
        source_path="dummy",
        run_dir=tmp_path / "run2",
        cert_id="c",
        run_id="run2",
        page_limit=4,
    )
    assert result.pages_unpacked == 10  # source extracted all
    assert result.pages_ocrd == 4  # but OCR only ran on 4


def test_cost_json_written(tmp_path: Path):
    runner = Stage0_1DryRunner(source_plugin=_MockSource(num_pages=2), ocr_plugin=_MockOCR())
    runner.run(
        source_path="dummy",
        run_dir=tmp_path / "run3",
        cert_id="c",
        run_id="run3",
    )
    cost = json.loads((tmp_path / "run3" / "cost.json").read_text())
    assert cost["run_id"] == "run3"
    assert cost["current"]["mistral_pages"] == 2
    assert cost["current"]["mistral_usd"] == pytest.approx(0.002)
    assert "soft_warn_at" in cost["caps"]
    assert "hard_halt_at" in cost["caps"]


def test_halt_on_hard_cap_fail_count(tmp_path: Path):
    """Per D-071: hard cap on fail_count halts run."""
    monitor = BudgetMonitor(
        soft=CapLevels(7200, 5.0, 5.0, 1),
        hard=CapLevels(7200 * 2, 10.0, 10.0, 2),
    )
    runner = Stage0_1DryRunner(
        source_plugin=_MockSource(num_pages=10),
        ocr_plugin=_MockOCR(fail_after=0),  # every call fails
        budget_monitor=monitor,
    )
    result = runner.run(
        source_path="dummy",
        run_dir=tmp_path / "run4",
        cert_id="c",
        run_id="run4",
    )
    assert result.halted_verdict in (Verdict.WARN, Verdict.FAIL)
    assert result.fail_count >= 1
