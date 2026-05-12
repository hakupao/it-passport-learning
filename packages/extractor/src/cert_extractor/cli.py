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
from cert_extractor.budget.monitor import (
    DEFAULT_HARD,
    DEFAULT_SOFT,
    BudgetMonitor,
    CapLevels,
)


def _build_monitor(
    anthropic_soft_usd: float | None,
    anthropic_hard_usd: float | None,
) -> BudgetMonitor:
    """Build a BudgetMonitor with optional anthropic cap overrides (D-071)."""
    soft = DEFAULT_SOFT
    hard = DEFAULT_HARD
    if anthropic_soft_usd is not None:
        soft = CapLevels(
            wall_time_seconds=soft.wall_time_seconds,
            mistral_usd=soft.mistral_usd,
            anthropic_usd=anthropic_soft_usd,
            fail_count=soft.fail_count,
        )
    if anthropic_hard_usd is not None:
        hard = CapLevels(
            wall_time_seconds=hard.wall_time_seconds,
            mistral_usd=hard.mistral_usd,
            anthropic_usd=anthropic_hard_usd,
            fail_count=hard.fail_count,
        )
    return BudgetMonitor(soft=soft, hard=hard)


@click.group(invoke_without_command=True)
@click.version_option(__version__, prog_name="cert-extractor")
@click.pass_context
def main(ctx: click.Context) -> None:
    """cert-extractor — pluggable OCR + LLM-driven extractor for cert exam content."""
    if ctx.invoked_subcommand is None:
        click.echo(f"cert-extractor {__version__} (schema {SCHEMA_VERSION})")
        click.echo(
            "Subcommands: dry-run | classify-pages | hard-reocr | extract-structure | extract-glossary | translate-entities | audit-trilingual | export-trilingual | stage [--help]"
        )


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


@main.command("classify-pages")
@click.option(
    "--ocr-dir",
    "ocr_dir",
    required=True,
    type=click.Path(exists=True, file_okay=False, path_type=Path),
    help="Directory of stage-1 OCR markdown (e.g. data/<cert>/runs/<run_id>/ocr).",
)
@click.option(
    "--cert-id",
    default="itpassport_r6",
    show_default=True,
)
@click.option(
    "--page-limit",
    default=None,
    type=int,
    help="Optional cap on pages to classify (for re-runs / partial sweeps).",
)
@click.option(
    "--data-dir",
    default="data",
    show_default=True,
    type=click.Path(file_okay=False, path_type=Path),
)
@click.option(
    "--run-id",
    default=None,
    help=(
        "Reuse an existing run_id (writes classified/ into the same run dir). "
        "Defaults to inferring from --ocr-dir's parent."
    ),
)
@click.option(
    "--tier",
    type=click.Choice(["haiku", "sonnet", "opus"]),
    default="sonnet",
    show_default=True,
    help="Claude model tier (per D-061).",
)
@click.option(
    "--confirm",
    is_flag=True,
    default=False,
    help=(
        "REQUIRED to actually invoke Claude (consumes max-plan quota or "
        "ANTHROPIC_API_KEY budget). Without --confirm, prints plan and exits."
    ),
)
def classify_pages(
    ocr_dir: Path,
    cert_id: str,
    page_limit: int | None,
    data_dir: Path,
    run_id: str | None,
    tier: str,
    confirm: bool,
) -> None:
    """Stage 2 page classify (per D-008 stage 2 + D-069 LLM access)."""
    inferred_run_id = run_id or ocr_dir.parent.name
    run_dir = ocr_dir.parent

    file_count = sum(1 for _ in ocr_dir.glob("page_*.md"))
    target_count = min(file_count, page_limit) if page_limit else file_count

    click.echo(f"[classify-pages] cert_id    = {cert_id}")
    click.echo(f"[classify-pages] ocr_dir    = {ocr_dir}")
    click.echo(f"[classify-pages] run_dir    = {run_dir}")
    click.echo(f"[classify-pages] run_id     = {inferred_run_id}")
    click.echo(f"[classify-pages] tier       = {tier}")
    click.echo(f"[classify-pages] pages      = {target_count} (of {file_count} on disk)")

    if not confirm:
        click.echo("")
        click.echo(
            "[classify-pages] --confirm NOT passed; aborting before any Claude call. "
            "Re-run with --confirm to actually execute (consumes quota / budget)."
        )
        sys.exit(0)

    # Late import — avoids loading claude-agent-sdk during plain --help.
    from cert_extractor.pipeline.stage2_classify import (
        Stage2PageClassifier,
        make_classifier_factory,
    )

    classifier = make_classifier_factory(tier=tier)()
    runner = Stage2PageClassifier(classifier=classifier)

    click.echo("[classify-pages] starting…")
    result = runner.run(
        ocr_dir=ocr_dir,
        run_dir=run_dir,
        cert_id=cert_id,
        run_id=inferred_run_id,
        page_limit=page_limit,
    )

    click.echo("")
    click.echo(f"[classify-pages] DONE   pages_classified = {result.pages_classified}")
    click.echo(f"[classify-pages]        fail_count       = {result.fail_count}")
    click.echo(f"[classify-pages]        verdict_halted   = {result.halted_verdict}")
    click.echo(f"[classify-pages]        by_label         = {result.by_label}")
    click.echo(f"[classify-pages]        cost.json        = {result.cost_path}")
    click.echo(f"[classify-pages]        output_dir       = {result.output_dir}")


@main.command("hard-reocr")
@click.option(
    "--ocr-dir",
    "ocr_dir",
    required=True,
    type=click.Path(exists=True, file_okay=False, path_type=Path),
    help="Directory of stage-1 OCR markdown.",
)
@click.option(
    "--raw-dir",
    "raw_dir",
    required=True,
    type=click.Path(exists=True, file_okay=False, path_type=Path),
    help="Directory of raw page images (page_NNN.jpg).",
)
@click.option("--cert-id", default="itpassport_r6", show_default=True)
@click.option(
    "--page-limit",
    default=None,
    type=int,
)
@click.option(
    "--force-pages",
    default="",
    help="Comma-separated page numbers to re-OCR regardless of heuristic (e.g. '2,16').",
)
@click.option(
    "--all-pages",
    is_flag=True,
    default=False,
    help="Force Vision re-OCR on EVERY page in --ocr-dir (bypasses heuristic). Use for full-engine comparison runs.",
)
@click.option(
    "--output-subdir",
    default="cleaned",
    show_default=True,
    help="Subdirectory under run_dir for output (e.g. 'cleaned' or 'vision_full' for parallel comparison runs).",
)
@click.option(
    "--skip-existing/--no-skip-existing",
    default=False,
    show_default=True,
    help="Skip pages that already have output in --output-subdir (idempotent re-run).",
)
@click.option(
    "--run-id",
    default=None,
    help="Reuse run_id; defaults to the parent dir of --ocr-dir.",
)
@click.option(
    "--tier",
    type=click.Choice(["haiku", "sonnet", "opus"]),
    default="sonnet",
    show_default=True,
)
@click.option(
    "--anthropic-soft-usd",
    default=None,
    type=float,
    help="Override D-071 anthropic_usd soft cap (default $5).",
)
@click.option(
    "--anthropic-hard-usd",
    default=None,
    type=float,
    help="Override D-071 anthropic_usd hard cap (default $30).",
)
@click.option(
    "--dry",
    is_flag=True,
    default=False,
    help="Run heuristic only — print which pages WOULD be re-OCR'd, then exit. No --confirm needed.",
)
@click.option(
    "--confirm",
    is_flag=True,
    default=False,
    help="REQUIRED to actually invoke Claude Vision (consumes quota / budget).",
)
def hard_reocr(
    ocr_dir: Path,
    raw_dir: Path,
    cert_id: str,
    page_limit: int | None,
    force_pages: str,
    all_pages: bool,
    output_subdir: str,
    skip_existing: bool,
    run_id: str | None,
    tier: str,
    anthropic_soft_usd: float | None,
    anthropic_hard_usd: float | None,
    dry: bool,
    confirm: bool,
) -> None:
    """Stage 3 hard re-OCR (per D-008 stage 3 + D-007 + D-069)."""
    from cert_extractor.pipeline.quality import assess

    inferred_run_id = run_id or ocr_dir.parent.name
    run_dir = ocr_dir.parent

    forced: list[int] = []
    if force_pages.strip():
        forced = [int(x.strip()) for x in force_pages.split(",") if x.strip()]

    page_files = sorted(ocr_dir.glob("page_*.md"))
    if page_limit is not None:
        page_files = page_files[:page_limit]

    if all_pages:
        forced = [int(p.stem.split("_")[1]) for p in page_files]

    flagged: list[tuple[int, str]] = []
    for path in page_files:
        page_number = int(path.stem.split("_")[1])
        text = path.read_text(encoding="utf-8")
        qv = assess(text)
        if qv.degenerate or page_number in forced:
            tag = "FORCED" if page_number in forced and not qv.degenerate else qv.reason
            flagged.append((page_number, tag))

    click.echo(f"[hard-reocr] cert_id        = {cert_id}")
    click.echo(f"[hard-reocr] ocr_dir        = {ocr_dir}")
    click.echo(f"[hard-reocr] raw_dir        = {raw_dir}")
    click.echo(f"[hard-reocr] run_id         = {inferred_run_id}")
    click.echo(f"[hard-reocr] tier           = {tier}")
    click.echo(f"[hard-reocr] output_subdir  = {output_subdir}")
    click.echo(f"[hard-reocr] all_pages      = {all_pages}")
    click.echo(f"[hard-reocr] skip_existing  = {skip_existing}")
    click.echo(f"[hard-reocr] inspected      = {len(page_files)} pages")
    click.echo(f"[hard-reocr] flagged        = {len(flagged)} pages")
    for page_number, reason in flagged:
        click.echo(f"[hard-reocr]   page_{page_number:03d}  {reason}")

    if dry or not confirm:
        click.echo("")
        if dry:
            click.echo("[hard-reocr] --dry passed; heuristic-only run complete. Exiting.")
        else:
            click.echo(
                "[hard-reocr] --confirm NOT passed; aborting before any Claude Vision call."
            )
        sys.exit(0)

    from cert_extractor.pipeline.stage3_reocr import (
        Stage3HardReocr,
        make_engine_factory,
    )

    engine = make_engine_factory(tier=tier)()
    monitor = _build_monitor(
        anthropic_soft_usd=anthropic_soft_usd,
        anthropic_hard_usd=anthropic_hard_usd,
    )
    runner = Stage3HardReocr(engine=engine, monitor=monitor)

    click.echo("[hard-reocr] starting Vision re-OCR…")
    result = runner.run(
        ocr_dir=ocr_dir,
        raw_dir=raw_dir,
        run_dir=run_dir,
        cert_id=cert_id,
        run_id=inferred_run_id,
        page_limit=page_limit,
        force_pages=forced or None,
        output_subdir=output_subdir,
        skip_existing=skip_existing,
    )

    click.echo("")
    click.echo(f"[hard-reocr] DONE   inspected = {result.pages_inspected}")
    click.echo(f"[hard-reocr]        flagged   = {result.pages_flagged}  {result.flagged_pages}")
    click.echo(f"[hard-reocr]        re-OCR'd  = {result.pages_reocrd}")
    click.echo(f"[hard-reocr]        fail_count= {result.fail_count}")
    click.echo(f"[hard-reocr]        verdict   = {result.halted_verdict}")
    click.echo(f"[hard-reocr]        cleaned/  = {result.output_dir}")
    click.echo(f"[hard-reocr]        cost.json = {result.cost_path}")


@main.command("extract-structure")
@click.option(
    "--ocr-dir",
    "ocr_dir",
    required=True,
    type=click.Path(exists=True, file_okay=False, path_type=Path),
)
@click.option(
    "--classified-dir",
    "classified_dir",
    required=True,
    type=click.Path(exists=True, file_okay=False, path_type=Path),
)
@click.option(
    "--cleaned-dir",
    "cleaned_dir",
    default=None,
    type=click.Path(file_okay=False, path_type=Path),
    help="Optional Stage 3 cleaned/ output; pages here override ocr/.",
)
@click.option("--cert-id", default="itpassport_r6", show_default=True)
@click.option("--page-limit", default=None, type=int)
@click.option("--run-id", default=None, help="Defaults to parent dir name of --ocr-dir.")
@click.option(
    "--tier",
    type=click.Choice(["haiku", "sonnet", "opus"]),
    default="sonnet",
    show_default=True,
)
@click.option(
    "--skip-existing/--no-skip-existing",
    default=True,
    show_default=True,
    help="Skip pages that already have structured/page_NNN.json (idempotent re-run).",
)
@click.option(
    "--anthropic-soft-usd",
    default=None,
    type=float,
    help="Override D-071 anthropic_usd soft cap (default $5).",
)
@click.option(
    "--anthropic-hard-usd",
    default=None,
    type=float,
    help="Override D-071 anthropic_usd hard cap (default $30).",
)
@click.option(
    "--confirm",
    is_flag=True,
    default=False,
    help=(
        "REQUIRED to actually invoke Claude (consumes max-plan quota or "
        "ANTHROPIC_API_KEY budget). Without --confirm, prints plan and exits."
    ),
)
def extract_structure(
    ocr_dir: Path,
    classified_dir: Path,
    cleaned_dir: Path | None,
    cert_id: str,
    page_limit: int | None,
    run_id: str | None,
    tier: str,
    skip_existing: bool,
    anthropic_soft_usd: float | None,
    anthropic_hard_usd: float | None,
    confirm: bool,
) -> None:
    """Stage 4 structure extraction (per D-008 stage 4 + D-056 + D-069)."""
    inferred_run_id = run_id or ocr_dir.parent.name
    run_dir = ocr_dir.parent

    page_files = sorted(ocr_dir.glob("page_*.md"))
    if page_limit is not None:
        page_files = page_files[:page_limit]

    click.echo(f"[extract-structure] cert_id        = {cert_id}")
    click.echo(f"[extract-structure] ocr_dir        = {ocr_dir}")
    click.echo(f"[extract-structure] classified_dir = {classified_dir}")
    click.echo(f"[extract-structure] cleaned_dir    = {cleaned_dir or run_dir / 'cleaned'}")
    click.echo(f"[extract-structure] run_id         = {inferred_run_id}")
    click.echo(f"[extract-structure] tier           = {tier}")
    click.echo(f"[extract-structure] pages on disk  = {len(page_files)}")

    if not confirm:
        click.echo("")
        click.echo(
            "[extract-structure] --confirm NOT passed; aborting before any Claude call."
        )
        sys.exit(0)

    from cert_extractor.pipeline.stage4_structure import (
        Stage4Structure,
        make_extractor_factory,
    )

    extractor = make_extractor_factory(cert_id=cert_id, tier=tier)()
    monitor = _build_monitor(
        anthropic_soft_usd=anthropic_soft_usd,
        anthropic_hard_usd=anthropic_hard_usd,
    )
    runner = Stage4Structure(extractor=extractor, monitor=monitor)

    click.echo("[extract-structure] starting…")
    result = runner.run(
        ocr_dir=ocr_dir,
        classified_dir=classified_dir,
        run_dir=run_dir,
        cert_id=cert_id,
        run_id=inferred_run_id,
        cleaned_dir=cleaned_dir,
        page_limit=page_limit,
        skip_existing=skip_existing,
    )

    click.echo("")
    click.echo(f"[extract-structure] DONE   pages_processed = {result.pages_processed}")
    click.echo(f"[extract-structure]        pages_skipped   = {result.pages_skipped}")
    click.echo(f"[extract-structure]        entities        = {result.entities_extracted}")
    click.echo(f"[extract-structure]        by_type         = {result.by_type}")
    click.echo(f"[extract-structure]        fail_count      = {result.fail_count}")
    click.echo(f"[extract-structure]        verdict_halted  = {result.halted_verdict}")
    click.echo(f"[extract-structure]        cost.json       = {result.cost_path}")
    click.echo(f"[extract-structure]        output_dir      = {result.output_dir}")


@main.command("extract-glossary")
@click.option(
    "--structured-dir",
    "structured_dir",
    required=True,
    type=click.Path(exists=True, file_okay=False, path_type=Path),
    help="Directory of stage-4 structured/ JSON output.",
)
@click.option("--cert-id", default="itpassport_r6", show_default=True)
@click.option(
    "--run-id",
    default=None,
    help="Defaults to grandparent run dir name.",
)
@click.option(
    "--tier",
    type=click.Choice(["haiku", "sonnet", "opus"]),
    default="sonnet",
    show_default=True,
)
@click.option(
    "--skip-existing/--no-skip-existing",
    default=True,
    show_default=True,
    help="If glossary/glossary.json already exists, load it instead of re-running.",
)
@click.option(
    "--anthropic-soft-usd",
    default=None,
    type=float,
)
@click.option(
    "--anthropic-hard-usd",
    default=None,
    type=float,
)
@click.option(
    "--confirm",
    is_flag=True,
    default=False,
    help="REQUIRED to actually invoke Claude. Without --confirm, prints plan and exits.",
)
def extract_glossary(
    structured_dir: Path,
    cert_id: str,
    run_id: str | None,
    tier: str,
    skip_existing: bool,
    anthropic_soft_usd: float | None,
    anthropic_hard_usd: float | None,
    confirm: bool,
) -> None:
    """Stage 4.5 glossary extraction (per D-008 + D-012)."""
    inferred_run_id = run_id or structured_dir.parent.name
    run_dir = structured_dir.parent
    page_files = sorted(structured_dir.glob("page_*.json"))

    click.echo(f"[extract-glossary] cert_id        = {cert_id}")
    click.echo(f"[extract-glossary] structured_dir = {structured_dir}")
    click.echo(f"[extract-glossary] run_id         = {inferred_run_id}")
    click.echo(f"[extract-glossary] tier           = {tier}")
    click.echo(f"[extract-glossary] structured pages = {len(page_files)}")

    if not confirm:
        click.echo("")
        click.echo(
            "[extract-glossary] --confirm NOT passed; aborting before any Claude call."
        )
        sys.exit(0)

    from cert_extractor.pipeline.stage4_5_glossary import (
        Stage4_5Glossary,
        make_extractor_factory,
    )

    extractor = make_extractor_factory(
        cert_id=cert_id, run_id=inferred_run_id, tier=tier
    )()
    monitor = _build_monitor(
        anthropic_soft_usd=anthropic_soft_usd,
        anthropic_hard_usd=anthropic_hard_usd,
    )
    runner = Stage4_5Glossary(extractor=extractor, monitor=monitor)

    click.echo("[extract-glossary] starting…")
    result = runner.run(
        structured_dir=structured_dir,
        run_dir=run_dir,
        cert_id=cert_id,
        run_id=inferred_run_id,
        skip_existing=skip_existing,
    )

    click.echo("")
    click.echo(f"[extract-glossary] DONE   pages_scanned   = {result.pages_scanned}")
    click.echo(f"[extract-glossary]        terms_harvested = {result.terms_harvested}")
    click.echo(f"[extract-glossary]        unique_surfaces = {result.unique_surfaces}")
    click.echo(f"[extract-glossary]        entries_locked  = {result.entries_locked}")
    click.echo(f"[extract-glossary]        fail_count      = {result.fail_count}")
    click.echo(f"[extract-glossary]        verdict_halted  = {result.halted_verdict}")
    click.echo(f"[extract-glossary]        glossary.json   = {result.output_path}")
    click.echo(f"[extract-glossary]        cost.json       = {result.cost_path}")


@main.command("translate-entities")
@click.option(
    "--structured-dir",
    "structured_dir",
    required=True,
    type=click.Path(exists=True, file_okay=False, path_type=Path),
)
@click.option(
    "--glossary-path",
    "glossary_path",
    required=True,
    type=click.Path(exists=True, dir_okay=False, path_type=Path),
)
@click.option("--cert-id", default="itpassport_r6", show_default=True)
@click.option("--run-id", default=None)
@click.option("--page-limit", default=None, type=int)
@click.option(
    "--tier",
    type=click.Choice(["haiku", "sonnet", "opus"]),
    default="sonnet",
    show_default=True,
)
@click.option(
    "--skip-existing/--no-skip-existing",
    default=True,
    show_default=True,
)
@click.option("--anthropic-soft-usd", default=None, type=float)
@click.option("--anthropic-hard-usd", default=None, type=float)
@click.option(
    "--max-items-per-call",
    default=8,
    show_default=True,
    type=int,
    help=(
        "Cap the number of jp items sent to Claude in a single LLM request. "
        "Pages with more unresolved leaves dispatch multiple sub-batches. "
        "Lower values reduce long-context quality decay; higher values "
        "amortize subprocess overhead."
    ),
)
@click.option(
    "--confirm",
    is_flag=True,
    default=False,
    help="REQUIRED to actually invoke Claude.",
)
def translate_entities(
    structured_dir: Path,
    glossary_path: Path,
    cert_id: str,
    run_id: str | None,
    page_limit: int | None,
    tier: str,
    skip_existing: bool,
    anthropic_soft_usd: float | None,
    anthropic_hard_usd: float | None,
    max_items_per_call: int,
    confirm: bool,
) -> None:
    """Stage 5 trilingual translation (per D-008 + D-055 + D-012)."""
    from cert_extractor.schema.glossary import Glossary

    inferred_run_id = run_id or structured_dir.parent.name
    run_dir = structured_dir.parent
    glossary = Glossary.model_validate_json(glossary_path.read_text(encoding="utf-8"))

    page_files = sorted(structured_dir.glob("page_*.json"))
    if page_limit is not None:
        page_files = page_files[:page_limit]

    click.echo(f"[translate-entities] cert_id            = {cert_id}")
    click.echo(f"[translate-entities] structured_dir     = {structured_dir}")
    click.echo(f"[translate-entities] glossary           = {glossary_path} ({len(glossary.entries)} entries)")
    click.echo(f"[translate-entities] run_id             = {inferred_run_id}")
    click.echo(f"[translate-entities] tier               = {tier}")
    click.echo(f"[translate-entities] max_items_per_call = {max_items_per_call}")
    click.echo(f"[translate-entities] skip_existing      = {skip_existing}")
    click.echo(f"[translate-entities] pages on disk      = {len(page_files)}")

    if not confirm:
        click.echo("")
        click.echo(
            "[translate-entities] --confirm NOT passed; aborting before any Claude call."
        )
        sys.exit(0)

    from cert_extractor.pipeline.stage5_translate import (
        Stage5Translate,
        make_engine_factory,
    )

    engine = make_engine_factory(
        glossary=glossary, tier=tier, max_items_per_call=max_items_per_call
    )()
    monitor = _build_monitor(
        anthropic_soft_usd=anthropic_soft_usd,
        anthropic_hard_usd=anthropic_hard_usd,
    )
    runner = Stage5Translate(engine=engine, monitor=monitor)

    click.echo("[translate-entities] starting…")
    result = runner.run(
        structured_dir=structured_dir,
        run_dir=run_dir,
        cert_id=cert_id,
        run_id=inferred_run_id,
        page_limit=page_limit,
        skip_existing=skip_existing,
    )

    click.echo("")
    click.echo(f"[translate-entities] DONE   pages_processed   = {result.pages_processed}")
    click.echo(f"[translate-entities]        pages_skipped     = {result.pages_skipped}")
    click.echo(f"[translate-entities]        fields_translated = {result.fields_translated}")
    click.echo(f"[translate-entities]        glossary_hits     = {result.glossary_hits}")
    click.echo(f"[translate-entities]        llm_calls         = {result.llm_calls}")
    click.echo(f"[translate-entities]        fail_count        = {result.fail_count}")
    click.echo(f"[translate-entities]        verdict_halted    = {result.halted_verdict}")
    click.echo(f"[translate-entities]        translated/       = {result.output_dir}")
    click.echo(f"[translate-entities]        cost.json         = {result.cost_path}")


@main.command("audit-trilingual")
@click.option(
    "--translated-dir",
    "translated_dir",
    required=True,
    type=click.Path(exists=True, file_okay=False, path_type=Path),
    help="Directory of stage-5 translated/ JSON output.",
)
@click.option(
    "--structured-dir",
    "structured_dir",
    required=True,
    type=click.Path(exists=True, file_okay=False, path_type=Path),
    help="Directory of stage-4 structured/ JSON output (for jp ground truth).",
)
@click.option(
    "--glossary-path",
    "glossary_path",
    required=True,
    type=click.Path(exists=True, dir_okay=False, path_type=Path),
)
@click.option(
    "--cleaned-dir",
    "cleaned_dir",
    default=None,
    type=click.Path(file_okay=False, path_type=Path),
    help="Optional Stage 3 cleaned/ markdown — preferred source for D5 answer-line ground truth.",
)
@click.option(
    "--ocr-dir",
    "ocr_dir",
    default=None,
    type=click.Path(file_okay=False, path_type=Path),
    help="Optional Stage 1 ocr/ markdown — used by D5 only when cleaned/ is missing for a page.",
)
@click.option("--cert-id", default="itpassport_r6", show_default=True)
@click.option("--run-id", default=None)
@click.option("--page-limit", default=None, type=int)
@click.option(
    "--pages",
    default=None,
    help=(
        "Comma-separated page numbers to audit (Stage A subset, e.g. '14,30,38,43,45'). "
        "Mutually exclusive with --page-limit; both can be combined."
    ),
)
@click.option(
    "--tier",
    type=click.Choice(["haiku", "sonnet", "opus"]),
    default="opus",
    show_default=True,
    help="Per D-077 §2.2: opus is the locked default for Stage 6 reviewer.",
)
@click.option(
    "--chunk-size",
    default=4,
    show_default=True,
    type=int,
    help="Per D-077 §2.2: 4 entities per LLM call (heavier per-entity context than Stage 5).",
)
@click.option(
    "--anthropic-soft-usd",
    default=999.0,
    show_default=True,
    type=float,
    help="Per D-077 §2.9: caps relaxed for Stage 6 dry-run (quality > cost).",
)
@click.option(
    "--anthropic-hard-usd",
    default=999.0,
    show_default=True,
    type=float,
)
@click.option(
    "--confirm",
    is_flag=True,
    default=False,
    help="REQUIRED to actually invoke Claude (consumes max-plan quota or ANTHROPIC_API_KEY budget).",
)
def audit_trilingual(
    translated_dir: Path,
    structured_dir: Path,
    glossary_path: Path,
    cleaned_dir: Path | None,
    ocr_dir: Path | None,
    cert_id: str,
    run_id: str | None,
    page_limit: int | None,
    pages: str | None,
    tier: str,
    chunk_size: int,
    anthropic_soft_usd: float,
    anthropic_hard_usd: float,
    confirm: bool,
) -> None:
    """Stage 6 audit reviewer (per D-077). Two-pass: deterministic detectors + opus LLM reviewer."""
    inferred_run_id = run_id or translated_dir.parent.name
    run_dir = translated_dir.parent

    page_filter: list[int] | None = None
    if pages:
        page_filter = sorted({int(p.strip()) for p in pages.split(",") if p.strip()})

    page_count = sum(1 for _ in translated_dir.glob("page_*.json"))

    click.echo(f"[audit-trilingual] cert_id            = {cert_id}")
    click.echo(f"[audit-trilingual] translated_dir     = {translated_dir} ({page_count} pages)")
    click.echo(f"[audit-trilingual] structured_dir     = {structured_dir}")
    click.echo(f"[audit-trilingual] cleaned_dir        = {cleaned_dir or run_dir / 'cleaned'}")
    click.echo(f"[audit-trilingual] ocr_dir            = {ocr_dir or run_dir / 'ocr'}")
    click.echo(f"[audit-trilingual] glossary           = {glossary_path}")
    click.echo(f"[audit-trilingual] run_id             = {inferred_run_id}")
    click.echo(f"[audit-trilingual] tier               = {tier}")
    click.echo(f"[audit-trilingual] chunk_size         = {chunk_size}")
    click.echo(f"[audit-trilingual] page_filter        = {page_filter}")
    click.echo(f"[audit-trilingual] page_limit         = {page_limit}")
    click.echo(f"[audit-trilingual] anthropic_caps     = soft ${anthropic_soft_usd} / hard ${anthropic_hard_usd}")

    if not confirm:
        click.echo("")
        click.echo(
            "[audit-trilingual] --confirm NOT passed; aborting before any Claude call."
        )
        sys.exit(0)

    from cert_extractor.pipeline.stage6_audit.reviewer import (
        make_reviewer_factory,
    )
    from cert_extractor.pipeline.stage6_audit.runner import (
        Stage6Audit,
    )

    reviewer = make_reviewer_factory(tier=tier, chunk_size=chunk_size)()
    monitor = _build_monitor(
        anthropic_soft_usd=anthropic_soft_usd,
        anthropic_hard_usd=anthropic_hard_usd,
    )
    runner = Stage6Audit(reviewer=reviewer, monitor=monitor)

    click.echo("[audit-trilingual] starting…")
    result = runner.run(
        structured_dir=structured_dir,
        translated_dir=translated_dir,
        glossary_path=glossary_path,
        run_dir=run_dir,
        cert_id=cert_id,
        run_id=inferred_run_id,
        cleaned_dir=cleaned_dir or (run_dir / "cleaned"),
        ocr_dir=ocr_dir or (run_dir / "ocr"),
        page_limit=page_limit,
        page_filter=page_filter,
    )

    summary = result.summary
    click.echo("")
    click.echo(f"[audit-trilingual] DONE   pages_processed   = {result.pages_processed}")
    click.echo(f"[audit-trilingual]        overall_verdict   = {summary.overall_verdict}")
    click.echo(f"[audit-trilingual]        pass / warn / fail= {summary.pass_pages} / {summary.warn_pages} / {summary.fail_pages}")
    click.echo(f"[audit-trilingual]        pass_rate         = {summary.pass_rate:.3f}")
    click.echo(f"[audit-trilingual]        safety_failed     = {summary.safety_failed}")
    click.echo(f"[audit-trilingual]        repair_stage_hint = {summary.most_severe_repair_stage}")
    click.echo(f"[audit-trilingual]        run_level_issues  = {len(summary.run_level_issues)}")
    click.echo(f"[audit-trilingual]        cost_shadow_total = ${summary.cost_usd_shadow_total:.4f}")
    click.echo(f"[audit-trilingual]        fail_count        = {result.fail_count}")
    if result.halt_reason:
        click.echo(f"[audit-trilingual]        halt_reason       = {result.halt_reason}")
    click.echo(f"[audit-trilingual]        review.json       = {result.output_path}")
    click.echo(f"[audit-trilingual]        cost.json         = {result.cost_path}")


# ---------------------------------------------------------------------------
# Stage 7 export — per-page JSON + Markdown (per D-078)
# ---------------------------------------------------------------------------


@main.command("export-trilingual")
@click.option(
    "--translated-dir",
    "translated_dir",
    required=True,
    type=click.Path(exists=True, file_okay=False, path_type=Path),
    help="Directory of Stage 5 translated/ JSON output.",
)
@click.option(
    "--structured-dir",
    "structured_dir",
    required=True,
    type=click.Path(exists=True, file_okay=False, path_type=Path),
    help="Directory of Stage 4 structured/ JSON output (needed for Gate A D1).",
)
@click.option(
    "--glossary-path",
    "glossary_path",
    required=True,
    type=click.Path(exists=True, dir_okay=False, path_type=Path),
)
@click.option(
    "--audit-path",
    "audit_path",
    required=True,
    type=click.Path(exists=True, dir_okay=False, path_type=Path),
    help="Stage 6 audit/stage6_review.json (source of polish_items.json sidecar).",
)
@click.option(
    "--output-dir",
    "output_dir",
    required=True,
    type=click.Path(file_okay=False, path_type=Path),
    help="Output directory under data/.../output (will be created).",
)
@click.option(
    "--cleaned-dir",
    "cleaned_dir",
    default=None,
    type=click.Path(file_okay=False, path_type=Path),
    help="Optional Stage 3 cleaned/ markdown — used by Gate A D5.",
)
@click.option("--cert-id", default="itpassport_r6", show_default=True)
@click.option(
    "--run-id",
    default=None,
    help="Inferred from translated-dir parent name if omitted.",
)
@click.option(
    "--schema-version",
    default="v1",
    show_default=True,
    type=click.Choice(["v1"]),
    help="Output schema version (per D-078).",
)
@click.option(
    "--formats",
    default="json,md",
    show_default=True,
    help="Comma-separated subset of {json,md} (v1 only emits these two).",
)
@click.option(
    "--confirm",
    is_flag=True,
    default=False,
    help="REQUIRED to actually write files. Stage 7 has no LLM cost but writes 80+ files; --confirm avoids accidental overwrite.",
)
def export_trilingual(
    translated_dir: Path,
    structured_dir: Path,
    glossary_path: Path,
    audit_path: Path,
    output_dir: Path,
    cleaned_dir: Path | None,
    cert_id: str,
    run_id: str | None,
    schema_version: str,
    formats: str,
    confirm: bool,
) -> None:
    """Stage 7 export (per D-078). Per-page JSON + Markdown + sidecar polish items.

    Dual release gate: full D1-D13 Phase-1 re-run + Stage 7 contract self-check.
    Refuses to write if either gate fails.
    """
    from cert_extractor.pipeline.stage7_export.runner import Stage7Export

    inferred_run_id = run_id or translated_dir.parent.name
    fmt_list = [f.strip() for f in formats.split(",") if f.strip()]
    allowed_formats = {"json", "md"}
    unknown = set(fmt_list) - allowed_formats
    if unknown:
        raise click.UsageError(
            f"--formats received unknown value(s): {sorted(unknown)}; "
            f"v1 supports only {sorted(allowed_formats)}."
        )

    click.echo(f"[export-trilingual] cert_id        = {cert_id}")
    click.echo(f"[export-trilingual] run_id         = {inferred_run_id}")
    click.echo(f"[export-trilingual] translated_dir = {translated_dir}")
    click.echo(f"[export-trilingual] structured_dir = {structured_dir}")
    click.echo(f"[export-trilingual] glossary_path  = {glossary_path}")
    click.echo(f"[export-trilingual] audit_path     = {audit_path}")
    click.echo(f"[export-trilingual] cleaned_dir    = {cleaned_dir}")
    click.echo(f"[export-trilingual] output_dir     = {output_dir}")
    click.echo(f"[export-trilingual] schema_version = {schema_version}")
    click.echo(f"[export-trilingual] formats        = {fmt_list}")

    if not confirm:
        click.echo(
            "[export-trilingual] --confirm NOT passed; aborting before any write."
        )
        return

    click.echo("[export-trilingual] starting…")

    result = Stage7Export().run(
        translated_dir=translated_dir,
        structured_dir=structured_dir,
        glossary_path=glossary_path,
        audit_path=audit_path,
        output_dir=output_dir,
        cleaned_dir=cleaned_dir,
        cert_id=cert_id,
        run_id=inferred_run_id,
        formats=tuple(fmt_list),
    )

    click.echo("")
    click.echo(f"[export-trilingual] DONE  gate_a_passed      = {result.gate_result.gate_a_passed}")
    click.echo(f"[export-trilingual]       gate_b_passed      = {result.gate_result.gate_b_passed}")
    click.echo(f"[export-trilingual]       passed             = {result.passed}")
    click.echo(f"[export-trilingual]       pages_written      = {result.pages_written}")
    click.echo(f"[export-trilingual]       files_written      = {len(result.files_written)}")
    click.echo(f"[export-trilingual]       choices_normalized = {result.choices_normalized}")

    if not result.gate_result.passed:
        click.echo("")
        click.echo("[export-trilingual] FAILURES (no output written):")
        for line in result.gate_result.all_failures:
            click.echo(f"  {line}")
        raise click.ClickException("Stage 7 export refused due to release-gate failures.")

    click.echo(f"[export-trilingual]       output_dir         = {output_dir.resolve()}")


# ---------------------------------------------------------------------------
# Stage resume / dispatcher — per D-079 §2.4 (6.11.B.1 planner slice)
# ---------------------------------------------------------------------------


@main.command("stage")
@click.option(
    "--from",
    "stage_from",
    required=True,
    type=str,
    help="Stage id to resume from: 1 | 2 | 3 | 4 | 4.5 | 5 | 6 | 7 (per D-079 §2.4).",
)
@click.option(
    "--redo",
    is_flag=True,
    default=False,
    help="Delete the stage's existing output dir before running (force re-run).",
)
@click.option(
    "--run-id",
    required=True,
    help="Existing run_id under data/<cert-id>/runs/.",
)
@click.option(
    "--cert-id",
    default="itpassport_r6",
    show_default=True,
)
@click.option(
    "--data-dir",
    default="data",
    show_default=True,
    type=click.Path(file_okay=False, path_type=Path),
)
def stage(
    stage_from: str,
    redo: bool,
    run_id: str,
    cert_id: str,
    data_dir: Path,
) -> None:
    """Plan a stage resume from N (per D-079 §2.4).

    6.11.B.1 scope: planner + --redo cleanup. Actual stage execution
    wiring + checkpoint emission + gate halt-criteria checks land in
    6.11.B.2 + 6.11.B.3.
    """
    from cert_extractor.pipeline.stage_dispatch import (
        build_resume_command_hint,
        clear_stage_output,
        parse_stage_id,
        plan_resume,
        stage_output_dir,
    )

    try:
        sid = parse_stage_id(stage_from)
    except ValueError as e:
        raise click.UsageError(str(e)) from e

    run_dir = Path(data_dir) / cert_id / "runs" / run_id
    if not run_dir.exists():
        raise click.UsageError(
            f"run_dir not found: {run_dir}; create it via `dry-run` first."
        )

    if redo:
        target = stage_output_dir(sid, run_dir)
        click.echo(f"[stage] --redo: clearing {target}")
        removed = clear_stage_output(sid, run_dir)
        click.echo(f"[stage]         removed = {removed}")

    plan = plan_resume(sid)
    next_hint = build_resume_command_hint(plan, run_id=run_id, cert_id=cert_id)

    click.echo(f"[stage] cert_id        = {cert_id}")
    click.echo(f"[stage] run_id         = {run_id}")
    click.echo(f"[stage] run_dir        = {run_dir}")
    click.echo(f"[stage] from           = {sid}")
    click.echo(f"[stage] stages_to_run  = {list(plan.stages_to_run)}")
    click.echo(f"[stage] halt_after     = stage {plan.halt_after_stage}")
    if plan.halt_at_gate is not None:
        click.echo(f"[stage] halt_at_gate   = Gate {plan.halt_at_gate}")
        if next_hint:
            click.echo(f"[stage] next_resume    = {next_hint}")
    else:
        click.echo("[stage] halt_at_gate   = (none — pipeline end)")

    click.echo("")
    click.echo(
        "[stage] 6.11.B.1 scaffolding only — stage execution + checkpoint "
        "emission + gate halt-criteria checks land in 6.11.B.2 + 6.11.B.3."
    )


if __name__ == "__main__":
    main()
