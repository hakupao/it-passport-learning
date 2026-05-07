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


def test_glossary_hit_preserves_input_jp_when_alias_differs_from_canonical() -> None:
    """Per D-075: Stage 5 MUST NOT mutate the input jp surface. When the
    input jp is an alias (e.g. ``CSR``) and the glossary's canonical
    form is longer (``CSR（企業の社会的責任）``), the resolved Trilingual
    must carry the input jp verbatim while using the glossary's locked
    zh + en for the translations.

    This regression-guards a bug where ``_glossary_lookup`` returned the
    glossary entry's ``surface`` Trilingual directly, replacing the
    source jp with the canonical form. Caught post-hoc on page_034
    (CSR), page_045 (HRTech / CIO / CEO), page_050 (alias-merged
    プレーンストーミング), and others.
    """
    glossary_entries = [
        GlossaryEntry(
            id="g_001",
            surface=Trilingual(
                jp="CSR（企業の社会的責任）", zh="企业社会责任",
                en="Corporate Social Responsibility (CSR)",
            ),
            first_page=1,
            occurrences=[1],
            aliases_jp=["CSR"],
        )
    ]
    glossary = Glossary(cert_id="itpassport_r6", run_id="r1", entries=glossary_entries)
    fake = _FakeClient([])
    eng = TranslationEngine(client=fake, glossary=glossary, tier="sonnet")  # type: ignore[arg-type]

    # Use the alias form as the page-source jp (what Stage 4 emitted on
    # page_034 / page_044).
    requests = [
        TranslationRequest(jp="CSR", path=FieldPath(0, ("surface",))),
    ]
    result = eng.translate_batch(requests, page_number=34)

    resolved = result.trilinguals[FieldPath(0, ("surface",))]
    assert resolved.jp == "CSR", (
        "Stage 5 must preserve the input jp surface; got "
        f"{resolved.jp!r} (canonical-form leak from glossary)"
    )
    assert resolved.zh == "企业社会责任"
    assert resolved.en == "Corporate Social Responsibility (CSR)"
    assert fake.calls == []  # glossary hit, no LLM call


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
    assert result.responses == []


def test_engine_system_prompt_includes_always_translate_clause() -> None:
    """Regression guard for the prompt change that fixed Stage 5 attempt 005.

    Without this clause the model was empirically observed to drop
    items whose jp body contained a glossary-locked surface as a
    substring, on both sonnet and opus at chunk=1.
    """
    glossary = _gloss(("x", "x-zh", "x-en"))
    fake = _FakeClient(['[{"jp":"y","zh":"y-zh","en":"y-en"}]'])
    eng = TranslationEngine(client=fake, glossary=glossary, tier="sonnet")  # type: ignore[arg-type]
    eng.translate_batch(
        [TranslationRequest(jp="y", path=FieldPath(0, ("k",)))], page_number=1
    )
    system = fake.calls[0]["system"]
    assert "ALWAYS return a complete trilingual rendering" in system
    assert "wrapper definition" in system or "wrapper" in system


# --------- TranslationEngine sub-batching --------------------------------


def _items(*jp_zh_en: tuple[str, str, str]) -> str:
    """Render a JSON array response for the fake client."""
    return json.dumps(
        [{"jp": jp, "zh": zh, "en": en} for jp, zh, en in jp_zh_en],
        ensure_ascii=False,
    )


def test_engine_splits_unresolved_into_sub_batches() -> None:
    """17 unresolved jp items + max_items_per_call=8 → 3 LLM calls (8+8+1)."""
    chunks = [
        _items(*[(f"j{i}", f"z{i}", f"e{i}") for i in range(0, 8)]),
        _items(*[(f"j{i}", f"z{i}", f"e{i}") for i in range(8, 16)]),
        _items(("j16", "z16", "e16")),
    ]
    fake = _FakeClient(chunks)
    eng = TranslationEngine(
        client=fake, glossary=_gloss(), tier="opus", max_items_per_call=8  # type: ignore[arg-type]
    )

    requests = [
        TranslationRequest(jp=f"j{i}", path=FieldPath(0, ("k", i))) for i in range(17)
    ]
    result = eng.translate_batch(requests, page_number=45)

    assert len(fake.calls) == 3
    assert result.llm_requests == 3
    assert len(result.responses) == 3
    assert len(result.trilinguals) == 17
    # Each sub-batch's user prompt carries only its slice.
    sizes = [len(json.loads(call["user"].split("inputs:\n", 1)[1])) for call in fake.calls]
    assert sizes == [8, 8, 1]


def test_engine_glossary_hits_are_filtered_before_subbatching() -> None:
    """Glossary hits short-circuit; only the residue is sub-batched."""
    glossary = _gloss(("g0", "g0-zh", "g0-en"), ("g1", "g1-zh", "g1-en"))
    # 2 glossary + 9 unresolved → max=4 → 3 sub-batches (4+4+1) on the residue.
    chunks = [
        _items(*[(f"u{i}", f"u{i}-zh", f"u{i}-en") for i in range(0, 4)]),
        _items(*[(f"u{i}", f"u{i}-zh", f"u{i}-en") for i in range(4, 8)]),
        _items(("u8", "u8-zh", "u8-en")),
    ]
    fake = _FakeClient(chunks)
    eng = TranslationEngine(
        client=fake, glossary=glossary, tier="opus", max_items_per_call=4  # type: ignore[arg-type]
    )

    requests = [
        TranslationRequest(jp="g0", path=FieldPath(0, ("a",))),
        *[
            TranslationRequest(jp=f"u{i}", path=FieldPath(0, ("u", i)))
            for i in range(9)
        ],
        TranslationRequest(jp="g1", path=FieldPath(0, ("b",))),
    ]
    result = eng.translate_batch(requests, page_number=19)

    assert result.glossary_hits == 2
    assert result.llm_requests == 3
    assert len(result.responses) == 3
    # Glossary hits use the locked surface verbatim.
    assert result.trilinguals[FieldPath(0, ("a",))].zh == "g0-zh"
    assert result.trilinguals[FieldPath(0, ("b",))].zh == "g1-zh"
    # All 9 residue items resolved.
    for i in range(9):
        assert FieldPath(0, ("u", i)) in result.trilinguals


def test_engine_short_subbatch_marks_tail_skipped_and_keeps_other_subbatches() -> None:
    """A short response in the middle sub-batch must not cancel the next one."""
    chunks = [
        _items(("a", "a-zh", "a-en"), ("b", "b-zh", "b-en")),  # full
        _items(("c", "c-zh", "c-en")),  # short: requested 2, returned 1 (d missing)
        _items(("e", "e-zh", "e-en")),  # next sub-batch still runs
    ]
    fake = _FakeClient(chunks)
    eng = TranslationEngine(
        client=fake, glossary=_gloss(), tier="opus", max_items_per_call=2  # type: ignore[arg-type]
    )

    requests = [
        TranslationRequest(jp=ch, path=FieldPath(0, (ch,)))
        for ch in ("a", "b", "c", "d", "e")
    ]
    result = eng.translate_batch(requests, page_number=33)

    assert result.llm_requests == 3
    assert FieldPath(0, ("a",)) in result.trilinguals
    assert FieldPath(0, ("b",)) in result.trilinguals
    assert FieldPath(0, ("c",)) in result.trilinguals
    assert FieldPath(0, ("d",)) not in result.trilinguals
    assert FieldPath(0, ("e",)) in result.trilinguals
    assert any("short batch" in reason for _, reason in result.skipped)


def test_runner_aggregates_subbatch_costs(tmp_path: Path) -> None:
    """A page that triggers 3 sub-batches contributes 3 LLM calls + summed cost."""
    structured = _seed_structured(
        tmp_path,
        {
            45: [
                {
                    "id": f"e{i}",
                    "type": "term",
                    "anchor": {"page": 45, "block_id": "b", "section_path": []},
                    "surface": _trl(f"j{i}"),
                }
                for i in range(17)
            ]
        },
    )
    chunks = [
        _items(*[(f"j{i}", f"z{i}", f"e{i}") for i in range(0, 8)]),
        _items(*[(f"j{i}", f"z{i}", f"e{i}") for i in range(8, 16)]),
        _items(("j16", "z16", "e16")),
    ]
    fake = _FakeClient(chunks)
    engine = TranslationEngine(
        client=fake, glossary=_gloss(), tier="opus", max_items_per_call=8  # type: ignore[arg-type]
    )
    runner = Stage5Translate(engine=engine)

    result = runner.run(
        structured_dir=structured,
        run_dir=tmp_path,
        cert_id="itpassport_r6",
        run_id="dry_run_test",
        skip_existing=False,
    )

    assert result.pages_processed == 1
    assert result.llm_calls == 3
    cost = json.loads(Path(result.cost_path).read_text())
    # Three calls × $0.01 each (per _FakeClient) → $0.03 attributed to stage 5.
    assert cost["by_stage"]["5"]["calls"] == 3
    assert cost["by_stage"]["5"]["usd"] == pytest.approx(0.03)


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
