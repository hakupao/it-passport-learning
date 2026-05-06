"""EPUB image source plugin (built-in).

Extracts image files (``.jpg`` / ``.jpeg`` / ``.png``) from an EPUB archive in
ZIP-entry order and re-numbers them to ``page_NNN.<ext>``. Image-based EPUBs
(scans, PDF→EPUB conversions) work out of the box; text-based EPUBs need a
different source plugin (Phase 5+).
"""
from __future__ import annotations

import zipfile
from pathlib import Path

from pydantic import BaseModel, ConfigDict, Field

from cert_extractor.plugins.base import (
    PageList,
    SourceReader,
    register_source,
)


class EPUBImageConfig(BaseModel):
    """Configuration schema for the ``epub_image`` source (per D-068)."""

    model_config = ConfigDict(extra="forbid", strict=True)

    image_extensions: tuple[str, ...] = Field(
        default=(".jpg", ".jpeg", ".png"),
        description="Filename suffixes treated as page images (case-insensitive).",
    )
    sort_by_path: bool = Field(
        default=True,
        description="Sort archive entries by full path before numbering.",
    )


@register_source("epub_image")
class EPUBImageSource(SourceReader):
    """Extract page images from an image-based EPUB archive."""

    description = "Extract page-order image files from an image-based EPUB archive"
    supported_axes = ["source"]
    config_schema = EPUBImageConfig
    __cert_extractor_min_version__ = "0.1.0"
    author = "hakupao"
    license = "MIT"
    homepage = "https://github.com/hakupao/it-passport-learning"

    def __init__(self, config: EPUBImageConfig | None = None):
        self.config = config or EPUBImageConfig()

    def list_pages(self, source_path: str, output_dir: str) -> PageList:
        """Unpack image entries from ``source_path`` EPUB into ``output_dir``.

        Returns:
            ``PageList`` with absolute paths in book order and metadata
            (``total_entries``, ``image_entries``, ``output_dir``).
        """
        src = Path(source_path)
        if not src.exists():
            raise FileNotFoundError(f"EPUB not found: {source_path}")
        if not src.is_file():
            raise IsADirectoryError(f"EPUB path must be a file, got: {source_path}")

        out = Path(output_dir)
        out.mkdir(parents=True, exist_ok=True)

        ext_lower = tuple(e.lower() for e in self.config.image_extensions)
        pages: list[Path] = []
        total_entries = 0

        with zipfile.ZipFile(src) as zf:
            entries = zf.namelist()
            total_entries = len(entries)
            if self.config.sort_by_path:
                entries = sorted(entries)

            for entry in entries:
                lower = entry.lower()
                if not lower.endswith(ext_lower):
                    continue
                page_index = len(pages) + 1
                ext = Path(entry).suffix.lower()
                target = out / f"page_{page_index:03d}{ext}"
                if not target.exists():
                    with zf.open(entry) as src_f, open(target, "wb") as dst_f:
                        dst_f.write(src_f.read())
                pages.append(target)

        return PageList(
            pages=[str(p) for p in pages],
            metadata={
                "source": str(src),
                "output_dir": str(out),
                "total_archive_entries": total_entries,
                "image_entries": len(pages),
            },
        )
