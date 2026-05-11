"""Stage 7 export release gates (per D-078 §2.6).

Two gates fire before any artifact is written.  Stage 7 refuses
to emit unless ``run_gate_a`` and ``run_gate_b`` both pass.

- **Gate A**: full re-run of Stage 6 Phase-1 deterministic detectors
  (D1-D13) on the about-to-export ``translated_entities``.  Catches
  regressions where someone manually edited ``translated/`` between
  Stage 6 closure and Stage 7 invocation.  No LLM cost; ~1s for 40
  pages.  Per Q4=D (full D1-D13, not safety-tagged subset).

- **Gate B**: Stage 7-specific contract checks beyond what Stage 6
  asserts:
    1. ``answer_index != -1`` for every Question entity (D-076 envelope)
    2. Zero ``UNTRANSLATED`` sentinel residue (D-076 envelope)
    3. Choice markers canonical (post-normalize verification)
    4. Every trilingual leaf has all three languages populated (no
       None / empty stripped value)

Each gate returns ``(passed: bool, failures: list[str])``. ``run_both``
composes them into a ``ReleaseGateResult``.
"""
from __future__ import annotations

from cert_extractor.pipeline.stage6_audit.detectors import Phase1Inputs, run_phase1
from cert_extractor.pipeline.stage6_audit.schema import Stage6IssueSeverity
from cert_extractor.schema.glossary import Glossary

from cert_extractor.pipeline.stage7_export.normalizers import (
    _CHOICE_MARKERS_JP,
    _CHOICE_MARKERS_LATIN,
    iter_trilingual_dicts,
    scan_untranslated,
)
from cert_extractor.pipeline.stage7_export.schema import ReleaseGateResult

# ---------------------------------------------------------------------------
# Gate A — Stage 6 Phase-1 deterministic re-run
# ---------------------------------------------------------------------------


def run_gate_a(
    pages_data: dict[int, dict],
    glossary: Glossary,
    *,
    cert_id: str,
    run_id: str,
) -> tuple[bool, list[str]]:
    """Re-run all D1-D13 detectors over the pre-export data.

    ``pages_data`` shape::

        {
            14: {
                "translated_entities": [...],
                "structured_entities": [...],
                "cleaned_text": "..." | None,
            },
            30: { ... },
            ...
        }

    Returns ``(passed, failures)``; ``passed`` is True iff zero FAIL
    severity issues were emitted across all pages.  WARN/INFO are
    expected (they ride along into ``polish_items.json``) and do
    not block.
    """
    failures: list[str] = []
    for page in sorted(pages_data.keys()):
        bundle = pages_data[page]
        inputs = Phase1Inputs(
            page=page,
            cert_id=cert_id,
            run_id=run_id,
            structured_entities=bundle.get("structured_entities") or [],
            translated_entities=bundle.get("translated_entities") or [],
            glossary=glossary,
            cleaned_text=bundle.get("cleaned_text"),
        )
        for issue in run_phase1(inputs):
            if issue.severity == Stage6IssueSeverity.FAIL:
                short_reason = issue.rationale[:80].replace("\n", " ")
                failures.append(
                    f"[Gate A] page_{page:03d} {issue.issue_type} FAIL "
                    f"@ {issue.entity_path or '(page-level)'} — {short_reason}"
                )
    return (not failures, failures)


# ---------------------------------------------------------------------------
# Gate B — Stage 7-specific contract checks
# ---------------------------------------------------------------------------


def _check_answer_index_envelope(
    page: int, entities: list[dict]
) -> list[str]:
    out: list[str] = []
    for ent_idx, entity in enumerate(entities):
        if not isinstance(entity, dict) or entity.get("type") != "question":
            continue
        ai = entity.get("answer_index")
        if ai == -1:
            out.append(
                f"[Gate B/B1] page_{page:03d}.entities[{ent_idx}].answer_index == -1 "
                "(D-076 envelope violation)"
            )
    return out


def _check_untranslated_residue(
    page: int, entities: list[dict]
) -> list[str]:
    out: list[str] = []
    for ent_idx, inner_path, _text in scan_untranslated(entities):
        dotted = ".".join(str(p) for p in inner_path)
        out.append(
            f"[Gate B/B2] page_{page:03d}.entities[{ent_idx}].{dotted}: "
            "UNTRANSLATED sentinel residue (D-076 envelope violation)"
        )
    return out


def _check_choice_markers_canonical(
    page: int, entities: list[dict]
) -> list[str]:
    out: list[str] = []
    for ent_idx, entity in enumerate(entities):
        if not isinstance(entity, dict) or entity.get("type") != "question":
            continue
        choices = entity.get("choices")
        if not isinstance(choices, list):
            continue
        for ci, choice in enumerate(choices):
            if not isinstance(choice, dict):
                continue
            for lang, pool, sep in (
                ("jp", _CHOICE_MARKERS_JP, "．"),
                ("zh", _CHOICE_MARKERS_LATIN, ". "),
                ("en", _CHOICE_MARKERS_LATIN, ". "),
            ):
                text = choice.get(lang)
                if not isinstance(text, str) or not text:
                    continue  # empty text caught by B4
                if ci >= len(pool):
                    continue  # position beyond supported pool
                expected_prefix = f"{pool[ci]}{sep}"
                if not text.startswith(expected_prefix):
                    out.append(
                        f"[Gate B/B3] page_{page:03d}.entities[{ent_idx}]"
                        f".choices[{ci}].{lang}: non-canonical marker "
                        f"(expected prefix {expected_prefix!r})"
                    )
    return out


def _check_trilingual_fully_populated(
    page: int, entities: list[dict]
) -> list[str]:
    out: list[str] = []
    for ent_idx, entity in enumerate(entities):
        if not isinstance(entity, dict):
            continue
        for path, leaf in iter_trilingual_dicts(entity):
            dotted = ".".join(str(p) for p in path) or "(top)"
            for lang in ("jp", "zh", "en"):
                val = leaf.get(lang)
                if val is None or (isinstance(val, str) and val.strip() == ""):
                    out.append(
                        f"[Gate B/B4] page_{page:03d}.entities[{ent_idx}]"
                        f".{dotted}.{lang}: empty trilingual field"
                    )
    return out


def run_gate_b(translated_by_page: dict[int, list[dict]]) -> tuple[bool, list[str]]:
    """Run Stage 7-specific contract checks.

    Operates on the post-normalize entity tree.  Caller must apply
    ``normalize_question_choices`` before invoking this gate, else
    B3 will spuriously fire on entities that legitimately use
    non-canonical markers from upstream.
    """
    failures: list[str] = []
    for page in sorted(translated_by_page.keys()):
        entities = translated_by_page[page]
        failures.extend(_check_answer_index_envelope(page, entities))
        failures.extend(_check_untranslated_residue(page, entities))
        failures.extend(_check_choice_markers_canonical(page, entities))
        failures.extend(_check_trilingual_fully_populated(page, entities))
    return (not failures, failures)


# ---------------------------------------------------------------------------
# Composition
# ---------------------------------------------------------------------------


def run_both_gates(
    pages_data: dict[int, dict],
    glossary: Glossary,
    *,
    cert_id: str,
    run_id: str,
) -> ReleaseGateResult:
    """Compose Gate A + Gate B into a single ReleaseGateResult.

    Both gates run unconditionally (so users see the full failure
    landscape on a single dispatch, rather than fixing A and then
    discovering B on a second invocation).
    """
    translated_by_page = {
        page: bundle.get("translated_entities") or []
        for page, bundle in pages_data.items()
    }
    a_pass, a_fails = run_gate_a(
        pages_data, glossary, cert_id=cert_id, run_id=run_id
    )
    b_pass, b_fails = run_gate_b(translated_by_page)
    return ReleaseGateResult(
        gate_a_passed=a_pass,
        gate_b_passed=b_pass,
        gate_a_failures=a_fails,
        gate_b_failures=b_fails,
    )
