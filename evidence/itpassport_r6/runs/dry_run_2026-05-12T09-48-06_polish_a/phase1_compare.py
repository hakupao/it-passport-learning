"""Phase 1 deterministic detector comparison: old (v1 baseline) vs new
(post D-080 polish). No LLM dispatch — per D-080 §2.3 "Stage 6 phase-1
only" acceptance verification.

Usage::

    uv run --project packages/extractor python \\
        evidence/itpassport_r6/runs/dry_run_2026-05-12T09-48-06_polish_a/phase1_compare.py

Prints a compact per-detector PASS/WARN/FAIL/INFO count table for both
runs and writes a JSON evidence dump beside this script.

Acceptance per D-080 §2.3::

    D11 INFO_new == 0
    D13 run-level INFO_new == 0
    D1/D5/D7 FAIL_new == 0 (no regression vs old)
"""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

from cert_extractor.pipeline.stage6_audit.detectors import (
    Phase1Inputs,
    detect_glossary_consistency,
    run_phase1,
)
from cert_extractor.pipeline.stage6_audit.schema import Stage6IssueSeverity
from cert_extractor.schema.glossary import Glossary

OLD_RUN = Path("data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10")
NEW_RUN = Path("data/itpassport_r6/runs/dry_run_2026-05-12T09-48-06_polish_a")
EVIDENCE_DIR = Path(
    "evidence/itpassport_r6/runs/dry_run_2026-05-12T09-48-06_polish_a"
)

CERT_ID = "itpassport_r6"


def _load_glossary(run_dir: Path) -> Glossary:
    return Glossary.model_validate_json(
        (run_dir / "glossary" / "glossary.json").read_text(encoding="utf-8")
    )


def _load_cleaned_or_ocr(run_dir: Path, page: int) -> str:
    cleaned = run_dir / "cleaned" / f"page_{page:03d}.md"
    if cleaned.exists():
        return cleaned.read_text(encoding="utf-8")
    ocr = run_dir / "ocr" / f"page_{page:03d}.md"
    if ocr.exists():
        return ocr.read_text(encoding="utf-8")
    return ""


def _per_page_inputs(run_dir: Path, glossary: Glossary, page: int) -> Phase1Inputs:
    return Phase1Inputs(
        page=page,
        cert_id=CERT_ID,
        run_id=run_dir.name,
        structured_entities=json.loads(
            (run_dir / "structured" / f"page_{page:03d}.json").read_text(
                encoding="utf-8"
            )
        ),
        translated_entities=json.loads(
            (run_dir / "translated" / f"page_{page:03d}.json").read_text(
                encoding="utf-8"
            )
        ),
        glossary=glossary,
        cleaned_text=_load_cleaned_or_ocr(run_dir, page),
    )


def _audit_one(run_dir: Path) -> tuple[dict, list[dict]]:
    """Return (counts_by_detector_x_severity, run_level_issues_dump)."""
    glossary = _load_glossary(run_dir)
    pages = sorted(
        int(p.stem.replace("page_", ""))
        for p in (run_dir / "translated").glob("page_*.json")
    )
    counts: Counter[tuple[str, str]] = Counter()
    for page in pages:
        for issue in run_phase1(_per_page_inputs(run_dir, glossary, page)):
            counts[(issue.issue_type, issue.severity.value)] += 1
    run_level = detect_glossary_consistency(glossary)
    for issue in run_level:
        counts[(issue.issue_type, issue.severity.value)] += 1
    return (
        {f"{detector}__{sev}": n for (detector, sev), n in counts.items()},
        [issue.model_dump() for issue in run_level],
    )


def main() -> int:
    print("=" * 78)
    print(f"OLD run: {OLD_RUN}")
    print(f"NEW run: {NEW_RUN}")
    print("=" * 78)

    old_counts, old_runlvl = _audit_one(OLD_RUN)
    new_counts, new_runlvl = _audit_one(NEW_RUN)

    keys = sorted(set(old_counts) | set(new_counts))
    print(f"{'detector__severity':<48} {'OLD':>6} {'NEW':>6} {'Δ':>6}")
    print("-" * 78)
    deltas: dict[str, int] = {}
    for key in keys:
        old = old_counts.get(key, 0)
        new = new_counts.get(key, 0)
        delta = new - old
        deltas[key] = delta
        marker = "  " if delta == 0 else ("--" if delta < 0 else "++")
        print(f"{key:<48} {old:>6} {new:>6} {delta:>+6} {marker}")
    print("=" * 78)

    targets = {
        "D-080 acceptance: D11 INFO new == 0": new_counts.get(
            "kana_helper_missing__info", 0
        ) == 0
        and new_counts.get("kana_helper_unexpected__info", 0) == 0,
        "D-080 acceptance: D13 run-level INFO new == 0": new_counts.get(
            "glossary_self_consistency__info", 0
        ) == 0,
        "Regression guard: D1 jp_mutation FAIL new == 0": new_counts.get(
            "jp_mutation__fail", 0
        ) == 0,
        "Regression guard: D5 answer_index_mismatch FAIL new == 0": new_counts.get(
            "answer_index_mismatch__fail", 0
        ) == 0,
        "Regression guard: D7 numeric_inconsistent FAIL new == 0": new_counts.get(
            "numeric_inconsistent__fail", 0
        ) == 0,
    }
    print("Acceptance checks:")
    for label, ok in targets.items():
        print(f"  {'PASS' if ok else 'FAIL'}  {label}")

    overall = all(targets.values())
    print("-" * 78)
    print(f"OVERALL  {'PASS' if overall else 'FAIL'}")

    dump_path = EVIDENCE_DIR / "phase1_compare.json"
    dump_path.write_text(
        json.dumps(
            {
                "old_run": str(OLD_RUN),
                "new_run": str(NEW_RUN),
                "old_counts": old_counts,
                "new_counts": new_counts,
                "deltas": deltas,
                "old_run_level_issues": old_runlvl,
                "new_run_level_issues": new_runlvl,
                "acceptance": {label: ok for label, ok in targets.items()},
                "overall_pass": overall,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    print(f"Dump → {dump_path}")
    return 0 if overall else 1


if __name__ == "__main__":
    raise SystemExit(main())
