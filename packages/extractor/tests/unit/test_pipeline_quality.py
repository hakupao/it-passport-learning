"""Unit tests for the Stage-1 OCR quality heuristic.

Includes anchor cases drawn from the actual Step-5 dry-run output: pages
1, 10, 30 (known clean) must NOT be flagged; pages 2 and 16 (known
degenerate per step_02_audit F2) MUST be flagged.
"""
from __future__ import annotations

import pytest

from cert_extractor.pipeline.quality import (
    DEFAULT_JAPANESE_SCRIPT_MIN_RATIO,
    DEFAULT_REPETITION_MIN_COUNT,
    DEFAULT_REPETITION_WINDOW,
    assess,
    japanese_script_ratio,
    repetition_max_count,
)

pytestmark = pytest.mark.unit


def test_repetition_finds_known_loop() -> None:
    text = "你是个小伙子，" * 60
    assert repetition_max_count(text, window=8) >= 50


def test_repetition_clean_text_low() -> None:
    text = (
        "経営理念とは、会社の運営方針を決定するための「最も基本的、かつ大切な指針」です。"
        "経営者は経営理念に従って企業を運営し、会社に関するあらゆることは、経営理念に沿って決められます。"
    )
    assert repetition_max_count(text, window=8) < DEFAULT_REPETITION_MIN_COUNT


def test_repetition_strips_leader_dots() -> None:
    """TOC leader-dot artefacts repeat hundreds of times in Markdown but
    must NOT flag a page — they're stripped before the window slides.

    Each TOC line uses a unique section title; content_only() drops the
    leader dots so the resulting kanji windows are all distinct.
    """
    toc_lines = [
        "01-01 株式会社と経営理念 …………………………………………… 12",
        "01-02 企業の責任 ……………………………………………………… 16",
        "01-03 経営資源 ……………………………………………………… 19",
        "01-04 経営組織 ……………………………………………………… 21",
        "01-05 業務分析と業務計画 …………………………………………… 30",
        "01-06 経営者の意思決定と問題解決手法 ……………………………… 33",
        "01-07 損益分岐点 …………………………………………………… 35",
        "01-08 財務諸表と6つの利益 ……………………………………… 40",
    ]
    toc = "\n".join(toc_lines)
    assert repetition_max_count(toc, window=8) < DEFAULT_REPETITION_MIN_COUNT


def test_repetition_image_caption_loop_flagged() -> None:
    """page_047 anchor: '（単グラフ）' x 11 between two image refs."""
    text = (
        "パレート図とABC分析の例\n"
        "![img-0.jpeg](img-0.jpeg)\n"
        + "（単グラフ）\n" * 11
        + "![img-1.jpeg](img-1.jpeg)\nパレート図\nABC分析\n"
    )
    assert repetition_max_count(text, window=8) >= DEFAULT_REPETITION_MIN_COUNT


def test_japanese_script_ratio_pure_japanese() -> None:
    text = "経営理念とは会社の運営方針を決定するための指針です"
    assert japanese_script_ratio(text) > 0.3


def test_japanese_script_ratio_chinese_only() -> None:
    text = "你是个小伙子" * 20
    # All chars are CJK ideographs (kanji range), no kana → ratio 0.
    assert japanese_script_ratio(text) == pytest.approx(0.0)


def test_japanese_script_ratio_no_cjk_returns_one() -> None:
    """ASCII-only text gets the neutral score 1.0."""
    assert japanese_script_ratio("Information Technology Passport") == pytest.approx(1.0)


def test_assess_short_text_skipped() -> None:
    """Cover/blank pages are short by design — heuristic must not flag them."""
    qv = assess("# IT パスポート")
    assert not qv.degenerate
    assert "too short" in qv.reason


def test_assess_clean_japanese_paragraph_not_flagged() -> None:
    text = (
        "経営理念とは、会社の運営方針を決定するための「最も基本的、かつ大切な指針」です。"
        "経営者は経営理念に従って企業を運営し、会社に関するあらゆることは、経営理念に沿って決められます。"
        "ストラテジやマネジメントなどの分野についても学習を進めていきますが、それらの知識はすべて経営理念につながっています。"
        "ビジョンを定めるときも、経営戦略を立てるときも、システム開発を計画するときも、常に経営理念に合致しているかを考えることが必要です。"
    )
    qv = assess(text)
    assert not qv.degenerate, qv


def test_assess_chinese_repetition_flagged_via_script_ratio() -> None:
    """page_002 anchor: pure Chinese repetition trips both repetition + ratio."""
    text = "“哈，你是个小伙子，" + ("你是个小伙子，" * 60)
    qv = assess(text)
    assert qv.degenerate
    # Either repetition or japanese_script_ratio path is acceptable; both fire here.
    assert qv.repetition_max >= DEFAULT_REPETITION_MIN_COUNT or qv.japanese_script_ratio < DEFAULT_JAPANESE_SCRIPT_MIN_RATIO


def test_assess_repetition_loop_within_japanese_flagged() -> None:
    """page_016 anchor: clean prefix + repeating Japanese loop still flags via repetition."""
    prefix = (
        "本書の巻末には『寝る前10分＆試験直前に効果的！重要用語を総復習！』と題して、"
        "ITパスポート試験において特に重要な解説を一挙に掲載しています。"
    )
    loop = "10分前は、空気の空間を10分間、空気の量は10分間で、" * 10
    qv = assess(prefix + loop)
    assert qv.degenerate
    assert qv.repetition_max >= DEFAULT_REPETITION_MIN_COUNT


def test_assess_toc_pattern_not_flagged() -> None:
    """Table-of-contents-like text has structural repetition but should pass.

    No 8-char substring repeats 4+ times because each line carries a distinct
    section number / title.
    """
    toc = (
        "## 第1章 企業活動 11\n"
        "- 01-01 株式会社と経営理念 12\n"
        "- 01-02 企業の責任 16\n"
        "- 01-03 経営資源 19\n"
        "- 01-04 経営組織 21\n"
        "- 01-05 業務分析と業務計画 30\n"
        "- 01-06 経営者の意思決定と問題解決手法 33\n"
        "- 01-07 損益分岐点 35\n"
        "- 01-08 財務諸表と6つの利益 40\n"
        "## 第2章 法務 53\n"
        "- 02-01 3つの知的財産権 54\n"
        "- 02-02 産業財産権とその他の権利 57\n"
        "- 02-03 セキュリティ関連法規 61\n"
    )
    qv = assess(toc)
    assert not qv.degenerate, qv


def test_assess_uses_default_thresholds() -> None:
    """The defaults must be the documented constants — guards against drift."""
    assert DEFAULT_REPETITION_WINDOW == 8
    assert DEFAULT_REPETITION_MIN_COUNT == 8
    assert 0 < DEFAULT_JAPANESE_SCRIPT_MIN_RATIO < 1


def test_assess_benign_section_recurrence_not_flagged() -> None:
    """Anchor: a content body that legitimately repeats a kanji term (e.g.
    "ブレーンストーミング" cited 6× on page_050) must NOT flag.

    Real degeneracies cluster at 10+ repetitions; threshold 8 leaves
    headroom for the 6-7 benign band observed in the dry-run.
    """
    body = (
        "ブレーンストーミング法は、複数人が自由にアイデアを出し合うことで創造性を引き出します。"
        "ブレーンストーミングの基本ルールは批判禁止・自由奔放・質より量・結合発展の4つです。"
        "ブレーンストーミング後は、出たアイデアをKJ法でグルーピングします。"
        "ブレーンストーミングを電子的に支援するツールも普及しています。"
        "効果的なブレーンストーミングのためには、参加者の心理的安全性が重要です。"
        "なお、ブレーンストーミングと類似した手法に、デルファイ法があります。"
    )
    qv = assess(body)
    assert not qv.degenerate, qv
