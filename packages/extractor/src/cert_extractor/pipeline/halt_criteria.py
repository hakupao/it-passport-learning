"""Gate halt-criteria checkers (per D-079 §2.1).

6.11.B.3 deliverable: 5 pure-ish functions, one per user-confirmation
gate, each returning ``HaltResult(passed, reasons)``. The orchestrator
(future sub-step) reads stage outputs + cost.json, calls these
checkers, and emits a checkpoint via 6.11.B.2 ``emit_checkpoint``.

Gate ③ is the only checker that does not do its own I/O — its
inputs (D11 / D13 detector counts) are computed by the orchestrator
running Stage 6 Phase-1 detectors against the rebuilt glossary, and
passed in as ints. Keeps the heavy detector dep out of this module.
"""
from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class HaltResult:
    """Outcome of a gate halt-criteria check.

    ``passed`` is True iff ``reasons`` is empty. Reasons are
    human-readable strings rendered into the checkpoint summary +
    surfaced to the user at the gate halt prompt.
    """

    passed: bool
    reasons: tuple[str, ...] = ()


def _within_tolerance(actual: float, expected: float, *, tolerance: float) -> bool:
    """True iff ``actual`` is within ``expected * (1 ± tolerance)``.

    When ``expected == 0``, only ``actual == 0`` passes — there is no
    fractional band around zero.
    """
    if expected == 0:
        return actual == 0
    lo = expected * (1 - tolerance)
    hi = expected * (1 + tolerance)
    return lo <= actual <= hi


def check_gate_1_post_ocr(
    *,
    raw_dir: Path,
    ocr_dir: Path,
    cost_path: Path,
    expected_mistral_usd: float,
    cost_tolerance: float = 0.10,
) -> HaltResult:
    """Gate ① — post-Stage-1 OCR sanity (D-079 §2.1 row 1)."""
    reasons: list[str] = []
    raw_pages = sorted(raw_dir.glob("page_*.jpg")) if raw_dir.exists() else []
    ocr_pages = sorted(ocr_dir.glob("page_*.md")) if ocr_dir.exists() else []
    if len(raw_pages) != len(ocr_pages):
        reasons.append(
            f"page count mismatch: raw={len(raw_pages)} vs ocr={len(ocr_pages)}"
        )
    zero_byte = [p.name for p in ocr_pages if p.stat().st_size == 0]
    if zero_byte:
        reasons.append(f"zero-byte OCR files: {zero_byte}")
    if cost_path.exists():
        cost = json.loads(cost_path.read_text(encoding="utf-8"))
        mistral = float(cost.get("mistral_usd", 0.0))
        if not _within_tolerance(
            mistral, expected_mistral_usd, tolerance=cost_tolerance
        ):
            reasons.append(
                f"mistral cost ${mistral:.4f} outside "
                f"${expected_mistral_usd} ± {cost_tolerance:.0%}"
            )
    else:
        reasons.append(f"cost.json not found at {cost_path}")
    return HaltResult(passed=not reasons, reasons=tuple(reasons))


def check_gate_2_post_structure(
    *,
    structured_dir: Path,
    expected_entity_count: int,
    count_tolerance: float = 0.20,
) -> HaltResult:
    """Gate ② — post-Stage-4 structure sanity (D-079 §2.1 row 2)."""
    reasons: list[str] = []
    if not structured_dir.exists():
        return HaltResult(
            passed=False, reasons=(f"structured_dir not found: {structured_dir}",)
        )

    entity_count = 0
    answer_index_violations: list[str] = []
    for path in sorted(structured_dir.glob("page_*.json")):
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            reasons.append(f"{path.name}: invalid JSON ({e})")
            continue
        entities = payload.get("entities", [])
        entity_count += len(entities)
        for ent in entities:
            if ent.get("type") == "question" and ent.get("answer_index") == -1:
                answer_index_violations.append(path.name)
                break  # one violation per page is enough to flag it

    if answer_index_violations:
        head = answer_index_violations[:5]
        tail = "..." if len(answer_index_violations) > 5 else ""
        reasons.append(
            f"answer_index == -1 on {len(answer_index_violations)} page(s): "
            f"{head}{tail}"
        )
    if not _within_tolerance(
        entity_count, expected_entity_count, tolerance=count_tolerance
    ):
        reasons.append(
            f"entity_count {entity_count} outside "
            f"{expected_entity_count} ± {count_tolerance:.0%}"
        )
    return HaltResult(passed=not reasons, reasons=tuple(reasons))


def check_gate_3_post_glossary(
    *,
    d11_info_count: int,
    d13_run_level_info_count: int,
    untranslated_surface_count: int,
    glossary_entry_count: int,
    expected_entry_count: int,
    count_tolerance: float = 0.20,
) -> HaltResult:
    """Gate ③ — post-Stage-4.5 glossary sanity (D-079 §2.1 row 3 + D-080).

    Inputs are pre-computed by the orchestrator (Stage 6 Phase-1
    detectors against the rebuilt glossary). Keeps the heavy detector
    import out of this module.
    """
    reasons: list[str] = []
    if d11_info_count != 0:
        reasons.append(
            f"D11 INFO != 0 ({d11_info_count}); per D-080 acceptance must be 0"
        )
    if d13_run_level_info_count != 0:
        reasons.append(
            f"D13 run-level INFO != 0 ({d13_run_level_info_count}); "
            "per D-080 acceptance must be 0"
        )
    if untranslated_surface_count != 0:
        reasons.append(
            f"untranslated glossary surfaces != 0 ({untranslated_surface_count})"
        )
    if not _within_tolerance(
        glossary_entry_count, expected_entry_count, tolerance=count_tolerance
    ):
        reasons.append(
            f"glossary_entry_count {glossary_entry_count} outside "
            f"{expected_entry_count} ± {count_tolerance:.0%}"
        )
    return HaltResult(passed=not reasons, reasons=tuple(reasons))


def _walk_translation(translated: Any, structured: Any) -> tuple[bool, bool]:
    """Recurse a (translated, structured) pair; flag jp-mutation + UNTRANSLATED.

    Returns ``(jp_mutated, untranslated_seen)``. Walks any dict/list
    nesting; at every dict node with a ``jp`` key, compares the value.
    Untranslated sentinel is detected as the substring ``"UNTRANSLATED"``
    in any ``zh`` or ``en`` leaf.
    """
    mutated = False
    untranslated = False
    if isinstance(translated, dict) and isinstance(structured, dict):
        if (
            "jp" in translated
            and "jp" in structured
            and translated["jp"] != structured["jp"]
        ):
            mutated = True
        for key in ("zh", "en"):
            val = translated.get(key, "")
            if isinstance(val, str) and "UNTRANSLATED" in val:
                untranslated = True
        for key in translated:
            if key in structured:
                m, u = _walk_translation(translated[key], structured[key])
                mutated = mutated or m
                untranslated = untranslated or u
    elif isinstance(translated, list) and isinstance(structured, list):
        for tval, sval in zip(translated, structured, strict=False):
            m, u = _walk_translation(tval, sval)
            mutated = mutated or m
            untranslated = untranslated or u
    return mutated, untranslated


def check_gate_4_post_translation(
    *,
    translated_dir: Path,
    structured_dir: Path,
) -> HaltResult:
    """Gate ④ — post-Stage-5 translation sanity (D-079 §2.1 row 4).

    Plan-B regression guards: jp-mutation between structured and
    translated; UNTRANSLATED sentinels in zh/en leaves.
    """
    reasons: list[str] = []
    if not translated_dir.exists():
        return HaltResult(
            passed=False,
            reasons=(f"translated_dir not found: {translated_dir}",),
        )
    if not structured_dir.exists():
        return HaltResult(
            passed=False,
            reasons=(f"structured_dir not found: {structured_dir}",),
        )

    jp_mutation_pages: list[str] = []
    untranslated_pages: list[str] = []
    for tpath in sorted(translated_dir.glob("page_*.json")):
        spath = structured_dir / tpath.name
        if not spath.exists():
            reasons.append(f"{tpath.name}: structured counterpart missing")
            continue
        try:
            tdata = json.loads(tpath.read_text(encoding="utf-8"))
            sdata = json.loads(spath.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            reasons.append(f"{tpath.name}: invalid JSON ({e})")
            continue
        mutated, untranslated = _walk_translation(tdata, sdata)
        if mutated:
            jp_mutation_pages.append(tpath.name)
        if untranslated:
            untranslated_pages.append(tpath.name)

    if jp_mutation_pages:
        head = jp_mutation_pages[:5]
        tail = "..." if len(jp_mutation_pages) > 5 else ""
        reasons.append(
            f"jp mutations on {len(jp_mutation_pages)} page(s): {head}{tail}"
        )
    if untranslated_pages:
        head = untranslated_pages[:5]
        tail = "..." if len(untranslated_pages) > 5 else ""
        reasons.append(
            f"UNTRANSLATED leaves on {len(untranslated_pages)} page(s): {head}{tail}"
        )
    return HaltResult(passed=not reasons, reasons=tuple(reasons))


def check_gate_5_post_audit(
    *,
    audit_path: Path,
    expected_polish_count: int,
    polish_tolerance: float = 0.20,
    allow_fail_with_user_authorization: bool = False,
) -> HaltResult:
    """Gate ⑤ — post-Stage-6 audit sanity (D-079 §2.1 row 5).

    Reads the Stage 6 reviewer JSON (per D-077 schema). Pulls
    ``safety_failed``, ``fail_pages``, and ``polish_items_count``.
    Tolerates a non-zero FAIL count only when the user has
    explicitly authorized it (e.g. hand-edit pattern per D-077).
    """
    reasons: list[str] = []
    if not audit_path.exists():
        return HaltResult(
            passed=False, reasons=(f"audit_path not found: {audit_path}",)
        )
    audit = json.loads(audit_path.read_text(encoding="utf-8"))
    if audit.get("safety_failed", False):
        reasons.append("safety_failed = True")
    fail_count = int(audit.get("fail_pages", 0))
    if fail_count != 0 and not allow_fail_with_user_authorization:
        reasons.append(
            f"FAIL count = {fail_count} (per D-077 require 0 or user authorization)"
        )
    polish_count = int(audit.get("polish_items_count", 0))
    if not _within_tolerance(
        polish_count, expected_polish_count, tolerance=polish_tolerance
    ):
        reasons.append(
            f"polish_items_count {polish_count} outside "
            f"{expected_polish_count} ± {polish_tolerance:.0%}"
        )
    return HaltResult(passed=not reasons, reasons=tuple(reasons))
