"""Unit tests for Stage 2 page classification (no real Claude calls)."""
from __future__ import annotations

import json
from pathlib import Path

import pytest

from cert_extractor.audit.verdict import Verdict
from cert_extractor.budget.monitor import BudgetMonitor, CapLevels
from cert_extractor.llm.claude_client import ClaudeResponse
from cert_extractor.pipeline.stage2_classify import (
    PageClassifier,
    Stage2PageClassifier,
    parse_classifier_response,
)
from cert_extractor.schema.page_labels import PageLabel

pytestmark = pytest.mark.unit


# --------- parse_classifier_response ----------------------------------------


def test_parse_clean_json() -> None:
    raw = '{"label": "toc", "confidence": 0.95, "reasoning": "目次"}'
    lp = parse_classifier_response(page_number=10, raw=raw)
    assert lp.label is PageLabel.TOC
    assert lp.confidence == 0.95
    assert lp.reasoning == "目次"


def test_parse_handles_code_fence() -> None:
    raw = "```json\n{\"label\": \"content\", \"confidence\": 0.8}\n```"
    lp = parse_classifier_response(page_number=30, raw=raw)
    assert lp.label is PageLabel.CONTENT


def test_parse_handles_chatter_around_json() -> None:
    raw = "Sure! Here's the answer: {\"label\":\"exam\",\"confidence\":0.7}\nLet me know."
    lp = parse_classifier_response(page_number=42, raw=raw)
    assert lp.label is PageLabel.EXAM


def test_parse_unknown_label_falls_back_to_other() -> None:
    raw = '{"label": "preface", "confidence": 0.9}'
    lp = parse_classifier_response(page_number=5, raw=raw)
    assert lp.label is PageLabel.OTHER
    assert lp.confidence == 0.0
    assert "unknown label" in lp.reasoning


def test_parse_clamps_confidence() -> None:
    lp = parse_classifier_response(1, '{"label":"cover","confidence":2.5}')
    assert lp.confidence == 1.0
    lp = parse_classifier_response(1, '{"label":"cover","confidence":-0.4}')
    assert lp.confidence == 0.0


def test_parse_no_json_at_all() -> None:
    lp = parse_classifier_response(1, "I don't know")
    assert lp.label is PageLabel.OTHER
    assert "no JSON object" in lp.reasoning


def test_parse_garbage_json() -> None:
    lp = parse_classifier_response(1, "{this is not json}")
    assert lp.label is PageLabel.OTHER
    assert "parse_error" in lp.reasoning


# --------- PageClassifier (with fake ClaudeClient) --------------------------


class _FakeClient:
    def __init__(self, responses: list[ClaudeResponse]):
        self._responses = list(responses)
        self.calls: list[tuple[str, str, str | None]] = []

    def call(self, system: str, user: str, tier=None) -> ClaudeResponse:
        self.calls.append((system, user, tier))
        return self._responses.pop(0)


def test_classifier_routes_to_client_with_tier() -> None:
    fake = _FakeClient(
        [ClaudeResponse(text='{"label":"content","confidence":0.9}', tokens_input=20, tokens_output=10)]
    )
    classifier = PageClassifier(client=fake, tier="sonnet")  # type: ignore[arg-type]
    labeled, resp = classifier.classify(page_number=30, ocr_text="本文...")
    assert labeled.label is PageLabel.CONTENT
    assert labeled.page_number == 30
    assert resp.tokens_input == 20
    assert fake.calls[0][2] == "sonnet"


# --------- Stage2PageClassifier (file orchestration) ------------------------


def _seed_ocr_dir(tmp_path: Path, pages: dict[int, str]) -> Path:
    ocr = tmp_path / "ocr"
    ocr.mkdir()
    for n, text in pages.items():
        (ocr / f"page_{n:03d}.md").write_text(text, encoding="utf-8")
    return ocr


def test_stage2_runner_writes_one_json_per_page(tmp_path: Path) -> None:
    ocr = _seed_ocr_dir(tmp_path, {1: "cover-ish", 10: "toc-ish", 30: "content-ish"})
    fake = _FakeClient(
        [
            ClaudeResponse(text='{"label":"cover","confidence":0.95}', tokens_input=10, tokens_output=5),
            ClaudeResponse(text='{"label":"toc","confidence":0.92}', tokens_input=12, tokens_output=6),
            ClaudeResponse(text='{"label":"content","confidence":0.88}', tokens_input=300, tokens_output=15),
        ]
    )
    classifier = PageClassifier(client=fake, tier="sonnet")  # type: ignore[arg-type]
    runner = Stage2PageClassifier(classifier=classifier)

    result = runner.run(
        ocr_dir=ocr,
        run_dir=tmp_path,
        cert_id="itpassport_r6",
        run_id="dry_run_test",
    )

    assert result.pages_classified == 3
    assert result.fail_count == 0
    assert result.halted_verdict is None
    assert result.by_label == {"cover": 1, "toc": 1, "content": 1}

    # Each output file is valid JSON for LabeledPage.
    classified_dir = Path(result.output_dir)
    p1 = json.loads((classified_dir / "page_001.json").read_text())
    assert p1["label"] == "cover"
    p30 = json.loads((classified_dir / "page_030.json").read_text())
    assert p30["page_number"] == 30
    # Cost was attributed to stage 2 in cost.json.
    cost = json.loads(Path(result.cost_path).read_text())
    assert "2" in cost["by_stage"]
    assert cost["by_stage"]["2"]["calls"] == 3


def test_stage2_runner_records_failures_without_halting(tmp_path: Path) -> None:
    """One bad LLM response should not stop the run by itself."""
    ocr = _seed_ocr_dir(tmp_path, {1: "p1", 2: "p2", 3: "p3"})

    class _Boom(_FakeClient):
        def call(self, system, user, tier=None):
            self.calls.append((system, user, tier))
            page_number = int(user.split("ページ番号:")[1].split()[0])
            if page_number == 2:
                raise RuntimeError("simulated transient")
            return ClaudeResponse(text='{"label":"content","confidence":0.8}')

    classifier = PageClassifier(client=_Boom([]), tier="sonnet")  # type: ignore[arg-type]
    runner = Stage2PageClassifier(classifier=classifier)
    result = runner.run(
        ocr_dir=ocr,
        run_dir=tmp_path,
        cert_id="itpassport_r6",
        run_id="dry_run_test",
    )

    # Pages 1 and 3 succeeded; page 2 failed. Not enough fails to trip default cap.
    assert result.pages_classified == 2
    assert result.fail_count == 1
    assert result.failures and "page_002" in result.failures[0]


def test_stage2_runner_honors_page_limit(tmp_path: Path) -> None:
    ocr = _seed_ocr_dir(tmp_path, {n: f"p{n}" for n in range(1, 11)})
    fake = _FakeClient(
        [ClaudeResponse(text='{"label":"content","confidence":0.9}') for _ in range(3)]
    )
    classifier = PageClassifier(client=fake, tier="sonnet")  # type: ignore[arg-type]
    runner = Stage2PageClassifier(classifier=classifier)

    result = runner.run(
        ocr_dir=ocr,
        run_dir=tmp_path,
        cert_id="itpassport_r6",
        run_id="dry_run_test",
        page_limit=3,
    )
    assert result.pages_classified == 3
    classified = sorted(p.name for p in Path(result.output_dir).iterdir())
    assert classified == ["page_001.json", "page_002.json", "page_003.json"]


def test_stage2_runner_skip_existing_does_not_call_classifier_for_done_pages(tmp_path: Path) -> None:
    """skip_existing=True must short-circuit pages with existing classified/page_NNN.json."""
    ocr = _seed_ocr_dir(tmp_path, {n: f"p{n}" for n in range(1, 6)})
    out_dir = tmp_path / "classified"
    out_dir.mkdir(parents=True, exist_ok=True)
    # Pre-seed pages 1, 2, 3 as already classified
    for n in (1, 2, 3):
        (out_dir / f"page_{n:03d}.json").write_text(
            '{"page_number":' + str(n) + ',"label":"content","confidence":0.9}',
            encoding="utf-8",
        )
    # Classifier only has 2 responses — enough for pages 4 and 5; if it gets called
    # for pages 1-3 the StopIteration / index error would surface as a runner failure.
    fake = _FakeClient(
        [ClaudeResponse(text='{"label":"content","confidence":0.9}') for _ in range(2)]
    )
    classifier = PageClassifier(client=fake, tier="sonnet")  # type: ignore[arg-type]
    runner = Stage2PageClassifier(classifier=classifier)

    result = runner.run(
        ocr_dir=ocr,
        run_dir=tmp_path,
        cert_id="itpassport_r6",
        run_id="dry_run_skip_existing",
        skip_existing=True,
    )
    assert result.pages_classified == 2
    assert result.fail_count == 0
    classified = sorted(p.name for p in Path(result.output_dir).iterdir())
    assert classified == [f"page_{n:03d}.json" for n in range(1, 6)]


def test_stage2_runner_halts_on_fail_cap(tmp_path: Path) -> None:
    ocr = _seed_ocr_dir(tmp_path, {n: f"p{n}" for n in range(1, 21)})

    class _AlwaysFails(_FakeClient):
        def call(self, system, user, tier=None):
            raise RuntimeError("always-fail")

    classifier = PageClassifier(client=_AlwaysFails([]), tier="sonnet")  # type: ignore[arg-type]
    monitor = BudgetMonitor(
        soft=CapLevels(wall_time_seconds=10**9, mistral_usd=10**9, anthropic_usd=10**9, fail_count=3),
        hard=CapLevels(wall_time_seconds=10**9, mistral_usd=10**9, anthropic_usd=10**9, fail_count=5),
    )
    runner = Stage2PageClassifier(classifier=classifier, monitor=monitor)

    result = runner.run(
        ocr_dir=ocr,
        run_dir=tmp_path,
        cert_id="itpassport_r6",
        run_id="dry_run_test",
    )
    assert result.halted_verdict in (Verdict.WARN, Verdict.FAIL)
    assert result.fail_count >= 3
