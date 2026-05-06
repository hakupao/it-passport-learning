"""Unit tests for schema/common.py — Trilingual / KanaHelper / Anchor."""
import pytest
from pydantic import ValidationError

from cert_extractor.schema.common import Anchor, KanaHelper, Trilingual


class TestTrilingual:
    def test_all_three_required(self):
        t = Trilingual(jp="アルゴリズム", zh="算法", en="algorithm")
        assert t.jp == "アルゴリズム"
        assert t.zh == "算法"
        assert t.en == "algorithm"

    def test_empty_string_rejected(self):
        with pytest.raises(ValidationError):
            Trilingual(jp="", zh="算法", en="algorithm")

    def test_extra_field_rejected(self):
        with pytest.raises(ValidationError):
            Trilingual(jp="x", zh="x", en="x", fr="forbidden")  # type: ignore[call-arg]

    def test_strict_type_no_coercion(self):
        # Strict mode: int → str coercion is disallowed.
        with pytest.raises(ValidationError):
            Trilingual(jp=42, zh="x", en="x")  # type: ignore[arg-type]


class TestKanaHelper:
    def test_required_fields(self):
        kh = KanaHelper(surface="アルゴリズム", reading="arugorizumu", zh_concept="算法")
        assert kh.surface == "アルゴリズム"
        assert kh.zh_concept == "算法"

    def test_empty_rejected(self):
        with pytest.raises(ValidationError):
            KanaHelper(surface="", reading="x", zh_concept="x")


class TestAnchor:
    def test_all_fields(self):
        a = Anchor(
            page=12,
            block_id="page_012_block_3",
            section_path=["第1章", "1.2 数据表示"],
        )
        assert a.page == 12
        assert a.block_id == "page_012_block_3"
        assert a.section_path == ["第1章", "1.2 数据表示"]

    def test_section_path_default_empty(self):
        a = Anchor(page=1, block_id="page_001_block_0")
        assert a.section_path == []

    def test_page_must_be_positive(self):
        with pytest.raises(ValidationError):
            Anchor(page=0, block_id="x")
