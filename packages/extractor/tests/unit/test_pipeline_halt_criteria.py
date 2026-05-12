"""Tests for gate halt-criteria checkers (per D-079 §2.1, 6.11.B.3 TDD).

Covers all 5 gates + tolerance helper. 8 tests total — one or two
per gate, focused on the regression class each gate guards.
"""
from __future__ import annotations

import json
from pathlib import Path

import pytest
from cert_extractor.pipeline.halt_criteria import (
    _within_tolerance,
    check_gate_1_post_ocr,
    check_gate_2_post_structure,
    check_gate_3_post_glossary,
    check_gate_4_post_translation,
    check_gate_5_post_audit,
)


def _write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")


# --------------------------------------------------------------------------- #
# Utility


def test_within_tolerance_handles_zero_and_band() -> None:
    # Standard band.
    assert _within_tolerance(0.58, 0.58, tolerance=0.10)
    assert _within_tolerance(0.50, 0.58, tolerance=0.20)
    assert not _within_tolerance(0.40, 0.58, tolerance=0.10)
    # Zero expected: only exact zero passes (no fractional band).
    assert _within_tolerance(0.0, 0.0, tolerance=0.10)
    assert not _within_tolerance(0.01, 0.0, tolerance=0.10)


# --------------------------------------------------------------------------- #
# Gate ①


def test_gate_1_passes_with_matching_pages_and_cost_in_band(tmp_path) -> None:
    raw = tmp_path / "raw"
    ocr = tmp_path / "ocr"
    raw.mkdir()
    ocr.mkdir()
    for n in (1, 2, 3):
        (raw / f"page_{n:03d}.jpg").write_bytes(b"\x00" * 128)
        (ocr / f"page_{n:03d}.md").write_text(f"page {n} content\n", encoding="utf-8")
    cost = tmp_path / "cost.json"
    _write_json(cost, {"mistral_usd": 0.058})

    result = check_gate_1_post_ocr(
        raw_dir=raw,
        ocr_dir=ocr,
        cost_path=cost,
        expected_mistral_usd=0.058,
        cost_tolerance=0.10,
    )
    assert result.passed is True
    assert result.reasons == ()


def test_gate_1_reads_nested_current_mistral_usd_from_real_cost_json(tmp_path) -> None:
    """Lock the canonical cost.json schema emitted by runner.py / stage*_classify.py.

    Surfaced during 6.11.D.2: B.3 originally tested only the flat
    ``{"mistral_usd": x}`` fixture; real cost.json nests under
    ``current``. Both must be readable so the checker stays robust to
    test fixtures while honouring the canonical emitter shape.
    """
    raw = tmp_path / "raw"
    ocr = tmp_path / "ocr"
    raw.mkdir()
    ocr.mkdir()
    (raw / "page_001.jpg").write_bytes(b"\x00" * 64)
    (ocr / "page_001.md").write_text("ok\n", encoding="utf-8")
    cost = tmp_path / "cost.json"
    _write_json(
        cost,
        {
            "run_id": "r1",
            "cert_id": "itpassport_r6",
            "current": {
                "wall_time_seconds": 1.0,
                "mistral_pages": 1,
                "mistral_usd": 0.001,
                "anthropic_usd": 0.0,
                "fail_count": 0,
            },
            "by_stage": {"1": {"usd": 0.001, "calls": 1}},
        },
    )

    result = check_gate_1_post_ocr(
        raw_dir=raw,
        ocr_dir=ocr,
        cost_path=cost,
        expected_mistral_usd=0.001,
        cost_tolerance=0.10,
    )
    assert result.passed is True, result.reasons


def test_gate_1_fails_when_zero_byte_ocr_file_present(tmp_path) -> None:
    raw = tmp_path / "raw"
    ocr = tmp_path / "ocr"
    raw.mkdir()
    ocr.mkdir()
    (raw / "page_001.jpg").write_bytes(b"\x00")
    (ocr / "page_001.md").write_text("", encoding="utf-8")  # zero-byte
    cost = tmp_path / "cost.json"
    _write_json(cost, {"mistral_usd": 0.001})

    result = check_gate_1_post_ocr(
        raw_dir=raw,
        ocr_dir=ocr,
        cost_path=cost,
        expected_mistral_usd=0.001,
    )
    assert result.passed is False
    assert any("zero-byte OCR files" in r for r in result.reasons)


# --------------------------------------------------------------------------- #
# Gate ②


def test_gate_2_fails_on_answer_index_minus_1(tmp_path) -> None:
    structured = tmp_path / "structured"
    structured.mkdir()
    _write_json(
        structured / "page_001.json",
        {
            "entities": [
                {
                    "type": "question",
                    "answer_index": -1,  # Plan-B regression — must fail
                    "choices": [{"jp": "a"}, {"jp": "b"}],
                }
            ]
        },
    )
    # 5 entities total across all pages; expected = 5 to keep count in band.
    _write_json(
        structured / "page_002.json",
        {"entities": [{"type": "term", "surface": {"jp": "x"}}] * 4},
    )

    result = check_gate_2_post_structure(
        structured_dir=structured,
        expected_entity_count=5,
    )
    assert result.passed is False
    assert any("answer_index == -1" in r for r in result.reasons)


# --------------------------------------------------------------------------- #
# Gate ③


def test_gate_3_fails_when_d11_info_nonzero() -> None:
    # D-080 §2.3 acceptance: D11 INFO must be exactly 0.
    result = check_gate_3_post_glossary(
        d11_info_count=3,  # offending case
        d13_run_level_info_count=0,
        untranslated_surface_count=0,
        glossary_entry_count=60,
        expected_entry_count=60,
    )
    assert result.passed is False
    assert any("D11 INFO != 0" in r for r in result.reasons)

    # Passing case — all zero counts + band.
    ok = check_gate_3_post_glossary(
        d11_info_count=0,
        d13_run_level_info_count=0,
        untranslated_surface_count=0,
        glossary_entry_count=60,
        expected_entry_count=60,
    )
    assert ok.passed is True


# --------------------------------------------------------------------------- #
# Gate ④


def test_gate_4_fails_on_jp_mutation_between_structured_and_translated(
    tmp_path,
) -> None:
    structured = tmp_path / "structured"
    translated = tmp_path / "translated"
    structured.mkdir()
    translated.mkdir()
    _write_json(
        structured / "page_001.json",
        {"entities": [{"surface": {"jp": "アルゴリズム", "zh": "", "en": ""}}]},
    )
    _write_json(
        translated / "page_001.json",
        {
            # jp silently mutated — exact Plan-B bug class.
            "entities": [
                {"surface": {"jp": "アルゴリズム!", "zh": "算法", "en": "algorithm"}}
            ]
        },
    )

    result = check_gate_4_post_translation(
        translated_dir=translated, structured_dir=structured
    )
    assert result.passed is False
    assert any("jp mutations" in r for r in result.reasons)


def test_gate_4_fails_on_untranslated_leaf(tmp_path) -> None:
    structured = tmp_path / "structured"
    translated = tmp_path / "translated"
    structured.mkdir()
    translated.mkdir()
    _write_json(
        structured / "page_001.json",
        {"entities": [{"body": {"jp": "本文", "zh": "", "en": ""}}]},
    )
    _write_json(
        translated / "page_001.json",
        {
            # jp preserved but zh contains the UNTRANSLATED sentinel.
            "entities": [
                {"body": {"jp": "本文", "zh": "UNTRANSLATED", "en": "body"}}
            ]
        },
    )

    result = check_gate_4_post_translation(
        translated_dir=translated, structured_dir=structured
    )
    assert result.passed is False
    assert any("UNTRANSLATED leaves" in r for r in result.reasons)


# --------------------------------------------------------------------------- #
# Gate ⑤


def test_gate_5_fails_when_safety_failed_true(tmp_path) -> None:
    audit = tmp_path / "stage6_review.json"
    _write_json(
        audit,
        {
            "safety_failed": True,
            "fail_pages": 0,
            "polish_items_count": 100,
        },
    )
    result = check_gate_5_post_audit(
        audit_path=audit,
        expected_polish_count=100,
    )
    assert result.passed is False
    assert any("safety_failed = True" in r for r in result.reasons)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
