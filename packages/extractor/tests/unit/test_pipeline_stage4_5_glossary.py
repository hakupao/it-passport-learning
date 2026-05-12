"""Unit tests for Stage 4.5 glossary extraction (no real Claude calls)."""
from __future__ import annotations

import json
from pathlib import Path

import pytest
from cert_extractor.llm.claude_client import ClaudeResponse
from cert_extractor.pipeline.stage4_5_glossary import (
    GlossaryExtractor,
    HarvestedTerm,
    Stage4_5Glossary,
    _is_all_katakana,
    items_to_entries,
    load_kana_stop_list,
    parse_glossary_response,
    scan_katakana_terms_for_backfill,
    split_multi_concept_items,
)
from cert_extractor.schema.glossary import Glossary

pytestmark = pytest.mark.unit


# --------- parse_glossary_response ----------------------------------------


def test_parse_clean_array() -> None:
    raw = '[{"surface_jp":"経営理念","surface_zh":"经营理念","surface_en":"Management philosophy","kana_helper":null,"aliases_jp":[]}]'
    items = parse_glossary_response(raw)
    assert items[0]["surface_jp"] == "経営理念"


def test_parse_strips_code_fence() -> None:
    raw = "```json\n[{\"surface_jp\":\"x\",\"surface_zh\":\"x\",\"surface_en\":\"x\"}]\n```"
    items = parse_glossary_response(raw)
    assert items[0]["surface_jp"] == "x"


def test_parse_invalid_returns_empty() -> None:
    assert parse_glossary_response("not json") == []
    assert parse_glossary_response('{"surface_jp":"x"}') == []


# --------- items_to_entries -----------------------------------------------


def _occ(*, canonical: dict[str, list[int]]) -> tuple[dict, dict]:
    occurrences = canonical
    first_page = {k: min(v) for k, v in occurrences.items()}
    return occurrences, first_page


def test_entry_uses_canonical_first_page_and_pages() -> None:
    occ, fp = _occ(canonical={"経営理念": [30, 32, 35]})
    entries, skipped = items_to_entries(
        items=[
            {
                "surface_jp": "経営理念",
                "surface_zh": "经营理念",
                "surface_en": "Management philosophy",
                "kana_helper": None,
                "aliases_jp": [],
            }
        ],
        occurrences=occ,
        first_page=fp,
    )
    assert skipped == []
    e = entries[0]
    assert e.id == "g_001"
    assert e.surface.zh == "经营理念"
    assert e.first_page == 30
    assert e.occurrences == [30, 32, 35]


def test_entry_aggregates_alias_pages() -> None:
    occ, fp = _occ(canonical={"経営理念": [30], "経営方針": [25, 32]})
    entries, _ = items_to_entries(
        items=[
            {
                "surface_jp": "経営理念",
                "surface_zh": "经营理念",
                "surface_en": "Management philosophy",
                "kana_helper": None,
                "aliases_jp": ["経営方針"],
            }
        ],
        occurrences=occ,
        first_page=fp,
    )
    e = entries[0]
    assert e.aliases_jp == ["経営方針"]
    assert e.occurrences == [25, 30, 32]
    assert e.first_page == 25


def test_entry_kana_helper_built() -> None:
    occ, fp = _occ(canonical={"アルゴリズム": [50]})
    entries, _ = items_to_entries(
        items=[
            {
                "surface_jp": "アルゴリズム",
                "surface_zh": "算法",
                "surface_en": "Algorithm",
                "kana_helper": {
                    "surface": "アルゴリズム",
                    "reading": "arugorizumu",
                    "zh_concept": "算法",
                },
                "aliases_jp": [],
            }
        ],
        occurrences=occ,
        first_page=fp,
    )
    assert entries[0].kana_helper is not None
    assert entries[0].kana_helper.reading == "arugorizumu"


def test_entry_missing_required_field_skipped() -> None:
    occ, fp = _occ(canonical={"経営理念": [30]})
    entries, skipped = items_to_entries(
        items=[{"surface_jp": "経営理念", "surface_zh": "经营理念"}],
        occurrences=occ,
        first_page=fp,
    )
    assert entries == []
    assert len(skipped) == 1
    assert "surface_en" in skipped[0][1]


# --------- GlossaryExtractor ----------------------------------------------


class _FakeClient:
    def __init__(self, responses: list[str]):
        self._responses = list(responses)
        self.calls: list[dict] = []

    def call(self, *, system: str, user: str, tier=None, **kwargs):
        self.calls.append({"system": system, "user": user, "tier": tier, **kwargs})
        return ClaudeResponse(
            text=self._responses.pop(0), tokens_input=400, tokens_output=200, cost_usd=0.05
        )


def test_extractor_emits_unique_terms_in_prompt_then_builds_glossary() -> None:
    fake = _FakeClient(
        ['[{"surface_jp":"経営理念","surface_zh":"经营理念","surface_en":"Management philosophy","kana_helper":null,"aliases_jp":[]}]']
    )
    ex = GlossaryExtractor(client=fake, cert_id="itpassport_r6", run_id="r1", tier="sonnet")  # type: ignore[arg-type]
    harvested = [
        HarvestedTerm("経営理念", 30),
        HarvestedTerm("経営理念", 32),  # duplicate — should appear once in prompt
        HarvestedTerm("社員", 30),
    ]
    result = ex.extract(harvested)
    assert "経営理念" in fake.calls[0]["user"]
    assert fake.calls[0]["user"].count("経営理念") == 1
    assert isinstance(result.glossary, Glossary)
    assert len(result.glossary.entries) == 1
    assert result.glossary.entries[0].occurrences == [30, 32]


def test_extractor_handles_no_terms() -> None:
    fake = _FakeClient([])
    ex = GlossaryExtractor(client=fake, cert_id="itpassport_r6", run_id="r1", tier="sonnet")  # type: ignore[arg-type]
    result = ex.extract([])
    # No LLM call when there are no terms.
    assert fake.calls == []
    assert result.glossary.entries == []


# --------- Stage4_5Glossary runner ----------------------------------------


def _seed_structured(tmp_path: Path, terms_by_page: dict[int, list[str]]) -> Path:
    structured = tmp_path / "structured"
    structured.mkdir()
    for n, surfaces in terms_by_page.items():
        items = [
            {
                "id": f"itpassport_r6::term::p{n:03d}::{i}",
                "anchor": {"page": n, "block_id": f"page_{n:03d}_block_{i}", "section_path": []},
                "type": "term",
                "surface": {"jp": s, "zh": "<UNTRANSLATED>", "en": "<UNTRANSLATED>"},
                "definition": {"jp": "...", "zh": "<UNTRANSLATED>", "en": "<UNTRANSLATED>"},
                "kana_helper": None,
            }
            for i, s in enumerate(surfaces)
        ]
        (structured / f"page_{n:03d}.json").write_text(json.dumps(items, ensure_ascii=False))
    return structured


def test_runner_writes_glossary_json(tmp_path: Path) -> None:
    structured = _seed_structured(
        tmp_path,
        {30: ["経営理念", "社員"], 32: ["経営理念"]},
    )
    fake = _FakeClient(
        [
            '[{"surface_jp":"経営理念","surface_zh":"经营理念","surface_en":"Management philosophy","kana_helper":null,"aliases_jp":[]},'
            '{"surface_jp":"社員","surface_zh":"员工","surface_en":"Employee","kana_helper":null,"aliases_jp":[]}]'
        ]
    )
    extractor = GlossaryExtractor(client=fake, cert_id="itpassport_r6", run_id="r1", tier="sonnet")  # type: ignore[arg-type]
    runner = Stage4_5Glossary(extractor=extractor)

    result = runner.run(
        structured_dir=structured,
        run_dir=tmp_path,
        cert_id="itpassport_r6",
        run_id="dry_run_test",
        skip_existing=False,
    )

    assert result.pages_scanned == 2
    assert result.terms_harvested == 3
    assert result.unique_surfaces == 2
    assert result.entries_locked == 2
    glossary_path = Path(result.output_path)
    payload = json.loads(glossary_path.read_text(encoding="utf-8"))
    assert payload["cert_id"] == "itpassport_r6"
    assert len(payload["entries"]) == 2
    cost = json.loads(Path(result.cost_path).read_text())
    assert "45" in cost["by_stage"]


def test_runner_skip_existing_loads_existing_glossary(tmp_path: Path) -> None:
    structured = _seed_structured(tmp_path, {30: ["経営理念"]})
    glossary_dir = tmp_path / "glossary"
    glossary_dir.mkdir()
    pre = Glossary(
        cert_id="itpassport_r6",
        run_id="dry_run_test",
        entries=[],
    )
    (glossary_dir / "glossary.json").write_text(pre.model_dump_json())

    fake = _FakeClient([])
    extractor = GlossaryExtractor(client=fake, cert_id="itpassport_r6", run_id="r1", tier="sonnet")  # type: ignore[arg-type]
    runner = Stage4_5Glossary(extractor=extractor)

    result = runner.run(
        structured_dir=structured,
        run_dir=tmp_path,
        cert_id="itpassport_r6",
        run_id="dry_run_test",
        skip_existing=True,
    )

    # Existing glossary loaded; no LLM call fired.
    assert fake.calls == []
    assert result.entries_locked == 0  # loaded the empty file


def test_runner_handles_extractor_failure(tmp_path: Path) -> None:
    structured = _seed_structured(tmp_path, {30: ["経営理念"]})

    class _Boom(_FakeClient):
        def call(self, **kw):
            raise RuntimeError("glossary-down")

    extractor = GlossaryExtractor(client=_Boom([]), cert_id="itpassport_r6", run_id="r1", tier="sonnet")  # type: ignore[arg-type]
    runner = Stage4_5Glossary(extractor=extractor)
    result = runner.run(
        structured_dir=structured,
        run_dir=tmp_path,
        cert_id="itpassport_r6",
        run_id="dry_run_test",
        skip_existing=False,
    )
    assert result.entries_locked == 0
    assert result.fail_count == 1
    assert "glossary-down" in result.failures[0]


def test_runner_with_no_terms_writes_empty_glossary(tmp_path: Path) -> None:
    structured = _seed_structured(tmp_path, {})
    fake = _FakeClient([])
    extractor = GlossaryExtractor(client=fake, cert_id="itpassport_r6", run_id="r1", tier="sonnet")  # type: ignore[arg-type]
    runner = Stage4_5Glossary(extractor=extractor)
    result = runner.run(
        structured_dir=structured,
        run_dir=tmp_path,
        cert_id="itpassport_r6",
        run_id="dry_run_test",
        skip_existing=False,
    )
    assert result.entries_locked == 0
    assert fake.calls == []  # no LLM call when no terms harvested


# --------- D-080 polish #1: kana_helper auto-backfill -----------------------


def test_is_all_katakana_classifies_correctly() -> None:
    assert _is_all_katakana("アルゴリズム") is True
    assert _is_all_katakana("ｱﾙｺﾞﾘｽﾞﾑ") is True  # halfwidth katakana
    assert _is_all_katakana("経営理念") is False  # kanji
    assert _is_all_katakana("ITパスポート") is False  # latin + kana
    assert _is_all_katakana("あいうえお") is False  # hiragana
    assert _is_all_katakana("") is False  # empty rejected


def test_scan_backfills_all_katakana_term_missing_kana_helper() -> None:
    items = [
        {
            "surface_jp": "アルゴリズム",
            "surface_zh": "算法",
            "surface_en": "Algorithm",
            "kana_helper": None,
            "aliases_jp": [],
        }
    ]
    out = scan_katakana_terms_for_backfill(items, stop_list=set())
    helper = out[0]["kana_helper"]
    assert helper is not None
    assert helper["surface"] == "アルゴリズム"
    assert helper["reading"] == "アルゴリズム"
    assert helper["zh_concept"] == "算法"
    assert helper["auto_backfill"] is True
    # Source not mutated.
    assert items[0]["kana_helper"] is None


def test_scan_skips_term_present_in_stop_list() -> None:
    items = [
        {
            "surface_jp": "パソコン",
            "surface_zh": "电脑",
            "surface_en": "Computer",
            "kana_helper": None,
            "aliases_jp": [],
        }
    ]
    out = scan_katakana_terms_for_backfill(items, stop_list={"パソコン"})
    assert out[0]["kana_helper"] is None  # exempted by stop list


def test_scan_skips_non_all_katakana_surfaces() -> None:
    items = [
        {
            "surface_jp": "経営理念",  # kanji-only
            "surface_zh": "经营理念",
            "surface_en": "Management philosophy",
            "kana_helper": None,
            "aliases_jp": [],
        },
        {
            "surface_jp": "ITパスポート",  # latin + katakana
            "surface_zh": "IT护照",
            "surface_en": "IT Passport",
            "kana_helper": None,
            "aliases_jp": [],
        },
        {
            "surface_jp": "あいさつ",  # hiragana-only
            "surface_zh": "问候",
            "surface_en": "Greeting",
            "kana_helper": None,
            "aliases_jp": [],
        },
    ]
    out = scan_katakana_terms_for_backfill(items, stop_list=set())
    assert all(item["kana_helper"] is None for item in out)


def test_scan_preserves_existing_kana_helper_no_overwrite() -> None:
    existing = {
        "surface": "アルゴリズム",
        "reading": "arugorizumu",
        "zh_concept": "算法",
    }
    items = [
        {
            "surface_jp": "アルゴリズム",
            "surface_zh": "算法",
            "surface_en": "Algorithm",
            "kana_helper": existing,
            "aliases_jp": [],
        }
    ]
    out = scan_katakana_terms_for_backfill(items, stop_list=set())
    # Untouched — no auto_backfill marker, original reading preserved.
    assert out[0]["kana_helper"] == existing


def test_scan_skips_short_katakana_terms_below_min_length() -> None:
    items = [
        {
            "surface_jp": "ア",  # 1 char
            "surface_zh": "字",
            "surface_en": "Letter",
            "kana_helper": None,
            "aliases_jp": [],
        },
        {
            "surface_jp": "アイ",  # 2 chars; still below threshold (≥3 required)
            "surface_zh": "爱",
            "surface_en": "Love",
            "kana_helper": None,
            "aliases_jp": [],
        },
    ]
    out = scan_katakana_terms_for_backfill(items, stop_list=set())
    assert all(item["kana_helper"] is None for item in out)


def test_load_kana_stop_list_default_path_returns_seeded_terms() -> None:
    stops = load_kana_stop_list()
    # Seed (Session 13) explicitly includes these common IT katakana terms.
    assert "パソコン" in stops
    assert "データ" in stops
    assert "システム" in stops
    assert len(stops) >= 20  # seed has 20 entries per D-080 §5


def test_load_kana_stop_list_ignores_comments_and_blank_lines(tmp_path: Path) -> None:
    path = tmp_path / "custom_stop.txt"
    path.write_text(
        "# header comment\n"
        "\n"
        "パソコン\n"
        "  データ  \n"  # surrounding whitespace
        "# inline comment line\n"
        "\n"
        "システム\n",
        encoding="utf-8",
    )
    stops = load_kana_stop_list(path)
    assert stops == {"パソコン", "データ", "システム"}


def test_extractor_auto_backfills_katakana_term_end_to_end() -> None:
    # LLM returns a katakana term with kana_helper=null — extractor should
    # auto-backfill before items_to_entries.
    fake = _FakeClient(
        ['[{"surface_jp":"アルゴリズム","surface_zh":"算法","surface_en":"Algorithm","kana_helper":null,"aliases_jp":[]}]']
    )
    ex = GlossaryExtractor(client=fake, cert_id="itpassport_r6", run_id="r1", tier="sonnet")  # type: ignore[arg-type]
    result = ex.extract([HarvestedTerm("アルゴリズム", 50)])
    entry = result.glossary.entries[0]
    assert entry.kana_helper is not None
    assert entry.kana_helper.auto_backfill is True
    assert entry.kana_helper.surface == "アルゴリズム"
    assert entry.kana_helper.zh_concept == "算法"


# --------- D-080 polish #2: surface-concept split --------------------------


def test_split_no_separator_passthrough() -> None:
    items = [
        {
            "surface_jp": "経営理念",
            "surface_zh": "经营理念",
            "surface_en": "Management philosophy",
            "kana_helper": None,
            "aliases_jp": ["経営方針"],
        }
    ]
    out, warns = split_multi_concept_items(items)
    assert out == items  # identical contents, including aliases
    assert warns == []


def test_split_balanced_three_concepts_into_three_items() -> None:
    items = [
        {
            "surface_jp": "計画/実行/評価",
            "surface_zh": "计划/执行/评估",
            "surface_en": "Plan/Do/Check",
            "kana_helper": None,
            "aliases_jp": ["PDCA"],  # ambiguous — must NOT leak to all 3 splits
        }
    ]
    out, warns = split_multi_concept_items(items)
    assert warns == []
    assert len(out) == 3
    assert [o["surface_jp"] for o in out] == ["計画", "実行", "評価"]
    assert [o["surface_zh"] for o in out] == ["计划", "执行", "评估"]
    assert [o["surface_en"] for o in out] == ["Plan", "Do", "Check"]
    # aliases cleared on all splits (ambiguity-free)
    assert all(o["aliases_jp"] == [] for o in out)
    # kana_helper reset so scan_katakana_terms_for_backfill can re-decide per split
    assert all(o["kana_helper"] is None for o in out)


def test_split_unbalanced_keeps_original_and_records_warn() -> None:
    items = [
        {
            "surface_jp": "AAA/BBB",  # 2 jp parts
            "surface_zh": "甲/乙/丙",  # 3 zh parts — mismatch
            "surface_en": "X/Y/Z",
            "kana_helper": None,
            "aliases_jp": [],
        }
    ]
    out, warns = split_multi_concept_items(items)
    # Original preserved verbatim; no synthetic split entries injected.
    assert out == items
    assert len(warns) == 1
    assert warns[0]["surface_jp"] == "AAA/BBB"
    assert "jp=2" in warns[0]["reason"]
    assert "zh=3" in warns[0]["reason"]


def test_split_recognizes_every_documented_separator() -> None:
    # All 6 separators per D-080 §2.1: /  →  ,  、  ；  ;
    raw = [
        ("A/B", "甲/乙", "X/Y"),
        ("A→B", "甲→乙", "X→Y"),
        ("A,B", "甲,乙", "X,Y"),
        ("A、B", "甲、乙", "X、Y"),
        ("A；B", "甲；乙", "X；Y"),
        ("A;B", "甲;乙", "X;Y"),
    ]
    items = [
        {"surface_jp": j, "surface_zh": z, "surface_en": e, "kana_helper": None, "aliases_jp": []}
        for j, z, e in raw
    ]
    out, warns = split_multi_concept_items(items)
    assert warns == []
    assert len(out) == 12  # 6 items × 2 parts each
    assert [o["surface_jp"] for o in out] == ["A", "B"] * 6


def test_extractor_splits_then_backfills_kana_helper_end_to_end() -> None:
    # Multi-concept entry whose split surfaces are BOTH all-katakana — verifies
    # split runs before scan_katakana_terms_for_backfill so each split gets
    # its own kana_helper (auto_backfill=True).
    fake = _FakeClient(
        [
            '[{"surface_jp":"アルゴリズム/フローチャート",'
            '"surface_zh":"算法/流程图",'
            '"surface_en":"Algorithm/Flowchart",'
            '"kana_helper":null,"aliases_jp":[]}]'
        ]
    )
    ex = GlossaryExtractor(client=fake, cert_id="itpassport_r6", run_id="r1", tier="sonnet")  # type: ignore[arg-type]
    result = ex.extract([HarvestedTerm("アルゴリズム/フローチャート", 50)])
    assert result.concept_split_warns == []
    assert len(result.glossary.entries) == 2
    surfaces = sorted(e.surface.jp for e in result.glossary.entries)
    assert surfaces == ["アルゴリズム", "フローチャート"]
    # Both splits independently get auto_backfill=True.
    for entry in result.glossary.entries:
        assert entry.kana_helper is not None
        assert entry.kana_helper.auto_backfill is True
        assert entry.kana_helper.surface == entry.surface.jp
