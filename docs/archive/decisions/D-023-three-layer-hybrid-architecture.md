# D-023: Three-Layer Hybrid Architecture (Library + CLI + YAML)

| 字段 | 值 |
|---|---|
| Status | Accepted |
| Date | 2026-05-06 |
| Decision-makers | User + Claude (Opus 4.7) |
| Session | [2026-05-06-session-01](../discussion/2026-05-06-session-01.md) (Topic #1 Q2) |
| Related | D-013 (多源模块化), D-021 (4 轴), D-024 (Python 主语言) |

---

## Context

Topic #1 Q2 问 User 模块化的"形态"想象。User 回答:

> "我完全没想过，我不知道需不需要图形化界面，但我希望可以功能多且强大，好维护，容易看懂"

三个诉求互相拉扯:
- "功能多 + 强大" → 推向复杂
- "好维护 + 容易看懂" → 推向简单

需要分层架构来调和这种张力 —— 把复杂度藏到底层，让上层保持简单。

---

## Decision

**三层 Hybrid**:

| Layer | 内容 | 受众 | 例子 |
|---|---|---|---|
| **Layer 1** | Python 库 `cert_extractor` (核心) | 工程师 / 二次开发 | `from cert_extractor import Pipeline` |
| **Layer 2** | CLI (基于库的命令行入口) | 工程师 / 运维 | `cert-extractor run pipelines/itpassport-r6.yaml` |
| **Layer 3** | YAML pipeline 配置文件 | 配置党 / 非程序员 | `pipelines/itpassport-r6.yaml` 描述完整跑批 |

每层独立可用、可测试、可单独升级。

**Layer 4 (GUI) 不在 v1**。Phase 3 (Web App) 才考虑前端层 (D-024 已锁前端语言为 TS)。

---

## Consequences

### 正面
1. Layer 1 库可以被 Phase 2 个人工具、Phase 4 AI 助手直接 import (Phase 间最大化复用)
2. CLI 用于日常运维（跑批 / 抽检 / 导出 / inspect 数据库）
3. YAML 是版本化、可 diff、可复现的"运行说明书"
4. 测试 anchor 在 Layer 1，CLI/YAML 是薄包装（测试 ROI 最高）
5. 各层之间替换不影响其他（CLI 重写不影响库）

### 负面
1. 比纯 CLI 多写 ~30-50% 代码
2. YAML 校验错误的诊断比 CLI 直接报错多一跳（Pydantic + JSON Schema 注释缓解）

### 中性
1. v1 Phase 1 就要把库设计稳，Phase 2-4 会反复 import 它

---

## Alternatives Considered

### A. CLI only (Unix 哲学)
- 优: 简单
- 劣: 不能被 Phase 2-4 import；脚本组合复杂；测试弱；不能做单元测试
- **结论: 拒绝**

### B. 库 only
- 优: 极简
- 劣: 没 CLI 用起来不便；非程序员无法用；运维场景差
- **结论: 拒绝**

### C. YAML only (DSL)
- 优: 声明式漂亮
- 劣: 自由度低；扩展要改 DSL 解析器；调试困难
- **结论: 拒绝**

### D. GUI in v1
- 致命: GUI 是项目失败最常见路径；前端复杂度爆炸；本项目目标是数据 pipeline 不是产品
- **结论: 拒绝**（GUI 推迟到 Phase 3，与 Web App 一起规划）

### E. 多语言 polyglot (CLI Go, lib Python, YAML 解析 Rust)
- 致命: 维护噩梦；违反 D-024 语言决策
- **结论: 拒绝**

---

## References

- D-013 多源模块化
- D-021 4 轴 pluggable
- D-024 Python 主语言
- Session 01 Topic #1 Q2 原话
