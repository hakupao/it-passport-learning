"""Plugin abstract base classes + registry + decorators.

Per:
- D-021 (4 axes: source / ocr / translator / exporter)
- D-025 (@register_<axis> decorator-based registration for internal plugins)
- D-064 (4 axis-namespace for entry_points)
- D-068 (standard metadata: name / description / supported_axes / config_schema /
  __cert_extractor_min_version__ / author / license / homepage)
- D-067 (name conflict → raise; YAML disambiguation via ``<package>::<name>``)
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Callable, ClassVar, TypeVar

from pydantic import BaseModel

# 4 axis identifiers (per D-021 + D-064)
AXES: tuple[str, ...] = ("source", "ocr", "translator", "exporter")


@dataclass
class OCRResult:
    """Return value of ``OCREngine.ocr_page`` (carries text + cost metadata)."""

    text: str  # extracted markdown
    cost_usd: float = 0.0
    pages_processed: int = 1


@dataclass
class TranslationResult:
    """Return value of ``TranslatorPlugin.translate``."""

    text: str
    cost_usd: float = 0.0
    tokens_input: int = 0
    tokens_output: int = 0


@dataclass
class PageList:
    """Return value of ``SourceReader.list_pages``."""

    pages: list[str] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)


class BasePlugin(ABC):
    """Abstract base for all plugins (per D-021 + D-068).

    Concrete plugins must define class attributes:

    - ``name`` (set by ``@register_<axis>(name)``)
    - ``description``
    - ``supported_axes``
    - ``config_schema`` (a Pydantic ``BaseModel`` subclass)
    - ``__cert_extractor_min_version__``

    Recommended (optional but enforced as empty-string defaults):

    - ``author`` / ``license`` / ``homepage``
    """

    name: ClassVar[str]
    description: ClassVar[str]
    supported_axes: ClassVar[list[str]]
    config_schema: ClassVar[type[BaseModel]]
    __cert_extractor_min_version__: ClassVar[str]

    author: ClassVar[str] = ""
    license: ClassVar[str] = ""
    homepage: ClassVar[str] = ""


class SourceReader(BasePlugin):
    """Source reader axis (D-021).

    Reads input materials (e.g. EPUB, PDF) and emits a list of page-level paths
    (typically image files for OCR or text files for direct extraction).
    """

    @abstractmethod
    def list_pages(self, source_path: str, output_dir: str) -> PageList:
        """Extract pages from source_path into output_dir; return paths in book order."""


class OCREngine(BasePlugin):
    """OCR engine axis (D-021)."""

    @abstractmethod
    def ocr_page(self, page_path: str) -> OCRResult:
        """Return extracted text + cost metadata for one page image."""


class TranslatorPlugin(BasePlugin):
    """Translator axis (D-021).

    ``target_lang`` is one of ``"zh"`` or ``"en"``.
    """

    @abstractmethod
    def translate(self, text_jp: str, target_lang: str) -> TranslationResult:
        """Translate Japanese source text into target language."""


class Exporter(BasePlugin):
    """Exporter axis (D-021)."""

    @abstractmethod
    def export(self, envelope: Any, output_dir: str) -> None:
        """Write envelope.items into output_dir per format-specific layout."""


# Registry: axis_name → {plugin_name → plugin_class}
_REGISTRY: dict[str, dict[str, type[BasePlugin]]] = {axis: {} for axis in AXES}

_PluginT = TypeVar("_PluginT", bound=BasePlugin)


def _make_register(axis: str) -> Callable[[str], Callable[[type[_PluginT]], type[_PluginT]]]:
    """Factory for ``@register_<axis>(name)`` decorators (per D-025)."""

    def register(name: str) -> Callable[[type[_PluginT]], type[_PluginT]]:
        def decorator(cls: type[_PluginT]) -> type[_PluginT]:
            _validate_metadata(cls)
            cls.name = name  # type: ignore[misc]
            _register_with_conflict_check(axis, cls)
            return cls

        return decorator

    return register


def _validate_metadata(cls: type[BasePlugin]) -> None:
    """Per D-068: check required class attributes are present."""
    required = (
        "description",
        "supported_axes",
        "config_schema",
        "__cert_extractor_min_version__",
    )
    for attr in required:
        if not hasattr(cls, attr):
            raise TypeError(
                f"Plugin {cls.__module__}.{cls.__name__} missing required attribute: {attr}"
            )


def _register_with_conflict_check(axis: str, cls: type[BasePlugin]) -> None:
    """Per D-067: raise on name conflict (YAML disambiguation handled at pipeline level)."""
    name = cls.name  # set in decorator
    if name in _REGISTRY[axis]:
        existing = _REGISTRY[axis][name]
        raise ValueError(
            f"Plugin name conflict in axis {axis!r}: {name!r} from "
            f"{cls.__module__} conflicts with already-registered "
            f"{existing.__module__}.{existing.__name__}"
        )
    _REGISTRY[axis][name] = cls


# Public decorator instances (per D-025)
register_source = _make_register("source")
register_ocr = _make_register("ocr")
register_translator = _make_register("translator")
register_exporter = _make_register("exporter")


def get_registry() -> dict[str, dict[str, type[BasePlugin]]]:
    """Return the live registry mapping (per D-025)."""
    return _REGISTRY


def get_plugin(axis: str, name: str) -> type[BasePlugin]:
    """Look up a registered plugin class by axis + name."""
    return _REGISTRY[axis][name]


def reset_registry() -> None:
    """Clear all axes — test-helper only, do not use in production."""
    for axis in AXES:
        _REGISTRY[axis].clear()
