"""Stage-1 OCR quality heuristic — gates Stage 3 hard re-OCR.

Stage 2 audit (evidence/.../step_02_audit.md F2) plus dry-run validation on
the 50 stage-1 pages showed three real OCR-failure modes:

- page_002: Chinese-character loop ("你是个小伙子，"×60).
- page_016: Japanese prose dissolves into a "空気の空間を10分間" loop and
  then into bullet "- 1" repetitions.
- page_047: image-caption echo, "（単グラフ）"×11 between two figures.

Two false-positive sources had to be suppressed:

- TOC pages: leader-dot artefacts ("…………………") repeat 200-500 times.
- Markdown structural patterns: `\n- `, `\n## `, etc.

The heuristic therefore strips everything except Japanese/CJK text +
CJK punctuation before counting repetition, so only repetition of
*content* tokens flags a page.
"""
from __future__ import annotations

import re
from collections import Counter
from dataclasses import dataclass

# Hiragana / Katakana / Kanji ranges (CJK Unified Ideographs).
_HIRAGANA = re.compile(r"[぀-ゟ]")
_KATAKANA = re.compile(r"[゠-ヿ]")
_KANJI = re.compile(r"[一-鿿]")

# What counts as "content text" for the repetition heuristic:
# - Hiragana / Katakana / Kanji
# - CJK Symbols and Punctuation (U+3000–U+303F): 、。「」『』（）etc.
# - Halfwidth / Fullwidth Forms (U+FF00–U+FFEF): ，！？…etc. (fullwidth ASCII).
# Everything else (ASCII, Markdown punctuation, leader-dot ellipses U+2026, line
# breaks, image refs) is stripped before the repetition window slides.
_CONTENT_RE = re.compile(
    r"[぀-ゟ゠-ヿ一-鿿　-〿＀-￯]+"
)

DEFAULT_REPETITION_WINDOW: int = 8
# Tuned against the 50-page step-5 dry-run: real degeneracies (002 / 016 /
# 047) cluster at rep_max ∈ {10, 27, 59}; benign repetition from TOC
# section-name reuse ("出る順過去問完全解説" appears once per chapter) and
# legitimate content recurrence (e.g. "ブレーンストーミング" cited 6× in a
# brainstorming page) caps at 7. Threshold 8 gives a clean separation.
DEFAULT_REPETITION_MIN_COUNT: int = 8
DEFAULT_JAPANESE_SCRIPT_MIN_RATIO: float = 0.10
MIN_TEXT_LENGTH_FOR_CHECK: int = 80  # below this we skip the heuristic


@dataclass(frozen=True)
class QualityVerdict:
    """Outcome of the heuristic — degenerate=True means trigger Stage 3."""

    degenerate: bool
    reason: str
    repetition_max: int = 0
    japanese_script_ratio: float = 1.0
    char_count: int = 0


def japanese_script_ratio(text: str) -> float:
    """Return (hiragana + katakana) / (hiragana + katakana + kanji).

    For Japanese textbook prose this stays well above 0.2; pages whose CJK
    glyphs are predominantly kanji (or, in OCR-failure cases, Chinese
    simplified characters that fall in the kanji range) drop sharply.
    """
    h = len(_HIRAGANA.findall(text))
    k = len(_KATAKANA.findall(text))
    j = len(_KANJI.findall(text))
    total = h + k + j
    if total == 0:
        return 1.0  # no CJK at all — neutral signal, don't penalize
    return (h + k) / total


def content_only(text: str) -> str:
    """Strip everything except CJK/Japanese characters before windowing.

    This drops Markdown structure (``\n``, ``- ``, ``## ``), leader-dot
    artefacts (``…``), and image references — they cause runaway repetition
    counts on entirely well-formed pages (e.g. TOCs hit 500+ on
    ``………………`` alone). Only repetition of *content* tokens should flag a
    page as degenerate.
    """
    return "".join(_CONTENT_RE.findall(text))


def repetition_max_count(
    text: str,
    window: int = DEFAULT_REPETITION_WINDOW,
) -> int:
    """Return the max occurrence count of any ``window``-sized substring of
    *content text* (Markdown noise stripped first via :func:`content_only`).
    """
    cleaned = content_only(text)
    if len(cleaned) < window:
        return 0
    grams = (cleaned[i : i + window] for i in range(len(cleaned) - window + 1))
    counts = Counter(grams)
    if not counts:
        return 0
    return max(counts.values())


def assess(
    text: str,
    repetition_window: int = DEFAULT_REPETITION_WINDOW,
    repetition_min_count: int = DEFAULT_REPETITION_MIN_COUNT,
    japanese_script_min_ratio: float = DEFAULT_JAPANESE_SCRIPT_MIN_RATIO,
) -> QualityVerdict:
    """Run the OCR-degeneracy heuristic on a page's OCR markdown.

    A page is flagged ``degenerate`` if EITHER:

    1. The repetition score is at least ``repetition_min_count`` (an 8-char
       substring appears 4+ times) — i.e. mechanical OCR loop.
    2. Below the ``japanese_script_min_ratio`` threshold given there is
       enough text to judge — i.e. Japanese page mis-recognized as
       Chinese-only.

    Pages with very short text skip the check (too noisy at small N) and are
    treated as non-degenerate — Stage 2 ``cover``/``blank``/``chapter_title``
    legitimately have low character counts.
    """
    char_count = len(text)
    rep_max = repetition_max_count(text, window=repetition_window)
    jp_ratio = japanese_script_ratio(text)

    if char_count < MIN_TEXT_LENGTH_FOR_CHECK:
        return QualityVerdict(
            degenerate=False,
            reason=f"text too short (chars={char_count}); skipping heuristic",
            repetition_max=rep_max,
            japanese_script_ratio=jp_ratio,
            char_count=char_count,
        )

    if rep_max >= repetition_min_count:
        return QualityVerdict(
            degenerate=True,
            reason=f"repetition_max={rep_max} >= {repetition_min_count} (window={repetition_window})",
            repetition_max=rep_max,
            japanese_script_ratio=jp_ratio,
            char_count=char_count,
        )

    if jp_ratio < japanese_script_min_ratio:
        return QualityVerdict(
            degenerate=True,
            reason=f"japanese_script_ratio={jp_ratio:.3f} < {japanese_script_min_ratio}",
            repetition_max=rep_max,
            japanese_script_ratio=jp_ratio,
            char_count=char_count,
        )

    return QualityVerdict(
        degenerate=False,
        reason="ok",
        repetition_max=rep_max,
        japanese_script_ratio=jp_ratio,
        char_count=char_count,
    )
