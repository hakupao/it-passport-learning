# D-022: Hybrid Anchor Data Model (page + block + section)

| 字段 | 值 |
|---|---|
| Status | Accepted |
| Date | 2026-05-06 |
| Decision-makers | User + Claude (Opus 4.7) |
| Session | [2026-05-06-session-01](../discussion/2026-05-06-session-01.md) (Topic #1 Q4) |
| Related | D-009 (三语 schema), D-010 (cert-agnostic), D-013 (多源) |

---

## Context

不同源天然结构差异巨大:

| 源类型 | 天然单元 |
|---|---|
| EPUB-image / 扫描 PDF | 物理页 (page) |
| EPUB-text / Markdown | 章节 (chapter) / 段落 (paragraph) |
| TXT | 无结构 |
| HTML | DOM 节点 |
| 图片合集 zip | 单张图片 |

下游（分类、抽取、翻译、抽检、RAG 切块）想面对**统一接口**。需要选一个共同"原子"。同时 User 强调"全程留痕"，意味着要保留物理位置追溯能力。

---

## Decision

每个实体同时携带**三层锚点**:

```python
class Block(BaseModel):
    # 身份
    id: str                       # 例: "q_ch3_p124_b07"
    cert_id: str                  # 例: "itpassport_r6"  (per D-010)

    # Hybrid 三层锚点
    page: int | None              # 物理页 (无 page 概念时 None 或 synthesize)
    block_id: str                 # 块内 ID (页内/无页源内的局部序号)
    section_path: list[str]       # 例: ["3. ハードウェア", "3.2 入出力デバイス"]

    # 类型 + 内容
    block_type: BlockType         # paragraph / question / option / answer / explanation /
                                  # term / definition / table / figure / caption / code / ...
    content: TrilingualContent    # {jp, zh, en}  (per D-009)

    # 反向索引
    terms_referenced: list[str]   # glossary entry IDs
    kana_helper: list[KanaHelp] | None  # (per D-012)
```

为不同源处理 page 缺失:
- TXT: synthesize page 从字符 offset (例每 N 字符 = 1 page)，或 page=None
- EPUB-text: 用 spine index 当虚拟 page
- HTML: 用 section_path 主导，page=None

---

## Consequences

### 正面
1. 任何实体都能定位回扫描原图（page）做核对，符合"全程留痕"
2. 任何实体都能 RAG 切块（block 颗粒），Phase 4 (C) AI 助手免费
3. 任何实体都能在目录树查找（section_path），UI 友好
4. 跨源统一: 下游代码不区分源类型
5. Hybrid 让 schema 足够大但不至于失去结构

### 负面
1. 数据模型最复杂（三个标识共存）
2. 每个 reader 需要正确填充三层锚点（reader 实现成本上升）
3. 同一内容跨页时要决定"主 page" (规则: 内容主体所在页)

### 中性
1. Pydantic 模型自动校验三层锚点字段，错误能尽早暴露

---

## Alternatives Considered

### A. Page-only
- 致命: TXT/MD 无 page，强行 synthesize 失真；段落/章节信息丢失
- **结论: 拒绝**

### B. Block-only
- 致命: 失去物理位置；扫描书 ground truth 是"看原图"；规则 A 抽检时无法 trace
- **结论: 拒绝**

### C. Section-only
- 致命: 颗粒太粗；抽检和 RAG 都难做（一节有几十块）
- **结论: 拒绝**

### D. 按源类型选不同模型
- 致命: 下游 if/else 爆炸；违反统一接口；4 轴 pluggable (D-021) 失去意义
- **结论: 拒绝**

---

## References

- D-009 三语 schema
- D-010 cert-agnostic
- D-013 多源
- Session 01 Topic #1 Q4 原话
