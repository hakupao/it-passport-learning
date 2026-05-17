#!/usr/bin/env python3
"""R9-C: apply all release-impacting fixes surfaced by R9 audit + merge iter_2 staged fixes.

Fixes:
  R9.1 — merge iter_2/fixed_structured/*.json → data/.../structured/  (41 pages)
  R9.2 — merge iter_2/fixed_translated/*.json → data/.../translated/  (41 pages)
  R9.3 — merge iter_2/fixed_output/pages/*.{json,md} → data/.../output/pages/  (~26 pages)
  R9.4 — EN choice-marker dedupe across output+translated:
         pattern "X. y. ..." where X in [A-D] and y in [a-d,i,u,e,o]
         → strip the duplicate "y. " prefix
  R9.5 — p481 jp surface fix: 幅輳 → 輻輳 across structured/translated/output

Operates on canonical /data/.../runs/dry_run_2026-05-12T13-23-19/ directly.

NOTE: /data/ is gitignored (D-050). The v1.0.0 GitHub Release is immutable;
these edits stage data for a v1.0.1 candidate.
"""
from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
RUN = ROOT / "data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19"
ITER2 = ROOT / "validation/deep_validation_2026-05-17/iter_2"
LOG = ROOT / "validation/deep_validation_2026-05-17/iter_3/r9_fixes_log.json"
LOG.parent.mkdir(parents=True, exist_ok=True)

# Pattern for EN duplicate-prefix: "A. a. ..." or "B. i. ..." etc.
# Match any leading [A-D]. followed by one whitespace then a [a-z]. then space
EN_DUP_PAT = re.compile(r"^([A-D])\. ([a-d]|[iueo])\. (.+)$", re.DOTALL)


def replace_in_json_jp(path: Path, bad: str, good: str) -> int:
    """Replace bad → good in any string value of a JSON file. Returns edit count."""
    if not path.exists():
        return 0
    data = json.loads(path.read_text(encoding="utf-8"))
    count = 0

    def walk(node):
        nonlocal count
        if isinstance(node, dict):
            for k, v in list(node.items()):
                if isinstance(v, str) and bad in v:
                    node[k] = v.replace(bad, good)
                    count += 1
                else:
                    walk(v)
        elif isinstance(node, list):
            for i, v in enumerate(node):
                if isinstance(v, str) and bad in v:
                    node[i] = v.replace(bad, good)
                    count += 1
                else:
                    walk(v)

    walk(data)
    if count:
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return count


def dedupe_en_choice_in_json(path: Path) -> int:
    """For every 'en' string field matching '[A-D]. [a-d/iueo]. ...', strip the dup prefix."""
    if not path.exists():
        return 0
    data = json.loads(path.read_text(encoding="utf-8"))
    count = 0

    def walk(node):
        nonlocal count
        if isinstance(node, dict):
            for k, v in node.items():
                if k == "en" and isinstance(v, str):
                    m = EN_DUP_PAT.match(v)
                    if m:
                        node[k] = f"{m.group(1)}. {m.group(3)}"
                        count += 1
                else:
                    walk(v)
        elif isinstance(node, list):
            for v in node:
                walk(v)

    walk(data)
    if count:
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return count


def dedupe_en_choice_in_md(path: Path) -> int:
    """Strip 'A. a. ' → 'A. ' patterns in markdown rendering. Match line-level."""
    if not path.exists():
        return 0
    txt = path.read_text(encoding="utf-8")
    # Match at line start (after optional whitespace), inline form: "A. a. content"
    line_pat = re.compile(r"^(\s*[-*]?\s*)([A-D])\. ([a-d]|[iueo])\. ", re.MULTILINE)
    new_txt, n = line_pat.subn(lambda m: f"{m.group(1)}{m.group(2)}. ", txt)
    if n:
        path.write_text(new_txt, encoding="utf-8")
    return n


def main() -> None:
    log: dict = {
        "round": "R9-C",
        "date": "2026-05-17",
        "stage_1_merge_iter2": {"structured": [], "translated": [], "output_json": [], "output_md": []},
        "stage_2_en_dedupe": {"output_json_edits": [], "output_md_edits": [], "translated_edits": []},
        "stage_3_p481": {"edits": []},
        "totals": {},
    }

    # ---- Stage 1: merge iter_2/fixed_* → canonical ----
    for src_dir, dst_dir, log_key in [
        (ITER2 / "fixed_structured", RUN / "structured", "structured"),
        (ITER2 / "fixed_translated", RUN / "translated", "translated"),
    ]:
        for src_file in sorted(src_dir.glob("page_*.json")):
            dst_file = dst_dir / src_file.name
            # backup original (one-shot — skip if backup already exists)
            backup = dst_file.with_suffix(".json.pre_r9.bak")
            if dst_file.exists() and not backup.exists():
                shutil.copy2(dst_file, backup)
            shutil.copy2(src_file, dst_file)
            log["stage_1_merge_iter2"][log_key].append(src_file.name)

    # output/pages merge (both .json and .md)
    out_src = ITER2 / "fixed_output" / "pages"
    out_dst = RUN / "output" / "pages"
    for src_file in sorted(out_src.glob("page_*.json")):
        dst_file = out_dst / src_file.name
        backup = dst_file.with_suffix(".json.pre_r9.bak")
        if dst_file.exists() and not backup.exists():
            shutil.copy2(dst_file, backup)
        shutil.copy2(src_file, dst_file)
        log["stage_1_merge_iter2"]["output_json"].append(src_file.name)
    for src_file in sorted(out_src.glob("page_*.md")):
        dst_file = out_dst / src_file.name
        backup = dst_file.with_suffix(".md.pre_r9.bak")
        if dst_file.exists() and not backup.exists():
            shutil.copy2(dst_file, backup)
        shutil.copy2(src_file, dst_file)
        log["stage_1_merge_iter2"]["output_md"].append(src_file.name)

    # ---- Stage 2: EN choice-marker dedupe (all pages, output + translated) ----
    for f in sorted((RUN / "output/pages").glob("page_*.json")):
        n = dedupe_en_choice_in_json(f)
        if n:
            log["stage_2_en_dedupe"]["output_json_edits"].append({"file": f.name, "edits": n})
    for f in sorted((RUN / "output/pages").glob("page_*.md")):
        n = dedupe_en_choice_in_md(f)
        if n:
            log["stage_2_en_dedupe"]["output_md_edits"].append({"file": f.name, "edits": n})
    for f in sorted((RUN / "translated").glob("page_*.json")):
        n = dedupe_en_choice_in_json(f)
        if n:
            log["stage_2_en_dedupe"]["translated_edits"].append({"file": f.name, "edits": n})

    # ---- Stage 3: p481 jp 幅輳 → 輻輳 across structured/translated/output ----
    for stage_subdir in ["structured", "translated", "output/pages"]:
        f = RUN / stage_subdir / "page_481.json"
        n = replace_in_json_jp(f, "幅輳", "輻輳")
        if n:
            log["stage_3_p481"]["edits"].append({"file": str(f.relative_to(RUN)), "edits": n})
    # md form
    f = RUN / "output/pages/page_481.md"
    if f.exists():
        txt = f.read_text(encoding="utf-8")
        if "幅輳" in txt:
            new = txt.replace("幅輳", "輻輳")
            f.write_text(new, encoding="utf-8")
            log["stage_3_p481"]["edits"].append({"file": "output/pages/page_481.md", "edits": 1})

    # ---- Totals ----
    log["totals"] = {
        "stage_1_files_merged": sum(len(v) for v in log["stage_1_merge_iter2"].values()),
        "stage_2_en_dedupe_edits": sum(
            sum(e["edits"] for e in log["stage_2_en_dedupe"][k]) for k in log["stage_2_en_dedupe"]
        ),
        "stage_3_p481_edits": sum(e["edits"] for e in log["stage_3_p481"]["edits"]),
    }

    LOG.write_text(json.dumps(log, ensure_ascii=False, indent=2), encoding="utf-8")

    print("R9-C fixes applied. Totals:")
    print(f"  stage_1_files_merged:    {log['totals']['stage_1_files_merged']}")
    print(f"  stage_2_en_dedupe_edits: {log['totals']['stage_2_en_dedupe_edits']}")
    print(f"  stage_3_p481_edits:      {log['totals']['stage_3_p481_edits']}")
    print(f"Log: {LOG.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
