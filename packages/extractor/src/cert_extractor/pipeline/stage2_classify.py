"""Stage 2 page classification (per D-008 stage 2 + D-069 LLM access).

Page classification is a pipeline transformation, not one of the 4 plugin
axes (D-021), so it lives under ``pipeline/`` rather than ``plugins/``. It
consumes Stage 1 OCR markdown files and emits one JSON file per page under
``data/<cert_id>/runs/<run_id>/classified/``.

The actual Claude call goes through ``ClaudeClient`` (per D-069). This module
is testable without touching the network: the runner accepts an injected
client and the classifier accepts an injected callable.
"""
from __future__ import annotations

import json
import re
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, Protocol

from cert_extractor.audit.verdict import Verdict
from cert_extractor.budget.cost import CostTracker
from cert_extractor.budget.monitor import BudgetMonitor
from cert_extractor.llm.claude_client import ClaudeClient, ClaudeResponse, ModelTier
from cert_extractor.schema.page_labels import LabeledPage, PageLabel

STAGE_ID = 2

VALID_LABELS = {label.value for label in PageLabel}

PAGE_CLASSIFY_SYSTEM_PROMPT = """\
あなたは IT パスポート試験対策教科書のページ分類器です. OCR で抽出された
1 ページの Markdown を読み, 次のラベルから 1 つ選んでください:

- cover            : 表紙 / 裏表紙 / 帯
- toc              : 目次
- chapter_title    : 章 / 節の扉ページ (本文ほぼ無し)
- content          : 通常の解説本文 (図表含む)
- exam             : 「出る順」「過去問」などの問題集ページ
- glossary         : 用語索引 / 用語一覧
- index            : 巻末索引
- blank            : ほぼ白紙 / 余白のみ
- other            : 上記いずれにも該当しない

出力は **JSON 1 行** で, 必ず以下の 3 キーのみ:

{"label": "<上のラベル>", "confidence": <0.0-1.0 の数値>, "reasoning": "<30 字以内の根拠>"}

JSON 以外は一切出力しないでください. ラベルに迷う場合 confidence < 0.7
を付けて other を返さず最も近いラベルを選んでください.
"""

USER_PROMPT_TEMPLATE = """\
ページ番号: {page_number}

--- OCR 本文ここから ---
{ocr_text}
--- OCR 本文ここまで ---
"""


class _ClassifierBackend(Protocol):
    """Anything that can turn (page_number, ocr_text) into a LabeledPage."""

    def classify(self, page_number: int, ocr_text: str) -> tuple[LabeledPage, ClaudeResponse]: ...


@dataclass
class PageClassifier:
    """LLM-driven classifier (per D-008 stage 2).

    ``client`` defaults to a fresh ``ClaudeClient``; tests inject a fake.
    """

    client: ClaudeClient
    tier: ModelTier | str = "sonnet"

    def classify(self, page_number: int, ocr_text: str) -> tuple[LabeledPage, ClaudeResponse]:
        user = USER_PROMPT_TEMPLATE.format(page_number=page_number, ocr_text=ocr_text)
        response = self.client.call(
            system=PAGE_CLASSIFY_SYSTEM_PROMPT,
            user=user,
            tier=self.tier,
        )
        labeled = parse_classifier_response(page_number=page_number, raw=response.text)
        return labeled, response


_JSON_OBJECT_RE = re.compile(r"\{[^{}]*\}", re.DOTALL)


def parse_classifier_response(page_number: int, raw: str) -> LabeledPage:
    """Tolerantly parse the model's JSON output into a ``LabeledPage``.

    The model is asked for a single JSON line, but real responses sometimes
    add code fences or explanatory text. We extract the first JSON object and
    fall back to ``OTHER`` with confidence 0 if nothing usable is present —
    Stage 6 audit (per D-063) will catch these via fail-rate tracking.
    """
    text = raw.strip()
    candidate = _first_json_object(text)
    if candidate is None:
        return LabeledPage(
            page_number=page_number,
            label=PageLabel.OTHER,
            confidence=0.0,
            reasoning="parse_error: no JSON object",
        )
    try:
        payload = json.loads(candidate)
    except json.JSONDecodeError as exc:
        return LabeledPage(
            page_number=page_number,
            label=PageLabel.OTHER,
            confidence=0.0,
            reasoning=f"parse_error: {exc.msg}",
        )

    label_raw = str(payload.get("label", "")).strip().lower()
    if label_raw not in VALID_LABELS:
        return LabeledPage(
            page_number=page_number,
            label=PageLabel.OTHER,
            confidence=0.0,
            reasoning=f"unknown label: {label_raw or '<missing>'}",
        )
    label = PageLabel(label_raw)

    confidence_raw = payload.get("confidence", 0.0)
    try:
        confidence = float(confidence_raw)
    except (TypeError, ValueError):
        confidence = 0.0
    confidence = max(0.0, min(1.0, confidence))

    reasoning = str(payload.get("reasoning", "") or "").strip()[:200]

    return LabeledPage(
        page_number=page_number,
        label=label,
        confidence=confidence,
        reasoning=reasoning,
    )


def _first_json_object(text: str) -> str | None:
    """Return the first balanced ``{...}`` substring, or ``None``."""
    # Strip common code fences.
    if text.startswith("```"):
        lines = [line for line in text.splitlines() if not line.startswith("```")]
        text = "\n".join(lines)
    match = _JSON_OBJECT_RE.search(text)
    if match:
        return match.group(0)
    # Fall back to brace-balance walk for nested objects.
    start = text.find("{")
    if start < 0:
        return None
    depth = 0
    for idx in range(start, len(text)):
        if text[idx] == "{":
            depth += 1
        elif text[idx] == "}":
            depth -= 1
            if depth == 0:
                return text[start : idx + 1]
    return None


@dataclass
class Stage2Result:
    """Outcome of Stage 2 page classification across one OCR directory."""

    run_id: str
    cert_id: str
    pages_classified: int
    output_dir: str
    cost_path: str
    halted_verdict: Verdict | None = None
    fail_count: int = 0
    failures: list[str] = field(default_factory=list)
    by_label: dict[str, int] = field(default_factory=dict)


_PAGE_FILE_RE = re.compile(r"^page_(\d+)\.md$")


@dataclass
class Stage2PageClassifier:
    """File-orchestrator: read OCR md → classify → write classified JSON."""

    classifier: PageClassifier
    monitor: BudgetMonitor = field(default_factory=BudgetMonitor)

    def run(
        self,
        ocr_dir: Path | str,
        run_dir: Path | str,
        cert_id: str,
        run_id: str,
        page_limit: int | None = None,
        skip_existing: bool = False,
    ) -> Stage2Result:
        ocr_dir = Path(ocr_dir)
        run_dir = Path(run_dir)
        out_dir = run_dir / "classified"
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

        failures: list[str] = []
        by_label: dict[str, int] = {}
        verdict: Verdict | None = None
        classified = 0

        for page_path, page_number in pages:
            out_path = out_dir / f"page_{page_number:03d}.json"
            if skip_existing and out_path.exists():
                continue
            t0 = time.monotonic()
            try:
                ocr_text = page_path.read_text(encoding="utf-8")
                labeled, response = self.classifier.classify(page_number, ocr_text)
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
                tokens_input=response.tokens_input,
                tokens_output=response.tokens_output,
                usd=response.cost_usd,
            )
            tracker.add_wall_time(time.monotonic() - t0)

            (out_dir / f"page_{page_number:03d}.json").write_text(
                labeled.model_dump_json(indent=2), encoding="utf-8"
            )
            classified += 1
            by_label[labeled.label.value] = by_label.get(labeled.label.value, 0) + 1

            verdict = self._budget_check(tracker)
            if verdict in (Verdict.FAIL, Verdict.WARN):
                break

        return Stage2Result(
            run_id=run_id,
            cert_id=cert_id,
            pages_classified=classified,
            output_dir=str(out_dir),
            cost_path=str(cost_path),
            halted_verdict=verdict if verdict in (Verdict.FAIL, Verdict.WARN) else None,
            fail_count=len(failures),
            failures=failures,
            by_label=by_label,
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


def make_classifier_factory(
    tier: ModelTier | str = "sonnet",
    max_budget_usd: float | None = None,
) -> Callable[[], PageClassifier]:
    """Returns a zero-arg factory used by the CLI to defer Claude import."""

    def _factory() -> PageClassifier:
        client = ClaudeClient(max_budget_usd=max_budget_usd)
        return PageClassifier(client=client, tier=tier)

    return _factory
