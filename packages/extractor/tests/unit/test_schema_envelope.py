"""Unit tests for schema/envelope.py — Envelope (D-058) + UNTRANSLATED leak detection (D-055)."""
import pytest
from pydantic import ValidationError

from cert_extractor import SCHEMA_VERSION, UNTRANSLATED
from cert_extractor.schema.common import Anchor, Trilingual
from cert_extractor.schema.entities import Chapter, Term
from cert_extractor.schema.envelope import Envelope


def _anchor() -> Anchor:
    return Anchor(page=1, block_id="page_001_block_0")


def _tri(jp: str = "x", zh: str = "x", en: str = "x") -> Trilingual:
    return Trilingual(jp=jp, zh=zh, en=en)


def _chapter(jp: str = "第1章") -> Chapter:
    return Chapter(
        id="ch1",
        anchor=_anchor(),
        title=_tri(jp, "第1章", "Chapter 1"),
        chapter_number=1,
    )


class TestEnvelopeBasics:
    def test_default_schema_version(self):
        env = Envelope(cert_id="itpassport_r6", items=[_chapter()])
        assert env.schema_version == SCHEMA_VERSION
        assert env.cert_id == "itpassport_r6"
        assert len(env.items) == 1

    def test_extractor_version_filled(self):
        env = Envelope(cert_id="itpassport_r6", items=[_chapter()])
        assert env.extractor_version  # non-empty (either real version or "0.0.0+unknown")

    def test_generated_at_iso(self):
        env = Envelope(cert_id="itpassport_r6", items=[_chapter()])
        assert env.generated_at.startswith("20")  # ISO 8601 starts with year

    def test_cert_id_required_non_empty(self):
        with pytest.raises(ValidationError):
            Envelope(cert_id="", items=[_chapter()])


class TestUntranslatedLeakDetection:
    """Per D-055: stage 7 export does not allow UNTRANSLATED in trilingual fields."""

    def test_clean_envelope_passes(self):
        env = Envelope(cert_id="itpassport_r6", items=[_chapter()])
        assert env.items[0].title.zh == "第1章"

    def test_zh_untranslated_rejected(self):
        bad_chapter = Chapter(
            id="ch1",
            anchor=_anchor(),
            title=Trilingual(jp="第1章", zh=UNTRANSLATED, en="Chapter 1"),
            chapter_number=1,
        )
        with pytest.raises(ValidationError) as exc_info:
            Envelope(cert_id="itpassport_r6", items=[bad_chapter])
        assert "UNTRANSLATED" in str(exc_info.value)

    def test_nested_term_definition_untranslated_caught(self):
        bad_term = Term(
            id="term-001",
            anchor=_anchor(),
            surface=_tri("アルゴリズム", "算法", "algorithm"),
            definition=Trilingual(jp="計算手順", zh=UNTRANSLATED, en="procedure"),
        )
        with pytest.raises(ValidationError) as exc_info:
            Envelope(cert_id="itpassport_r6", items=[bad_term])
        assert "UNTRANSLATED" in str(exc_info.value)
        # breadcrumb should contain field path
        assert "definition" in str(exc_info.value)

    def test_multiple_leaks_summarized(self):
        bad1 = Chapter(
            id="ch1",
            anchor=_anchor(),
            title=Trilingual(jp="x", zh=UNTRANSLATED, en=UNTRANSLATED),
            chapter_number=1,
        )
        with pytest.raises(ValidationError) as exc_info:
            Envelope(cert_id="itpassport_r6", items=[bad1])
        msg = str(exc_info.value)
        assert "2 field" in msg or "leak" in msg
