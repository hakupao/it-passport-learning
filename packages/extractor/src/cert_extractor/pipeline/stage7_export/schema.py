"""Stage 7 export schema (per D-078 §2.3 + §2.4 + §2.5 + §2.6).

Six Pydantic models cover the entire output contract:

- ``ExportEnvelope`` — wraps each ``pages/page_NNN.json``. Carries
  schema_version, cert_id, run_id, stage, page id, exported_at,
  Stage 6 verdict, leaf_count, entities (existing trilingual shape),
  optional polish_items_ref.

- ``IndexEntry`` — one row in ``index.json``'s ``pages`` list. Used by
  consumers to enumerate the per-page artifacts.

- ``IndexSummary`` — full shape of ``index.json``. Carries totals +
  Stage 6 summary + per-page IndexEntry list.

- ``PolishItem`` — sidecar polish-item shape. **FAIL severity is
  excluded** (Stage 6 closure + Gate A guarantee 0 FAIL pre-export).

- ``PolishItemBundle`` — full shape of ``polish_items.json``. Indexed
  by 3-digit zero-padded page string + run-level pool.

- ``ReleaseGateResult`` — aggregate Gate A + Gate B outcome. Stage 7
  refuses to write when ``passed`` is False.

The split between schema (this module) and the source-of-truth
``cert_extractor.pipeline.stage6_audit.schema.Stage6Issue`` is
intentional: Stage 7 emits a slimmer subset (drops verbose ``evidence``
blob and ``proposed_fix`` / ``detector_confidence`` fields) and pins
FAIL out of the allowed severities for the sidecar.
"""
from __future__ import annotations

import enum
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

EXPORT_SCHEMA_VERSION: Literal["v1"] = "v1"


class PolishItemSeverity(str, enum.Enum):
    """Allowed severities in the polish_items.json sidecar.

    FAIL is intentionally excluded — D-077 + D-078 guarantee that
    Stage 6 closure + Gate A keep the exported artifact at 0 FAIL.
    Any FAIL surfaced by Gate A aborts the export before a sidecar
    is even written.
    """

    WARN = "WARN"
    INFO = "INFO"


# ---------------------------------------------------------------------------
# Per-page JSON envelope
# ---------------------------------------------------------------------------


class ExportEnvelope(BaseModel):
    """Per-page JSON envelope wrapping the trilingual entity tree.

    Per D-078 §2.3: release artifact must be self-describing.
    ``translated/page_NNN.json`` is a bare ``list[entity]`` adequate
    for internal pipeline staging; this envelope adds schema_version,
    audit traceability, and a sidecar back-reference.
    """

    model_config = ConfigDict(extra="forbid")

    schema_version: Literal["v1"] = EXPORT_SCHEMA_VERSION
    cert_id: str
    run_id: str
    stage: Literal[7] = 7
    page: int = Field(ge=1)
    exported_at: datetime
    stage6_verdict: Literal["PASS", "WARN"]
    leaf_count: int = Field(ge=0)
    entities: list[dict]
    polish_items_ref: str | None = None


# ---------------------------------------------------------------------------
# Top-level index
# ---------------------------------------------------------------------------


class IndexEntry(BaseModel):
    """One per-page row in ``index.json``'s ``pages`` list.

    External JSON keys are ``json`` and ``md`` (matching consumer
    expectations); internal attribute names use the ``_path`` suffix
    to avoid shadowing ``BaseModel.json``.
    """

    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    page: int = Field(ge=1)
    json_path: str = Field(alias="json")  # e.g. "pages/page_006.json"
    md_path: str = Field(alias="md")      # e.g. "pages/page_006.md"
    entity_count: int = Field(ge=0)
    leaf_count: int = Field(ge=0)
    verdict: Literal["PASS", "WARN", "FAIL"]
    polish_items_count: int = Field(ge=0)


class IndexTotals(BaseModel):
    model_config = ConfigDict(extra="forbid")

    pages: int = Field(ge=0)
    entities: int = Field(ge=0)
    leaves: int = Field(ge=0)


class IndexStage6Summary(BaseModel):
    model_config = ConfigDict(extra="forbid")

    verdict: Literal["PASS", "WARN", "FAIL"]
    pass_pages: int = Field(ge=0)
    warn_pages: int = Field(ge=0)
    fail_pages: int = Field(ge=0)
    polish_items_count: int = Field(ge=0)


class IndexSummary(BaseModel):
    """Full shape of ``index.json`` (top-level export index)."""

    model_config = ConfigDict(extra="forbid")

    schema_version: Literal["v1"] = EXPORT_SCHEMA_VERSION
    cert_id: str
    run_id: str
    exported_at: datetime
    totals: IndexTotals
    stage6_summary: IndexStage6Summary
    pages: list[IndexEntry]


# ---------------------------------------------------------------------------
# Polish items sidecar
# ---------------------------------------------------------------------------


class PolishItem(BaseModel):
    """Single polish-item entry in ``polish_items.json``.

    A slimmer projection of ``Stage6Issue`` (drops ``evidence``,
    ``proposed_fix``, ``detector_confidence``, ``safety_field``) +
    pins severity to WARN | INFO.
    """

    model_config = ConfigDict(extra="forbid")

    issue_id: str
    issue_type: str
    severity: PolishItemSeverity
    repair_stage: Literal["4", "4.5", "5", "7"]
    entity_path: str | None = None
    rationale: str
    dimension: Literal["fidelity", "learner_data"] | None = None
    detector: Literal["deterministic", "llm"] | None = None


class PolishItemTotals(BaseModel):
    model_config = ConfigDict(extra="forbid")

    warn: int = Field(ge=0)
    info: int = Field(ge=0)
    run_level_info: int = Field(ge=0)


class PolishItemBundle(BaseModel):
    """Full shape of ``polish_items.json`` (sidecar; Q3 = C per D-078)."""

    model_config = ConfigDict(extra="forbid")

    schema_version: Literal["v1"] = EXPORT_SCHEMA_VERSION
    cert_id: str
    run_id: str
    source: Literal["stage6_review.json"] = "stage6_review.json"
    exported_at: datetime
    totals: PolishItemTotals
    by_page: dict[str, list[PolishItem]]
    run_level: list[PolishItem]


# ---------------------------------------------------------------------------
# Release gate aggregate
# ---------------------------------------------------------------------------


class ReleaseGateResult(BaseModel):
    """Aggregate of Gate A (full D1-D13 re-run) + Gate B (contract).

    Stage 7 ``runner.Stage7Export`` consults ``passed`` before writing
    any artifact. Failures carry human-readable strings pointing to
    page + entity_path so the user can locate the regression.
    """

    model_config = ConfigDict(extra="forbid")

    gate_a_passed: bool
    gate_b_passed: bool
    gate_a_failures: list[str] = Field(default_factory=list)
    gate_b_failures: list[str] = Field(default_factory=list)

    @property
    def passed(self) -> bool:
        return self.gate_a_passed and self.gate_b_passed

    @property
    def all_failures(self) -> list[str]:
        return [*self.gate_a_failures, *self.gate_b_failures]
