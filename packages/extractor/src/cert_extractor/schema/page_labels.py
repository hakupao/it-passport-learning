"""Stage 2 page-classification schema.

Each OCR-produced page gets a single ``PageLabel`` plus a confidence score.
Stage 3 (hard re-OCR) and Stage 4 (structure) read this label to skip
non-content pages (e.g. ``cover``/``blank``) and to route content pages
through the right Structure prompt.
"""
from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class PageLabel(str, Enum):
    """Closed set of page labels produced by Stage 2.

    The set is intentionally narrow — each label maps to a distinct downstream
    routing decision in Stage 3-7. New labels require an ADR.
    """

    COVER = "cover"
    TOC = "toc"
    CHAPTER_TITLE = "chapter_title"
    CONTENT = "content"
    EXAM = "exam"
    GLOSSARY = "glossary"
    INDEX = "index"
    BLANK = "blank"
    OTHER = "other"


class LabeledPage(BaseModel):
    """Stage 2 output for a single page."""

    model_config = ConfigDict(extra="forbid", strict=True)

    page_number: int = Field(..., ge=1)
    label: PageLabel
    confidence: float = Field(..., ge=0.0, le=1.0)
    reasoning: str = Field(default="", description="Free-form rationale (debug only)")
