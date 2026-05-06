"""Stage 4 structure extraction (per D-008 stage 4 + D-056 Discriminated Union).

Stage 4 turns per-page OCR markdown into typed entities (Chapter / Section /
Term / Question / Table / Figure) suitable for Stage 5 trilingual translation.
The LLM is asked for a flat JSON list of typed dicts; we coerce each dict
into the appropriate Pydantic model from ``schema.entities`` and skip items
that fail validation (logged as failures, never fatal — D-063 §2.5).

Trilingual fields are populated only on the ``jp`` axis at this stage; ``zh``
and ``en`` are filled with the ``UNTRANSLATED`` sentinel (D-055) and rewritten
in Stage 5. Stage 7 export refuses to emit any entity that still contains
the sentinel (per ``Envelope.no_untranslated_leakage`` validator).
"""
from __future__ import annotations

import json
import re
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable

from pydantic import ValidationError

from cert_extractor import UNTRANSLATED
from cert_extractor.audit.verdict import Verdict
from cert_extractor.budget.cost import CostTracker
from cert_extractor.budget.monitor import BudgetMonitor
from cert_extractor.llm.claude_client import ClaudeClient, ClaudeResponse, ModelTier
from cert_extractor.schema.common import Anchor, Trilingual
from cert_extractor.schema.entities import (
    Chapter,
    Entity,
    Figure,
    Question,
    Section,
    Table,
    Term,
)
from cert_extractor.schema.page_labels import LabeledPage, PageLabel

STAGE_ID = 4

# Pages that legitimately have no extractable Entity content; these are
# skipped to save quota. TOC + glossary will be parsed by dedicated stages
# (Stage 4.5 glossary extraction lives in its own module per D-008).
SKIP_LABELS: frozenset[PageLabel] = frozenset({
    PageLabel.COVER,
    PageLabel.BLANK,
    PageLabel.TOC,
    PageLabel.GLOSSARY,
    PageLabel.INDEX,
    PageLabel.OTHER,
})

STRUCTURE_SYSTEM_PROMPT = """\
You are a structure-extraction engine for Japanese IT certification textbook
pages (ITパスポート / IT Passport). Given one page's OCR Markdown, identify
discrete entities of these closed types and emit a single JSON array.

Allowed `type` values and required keys:

- "chapter": top-level chapter divider page.
    - title_jp (string)
    - chapter_number (1-indexed integer)

- "section": a section heading inside a chapter.
    - title_jp (string)
    - section_number (string, e.g. "01-01" or "1.2")

- "term": a key technical term with its definition.
    - surface_jp (the term as written)
    - definition_jp (the definition in Japanese)

- "question": an exam-style multiple-choice question.
    - stem_jp (string)
    - choices_jp (list of >=2 choice strings)
    - answer_index (0-based integer of the correct choice; use 0 if the
      page does not state the answer)

- "table": a table with a caption.
    - caption_jp
    - rows_jp (list of list of cell strings; first row may be header)

- "figure": an image with a caption.
    - caption_jp
    - image_ref (the markdown image filename, e.g. "img-0.jpeg")

Rules:
- Emit Japanese exactly as written; do NOT translate.
- If the page has no extractable entities (e.g. mostly prose with no
  definable terms / no figures / no tables), return an empty list [].
- Output ONLY the JSON array on one line. No preamble, no commentary, no
  code fences.
- Do not invent items the page does not contain.
"""

USER_PROMPT_TEMPLATE = """\
Page number: {page_number}
Page label (Stage 2 classifier): {label}

--- BEGIN OCR MARKDOWN ---
{ocr_text}
--- END OCR MARKDOWN ---
"""


@dataclass
class ExtractResult:
    """Outcome of one StructureExtractor call for a page."""

    entities: list[Entity]
    raw_items: list[dict]
    skipped: list[tuple[dict, str]]  # (item, reason)
    response: ClaudeResponse


@dataclass
class StructureExtractor:
    """LLM-driven entity extractor (per D-008 stage 4)."""

    client: ClaudeClient
    cert_id: str
    tier: ModelTier | str = "sonnet"

    def extract(
        self,
        page_md: str,
        page_number: int,
        label: PageLabel,
        section_path: list[str] | None = None,
    ) -> ExtractResult:
        prompt = USER_PROMPT_TEMPLATE.format(
            page_number=page_number,
            label=label.value,
            ocr_text=page_md,
        )
        response = self.client.call(
            system=STRUCTURE_SYSTEM_PROMPT,
            user=prompt,
            tier=self.tier,
        )
        items = parse_structure_response(response.text)
        entities, skipped = items_to_entities(
            items=items,
            page_number=page_number,
            cert_id=self.cert_id,
            section_path=list(section_path or []),
        )
        return ExtractResult(
            entities=entities,
            raw_items=items,
            skipped=skipped,
            response=response,
        )


_JSON_ARRAY_RE = re.compile(r"\[.*\]", re.DOTALL)


def parse_structure_response(raw: str) -> list[dict]:
    """Tolerantly extract the first JSON array from the model output."""
    text = raw.strip()
    if text.startswith("```"):
        text = "\n".join(line for line in text.splitlines() if not line.startswith("```"))
    match = _JSON_ARRAY_RE.search(text)
    if match is None:
        return []
    try:
        payload = json.loads(match.group(0))
    except json.JSONDecodeError:
        return []
    if not isinstance(payload, list):
        return []
    return [item for item in payload if isinstance(item, dict)]


def items_to_entities(
    items: list[dict],
    page_number: int,
    cert_id: str,
    section_path: list[str],
) -> tuple[list[Entity], list[tuple[dict, str]]]:
    """Coerce raw item dicts into validated Entity instances.

    Items that fail validation are returned in ``skipped`` with a short
    reason; they are not fatal. The caller logs them via D-063 §2.5.
    """
    entities: list[Entity] = []
    skipped: list[tuple[dict, str]] = []
    for idx, item in enumerate(items):
        anchor = Anchor(
            page=page_number,
            block_id=f"page_{page_number:03d}_block_{idx}",
            section_path=list(section_path),
        )
        eid = f"{cert_id}::{item.get('type', 'unknown')}::p{page_number:03d}::{idx}"
        try:
            entity = _build_entity(item=item, eid=eid, anchor=anchor)
        except (KeyError, ValueError, TypeError, ValidationError) as exc:
            skipped.append((item, f"{type(exc).__name__}: {exc}"))
            continue
        if entity is None:
            skipped.append((item, f"unknown type: {item.get('type')!r}"))
            continue
        entities.append(entity)
    return entities, skipped


def _trilingual(jp: str) -> Trilingual:
    """Make a Trilingual with jp filled and zh/en pending Stage 5."""
    return Trilingual(jp=jp, zh=UNTRANSLATED, en=UNTRANSLATED)


def _build_entity(item: dict, eid: str, anchor: Anchor) -> Entity | None:
    etype = item.get("type")
    if etype == "chapter":
        return Chapter(
            id=eid,
            anchor=anchor,
            title=_trilingual(item["title_jp"]),
            chapter_number=int(item["chapter_number"]),
        )
    if etype == "section":
        return Section(
            id=eid,
            anchor=anchor,
            title=_trilingual(item["title_jp"]),
            section_number=str(item["section_number"]),
        )
    if etype == "term":
        return Term(
            id=eid,
            anchor=anchor,
            surface=_trilingual(item["surface_jp"]),
            definition=_trilingual(item["definition_jp"]),
        )
    if etype == "question":
        choices_raw = item["choices_jp"]
        if not isinstance(choices_raw, list) or len(choices_raw) < 2:
            raise ValueError("question.choices_jp must be a list of >=2 items")
        return Question(
            id=eid,
            anchor=anchor,
            stem=_trilingual(item["stem_jp"]),
            choices=[_trilingual(str(c)) for c in choices_raw],
            answer_index=int(item.get("answer_index", 0)),
        )
    if etype == "table":
        rows_raw = item["rows_jp"]
        if not isinstance(rows_raw, list) or not rows_raw:
            raise ValueError("table.rows_jp must be a non-empty list of rows")
        return Table(
            id=eid,
            anchor=anchor,
            caption=_trilingual(item["caption_jp"]),
            rows=[[_trilingual(str(cell)) for cell in row] for row in rows_raw],
        )
    if etype == "figure":
        return Figure(
            id=eid,
            anchor=anchor,
            caption=_trilingual(item["caption_jp"]),
            image_ref=str(item["image_ref"]),
        )
    return None


@dataclass
class Stage4Result:
    """Outcome of Stage 4 across one OCR + classified directory."""

    run_id: str
    cert_id: str
    pages_processed: int
    pages_skipped: int
    entities_extracted: int
    by_type: dict[str, int]
    output_dir: str
    cost_path: str
    halted_verdict: Verdict | None = None
    fail_count: int = 0
    failures: list[str] = field(default_factory=list)


_PAGE_FILE_RE = re.compile(r"^page_(\d+)\.md$")


@dataclass
class Stage4Structure:
    """File-orchestrator: OCR + classified → structured/ JSON.

    Reads each classified label, skips ``SKIP_LABELS``, prefers a cleaned/
    re-OCR'd page over the original ocr/ markdown, and writes the entity
    list under ``structured/page_NNN.json``.
    """

    extractor: StructureExtractor
    monitor: BudgetMonitor = field(default_factory=BudgetMonitor)
    skip_labels: frozenset[PageLabel] = SKIP_LABELS

    def run(
        self,
        ocr_dir: Path | str,
        classified_dir: Path | str,
        run_dir: Path | str,
        cert_id: str,
        run_id: str,
        cleaned_dir: Path | str | None = None,
        page_limit: int | None = None,
        skip_existing: bool = True,
    ) -> Stage4Result:
        ocr_dir = Path(ocr_dir)
        classified_dir = Path(classified_dir)
        run_dir = Path(run_dir)
        cleaned_dir_p = Path(cleaned_dir) if cleaned_dir else (run_dir / "cleaned")
        out_dir = run_dir / "structured"
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

        verdict: Verdict | None = None
        processed = skipped_pages = entities_total = 0
        by_type: dict[str, int] = {}
        failures: list[str] = []

        for page_path, page_number in pages:
            label = self._read_label(classified_dir, page_number)
            if label is None or label in self.skip_labels:
                skipped_pages += 1
                continue

            if skip_existing and (out_dir / f"page_{page_number:03d}.json").exists():
                # Idempotent re-runs: don't re-spend LLM quota on pages
                # already on disk. Counts as skipped, not processed.
                skipped_pages += 1
                continue

            page_text = self._read_page_text(
                page_number=page_number,
                ocr_path=page_path,
                cleaned_dir=cleaned_dir_p,
            )

            t0 = time.monotonic()
            try:
                result = self.extractor.extract(
                    page_md=page_text,
                    page_number=page_number,
                    label=label,
                )
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

            for skipped_item, reason in result.skipped:
                failures.append(
                    f"page_{page_number:03d}: skipped item type={skipped_item.get('type')!r} reason={reason}"
                )

            entity_dicts = [_entity_dump(e) for e in result.entities]
            (out_dir / f"page_{page_number:03d}.json").write_text(
                json.dumps(entity_dicts, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
            processed += 1
            entities_total += len(result.entities)
            for entity in result.entities:
                by_type[entity.type] = by_type.get(entity.type, 0) + 1

            verdict = self._budget_check(tracker)
            if verdict in (Verdict.FAIL, Verdict.WARN):
                break

        return Stage4Result(
            run_id=run_id,
            cert_id=cert_id,
            pages_processed=processed,
            pages_skipped=skipped_pages,
            entities_extracted=entities_total,
            by_type=by_type,
            output_dir=str(out_dir),
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

    @staticmethod
    def _sorted_page_files(ocr_dir: Path) -> list[tuple[Path, int]]:
        out: list[tuple[Path, int]] = []
        for path in ocr_dir.iterdir():
            match = _PAGE_FILE_RE.match(path.name)
            if match:
                out.append((path, int(match.group(1))))
        out.sort(key=lambda item: item[1])
        return out

    @staticmethod
    def _read_label(classified_dir: Path, page_number: int) -> PageLabel | None:
        path = classified_dir / f"page_{page_number:03d}.json"
        if not path.exists():
            return None
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
            return PageLabel(payload["label"])
        except (json.JSONDecodeError, KeyError, ValueError):
            return None

    @staticmethod
    def _read_page_text(page_number: int, ocr_path: Path, cleaned_dir: Path) -> str:
        cleaned = cleaned_dir / f"page_{page_number:03d}.md"
        if cleaned.exists():
            return cleaned.read_text(encoding="utf-8")
        return ocr_path.read_text(encoding="utf-8")


def _entity_dump(entity: Entity) -> dict:
    """Pydantic v2 model_dump but tolerant of the Discriminated Union."""
    return entity.model_dump(mode="json")  # type: ignore[union-attr]


def make_extractor_factory(
    cert_id: str,
    tier: ModelTier | str = "sonnet",
    max_budget_usd: float | None = None,
):
    """Returns a zero-arg factory used by the CLI to defer Claude import."""

    def _factory() -> StructureExtractor:
        client = ClaudeClient(max_budget_usd=max_budget_usd)
        return StructureExtractor(client=client, cert_id=cert_id, tier=tier)

    return _factory


def iter_skip_labels() -> Iterable[str]:
    return (lbl.value for lbl in SKIP_LABELS)
