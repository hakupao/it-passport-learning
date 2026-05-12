"""Release-notes composer for D-081 §2.3.

6.11.C.2 deliverable. Pure function: takes parsed JSON dicts + raw
intro markdown + a :class:`GitContext`, returns the full Markdown body
ready for ``gh release create --notes-file``.

File I/O is the orchestrator's job (6.11.C.3). Keeping this pure makes
the composition deterministic + trivially testable.
"""
from __future__ import annotations

from collections import defaultdict
from typing import Any, NamedTuple


class GitContext(NamedTuple):
    """Context surfaced in the Provenance + Reproducibility sections."""

    commit_sha: str
    python_version: str
    adr_ids: tuple[str, ...] = ()
    run_id: str = ""


# Severity ordering for the polish-items table (per D-081 §2.3).
# Lower number = sorted earlier. Unknown severities fall to the bottom.
_SEVERITY_ORDER: dict[str, int] = {"FAIL": 0, "WARN": 1, "INFO": 2}


def _aggregate_polish(items: list[dict[str, Any]]) -> list[tuple[str, str, int]]:
    """Group polish items by (category, severity) → count.

    Returns rows ``(category, severity, count)`` sorted by severity
    (FAIL → WARN → INFO → unknown) then by category alphabetically.
    """
    counts: dict[tuple[str, str], int] = defaultdict(int)
    for item in items:
        category = str(item.get("category", "<unknown>"))
        severity = str(item.get("severity", "<unknown>"))
        counts[(category, severity)] += 1
    return sorted(
        [(c, s, n) for (c, s), n in counts.items()],
        key=lambda row: (_SEVERITY_ORDER.get(row[1], 99), row[0]),
    )


def _format_cost_ledger(cost: dict[str, Any]) -> str:
    """Render the cost-ledger one-liner (Mistral + Anthropic billed/shadow)."""
    mistral_b = float(cost.get("mistral_usd_billed", cost.get("mistral_usd", 0.0)))
    anthropic_b = float(cost.get("anthropic_usd_billed", 0.0))
    anthropic_s = float(cost.get("anthropic_usd_shadow", 0.0))
    return (
        f"Mistral ${mistral_b:.4f} billed, "
        f"Anthropic ${anthropic_b:.4f} billed "
        f"(shadow ${anthropic_s:.4f})"
    )


def compose_notes(
    *,
    cert_id: str,
    version: str,
    index: dict[str, Any],
    polish_items: list[dict[str, Any]],
    cost: dict[str, Any],
    intro_md: str,
    git_context: GitContext,
    title: str | None = None,
) -> str:
    """Compose the GitHub Release body Markdown (per D-081 §2.3).

    All inputs are pre-parsed / pre-read; the orchestrator (6.11.C.3) is
    responsible for loading ``index.json`` / ``polish_items.json`` /
    ``cost.json`` and the hand-written intro file from disk.

    Returns a single Markdown string ready for ``gh release create
    --notes-file`` — no trailing-newline normalization is enforced
    because ``gh`` handles either form.
    """
    if title is None:
        title = f"{cert_id} — Trilingual Edition {version}"

    page_count = int(index.get("page_count", 0))
    entity_count = int(index.get("entity_count", 0))
    leaf_count = int(index.get("trilingual_leaf_count", 0))
    glossary_count = int(index.get("glossary_term_count", 0))
    stage6 = index.get("stage6_summary", {}) or {}
    stage7 = index.get("stage7_summary", {}) or {}

    polish_rows = _aggregate_polish(polish_items)

    lines: list[str] = []
    lines.append(f"# {title}")
    lines.append("")

    # 1. What this is — hand-written intro threaded verbatim.
    lines.append("## What this is")
    lines.append("")
    lines.append(intro_md.strip())
    lines.append("")

    # 2. Build provenance — auto-generated.
    lines.append("## Build provenance")
    lines.append("")
    lines.append(f"- **run_id**: `{git_context.run_id}`")
    lines.append(f"- **commit**: `{git_context.commit_sha}` — full tree at tag")
    lines.append("- **pipeline stages**: 0-7 ✅")
    lines.append(
        f"- **pages**: {page_count} / **entities**: {entity_count} / "
        f"**trilingual leaves**: {leaf_count}"
    )
    lines.append(f"- **glossary terms**: {glossary_count}")
    lines.append(
        f"- **Stage 6 verdict**: {stage6.get('overall_verdict', 'PASS')} — "
        f"PASS={stage6.get('pass_pages', 0)}, "
        f"WARN={stage6.get('warn_pages', 0)}, "
        f"FAIL={stage6.get('fail_pages', 0)}, "
        f"safety_failed={stage6.get('safety_failed', False)}"
    )
    lines.append(
        f"- **Stage 7 dual gate**: A={stage7.get('gate_a_passed', True)}, "
        f"B={stage7.get('gate_b_passed', True)}"
    )
    lines.append(f"- **Cost ledger**: {_format_cost_ledger(cost)}")
    if git_context.adr_ids:
        lines.append(f"- **ADRs at release**: {', '.join(git_context.adr_ids)}")
    lines.append("")

    # 3. Known polish items — auto-aggregated compact table.
    lines.append("## Known polish items")
    lines.append("")
    if polish_rows:
        lines.append("| Category | Severity | Count |")
        lines.append("|---|---|---|")
        for category, severity, n in polish_rows:
            lines.append(f"| {category} | {severity} | {n} |")
    else:
        lines.append("_(none)_")
    lines.append("")
    lines.append("Full per-page detail: see `polish_items.json` asset.")
    lines.append("")

    # 4. How to consume — template.
    cert_dashes = cert_id.replace("_", "-")
    asset_zip = f"{cert_dashes}-output-{version}.zip"
    lines.append("## How to consume")
    lines.append("")
    lines.append(f"- Download `{asset_zip}`")
    lines.append("- Verify: `sha256sum -c SHA256SUMS.txt`")
    lines.append("- Structure: see `output/README.md`")
    lines.append("- Programmatic: start from `index.json`")
    lines.append("")

    # 5. Provenance and reproducibility — auto-generated.
    lines.append("## Provenance and reproducibility")
    lines.append("")
    lines.append(f"- Commit: `{git_context.commit_sha}`")
    lines.append(f"- Python: {git_context.python_version}")
    lines.append("- Build env: see `uv.lock` in tree")
    lines.append(
        f"- Reproducible: `uv run cert-extractor run --cert-id {cert_id} "
        f"--run-id {git_context.run_id} --from-commit {git_context.commit_sha}` "
        "(idempotent per D-008)"
    )
    if git_context.adr_ids:
        lines.append(
            f"- ADRs covering this release: {', '.join(git_context.adr_ids)}"
        )
    lines.append("")

    return "\n".join(lines)
