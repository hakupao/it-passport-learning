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

    def test_term_only_page_with_answer_prose_skips(self):
        # Stage A regression: page_045 is term-only (0 questions) but the
        # OCR has answer-explanation prose ("解答 1-7\nウ ...") that
        # previously triggered a false-positive Question.answer_index
        # safety FAIL.  D5 must short-circuit when no question entities.
        translated = [
            _term(id_="t1", page=45, jp="HRTech", zh="HR科技", en="HR Tech"),
            _term(id_="t2", page=45, jp="CIO", zh="首席信息官", en="CIO"),
        ]
        cleaned = (
            "ア．エコファームとは…\n"
            "解答 1-7\nウ 図を見ると…\n"
            "解答 1-8\nエ 「利益責任」と…\n"
            "解答 1-9\nウ 「情報システム」の…\n"
        )
        issues = _detect_answer_index_mismatch(
            _inputs(page=45, translated=translated, cleaned_text=cleaned)
        )
        assert issues == [], (
            "D5 must short-circuit on term-only pages even when source "
            "text contains stray answer markers (Stage A regression)."
        )

    def test_choice_prefix_after_question_label_not_captured(self):
        # Stage B regression (page_042): OCR has lines like
        #   "1-1\nア. 企業が..."
        # The original regex `\s*[\s　]+([アイウエオ])` allowed the
        # newline between `1-1` and `ア.` to match, capturing the
        # choice-prefix kana as if it were an answer-line token. 3 such
        # false-positive captures combined with the real 4-marker answer
        # line yielded 7 total matches and tripped a safety FAIL on a
        # page where Stage 4 had extracted 4 questions correctly.
        # Fix: negative lookahead `(?![.．])` after the captured kana —
        # answer-line kana are bare and space-separated, never followed
        # by a period.
        cleaned = (
            "## 問題\n"
            "### Q1 stem here\n"
            "(平成21年度)\n\n"
            "1-1\n"
            "ア. choice A1\n"
            "イ. choice B1\n"
            "ウ. choice C1\n"
            "エ. choice D1\n\n"
            "## 問題\n"
            "### Q2 stem here\n"
            "(平成22年度)\n\n"
            "1-2\n"
            "ア. choice A2\n"
            "イ. choice B2\n"
            "ウ. choice C2\n"
            "エ. choice D2\n\n"
            "問題1-1 ア 問題1-2 イ\n"
        )
        translated = [
            _question(id_="q1", page=42, answer_index=0),  # ア
            _question(id_="q2", page=42, answer_index=1),  # イ
        ]
        issues = _detect_answer_index_mismatch(
            _inputs(page=42, translated=translated, cleaned_text=cleaned)
        )
        assert issues == [], (
            "D5 must not capture choice-prefix 'ア.' as answer markers "
            "(Stage B regression: page_042 had 3 such false captures "
            "before the negative-lookahead fix)."
        )

    def test_full_width_period_after_kana_not_captured(self):
        # Belt-and-suspenders: full-width period 'ア．' (U+FF0E) must
        # also disqualify the kana as an answer-line token, since OCR
        # output frequently uses the full-width form for Japanese text.
        cleaned = (
            "1-1\n"
            "ア．choice A1\n"
            "イ．choice B1\n\n"
            "問題1-1 ア\n"
        )
        translated = [_question(id_="q1", page=42, answer_index=0)]
        issues = _detect_answer_index_mismatch(
            _inputs(page=42, translated=translated, cleaned_text=cleaned)
        )
        assert issues == []

    def test_markdown_bold_answer_line_session20_page_181(self):
        # Session 20 Stage B regression (page_181): Stage 3 hard-page
        # re-OCR (Vision LLM) emitted markdown bold around each answer
        # kana on the answer line, e.g.
        #   "問題4-19  **エ**  問題4-20  **ウ**  問題4-21  **ウ**  問題4-22  **ウ**"
        # The `**` is not whitespace, so the regex `\s*[\s　]+[アイウエオ]`
        # failed to match between the question number and the kana,
        # causing the detector to find only stray bare kana (likely a
        # choice prefix the lookahead missed in a different OCR layout)
        # and emit a page-level safety FAIL "Source answer line has 1
        # answers (イ) but page has 4 question entities; cannot align".
        # The actual Stage 4 answer_index values [3,2,2,2] mapped
        # correctly to [エ,ウ,ウ,ウ] ground truth — a pure detector FP.
        # Fix: strip `**` from cleaned_text inside _parse_answer_letters
        # before regex application.
        cleaned = (
            "問題4-19　**エ**　　問題4-20　**ウ**　　問題4-21　**ウ**　　問題4-22　**ウ**\n"
        )
        translated = [
            _question(id_="q1", page=181, answer_index=3),  # エ
            _question(id_="q2", page=181, answer_index=2),  # ウ
            _question(id_="q3", page=181, answer_index=2),  # ウ
            _question(id_="q4", page=181, answer_index=2),  # ウ
        ]
        issues = _detect_answer_index_mismatch(
            _inputs(page=181, translated=translated, cleaned_text=cleaned)
        )
        assert issues == [], (
            "D5 must strip markdown bold (`**`) from cleaned source "
            "before answer-line regex (Session 20 page_181 regression)."
        )


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
    def test_year_mismatch_flagged_warn_when_one_side_omits(self):
        # jp+en agree on "1980" but zh omits — populated sets {1980} agree,
        # missing zh is a paraphrase. WARN-level (not FAIL).
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
        assert all(
            i.severity == Stage6IssueSeverity.WARN
            for i in issues if i.issue_type == "numeric_inconsistent"
        )

    def test_conflicting_numbers_flagged_fail(self):
        # jp says 1980, zh says 1990 — populated sets disagree, real bug.
        t = [
            _term(
                id_="t1",
                page=14,
                jp="1980年制定",
                zh="1990年制定",
                en="enacted in 1980",
            )
        ]
        issues = _detect_numeric_inconsistent(_inputs(translated=t))
        assert any(
            i.severity == Stage6IssueSeverity.FAIL
            and i.issue_type == "numeric_inconsistent"
            for i in issues
        )

    def test_spelled_out_english_warn_not_fail(self):
        # Stage A regression: jp "4種類" / zh "4种" / en "four types" —
        # populated sets agree on {"4"}, en omits Arabic digit because of
        # English style preference. WARN, not FAIL.
        t = [
            _term(
                id_="t1",
                page=14,
                jp="4種類の文字",
                zh="4种文字",
                en="four types of text",
            )
        ]
        issues = _detect_numeric_inconsistent(_inputs(translated=t))
        assert all(
            i.severity == Stage6IssueSeverity.WARN
            for i in issues if i.issue_type == "numeric_inconsistent"
        )

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

    def test_circled_numerals_normalize(self):
        # Stage A regression: page_014 table cells have jp `①イメージ図`
        # / zh `①示意图` / en `(1) Conceptual Diagram`. Without circled
        # normalization, jp/zh report 0 numerics while en reports {"1"},
        # yielding a false-positive FAIL.
        t = [
            _term(
                id_="t1",
                page=14,
                jp="①イメージ図",
                zh="①示意图",
                en="(1) Conceptual Diagram",
            )
        ]
        assert _detect_numeric_inconsistent(_inputs(translated=t)) == []

    def test_circled_numerals_higher_range(self):
        # ⑩ → 10 in normalization.
        t = [
            _term(
                id_="t1",
                page=14,
                jp="第⑩条の規定",
                zh="第10条的规定",
                en="Article 10 provision",
            )
        ]
        assert _detect_numeric_inconsistent(_inputs(translated=t)) == []

    def test_subset_difference_warn_not_fail(self):
        # Stage B regression (page_019): jp/zh keep month digits, en
        # spells them out — same content, partial spelled-out.
        #   jp/zh `54.4％（2022年4月～2022年8月）` → {"54","4","2022","8"}
        #   en    `54.4% (April 2022 – August 2022)` → {"54","4","2022"}
        # The original heuristic only downgraded to WARN when all
        # populated sets were identical; subset-only differences fell
        # through to FAIL. After the fix, pairwise-comparable sets
        # (en ⊆ jp = zh) are WARN — no conflicting values exist across
        # languages, just spelled-out forms in one of them.
        t = [
            _term(
                id_="t1",
                page=19,
                jp="54.4％（2022年4月～2022年8月）",
                zh="54.4％（2022年4月～2022年8月）",
                en="54.4% (April 2022 – August 2022)",
            )
        ]
        issues = _detect_numeric_inconsistent(_inputs(translated=t))
        assert any(i.issue_type == "numeric_inconsistent" for i in issues), (
            "Subset difference should still surface as an issue."
        )
        assert all(
            i.severity == Stage6IssueSeverity.WARN
            for i in issues if i.issue_type == "numeric_inconsistent"
        ), "Subset-only set difference must be WARN, not FAIL."

    def test_real_conflict_still_fails(self):
        # Sanity check that the subset-relaxation didn't downgrade real
        # conflicts: jp says 1980, zh says 1990 — neither set is a
        # subset of the other → real semantic conflict → FAIL stays.
        t = [
            _term(
                id_="t1",
                page=14,
                jp="1980年制定",
                zh="1990年制定",
                en="1980 enacted",
            )
        ]
        issues = _detect_numeric_inconsistent(_inputs(translated=t))
        assert any(
            i.severity == Stage6IssueSeverity.FAIL
            and i.issue_type == "numeric_inconsistent"
            for i in issues
        ), "Conflicting values must still FAIL even after subset relaxation."


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
    def test_substring_miss_in_zh_emits_info(self):
        # Stage B retro (Q4=B): D9 severity policy downgraded WARN → INFO.
        # Real signal-to-noise on 40-page dispatch was too low at WARN
        # (30 instances, most acceptable paraphrases). INFO keeps the
        # report visible without contributing to overall_verdict.
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
        assert any(i.severity == Stage6IssueSeverity.INFO for i in issues)
        assert all(i.issue_type == "glossary_lock_missed" for i in issues)
        assert all(
            i.severity == Stage6IssueSeverity.INFO for i in issues
        ), "D9 must emit INFO (Stage B retro Q4=B)."

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
