# D-085 — Phase 2 form mainline: iii+iv Hybrid (Quiz+Study) + Chat-with-the-book

| 字段 | 值 |
|---|---|
| Status | **LOCKED final** 2026-05-19 Session 26 Turn 4（user terminal sign-off path α）|
| 类型 | Phase 2 form-mainline lock (sub-ADR of D-083 §2.1 + §3 intent signal) |
| 主题归属 | Topic #8 — Phase 2 detail spec, step 2 of D-083 §5.3 |
| Supersede? | 否（D-001 ~ D-084 unchanged；D-083 §2 + §3 unchanged）|
| Linked OQ | OQ-05 unchanged (already partial-closed at D-083 §2.5) |
| Session 日志 | `docs/discussion/2026-05-19-session-26.md` Turn 3 |
| 评审 (Rule D) | Writer = Claude Opus 4.7；Reviewer = user 终审（同 D-083 / D-084 path α 模式）|

---

## 1. Context

D-083 §2.1 锁 Phase 2 = A+C hybrid "带 AI 答疑的备考工具"。§3 列出 starting hypothesis：
- Q6 = iii+iv = Hybrid dual-mode (Quiz + Study) + Chat-with-the-book
- Q7 = s1 = web stack (推 D-086)

D-083 §3 明确这些是 **intent signal not §2 lock**：Session 26 可以 reverse 而无需 ADR amendment（D-083 Q5=a 极薄 ADR 的设计意图）。

Session 25 完成 step 1 §5.5 mapping (g4)，D-084 v1.0.3 ✅ shipped。step 2 = 把 form mainline starting hypothesis 升级成 §2 lock。

Session 26 Round 1：
- Q1=(a) 本场只跑 step 2（D-085 only；D-086+ 推下场）
- Q2=(α) 直接 confirm iii+iv as §2 lock（不开 reverse window）
- Q3=(g2) 中 level lock 颗粒度：form + 默认 mode + 切换机制 + Chat scope + Quiz/Study↔Chat 集成
- Q4 = n/a

Session 26 Round 2 锁 4 sub-items：
- Q5=(d) Resume last
- Q6=(a) Top tabs
- Q7=(e) Mode-dependent Chat scope
- Q8=(c) Explain button + hover popover (no Chat jumps / no per-entity history / no spaced repetition for α-now)

## 2. Decision (本 ADR 的 lock)

### 2.1 Phase 2 form = iii+iv Hybrid + Chat

Phase 2 = **三个并列 mode**，不分主次：

- **Quiz mode**: 做题驱动；用 v1.0.3 的 ~600 题为题库（`question` 类 entity from v1.0.3 page JSONs）
- **Study mode**: 顺序阅读 trilingual；用 v1.0.3 554 页 sections + Term entities + 章节结构
- **Chat mode**: 对话 with AI；AI 持 v1.0.3 context per §2.4 scope rules

**iii+iv 含义**：dual-mode (Quiz + Study) 是 iii，Chat-with-the-book 是 iv。三个 surface 在 Phase 2 app 内并列 access。

### 2.2 默认 mode = (d) Resume last

- 启动时进入用户上次退出的 mode + 该 mode 内的上次位置
- 第一次启动（无 state）默认 = **Study mode + 第一章**（阅读为先，最低认知门槛）
- 实现：本地 state 文件（per D-083 §2.3 α-private 范围；β-future 时可改 server-side per-user state）
- State corruption fallback = 第一次启动行为

### 2.3 Mode 切换机制 = (a) Top tabs 3 水平 tab

- Quiz / Study / Chat 三个 horizontal tabs，UI 上 **完全平级**
- 切换不丢 state：每个 tab 内部 position / scroll / pending input 保留
- 不用 hotkey-only / side panel / progressive single-canvas
- 设计理由：SaaS 常见心智模型 + mobile-ready（s1 web stack 起手）+ 实现简单

### 2.4 Chat scope = (e) Mode-dependent

AI 在 Chat 内看到的 v1.0.3 内容范围，跟 user **从哪个 mode 触发** Chat 走：

| 触发场景 | Chat scope | 用 v1.0.3 哪些数据 |
|---|---|---|
| Study mode → "Ask more" / 跳 Chat tab from Study | **Current chapter** | 当前章节所有 sections + chapter-local glossary entries |
| Quiz mode → "Explain" 按钮 | **Current question** | 该 question entity (stem + choices + answer_index + 相关 glossary) |
| 直接打开 Chat tab (无 Quiz/Study context) | **Whole book** | v1.0.3 全 554 页 corpus（实现层会需要 RAG / chunking — 见 §3 out-of-scope） |

理由：避免每次都 push 全 book context 进 LLM（cost + latency 关键变量）；同时保留 "我想跨章节问 AI" 的入口（独立 Chat tab）。

### 2.5 Quiz/Study ↔ Chat 集成 = (c) Explain button + Hover popover

**In Quiz mode**:
- 每题渲染 "**Explain**" 按钮
- 点击 → 切到 Chat tab，**auto-fill** question context (stem + 4 choices + answer_index)，AI 自动给中/日/英三语解释

**In Study mode**:
- 章节内任意 **Term entity** hover → **quick popover** 显示该 term 的 `kana_helper` (surface / reading / zh_concept) + "Ask more" CTA
- 点击 "Ask more" → 切到 Chat tab，auto-fill term context (surface + definition + kana_helper)

**Explicitly NOT in scope of α-now**:
- (d) Chat-initiated jumps（Chat 建议 "study this chapter" / "try these 5 questions" 触发跳转）
- (e) Per-entity Chat history（每 term / question 持久化独立 Chat 线程）
- (f) Spaced repetition / mastery tracking（AI 跟踪 user mastery 触发复习提示）

(d)~(f) 是 β/γ ROI 项，Phase 2 α-now 私有自用阶段过度工程；保留作 Phase 2 RETRO 阶段评估 + 可能升入 Phase 2 v2 或 Phase 3。

## 3. Out of scope (推 Session 27+)

- **技术栈** (Next.js / Astro / FastAPI / SvelteKit / Tauri / 等) → **D-086** (portability) + **D-087** (stack)
- **AI 模型** (Claude Sonnet/Opus / GPT-5 / Gemini / local Llama) → D-087+
- **数据源 contract** (本地 read-only v1.0.3 zip 解压 vs static JSON serve vs DB ingest 后查询) → D-087+
- **LLM cost cap**（per §2.4 whole-book scope 是 cost cap risk）→ D-087+（复用 D-071 budget cap 经验）
- **RAG / chunking** for whole-book Chat scope → 实现层，D-087+ 锁
- **UX flow 草图** + main screen mocks → g3 level，推 Session 27+ 或推 implementation 阶段
- **State machine**（mode transitions formal model）→ g3 level
- **Chat 持久化**：per-session（每次重启清空）vs cross-session（重启保留）→ α-now 看实现层决定
- **Source 引用规则**：Chat 引用 v1.0.3 page/term 时显示什么 metadata（page#, term id, anchor 等）→ Phase 2 实施层
- **Chat history per-mode 独立 vs 全局共享** → Q8=c 没锁这一点；推实现层
- **多用户 / hosting** → out-of-scope per D-083 §2.3（γ/δ 不在 Phase 2）

## 4. Rejected alternatives

| 候选 | 拒绝原因 |
|---|---|
| (Q5=a) Quiz-only default | 三 mode 平等的 form 不应有 Quiz bias；user 偏好不定可能是阅读 |
| (Q5=b) Study-only default | 同上，反向 |
| (Q5=c) Chat-only default | 把 AI 答疑当首位会让 user 忽略原书阅读，违反"三语化内容工厂"初衷 |
| (Q5=e) First-launch picker | 多一步认知，Resume last 自然；first-launch 没 state 时 fallback Study 即可 |
| (Q6=b) Hotkey-only | 不可见 affordance，mobile-unfriendly（s1 web stack 要 mobile-ready）|
| (Q6=c) Side panel hybrid | Chat 占屏幕，减少 Quiz/Study reading area |
| (Q6=d) Progressive surface（点 term 直接弹 Chat）| 复杂 UX，α-now 自用阶段过度设计 |
| (Q7=a) Whole book always | LLM cost / latency too high；§2.4 mode-dependent 更经济 |
| (Q7=b)(c) 单一固定 scope（仅 chapter / 仅 entity）| 不够灵活；不同 mode user 意图不同 |
| (Q7=d) User-adjustable scope | 多一个 UI control，α-now 自用阶段不需要；mode-dependent 自动合理 |
| (Q8=a) 零集成 | 浪费 Chat 与 Quiz/Study 共享 v1.0.3 数据的协同 |
| (Q8=d) Chat-initiated jumps | β/γ ROI；α-now 过度工程 |
| (Q8=e) Per-entity Chat history | β/γ ROI；α-now 简单实现的 friction 而不是 bug |
| (Q8=f) Spaced repetition | β/γ ROI；α-now 完全过度 |
| 跳过 D-085 直接 implement | 违反 D-019 + 设计阶段约束 |
| D-085 巨厚 (g4) 锁全部 corner case | Q3=g2 中 level，巨厚是 Session 27+ 工作 |

## 5. Consequences

### 5.1 Positive
- **Resume last default**: 0 思考成本启动；尊重 user 上次工作状态
- **Top tabs**: 用户心智模型清晰；mobile-ready；实现成本低；切换不丢 state 易实现
- **Mode-dependent Chat scope**: AI cost 可预测（大部分 chapter-scoped tokens，只有独立 Chat tab 才 push 全 book）
- **Explain + Hover popover**: AI 答疑在 user 自然卡点触发，不打断 reading / doing-quiz flow
- **kana_helper 进 popover**: 直接复用 D-084 v1.0.3 backfilled 数据，零额外数据工作（Term entity 已 self-contained）
- **D-085 不锁技术栈**: D-086/D-087 自由度保留

### 5.2 Negative / Risk
- **Top tabs 让 3 mode 看似"完全并列"**: 可能弱化 Quiz vs Study 在用户心智里的任务区分（user 不知道何时该 Quiz vs Study）
- **Mode-dependent Chat 跨 mode friction**: 用户在 Study 时想问 "这章和第 5 章关联是什么"，必须切到独立 Chat tab（多一步）
- **Whole book Chat scope LLM cost cap risk**: 独立 Chat tab 模式 push 全 book 进 LLM = 数百 K~M tokens，远超 Claude 200K context（需 1M context 或 RAG）→ Session 27 D-087+ 必须解决
- **Q8=c 排除 per-entity Chat history** → 每次开 popover 都是新对话，跨 hover 的对话上下文不保留（α-now 是简单 friction，不是 bug；β 时可能需要升）
- **Resume last state 文件 corrupt 风险** → §5.3 mitigation 有 fallback

### 5.3 Mitigation
- **LLM cost cap** for whole-book Chat scope → Session 27 D-087+ 必须有 budget cap（复用 D-071 三档 cap 经验）+ 实施层 RAG / chunking strategy
- **State corruption fallback** = 第一次启动行为（Study mode + 第一章）
- **3 mode 任务区分弱化** → Phase 2 实施时可加 first-launch 微指引（"Quiz 适合临考；Study 适合系统学；Chat 适合卡点"），不在 D-085 lock 范围
- **跨 mode Chat friction**: 独立 Chat tab 永远在，是 fallback；不算 bug，是 trade-off
- **Phase 2 RETRO**（per Rule C 收尾）评估是否升 (d)~(f) 进 v2 / Phase 3

## 6. Linked / supersede / amend

- **Supersedes**: 无
- **Amends**: 无
- **Linked**:
  - **D-083 §2.1** = parent ADR (Phase 2 = A+C hybrid 大方向)
  - **D-083 §3** = intent signal source (iii+iv from starting hypothesis)
  - **D-012** = kana_helper field 定义（Study mode hover popover 直接用）
  - **D-084** = v1.0.3 release（Phase 2 data source 全自这）
  - **D-076 envelope** = Quiz mode 用 answer_index 字段（envelope 已 refuse -1）
  - **D-071 budget cap** = 复用经验 for §5.3 LLM cost cap
- **Cited by future**:
  - D-086 portability ADR（Session 27）— form 决定 portability 要求
  - D-087 stack / AI 模型 / 数据源（Session 27/28）— 实现 form 的技术决定
  - Phase 2 实施阶段每个 milestone

## 7. Sign-off

| 角色 | 名字 | 时间 | 状态 |
|---|---|---|---|
| 撰写人 | Claude Opus 4.7 (1M ctx) | 2026-05-19 Session 26 Turn 3 | **LOCKED final** (path α one-step sign-off) |
| Reviewer #1 (per Rule D) | user (hakupao) | 2026-05-19 Session 26 Turn 4 | **APPROVED** — Q9 = α, ACK D-085 LOCKED draft as-is |

Per D-019 + Rule D: Writer (Claude) ≠ Reviewer (user 终审)。本 ADR LOCKED final at Session 26 Turn 4 commit。后续 sub-ADR (D-086+) 引用本 ADR §2 不需 amendment。

---

## End of D-085
