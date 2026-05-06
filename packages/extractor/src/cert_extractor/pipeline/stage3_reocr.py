"""Stage 3 hard re-OCR (per D-008 stage 3 + D-007 Vision).

Stage 3 is **conditionally triggered**: it consumes Stage 1 OCR output +
Stage 2 classified labels, runs the OCR-quality heuristic from
``pipeline.quality``, and re-OCRs only the pages flagged degenerate.

Vision access path (per D-069 §2.1 — no direct ``anthropic`` SDK import):
this stage uses claude-agent-sdk in tool-enabled mode with the ``Read``
tool allowed. Claude Code's Read tool ingests images natively, so the
prompt instructs the model to Read the page image and emit faithful OCR
markdown. Output lands at ``data/<cert>/runs/<run_id>/cleaned/page_NNN.md``.
"""
from __future__ import annotations

import re
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Protocol

from cert_extractor.audit.verdict import Verdict
from cert_extractor.budget.cost import CostTracker
from cert_extractor.budget.monitor import BudgetMonitor
from cert_extractor.llm.claude_client import ClaudeClient, ClaudeResponse, ModelTier
from cert_extractor.pipeline.quality import QualityVerdict, assess

STAGE_ID = 3

VISION_REOCR_SYSTEM_PROMPT = """\
You are a meticulous OCR transcription engine for Japanese certification
exam textbooks. You receive the absolute path to one page image and must
produce faithful Markdown that preserves the original page's content and
visual structure.

Procedure:
1. Read the file at the supplied path using the Read tool. Claude Code
   ingests images natively; you will see the page contents.
2. Transcribe the page text into Markdown.

Output rules:
- Preserve heading hierarchy (#, ##, ###).
- Preserve bullet lists, numbered lists, and table layouts (Markdown
  tables OK).
- Embed image references using `![alt](page-relative-name.jpeg)` if the
  page has figures.
- Preserve original Japanese (do not translate). Hiragana / Katakana /
  Kanji as they appear on the page.
- Do not invent content. If a region is unreadable, emit `<!-- unreadable -->`.

Output ONLY the markdown body for the page — no preamble, no commentary,
no JSON wrapper.
"""

USER_PROMPT_TEMPLATE = """\
Re-OCR the textbook page at this absolute path:

{image_path}

Read the image, then output the Markdown transcription.
"""


@dataclass
class ReOCRResult:
    """Outcome of one Vision re-OCR call."""

    text: str
    response: ClaudeResponse


class _PageBackend(Protocol):
    def reocr(self, image_path: Path) -> ReOCRResult: ...


@dataclass
class VisionReOCREngine:
    """Wraps ClaudeClient with the Read-tool allowance needed for Vision.

    Per D-069 §2.1 we never import ``anthropic`` directly; the Read tool
    inside Claude Code is the SDK-supported path for image ingestion.
    """

    client: ClaudeClient
    tier: ModelTier | str = "sonnet"

    def reocr(self, image_path: Path) -> ReOCRResult:
        prompt = USER_PROMPT_TEMPLATE.format(image_path=str(image_path.resolve()))
        response = self.client.call(
            system=VISION_REOCR_SYSTEM_PROMPT,
            user=prompt,
            tier=self.tier,
            allowed_tools=["Read"],
            permission_mode="acceptEdits",
            max_turns=4,  # Read tool round-trip + final assistant message
        )
        return ReOCRResult(text=response.text, response=response)


@dataclass
class Stage3Result:
    """Outcome of Stage 3 hard re-OCR across one OCR directory."""

    run_id: str
    cert_id: str
    pages_inspected: int
    pages_flagged: int
    pages_reocrd: int
    output_dir: str
    cost_path: str
    halted_verdict: Verdict | None = None
    fail_count: int = 0
    failures: list[str] = field(default_factory=list)
    flagged_pages: list[int] = field(default_factory=list)
    quality_log: list[tuple[int, QualityVerdict]] = field(default_factory=list)


_PAGE_FILE_RE = re.compile(r"^page_(\d+)\.md$")


@dataclass
class Stage3HardReocr:
    """Conditional Stage 3 runner.

    Reads ``ocr_dir`` (Stage 1 markdown), evaluates each page with the
    quality heuristic, and re-OCRs only the degenerate ones via
    ``VisionReOCREngine``. Pass-through pages are NOT re-emitted to
    ``cleaned/``; downstream stages should fall back to ``ocr/`` when
    a page has no ``cleaned/`` counterpart (per D-008 stage 3 design —
    re-OCR is sparse).
    """

    engine: VisionReOCREngine
    monitor: BudgetMonitor = field(default_factory=BudgetMonitor)

    def run(
        self,
        ocr_dir: Path | str,
        raw_dir: Path | str,
        run_dir: Path | str,
        cert_id: str,
        run_id: str,
        page_limit: int | None = None,
        force_pages: list[int] | None = None,
    ) -> Stage3Result:
        ocr_dir = Path(ocr_dir)
        raw_dir = Path(raw_dir)
        run_dir = Path(run_dir)
        out_dir = run_dir / "cleaned"
        out_dir.mkdir(parents=True, exist_ok=True)

        pages = self._sorted_page_files(ocr_dir)
        if page_limit is not None:
            pages = pages[:page_limit]

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

        force_set = set(force_pages or [])
        failures: list[str] = []
        flagged: list[int] = []
        quality_log: list[tuple[int, QualityVerdict]] = []
        verdict: Verdict | None = None
        reocrd = 0
        inspected = 0

        for page_path, page_number in pages:
            inspected += 1
            text = page_path.read_text(encoding="utf-8")
            qv = assess(text)
            quality_log.append((page_number, qv))

            should_reocr = qv.degenerate or (page_number in force_set)
            if not should_reocr:
                continue

            flagged.append(page_number)
            image_path = raw_dir / f"page_{page_number:03d}.jpg"
            if not image_path.exists():
                failures.append(f"page_{page_number:03d}: image not found at {image_path}")
                tracker.add_fail()
                verdict = self._budget_check(tracker)
                if verdict in (Verdict.FAIL, Verdict.WARN):
                    break
                continue

            t0 = time.monotonic()
            try:
                result = self.engine.reocr(image_path)
            except Exception as exc:
                failures.append(f"page_{page_number:03d}: {type(exc).__name__}: {exc}")
                tracker.add_fail()
                tracker.add_wall_time(time.monotonic() - t0)
                verdict = self._budget_check(tracker)
                if verdict in (Verdict.FAIL, Verdict.WARN):
                    break
                continue

            tracker.add_anthropic(
                stage_id=STAGE_ID,
                tokens_input=result.response.tokens_input,
                tokens_output=result.response.tokens_output,
                usd=result.response.cost_usd,
            )
            tracker.add_wall_time(time.monotonic() - t0)

            (out_dir / f"page_{page_number:03d}.md").write_text(
                result.text, encoding="utf-8"
            )
            reocrd += 1

            verdict = self._budget_check(tracker)
            if verdict in (Verdict.FAIL, Verdict.WARN):
                break

        return Stage3Result(
            run_id=run_id,
            cert_id=cert_id,
            pages_inspected=inspected,
            pages_flagged=len(flagged),
            pages_reocrd=reocrd,
            output_dir=str(out_dir),
            cost_path=str(cost_path),
            halted_verdict=verdict if verdict in (Verdict.FAIL, Verdict.WARN) else None,
            fail_count=len(failures),
            failures=failures,
            flagged_pages=flagged,
            quality_log=quality_log,
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

    @staticmethod
    def _sorted_page_files(ocr_dir: Path) -> list[tuple[Path, int]]:
        out: list[tuple[Path, int]] = []
        for path in ocr_dir.iterdir():
            match = _PAGE_FILE_RE.match(path.name)
            if match:
                out.append((path, int(match.group(1))))
        out.sort(key=lambda item: item[1])
        return out


def make_engine_factory(
    tier: ModelTier | str = "sonnet",
    max_budget_usd: float | None = None,
):
    """Returns a zero-arg factory used by the CLI to defer Claude import."""

    def _factory() -> VisionReOCREngine:
        client = ClaudeClient(max_budget_usd=max_budget_usd)
        return VisionReOCREngine(client=client, tier=tier)

    return _factory
