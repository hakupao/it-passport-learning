"""Unit tests for the Stage 2 page-label schema."""
from __future__ import annotations

import pytest

from cert_extractor.schema.page_labels import LabeledPage, PageLabel

pytestmark = pytest.mark.unit


def test_labeled_page_round_trips() -> None:
    lp = LabeledPage(page_number=10, label=PageLabel.TOC, confidence=0.92, reasoning="目次")
    payload = lp.model_dump()
    assert payload["label"] == "toc"
    assert payload["confidence"] == 0.92
    again = LabeledPage.model_validate(payload)
    assert again == lp


def test_labeled_page_rejects_extra_fields() -> None:
    with pytest.raises(Exception):
        LabeledPage.model_validate(
            {"page_number": 1, "label": "cover", "confidence": 1.0, "extra": "no"}
        )


@pytest.mark.parametrize("conf", [-0.1, 1.1])
def test_confidence_bounds_enforced(conf: float) -> None:
    with pytest.raises(Exception):
        LabeledPage(page_number=1, label=PageLabel.CONTENT, confidence=conf)


def test_label_set_is_closed() -> None:
    expected = {
        "cover",
        "toc",
        "chapter_title",
        "content",
        "exam",
        "glossary",
        "index",
        "blank",
        "other",
    }
    assert {lbl.value for lbl in PageLabel} == expected
