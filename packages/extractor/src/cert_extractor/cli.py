"""CLI entrypoint for cert-extractor.

Per D-023 Layer 2 (CLI). Phase 1 ships ``--version`` and ``dry-run``;
the full ``run / inspect`` subcommand set lands after dry-run user retro.
"""
from __future__ import annotations

import os
import sys
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import click

from cert_extractor import SCHEMA_VERSION, __version__


@click.group(invoke_without_command=True)
@click.version_option(__version__, prog_name="cert-extractor")
@click.pass_context
def main(ctx: click.Context) -> None:
    """cert-extractor — pluggable OCR + LLM-driven extractor for cert exam content."""
    if ctx.invoked_subcommand is None:
        click.echo(f"cert-extractor {__version__} (schema {SCHEMA_VERSION})")
        click.echo("Subcommands: dry-run [--help]")


@main.command("dry-run")
@click.option(
    "--source",
    "source_path",
    required=True,
    type=click.Path(exists=True, dir_okay=False, path_type=Path),
    help="Path to source EPUB.",
)
@click.option(
    "--cert-id",
    default="itpassport_r6",
    show_default=True,
    help="cert-agnostic identifier (D-010).",
)
@click.option(
    "--page-limit",
    default=50,
    show_default=True,
    type=int,
    help="Max pages for the dry-run (per D-070 default ~50).",
)
@click.option(
    "--data-dir",
    default="data",
    show_default=True,
    type=click.Path(file_okay=False, path_type=Path),
    help="Root dir for runtime data (per D-053).",
)
@click.option(
    "--confirm",
    is_flag=True,
    default=False,
    help=(
        "REQUIRED to actually invoke the Mistral OCR API and spend money. "
        "Without --confirm, prints what would happen and exits."
    ),
)
def dry_run(
    source_path: Path,
    cert_id: str,
    page_limit: int,
    data_dir: Path,
    confirm: bool,
) -> None:
    """Stage 0 + Stage 1 dry-run on a single chapter (per D-070 + D-073 Stage A)."""
    from cert_extractor.plugins.base import get_plugin
    from cert_extractor.plugins.loader import PluginLoader

    PluginLoader().load_all()  # populate registry

    timestamp = datetime.now(tz=ZoneInfo("Asia/Tokyo")).strftime("%Y-%m-%dT%H-%M-%S")
    run_id = f"dry_run_{timestamp}"
    run_dir = Path(data_dir) / cert_id / "runs" / run_id

    click.echo(f"[dry-run] cert_id    = {cert_id}")
    click.echo(f"[dry-run] source     = {source_path}")
    click.echo(f"[dry-run] run_id     = {run_id}")
    click.echo(f"[dry-run] run_dir    = {run_dir}")
    click.echo(f"[dry-run] page_limit = {page_limit}")
    click.echo(
        f"[dry-run] estimated  ≈ ${page_limit / 1000:.4f} (Mistral Scale $1/1000 pages)"
    )

    if not confirm:
        click.echo("")
        click.echo(
            "[dry-run] --confirm NOT passed; aborting before any API call. "
            "Re-run with --confirm to actually execute (will spend money + use quota)."
        )
        sys.exit(0)

    # Verify env var before constructing plugins (fail fast).
    if not os.environ.get("MISTRAL_API_KEY"):
        click.echo(
            "[dry-run] ERROR: MISTRAL_API_KEY not set. Export it before --confirm.",
            err=True,
        )
        sys.exit(2)

    source_cls = get_plugin("source", "epub_image")
    ocr_cls = get_plugin("ocr", "mistral")

    # Late import to avoid pulling pipeline (and indirectly Mistral SDK) at unit-test time.
    from cert_extractor.pipeline.runner import Stage0_1DryRunner

    runner = Stage0_1DryRunner(
        source_plugin=source_cls(),
        ocr_plugin=ocr_cls(),
    )

    click.echo("[dry-run] starting…")
    result = runner.run(
        source_path=str(source_path),
        run_dir=run_dir,
        cert_id=cert_id,
        run_id=run_id,
        page_limit=page_limit,
    )

    click.echo("")
    click.echo(f"[dry-run] DONE   pages_unpacked = {result.pages_unpacked}")
    click.echo(f"[dry-run]        pages_ocrd     = {result.pages_ocrd}")
    click.echo(f"[dry-run]        fail_count     = {result.fail_count}")
    click.echo(f"[dry-run]        verdict_halted = {result.halted_verdict}")
    click.echo(f"[dry-run]        cost.json      = {result.cost_path}")
    click.echo(f"[dry-run]        output_dir     = {result.output_dir}")


if __name__ == "__main__":
    main()
