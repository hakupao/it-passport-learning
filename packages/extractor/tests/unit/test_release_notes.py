"""Tests for release.notes (per D-081 §2.3, 6.11.C.2 TDD).

Covers section presence, polish aggregation, intro verbatim, and
graceful handling of empty/missing optional fields.
"""
from __future__ import annotations

from cert_extractor.release import GitContext, compose_notes


def _ctx() -> GitContext:
    return GitContext(
        commit_sha="abc1234",
        python_version="3.11.7",
        adr_ids=("D-046", "D-073", "D-077", "D-078", "D-079", "D-080", "D-081"),
        run_id="2026-05-12T03-00-00",
    )


def _idx() -> dict:
    return {
        "page_count": 579,
        "entity_count": 2330,
        "trilingual_leaf_count": 5800,
        "glossary_term_count": 870,
        "stage6_summary": {
            "overall_verdict": "WARN",
            "pass_pages": 500,
            "warn_pages": 79,
            "fail_pages": 0,
            "safety_failed": False,
        },
        "stage7_summary": {"gate_a_passed": True, "gate_b_passed": True},
    }


def test_compose_notes_happy_path_includes_all_sections_and_key_fields() -> None:
    md = compose_notes(
        cert_id="itpassport_r6",
        version="v1.0.0",
        index=_idx(),
        polish_items=[
            {"category": "D6", "severity": "WARN"},
            {"category": "L3", "severity": "WARN"},
        ],
        cost={
            "mistral_usd_billed": 0.58,
            "anthropic_usd_billed": 0.0,
            "anthropic_usd_shadow": 22.0,
        },
        intro_md="This is the project intro paragraph.",
        git_context=_ctx(),
    )

    # Title (default-derived from cert_id + version).
    assert "# itpassport_r6 — Trilingual Edition v1.0.0" in md

    # All 5 H2 sections present, in canonical order.
    sections = (
        "## What this is",
        "## Build provenance",
        "## Known polish items",
        "## How to consume",
        "## Provenance and reproducibility",
    )
    last_idx = -1
    for section in sections:
        idx = md.find(section)
        assert idx != -1, f"missing section: {section}"
        assert idx > last_idx, f"section out of order: {section}"
        last_idx = idx

    # Provenance details surfaced.
    assert "abc1234" in md
    assert "Python: 3.11.7" in md
    assert "2026-05-12T03-00-00" in md

    # Cost ledger formatted to 4 decimals.
    assert "Mistral $0.5800 billed" in md
    assert "Anthropic $0.0000 billed (shadow $22.0000)" in md

    # Stage 6 + Stage 7 summaries surfaced.
    assert "PASS=500" in md
    assert "WARN=79" in md
    assert "safety_failed=False" in md
    assert "A=True, B=True" in md

    # Asset name uses dashed cert_id form (D-081 §2.2).
    assert "itpassport-r6-output-v1.0.0.zip" in md

    # ADR list surfaced.
    assert "D-081" in md


def test_compose_notes_aggregates_polish_items_by_category_and_severity() -> None:
    polish = [
        {"category": "D6", "severity": "WARN"},
        {"category": "D6", "severity": "WARN"},
        {"category": "D6", "severity": "WARN"},
        {"category": "L3", "severity": "WARN"},
        {"category": "D11", "severity": "INFO"},
        {"category": "D11", "severity": "INFO"},
        {"category": "Dx", "severity": "FAIL"},  # bumps to top of table
    ]
    md = compose_notes(
        cert_id="itpassport_r6",
        version="v1.0.0",
        index=_idx(),
        polish_items=polish,
        cost={},
        intro_md="intro",
        git_context=_ctx(),
    )

    # FAIL row appears before WARN rows; WARN before INFO.
    fail_idx = md.find("| Dx | FAIL | 1 |")
    warn_idx = md.find("| D6 | WARN | 3 |")
    info_idx = md.find("| D11 | INFO | 2 |")
    assert fail_idx != -1 and warn_idx != -1 and info_idx != -1
    assert fail_idx < warn_idx < info_idx

    # L3 WARN row also present with correct count.
    assert "| L3 | WARN | 1 |" in md


def test_compose_notes_threads_intro_markdown_verbatim() -> None:
    intro = (
        "Paragraph 1 with **bold** and *italic*.\n"
        "\n"
        "- bullet 1\n"
        "- bullet 2\n"
        "\n"
        "> A blockquote that ends the intro."
    )
    md = compose_notes(
        cert_id="itpassport_r6",
        version="v1.0.0",
        index=_idx(),
        polish_items=[],
        cost={},
        intro_md=intro,
        git_context=_ctx(),
    )
    # Whole intro appears verbatim (after stripping outer whitespace only).
    assert intro.strip() in md


def test_compose_notes_handles_empty_polish_and_missing_optional_cost_fields() -> None:
    md = compose_notes(
        cert_id="itpassport_r6",
        version="v1.0.0",
        index={},  # all index fields missing → default 0s
        polish_items=[],
        cost={},  # cost fields all missing → default 0.0
        intro_md="x",
        git_context=GitContext(commit_sha="deadbeef", python_version="3.11.7"),
    )
    # Empty-polish case renders sentinel marker, not an empty table.
    assert "_(none)_" in md
    # Cost defaults to 0.0 across the board without raising.
    assert "Mistral $0.0000 billed" in md
    assert "Anthropic $0.0000 billed (shadow $0.0000)" in md
    # Missing stage6_summary defaults to PASS verdict.
    assert "**Stage 6 verdict**: PASS" in md
    # No ADR list rendered when adr_ids is empty.
    assert "ADRs at release" not in md
    assert "ADRs covering this release" not in md
