"""Release-publish orchestrator for D-081 §2.4.

6.11.C.3 deliverable. Implements the 8-step contract:

1. Validate ``output/`` directory (4 top-level files exist)
2. Compute tag via :func:`cert_extractor.release.tag_name`
3. Zip ``output/`` → ``<cert-dashes>-output-<version>.zip``
4. SHA256SUMS for zip + 4 top-level files
5. Compose release notes via :func:`compose_notes`
6. ``gh release create <tag> --target <sha> --notes-file <notes> <assets>``
7. ``gh release view <tag>`` (existence verification)
8. (Caller writes the evidence markdown after this returns; the
   :class:`PublishResult` carries every path needed.)

The ``gh_runner`` callable is injectable so tests mock subprocess; in
production the default invokes ``gh`` via :mod:`subprocess`.
"""
from __future__ import annotations

import hashlib
import shutil
import subprocess
import zipfile
from collections.abc import Callable
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, NamedTuple

from cert_extractor.release.notes import GitContext, compose_notes
from cert_extractor.release.tag_name import tag_name

# 4 top-level files expected at ``output/`` root (per D-078 + D-081 §2.2).
# The release page exposes each one as an individual asset alongside the zip.
TOP_LEVEL_FILES: tuple[str, ...] = (
    "README.md",
    "index.json",
    "glossary.json",
    "polish_items.json",
)


class PublishResult(NamedTuple):
    """Outcome of :func:`publish`.

    ``release_url`` is ``None`` when ``confirm=False`` (dry run);
    otherwise populated from ``gh release create`` stdout.
    """

    tag: str
    release_dir: Path
    zip_path: Path
    sha256sums_path: Path
    notes_path: Path
    asset_paths: tuple[Path, ...]
    release_url: str | None


@dataclass
class PublishInputs:
    """Inputs to :func:`publish`."""

    cert_id: str
    version: str
    output_dir: Path
    intro_md_path: Path
    index_json: dict[str, Any]
    polish_items: list[dict[str, Any]]
    cost: dict[str, Any]
    git_context: GitContext
    release_root_dir: Path
    target_sha: str | None = None
    title: str | None = None
    extra_asset_paths: tuple[Path, ...] = field(default_factory=tuple)


# Type alias for an injectable subprocess runner.
GhRunner = Callable[[list[str]], "subprocess.CompletedProcess[str]"]


def _default_gh_runner(cmd: list[str]) -> subprocess.CompletedProcess[str]:
    """Production default: invoke ``gh`` via subprocess, raise on non-zero exit."""
    return subprocess.run(cmd, check=True, capture_output=True, text=True)


def validate_output_dir(output_dir: Path) -> list[str]:
    """Return a list of validation issues; empty list = passes.

    Checks existence + that all 4 top-level files are present per
    D-081 §2.2. Does **not** validate file contents — that's Stage 7's
    dual-gate job (D-078).
    """
    if not output_dir.exists():
        return [f"output_dir not found: {output_dir}"]
    if not output_dir.is_dir():
        return [f"output_dir is not a directory: {output_dir}"]
    issues: list[str] = []
    for fname in TOP_LEVEL_FILES:
        if not (output_dir / fname).exists():
            issues.append(f"missing top-level file: {fname}")
    return issues


def sha256_of(path: Path) -> str:
    """SHA-256 hex digest of a file (streaming 64 KiB chunks)."""
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(64 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def compose_sha256sums(paths: list[Path]) -> str:
    """Render a ``sha256sum -c``-compatible manifest.

    Each line: ``<digest>  <basename>``. Trailing newline included so
    the file ends cleanly (`sha256sum -c` is tolerant either way).
    """
    lines = [f"{sha256_of(p)}  {p.name}" for p in paths]
    return "\n".join(lines) + "\n"


def make_release_zip(*, output_dir: Path, target_zip: Path) -> Path:
    """Zip every file under ``output_dir`` into ``target_zip``.

    Archive names preserve the path relative to ``output_dir.parent``
    (so the zip extracts a top-level ``output/`` directory).
    """
    target_zip.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(target_zip, "w", zipfile.ZIP_DEFLATED) as zf:
        for path in sorted(output_dir.rglob("*")):
            if path.is_file():
                zf.write(path, path.relative_to(output_dir.parent))
    return target_zip


def publish(
    inputs: PublishInputs,
    *,
    gh_runner: GhRunner | None = None,
    confirm: bool = False,
) -> PublishResult:
    """Execute the 8-step release-publish contract.

    ``confirm=False`` builds every artifact on disk but does NOT invoke
    ``gh`` — useful for smoke checks + dry runs. ``confirm=True``
    invokes ``gh release create`` + ``gh release view``; the
    ``gh_runner`` callable controls how (production default = real
    subprocess; tests inject a mock).
    """
    runner = gh_runner or _default_gh_runner

    # Step 1: validate.
    issues = validate_output_dir(inputs.output_dir)
    if issues:
        raise ValueError(f"output dir validation failed: {issues}")

    # Step 2: tag name.
    tag = tag_name(inputs.cert_id, inputs.version)
    cert_dashes = inputs.cert_id.replace("_", "-")

    # Stage release artifacts under release_root_dir/<tag>/.
    release_dir = inputs.release_root_dir / tag
    release_dir.mkdir(parents=True, exist_ok=True)

    # Step 3: zip the output dir.
    zip_name = f"{cert_dashes}-output-{inputs.version}.zip"
    zip_path = make_release_zip(
        output_dir=inputs.output_dir,
        target_zip=release_dir / zip_name,
    )

    # Copy the 4 top-level files alongside the zip so the upload references them.
    staged_top_level: list[Path] = []
    for fname in TOP_LEVEL_FILES:
        staged = release_dir / fname
        shutil.copy(inputs.output_dir / fname, staged)
        staged_top_level.append(staged)

    # Step 4: SHA256SUMS over zip + 4 top-level files.
    sha_inputs = [zip_path, *staged_top_level]
    sha_path = release_dir / "SHA256SUMS.txt"
    sha_path.write_text(compose_sha256sums(sha_inputs), encoding="utf-8")

    # Step 5: compose release notes from inputs + intro file.
    intro_md = inputs.intro_md_path.read_text(encoding="utf-8")
    notes_md = compose_notes(
        cert_id=inputs.cert_id,
        version=inputs.version,
        index=inputs.index_json,
        polish_items=inputs.polish_items,
        cost=inputs.cost,
        intro_md=intro_md,
        git_context=inputs.git_context,
        title=inputs.title,
    )
    notes_path = release_dir / "RELEASE_NOTES.md"
    notes_path.write_text(notes_md, encoding="utf-8")

    # Final asset list (per D-081 §2.2 — 6 assets total).
    asset_paths: tuple[Path, ...] = (
        zip_path,
        *staged_top_level,
        sha_path,
        *inputs.extra_asset_paths,
    )

    release_url: str | None = None

    if confirm:
        # Step 6: gh release create.
        title = inputs.title or (
            f"{inputs.cert_id} — Trilingual Edition {inputs.version}"
        )
        cmd: list[str] = [
            "gh",
            "release",
            "create",
            tag,
            "--title",
            title,
            "--notes-file",
            str(notes_path),
        ]
        if inputs.target_sha:
            cmd += ["--target", inputs.target_sha]
        cmd += [str(p) for p in asset_paths]
        create_result = runner(cmd)
        stdout = (create_result.stdout or "").strip()
        if stdout:
            release_url = stdout.splitlines()[-1]

        # Step 7: gh release view (existence verification).
        runner(["gh", "release", "view", tag])

    # Step 8 (evidence markdown) is the caller's responsibility; the result
    # below carries every path needed to render it.
    return PublishResult(
        tag=tag,
        release_dir=release_dir,
        zip_path=zip_path,
        sha256sums_path=sha_path,
        notes_path=notes_path,
        asset_paths=asset_paths,
        release_url=release_url,
    )
