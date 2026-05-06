# D-016: Phase Roadmap (1 → 2 → 3 → 4 → 5)

| 字段 | 值 |
|---|---|
| Status | Accepted |
| Date | 2026-05-06 |
| Decision-makers | User + Claude (Opus 4.7) |
| Session | [2026-05-06-session-01](../discussion/2026-05-06-session-01.md) (User 披露真实动机后定) |
| Related | D-009 (三语 schema), D-010 (cert-agnostic), D-022 (Hybrid 数据模型) |

---

## Context

User 在会话中段主动披露真实动机（Session 01 §1.2 + §10）:

> "我想学习并通过 ITパスポート 考试。但日语对我比较难——技术名词的概念我都懂，但读不懂日语片假名/平假名的字形…… 一旦理解一次了，后续我就记住了。我想做成多语，然后做（A）个人备考工具、（B）题库网站、（C）AI 学习助手。如果跑通，其他资格类的学习只要有资源都可以这么来做。"

如果一个 spec 同时包含 A+B+C+5，会变成无法收敛的"愿望清单"。需要按 Phase 拆分。

---

## Decision

按 5 个 Phase 组织，每 Phase 独立走 spec → plan → 实施 → 抽检 → Retro 周期:

| Phase | 内容 | 状态 |
|---|---|---|
| **1** | 三语化内容工厂（多源 → JSON+MD+SQLite） | **本次锁定，进入实施期才开始** |
| 2 (A) | 个人备考工具 | 形态待定（OQ-05 / Topic #8） |
| 3 (B) | Web App 题库 / 学习站 | 栈待定（OQ-05 / Topic #8） |
| 4 (C) | AI 学习助手 (RAG / 个性化) | 形态待定（OQ-05 / Topic #8） |
| 5 | cert-extractor 通用框架 | Phase 1 跑通且想做第二本书时启动 |

A/B/C 的启动顺序、形态、技术栈**都不在本 ADR 锁定**——每个 Phase 开始时单独走完整周期。

---

## Consequences

### 正面
1. Phase 1 范围有限可收敛
2. 后续 Phase 重新设计时不被早期决策绑死
3. 失败时降级容易（做完 A 觉得够用就停也行）
4. 每个 Phase 独立有 Retro (per 规则 C / D-033)，学到的东西能传给下个 Phase

### 负面
1. 表面上"延迟决策"，可能让 User 担心后期方向不明
2. Phase 间数据契约必须在 Phase 1 设计好，否则 Phase 2-4 重写

### 中性
1. 5 个 Phase 不一定都做满。Phase 1 + 2 (A) 就足够"已经能用"

---

## Alternatives Considered

### A. 全部塞进一个 spec
- 致命: 不可能收敛
- **结论: 拒绝**

### B. 只做 Phase 1，未来再说
- 优: 简单
- 劣: 数据模型可能为只优化 Phase 1 设计，导致 Phase 2-4 全部重写
- **结论: 拒绝**（D-009 + D-010 + D-022 都是为 Phase 2-4 留口）

### C. 先做 A（最小有用），再回头做 Phase 1
- 优: 快速验证用户路径
- 劣: 没数据来源，A 写出来是空壳；User 要的是"先有内容再用内容"
- **结论: 拒绝**

---

## Phase 1 对未来 Phase 的保护

为防止 Phase 1 决策意外锁死 Phase 2-4 选择空间，本 ADR 明确以下保护机制:

| 担心 | Phase 1 怎么防 |
|---|---|
| 怕将来想做 Web App 但数据结构不适合 | trilingual schema (D-009) 是通用 JSON/SQLite，前端任意语言能读 |
| 怕 A/B/C 顺序变了 | 三者从同一个 `itpassport.db` 读，谁先做都可以 |
| 怕 AI 助手要新数据 | Hybrid 三层锚点 (D-022) 已预留 RAG 切块所需最细粒度 |
| 怕换语言/换框架 | Python 库 + 数据文件契约 (D-024)，Phase 3 完全可换 TS/Rust/Go |
| 怕将来想加更多源 | Source Reader pluggable (D-013 + D-021) |
| 怕 OCR/翻译模型升级 | 4 轴 pluggable (D-021)，换插件不动主流程 |
| 怕做完一本想做基本情報 | Schema 从 Day 1 就 cert-agnostic (D-010) |

---

## References

- Session 01 §1.2「真实动机」
- Session 01 §5.5「Phase 路线图：已锁 vs 待定」
