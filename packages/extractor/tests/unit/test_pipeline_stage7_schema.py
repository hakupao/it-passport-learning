"""Unit tests for Stage 7 export schema (per D-078 §2.3 + §2.4 + §2.5 + §2.6)."""
from __future__ import annotations

from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from cert_extractor.pipeline.stage7_export.schema import (
    EXPORT_SCHEMA_VERSION,
    ExportEnvelope,
    IndexEntry,
    IndexStage6Summary,
    IndexSummary,
    IndexTotals,
    PolishItem,
    PolishItemBundle,
    PolishItemSeverity,
    PolishItemTotals,
    ReleaseGateResult,
)


# ---------------------------------------------------------------------------
# fixtures / helpers
# ---------------------------------------------------------------------------


def _now() -> datetime:
    return datetime(2026, 5, 11, 18, 30, tzinfo=timezone.utc)


def _mini_envelope_kwargs() -> dict:
    return dict(
        cert_id="itpassport_r6",
        run_id="dry_run_2026-05-06T16-58-10",
        page=14,
        exported_at=_now(),
        stage6_verdict="PASS",
        leaf_count=14,
        entities=[{"id": "e1", "type": "term"}],
    )


# ---------------------------------------------------------------------------
# ExportEnvelope
# ---------------------------------------------------------------------------


class TestExportEnvelope:
    def test_minimal_valid(self):
        env = ExportEnvelope(**_mini_envelope_kwargs())
        assert env.schema_version == EXPORT_SCHEMA_VERSION == "v1"
        assert env.stage == 7
        assert env.page == 14
        assert env.cert_id == "itpassport_r6"
        assert env.stage6_verdict == "PASS"
        assert env.polish_items_ref is None
        assert env.leaf_count == 14
        assert len(env.entities) == 1

    def test_warn_verdict_accepted(self):
        kwargs = _mini_envelope_kwargs() | {"stage6_verdict": "WARN"}
        env = ExportEnvelope(**kwargs)
        assert env.stage6_verdict == "WARN"

    def test_fail_verdict_rejected(self):
        # D-078: Gate A guarantees 0 FAIL pre-export. FAIL cannot appear
        # in an exported envelope.
        kwargs = _mini_envelope_kwargs() | {"stage6_verdict": "FAIL"}
        with pytest.raises(ValidationError):
            ExportEnvelope(**kwargs)

    def test_page_zero_rejected(self):
        kwargs = _mini_envelope_kwargs() | {"page": 0}
        with pytest.raises(ValidationError):
            ExportEnvelope(**kwargs)

    def test_negative_leaf_count_rejected(self):
        kwargs = _mini_envelope_kwargs() | {"leaf_count": -1}
        with pytest.raises(ValidationError):
            ExportEnvelope(**kwargs)

    def test_wrong_stage_rejected(self):
        kwargs = _mini_envelope_kwargs() | {"stage": 6}
        with pytest.raises(ValidationError):
            ExportEnvelope(**kwargs)

    def test_extra_field_rejected(self):
        kwargs = _mini_envelope_kwargs() | {"unexpected_field": "x"}
        with pytest.raises(ValidationError):
            ExportEnvelope(**kwargs)

    def test_polish_items_ref_accepts_string(self):
        kwargs = _mini_envelope_kwargs() | {
            "polish_items_ref": "polish_items.json#pages/014"
        }
        env = ExportEnvelope(**kwargs)
        assert env.polish_items_ref == "polish_items.json#pages/014"

    def test_round_trip_json(self):
        env = ExportEnvelope(**_mini_envelope_kwargs())
        roundtrip = ExportEnvelope.model_validate_json(env.model_dump_json())
        assert roundtrip == env


# ---------------------------------------------------------------------------
# IndexEntry / IndexSummary
# ---------------------------------------------------------------------------


class TestIndexEntry:
    def test_minimal_valid(self):
        e = IndexEntry(
            page=6,
            json_path="pages/page_006.json",
            md_path="pages/page_006.md",
            entity_count=3,
            leaf_count=5,
            verdict="PASS",
            polish_items_count=0,
        )
        assert e.page == 6
        assert e.verdict == "PASS"

    def test_fail_verdict_allowed_in_index(self):
        # IndexEntry preserves the original stage6_verdict (which may
        # include FAIL historically for snapshot purposes); only the
        # exported ExportEnvelope refuses FAIL since FAIL pages aren't
        # exported.  Still, for current Step 6.10 flow this should not
        # occur — but the type itself stays permissive.
        e = IndexEntry(
            page=6,
            json_path="pages/page_006.json",
            md_path="pages/page_006.md",
            entity_count=3,
            leaf_count=5,
            verdict="FAIL",
            polish_items_count=2,
        )
        assert e.verdict == "FAIL"

    def test_invalid_verdict_rejected(self):
        with pytest.raises(ValidationError):
            IndexEntry(
                page=6,
                json_path="x.json",
                md_path="x.md",
                entity_count=1,
                leaf_count=1,
                verdict="UNKNOWN",
                polish_items_count=0,
            )


class TestIndexSummary:
    def test_minimal_valid(self):
        s = IndexSummary(
            cert_id="itpassport_r6",
            run_id="dry_run_2026-05-06T16-58-10",
            exported_at=_now(),
            totals=IndexTotals(pages=40, entities=161, leaves=382),
            stage6_summary=IndexStage6Summary(
                verdict="WARN",
                pass_pages=22,
                warn_pages=18,
                fail_pages=0,
                polish_items_count=46,
            ),
            pages=[],
        )
        assert s.schema_version == "v1"
        assert s.totals.pages == 40
        assert s.stage6_summary.fail_pages == 0

    def test_round_trip_json(self):
        s = IndexSummary(
            cert_id="itpassport_r6",
            run_id="run_X",
            exported_at=_now(),
            totals=IndexTotals(pages=1, entities=1, leaves=1),
            stage6_summary=IndexStage6Summary(
                verdict="PASS",
                pass_pages=1,
                warn_pages=0,
                fail_pages=0,
                polish_items_count=0,
            ),
            pages=[
                IndexEntry(
                    page=1,
                    json="pages/page_001.json",
                    md="pages/page_001.md",
                    entity_count=1,
                    leaf_count=1,
                    verdict="PASS",
                    polish_items_count=0,
                )
            ],
        )
        roundtrip = IndexSummary.model_validate_json(s.model_dump_json())
        assert roundtrip == s


# ---------------------------------------------------------------------------
# PolishItem / PolishItemBundle
# ---------------------------------------------------------------------------


class TestPolishItem:
    def test_warn_accepted(self):
        i = PolishItem(
            issue_id="D9-page_030-0001",
            issue_type="glossary_lock_missed",
            severity=PolishItemSeverity.WARN,
            repair_stage="5",
            entity_path="page_030.entities[2].definition",
            rationale="jp contains glossary key '経営者' but locked en lock missing.",
        )
        assert i.severity == PolishItemSeverity.WARN
        assert i.dimension is None
        assert i.detector is None

    def test_info_accepted(self):
        i = PolishItem(
            issue_id="D11-page_045-0001",
            issue_type="kana_helper_missing",
            severity=PolishItemSeverity.INFO,
            repair_stage="4.5",
            entity_path="page_045.entities[3].kana_helper",
            rationale="All-katakana surface expects kana_helper.",
        )
        assert i.severity == PolishItemSeverity.INFO

    def test_fail_severity_rejected(self):
        # PolishItemSeverity does not include FAIL; pydantic rejects.
        with pytest.raises(ValidationError):
            PolishItem(
                issue_id="x",
                issue_type="y",
                severity="FAIL",  # type: ignore[arg-type]
                repair_stage="5",
                rationale="should never happen",
            )

    def test_invalid_repair_stage_rejected(self):
        with pytest.raises(ValidationError):
            PolishItem(
                issue_id="x",
                issue_type="y",
                severity=PolishItemSeverity.WARN,
                repair_stage="99",  # type: ignore[arg-type]
                rationale="x",
            )

    def test_round_trip_json(self):
        i = PolishItem(
            issue_id="x",
            issue_type="numeric_inconsistent",
            severity=PolishItemSeverity.WARN,
            repair_stage="5",
            entity_path="page_014.entities[1].rows[1][1]",
            rationale="paraphrase",
            dimension="fidelity",
            detector="deterministic",
        )
        roundtrip = PolishItem.model_validate_json(i.model_dump_json())
        assert roundtrip == i


class TestPolishItemBundle:
    def test_minimal_valid(self):
        b = PolishItemBundle(
            cert_id="itpassport_r6",
            run_id="dry_run_2026-05-06T16-58-10",
            exported_at=_now(),
            totals=PolishItemTotals(warn=30, info=14, run_level_info=2),
            by_page={
                "014": [
                    PolishItem(
                        issue_id="D7-page_014-0001",
                        issue_type="numeric_inconsistent",
                        severity=PolishItemSeverity.WARN,
                        repair_stage="5",
                        rationale="paraphrase",
                    )
                ]
            },
            run_level=[
                PolishItem(
                    issue_id="D13-run-0001",
                    issue_type="glossary_surface_concept_split",
                    severity=PolishItemSeverity.INFO,
                    repair_stage="4.5",
                    rationale="surface/concept split",
                )
            ],
        )
        assert b.source == "stage6_review.json"
        assert b.totals.warn == 30
        assert "014" in b.by_page

    def test_source_field_pinned(self):
        with pytest.raises(ValidationError):
            PolishItemBundle(
                cert_id="x",
                run_id="x",
                source="other.json",  # type: ignore[arg-type]
                exported_at=_now(),
                totals=PolishItemTotals(warn=0, info=0, run_level_info=0),
                by_page={},
                run_level=[],
            )


# ---------------------------------------------------------------------------
# ReleaseGateResult
# ---------------------------------------------------------------------------


class TestReleaseGateResult:
    def test_both_gates_pass(self):
        r = ReleaseGateResult(gate_a_passed=True, gate_b_passed=True)
        assert r.passed is True
        assert r.all_failures == []

    def test_gate_a_fails(self):
        r = ReleaseGateResult(
            gate_a_passed=False,
            gate_b_passed=True,
            gate_a_failures=["D7 FAIL on page_019.entities[2].rows[6][1]"],
        )
        assert r.passed is False
        assert len(r.all_failures) == 1

    def test_gate_b_fails(self):
        r = ReleaseGateResult(
            gate_a_passed=True,
            gate_b_passed=False,
            gate_b_failures=[
                "page_022.entities[0].answer_index == -1 (D-076 envelope violation)",
            ],
        )
        assert r.passed is False
        assert len(r.all_failures) == 1

    def test_both_gates_fail_concat_failures(self):
        r = ReleaseGateResult(
            gate_a_passed=False,
            gate_b_passed=False,
            gate_a_failures=["a1", "a2"],
            gate_b_failures=["b1"],
        )
        assert r.passed is False
        assert r.all_failures == ["a1", "a2", "b1"]
