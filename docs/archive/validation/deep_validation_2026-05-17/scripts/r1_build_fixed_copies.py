#!/usr/bin/env python3
"""Round 1 — build PARALLEL fixed copies of affected pages in validation/.../iter_2/.

Does NOT modify the original Phase 1 v1.0.0 release files under /data/.
Original release stays pristine; the fixed copies are a v1.0.1 candidate set
that can be reviewed and (if approved) merged back later.

Outputs:
  validation/.../iter_2/fixed_output/pages/page_NNN.json   ← fixed Stage 7 release JSON
  validation/.../iter_2/fixed_output/pages/page_NNN.md     ← fixed Stage 7 release MD
  validation/.../iter_2/fixed_translated/page_NNN.json     ← fixed Stage 5 (jp surface)
  validation/.../iter_2/fixed_structured/page_NNN.json     ← fixed Stage 4 (jp surface)
  validation/.../iter_2/r1_fixes_log.json                  ← what was changed and where

Fix R1.1 only here (callout jp surface).
R1.2 / R1.3 affect intermediate stages only — no downstream propagation;
  skipping per analysis showing structured/translated/output already clean.
R1.4 / R1.5 dispatched separately (Vision agents).
"""
from __future__ import annotations

import json
import shutil
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
RUN = ROOT / "data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19"
ITER2 = Path(__file__).resolve().parents[1] / "iter_2"
ITER2.mkdir(parents=True, exist_ok=True)

# Output dirs (parallel copies)
FIXED_OUT = ITER2 / "fixed_output" / "pages"
FIXED_TR = ITER2 / "fixed_translated"
FIXED_ST = ITER2 / "fixed_structured"
for d in (FIXED_OUT, FIXED_TR, FIXED_ST):
    d.mkdir(parents=True, exist_ok=True)

CALLOUT_BAD = "試験にはつしが出る"
CALLOUT_GOOD = "試験にはコレが出る"


def replace_jp_in_node(node, count_box):
    """Recursively replace bad callout surface in JSON. Modifies in place."""
    if isinstance(node, dict):
        for k, v in list(node.items()):
            if isinstance(v, str) and CALLOUT_BAD in v:
                node[k] = v.replace(CALLOUT_BAD, CALLOUT_GOOD)
                count_box["count"] += 1
            else:
                replace_jp_in_node(v, count_box)
    elif isinstance(node, list):
        for i, v in enumerate(node):
            if isinstance(v, str) and CALLOUT_BAD in v:
                node[i] = v.replace(CALLOUT_BAD, CALLOUT_GOOD)
                count_box["count"] += 1
            else:
                replace_jp_in_node(v, count_box)


def fix_json(src: Path, dst: Path) -> int:
    if not src.exists():
        return 0
    data = json.loads(src.read_text(encoding="utf-8"))
    box = {"count": 0}
    replace_jp_in_node(data, box)
    if box["count"]:
        dst.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return box["count"]


def fix_md(src: Path, dst: Path) -> int:
    if not src.exists():
        return 0
    txt = src.read_text(encoding="utf-8")
    if CALLOUT_BAD not in txt:
        return 0
    n = txt.count(CALLOUT_BAD)
    dst.write_text(txt.replace(CALLOUT_BAD, CALLOUT_GOOD), encoding="utf-8")
    return n


def main() -> None:
    log: dict = {
        "round": "R1",
        "date": "2026-05-17",
        "strategy": "Parallel fixed copies — original /data/ release left untouched.",
        "fix_R1.1": {"description": f"jp surface '{CALLOUT_BAD}' → '{CALLOUT_GOOD}'", "edits": defaultdict(list)},
        "skipped": {
            "R1.2_p278": "Korean 에 only in cleaned/page_278.md (intermediate); page_278 has 0 structured entities so nothing propagated. Skipping — no release-level fix needed.",
            "R1.3_p555": "Mistral OCR 工 only in ocr/page_555.md (intermediate); Stage 4 LLM correctly extracted エ in structured/translated/output. answer_index=3 maps to choice[3]=エ. Skipping — already correct in release.",
        },
        "deferred_to_vision_agents": {
            "R1.4_p061": "Waterfall chart re-OCR via Claude Vision (see r1_dispatch_p061.md)",
            "R1.5_p199": "4-panel cloud diagram caption extraction via Claude Vision (see r1_dispatch_p199.md)",
        },
        "totals": {},
    }

    affected_pages = set()

    # Structured
    for f in sorted((RUN / "structured").glob("page_*.json")):
        n = fix_json(f, FIXED_ST / f.name)
        if n:
            log["fix_R1.1"]["edits"]["structured"].append({"file": f.name, "count": n})
            affected_pages.add(f.stem)

    # Translated
    for f in sorted((RUN / "translated").glob("page_*.json")):
        n = fix_json(f, FIXED_TR / f.name)
        if n:
            log["fix_R1.1"]["edits"]["translated"].append({"file": f.name, "count": n})
            affected_pages.add(f.stem)

    # Output JSON
    for f in sorted((RUN / "output/pages").glob("page_*.json")):
        n = fix_json(f, FIXED_OUT / f.name)
        if n:
            log["fix_R1.1"]["edits"]["output_json"].append({"file": f.name, "count": n})
            affected_pages.add(f.stem)

    # Output MD
    for f in sorted((RUN / "output/pages").glob("page_*.md")):
        n = fix_md(f, FIXED_OUT / f.name)
        if n:
            log["fix_R1.1"]["edits"]["output_md"].append({"file": f.name, "count": n})
            affected_pages.add(f.stem)

    log["affected_pages"] = sorted(affected_pages)
    totals = {k: sum(item["count"] for item in v) for k, v in log["fix_R1.1"]["edits"].items()}
    log["totals"] = totals
    log["fix_R1.1"]["edits"] = dict(log["fix_R1.1"]["edits"])

    (ITER2 / "r1_fixes_log.json").write_text(json.dumps(log, ensure_ascii=False, indent=2), encoding="utf-8")

    print("R1.1 parallel fixed copies built:")
    for k, v in totals.items():
        print(f"  {k}: {v} edits")
    print(f"  affected_pages: {len(affected_pages)} pages")
    print(f"Log: {(ITER2 / 'r1_fixes_log.json').relative_to(Path('.').resolve())}")


if __name__ == "__main__":
    main()
