#!/usr/bin/env python3
"""Build iter_6 R22-FRESH 10-page fresh sample.

Excludes all pages audited in iter_3 R9/R10/R12/R14 + iter_4 R15/R17
+ iter_5 R18/R20-FRESH.

Quota = 10 pages stratified by classified label: content 7 / exam 2 / other 1.

Seed = 20260526. Deterministic.

Output: validation/deep_validation_2026-05-17/iter_6/r22_fresh_sample.json
"""
from __future__ import annotations

import json
import random
from collections import defaultdict
from pathlib import Path

SEED = 20260526
ROOT = Path(__file__).resolve().parents[3]
RUN = ROOT / "data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19"
ITER3 = ROOT / "validation/deep_validation_2026-05-17/iter_3"
ITER4 = ROOT / "validation/deep_validation_2026-05-17/iter_4"
ITER5 = ROOT / "validation/deep_validation_2026-05-17/iter_5"
ITER6 = ROOT / "validation/deep_validation_2026-05-17/iter_6"
OUT = ITER6 / "r22_fresh_sample.json"
OUT.parent.mkdir(parents=True, exist_ok=True)

QUOTA = {"content": 7, "exam": 2, "other": 1}

PRIOR_SAMPLE_FILES = [
    (ITER3 / "r9_sample.json", ("sample",)),
    (ITER3 / "r10_sample.json", ("sample",)),
    (ITER3 / "r12_sample.json", ("sample_all_mixed",)),
    (ITER3 / "r14_sample.json", ("sample",)),
    (ITER4 / "r15_sample.json", ("sample",)),
    (ITER4 / "r17_sample.json", ("all_mixed",)),
    (ITER5 / "r18_sample.json", ("sample",)),
    (ITER5 / "r20_fresh_sample.json", ("sample",)),
]


def main() -> None:
    rng = random.Random(SEED)
    audited: set[int] = set()
    for path, keys in PRIOR_SAMPLE_FILES:
        d = json.loads(path.read_text(encoding="utf-8"))
        for k in keys:
            v = d.get(k)
            if isinstance(v, list):
                audited.update(int(x) for x in v)

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
    for bucket, n in QUOTA.items():
        pool = sorted(set(coalesced[bucket]))
        rng.shuffle(pool)
        pick = sorted(pool[:n])
        by_label[bucket] = pick
        sample.extend(pick)
    sample = sorted(set(sample))

    overlap = set(sample) & audited
    assert not overlap, f"R22 sample overlaps prior audited: {sorted(overlap)}"

    out = {
        "round": "R22-FRESH",
        "iter": 6,
        "seed": SEED,
        "quota": QUOTA,
        "audited_prior_count": len(audited),
        "fresh_eligible_count": sum(len(v) for v in coalesced.values()),
        "sample_size": len(sample),
        "sample": sample,
        "by_label": by_label,
        "prior_sample_files": [str(p.relative_to(ROOT)) for p, _ in PRIOR_SAMPLE_FILES],
    }
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {OUT}")
    print(f"  prior audited:   {len(audited)} pages")
    print(f"  fresh eligible:  {out['fresh_eligible_count']} pages")
    print(f"  sample:          {sample}")
    print(f"  by_label:        {by_label}")


if __name__ == "__main__":
    main()
