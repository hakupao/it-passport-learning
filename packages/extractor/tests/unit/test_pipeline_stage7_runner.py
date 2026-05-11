"""Unit tests for Stage 7 export runner (per D-078 §2.7 + §2.8)."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import pytest

from cert_extractor.pipeline.stage7_export.runner import Stage7Export, Stage7Result


def _now() -> datetime:
    return datetime(2026, 5, 11, 18, 30, tzinfo=timezone.utc)


# ---------------------------------------------------------------------------
# fixtures — build a minimal 2-page run on a tmp_path
# ---------------------------------------------------------------------------


def _trilingual_term(jp: str, zh: str, en: str, page: int, block_id: str) -> dict:
    return {
        "id": f"term_{jp}",
        "type": "term",
        "anchor": {"page": page, "block_id": block_id, "section_path": []},
        "surface": {"jp": jp, "zh": zh, "en": en},
        "definition": {
            "jp": "定義",
            "zh": "定义",
            "en": "definition",
        },
        "kana_helper": None,
    }


def _question(page: int, block_id: str) -> dict:
    return {
        "id": "q_001",
        "type": "question",
        "anchor": {"page": page, "block_id": block_id, "section_path": []},
        "stem": {"jp": "問", "zh": "题", "en": "Q?"},
        "choices": [
            {"jp": "ア．案A", "zh": "ウ．选项A", "en": "A. Choice A"},  # zh non-canonical
            {"jp": "イ．案B", "zh": "B. 选项B", "en": "B. Choice B"},
        ],
        "answer_index": 0,
    }


def _build_run(tmp_path: Path) -> dict[str, Path]:
    """Lay out a minimal pipeline-stage run under tmp_path/data/.../run/<stages>."""
    run_dir = tmp_path / "data" / "itpassport_r6" / "runs" / "test_run"
    translated = run_dir / "translated"
    structured = run_dir / "structured"
    glossary_dir = run_dir / "glossary"
    audit_dir = run_dir / "audit"
    output = run_dir / "output"
    for d in (translated, structured, glossary_dir, audit_dir):
        d.mkdir(parents=True, exist_ok=True)

    # Page 14 — term only
    page_14 = [_trilingual_term("経営", "经营", "Mgmt", 14, "p014_b0")]
    # Page 22 — question with non-canonical zh marker, will be normalized
    page_22 = [_question(22, "p022_b0")]

    (translated / "page_014.json").write_text(json.dumps(page_14), encoding="utf-8")
    (translated / "page_022.json").write_text(json.dumps(page_22), encoding="utf-8")
    (structured / "page_014.json").write_text(json.dumps(page_14), encoding="utf-8")
    (structured / "page_022.json").write_text(json.dumps(page_22), encoding="utf-8")

    # Glossary (empty entries list)
    glossary_path = glossary_dir / "glossary.json"
    glossary_path.write_text(
        json.dumps({"cert_id": "itpassport_r6", "run_id": "test_run", "entries": []}),
        encoding="utf-8",
    )

    # Stage 6 audit (clean baseline shape)
    audit_path = audit_dir / "stage6_review.json"
    audit_path.write_text(
        json.dumps(
            {
                "cert_id": "itpassport_r6",
                "run_id": "test_run",
                "stage": 6,
                "total_pages": 2,
                "pass_pages": 1,
                "warn_pages": 1,
                "fail_pages": 0,
                "overall_verdict": "WARN",
                "safety_failed": False,
                "most_severe_repair_stage": 7,
                "started_at": "2026-05-11T18:00:00+00:00",
                "finished_at": "2026-05-11T18:05:00+00:00",
                "cost_usd_shadow_total": 1.23,
                "pages": [
                    {
                        "cert_id": "itpassport_r6",
                        "run_id": "test_run",
                        "stage": 6,
                        "page": 14,
                        "overall_verdict": "PASS",
                        "translation_fidelity_verdict": "PASS",
                        "learner_data_verdict": "PASS",
                        "issues": [],
                    },
                    {
                        "cert_id": "itpassport_r6",
                        "run_id": "test_run",
                        "stage": 6,
                        "page": 22,
                        "overall_verdict": "WARN",
                        "translation_fidelity_verdict": "PASS",
                        "learner_data_verdict": "WARN",
                        "issues": [
                            {
                                "id": "D6-page_022-0001",
                                "issue_type": "choice_marker_inconsistent",
                                "severity": "WARN",
                                "dimension": "learner_data",
                                "repair_stage": "7",
                                "detector": "deterministic",
                                "entity_path": "page_022.entities[0].choices.zh",
                                "evidence": {"x": "y"},  # dropped by sidecar
                                "rationale": "mixed markers",
                            }
                        ],
                    },
                ],
                "run_level_issues": [
                    {
                        "id": "D13-run-0001",
                        "issue_type": "glossary_surface_concept_split",
                        "severity": "INFO",
                        "dimension": "learner_data",
                        "repair_stage": "4.5",
                        "detector": "deterministic",
                        "rationale": "split",
                    }
                ],
            }
        ),
        encoding="utf-8",
    )

    return {
        "translated": translated,
        "structured": structured,
        "glossary": glossary_path,
        "audit": audit_path,
        "output": output,
    }


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


class TestStage7ExportRunner:
    def test_clean_run_writes_full_bundle(self, tmp_path):
        paths = _build_run(tmp_path)
        runner = Stage7Export()
        result = runner.run(
            translated_dir=paths["translated"],
            structured_dir=paths["structured"],
            glossary_path=paths["glossary"],
            audit_path=paths["audit"],
            output_dir=paths["output"],
            cert_id="itpassport_r6",
            run_id="test_run",
            now=_now(),
        )

        assert result.gate_result.passed is True
        assert result.passed is True
        assert result.pages_written == 2
        assert result.choices_normalized == 1  # only page_022 had a non-canonical zh marker

        # File tree assertions.
        out = paths["output"]
        assert (out / "index.json").exists()
        assert (out / "glossary.json").exists()
        assert (out / "polish_items.json").exists()
        assert (out / "README.md").exists()
        assert (out / "pages" / "page_014.json").exists()
        assert (out / "pages" / "page_014.md").exists()
        assert (out / "pages" / "page_022.json").exists()
        assert (out / "pages" / "page_022.md").exists()

    def test_index_json_has_alias_keys(self, tmp_path):
        paths = _build_run(tmp_path)
        Stage7Export().run(
            translated_dir=paths["translated"],
            structured_dir=paths["structured"],
            glossary_path=paths["glossary"],
            audit_path=paths["audit"],
            output_dir=paths["output"],
            cert_id="itpassport_r6",
            run_id="test_run",
            now=_now(),
        )
        index_data = json.loads((paths["output"] / "index.json").read_text(encoding="utf-8"))
        assert index_data["totals"]["pages"] == 2
        # External-facing keys are "json" / "md", not internal "json_path" / "md_path".
        first_page = index_data["pages"][0]
        assert "json" in first_page
        assert "md" in first_page
        assert "json_path" not in first_page

    def test_polish_items_excludes_fail_and_keeps_warn_info(self, tmp_path):
        paths = _build_run(tmp_path)
        Stage7Export().run(
            translated_dir=paths["translated"],
            structured_dir=paths["structured"],
            glossary_path=paths["glossary"],
            audit_path=paths["audit"],
            output_dir=paths["output"],
            cert_id="itpassport_r6",
            run_id="test_run",
            now=_now(),
        )
        polish = json.loads((paths["output"] / "polish_items.json").read_text(encoding="utf-8"))
        assert polish["source"] == "stage6_review.json"
        assert polish["totals"]["warn"] == 1
        assert polish["totals"]["run_level_info"] == 1
        assert "022" in polish["by_page"]
        # evidence blob dropped per D-078 §2.4
        item = polish["by_page"]["022"][0]
        assert "evidence" not in item

    def test_normalize_question_zh_marker_applied_in_emitted_envelope(self, tmp_path):
        paths = _build_run(tmp_path)
        Stage7Export().run(
            translated_dir=paths["translated"],
            structured_dir=paths["structured"],
            glossary_path=paths["glossary"],
            audit_path=paths["audit"],
            output_dir=paths["output"],
            cert_id="itpassport_r6",
            run_id="test_run",
            now=_now(),
        )
        page_22 = json.loads((paths["output"] / "pages" / "page_022.json").read_text(encoding="utf-8"))
        choices = page_22["entities"][0]["choices"]
        # zh choice[0] was "ウ．选项A" — must now be "A. 选项A".
        assert choices[0]["zh"] == "A. 选项A"
        assert choices[1]["zh"] == "B. 选项B"
        # jp choices preserve full-width period.
        assert choices[0]["jp"] == "ア．案A"
        assert choices[1]["jp"] == "イ．案B"

    def test_gate_a_failure_refuses_to_write(self, tmp_path):
        # Introduce a D1 jp_mutation by changing translated jp vs structured jp.
        paths = _build_run(tmp_path)
        page_14_translated = json.loads(
            (paths["translated"] / "page_014.json").read_text(encoding="utf-8")
        )
        page_14_translated[0]["surface"]["jp"] = "BUG"  # diverges from structured
        (paths["translated"] / "page_014.json").write_text(
            json.dumps(page_14_translated), encoding="utf-8"
        )

        result = Stage7Export().run(
            translated_dir=paths["translated"],
            structured_dir=paths["structured"],
            glossary_path=paths["glossary"],
            audit_path=paths["audit"],
            output_dir=paths["output"],
            cert_id="itpassport_r6",
            run_id="test_run",
            now=_now(),
        )
        assert result.gate_result.passed is False
        assert result.pages_written == 0
        assert result.passed is False
        # No files should have been written.
        assert not (paths["output"] / "index.json").exists()

    def test_gate_b_failure_refuses_to_write(self, tmp_path):
        # Introduce an UNTRANSLATED residue — Gate B B2 catches this.
        paths = _build_run(tmp_path)
        page_14 = json.loads(
            (paths["translated"] / "page_014.json").read_text(encoding="utf-8")
        )
        page_14[0]["definition"]["en"] = "UNTRANSLATED: pending"
        (paths["translated"] / "page_014.json").write_text(
            json.dumps(page_14), encoding="utf-8"
        )
        # Mirror to structured so Gate A D1 jp_mutation doesn't also fire.
        (paths["structured"] / "page_014.json").write_text(
            json.dumps(page_14), encoding="utf-8"
        )

        result = Stage7Export().run(
            translated_dir=paths["translated"],
            structured_dir=paths["structured"],
            glossary_path=paths["glossary"],
            audit_path=paths["audit"],
            output_dir=paths["output"],
            cert_id="itpassport_r6",
            run_id="test_run",
            now=_now(),
        )
        assert result.gate_result.gate_b_passed is False
        assert result.pages_written == 0
        assert not (paths["output"] / "pages" / "page_014.json").exists()

    def test_formats_json_only_omits_markdown(self, tmp_path):
        paths = _build_run(tmp_path)
        Stage7Export().run(
            translated_dir=paths["translated"],
            structured_dir=paths["structured"],
            glossary_path=paths["glossary"],
            audit_path=paths["audit"],
            output_dir=paths["output"],
            cert_id="itpassport_r6",
            run_id="test_run",
            formats=("json",),
            now=_now(),
        )
        out = paths["output"]
        assert (out / "pages" / "page_014.json").exists()
        assert not (out / "pages" / "page_014.md").exists()
        # index/polish/readme/glossary always written regardless of --formats.
        assert (out / "index.json").exists()
        assert (out / "polish_items.json").exists()
        assert (out / "README.md").exists()
        assert (out / "glossary.json").exists()

    def test_half_width_jp_marker_does_not_trigger_d1_jp_mutation(self, tmp_path):
        # Regression: real data on pages 042/044 has jp choices with
        # half-width period `ア. 内容`. Stage 7 normalize rewrites that
        # to full-width `ア．内容`. If Gate A ran *after* normalize, the
        # post-normalize jp would diverge from structured.jp and D1
        # jp_mutation would spuriously FAIL.  This test pins Gate A to
        # the pre-normalize data so the export proceeds cleanly.
        paths = _build_run(tmp_path)
        # Inject half-width markers into both translated AND structured
        # (mirrors real OCR output before Stage 5 / Stage 6).
        half_width_q = {
            "id": "q_half",
            "type": "question",
            "anchor": {"page": 22, "block_id": "p022_b1", "section_path": []},
            "stem": {"jp": "問題", "zh": "题", "en": "Question"},
            "choices": [
                {"jp": "ア. 案A", "zh": "A. 选项A", "en": "A. Choice A"},
                {"jp": "イ. 案B", "zh": "B. 选项B", "en": "B. Choice B"},
            ],
            "answer_index": 0,
        }
        page_22 = [half_width_q]
        (paths["translated"] / "page_022.json").write_text(
            json.dumps(page_22), encoding="utf-8"
        )
        (paths["structured"] / "page_022.json").write_text(
            json.dumps(page_22), encoding="utf-8"
        )

        result = Stage7Export().run(
            translated_dir=paths["translated"],
            structured_dir=paths["structured"],
            glossary_path=paths["glossary"],
            audit_path=paths["audit"],
            output_dir=paths["output"],
            cert_id="itpassport_r6",
            run_id="test_run",
            now=_now(),
        )
        assert result.gate_result.gate_a_passed is True
        assert result.gate_result.gate_b_passed is True
        assert result.pages_written == 2
        # Emitted envelope has full-width jp markers (normalized post-Gate-A).
        emitted = json.loads(
            (paths["output"] / "pages" / "page_022.json").read_text(encoding="utf-8")
        )
        assert emitted["entities"][0]["choices"][0]["jp"] == "ア．案A"
        assert emitted["entities"][0]["choices"][1]["jp"] == "イ．案B"

    def test_polish_items_ref_set_only_for_pages_with_polish(self, tmp_path):
        paths = _build_run(tmp_path)
        Stage7Export().run(
            translated_dir=paths["translated"],
            structured_dir=paths["structured"],
            glossary_path=paths["glossary"],
            audit_path=paths["audit"],
            output_dir=paths["output"],
            cert_id="itpassport_r6",
            run_id="test_run",
            now=_now(),
        )
        page_14 = json.loads((paths["output"] / "pages" / "page_014.json").read_text(encoding="utf-8"))
        page_22 = json.loads((paths["output"] / "pages" / "page_022.json").read_text(encoding="utf-8"))
        # page_14 has 0 issues → no polish_items_ref.
        assert page_14["polish_items_ref"] is None
        # page_22 has D6 WARN → ref points at sidecar.
        assert page_22["polish_items_ref"] == "polish_items.json#pages/022"
