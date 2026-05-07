"""Unit tests for Stage 6 Phase 2 LLM reviewer engine (D-077 §2.1 + §2.2)."""
from __future__ import annotations

import json

from cert_extractor.llm.claude_client import ClaudeResponse
from cert_extractor.pipeline.stage6_audit.reviewer import (
    ReviewerEngine,
    filter_glossary_slice,
    parse_review_response,
)
from cert_extractor.pipeline.stage6_audit.schema import (
    Stage6IssueDetector,
    Stage6IssueDimension,
    Stage6IssueSeverity,
)
from cert_extractor.schema.common import Trilingual
from cert_extractor.schema.glossary import Glossary, GlossaryEntry

# ---------------------------------------------------------------------------
# Fixtures + Fakes
# ---------------------------------------------------------------------------


def _trl(jp: str, zh: str, en: str) -> dict:
    return {"jp": jp, "zh": zh, "en": en}


def _term(*, id_: str, page: int, jp: str, zh: str, en: str) -> dict:
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
        "kana_helper": None,
    }


def _glossary(*entries: GlossaryEntry) -> Glossary:
    return Glossary(cert_id="itpassport_r6", run_id="test_run", entries=list(entries))


def _entry(
    *,
    id_: str,
    jp: str,
    zh: str,
    en: str,
    aliases_jp: list[str] | None = None,
) -> GlossaryEntry:
    return GlossaryEntry(
        id=id_,
        surface=Trilingual(jp=jp, zh=zh, en=en),
        first_page=1,
        occurrences=[1],
        aliases_jp=aliases_jp or [],
    )


class _FakeClient:
    """Mirrors stage5 _FakeClient. ``responses`` is a queue popped FIFO."""

    def __init__(self, responses: list[str]):
        self._responses = list(responses)
        self.calls: list[dict] = []

    def call(self, *, system: str, user: str, tier=None, **kwargs):
        self.calls.append({"system": system, "user": user, "tier": tier, **kwargs})
        text = self._responses.pop(0) if self._responses else "[]"
        return ClaudeResponse(
            text=text, tokens_input=1000, tokens_output=200, cost_usd=0.05
        )


def _llm_issue(
    *,
    page_entity_index: int,
    issue_type: str,
    sub_path: str = "",
    rationale: str = "demo",
    confidence: float = 0.9,
    evidence_jp: str = "jp",
    evidence_zh: str = "zh",
    evidence_en: str = "en",
) -> dict:
    return {
        "page_entity_index": page_entity_index,
        "sub_path": sub_path,
        "issue_type": issue_type,
        "evidence_jp": evidence_jp,
        "evidence_zh": evidence_zh,
        "evidence_en": evidence_en,
        "rationale": rationale,
        "confidence": confidence,
    }


# ---------------------------------------------------------------------------
# parse_review_response
# ---------------------------------------------------------------------------


class TestParseReviewResponse:
    def test_empty_array(self):
        assert parse_review_response("[]") == []

    def test_with_items(self):
        raw = json.dumps([{"a": 1}, {"b": 2}])
        assert parse_review_response(raw) == [{"a": 1}, {"b": 2}]

    def test_with_code_fences_stripped(self):
        raw = "```json\n[{\"a\": 1}]\n```"
        assert parse_review_response(raw) == [{"a": 1}]

    def test_invalid_returns_none(self):
        assert parse_review_response("not json at all") is None

    def test_non_array_returns_none(self):
        assert parse_review_response('{"a": 1}') is None


# ---------------------------------------------------------------------------
# filter_glossary_slice
# ---------------------------------------------------------------------------


class TestFilterGlossarySlice:
    def test_includes_only_relevant_entries(self):
        glos = _glossary(
            _entry(id_="g_001", jp="CSR", zh="企业社会责任", en="CSR"),
            _entry(id_="g_002", jp="GDP", zh="国内生产总值", en="GDP"),
        )
        entities = [_term(id_="t1", page=14, jp="CSRの説明", zh="CSR 说明", en="CSR explanation")]
        out = filter_glossary_slice(glos, entities)
        ids = {e["id"] for e in out}
        assert ids == {"g_001"}

    def test_alias_match(self):
        glos = _glossary(
            _entry(
                id_="g_001",
                jp="CSR（企業の社会的責任）",
                zh="企业社会责任",
                en="CSR",
                aliases_jp=["CSR"],
            )
        )
        entities = [_term(id_="t1", page=14, jp="CSR", zh="z", en="e")]
        out = filter_glossary_slice(glos, entities)
        assert len(out) == 1
        assert out[0]["id"] == "g_001"

    def test_no_match_returns_empty(self):
        glos = _glossary(_entry(id_="g_001", jp="GDP", zh="国内生产总值", en="GDP"))
        entities = [_term(id_="t1", page=14, jp="CSR", zh="z", en="e")]
        assert filter_glossary_slice(glos, entities) == []


# ---------------------------------------------------------------------------
# ReviewerEngine.review_page
# ---------------------------------------------------------------------------


class TestReviewerEngine:
    def test_no_entities_returns_empty(self):
        eng = ReviewerEngine(client=_FakeClient([]), tier="opus")
        result = eng.review_page(
            page=14,
            structured_entities=[],
            translated_entities=[],
            glossary=_glossary(),
            cleaned_text="",
        )
        assert result.issues == []
        assert result.responses == []
        assert result.skipped == []

    def test_sub_batches_by_chunk_size(self):
        # 8 entities @ chunk_size=4 → 2 calls.
        entities = [_term(id_=f"t{i}", page=14, jp=f"jp{i}", zh="z", en="e") for i in range(8)]
        client = _FakeClient(["[]", "[]"])
        eng = ReviewerEngine(client=client, tier="opus", chunk_size=4)
        result = eng.review_page(
            page=14,
            structured_entities=entities,
            translated_entities=entities,
            glossary=_glossary(),
            cleaned_text="some text",
        )
        assert len(client.calls) == 2
        assert result.issues == []
        # Both responses captured for cost tracking.
        assert len(result.responses) == 2

    def test_parses_hallucination_into_fail_issue(self):
        entities = [_term(id_="t1", page=14, jp="A", zh="A中文", en="A english")]
        raw = json.dumps([
            _llm_issue(page_entity_index=0, issue_type="translation_hallucination"),
        ])
        eng = ReviewerEngine(client=_FakeClient([raw]), tier="opus")
        result = eng.review_page(
            page=14,
            structured_entities=entities,
            translated_entities=entities,
            glossary=_glossary(),
            cleaned_text="",
        )
        assert len(result.issues) == 1
        issue = result.issues[0]
        assert issue.issue_type == "translation_hallucination"
        assert issue.severity == Stage6IssueSeverity.FAIL
        assert issue.dimension == Stage6IssueDimension.fidelity
        assert issue.repair_stage == "5"
        assert issue.detector == Stage6IssueDetector.llm

    def test_parses_omission_into_fail(self):
        entities = [_term(id_="t1", page=14, jp="A", zh="b", en="c")]
        raw = json.dumps([
            _llm_issue(page_entity_index=0, issue_type="translation_omission"),
        ])
        eng = ReviewerEngine(client=_FakeClient([raw]), tier="opus")
        result = eng.review_page(
            page=14,
            structured_entities=entities,
            translated_entities=entities,
            glossary=_glossary(),
            cleaned_text="",
        )
        assert result.issues[0].severity == Stage6IssueSeverity.FAIL
        assert result.issues[0].issue_type == "translation_omission"

    def test_parses_unfaithful_into_warn(self):
        entities = [_term(id_="t1", page=14, jp="A", zh="b", en="c")]
        raw = json.dumps([
            _llm_issue(page_entity_index=0, issue_type="translation_unfaithful"),
        ])
        eng = ReviewerEngine(client=_FakeClient([raw]), tier="opus")
        result = eng.review_page(
            page=14,
            structured_entities=entities,
            translated_entities=entities,
            glossary=_glossary(),
            cleaned_text="",
        )
        assert result.issues[0].severity == Stage6IssueSeverity.WARN

    def test_parses_idiomatic_into_info(self):
        entities = [_term(id_="t1", page=14, jp="A", zh="b", en="c")]
        raw = json.dumps([
            _llm_issue(page_entity_index=0, issue_type="term_translation_idiomatic"),
        ])
        eng = ReviewerEngine(client=_FakeClient([raw]), tier="opus")
        result = eng.review_page(
            page=14,
            structured_entities=entities,
            translated_entities=entities,
            glossary=_glossary(),
            cleaned_text="",
        )
        assert result.issues[0].severity == Stage6IssueSeverity.INFO

    def test_unknown_issue_type_skipped(self):
        entities = [_term(id_="t1", page=14, jp="A", zh="b", en="c")]
        raw = json.dumps([
            _llm_issue(page_entity_index=0, issue_type="not_a_known_type"),
        ])
        eng = ReviewerEngine(client=_FakeClient([raw]), tier="opus")
        result = eng.review_page(
            page=14,
            structured_entities=entities,
            translated_entities=entities,
            glossary=_glossary(),
            cleaned_text="",
        )
        assert result.issues == []
        assert len(result.skipped) == 1
        assert "unknown issue_type" in result.skipped[0][1]

    def test_invalid_json_logged_in_skipped(self):
        entities = [_term(id_="t1", page=14, jp="A", zh="b", en="c")]
        eng = ReviewerEngine(client=_FakeClient(["this is not json"]), tier="opus")
        result = eng.review_page(
            page=14,
            structured_entities=entities,
            translated_entities=entities,
            glossary=_glossary(),
            cleaned_text="",
        )
        assert result.issues == []
        assert len(result.skipped) == 1
        assert "unparseable JSON" in result.skipped[0][1]

    def test_severity_overrides_llm_emitted_severity(self):
        # LLM tries to mark a hallucination as INFO — Python enforces FAIL.
        entities = [_term(id_="t1", page=14, jp="A", zh="b", en="c")]
        raw = json.dumps(
            [
                {
                    "page_entity_index": 0,
                    "sub_path": "definition",
                    "issue_type": "translation_hallucination",
                    "severity": "INFO",  # LLM trying to downgrade!
                    "evidence_jp": "x",
                    "evidence_zh": "y",
                    "evidence_en": "z",
                    "rationale": "r",
                    "confidence": 0.5,
                }
            ]
        )
        eng = ReviewerEngine(client=_FakeClient([raw]), tier="opus")
        result = eng.review_page(
            page=14,
            structured_entities=entities,
            translated_entities=entities,
            glossary=_glossary(),
            cleaned_text="",
        )
        assert result.issues[0].severity == Stage6IssueSeverity.FAIL

    def test_entity_path_built_from_sub_path(self):
        entities = [_term(id_="t1", page=43, jp="A", zh="b", en="c")]
        raw = json.dumps([
            _llm_issue(
                page_entity_index=0,
                issue_type="translation_unfaithful",
                sub_path="definition.zh",
            ),
        ])
        eng = ReviewerEngine(client=_FakeClient([raw]), tier="opus")
        result = eng.review_page(
            page=43,
            structured_entities=entities,
            translated_entities=entities,
            glossary=_glossary(),
            cleaned_text="",
        )
        assert result.issues[0].entity_path == "page_043.entities[0].definition.zh"

    def test_index_outside_subbatch_skipped(self):
        # 4 entities, sub_batch covers indices 0-3; LLM emits index 5.
        entities = [_term(id_=f"t{i}", page=14, jp=f"j{i}", zh="z", en="e") for i in range(4)]
        raw = json.dumps([
            _llm_issue(page_entity_index=5, issue_type="translation_unfaithful"),
        ])
        eng = ReviewerEngine(client=_FakeClient([raw]), tier="opus", chunk_size=4)
        result = eng.review_page(
            page=14,
            structured_entities=entities,
            translated_entities=entities,
            glossary=_glossary(),
            cleaned_text="",
        )
        assert result.issues == []
        assert len(result.skipped) == 1
        assert "page_entity_index" in result.skipped[0][1]

    def test_glossary_slice_passed_in_user_prompt(self):
        glos = _glossary(_entry(id_="g_001", jp="CSR", zh="企业社会责任", en="CSR"))
        entities = [_term(id_="t1", page=14, jp="CSRについて", zh="CSR 关于", en="about CSR")]
        client = _FakeClient(["[]"])
        eng = ReviewerEngine(client=client, tier="opus")
        eng.review_page(
            page=14,
            structured_entities=entities,
            translated_entities=entities,
            glossary=glos,
            cleaned_text="",
        )
        assert len(client.calls) == 1
        user_prompt = client.calls[0]["user"]
        assert "g_001" in user_prompt
        assert "企业社会责任" in user_prompt

    def test_sub_batch_strips_translations_in_structured(self):
        # Verify the system prompt only sees jp from the structured side.
        entities = [_term(id_="t1", page=14, jp="原語", zh="ZHHH", en="ENNN")]
        client = _FakeClient(["[]"])
        eng = ReviewerEngine(client=client, tier="opus")
        eng.review_page(
            page=14,
            structured_entities=entities,
            translated_entities=entities,
            glossary=_glossary(),
            cleaned_text="",
        )
        user_prompt = client.calls[0]["user"]
        # The structured payload inside the user prompt should NOT contain
        # the placeholder zh/en sentinels from `entities` — only the jp.
        # The translated payload still includes them.
        sub_idx = user_prompt.find('"structured":')
        translated_idx = user_prompt.find('"translated":')
        # Carve out a slice between structured and translated keys.
        between = user_prompt[sub_idx:translated_idx]
        assert "ZHHH" not in between
        assert "ENNN" not in between

    def test_tier_threaded_through(self):
        client = _FakeClient(["[]"])
        eng = ReviewerEngine(client=client, tier="opus")
        entities = [_term(id_="t1", page=14, jp="A", zh="b", en="c")]
        eng.review_page(
            page=14,
            structured_entities=entities,
            translated_entities=entities,
            glossary=_glossary(),
            cleaned_text="",
        )
        assert client.calls[0]["tier"] == "opus"
