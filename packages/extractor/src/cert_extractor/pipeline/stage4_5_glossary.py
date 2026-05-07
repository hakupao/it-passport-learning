"""Stage 4.5 glossary extraction (per D-008 + D-012).

Reads all Stage 4 ``structured/page_*.json`` outputs, harvests the unique
``Term.surface.jp`` set, and asks Claude to canonicalize + translate each
into a locked trilingual entry. The result is written once per run to
``glossary/glossary.json`` and consumed by Stage 5 as a translation
memory: any ``Trilingual.jp`` that matches a glossary key must be rendered
with the locked ``zh`` / ``en`` values.

Single-call design: glossary harvest runs once on the full run-set of
terms (the 50-page dry-run produced 91 unique terms, comfortably under
Sonnet's output budget). Full-book harvest may need batching; that's a
Phase 1 follow-up if the count exceeds ~500 unique terms.
"""
from __future__ import annotations

import json
import re
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable

from pydantic import ValidationError

from cert_extractor.audit.verdict import Verdict
from cert_extractor.budget.cost import CostTracker
from cert_extractor.budget.monitor import BudgetMonitor
from cert_extractor.llm.claude_client import ClaudeClient, ClaudeResponse, ModelTier
from cert_extractor.schema.common import KanaHelper, Trilingual
from cert_extractor.schema.glossary import Glossary, GlossaryEntry

STAGE_ID = 45  # 4.5 — fits as integer key in cost.json by_stage map

GLOSSARY_SYSTEM_PROMPT = """\
You are the glossary editor for a trilingual learning factory targeting
Japanese IT certification exam (ITパスポート) study by Chinese / English
speakers.

You will receive a list of Japanese technical terms collected from a run
of the source textbook. Some entries may be near-duplicates or surface
variants of the same concept. Your job is:

1. Group near-duplicates and pick a single canonical Japanese surface
   for each concept. List the other variants under aliases_jp.
2. Translate the canonical surface into Chinese (Simplified) and
   English. Use the standard textbook rendering, not loose paraphrase.
3. For terms that are predominantly katakana AND that a non-native
   reader would struggle to read by glyph, attach a kana_helper
   describing the romaji reading and the closest Chinese concept word.
   For terms that are kanji-only or mixed (e.g. 経営理念, ITパスポート),
   set kana_helper to null.

Output a single JSON array. Each item must have:
- "surface_jp" (string): the canonical Japanese surface
- "surface_zh" (string): the Chinese translation
- "surface_en" (string): the English translation
- "kana_helper" (object or null): {"surface": ..., "reading": ..., "zh_concept": ...}
- "aliases_jp" (array of strings, may be empty): other surfaces that map here

Output ONLY the JSON array on one line. No preamble, no commentary, no
code fences.
"""

USER_PROMPT_TEMPLATE = """\
cert_id: {cert_id}
unique_terms_count: {n}

terms (one per line):
{term_list}

Produce the canonical glossary now.
"""

_PAGE_FILE_RE = re.compile(r"^page_(\d+)\.json$")


@dataclass
class HarvestedTerm:
    """One Term-entity occurrence collected from Stage 4 output."""

    surface_jp: str
    page: int


@dataclass
class GlossaryExtractResult:
    """Outcome of one GlossaryExtractor.extract call."""

    glossary: Glossary
    raw_items: list[dict]
    skipped: list[tuple[dict, str]]
    response: ClaudeResponse


@dataclass
class GlossaryExtractor:
    """LLM-driven glossary canonicalizer + translator."""

    client: ClaudeClient
    cert_id: str
    run_id: str
    tier: ModelTier | str = "sonnet"

    def extract(self, harvested: list[HarvestedTerm]) -> GlossaryExtractResult:
        # Aggregate occurrences keyed by surface so the prompt sees unique terms.
        occurrences: dict[str, list[int]] = {}
        first_page: dict[str, int] = {}
        for h in harvested:
            occurrences.setdefault(h.surface_jp, []).append(h.page)
            if h.surface_jp not in first_page or h.page < first_page[h.surface_jp]:
                first_page[h.surface_jp] = h.page

        unique_terms = sorted(occurrences.keys())
        if not unique_terms:
            empty = Glossary(cert_id=self.cert_id, run_id=self.run_id, entries=[])
            empty_response = ClaudeResponse(text="[]")
            return GlossaryExtractResult(
                glossary=empty, raw_items=[], skipped=[], response=empty_response
            )

        prompt = USER_PROMPT_TEMPLATE.format(
            cert_id=self.cert_id,
            n=len(unique_terms),
            term_list="\n".join(unique_terms),
        )
        response = self.client.call(
            system=GLOSSARY_SYSTEM_PROMPT,
            user=prompt,
            tier=self.tier,
        )
        items = parse_glossary_response(response.text)
        entries, skipped = items_to_entries(
            items=items,
            occurrences=occurrences,
            first_page=first_page,
        )
        glossary = Glossary(cert_id=self.cert_id, run_id=self.run_id, entries=entries)
        return GlossaryExtractResult(
            glossary=glossary,
            raw_items=items,
            skipped=skipped,
            response=response,
        )


_JSON_ARRAY_RE = re.compile(r"\[.*\]", re.DOTALL)


def parse_glossary_response(raw: str) -> list[dict]:
    """Tolerantly parse the JSON array of glossary items from the model."""
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


def items_to_entries(
    items: list[dict],
    occurrences: dict[str, list[int]],
    first_page: dict[str, int],
) -> tuple[list[GlossaryEntry], list[tuple[dict, str]]]:
    entries: list[GlossaryEntry] = []
    skipped: list[tuple[dict, str]] = []
    for idx, item in enumerate(items):
        try:
            entry = _build_entry(
                item=item,
                idx=idx,
                occurrences=occurrences,
                first_page=first_page,
            )
        except (KeyError, ValueError, TypeError, ValidationError) as exc:
            skipped.append((item, f"{type(exc).__name__}: {exc}"))
            continue
        entries.append(entry)
    return entries, skipped


def _build_entry(
    item: dict,
    idx: int,
    occurrences: dict[str, list[int]],
    first_page: dict[str, int],
) -> GlossaryEntry:
    surface_jp = item["surface_jp"]
    surface_zh = item["surface_zh"]
    surface_en = item["surface_en"]
    aliases = list(item.get("aliases_jp") or [])
    kana_helper_raw = item.get("kana_helper")

    # Aggregate occurrence pages from canonical + aliases.
    seen_pages: set[int] = set(occurrences.get(surface_jp, []))
    for alias in aliases:
        seen_pages.update(occurrences.get(alias, []))

    if not seen_pages:
        # Should not happen if the model echoes back our input surfaces; if it
        # invented a new term, default to page 1 so the entry remains valid.
        seen_pages = {1}

    fp_candidates = [first_page[s] for s in [surface_jp, *aliases] if s in first_page]
    fp = min(fp_candidates) if fp_candidates else min(seen_pages)

    kana_helper = None
    if isinstance(kana_helper_raw, dict):
        kana_helper = KanaHelper(
            surface=str(kana_helper_raw["surface"]),
            reading=str(kana_helper_raw["reading"]),
            zh_concept=str(kana_helper_raw["zh_concept"]),
        )

    return GlossaryEntry(
        id=f"g_{idx + 1:03d}",
        surface=Trilingual(jp=surface_jp, zh=surface_zh, en=surface_en),
        kana_helper=kana_helper,
        first_page=fp,
        occurrences=sorted(seen_pages),
        aliases_jp=aliases,
    )


@dataclass
class Stage4_5Result:
    """Outcome of Stage 4.5 across one structured/ directory."""

    run_id: str
    cert_id: str
    pages_scanned: int
    terms_harvested: int
    unique_surfaces: int
    entries_locked: int
    output_path: str
    cost_path: str
    halted_verdict: Verdict | None = None
    fail_count: int = 0
    failures: list[str] = field(default_factory=list)


@dataclass
class Stage4_5Glossary:
    """File-orchestrator: structured/ → glossary/glossary.json (single call)."""

    extractor: GlossaryExtractor
    monitor: BudgetMonitor = field(default_factory=BudgetMonitor)

    def run(
        self,
        structured_dir: Path | str,
        run_dir: Path | str,
        cert_id: str,
        run_id: str,
        skip_existing: bool = True,
    ) -> Stage4_5Result:
        structured_dir = Path(structured_dir)
        run_dir = Path(run_dir)
        out_dir = run_dir / "glossary"
        out_dir.mkdir(parents=True, exist_ok=True)
        glossary_path = out_dir / "glossary.json"
        cost_path = run_dir / "cost.json"

        if skip_existing and glossary_path.exists():
            existing = Glossary.model_validate_json(glossary_path.read_text(encoding="utf-8"))
            return Stage4_5Result(
                run_id=run_id,
                cert_id=cert_id,
                pages_scanned=0,
                terms_harvested=0,
                unique_surfaces=len(existing.by_jp_surface()),
                entries_locked=len(existing.entries),
                output_path=str(glossary_path),
                cost_path=str(cost_path),
            )

        harvested: list[HarvestedTerm] = []
        page_files = self._sorted_page_files(structured_dir)
        for path, page_number in page_files:
            try:
                items = json.loads(path.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                continue
            for item in items:
                if isinstance(item, dict) and item.get("type") == "term":
                    surface_jp = (item.get("surface") or {}).get("jp")
                    if isinstance(surface_jp, str) and surface_jp.strip():
                        harvested.append(
                            HarvestedTerm(surface_jp=surface_jp.strip(), page=page_number)
                        )

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
        failures: list[str] = []
        unique_surfaces = len({h.surface_jp for h in harvested})

        t0 = time.monotonic()
        try:
            result = self.extractor.extract(harvested)
        except Exception as exc:
            failures.append(f"glossary extract: {type(exc).__name__}: {exc}")
            tracker.add_fail()
            tracker.add_wall_time(time.monotonic() - t0)
            return Stage4_5Result(
                run_id=run_id,
                cert_id=cert_id,
                pages_scanned=len(page_files),
                terms_harvested=len(harvested),
                unique_surfaces=unique_surfaces,
                entries_locked=0,
                output_path=str(glossary_path),
                cost_path=str(cost_path),
                halted_verdict=self._budget_check(tracker),
                fail_count=len(failures),
                failures=failures,
            )

        tracker.add_anthropic(
            stage_id=STAGE_ID,
            tokens_input=result.response.tokens_input,
            tokens_output=result.response.tokens_output,
            usd=result.response.cost_usd,
        )
        tracker.add_wall_time(time.monotonic() - t0)

        for skipped_item, reason in result.skipped:
            failures.append(
                f"glossary skipped item {skipped_item.get('surface_jp')!r}: {reason}"
            )

        glossary_path.write_text(
            result.glossary.model_dump_json(indent=2),
            encoding="utf-8",
        )

        verdict = self._budget_check(tracker)
        return Stage4_5Result(
            run_id=run_id,
            cert_id=cert_id,
            pages_scanned=len(page_files),
            terms_harvested=len(harvested),
            unique_surfaces=unique_surfaces,
            entries_locked=len(result.glossary.entries),
            output_path=str(glossary_path),
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


def make_extractor_factory(
    cert_id: str,
    run_id: str,
    tier: ModelTier | str = "sonnet",
    max_budget_usd: float | None = None,
):
    def _factory() -> GlossaryExtractor:
        client = ClaudeClient(max_budget_usd=max_budget_usd)
        return GlossaryExtractor(
            client=client, cert_id=cert_id, run_id=run_id, tier=tier
        )

    return _factory


def iter_stage_id() -> Iterable[int]:
    return iter([STAGE_ID])
