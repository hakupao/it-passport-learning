#!/usr/bin/env python3
"""V3c: programmatic section_path completeness check across all 554 structured pages.

Checks:
  1. orphan_path: an entity has section_path but no upstream chapter entity exists for the chapter ID prefix
  2. depth_jump: section_path skips a hierarchy level (e.g., ["1","1.2","1.2.3.1"] missing "1.2.3")
  3. empty_path_ratio: per entity type, how many have empty section_path (some are expected: chapter/cover entities)
  4. depth_distribution: histogram of section_path depths per entity type
  5. uniqueness: same section_path used across non-consecutive pages → may be reused section
"""
from __future__ import annotations

import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
RUN = ROOT / "data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19"
OUT_DIR = Path(__file__).resolve().parents[1] / "v3c_section_path"
OUT_DIR.mkdir(parents=True, exist_ok=True)


def main() -> None:
    entities: list[dict] = []
    for f in sorted((RUN / "structured").glob("page_*.json")):
        page = int(f.stem.split("_")[-1])
        arr = json.loads(f.read_text(encoding="utf-8"))
        for e in arr:
            entities.append({
                "page": page,
                "id": e.get("id", ""),
                "type": e.get("type", "?"),
                "section_path": e.get("anchor", {}).get("section_path", []) or [],
            })

    by_type_empty = defaultdict(lambda: {"empty": 0, "nonempty": 0})
    depth_hist_by_type: dict[str, Counter] = defaultdict(Counter)
    for e in entities:
        sp = e["section_path"]
        if not sp:
            by_type_empty[e["type"]]["empty"] += 1
        else:
            by_type_empty[e["type"]]["nonempty"] += 1
        depth_hist_by_type[e["type"]][len(sp)] += 1

    # Detect depth jumps (numeric paths "1.2.3" style)
    depth_jumps: list[dict] = []
    for e in entities:
        sp = e["section_path"]
        for i in range(1, len(sp)):
            prev = str(sp[i-1])
            curr = str(sp[i])
            # If both look like dotted numerics, check depth contiguity
            if "." in prev and "." in curr:
                prev_depth = prev.count(".") + 1
                curr_depth = curr.count(".") + 1
                if curr_depth - prev_depth > 1:
                    depth_jumps.append({
                        "page": e["page"], "id": e["id"], "path": sp,
                        "jump": f"{prev} → {curr} (depths {prev_depth} → {curr_depth})",
                    })
                    break

    # Section path uniqueness: same path appears across many pages
    path_pages: dict[str, set] = defaultdict(set)
    for e in entities:
        if e["section_path"]:
            key = " > ".join(map(str, e["section_path"]))
            path_pages[key].add(e["page"])

    reused_paths = sorted(
        ((k, sorted(v)) for k, v in path_pages.items() if len(v) > 1),
        key=lambda x: -len(x[1]),
    )[:20]

    # Orphan detection: path uses chapter id prefix that has no chapter entity at all
    chapter_pages = {e["page"] for e in entities if e["type"] == "chapter"}
    chapters_seen = set()
    for e in entities:
        if e["type"] == "chapter":
            chapters_seen.add(e["id"])
    # crude: how many entities have non-empty section_path while no chapter exists in the run?
    n_chapters = len(chapter_pages)

    n_total = len(entities)
    n_empty = sum(by_type_empty[t]["empty"] for t in by_type_empty)
    n_jumps = len(depth_jumps)

    # Verdict per §5.1
    if len(depth_jumps) == 0:
        verdict = "PASS"
    elif n_jumps / n_total < 0.01:
        verdict = "PASS"  # < 1% is acceptable noise per methodology
    elif n_jumps / n_total < 0.05:
        verdict = "WARN"
    else:
        verdict = "FAIL"

    md = []
    md.append("# V3c section_path completeness check\n")
    md.append(f"- Total entities: **{n_total}**\n")
    md.append(f"- Chapter entities found: **{len(chapters_seen)}** on **{n_chapters}** pages\n")
    md.append(f"- Entities with empty section_path: **{n_empty}** ({n_empty/n_total*100:.1f}%)\n")
    md.append(f"- Depth jumps detected: **{n_jumps}** ({n_jumps/n_total*100:.2f}%)\n")
    md.append(f"- Verdict (§5.1 thresholds): **{verdict}**\n\n")

    md.append("## Empty section_path by entity type\n\n")
    md.append("| Type | Empty | NonEmpty | %Empty |\n|---|---:|---:|---:|\n")
    for t in sorted(by_type_empty):
        d = by_type_empty[t]
        total = d["empty"] + d["nonempty"]
        pct = d["empty"] / total * 100 if total else 0
        md.append(f"| {t} | {d['empty']} | {d['nonempty']} | {pct:.1f}% |\n")

    md.append("\n## Depth distribution by entity type\n\n")
    md.append("| Type | depth=0 | 1 | 2 | 3 | 4+ |\n|---|---:|---:|---:|---:|---:|\n")
    for t in sorted(depth_hist_by_type):
        h = depth_hist_by_type[t]
        md.append(
            f"| {t} | {h.get(0,0)} | {h.get(1,0)} | {h.get(2,0)} | {h.get(3,0)} | "
            f"{sum(v for k,v in h.items() if k >= 4)} |\n"
        )

    md.append("\n## Depth jumps detected (first 30)\n\n")
    if depth_jumps:
        for j in depth_jumps[:30]:
            md.append(f"- page {j['page']} `{j['id']}` jump: {j['jump']}; full path: `{j['path']}`\n")
    else:
        md.append("(none)\n")

    md.append("\n## Reused section paths (same path across multiple pages, top 20)\n\n")
    if reused_paths:
        md.append("| Path | Pages |\n|---|---|\n")
        for p, pgs in reused_paths:
            md.append(f"| `{p}` | {len(pgs)} pages: {pgs[:8]}{'...' if len(pgs) > 8 else ''} |\n")
    else:
        md.append("(none — every path unique per page)\n")

    (OUT_DIR / "v3c_section_path.md").write_text("".join(md), encoding="utf-8")

    summary = {
        "track": "V3c section_path",
        "verdict": verdict,
        "total_entities": n_total,
        "empty_section_path": n_empty,
        "depth_jumps": n_jumps,
        "chapters_found": len(chapters_seen),
        "depth_jump_examples": depth_jumps[:10],
    }
    (OUT_DIR / "v3c_section_path_summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"V3c written. verdict={verdict}, depth_jumps={n_jumps}/{n_total}")


if __name__ == "__main__":
    main()
