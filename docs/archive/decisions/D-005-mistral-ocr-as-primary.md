# D-005: Mistral OCR as Primary OCR Engine

| 字段 | 值 |
|---|---|
| Status | Accepted |
| Date | 2026-05-06 |
| Decision-makers | User + Claude (Opus 4.7) |
| Session | [2026-05-06-session-01](../discussion/2026-05-06-session-01.md) |
| Related | D-006 (Scale plan), D-007 (Claude Vision 难页 fallback), D-021 (OCR 轴 pluggable) |

---

## Context

Phase 1 唯一目标教材经检视为**纯扫描图 EPUB**：579 张高清 JPG，无文字层。OCR 是 pipeline 唯一入口，质量决定下游一切。

User 明确要求"高级 OCR 工具"，且强调质量优先 (D-014「不计成本」)。

候选清单: Mistral OCR / PaddleOCR (PP-OCRv5+PP-StructureV3) / Claude Sonnet 4.6 Vision / olmOCR。

---

## Decision

**主 OCR = Mistral OCR**（Scale plan, $1/1k pages, ~$0.58 全书）。

难页（表格密集 / 注释框混乱 / 低置信度）复核 = **Claude Sonnet 4.6 Vision** (单独锁定为 D-007)。

OCR 引擎接口 pluggable (D-021)，未来可加 PaddleOCR / olmOCR 作为本地备选。

---

## Consequences

### 正面
1. 日语扫描书识别准确率 95-98%（PaddleOCR 88-94%）
2. 原生 Markdown 输出，跳过格式转换步骤
3. 表格 / 列表 / 注释框 / 多列布局还原好（教科书复杂排版关键）
4. 全书 ~$0.58，便宜到不必心疼重跑
5. Scale plan 不入训练数据，符合版权敏感要求

### 负面
1. 不是本地方案；网络中断或 API 故障会卡住
2. 模型版本由 Mistral 控制，可能在我们不知情时升级（D-026 库 semver 无法约束第三方 API）
3. 隐私要求高的场景不适用（本项目可接受）

### 中性
1. Pluggable 设计意味着切换 OCR 成本低，被锁死风险低

---

## Alternatives Considered

### A. PaddleOCR (PP-OCRv5 + PP-StructureV3)
- 优: 开源、本地、可控、可 pin 版本
- 劣: 日语扫描书准确率低 5-10pp；表格输出格式乱；复杂版面（侧边栏 / 注释框）容易混入正文
- 适用场景: 简单单栏扫描书；本教科书版式过复杂
- **结论: 拒绝**

### B. Claude Sonnet 4.6 Vision (一锅出 OCR + 结构化)
- 优: 一步到位；与现有 Claude 工作流原生兼容
- 劣: 全书 ~$11 (~¥80)，比 Mistral 贵 20×；速度慢
- **结论: 用作 D-007 难页 fallback，不作主力**

### C. olmOCR (Allen AI 开源 LLM-OCR)
- 优: 开源、本地、教科书场景质量好
- 劣: 需要 GPU 才能跑出可接受速度；新工具，社区小，成熟度未验证
- **结论: 留作 v2 备选（D-021 pluggable 已留位）**

### D. Mistral Experiment plan (免费档)
- 优: $0
- 劣: rate-limited（579 页跑量必然 throttle）；数据可能用于训练（版权敏感）
- **结论: 拒绝（$0.58 不值得换这些风险）**

---

## References

- Session 01 §10「OCR 比较」原话
- D-006 Mistral Scale plan
- D-007 Claude Vision 难页 fallback
