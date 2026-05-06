"""CLI entrypoint for cert-extractor.

Per D-023 Layer 2 (CLI). Phase 1 only exposes ``--version``; full
``run / ocr / inspect`` subcommands land alongside the pipeline implementation.
"""
from __future__ import annotations

import click

from cert_extractor import SCHEMA_VERSION, __version__


@click.group(invoke_without_command=True)
@click.version_option(__version__, prog_name="cert-extractor")
@click.pass_context
def main(ctx: click.Context) -> None:
    """cert-extractor — pluggable OCR + LLM-driven extractor for cert exam content."""
    if ctx.invoked_subcommand is None:
        click.echo(f"cert-extractor {__version__} (schema {SCHEMA_VERSION})")
        click.echo("Subcommands will land in Step 4b (pipeline implementation).")


if __name__ == "__main__":
    main()
