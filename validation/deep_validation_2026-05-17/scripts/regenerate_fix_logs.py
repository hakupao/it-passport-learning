#!/usr/bin/env python3
"""Reconstruct r19/r21 fixes logs from the rerun-idempotence outputs.

Why this exists: the original r19_fixes_log.json and r21_fixes_log.json were
overwritten by a code-review-polish-validation re-run of the fix scripts
(idempotence test). The data files on disk are correct (post-fix state); only
the log files lost the original "applied" record.

The re-run logs (now renamed to *_rerun_idempotence.json) contain skip-on-mismatch
entries which are INFORMATIONALLY EQUIVALENT to the original applied entries:
  - skipped.before          == original.after    (current value)
  - skipped.intended_after  == original.after    (script's target)
  - skipped.skip_reason     embeds original.before via "expected '...'"

This script inverts the skip-output to reconstruct the original applied log.
Output: r19_fixes_log.json + r21_fixes_log.json (regenerated).
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ITER5 = ROOT / "validation/deep_validation_2026-05-17/iter_5"
ITER6 = ROOT / "validation/deep_validation_2026-05-17/iter_6"


EXPECTED_RE = re.compile(r"expected\s+(['\"])(.+?)\1\s*$", re.DOTALL)


def _unskip(e: dict) -> dict:
    """Convert a re-run skipped edit back to an original applied edit.

    Handles two shapes:
    - Standard leaf edit: {file, path, before, intended_after, skip_reason}
    - Glossary entry: {fix_id, id, skip_reason, ...}
    """
    out: dict = {}
    # Preserve identifying fields from any shape
    for k in ("fix_id", "id", "file", "path"):
        if k in e:
            out[k] = e[k]
    reason = e.get("skip_reason", "")
    intended = e.get("intended_after") or e.get("after")

    # Leaf-shape: reconstruct before/after from skip_reason
    if "mismatch" in reason or "unexpected value" in reason:
        m = EXPECTED_RE.search(reason)
        if m:
            out["before"] = m.group(2)
            if intended is not None:
                out["after"] = intended
            return out

    # Glossary surface-mismatch shape: skip_reason embeds got/expected dicts
    if "surface mismatch" in reason:
        out["before_surface"] = e.get("before")
        out["after_surface"] = intended or e.get("after")
        out["note"] = "reconstructed; original applied state on disk; see <name>_rerun_idempotence.json for re-run skip evidence"
        return out

    # Fallback: surface whatever's there
    if "before" in e:
        out["before"] = e["before"]
    if intended is not None:
        out["after"] = intended
    return out


def regen_log(rerun_path: Path, out_path: Path, round_id: str, iter_no: int) -> None:
    rerun = json.loads(rerun_path.read_text(encoding="utf-8"))
    out: dict = {
        "round": round_id,
        "iter": iter_no,
        "note": "Reconstructed from *_rerun_idempotence.json after the original log was overwritten by a code-review-polish re-run; data on disk is correct (R20/R22 blind verifiers confirmed). The companion file <name>_rerun_idempotence.json holds the re-run's all-skip output verifying idempotence.",
    }
    sections = [k for k in rerun if k not in ("round", "iter", "md_regen", "summary", "note")]
    applied_count = 0
    skipped_count = 0
    for sec in sections:
        out[sec] = []
        for e in rerun[sec]:
            unskipped = _unskip(e)
            if "skip_reason" not in unskipped:
                applied_count += 1
            else:
                skipped_count += 1
            out[sec].append(unskipped)
    out["md_regen"] = rerun.get("md_regen", [])
    md_count = sum(1 for e in out["md_regen"] if "skip_reason" not in e)
    out["summary"] = {
        "json_edits_applied": applied_count,
        "json_edits_skipped": skipped_count,
        "md_regenerated": md_count,
    }
    out_path.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n",
                        encoding="utf-8")
    print(f"Wrote {out_path}")
    print(f"  applied: {applied_count} / skipped: {skipped_count} / md_regen: {md_count}")


def main() -> None:
    regen_log(
        ITER5 / "r19_fixes_log_rerun_idempotence.json",
        ITER5 / "r19_fixes_log.json",
        "R19", 5,
    )
    regen_log(
        ITER6 / "r21_fixes_log_rerun_idempotence.json",
        ITER6 / "r21_fixes_log.json",
        "R21", 6,
    )


if __name__ == "__main__":
    main()
