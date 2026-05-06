# D-021: Four-Axis Pluggable Architecture

| 字段 | 值 |
|---|---|
| Status | Accepted |
| Date | 2026-05-06 |
| Decision-makers | User + Claude (Opus 4.7) |
| Session | [2026-05-06-session-01](../discussion/2026-05-06-session-01.md) (Topic #1 Q3) |
| Related | D-013 (源模块化), D-014 (不计成本), D-025 (插件机制) |

---

## Context

D-013 已锁源模块化。但模块化不只是源——还有 OCR 引擎、翻译器、导出器都是可能想换的"轴"。

Topic #1 Q3 给出 4 个选项:
- (a) 全部 4 轴 pluggable
- (b) Source + Exporter pluggable，OCR + Translator 硬编码
- (c) Source + OCR pluggable，Translator + Exporter 硬编码
- (d) YAGNI: 只 Source pluggable

User 选 (a)。

---

## Decision

v1 即从 4 个维度同时 pluggable:

| 轴 | 接口（待 Topic #4 落定方法签名） | v1 内置实现 | 占位接口（v2+ 可加） |
|---|---|---|---|
| **Source Reader** | `cert_extractor.plugins.SourceReader` | `epub_image` | pdf_text / pdf_scanned / txt / html / docx / markdown / image_zip |
| **OCR Engine** | `cert_extractor.plugins.OCREngine` | `mistral` | claude_vision / paddle / olmocr / tesseract |
| **Translator** | `cert_extractor.plugins.Translator` | `claude_sonnet_46` | gpt5 / gemini / deepl / claude_haiku / claude_opus |
| **Exporter** | `cert_extractor.plugins.Exporter` | `json` / `markdown` / `sqlite` | anki / notion / csv / xlsx |

注册机制 = 装饰器 + 自动扫描 + entry_points (D-025)。
版本化 = 库 semver + 插件 `__cert_extractor_min_version__` (D-026)。

---

## Consequences

### 正面
1. A/B 对比新模型/新工具几乎免费（改 YAML 一行）
2. 未来新源/新模型上市，加一个 plugin 文件即可
3. 测试 mockable（用 fake plugin 跑 pipeline 单元测试）
4. 第三方贡献可能（Phase 5 时）
5. 不计成本 (D-014) 前提下，质量优先意味着可能升级模型——pluggable 让升级零成本

### 负面
1. v1 多写 ~30% 抽象代码（4 个接口 × 4 类实现）
2. 接口设计错误的代价高（一旦发布就要 semver 维护，per D-026）

### 中性
1. 接口在 Topic #4（数据模型 schema 深化）时具体定义

---

## Alternatives Considered

### B (b). Source + Exporter pluggable, OCR/Translator hardcode
- 优: 减少 ~50% 接口工作
- 劣: 想换 OCR 时要重写 Stage 1；不计成本前提下 (D-014)，这种节省没意义
- **结论: 拒绝**

### C (c). Source + OCR pluggable, Translator/Exporter hardcode
- 不太合理；OCR 重要 Translator 也重要；导出格式更是用户接触点
- **结论: 拒绝**

### D (d). YAGNI: 只 Source pluggable
- 优: v1 最快
- 劣: User 明确选 (a)；YAGNI 流派与本项目 Tier 3 + "前期多花时间"纪律冲突
- **结论: 拒绝**

---

## References

- D-013 多源模块化
- D-014 质量优先
- D-025 插件注册机制
- D-026 接口版本化
- Session 01 Topic #1 Q3 原话
