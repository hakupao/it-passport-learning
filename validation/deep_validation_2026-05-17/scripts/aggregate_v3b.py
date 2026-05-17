#!/usr/bin/env python3
"""Aggregate V3b entity-type worker outputs into v3b_entitytype_summary.json."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
V3B_DIR = ROOT / "v3b_entitytype"


def main() -> None:
    results: list[dict] = []
    for f in sorted(V3B_DIR.glob("batch_*.json")):
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
            if isinstance(data, list):
                results.extend(data)
            else:
                results.append(data)
        except Exception as e:
            print(f"  ! parse fail: {f.name}: {e}")

    if not results:
        print("No V3b results yet.")
        return

    n = len(results)
    type_verdicts = Counter(r.get("type_verdict", "?") for r in results)
    sp_verdicts = Counter(r.get("section_path_reviewer_check", "?") for r in results)

    disagree_by_type: dict[str, dict] = {}
    for r in results:
        t = r.get("type_existing", "?")
        d = disagree_by_type.setdefault(t, {"agree": 0, "disagree": 0})
        if r.get("type_verdict") == "AGREE":
            d["agree"] += 1
        elif r.get("type_verdict") == "DISAGREE":
            d["disagree"] += 1

    disagreements = [
        {"entity_id": r.get("entity_id"), "page": r.get("page"),
         "existing": r.get("type_existing"), "reviewer": r.get("type_reviewer"),
         "notes": r.get("notes", "")[:200]}
        for r in results if r.get("type_verdict") == "DISAGREE"
    ]

    disagree_rate = type_verdicts.get("DISAGREE", 0) / n
    if disagree_rate < 0.05:
        verdict = "PASS"
    elif disagree_rate < 0.10:
        verdict = "WARN"
    else:
        verdict = "FAIL"

    summary = {
        "track": "V3b Entity-type + section_path",
        "sample_size": n,
        "verdict": verdict,
        "type_verdicts": dict(type_verdicts),
        "disagree_rate": round(disagree_rate, 4),
        "section_path_check": dict(sp_verdicts),
        "by_existing_type": disagree_by_type,
        "disagreements": disagreements,
    }
    (ROOT / "v3b_entitytype_summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"V3b summary written. {n} samples, verdict={verdict}")


if __name__ == "__main__":
    main()
