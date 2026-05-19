#!/usr/bin/env python3
"""D-084 — v1.0.3 backfill: populate Term.kana_helper from glossary[surface.jp].kana_helper.

Per D-084 §2.3 step 1-4 (sub-ADR of D-083 §2.4, must-do from §5.5 mapping):

1. Read canonical ``output/`` JSON (Term entities + glossary.json)
2. For each Term entity, lookup glossary[surface.jp].kana_helper
3. If glossary has non-null kana_helper AND Term.kana_helper is None → copy
4. Re-emit affected Markdown (NO-OP in v1.0.3: emit_page_md does not render
   kana_helper; D-084 §2.3 step 4 is conditional and currently false)

Idempotent by construction: only writes when current Term.kana_helper is None
AND glossary has a match. Re-running on already-backfilled data is a no-op.

D-084 §2.6 semver: patch release (v1.0.2 → v1.0.3) — additive backward
compatible. Term.kana_helper field already exists in schema (entities.py:44);
backfill only changes value from None to populated KanaHelper dict.

Usage::

    python scripts/backfill_term_kana_helper.py [--canonical-output PATH] [--dry-run]
    python scripts/backfill_term_kana_helper.py --canonical-output data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/output
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CANONICAL = ROOT / "data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/output"


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, data: Any) -> None:
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def build_kana_helper_lookup(glossary_data: dict) -> dict[str, dict]:
    """Build ``surface.jp + aliases_jp → kana_helper`` map (skip null entries).

    Primary key = ``surface.jp``. Aliases supplement primary keys but never
    overwrite (first-seen wins). Glossary entries with ``kana_helper is None``
    are skipped — no map entry created for them.
    """
    lookup: dict[str, dict] = {}
    for entry in glossary_data.get("entries", []):
        kana_helper = entry.get("kana_helper")
        if not kana_helper:
            continue
        surface_jp = (entry.get("surface") or {}).get("jp")
        if isinstance(surface_jp, str) and surface_jp:
            lookup.setdefault(surface_jp, kana_helper)
        for alias in entry.get("aliases_jp") or []:
            if isinstance(alias, str) and alias:
                lookup.setdefault(alias, kana_helper)
    return lookup


def backfill_page(
    page_data: dict,
    lookup: dict[str, dict],
) -> tuple[dict, dict]:
    """Backfill Term entities in one page's JSON envelope (in-place safe).

    Returns ``(updated_data, stats_dict)``. Stats keys:

    - ``term_total``           : Term entities in this page
    - ``term_with_existing``   : skipped (kana_helper already populated)
    - ``term_backfilled``      : updated (None → KanaHelper)
    - ``term_no_match``        : skipped (no glossary entry for surface.jp)
    - ``term_no_surface``      : skipped (Term missing surface.jp)

    Pure in the sense that idempotent — repeated calls on the same input
    produce identical output after the first.
    """
    stats = {
        "term_total": 0,
        "term_with_existing": 0,
        "term_backfilled": 0,
        "term_no_match": 0,
        "term_no_surface": 0,
    }
    for entity in page_data.get("entities") or []:
        if entity.get("type") != "term":
            continue
        stats["term_total"] += 1
        surface_jp = (entity.get("surface") or {}).get("jp")
        if not isinstance(surface_jp, str) or not surface_jp:
            stats["term_no_surface"] += 1
            continue
        if entity.get("kana_helper") is not None:
            stats["term_with_existing"] += 1
            continue
        match = lookup.get(surface_jp)
        if match is None:
            stats["term_no_match"] += 1
            continue
        entity["kana_helper"] = match
        stats["term_backfilled"] += 1
    return page_data, stats


def backfill_canonical_output(
    output_dir: Path,
    *,
    dry_run: bool = False,
) -> dict:
    """Backfill all pages under ``output_dir/pages/`` from ``output_dir/glossary.json``.

    Returns aggregate stats dict including ``pages_changed`` count.
    """
    pages_dir = output_dir / "pages"
    glossary_path = output_dir / "glossary.json"

    if not pages_dir.is_dir():
        raise FileNotFoundError(f"pages dir not found: {pages_dir}")
    if not glossary_path.exists():
        raise FileNotFoundError(f"glossary.json not found: {glossary_path}")

    glossary = load_json(glossary_path)
    lookup = build_kana_helper_lookup(glossary)

    totals = {
        "glossary_entries_total": len(glossary.get("entries") or []),
        "glossary_with_kana_helper": len(lookup),
        "page_count": 0,
        "pages_changed": 0,
        "term_total": 0,
        "term_with_existing": 0,
        "term_backfilled": 0,
        "term_no_match": 0,
        "term_no_surface": 0,
        "dry_run": bool(dry_run),
    }

    for page_path in sorted(pages_dir.glob("page_*.json")):
        totals["page_count"] += 1
        page_data = load_json(page_path)
        updated, stats = backfill_page(page_data, lookup)
        for key in (
            "term_total",
            "term_with_existing",
            "term_backfilled",
            "term_no_match",
            "term_no_surface",
        ):
            totals[key] += stats[key]
        if stats["term_backfilled"] > 0:
            totals["pages_changed"] += 1
            if not dry_run:
                save_json(page_path, updated)
    return totals


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument(
        "--canonical-output",
        type=Path,
        default=DEFAULT_CANONICAL,
        help="Path to canonical output/ directory (default: v1.0.2 canonical run)",
    )
    ap.add_argument(
        "--dry-run",
        action="store_true",
        help="Report what would change without writing",
    )
    args = ap.parse_args(argv)

    try:
        totals = backfill_canonical_output(args.canonical_output, dry_run=args.dry_run)
    except FileNotFoundError as e:
        print(f"[error] {e}", file=sys.stderr)
        return 2

    print("[backfill] D-084 v1.0.3 kana_helper backfill summary:")
    print(f"  Canonical output         : {args.canonical_output}")
    print(f"  Mode                     : {'DRY-RUN (no writes)' if args.dry_run else 'APPLIED'}")
    print(f"  Glossary entries total   : {totals['glossary_entries_total']}")
    print(f"  Glossary w/ kana_helper  : {totals['glossary_with_kana_helper']}")
    print(f"  Pages scanned            : {totals['page_count']}")
    print(f"  Pages changed            : {totals['pages_changed']}")
    print(f"  Term entities total      : {totals['term_total']}")
    print(f"  Term w/ existing kh      : {totals['term_with_existing']}")
    print(f"  Term BACKFILLED          : {totals['term_backfilled']}")
    print(f"  Term no glossary match   : {totals['term_no_match']}")
    print(f"  Term no surface.jp       : {totals['term_no_surface']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
