"""Unit tests for Stage 6 Phase 1 deterministic detectors (D-077 §2.1)."""
from __future__ import annotations

from cert_extractor import UNTRANSLATED
from cert_extractor.pipeline.stage6_audit.detectors import (
    Phase1Inputs,
    _detect_answer_index_mismatch,
    _detect_answer_index_out_of_range,
    _detect_choice_marker_inconsistent,
    _detect_glossary_lock_missed,
    _detect_glossary_lock_violated,
    _detect_jp_mutation,
    _detect_kana_helper_format,
    _detect_kana_helper_present,
    _detect_numeric_inconsistent,
    _detect_redundant_nested_parens,
    _detect_schema_invalid,
    _detect_untranslated_residue,
    detect_glossary_consistency,
    run_phase1,
)
from cert_extractor.pipeline.stage6_audit.schema import (
    Stage6IssueSeverity,
)
from cert_extractor.schema.common import KanaHelper, Trilingual
from cert_extractor.schema.glossary import Glossary, GlossaryEntry

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _trilingual(jp: str, zh: str, en: str) -> dict:
    return {"jp": jp, "zh": zh, "en": en}


def _term(
    *,
    id_: str,
    page: int,
    jp: str,
    zh: str,
    en: str,
    def_jp: str = "定義",
    def_zh: str = "定义",
    def_en: str = "definition",
    kana_helper: dict | None = None,
) -> dict:
    return {
        "type": "term",
        "id": id_,
        "anchor": {
            "page": page,
            "block_id": f"page_{page:03d}_block_{id_}",
            "section_path": [],
        },
        "surface": _trilingual(jp, zh, en),
        "definition": _trilingual(def_jp, def_zh, def_en),
        "kana_helper": kana_helper,
    }


def _question(
    *,
    id_: str,
    page: int,
    stem_jp: str = "ステム",
    stem_zh: str = "题干",
    stem_en: str = "stem",
    choices: list[tuple[str, str, str]] | None = None,
    answer_index: int = 0,
) -> dict:
    if choices is None:
        choices = [
            ("ア．選択A", "A. 选项A", "A. choice A"),
            ("イ．選択B", "B. 选项B", "B. choice B"),
            ("ウ．選択C", "C. 选项C", "C. choice C"),
            ("エ．選択D", "D. 选项D", "D. choice D"),
        ]
    return {
        "type": "question",
        "id": id_,
        "anchor": {
            "page": page,
            "block_id": f"page_{page:03d}_block_{id_}",
            "section_path": [],
        },
        "stem": _trilingual(stem_jp, stem_zh, stem_en),
        "choices": [_trilingual(*c) for c in choices],
        "answer_index": answer_index,
    }


def _glossary(*entries: GlossaryEntry) -> Glossary:
    return Glossary(
        cert_id="itpassport_r6",
        run_id="test_run",
        entries=list(entries),
    )


def _entry(
    *,
    id_: str,
    jp: str,
    zh: str,
    en: str,
    page: int = 1,
    kana_helper: KanaHelper | None = None,
    aliases_jp: list[str] | None = None,
) -> GlossaryEntry:
    return GlossaryEntry(
        id=id_,
        surface=Trilingual(jp=jp, zh=zh, en=en),
        kana_helper=kana_helper,
        first_page=page,
        occurrences=[page],
        aliases_jp=aliases_jp or [],
    )


def _inputs(
    *,
    page: int = 14,
    structured: list[dict] | None = None,
    translated: list[dict] | None = None,
    glossary: Glossary | None = None,
    cleaned_text: str | None = None,
) -> Phase1Inputs:
    return Phase1Inputs(
        page=page,
        cert_id="itpassport_r6",
        run_id="test_run",
        structured_entities=structured or [],
        translated_entities=translated or [],
        glossary=glossary or _glossary(),
        cleaned_text=cleaned_text,
    )


# ---------------------------------------------------------------------------
# D1 jp_mutation
# ---------------------------------------------------------------------------


class TestJpMutation:
    def test_term_surface_jp_mutation_flagged_with_safety_field(self):
        # Plan-B reproduction: structured CSR but translated CSR(企業の社会的責任).
        s = [_term(id_="t1", page=14, jp="CSR", zh="<UNTRANSLATED>", en="<UNTRANSLATED>")]
        t = [_term(id_="t1", page=14, jp="CSR（企業の社会的責任）", zh="社会责任", en="CSR")]
        issues = _detect_jp_mutation(_inputs(structured=s, translated=t))
        assert len(issues) == 1
        assert issues[0].issue_type == "jp_mutation"
        assert issues[0].severity == Stage6IssueSeverity.FAIL
        assert issues[0].safety_field == "Term.surface.jp"

    def test_clean_term_no_issue(self):
        s = [_term(id_="t1", page=14, jp="CSR", zh="<UNTRANSLATED>", en="<UNTRANSLATED>")]
        t = [_term(id_="t1", page=14, jp="CSR", zh="社会责任", en="CSR")]
        assert _detect_jp_mutation(_inputs(structured=s, translated=t)) == []

    def test_question_stem_jp_mutation_no_safety_field(self):
        s = [_question(id_="q1", page=14, stem_jp="原題")]
        t = [_question(id_="q1", page=14, stem_jp="原題（改写）")]
        issues = _detect_jp_mutation(_inputs(structured=s, translated=t))
        assert len(issues) == 1
        assert issues[0].safety_field is None  # Only Term.surface.jp is safety


# ---------------------------------------------------------------------------
# D2 untranslated_residue
# ---------------------------------------------------------------------------


class TestUntranslatedResidue:
    def test_zh_sentinel_flagged(self):
        t = [_term(id_="t1", page=14, jp="abc", zh=UNTRANSLATED, en="abc")]
        issues = _detect_untranslated_residue(_inputs(translated=t))
        assert any(i.entity_path.endswith(".zh") for i in issues)
        assert all(i.severity == Stage6IssueSeverity.FAIL for i in issues)

    def test_en_sentinel_flagged(self):
        t = [_term(id_="t1", page=14, jp="abc", zh="abc", en=UNTRANSLATED)]
        issues = _detect_untranslated_residue(_inputs(translated=t))
        assert any(i.entity_path.endswith(".en") for i in issues)

    def test_clean_no_issue(self):
        t = [_term(id_="t1", page=14, jp="abc", zh="abc", en="abc")]
        assert _detect_untranslated_residue(_inputs(translated=t)) == []


# ---------------------------------------------------------------------------
# D3 schema_invalid
# ---------------------------------------------------------------------------


class TestSchemaInvalid:
    def test_missing_required_field_flagged(self):
        # Term missing 'definition' field.
        broken = {
            "type": "term",
            "id": "t1",
            "anchor": {
                "page": 14,
                "block_id": "p14_b1",
                "section_path": [],
            },
            "surface": _trilingual("a", "b", "c"),
            # no definition
            "kana_helper": None,
        }
        issues = _detect_schema_invalid(_inputs(translated=[broken]))
        assert any(i.issue_type == "schema_invalid" for i in issues)

    def test_unknown_entity_type_safety_field(self):
        broken = {
            "type": "made_up_type",
            "id": "x1",
            "anchor": {
                "page": 14,
                "block_id": "p14_b1",
                "section_path": [],
            },
        }
        issues = _detect_schema_invalid(_inputs(translated=[broken]))
        # Discriminated union complaint should mention 'type'.
        assert any(
            i.safety_field == "Entity.type" for i in issues
        ), [i.evidence for i in issues]

    def test_valid_entity_no_issue(self):
        t = [_term(id_="t1", page=14, jp="a", zh="b", en="c")]
        assert _detect_schema_invalid(_inputs(translated=t)) == []


# ---------------------------------------------------------------------------
# D4 answer_index_out_of_range
# ---------------------------------------------------------------------------


class TestAnswerIndexRange:
    def test_index_too_high_flagged_safety(self):
        q = _question(id_="q1", page=14, answer_index=99)
        issues = _detect_answer_index_out_of_range(_inputs(translated=[q]))
        assert len(issues) == 1
        assert issues[0].safety_field == "Question.answer_index"

    def test_index_negative_flagged_safety(self):
        q = _question(id_="q1", page=14, answer_index=-5)
        issues = _detect_answer_index_out_of_range(_inputs(translated=[q]))
        assert len(issues) == 1

    def test_in_range_no_issue(self):
        q = _question(id_="q1", page=14, answer_index=2)
        assert _detect_answer_index_out_of_range(_inputs(translated=[q])) == []


# ---------------------------------------------------------------------------
# D5 answer_index_mismatch
# ---------------------------------------------------------------------------


class TestAnswerIndexMismatch:
    def test_plan_b_page_043_pattern_flagged(self):
        # 5 questions page; cleaned text has wrong-vs-translated answer indices.
        cleaned = (
            "問題1-5 ウ\n"
            "問題1-6 ウ\n"
            "問題1-7 ウ\n"
            "問題1-8 エ\n"
            "問題1-9 ウ\n"
        )
        translated = [
            _question(id_="q1", page=43, answer_index=0),  # expected 2 (ウ)
            _question(id_="q2", page=43, answer_index=1),
            _question(id_="q3", page=43, answer_index=1),
            _question(id_="q4", page=43, answer_index=3),  # expected 3 (エ) — match
            _question(id_="q5", page=43, answer_index=0),
        ]
        issues = _detect_answer_index_mismatch(
            _inputs(page=43, translated=translated, cleaned_text=cleaned)
        )
        # 4 out of 5 mismatch (q4 actually matches — エ=3).
        assert len(issues) == 4
        assert all(
            i.safety_field == "Question.answer_index" for i in issues
        )

    def test_match_no_issue(self):
        cleaned = "問題1-5 ウ\n問題1-6 エ\n"
        translated = [
            _question(id_="q1", page=43, answer_index=2),
            _question(id_="q2", page=43, answer_index=3),
        ]
        issues = _detect_answer_index_mismatch(
            _inputs(page=43, translated=translated, cleaned_text=cleaned)
        )
        assert issues == []

    def test_count_mismatch_emits_page_level_fail(self):
        cleaned = "問題1-5 ウ\n問題1-6 ウ\n"
        translated = [
            _question(id_="q1", page=43, answer_index=2),
            _question(id_="q2", page=43, answer_index=2),
            _question(id_="q3", page=43, answer_index=2),
        ]
        issues = _detect_answer_index_mismatch(
            _inputs(page=43, translated=translated, cleaned_text=cleaned)
        )
        assert len(issues) == 1
        assert issues[0].severity == Stage6IssueSeverity.FAIL
        assert "expected_count" in issues[0].evidence
        assert "question_count" in issues[0].evidence

    def test_no_cleaned_text_skips(self):
        translated = [_question(id_="q1", page=43, answer_index=2)]
        issues = _detect_answer_index_mismatch(
            _inputs(page=43, translated=translated, cleaned_text=None)
        )
        assert issues == []

    def test_no_answer_line_in_cleaned_skips(self):
        translated = [_question(id_="q1", page=43, answer_index=2)]
        issues = _detect_answer_index_mismatch(
            _inputs(page=43, translated=translated, cleaned_text="No answer line here.")
        )
        assert issues == []


# ---------------------------------------------------------------------------
# D6 choice_marker_inconsistent
# ---------------------------------------------------------------------------


class TestChoiceMarkerInconsistent:
    def test_mixed_zh_markers_warns(self):
        q = _question(
            id_="q1",
            page=43,
            choices=[
                ("ア．a", "A. 选项A", "A. a"),
                ("イ．b", "B. 选项B", "B. b"),
                ("ウ．c", "ウ．选项C", "C. c"),  # zh kept ウ — mixed!
                ("エ．d", "D. 选项D", "D. d"),
            ],
        )
        issues = _detect_choice_marker_inconsistent(_inputs(translated=[q]))
        assert any(i.severity == Stage6IssueSeverity.WARN for i in issues)
        assert all(i.issue_type == "choice_marker_inconsistent" for i in issues)

    def test_consistent_markers_no_issue(self):
        q = _question(
            id_="q1",
            page=43,
            choices=[
                ("ア．a", "A. a", "A. a"),
                ("イ．b", "B. b", "B. b"),
                ("ウ．c", "C. c", "C. c"),
                ("エ．d", "D. d", "D. d"),
            ],
        )
        assert _detect_choice_marker_inconsistent(_inputs(translated=[q])) == []


# ---------------------------------------------------------------------------
# D7 numeric_inconsistent
# ---------------------------------------------------------------------------


class TestNumericInconsistent:
    def test_year_mismatch_flagged(self):
        # A term-like leaf with a year in jp but missing in zh.
        t = [
            _term(
                id_="t1",
                page=14,
                jp="1980年制定",
                zh="制定",  # missing 1980
                en="enacted in 1980",
            )
        ]
        issues = _detect_numeric_inconsistent(_inputs(translated=t))
        assert any(i.issue_type == "numeric_inconsistent" for i in issues)

    def test_full_width_digits_normalize(self):
        t = [
            _term(
                id_="t1",
                page=14,
                jp="１００％",
                zh="100%",
                en="100%",
            )
        ]
        assert _detect_numeric_inconsistent(_inputs(translated=t)) == []

    def test_no_numbers_anywhere_no_issue(self):
        t = [_term(id_="t1", page=14, jp="abc", zh="def", en="ghi")]
        assert _detect_numeric_inconsistent(_inputs(translated=t)) == []


# ---------------------------------------------------------------------------
# D8 glossary_lock_violated
# ---------------------------------------------------------------------------


class TestGlossaryLockViolated:
    def test_term_zh_does_not_match_lock_flagged(self):
        glos = _glossary(
            _entry(id_="g_001", jp="CSR", zh="企业社会责任", en="Corporate Social Responsibility"),
        )
        t = [_term(id_="t1", page=14, jp="CSR", zh="社会责任", en="CSR")]
        issues = _detect_glossary_lock_violated(_inputs(translated=t, glossary=glos))
        assert any(i.issue_type == "glossary_lock_violated" for i in issues)

    def test_term_matches_lock_no_issue(self):
        glos = _glossary(
            _entry(id_="g_001", jp="CSR", zh="企业社会责任", en="Corporate Social Responsibility"),
        )
        t = [
            _term(
                id_="t1",
                page=14,
                jp="CSR",
                zh="企业社会责任",
                en="Corporate Social Responsibility",
            )
        ]
        assert _detect_glossary_lock_violated(_inputs(translated=t, glossary=glos)) == []


# ---------------------------------------------------------------------------
# D9 glossary_lock_missed
# ---------------------------------------------------------------------------


class TestGlossaryLockMissed:
    def test_substring_miss_in_zh_warns(self):
        glos = _glossary(
            _entry(id_="g_001", jp="CSR", zh="企业社会责任", en="CSR"),
        )
        t = [
            _term(
                id_="t1",
                page=14,
                jp="未定義語",
                zh="未定义术语",
                en="undefined",
                def_jp="CSRの説明文",
                def_zh="社会责任的解释",  # Missing 企业社会责任
                def_en="explanation of CSR",
            )
        ]
        issues = _detect_glossary_lock_missed(_inputs(translated=t, glossary=glos))
        assert any(i.severity == Stage6IssueSeverity.WARN for i in issues)
        assert all(i.issue_type == "glossary_lock_missed" for i in issues)

    def test_short_glossary_key_skipped(self):
        # 2-char key shouldn't trigger spurious substring match.
        glos = _glossary(
            _entry(id_="g_001", jp="GO", zh="去", en="go"),
        )
        t = [_term(id_="t1", page=14, jp="GOAL", zh="目标", en="goal", def_jp="...", def_zh="...", def_en="...")]
        assert _detect_glossary_lock_missed(_inputs(translated=t, glossary=glos)) == []


# ---------------------------------------------------------------------------
# D10 redundant_nested_parens
# ---------------------------------------------------------------------------


class TestRedundantNestedParens:
    def test_nested_parens_in_en_warned(self):
        t = [
            _term(
                id_="t1",
                page=45,
                jp="COP21",
                zh="COP21",
                en="COP21",
                def_jp="2015年の会議",
                def_zh="2015年的会议",
                def_en="2015 conference (COP21 (21st Conference of the Parties))",
            )
        ]
        issues = _detect_redundant_nested_parens(_inputs(translated=t))
        assert any(i.issue_type == "redundant_nested_parens" for i in issues)
        assert all(i.severity == Stage6IssueSeverity.WARN for i in issues)

    def test_simple_parens_no_issue(self):
        t = [_term(id_="t1", page=14, jp="x", zh="x", en="X (acronym)")]
        assert _detect_redundant_nested_parens(_inputs(translated=t)) == []


# ---------------------------------------------------------------------------
# D11 kana_helper_present
# ---------------------------------------------------------------------------


class TestKanaHelperPresent:
    def test_all_katakana_term_without_helper_info(self):
        t = [
            _term(
                id_="t1",
                page=14,
                jp="ステークホルダ",
                zh="利益相关者",
                en="stakeholder",
                kana_helper=None,
            )
        ]
        issues = _detect_kana_helper_present(_inputs(translated=t))
        assert any(i.issue_type == "kana_helper_missing" for i in issues)

    def test_all_kanji_term_with_helper_unexpected(self):
        t = [
            _term(
                id_="t1",
                page=14,
                jp="経営理念",
                zh="经营理念",
                en="management philosophy",
                kana_helper={
                    "surface": "経営理念",
                    "reading": "keieirinen",
                    "zh_concept": "经营理念",
                },
            )
        ]
        issues = _detect_kana_helper_present(_inputs(translated=t))
        assert any(i.issue_type == "kana_helper_unexpected" for i in issues)

    def test_all_katakana_term_with_helper_no_issue(self):
        t = [
            _term(
                id_="t1",
                page=14,
                jp="ステークホルダ",
                zh="利益相关者",
                en="stakeholder",
                kana_helper={
                    "surface": "ステークホルダ",
                    "reading": "suteekuhoruda",
                    "zh_concept": "利益相关者",
                },
            )
        ]
        assert _detect_kana_helper_present(_inputs(translated=t)) == []

    def test_mixed_term_no_rule(self):
        t = [
            _term(
                id_="t1",
                page=14,
                jp="HRテック",
                zh="HR科技",
                en="HR Tech",
                kana_helper=None,
            )
        ]
        assert _detect_kana_helper_present(_inputs(translated=t)) == []


# ---------------------------------------------------------------------------
# D12 kana_helper_format
# ---------------------------------------------------------------------------


class TestKanaHelperFormat:
    def test_uppercase_reading_flagged(self):
        t = [
            _term(
                id_="t1",
                page=14,
                jp="ステークホルダ",
                zh="z",
                en="e",
                kana_helper={
                    "surface": "ステークホルダ",
                    "reading": "Suteekuhoruda",  # uppercase first char
                    "zh_concept": "z",
                },
            )
        ]
        issues = _detect_kana_helper_format(_inputs(translated=t))
        assert any(i.issue_type == "kana_helper_format" for i in issues)

    def test_lowercase_reading_no_issue(self):
        t = [
            _term(
                id_="t1",
                page=14,
                jp="ステークホルダ",
                zh="z",
                en="e",
                kana_helper={
                    "surface": "ステークホルダ",
                    "reading": "suteekuhoruda",
                    "zh_concept": "z",
                },
            )
        ]
        assert _detect_kana_helper_format(_inputs(translated=t)) == []

    def test_apostrophe_allowed(self):
        t = [
            _term(
                id_="t1",
                page=14,
                jp="シンイチ",
                zh="z",
                en="e",
                kana_helper={
                    "surface": "シンイチ",
                    "reading": "shin'ichi",
                    "zh_concept": "z",
                },
            )
        ]
        assert _detect_kana_helper_format(_inputs(translated=t)) == []


# ---------------------------------------------------------------------------
# D13 glossary_surface_concept_split
# ---------------------------------------------------------------------------


class TestGlossarySurfaceConceptSplit:
    def test_unrelated_concept_flagged(self):
        glos = _glossary(
            _entry(
                id_="g_001",
                jp="グリーンIT",
                zh="绿色IT",
                en="Green IT",
                kana_helper=KanaHelper(
                    surface="グリーンIT",
                    reading="guriin ai tii",
                    zh_concept="绿色信息技术",
                ),
            )
        )
        issues = detect_glossary_consistency(glos)
        assert any(i.issue_type == "glossary_surface_concept_split" for i in issues)
        assert issues[0].severity == Stage6IssueSeverity.INFO

    def test_substring_concept_no_issue(self):
        glos = _glossary(
            _entry(
                id_="g_001",
                jp="アルゴリズム",
                zh="算法",
                en="Algorithm",
                kana_helper=KanaHelper(
                    surface="アルゴリズム",
                    reading="arugorizumu",
                    zh_concept="算法 (步骤集合)",
                ),
            )
        )
        assert detect_glossary_consistency(glos) == []

    def test_no_kana_helper_skips(self):
        glos = _glossary(
            _entry(id_="g_001", jp="CEO", zh="首席执行官", en="Chief Executive Officer"),
        )
        assert detect_glossary_consistency(glos) == []


# ---------------------------------------------------------------------------
# Coordinator
# ---------------------------------------------------------------------------


class TestRunPhase1:
    def test_clean_page_returns_no_issues(self):
        glos = _glossary(
            _entry(id_="g_001", jp="CSR", zh="企业社会责任", en="CSR"),
        )
        s = [
            _term(
                id_="t1",
                page=14,
                jp="CSR",
                zh="<UNTRANSLATED>",
                en="<UNTRANSLATED>",
                def_jp="abc",
                def_zh="<UNTRANSLATED>",
                def_en="<UNTRANSLATED>",
            )
        ]
        t = [
            _term(
                id_="t1",
                page=14,
                jp="CSR",
                zh="企业社会责任",
                en="CSR",
                def_jp="abc",
                def_zh="abc",
                def_en="abc",
            )
        ]
        assert run_phase1(_inputs(structured=s, translated=t, glossary=glos)) == []

    def test_multi_detector_hits_aggregated(self):
        # Construct a page that hits D1 + D2 + D6 + D8 simultaneously, using
        # SEPARATE terms so D1 (jp-mutation) and D8 (zh-mismatch) don't
        # collide on the same entity (mutating surface.jp prevents D8 lookup).
        glos = _glossary(
            _entry(id_="g_001", jp="CSR", zh="企业社会责任", en="CSR"),
            _entry(id_="g_002", jp="CIO", zh="首席信息官", en="Chief Information Officer"),
        )
        s = [
            # Term to be mutated by Stage 5 (D1).
            _term(
                id_="t1",
                page=14,
                jp="CSR",
                zh="<UNTRANSLATED>",
                en="<UNTRANSLATED>",
                def_jp="d",
                def_zh="<UNTRANSLATED>",
                def_en="<UNTRANSLATED>",
            ),
            # Term to break glossary lock (D8) without mutating jp.
            _term(
                id_="t2",
                page=14,
                jp="CIO",
                zh="<UNTRANSLATED>",
                en="<UNTRANSLATED>",
                def_jp="d2",
                def_zh="<UNTRANSLATED>",
                def_en="<UNTRANSLATED>",
            ),
            _question(id_="q1", page=14),
        ]
        t = [
            # D1: jp mutated by Stage 5 (Plan-B style); D2: en is sentinel.
            _term(
                id_="t1",
                page=14,
                jp="CSR(社責)",
                zh="社会责任",
                en=UNTRANSLATED,
                def_jp="d",
                def_zh="d",
                def_en="d",
            ),
            # D8: zh deviates from glossary lock without touching jp.
            _term(
                id_="t2",
                page=14,
                jp="CIO",
                zh="信息总监",  # WRONG — glossary says 首席信息官
                en="Chief Information Officer",
                def_jp="d2",
                def_zh="d2",
                def_en="d2",
            ),
            # D6: choice markers mixed in zh.
            _question(
                id_="q1",
                page=14,
                choices=[
                    ("ア．a", "A. a", "A. a"),
                    ("イ．b", "B. b", "B. b"),
                    ("ウ．c", "ウ．c", "C. c"),
                    ("エ．d", "D. d", "D. d"),
                ],
            ),
        ]
        issues = run_phase1(_inputs(structured=s, translated=t, glossary=glos))
        types = {i.issue_type for i in issues}
        assert "jp_mutation" in types
        assert "untranslated_residue" in types
        assert "glossary_lock_violated" in types
        assert "choice_marker_inconsistent" in types

    def test_safety_field_flagged_on_term_jp_mutation(self):
        s = [_term(id_="t1", page=14, jp="ABC", zh="<UNTRANSLATED>", en="<UNTRANSLATED>")]
        t = [_term(id_="t1", page=14, jp="ABC（拡張）", zh="ABC", en="ABC")]
        issues = run_phase1(_inputs(structured=s, translated=t))
        jp_mut = [i for i in issues if i.issue_type == "jp_mutation"]
        assert any(i.safety_field == "Term.surface.jp" for i in jp_mut)
