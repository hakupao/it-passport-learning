#!/usr/bin/env python3
"""Build iter_4 R15 fresh-page sample (excludes every page already audited in iter_3 R9/R10/R12/R14).

Quota = 30 pages stratified by classified label:
  content 20 / exam 7 / other 3

Seed = 20260522. Deterministic.

Output: validation/deep_validation_2026-05-17/iter_4/r15_sample.json
"""
from __future__ import annotations

import json
import random
from collections import defaultdict
from pathlib import Path

SEED = 20260522
ROOT = Path(__file__).resolve().parents[3]
RUN = ROOT / "data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19"
ITER3 = ROOT / "validation/deep_validation_2026-05-17/iter_3"
OUT = ROOT / "validation/deep_validation_2026-05-17/iter_4/r15_sample.json"
OUT.parent.mkdir(parents=True, exist_ok=True)

QUOTA = {"content": 20, "exam": 7, "other": 3}
QUOTA_OTHER_LABELS = {"chapter_title", "index", "cover", "toc", "glossary", "other"}


def main() -> None:
    rng = random.Random(SEED)

    # Union of all pages audited in iter_3 (R9 sample, R10 sample, R12 mixed, R14 sample)
    audited: set[int] = set()
    for fname in ("r9_sample.json", "r10_sample.json", "r12_sample.json", "r14_sample.json"):
        d = json.loads((ITER3 / fname).read_text(encoding="utf-8"))
        for key in ("sample", "sample_all_mixed"):
            v = d.get(key)
            if isinstance(v, list):
                audited.update(int(x) for x in v)

    # Classify pages
    pages_by_label: dict[str, list[int]] = defaultdict(list)
    for f in sorted((RUN / "classified").glob("page_*.json")):
        meta = json.loads(f.read_text(encoding="utf-8"))
        pg = int(meta["page_number"])
        if pg in audited:
            continue
        if not (RUN / "output" / "pages" / f"page_{pg:03d}.json").exists():
            continue  # skip pages not present in output (e.g. truly empty)
        label = meta.get("label", "other")
        pages_by_label[label].append(pg)

    # Coalesce small labels into "other" bucket
    coalesced: dict[str, list[int]] = {
        "content": list(pages_by_label.get("content", [])),
        "exam": list(pages_by_label.get("exam", [])),
        "other": [],
    }
    for lbl, pages in pages_by_label.items():
        if lbl in ("content", "exam"):
            continue
        coalesced["other"].extend(pages)

    sample: list[int] = []
    page_labels: dict[str, str] = {}
    by_label: dict[str, list[int]] = {"content": [], "exam": [], "other": []}
    for bucket, n in QUOTA.items():
        pool = sorted(set(coalesced[bucket]))
        rng.shuffle(pool)
        pick = sorted(pool[:n])
        by_label[bucket] = pick
        sample.extend(pick)
        for p in pick:
            # restore original label for display
            for orig_label, orig_pages in pages_by_label.items():
                if p in orig_pages:
                    page_labels[str(p)] = orig_label
                    break

    sample = sorted(set(sample))

    out = {
        "round": "R15",
        "iter": 4,
        "seed": SEED,
        "quota": QUOTA,
        "audited_iter3_count": len(audited),
        "fresh_eligible_count": sum(len(v) for v in coalesced.values()),
        "sample_size": len(sample),
        "sample": sample,
        "by_label": by_label,
        "page_labels": page_labels,
    }

    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {OUT}")
    print(f"  iter3 audited:   {len(audited)} pages")
    print(f"  fresh eligible:  {out['fresh_eligible_count']} pages")
    print(f"  sample size:     {len(sample)} pages")
    print(f"  sample:          {sample}")


if __name__ == "__main__":
    main()
