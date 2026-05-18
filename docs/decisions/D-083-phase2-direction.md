# D-083 — Phase 2 high-level direction (A+C hybrid, α-now / β-ready)

| 字段 | 值 |
|---|---|
| Status | **LOCKED final** 2026-05-18 Session 24 Turn 4（user terminal sign-off path α）|
| 类型 | Phase boundary / 架构方向（独立 ADR per D-029）|
| 主题归属 | Topic #8 (OQ-05 partial close) |
| Supersede? | 否（Phase 1 ADR D-001 ~ D-082 全部不动）|
| Linked OQ | OQ-05 partial close（Phase 2 部分定）/ OQ-40 open（β 开放时间窗）|
| Session 日志 | `docs/discussion/2026-05-18-session-24.md` Turn 3 |
| 评审 (Rule D) | Writer = Claude Opus 4.7；Reviewer = user 终审（同 Phase 1 D-019 锁定模式，无 self-approve）|

---

## 1. Context

Phase 1 ✅ FULLY DONE：Step 0~6.12 全部闭合，v1.0.0 + v1.0.2 GitHub Release published，`RETROSPECTIVE.md` FINAL + §8/§9 addendum，D-082 项目结构 v2 落地。OQ-05 自 Session 06 (2026-05-06) 起 open，原措辞 "A/B/C 三个 Phase 的具体形态 + 启动顺序"，是 Phase 1 范围外的唯一 design-track OQ。

`RETROSPECTIVE.md` §5.5 列出 **16 条 Phase 1 v2 carry-forward**（4 类：Stage 6/7 audit 5 / Stage 5 翻译 3 / 架构 4 / 治理 4），未在 v1.0.2 修，但显式枚举避免 Phase 2 重新发现（Rule C 精神）。

`STATE.md` §1 vision 原列：
- Phase 2 (A) = 个人备考工具
- Phase 3 (B) = Web App 题库 / 学习站
- Phase 4 (C) = AI 学习助手
- Phase 5 = cert-extractor 通用框架（任意资格教材）

Session 24 (2026-05-18, 本 ADR 的 session) 跑了 2 轮 D-019 slow-pace 4Q（共 8 题）逼出本 ADR。

## 2. Decision (本 ADR 的 lock)

### 2.1 Phase 2 = A+C hybrid

Phase 2 = **"带 AI 答疑的个人备考工具"** — 原 STATE vision 里的 (A) 个人备考工具 + (C) AI 学习助手 **合并** 成 Phase 2 单一形态，不再视为相邻分阶段。

含义：
- v1.0.2 `output/` JSON / Markdown 是 Phase 2 的 **只读数据源**
- AI 答疑层是 Phase 2 的 **核心交互层**（不是 side feature）
- "备考" 是 user 任务；"学习内容理解 / 解释 / 巩固" 是 AI 任务

### 2.2 cert-extractor NOT generalized for Phase 2

Phase 5 (cert-extractor 通用化为任意资格教材) **不被 Phase 2 倒逼前置**。Phase 2 是 v1.0.2 的纯消费者，cert-extractor 不为 Phase 2 改 API / 改 schema / 改插件矩阵。

### 2.3 用户范围 = α now + β-ready

- **α now**：私有自用（本人备考 IT Passport）
- **β later**：之后开放给别人（开源 + 多用户路径未定，但**设计今天不能 lock out β**）
- **γ/δ**（多用户 hosting / monetization）= NOT in scope，未来 Phase 6+ 再说

"β-ready" 的具体严格度（s1/s2/s3 见 §3）= 不锁，下场 Session 25 锁。

### 2.4 §5.5 16 条 carry-forward 处理 = m2

本 ADR **不** mapping。下场 Session 25 做 mapping：把 §5.5 16 条对照 A+C hybrid 需求列 "Phase 2 demo 阻塞 / 可推迟" 分类表，user 选 must-do 子集。

未被选入 must-do 子集的项目继续留在 `polish_items.json` + `RETROSPECTIVE.md` §5.5 sidecar，等 Phase 2 实施暴露才回头查（Rule C 精神 = 不丢，但不前置）。

### 2.5 OQ-05 partial close

OQ-05 原措辞: "A/B/C 三个 Phase 的具体形态 + 启动顺序"

本 ADR 的 close 范围:
- ✅ Phase 2 形态 = A+C hybrid (§2.1)
- ⏸ Phase 3 形态 = 未定（等 Phase 2 实施反馈）
- ⏸ Phase 4 形态 = 未定（等 Phase 2/3 实施反馈）
- ⏸ Phase 3/4 启动顺序 = 未定

**partial close**: OQ-05 status from "open" → "**partial closed**（Phase 2 部分由 D-083 锁，余 Phase 3/4 形态 + 顺序继续 open）"。

## 3. Out of scope for this ADR (推到下场 Session 25)

⚠️ **重要**：以下 7 项 user 在 Round 2 给了 Q6/Q7 **intent signal**（启动假设），但 **不在 D-083 §2 lock 范围**。Session 25 spec 时 user 可以 reverse 而**无需 ADR amendment**。这是 Q5=a 极薄设计的代价 / 收益。

| 项目 | 当前 intent signal (Round 2) | 锁定 session |
|---|---|---|
| Phase 2 形态主线 (Quiz / Study / Hybrid / Chat) | **iii + iv** = Hybrid 双模式 + Chat-with-the-book | Session 25 |
| β-ready portability 严格度 (s1 / s2 / s3) | **s1** = web 技术栈起步 | Session 25 |
| 技术栈 (语言 / 框架 / DB) | 未定 (s1 hint: Next.js / Astro / FastAPI 候选) | Session 25 |
| AI 模型 (Claude / GPT / local) | 未定 (Phase 1 经验偏 Claude max-plan OAuth 零 billed) | Session 25 |
| 数据源 contract (read-only JSON / live sync) | 未定 (假设 read-only v1.0.2 release asset) | Session 25 |
| §5.5 16 条 must-do 子集 | TBD by Session 25 mapping | Session 25 |
| 工作流 Tier 评估 | 未定 (Phase 1 = Tier 3；Phase 2 视形态 + 复杂度评估) | Session 25 |

## 4. Rejected alternatives

| 候选 | 拒绝原因 |
|---|---|
| B Web App 题库站 single-mode (Phase 2 = B alone) | User Q1 明确选 A+C hybrid，不是 B alone |
| C AI 学习助手 standalone (Phase 2 = C alone) | User Q1 明确选 A+C hybrid，不是 C alone |
| D Phase 5 通用化前置 (Phase 2 = generalize cert-extractor first) | User Q1 选应用层不选通用化 |
| α-only 永久私有 (Phase 2 永远不开放) | User Q3 显式 "之后要给别人开放"，必须 β-ready |
| γ/δ multi-user / monetization 起步 | User Q3 答 α，γ/δ 显式 out of scope |
| Phase 1.5 patch release for §5.5 16 条 (Q2 = a) | User Q2 = d 视 Q1 → 应用层故 m2 推后 mapping |
| §5.5 16 条全部推迟不 mapping (Q8 = m3) | User Q8 = m2 = 下场 mapping，不是 m3 |
| 厚 ADR 本场锁全部细节 (Q5 = c) | User Q5 = a 极薄，本场只锁方向 |
| 中等 ADR 锁 Q6/Q7 (Q5 = b) | User Q5 = a 不是 b；Q6/Q7 答案视为 intent signal，不进 §2 lock |

## 5. Consequences

### 5.1 Positive
- **Phase 2 路径明确**：消费 v1.0.2 output / 不绑 cert-extractor 演化 → 起步路径单一无歧义
- **§5.5 16 条不前置 mapping**：节省本场 turn budget；下场结合具体形态 spec 做 mapping 更准（避免抽象 mapping → 后续返工）
- **α-now / β-ready 两段路径**：现在能用，之后能开放，不强制立刻做 hosting / 法律评估
- **极薄 ADR (Q5=a)**：保留 Q6/Q7 reversal 自由（intent signal not lock）→ 容错率高

### 5.2 Negative / Risk
- **极薄 ADR**：下场 Session 25 要做更多锁定工作（Q5=a vs c 的成本转移）
- **β-ready 严格度未锁**：α 阶段技术选型延后到 Session 25 才能定，影响起手速度
- **§5.5 mapping 推到下场**：万一 Phase 2 spec 暴露 §5.5 依赖项才发现，可能引发 Session 25 短暂回头
- **Q6 = iii+iv intent signal**：Session 25 可能 reverse 成单模式，本场表态成本沉没

### 5.3 Mitigation
- **Session 25 entry checklist**（推荐顺序）：
  1. 先做 §5.5 16 条 mapping → 锚定必须做的子集
  2. 锁形态主线（Quiz / Study / Hybrid / Chat）
  3. 锁 β-ready portability 严格度（s1 / s2 / s3）
  4. 锁技术栈 + AI 模型 + 数据源 contract
  5. 锁 LLM 成本预算 + Tier
- **β 时间窗追踪**: 开 **OQ-40** = "β 开放时间窗 / 触发条件"，user 心里有信号时填

## 6. Linked / supersede / amend

- **Supersedes**: 无（Phase 1 ADR D-001 ~ D-082 全部不动）
- **Amends**: 无
- **Linked OQ**:
  - **OQ-05 partial close**: Phase 2 部分定 (§2.5 本 ADR)，Phase 3/4 形态 + 顺序继续 open
  - **OQ-40 open（new this turn）**: β 开放时间窗 / 触发条件 — "什么时候 / 什么条件下 α → β 切换"
- **Cited by future**: 预期 Session 25 会写 D-084 (形态主线) / D-085 (portability) / D-086 (技术栈) 等，全部引用本 ADR §2

## 7. Sign-off

| 角色 | 名字 | 时间 | 状态 |
|---|---|---|---|
| 撰写人 | Claude Opus 4.7 (1M ctx) | 2026-05-18 Session 24 Turn 3 | **LOCKED final** (path α one-step sign-off) |
| Reviewer #1 (per Rule D) | user (hakupao) | 2026-05-18 Session 24 Turn 4 | **APPROVED** — Q9 = α，极薄解读正确（Q6/Q7 = intent signal not lock）+ "后期可加厚" (sub-ADR D-084+ 路径) |

Per D-019 + Rule D: Writer (Claude) ≠ Reviewer (user 终审)。本 ADR LOCKED final at Session 24 Turn 4 commit。后续加厚走 sub-ADR (D-084+) 路径，本 ADR §2 lock 不变。

---

## End of D-083
