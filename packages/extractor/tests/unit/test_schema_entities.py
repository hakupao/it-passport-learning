"""Unit tests for schema/entities.py — Discriminated Union (D-056)."""
import pytest
from pydantic import TypeAdapter, ValidationError

from cert_extractor.schema.common import Anchor, Trilingual
from cert_extractor.schema.entities import (
    Chapter,
    Entity,
    Question,
    Section,
    Term,
)


def _anchor() -> Anchor:
    return Anchor(page=1, block_id="page_001_block_0")


def _tri(jp: str = "x", zh: str = "x", en: str = "x") -> Trilingual:
    return Trilingual(jp=jp, zh=zh, en=en)


class TestDiscriminatedUnion:
    def test_chapter_round_trips_via_union(self):
        ch = Chapter(
            id="ch1",
            anchor=_anchor(),
            title=_tri(),
            chapter_number=1,
        )
        adapter = TypeAdapter(Entity)
        roundtrip = adapter.validate_python(ch.model_dump())
        assert isinstance(roundtrip, Chapter)
        assert roundtrip.type == "chapter"

    def test_term_with_kana_helper(self):
        from cert_extractor.schema.common import KanaHelper

        t = Term(
            id="term-001",
            anchor=_anchor(),
            surface=_tri("アルゴリズム", "算法", "algorithm"),
            definition=_tri("計算手順", "计算步骤", "computation procedure"),
            kana_helper=KanaHelper(
                surface="アルゴリズム", reading="arugorizumu", zh_concept="算法"
            ),
        )
        assert t.kana_helper is not None
        assert t.type == "term"

    def test_term_without_kana_helper(self):
        t = Term(
            id="term-002",
            anchor=_anchor(),
            surface=_tri(),
            definition=_tri(),
        )
        assert t.kana_helper is None

    def test_question_safety_field(self):
        q = Question(
            id="q1",
            anchor=_anchor(),
            stem=_tri(),
            choices=[_tri("a"), _tri("b")],
            answer_index=0,
        )
        assert q.answer_index == 0

    def test_question_choices_min_2(self):
        with pytest.raises(ValidationError):
            Question(
                id="q1",
                anchor=_anchor(),
                stem=_tri(),
                choices=[_tri("only")],
                answer_index=0,
            )

    def test_unknown_type_rejected(self):
        adapter = TypeAdapter(Entity)
        bad = {
            "type": "unknown_kind",
            "id": "x",
            "anchor": _anchor().model_dump(),
        }
        with pytest.raises(ValidationError):
            adapter.validate_python(bad)

    def test_section_keeps_section_number(self):
        s = Section(
            id="s1",
            anchor=_anchor(),
            title=_tri(),
            section_number="1.2.3",
        )
        assert s.section_number == "1.2.3"
