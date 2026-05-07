"""Stage 6 Phase 1 deterministic detectors (D-077 §2.1 D1-D13).

Each detector is a pure function over ``Phase1Inputs`` that returns a
list of ``Stage6Issue``. ``run_phase1`` runs all 12 page-level
detectors and returns a flat issue list. ``detect_glossary_consistency``
is the single run-level detector (D13).

Detector outputs feed ``Stage6PageReview.from_issues`` for verdict
composition (per D-077 §2.5).
"""
from __future__ import annotations

import re
from collections.abc import Iterator
from dataclasses import dataclass
from typing import Any

from pydantic import TypeAdapter, ValidationError

from cert_extractor import UNTRANSLATED
from cert_extractor.pipeline.stage6_audit.schema import (
    DIMENSION_BY_ISSUE_TYPE,
    REPAIR_STAGE_BY_ISSUE_TYPE,
    Stage6Issue,
    Stage6IssueDetector,
    Stage6IssueSeverity,
)
from cert_extractor.schema.entities import Entity
from cert_extractor.schema.glossary import Glossary

# ---------------------------------------------------------------------------
# Inputs
# ---------------------------------------------------------------------------


@dataclass
class Phase1Inputs:
    """Inputs to a Phase 1 detector pass for a single page."""

    page: int
    cert_id: str
    run_id: str
    structured_entities: list[dict]
    translated_entities: list[dict]
    glossary: Glossary
    cleaned_text: str | None = None  # cleaned/page_NNN.md OR ocr/page_NNN.md


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _path_str(page: int, entity_idx: int, path: tuple[Any, ...]) -> str:
    """Build dotted entity_path; ints are bracket-indexed, strs are dot-attr."""
    out = f"page_{page:03d}.entities[{entity_idx}]"
    for p in path:
        if isinstance(p, int):
            out += f"[{p}]"
        else:
            out += f".{p}"
    return out


def _is_trilingual(node: Any) -> bool:
    return (
        isinstance(node, dict)
        and "jp" in node
        and "zh" in node
        and "en" in node
        and len(node) == 3
    )


def _iter_trilingual_leaves(
    entities: list[dict],
) -> Iterator[tuple[int, tuple[Any, ...], dict]]:
    """Yield (entity_idx, path_to_leaf, leaf_dict) for every Trilingual leaf."""

    def _descend(node: Any, ent_idx: int, path: list[Any]) -> Iterator[tuple]:
        if _is_trilingual(node):
            yield (ent_idx, tuple(path), node)
            return
        if isinstance(node, dict):
            for k, v in node.items():
                yield from _descend(v, ent_idx, [*path, k])
        elif isinstance(node, list):
            for i, child in enumerate(node):
                yield from _descend(child, ent_idx, [*path, i])

    for idx, entity in enumerate(entities):
        yield from _descend(entity, idx, [])


def _make_issue(
    *,
    issue_id: str,
    issue_type: str,
    severity: Stage6IssueSeverity,
    detector: Stage6IssueDetector,
    entity_path: str,
    evidence: dict[str, str],
    rationale: str,
    safety_field: str | None = None,
    proposed_fix: str | None = None,
    detector_confidence: float | None = None,
) -> Stage6Issue:
    """Construct a Stage6Issue with dimension + repair_stage looked up from
    the closed enum tables. Phase 1 detectors should always go through this
    helper so dimension / repair_stage cannot drift from the table."""
    return Stage6Issue(
        id=issue_id,
        issue_type=issue_type,
        severity=severity,
        dimension=DIMENSION_BY_ISSUE_TYPE[issue_type],
        repair_stage=REPAIR_STAGE_BY_ISSUE_TYPE[issue_type],
        detector=detector,
        entity_path=entity_path,
        evidence=evidence,
        rationale=rationale,
        safety_field=safety_field,
        proposed_fix=proposed_fix,
        detector_confidence=detector_confidence,
    )


def _pydantic_loc_to_path(loc: tuple) -> tuple[Any, ...]:
    """Pydantic error.loc starts at the model root; for entity-list validation
    the first element is the list index. Strip it because we already include
    the entity_idx separately."""
    if loc and isinstance(loc[0], int):
        return loc[1:]
    return loc


_KATAKANA_RE = re.compile(r"^[゠-ヿー]+$")


def _is_all_katakana(text: str) -> bool:
    return bool(_KATAKANA_RE.match(text))


def _has_any_katakana(text: str) -> bool:
    return any("゠" <= c <= "ヿ" or c == "ー" for c in text)


_ENTITY_LIST_ADAPTER: TypeAdapter[list[Entity]] = TypeAdapter(list[Entity])


# ---------------------------------------------------------------------------
# D1 — jp_mutation (translated.jp must equal structured.jp at every Trilingual leaf)
# ---------------------------------------------------------------------------


def _detect_jp_mutation(inputs: Phase1Inputs) -> list[Stage6Issue]:
    issues: list[Stage6Issue] = []

    # Build a lookup of structured leaves keyed by (entity_idx, path).
    structured_lookup: dict[tuple[int, tuple], dict] = {}
    for ent_idx, path, leaf in _iter_trilingual_leaves(inputs.structured_entities):
        structured_lookup[(ent_idx, path)] = leaf

    for ent_idx, path, t_leaf in _iter_trilingual_leaves(inputs.translated_entities):
        s_leaf = structured_lookup.get((ent_idx, path))
        if s_leaf is None:
            # Translated has a leaf structured doesn't — different problem
            # (schema drift). Report under D3 schema_invalid via Pydantic;
            # not flagged here.
            continue
        if t_leaf["jp"] != s_leaf["jp"]:
            entity = (
                inputs.translated_entities[ent_idx]
                if ent_idx < len(inputs.translated_entities)
                else {}
            )
            entity_type = entity.get("type") if isinstance(entity, dict) else None
            safety_field = (
                "Term.surface.jp"
                if entity_type == "term" and path == ("surface",)
                else None
            )
            issues.append(
                _make_issue(
                    issue_id=f"D1-page_{inputs.page:03d}-{len(issues)+1:04d}",
                    issue_type="jp_mutation",
                    severity=Stage6IssueSeverity.FAIL,
                    detector=Stage6IssueDetector.deterministic,
                    entity_path=_path_str(inputs.page, ent_idx, (*path, "jp")),
                    evidence={
                        "structured_jp": s_leaf["jp"],
                        "translated_jp": t_leaf["jp"],
                    },
                    rationale=(
                        "translated.jp != structured.jp; per D-075 Stage 5 must "
                        "preserve the input jp surface verbatim."
                    ),
                    safety_field=safety_field,
                )
            )
    return issues


# ---------------------------------------------------------------------------
# D2 — untranslated_residue
# ---------------------------------------------------------------------------


def _detect_untranslated_residue(inputs: Phase1Inputs) -> list[Stage6Issue]:
    issues: list[Stage6Issue] = []
    for ent_idx, path, leaf in _iter_trilingual_leaves(inputs.translated_entities):
        zh = leaf.get("zh")
        en = leaf.get("en")
        for field, value in (("zh", zh), ("en", en)):
            if value == UNTRANSLATED or value == "" or value is None:
                issues.append(
                    _make_issue(
                        issue_id=f"D2-page_{inputs.page:03d}-{len(issues)+1:04d}",
                        issue_type="untranslated_residue",
                        severity=Stage6IssueSeverity.FAIL,
                        detector=Stage6IssueDetector.deterministic,
                        entity_path=_path_str(
                            inputs.page, ent_idx, (*path, field)
                        ),
                        evidence={
                            "jp": str(leaf.get("jp", "")),
                            field: "" if value is None else str(value),
                        },
                        rationale=(
                            f"translated.{field} is empty / sentinel "
                            f"({UNTRANSLATED!r}); Stage 7 export refuses to ship."
                        ),
                    )
                )
    return issues


# ---------------------------------------------------------------------------
# D3 — schema_invalid
# ---------------------------------------------------------------------------


def _detect_schema_invalid(inputs: Phase1Inputs) -> list[Stage6Issue]:
    """Validate the translated entities list against the Entity Discriminated
    Union (D-056). Each Pydantic ValidationError becomes a Stage6Issue."""
    issues: list[Stage6Issue] = []
    try:
        _ENTITY_LIST_ADAPTER.validate_python(inputs.translated_entities)
    except ValidationError as exc:
        for err in exc.errors():
            loc = err.get("loc", ())
            entity_idx = loc[0] if loc and isinstance(loc[0], int) else 0
            inner_loc = _pydantic_loc_to_path(loc)
            err_type = err.get("type", "")
            # Pydantic discriminated-union failures emit `union_tag_invalid`
            # / `union_tag_not_found`; both indicate Entity.type mishaps.
            is_type_error = "type" in inner_loc or err_type.startswith("union_tag")
            safety_field = "Entity.type" if is_type_error else None
            issues.append(
                _make_issue(
                    issue_id=f"D3-page_{inputs.page:03d}-{len(issues)+1:04d}",
                    issue_type="schema_invalid",
                    severity=Stage6IssueSeverity.FAIL,
                    detector=Stage6IssueDetector.deterministic,
                    entity_path=_path_str(inputs.page, entity_idx, inner_loc),
                    evidence={
                        "pydantic_msg": err.get("msg", ""),
                        "pydantic_type": err.get("type", ""),
                    },
                    rationale=(
                        f"Pydantic Entity validation failed: {err.get('msg', '')!r} "
                        f"at {loc!r}. Per D-056 Discriminated Union contract."
                    ),
                    safety_field=safety_field,
                )
            )
    return issues


# ---------------------------------------------------------------------------
# D4 — answer_index_out_of_range
# ---------------------------------------------------------------------------


def _detect_answer_index_out_of_range(inputs: Phase1Inputs) -> list[Stage6Issue]:
    issues: list[Stage6Issue] = []
    for ent_idx, entity in enumerate(inputs.translated_entities):
        if not isinstance(entity, dict) or entity.get("type") != "question":
            continue
        ai = entity.get("answer_index")
        choices = entity.get("choices") or []
        if not isinstance(ai, int):
            continue  # type errors handled by D3
        if ai < 0 or ai >= len(choices):
            issues.append(
                _make_issue(
                    issue_id=f"D4-page_{inputs.page:03d}-{len(issues)+1:04d}",
                    issue_type="answer_index_out_of_range",
                    severity=Stage6IssueSeverity.FAIL,
                    detector=Stage6IssueDetector.deterministic,
                    entity_path=_path_str(inputs.page, ent_idx, ("answer_index",)),
                    evidence={
                        "answer_index": str(ai),
                        "choice_count": str(len(choices)),
                    },
                    rationale=(
                        f"answer_index={ai} out of range for {len(choices)} choices; "
                        "Stage 7 export refuses (per D-076 envelope -1 / range check)."
                    ),
                    safety_field="Question.answer_index",
                )
            )
    return issues


# ---------------------------------------------------------------------------
# D5 — answer_index_mismatch (against cleaned/ ground truth)
# ---------------------------------------------------------------------------


# Pattern: "問題1-5 ウ" or "1-5 ウ" with various separators.
_KANA_TO_INDEX = {"ア": 0, "イ": 1, "ウ": 2, "エ": 3, "オ": 4}
_ANSWER_TOKEN_RE = re.compile(
    r"(?:問題\s*)?\d+\s*[\-‐–—ー－]\s*\d+"
    r"\s*[\s　]+([アイウエオ])"
)


def _parse_answer_letters(cleaned_text: str) -> list[str]:
    """Return answer kana letters in document order; empty if no matches."""
    return _ANSWER_TOKEN_RE.findall(cleaned_text)


def _detect_answer_index_mismatch(inputs: Phase1Inputs) -> list[Stage6Issue]:
    if not inputs.cleaned_text:
        return []
    letters = _parse_answer_letters(inputs.cleaned_text)
    if not letters:
        return []  # No parseable answer line — D-076 -1 envelope check covers Stage 4

    expected_indices = [_KANA_TO_INDEX[k] for k in letters if k in _KANA_TO_INDEX]
    questions: list[tuple[int, dict]] = [
        (idx, ent)
        for idx, ent in enumerate(inputs.translated_entities)
        if isinstance(ent, dict) and ent.get("type") == "question"
    ]

    issues: list[Stage6Issue] = []

    if len(expected_indices) != len(questions):
        # Page-level mismatch: report on the first question (or page if none).
        target_path = (
            _path_str(inputs.page, questions[0][0], ("answer_index",))
            if questions
            else f"page_{inputs.page:03d}"
        )
        issues.append(
            _make_issue(
                issue_id=f"D5-page_{inputs.page:03d}-{len(issues)+1:04d}",
                issue_type="answer_index_mismatch",
                severity=Stage6IssueSeverity.FAIL,
                detector=Stage6IssueDetector.deterministic,
                entity_path=target_path,
                evidence={
                    "answer_letters_in_source": "".join(letters),
                    "expected_count": str(len(expected_indices)),
                    "question_count": str(len(questions)),
                },
                rationale=(
                    f"Source answer line has {len(expected_indices)} answers "
                    f"({''.join(letters)}) but page has {len(questions)} question "
                    "entities; cannot align — needs Stage 4 re-extraction."
                ),
                safety_field="Question.answer_index",
            )
        )
        return issues

    for (ent_idx, entity), expected in zip(questions, expected_indices):
        actual = entity.get("answer_index")
        if actual != expected:
            issues.append(
                _make_issue(
                    issue_id=f"D5-page_{inputs.page:03d}-{len(issues)+1:04d}",
                    issue_type="answer_index_mismatch",
                    severity=Stage6IssueSeverity.FAIL,
                    detector=Stage6IssueDetector.deterministic,
                    entity_path=_path_str(inputs.page, ent_idx, ("answer_index",)),
                    evidence={
                        "actual": str(actual),
                        "expected": str(expected),
                        "expected_letter": next(
                            (k for k, v in _KANA_TO_INDEX.items() if v == expected),
                            "?",
                        ),
                    },
                    rationale=(
                        f"answer_index={actual} differs from source ground truth "
                        f"{expected}; per D-076 Stage 4 must parse the answer line."
                    ),
                    safety_field="Question.answer_index",
                )
            )
    return issues


# ---------------------------------------------------------------------------
# D6 — choice_marker_inconsistent
# ---------------------------------------------------------------------------


def _classify_choice_marker(text: str) -> str:
    """Return the marker scheme of a choice's leading character.

    'katakana' / 'uppercase' / 'lowercase' / 'digit' / 'none'.
    """
    if not text:
        return "none"
    head = text[0]
    if head in "アイウエオ":
        return "katakana"
    if "A" <= head <= "F":
        return "uppercase"
    if "a" <= head <= "f":
        return "lowercase"
    if head in "12345":
        return "digit"
    return "none"


def _detect_choice_marker_inconsistent(inputs: Phase1Inputs) -> list[Stage6Issue]:
    issues: list[Stage6Issue] = []
    for ent_idx, entity in enumerate(inputs.translated_entities):
        if not isinstance(entity, dict) or entity.get("type") != "question":
            continue
        choices = entity.get("choices") or []
        for lang in ("zh", "en"):
            markers = [
                _classify_choice_marker((c or {}).get(lang, ""))
                for c in choices
                if isinstance(c, dict)
            ]
            if not markers:
                continue
            distinct = set(markers)
            if len(distinct) > 1:
                issues.append(
                    _make_issue(
                        issue_id=f"D6-page_{inputs.page:03d}-{len(issues)+1:04d}",
                        issue_type="choice_marker_inconsistent",
                        severity=Stage6IssueSeverity.WARN,
                        detector=Stage6IssueDetector.deterministic,
                        entity_path=_path_str(
                            inputs.page, ent_idx, ("choices", lang)
                        ),
                        evidence={
                            "lang": lang,
                            "markers_observed": ",".join(markers),
                        },
                        rationale=(
                            f"Question choices use mixed marker schemes in {lang}: "
                            f"{markers!r}. Stage 7 export normalizes (jp keeps "
                            "ア/イ/ウ/エ; zh+en → A/B/C/D)."
                        ),
                    )
                )
    return issues


# ---------------------------------------------------------------------------
# D7 — numeric_inconsistent
# ---------------------------------------------------------------------------


_FULLWIDTH_DIGIT_TRANS = str.maketrans(
    {
        "０": "0",
        "１": "1",
        "２": "2",
        "３": "3",
        "４": "4",
        "５": "5",
        "６": "6",
        "７": "7",
        "８": "8",
        "９": "9",
        "％": "%",
        "．": ".",
    }
)
_NUMERIC_RE = re.compile(r"\d+(?:\.\d+)?%?")


def _extract_numerics(text: str) -> set[str]:
    return set(_NUMERIC_RE.findall(text.translate(_FULLWIDTH_DIGIT_TRANS)))


def _detect_numeric_inconsistent(inputs: Phase1Inputs) -> list[Stage6Issue]:
    issues: list[Stage6Issue] = []
    for ent_idx, path, leaf in _iter_trilingual_leaves(inputs.translated_entities):
        jp_n = _extract_numerics(leaf.get("jp", ""))
        zh_n = _extract_numerics(leaf.get("zh", ""))
        en_n = _extract_numerics(leaf.get("en", ""))
        if not (jp_n or zh_n or en_n):
            continue
        if jp_n == zh_n == en_n:
            continue
        issues.append(
            _make_issue(
                issue_id=f"D7-page_{inputs.page:03d}-{len(issues)+1:04d}",
                issue_type="numeric_inconsistent",
                severity=Stage6IssueSeverity.FAIL,
                detector=Stage6IssueDetector.deterministic,
                entity_path=_path_str(inputs.page, ent_idx, path),
                evidence={
                    "jp": leaf.get("jp", ""),
                    "zh": leaf.get("zh", ""),
                    "en": leaf.get("en", ""),
                    "jp_numerics": ",".join(sorted(jp_n)),
                    "zh_numerics": ",".join(sorted(zh_n)),
                    "en_numerics": ",".join(sorted(en_n)),
                },
                rationale=(
                    "Numeric token sets differ across jp/zh/en. Year, percent, "
                    "or count fidelity is a learner-facing FAIL."
                ),
            )
        )
    return issues


# ---------------------------------------------------------------------------
# D8 — glossary_lock_violated (Term entities)
# ---------------------------------------------------------------------------


def _detect_glossary_lock_violated(inputs: Phase1Inputs) -> list[Stage6Issue]:
    issues: list[Stage6Issue] = []
    lookup = inputs.glossary.by_jp_surface()
    for ent_idx, entity in enumerate(inputs.translated_entities):
        if not isinstance(entity, dict) or entity.get("type") != "term":
            continue
        surface = entity.get("surface")
        if not isinstance(surface, dict):
            continue
        jp = surface.get("jp")
        if not isinstance(jp, str):
            continue
        entry = lookup.get(jp)
        if entry is None:
            continue
        for lang in ("zh", "en"):
            expected = getattr(entry.surface, lang)
            actual = surface.get(lang)
            if actual != expected:
                issues.append(
                    _make_issue(
                        issue_id=f"D8-page_{inputs.page:03d}-{len(issues)+1:04d}",
                        issue_type="glossary_lock_violated",
                        severity=Stage6IssueSeverity.FAIL,
                        detector=Stage6IssueDetector.deterministic,
                        entity_path=_path_str(
                            inputs.page, ent_idx, ("surface", lang)
                        ),
                        evidence={
                            "jp": jp,
                            f"actual_{lang}": str(actual),
                            f"expected_{lang}": expected,
                            "glossary_id": entry.id,
                        },
                        rationale=(
                            f"Term surface mismatches glossary lock for {jp!r}: "
                            f"got {actual!r}, expected {expected!r}."
                        ),
                    )
                )
    return issues


# ---------------------------------------------------------------------------
# D9 — glossary_lock_missed (substring miss inside non-Term leaves)
# ---------------------------------------------------------------------------


def _detect_glossary_lock_missed(inputs: Phase1Inputs) -> list[Stage6Issue]:
    issues: list[Stage6Issue] = []
    lookup = inputs.glossary.by_jp_surface()
    for ent_idx, path, leaf in _iter_trilingual_leaves(inputs.translated_entities):
        # Skip Term.surface — handled by D8 with stricter contract.
        entity = inputs.translated_entities[ent_idx]
        if (
            isinstance(entity, dict)
            and entity.get("type") == "term"
            and path == ("surface",)
        ):
            continue
        jp_text = leaf.get("jp", "")
        for jp_key, entry in lookup.items():
            if len(jp_key) < 3:
                continue  # avoid spurious 1-char or 2-char substring hits
            if jp_key not in jp_text:
                continue
            zh_locked = entry.surface.zh
            en_locked = entry.surface.en
            zh_text = leaf.get("zh", "")
            en_text = leaf.get("en", "")
            missing_in: list[str] = []
            if zh_locked and zh_locked not in zh_text:
                missing_in.append("zh")
            if en_locked and en_locked not in en_text:
                missing_in.append("en")
            if missing_in:
                issues.append(
                    _make_issue(
                        issue_id=f"D9-page_{inputs.page:03d}-{len(issues)+1:04d}",
                        issue_type="glossary_lock_missed",
                        severity=Stage6IssueSeverity.WARN,
                        detector=Stage6IssueDetector.deterministic,
                        entity_path=_path_str(inputs.page, ent_idx, path),
                        evidence={
                            "jp": jp_text,
                            "zh": zh_text,
                            "en": en_text,
                            "glossary_jp": jp_key,
                            "glossary_id": entry.id,
                            "missing_in": ",".join(missing_in),
                            "expected_zh": zh_locked,
                            "expected_en": en_locked,
                        },
                        rationale=(
                            f"jp contains glossary key {jp_key!r} but locked "
                            f"translation is missing in {missing_in!r}."
                        ),
                    )
                )
    return issues


# ---------------------------------------------------------------------------
# D10 — redundant_nested_parens
# ---------------------------------------------------------------------------


_NESTED_PARENS_RE = re.compile(r"\([^()]*\([^()]*\)[^()]*\)")


def _detect_redundant_nested_parens(inputs: Phase1Inputs) -> list[Stage6Issue]:
    issues: list[Stage6Issue] = []
    for ent_idx, path, leaf in _iter_trilingual_leaves(inputs.translated_entities):
        for lang in ("zh", "en"):
            text = leaf.get(lang, "") or ""
            if _NESTED_PARENS_RE.search(text):
                issues.append(
                    _make_issue(
                        issue_id=f"D10-page_{inputs.page:03d}-{len(issues)+1:04d}",
                        issue_type="redundant_nested_parens",
                        severity=Stage6IssueSeverity.WARN,
                        detector=Stage6IssueDetector.deterministic,
                        entity_path=_path_str(inputs.page, ent_idx, (*path, lang)),
                        evidence={
                            "lang": lang,
                            "text": text,
                        },
                        rationale=(
                            f"{lang} contains nested parens (e.g. F-COP21 pattern). "
                            "Stage 7 export should normalize."
                        ),
                    )
                )
    return issues


# ---------------------------------------------------------------------------
# D11 — kana_helper_missing / kana_helper_unexpected
# ---------------------------------------------------------------------------


def _detect_kana_helper_present(inputs: Phase1Inputs) -> list[Stage6Issue]:
    issues: list[Stage6Issue] = []
    for ent_idx, entity in enumerate(inputs.translated_entities):
        if not isinstance(entity, dict) or entity.get("type") != "term":
            continue
        surface = entity.get("surface") or {}
        jp = surface.get("jp", "")
        kana_helper = entity.get("kana_helper")
        if _is_all_katakana(jp) and kana_helper is None:
            issues.append(
                _make_issue(
                    issue_id=f"D11-page_{inputs.page:03d}-{len(issues)+1:04d}",
                    issue_type="kana_helper_missing",
                    severity=Stage6IssueSeverity.INFO,
                    detector=Stage6IssueDetector.deterministic,
                    entity_path=_path_str(inputs.page, ent_idx, ("kana_helper",)),
                    evidence={"jp": jp, "kana_helper": "null"},
                    rationale=(
                        "All-katakana Term.surface.jp expects a kana_helper "
                        "per D-012; informational only."
                    ),
                )
            )
        elif kana_helper is not None and not _has_any_katakana(jp):
            issues.append(
                _make_issue(
                    issue_id=f"D11-page_{inputs.page:03d}-{len(issues)+1:04d}",
                    issue_type="kana_helper_unexpected",
                    severity=Stage6IssueSeverity.INFO,
                    detector=Stage6IssueDetector.deterministic,
                    entity_path=_path_str(inputs.page, ent_idx, ("kana_helper",)),
                    evidence={
                        "jp": jp,
                        "kana_helper_present": "true",
                    },
                    rationale=(
                        "kana_helper present but Term.surface.jp has no katakana; "
                        "informational only."
                    ),
                )
            )
    return issues


# ---------------------------------------------------------------------------
# D12 — kana_helper_format
# ---------------------------------------------------------------------------


_ROMAJI_RE = re.compile(r"^[a-z]+(?:[\s'][a-z]+)*$")


def _detect_kana_helper_format(inputs: Phase1Inputs) -> list[Stage6Issue]:
    issues: list[Stage6Issue] = []
    for ent_idx, entity in enumerate(inputs.translated_entities):
        if not isinstance(entity, dict) or entity.get("type") != "term":
            continue
        kh = entity.get("kana_helper")
        if not isinstance(kh, dict):
            continue
        reading = kh.get("reading")
        if not isinstance(reading, str) or not _ROMAJI_RE.match(reading):
            issues.append(
                _make_issue(
                    issue_id=f"D12-page_{inputs.page:03d}-{len(issues)+1:04d}",
                    issue_type="kana_helper_format",
                    severity=Stage6IssueSeverity.INFO,
                    detector=Stage6IssueDetector.deterministic,
                    entity_path=_path_str(
                        inputs.page, ent_idx, ("kana_helper", "reading")
                    ),
                    evidence={
                        "reading": str(reading),
                    },
                    rationale=(
                        "kana_helper.reading does not match lowercase Hepburn "
                        "shape (a-z + spaces + apostrophes)."
                    ),
                )
            )
    return issues


# ---------------------------------------------------------------------------
# D13 — glossary_surface_concept_split (RUN-LEVEL detector)
# ---------------------------------------------------------------------------


def detect_glossary_consistency(glossary: Glossary) -> list[Stage6Issue]:
    """Run-level detector for glossary self-consistency. Emits one issue
    per glossary entry whose ``surface.zh`` and ``kana_helper.zh_concept``
    are populated but unrelated (neither contains the other)."""
    issues: list[Stage6Issue] = []
    for entry in glossary.entries:
        if entry.kana_helper is None:
            continue
        surface_zh = entry.surface.zh
        concept_zh = entry.kana_helper.zh_concept
        if not surface_zh or not concept_zh:
            continue
        if surface_zh in concept_zh or concept_zh in surface_zh:
            continue
        issues.append(
            _make_issue(
                issue_id=f"D13-{entry.id}",
                issue_type="glossary_surface_concept_split",
                severity=Stage6IssueSeverity.INFO,
                detector=Stage6IssueDetector.deterministic,
                entity_path=f"glossary.entries[{entry.id}]",
                evidence={
                    "surface_zh": surface_zh,
                    "kana_helper_zh_concept": concept_zh,
                    "surface_jp": entry.surface.jp,
                },
                rationale=(
                    f"glossary {entry.id} has surface.zh={surface_zh!r} and "
                    f"kana_helper.zh_concept={concept_zh!r} that don't share "
                    "a substring; informational only (per worksheet A.4.4)."
                ),
            )
        )
    return issues


# ---------------------------------------------------------------------------
# Coordinator
# ---------------------------------------------------------------------------


_PAGE_LEVEL_DETECTORS = (
    _detect_jp_mutation,
    _detect_untranslated_residue,
    _detect_schema_invalid,
    _detect_answer_index_out_of_range,
    _detect_answer_index_mismatch,
    _detect_choice_marker_inconsistent,
    _detect_numeric_inconsistent,
    _detect_glossary_lock_violated,
    _detect_glossary_lock_missed,
    _detect_redundant_nested_parens,
    _detect_kana_helper_present,
    _detect_kana_helper_format,
)


def run_phase1(inputs: Phase1Inputs) -> list[Stage6Issue]:
    """Run all 12 page-level deterministic detectors on a page; flatten."""
    out: list[Stage6Issue] = []
    for det in _PAGE_LEVEL_DETECTORS:
        out.extend(det(inputs))
    return out
