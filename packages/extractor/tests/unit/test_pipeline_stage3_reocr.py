"""Unit tests for Stage 3 conditional hard re-OCR (no real Claude calls)."""
from __future__ import annotations

import json
from pathlib import Path

import pytest

from cert_extractor.audit.verdict import Verdict
from cert_extractor.budget.monitor import BudgetMonitor, CapLevels
from cert_extractor.llm.claude_client import ClaudeResponse
from cert_extractor.pipeline.stage3_reocr import (
    ReOCRResult,
    Stage3HardReocr,
    VisionReOCREngine,
)

pytestmark = pytest.mark.unit


# A tiny bit of Japanese prose that will pass the heuristic.
_GOOD_PAGE_TEXT = (
    "経営理念とは、会社の運営方針を決定するための「最も基本的、かつ大切な指針」です。"
    "経営者は経営理念に従って企業を運営し、会社に関するあらゆることは、経営理念に沿って決められます。"
    "ストラテジやマネジメントなどの分野についても学習を進めていきますが、それらの知識はすべて経営理念につながっています。"
)

# The known-degenerate pattern: Chinese-only repetition.
_BAD_PAGE_TEXT = "“哈，你是个小伙子，" + "你是个小伙子，" * 80


class _FakeEngine:
    """Mocks VisionReOCREngine; records calls + returns canned results."""

    def __init__(self, responses: dict[int, str]):
        self.responses = responses
        self.calls: list[Path] = []

    def reocr(self, image_path: Path) -> ReOCRResult:
        self.calls.append(image_path)
        page_number = int(image_path.stem.split("_")[1])
        text = self.responses.get(page_number, "# rerun")
        return ReOCRResult(
            text=text,
            response=ClaudeResponse(text=text, tokens_input=500, tokens_output=300, cost_usd=0.04),
        )


def _seed(tmp_path: Path, ocr_pages: dict[int, str], image_pages: set[int]) -> tuple[Path, Path]:
    ocr_dir = tmp_path / "ocr"
    raw_dir = tmp_path / "raw" / "pages"
    ocr_dir.mkdir(parents=True)
    raw_dir.mkdir(parents=True)
    for n, text in ocr_pages.items():
        (ocr_dir / f"page_{n:03d}.md").write_text(text, encoding="utf-8")
    for n in image_pages:
        (raw_dir / f"page_{n:03d}.jpg").write_bytes(b"fake-jpg-bytes")
    return ocr_dir, raw_dir


# --------- VisionReOCREngine wires the right SDK options --------------------


def test_vision_engine_passes_read_tool_and_accept_edits() -> None:
    """The Vision engine must request the Read tool + skip permission prompts."""
    captured: dict = {}

    class _RecorderClient:
        def call(self, **kwargs) -> ClaudeResponse:
            captured.update(kwargs)
            return ClaudeResponse(text="# OCR'd", tokens_input=10, tokens_output=20, cost_usd=0.01)

    engine = VisionReOCREngine(client=_RecorderClient())  # type: ignore[arg-type]
    out = engine.reocr(Path("/tmp/page_002.jpg"))

    assert out.text == "# OCR'd"
    assert captured["allowed_tools"] == ["Read"]
    assert captured["permission_mode"] == "acceptEdits"
    assert captured["max_turns"] >= 2  # needs Read round-trip + assistant message
    # The user prompt must mention the file path so Claude actually reads it.
    assert "/tmp/page_002.jpg" in captured["user"]


# --------- Stage3HardReocr orchestration ------------------------------------


def test_stage3_skips_clean_pages_and_reocrs_degenerate(tmp_path: Path) -> None:
    ocr = {
        1: _GOOD_PAGE_TEXT,    # clean → skipped
        2: _BAD_PAGE_TEXT,     # degenerate → re-OCR
        3: _GOOD_PAGE_TEXT,    # clean → skipped
    }
    ocr_dir, raw_dir = _seed(tmp_path, ocr, image_pages={1, 2, 3})
    fake = _FakeEngine(responses={2: "# fixed\nclean japanese here"})
    runner = Stage3HardReocr(engine=fake)  # type: ignore[arg-type]

    result = runner.run(
        ocr_dir=ocr_dir,
        raw_dir=raw_dir,
        run_dir=tmp_path,
        cert_id="itpassport_r6",
        run_id="dry_run_test",
    )

    assert result.pages_inspected == 3
    assert result.pages_flagged == 1
    assert result.pages_reocrd == 1
    assert result.flagged_pages == [2]
    assert [p.name for p in fake.calls] == ["page_002.jpg"]

    cleaned_dir = Path(result.output_dir)
    cleaned_files = sorted(p.name for p in cleaned_dir.iterdir())
    assert cleaned_files == ["page_002.md"]
    assert "fixed" in (cleaned_dir / "page_002.md").read_text()


def test_stage3_records_quality_for_every_page(tmp_path: Path) -> None:
    ocr = {1: _GOOD_PAGE_TEXT, 2: _BAD_PAGE_TEXT}
    ocr_dir, raw_dir = _seed(tmp_path, ocr, image_pages={1, 2})
    fake = _FakeEngine(responses={2: "# fixed"})
    runner = Stage3HardReocr(engine=fake)  # type: ignore[arg-type]

    result = runner.run(
        ocr_dir=ocr_dir,
        raw_dir=raw_dir,
        run_dir=tmp_path,
        cert_id="itpassport_r6",
        run_id="dry_run_test",
    )

    page_to_qv = dict(result.quality_log)
    assert not page_to_qv[1].degenerate
    assert page_to_qv[2].degenerate


def test_stage3_force_pages_overrides_heuristic(tmp_path: Path) -> None:
    """Operator can force re-OCR on specific pages even when heuristic passes."""
    ocr = {7: _GOOD_PAGE_TEXT}
    ocr_dir, raw_dir = _seed(tmp_path, ocr, image_pages={7})
    fake = _FakeEngine(responses={7: "# forced rerun"})
    runner = Stage3HardReocr(engine=fake)  # type: ignore[arg-type]

    result = runner.run(
        ocr_dir=ocr_dir,
        raw_dir=raw_dir,
        run_dir=tmp_path,
        cert_id="itpassport_r6",
        run_id="dry_run_test",
        force_pages=[7],
    )
    assert result.pages_reocrd == 1
    assert result.flagged_pages == [7]


def test_stage3_missing_image_records_failure(tmp_path: Path) -> None:
    ocr = {2: _BAD_PAGE_TEXT}
    ocr_dir, raw_dir = _seed(tmp_path, ocr, image_pages=set())  # NO image files
    fake = _FakeEngine(responses={})
    runner = Stage3HardReocr(engine=fake)  # type: ignore[arg-type]

    result = runner.run(
        ocr_dir=ocr_dir,
        raw_dir=raw_dir,
        run_dir=tmp_path,
        cert_id="itpassport_r6",
        run_id="dry_run_test",
    )
    assert result.pages_flagged == 1
    assert result.pages_reocrd == 0
    assert result.fail_count == 1
    assert "image not found" in result.failures[0]


def test_stage3_engine_exception_records_failure(tmp_path: Path) -> None:
    ocr = {2: _BAD_PAGE_TEXT}
    ocr_dir, raw_dir = _seed(tmp_path, ocr, image_pages={2})

    class _BoomEngine(_FakeEngine):
        def reocr(self, image_path: Path) -> ReOCRResult:
            raise RuntimeError("vision-down")

    runner = Stage3HardReocr(engine=_BoomEngine(responses={}))  # type: ignore[arg-type]

    result = runner.run(
        ocr_dir=ocr_dir,
        raw_dir=raw_dir,
        run_dir=tmp_path,
        cert_id="itpassport_r6",
        run_id="dry_run_test",
    )
    assert result.fail_count == 1
    assert "vision-down" in result.failures[0]


def test_stage3_halts_on_fail_cap(tmp_path: Path) -> None:
    ocr = {n: _BAD_PAGE_TEXT for n in range(1, 11)}
    ocr_dir, raw_dir = _seed(tmp_path, ocr, image_pages=set(range(1, 11)))

    class _AlwaysFails(_FakeEngine):
        def reocr(self, image_path: Path) -> ReOCRResult:
            raise RuntimeError("always-down")

    monitor = BudgetMonitor(
        soft=CapLevels(wall_time_seconds=10**9, mistral_usd=10**9, anthropic_usd=10**9, fail_count=2),
        hard=CapLevels(wall_time_seconds=10**9, mistral_usd=10**9, anthropic_usd=10**9, fail_count=4),
    )
    runner = Stage3HardReocr(engine=_AlwaysFails(responses={}), monitor=monitor)  # type: ignore[arg-type]

    result = runner.run(
        ocr_dir=ocr_dir,
        raw_dir=raw_dir,
        run_dir=tmp_path,
        cert_id="itpassport_r6",
        run_id="dry_run_test",
    )
    assert result.halted_verdict in (Verdict.WARN, Verdict.FAIL)
    assert result.fail_count >= 2


def test_stage3_output_subdir_routes_writes(tmp_path: Path) -> None:
    """Vision-vs-Mistral comparison runs need to land in a parallel dir."""
    ocr = {1: _GOOD_PAGE_TEXT}
    ocr_dir, raw_dir = _seed(tmp_path, ocr, image_pages={1})
    fake = _FakeEngine(responses={1: "# vision-output"})
    runner = Stage3HardReocr(engine=fake)  # type: ignore[arg-type]
    result = runner.run(
        ocr_dir=ocr_dir,
        raw_dir=raw_dir,
        run_dir=tmp_path,
        cert_id="itpassport_r6",
        run_id="dry_run_test",
        force_pages=[1],
        output_subdir="vision_full",
    )
    assert result.pages_reocrd == 1
    assert (tmp_path / "vision_full" / "page_001.md").exists()
    assert "vision-output" in (tmp_path / "vision_full" / "page_001.md").read_text()
    assert not (tmp_path / "cleaned" / "page_001.md").exists()


def test_stage3_skip_existing_avoids_double_billing(tmp_path: Path) -> None:
    """With skip_existing=True, an already-re-OCR'd page in --output-subdir is not re-billed."""
    ocr = {2: _BAD_PAGE_TEXT}
    ocr_dir, raw_dir = _seed(tmp_path, ocr, image_pages={2})
    cleaned_dir = tmp_path / "cleaned"
    cleaned_dir.mkdir()
    (cleaned_dir / "page_002.md").write_text("# already done", encoding="utf-8")

    fake = _FakeEngine(responses={})
    runner = Stage3HardReocr(engine=fake)  # type: ignore[arg-type]
    result = runner.run(
        ocr_dir=ocr_dir,
        raw_dir=raw_dir,
        run_dir=tmp_path,
        cert_id="itpassport_r6",
        run_id="dry_run_test",
        skip_existing=True,
    )
    assert result.pages_reocrd == 0
    assert fake.calls == []
    # Existing page is preserved.
    assert (cleaned_dir / "page_002.md").read_text() == "# already done"


def test_stage3_attributes_cost_to_stage_3(tmp_path: Path) -> None:
    ocr = {2: _BAD_PAGE_TEXT}
    ocr_dir, raw_dir = _seed(tmp_path, ocr, image_pages={2})
    fake = _FakeEngine(responses={2: "# fixed"})
    runner = Stage3HardReocr(engine=fake)  # type: ignore[arg-type]

    result = runner.run(
        ocr_dir=ocr_dir,
        raw_dir=raw_dir,
        run_dir=tmp_path,
        cert_id="itpassport_r6",
        run_id="dry_run_test",
    )
    cost = json.loads(Path(result.cost_path).read_text())
    assert "3" in cost["by_stage"]
    assert cost["by_stage"]["3"]["calls"] == 1
    assert cost["by_stage"]["3"]["usd"] > 0
