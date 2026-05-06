"""Unit tests for plugins/base.py (D-021 + D-025 + D-067 + D-068)."""
import pytest
from pydantic import BaseModel

from cert_extractor.plugins.base import (
    AXES,
    OCREngine,
    SourceReader,
    get_plugin,
    get_registry,
    register_ocr,
    register_source,
    reset_registry,
)


class _DummyConfig(BaseModel):
    pass


class TestAxes:
    def test_four_axes(self):
        assert AXES == ("source", "ocr", "translator", "exporter")

    def test_registry_initially_empty_per_axis(self):
        reset_registry()
        for axis in AXES:
            assert get_registry()[axis] == {}


class TestRegistration:
    def setup_method(self):
        reset_registry()

    def test_register_ocr_via_decorator(self):
        @register_ocr("dummy_ocr")
        class Dummy(OCREngine):
            description = "dummy"
            supported_axes = ["ocr"]
            config_schema = _DummyConfig
            __cert_extractor_min_version__ = "0.1.0"

            def ocr_page(self, page_path: str) -> str:
                return ""

        assert get_plugin("ocr", "dummy_ocr") is Dummy
        assert Dummy.name == "dummy_ocr"

    def test_register_source(self):
        @register_source("dummy_source")
        class DummySource(SourceReader):
            description = "dummy"
            supported_axes = ["source"]
            config_schema = _DummyConfig
            __cert_extractor_min_version__ = "0.1.0"

            def list_pages(self, source_path: str) -> list[str]:
                return []

        assert get_plugin("source", "dummy_source") is DummySource


class TestMetadataValidation:
    def setup_method(self):
        reset_registry()

    def test_missing_description_rejected(self):
        with pytest.raises(TypeError, match="missing required attribute: description"):

            @register_ocr("missing_desc")
            class Bad(OCREngine):
                supported_axes = ["ocr"]
                config_schema = _DummyConfig
                __cert_extractor_min_version__ = "0.1.0"

                def ocr_page(self, page_path: str) -> str:
                    return ""

    def test_missing_min_version_rejected(self):
        with pytest.raises(TypeError, match="__cert_extractor_min_version__"):

            @register_ocr("missing_minv")
            class Bad(OCREngine):
                description = "x"
                supported_axes = ["ocr"]
                config_schema = _DummyConfig

                def ocr_page(self, page_path: str) -> str:
                    return ""


class TestConflict:
    def setup_method(self):
        reset_registry()

    def test_duplicate_name_raises(self):
        @register_ocr("conflict_name")
        class First(OCREngine):
            description = "first"
            supported_axes = ["ocr"]
            config_schema = _DummyConfig
            __cert_extractor_min_version__ = "0.1.0"

            def ocr_page(self, page_path: str) -> str:
                return ""

        with pytest.raises(ValueError, match="conflict"):

            @register_ocr("conflict_name")
            class Second(OCREngine):
                description = "second"
                supported_axes = ["ocr"]
                config_schema = _DummyConfig
                __cert_extractor_min_version__ = "0.1.0"

                def ocr_page(self, page_path: str) -> str:
                    return ""
