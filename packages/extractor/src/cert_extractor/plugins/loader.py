"""Plugin loader (per D-065).

Phase 1: only D-025 decorator path enabled.
Phase 5: ``enable_entry_points=True`` to also load via Python entry_points (D-064).

The Phase 5 path is implemented but not exercised in Phase 1 (no third-party
plugins exist yet); flipping the flag is a zero-code-change Phase 5 transition.
"""
from __future__ import annotations

import importlib
import pkgutil
from importlib.metadata import entry_points

from packaging.version import InvalidVersion, Version

from cert_extractor.plugins.base import (
    AXES,
    BasePlugin,
    _REGISTRY,
    _register_with_conflict_check,
    _validate_metadata,
)

# Per D-064: 4 axis-namespace
EP_GROUPS: dict[str, str] = {axis: f"cert_extractor.{axis}" for axis in AXES}


class PluginLoader:
    """Load all plugins from D-025 decorators + (optionally) entry_points."""

    def __init__(self, enable_entry_points: bool = False, strict_mode: bool = True):
        self.enable_entry_points = enable_entry_points
        self.strict_mode = strict_mode  # per D-066

    def load_all(self) -> dict[str, dict[str, type[BasePlugin]]]:
        """Trigger plugin discovery + return a registry snapshot."""
        self._scan_decorator_modules()
        if self.enable_entry_points:
            self._load_via_entry_points()
        return {axis: dict(plugins) for axis, plugins in _REGISTRY.items()}

    def _scan_decorator_modules(self) -> None:
        """Import every plugins/<axis>/*.py so ``@register_<axis>`` side-effects fire."""
        for axis in AXES:
            axis_pkg_name = f"cert_extractor.plugins.{axis}"
            try:
                axis_pkg = importlib.import_module(axis_pkg_name)
            except ModuleNotFoundError:
                continue
            for _, modname, _ in pkgutil.iter_modules(axis_pkg.__path__):
                if modname.startswith("_"):
                    continue
                importlib.import_module(f"{axis_pkg_name}.{modname}")

    def _load_via_entry_points(self) -> None:
        """Phase 5: load third-party plugins via entry_points (per D-064)."""
        from cert_extractor import __version__ as lib_version

        for axis, group in EP_GROUPS.items():
            for ep in entry_points(group=group):
                try:
                    plugin_cls = ep.load()
                except Exception as exc:
                    if self.strict_mode:
                        raise
                    # warn-and-skip (per D-066)
                    print(f"[plugin loader] WARN: entry_point {ep!r} load failed: {exc!r}")
                    continue
                try:
                    _validate_metadata(plugin_cls)
                    self._validate_min_version(plugin_cls, lib_version)
                except Exception as exc:
                    if self.strict_mode:
                        raise
                    print(f"[plugin loader] WARN: {plugin_cls!r} failed metadata check: {exc!r}")
                    continue
                _register_with_conflict_check(axis, plugin_cls)

    @staticmethod
    def _validate_min_version(plugin_cls: type[BasePlugin], lib_version: str) -> None:
        """Per D-066: enforce __cert_extractor_min_version__ in strict_mode."""
        min_v_raw = getattr(plugin_cls, "__cert_extractor_min_version__", None)
        if min_v_raw is None:
            raise TypeError(
                f"Plugin {plugin_cls.__module__}.{plugin_cls.__name__} missing "
                f"__cert_extractor_min_version__"
            )
        try:
            if Version(lib_version) < Version(min_v_raw):
                raise RuntimeError(
                    f"Plugin {plugin_cls.__name__} requires cert-extractor >= "
                    f"{min_v_raw}, but running version is {lib_version}"
                )
        except InvalidVersion as exc:
            raise TypeError(
                f"Plugin {plugin_cls.__name__} has invalid version "
                f"declaration: {min_v_raw!r}"
            ) from exc
