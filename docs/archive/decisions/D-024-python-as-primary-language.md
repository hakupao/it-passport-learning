# D-024: Python 3.11+ as Primary Language

| 字段 | 值 |
|---|---|
| Status | Accepted |
| Date | 2026-05-06 |
| Decision-makers | User + Claude (Opus 4.7, OMC plugin) |
| Session | [2026-05-06-session-01](../discussion/2026-05-06-session-01.md) (Topic #1) |
| Supersedes | — |
| Superseded by | — |

---

## Context

Phase 1 是一个**多源内容处理 pipeline**，核心依赖：

- **Mistral OCR API**（OCR 主力，D-005）
- **Anthropic Claude API**（页面分类 / 结构化抽取 / 翻译 / 抽检）
- **多种源解析**：EPUB-image / EPUB-text / PDF-text / PDF-scanned / TXT / HTML / DOCX / Markdown
- **多格式输出**: SQLite + JSON + JSONL + Markdown
- **可插拔架构**（D-013 + D-021）：4 轴 plugin（Source / OCR / Translator / Exporter）

User 诉求（D-023 触发）:
- 功能多 + 强大
- 好维护 + 容易看懂
- 模块化（D-013 已锁）

User 在 Topic #1 末尾**主动反问**："问题5 你是以python为前提做的假设，如果不是这个语言，其他语言或者框架可以解决这个问题吗"——本 ADR 是对此质疑的正式回应。

---

## Decision

**主语言 = Python 3.11+**。

Phase 3（B Web App）前端独立选用 **TypeScript**（Next.js / Astro / 其他都行），**通过 SQLite + JSON 文件契约与 Phase 1 解耦** —— Python 后端不需要懂前端，反之亦然。

锁定 Python 的具体含义:
- `cert_extractor` Python 库为唯一 Layer 1（D-023）
- CLI 用 `typer` 或 `click`（具体留 Topic #7）
- Schema 校验用 Pydantic
- 测试 `pytest` + snapshot（具体留 Topic #7）
- 包管理倾向 `uv`（待 Topic #7 确认）

---

## Consequences

### 正面

1. **OCR 生态独占** — PaddleOCR / olmOCR / EasyOCR 等本地 OCR 几乎只有 Python 实现。即使 v1 主用 Mistral API，未来想接本地免费 OCR 时不会被语言锁死。
2. **EPUB / PDF 解析库最丰富** — `ebooklib` / `pypdf` / `pymupdf` / `lxml` / `python-docx` / `beautifulsoup4` 都是工业级；TS/Go/Rust 同类库或不存在或半成品。
3. **LLM SDK 一等公民** — Mistral / Anthropic / OpenAI / Gemini 的 Python SDK 都最先发布、最稳定、文档最全。
4. **Pydantic 是 schema 校验金标准** — 直接匹配三语 schema (D-009) + 跨阶段契约校验需求（每个 stage 进出都用 Pydantic 模型把关）。
5. **pytest + snapshot testing 成熟** — 我们对 OCR 输出、翻译输出做 snapshot 比对天然适合。
6. **uv 提供接近 npm 的体验** — 解决了 Python 旧时代的依赖痛点。
7. **「容易看懂」前提满足** — Python 文档 + Stack Overflow + 中文教程资源量级是其他语言的几倍。

### 负面

1. **v1 Phase 1 单语言**，无法和 Phase 3 前端共享代码。**通过文件契约（SQLite + JSON）解决**——前端不需要 import 任何 Python 代码，只读数据。
2. **Python 类型系统不如 TypeScript 严格** —— 用 Pydantic + mypy strict 弥补；trade-off 可接受。
3. **性能** —— Python 比 Rust/Go 慢约 10-100×。但本项目瓶颈是 IO（API 调用），CPU 不是瓶颈，性能差距对总耗时影响 < 5%。

### 中性

1. 跨平台: Linux/macOS/Windows 都好。
2. 部署: Phase 1 是离线 pipeline，无 deployment 难度。
3. 团队招募 / AI 助手编码：Python 是 AI 编码助手训练数据最多的语言之一，配合 Claude Code 体验最好。

---

## Alternatives Considered

### A. TypeScript / Bun（一语言到底）

- **优**: 与 Phase 3 共享代码、严格类型系统、JSON 原生
- **劣**: EPUB/PDF/OCR 工具链严重残缺
  - PaddleOCR / olmOCR 等本地 OCR 没有 TS 实现
  - EPUB 解析库 (`epub-parser`) 不成熟，扫描 PDF 处理弱
  - 即使 v1 全靠 API，v2 想加本地 OCR 必然被迫加 Python
- **致命**: 「伪一语言」陷阱——表面统一，实际 v2 一定要拉 Python 进来
- **结论**: ❌ 拒绝

### B. Rust core + PyO3 bindings

- **优**: 性能、内存安全
- **劣**: 开发速度损失大；本项目不是性能瓶颈；LLM SDK 生态弱
- **结论**: ❌ 拒绝（违反"易于维护 + 容易看懂"）

### C. Go

- **优**: 单二进制部署、好并发、CLI 工具友好
- **劣**: LLM SDK 多为社区维护，质量参差；EPUB/PDF 库不存在；数据处理生态弱
- **结论**: ❌ 拒绝

### D. Python core + TypeScript CLI 包装

- **优**: 想要前端体感
- **劣**: 多此一举，复杂度爆炸（Python daemon + TS client + IPC 协议）
- **结论**: ❌ 拒绝

### E. Elixir / Clojure 等小众

- **结论**: ❌ 违反"容易看懂"——找不到第二个人帮你看代码

---

## Validation / Test of Decision

未来回看本 ADR 时，如果以下情况发生，需要重新审视：

- 出现一个**通杀** Python OCR/EPUB 生态的新语言（不太可能）
- Python 性能成为本项目实际瓶颈（不太可能，IO-bound）
- User 的优先级从"功能多+维护好"翻转为"前后端代码统一"（可能性低，前后端文件契约已设计好）

---

## References

- [Session 01 §10 用户语言反问原话](../discussion/2026-05-06-session-01.md#10-关键原话--key-verbatim-quotes)
- D-013: Multi-Source Modular Architecture
- D-021: 4-Axis Pluggable
- D-023: Three-Layer Hybrid Architecture
