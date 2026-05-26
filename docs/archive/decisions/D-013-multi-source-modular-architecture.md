# D-013: Multi-Source Modular Architecture

| 字段 | 值 |
|---|---|
| Status | Accepted |
| Date | 2026-05-06 |
| Decision-makers | User + Claude (Opus 4.7) |
| Session | [2026-05-06-session-01](../discussion/2026-05-06-session-01.md) (Topic #1 触发) |
| Related | D-021 (4 轴), D-022 (Hybrid 数据模型), D-025 (插件机制) |

---

## Context

User 在 Topic #1 进入前的「三大原则」环节主动提出:

> "我希望我做出来的工具是模块化的，因为不是所有资源都是图片形式的电子书，pdf，txt，文字，等等"

这一句话改变了整个架构走向 —— 把"为这本书写的脚本"升级为"为多源教材内容工厂"。

---

## Decision

`SourceReader` 是从 v1 第一天起就**规范化的接口**。v1 只实现 `epub_image` 一个 reader，但接口稳定、文档化，未来加新 reader 不需修改主流程。

未来候选 readers (按预期实现先后排):
- `epub_text` (有文字层 EPUB)
- `pdf_text` / `pdf_scanned`
- `txt`
- `html`
- `markdown`
- `docx`
- `image_zip` (一堆 PNG 截图)

每加一个 reader 是**一个新文件** `plugins/source/<name>.py`，主 pipeline 一行不改 (per D-025 装饰器注册)。

---

## Consequences

### 正面
1. 教材资源类型多样，覆盖面广
2. 每个 reader 独立测试、独立维护
3. User 自定义 reader 几乎免费（写一个文件 + 一个装饰器）
4. 测试成本随 reader 数量**线性**增长，不是平方增长（互不耦合）
5. Phase 5 通用化时这个接口是核心资产

### 负面
1. v1 多写约 30% 接口/抽象代码
2. v1 看起来"过度工程化"（只有一个 reader 实现却有完整接口）

### 中性
1. 接口设计的好坏直接决定未来是否好扩展（设计阶段慢一点是值得的，匹配 User"前期讨论多花时间"原则）

---

## Alternatives Considered

### A. 硬编码 EPUB-image，遇到第二种源再重构
- 优: v1 简单
- 劣: "later" 永远不来；接口在重构期容易乱；v2 实现时往往要回头大改 v1 代码
- **结论: 拒绝（违反 User 的"做好可扩充准备"明示）**

### B. 通用 file reader (一个 reader 处理所有格式)
- 优: 不用接口，超简单
- 劣: 各源解析逻辑差异巨大（EPUB 是 zip，PDF 有页面，TXT 是流），混在一个类里会爆炸
- **结论: 拒绝**

### C. Reader 直接耦合到 pipeline
- 优: 直观
- 劣: 不能 mix-and-match；测试要拉整个 pipeline；违反"4 轴 pluggable" (D-021)
- **结论: 拒绝**

---

## References

- Session 01 §10 「三大原则锁定」原话
- D-021 4 轴 pluggable (本 ADR 直接催生)
- D-025 装饰器 + entry_points 注册机制
