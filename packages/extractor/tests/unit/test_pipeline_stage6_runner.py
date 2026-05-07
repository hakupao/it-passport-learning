"""Unit tests for Stage 6 runner / orchestrator (D-077 §6.1 + §2.7 + §2.8)."""
from __future__ import annotations

import json
from pathlib import Path

from cert_extractor import UNTRANSLATED
from cert_extractor.audit.verdict import Verdict
from cert_extractor.budget.monitor import BudgetMonitor, CapLevels
from cert_extractor.llm.claude_client import ClaudeResponse
from cert_extractor.pipeline.stage6_audit.reviewer import ReviewerEngine
from cert_extractor.pipeline.stage6_audit.runner import Stage6Audit
from cert_extractor.pipeline.stage6_audit.schema import (
    Stage6RunSummary,
)
from cert_extractor.schema.common import KanaHelper, Trilingual
from cert_extractor.schema.glossary import Glossary, GlossaryEntry

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


def _trl(jp: str, zh: str, en: str) -> dict:
    return {"jp": jp, "zh": zh, "en": en}


def _term(*, id_: str, page: int, jp: str, zh: str, en: str, kana_helper=None) -> dict:
    return {
        "type": "term",
        "id": id_,
        "anchor": {
            "page": page,
            "block_id": f"page_{page:03d}_block_{id_}",
            "section_path": [],
        },
        "surface": _trl(jp, zh, en),
        "definition": _trl("定義", "定义", "definition"),
        "kana_helper": kana_helper,
    }


def _question(*, id_: str, page: int, answer_index: int = 0) -> dict:
    return {
        "type": "question",
        "id": id_,
        "anchor": {
            "page": page,
            "block_id": f"page_{page:03d}_block_{id_}",
            "section_path": [],
        },
        "stem": _trl("ステム", "题干", "stem"),
        "choices": [
            _trl("ア．a", "A. a", "A. a"),
            _trl("イ．b", "B. b", "B. b"),
            _trl("ウ．c", "C. c", "C. c"),
            _trl("エ．d", "D. d", "D. d"),
        ],
        "answer_index": answer_index,
    }


def _glossary(*entries: GlossaryEntry) -> Glossary:
    return Glossary(cert_id="itpassport_r6", run_id="test_run", entries=list(entries))


def _entry(*, id_: str, jp: str, zh: str, en: str, kana_helper=None) -> GlossaryEntry:
    return GlossaryEntry(
        id=id_,
        surface=Trilingual(jp=jp, zh=zh, en=en),
        kana_helper=kana_helper,
        first_page=1,
        occurrences=[1],
        aliases_jp=[],
    )


class _FakeClient:
    """Stub ClaudeClient for runner tests; same shape as Stage 5 _FakeClient."""

    def __init__(self, responses: list[str] | None = None):
        self._responses = list(responses or [])
        self.calls: list[dict] = []

    def call(self, *, system: str, user: str, tier=None, **kwargs):
        self.calls.append({"system": system, "user": user, "tier": tier, **kwargs})
        text = self._responses.pop(0) if self._responses else "[]"
        return ClaudeResponse(
            text=text, tokens_input=1000, tokens_output=200, cost_usd=0.05
        )


def _setup_run_dir(
    tmp_path: Path,
    *,
    structured: dict[int, list[dict]],
    translated: dict[int, list[dict]],
    glossary: Glossary,
    cleaned: dict[int, str] | None = None,
    ocr: dict[int, str] | None = None,
) -> dict:
    run_dir = tmp_path / "run"
    structured_dir = run_dir / "structured"
    translated_dir = run_dir / "translated"
    glossary_dir = run_dir / "glossary"
    cleaned_dir = run_dir / "cleaned"
    ocr_dir = run_dir / "ocr"

    for d in (structured_dir, translated_dir, glossary_dir, cleaned_dir, ocr_dir):
        d.mkdir(parents=True, exist_ok=True)

    for page, entities in structured.items():
        (structured_dir / f"page_{page:03d}.json").write_text(
            json.dumps(entities, ensure_ascii=False), encoding="utf-8"
        )
    for page, entities in translated.items():
        (translated_dir / f"page_{page:03d}.json").write_text(
            json.dumps(entities, ensure_ascii=False), encoding="utf-8"
        )
    glossary_path = glossary_dir / "glossary.json"
    glossary_path.write_text(glossary.model_dump_json(), encoding="utf-8")
    if cleaned:
        for page, text in cleaned.items():
            (cleaned_dir / f"page_{page:03d}.md").write_text(text, encoding="utf-8")
    if ocr:
        for page, text in ocr.items():
            (ocr_dir / f"page_{page:03d}.md").write_text(text, encoding="utf-8")

    return {
        "run_dir": run_dir,
        "structured_dir": structured_dir,
        "translated_dir": translated_dir,
        "glossary_path": glossary_path,
        "cleaned_dir": cleaned_dir,
        "ocr_dir": ocr_dir,
    }


def _make_audit(client: _FakeClient | None = None) -> Stage6Audit:
    client = client or _FakeClient()
    reviewer = ReviewerEngine(client=client, tier="opus", chunk_size=4)
    return Stage6Audit(
        reviewer=reviewer,
        monitor=BudgetMonitor(
            soft=CapLevels(wall_time_seconds=999_999, mistral_usd=999, anthropic_usd=999, fail_count=999),
            hard=CapLevels(wall_time_seconds=999_999, mistral_usd=999, anthropic_usd=999, fail_count=999),
        ),
    )


# ---------------------------------------------------------------------------
# Happy path
# ---------------------------------------------------------------------------


class TestCleanRun:
    def test_one_clean_page_pass(self, tmp_path: Path):
        glos = _glossary(
            _entry(id_="g_001", jp="CSR", zh="企业社会责任", en="CSR"),
        )
        s = [
            _term(
                id_="t1",
                page=14,
                jp="CSR",
                zh=UNTRANSLATED,
                en=UNTRANSLATED,
            )
        ]
        t = [
            _term(
                id_="t1",
                page=14,
                jp="CSR",
                zh="企业社会责任",
                en="CSR",
            )
        ]
        # Force def_jp to match between structured and translated.
        s[0]["definition"] = _trl("d", UNTRANSLATED, UNTRANSLATED)
        t[0]["definition"] = _trl("d", "d", "d")

        paths = _setup_run_dir(
            tmp_path, structured={14: s}, translated={14: t}, glossary=glos
        )
        audit = _make_audit(_FakeClient(["[]"]))
        result = audit.run(
            structured_dir=paths["structured_dir"],
            translated_dir=paths["translated_dir"],
            glossary_path=paths["glossary_path"],
            run_dir=paths["run_dir"],
            cert_id="itpassport_r6",
            run_id="test_run",
            cleaned_dir=paths["cleaned_dir"],
            ocr_dir=paths["ocr_dir"],
        )
        assert result.summary.overall_verdict == Verdict.PASS
        assert result.summary.pass_pages == 1
        assert result.pages_processed == 1
        assert result.halted_verdict is None

    def test_output_json_round_trips(self, tmp_path: Path):
        glos = _glossary(_entry(id_="g_001", jp="CSR", zh="企业社会责任", en="CSR"))
        s = [_term(id_="t1", page=14, jp="CSR", zh=UNTRANSLATED, en=UNTRANSLATED)]
        s[0]["definition"] = _trl("d", UNTRANSLATED, UNTRANSLATED)
        t = [_term(id_="t1", page=14, jp="CSR", zh="企业社会责任", en="CSR")]
        t[0]["definition"] = _trl("d", "d", "d")

        paths = _setup_run_dir(
            tmp_path, structured={14: s}, translated={14: t}, glossary=glos
        )
        audit = _make_audit(_FakeClient(["[]"]))
        result = audit.run(
            structured_dir=paths["structured_dir"],
            translated_dir=paths["translated_dir"],
            glossary_path=paths["glossary_path"],
            run_dir=paths["run_dir"],
            cert_id="itpassport_r6",
            run_id="test_run",
        )
        raw = Path(result.output_path).read_text(encoding="utf-8")
        summary = Stage6RunSummary.model_validate_json(raw)
        assert summary.overall_verdict == Verdict.PASS


# ---------------------------------------------------------------------------
# Halt strategy (D-077 §2.8)
# ---------------------------------------------------------------------------


class TestSafetyFieldHalt:
    def test_safety_fail_halts_after_current_page(self, tmp_path: Path):
        glos = _glossary()
        # Page 14: clean; Page 43: answer_index mismatch (safety FAIL).
        s_14 = [_term(id_="t1", page=14, jp="A", zh=UNTRANSLATED, en=UNTRANSLATED)]
        s_14[0]["definition"] = _trl("d", UNTRANSLATED, UNTRANSLATED)
        t_14 = [_term(id_="t1", page=14, jp="A", zh="a", en="a")]
        t_14[0]["definition"] = _trl("d", "d", "d")

        s_43 = [_question(id_="q1", page=43, answer_index=0)]
        t_43 = [_question(id_="q1", page=43, answer_index=0)]

        cleaned = {43: "問題1-5 ウ"}  # ウ = index 2; answer_index=0 → mismatch

        paths = _setup_run_dir(
            tmp_path,
            structured={14: s_14, 43: s_43},
            translated={14: t_14, 43: t_43},
            glossary=glos,
            cleaned=cleaned,
        )
        # Page 14 is processed first (sorted), then page 43 hits safety FAIL.
        # The safety FAIL on page 43 halts the run; in this case both pages
        # are seen because page 14 has no LLM-blocking issues.
        # We assert that overall_verdict is FAIL, halt_reason set.
        client = _FakeClient(["[]", "[]"])
        audit = _make_audit(client)
        result = audit.run(
            structured_dir=paths["structured_dir"],
            translated_dir=paths["translated_dir"],
            glossary_path=paths["glossary_path"],
            run_dir=paths["run_dir"],
            cert_id="itpassport_r6",
            run_id="test_run",
            cleaned_dir=paths["cleaned_dir"],
            ocr_dir=paths["ocr_dir"],
        )
        assert result.summary.overall_verdict == Verdict.FAIL
        assert result.summary.safety_failed is True
        assert result.halt_reason is not None
        assert "safety" in result.halt_reason.lower()
        assert result.summary.most_severe_repair_stage == "4"

    def test_safety_fail_on_first_page_skips_remaining(self, tmp_path: Path):
        glos = _glossary()
        # Page 14: safety FAIL; Page 15: should NOT be processed.
        s_14 = [_question(id_="q1", page=14, answer_index=0)]
        t_14 = [_question(id_="q1", page=14, answer_index=0)]
        s_15 = [_term(id_="t1", page=15, jp="X", zh=UNTRANSLATED, en=UNTRANSLATED)]
        s_15[0]["definition"] = _trl("d", UNTRANSLATED, UNTRANSLATED)
        t_15 = [_term(id_="t1", page=15, jp="X", zh="x", en="x")]
        t_15[0]["definition"] = _trl("d", "d", "d")

        cleaned = {14: "問題1-5 ウ"}  # mismatch on page 14

        paths = _setup_run_dir(
            tmp_path,
            structured={14: s_14, 15: s_15},
            translated={14: t_14, 15: t_15},
            glossary=glos,
            cleaned=cleaned,
        )
        client = _FakeClient(["[]"])
        audit = _make_audit(client)
        result = audit.run(
            structured_dir=paths["structured_dir"],
            translated_dir=paths["translated_dir"],
            glossary_path=paths["glossary_path"],
            run_dir=paths["run_dir"],
            cert_id="itpassport_r6",
            run_id="test_run",
            cleaned_dir=paths["cleaned_dir"],
            ocr_dir=paths["ocr_dir"],
        )
        # Only page 14 was processed; page 15 was skipped.
        assert result.pages_processed == 1
        assert {p.page for p in result.summary.pages} == {14}


# ---------------------------------------------------------------------------
# Phase 1 short-circuit
# ---------------------------------------------------------------------------


class TestPhase1ShortCircuit:
    def test_untranslated_residue_skips_phase2(self, tmp_path: Path):
        glos = _glossary()
        s = [_term(id_="t1", page=14, jp="A", zh=UNTRANSLATED, en=UNTRANSLATED)]
        s[0]["definition"] = _trl("d", UNTRANSLATED, UNTRANSLATED)
        # Translated still has UNTRANSLATED — D2 short-circuit.
        t = [_term(id_="t1", page=14, jp="A", zh=UNTRANSLATED, en="a")]
        t[0]["definition"] = _trl("d", "d", "d")

        paths = _setup_run_dir(
            tmp_path, structured={14: s}, translated={14: t}, glossary=glos
        )
        client = _FakeClient(["should_not_be_called"])
        audit = _make_audit(client)
        result = audit.run(
            structured_dir=paths["structured_dir"],
            translated_dir=paths["translated_dir"],
            glossary_path=paths["glossary_path"],
            run_dir=paths["run_dir"],
            cert_id="itpassport_r6",
            run_id="test_run",
        )
        assert client.calls == []  # Phase 2 NOT dispatched
        assert result.summary.fail_pages == 1

    def test_schema_invalid_skips_phase2(self, tmp_path: Path):
        glos = _glossary()
        s = [_term(id_="t1", page=14, jp="A", zh=UNTRANSLATED, en=UNTRANSLATED)]
        s[0]["definition"] = _trl("d", UNTRANSLATED, UNTRANSLATED)
        # Translated entity missing required field 'definition'.
        broken = {
            "type": "term",
            "id": "t1",
            "anchor": {
                "page": 14,
                "block_id": "p14_b1",
                "section_path": [],
            },
            "surface": _trl("A", "a", "a"),
            "kana_helper": None,
        }
        paths = _setup_run_dir(
            tmp_path,
            structured={14: s},
            translated={14: [broken]},
            glossary=glos,
        )
        client = _FakeClient([])
        audit = _make_audit(client)
        result = audit.run(
            structured_dir=paths["structured_dir"],
            translated_dir=paths["translated_dir"],
            glossary_path=paths["glossary_path"],
            run_dir=paths["run_dir"],
            cert_id="itpassport_r6",
            run_id="test_run",
        )
        assert client.calls == []  # Phase 2 NOT dispatched
        assert result.summary.fail_pages == 1


# ---------------------------------------------------------------------------
# Page filter / limit
# ---------------------------------------------------------------------------


class TestPageSelection:
    def _build_5_pages(self, tmp_path: Path) -> dict:
        glos = _glossary()
        structured = {}
        translated = {}
        for p in (14, 30, 38, 43, 45):
            t = [_term(id_=f"t{p}", page=p, jp="X", zh=UNTRANSLATED, en=UNTRANSLATED)]
            t[0]["definition"] = _trl("d", UNTRANSLATED, UNTRANSLATED)
            t2 = [_term(id_=f"t{p}", page=p, jp="X", zh="x", en="x")]
            t2[0]["definition"] = _trl("d", "d", "d")
            structured[p] = t
            translated[p] = t2
        return _setup_run_dir(
            tmp_path,
            structured=structured,
            translated=translated,
            glossary=glos,
        )

    def test_page_filter_subset(self, tmp_path: Path):
        paths = self._build_5_pages(tmp_path)
        client = _FakeClient(["[]"] * 5)
        audit = _make_audit(client)
        result = audit.run(
            structured_dir=paths["structured_dir"],
            translated_dir=paths["translated_dir"],
            glossary_path=paths["glossary_path"],
            run_dir=paths["run_dir"],
            cert_id="itpassport_r6",
            run_id="test_run",
            page_filter=[14, 43],
        )
        assert result.pages_processed == 2
        assert {p.page for p in result.summary.pages} == {14, 43}

    def test_page_limit_caps(self, tmp_path: Path):
        paths = self._build_5_pages(tmp_path)
        client = _FakeClient(["[]"] * 5)
        audit = _make_audit(client)
        result = audit.run(
            structured_dir=paths["structured_dir"],
            translated_dir=paths["translated_dir"],
            glossary_path=paths["glossary_path"],
            run_dir=paths["run_dir"],
            cert_id="itpassport_r6",
            run_id="test_run",
            page_limit=3,
        )
        assert result.pages_processed == 3


# ---------------------------------------------------------------------------
# Run-level (D13) glossary issues
# ---------------------------------------------------------------------------


class TestGlossaryRunLevel:
    def test_split_concept_emits_run_level_info(self, tmp_path: Path):
        glos = _glossary(
            _entry(
                id_="g_001",
                jp="グリーンIT",
                zh="绿色IT",
                en="Green IT",
                kana_helper=KanaHelper(
                    surface="グリーンIT",
                    reading="guriin ai tii",
                    zh_concept="绿色信息技术",
                ),
            )
        )
        s = [_term(id_="t1", page=14, jp="X", zh=UNTRANSLATED, en=UNTRANSLATED)]
        s[0]["definition"] = _trl("d", UNTRANSLATED, UNTRANSLATED)
        t = [_term(id_="t1", page=14, jp="X", zh="x", en="x")]
        t[0]["definition"] = _trl("d", "d", "d")
        paths = _setup_run_dir(
            tmp_path, structured={14: s}, translated={14: t}, glossary=glos
        )
        client = _FakeClient(["[]"])
        audit = _make_audit(client)
        result = audit.run(
            structured_dir=paths["structured_dir"],
            translated_dir=paths["translated_dir"],
            glossary_path=paths["glossary_path"],
            run_dir=paths["run_dir"],
            cert_id="itpassport_r6",
            run_id="test_run",
        )
        rli = result.summary.run_level_issues
        assert any(i.issue_type == "glossary_surface_concept_split" for i in rli)
        # INFO does NOT push overall to FAIL.
        assert result.summary.overall_verdict == Verdict.PASS


# ---------------------------------------------------------------------------
# Cost tracking
# ---------------------------------------------------------------------------


class TestCostTracking:
    def test_cost_json_has_stage_6_entry(self, tmp_path: Path):
        glos = _glossary()
        s = [_term(id_="t1", page=14, jp="A", zh=UNTRANSLATED, en=UNTRANSLATED)]
        s[0]["definition"] = _trl("d", UNTRANSLATED, UNTRANSLATED)
        t = [_term(id_="t1", page=14, jp="A", zh="a", en="a")]
        t[0]["definition"] = _trl("d", "d", "d")
        paths = _setup_run_dir(
            tmp_path, structured={14: s}, translated={14: t}, glossary=glos
        )
        client = _FakeClient(["[]"])
        audit = _make_audit(client)
        result = audit.run(
            structured_dir=paths["structured_dir"],
            translated_dir=paths["translated_dir"],
            glossary_path=paths["glossary_path"],
            run_dir=paths["run_dir"],
            cert_id="itpassport_r6",
            run_id="test_run",
        )
        cost = json.loads(Path(result.cost_path).read_text(encoding="utf-8"))
        assert "by_stage" in cost
        assert "6" in cost["by_stage"]
        assert cost["by_stage"]["6"]["calls"] >= 1


# ---------------------------------------------------------------------------
# D5 ground-truth source resolution
# ---------------------------------------------------------------------------


class TestSourceResolution:
    def test_ocr_dir_used_when_cleaned_missing(self, tmp_path: Path):
        glos = _glossary()
        s = [_question(id_="q1", page=43, answer_index=2)]
        t = [_question(id_="q1", page=43, answer_index=2)]
        # cleaned/ does not contain page 43; ocr/ does.
        paths = _setup_run_dir(
            tmp_path,
            structured={43: s},
            translated={43: t},
            glossary=glos,
            cleaned={},
            ocr={43: "問題1-5 ウ"},  # ウ = 2 (matches answer_index)
        )
        client = _FakeClient(["[]"])
        audit = _make_audit(client)
        result = audit.run(
            structured_dir=paths["structured_dir"],
            translated_dir=paths["translated_dir"],
            glossary_path=paths["glossary_path"],
            run_dir=paths["run_dir"],
            cert_id="itpassport_r6",
            run_id="test_run",
            cleaned_dir=paths["cleaned_dir"],
            ocr_dir=paths["ocr_dir"],
        )
        assert result.summary.overall_verdict == Verdict.PASS
