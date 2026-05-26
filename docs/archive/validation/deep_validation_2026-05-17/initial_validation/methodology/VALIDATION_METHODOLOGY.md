# Phase 1 Deep Validation — Methodology

> **状态**: 独立第二审。Phase 1 已 closed (commit `dc71dfd`)，此 validation 为独立分支 `validation/deep-phase1-2026-05-17`。
>
> **触发**: User `/goal` 2026-05-17 — autonomous deep validation, 全程无需用户干预。
>
> **运行号**: 验证目标 = `data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/` (Phase 1 v1.0.0 GitHub Release 的 source-of-truth run).
>
> **Rule D 隔离声明**: Phase 1 Stage 6 audit reviewer 链与本次 validation reviewer 链使用**不同 prompt + 不同 entry agent + 不同 sample set**。Stage 6 用了 Phase 1 内置 `pipeline/stage6_audit/` 模块的两阶段 detector + LLM 链；本 validation 用 `Agent` tool dispatch 独立 Claude worker（fresh context，不读 Stage 6 既有判定），盲审。

---

## 1. 范围

User 指定 3 个检测维度：

1. **OCR 质量** — Mistral OCR (+ Claude Vision re-OCR for 56 hard pages) 是否正确捕获了源页文本/表格/答案行
2. **翻译质量** — Stage 5 LLM 翻译（+ 71 手工编辑 + glossary 约束）jp → zh / en 是否忠实+流畅+一致
3. **排版分级准确性** — Stage 2 page-level label + Stage 4 entity-level type + section_path 是否符合源页视觉层级

---

## 2. 数据底盘（一次性 inventory）

| 维度 | 数量 |
|---|---|
| Raw pages (page_001.jpg ~ page_579.jpg) | **579** |
| OCR markdown | 579 |
| Classified JSON (page-level label) | 579 |
| Cleaned (Claude Vision re-OCR) | 56 hard pages |
| Structured JSON (entities per page) | 554 (25 pages auto-skipped: cover/index/toc/blank/etc.) |
| Translated JSON | 554 |
| Total entities | **2224** |
| Total trilingual leaves (jp/zh/en triples) | **6059** |
| UNTRANSLATED leaves | **0** (clean per Phase 1 closure) |
| Glossary entries | 908 |
| Output (release-ready pages) | 554 × 2 files = 1108 |

### 2.1 Classified labels 分布

| Label | Count |
|---|---:|
| content | 430 |
| exam | 107 |
| chapter_title | 17 |
| index | 11 |
| cover | 4 |
| other | 4 |
| toc | 4 |
| glossary | 2 |

### 2.2 Entity types 分布

| Type | Count | Pages |
|---|---:|---:|
| term | 1350 | 360 |
| figure | 282 | 219 |
| question | 254 | 68 |
| section | 195 | 189 |
| table | 128 | 110 |
| chapter | 15 | 15 |

---

## 3. 抽样设计

**确定性随机种子**: `seed = 20260517` (today 的 ISO date 当 int). 任何 reproducer 用同一 seed + 同一 inventory 必复现样本。

### 3.1 V1 OCR 样本 — 100 页（17.3% 抽样率）

按 classified label **分层比例抽样** + 弱小类**强制下限**保证覆盖：

| Label | Total | Sample |
|---|---:|---:|
| content | 430 | 60 |
| exam | 107 | 25 |
| chapter_title | 17 | 5 |
| index | 11 | 3 |
| cover | 4 | 2 |
| other | 4 | 2 |
| toc | 4 | 2 |
| glossary | 2 | 1 |
| **合计** | **579** | **100** |

**置信**：单类比例估计 95% CI / ±5%（content/exam 大类），小类仅作 spot-check。

**覆盖增强**: 56 cleaned/ pages 中至少 10 张必须进 V1 样本（因为这些是 Phase 1 自己标记的"难页"，最值得二审）。

### 3.2 V2 翻译样本 — 300 leaves（5.0% 抽样率）

**分层规则**: 6 entity types 每类 50 leaves，从该 type 的所有 leaves 池中确定性随机抽。

| Entity type | Entities | Leaves (估) | Sample |
|---|---:|---:|---:|
| chapter | 15 | 15 ★ | 15 |
| section | 195 | 195 | 65 ★★ |
| term | 1350 | 2700 | 70 ★★ |
| question | 254 | 1270 | 50 |
| table | 128 | 1597 | 50 |
| figure | 282 | 282 | 50 |
| **合计** | 2224 | 6059 | **300** |

★ chapter 实际 leaf pool 仅 15（每 chapter 1 个 title-leaf），全取。
★★ 用 term/section 池**top-up 35 leaves**（term +20 / section +15）凑齐 300 总样本。

### 3.3 V3a Page-class 样本 — 复用 V1 的 100 页

V1 worker 同时产 page-level re-classification verdict，节省 dispatch。

### 3.4 V3b Entity-type 样本 — 200 entities

| Type | Total | Sample |
|---|---:|---:|
| term | 1350 | 80 |
| figure | 282 | 35 |
| question | 254 | 35 |
| section | 195 | 25 |
| table | 128 | 20 |
| chapter | 15 | 5 |
| **合计** | 2224 | **200** |

### 3.5 V3c section_path 完整性

**100% 全量程序化检查**（不用 LLM）：
- 遍历 554 个 `structured/page_NNN.json`
- 检测：孤立 section（path 出现但上层 chapter 不在）/ 跳级（path 缺中间层）/ 空路径 ratio per entity type / 全本 section_path 唯一字典对照
- 落 `v3c_section_path.md`

---

## 4. Reviewer 实施

### 4.1 Dispatch 模式

**全程通过 `Agent` tool dispatch 独立 worker**，绕开 Stage 6 模块 (Rule D 硬隔离)。

| 维度 | Worker subagent_type | 模型 | Batch 大小 |
|---|---|---|---|
| V1 OCR | `executor` | Sonnet (default), 升 Opus on 复杂表格 | 10 pages/worker |
| V2 翻译 | `code-reviewer` (独立审稿默认走 reviewer 路线) | Opus | 20 leaves/worker |
| V3a (随 V1) | (合并入 V1 worker) | 同 V1 | — |
| V3b 实体 | `executor` | Sonnet | 20 entities/worker |
| V3c section_path | (no LLM) | Python | — |

并行度: 每 message 同时 fire 5-10 个 background agent。Quota 触发就 `ScheduleWakeup` 睡过去续跑。

### 4.2 Worker JSON 输出契约

每 worker 必须返回结构化 JSON 落到 `validation/.../v{N}_*/<sample_id>.json`：

**V1 OCR worker output schema**:
```json
{
  "page": 43,
  "src": "raw/pages/page_043.jpg",
  "compared_against": "ocr/page_043.md" | "cleaned/page_043.md",
  "ocr_verdict": "PASS" | "WARN" | "FAIL",
  "ocr_findings": [
    {"category": "missing_text|wrong_char|table_format|answer_line_loss|order|other",
     "severity": "low|med|high",
     "description": "..."}
  ],
  "ocr_score": 0.0-1.0,
  "page_label_verdict": "AGREE" | "DISAGREE",
  "page_label_existing": "content",
  "page_label_reviewer": "content"
}
```

**V2 translation worker output schema**:
```json
{
  "leaf_id": "p043_q0_stem|p043_q0_choice_0|...",
  "page": 43,
  "entity_type": "question",
  "jp": "...",
  "zh": "...",
  "en": "...",
  "zh_verdict": "PASS" | "WARN" | "FAIL",
  "en_verdict": "PASS" | "WARN" | "FAIL",
  "zh_findings": ["faithfulness|fluency|glossary|kana_helper|other: ..."],
  "en_findings": [...],
  "overall_severity": "clean|polish|defect"
}
```

**V3b entity-type worker output schema**:
```json
{
  "entity_id": "itpassport_r6::term::p092::3",
  "page": 92,
  "type_existing": "term",
  "type_reviewer": "term",
  "type_verdict": "AGREE" | "DISAGREE",
  "section_path_existing": ["1.2", "1.2.3"],
  "section_path_reviewer_check": "AGREE" | "DISAGREE" | "INSUFFICIENT_CONTEXT",
  "notes": "..."
}
```

---

## 5. 聚合规则

每个子审计结束后，聚合脚本（Python，no LLM）输出 `v{N}_*_summary.json`:

- 总样本数
- PASS / WARN / FAIL 计数 + 百分比
- Top-5 failure modes by frequency
- Sample IDs of top-severity issues
- 90% CI band 估计

### 5.1 全局 Verdict 阈值

| Track | PASS (绿) | WARN (黄) | FAIL (红) |
|---|---|---|---|
| V1 OCR | FAIL_rate < 3% & WARN_rate < 15% | FAIL_rate < 8% | else |
| V2 翻译 | defect_rate < 3% & polish_rate < 20% | defect_rate < 8% | else |
| V3a 页分类 | DISAGREE_rate < 5% | < 12% | else |
| V3b 实体类型 | DISAGREE_rate < 5% | < 10% | else |
| V3c section_path | 孤立 0 & 跳级 < 1% | 跳级 < 5% | else |

**总 verdict**: 所有 5 个 track 都 PASS → 绿；任 1 个 WARN → 黄；任 1 个 FAIL → 红。

---

## 6. 失败、断点恢复

- 任何 agent dispatch 失败 → 重试 1 次 → 仍败则归档 `failures/v{N}_<sample_id>_attempt_X.md` (Rule B) 并 SKIP（不阻塞整体）
- 5h quota 触发 → `ScheduleWakeup` 3600s 后续跑；状态持久化到 `validation/.../_logs/progress.json`
- 任何 LLM 输出非 JSON → reviewer worker 加一次 "强制 JSON 重发" → 仍败则 mark `parse_failed=true` 记入 evidence

---

## 7. 决策权与边界判断

User 明确"独立执行，任何判断由你定"。本 validation 涉及的关键判断及当下决定：

| 判断点 | 选择 | 理由 |
|---|---|---|
| 抽样种子 | `20260517` (今天的 ISO date) | 可复现 + 唯一 |
| V1 样本量 | 100 (17.3%) | 95% CI / ±5% 主类 |
| V2 样本量 | 300 (5.0%) | 6 type × 50/type，分层均衡 |
| 是否复用 V1 页做 V3a | 是 | 节省 dispatch，worker 顺手再判一次 page label |
| V2 reviewer 模型 | Opus | 翻译质量最难，必须最强模型 |
| V1 reviewer 模型 | Sonnet | OCR 可见性强，Sonnet 足够 |
| 翻译 reviewer 评分维度 | faithfulness + fluency + glossary + kana_helper | 4 维 cover 用户痛点 |
| Worker 不读 Stage 6 既有判定 | 是 | Rule D 硬隔离 |
| Quota 触发处理 | `ScheduleWakeup` 60min 后续 | User 显式授权 |
| Verdict 阈值偏紧 vs 偏松 | 偏紧 (PASS 标准高) | "quality > cost" memory 规则 |

---

## 8. 产物清单（commit 范围）

```
validation/deep_validation_2026-05-17/
├── methodology/
│   └── VALIDATION_METHODOLOGY.md     ← 本文件
├── sampling/
│   ├── seed.txt                       (= 20260517)
│   ├── sample_v1_ocr.json             (100 pages)
│   ├── sample_v2_translation.json     (300 leaves)
│   └── sample_v3b_entity.json         (200 entities)
├── scripts/
│   ├── build_samples.py
│   ├── aggregate_v1.py
│   ├── aggregate_v2.py
│   ├── aggregate_v3.py
│   └── check_section_path.py
├── v1_ocr/
│   ├── page_NNN.json × 100
│   └── v1_ocr_summary.json
├── v2_translation/
│   ├── batch_NN.json × 15
│   └── v2_translation_summary.json
├── v3a_pageclass/
│   └── v3a_pageclass_summary.json     (extracted from V1 outputs)
├── v3b_entitytype/
│   ├── batch_NN.json × 10
│   └── v3b_entitytype_summary.json
├── v3c_section_path/
│   └── v3c_section_path.md
├── _logs/
│   └── progress.json
└── VALIDATION_REPORT.md               ← 终产物
```

---

## 9. 时间预算

- V0 setup: 0.5h
- V1 OCR: ~3-5h (10 batches × 30-45min)
- V2 翻译: ~6-10h (15 batches × 30-45min)
- V3a 随 V1
- V3b 实体: ~3-5h
- V3c section_path: 0.5h
- V4 synthesis + V5 commit: 1h
- **总 wall time**: ~15-25h（不含 quota 等待）
- **含 quota 等待**: 24-36h

符合 user "24-48h+" 期望。

---

**Document version**: 1.0
**Author**: Claude (Opus 4.7, autonomous validation lane)
**Date**: 2026-05-17
