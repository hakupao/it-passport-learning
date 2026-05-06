"""Unit tests for cert_extractor.llm.claude_client.

We monkeypatch the module-level ``query`` to a fake async generator so the
real CLI subprocess never spawns. This isolates the wrapper's contract:
collect text, sum tokens, surface cost, and pick the right model id.
"""
from __future__ import annotations

import dataclasses
from typing import AsyncIterator

import pytest

from cert_extractor.llm import claude_client as cc

pytestmark = pytest.mark.unit


@dataclasses.dataclass
class _FakeTextBlock:
    text: str


@dataclasses.dataclass
class _FakeAssistantMessage:
    content: list[_FakeTextBlock]


@dataclasses.dataclass
class _FakeResultMessage:
    total_cost_usd: float
    usage: dict
    stop_reason: str = "end_turn"
    result: str | None = None


def _make_async_gen(messages: list[object]):
    async def _gen(*args, **kwargs) -> AsyncIterator[object]:
        for m in messages:
            yield m

    return _gen


def test_call_collects_assistant_text(monkeypatch: pytest.MonkeyPatch) -> None:
    fake_messages = [
        _FakeAssistantMessage(content=[_FakeTextBlock(text="hel"), _FakeTextBlock(text="lo")]),
        _FakeResultMessage(total_cost_usd=0.0, usage={"input_tokens": 7, "output_tokens": 3}),
    ]
    monkeypatch.setattr(cc, "AssistantMessage", _FakeAssistantMessage)
    monkeypatch.setattr(cc, "TextBlock", _FakeTextBlock)
    monkeypatch.setattr(cc, "ResultMessage", _FakeResultMessage)
    monkeypatch.setattr(cc, "query", _make_async_gen(fake_messages))

    client = cc.ClaudeClient()
    out = client.call(system="sys", user="hi")

    assert out.text == "hello"
    assert out.tokens_input == 7
    assert out.tokens_output == 3
    assert out.cost_usd == 0.0
    assert out.stop_reason == "end_turn"


def test_call_falls_back_to_result_text(monkeypatch: pytest.MonkeyPatch) -> None:
    """If the SDK only emits ResultMessage.result and no AssistantMessage, use it."""
    fake_messages = [
        _FakeResultMessage(
            total_cost_usd=0.123,
            usage={"input_tokens": 100, "output_tokens": 20},
            result="final-answer",
        ),
    ]
    monkeypatch.setattr(cc, "AssistantMessage", _FakeAssistantMessage)
    monkeypatch.setattr(cc, "TextBlock", _FakeTextBlock)
    monkeypatch.setattr(cc, "ResultMessage", _FakeResultMessage)
    monkeypatch.setattr(cc, "query", _make_async_gen(fake_messages))

    out = cc.ClaudeClient().call(system="s", user="u")
    assert out.text == "final-answer"
    assert out.cost_usd == pytest.approx(0.123)
    assert out.tokens_input == 100
    assert out.tokens_output == 20


def test_resolve_model_handles_tier_and_full_id() -> None:
    assert cc._resolve_model("sonnet") == "claude-sonnet-4-6"
    assert cc._resolve_model("opus") == "claude-opus-4-7"
    assert cc._resolve_model("haiku") == "claude-haiku-4-5"
    # Unknown string is treated as a literal model id (forward-compat).
    assert cc._resolve_model("claude-future-9-9") == "claude-future-9-9"


def test_build_options_sets_required_fields() -> None:
    client = cc.ClaudeClient(max_budget_usd=12.5)
    opts = client._build_options(system="be helpful", model="claude-sonnet-4-6")
    assert opts.system_prompt == "be helpful"
    assert opts.model == "claude-sonnet-4-6"
    assert opts.max_turns == 1
    assert opts.allowed_tools == []
    assert opts.max_budget_usd == 12.5


def test_build_options_omits_budget_when_unset() -> None:
    """No max_budget_usd means the SDK default applies (per D-069 §2.5)."""
    client = cc.ClaudeClient()
    opts = client._build_options(system="x", model="claude-sonnet-4-6")
    # max_budget_usd is None / unset on the dataclass — both are OK.
    assert opts.max_budget_usd is None or opts.max_budget_usd == 0


def test_extract_usage_handles_dict_attr_and_none() -> None:
    assert cc._extract_usage(None) == (0, 0)
    assert cc._extract_usage({"input_tokens": 5, "output_tokens": 9}) == (5, 9)

    class _U:
        input_tokens = 11
        output_tokens = 22

    assert cc._extract_usage(_U()) == (11, 22)
