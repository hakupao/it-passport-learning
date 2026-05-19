#!/usr/bin/env python3
"""build_index_v2.py — D-089 §2.2 v2 manifest backfill (non-invasive).

Reads:
  <src>/index.json (v1, immutable)
  <src>/glossary.json
  <src>/pages/page_NNN.json × N

Emits:
  <src>/index.v2.json  (v1 carried-forward + v2 augmentations)

v2 additions:
  - chapters[]  : derived via "dominant chapter per page" heuristic on
                  entity.section_number prefix (e.g., "01-02" → "ch01")
  - glossary_index : surface_jp_to_id + id_to_surface (from glossary.entries)
  - entity_by_id   : keyed by "page_NNN_entity_M" → {page, entity_index, type, id}
  - v2_built_at    : ISO8601 timestamp of this build
  - v2_source_index: relative path of v1 source

Default <src> = apps/web/_fixtures/v1.0.3 (Phase 2 fixture per Q3=a).
Run from repo root: python3 scripts/build_index_v2.py [--src DIR]
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

# Require "NN-MM..." form (two-digit chapter + hyphen + section).
# Bare "10" (no hyphen) is a chapter-callout / review marker, not content;
# excluding it removes ch10 forward-ref noise on p.31 + review-page noise on p.563.
CHAPTER_PREFIX_RE = re.compile(r"^(\d{2})-")
# Chapters with fewer than this many "dominant pages" are treated as
# cross-references in other chapters (e.g., ch32/ch36 anomalies on pp.48/52).
MIN_DOMINANT_PAGES = 3


def chapter_prefix(section_number: str | None) -> str | None:
    if not section_number:
        return None
    m = CHAPTER_PREFIX_RE.match(section_number)
    if not m:
        return None
    return f"ch{m.group(1)}"


def load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def build_chapters(pages_dir: Path, page_refs: list[dict]) -> list[dict]:
    """Heuristic chapter detection from per-page entity section_numbers."""
    # Per-page: count entities per chapter prefix → dominant chapter on that page
    dominant_by_page: dict[int, str] = {}
    # First section-entity title per chapter encountered (used as chapter title)
    first_title: dict[str, dict[str, str]] = {}

    for ref in page_refs:
        page_num = ref["page"]
        page_file = pages_dir / f"page_{page_num:03d}.json"
        if not page_file.exists():
            continue
        page_data = load_json(page_file)
        counts: Counter[str] = Counter()
        for entity in page_data.get("entities", []):
            ch = chapter_prefix(entity.get("section_number"))
            if ch is not None:
                counts[ch] += 1
                # Capture first section title for that chapter
                if (
                    ch not in first_title
                    and entity.get("type") == "section"
                    and isinstance(entity.get("title"), dict)
                ):
                    title = entity["title"]
                    first_title[ch] = {
                        "jp": title.get("jp", ""),
                        "zh": title.get("zh", ""),
                        "en": title.get("en", ""),
                    }
        if counts:
            dominant_by_page[page_num] = counts.most_common(1)[0][0]

    # Group pages by dominant chapter, filter sparse cross-refs
    pages_per_ch: dict[str, list[int]] = defaultdict(list)
    for page_num, ch in dominant_by_page.items():
        pages_per_ch[ch].append(page_num)

    chapters: list[dict] = []
    for ch, pgs in pages_per_ch.items():
        if len(pgs) < MIN_DOMINANT_PAGES:
            continue
        pgs_sorted = sorted(pgs)
        title = first_title.get(ch, {"jp": "", "zh": "", "en": ""})
        chapters.append(
            {
                "chapter_id": ch,
                "title_jp": title["jp"],
                "title_zh": title["zh"],
                "title_en": title["en"],
                "first_page": pgs_sorted[0],
                "last_page": pgs_sorted[-1],
            }
        )

    # Sort by chapter_id (literal "ch00" < "ch01" < ... = numeric since zero-padded).
    chapters.sort(key=lambda c: c["chapter_id"])

    # Post-process: cap each chapter's last_page by next chapter's first_page - 1.
    # Handles tail-pollution from singleton "ch11-規格" style entries in back-matter
    # pages where dozens of empty-section entities give a single chapter false dominance.
    for i in range(len(chapters) - 1):
        next_first = chapters[i + 1]["first_page"]
        if chapters[i]["last_page"] >= next_first:
            chapters[i]["last_page"] = next_first - 1

    return chapters


def build_glossary_index(glossary: dict) -> dict:
    surface_jp_to_id: dict[str, str] = {}
    id_to_surface: dict[str, str] = {}
    for entry in glossary.get("entries", []):
        eid = entry["id"]
        jp = entry["surface"]["jp"]
        # Last writer wins on JP duplicates; flag in stdout for awareness
        if jp in surface_jp_to_id and surface_jp_to_id[jp] != eid:
            print(
                f"  ⚠ duplicate JP surface '{jp}': {surface_jp_to_id[jp]} → {eid}",
                file=sys.stderr,
            )
        surface_jp_to_id[jp] = eid
        id_to_surface[eid] = jp
    return {"surface_jp_to_id": surface_jp_to_id, "id_to_surface": id_to_surface}


def build_entity_by_id(pages_dir: Path, page_refs: list[dict]) -> dict[str, dict]:
    entity_by_id: dict[str, dict] = {}
    for ref in page_refs:
        page_num = ref["page"]
        page_file = pages_dir / f"page_{page_num:03d}.json"
        if not page_file.exists():
            continue
        page_data = load_json(page_file)
        for idx, entity in enumerate(page_data.get("entities", [])):
            key = f"page_{page_num:03d}_entity_{idx}"
            entity_by_id[key] = {
                "page": page_num,
                "entity_index": idx,
                "type": entity.get("type", "unknown"),
                "id": entity.get("id", ""),
            }
    return entity_by_id


def build_v2(src: Path) -> dict:
    index_v1 = load_json(src / "index.json")
    glossary = load_json(src / "glossary.json")
    pages_dir = src / "pages"

    page_refs = index_v1["pages"]
    print(f"📖 reading {len(page_refs)} pages from {pages_dir}", file=sys.stderr)

    chapters = build_chapters(pages_dir, page_refs)
    print(f"📚 detected {len(chapters)} chapters (heuristic):", file=sys.stderr)
    for ch in chapters:
        print(
            f"   {ch['chapter_id']:>5} pp.{ch['first_page']:>3}-{ch['last_page']:>3} "
            f"  {ch['title_jp'][:30]}",
            file=sys.stderr,
        )

    glossary_index = build_glossary_index(glossary)
    print(
        f"🔤 glossary_index: {len(glossary_index['surface_jp_to_id'])} JP→id mappings",
        file=sys.stderr,
    )

    entity_by_id = build_entity_by_id(pages_dir, page_refs)
    print(f"🆔 entity_by_id: {len(entity_by_id)} entities indexed", file=sys.stderr)

    return {
        "schema_version": "v2",
        "cert_id": index_v1["cert_id"],
        "run_id": index_v1["run_id"],
        "exported_at": index_v1["exported_at"],
        "totals": index_v1["totals"],
        "stage6_summary": index_v1["stage6_summary"],
        "pages": index_v1["pages"],
        "chapters": chapters,
        "glossary_index": glossary_index,
        "entity_by_id": entity_by_id,
        "v2_built_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "v2_source_index": "index.json",
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--src",
        type=Path,
        default=Path("apps/web/_fixtures/v1.0.3"),
        help="directory containing index.json + glossary.json + pages/",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=None,
        help="output file path (default: <src>/index.v2.json)",
    )
    args = parser.parse_args()

    src: Path = args.src.resolve()
    if not src.is_dir():
        print(f"❌ src dir not found: {src}", file=sys.stderr)
        return 1

    out: Path = args.out.resolve() if args.out else src / "index.v2.json"
    v2 = build_v2(src)

    with out.open("w", encoding="utf-8") as f:
        json.dump(v2, f, ensure_ascii=False, indent=2, sort_keys=False)
    print(f"✅ wrote {out} ({out.stat().st_size:,} bytes)", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
