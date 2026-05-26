# D-008: 6-Stage Idempotent Pipeline

| 字段 | 值 |
|---|---|
| Status | Accepted |
| Date | 2026-05-06 |
| Decision-makers | User + Claude (Opus 4.7) |
| Session | [2026-05-06-session-01](../discussion/2026-05-06-session-01.md) |
| Related | D-011 (Glossary 先行), D-021 (4 轴 pluggable), D-022 (Hybrid 数据模型) |

---

## Context

579 页 × 多步骤处理（OCR / 分类 / 结构化 / 翻译 / 抽检 / 导出）。每步都可能失败：
- API 异常（Mistral / Claude 网络/限流）
- 模型偏差（识错字、误分类）
- 人工审核 reject（业务判定 FAIL，per 规则 A）

整 pipeline 重跑成本高（OCR ¥4 + 翻译 ¥100+ + 数小时）。需要"局部失败、局部重跑"的形态。

---

## Decision

Pipeline = **6 个 Stage**（实际 7 个标号，因 4.5 = Glossary 抽取额外阶段，per D-011）:

```
Stage 0: Unpack       EPUB → JPG + 目次
Stage 1: OCR          JPG → Markdown (Mistral, D-005)
Stage 2: Classify     页面分类 (Claude)
Stage 3: Re-OCR       难页复核 (Claude Vision, D-007, 条件触发)
Stage 4: Structure    实体抽取 (Claude)
Stage 4.5: Glossary   术语表抽取 + 锁定 (在翻译之前!, D-011)
Stage 5: Translate    三语翻译 (Claude, glossary-constrained)
Stage 6: Audit        人工抽检 (per 规则 A)
Stage 7: Export       多格式导出 (D-021 Exporter pluggable)
```

每 Stage:
- 输入是上一阶段的盘上文件
- 输出落盘
- **幂等**: 同输入跑两次产出一致
- 可独立 replay

---

## Consequences

### 正面
1. 任意 Stage 失败可单独重跑（不烧上游成本）
2. 每个 Stage 是独立的抽检单元 (per 规则 A)
3. Stage 间 文件契约 → 直接 diff 中间产物，debug 友好
4. 可逐阶段评估成本（per D-030 / D-033 retro 5 段表）
5. 多 attempt 自动归档 (per 规则 B / D-032)

### 负面
1. 磁盘占用增加（保留中间产物）
2. Stage 间序列化（Pydantic JSON）有少量开销

### 中性
1. 每个 Stage 适合写独立的 CLI 子命令（D-023 Layer 2 友好）

---

## Alternatives Considered

### A. 单 in-memory pipeline（流式）
- 优: 内存占用低
- 劣: 任何失败丢全部进度；无法独立抽检；¥4 OCR 一次性烧掉重做
- **结论: 拒绝**

### B. 3 大 Stage 内含子任务
- 优: 简单
- 劣: 抽检颗粒度太粗；难页复核难嵌入；Glossary 这种"中插"阶段无处放
- **结论: 拒绝**

### C. 9+ 个 Stage 过度分解
- 优: 颗粒最细
- 劣: 每 Stage 过于琐碎；orchestrator 逻辑复杂；调试成本高
- **结论: 拒绝**

---

## References

- D-011 Glossary 先行
- D-021 4 轴 pluggable
- D-022 Hybrid 数据模型
