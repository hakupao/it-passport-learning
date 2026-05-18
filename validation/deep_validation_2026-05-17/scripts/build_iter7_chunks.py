#!/usr/bin/env python3
"""Build iter_7 full-corpus chunking manifest.

Splits all 554 pages into 56 deterministic chunks (55 × 10 pages + 1 × 4 pages,
OR you can choose 50 × 10 + 1 × 54 etc.). Output:
  validation/deep_validation_2026-05-17/iter_7/r23_chunks.json
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
RUN = ROOT / "data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19"
OUT = ROOT / "validation/deep_validation_2026-05-17/iter_7/r23_chunks.json"
OUT.parent.mkdir(parents=True, exist_ok=True)

CHUNK_SIZE = 10


def main() -> None:
    pages = sorted(
        int(p.stem.split("_")[1])
        for p in (RUN / "output/pages").glob("page_*.json")
    )
    assert len(pages) == 554, f"expected 554 pages, got {len(pages)}"

    chunks = []
    for i in range(0, len(pages), CHUNK_SIZE):
        chunk_pages = pages[i : i + CHUNK_SIZE]
        chunks.append({
            "chunk_idx": len(chunks),
            "chunk_id": f"chunk_{len(chunks):02d}",
            "page_range": [chunk_pages[0], chunk_pages[-1]],
            "pages": chunk_pages,
            "page_count": len(chunk_pages),
        })

    out = {
        "round": "R23",
        "iter": 7,
        "chunk_size": CHUNK_SIZE,
        "total_pages": len(pages),
        "total_chunks": len(chunks),
        "chunks": chunks,
    }
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {OUT}")
    print(f"  total pages:   {len(pages)}")
    print(f"  chunk size:    {CHUNK_SIZE}")
    print(f"  total chunks:  {len(chunks)}")
    print(f"  first chunk:   {chunks[0]['chunk_id']} {chunks[0]['page_range']}")
    print(f"  last chunk:    {chunks[-1]['chunk_id']} {chunks[-1]['page_range']} ({chunks[-1]['page_count']} pages)")


if __name__ == "__main__":
    main()
