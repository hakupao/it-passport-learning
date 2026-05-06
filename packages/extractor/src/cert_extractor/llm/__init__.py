"""LLM client wrappers (per D-069).

Phase 1 ships a single sync wrapper around `claude-agent-sdk` so the
synchronous pipeline runners can call Claude without managing asyncio
event loops themselves.
"""
