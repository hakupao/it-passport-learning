"""Common schema types: Trilingual, KanaHelper, Anchor.

Per:
- D-054 (Trilingual nested form, Pydantic BaseModel)
- D-012 (kana_helper for hard katakana terms)
- D-022 (Hybrid 锚点: page + block_id + section_path)
"""
from pydantic import BaseModel, ConfigDict, Field


class Trilingual(BaseModel):
    """三语文本载体 (D-054).

    Stage 0~4: ``zh`` / ``en`` 可填占位符 ``UNTRANSLATED`` (D-055).
    Stage 5+: 必须填真实翻译.
    Stage 7 export: 必须 0 占位符 (Envelope.no_untranslated_leakage validator).
    """

    model_config = ConfigDict(extra="forbid", strict=True)

    jp: str = Field(..., min_length=1, description="日语原文 (source 语言)")
    zh: str = Field(..., min_length=1, description="中文翻译")
    en: str = Field(..., min_length=1, description="英文翻译")


class KanaHelper(BaseModel):
    """难读片假名词的辅助标注 (D-012).

    Example::

        KanaHelper(
            surface="アルゴリズム",
            reading="arugorizumu",
            zh_concept="算法",
        )

    Per D-080 (Session 13): the ``auto_backfill`` flag distinguishes
    placeholders auto-injected by Stage 4.5 (when an all-katakana surface
    came back from the LLM with ``kana_helper=null``) from human-authored or
    LLM-authored entries. Both pass D11 audit; the flag exists for
    traceability — Stage 5 / Stage 7 consumers may treat backfilled entries
    differently (e.g. Stage 5 prompt v2 could refine the ``reading`` /
    ``zh_concept`` rather than treating it as a hard lock).
    """

    model_config = ConfigDict(extra="forbid", strict=True)

    surface: str = Field(..., min_length=1, description="片假名表面形")
    reading: str = Field(..., min_length=1, description="罗马字读法 (or katakana itself for auto-backfilled placeholders, per D-080)")
    zh_concept: str = Field(..., min_length=1, description="对应的中文概念词")
    auto_backfill: bool = Field(
        default=False,
        description="True when this kana_helper was auto-injected by Stage 4.5 (per D-080) rather than authored",
    )


class Anchor(BaseModel):
    """Hybrid 锚点 (D-022).

    每个 entity 必须带这三个字段, 用于跨 stage 追溯 / 复盘.
    """

    model_config = ConfigDict(extra="forbid", strict=True)

    page: int = Field(..., ge=1, description="原书页码 (1-indexed)")
    block_id: str = Field(
        ..., min_length=1, description="页内 block 标识, e.g. 'page_012_block_3'"
    )
    section_path: list[str] = Field(
        default_factory=list,
        description="章/节路径, e.g. ['第1章', '1.2 数据表示']",
    )
