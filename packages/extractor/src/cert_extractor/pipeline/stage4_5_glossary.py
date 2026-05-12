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

# Per D-080: auto-backfill scan ranges. All-katakana = every char in one of
# these Unicode blocks (no kanji / hiragana / latin / digit allowed).
_KATAKANA_BLOCKS = (
    (0x30A0, 0x30FF),  # Katakana
    (0x31F0, 0x31FF),  # Katakana Phonetic Extensions
    (0xFF66, 0xFF9F),  # Halfwidth Katakana
)

_KANA_AUTO_BACKFILL_MIN_LEN = 3

_DEFAULT_KANA_STOP_LIST_PATH = Path(__file__).parent / "kana_stop_list.txt"


def _is_katakana_char(ch: str) -> bool:
    code = ord(ch)
    return any(lo <= code <= hi for lo, hi in _KATAKANA_BLOCKS)


def _is_all_katakana(surface: str) -> bool:
    """True when every character of ``surface`` is in a katakana block.

    Used by D-080 auto-backfill scan to decide whether a glossary term needs
    a kana_helper placeholder. Empty strings return False (length filter
    handled separately by the scan).
    """
    return bool(surface) and all(_is_katakana_char(ch) for ch in surface)


def load_kana_stop_list(path: Path | str | None = None) -> set[str]:
    """Load the kana stop-list (terms exempt from D-080 auto-backfill).

    File format: one term per line. Blank lines and lines starting with ``#``
    are ignored. Surrounding whitespace is stripped. Missing file → empty
    set (no backfill exemption); callers that need a strict load should
    check ``path.exists()`` first.
    """
    target = Path(path) if path is not None else _DEFAULT_KANA_STOP_LIST_PATH
    if not target.exists():
        return set()
    out: set[str] = set()
    for line in target.read_text(encoding="utf-8").splitlines():
        term = line.strip()
        if not term or term.startswith("#"):
            continue
        out.add(term)
    return out


# Per D-080 polish #2: separators on which a multi-concept glossary surface
# is split into 1 entry per concept. Restricted to the 6 explicit characters
# listed in the ADR §2.1; other candidates (e.g. fullwidth slash ／) deferred
# until a re-baseline shows they actually appear in source data.
_CONCEPT_SEPARATORS = ("/", "→", ",", "、", "；", ";")
_CONCEPT_SEPARATOR_RE = re.compile("|".join(re.escape(s) for s in _CONCEPT_SEPARATORS))
_MIN_CONCEPT_PARTS = 2


def _split_concepts(text: str) -> list[str]:
    """Split ``text`` on any concept separator; trim and drop empty parts."""
    if not isinstance(text, str):
        return [""]
    parts = [p.strip() for p in _CONCEPT_SEPARATOR_RE.split(text)]
    return [p for p in parts if p]


def split_multi_concept_items(
    items: list[dict],
) -> tuple[list[dict], list[dict]]:
    """D-080 polish #2 — split glossary items whose surface contains
    multi-concept separators.

    For each item, jp / zh / en are split on the 6 ADR separators. If all
    three languages produce the same number of parts N ≥ 2, the original
    item is replaced by N split items (one per concept); otherwise the
    original is kept untouched and a WARN entry is recorded for evidence.

    Aliases and kana_helper on a multi-concept original are ambiguous after
    split (which split inherits the alias?) — both are cleared on all split
    items; the downstream ``scan_katakana_terms_for_backfill`` pass
    re-decides kana_helper per split surface.

    Returns ``(items_out, warns)`` where ``warns`` is a list of dicts:

        {"surface_jp": "<original>", "reason": "<diagnostic>"}

    Callers (e.g. Stage 4.5 runner) surface ``warns`` to
    ``evidence/.../step_45_glossary.md`` per D-080 §2.1.
    """
    items_out: list[dict] = []
    warns: list[dict] = []
    for item in items:
        if not isinstance(item, dict):
            items_out.append(item)
            continue
        jp = item.get("surface_jp", "")
        zh = item.get("surface_zh", "")
        en = item.get("surface_en", "")
        jp_parts = _split_concepts(jp)
        zh_parts = _split_concepts(zh)
        en_parts = _split_concepts(en)
        any_split = max(len(jp_parts), len(zh_parts), len(en_parts)) >= _MIN_CONCEPT_PARTS
        if not any_split:
            items_out.append(item)
            continue
        balanced = (
            len(jp_parts) == len(zh_parts) == len(en_parts)
            and len(jp_parts) >= _MIN_CONCEPT_PARTS
        )
        if not balanced:
            warns.append(
                {
                    "surface_jp": jp,
                    "reason": (
                        f"unbalanced concept split: jp={len(jp_parts)} "
                        f"zh={len(zh_parts)} en={len(en_parts)} parts; original kept"
                    ),
                }
            )
            items_out.append(item)
            continue
        for j, z, e in zip(jp_parts, zh_parts, en_parts, strict=True):
            split_item = dict(item)
            split_item["surface_jp"] = j
            split_item["surface_zh"] = z
            split_item["surface_en"] = e
            split_item["aliases_jp"] = []  # ambiguity-free; re-author downstream if needed
            split_item["kana_helper"] = None  # let scan_katakana_terms_for_backfill re-decide
            items_out.append(split_item)
    return items_out, warns


def scan_katakana_terms_for_backfill(
    items: list[dict],
    stop_list: set[str] | None = None,
) -> list[dict]:
    """D-080 polish #1 — auto-backfill kana_helper for all-katakana terms.

    Operates on raw glossary items as returned by the LLM (post
    ``parse_glossary_response``, pre ``items_to_entries``). For each item
    whose ``surface_jp`` is all-katakana, length ≥ 3 chars, not in the
    stop-list, and currently has ``kana_helper is None``, inject a
    placeholder kana_helper with ``auto_backfill=True``.

    Returns a NEW list (does not mutate input). Items not eligible for
    backfill are passed through unchanged.

    Placeholder shape per D-080 §2.1::

        {
            "surface": <surface_jp>,
            "reading": <surface_jp>,    # Stage 5 may refine to hiragana
            "zh_concept": <surface_zh>,
            "auto_backfill": True,
        }

    Malformed items (missing/empty ``surface_zh``) are passed through
    untouched — ``items_to_entries`` is the canonical schema validator and
    will skip them via its existing ValidationError path.
    """
    stops = stop_list if stop_list is not None else load_kana_stop_list()
    out: list[dict] = []
    for item in items:
        if not isinstance(item, dict):
            out.append(item)
            continue
        surface_jp = item.get("surface_jp")
        surface_zh = item.get("surface_zh")
        eligible = (
            isinstance(surface_jp, str)
            and len(surface_jp) >= _KANA_AUTO_BACKFILL_MIN_LEN
            and _is_all_katakana(surface_jp)
            and surface_jp not in stops
            and item.get("kana_helper") is None
            and isinstance(surface_zh, str)
            and surface_zh.strip()
        )
        if not eligible:
            out.append(item)
            continue
        patched = dict(item)
        patched["kana_helper"] = {
            "surface": surface_jp,
            "reading": surface_jp,
            "zh_concept": surface_zh,
            "auto_backfill": True,
        }
        out.append(patched)
    return out


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
    concept_split_warns: list[dict] = field(default_factory=list)


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
        items, concept_split_warns = split_multi_concept_items(items)
        items = scan_katakana_terms_for_backfill(items)
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
            concept_split_warns=concept_split_warns,
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
            auto_backfill=bool(kana_helper_raw.get("auto_backfill", False)),
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
