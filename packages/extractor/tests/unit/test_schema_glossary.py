"""Unit tests for the Stage 4.5 glossary schema."""
from __future__ import annotations

import pytest

from cert_extractor.schema.common import KanaHelper, Trilingual
from cert_extractor.schema.glossary import Glossary, GlossaryEntry

pytestmark = pytest.mark.unit


def _entry(surface_jp: str, idx: int, *, aliases: list[str] | None = None, kana=None):
    return GlossaryEntry(
        id=f"g_{idx:03d}",
        surface=Trilingual(jp=surface_jp, zh="zh", en="en"),
        kana_helper=kana,
        first_page=1,
        occurrences=[1],
        aliases_jp=aliases or [],
    )


def test_glossary_round_trips() -> None:
    g = Glossary(
        cert_id="itpassport_r6",
        run_id="dry_run_test",
        entries=[
            _entry("経営理念", 1),
            _entry(
                "アルゴリズム",
                2,
                kana=KanaHelper(surface="アルゴリズム", reading="arugorizumu", zh_concept="算法"),
            ),
        ],
    )
    payload = g.model_dump_json()
    again = Glossary.model_validate_json(payload)
    assert len(again.entries) == 2
    assert again.entries[1].kana_helper is not None
    assert again.entries[1].kana_helper.reading == "arugorizumu"


def test_glossary_by_jp_surface_includes_aliases() -> None:
    g = Glossary(
        cert_id="itpassport_r6",
        run_id="dry_run_test",
        entries=[_entry("経営理念", 1, aliases=["經營理念", "経営方針"])],
    )
    lookup = g.by_jp_surface()
    assert lookup["経営理念"].id == "g_001"
    assert lookup["經營理念"].id == "g_001"  # alias resolves to same entry
    assert lookup["経営方針"].id == "g_001"


def test_glossary_entry_rejects_extra_fields() -> None:
    with pytest.raises(Exception):
        GlossaryEntry.model_validate(
            {
                "id": "g_001",
                "surface": {"jp": "x", "zh": "x", "en": "x"},
                "first_page": 1,
                "occurrences": [1],
                "aliases_jp": [],
                "extra": "no",
            }
        )


def test_glossary_entry_first_page_must_be_positive() -> None:
    with pytest.raises(Exception):
        GlossaryEntry(
            id="g_001",
            surface=Trilingual(jp="x", zh="x", en="x"),
            first_page=0,
            occurrences=[],
        )
