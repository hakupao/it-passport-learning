"""Unit tests for Stage 7 normalizers (per D-078 §2.5 + §2.6 Gate B)."""
from __future__ import annotations

import pytest

from cert_extractor.pipeline.stage7_export.normalizers import (
    UNTRANSLATED_SENTINEL,
    _canonical_marker,
    _strip_marker,
    normalize_all_questions,
    normalize_one_choice,
    normalize_question_choices,
    scan_untranslated,
)


# ---------------------------------------------------------------------------
# Marker helpers
# ---------------------------------------------------------------------------


class TestCanonicalMarker:
    @pytest.mark.parametrize(
        "position,lang,expected",
        [
            (0, "jp", "ア．"),
            (1, "jp", "イ．"),
            (2, "jp", "ウ．"),
            (3, "jp", "エ．"),
            (0, "zh", "A. "),
            (1, "zh", "B. "),
            (2, "en", "C. "),
            (3, "en", "D. "),
        ],
    )
    def test_canonical_marker_per_position_lang(self, position, lang, expected):
        assert _canonical_marker(position, lang) == expected

    def test_out_of_range_raises(self):
        with pytest.raises(ValueError):
            _canonical_marker(10, "jp")


class TestStripMarker:
    @pytest.mark.parametrize(
        "raw,bare",
        [
            ("ア．choice text", "choice text"),
            ("ア. choice text", "choice text"),
            ("イ．", ""),
            ("A. choice", "choice"),
            ("A．choice", "choice"),
            ("B、choice", "choice"),
            ("C: choice", "choice"),
            ("Ｄ．choice", "choice"),  # full-width Latin
            ("甲、choice", "choice"),  # CJK enumeration
            ("plain text without marker", "plain text without marker"),
        ],
    )
    def test_strip_marker(self, raw, bare):
        assert _strip_marker(raw) == bare


# ---------------------------------------------------------------------------
# normalize_one_choice
# ---------------------------------------------------------------------------


class TestNormalizeOneChoice:
    def test_jp_basic(self):
        assert normalize_one_choice("ア．生态农业", 0, "jp") == "ア．生态农业"

    def test_jp_position_2(self):
        # page_043 Stage B catch: zh choices had "ウ．绿色IT" — would
        # not appear as jp here; jp normalize should keep position-3 marker.
        assert normalize_one_choice("グリーンIT", 2, "jp") == "ウ．グリーンIT"

    def test_zh_replace_kana_marker(self):
        # The actual Stage B page_043 scenario: zh choice[2] kept jp
        # marker `ウ．绿色IT` — Stage 7 normalize must replace with `C. 绿色IT`.
        assert normalize_one_choice("ウ．绿色IT", 2, "zh") == "C. 绿色IT"

    def test_en_replace_full_width_period(self):
        assert normalize_one_choice("Ｂ．Strategy", 1, "en") == "B. Strategy"

    def test_no_marker_prepends_marker(self):
        assert normalize_one_choice("plain text", 0, "zh") == "A. plain text"

    def test_idempotent(self):
        once = normalize_one_choice("D. Tech Domain", 3, "en")
        twice = normalize_one_choice(once, 3, "en")
        assert once == twice == "D. Tech Domain"


# ---------------------------------------------------------------------------
# normalize_question_choices  (entity-level)
# ---------------------------------------------------------------------------


class TestNormalizeQuestionChoices:
    def _q(self, choices):
        return {"type": "question", "id": "q1", "choices": choices}

    def test_mixed_zh_markers_normalized(self):
        # Reproduction of Stage B page_043 ent[1] catch:
        # zh choices = ['A．...', 'B．...', 'ウ．绿色IT', 'エ．零排放']
        entity = self._q(
            [
                {"jp": "ア．エコファーム", "zh": "A．生态农业", "en": "A. Eco-farm"},
                {"jp": "イ．環境アセスメント", "zh": "B．环境影响评价", "en": "B. EIA"},
                {"jp": "ウ．グリーンIT", "zh": "ウ．绿色IT", "en": "C. Green IT"},
                {"jp": "エ．ゼロエミッション", "zh": "エ．零排放", "en": "D. Zero emission"},
            ]
        )
        altered = normalize_question_choices(entity)
        assert altered is True
        assert entity["choices"][0]["zh"] == "A. 生态农业"
        assert entity["choices"][2]["zh"] == "C. 绿色IT"
        assert entity["choices"][3]["zh"] == "D. 零排放"
        # jp preserved with canonical full-width period.
        assert entity["choices"][0]["jp"] == "ア．エコファーム"
        assert entity["choices"][2]["jp"] == "ウ．グリーンIT"

    def test_already_canonical_no_change(self):
        entity = self._q(
            [
                {"jp": "ア．a", "zh": "A. a", "en": "A. a"},
                {"jp": "イ．b", "zh": "B. b", "en": "B. b"},
            ]
        )
        altered = normalize_question_choices(entity)
        assert altered is False
        assert entity["choices"][0]["zh"] == "A. a"

    def test_non_question_entity_skipped(self):
        entity = {
            "type": "term",
            "id": "t1",
            "choices": [{"jp": "X", "zh": "X", "en": "X"}],  # has 'choices' but type != question
        }
        assert normalize_question_choices(entity) is False
        assert entity["choices"][0]["jp"] == "X"  # unchanged

    def test_missing_choices_safe_noop(self):
        entity = {"type": "question", "id": "q1"}
        assert normalize_question_choices(entity) is False

    def test_non_dict_entity_safe_noop(self):
        assert normalize_question_choices("not a dict") is False  # type: ignore[arg-type]

    def test_partial_lang_choices_handled(self):
        entity = self._q([{"jp": "ア．x"}])  # missing zh/en
        assert normalize_question_choices(entity) is False  # nothing to alter

    def test_normalize_all_returns_count(self):
        ents = [
            {
                "type": "question",
                "id": "q1",
                "choices": [{"jp": "ア．a", "zh": "ウ．a", "en": "A. a"}],
            },
            {"type": "term", "id": "t1"},
            {
                "type": "question",
                "id": "q2",
                "choices": [{"jp": "ア．b", "zh": "A. b", "en": "A. b"}],
            },
        ]
        assert normalize_all_questions(ents) == 1


# ---------------------------------------------------------------------------
# scan_untranslated
# ---------------------------------------------------------------------------


class TestScanUntranslated:
    def test_clean_entities_empty_result(self):
        entities = [
            {"type": "term", "id": "t1", "surface": {"jp": "x", "zh": "x", "en": "x"}}
        ]
        assert scan_untranslated(entities) == []

    def test_sentinel_in_definition_flagged(self):
        entities = [
            {
                "type": "term",
                "id": "t1",
                "definition": {
                    "jp": "explanation",
                    "zh": "解释",
                    "en": f"{UNTRANSLATED_SENTINEL}: pending",
                },
            }
        ]
        violations = scan_untranslated(entities)
        assert len(violations) == 1
        ent_idx, path, text = violations[0]
        assert ent_idx == 0
        assert path[0] == "definition"
        assert "en" in path
        assert UNTRANSLATED_SENTINEL in text

    def test_sentinel_in_nested_list_flagged(self):
        entities = [
            {
                "type": "table",
                "id": "tb1",
                "rows": [
                    [{"jp": "a", "zh": "b", "en": "c"}],
                    [{"jp": "x", "zh": UNTRANSLATED_SENTINEL, "en": "y"}],
                ],
            }
        ]
        violations = scan_untranslated(entities)
        assert len(violations) == 1
        _, path, _ = violations[0]
        assert "rows" in path
        assert "zh" in path

    def test_multiple_violations_aggregated(self):
        entities = [
            {
                "type": "term",
                "id": "t1",
                "definition": {"jp": "x", "zh": UNTRANSLATED_SENTINEL, "en": "y"},
            },
            {
                "type": "term",
                "id": "t2",
                "definition": {"jp": "x", "zh": "y", "en": UNTRANSLATED_SENTINEL},
            },
        ]
        violations = scan_untranslated(entities)
        assert len(violations) == 2

    def test_page_kwarg_accepted_but_unused(self):
        # Function signature accepts page for caller convenience; not in tuple.
        entities = [{"type": "term", "id": "t1", "x": UNTRANSLATED_SENTINEL}]
        violations = scan_untranslated(entities, page=14)
        assert len(violations) == 1
        # The result tuple is still 3-element (ent_idx, path, text).
        assert len(violations[0]) == 3
