#!/usr/bin/env python3
"""Transactional hand-edit apply for Session 21 Q10-A (Stage 7 closure).

Same pattern as `apply_stage6_hand_edits.py` (Session 20) and
`apply_hand_edits.py` (Session 19):
  1. Pre-validate every entry: path resolves, `before` matches current
     disk value exactly (string == string, int == int).
  2. If any entry fails validation, REFUSE to write anything.
  3. Otherwise apply all entries atomically.
  4. Post-apply re-read each file and confirm the new value is on disk.

Run with `--dry-run` to validate without writing.
Run with `--apply` to actually write (only after user "go apply").
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

RUN_DIR = Path("data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19")
SIDECAR = Path(__file__).parent / "step_06_11_D_7_hand_edits.json"
TRANSLATED_DIR = RUN_DIR / "translated"


def walk(d, path):
    for key in path[:-1]:
        d = d[key]
    return d, path[-1]


def get_value(d, path):
    cur = d
    for key in path:
        cur = cur[key]
    return cur


def validate(entries):
    errors: list[str] = []
    for e in entries:
        eid = e["id"]
        page_file = TRANSLATED_DIR / e["page"]
        if not page_file.exists():
            errors.append(f"[{eid}] page file missing: {page_file}")
            continue
        try:
            data = json.loads(page_file.read_text(encoding="utf-8"))
        except Exception as exc:
            errors.append(f"[{eid}] cannot load {page_file}: {exc}")
            continue
        try:
            actual = get_value(data, e["json_path"])
        except (KeyError, IndexError, TypeError) as exc:
            errors.append(
                f"[{eid}] path {e['json_path']} unresolvable in {page_file}: {exc}"
            )
            continue
        if actual != e["before"]:
            errors.append(
                f"[{eid}] BEFORE mismatch — disk has:\n"
                f"    actual:   {actual!r}\n"
                f"    expected: {e['before']!r}"
            )
            continue
        if e["before"] == e["after"]:
            errors.append(f"[{eid}] before == after; no-op edit")
            continue
    return (len(errors) == 0, errors)


def apply(entries):
    applied: list[str] = []
    for e in entries:
        page_file = TRANSLATED_DIR / e["page"]
        data = json.loads(page_file.read_text(encoding="utf-8"))
        parent, last = walk(data, e["json_path"])
        parent[last] = e["after"]
        page_file.write_text(
            json.dumps(data, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        applied.append(e["id"])
    return applied


def post_verify(entries):
    mismatches: list[str] = []
    for e in entries:
        page_file = TRANSLATED_DIR / e["page"]
        data = json.loads(page_file.read_text(encoding="utf-8"))
        actual = get_value(data, e["json_path"])
        if actual != e["after"]:
            mismatches.append(
                f"[{e['id']}] post-apply mismatch: "
                f"actual={actual!r} expected={e['after']!r}"
            )
    return mismatches


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--dry-run", action="store_true",
                       help="Validate only; refuse to write.")
    group.add_argument("--apply", action="store_true",
                       help="Validate + write + post-verify.")
    args = parser.parse_args()

    entries = json.loads(SIDECAR.read_text(encoding="utf-8"))
    print(f"[apply_stage7_hand_edits] {len(entries)} entries loaded from "
          f"{SIDECAR}")

    ok, errors = validate(entries)
    if not ok:
        print(f"[apply_stage7_hand_edits] VALIDATION FAILED "
              f"({len(errors)} error(s)):")
        for err in errors:
            print(f"  - {err}")
        return 1
    print(f"[apply_stage7_hand_edits] validation passed for all "
          f"{len(entries)} entries")

    if args.dry_run:
        print("[apply_stage7_hand_edits] --dry-run: no writes performed")
        return 0

    applied = apply(entries)
    print(f"[apply_stage7_hand_edits] applied {len(applied)}/{len(entries)}: "
          f"{applied}")

    mismatches = post_verify(entries)
    if mismatches:
        print(f"[apply_stage7_hand_edits] POST-VERIFY FAILED:")
        for m in mismatches:
            print(f"  - {m}")
        return 2
    print(f"[apply_stage7_hand_edits] post-verify clean: "
          f"all {len(entries)} after-values on disk")
    return 0


if __name__ == "__main__":
    sys.exit(main())
