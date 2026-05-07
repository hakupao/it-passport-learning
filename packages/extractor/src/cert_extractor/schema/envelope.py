"""Stage 7 export envelope (D-058).

包封 4 字段 metadata + items (Entity Discriminated Union).
SemVer bump rules:

- MAJOR: 删字段 / 改类型 / 改语义 / 删 entity type / 改 envelope 4 字段任一
- MINOR: 加 optional 字段 / 加 entity type / 加 enum value
- PATCH: 仅 docstring / bug fix (不影响 schema 形态)
"""
from __future__ import annotations

from datetime import datetime
from importlib.metadata import PackageNotFoundError, version
from zoneinfo import ZoneInfo

from pydantic import BaseModel, ConfigDict, Field, model_validator

from cert_extractor import SCHEMA_VERSION, UNTRANSLATED
from cert_extractor.schema.entities import Entity


def _current_extractor_version() -> str:
    try:
        return version("cert-extractor")
    except PackageNotFoundError:
        return "0.0.0+unknown"


def _now_tokyo_iso() -> str:
    return datetime.now(tz=ZoneInfo("Asia/Tokyo")).isoformat()


class Envelope(BaseModel):
    """Stage 7 export 顶层包封 (D-058)."""

    model_config = ConfigDict(extra="forbid", strict=True)

    schema_version: str = Field(
        default=SCHEMA_VERSION, frozen=True, description="schema SemVer (D-058)"
    )
    extractor_version: str = Field(
        default_factory=_current_extractor_version,
        description="cert-extractor 库版本",
    )
    cert_id: str = Field(..., min_length=1, description="cert-agnostic 标识 (D-010)")
    generated_at: str = Field(
        default_factory=_now_tokyo_iso, description="ISO 8601 (Asia/Tokyo)"
    )
    items: list[Entity] = Field(..., description="实体列表 (D-056)")

    @model_validator(mode="after")
    def no_untranslated_leakage(self) -> "Envelope":
        """Per D-055: stage 7 export 不允许任何字段含 UNTRANSLATED 占位符."""
        leaks: list[str] = []
        for item in self.items:
            leaks.extend(_walk_for_untranslated(item, getattr(item, "id", "<?>")))
        if leaks:
            head = ", ".join(leaks[:5])
            tail = "..." if len(leaks) > 5 else ""
            raise ValueError(
                f"UNTRANSLATED placeholder leak in {len(leaks)} field(s): [{head}{tail}]"
            )
        return self

    @model_validator(mode="after")
    def no_unknown_question_answer(self) -> "Envelope":
        """Per D-076: Stage 4 may emit `answer_index = -1` when it cannot
        parse the answer line; Stage 7 export refuses to ship those — they
        require manual repair (re-run Stage 4 with a fixed prompt, or
        patch the structured/ data) before becoming learner-facing."""
        unknown: list[str] = []
        for item in self.items:
            if getattr(item, "type", None) != "question":
                continue
            if getattr(item, "answer_index", 0) == -1:
                unknown.append(getattr(item, "id", "<?>"))
        if unknown:
            head = ", ".join(unknown[:5])
            tail = "..." if len(unknown) > 5 else ""
            raise ValueError(
                f"Question(s) with unknown answer_index (-1) in "
                f"{len(unknown)} entity(ies): [{head}{tail}]"
            )
        return self


def _walk_for_untranslated(obj: object, breadcrumb: str) -> list[str]:
    """Walk a Pydantic model recursively, collecting any field with UNTRANSLATED."""
    found: list[str] = []
    if isinstance(obj, BaseModel):
        for field_name in type(obj).model_fields:
            value = getattr(obj, field_name)
            sub_crumb = f"{breadcrumb}.{field_name}"
            if field_name in ("jp", "zh", "en") and value == UNTRANSLATED:
                found.append(sub_crumb)
            else:
                found.extend(_walk_for_untranslated(value, sub_crumb))
    elif isinstance(obj, list):
        for idx, child in enumerate(obj):
            found.extend(_walk_for_untranslated(child, f"{breadcrumb}[{idx}]"))
    return found
