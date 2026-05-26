#!/usr/bin/env python3
"""Build iter_5 R18 fresh-page sample for triple-perspective trilingual validation.

Excludes every page already audited in iter_3 R9/R10/R12/R14 + iter_4 R15/R17.

Quota = 30 pages stratified by classified label:
  content 20 / exam 7 / other 3

Seed = 20260524. Deterministic.

Output: validation/deep_validation_2026-05-17/iter_5/r18_sample.json
"""
from __future__ import annotations

import json
import random
from collections import defaultdict
from pathlib import Path

SEED = 20260524
ROOT = Path(__file__).resolve().parents[3]
RUN = ROOT / "data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19"
ITER3 = ROOT / "validation/deep_validation_2026-05-17/iter_3"
ITER4 = ROOT / "validation/deep_validation_2026-05-17/iter_4"
OUT = ROOT / "validation/deep_validation_2026-05-17/iter_5/r18_sample.json"
OUT.parent.mkdir(parents=True, exist_ok=True)

QUOTA = {"content": 20, "exam": 7, "other": 3}

PRIOR_SAMPLE_FILES = [
    (ITER3 / "r9_sample.json", ("sample",)),
    (ITER3 / "r10_sample.json", ("sample",)),
    (ITER3 / "r12_sample.json", ("sample_all_mixed",)),
    (ITER3 / "r14_sample.json", ("sample",)),
    (ITER4 / "r15_sample.json", ("sample",)),
    (ITER4 / "r17_sample.json", ("all_mixed",)),
]


def collect_prior_audited() -> set[int]:
    audited: set[int] = set()
    for path, keys in PRIOR_SAMPLE_FILES:
        if not path.exists():
            raise FileNotFoundError(f"missing prior sample: {path}")
        d = json.loads(path.read_text(encoding="utf-8"))
        hit = False
        for k in keys:
            v = d.get(k)
            if isinstance(v, list):
                audited.update(int(x) for x in v)
                hit = True
        if not hit:
            raise KeyError(f"none of {keys} present in {path}")
    return audited


def main() -> None:
    rng = random.Random(SEED)
    audited = collect_prior_audited()

    pages_by_label: dict[str, list[int]] = defaultdict(list)
    for f in sorted((RUN / "classified").glob("page_*.json")):
        meta = json.loads(f.read_text(encoding="utf-8"))
        pg = int(meta["page_number"])
        if pg in audited:
            continue
        if not (RUN / "output" / "pages" / f"page_{pg:03d}.json").exists():
            continue
        label = meta.get("label", "other")
        pages_by_label[label].append(pg)

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
    by_label: dict[str, list[int]] = {"content": [], "exam": [], "other": []}
    page_labels: dict[str, str] = {}
    for bucket, n in QUOTA.items():
        pool = sorted(set(coalesced[bucket]))
        rng.shuffle(pool)
        pick = sorted(pool[:n])
        by_label[bucket] = pick
        sample.extend(pick)
        for p in pick:
            for orig_label, orig_pages in pages_by_label.items():
                if p in orig_pages:
                    page_labels[str(p)] = orig_label
                    break

    sample = sorted(set(sample))

    # Assert disjointness
    overlap = set(sample) & audited
    assert not overlap, f"sample overlaps prior audited: {sorted(overlap)}"

    out = {
        "round": "R18",
        "iter": 5,
        "seed": SEED,
        "quota": QUOTA,
        "audited_prior_count": len(audited),
        "fresh_eligible_count": sum(len(v) for v in coalesced.values()),
        "sample_size": len(sample),
        "sample": sample,
        "by_label": by_label,
        "page_labels": page_labels,
        "prior_sample_files": [str(p.relative_to(ROOT)) for p, _ in PRIOR_SAMPLE_FILES],
    }

    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {OUT}")
    print(f"  prior audited:   {len(audited)} pages")
    print(f"  fresh eligible:  {out['fresh_eligible_count']} pages")
    print(f"  sample size:     {len(sample)} pages")
    print(f"  by_label:        {by_label}")
    print(f"  sample:          {sample}")
    print(f"  disjoint:        ✓")


if __name__ == "__main__":
    main()
