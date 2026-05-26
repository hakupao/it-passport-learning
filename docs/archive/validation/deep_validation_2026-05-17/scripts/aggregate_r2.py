#!/usr/bin/env python3
"""Aggregate Round 2 validation outputs (R2.A release-accuracy + R2.B extended V1 sweep)."""
from __future__ import annotations

import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ITER2 = ROOT / "iter_2"


def aggregate_r2a() -> dict:
    """Release-level audit on 10 fixed pages — should all be PASS."""
    results = []
    d = ITER2 / "v_r2_release"
    if not d.exists():
        return {"verdict": "PENDING", "reason": "no R2.A output dir yet"}
    for f in sorted(d.glob("page_*.json")):
        try:
            results.append(json.loads(f.read_text(encoding="utf-8")))
        except Exception as e:
            print(f"  ! parse fail: {f.name}: {e}")
    if not results:
        return {"verdict": "PENDING", "reason": "no R2.A results yet"}

    n = len(results)
    rel_v = Counter(r.get("release_verdict", "?") for r in results)
    findings_top: Counter = Counter()
    fail_pages: list[int] = []
    for r in results:
        for f in r.get("findings", []) or []:
            findings_top[f.get("category", "?")] += 1
            if f.get("severity") == "high":
                fail_pages.append(r.get("page"))

    fail_rate = rel_v.get("FAIL", 0) / n
    warn_rate = rel_v.get("WARN", 0) / n
    if fail_rate == 0 and warn_rate < 0.15:
        verdict = "PASS"
    elif fail_rate < 0.08:
        verdict = "WARN"
    else:
        verdict = "FAIL"

    return {
        "track": "R2.A — Release-level accuracy on fixed pages",
        "sample_size": n,
        "verdict": verdict,
        "release_verdicts": dict(rel_v),
        "pass_rate": round(rel_v.get("PASS", 0)/n, 4),
        "warn_rate": round(warn_rate, 4),
        "fail_rate": round(fail_rate, 4),
        "finding_categories_top": findings_top.most_common(10),
        "high_severity_pages": sorted(set(p for p in fail_pages if p is not None)),
    }


def aggregate_r2b() -> dict:
    """Extended V1 sweep on 60 fresh pages — compare baseline to round-1 V1."""
    results = []
    d = ITER2 / "v_r2_v1ext"
    if not d.exists():
        return {"verdict": "PENDING", "reason": "no R2.B output dir yet"}
    for f in sorted(d.glob("page_*.json")):
        try:
            results.append(json.loads(f.read_text(encoding="utf-8")))
        except Exception as e:
            print(f"  ! parse fail: {f.name}: {e}")
    if not results:
        return {"verdict": "PENDING", "reason": "no R2.B results yet"}

    n = len(results)
    ocr_v = Counter(r.get("ocr_verdict", "?") for r in results)
    label_v = Counter(r.get("page_label_verdict", "?") for r in results)
    findings_top: Counter = Counter()
    high_sev: list[int] = []
    score_sum = 0.0
    for r in results:
        for f in r.get("ocr_findings", []) or []:
            findings_top[f.get("category", "?")] += 1
            if f.get("severity") == "high":
                high_sev.append(r.get("page"))
        if isinstance(r.get("ocr_score"), (int, float)):
            score_sum += float(r["ocr_score"])

    fail_rate = ocr_v.get("FAIL", 0) / n
    warn_rate = ocr_v.get("WARN", 0) / n
    if fail_rate < 0.03 and warn_rate < 0.15:
        verdict = "PASS"
    elif fail_rate < 0.08:
        verdict = "WARN"
    else:
        verdict = "FAIL"

    # Compare against R1 V1 (PASS 57% / WARN 39% / FAIL 4%)
    delta = {
        "pass_delta_vs_r1": round(ocr_v.get("PASS",0)/n - 0.57, 4),
        "fail_delta_vs_r1": round(fail_rate - 0.04, 4),
    }

    # Disagreements
    disagree = [{"page": r.get("page"), "existing": r.get("page_label_existing"), "reviewer": r.get("page_label_reviewer")}
                for r in results if r.get("page_label_verdict") == "DISAGREE"]

    return {
        "track": "R2.B — Extended V1 sweep (60 fresh pages on ORIGINAL release)",
        "sample_size": n,
        "verdict": verdict,
        "ocr_verdicts": dict(ocr_v),
        "pass_rate": round(ocr_v.get("PASS",0)/n, 4),
        "warn_rate": round(warn_rate, 4),
        "fail_rate": round(fail_rate, 4),
        "avg_ocr_score": round(score_sum/n, 4),
        "delta_vs_r1": delta,
        "finding_categories_top": findings_top.most_common(10),
        "high_severity_pages": sorted(set(p for p in high_sev if p is not None)),
        "page_label_verdicts": dict(label_v),
        "label_disagreements": disagree,
    }


def main() -> None:
    r2a = aggregate_r2a()
    r2b = aggregate_r2b()
    summary = {
        "round": "R2",
        "date": "2026-05-17",
        "R2_A_release_accuracy": r2a,
        "R2_B_extended_V1_sweep": r2b,
    }
    out = ITER2 / "r2_summary.json"
    out.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"R2 summary written to {out.relative_to(Path('.').resolve())}")
    print()
    print(f"R2.A verdict: {r2a.get('verdict')} ({r2a.get('sample_size','?')} samples)")
    print(f"R2.B verdict: {r2b.get('verdict')} ({r2b.get('sample_size','?')} samples)")
    if r2b.get("high_severity_pages"):
        print(f"R2.B new high-severity pages: {r2b['high_severity_pages']}")


if __name__ == "__main__":
    main()
