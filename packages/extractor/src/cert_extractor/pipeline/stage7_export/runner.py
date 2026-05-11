"""Stage 7 export orchestrator (per D-078 §2.7 + §2.8).

Reads pipeline outputs (Stage 5 ``translated/`` + Stage 4 ``structured/``
+ ``glossary.json`` + Stage 6 ``audit/stage6_review.json`` + optional
``cleaned/``) and produces a self-describing release bundle at
``output/`` per D-078 §2.2 layout.

Flow::

    1. Load all inputs.
    2. **Gate A first** (full D1-D13 Phase-1 re-run on the pre-normalize
       data).  D1 jp_mutation must see the same translated.jp that
       Stage 6 closure saw, so the gate runs *before* any Stage 7
       in-place mutation.
    3. If Gate A fails → return without writing.
    4. Normalize question choice markers (per D-078 §2.5).  Mutates
       ``translated_entities`` in place — only choice fields, all
       three languages, but never the underlying token content.
    5. Gate B (Stage 7 contract self-check) on the post-normalize data.
    6. If Gate B fails → return without writing.
    7. Build IndexSummary + PolishItemBundle + per-page ExportEnvelope.
    8. Emit + write JSON + Markdown artifacts.

If Gate A or Gate B fails, the runner returns a ``Stage7Result`` with
``pages_written = 0`` and the gate failures populated; **nothing is
written**.  The caller (CLI or test harness) reports the failure list.
"""
from __future__ import annotations

import json
import shutil
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Sequence

from cert_extractor.schema.glossary import Glossary

from cert_extractor.pipeline.stage7_export.emitters import (
    emit_index_json,
    emit_page_json,
    emit_page_md,
    emit_polish_items,
    emit_readme_md,
)
from cert_extractor.pipeline.stage7_export.gates import run_gate_a, run_gate_b
from cert_extractor.pipeline.stage7_export.normalizers import (
    iter_trilingual_dicts,
    normalize_all_questions,
)
from cert_extractor.pipeline.stage7_export.schema import (
    EXPORT_SCHEMA_VERSION,
    ExportEnvelope,
    IndexEntry,
    IndexStage6Summary,
    IndexSummary,
    IndexTotals,
    PolishItem,
    PolishItemBundle,
    PolishItemSeverity,
    PolishItemTotals,
    ReleaseGateResult,
)

DEFAULT_FORMATS: tuple[str, ...] = ("json", "md")


@dataclass
class Stage7Result:
    output_dir: Path
    schema_version: str
    gate_result: ReleaseGateResult
    pages_written: int = 0
    files_written: list[Path] = field(default_factory=list)
    choices_normalized: int = 0

    @property
    def passed(self) -> bool:
        return self.gate_result.passed and self.pages_written > 0


class Stage7Export:
    """Stage 7 export orchestrator.

    Stateless; one ``run`` per dispatch.  The runner is intentionally
    thin — schema / normalizers / gates / emitters do the work; this
    module just sequences them and handles file I/O.
    """

    def run(
        self,
        *,
        translated_dir: Path,
        structured_dir: Path,
        glossary_path: Path,
        audit_path: Path,
        output_dir: Path,
        cleaned_dir: Path | None = None,
        cert_id: str,
        run_id: str,
        formats: Sequence[str] = DEFAULT_FORMATS,
        now: datetime | None = None,
    ) -> Stage7Result:
        formats = tuple(formats)
        exported_at = now or datetime.now(tz=timezone.utc)

        translated_by_page = _load_pages_dir(translated_dir)
        structured_by_page = _load_pages_dir(structured_dir)
        cleaned_text_by_page = (
            _load_cleaned_dir(cleaned_dir) if cleaned_dir is not None else {}
        )
        glossary = Glossary.model_validate_json(
            glossary_path.read_text(encoding="utf-8")
        )
        audit = json.loads(audit_path.read_text(encoding="utf-8"))

        # Gate A first — must see pre-normalize data so D1 jp_mutation
        # compares the same translated.jp Stage 6 closure validated.
        # Stage 7's marker normalization is an export-time shape
        # transformation; running Gate A after it would spuriously
        # flip canonical jp markers (e.g. `ア.` → `ア．`) as mutations.
        pages_data_pre_norm = {
            page: {
                "translated_entities": translated_by_page[page],
                "structured_entities": structured_by_page.get(page, []),
                "cleaned_text": cleaned_text_by_page.get(page),
            }
            for page in translated_by_page
        }
        gate_a_passed, gate_a_failures = run_gate_a(
            pages_data_pre_norm, glossary, cert_id=cert_id, run_id=run_id
        )

        if not gate_a_passed:
            return Stage7Result(
                output_dir=output_dir,
                schema_version=EXPORT_SCHEMA_VERSION,
                gate_result=ReleaseGateResult(
                    gate_a_passed=False,
                    gate_b_passed=True,  # not yet evaluated
                    gate_a_failures=gate_a_failures,
                    gate_b_failures=[],
                ),
                pages_written=0,
                choices_normalized=0,
            )

        # Stage 7 §2.5: normalize question choice markers (mutates in place).
        choices_normalized = 0
        for page, entities in translated_by_page.items():
            choices_normalized += normalize_all_questions(entities)

        # Gate B on post-normalize data.
        gate_b_passed, gate_b_failures = run_gate_b(translated_by_page)
        gate_result = ReleaseGateResult(
            gate_a_passed=gate_a_passed,
            gate_b_passed=gate_b_passed,
            gate_a_failures=gate_a_failures,
            gate_b_failures=gate_b_failures,
        )

        if not gate_result.passed:
            return Stage7Result(
                output_dir=output_dir,
                schema_version=EXPORT_SCHEMA_VERSION,
                gate_result=gate_result,
                pages_written=0,
                choices_normalized=choices_normalized,
            )

        # Compose polish items + per-page envelopes + index.
        polish_bundle = _build_polish_bundle(
            audit, cert_id=cert_id, run_id=run_id, exported_at=exported_at
        )
        polish_count_by_page = {
            int(page_key): len(items)
            for page_key, items in polish_bundle.by_page.items()
        }
        verdict_by_page = _verdict_by_page_from_audit(audit)

        index_pages: list[IndexEntry] = []
        envelopes: dict[int, ExportEnvelope] = {}
        total_entities = 0
        total_leaves = 0
        for page in sorted(translated_by_page.keys()):
            entities = translated_by_page[page]
            leaf_count = _count_trilingual_leaves(entities)
            total_entities += len(entities)
            total_leaves += leaf_count
            verdict = verdict_by_page.get(page, "PASS")
            # ExportEnvelope only allows PASS|WARN; FAIL collapses to WARN
            # at this stage (Gate A guarantees no real FAIL by here).
            envelope_verdict = "WARN" if verdict == "FAIL" else verdict
            polish_n = polish_count_by_page.get(page, 0)
            envelopes[page] = ExportEnvelope(
                cert_id=cert_id,
                run_id=run_id,
                page=page,
                exported_at=exported_at,
                stage6_verdict=envelope_verdict,
                leaf_count=leaf_count,
                entities=entities,
                polish_items_ref=(
                    f"polish_items.json#pages/{page:03d}" if polish_n else None
                ),
            )
            index_pages.append(
                IndexEntry(
                    page=page,
                    json_path=f"pages/page_{page:03d}.json",
                    md_path=f"pages/page_{page:03d}.md",
                    entity_count=len(entities),
                    leaf_count=leaf_count,
                    verdict=verdict,
                    polish_items_count=polish_n,
                )
            )

        run_overall_verdict = audit.get("overall_verdict") or _derive_overall_verdict(
            verdict_by_page
        )
        index_summary = IndexSummary(
            cert_id=cert_id,
            run_id=run_id,
            exported_at=exported_at,
            totals=IndexTotals(
                pages=len(translated_by_page),
                entities=total_entities,
                leaves=total_leaves,
            ),
            stage6_summary=IndexStage6Summary(
                verdict=run_overall_verdict,
                pass_pages=audit.get("pass_pages", 0),
                warn_pages=audit.get("warn_pages", 0),
                fail_pages=audit.get("fail_pages", 0),
                polish_items_count=polish_bundle.totals.warn
                + polish_bundle.totals.info
                + polish_bundle.totals.run_level_info,
            ),
            pages=index_pages,
        )

        files_written = _write_outputs(
            output_dir=output_dir,
            envelopes=envelopes,
            index_summary=index_summary,
            polish_bundle=polish_bundle,
            glossary_source_path=glossary_path,
            formats=formats,
        )

        return Stage7Result(
            output_dir=output_dir,
            schema_version=EXPORT_SCHEMA_VERSION,
            gate_result=gate_result,
            pages_written=len(envelopes),
            files_written=files_written,
            choices_normalized=choices_normalized,
        )


# ---------------------------------------------------------------------------
# Loading helpers
# ---------------------------------------------------------------------------


def _load_pages_dir(directory: Path) -> dict[int, list[dict]]:
    """Load ``page_NNN.json`` files under ``directory`` keyed by int page."""
    out: dict[int, list[dict]] = {}
    for path in sorted(directory.glob("page_*.json")):
        page = _parse_page_number(path.name)
        if page is None:
            continue
        out[page] = json.loads(path.read_text(encoding="utf-8"))
    return out


def _load_cleaned_dir(directory: Path) -> dict[int, str]:
    """Load ``page_NNN.md`` cleaned-text files keyed by int page."""
    out: dict[int, str] = {}
    for path in sorted(directory.glob("page_*.md")):
        page = _parse_page_number(path.name)
        if page is None:
            continue
        out[page] = path.read_text(encoding="utf-8")
    return out


def _parse_page_number(filename: str) -> int | None:
    stem = filename.rsplit(".", 1)[0]
    if not stem.startswith("page_"):
        return None
    try:
        return int(stem[len("page_") :])
    except ValueError:
        return None


# ---------------------------------------------------------------------------
# Compose helpers
# ---------------------------------------------------------------------------


_AUDIT_DROP_FIELDS: frozenset[str] = frozenset(
    {"evidence", "proposed_fix", "safety_field", "detector_confidence"}
)


def _build_polish_bundle(
    audit: dict,
    *,
    cert_id: str,
    run_id: str,
    exported_at: datetime,
) -> PolishItemBundle:
    by_page: dict[str, list[PolishItem]] = {}
    run_level: list[PolishItem] = []
    warn = 0
    info = 0
    run_level_info = 0

    for page_review in audit.get("pages", []):
        page = page_review.get("page")
        if page is None:
            continue
        page_key = f"{int(page):03d}"
        for issue in page_review.get("issues", []) or []:
            item = _polish_item_from_audit_issue(issue)
            if item is None:
                continue
            by_page.setdefault(page_key, []).append(item)
            if item.severity is PolishItemSeverity.WARN:
                warn += 1
            else:
                info += 1

    for issue in audit.get("run_level_issues", []) or []:
        item = _polish_item_from_audit_issue(issue)
        if item is None:
            continue
        run_level.append(item)
        if item.severity is PolishItemSeverity.WARN:
            warn += 1
        else:
            run_level_info += 1

    return PolishItemBundle(
        cert_id=cert_id,
        run_id=run_id,
        exported_at=exported_at,
        totals=PolishItemTotals(
            warn=warn, info=info, run_level_info=run_level_info
        ),
        by_page=by_page,
        run_level=run_level,
    )


def _polish_item_from_audit_issue(issue: dict) -> PolishItem | None:
    severity = issue.get("severity")
    if severity not in ("WARN", "INFO"):
        # FAIL excluded by D-078 §2.4 + impossible past Gate A.
        return None
    issue_type = issue.get("issue_type")
    repair_stage = issue.get("repair_stage")
    if issue_type is None or repair_stage is None:
        return None
    return PolishItem(
        issue_id=issue.get("id", ""),
        issue_type=issue_type,
        severity=PolishItemSeverity(severity),
        repair_stage=str(repair_stage),  # type: ignore[arg-type]
        entity_path=issue.get("entity_path"),
        rationale=issue.get("rationale", ""),
        dimension=issue.get("dimension"),
        detector=issue.get("detector"),
    )


def _verdict_by_page_from_audit(audit: dict) -> dict[int, str]:
    out: dict[int, str] = {}
    for page_review in audit.get("pages", []) or []:
        page = page_review.get("page")
        verdict = page_review.get("overall_verdict")
        if page is None or verdict not in ("PASS", "WARN", "FAIL"):
            continue
        out[int(page)] = verdict
    return out


def _derive_overall_verdict(verdict_by_page: dict[int, str]) -> str:
    values = set(verdict_by_page.values())
    if "FAIL" in values:
        return "FAIL"
    if "WARN" in values:
        return "WARN"
    return "PASS"


def _count_trilingual_leaves(entities: list[dict]) -> int:
    return sum(1 for _ in iter_trilingual_dicts(entities))


# ---------------------------------------------------------------------------
# Output writers
# ---------------------------------------------------------------------------


def _write_outputs(
    *,
    output_dir: Path,
    envelopes: dict[int, ExportEnvelope],
    index_summary: IndexSummary,
    polish_bundle: PolishItemBundle,
    glossary_source_path: Path,
    formats: tuple[str, ...],
) -> list[Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    pages_dir = output_dir / "pages"
    pages_dir.mkdir(parents=True, exist_ok=True)
    written: list[Path] = []

    for page, envelope in sorted(envelopes.items()):
        if "json" in formats:
            p_json = pages_dir / f"page_{page:03d}.json"
            p_json.write_text(emit_page_json(envelope), encoding="utf-8")
            written.append(p_json)
        if "md" in formats:
            p_md = pages_dir / f"page_{page:03d}.md"
            p_md.write_text(emit_page_md(envelope), encoding="utf-8")
            written.append(p_md)

    p_index = output_dir / "index.json"
    p_index.write_text(emit_index_json(index_summary), encoding="utf-8")
    written.append(p_index)

    p_polish = output_dir / "polish_items.json"
    p_polish.write_text(emit_polish_items(polish_bundle), encoding="utf-8")
    written.append(p_polish)

    p_readme = output_dir / "README.md"
    p_readme.write_text(emit_readme_md(index_summary), encoding="utf-8")
    written.append(p_readme)

    p_gloss = output_dir / "glossary.json"
    shutil.copyfile(glossary_source_path, p_gloss)
    written.append(p_gloss)

    return written
