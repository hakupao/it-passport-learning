#!/usr/bin/env python3
"""v1.0.2 patch-release publish invocation (post-publication validation harvest).

Forked from `run_release_publish.py` (v1.0.0, Session 22). v1.0.2 carries the
cumulative ~736 JSON edit-units + 46 MD regens from iter-3 → iter-8 deep
validation on top of the v1.0.0 baseline. v1.0.1 was an in-tree-only
candidate (iter-3..6, ~37 % coverage) and never published as a standalone
GitHub Release.

Calls `cert_extractor.release.publish()` with PublishInputs assembled from:
  - data/.../output/ (Stage 7 emitted + iter-3..8 corrections applied)
  - data/.../cost.json (v1.0.0 cost ledger — no LLM cost incurred for iter-3..8)
  - data/.../output/glossary.json (term count, includes F6/F10 fixes)
  - data/.../output/index.json (Stage 6 verdict carried from v1.0.0 — not re-run)
  - data/.../output/polish_items.json (carried from v1.0.0)
  - docs/release-notes/itpassport-r6-v1.0.2-intro.md (new for v1.0.2)
  - Current git HEAD SHA (= post-c8c2c00 commit chain)

Two modes:
  --dry-run  → stages all 6 release assets under data/.../release/<tag>/
              but does NOT invoke `gh` (no public release artifact).
  --confirm  → stages assets THEN runs `gh release create` + `gh release view`,
              producing the public GitHub Release `itpassport-r6-v1.0.2`.

Per D-081 §2.4 + Session 14 C.3 deliverable.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[4]
RUN_DIR = REPO_ROOT / "data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19"
INTRO_MD = REPO_ROOT / "docs/release-notes/itpassport-r6-v1.0.2-intro.md"
EXTRACTOR_SRC = REPO_ROOT / "packages/extractor/src"

sys.path.insert(0, str(EXTRACTOR_SRC))

from cert_extractor.release import PublishInputs, publish, GitContext  # noqa: E402


def _flatten_polish(polish_data: dict) -> list[dict]:
    flat: list[dict] = []
    for page_id, items in (polish_data.get("by_page") or {}).items():
        for it in items:
            flat.append({**it, "category": it.get("issue_type", "<unknown>"), "page": page_id})
    for it in polish_data.get("run_level") or []:
        flat.append({**it, "category": it.get("issue_type", "<unknown>")})
    return flat


def _build_inputs() -> PublishInputs:
    index_raw = json.loads((RUN_DIR / "output/index.json").read_text())
    totals = index_raw.get("totals", {})
    glossary = json.loads((RUN_DIR / "output/glossary.json").read_text())
    glossary_count = (
        len(glossary.get("entries", []))
        if isinstance(glossary, dict)
        else len(glossary) if isinstance(glossary, list) else 0
    )

    index_for_notes = {
        **index_raw,
        "page_count": totals.get("pages", 0),
        "entity_count": totals.get("entities", 0),
        "trilingual_leaf_count": totals.get("leaves", 0),
        "glossary_term_count": glossary_count,
    }

    polish_data = json.loads((RUN_DIR / "output/polish_items.json").read_text())
    flat_polish = _flatten_polish(polish_data)

    cost_raw = json.loads((RUN_DIR / "cost.json").read_text())
    current = cost_raw.get("current", {})
    cost_for_notes = {
        "mistral_usd_billed": current.get("mistral_usd", 0.0),
        "anthropic_usd_billed": 0.0,
        "anthropic_usd_shadow": current.get("anthropic_usd", 0.0),
    }

    commit_sha = subprocess.check_output(
        ["git", "rev-parse", "HEAD"], text=True
    ).strip()

    git_ctx = GitContext(
        commit_sha=commit_sha,
        python_version=(
            f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
        ),
        adr_ids=(
            "D-008",
            "D-069",
            "D-072",
            "D-076",
            "D-077",
            "D-078",
            "D-079",
            "D-080",
            "D-081",
        ),
        run_id="dry_run_2026-05-12T13-23-19",
    )

    return PublishInputs(
        cert_id="itpassport_r6",
        version="v1.0.2",
        output_dir=RUN_DIR / "output",
        intro_md_path=INTRO_MD,
        index_json=index_for_notes,
        polish_items=flat_polish,
        cost=cost_for_notes,
        git_context=git_ctx,
        release_root_dir=RUN_DIR / "release",
        target_sha=commit_sha,
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--dry-run", action="store_true",
                       help="Stage release assets only; no gh call.")
    group.add_argument("--confirm", action="store_true",
                       help="Stage + invoke gh release create. PUBLIC ACTION.")
    args = parser.parse_args()

    inputs = _build_inputs()
    print(f"[release-publish] cert_id        = {inputs.cert_id}")
    print(f"[release-publish] version        = {inputs.version}")
    print(f"[release-publish] output_dir     = {inputs.output_dir}")
    print(f"[release-publish] intro_md_path  = {inputs.intro_md_path}")
    print(f"[release-publish] target_sha     = {inputs.target_sha}")
    print(f"[release-publish] release_root   = {inputs.release_root_dir}")
    print(f"[release-publish] mode           = {'CONFIRM (gh release create)' if args.confirm else 'DRY-RUN'}")

    result = publish(inputs, confirm=args.confirm)
    print(f"\n[release-publish] DONE")
    print(f"  tag          = {result.tag}")
    print(f"  release_url  = {result.release_url or '(none — dry-run)'}")
    print(f"  asset_count  = {len(result.asset_paths)}")
    total_bytes = sum(a.stat().st_size for a in result.asset_paths if a.exists())
    print(f"  total_bytes  = {total_bytes:,} ({total_bytes / 1024 / 1024:.2f} MB)")
    for a in result.asset_paths:
        sz = a.stat().st_size if a.exists() else 0
        print(f"    {a.name:<50} {sz:>12,} bytes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
