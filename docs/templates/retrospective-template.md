# RETROSPECTIVE Template

> **使用方法**: Phase 收尾前，复制本文件成 `RETROSPECTIVE.md`（项目根，单 Phase 项目）或 `phases/phase-<N>-retrospective.md`（多 Phase 项目）。
>
> **依据**: User CLAUDE.md `<personal_operating_principles>` 规则 C + 本项目 **D-033**。
>
> **核心原则**: 没有 retro = 下个 Phase 还会犯同样的错。

---

# Phase `<N>` Retrospective: `<Phase Title>`

## 元数据 / Metadata

| 字段 | 值 |
|---|---|
| Phase | 1 |
| 起止日期 | YYYY-MM-DD ~ YYYY-MM-DD |
| 总成本 (¥) | API 调用 + 工具费用累计 |
| 总耗时 | 实际投入工时（小时） |
| 决定区间 | D-NNN ~ D-MMM (本 Phase 新增) |
| 关闭的 OQ | OQ-NN, OQ-MM, ... |
| 失败 attempt 数 | N (详见 `failures/`) |
| 抽检证据数 | M (详见 `evidence/`) |
| 重大决定数 (有 ADR) | K |
| 撰写人 | User / Claude / 双方 |

---

## 1. 保留下来的做法 / What Worked (规则 C 段 1)

> 哪些做法**有效**，下个 Phase 继续用？为什么有效？

### 1.1 实践 / 流程
- ……

### 1.2 工具 / 模型 / API
- ……

### 1.3 协作模式（User vs Claude）
- ……

> **避免**: 模糊总结（"整体顺利"、"配合不错"）。
> **要**: 具体到方法 / 工具 / 模板，**可以被另一个团队照搬**。

---

## 2. 必须补上的缺口 / What's Missing (规则 C 段 2)

> 本 Phase 该做但**没做** / 做的不够好的事？

### 2.1 设计层面
- ……

### 2.2 实施层面
- ……

### 2.3 工程纪律层面
- 例: D-NNN 没及时入档（如有），暴露什么操作守则需要加强？

> **避免**: 抱怨。
> **要**: "应该做 X 但因为 Y 没做，下次 Z 时机做"。**每条都要给出补救计划**。

---

## 3. 关键决策复盘 / Key Decision Review (规则 C 段 3)

逐条 review 重大决定（有 ADR 的），标 status。
**Status 取值**: ✅ still-good / ⚠️ regret-but-keep / ❌ supersede 候选

| ID | 当时决定 | 实际效果 | Status | Supersede 候选 |
|---|---|---|---|---|
| D-005 | Mistral OCR primary | … | … | (新 ADR ID 或 -) |
| D-008 | 6-stage pipeline | … | … | |
| D-013 | Multi-Source Modular | … | … | |
| D-016 | Phase Roadmap | … | … | |
| D-021 | 4-axis pluggable | … | … | |
| D-022 | Hybrid 数据模型 | … | … | |
| D-023 | 三层架构 | … | … | |
| D-024 | Python 主语言 | … | … | |

**Supersede 候选**：如果有任何决定标记为"❌ supersede 候选"，列出新 ADR 编号 + 一行新方向描述：

- D-XXX: ……

---

## 4. 实际成本 vs 预算偏差分析 / Cost Variance (D-033 新增)

| 项目 | 预算 | 实际 | 偏差 % | 主要原因 |
|---|---|---|---|---|
| Mistral OCR | ¥4 | ¥? | ?% | … |
| Claude Vision (难页) | ¥10-20 | ¥? | ?% | … |
| Glossary 抽取 | ¥10-20 | ¥? | ?% | |
| Glossary 翻译 | ¥10-20 | ¥? | ?% | |
| 题目翻译 | ¥30-50 | ¥? | ?% | |
| 正文翻译 | ¥40-150 | ¥? | ?% | |
| 抽检反复修正 | ¥20-50 | ¥? | ?% | |
| **总计** | **¥150-350** | **¥?** | **?%** | |

### 4.1 偏差分析

- 哪些项严重超支？为什么？（API 涨价 / 模型 token 估算偏差 / 多次重跑 ...）
- 哪些项远低于预算？为什么？（任务比想象简单 / 提前优化奏效 ...）

### 4.2 下 Phase 预算修正建议

- **单价上调 / 下调原因**: ……
- **量级修正**: ……
- **新增项**: 上 Phase 没预见但下 Phase 必须的支出
- **可砍项**: 上 Phase 过度预留的项

---

## 5. 下个 Phase 的开工前置条件 / Pre-conditions for Next Phase (D-033 新增)

进入 Phase `<N+1>` 前必须满足的清单。**未全部勾选不允许开 Phase `<N+1>` 的 brainstorming session**。

- [ ] 所有 stage 的最近一次抽检 PASS（`evidence/` 中可查）
- [ ] 所有 OQ 关闭或显式转出到下一 Phase 的 OQ 列表
- [ ] `docs/STATE.md` 同步至最新（决定即写入纪律落实）
- [ ] 主要文件契约（database schema、JSON 结构、Plugin 接口签名）冻结成 ADR 或 schema 文件
- [ ] User 显式确认 ready
- [ ] 失败归档完整（per 规则 B，无遗漏；`failures/` 数与 evidence 触发链匹配）
- [ ] 所有 supersede 候选 ADR 已写完并 User 审批
- [ ] 本 RETROSPECTIVE.md 自身经过独立 reviewer 审阅 (per 规则 D)
- [ ] 实际成本数据已填入 §4
- [ ] 下 Phase 的初始 spec 草案已**至少有问题清单**（不需要全答完）

---

## 6. 签字 / Sign-Off

| 角色 | 名字 | 时间 | 状态 |
|---|---|---|---|
| 撰写人 | | | DRAFT / FINAL |
| Reviewer (per 规则 D) | | | PASS / NEEDS-REWORK |
| User 终审 | | | APPROVED / REJECTED |

---

## 7. 链接 / References

- 本 Phase spec: `docs/superpowers/specs/<...>.md`
- 本 Phase 实施 PR / commit: `<git ref>`
- 本 Phase 所有 session 日志: `docs/discussion/<...>` ~ `<...>`
- 本 Phase 所有 evidence: `evidence/`
- 本 Phase 所有 failures: `failures/`
