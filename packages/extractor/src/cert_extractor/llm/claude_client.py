"""Sync wrapper over `claude-agent-sdk` (per D-069).

D-069 §2.1 — cert-extractor calls Claude **only** through this client; we do
not import the `anthropic` SDK directly. Auth follows SDK priority
(``ANTHROPIC_API_KEY`` env > ``CLAUDE_CODE_OAUTH_TOKEN`` env > ``.credentials``
file > macOS Keychain), so unsetting the API-key env var lets the user's
Claude Code OAuth (max plan) kick in for free per D-069 §2.4.

The wrapper exposes a synchronous ``call()`` that returns text + token usage +
cost in one shot. Pipeline runners stay sync; only this module touches the
asyncio event loop.

Tests mock the module-level ``query`` symbol so unit tests never spawn the
real CLI subprocess.
"""
from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import Literal

from claude_agent_sdk import (  # noqa: F401  — re-exported for monkeypatching
    AssistantMessage,
    ClaudeAgentOptions,
    ResultMessage,
    TextBlock,
    query,
)

ModelTier = Literal["haiku", "sonnet", "opus"]

# Per D-069 §2.3 — exact model IDs map to the cert-extractor reviewer tiers.
MODEL_ID_BY_TIER: dict[ModelTier, str] = {
    "haiku": "claude-haiku-4-5",
    "sonnet": "claude-sonnet-4-6",
    "opus": "claude-opus-4-7",
}

DEFAULT_MODEL_TIER: ModelTier = "sonnet"


@dataclass
class ClaudeResponse:
    """Bundled outcome of a single Claude call.

    ``cost_usd`` is reported by the SDK's ``ResultMessage.total_cost_usd`` and
    is what the cost tracker flushes to ``cost.json`` per D-072. Under max
    plan via OAuth this is reported as 0.0 by the SDK (per D-069 §3.1) — the
    field is kept so that switching to ``ANTHROPIC_API_KEY`` (per D-069 §2.4)
    starts attributing real spend with zero code changes.
    """

    text: str
    tokens_input: int = 0
    tokens_output: int = 0
    cost_usd: float = 0.0
    stop_reason: str | None = None


def _resolve_model(tier_or_id: ModelTier | str) -> str:
    """Map a tier short-name (``"sonnet"``) or full model id to a model id."""
    if tier_or_id in MODEL_ID_BY_TIER:
        return MODEL_ID_BY_TIER[tier_or_id]  # type: ignore[index]
    return tier_or_id


def _extract_usage(usage: object | None) -> tuple[int, int]:
    """Pull (input_tokens, output_tokens) out of the SDK usage payload."""
    if usage is None:
        return 0, 0
    # SDK exposes either a dict or a typed payload — be tolerant.
    if isinstance(usage, dict):
        return (
            int(usage.get("input_tokens", 0) or 0),
            int(usage.get("output_tokens", 0) or 0),
        )
    return (
        int(getattr(usage, "input_tokens", 0) or 0),
        int(getattr(usage, "output_tokens", 0) or 0),
    )


class ClaudeClient:
    """Sync wrapper over `claude-agent-sdk.query` (per D-069 §6).

    Construct once per pipeline run; pass the same instance to every stage so
    the SDK can keep its own connection pool warm across calls.
    """

    def __init__(
        self,
        default_tier: ModelTier = DEFAULT_MODEL_TIER,
        max_budget_usd: float | None = None,
    ):
        self.default_tier: ModelTier = default_tier
        self.max_budget_usd: float | None = max_budget_usd

    def _build_options(
        self,
        system: str,
        model: str,
    ) -> ClaudeAgentOptions:
        kwargs: dict = {
            "system_prompt": system,
            "model": model,
            "max_turns": 1,
            "allowed_tools": [],
            "permission_mode": "default",
        }
        if self.max_budget_usd is not None:
            kwargs["max_budget_usd"] = self.max_budget_usd
        return ClaudeAgentOptions(**kwargs)

    def call(
        self,
        system: str,
        user: str,
        tier: ModelTier | str | None = None,
    ) -> ClaudeResponse:
        """Run a one-shot Claude query and return text + cost.

        ``tier`` accepts the short tier name from D-061 (``"haiku" / "sonnet"
        / "opus"``) or a fully-qualified model id (``"claude-sonnet-4-6"``).
        """
        model = _resolve_model(tier or self.default_tier)
        options = self._build_options(system=system, model=model)
        return asyncio.run(_run_query(prompt=user, options=options))


async def _run_query(prompt: str, options: ClaudeAgentOptions) -> ClaudeResponse:
    """Iterate the SDK async stream and collapse it into a ClaudeResponse."""
    text_parts: list[str] = []
    tokens_input = 0
    tokens_output = 0
    cost_usd = 0.0
    stop_reason: str | None = None

    async for msg in query(prompt=prompt, options=options):
        if isinstance(msg, AssistantMessage):
            for block in msg.content or []:
                if isinstance(block, TextBlock):
                    text_parts.append(block.text)
        elif isinstance(msg, ResultMessage):
            cost_usd = float(getattr(msg, "total_cost_usd", 0.0) or 0.0)
            t_in, t_out = _extract_usage(getattr(msg, "usage", None))
            tokens_input += t_in
            tokens_output += t_out
            stop_reason = getattr(msg, "stop_reason", None)
            # Prefer ResultMessage.result if assistant produced no text blocks.
            result_text = getattr(msg, "result", None)
            if not text_parts and isinstance(result_text, str) and result_text:
                text_parts.append(result_text)

    return ClaudeResponse(
        text="".join(text_parts),
        tokens_input=tokens_input,
        tokens_output=tokens_output,
        cost_usd=cost_usd,
        stop_reason=stop_reason,
    )
