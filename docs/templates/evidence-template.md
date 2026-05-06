# Evidence Template

> **使用方法**: 复制本文件到 `evidence/<descriptive-name>.md`，逐字段填写。
>
> **依据**: User CLAUDE.md `<personal_operating_principles>` 规则 A + 本项目 **D-030**。
>
> **核心原则**: 结构 PASS ≠ 业务 PASS。Writer PASS + Reviewer PASS 也 ≠ 业务 PASS。**必须有独立样本核验**才算真 PASS。

---

# Evidence: `<stage_name>` Audit (N=`<sample_size>`)

## 元数据 / Metadata

| 字段 | 值 | 必填 | 说明 |
|---|---|---|---|
| `audit_id` | `audit-<stage>-<YYYY-MM-DD>-<seq>` 例: `audit-stage1-2026-05-10-001` | ✅ | 全局唯一 |
| `stage` | `stage1_ocr` / `stage2_classify` / `stage3_reocr` / `stage4_structure` / `stage4_5_glossary` / `stage5_translate` | ✅ | 对应 Pipeline stage |
| `sample_size` | 数字 N | ✅ | N 选择标准见 Topic #5 后落定 |
| `sampling_method` | `random` / `stratified-by-chapter` / `worst-case` / `targeted` / `low-confidence-only` | ✅ | 必须可复现（用 seed） |
| `random_seed` | 整数 | ⚠️ 当 sampling_method 含随机时必填 | 复现用 |
| `auditor` | `User` 或 `Claude (subagent_type=executor / opus)` | ✅ | Writer 角色 |
| `reviewer` | per 规则 D **必须 ≠ auditor 的 subagent_type** | ✅ | Reviewer 角色（独立第三方） |
| `timestamp` | ISO 8601, e.g. `2026-05-10T14:23:00+09:00` | ✅ | |
| `cost_jpy_or_cny` | 本次抽检发生的 API 总花费（人民币 ¥）含 LLM 调用、OCR 重跑等 | ✅ (D-030) | 累计预算可视化 |
| `elapsed_minutes` | 本次抽检全程实际耗时（分钟），从开始到 reviewer 签字 | ✅ (D-030) | 估算未来同规模耗时 |
| `git_sha` | 本次抽检对应代码版本 SHA | ⚠️ 实施期建议必填 | 重跑可定位 |

---

## 样本逐条核对 / Sample-Level Audit

| `sample_id` | 输入（路径或描述） | 产物（路径或描述） | 技术判定 | 业务判定 | 总通过? | 失败归档 |
|---|---|---|---|---|---|---|
| s01 | | | PASS / FAIL + 一行原因 | PASS / FAIL + 一行原因 | ✅/❌ | `failures/...` |
| s02 | | | | | | |
| ... | | | | | | |

### 判定标准

- **技术判定**: 结构合法、字段齐全、schema 合规、文件能解析、JSON 能解码、Markdown 能渲染
- **业务判定**: 内容**真的对**、对学习者**有意义**、术语翻译**和 glossary 一致**、`kana_helper` 字段**实际能帮非母语者**

**两者都必须 PASS 才算总 PASS**（per 规则 A）。

---

## 总结 / Summary

- **通过率**: `<X>` / `<N>` (= `<%>`)
- **主要失败模式**: （归类总结，**不要**逐条复述。例: "60% 失败因为术语翻译不一致；40% 因为 kana_helper 选词偏差"）
- **预算消耗**: `¥<cost>` （本次抽检对总预算的占用）
- **耗时**: `<minutes>` 分钟
- **是否触发整 stage 重跑**: `yes` / `no`
- **下一步**:
  - [ ] 修复 attempts: `<具体改什么>`
  - [ ] 调整 prompt / threshold: `<具体改什么>`
  - [ ] 升级模型 / 工具: `<具体改什么>`
  - [ ] 重跑后再抽检（标 `audit-<stage>-<date>-002`）

---

## 链接 / References

- 触发本次抽检的 stage 产物快照: `<path>`
- 失败归档（per 规则 B）: `failures/<...>/...`
- 相关 session 日志: `docs/discussion/<...>.md`
- 相关决定 ADR: `D-NNN`
- 上一次同 stage 抽检（如有）: `evidence/audit-<...>.md`

---

## 签字 / Sign-Off

| 角色 | 名字 | 时间 | 状态 |
|---|---|---|---|
| Auditor | | | PASS / FAIL / NEEDS-REWORK |
| Reviewer (规则 D 隔离) | | | PASS / FAIL / NEEDS-REWORK |
| Final | | | PASS / FAIL |
