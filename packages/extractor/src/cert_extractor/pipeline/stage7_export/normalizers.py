"""Stage 7 export normalizers (per D-078 §2.5 + §2.6 Gate B).

Two operations:

- ``normalize_choice_markers`` — rewrites jp/zh/en choice markers on
  ``question`` entities so that exported artifacts use canonical
  conventions: jp ``ア．イ．ウ．エ．`` (full-width period), zh + en
  ``A. B. C. D.`` (half-width period). Strips whatever marker was
  emitted by Stage 5 (which Plan-B + Stage 6 D6 surfaced can be a
  mix of A/B/ウ/エ etc.) and re-applies the position-based canonical.

- ``scan_untranslated`` — scans every trilingual leaf for the
  ``UNTRANSLATED`` sentinel. Gate B uses the count to refuse export
  when any residue remains (per D-076 envelope).

Both helpers operate on the same shape Stage 5/6 use: a per-page
``list[dict]`` of entities.  ``normalize_choice_markers`` is the only
mutator; ``scan_untranslated`` is read-only.
"""
from __future__ import annotations

import re
from collections.abc import Iterable
from typing import Literal

UNTRANSLATED_SENTINEL = "UNTRANSLATED"

# Up to 10 choices supported. Real ITパスポート questions use 4 (ア-エ),
# but the pool is deliberately wider to keep the normalizer future-proof.
_CHOICE_MARKERS_JP: tuple[str, ...] = (
    "ア", "イ", "ウ", "エ", "オ", "カ", "キ", "ク", "ケ", "コ",
)
_CHOICE_MARKERS_LATIN: tuple[str, ...] = (
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
)

# Matches a leading single-char marker (any of: Latin uppercase, jp
# kana ア-オ, full-width Latin Ａ-Ｅ, kanji 甲乙丙丁戊) followed by
# optional period (half or full-width) and optional whitespace.
# The marker may also appear standalone without any separator.
_LEADING_MARKER_RE = re.compile(
    r"^\s*"                                # tolerate leading whitespace
    r"[A-EＡ-Ｅアイウエオカキクケコ甲乙丙丁戊]"  # the marker character
    r"[.．、：:]?"                          # optional separator
    r"\s*"                                  # optional space after separator
)


def _strip_marker(text: str) -> str:
    """Strip a leading single-char choice marker plus separator, if any."""
    return _LEADING_MARKER_RE.sub("", text, count=1)


def _canonical_marker(position: int, lang: Literal["jp", "zh", "en"]) -> str:
    """Return the canonical marker prefix (incl. separator) for a position.

    Per D-078 §2.5 + D-077 §2.7 (D6 rs=7 carry-forward):
    - jp uses full-width period ``．`` and kana markers ``ア / イ / ウ / エ / オ``.
    - zh + en use half-width period ``.`` and Latin markers ``A / B / C / D / E``.

    Trailing whitespace is included so the call site only has to
    concatenate marker + remaining text.
    """
    if not 0 <= position < len(_CHOICE_MARKERS_JP):
        raise ValueError(
            f"position {position} out of supported range "
            f"(0..{len(_CHOICE_MARKERS_JP) - 1})"
        )
    if lang == "jp":
        return f"{_CHOICE_MARKERS_JP[position]}．"
    return f"{_CHOICE_MARKERS_LATIN[position]}. "


def normalize_one_choice(text: str, position: int, lang: Literal["jp", "zh", "en"]) -> str:
    """Strip any existing marker and apply the canonical one.

    Idempotent: applying twice yields the same string.
    """
    body = _strip_marker(text)
    marker = _canonical_marker(position, lang)
    # jp uses full-width period without trailing space; if body starts with
    # a space (e.g. existing emitted "ア． 内容"), strip it once.
    if lang == "jp":
        body = body.lstrip()
        return f"{marker}{body}"
    # zh/en marker already carries a trailing space; ensure body doesn't
    # start with its own.
    body = body.lstrip()
    return f"{marker}{body}"


def normalize_question_choices(entity: dict) -> bool:
    """Mutate ``entity['choices']`` in place to canonical markers.

    Returns True if any choice text was actually altered.

    No-op (returns False) if ``entity.type != 'question'`` or if the
    entity lacks a well-formed ``choices`` list.
    """
    if not isinstance(entity, dict):
        return False
    if entity.get("type") != "question":
        return False
    choices = entity.get("choices")
    if not isinstance(choices, list) or not choices:
        return False

    altered = False
    for position, choice in enumerate(choices):
        if not isinstance(choice, dict):
            continue
        for lang in ("jp", "zh", "en"):
            original = choice.get(lang)
            if not isinstance(original, str):
                continue
            normalized = normalize_one_choice(original, position, lang)
            if normalized != original:
                choice[lang] = normalized
                altered = True
    return altered


def normalize_all_questions(entities: list[dict]) -> int:
    """Apply ``normalize_question_choices`` across an entity list.

    Returns the count of entities whose choices were altered (used by
    Stage 7 evidence file ``step_07_export.md`` for the pre-run vs
    post-run delta).
    """
    return sum(1 for ent in entities if normalize_question_choices(ent))


# ---------------------------------------------------------------------------
# UNTRANSLATED scan
# ---------------------------------------------------------------------------


def _iter_string_leaves(obj: object, path: tuple = ()) -> Iterable[tuple[tuple, str]]:
    """Yield ``(path, text)`` for every string value in a nested structure."""
    if isinstance(obj, str):
        yield (path, obj)
    elif isinstance(obj, dict):
        for k, v in obj.items():
            yield from _iter_string_leaves(v, (*path, k))
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            yield from _iter_string_leaves(v, (*path, i))


def iter_trilingual_dicts(
    obj: object, path: tuple = ()
) -> Iterable[tuple[tuple, dict]]:
    """Yield ``(path, leaf_dict)`` for every trilingual leaf in ``obj``.

    A trilingual leaf is a dict with exactly the keys ``jp``, ``zh``,
    ``en``.  Stops descending once a leaf is matched, so kana_helper
    sub-objects (different shape) and other nested non-trilingual
    dicts are skipped automatically.
    """
    if isinstance(obj, dict):
        keys = set(obj.keys())
        if keys == {"jp", "zh", "en"}:
            yield (path, obj)
            return
        for k, v in obj.items():
            yield from iter_trilingual_dicts(v, (*path, k))
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            yield from iter_trilingual_dicts(v, (*path, i))


def scan_untranslated(
    entities: list[dict], *, page: int | None = None
) -> list[tuple[int, tuple, str]]:
    """Return ``(entity_index, path_inside_entity, text)`` for every leaf
    string containing the ``UNTRANSLATED`` sentinel.

    ``page`` is unused in the returned tuple but accepted so callers
    can keep their per-page loops uniform.
    """
    _ = page  # accepted for caller convenience; intentionally unused
    violations: list[tuple[int, tuple, str]] = []
    for ent_idx, entity in enumerate(entities):
        if not isinstance(entity, dict):
            continue
        for inner_path, text in _iter_string_leaves(entity):
            if UNTRANSLATED_SENTINEL in text:
                violations.append((ent_idx, inner_path, text))
    return violations
