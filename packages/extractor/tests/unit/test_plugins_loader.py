"""Unit tests for plugins/loader.py (D-065 + D-066)."""
import pytest

from cert_extractor.plugins.base import OCREngine, reset_registry
from cert_extractor.plugins.loader import EP_GROUPS, PluginLoader


class _DummyConfig:
    pass  # type-only stand-in (validators not needed for these tests)


class TestEPGroups:
    def test_four_axis_namespaces(self):
        assert EP_GROUPS == {
            "source": "cert_extractor.source",
            "ocr": "cert_extractor.ocr",
            "translator": "cert_extractor.translator",
            "exporter": "cert_extractor.exporter",
        }


class TestLoadAllSafe:
    """load_all() must not crash even with no plugins installed."""

    def setup_method(self):
        reset_registry()

    def test_phase1_default_no_entry_points(self):
        loader = PluginLoader()
        snapshot = loader.load_all()
        assert set(snapshot.keys()) == {"source", "ocr", "translator", "exporter"}


class TestMinVersion:
    def test_compatible_passes(self):
        class FakePlugin:
            __cert_extractor_min_version__ = "0.1.0"
            __name__ = "FakePlugin"
            __module__ = "test"

        # cert_extractor.__version__ is 0.1.0 → equal → pass
        PluginLoader._validate_min_version(FakePlugin, "0.1.0")  # type: ignore[arg-type]

    def test_too_old_lib_rejected(self):
        class FakePlugin:
            __cert_extractor_min_version__ = "1.0.0"
            __name__ = "FakePlugin"
            __module__ = "test"

        with pytest.raises(RuntimeError, match="requires cert-extractor"):
            PluginLoader._validate_min_version(FakePlugin, "0.5.0")  # type: ignore[arg-type]

    def test_missing_attr_raises(self):
        class FakePlugin:
            __name__ = "FakePlugin"
            __module__ = "test"

        with pytest.raises(TypeError, match="missing __cert_extractor_min_version__"):
            PluginLoader._validate_min_version(FakePlugin, "0.1.0")  # type: ignore[arg-type]

    def test_invalid_version_raises(self):
        class FakePlugin:
            __cert_extractor_min_version__ = "not-a-version"
            __name__ = "FakePlugin"
            __module__ = "test"

        with pytest.raises(TypeError, match="invalid version"):
            PluginLoader._validate_min_version(FakePlugin, "0.1.0")  # type: ignore[arg-type]
