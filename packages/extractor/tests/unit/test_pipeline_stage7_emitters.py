"""Unit tests for Stage 7 emitters (per D-078 §2.2 + §2.3 + §2.4 + §2.5)."""
from __future__ import annotations

import json
from datetime import datetime, timezone

import pytest

from cert_extractor.pipeline.stage7_export.emitters import (
    LANG_MARKERS,
    emit_index_json,
    emit_page_json,
    emit_page_md,
    emit_polish_items,
    emit_readme_md,
)
from cert_extractor.pipeline.stage7_export.schema import (
    ExportEnvelope,
    IndexEntry,
    IndexStage6Summary,
    IndexSummary,
    IndexTotals,
    PolishItem,
    PolishItemBundle,
    PolishItemSeverity,
    PolishItemTotals,
)


# ---------------------------------------------------------------------------
# fixtures
# ---------------------------------------------------------------------------


def _now() -> datetime:
    return datetime(2026, 5, 11, 18, 30, tzinfo=timezone.utc)


def _term_entity(jp_surface: str = "経営戦略") -> dict:
    return {
        "id": f"term_{jp_surface}",
        "type": "term",
        "anchor": {"page": 14, "block_id": "p014_b0", "section_path": []},
        "surface": {"jp": jp_surface, "zh": "经营战略", "en": "Management Strategy"},
        "definition": {
            "jp": "企業の長期的な方向性を定める計画。",
            "zh": "确定企业长期方向的计划。",
            "en": "A plan that defines the long-term direction of an enterprise.",
        },
        "kana_helper": None,
    }


def _question_entity() -> dict:
    return {
        "id": "q_001",
        "type": "question",
        "anchor": {"page": 14, "block_id": "p014_b1", "section_path": []},
        "stem": {"jp": "経営戦略はどれか。", "zh": "管理战略是哪一项？", "en": "Which is the strategy?"},
        "choices": [
            {"jp": "ア．案A", "zh": "A. 选项A", "en": "A. Choice A"},
            {"jp": "イ．案B", "zh": "B. 选项B", "en": "B. Choice B"},
        ],
        "answer_index": 1,
    }


def _envelope(entities: list[dict] | None = None) -> ExportEnvelope:
    return ExportEnvelope(
        cert_id="itpassport_r6",
        run_id="dry_run_2026-05-06T16-58-10",
        page=14,
        exported_at=_now(),
        stage6_verdict="WARN",
        leaf_count=4,
        entities=entities if entities is not None else [_term_entity()],
    )


# ---------------------------------------------------------------------------
# emit_page_json
# ---------------------------------------------------------------------------


class TestEmitPageJSON:
    def test_emit_is_valid_json(self):
        out = emit_page_json(_envelope())
        parsed = json.loads(out)
        assert parsed["schema_version"] == "v1"
        assert parsed["cert_id"] == "itpassport_r6"
        assert parsed["page"] == 14
        assert parsed["stage"] == 7
        assert parsed["stage6_verdict"] == "WARN"
        assert parsed["leaf_count"] == 4
        assert isinstance(parsed["entities"], list)

    def test_emit_pretty_printed(self):
        out = emit_page_json(_envelope())
        assert "\n  " in out  # indent=2 yields multi-line with 2-space indent

    def test_round_trip(self):
        env = _envelope()
        out = emit_page_json(env)
        roundtrip = ExportEnvelope.model_validate_json(out)
        assert roundtrip == env


# ---------------------------------------------------------------------------
# emit_index_json
# ---------------------------------------------------------------------------


def _index(num_pages: int = 1) -> IndexSummary:
    pages = [
        IndexEntry(
            page=i + 1,
            json_path=f"pages/page_{i+1:03d}.json",
            md_path=f"pages/page_{i+1:03d}.md",
            entity_count=1,
            leaf_count=2,
            verdict="PASS",
            polish_items_count=0,
        )
        for i in range(num_pages)
    ]
    return IndexSummary(
        cert_id="itpassport_r6",
        run_id="dry_run_2026-05-06T16-58-10",
        exported_at=_now(),
        totals=IndexTotals(pages=num_pages, entities=num_pages, leaves=2 * num_pages),
        stage6_summary=IndexStage6Summary(
            verdict="WARN" if num_pages > 1 else "PASS",
            pass_pages=num_pages,
            warn_pages=0,
            fail_pages=0,
            polish_items_count=0,
        ),
        pages=pages,
    )


class TestEmitIndexJSON:
    def test_emit_is_valid_json(self):
        out = emit_index_json(_index())
        parsed = json.loads(out)
        assert parsed["schema_version"] == "v1"
        assert parsed["totals"]["pages"] == 1

    def test_uses_alias_for_json_md_paths(self):
        # IndexEntry has json_path / md_path internally but emits as json / md
        out = emit_index_json(_index())
        parsed = json.loads(out)
        entry = parsed["pages"][0]
        assert "json" in entry
        assert "md" in entry
        assert "json_path" not in entry
        assert "md_path" not in entry
        assert entry["json"].endswith(".json")
        assert entry["md"].endswith(".md")


# ---------------------------------------------------------------------------
# emit_polish_items
# ---------------------------------------------------------------------------


def _polish_bundle() -> PolishItemBundle:
    return PolishItemBundle(
        cert_id="itpassport_r6",
        run_id="dry_run_2026-05-06T16-58-10",
        exported_at=_now(),
        totals=PolishItemTotals(warn=1, info=1, run_level_info=1),
        by_page={
            "014": [
                PolishItem(
                    issue_id="D7-page_014-0001",
                    issue_type="numeric_inconsistent",
                    severity=PolishItemSeverity.WARN,
                    repair_stage="5",
                    entity_path="page_014.entities[1].rows[1][1]",
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
                rationale="split",
            )
        ],
    )


class TestEmitPolishItems:
    def test_emit_is_valid_json(self):
        out = emit_polish_items(_polish_bundle())
        parsed = json.loads(out)
        assert parsed["source"] == "stage6_review.json"
        assert parsed["totals"]["warn"] == 1
        assert "014" in parsed["by_page"]
        assert len(parsed["run_level"]) == 1


# ---------------------------------------------------------------------------
# emit_page_md
# ---------------------------------------------------------------------------


class TestEmitPageMD:
    def test_includes_three_language_sections(self):
        md = emit_page_md(_envelope())
        assert LANG_MARKERS["jp"] in md
        assert LANG_MARKERS["zh"] in md
        assert LANG_MARKERS["en"] in md
        assert "[JP]" in md  # ASCII not emoji
        assert "[ZH]" in md
        assert "[EN]" in md

    def test_includes_metadata_line(self):
        md = emit_page_md(_envelope())
        assert "itpassport_r6" in md
        assert "WARN" in md  # verdict from envelope
        assert "4 leaves" in md
        assert "1 entities" in md

    def test_renders_term_in_each_language(self):
        md = emit_page_md(_envelope())
        # Surface jp/zh/en should all appear, plus part of the def.
        assert "経営戦略" in md
        assert "经营战略" in md
        assert "Management Strategy" in md

    def test_renders_question_with_choices_and_answer(self):
        env = ExportEnvelope(
            cert_id="itpassport_r6",
            run_id="run_X",
            page=15,
            exported_at=_now(),
            stage6_verdict="PASS",
            leaf_count=3,
            entities=[_question_entity()],
        )
        md = emit_page_md(env)
        assert "Question q_001" in md
        assert "ア．案A" in md
        assert "イ．案B" in md
        # Answer line points at index 1 = choice B
        assert "**Answer**" in md
        assert "B. Choice B" in md

    def test_renders_table_pipe_format(self):
        table = {
            "id": "tb_1",
            "type": "table",
            "anchor": {"page": 14, "block_id": "p014_b2", "section_path": []},
            "caption": {"jp": "分野表", "zh": "领域表", "en": "Domain table"},
            "rows": [
                [
                    {"jp": "分野", "zh": "领域", "en": "Domain"},
                    {"jp": "説明", "zh": "说明", "en": "Description"},
                ],
                [
                    {"jp": "ストラテジ", "zh": "战略", "en": "Strategy"},
                    {"jp": "経営", "zh": "经营", "en": "Mgmt"},
                ],
            ],
        }
        env = ExportEnvelope(
            cert_id="itpassport_r6",
            run_id="run_X",
            page=22,
            exported_at=_now(),
            stage6_verdict="PASS",
            leaf_count=4,
            entities=[table],
        )
        md = emit_page_md(env)
        assert "| 分野 | 説明 |" in md
        assert "| Domain | Description |" in md
        assert "| --- | --- |" in md  # separator row

    def test_pipe_in_cell_escaped(self):
        # A choice text containing a '|' must be escaped so the pipe-table
        # format doesn't break.
        table = {
            "id": "tb_x",
            "type": "table",
            "anchor": {"page": 1, "block_id": "p001_b0", "section_path": []},
            "caption": {"jp": "x", "zh": "x", "en": "x"},
            "rows": [[{"jp": "a|b", "zh": "x", "en": "x"}]],
        }
        env = ExportEnvelope(
            cert_id="x",
            run_id="x",
            page=1,
            exported_at=_now(),
            stage6_verdict="PASS",
            leaf_count=1,
            entities=[table],
        )
        md = emit_page_md(env)
        assert "a\\|b" in md  # escaped pipe

    def test_renders_figure_with_image_ref(self):
        fig = {
            "id": "fig_1",
            "type": "figure",
            "anchor": {"page": 14, "block_id": "p014_b3", "section_path": []},
            "caption": {"jp": "イメージ図", "zh": "示意图", "en": "Conceptual Diagram"},
            "image_ref": "raw/pages/page_014.jpg",
        }
        env = ExportEnvelope(
            cert_id="x",
            run_id="x",
            page=14,
            exported_at=_now(),
            stage6_verdict="PASS",
            leaf_count=1,
            entities=[fig],
        )
        md = emit_page_md(env)
        assert "![イメージ図](raw/pages/page_014.jpg)" in md

    def test_first_line_is_h1_with_page_number(self):
        md = emit_page_md(_envelope())
        first_line = md.split("\n", 1)[0]
        assert first_line.startswith("# Page 014")

    def test_explicit_page_title_overrides_default(self):
        md = emit_page_md(
            _envelope(),
            page_title={"jp": "JP_TITLE", "zh": "ZH_TITLE", "en": "EN_TITLE"},
        )
        first_line = md.split("\n", 1)[0]
        assert "JP_TITLE" in first_line
        assert "ZH_TITLE" in first_line
        assert "EN_TITLE" in first_line


# ---------------------------------------------------------------------------
# emit_readme_md
# ---------------------------------------------------------------------------


class TestEmitReadmeMD:
    def test_includes_totals(self):
        md = emit_readme_md(_index(num_pages=40))
        assert "40 page(s)" in md
        assert "40 entities" in md

    def test_includes_stage6_verdict_block(self):
        md = emit_readme_md(_index())
        assert "Stage 6 verdict" in md

    def test_includes_layout_block(self):
        md = emit_readme_md(_index())
        assert "polish_items.json" in md
        assert "page_NNN.json" in md
        assert "page_NNN.md" in md
