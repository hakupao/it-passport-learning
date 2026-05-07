"""Stage 6 Phase 2 LLM reviewer engine (D-077 §2.1 + §2.2).

Per page, the engine sub-batches the page's entities (default chunk_size
= 4) and dispatches one LLM call per chunk. Each LLM call emits a JSON
array of issues; the engine validates each issue, derives the canonical
``severity / dimension / repair_stage`` from the closed-enum tables in
``schema.py`` (LLM-emitted severity is ignored — Python is the source of
truth), and constructs ``Stage6Issue`` records.

Parse failures and unknown ``issue_type`` values are archived to the
result's ``skipped`` list rather than aborting the page; the runner
treats this as a soft failure (see D-077 §2.8).
"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from typing import Any

from cert_extractor.llm.claude_client import ClaudeClient, ClaudeResponse, ModelTier
from cert_extractor.pipeline.stage6_audit.prompts import (
    REVIEWER_PROMPT_VERSION,
    REVIEWER_SYSTEM_PROMPT_V1,
    USER_PROMPT_TEMPLATE,
)
from cert_extractor.pipeline.stage6_audit.schema import (
    DIMENSION_BY_ISSUE_TYPE,
    REPAIR_STAGE_BY_ISSUE_TYPE,
    Stage6Issue,
    Stage6IssueDetector,
    Stage6IssueSeverity,
)
from cert_extractor.schema.glossary import Glossary

# LLM-emitted issue_type → derived severity (Python is the source of truth).
_LLM_ISSUE_TYPE_TO_SEVERITY: dict[str, Stage6IssueSeverity] = {
    "translation_hallucination": Stage6IssueSeverity.FAIL,
    "translation_omission": Stage6IssueSeverity.FAIL,
    "translation_unfaithful": Stage6IssueSeverity.WARN,
    "term_translation_idiomatic": Stage6IssueSeverity.INFO,
}

_KNOWN_LLM_ISSUE_TYPES: frozenset[str] = frozenset(_LLM_ISSUE_TYPE_TO_SEVERITY)

_JSON_ARRAY_RE = re.compile(r"\[.*\]", re.DOTALL)


@dataclass
class ReviewerCallResult:
    """Aggregated outcome of all sub-batch calls for one page."""

    issues: list[Stage6Issue] = field(default_factory=list)
    responses: list[ClaudeResponse] = field(default_factory=list)
    skipped: list[tuple[int, str]] = field(default_factory=list)
    raw_outputs: list[str] = field(default_factory=list)


def parse_review_response(raw: str) -> list[dict] | None:
    """Tolerantly parse the reviewer's JSON-array output. Returns the list
    on success; ``None`` if the text is not parseable as a JSON array."""
    text = raw.strip()
    if text.startswith("```"):
        text = "\n".join(line for line in text.splitlines() if not line.startswith("```"))
    if text.strip() == "[]":
        return []
    match = _JSON_ARRAY_RE.search(text)
    if match is None:
        return None
    try:
        payload = json.loads(match.group(0))
    except json.JSONDecodeError:
        return None
    if not isinstance(payload, list):
        return None
    return [item for item in payload if isinstance(item, dict)]


def filter_glossary_slice(
    glossary: Glossary,
    translated_entities: list[dict],
) -> list[dict]:
    """Return glossary entries whose key (canonical jp or any alias) appears
    as a substring in any jp leaf of ``translated_entities``. Returned items
    are pure-dict serialized form (jp/zh/en/aliases) for the prompt."""

    # Collect all jp text from the entities being reviewed.
    jp_texts: list[str] = []

    def _collect_jp(node: Any) -> None:
        if (
            isinstance(node, dict)
            and "jp" in node
            and "zh" in node
            and "en" in node
            and len(node) == 3
        ):
            jp_texts.append(str(node.get("jp", "")))
            return
        if isinstance(node, dict):
            for v in node.values():
                _collect_jp(v)
        elif isinstance(node, list):
            for v in node:
                _collect_jp(v)

    for entity in translated_entities:
        _collect_jp(entity)

    out: list[dict] = []
    seen_ids: set[str] = set()
    for entry in glossary.entries:
        if entry.id in seen_ids:
            continue
        keys = [entry.surface.jp, *entry.aliases_jp]
        if any(k in text for k in keys for text in jp_texts):
            out.append(
                {
                    "id": entry.id,
                    "jp": entry.surface.jp,
                    "zh": entry.surface.zh,
                    "en": entry.surface.en,
                    "aliases_jp": entry.aliases_jp,
                }
            )
            seen_ids.add(entry.id)
    return out


@dataclass
class ReviewerEngine:
    """LLM-driven Phase 2 reviewer.

    Each ``review_page`` call dispatches one LLM call per chunk of
    ``chunk_size`` entities (default 4 per D-077 §2.2).
    """

    client: ClaudeClient
    tier: ModelTier | str = "opus"
    chunk_size: int = 4
    prompt_version: str = REVIEWER_PROMPT_VERSION

    def review_page(
        self,
        *,
        page: int,
        structured_entities: list[dict],
        translated_entities: list[dict],
        glossary: Glossary,
        cleaned_text: str | None,
    ) -> ReviewerCallResult:
        result = ReviewerCallResult()
        if not translated_entities:
            return result

        chunk_size = max(1, self.chunk_size)
        excerpt = cleaned_text or "(no source excerpt available)"

        for sub_idx, start in enumerate(range(0, len(translated_entities), chunk_size)):
            chunk_indices = list(range(start, min(start + chunk_size, len(translated_entities))))
            sub_entities = self._build_sub_batch(
                chunk_indices, structured_entities, translated_entities
            )
            glossary_slice = filter_glossary_slice(
                glossary, [translated_entities[i] for i in chunk_indices]
            )

            user = USER_PROMPT_TEMPLATE.format(
                page=page,
                n=len(chunk_indices),
                entities_json=json.dumps(sub_entities, ensure_ascii=False),
                glossary_count=len(glossary_slice),
                glossary_json=json.dumps(glossary_slice, ensure_ascii=False),
                cleaned_excerpt=excerpt,
            )
            response = self.client.call(
                system=REVIEWER_SYSTEM_PROMPT_V1, user=user, tier=self.tier
            )
            result.responses.append(response)
            result.raw_outputs.append(response.text)

            parsed = parse_review_response(response.text)
            if parsed is None:
                result.skipped.append(
                    (sub_idx, f"unparseable JSON: {response.text[:200]!r}")
                )
                continue

            for raw_item in parsed:
                issue_or_err = self._convert_to_issue(
                    raw_item=raw_item,
                    page=page,
                    chunk_indices=chunk_indices,
                )
                if isinstance(issue_or_err, Stage6Issue):
                    result.issues.append(issue_or_err)
                else:
                    result.skipped.append((sub_idx, issue_or_err))

        return result

    @staticmethod
    def _build_sub_batch(
        chunk_indices: list[int],
        structured_entities: list[dict],
        translated_entities: list[dict],
    ) -> list[dict]:
        sub: list[dict] = []
        for sub_idx, page_idx in enumerate(chunk_indices):
            structured = (
                structured_entities[page_idx]
                if page_idx < len(structured_entities)
                else {}
            )
            translated = translated_entities[page_idx]
            sub.append(
                {
                    "entity_index": sub_idx,
                    "page_entity_index": page_idx,
                    "structured": _strip_translations_to_jp(structured),
                    "translated": translated,
                }
            )
        return sub

    def _convert_to_issue(
        self,
        *,
        raw_item: dict,
        page: int,
        chunk_indices: list[int],
    ) -> Stage6Issue | str:
        """Validate one LLM-emitted item; return Stage6Issue or an error
        message string (caught by the caller for `skipped` logging)."""
        issue_type = raw_item.get("issue_type")
        if issue_type not in _KNOWN_LLM_ISSUE_TYPES:
            return f"unknown issue_type: {issue_type!r}"

        page_entity_index = raw_item.get("page_entity_index")
        if (
            not isinstance(page_entity_index, int)
            or page_entity_index not in chunk_indices
        ):
            return (
                f"page_entity_index {page_entity_index!r} not in sub_batch "
                f"{chunk_indices!r}"
            )

        sub_path = raw_item.get("sub_path", "")
        if not isinstance(sub_path, str):
            sub_path = ""
        entity_path = f"page_{page:03d}.entities[{page_entity_index}]"
        if sub_path:
            sep = "" if sub_path.startswith(("[", ".")) else "."
            entity_path += sep + sub_path

        evidence: dict[str, str] = {}
        for key in ("evidence_jp", "evidence_zh", "evidence_en"):
            val = raw_item.get(key)
            if isinstance(val, str):
                evidence[key] = val
        for key in ("proposed_zh", "proposed_en"):
            val = raw_item.get(key)
            if isinstance(val, str) and val:
                evidence[key] = val

        rationale = raw_item.get("rationale")
        if not isinstance(rationale, str) or not rationale:
            rationale = "(no rationale provided)"

        confidence = raw_item.get("confidence")
        if not isinstance(confidence, (int, float)):
            confidence = None
        else:
            confidence = max(0.0, min(1.0, float(confidence)))

        proposed_fix: str | None = None
        proposed_zh = raw_item.get("proposed_zh")
        proposed_en = raw_item.get("proposed_en")
        if isinstance(proposed_zh, str) and proposed_zh:
            proposed_fix = (
                f"zh: {proposed_zh}"
                + (f"; en: {proposed_en}" if isinstance(proposed_en, str) and proposed_en else "")
            )
        elif isinstance(proposed_en, str) and proposed_en:
            proposed_fix = f"en: {proposed_en}"

        try:
            return Stage6Issue(
                id=f"L-page_{page:03d}-{page_entity_index:03d}-{issue_type[:4]}-{len(evidence)}",
                issue_type=issue_type,
                severity=_LLM_ISSUE_TYPE_TO_SEVERITY[issue_type],
                dimension=DIMENSION_BY_ISSUE_TYPE[issue_type],
                repair_stage=REPAIR_STAGE_BY_ISSUE_TYPE[issue_type],
                detector=Stage6IssueDetector.llm,
                entity_path=entity_path,
                evidence=evidence,
                rationale=rationale,
                proposed_fix=proposed_fix,
                detector_confidence=confidence,
            )
        except Exception as exc:  # pragma: no cover — schema mismatch edge
            return f"Stage6Issue construction failed: {type(exc).__name__}: {exc}"


def _strip_translations_to_jp(structured: dict) -> dict:
    """Return a shallow copy of ``structured`` where every Trilingual leaf
    keeps only ``jp`` (drops zh/en sentinel noise so the prompt stays
    focused on the source language)."""

    def _strip(node: Any) -> Any:
        if (
            isinstance(node, dict)
            and "jp" in node
            and "zh" in node
            and "en" in node
            and len(node) == 3
        ):
            return {"jp": node["jp"]}
        if isinstance(node, dict):
            return {k: _strip(v) for k, v in node.items()}
        if isinstance(node, list):
            return [_strip(item) for item in node]
        return node

    return _strip(structured) if isinstance(structured, dict) else structured


def make_reviewer_factory(
    tier: ModelTier | str = "opus",
    chunk_size: int = 4,
    max_budget_usd: float | None = None,
):
    def _factory() -> ReviewerEngine:
        client = ClaudeClient(max_budget_usd=max_budget_usd)
        return ReviewerEngine(client=client, tier=tier, chunk_size=chunk_size)

    return _factory
