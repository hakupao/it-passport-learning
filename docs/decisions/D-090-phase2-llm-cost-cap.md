# D-090 — Phase 2 LLM cost cap

| 字段 | 值 |
|---|---|
| 状态 | **LOCKED final** — Session 30 Turn 4 user terminal sign-off path α 2026-05-19 |
| 锁定 session | `docs/discussion/2026-05-19-session-30.md` |
| 类型 | sub-ADR of D-088 §5.2 High-severity risk handoff（β cost spike Opus 5× Sonnet at multi-user scale） |
| 颗粒度 | g2 mid level（三档 cap 数值 + α/β 行为模式 + 切换 trigger；不锁具体 UI 文案 / 实现 module 边界 / per-mode 差异 cap → 推 Phase 2 实施 retro） |
| 前置 ADR | D-071 (Phase 1 三档 cap pattern 经验) / D-085 (whole-book Chat scope risk) / D-088 (Opus 4.7 + cache) / D-089 (数据源 contract) |

---

## 1. Context

D-088 §5.2 锁了一个 High-severity risk = "β cost spike Opus 5× Sonnet at multi-user scale"，并要求 D-090 cost cap **MUST land before OQ-40 β open**（不能等 β 切真 API key 之后再做 cap 兜底）。

α-now 期间用 max-plan OAuth（D-069 precedent + memory `project_max_plan_billing.md`）= $0 real billed，shadow cost 只是 visibility tool。 但 β open 切真 ANTHROPIC_API_KEY 后，每次 API call 真扣钱。

Session 30 Turn 2 β light PoC 实测（`evidence/phase2_d089_poc_2026-05-19/measurement.md` §3）:
- 真 cache block 98,910 tokens vs `cost_table.md` 估的 90K（+9%）
- 校正后 daily mix shadow ≈ **$13.55/day Opus everywhere cached**（vs cost_table.md 原估 $7.92，+71% 偏高）
- Whole-book Opus uncached 单 call = $12.71（容易超 per-query cap）

Phase 1 D-071 三档 cap pattern（soft warn / mid confirm / hard halt）已验证 work；D-090 直接复用 + 校正数值。

---

## 2. Decision

### 2.1 三档 cap 数值（基于实测校正后 daily mix）

**Lock**: 单一全局 cap 三档 + 单一 per-query cap。 数值 = β PoC 实测校正后的推荐档（Q7=a）:

| Cap 档 | 阈值 | 行为（β-ready 模式，详见 §2.3） |
|---|---:|---|
| **Soft cap** | $5/day shadow | Warn user inline ("今日已用 $X.XX / $5") + 不阻塞，continue |
| **Mid cap** | $15/day shadow | 弹窗 / inline confirm("继续 $Y.YY/query? 今日已超中档")，需 user 点确认才送 call |
| **Hard cap** | $30/day shadow | 自动 halt，UI 显示 "今日 cap 已达 $30，请明天再试" + 禁用 send button |
| **Per-query hard cap** | $5/single-call | 单 call 估算 cost > $5 → 直接拒绝（whole-book Opus uncached $12.71 → blocked；whole-book cached $1.37 → allowed；chapter cached $0.17 → allowed） |

**Reasoning**:
- daily $5/$15/$30 = 2.2× / 4.4× / 8.8× 校正后 baseline $13.55 → 早 warn 容忍 / 中档 confirm 缓冲 / 硬档 halt 兜底
- $30 hard cap 复用 Phase 1 PoC budget 已验证 ceiling（D-088 PoC `cost_table.md` §3）
- per-query $5 = whole-book Sonnet uncached ($2.54) allowed，whole-book Opus uncached ($12.71) blocked → 强制走 cache path
- α-now max-plan OAuth $0 effective billed 下这些数值只是 shadow visibility；β-open 切真 key 后真起作用

**Cap reset semantics**:
- Daily window = JST 00:00 reset（与 user 日常 active hour 对齐；vs UTC reset = 半夜跨日不直观）
- 单 session shadow cost 累计写 localStorage / cookie；用户跨设备不同 bucket（α-now single user 单设备主体，β-ready 切真 auth 后改 server-side accounting）
- Reset 行为推 Phase 2 实施 retro 细化（per §3）

### 2.2 α-now 行为 = silent log only

**Lock**: α-now 阶段（max-plan OAuth + single user dev/prototype），cap 触发**全部走 silent log + dev console warn**，不 break UX：

- Soft cap → console.warn + 不弹任何 UI
- Mid cap → console.warn + 不弹 confirm
- Hard cap → console.warn + 不 halt（仍允许继续，但 dev console 警告）
- Per-query cap → 仍正常拒绝（这是 cost safety net，不分 α/β）

**Reasoning**：
- α-now max-plan OAuth $0 real billed，cap 触发不构成真损失
- silent log = 仍 surface 异常给开发者（dev console + 可选 Sentry/log aggregator）
- 不让 cap pop-up 打断 α-now 早期 prototype 测试节奏
- per-query cap 不放松 = 防止 whole-book Opus uncached 单次烧 $12 的 edge case 也炸 max-plan token 上限

### 2.3 β-ready 行为 = D-071 pattern (warn / confirm / halt)

**Lock**: β open（切真 ANTHROPIC_API_KEY）之后切换到完整 D-071 pattern:

- Soft cap → UI inline 横幅 "今日已用 $X.XX / $5"（顶部 / Chat 输入框上方），continue 不阻塞
- Mid cap → 弹 `<dialog>` confirm "本次预计 $Y.YY，今日已用 $A.AA / $15。 继续？"，需 user 点 "继续" 才送 call
- Hard cap → 自动 halt + UI 全局 banner "今日 cap 已达 $30，明天 JST 00:00 重置"，禁用 send button
- Per-query cap → 拒绝 + 解释 "本次估算 $Z 超单 query $5 上限，请缩小 scope（chapter 而非 whole-book）"

**Reasoning**：
- D-071 三段 graduated response 是 Phase 1 实战验证 pattern（dry-run + Stage 5 stuck-leaves 都触发过）
- β multi-user 公共部署 = cap 必须有 UI 兜底，不能只 dev console
- 切换是 prerequisite for OQ-40 β open（不切完成不让 β 启动）

### 2.4 α→β switch trigger

**Lock**: D-088 §2.5(γ) tripwire β open 触发条件即 α→β cap 行为切换 trigger。 具体 = OQ-40 close 时锁的 β 开放时间窗 / 条件（at that point 一次性 flip α-silent → β-full-UX）。

**Implementation hint**（推 Phase 2 实施 retro）:
- env var `PHASE2_CAP_MODE=alpha|beta`（default `alpha`）
- α-now 部署：`alpha`；β open 时 deploy 改 `beta`
- 单 flag 控制 UI + log + halt 行为；不动 cap 数值（数值同 α/β）

### 2.5 Tripwire / amendment

**Lock**: D-090 amendment 触发条件（per D-080 v1.1 §8 pattern）:

- (α) **Anthropic 改价格** → cap 数值需要 recompute（cost_table.md §1 baseline shift）
- (β) **User report > 3 warn/confirm/halt 误触发 per week** → cap 偏紧，需调整数值
- (γ) **β open + 真 daily mix 偏离 PoC baseline ±50%** → recalibrate
- (δ) **annual silent drift floor 12mo** → 即使无 incident 也强制 review
- (ε) **新增 mode**（D-085 §2.1 v2 升级如 spaced repetition / Chat jumps）改变 daily call 数 → recompute baseline

Amendment 走 D-080 v1.1 §8 pattern（in-place v1.1+ revision；不重写 ADR）。

### 2.6 Cost accounting source

**Lock**: shadow cost 计数来源 = **Anthropic API response `usage` field**（per-call 真实 input/output/cache token 数）+ 本地累计写 localStorage（α-now）/ server-side accounting（β-ready）。

不依赖：
- Anthropic dashboard / billing API（latency 太大，不能实时 cap）
- 客户端估算 input tokens（与真实 BPE 可能差 ±15%）

Implementation detail 推 Phase 2 实施 retro。

---

## 3. Out-of-scope (推 Phase 2 实施 retro / Session 31+)

- Cap 数值 reset semantics 具体（JST 00:00 锁了 timezone，但跨设备同步策略 / multi-tab 累计 / 离线恢复 等推后）
- α/β switch env var 命名 + deploy flow
- UI 文案具体（warn 横幅 / confirm dialog / halt banner 的 i18n 三语 string）
- Per-mode 差异 cap（term hover 低成本 vs whole-book Chat 高成本是否独立 cap）→ Q8 reject (c) 选项；后续 amendment 可加
- Per-user cap（multi-user β scope；α-now single user 不需要）
- Cost telemetry 上报（Sentry / DataDog / Vercel Analytics）
- Anthropic API key rotation / per-deployment key 隔离

---

## 4. Rejected alternatives

| 选项 | 理由 reject |
|---|---|
| Q7 (b) cost_table.md 原版 $3/$10/$30 | 实测 baseline $13.55 → soft $3 频繁误触发 warn fatigue；mid $10 也偏紧 |
| Q7 (c) 保守 $10/$30/$100 | α-now max-plan OAuth $0 下 cap 形同虚设；β multi-user scale cap 又过松 = $100/day 单用户 = 5× 估的合理上限 |
| Q7 (d) 激进 $2/$5/$10 + per-query $3 | per-query $3 阻挡 chapter cached ($0.17 OK) 但也阻挡 whole-book cached ($1.37) 和 whole-book Sonnet uncached ($2.54)；切断 D-085 §2.4 standalone Chat 主路径 |
| Q8 (a) 单一 cap 三档不分 α/β | α-now max-plan OAuth $0 下弹 confirm 是无效噪音；UX 打断早期 prototype 节奏 |
| Q8 (c) per-mode 差异 cap | engineering 复杂度 +2-3× ；α-now YAGNI；amendment 可加（per §2.5 trigger (ε)） |
| No cap (max-plan OAuth 全程依赖) | β open 切真 key 后无兜底 → D-088 §5.2 High risk 不闭合 |
| Hard halt only（无 soft/mid graduated） | UX cliff；D-071 Phase 1 经验显示 graduated 比 binary 更友好 |
| Cost accounting from dashboard polling | latency 5-15min → 不能实时阻挡 burst |

---

## 5. Consequences

### 5.1 Positive

- **闭合 D-088 §5.2 High risk**：β open 不再裸跑真 API key
- **复用 D-071 经验**：三档 graduated 已 Phase 1 验证 work
- **α-now 不打断 UX**：max-plan OAuth $0 下 silent log；早期开发节奏不被 confirm dialog 干扰
- **β-ready 兜底完整**：full UI warn/confirm/halt 在 OQ-40 close 之前 ready
- **per-query cap $5 阻挡 whole-book Opus uncached burn**：强制走 cache path = 与 D-088 §2.3 ephemeral cache 自然联动
- **数值校正基于实测**：β PoC measurement.md §3 daily mix $13.55 baseline，不是空想

### 5.2 Risks（+ mitigations）

| Risk | Severity | Mitigation |
|---|---|---|
| α-now silent mode 下隐藏 bug（如循环 call 烧 token quota） | Medium | dev console.warn 仍存在；可加 Sentry / log aggregator 监控；max-plan 5h quota 自然限速 |
| β open 切换时 env var 漏改 → 继续 silent mode 烧真钱 | High | OQ-40 β open checklist 必含 `PHASE2_CAP_MODE=beta` 校验；deploy 前 smoke test 触发 cap → 确认 UI 出现 |
| cap 数值 偏紧导致 user 频繁 confirm fatigue | Medium | §2.5(β) tripwire 触发 amendment；3 次/week 即 review |
| cap 数值 偏松导致 multi-user β 烧钱 | High | β PoC 实测后 §2.5(γ) tripwire；hard $30 已是 Phase 1 ceiling，应 hold |
| Anthropic 改价格 → cap 数值过时 | Medium | §2.5(α) tripwire；cost_table.md §1 baseline 重测 |
| Whole-book cached 仍 1.37/call × 10 call/day = $13.7 → 单天 mid cap | Low | 用户 mid cap confirm 一次后 5min cache window 内后续 cached call 仅 $0.15；自然摊薄 |
| Per-query $5 与 D-088 §2.4 1-retry 联动 → retry 是否各算一次 | Low | Implementation: retry 重用 same query cost estimate；不重复计；Phase 2 实施 retro 细化 |

### 5.3 Phase 2 RETRO 升级触发条件

D-090 v1.1+ amendment 经常会触发（cap 数值天然 drift）；§2.5 五种 trigger 覆盖主要 vector。

---

## 6. References

- `docs/decisions/D-071-budget-cap-and-emergency-halt.md` — Phase 1 三档 cap pattern（直接复用）
- `docs/decisions/D-080-stage4-5-polish-acceptance.md` v1.1 §8 — Amendment pattern
- `docs/decisions/D-085-phase2-form-mainline.md` §5.3 — whole-book Chat scope LLM cost cap risk handoff
- `docs/decisions/D-088-phase2-ai-model.md` §2.5 tripwire / §5.2 High-severity risk
- `docs/decisions/D-089-phase2-data-source-contract.md` §2.3 per-scope assembly（cap 阻挡阈值与 scope size 对应）
- `evidence/phase2_d089_poc_2026-05-19/measurement.md` §3 — daily mix 校正基线
- `evidence/phase2_d088_poc_2026-05-19/cost_table.md` §3 — original cap candidate baseline
- D-069 max-plan OAuth precedent
- Memory `project_max_plan_billing.md` — α-now $0 effective billed semantics

---

## 7. Sign-off

| 角色 | 状态 | 日期 |
|---|---|---|
| Writer (main session) | LOCKED final | 2026-05-19 |
| Reviewer #1 (user) | **APPROVED (path α)** | 2026-05-19 |
| Reviewer #2 (Rule D distinct agent) | n/a — design ADR，无 code 产物 user 可 path α terminal sign-off | — |

LOCKED final — Session 30 Turn 4 user terminal sign-off path α 2026-05-19.
