# D-107 — Web-Ready Textbook Pipeline (Stage 8-11)

| Field | Value |
|-------|-------|
| ID | D-107 |
| Status | **LOCKED** |
| Date | 2026-05-24 |
| Session | 59 |
| Supersedes | — (additive; does not modify Stage 1-7 pipeline) |
| Scope | New post-processing pipeline: OCR + raw scan → web-ready trilingual textbook |

---

## 1. Context & Problem

Phase 1 管道 (Stage 1-7) 成功提取了教科书内容，但 Structured 阶段（Stage 3→4）做了过度压缩——只保留了 section 标题和 figure caption，丢失了全部正文段落。结果：

- Web 端 `/[locale]/book/chapter/[nn]` 显示为"骨架"，缺少教学核心内容
- 图片引用 (`img-N.jpeg`) 无法显示
- 按物理页码分割，不适合 web 连续阅读
- 空白/装饰/重复页未过滤

OCR 阶段实际保留了完整正文（~467K chars），原始扫描（579 张 JPEG）也完整可用。需要一个新的加工环节把这些素材转化为高还原度的 web 教科书。

---

## 2. Decision

新增 **4 个 Stage (8-11)**，以 OCR markdown + raw scan 为主输入，产出三语 web-ready 教科书数据（JSON + MDX 双格式）。

### 2.1 Stage 8: 全书蓝图 (Book Blueprint)

**目标**: LLM 通读全书 OCR，产出编辑决策表。

**输入**:
- 全部 579 个 OCR markdown（~467K chars）
- index.v2.json 章节划分（参考锚点）
- classified 标签（content/toc/blank 等）

**LLM 任务（按章分批，~16 次调用）**:
1. 识别逻辑节 (Lesson) 边界——基于内容语义，不依赖物理页码
2. 标记每页处置方式：`keep` / `merge-with-prev` / `filter`
3. 标记跨页续段（段落接续标记）
4. 识别特殊元素类型：正文 / 考试提示 / 关键概念框 / 练习题 / 助记口诀 / 图表说明
5. 建立 figure 清单：每个 img-N 引用的语义描述 + 教学作用

**输出**: `blueprint.json`

```json
{
  "chapters": [{
    "chapter_id": "ch01",
    "lessons": [{
      "lesson_id": "01-01",
      "title_jp": "株式会社と経営理念",
      "page_range": [28, 30],
      "pages": [
        { "page": 28, "action": "keep", "continues_from_prev": false },
        { "page": 29, "action": "merge-with-prev", "continues_from_prev": true },
        { "page": 30, "action": "keep", "continues_from_prev": true }
      ],
      "figures": [
        { "page": 28, "ref": "img-0.jpeg", "role": "conceptual-illustration", "description": "经营者＝船长的比喻图" }
      ],
      "special_elements": ["exam_tip", "key_concept"]
    }],
    "filtered_pages": [34, 36, 42, 43, 44, 45]
  }]
}
```

**质量门**: 全书 579 页覆盖率校验——每页必须被分配到某个 action。

---

### 2.2 Stage 9: 内容重建 (Content Reconstruction)

**目标**: 按 Blueprint 的 lesson 单位，将 OCR 原文重组为连续、完整、干净的教科书正文。

**输入**:
- Stage 8 Blueprint
- 对应页面的 OCR markdown
- Stage 7 translated entities（复用已有翻译）

**LLM 任务（按 lesson 分批，~100 次调用）**:
1. 合并跨页段落——移除页面边界断点
2. OCR 清洗——修正噪音（乱码符号、断行错误）
3. 结构标注——每段内容打标签 (heading / body / tip / exam-hint / practice-q / figure-caption)
4. **保留完整正文**——不做压缩、不做概括
5. 关键术语标记——对照 glossary.json 标注术语位置

**输出**: 每个 lesson 一个 `lesson_XX-YY.json`

```json
{
  "lesson_id": "01-01",
  "title_jp": "株式会社と経営理念",
  "blocks": [
    { "type": "heading", "level": 2, "text_jp": "株式会社と経営理念" },
    { "type": "figure", "ref": "fig_01-01_001.webp", "caption_jp": "経営者は船長だ！" },
    { "type": "body", "text_jp": "現代の経営者は、大航海時代の船長と同じです..." },
    { "type": "exam-tip", "text_jp": "ITパスポート試験では意外なことに..." },
    { "type": "key-concept", "text_jp": "「会社の役に立つシステムを作るための知識」", "glossary_ids": ["term_xxx"] }
  ]
}
```

**质量门**: 抽检 N 个 lesson，人工对照 OCR 原文确认无遗漏（Rule A）。

---

### 2.3 Stage 10: 图片提取 (Figure Extraction)

**目标**: 从整页扫描中裁切出独立的 figure 图片，优化为 web 格式。

**输入**:
- Raw scans (`raw/pages/page_NNN.jpg`)
- Stage 8 Blueprint figure 清单

**处理方式（Vision model）**:
1. 整页 scan 送入 vision model，识别图片区域坐标边界
2. 按坐标裁切为独立图片
3. 转换为 WebP（压缩率好、web 兼容）
4. 命名为 `fig_{lesson}_{seq}.webp`

**备选方案**（vision 裁切精度不足时）:
- 整页 scan 降采样作为"参考原图"并列展示
- 后续可手动微调裁切框

**输出**: `figures/` 目录 + `figure_manifest.json`

**估计调用**: ~200-300 次（按 figure 数量）

---

### 2.4 Stage 11: 翻译 + 组装 + 质检 (Translation & Assembly & QA)

**目标**: 全书 body text 预翻译为 zh/en，与图片合并，输出最终 web-ready 数据。

**输入**:
- Stage 9 所有 lesson JSON（完整日文正文）
- Stage 10 figure 图片 + manifest
- glossary.json（术语一致性参考）
- Stage 7 translated entities（可复用的标题/caption 翻译）

**LLM 任务（按 lesson 分批，~200 次调用）**:
1. 全文翻译 jp → zh + jp → en，遵循术语表一致性
2. 复用验证：对于已有 Stage 7 翻译的片段，对比确认后直接沿用
3. 组装：文本 + 图片引用 → 最终双格式输出

**输出（双格式）**:
- `web-ready/lessons/XX-YY.json` — 结构化数据（前端 JSON 渲染）
- `web-ready/lessons/XX-YY.mdx` — MDX（Next.js 直接用）
- `web-ready/figures/` — 图片资源
- `web-ready/manifest.json` — 全书目录映射

**翻译决策**: 全量三语预翻译（策略 B），不依赖实时 API 翻译。原因：用户要求翻译一致性——同一段话每次看到的必须是同一个经过验证的译文。

**质量门**:
- 全文翻译抽检（Rule A：N 样本独立审核）
- 每章首 lesson 人工 A/B 对照（扫描原图 vs web 渲染）

---

## 3. Rejected Alternatives

| 选项 | 拒绝原因 |
|------|---------|
| 基于 Stage 7 output 补救（只加不改） | 信息上限太低——正文已丢失，无法恢复；还原率 <10% |
| 单一 Stage 完成全部加工 | 输入形态不同（文本 vs 图片）、判断粒度不同（全书 vs 段落）、出错后回退代价大 |
| 日文为主 + 实时 API 翻译（策略 A） | 用户明确拒绝——实时翻译每次结果不同，缺乏一致性 |
| 2-Stage 方案（合并 8+9 / 合并 10+11） | 单 Stage 职责过重，失败时无法局部重跑 |
| MDX-only 输出（无 JSON） | 前端需要结构化数据做搜索/过滤/术语高亮；JSON 是必要的 |
| JSON-only 输出（无 MDX） | MDX 提供 Next.js 原生渲染路径，降低前端复杂度 |

---

## 4. Cost & Resource Estimate

| Stage | 估计 LLM 调用次数 | 输入规模 |
|-------|------------------|---------|
| 8 | ~16（按章） | ~30K chars/batch |
| 9 | ~100（按 lesson） | ~2K-15K chars/batch |
| 10 | ~200-300（按 figure） | 1 image/call |
| 11 | ~200（按 lesson × 2 lang） | ~2K-15K chars/batch |
| **Total** | **~500-600 次** | — |

运行环境: Claude Code CLI, max×20 plan subscription. 完全覆盖。

---

## 5. Execution Gates

每个 Stage 独立可验证，需用户 gate 确认产出质量后才进入下一 Stage：

| Gate | Trigger |
|------|---------|
| G-S8 | Stage 8 Blueprint 产出 + 覆盖率校验通过 |
| G-S9 | Stage 9 首章 lesson 抽检通过 |
| G-S10 | Stage 10 首批图片裁切质量验收 |
| G-S11 | Stage 11 首章翻译抽检通过 |

---

## 6. Relationship to Existing Pipeline

```
Phase 1 Pipeline (FROZEN, immutable):
  Stage 1 (Raw) → 2 (OCR) → 3 (Classified) → 4 (Structured) → 5 (Translated) → 6 (QA) → 7 (Output)

New Pipeline (ADDITIVE, reads but does not modify Phase 1 artifacts):
  Stage 8 (Blueprint) → 9 (Content Recon) → 10 (Figure Extract) → 11 (Translate+Assemble)
       ↑                      ↑                    ↑
  reads: OCR + classified  reads: OCR + blueprint  reads: raw scans + blueprint
```

Phase 1 Stage 1-7 的产物保持 **immutable**。新管道是**只读消费者**。

---

## 7. Open Items for Implementation

- Stage 10 vision model 裁切精度需要 POC 验证
- 最终 `web-ready/` 产物的部署路径（Vercel static assets vs CDN）待定
- 前端 ChapterReader 组件改造（消费新数据格式）在管道完成后设计
