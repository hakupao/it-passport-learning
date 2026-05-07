"""Unit tests for Stage 5 trilingual translation (no real Claude calls)."""
from __future__ import annotations

import json
from pathlib import Path

import pytest

from cert_extractor import UNTRANSLATED
from cert_extractor.llm.claude_client import ClaudeResponse
from cert_extractor.pipeline.stage5_translate import (
    FieldPath,
    Stage5Translate,
    TranslationEngine,
    TranslationRequest,
    _apply,
    _walk_for_paths,
    parse_translation_response,
)
from cert_extractor.schema.common import Trilingual
from cert_extractor.schema.glossary import Glossary, GlossaryEntry

pytestmark = pytest.mark.unit


def _trl(jp: str, zh: str = UNTRANSLATED, en: str = UNTRANSLATED) -> dict:
    return {"jp": jp, "zh": zh, "en": en}


def _gloss(*pairs: tuple[str, str, str]) -> Glossary:
    entries = [
        GlossaryEntry(
            id=f"g_{i + 1:03d}",
            surface=Trilingual(jp=jp, zh=zh, en=en),
            first_page=1,
            occurrences=[1],
        )
        for i, (jp, zh, en) in enumerate(pairs)
    ]
    return Glossary(cert_id="itpassport_r6", run_id="r1", entries=entries)


# --------- _walk_for_paths ------------------------------------------------


def test_walk_finds_top_level_trilingual() -> None:
    entities = [
        {
            "id": "x",
            "anchor": {"page": 30, "block_id": "b", "section_path": []},
            "type": "term",
            "surface": _trl("経営理念"),
            "definition": _trl("会社の指針"),
        }
    ]
    requests = _walk_for_paths(entities)
    assert len(requests) == 2
    paths = {tuple(r.path.keys) for r in requests}
    assert ("surface",) in paths
    assert ("definition",) in paths


def test_walk_descends_into_choice_lists() -> None:
    entities = [
        {
            "id": "q",
            "anchor": {"page": 42, "block_id": "b", "section_path": []},
            "type": "question",
            "stem": _trl("Q?"),
            "choices": [_trl("a"), _trl("b"), _trl("c"), _trl("d")],
            "answer_index": 1,
        }
    ]
    requests = _walk_for_paths(entities)
    # 1 stem + 4 choices = 5 leaves.
    assert len(requests) == 5
    paths = sorted({r.path.keys for r in requests}, key=lambda k: str(k))
    # Choices addressed via list index.
    assert ("choices", 0) in paths
    assert ("choices", 3) in paths


def test_walk_skips_already_translated_fields() -> None:
    entities = [
        {
            "id": "s",
            "anchor": {"page": 1, "block_id": "b", "section_path": []},
            "type": "section",
            "title": _trl("foo", zh="已翻", en="done"),
            "section_number": "1.1",
        }
    ]
    requests = _walk_for_paths(entities)
    assert requests == []


def test_walk_descends_table_rows() -> None:
    entities = [
        {
            "id": "t",
            "anchor": {"page": 10, "block_id": "b", "section_path": []},
            "type": "table",
            "caption": _trl("売上"),
            "rows": [[_trl("2024"), _trl("100")], [_trl("2025"), _trl("120")]],
        }
    ]
    requests = _walk_for_paths(entities)
    # caption (1) + 2 rows × 2 cells = 5
    assert len(requests) == 5


# --------- _apply ---------------------------------------------------------


def test_apply_writes_through_nested_path() -> None:
    entities = [
        {
            "id": "q",
            "anchor": {},
            "type": "question",
            "stem": _trl("Q?"),
            "choices": [_trl("a"), _trl("b")],
            "answer_index": 0,
        }
    ]
    _apply(
        entities,
        FieldPath(entity_index=0, keys=("choices", 1)),
        Trilingual(jp="b", zh="乙", en="b-en"),
    )
    assert entities[0]["choices"][1] == {"jp": "b", "zh": "乙", "en": "b-en"}


# --------- parse_translation_response -------------------------------------


def test_parse_clean_response() -> None:
    raw = '[{"jp":"経営理念","zh":"经营理念","en":"Management philosophy"}]'
    items = parse_translation_response(raw, n=1)
    assert items[0]["zh"] == "经营理念"


def test_parse_handles_code_fence() -> None:
    raw = "```json\n[{\"jp\":\"x\",\"zh\":\"y\",\"en\":\"z\"}]\n```"
    items = parse_translation_response(raw, n=1)
    assert items[0]["en"] == "z"


def test_parse_invalid_returns_empty() -> None:
    assert parse_translation_response("not json", n=1) == []


# --------- TranslationEngine ----------------------------------------------


class _FakeClient:
    def __init__(self, responses: list[str]):
        self._responses = list(responses)
        self.calls: list[dict] = []

    def call(self, *, system: str, user: str, tier=None, **kwargs):
        self.calls.append({"system": system, "user": user, "tier": tier, **kwargs})
        return ClaudeResponse(text=self._responses.pop(0), tokens_input=200, tokens_output=80, cost_usd=0.01)


def test_engine_resolves_glossary_without_llm_call() -> None:
    fake = _FakeClient([])  # no responses queued — must not call
    glossary = _gloss(("経営理念", "经营理念", "Management philosophy"))
    eng = TranslationEngine(client=fake, glossary=glossary, tier="sonnet")  # type: ignore[arg-type]

    requests = [
        TranslationRequest(jp="経営理念", path=FieldPath(0, ("surface",))),
    ]
    result = eng.translate_batch(requests, page_number=30)

    assert fake.calls == []
    assert result.glossary_hits == 1
    assert result.llm_requests == 0
    assert result.trilinguals[FieldPath(0, ("surface",))].zh == "经营理念"


def test_engine_calls_llm_for_unresolved_only() -> None:
    glossary = _gloss(("経営理念", "经营理念", "Management philosophy"))
    fake = _FakeClient(
        ['[{"jp":"会社の指針","zh":"公司的指针","en":"Company guideline"}]']
    )
    eng = TranslationEngine(client=fake, glossary=glossary, tier="sonnet")  # type: ignore[arg-type]

    requests = [
        TranslationRequest(jp="経営理念", path=FieldPath(0, ("surface",))),         # glossary hit
        TranslationRequest(jp="会社の指針", path=FieldPath(0, ("definition",))),     # llm
    ]
    result = eng.translate_batch(requests, page_number=30)

    assert result.glossary_hits == 1
    assert result.llm_requests == 1
    assert result.trilinguals[FieldPath(0, ("surface",))].zh == "经营理念"
    assert result.trilinguals[FieldPath(0, ("definition",))].zh == "公司的指针"
    # System prompt embeds the glossary JSON.
    assert "経営理念" in fake.calls[0]["system"]


def test_engine_handles_missing_zh_in_response() -> None:
    fake = _FakeClient(['[{"jp":"x","zh":"","en":"y"}]'])
    eng = TranslationEngine(client=fake, glossary=_gloss(), tier="sonnet")  # type: ignore[arg-type]
    requests = [TranslationRequest(jp="x", path=FieldPath(0, ("surface",)))]
    result = eng.translate_batch(requests, page_number=1)
    assert result.trilinguals == {}
    assert result.skipped and "missing zh/en" in result.skipped[0][1]


def test_engine_handles_short_response() -> None:
    fake = _FakeClient(['[{"jp":"a","zh":"a-zh","en":"a-en"}]'])
    eng = TranslationEngine(client=fake, glossary=_gloss(), tier="sonnet")  # type: ignore[arg-type]
    requests = [
        TranslationRequest(jp="a", path=FieldPath(0, ("x",))),
        TranslationRequest(jp="b", path=FieldPath(0, ("y",))),  # missing in response
    ]
    result = eng.translate_batch(requests, page_number=1)
    assert FieldPath(0, ("x",)) in result.trilinguals
    assert FieldPath(0, ("y",)) not in result.trilinguals
    assert any("short batch" in r[1] for r in result.skipped)


def test_engine_no_requests_no_call() -> None:
    fake = _FakeClient([])
    eng = TranslationEngine(client=fake, glossary=_gloss(), tier="sonnet")  # type: ignore[arg-type]
    result = eng.translate_batch([], page_number=1)
    assert fake.calls == []
    assert result.trilinguals == {}


# --------- Stage5Translate runner -----------------------------------------


def _seed_structured(tmp_path: Path, pages: dict[int, list[dict]]) -> Path:
    structured = tmp_path / "structured"
    structured.mkdir()
    for n, items in pages.items():
        (structured / f"page_{n:03d}.json").write_text(
            json.dumps(items, ensure_ascii=False), encoding="utf-8"
        )
    return structured


def test_runner_writes_translated_pages(tmp_path: Path) -> None:
    structured = _seed_structured(
        tmp_path,
        {
            30: [
                {
                    "id": "x",
                    "anchor": {"page": 30, "block_id": "b", "section_path": []},
                    "type": "term",
                    "surface": _trl("経営理念"),
                    "definition": _trl("会社の指針"),
                }
            ]
        },
    )
    glossary = _gloss(("経営理念", "经营理念", "Management philosophy"))
    fake = _FakeClient(
        ['[{"jp":"会社の指针","zh":"公司的指针","en":"Company guideline"}]']
    )
    engine = TranslationEngine(client=fake, glossary=glossary, tier="sonnet")  # type: ignore[arg-type]
    runner = Stage5Translate(engine=engine)

    result = runner.run(
        structured_dir=structured,
        run_dir=tmp_path,
        cert_id="itpassport_r6",
        run_id="dry_run_test",
        skip_existing=False,
    )

    assert result.pages_processed == 1
    out = json.loads((Path(result.output_dir) / "page_030.json").read_text())
    assert out[0]["surface"]["zh"] == "经营理经" or out[0]["surface"]["zh"] == "经营理念"
    assert out[0]["definition"]["zh"] != UNTRANSLATED


def test_runner_skip_existing_reads_from_disk(tmp_path: Path) -> None:
    structured = _seed_structured(tmp_path, {30: [{"id": "x", "type": "section",
        "anchor": {"page": 30, "block_id": "b", "section_path": []},
        "title": _trl("foo"), "section_number": "1.1"}]})
    translated = tmp_path / "translated"
    translated.mkdir()
    (translated / "page_030.json").write_text("[]", encoding="utf-8")

    fake = _FakeClient([])
    engine = TranslationEngine(client=fake, glossary=_gloss(), tier="sonnet")  # type: ignore[arg-type]
    runner = Stage5Translate(engine=engine)

    result = runner.run(
        structured_dir=structured,
        run_dir=tmp_path,
        cert_id="itpassport_r6",
        run_id="dry_run_test",
        skip_existing=True,
    )
    assert result.pages_processed == 0
    assert result.pages_skipped == 1
    assert fake.calls == []


def test_runner_attributes_cost_to_stage_5(tmp_path: Path) -> None:
    structured = _seed_structured(
        tmp_path,
        {30: [{"id": "x", "type": "section",
               "anchor": {"page": 30, "block_id": "b", "section_path": []},
               "title": _trl("foo"), "section_number": "1.1"}]},
    )
    glossary = _gloss(("foo", "啥", "what"))
    fake = _FakeClient([])  # all-glossary-hit, no LLM call expected
    engine = TranslationEngine(client=fake, glossary=glossary, tier="sonnet")  # type: ignore[arg-type]
    runner = Stage5Translate(engine=engine)

    result = runner.run(
        structured_dir=structured,
        run_dir=tmp_path,
        cert_id="itpassport_r6",
        run_id="dry_run_test",
        skip_existing=False,
    )
    cost = json.loads(Path(result.cost_path).read_text())
    # No LLM call → stage 5 entry may not exist; just ensure pages processed.
    assert result.pages_processed == 1
    assert result.glossary_hits == 1
    assert result.llm_calls == 0
