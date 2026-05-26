#!/usr/bin/env python3
"""Build deterministic sample lists for Phase 1 deep validation.

Outputs:
  sampling/sample_v1_ocr.json         — 100 pages stratified by classified label
  sampling/sample_v2_translation.json — 300 leaves stratified by entity type
  sampling/sample_v3b_entity.json     — 200 entities stratified by entity type

Seed: 20260517 (see sampling/seed.txt)
"""
from __future__ import annotations

import json
import random
import sys
from collections import defaultdict
from pathlib import Path

SEED = 20260517
ROOT = Path(__file__).resolve().parents[3]  # repo root
RUN = ROOT / "data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19"
OUT = Path(__file__).resolve().parents[1] / "sampling"
OUT.mkdir(parents=True, exist_ok=True)

# Per VALIDATION_METHODOLOGY.md §3
V1_QUOTA = {
    "content": 60, "exam": 25, "chapter_title": 5, "index": 3,
    "cover": 2, "other": 2, "toc": 2, "glossary": 1,
}
V1_FORCE_CLEANED = 10  # at least 10 of the 56 cleaned pages must be in the sample

V2_PER_TYPE = 50

V3B_QUOTA = {
    "term": 80, "figure": 35, "question": 35,
    "section": 25, "table": 20, "chapter": 5,
}


def main() -> None:
    rng = random.Random(SEED)

    # ---- V1 OCR sample ----------------------------------------------------
    pages_by_label: dict[str, list[int]] = defaultdict(list)
    for f in sorted((RUN / "classified").glob("page_*.json")):
        d = json.loads(f.read_text(encoding="utf-8"))
        pages_by_label[d.get("label", "?")].append(d["page_number"])

    cleaned_pages = sorted(
        int(p.stem.split("_")[-1]) for p in (RUN / "cleaned").glob("page_*.md")
    )

    v1_sample: list[dict] = []
    used: set[int] = set()

    # Step 1: force-include cleaned subset
    cleaned_shuffled = list(cleaned_pages)
    rng.shuffle(cleaned_shuffled)
    for p in cleaned_shuffled[:V1_FORCE_CLEANED]:
        used.add(p)

    # Step 2: fill by label
    for label, quota in V1_QUOTA.items():
        pool = sorted(p for p in pages_by_label.get(label, []) if p not in used)
        rng.shuffle(pool)
        already = sum(
            1 for p in used if any(p in pages_by_label[label] for _ in [0])
        )
        need = max(0, quota - sum(1 for p in used if p in pages_by_label[label]))
        for p in pool[:need]:
            used.add(p)

    # Build final list
    for p in sorted(used):
        label = next(
            lab for lab, plist in pages_by_label.items() if p in plist
        )
        v1_sample.append({
            "page": p,
            "label": label,
            "has_cleaned": p in set(cleaned_pages),
            "raw_path": f"data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/raw/pages/page_{p:03d}.jpg",
            "ocr_path": f"data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/ocr/page_{p:03d}.md",
            "cleaned_path": (
                f"data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/cleaned/page_{p:03d}.md"
                if p in set(cleaned_pages) else None
            ),
            "classified_path": f"data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/classified/page_{p:03d}.json",
        })

    (OUT / "sample_v1_ocr.json").write_text(
        json.dumps(v1_sample, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"V1 OCR sample: {len(v1_sample)} pages → sample_v1_ocr.json")

    # ---- V2 translation sample -------------------------------------------
    # Walk translated/*.json and collect leaves with full provenance
    leaves_by_type: dict[str, list[dict]] = defaultdict(list)

    def walk(node, path_keys, entity_type, entity_id, page, leaf_acc):
        if isinstance(node, dict):
            if set(node.keys()) >= {"jp", "zh", "en"}:
                leaf_acc.append({
                    "leaf_id": f"{entity_id}::{'/'.join(path_keys) or 'root'}",
                    "entity_id": entity_id,
                    "entity_type": entity_type,
                    "page": page,
                    "path": list(path_keys),
                    "jp": node["jp"],
                    "zh": node.get("zh", ""),
                    "en": node.get("en", ""),
                })
            else:
                for k, v in node.items():
                    walk(v, path_keys + [k], entity_type, entity_id, page, leaf_acc)
        elif isinstance(node, list):
            for i, v in enumerate(node):
                walk(v, path_keys + [str(i)], entity_type, entity_id, page, leaf_acc)

    for f in sorted((RUN / "translated").glob("page_*.json")):
        page = int(f.stem.split("_")[-1])
        arr = json.loads(f.read_text(encoding="utf-8"))
        for entity in arr:
            entity_type = entity.get("type", "?")
            entity_id = entity.get("id", f"page_{page}_anon")
            walk(entity, [], entity_type, entity_id, page, leaves_by_type[entity_type])

    v2_sample: list[dict] = []
    for typ in ["chapter", "section", "term", "question", "table", "figure"]:
        pool = leaves_by_type.get(typ, [])
        rng2 = random.Random(SEED ^ hash(typ))
        rng2.shuffle(pool)
        take = min(V2_PER_TYPE, len(pool))
        v2_sample.extend(pool[:take])
        print(f"  V2 {typ}: pool={len(pool)}, sampled={take}")

    (OUT / "sample_v2_translation.json").write_text(
        json.dumps(v2_sample, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"V2 translation sample: {len(v2_sample)} leaves → sample_v2_translation.json")

    # ---- V3b entity-type sample ------------------------------------------
    entities_by_type: dict[str, list[dict]] = defaultdict(list)
    for f in sorted((RUN / "structured").glob("page_*.json")):
        page = int(f.stem.split("_")[-1])
        arr = json.loads(f.read_text(encoding="utf-8"))
        for entity in arr:
            etype = entity.get("type", "?")
            entities_by_type[etype].append({
                "entity_id": entity.get("id", f"page_{page}_anon"),
                "entity_type": etype,
                "page": page,
                "anchor": entity.get("anchor", {}),
            })

    v3b_sample: list[dict] = []
    for typ, quota in V3B_QUOTA.items():
        pool = entities_by_type.get(typ, [])
        rng3 = random.Random(SEED ^ hash(f"v3b_{typ}"))
        rng3.shuffle(pool)
        take = min(quota, len(pool))
        v3b_sample.extend(pool[:take])
        print(f"  V3b {typ}: pool={len(pool)}, sampled={take}")

    (OUT / "sample_v3b_entity.json").write_text(
        json.dumps(v3b_sample, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"V3b entity sample: {len(v3b_sample)} entities → sample_v3b_entity.json")


if __name__ == "__main__":
    main()
