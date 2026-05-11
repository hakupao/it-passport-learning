"""Unit tests for Stage 7 release gates (per D-078 §2.6)."""
from __future__ import annotations

from cert_extractor.schema.common import Trilingual
from cert_extractor.schema.glossary import Glossary, GlossaryEntry

from cert_extractor.pipeline.stage7_export.gates import (
    run_both_gates,
    run_gate_a,
    run_gate_b,
)


# ---------------------------------------------------------------------------
# fixtures
# ---------------------------------------------------------------------------


def _empty_glossary() -> Glossary:
    return Glossary(
        cert_id="itpassport_r6", run_id="test_run", entries=[]
    )


def _trilingual_term(*, jp: str, zh: str, en: str, def_jp: str = "x",
                     def_zh: str = "x", def_en: str = "x") -> dict:
    return {
        "id": f"term_{jp}",
        "type": "term",
        "anchor": {"page": 1, "block_id": "p001_b0", "section_path": []},
        "surface": {"jp": jp, "zh": zh, "en": en},
        "definition": {"jp": def_jp, "zh": def_zh, "en": def_en},
        "kana_helper": None,
    }


def _question(*, choices: list[dict], answer_index: int = 0) -> dict:
    # Question schema has model_config(extra="forbid", strict=True) —
    # no extra fields allowed beyond id/type/anchor/stem/choices/answer_index.
    return {
        "id": "q1",
        "type": "question",
        "anchor": {"page": 1, "block_id": "p001_b0", "section_path": []},
        "stem": {"jp": "Q jp", "zh": "Q zh", "en": "Q en"},
        "choices": choices,
        "answer_index": answer_index,
    }


def _good_pages_data() -> dict[int, dict]:
    """A minimal pages_data bundle that should PASS both gates."""
    return {
        14: {
            "translated_entities": [
                _trilingual_term(jp="本", zh="书", en="book")
            ],
            "structured_entities": [
                _trilingual_term(jp="本", zh="书", en="book")
            ],
            "cleaned_text": None,
        }
    }


# ---------------------------------------------------------------------------
# Gate A
# ---------------------------------------------------------------------------


class TestGateA:
    def test_clean_data_passes(self):
        passed, failures = run_gate_a(
            _good_pages_data(),
            _empty_glossary(),
            cert_id="itpassport_r6",
            run_id="test_run",
        )
        assert passed is True
        assert failures == []

    def test_d1_jp_mutation_fail(self):
        # Structured jp says "本", translated jp says "別". D1 catches the mutation.
        pages_data = {
            14: {
                "translated_entities": [
                    _trilingual_term(jp="別", zh="书", en="book")
                ],
                "structured_entities": [
                    _trilingual_term(jp="本", zh="书", en="book")
                ],
                "cleaned_text": None,
            }
        }
        passed, failures = run_gate_a(
            pages_data,
            _empty_glossary(),
            cert_id="itpassport_r6",
            run_id="test_run",
        )
        assert passed is False
        assert any("page_014" in m for m in failures)
        assert any("FAIL" in m for m in failures)

    def test_warn_only_data_passes_gate(self):
        # D9 emits INFO (after Stage B retro Q4=B), not FAIL — never blocks Gate A.
        glos = Glossary(
            cert_id="itpassport_r6", run_id="test_run",
            entries=[
                GlossaryEntry(
                    id="g_001",
                    surface=Trilingual(jp="経営者", zh="经营者", en="business operator"),
                    first_page=1,
                    occurrences=[1],
                )
            ],
        )
        pages_data = {
            14: {
                "translated_entities": [
                    {
                        "id": "term_x",
                        "type": "term",
                        "anchor": {"page": 1, "block_id": "p001_b0", "section_path": []},
                        "surface": {"jp": "別", "zh": "别", "en": "other"},
                        "definition": {
                            "jp": "経営者の説明",
                            "zh": "经营者的说明",
                            "en": "explanation",  # missing locked en "business operator"
                        },
                    }
                ],
                "structured_entities": [],
                "cleaned_text": None,
            }
        }
        passed, failures = run_gate_a(
            pages_data,
            glos,
            cert_id="itpassport_r6",
            run_id="test_run",
        )
        # D9 fires INFO; Gate A only blocks on FAIL.
        assert passed is True


# ---------------------------------------------------------------------------
# Gate B
# ---------------------------------------------------------------------------


class TestGateB:
    def test_clean_minimal_pass(self):
        translated_by_page = {14: [_trilingual_term(jp="x", zh="x", en="x")]}
        passed, failures = run_gate_b(translated_by_page)
        assert passed is True
        assert failures == []

    def test_b1_answer_index_minus_one_caught(self):
        q = _question(
            choices=[
                {"jp": "ア．a", "zh": "A. a", "en": "A. a"},
                {"jp": "イ．b", "zh": "B. b", "en": "B. b"},
            ],
            answer_index=-1,
        )
        translated_by_page = {14: [q]}
        passed, failures = run_gate_b(translated_by_page)
        assert passed is False
        assert any("answer_index == -1" in m for m in failures)
        assert any("D-076" in m for m in failures)

    def test_b2_untranslated_residue_caught(self):
        term = _trilingual_term(jp="x", zh="x", en="x", def_en="UNTRANSLATED")
        translated_by_page = {14: [term]}
        passed, failures = run_gate_b(translated_by_page)
        assert passed is False
        assert any("UNTRANSLATED" in m for m in failures)

    def test_b3_non_canonical_choice_marker_caught(self):
        # zh choice with kana marker — should be caught (Stage B regression).
        q = _question(
            choices=[
                {"jp": "ア．a", "zh": "ウ．a", "en": "A. a"},
                {"jp": "イ．b", "zh": "B. b", "en": "B. b"},
            ],
            answer_index=0,
        )
        translated_by_page = {14: [q]}
        passed, failures = run_gate_b(translated_by_page)
        assert passed is False
        assert any("Gate B/B3" in m and "non-canonical" in m for m in failures)

    def test_b3_canonical_after_normalize_passes(self):
        q = _question(
            choices=[
                {"jp": "ア．a", "zh": "A. a", "en": "A. a"},
                {"jp": "イ．b", "zh": "B. b", "en": "B. b"},
                {"jp": "ウ．c", "zh": "C. c", "en": "C. c"},
                {"jp": "エ．d", "zh": "D. d", "en": "D. d"},
            ],
            answer_index=0,
        )
        translated_by_page = {14: [q]}
        passed, failures = run_gate_b(translated_by_page)
        assert passed is True, failures

    def test_b4_empty_trilingual_caught(self):
        term = _trilingual_term(jp="x", zh="", en="x")  # zh is empty string
        translated_by_page = {14: [term]}
        passed, failures = run_gate_b(translated_by_page)
        assert passed is False
        assert any("Gate B/B4" in m and "empty" in m for m in failures)

    def test_multiple_gate_b_failures_aggregated(self):
        # 3 different B-failures on one page.
        q_with_minus_one = _question(
            choices=[
                {"jp": "ア．a", "zh": "ウ．a", "en": "A. a"},  # B3
            ],
            answer_index=-1,  # B1
        )
        term_with_untranslated = _trilingual_term(
            jp="x", zh="x", en="UNTRANSLATED: pending"
        )  # B2
        translated_by_page = {14: [q_with_minus_one, term_with_untranslated]}
        passed, failures = run_gate_b(translated_by_page)
        assert passed is False
        # At least one of each tag.
        assert any("Gate B/B1" in m for m in failures)
        assert any("Gate B/B2" in m for m in failures)
        assert any("Gate B/B3" in m for m in failures)


# ---------------------------------------------------------------------------
# Composition
# ---------------------------------------------------------------------------


class TestRunBothGates:
    def test_both_pass_composes_passed_true(self):
        result = run_both_gates(
            _good_pages_data(),
            _empty_glossary(),
            cert_id="itpassport_r6",
            run_id="test_run",
        )
        assert result.passed is True
        assert result.gate_a_passed is True
        assert result.gate_b_passed is True
        assert result.all_failures == []

    def test_gate_a_failure_only(self):
        pages_data = {
            14: {
                "translated_entities": [
                    _trilingual_term(jp="別", zh="书", en="book")  # D1 fail
                ],
                "structured_entities": [
                    _trilingual_term(jp="本", zh="书", en="book")
                ],
                "cleaned_text": None,
            }
        }
        result = run_both_gates(
            pages_data,
            _empty_glossary(),
            cert_id="itpassport_r6",
            run_id="test_run",
        )
        assert result.passed is False
        assert result.gate_a_passed is False
        assert result.gate_b_passed is True
        assert len(result.gate_a_failures) > 0
        assert result.gate_b_failures == []

    def test_gate_b_failure_only(self):
        # Use a non-canonical choice marker — fires B3 but doesn't break
        # any Stage 6 deterministic detector (D3 schema is satisfied —
        # choice text is a non-empty string; D6 is part of Phase 1 but it
        # checks cross-language consistency not canonical conventions, so
        # the marker may differ from the canonical without firing D6 FAIL).
        q = _question(
            choices=[
                {"jp": "ア．a", "zh": "ウ．a", "en": "A. a"},  # zh non-canonical
                {"jp": "イ．b", "zh": "B. b", "en": "B. b"},
            ],
            answer_index=0,
        )
        pages_data = {
            14: {
                "translated_entities": [q],
                "structured_entities": [q],
                "cleaned_text": None,
            }
        }
        result = run_both_gates(
            pages_data,
            _empty_glossary(),
            cert_id="itpassport_r6",
            run_id="test_run",
        )
        assert result.passed is False
        # Gate A may or may not flag the marker via D6 (it's WARN there,
        # not FAIL — Stage 6 design). Either way Gate A's FAIL count is
        # 0, so it passes. Gate B B3 catches the non-canonical marker.
        assert result.gate_a_passed is True
        assert result.gate_b_passed is False
        assert any("Gate B/B3" in m for m in result.gate_b_failures)

    def test_both_gates_fail_aggregated(self):
        pages_data = {
            14: {
                "translated_entities": [
                    _trilingual_term(jp="別", zh="", en="book")  # D1 + B4
                ],
                "structured_entities": [
                    _trilingual_term(jp="本", zh="x", en="book")
                ],
                "cleaned_text": None,
            }
        }
        result = run_both_gates(
            pages_data,
            _empty_glossary(),
            cert_id="itpassport_r6",
            run_id="test_run",
        )
        assert result.passed is False
        assert result.gate_a_passed is False
        assert result.gate_b_passed is False
        assert len(result.gate_a_failures) > 0
        assert len(result.gate_b_failures) > 0
        assert len(result.all_failures) == len(result.gate_a_failures) + len(
            result.gate_b_failures
        )
