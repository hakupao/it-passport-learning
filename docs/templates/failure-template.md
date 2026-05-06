# Failure Template

> **使用方法**: 复制本文件到 `failures/<stage>/<attempt-id>.md`，逐字段填写。
>
> **依据**: User CLAUDE.md `<personal_operating_principles>` 规则 B + 本项目 **D-032**。
>
> **核心原则**: 失败数据是重跑和复盘最贵的资料，**绝不 rm**。每个失败都是 Phase 1 通往成功的路标。

---

# Failure: `<stage>` / `<attempt-id>`

## 元数据 / Metadata

| 字段 | 值 | 必填 |
|---|---|---|
| `attempt_id` | `<stage>-<YYYY-MM-DD>-<seq>` 例: `stage1-2026-05-12-003` | ✅ |
| `stage` | `stage1_ocr` / `stage2_classify` / `stage3_reocr` / `stage4_structure` / `stage4_5_glossary` / `stage5_translate` / `stage6_audit` / `stage7_export` | ✅ |
| `timestamp` | ISO 8601, 例 `2026-05-12T15:30:00+09:00` | ✅ |
| `triggered_by` | 触发本次失败的 evidence 路径（如有，per 规则 A 链回） | ⚠️ 建议 |
| `git_sha` | 本次代码版本 SHA | ✅ |
| `model_or_tool` | `mistral-ocr-latest` / `claude-sonnet-4-6` / `claude-opus-4-7` / 工具名 | ✅ |
| `cost_jpy_or_cny` | 本次 attempt 烧的钱（人民币 ¥） | ✅ |
| `elapsed_minutes` | 本次 attempt 耗时（分钟） | ✅ |

---

## 输入 / Input (what went in)

- **输入数据快照路径**: `<path or hash>`
- **Prompt / 配置**: `<path or inline>`
- **Threshold / 参数**: `<details>`
- **使用的 plugin**: `source=<...>`, `ocr=<...>`, `translator=<...>`, `exporter=<...>`

---

## 产物 / Product (what came out)

- **产物路径**: `<path>`
- **关键片段**（最能说明问题的 1-2 段，**别复述全文**）:

```
<paste the problematic output snippet>
```

---

## 技术判定 / Technical Verdict

`PASS` / `FAIL` + 一行原因

> 判定标准: 结构是否合规、字段是否齐全、JSON 是否能解析、Pydantic 校验是否通过

---

## 业务判定 / Business Verdict

`PASS` / `FAIL` + 一行原因

> 判定标准: 内容是否真的对、是否对学习者有意义、术语翻译是否和已锁 glossary 一致、`kana_helper` 字段是否实际能帮非母语者
>
> **关键**: 即使技术 PASS 但业务 FAIL（OCR 文字解析正确但意思跑偏），仍记 FAIL 并归档。**结构 PASS ≠ 业务 PASS** (per User 规则 A)。

---

## 失败模式分类 / Failure Mode

选一个或多个:

- [ ] `prompt-issue` (prompt 表述不准 / 缺约束)
- [ ] `threshold-issue` (置信度阈值设错)
- [ ] `model-bug` (模型本身在这类输入上稳定犯错)
- [ ] `data-issue` (输入图片质量 / 编码 / 格式问题)
- [ ] `infrastructure` (网络 / API / 限流)
- [ ] `glossary-mismatch` (术语翻译和已锁 glossary 不一致)
- [ ] `schema-violation` (产物违反 Pydantic 模型)
- [ ] `regression` (之前 PASS 现在 FAIL，触发查 git log)
- [ ] `other`: ___

---

## 下一 attempt 输入 / Next Attempt Input

- **改 prompt**: `<具体改什么；diff 形式更清晰>`
- **调 threshold**: `<参数名 from X to Y>`
- **升级模型**: `<from claude-sonnet-4-6 to claude-opus-4-7 因为...>`
- **重跑命令**:
  ```bash
  cert-extractor stage <X> --attempt <N+1> \
    --config <yaml-path> \
    --input <input-path> \
    --output <output-path>
  ```
- **预期改进**: `<one sentence>` (例: "通过率从 60% → 85%")

---

## 链接 / References

- **触发本失败的 evidence (per 规则 A)**: `evidence/<...>.md`
- **上一次同 stage 失败 (如有)**: `failures/<stage>/<prev-attempt>.md`
- **下一次 attempt (如已重跑)**: `failures/<stage>/<next-attempt>.md` 或 `evidence/<success-audit>.md`
- **相关决定**: `D-NNN`
- **相关 session**: `docs/discussion/<...>.md`

---

## 签字 / Sign-Off

| 字段 | 值 |
|---|---|
| 归档时间 | |
| 归档人 | |
| 是否已纳入 RETROSPECTIVE.md §2 (缺口) | yes / no |
| 是否触发新 D（决定改方向） | yes / D-NNN / no |
