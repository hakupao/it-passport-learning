#!/usr/bin/env python3
"""Aggregate V2 translation worker outputs into v2_translation_summary.json."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
V2_DIR = ROOT / "v2_translation"


def main() -> None:
    results: list[dict] = []
    for f in sorted(V2_DIR.glob("batch_*.json")):
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
            # Accept both single leaf and array (worker writes batch arrays)
            if isinstance(data, list):
                results.extend(data)
            else:
                results.append(data)
        except Exception as e:
            print(f"  ! parse fail: {f.name}: {e}")

    if not results:
        print("No V2 results yet.")
        return

    n = len(results)
    zh_verdicts = Counter(r.get("zh_verdict", "?") for r in results)
    en_verdicts = Counter(r.get("en_verdict", "?") for r in results)
    overall = Counter(r.get("overall_severity", "?") for r in results)

    by_type: dict[str, Counter] = {}
    for r in results:
        t = r.get("entity_type", "?")
        by_type.setdefault(t, Counter())[r.get("overall_severity", "?")] += 1

    finding_top: Counter = Counter()
    for r in results:
        for s in (r.get("zh_findings") or []) + (r.get("en_findings") or []):
            # findings start with "category: ..." per schema
            cat = s.split(":", 1)[0].strip() if ":" in s else s[:30]
            finding_top[cat] += 1

    defect_rate = overall.get("defect", 0) / n
    polish_rate = overall.get("polish", 0) / n

    if defect_rate < 0.03 and polish_rate < 0.20:
        verdict = "PASS"
    elif defect_rate < 0.08:
        verdict = "WARN"
    else:
        verdict = "FAIL"

    defect_examples = [
        {"leaf_id": r.get("leaf_id"), "type": r.get("entity_type"),
         "zh_v": r.get("zh_verdict"), "en_v": r.get("en_verdict"),
         "zh": r.get("zh", "")[:80], "en": r.get("en", "")[:80]}
        for r in results if r.get("overall_severity") == "defect"
    ][:30]

    summary = {
        "track": "V2 Translation",
        "sample_size": n,
        "verdict": verdict,
        "overall_severity": dict(overall),
        "defect_rate": round(defect_rate, 4),
        "polish_rate": round(polish_rate, 4),
        "zh_verdicts": dict(zh_verdicts),
        "en_verdicts": dict(en_verdicts),
        "by_entity_type": {t: dict(c) for t, c in by_type.items()},
        "finding_categories_top": finding_top.most_common(15),
        "defect_examples": defect_examples,
    }
    (ROOT / "v2_translation_summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"V2 summary written. {n} samples, verdict={verdict}")


if __name__ == "__main__":
    main()
