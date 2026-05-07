"""Stage 6 file orchestrator: structured/ + translated/ + cleaned/ +
glossary.json → audit/stage6_review.json (per D-077 §6.1).

Halt strategy (D-077 §2.8):

- Phase 1 deterministic detectors run unconditionally per page.
- If Phase 1 emits ``schema_invalid`` or ``untranslated_residue`` FAIL,
  Phase 2 (LLM reviewer) is skipped for that page — the page is broken
  upstream, no point asking opus to grade it. The page-level review is
  still composed from Phase 1 findings.
- Otherwise, Phase 2 dispatches sub-batched LLM calls per page.
- Safety-field FAIL on any page completes that page then halts the run
  (no further LLM dispatch). Other FAILs accumulate.
- D13 ``detect_glossary_consistency`` runs once after all pages and
  attaches to ``Stage6RunSummary.run_level_issues``.
"""
from __future__ import annotations

import json
import re
import time
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from cert_extractor.audit.verdict import Verdict
from cert_extractor.budget.cost import CostTracker
from cert_extractor.budget.monitor import BudgetMonitor
from cert_extractor.pipeline.stage6_audit.detectors import (
    Phase1Inputs,
    detect_glossary_consistency,
    run_phase1,
)
from cert_extractor.pipeline.stage6_audit.reviewer import (
    ReviewerCallResult,
    ReviewerEngine,
)
from cert_extractor.pipeline.stage6_audit.schema import (
    Stage6IssueSeverity,
    Stage6PageReview,
    Stage6RunSummary,
)
from cert_extractor.schema.glossary import Glossary

STAGE_ID = 6

_PAGE_FILE_RE = re.compile(r"^page_(\d+)\.json$")


def _now_tokyo_iso() -> str:
    return datetime.now(tz=ZoneInfo("Asia/Tokyo")).isoformat()


@dataclass
class Stage6Result:
    """File-level outcome of one Stage 6 run."""

    run_id: str
    cert_id: str
    pages_processed: int
    pages_skipped: int
    output_path: str
    cost_path: str
    summary: Stage6RunSummary
    halted_verdict: Verdict | None = None
    halt_reason: str | None = None
    fail_count: int = 0
    failures: list[str] = field(default_factory=list)


def _phase1_blocks_phase2(issues) -> bool:
    """Return True if Phase 1 emitted a schema_invalid or untranslated_residue
    FAIL — in which case Phase 2 is skipped for this page."""
    for issue in issues:
        if issue.severity != Stage6IssueSeverity.FAIL:
            continue
        if issue.issue_type in ("schema_invalid", "untranslated_residue"):
            return True
    return False


@dataclass
class Stage6Audit:
    """Orchestrates Phase 1 + Phase 2 audit per page; aggregates run summary."""

    reviewer: ReviewerEngine
    monitor: BudgetMonitor = field(default_factory=BudgetMonitor)
    prompt_version: str = "v1.0"
    reviewer_model_id: str = "claude-opus-4-7"

    def run(
        self,
        *,
        structured_dir: Path | str,
        translated_dir: Path | str,
        glossary_path: Path | str,
        run_dir: Path | str,
        cert_id: str,
        run_id: str,
        cleaned_dir: Path | str | None = None,
        ocr_dir: Path | str | None = None,
        page_limit: int | None = None,
        page_filter: list[int] | None = None,
        skip_existing: bool = False,
        output_subdir: str = "audit",
        output_filename: str = "stage6_review.json",
    ) -> Stage6Result:
        structured_dir = Path(structured_dir)
        translated_dir = Path(translated_dir)
        glossary_path = Path(glossary_path)
        run_dir = Path(run_dir)
        cleaned_dir = Path(cleaned_dir) if cleaned_dir is not None else None
        ocr_dir = Path(ocr_dir) if ocr_dir is not None else None

        out_dir = run_dir / output_subdir
        out_dir.mkdir(parents=True, exist_ok=True)
        output_path = out_dir / output_filename

        glossary = Glossary.model_validate_json(
            glossary_path.read_text(encoding="utf-8")
        )

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

        page_files = self._sorted_page_files(translated_dir)
        if page_filter is not None:
            wanted = set(page_filter)
            page_files = [(p, n) for (p, n) in page_files if n in wanted]
        if page_limit is not None:
            page_files = page_files[:page_limit]

        started_at = _now_tokyo_iso()
        pages: list[Stage6PageReview] = []
        processed = skipped_pages = 0
        failures: list[str] = []
        halt_reason: str | None = None
        halted_verdict: Verdict | None = None

        for translated_path, page_number in page_files:
            structured_path = structured_dir / f"page_{page_number:03d}.json"
            if not structured_path.exists():
                failures.append(
                    f"page_{page_number:03d}: structured/ missing ({structured_path})"
                )
                tracker.add_fail()
                continue

            try:
                structured_entities = json.loads(
                    structured_path.read_text(encoding="utf-8")
                )
                translated_entities = json.loads(
                    translated_path.read_text(encoding="utf-8")
                )
            except json.JSONDecodeError as exc:
                failures.append(
                    f"page_{page_number:03d}: JSON decode error: {exc}"
                )
                tracker.add_fail()
                continue

            cleaned_text = self._read_source_text(
                page_number=page_number,
                cleaned_dir=cleaned_dir,
                ocr_dir=ocr_dir,
            )

            page_started = _now_tokyo_iso()
            t0 = time.monotonic()
            inputs = Phase1Inputs(
                page=page_number,
                cert_id=cert_id,
                run_id=run_id,
                structured_entities=structured_entities,
                translated_entities=translated_entities,
                glossary=glossary,
                cleaned_text=cleaned_text,
            )
            phase1_issues = run_phase1(inputs)

            phase2_result: ReviewerCallResult | None = None
            page_cost_shadow = 0.0

            if _phase1_blocks_phase2(phase1_issues):
                # Skip Phase 2 — page is broken; don't burn LLM tokens.
                pass
            else:
                phase2_result = self.reviewer.review_page(
                    page=page_number,
                    structured_entities=structured_entities,
                    translated_entities=translated_entities,
                    glossary=glossary,
                    cleaned_text=cleaned_text,
                )
                for resp in phase2_result.responses:
                    tracker.add_anthropic(
                        stage_id=STAGE_ID,
                        tokens_input=resp.tokens_input,
                        tokens_output=resp.tokens_output,
                        usd=resp.cost_usd,
                    )
                    page_cost_shadow += resp.cost_usd
                for sub_idx, reason in phase2_result.skipped:
                    failures.append(
                        f"page_{page_number:03d} sub_batch_{sub_idx}: {reason}"
                    )

            tracker.add_wall_time(time.monotonic() - t0)
            page_finished = _now_tokyo_iso()

            page_issues = list(phase1_issues)
            if phase2_result is not None:
                page_issues.extend(phase2_result.issues)

            leaves_total = _count_trilingual_leaves(translated_entities)

            review = Stage6PageReview.from_issues(
                cert_id=cert_id,
                run_id=run_id,
                page=page_number,
                leaves_audited=leaves_total,
                leaves_total=leaves_total,
                issues=page_issues,
                reviewer_model=self.reviewer_model_id,
                reviewer_prompt_version=self.prompt_version,
                started_at=page_started,
                finished_at=page_finished,
                cost_usd_shadow=page_cost_shadow,
            )
            pages.append(review)
            processed += 1

            if review.safety_field_failed:
                halt_reason = (
                    f"page_{page_number:03d}: safety field FAIL "
                    f"({review.safety_field_failed!r}); halting per D-077 §2.8."
                )
                halted_verdict = Verdict.FAIL
                break

        # Run-level: D13 glossary self-consistency.
        run_level_issues = detect_glossary_consistency(glossary)

        finished_at = _now_tokyo_iso()
        summary = Stage6RunSummary.from_pages(
            cert_id=cert_id,
            run_id=run_id,
            pages=pages,
            started_at=started_at,
            finished_at=finished_at,
            run_level_issues=run_level_issues,
        )

        output_path.write_text(
            summary.model_dump_json(indent=2),
            encoding="utf-8",
        )

        return Stage6Result(
            run_id=run_id,
            cert_id=cert_id,
            pages_processed=processed,
            pages_skipped=skipped_pages,
            output_path=str(output_path),
            cost_path=str(cost_path),
            summary=summary,
            halted_verdict=halted_verdict,
            halt_reason=halt_reason,
            fail_count=len(failures),
            failures=failures,
        )

    @staticmethod
    def _read_source_text(
        *,
        page_number: int,
        cleaned_dir: Path | None,
        ocr_dir: Path | None,
    ) -> str | None:
        # Prefer cleaned/ (Stage 3 promoted vision OCR); else ocr/ (Mistral).
        for candidate in (cleaned_dir, ocr_dir):
            if candidate is None:
                continue
            md_path = candidate / f"page_{page_number:03d}.md"
            if md_path.exists():
                return md_path.read_text(encoding="utf-8")
        return None

    @staticmethod
    def _sorted_page_files(translated_dir: Path) -> list[tuple[Path, int]]:
        out: list[tuple[Path, int]] = []
        for path in translated_dir.iterdir():
            match = _PAGE_FILE_RE.match(path.name)
            if match:
                out.append((path, int(match.group(1))))
        out.sort(key=lambda item: item[1])
        return out


def _count_trilingual_leaves(entities: list[dict]) -> int:
    count = 0

    def _descend(node):
        nonlocal count
        if (
            isinstance(node, dict)
            and "jp" in node
            and "zh" in node
            and "en" in node
            and len(node) == 3
        ):
            count += 1
            return
        if isinstance(node, dict):
            for v in node.values():
                _descend(v)
        elif isinstance(node, list):
            for v in node:
                _descend(v)

    for entity in entities:
        _descend(entity)
    return count
