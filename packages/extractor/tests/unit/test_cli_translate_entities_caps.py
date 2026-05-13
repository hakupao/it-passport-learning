"""CLI regression — translate-entities exposes D-071 cap overrides.

Locks the gap surfaced in Session 18 (Step 6.11.D.5 attempt 1):
translate-entities was missing --fail-count-hard / --wall-time-hard
flags that other LLM-driven stages (classify-pages, etc.) had,
forcing a halt at fail_count cumulative > default 30 with no
operator escape hatch. See `failures/stage5_translate/` archive.
"""
from __future__ import annotations

import pytest
from click.testing import CliRunner

from cert_extractor.cli import main

pytestmark = pytest.mark.unit


def test_translate_entities_help_lists_d071_cap_overrides() -> None:
    runner = CliRunner()
    result = runner.invoke(main, ["translate-entities", "--help"])
    assert result.exit_code == 0, result.output
    for flag in (
        "--anthropic-soft-usd",
        "--anthropic-hard-usd",
        "--fail-count-soft",
        "--fail-count-hard",
        "--wall-time-soft",
        "--wall-time-hard",
    ):
        assert flag in result.output, f"missing flag {flag!r} in help"
