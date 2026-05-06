"""Mistral OCR engine plugin (built-in).

Wraps Mistral's OCR API. Authentication via ``MISTRAL_API_KEY`` environment
variable. Pricing at $1 / 1000 pages on the Scale plan (per D-007 / Session
06 OQ-07 confirmation).

Per D-070: Phase 1 dry-run runs this on a single chapter (~50 pages) before
committing to a full-book run.
"""
from __future__ import annotations

import base64
import os
from pathlib import Path

from pydantic import BaseModel, ConfigDict, Field

from cert_extractor.plugins.base import (
    OCREngine,
    OCRResult,
    register_ocr,
)


class MistralOCRConfig(BaseModel):
    """Configuration schema for the ``mistral`` OCR plugin (per D-068)."""

    model_config = ConfigDict(extra="forbid", strict=True)

    model: str = Field(default="mistral-ocr-latest", description="OCR model id")
    usd_per_1000_pages: float = Field(
        default=1.0,
        ge=0,
        description="Price for cost tracking (Scale plan default $1/1k pages)",
    )
    api_key_env: str = Field(
        default="MISTRAL_API_KEY",
        description="Env var name to read the API key from",
    )


@register_ocr("mistral")
class MistralOCREngine(OCREngine):
    """OCR backed by Mistral API (per D-005 + D-006 + D-070)."""

    description = "Mistral OCR engine (Scale plan, $1/1k pages)"
    supported_axes = ["ocr"]
    config_schema = MistralOCRConfig
    __cert_extractor_min_version__ = "0.1.0"
    author = "hakupao"
    license = "MIT"
    homepage = "https://github.com/hakupao/it-passport-learning"

    def __init__(self, config: MistralOCRConfig | None = None):
        self.config = config or MistralOCRConfig()
        self._client = None  # lazily initialized so unit tests need no API key

    def _get_client(self):
        """Return a Mistral client; lazy import + lazy init keeps tests fast."""
        if self._client is not None:
            return self._client
        api_key = os.environ.get(self.config.api_key_env)
        if not api_key:
            raise RuntimeError(
                f"Missing API key: set {self.config.api_key_env} environment variable "
                f"to use the Mistral OCR plugin (per D-070)"
            )
        try:
            # mistralai v2.x exposes Mistral under mistralai.client (namespace pkg).
            from mistralai.client import Mistral  # type: ignore[import-not-found]
        except ImportError as exc:
            raise RuntimeError(
                "mistralai package is not installed; run `uv sync --all-packages`"
            ) from exc
        self._client = Mistral(api_key=api_key)
        return self._client

    def ocr_page(self, page_path: str) -> OCRResult:
        """OCR one page image and return text + per-page cost rollup."""
        path = Path(page_path)
        if not path.exists():
            raise FileNotFoundError(f"Page image not found: {page_path}")

        client = self._get_client()

        # Mistral's OCR API expects either a public URL or a base64 data URI.
        # We send a base64 inline data URI for local files (private, no upload step).
        data = path.read_bytes()
        b64 = base64.b64encode(data).decode("ascii")
        suffix = path.suffix.lower().lstrip(".") or "jpeg"
        data_url = f"data:image/{suffix};base64,{b64}"

        response = client.ocr.process(
            model=self.config.model,
            document={"type": "image_url", "image_url": data_url},
        )

        # Mistral returns ocr.pages[*].markdown — concatenate all (typically one).
        markdown = "\n\n".join(
            getattr(p, "markdown", "") or "" for p in (response.pages or [])
        )

        cost = self.config.usd_per_1000_pages / 1000.0  # one page

        return OCRResult(
            text=markdown,
            cost_usd=cost,
            pages_processed=1,
        )
