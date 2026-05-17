#!/usr/bin/env python3
"""Round 1 surgical fixes for defects surfaced in deep validation.

Fixes:
  R1.1 — jp surface "試験にはつしが出る" → "試験にはコレが出る" in 11 captions
         (zh/en translations are already semantically correct; only jp text mismatch)
         Stages touched: ocr/ (intermediate), structured/, translated/, output/pages/{.json,.md}
  R1.2 — page_278 cleaned/: Korean 「에」 → Japanese 「に」 (1 char, intermediate only)
  R1.3 — page_555 ocr/: 「問題15-28 工」 → 「問題15-28 エ」 (1 char, intermediate only)

Note: /data/ is gitignored (D-050) so these edits are operational hygiene.
Validation evidence under validation/.../v1_ocr_r2/ is what gets committed.

R1.4 (page_061 waterfall) and R1.5 (page_199 cloud diagram) require Vision agents
and are NOT in this script (dispatched separately).
"""
from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
RUN = ROOT / "data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19"
LOG = Path(__file__).resolve().parents[1] / "iter_2" / "r1_fixes_log.json"
LOG.parent.mkdir(parents=True, exist_ok=True)

CALLOUT_BAD = "試験にはつしが出る"
CALLOUT_GOOD = "試験にはコレが出る"


def replace_in_json(path: Path, bad: str, good: str) -> tuple[int, list[str]]:
    """Replace bad → good in JSON file's jp-string fields. Returns (count, locations)."""
    if not path.exists():
        return 0, []
    data = json.loads(path.read_text(encoding="utf-8"))
    count = 0
    locations: list[str] = []

    def walk(node, path_keys):
        nonlocal count
        if isinstance(node, dict):
            for k, v in list(node.items()):
                if isinstance(v, str) and bad in v:
                    node[k] = v.replace(bad, good)
                    count += 1
                    locations.append("/".join(path_keys + [k]))
                else:
                    walk(v, path_keys + [k])
        elif isinstance(node, list):
            for i, v in enumerate(node):
                if isinstance(v, str) and bad in v:
                    node[i] = v.replace(bad, good)
                    count += 1
                    locations.append("/".join(path_keys + [str(i)]))
                else:
                    walk(v, path_keys + [str(i)])

    walk(data, [])
    if count:
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return count, locations


def replace_in_text(path: Path, bad: str, good: str) -> int:
    if not path.exists():
        return 0
    txt = path.read_text(encoding="utf-8")
    if bad not in txt:
        return 0
    count = txt.count(bad)
    path.write_text(txt.replace(bad, good), encoding="utf-8")
    return count


def main() -> None:
    log: dict = {
        "round": "R1",
        "date": "2026-05-17",
        "fixes": {
            "R1.1_callout_jp": {"description": f"jp surface '{CALLOUT_BAD}' → '{CALLOUT_GOOD}'", "edits": defaultdict(list)},
            "R1.2_p278_hangul": {"description": "page_278 cleaned/: 에 → に", "edits": defaultdict(list)},
            "R1.3_p555_answer": {"description": "page_555 ocr/: 問題15-28 工 → 問題15-28 エ", "edits": defaultdict(list)},
        },
        "totals": {},
    }

    # ---- R1.1: callout jp fix across structured / translated / output ----
    r1_1 = log["fixes"]["R1.1_callout_jp"]["edits"]

    for stage in ["structured", "translated"]:
        stage_dir = RUN / stage
        for f in sorted(stage_dir.glob("page_*.json")):
            n, locs = replace_in_json(f, CALLOUT_BAD, CALLOUT_GOOD)
            if n:
                r1_1[stage].append({"file": f.name, "count": n, "locations": locs})

    out_dir = RUN / "output/pages"
    for f in sorted(out_dir.glob("page_*.json")):
        n, locs = replace_in_json(f, CALLOUT_BAD, CALLOUT_GOOD)
        if n:
            r1_1["output_json"].append({"file": f.name, "count": n, "locations": locs})
    for f in sorted(out_dir.glob("page_*.md")):
        n = replace_in_text(f, CALLOUT_BAD, CALLOUT_GOOD)
        if n:
            r1_1["output_md"].append({"file": f.name, "count": n})

    # also clean raw OCR for hygiene (gitignored, intermediate)
    for f in sorted((RUN / "ocr").glob("page_*.md")):
        n = replace_in_text(f, CALLOUT_BAD, CALLOUT_GOOD)
        if n:
            r1_1["ocr_md"].append({"file": f.name, "count": n})

    # ---- R1.2: p278 Hangul (cleaned/ only — gitignored intermediate) ----
    r1_2 = log["fixes"]["R1.2_p278_hangul"]["edits"]
    p278_cleaned = RUN / "cleaned/page_278.md"
    if p278_cleaned.exists():
        # Surgical: only the specific phrase
        txt = p278_cleaned.read_text(encoding="utf-8")
        new_txt = txt.replace("人에送って", "人に送って")
        if new_txt != txt:
            count = txt.count("人에送って")
            p278_cleaned.write_text(new_txt, encoding="utf-8")
            r1_2["cleaned"].append({"file": "page_278.md", "count": count, "specific": "人에送って → 人に送って"})

    # ---- R1.3: p555 answer letter (ocr/ only — gitignored intermediate) ----
    r1_3 = log["fixes"]["R1.3_p555_answer"]["edits"]
    p555_ocr = RUN / "ocr/page_555.md"
    if p555_ocr.exists():
        txt = p555_ocr.read_text(encoding="utf-8")
        new_txt = re.sub(r"問題15-28 工", "問題15-28 エ", txt)
        if new_txt != txt:
            count = txt.count("問題15-28 工")
            p555_ocr.write_text(new_txt, encoding="utf-8")
            r1_3["ocr"].append({"file": "page_555.md", "count": count, "specific": "問題15-28 工 → 問題15-28 エ"})

    # ---- totals ----
    totals = {}
    for fix_id, fix in log["fixes"].items():
        n = sum(item["count"] for sub in fix["edits"].values() for item in sub)
        totals[fix_id] = n
    log["totals"] = totals
    # convert defaultdict to dict for JSON
    for f in log["fixes"].values():
        f["edits"] = dict(f["edits"])

    LOG.write_text(json.dumps(log, ensure_ascii=False, indent=2), encoding="utf-8")

    print("R1 fixes applied. Totals:")
    for k, v in totals.items():
        print(f"  {k}: {v} edits")
    print(f"Log: {LOG.relative_to(Path('.').resolve())}")


if __name__ == "__main__":
    main()
