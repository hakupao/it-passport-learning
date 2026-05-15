"""Apply hand-edit drafts from step_06_11_D_5_stuck_leaves.json onto translated/page_*.json.

Walks each entry's `json_path` (format: `$[N].key[M]...` with `$` = root,
`[N]` = list index, `.key` = dict key) and replaces the matching
trilingual leaf's `zh` and `en` (which must currently be `<UNTRANSLATED>`)
with `draft_zh` and `draft_en` from the sidecar. `jp` is never touched
(D-075 jp-preservation contract).

Usage:
    uv run --project packages/extractor python evidence/.../apply_hand_edits.py \
        --sidecar evidence/.../step_06_11_D_5_stuck_leaves.json \
        --translated-dir data/.../translated \
        [--dry-run]

Exits non-zero on any structural mismatch — no in-place edit is committed
if any leaf can't be located or already has non-UNTRANSLATED values.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any


_PATH_TOKEN_RE = re.compile(r"\.([A-Za-z_][A-Za-z0-9_]*)|\[(\d+)\]")


def _parse_path(path: str) -> list[int | str]:
    """`$[7].rows[2][1]` → [7, 'rows', 2, 1]."""
    if not path.startswith("$"):
        raise ValueError(f"path must start with '$': {path!r}")
    tokens: list[int | str] = []
    for m in _PATH_TOKEN_RE.finditer(path[1:]):
        key, idx = m.groups()
        tokens.append(int(idx) if idx is not None else key)
    return tokens


def _resolve(doc: Any, tokens: list[int | str]) -> Any:
    node = doc
    for t in tokens:
        node = node[t]
    return node


def apply_one(translated_root: Path, entry: dict, *, dry_run: bool) -> tuple[bool, str]:
    page_path = translated_root / entry["page"]
    if not page_path.exists():
        return False, f"missing file: {page_path}"
    doc = json.loads(page_path.read_text(encoding="utf-8"))
    tokens = _parse_path(entry["json_path"])
    try:
        leaf = _resolve(doc, tokens)
    except (KeyError, IndexError, TypeError) as e:
        return False, f"path not resolvable in {page_path.name}: {entry['json_path']} ({e!r})"
    if not isinstance(leaf, dict) or not {"jp", "zh", "en"} <= set(leaf):
        return False, f"leaf at {entry['json_path']} in {page_path.name} is not a trilingual leaf"
    if leaf["jp"] != entry["jp"]:
        return False, (
            f"jp mismatch at {entry['json_path']} in {page_path.name}: "
            f"sidecar.jp != on-disk.jp (D-075 says jp must be unchanged)"
        )
    # Allow either current `<UNTRANSLATED>` (first apply) or already-drafted
    # values (idempotent re-apply with no drift). Refuse anything else.
    for fld in ("zh", "en"):
        cur = leaf[fld]
        draft = entry[f"draft_{fld}"]
        if "<UNTRANSLATED>" not in cur and cur != draft:
            return False, (
                f"{fld} at {entry['json_path']} in {page_path.name} is already "
                f"non-UNTRANSLATED and differs from draft (cur={cur[:40]!r}, "
                f"draft={draft[:40]!r}) — refuse to overwrite"
            )
    if dry_run:
        return True, "would apply"
    leaf["zh"] = entry["draft_zh"]
    leaf["en"] = entry["draft_en"]
    page_path.write_text(
        json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    return True, "applied"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--sidecar", required=True, type=Path)
    ap.add_argument("--translated-dir", required=True, type=Path)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    entries = json.loads(args.sidecar.read_text(encoding="utf-8"))
    print(f"Loaded {len(entries)} sidecar entries from {args.sidecar}")
    print(f"Translated dir: {args.translated_dir}")
    print(f"Mode: {'DRY-RUN' if args.dry_run else 'APPLY'}")
    print("-" * 60)

    # Pre-validate everything before any write (transactional spirit).
    failures: list[str] = []
    for i, e in enumerate(entries):
        ok, msg = apply_one(args.translated_dir, e, dry_run=True)
        if not ok:
            failures.append(f"[{i}] {e['page']} {e['json_path']}: {msg}")

    if failures:
        print(f"PRE-VALIDATION FAILED: {len(failures)} issue(s)")
        for f in failures[:10]:
            print(f"  {f}")
        if len(failures) > 10:
            print(f"  ... and {len(failures) - 10} more")
        return 2

    print(f"Pre-validation PASS for all {len(entries)} entries.")

    if args.dry_run:
        print("DRY-RUN complete — no writes performed.")
        return 0

    # Apply phase.
    n_applied = 0
    for i, e in enumerate(entries):
        ok, msg = apply_one(args.translated_dir, e, dry_run=False)
        if not ok:
            print(f"[{i}] APPLY FAILED: {e['page']} {e['json_path']}: {msg}")
            return 3
        n_applied += 1
    print(f"Applied {n_applied} / {len(entries)} hand-edits.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
