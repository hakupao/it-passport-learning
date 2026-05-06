"""Unit tests for the mistral OCR plugin (structure only — no API call)."""
import os
from pathlib import Path

import pytest

from cert_extractor.plugins.base import reset_registry
from cert_extractor.plugins.ocr.mistral import (
    MistralOCRConfig,
    MistralOCREngine,
)


@pytest.fixture(autouse=True)
def _registry_isolation():
    yield
    reset_registry()


def test_metadata_required_fields_present():
    """Per D-068 standard metadata."""
    assert MistralOCREngine.name == "mistral"
    assert MistralOCREngine.description
    assert MistralOCREngine.supported_axes == ["ocr"]
    assert MistralOCREngine.__cert_extractor_min_version__
    assert MistralOCREngine.config_schema is MistralOCRConfig


def test_default_config_pricing_matches_d007():
    """Default $1 / 1000 pages = D-005 / D-007 / Session 06 OQ-07 confirmed pricing."""
    cfg = MistralOCRConfig()
    assert cfg.usd_per_1000_pages == 1.0
    assert cfg.model == "mistral-ocr-latest"


def test_extra_field_in_config_rejected():
    from pydantic import ValidationError

    with pytest.raises(ValidationError):
        MistralOCRConfig(model="x", extra_garbage="boom")  # type: ignore[call-arg]


def test_missing_api_key_raises_runtime_error(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    """No MISTRAL_API_KEY → fail-fast before any network call (per D-066 strict_mode style)."""
    monkeypatch.delenv("MISTRAL_API_KEY", raising=False)
    fake_image = tmp_path / "p.jpg"
    fake_image.write_bytes(b"\xff\xd8\xff\xe0fake")

    plugin = MistralOCREngine()
    with pytest.raises(RuntimeError, match="MISTRAL_API_KEY"):
        plugin.ocr_page(str(fake_image))


def test_missing_image_raises_filenotfound(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("MISTRAL_API_KEY", "fake-key-for-test")
    plugin = MistralOCREngine()
    with pytest.raises(FileNotFoundError):
        plugin.ocr_page(str(tmp_path / "nope.jpg"))
