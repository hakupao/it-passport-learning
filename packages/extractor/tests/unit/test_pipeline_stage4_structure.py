"""Unit tests for Stage 4 structure extraction (no real Claude calls)."""
from __future__ import annotations

import json
from pathlib import Path

import pytest

from cert_extractor import UNTRANSLATED
from cert_extractor.audit.verdict import Verdict
from cert_extractor.budget.monitor import BudgetMonitor, CapLevels
from cert_extractor.llm.claude_client import ClaudeResponse
from cert_extractor.pipeline.stage4_structure import (
    SKIP_LABELS,
    Stage4Structure,
    StructureExtractor,
    items_to_entities,
    parse_structure_response,
)
from cert_extractor.schema.entities import Chapter, Figure, Question, Section, Table, Term
from cert_extractor.schema.page_labels import PageLabel

pytestmark = pytest.mark.unit


# --------- parse_structure_response ----------------------------------------


def test_parse_clean_array() -> None:
    items = parse_structure_response('[{"type":"section","title_jp":"x","section_number":"1.1"}]')
    assert items == [{"type": "section", "title_jp": "x", "section_number": "1.1"}]


def test_parse_strips_code_fence() -> None:
    raw = "```json\n[{\"type\":\"chapter\",\"title_jp\":\"序章\",\"chapter_number\":0}]\n```"
    items = parse_structure_response(raw)
    assert items[0]["type"] == "chapter"


def test_parse_handles_chatter() -> None:
    raw = "Sure! Here is the array:\n[{\"type\":\"figure\",\"caption_jp\":\"図1\",\"image_ref\":\"img-0.jpeg\"}]\nDone."
    items = parse_structure_response(raw)
    assert items[0]["type"] == "figure"


def test_parse_no_array_returns_empty() -> None:
    assert parse_structure_response("I cannot find anything") == []


def test_parse_invalid_json_returns_empty() -> None:
    assert parse_structure_response("[not, valid, json}") == []


def test_parse_non_list_payload_returns_empty() -> None:
    assert parse_structure_response('{"type":"x"}') == []


def test_parse_drops_non_dict_items() -> None:
    items = parse_structure_response('[1, "x", {"type":"section","title_jp":"y","section_number":"1"}]')
    assert items == [{"type": "section", "title_jp": "y", "section_number": "1"}]


# --------- items_to_entities -----------------------------------------------


def _entities_for(items: list[dict]):
    return items_to_entities(items=items, page_number=12, cert_id="itpassport_r6", section_path=["第1章"])


def test_items_to_entities_chapter() -> None:
    entities, skipped = _entities_for(
        [{"type": "chapter", "title_jp": "第1章 企業活動", "chapter_number": 1}]
    )
    assert skipped == []
    assert isinstance(entities[0], Chapter)
    assert entities[0].title.jp == "第1章 企業活動"
    assert entities[0].title.zh == UNTRANSLATED
    assert entities[0].title.en == UNTRANSLATED
    assert entities[0].chapter_number == 1
    assert entities[0].anchor.page == 12
    assert entities[0].anchor.section_path == ["第1章"]
    assert entities[0].id == "itpassport_r6::chapter::p012::0"


def test_items_to_entities_term() -> None:
    entities, _ = _entities_for(
        [{"type": "term", "surface_jp": "経営理念", "definition_jp": "会社の運営方針を決定するための最も基本的な指針"}]
    )
    assert isinstance(entities[0], Term)
    assert entities[0].surface.jp == "経営理念"
    assert entities[0].definition.jp.startswith("会社")


def test_items_to_entities_question() -> None:
    entities, _ = _entities_for(
        [
            {
                "type": "question",
                "stem_jp": "経営理念とは何か?",
                "choices_jp": ["利益", "指針", "売上", "顧客"],
                "answer_index": 1,
            }
        ]
    )
    q = entities[0]
    assert isinstance(q, Question)
    assert q.answer_index == 1
    assert len(q.choices) == 4
    assert q.choices[1].jp == "指針"


def test_items_to_entities_question_too_few_choices_skipped() -> None:
    entities, skipped = _entities_for(
        [{"type": "question", "stem_jp": "x?", "choices_jp": ["a"], "answer_index": 0}]
    )
    assert entities == []
    assert len(skipped) == 1
    assert "choices_jp" in skipped[0][1]


def test_items_to_entities_question_missing_answer_index_defaults_to_minus_one() -> None:
    """Per D-076: when Stage 4's LLM omits answer_index entirely, the
    coercion layer must default to -1 (unknown sentinel), NOT 0. Stage 7
    export will then refuse the entity rather than silently shipping a
    fabricated answer == ア."""
    entities, _ = _entities_for(
        [{"type": "question", "stem_jp": "Q?", "choices_jp": ["a", "b"]}]
    )
    assert isinstance(entities[0], Question)
    assert entities[0].answer_index == -1


def test_items_to_entities_question_explicit_minus_one_preserved() -> None:
    entities, _ = _entities_for(
        [{"type": "question", "stem_jp": "Q?", "choices_jp": ["a", "b"], "answer_index": -1}]
    )
    assert entities[0].answer_index == -1


def test_stage4_prompt_includes_answer_line_parsing_clause() -> None:
    """Regression guard for D-076: the Stage 4 system prompt must
    explicitly instruct the model to parse the answer line at the
    bottom of each page. Without this clause the model defaults to
    answer_index=0 silently — the bug surfaced post-hoc on page_043."""
    from cert_extractor.pipeline.stage4_structure import STRUCTURE_SYSTEM_PROMPT

    assert "問題1-5 ウ" in STRUCTURE_SYSTEM_PROMPT or "answer line" in STRUCTURE_SYSTEM_PROMPT
    assert "ア=0" in STRUCTURE_SYSTEM_PROMPT or "ア = 0" in STRUCTURE_SYSTEM_PROMPT
    assert "-1" in STRUCTURE_SYSTEM_PROMPT


def test_items_to_entities_table() -> None:
    entities, _ = _entities_for(
        [
            {
                "type": "table",
                "caption_jp": "売上一覧",
                "rows_jp": [["2024", "100"], ["2025", "120"]],
            }
        ]
    )
    t = entities[0]
    assert isinstance(t, Table)
    assert len(t.rows) == 2
    assert t.rows[0][0].jp == "2024"


def test_items_to_entities_figure() -> None:
    entities, _ = _entities_for(
        [{"type": "figure", "caption_jp": "経営理念", "image_ref": "img-0.jpeg"}]
    )
    f = entities[0]
    assert isinstance(f, Figure)
    assert f.image_ref == "img-0.jpeg"


def test_items_to_entities_unknown_type_skipped() -> None:
    entities, skipped = _entities_for([{"type": "preface", "title_jp": "x"}])
    assert entities == []
    assert "unknown type" in skipped[0][1]


def test_items_to_entities_missing_required_field_skipped() -> None:
    entities, skipped = _entities_for([{"type": "section", "section_number": "1.1"}])
    # title_jp missing → KeyError caught → skipped
    assert entities == []
    assert len(skipped) == 1


def test_items_to_entities_section() -> None:
    entities, _ = _entities_for(
        [{"type": "section", "title_jp": "1-1 株式会社", "section_number": "01-01"}]
    )
    s = entities[0]
    assert isinstance(s, Section)
    assert s.section_number == "01-01"


# --------- StructureExtractor + Stage4Structure ----------------------------


class _FakeClient:
    def __init__(self, responses: list[str]):
        self._responses = list(responses)
        self.calls: list[dict] = []

    def call(self, *, system: str, user: str, tier=None, **kwargs):
        self.calls.append({"system": system, "user": user, "tier": tier, **kwargs})
        return ClaudeResponse(text=self._responses.pop(0), tokens_input=400, tokens_output=80, cost_usd=0.02)


def test_extractor_routes_to_client_and_parses(_caplog=None) -> None:
    fake = _FakeClient(['[{"type":"section","title_jp":"hi","section_number":"1"}]'])
    ex = StructureExtractor(client=fake, cert_id="itpassport_r6", tier="sonnet")  # type: ignore[arg-type]
    result = ex.extract(page_md="dummy", page_number=10, label=PageLabel.CONTENT)
    assert len(result.entities) == 1
    assert isinstance(result.entities[0], Section)
    assert "page_010" in result.entities[0].anchor.block_id


def _seed_dirs(tmp_path: Path, ocr: dict[int, str], labels: dict[int, str]) -> tuple[Path, Path]:
    ocr_dir = tmp_path / "ocr"
    classified = tmp_path / "classified"
    ocr_dir.mkdir()
    classified.mkdir()
    for n, text in ocr.items():
        (ocr_dir / f"page_{n:03d}.md").write_text(text, encoding="utf-8")
    for n, label in labels.items():
        (classified / f"page_{n:03d}.json").write_text(
            json.dumps({"page_number": n, "label": label, "confidence": 0.9, "reasoning": "ok"}),
            encoding="utf-8",
        )
    return ocr_dir, classified


def test_runner_skips_skip_labels_and_extracts_content(tmp_path: Path) -> None:
    ocr_dir, classified = _seed_dirs(
        tmp_path,
        ocr={1: "cover", 10: "toc text", 30: "content text"},
        labels={1: "cover", 10: "toc", 30: "content"},
    )
    fake = _FakeClient(
        [
            # Only page 30 (content) gets called; cover + toc are skipped.
            '[{"type":"term","surface_jp":"経営理念","definition_jp":"会社の指針"}]',
        ]
    )
    extractor = StructureExtractor(client=fake, cert_id="itpassport_r6", tier="sonnet")  # type: ignore[arg-type]
    runner = Stage4Structure(extractor=extractor)

    result = runner.run(
        ocr_dir=ocr_dir,
        classified_dir=classified,
        run_dir=tmp_path,
        cert_id="itpassport_r6",
        run_id="dry_run_test",
    )
    assert result.pages_processed == 1
    assert result.pages_skipped == 2
    assert result.entities_extracted == 1
    assert result.by_type == {"term": 1}

    # page_030.json on disk and content matches.
    structured = Path(result.output_dir) / "page_030.json"
    payload = json.loads(structured.read_text(encoding="utf-8"))
    assert payload[0]["type"] == "term"
    assert payload[0]["surface"]["jp"] == "経営理念"
    assert payload[0]["surface"]["zh"] == UNTRANSLATED


def test_runner_prefers_cleaned_over_ocr_when_both_exist(tmp_path: Path) -> None:
    ocr_dir, classified = _seed_dirs(
        tmp_path,
        ocr={2: "DEGENERATE GARBAGE"},
        labels={2: "content"},
    )
    cleaned_dir = tmp_path / "cleaned"
    cleaned_dir.mkdir()
    (cleaned_dir / "page_002.md").write_text("CLEAN VISION OUTPUT", encoding="utf-8")

    fake = _FakeClient(['[{"type":"figure","caption_jp":"x","image_ref":"a.jpeg"}]'])
    extractor = StructureExtractor(client=fake, cert_id="itpassport_r6", tier="sonnet")  # type: ignore[arg-type]
    runner = Stage4Structure(extractor=extractor)

    runner.run(
        ocr_dir=ocr_dir,
        classified_dir=classified,
        run_dir=tmp_path,
        cert_id="itpassport_r6",
        run_id="dry_run_test",
    )

    assert "CLEAN VISION OUTPUT" in fake.calls[0]["user"]
    assert "DEGENERATE" not in fake.calls[0]["user"]


def test_runner_attributes_cost_to_stage_4(tmp_path: Path) -> None:
    ocr_dir, classified = _seed_dirs(tmp_path, ocr={5: "x"}, labels={5: "content"})
    fake = _FakeClient(['[{"type":"section","title_jp":"y","section_number":"1"}]'])
    extractor = StructureExtractor(client=fake, cert_id="itpassport_r6", tier="sonnet")  # type: ignore[arg-type]
    runner = Stage4Structure(extractor=extractor)
    result = runner.run(
        ocr_dir=ocr_dir,
        classified_dir=classified,
        run_dir=tmp_path,
        cert_id="itpassport_r6",
        run_id="dry_run_test",
    )
    cost = json.loads(Path(result.cost_path).read_text())
    assert "4" in cost["by_stage"]
    assert cost["by_stage"]["4"]["calls"] == 1


def test_runner_records_invalid_items_as_failures(tmp_path: Path) -> None:
    ocr_dir, classified = _seed_dirs(tmp_path, ocr={5: "x"}, labels={5: "content"})
    fake = _FakeClient([
        '[{"type":"chapter","title_jp":"x","chapter_number":1},{"type":"unknown_type"}]'
    ])
    extractor = StructureExtractor(client=fake, cert_id="itpassport_r6", tier="sonnet")  # type: ignore[arg-type]
    runner = Stage4Structure(extractor=extractor)
    result = runner.run(
        ocr_dir=ocr_dir,
        classified_dir=classified,
        run_dir=tmp_path,
        cert_id="itpassport_r6",
        run_id="dry_run_test",
    )
    assert result.entities_extracted == 1  # only the chapter survives
    assert any("unknown type" in f for f in result.failures)


def test_runner_halts_on_fail_cap(tmp_path: Path) -> None:
    ocr_dir, classified = _seed_dirs(
        tmp_path,
        ocr={n: "x" for n in range(1, 11)},
        labels={n: "content" for n in range(1, 11)},
    )

    class _Boom(_FakeClient):
        def call(self, *, system, user, tier=None, **kw):
            raise RuntimeError("structured-down")

    monitor = BudgetMonitor(
        soft=CapLevels(wall_time_seconds=10**9, mistral_usd=10**9, anthropic_usd=10**9, fail_count=2),
        hard=CapLevels(wall_time_seconds=10**9, mistral_usd=10**9, anthropic_usd=10**9, fail_count=4),
    )
    extractor = StructureExtractor(client=_Boom([]), cert_id="itpassport_r6", tier="sonnet")  # type: ignore[arg-type]
    runner = Stage4Structure(extractor=extractor, monitor=monitor)
    result = runner.run(
        ocr_dir=ocr_dir,
        classified_dir=classified,
        run_dir=tmp_path,
        cert_id="itpassport_r6",
        run_id="dry_run_test",
    )
    assert result.halted_verdict in (Verdict.WARN, Verdict.FAIL)
    assert result.fail_count >= 2


def test_skip_labels_documented() -> None:
    """Guards against drift: SKIP_LABELS must include cover/blank/toc/index/glossary/other."""
    expected = {PageLabel.COVER, PageLabel.BLANK, PageLabel.TOC,
                PageLabel.GLOSSARY, PageLabel.INDEX, PageLabel.OTHER}
    assert SKIP_LABELS == expected


def test_runner_skip_existing_default_true(tmp_path: Path) -> None:
    """A re-run on an already-populated structured/ should NOT re-bill the LLM."""
    ocr_dir, classified = _seed_dirs(tmp_path, ocr={5: "x", 6: "y"}, labels={5: "content", 6: "content"})
    structured_dir = tmp_path / "structured"
    structured_dir.mkdir()
    # Pretend page 5 was already extracted in a previous run.
    (structured_dir / "page_005.json").write_text("[]", encoding="utf-8")

    fake = _FakeClient(['[{"type":"section","title_jp":"x","section_number":"1"}]'])
    extractor = StructureExtractor(client=fake, cert_id="itpassport_r6", tier="sonnet")  # type: ignore[arg-type]
    runner = Stage4Structure(extractor=extractor)

    result = runner.run(
        ocr_dir=ocr_dir,
        classified_dir=classified,
        run_dir=tmp_path,
        cert_id="itpassport_r6",
        run_id="dry_run_test",
        # skip_existing default True
    )
    # Only page 6 was processed; the LLM was called once total.
    assert result.pages_processed == 1
    assert len(fake.calls) == 1
    # page 6 prompt contains "y" (its OCR text), not "x" (page 5's text).
    assert "y" in fake.calls[0]["user"]


def test_runner_skip_existing_false_reprocesses(tmp_path: Path) -> None:
    """With skip_existing=False, a populated dir gets fully re-run."""
    ocr_dir, classified = _seed_dirs(tmp_path, ocr={5: "x"}, labels={5: "content"})
    structured_dir = tmp_path / "structured"
    structured_dir.mkdir()
    (structured_dir / "page_005.json").write_text("[]", encoding="utf-8")

    fake = _FakeClient(['[{"type":"section","title_jp":"x","section_number":"1"}]'])
    extractor = StructureExtractor(client=fake, cert_id="itpassport_r6", tier="sonnet")  # type: ignore[arg-type]
    runner = Stage4Structure(extractor=extractor)

    result = runner.run(
        ocr_dir=ocr_dir,
        classified_dir=classified,
        run_dir=tmp_path,
        cert_id="itpassport_r6",
        run_id="dry_run_test",
        skip_existing=False,
    )
    assert result.pages_processed == 1
    assert len(fake.calls) == 1
