"""Stage 5 trilingual translation (per D-008 + D-055 + D-012).

Reads each `structured/page_*.json`, walks every `Trilingual` leaf where
``zh`` / ``en`` are still the ``UNTRANSLATED`` sentinel, and asks Claude
to fill them in — with the locked Stage 4.5 glossary supplied as a
translation memory the model **must** honor for any matching jp surface.

Per-page batching: a single LLM call per page handles all that page's
Trilingual fields in one round-trip, amortizing the
~5s-per-call subprocess overhead. The 40-page dry-run is therefore ~40
LLM calls instead of ~500 inline calls.

Glossary precedence (per D-008 §"glossary 锁定 在翻译前!"):

1. Build a lookup from `glossary.by_jp_surface()` (canonical jp + aliases).
2. Before any LLM call, resolve every request whose ``jp`` exactly
   matches a glossary key — those return the locked Trilingual without
   hitting the model.
3. The remaining requests (definitions, stems, captions, etc.) are
   batched and sent to Claude with the glossary serialized into the
   system prompt as a hard constraint.

Output: `translated/page_*.json` mirrors `structured/page_*.json` but
every `Trilingual` field has real `zh` and `en` values. Stage 7 export
will refuse to emit any envelope still containing the sentinel.

This module is **scaffold-only** in Session 08 — wired and unit-tested
but no LLM call fired. Session 09 starts here.
"""
from __future__ import annotations

import json
import re
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from cert_extractor import UNTRANSLATED
from cert_extractor.audit.verdict import Verdict
from cert_extractor.budget.cost import CostTracker
from cert_extractor.budget.monitor import BudgetMonitor
from cert_extractor.llm.claude_client import ClaudeClient, ClaudeResponse, ModelTier
from cert_extractor.schema.common import Trilingual
from cert_extractor.schema.glossary import Glossary, GlossaryEntry

STAGE_ID = 5

TRANSLATE_SYSTEM_PROMPT_TEMPLATE = """\
You are a Japanese-to-trilingual translation engine for the IT パスポート
(IT Passport) certification exam content factory. You translate one
batch of Japanese strings at a time, returning Chinese (Simplified) and
English for each, in input order.

## Locked glossary (you MUST honor)

The following Japanese surfaces have locked translations. If any of these
surfaces appears verbatim inside a string you are translating, render it
EXACTLY as the locked translation in the corresponding language; do NOT
paraphrase or re-translate the locked surface. Stand-alone strings that
are themselves a locked surface must return the locked Trilingual
verbatim.

```json
{glossary_json}
```

## Task

You will receive a JSON array of input strings. For each string, return:

```json
{{"jp": "<echo of input>", "zh": "<Chinese (Simplified)>", "en": "<English>"}}
```

## Rules

- Translate the meaning faithfully; preserve numerals, punctuation, and
  parenthetical asides like "(平成21年度)".
- For technical terms not in the glossary, use the standard textbook
  translation. Do NOT invent novel terms.
- Both `zh` and `en` must be non-empty strings. If a string is purely
  symbolic / a placeholder, return the same string in all three fields.
- Output ONLY the JSON array on one line. No preamble, no commentary,
  no code fences.
- **ALWAYS return a complete trilingual rendering for every input.**
  The glossary lock above tells you HOW to render locked surfaces
  within your output, NOT whether to translate. If an input string
  contains a locked surface as a substring (or a near-synonym of one),
  translate the rest of the string normally in zh + en and substitute
  the locked translation only for the locked substring itself. NEVER
  return an empty `zh` or `en`, and NEVER omit an item from the output
  array, just because a glossary surface appears in the input. The
  wrapper definition / sentence is itself the translation target.
"""

USER_PROMPT_TEMPLATE = """\
page_number: {page_number}
batch_size: {n}

inputs:
{batch_json}
"""


@dataclass(frozen=True)
class FieldPath:
    """A typed pointer to a Trilingual leaf inside a list of entity dicts."""

    entity_index: int
    keys: tuple[Any, ...]  # mix of str / int — see _walk_for_paths


@dataclass
class TranslationRequest:
    """One jp string awaiting its trilingual rendering."""

    jp: str
    path: FieldPath


@dataclass
class TranslationBatchResult:
    """Outcome of one page's translation (pre-glossary resolution included).

    A page may dispatch multiple sub-batch LLM calls when the unresolved
    item count exceeds ``TranslationEngine.max_items_per_call``; each call
    appends a ``ClaudeResponse`` to ``responses``. ``llm_requests`` equals
    ``len(responses)``.
    """

    trilinguals: dict[FieldPath, Trilingual]
    glossary_hits: int
    llm_requests: int
    responses: list[ClaudeResponse] = field(default_factory=list)
    skipped: list[tuple[TranslationRequest, str]] = field(default_factory=list)


def _walk_for_paths(entities: list[dict]) -> list[TranslationRequest]:
    """Walk a list of entity dicts and collect every Trilingual leaf
    that still has the UNTRANSLATED sentinel in ``zh`` or ``en``.

    A "Trilingual leaf" is any dict that has the three keys ``jp``,
    ``zh``, ``en`` — regardless of whether other Trilingual leaves are
    nested inside (e.g. Question.choices is a list of Trilingual).
    """
    out: list[TranslationRequest] = []

    def _is_trilingual(node: Any) -> bool:
        return (
            isinstance(node, dict)
            and "jp" in node
            and "zh" in node
            and "en" in node
            and len(node) == 3
        )

    def _descend(node: Any, ent_idx: int, path: list[Any]) -> None:
        if _is_trilingual(node):
            jp = node.get("jp")
            zh = node.get("zh")
            en = node.get("en")
            if isinstance(jp, str) and (zh == UNTRANSLATED or en == UNTRANSLATED):
                out.append(
                    TranslationRequest(
                        jp=jp,
                        path=FieldPath(entity_index=ent_idx, keys=tuple(path)),
                    )
                )
            return
        if isinstance(node, dict):
            for k, v in node.items():
                _descend(v, ent_idx, [*path, k])
        elif isinstance(node, list):
            for i, child in enumerate(node):
                _descend(child, ent_idx, [*path, i])

    for idx, entity in enumerate(entities):
        _descend(entity, idx, [])
    return out


def _apply(entities: list[dict], path: FieldPath, value: Trilingual) -> None:
    """Replace the Trilingual leaf at ``path`` in-place."""
    cursor: Any = entities[path.entity_index]
    for k in path.keys[:-1]:
        cursor = cursor[k]
    last = path.keys[-1]
    cursor[last] = {"jp": value.jp, "zh": value.zh, "en": value.en}


def _glossary_lookup(jp: str, lookup: dict[str, GlossaryEntry]) -> Trilingual | None:
    """Stand-alone glossary hit only. Definitions / stems / captions
    are sent to the LLM with the glossary in the prompt; we don't try
    to do mid-string substitution here."""
    entry = lookup.get(jp)
    if entry is None:
        return None
    return entry.surface


_JSON_ARRAY_RE = re.compile(r"\[.*\]", re.DOTALL)


def parse_translation_response(raw: str, n: int) -> list[dict]:
    """Tolerantly parse the LLM JSON array; the caller validates length."""
    text = raw.strip()
    if text.startswith("```"):
        text = "\n".join(line for line in text.splitlines() if not line.startswith("```"))
    match = _JSON_ARRAY_RE.search(text)
    if match is None:
        return []
    try:
        payload = json.loads(match.group(0))
    except json.JSONDecodeError:
        return []
    if not isinstance(payload, list):
        return []
    return [item for item in payload if isinstance(item, dict)]


def _glossary_to_prompt_subset(lookup: dict[str, GlossaryEntry]) -> str:
    """Serialize a compact glossary subset for the system prompt.

    We emit the canonical form only (no aliases, no kana_helper, no
    page metadata) so the prompt fits in budget even for large
    glossaries. Aliases are still resolved client-side via lookup
    before the LLM is called.
    """
    seen: set[str] = set()
    rows: list[dict[str, str]] = []
    for entry in lookup.values():
        if entry.id in seen:
            continue
        seen.add(entry.id)
        rows.append(
            {
                "jp": entry.surface.jp,
                "zh": entry.surface.zh,
                "en": entry.surface.en,
            }
        )
    return json.dumps(rows, ensure_ascii=False)


@dataclass
class TranslationEngine:
    """LLM-driven page-level translation with glossary lookahead.

    ``max_items_per_call`` caps each LLM request's input list size to keep
    long-context translation quality stable; pages with more unresolved
    leaves than the cap dispatch multiple sequential sub-batch calls.
    """

    client: ClaudeClient
    glossary: Glossary
    tier: ModelTier | str = "sonnet"
    max_items_per_call: int = 8

    def translate_batch(
        self,
        requests: list[TranslationRequest],
        page_number: int,
    ) -> TranslationBatchResult:
        if not requests:
            return TranslationBatchResult(
                trilinguals={}, glossary_hits=0, llm_requests=0
            )

        lookup = self.glossary.by_jp_surface()
        resolved: dict[FieldPath, Trilingual] = {}
        unresolved: list[TranslationRequest] = []

        for req in requests:
            hit = _glossary_lookup(req.jp, lookup)
            if hit is not None:
                resolved[req.path] = hit
            else:
                unresolved.append(req)

        skipped: list[tuple[TranslationRequest, str]] = []
        responses: list[ClaudeResponse] = []

        if unresolved:
            system = TRANSLATE_SYSTEM_PROMPT_TEMPLATE.format(
                glossary_json=_glossary_to_prompt_subset(lookup)
            )
            chunk_size = max(1, self.max_items_per_call)
            for start in range(0, len(unresolved), chunk_size):
                chunk = unresolved[start : start + chunk_size]
                batch_json = json.dumps([r.jp for r in chunk], ensure_ascii=False)
                user = USER_PROMPT_TEMPLATE.format(
                    page_number=page_number,
                    n=len(chunk),
                    batch_json=batch_json,
                )
                response = self.client.call(system=system, user=user, tier=self.tier)
                responses.append(response)
                items = parse_translation_response(response.text, n=len(chunk))

                for req, item in zip(chunk, items):
                    zh = item.get("zh")
                    en = item.get("en")
                    if (
                        not isinstance(zh, str)
                        or not isinstance(en, str)
                        or not zh
                        or not en
                    ):
                        skipped.append((req, f"missing zh/en: {item!r}"))
                        continue
                    resolved[req.path] = Trilingual(jp=req.jp, zh=zh, en=en)

                if len(items) < len(chunk):
                    for req in chunk[len(items) :]:
                        skipped.append((req, "model returned short batch"))

        return TranslationBatchResult(
            trilinguals=resolved,
            glossary_hits=len(requests) - len(unresolved),
            llm_requests=len(responses),
            responses=responses,
            skipped=skipped,
        )


@dataclass
class Stage5Result:
    """Outcome of Stage 5 across one structured/ directory."""

    run_id: str
    cert_id: str
    pages_processed: int
    pages_skipped: int
    fields_translated: int
    glossary_hits: int
    llm_calls: int
    output_dir: str
    cost_path: str
    halted_verdict: Verdict | None = None
    fail_count: int = 0
    failures: list[str] = field(default_factory=list)


_PAGE_FILE_RE = re.compile(r"^page_(\d+)\.json$")


@dataclass
class Stage5Translate:
    """File-orchestrator: structured/ + glossary → translated/."""

    engine: TranslationEngine
    monitor: BudgetMonitor = field(default_factory=BudgetMonitor)

    def run(
        self,
        structured_dir: Path | str,
        run_dir: Path | str,
        cert_id: str,
        run_id: str,
        page_limit: int | None = None,
        skip_existing: bool = True,
    ) -> Stage5Result:
        structured_dir = Path(structured_dir)
        run_dir = Path(run_dir)
        out_dir = run_dir / "translated"
        out_dir.mkdir(parents=True, exist_ok=True)

        page_files = self._sorted_page_files(structured_dir)
        if page_limit is not None:
            page_files = page_files[:page_limit]

        cost_path = run_dir / "cost.json"
        tracker = CostTracker(cost_path, run_id=run_id, cert_id=cert_id)
        tracker.set_caps(
            soft={
                "wall_time_seconds": self.monitor.soft.wall_time_seconds,
                "mistral_usd": self.monitor.soft.mistral_usd,
                "anthropic_usd": self.monitor.soft.anthropic_usd,
                "fail_count": self.monitor.soft.fail_count,
            },
            hard={
                "wall_time_seconds": self.monitor.hard.wall_time_seconds,
                "mistral_usd": self.monitor.hard.mistral_usd,
                "anthropic_usd": self.monitor.hard.anthropic_usd,
                "fail_count": self.monitor.hard.fail_count,
            },
        )

        verdict: Verdict | None = None
        processed = skipped_pages = total_fields = total_hits = total_calls = 0
        failures: list[str] = []

        for page_path, page_number in page_files:
            out_path = out_dir / f"page_{page_number:03d}.json"
            if skip_existing and out_path.exists():
                skipped_pages += 1
                continue

            try:
                entities = json.loads(page_path.read_text(encoding="utf-8"))
            except json.JSONDecodeError as exc:
                failures.append(f"page_{page_number:03d}: {type(exc).__name__}: {exc}")
                tracker.add_fail()
                verdict = self._budget_check(tracker)
                if verdict in (Verdict.FAIL, Verdict.WARN):
                    break
                continue

            requests = _walk_for_paths(entities)
            if not requests:
                # Page is already fully translated (or has no Trilingual fields).
                out_path.write_text(json.dumps(entities, ensure_ascii=False, indent=2), encoding="utf-8")
                processed += 1
                continue

            t0 = time.monotonic()
            try:
                batch = self.engine.translate_batch(requests, page_number=page_number)
            except Exception as exc:
                failures.append(f"page_{page_number:03d}: {type(exc).__name__}: {exc}")
                tracker.add_fail()
                tracker.add_wall_time(time.monotonic() - t0)
                verdict = self._budget_check(tracker)
                if verdict in (Verdict.FAIL, Verdict.WARN):
                    break
                continue

            for resp in batch.responses:
                tracker.add_anthropic(
                    stage_id=STAGE_ID,
                    tokens_input=resp.tokens_input,
                    tokens_output=resp.tokens_output,
                    usd=resp.cost_usd,
                )
            total_calls += len(batch.responses)
            tracker.add_wall_time(time.monotonic() - t0)

            for skipped_req, reason in batch.skipped:
                failures.append(
                    f"page_{page_number:03d}: skipped jp={skipped_req.jp!r} reason={reason}"
                )

            for path, value in batch.trilinguals.items():
                _apply(entities, path, value)

            out_path.write_text(
                json.dumps(entities, ensure_ascii=False, indent=2), encoding="utf-8"
            )
            processed += 1
            total_fields += len(batch.trilinguals)
            total_hits += batch.glossary_hits

            verdict = self._budget_check(tracker)
            if verdict in (Verdict.FAIL, Verdict.WARN):
                break

        return Stage5Result(
            run_id=run_id,
            cert_id=cert_id,
            pages_processed=processed,
            pages_skipped=skipped_pages,
            fields_translated=total_fields,
            glossary_hits=total_hits,
            llm_calls=total_calls,
            output_dir=str(out_dir),
            cost_path=str(cost_path),
            halted_verdict=verdict if verdict in (Verdict.FAIL, Verdict.WARN) else None,
            fail_count=len(failures),
            failures=failures,
        )

    def _budget_check(self, tracker: CostTracker) -> Verdict:
        return self.monitor.check(
            {
                "wall_time_seconds": tracker.current.wall_time_seconds,
                "mistral_usd": tracker.current.mistral_usd,
                "anthropic_usd": tracker.current.anthropic_usd,
                "fail_count": tracker.current.fail_count,
            }
        )

    @staticmethod
    def _sorted_page_files(structured_dir: Path) -> list[tuple[Path, int]]:
        out: list[tuple[Path, int]] = []
        for path in structured_dir.iterdir():
            match = _PAGE_FILE_RE.match(path.name)
            if match:
                out.append((path, int(match.group(1))))
        out.sort(key=lambda item: item[1])
        return out


def make_engine_factory(
    glossary: Glossary,
    tier: ModelTier | str = "sonnet",
    max_budget_usd: float | None = None,
    max_items_per_call: int = 8,
):
    def _factory() -> TranslationEngine:
        client = ClaudeClient(max_budget_usd=max_budget_usd)
        return TranslationEngine(
            client=client,
            glossary=glossary,
            tier=tier,
            max_items_per_call=max_items_per_call,
        )

    return _factory
