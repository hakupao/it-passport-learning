#!/usr/bin/env python3
"""Aggregate V1 OCR worker outputs into v1_ocr_summary.json + extract V3a page-class results."""
from __future__ import annotations

import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
V1_DIR = ROOT / "v1_ocr"
V3A_DIR = ROOT / "v3a_pageclass"
V3A_DIR.mkdir(parents=True, exist_ok=True)


def main() -> None:
    results = []
    for f in sorted(V1_DIR.glob("page_*.json")):
        try:
            results.append(json.loads(f.read_text(encoding="utf-8")))
        except Exception as e:
            print(f"  ! parse fail: {f.name}: {e}")

    if not results:
        print("No V1 results yet.")
        return

    # ---- V1 OCR aggregation ---------------------------------------------
    n = len(results)
    ocr_verdicts = Counter(r.get("ocr_verdict", "?") for r in results)
    finding_cats: Counter = Counter()
    score_sum = 0.0
    score_count = 0
    high_severity_pages: list[int] = []
    for r in results:
        for f in r.get("ocr_findings", []) or []:
            finding_cats[f.get("category", "?")] += 1
            if f.get("severity") == "high":
                high_severity_pages.append(r.get("page"))
        if isinstance(r.get("ocr_score"), (int, float)):
            score_sum += float(r["ocr_score"])
            score_count += 1

    fail_rate = ocr_verdicts.get("FAIL", 0) / n
    warn_rate = ocr_verdicts.get("WARN", 0) / n
    pass_rate = ocr_verdicts.get("PASS", 0) / n

    # Apply thresholds from methodology §5.1
    if fail_rate < 0.03 and warn_rate < 0.15:
        track_verdict = "PASS"
    elif fail_rate < 0.08:
        track_verdict = "WARN"
    else:
        track_verdict = "FAIL"

    v1_summary = {
        "track": "V1 OCR",
        "sample_size": n,
        "verdict": track_verdict,
        "ocr_verdicts": dict(ocr_verdicts),
        "pass_rate": round(pass_rate, 4),
        "warn_rate": round(warn_rate, 4),
        "fail_rate": round(fail_rate, 4),
        "avg_ocr_score": round(score_sum / max(1, score_count), 4),
        "finding_categories_top": finding_cats.most_common(10),
        "high_severity_pages": sorted(set(p for p in high_severity_pages if p is not None)),
    }
    (ROOT / "v1_ocr_summary.json").write_text(
        json.dumps(v1_summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"V1 OCR summary written. {n} samples, verdict={track_verdict}")

    # ---- V3a page-class aggregation (extracted from V1) -----------------
    page_label_verdicts = Counter(r.get("page_label_verdict", "?") for r in results)
    disagreements: list[dict] = []
    for r in results:
        if r.get("page_label_verdict") == "DISAGREE":
            disagreements.append({
                "page": r.get("page"),
                "existing": r.get("page_label_existing"),
                "reviewer": r.get("page_label_reviewer"),
            })

    n_with_label = sum(v for k, v in page_label_verdicts.items() if k in ("AGREE", "DISAGREE"))
    disagree_rate = page_label_verdicts.get("DISAGREE", 0) / max(1, n_with_label)
    if disagree_rate < 0.05:
        v3a_verdict = "PASS"
    elif disagree_rate < 0.12:
        v3a_verdict = "WARN"
    else:
        v3a_verdict = "FAIL"

    v3a_summary = {
        "track": "V3a Page classification",
        "sample_size": n_with_label,
        "verdict": v3a_verdict,
        "verdicts": dict(page_label_verdicts),
        "disagree_rate": round(disagree_rate, 4),
        "disagreements": disagreements,
    }
    (ROOT / "v3a_pageclass_summary.json").write_text(
        json.dumps(v3a_summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"V3a page-class summary written. {n_with_label} samples, verdict={v3a_verdict}")


if __name__ == "__main__":
    main()
