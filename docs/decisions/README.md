# Architecture Decision Records (ADR)

本目录保存「**重大决定**」的独立长篇说明。**不重大**的决定保留在 session 日志的 `D-NNN` 表格里（一行 reason）。

立项依据: **D-029**（Topic #2 锁定，γ 折中方案）。

## 什么算"重大" / Major Criteria (per D-029)

满足**任一**条件即视为重大:

- **影响 Phase 边界**: 决定 Phase 之间的接口契约（数据 schema、工具链、部署模型）
- **不可逆**: 反悔代价高（重写大量代码、迁移数据、推翻产品方向）
- **高争议**: 真有 2+ 个合理选项，需要解释为什么不选其他
- **架构基石**: 后续大量决定建立其上

不满足任一条件 → 留在 session 日志即可。

## 命名规则 / Naming

```
D-NNN-slug-in-kebab-case.md
```

- `NNN` 与 session 日志里的 D-NNN 一一对应
- `slug` 用英文 kebab-case，便于跨平台、避免文件名乱码
- 例: `D-024-python-as-primary-language.md`

## ADR 模板 / Template

每份 ADR 至少包含:

| 字段 | 内容 |
|---|---|
| Status | `Proposed` / `Accepted` / `Superseded by D-XXX` / `Deprecated` |
| Date | 决定日期 (YYYY-MM-DD) |
| Decision-makers | User / Claude (subagent_type 注明) |
| Session | 链回 session 日志 |
| Supersedes | 如果替代某条旧决定，链向旧 ADR |
| Superseded by | 如果被替代，链向新 ADR |
| **Context** | 当时面对什么问题、什么约束、什么诉求 |
| **Decision** | 决定了什么（精确表述，避免歧义） |
| **Consequences** | 正面 / 负面 / 中性后果 |
| **Alternatives Considered** | 还考虑过什么、为什么没选 |

例文见 [`D-024-python-as-primary-language.md`](./D-024-python-as-primary-language.md)。

## 索引 / Index

OQ-15 已闭合（D-031）：8 条全部锁定为重大并各有 ADR。

| ID | 标题 | 重大类别 | Status |
|---|---|---|---|
| D-005 | [Mistral OCR as Primary](D-005-mistral-ocr-as-primary.md) | 高争议（vs PaddleOCR/Claude Vision/olmOCR）+ 不可逆 | ✅ Accepted |
| D-008 | [6-Stage Idempotent Pipeline](D-008-six-stage-idempotent-pipeline.md) | 架构基石 | ✅ Accepted |
| D-013 | [Multi-Source Modular Architecture](D-013-multi-source-modular-architecture.md) | 架构基石（驱动 D-021） | ✅ Accepted |
| D-016 | [Phase Roadmap](D-016-phase-roadmap.md) | Phase 边界 | ✅ Accepted |
| D-021 | [Four-Axis Pluggable](D-021-four-axis-pluggable.md) | 架构基石 | ✅ Accepted |
| D-022 | [Hybrid Anchor Data Model](D-022-hybrid-anchor-data-model.md) | 架构基石（决定 schema 形状） | ✅ Accepted |
| D-023 | [Three-Layer Hybrid Architecture](D-023-three-layer-hybrid-architecture.md) | Phase 边界 + 不可逆 | ✅ Accepted |
| D-024 | [Python as Primary Language](D-024-python-as-primary-language.md) | 不可逆 + 高争议 | ✅ Accepted |

## 状态规则

- ADR 一旦 `Accepted` → 不允许修改正文（除补充 typo / 补链接）
- 改主意时**新建** ADR `D-XXX`，在 `Supersedes: D-NNN` 标记，老 ADR 改为 `Superseded by D-XXX` 但内容不动
- 这样历史链条始终可追溯，符合 D-027 操作守则
