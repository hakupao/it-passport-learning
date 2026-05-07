"""Stage 4.5 glossary schema (per D-008 stage 4.5 + D-012 kana_helper).

The glossary is a run-wide trilingual lock-table for technical terms. Stage
5 translation reads it before producing per-page Trilingual fields so that
the same Japanese term always renders to the same Chinese / English
translation across the run. Entry order is preserved (stable IDs ``g_001``,
``g_002``, ...).
"""
from __future__ import annotations

from datetime import datetime
from zoneinfo import ZoneInfo

from pydantic import BaseModel, ConfigDict, Field

from cert_extractor import SCHEMA_VERSION
from cert_extractor.schema.common import KanaHelper, Trilingual


def _now_tokyo_iso() -> str:
    return datetime.now(tz=ZoneInfo("Asia/Tokyo")).isoformat()


class GlossaryEntry(BaseModel):
    """One locked glossary entry: a canonical surface + trilingual translation."""

    model_config = ConfigDict(extra="forbid", strict=True)

    id: str = Field(..., min_length=1, description="Stable ID, e.g. 'g_001'")
    surface: Trilingual = Field(
        ..., description="Canonical surface form in 3 languages (jp = source)"
    )
    kana_helper: KanaHelper | None = Field(
        default=None,
        description="Per D-012: only set for katakana-dominant terms hard for non-native readers",
    )
    first_page: int = Field(
        ..., ge=1, description="The page where the term first appears (Stage 4 anchor)"
    )
    occurrences: list[int] = Field(
        default_factory=list,
        description="All pages where this surface (or close variant) appeared in Stage 4",
    )
    aliases_jp: list[str] = Field(
        default_factory=list,
        description=(
            "Other surface variants that map to this canonical entry "
            "(e.g. half-width / full-width differences, adjacent kanji compounds)"
        ),
    )


class Glossary(BaseModel):
    """Top-level glossary file shape (one per run)."""

    model_config = ConfigDict(extra="forbid", strict=True)

    schema_version: str = Field(default=SCHEMA_VERSION, frozen=True)
    cert_id: str = Field(..., min_length=1)
    run_id: str = Field(..., min_length=1)
    generated_at: str = Field(default_factory=_now_tokyo_iso)
    entries: list[GlossaryEntry] = Field(default_factory=list)

    def by_jp_surface(self) -> dict[str, GlossaryEntry]:
        """Return a lookup dict mapping the canonical jp surface (and any
        ``aliases_jp``) to its entry. Used by Stage 5 to enforce locked
        translations for matched surfaces."""
        out: dict[str, GlossaryEntry] = {}
        for entry in self.entries:
            out[entry.surface.jp] = entry
            for alias in entry.aliases_jp:
                out[alias] = entry
        return out
