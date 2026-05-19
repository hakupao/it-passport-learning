# D-096 — Auth scope split (α single-user firewall vs β multi-user account system) + ChatGPT Plus / API access 澄清

| 字段 | 值 |
|---|---|
| 状态 | **LOCKED final** — Session 35 Turn 5 user terminal sign-off path α 2026-05-19 (`你的计划可以，执行` 2026-05-19 = blanket ACK on Q1=a/Q2=a/Q3=a/Q4=a recommend chain) |
| 锁定 session | `docs/discussion/2026-05-19-session-35.md` Turn 5 |
| 类型 | sub-amendment of **D-083 §2.5** (Phase 2 = A+C hybrid single user 默认) + **PLAN.md §6** (out of scope 列表 amend) + ChatGPT Plus 误区澄清记录 (防再踩) |
| 颗粒度 | g1 narrow — 锁 scope split 措辞 + Phase 2 α 单用户防火墙 in-scope + Vercel Password Protection 路径；不锁具体 Vercel dashboard config 细节（推 Session 36 实施） |
| 前置 ADR | D-083 (Phase 2 = A+C hybrid) / D-085 (4 mode 形态) / D-091 §2.1 (α-now $0 billed / single user) / D-092 (β trigger close) / D-095 (DeepSeek default + Anthropic switchable) |
| Supersede? | 否；**amend** D-083 §2.5 + PLAN.md §6 措辞 in-place (per D-080 v1.1 §8 pattern) |

---

## 1. Context

**User trigger** (Session 35 Turn 5 user message)：

> 我有 chatgpt plus 的会员，我想加一个 auth 的功能，可以吗

**Push-back / 澄清** (Claude Turn 5 reaction)：

1. **ChatGPT Plus ≠ OpenAI API access** — Plus 是 OpenAI 消费级订阅 ($20/月 chat.openai.com 网页 + 桌面 + 移动 app)，**不包含** API access。要把 OpenAI 接入 Phase 2 web app 需 platform.openai.com **API account** 单独充值 + `sk-proj-...` key
2. **"加 auth" 触动 PLAN.md §6 OUT OF SCOPE** — 既有锁明文 "用户账户系统 (auth / login / multi-device sync) — β-ready 之后"；加 auth = scope expansion = D-NNN-worthy
3. **Step 4 LLM gate 还 in-flight** — DeepSeek `go LLM` 验证 D-095 未做完，pivot 到 auth 会留状态债务
4. 开 Round 1 4Q slow-pace per D-019 §3a + 项目 CLAUDE.md

**User answer** (Session 35 Turn 5)：

| Q | ans | 含义 |
|---|---|---|
| Q1 | **a** | ChatGPT Plus 跟 auth 无关，纯顺嘴提；不立即接入 OpenAI 作 provider（若 future 要走 D-097 sub-ADR + `@ai-sdk/openai` 路径） |
| Q2 | **a** | **Vercel Password Protection** — Vercel 内置 dashboard 一键开启 + 一个 password，零代码，零新依赖；α single-user firewall 最低需求 |
| Q3 | **a** | **先关 Step 4 LLM gate** (DeepSeek `go LLM` + cache_audit + commit + push)，Session 36 起手再讨论 auth 实施；本场只 lock D-096 不实施 |
| Q4 | **a** | PLAN.md §6 amend in-place + 本 D-096 lock 即可；不立新 step / 不加 Module C+D 之外的 step row |

---

## 2. Decision

### 2.1 ChatGPT Plus / OpenAI API access 澄清（记录入 ADR 防再误）

**Lock**: ChatGPT Plus ($20/月) 与 OpenAI Platform API access **是两个独立产品 + 独立计费**：

| 维度 | ChatGPT Plus | OpenAI Platform API |
|---|---|---|
| URL | chat.openai.com | platform.openai.com |
| 计费 | 固定 $20/月 | Pay-as-you-go ($X/M token) |
| 用途 | 消费级 chat 应用 + 桌面 + 移动 | 程序化 API call (SDK / curl / app integration) |
| 是否 cover 本项目 | ❌ 无 API access | ✅ 可接入作 provider (D-097 sub-ADR if needed) |

**未来若想加 OpenAI 作 D-095 之外的第 3 个 provider**：另立 D-097 sub-ADR amend D-095 §2.1 + 加 `@ai-sdk/openai` + `OPENAI_API_KEY` env + provider matrix 加 row；与 Plus 订阅无关。

### 2.2 Auth scope split — α single-user firewall vs β multi-user account system

**Lock**: Phase 2 内 auth 形态明确分两个**性质不同的需求**：

| 形态 | 性质 | scope | 形式 | 工作量 |
|---|---|---|---|---|
| **α single-user firewall** | 防外人随便访问 deploy URL；**user = 项目作者本人 only** | Phase 2 α-now **in-scope** (per 本 D-096 §2.3) | Vercel Password Protection 一键开启（dashboard toggle + 一个 password） | 5 min ops，零代码，零依赖 |
| **β multi-user account system** | 多用户登录 + identity + per-user state (history, progress, multi-device sync) | β-ready 之后 **仍 out-of-scope** per D-083 §2.5 + D-092 β trigger checklist | NextAuth / Auth.js + DB-backed accounts/sessions + multi-IdP (Google / GitHub / etc.) | 1-2 day 代码 + DB + tests |

**为什么必须分两个**：
- α firewall 是 **基础设施级配置** (Vercel 平台功能)，不进 app code 不锁技术债
- β account system 是 **应用层架构** (DB schema + session / token / RBAC) — 决定后续可扩展性
- 把两个混为一谈 = 过早 over-engineer 或过晚 under-protect

### 2.3 Phase 2 α 内 **single-user firewall** in-scope

**Lock**: Phase 2 α (现行实施阶段) **新增 in-scope** 项：**Vercel Password Protection** (Vercel 平台内置功能，Hobby tier 也有；preview / production env 各自独立配置)。

**Default**：preview env 启 Password Protection (本人开发预览不让外人测)；production env 同步启 (post Step 15 production deploy 时)。

**Single password** (无 user 概念，无 session 持久化，无 user table) → 与"用户账户系统"是质上不同的：**没有 user identity，只是访问 token**。

### 2.4 β multi-user account system 仍 out-of-scope

**Lock**: D-083 §2.5 + D-092 β trigger checklist 的 "用户账户系统" 仍 out-of-scope。本 D-096 不动 β-ready 形态决定。

**含义**:
- β-open 之前若有 multi-user 需求 → 触 D-092 §2.x β trigger amend
- β-ready 后实施仍走 D-083 §2.5 既约（推 D-097+ sub-ADR）
- 现 α 不预埋 NextAuth / DB schema / user table 任何痕迹（YAGNI 原则）

### 2.5 PLAN.md §6 amend

**原** (D-091 §2.3 实施 PLAN.md §6):
> - 用户账户系统（auth / login / multi-device sync）— β-ready 之后

**新** (本 D-096 LOCK):
> - **多用户账户系统** (NextAuth / Auth.js + DB-backed accounts/sessions + multi-IdP + multi-device sync) — β-ready 之后 per D-083 §2.5
> - **α single-user firewall** (Vercel Password Protection 一键开启级别，无 user identity 概念) — Phase 2 α **in-scope** per D-096 §2.3；Session 36 起手 5 min ops 配置

PLAN.md §6 amend 同 turn 落盘。

### 2.6 实施 deferred 到 Session 36 (per Q3=a sequencing)

**Lock**: 本 D-096 只 **decision** + **PLAN.md scope amend**，**不实施** Vercel Password Protection。

**实施清单 (Session 36 entry)**：
1. Vercel dashboard → project `web` → Settings → Deployment Protection → Password Protection ON for preview + production environments
2. 设置 password (建议 user 个人非字典词 + 数字 + 符号 ≥12 chars)
3. 验证：浏览器开 https://web-2ffvc7sz0-bojiangs-projects.vercel.app → 应弹密码 prompt
4. Evidence: `evidence/phase2/step_04_5_auth/vercel_protection_<date>.md` (新文件夹) — screenshot + setup steps; **password 本身不记入 evidence** (敏感)
5. 不动代码；不影响既有 deploy 流程 (CI/CD redeploy 仍自动)

**为什么 defer 到 Session 36**:
- Q3=a 推荐 — 关 Step 4 LLM gate 先 (DeepSeek `go LLM` + cache_audit data point #1 + commit + push)
- in-flight state 拖久 = 状态债务 (D-027 §1 写完即落 + D-094 实测 wall 经验)
- D-096 LOCK 立即 (decision 写下来不丢)，ops 配置推 Session 36 (5 min 不卡 Step 4 close)

---

## 3. Rejected alternatives

### Q1 rejected (ChatGPT Plus 用途)

- (b) 想用 Plus cover Phase 2 LLM 费用 — **REJECTED with explicit fact correction**: Plus 不含 API access，物理上不可行；当前 D-095 DeepSeek default 路径 cost ~$0.01/2-call 已极便宜，无需 Plus 假想 cover
- (c) Sign in with OpenAI 作 IdP — REJECTED: OpenAI 公开 OIDC 仅 GPTs / Connectors 类场景；普通 web app 一般不能挂 (per Anthropic Claude knowledge 2026-01)
- (d) 已修正认知 → Q1=a — covered by (a)

### Q2 rejected (auth scope)

- (b) App-level simple gate (middleware HTTP Basic Auth / cookie) — REJECTED: Vercel Password Protection (Q2=a) 已经免费 cover 同样功能 + 零代码；自己写 middleware 增技术债 + 1 unit test 维护成本
- (c) NextAuth + GitHub OAuth single user — REJECTED: 过早 over-engineer α；为 β 准备的形态不该现在 land 否则 YAGNI；Vercel Password Protection 可未来 5 min 关掉换升级，无锁死
- (d) NextAuth + multi-IdP + user table — REJECTED: 完整 β-ready 用户系统，scope 错档 (β-ready 之后)；D-083 §2.5 + D-092 锁死

### Q3 rejected (sequencing)

- (b) 暂存 Step 4 立刻开 auth — REJECTED: 留 `cache_audit_<date>.md` HELD 状态债务；后续 session 接入成本高
- (c) 并行 Step 4 LLM gate + auth — REJECTED: auth 是 D-NNN-worthy 不能 background；同 turn 多线 ADR 写作易 context 污染
- (d) 完全 dump Step 4 切 auth — REJECTED: 丢 Turn 1-3 ~110 min 工作收尾价值；D-094 + D-095 + scaffold + deploy 全 untested 留状态债

### Q4 rejected (PLAN.md / ADR 路径)

- (b) 新 PLAN step (Step 16 末尾) — REJECTED: Vercel Password Protection 是 ops 配置非 build step，加 step 错位；行政性 overhead 高
- (c) 加 Module A Step 3.5 中间件 — REJECTED: Module A 已 done 倒插不顺；逻辑分类错误 (auth 不是 data layer)
- (d) 不进 PLAN.md 作 ad-hoc patch — REJECTED: 违反 Tier 3 traceability + Rule C retro 必须 cover；D-096 + PLAN.md amend 是最小合规 footprint

---

## 4. Implications

### 4.1 PLAN.md §6 amend (this turn) — covered §2.5

### 4.2 STATE.md sync (this turn)

- `已锁定决定数` 95 → **96**
- `最后更新` row append Turn 5 D-096 lock narrative
- `下一会话` row add Session 36 entry actions: (i) Vercel Password Protection ops setup per D-096 §2.6; (ii) Step 5 `/api/chat` whole-book scope wiring

### 4.3 Session 35 log Turn 5 (this turn)

`docs/discussion/2026-05-19-session-35.md` add Turn 5 narrative (ChatGPT Plus 误区澄清 + Round 1 4Q + ans `a/a/a/a` + D-096 lock + 推 Session 36 实施 + 重开 DeepSeek HARD GATE)；Turn 4 pre-close 表 update 加 D-096 row。

### 4.4 No code change this turn

本 ADR 不动任何 source file。`apps/web/src/lib/` / `apps/web/src/app/` 0 file modified；Vercel deploy 不动 (last D-095 deploy `dpl_BGdkkzKHzNjxQQB7L9GEB2YEefvz` 仍 active)。

### 4.5 ChatGPT Plus 澄清入 ADR 便于检索

未来任何 session 若再触 "ChatGPT Plus" 用途话题，直接搜 D-096 §2.1 表 — 防多次踩同样误区。

### 4.6 D-097 占位（未立，仅记录路径）

若 future 要加 OpenAI 作第 3 provider (Plus user 想接但需另购 API)：D-097 amend D-095 §2.1 provider matrix；加 `@ai-sdk/openai`；加 `OPENAI_API_KEY` env；加 OpenAI 模型 id 矩阵 (`gpt-4o` 系列 / `gpt-5` 系列 if released by then)。本 D-096 不立 D-097，仅记录路径。

### 4.7 D-090 / D-091 cost envelope 不变

Vercel Password Protection 是 Vercel 平台免费功能 (Hobby tier 含)，cost = $0；不触发 D-090 / D-091 envelope re-baseline。

### 4.8 Step 4 HARD GATE 不变

DeepSeek `go LLM` 仍是 Session 35 close 关键 path；本 D-096 lock 不替代 / 不延后 HARD GATE。

---

## 5. Out of scope（推 Session 36 实施 / Phase 3 backlog）

- Vercel Password Protection 实际 dashboard 配置 — Session 36 entry
- Password 强度建议 / 轮换策略 — user 决定，不进 ADR
- β multi-user account system 设计 — β-open 之后 per D-083 §2.5 + D-092 + D-097+
- OpenAI 作第 3 provider 接入 — D-097 sub-ADR (本 D-096 仅记录路径，不立 D-097)
- Vercel SSO (Team / Enterprise tier 功能) — α 单人 Hobby tier 不适用
- App-level "guest mode" / "demo mode" / "trial access" — β-ready 后续 backlog

---

## 6. Audit / Trace

- **Trigger**: user message `我有 chatgpt plus 的会员，我想加一个 auth 的功能，可以吗` 2026-05-19 Session 35 Turn 5
- **Slow-pace 4Q**: Q1 ChatGPT Plus 用途 / Q2 auth scope / Q3 sequencing / Q4 ADR + PLAN 路径
- **User ans**: `Q1=a / Q2=a / Q3=a / Q4=a` (Claude recommend chain 全 hit)
- **User ACK**: `你的计划可以，执行` 2026-05-19 = blanket execute green light
- **Lock turn**: Session 35 Turn 5 (本 ADR write + PLAN.md §6 amend + STATE.md sync + session log Turn 5)
- **Implementation**: deferred to Session 36 per Q3=a (Vercel dashboard 5-min ops, no code, no test, no deploy change)

---

## 7. Amend / Future supersede pattern

- 本 D-096 可后续 amend in-place (v1.1 / v1.2…) per D-080 v1.1 §8 pattern
- α firewall → β account system 升级时 (β-open 触发) → 立 D-097+ supersede D-096 §2.3 + amend PLAN.md §6 双向 (α firewall in-scope → keep for ops + β account system in-scope for app-layer)
- ChatGPT Plus / OpenAI Platform API 关系不变 (产品事实) — §2.1 表无 supersede 风险

---

**END D-096 v1.0 — 2026-05-19 LOCKED**
