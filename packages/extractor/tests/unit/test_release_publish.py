"""Tests for release.publish (per D-081 §2.4, 6.11.C.3 TDD).

Covers the SHA256 helper, output-dir validation rejection, end-to-end
dry-run artifact assembly, and confirm-mode ``gh`` invocation with a
mocked subprocess runner.
"""
from __future__ import annotations

import subprocess
import zipfile
from pathlib import Path

import pytest
from cert_extractor.release import (
    GitContext,
    PublishInputs,
    publish,
    sha256_of,
)


def _setup_output(out: Path) -> None:
    """Create a minimal but complete Stage-7 output/ layout."""
    out.mkdir(parents=True, exist_ok=True)
    (out / "README.md").write_text("# Output README\n", encoding="utf-8")
    (out / "index.json").write_text(
        '{"page_count": 3, "entity_count": 5}\n', encoding="utf-8"
    )
    (out / "glossary.json").write_text('{"entries": []}\n', encoding="utf-8")
    (out / "polish_items.json").write_text("[]\n", encoding="utf-8")
    pages = out / "pages"
    pages.mkdir()
    (pages / "page_001.json").write_text('{"jp": "x"}\n', encoding="utf-8")


def _ctx() -> GitContext:
    return GitContext(
        commit_sha="abc1234",
        python_version="3.11.7",
        adr_ids=("D-081",),
        run_id="r1",
    )


def _inputs(tmp_path: Path) -> PublishInputs:
    out = tmp_path / "output"
    _setup_output(out)
    intro = tmp_path / "intro.md"
    intro.write_text("This is the intro paragraph.", encoding="utf-8")
    return PublishInputs(
        cert_id="itpassport_r6",
        version="v1.0.0",
        output_dir=out,
        intro_md_path=intro,
        index_json={"page_count": 3, "entity_count": 5},
        polish_items=[],
        cost={"mistral_usd_billed": 0.001},
        git_context=_ctx(),
        release_root_dir=tmp_path / "releases",
        target_sha="deadbeefdeadbeef",
    )


def test_sha256_of_matches_known_value(tmp_path) -> None:
    # sha256("hello world\n") is a stable, well-known digest.
    p = tmp_path / "x.txt"
    p.write_bytes(b"hello world\n")
    assert sha256_of(p) == (
        "a948904f2f0f479b8f8197694b30184b0d2ed1c1cd2a1ec0fb85d299a192a447"
    )


def test_publish_refuses_when_top_level_files_missing(tmp_path) -> None:
    # Half-built output dir: README.md only.
    out = tmp_path / "output"
    out.mkdir()
    (out / "README.md").write_text("x", encoding="utf-8")
    intro = tmp_path / "intro.md"
    intro.write_text("intro", encoding="utf-8")

    inputs = PublishInputs(
        cert_id="itpassport_r6",
        version="v1.0.0",
        output_dir=out,
        intro_md_path=intro,
        index_json={},
        polish_items=[],
        cost={},
        git_context=_ctx(),
        release_root_dir=tmp_path / "releases",
    )

    with pytest.raises(ValueError, match="output dir validation failed"):
        publish(inputs, confirm=False)


def test_publish_dry_run_assembles_all_artifacts_without_calling_gh(tmp_path) -> None:
    gh_calls: list[list[str]] = []

    def mock_gh(cmd: list[str]) -> subprocess.CompletedProcess[str]:
        gh_calls.append(cmd)
        return subprocess.CompletedProcess(
            args=cmd, returncode=0, stdout="", stderr=""
        )

    result = publish(_inputs(tmp_path), gh_runner=mock_gh, confirm=False)

    # Tag composed via tag_name (underscore → dash).
    assert result.tag == "itpassport-r6-v1.0.0"
    # Dry-run: gh never invoked.
    assert gh_calls == []
    assert result.release_url is None

    # Release staging dir laid out under release_root_dir/<tag>/.
    expected_dir = tmp_path / "releases" / "itpassport-r6-v1.0.0"
    assert result.release_dir == expected_dir
    assert (expected_dir / "itpassport-r6-output-v1.0.0.zip").exists()

    # 4 top-level files staged alongside the zip.
    for fname in ("README.md", "index.json", "glossary.json", "polish_items.json"):
        assert (expected_dir / fname).exists()

    # SHA256SUMS covers exactly zip + 4 files (5 lines).
    sums = result.sha256sums_path.read_text(encoding="utf-8").strip().splitlines()
    assert len(sums) == 5

    # Each sums line is "<64-hex digest>  <basename>".
    for line in sums:
        digest, _, name = line.partition("  ")
        assert len(digest) == 64
        assert all(c in "0123456789abcdef" for c in digest)
        assert name  # not empty

    # Notes composed and written.
    notes = result.notes_path.read_text(encoding="utf-8")
    assert "# itpassport_r6 — Trilingual Edition v1.0.0" in notes
    assert "This is the intro paragraph." in notes

    # Zip contains the per-page nested entry.
    with zipfile.ZipFile(result.zip_path) as zf:
        names = zf.namelist()
        assert any(n.endswith("README.md") for n in names)
        assert any(n.endswith("pages/page_001.json") for n in names)


def test_publish_with_confirm_invokes_gh_create_then_view(tmp_path) -> None:
    gh_calls: list[list[str]] = []
    expected_url = "https://github.com/x/y/releases/tag/itpassport-r6-v1.0.0"

    def mock_gh(cmd: list[str]) -> subprocess.CompletedProcess[str]:
        gh_calls.append(cmd)
        # First call (create) returns the URL on stdout; second (view) is silent.
        stdout = f"{expected_url}\n" if cmd[:3] == ["gh", "release", "create"] else ""
        return subprocess.CompletedProcess(
            args=cmd, returncode=0, stdout=stdout, stderr=""
        )

    result = publish(_inputs(tmp_path), gh_runner=mock_gh, confirm=True)

    # Exactly 2 gh calls: create then view.
    assert len(gh_calls) == 2
    create_cmd, view_cmd = gh_calls

    assert create_cmd[:4] == ["gh", "release", "create", "itpassport-r6-v1.0.0"]
    assert "--title" in create_cmd
    assert "--notes-file" in create_cmd
    assert "--target" in create_cmd
    assert "deadbeefdeadbeef" in create_cmd
    # All 6 assets in the create command (zip + 4 + SHA256SUMS).
    cmd_str = " ".join(create_cmd)
    for fragment in (
        "itpassport-r6-output-v1.0.0.zip",
        "README.md",
        "index.json",
        "glossary.json",
        "polish_items.json",
        "SHA256SUMS.txt",
    ):
        assert fragment in cmd_str

    assert view_cmd == ["gh", "release", "view", "itpassport-r6-v1.0.0"]

    # URL extracted from gh stdout.
    assert result.release_url == expected_url
