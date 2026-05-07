"""Entity types: Chapter, Section, Term, Question, Table, Figure.

Per D-056 (Closed Literal + Pydantic v2 Discriminated Union).
Core 6 types 锁死, 扩展留 Phase 5 再开.
"""
from typing import Annotated, Literal, Union

from pydantic import BaseModel, ConfigDict, Field

from cert_extractor.schema.common import Anchor, KanaHelper, Trilingual


class _BaseEntity(BaseModel):
    """共享字段基类 (D-022 Hybrid 锚点)."""

    model_config = ConfigDict(extra="forbid", strict=True)

    id: str = Field(..., min_length=1, description="entity 全局唯一标识")
    anchor: Anchor


class Chapter(_BaseEntity):
    """书的章节."""

    type: Literal["chapter"] = "chapter"
    title: Trilingual
    chapter_number: int = Field(..., ge=1)


class Section(_BaseEntity):
    """章内的节."""

    type: Literal["section"] = "section"
    title: Trilingual
    section_number: str = Field(..., min_length=1, description="e.g. '1.2.3'")


class Term(_BaseEntity):
    """术语 (核心抽取单位)."""

    type: Literal["term"] = "term"
    surface: Trilingual = Field(..., description="术语表面形 (三语)")
    definition: Trilingual = Field(..., description="术语定义 (三语)")
    kana_helper: KanaHelper | None = Field(
        default=None, description="难读片假名附此字段 (D-012); 非难读则 None"
    )


class Question(_BaseEntity):
    """考题."""

    type: Literal["question"] = "question"
    stem: Trilingual = Field(..., description="题干 (三语)")
    choices: list[Trilingual] = Field(..., min_length=2, description="≥2 选项")
    answer_index: int = Field(
        ...,
        ge=-1,
        description=(
            "正确答案 index (0-based); -1 = Stage 4 couldn't parse the answer "
            "line for this question — Stage 7 export refuses to ship it (per "
            "D-076 + Envelope.no_unknown_question_answer). [SAFETY FIELD per D-063]"
        ),
    )


class Table(_BaseEntity):
    """表格."""

    type: Literal["table"] = "table"
    caption: Trilingual = Field(..., description="表格 caption")
    rows: list[list[Trilingual]] = Field(
        ..., min_length=1, description="行 × 列, 每 cell Trilingual"
    )


class Figure(_BaseEntity):
    """图片."""

    type: Literal["figure"] = "figure"
    caption: Trilingual = Field(..., description="图片 caption")
    image_ref: str = Field(
        ..., min_length=1, description="指向 /data/.../raw/pages/page_NNN.jpg 相对路径"
    )


# Discriminated Union (D-056) — closed core 6 types
Entity = Annotated[
    Union[Chapter, Section, Term, Question, Table, Figure],
    Field(discriminator="type"),
]
