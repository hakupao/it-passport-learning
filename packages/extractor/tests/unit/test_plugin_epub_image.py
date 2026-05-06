"""Unit tests for the epub_image source plugin."""
import zipfile
from pathlib import Path

import pytest

from cert_extractor.plugins.base import reset_registry
from cert_extractor.plugins.source.epub_image import (
    EPUBImageConfig,
    EPUBImageSource,
)


@pytest.fixture(autouse=True)
def _registry_isolation():
    yield
    reset_registry()


def _make_fake_epub(path: Path, image_names: list[str]) -> None:
    """Create a minimal ZIP file with the given entry names."""
    with zipfile.ZipFile(path, "w") as zf:
        for name in image_names:
            zf.writestr(name, b"fake image bytes for " + name.encode())


def test_extracts_jpg_pages_in_order(tmp_path: Path):
    src = tmp_path / "fake.epub"
    out = tmp_path / "out"
    _make_fake_epub(
        src,
        [
            "OEBPS/images/p005.jpg",
            "OEBPS/images/p001.jpg",
            "OEBPS/images/p002.jpg",
            "OEBPS/META-INF/container.xml",  # ignored (not an image)
            "OEBPS/cover.png",
        ],
    )
    plugin = EPUBImageSource()
    result = plugin.list_pages(str(src), str(out))
    assert len(result.pages) == 4  # 3 jpg + 1 png
    # sorted by archive path → cover.png comes before images
    names = [Path(p).name for p in result.pages]
    assert names == [
        "page_001.png",  # OEBPS/cover.png sorts before OEBPS/images/...
        "page_002.jpg",  # p001.jpg
        "page_003.jpg",  # p002.jpg
        "page_004.jpg",  # p005.jpg
    ]
    # Files actually written
    for p in result.pages:
        assert Path(p).exists()


def test_metadata_includes_counts(tmp_path: Path):
    src = tmp_path / "fake.epub"
    out = tmp_path / "out"
    _make_fake_epub(src, ["a.jpg", "b.png", "ignored.xml"])
    result = EPUBImageSource().list_pages(str(src), str(out))
    assert result.metadata["total_archive_entries"] == 3
    assert result.metadata["image_entries"] == 2
    assert result.metadata["source"].endswith("fake.epub")


def test_missing_source_raises(tmp_path: Path):
    plugin = EPUBImageSource()
    with pytest.raises(FileNotFoundError):
        plugin.list_pages(str(tmp_path / "nope.epub"), str(tmp_path / "out"))


def test_directory_source_rejected(tmp_path: Path):
    plugin = EPUBImageSource()
    with pytest.raises(IsADirectoryError):
        plugin.list_pages(str(tmp_path), str(tmp_path / "out"))


def test_custom_extensions(tmp_path: Path):
    src = tmp_path / "fake.epub"
    out = tmp_path / "out"
    _make_fake_epub(src, ["a.jpg", "b.webp", "c.png"])
    plugin = EPUBImageSource(EPUBImageConfig(image_extensions=(".webp",)))
    result = plugin.list_pages(str(src), str(out))
    assert len(result.pages) == 1
    assert Path(result.pages[0]).suffix == ".webp"


def test_metadata_required_fields_present():
    """Per D-068 standard metadata must be set on plugin class."""
    assert EPUBImageSource.name == "epub_image"
    assert EPUBImageSource.description
    assert EPUBImageSource.supported_axes == ["source"]
    assert EPUBImageSource.__cert_extractor_min_version__
    assert EPUBImageSource.author
    assert EPUBImageSource.license
