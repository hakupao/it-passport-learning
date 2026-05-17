#!/usr/bin/env python3
"""Round 3 surgical fixes for defects surfaced by R2 extended sweep.

R3.1 — p055: 損益分歧点 → 損益分岐点 in jp caption (zh/en already correct).
       Apply as parallel fixed copy in iter_2/fixed_*.

R3.2 — p153: Vision agent (separate dispatch).
R3.3 — p221: Vision agent (separate dispatch).
R3.4 — p323: Vision agent (separate dispatch — structured was empty).
"""
from __future__ import annotations

import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
RUN = ROOT / "data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19"
ITER2 = Path(__file__).resolve().parents[1] / "iter_2"
FIXED_OUT = ITER2 / "fixed_output" / "pages"
FIXED_TR = ITER2 / "fixed_translated"
FIXED_ST = ITER2 / "fixed_structured"

BAD = "損益分歧点"
GOOD = "損益分岐点"


def replace_jp_recursive(node, count_box):
    if isinstance(node, dict):
        for k, v in list(node.items()):
            if isinstance(v, str) and BAD in v:
                # only replace in jp-field paths (zh uses 分歧 legitimately)
                node[k] = v.replace(BAD, GOOD)
                count_box["count"] += 1
            else:
                replace_jp_recursive(v, count_box)
    elif isinstance(node, list):
        for i, v in enumerate(node):
            if isinstance(v, str) and BAD in v:
                node[i] = v.replace(BAD, GOOD)
                count_box["count"] += 1
            else:
                replace_jp_recursive(v, count_box)


def fix_jp_only(src: Path, dst: Path) -> int:
    if not src.exists():
        return 0
    data = json.loads(src.read_text(encoding="utf-8"))
    box = {"count": 0}

    # Walk only into 'jp' fields where BAD appears
    def walk(node):
        if isinstance(node, dict):
            for k, v in list(node.items()):
                if k == "jp" and isinstance(v, str) and BAD in v:
                    node[k] = v.replace(BAD, GOOD)
                    box["count"] += 1
                else:
                    walk(v)
        elif isinstance(node, list):
            for v in node:
                walk(v)

    walk(data)
    if box["count"]:
        dst.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return box["count"]


def fix_md(src: Path, dst: Path) -> int:
    if not src.exists():
        return 0
    txt = src.read_text(encoding="utf-8")
    # Output md may contain mixed jp+zh+en; replace only the jp occurrence
    # The bug is "損益分歧点" appearing where the jp original term is rendered
    if BAD not in txt:
        return 0
    n = txt.count(BAD)
    dst.write_text(txt.replace(BAD, GOOD), encoding="utf-8")
    return n


def main() -> None:
    log = {"round": "R3", "date": "2026-05-17", "fix_R3.1_p055": {"edits": {}}}
    affected = {"page_055"}

    # Apply across structured / translated / output for p055
    targets = [
        (RUN / "structured/page_055.json", FIXED_ST / "page_055.json"),
        (RUN / "translated/page_055.json", FIXED_TR / "page_055.json"),
        (RUN / "output/pages/page_055.json", FIXED_OUT / "page_055.json"),
    ]
    for src, dst in targets:
        n = fix_jp_only(src, dst)
        if n:
            log["fix_R3.1_p055"]["edits"][src.parent.name] = n

    md_src = RUN / "output/pages/page_055.md"
    md_dst = FIXED_OUT / "page_055.md"
    n_md = fix_md(md_src, md_dst)
    if n_md:
        log["fix_R3.1_p055"]["edits"]["output_md"] = n_md

    log["affected_pages"] = sorted(affected)
    (ITER2 / "r3_fixes_log.json").write_text(json.dumps(log, ensure_ascii=False, indent=2), encoding="utf-8")
    print("R3.1 p055 fix applied:")
    for k, v in log["fix_R3.1_p055"]["edits"].items():
        print(f"  {k}: {v} edits")


if __name__ == "__main__":
    main()
