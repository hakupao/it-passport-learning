# D-092 — OQ-40 β 开放时间窗 / 触发条件 close

| 字段 | 值 |
|---|---|
| 状态 | **LOCKED final** — Session 31 Turn 6 user terminal sign-off path α 2026-05-19 (OQ-40 同 turn CLOSED LOCKED) |
| 锁定 session | `docs/discussion/2026-05-19-session-31.md` |
| 类型 | OQ-40 closure ADR (Session 24 D-083 Turn 3 new posed → Session 31 D-092 closed)；coordinated transition lock for α-now → β-ready |
| 颗粒度 | g2 mid level（trigger 条件 set + closure mechanism + β-open sub-step checklist；不锁具体付费模型设计 / β user 数上限 / 真 ANTHROPIC_API_KEY 获取流程 / 域名供应商选型 → 推 Phase 2 实施 retro 或 Phase 3 backlog） |
| 前置 ADR | D-069 (Anthropic OAuth max-plan path) / D-083 (Phase 2 direction α+β framework) / D-085 §2.4 (form mode α/β) / D-086 §2.4 (portability β-ready) / D-087 §2.3 (Vercel Hobby α → Pro β) / D-088 §2.2 + §2.5(γ) (model alias α → date string β + tripwire) / D-089 §2.4 (FsDataSource α → BlobDataSource β) / D-090 §2.4 (cap mode env var `PHASE2_CAP_MODE=alpha|beta`) / D-091 §2.4 (cap 联动 + 经济性 gate) |

---

## 1. Context

OQ-40 = "β 开放时间窗 / 触发条件 = 什么时候 / 什么条件下 α → β 切换" 由 **Session 24 D-083 Turn 3** 立项；此后在 **D-085 §2.4 / D-086 §2.4 / D-087 §2.3 / D-088 §2.2 + §2.5(γ) / D-089 §2.4 / D-090 §2.4 / D-091 §2.4** 共 7 处被引用作为 amendment trigger / switch trigger。**OQ-40 不 close = Phase 2 多个 ADR 的 amendment / switch trigger 悬空**，必须收口。

**β 切换的本质 = 一次 coordinated transition**：
1. 经济模型转变：max-plan OAuth $0 真 billed → 真 ANTHROPIC_API_KEY 真扣钱
2. Hosting 转变：Vercel Hobby (free / single-user) → Vercel Pro ($20/月 / multi-user 友好)
3. 域名转变：`*.vercel.app` → 自有域名（user 体感、品牌、付费模型 prerequisite）
4. App 行为转变：D-088 alias → date string pin / D-089 FsDataSource → BlobDataSource (可选) / D-090 cap silent log → graduated UI / D-085 single-user mode → multi-user-friendly mode
5. Evidence / 维护转变：α-now silent log only → β-ready user-visible cap + telemetry + retro cadence

**β open ≠ implementation gate**：实施 gate 是 Phase 2 设计阶段结束 → user 显式 "开始 Phase 2 实施"；β open 是 **Phase 2 α 上线后** 切到 β 模式。设计阶段锁的是 trigger 条件 + closure mechanism，不锁 β 实施时间。

---

## 2. Decision

### 2.1 β trigger 条件 set — 混合 AND + multi-trigger entry（Q8=e）

**Lock**: β open 必须 user 显式 ∧ (至少 1 项 prerequisite 满足)。 user 是 final say；prerequisite 是经济 / 技术 / 风险 entry 触发。

**条件 set**:

| 类别 | 条件 (任 1 满足即 entry trigger fired) | 数据 source |
|---|---|---|
| **User entry** | user 显式 "go β" / "开 β" 一句话 | session log / chat |
| **Technical entry** | 3 项全满足 = (i) 真 ANTHROPIC_API_KEY 准备好 + (ii) Vercel Pro 已升级 + (iii) 域名 + DNS 已就绪 | Phase 2 实施期 deploy log |
| **Economic entry** | 任 1 触 = (a) α-now 月 shadow > $450（D-091 §2.1 pessimistic 边界）/ (b) β 商业化路径决策（user 端付费模型 ready）/ (c) D-090 §2.5 daily cap 经常触（user 实际重度使用） | D-090 cap 监控 dashboard + α-now telemetry |
| **Risk entry** | 任 1 触 = (a) D-088 §2.5(γ) tripwire β open 触 / (b) D-090 §2.5(β/γ) baseline drift > 50% / (c) Anthropic 改价 / Opus 4.7 deprecation 倒计时 | D-088 / D-090 tripwire 监控 |

**触发逻辑**:

```
β_open := user_explicit AND (
              technical_entry  OR
              economic_entry   OR
              risk_entry
          )
```

`user_explicit` 必备 = user 显式签字（path α 模式同 D-085~D-091 sign-off）；其他 entry 是建议 / 警示，不能自动开启 β。

### 2.2 Closure mechanism — D-092 自包含 + user 单方面（Q9=a）

**Lock**: D-092 自包含所有 β-open sub-step 详细 checklist + amendment trigger + tripwire；不立新 D-093 implementation ADR；OQ-40 close moment = D-092 LOCKED final = Session 31 Turn 6 user terminal sign-off。

**OQ-40 状态变迁**:
- Session 24 D-083 Turn 3 → OQ-40 OPEN posed
- Session 31 D-092 Turn 5 → OQ-40 LOCKED draft pending Q10
- Session 31 D-092 Turn 6 user Q10=α → **OQ-40 CLOSED LOCKED** = D-092 LOCKED final

**β open 实施时（未来）**:
- 不需新 ADR；走 D-092 §2.3 checklist 逐项 check
- D-088 / D-089 / D-090 各 §2.x 标记 "α → β" 的 sub-section 走 D-080 v1.1 §8 minor amendment pattern in-place 切 status；不重 lock
- session log 记录 β-open 实际触发时刻 + 4 entry 类别命中状态 + checklist 执行结果

### 2.3 β-open sub-step checklist（全包；§2.2 自包含）

实施 β open 时按以下顺序逐项 check（必须 user 显式 sign-off 每项）:

**Pre-β-open prerequisite gate**（§2.4 details）:
- [ ] Phase 2 α-now 已上线 ≥ 2 周（实测数据 cover 多周 cycle）
- [ ] D-088 §2.5 cache hit rate 第一周 retro 实测 ≥ 50%（per D-091 §2.5(β) tripwire）
- [ ] D-091 §2.1 expected scenarios 实测对照 ≤ ±50% drift
- [ ] D-090 cap 数值 retro 校正完（per D-090 §2.5(γ) baseline drift）
- [ ] §2.1 4 类别 entry 至少 1 项满足 + user 显式

**Step 1 — Technical 准备**:
- [ ] 申请 / 充值 真 ANTHROPIC_API_KEY (production key, 非 test)；存进 Vercel env secret + 本地 `.env.local` 不入 git
- [ ] Vercel Pro 升级 (account settings → Pro $20/mo)；team 升级 if multi-user
- [ ] 域名注册 (推 Vercel 直接 / Cloudflare Registrar) + DNS 配置 + SSL 自动 (Vercel auto)
- [ ] D-088 §2.2 切：app code 中 `model: 'claude-opus-4-7'` → `'claude-opus-4-7-YYYYMMDD'`（实际 date string per Anthropic dashboard pin）
- [ ] D-089 §2.4 切（可选）：若 corpus 升 v1.0.4+ 或多 user 场景 → `FsDataSource` → `BlobDataSource`；否则保留 FS
- [ ] D-090 §2.4 切：env var `PHASE2_CAP_MODE` α → β；UI 走 graduated cap (D-090 §2.3)；deploy 前 smoke test 触发 cap

**Step 2 — App / UX 调整**:
- [ ] D-085 §2.4 mode-dependent scope 检查 (whole-book Chat scope 在 multi-user 下 LLM cost spike 风险 → 考虑加 chapter limit 或 token budget 预校)
- [ ] D-090 §2.3 graduated UI cap 实装 (soft 横幅 / mid `<dialog>` confirm / hard halt banner)
- [ ] 用户错误体验 (D-088 §2.4 1-retry no-fallback) 文案审 + i18n 三语
- [ ] Lighthouse audit (Phase 2 specific evidence) target ≥ 90 在 Pro env 重测
- [ ] E2E test (Playwright) 跑 happy path + cap 触发 path on Pro env

**Step 3 — 经济模型 / 维护**:
- [ ] α 期间 shadow cost telemetry 转 β real cost telemetry（D-090 §2.6 `usage` field per-call）
- [ ] β 期间 cost dashboard for user-visible spending (推 simple in-app indicator: "今日 $X.XX / $5 soft cap")
- [ ] β 期间 付费模型决策（若 multi-user）：免费 tier vs 付费 tier 划分 / Stripe / 收款流（推 Phase 3 backlog）
- [ ] β 期间 维护 cadence：周报 cost / weekly cache audit / monthly tripwire review

**Step 4 — Sign-off**:
- [ ] β open commit message: `feat: β open — D-092 §2.3 checklist 完成 + D-088/D-089/D-090 α→β switches activated (session-XX)`
- [ ] session log 记录 β-open 实际触发时刻 + 4 entry 类别命中 + checklist 完成
- [ ] STATE.md 已锁定决定数 + 阶段 + 最后更新 sync

### 2.4 Pre-β-open prerequisite gate（详 §2.3 Step 0）

**5 项 prerequisite 全满足才能进入 §2.3 Step 1**:

| Prerequisite | 数据 source | 量化判定 |
|---|---|---|
| Phase 2 α-now 上线 ≥ 2 周 | git tag / deploy log | wall time clock |
| Cache hit rate retro ≥ 50% | `evidence/phase2/cache_audit_<date>.md` | `cache_read / total_input` ≥ 0.5 跨多 session |
| D-091 §2.1 expected scenarios drift ≤ ±50% | α-now telemetry monthly summary | `\|实测 - 预估\| / 预估 ≤ 0.5` |
| D-090 cap 数值 retro 校正 | session log + STATE.md | D-090 §2.5(γ) baseline drift review 已完成 |
| §2.1 4 类别 entry ≥ 1 命中 + user 显式 | session chat + dashboard | 显式 boolean |

**任 1 项不满足 → β open 推迟 / 走 partial β (单维度切换，e.g., 只升 Pro 不开 multi-user)**。

### 2.5 OQ-40 close moment

**OQ-40 status transitions** (per D-027 §3 state sync rule):
- Session 24 D-083 Turn 3 → `OQ-40 OPEN`
- Session 31 D-092 Turn 6 user Q10=α → **`OQ-40 CLOSED LOCKED`** (本 ADR 本 turn)
- STATE.md §4 OQ-40 row 同 turn flip 状态

**OQ-40 close 不等于 β open**:
- OQ-40 closed = **trigger 条件 + closure mechanism 已锁** (设计阶段任务完成)
- β open = future session 走 §2.3 checklist 逐项 sign-off (实施阶段任务)

### 2.6 Tripwire / amendment triggers

**5 triggers** → 任 1 触 = D-092 review session:

- **(α)** **§2.1 4 类别 entry 命中后 user 长期未签字**：勿超过 6 个月 → review trigger 条件是否过紧 / 经济决策是否需调
- **(β)** **§2.3 sub-step 实施时发现 checklist 项不可执行**：例如 Vercel Pro 价变 / 域名注册供应商变 / Anthropic key 申请流程变 → amend §2.3 对应 item + 实施 session log 记录
- **(γ)** **§2.4 prerequisite gate 长期不满足**：α-now 已 6 个月 cache hit rate 仍 < 50% → 触发 D-088 §2.5 cache 设计 review (设计假设错误)
- **(δ)** **Phase 2 stack 切换** (D-087 amendment / supersede)：D-092 §2.3 Step 1 全部需重审 (新 stack 的 deploy / domain / env var 模式 不同)
- **(ε)** **β-open 后实测数据反向 invalidate trigger 条件**：例如 β open 后真 monthly cost 远超 D-091 §2.1 pessimistic $4,000 → 触发 D-092 + D-090 + D-091 三 ADR 同期 amendment

**Amendment 走 D-080 v1.1 §8 pattern**：minor checklist item amend in-place + log；major scope amend 走 sub-ADR 或 supersede。

---

## 3. Out of scope（推 Phase 2 实施 retro / Phase 3 backlog）

- 付费模型具体设计 (subscription tier / per-call billing / Stripe / 收款流) — Phase 3 backlog
- β user 数上限 / multi-tenant 隔离设计 — Phase 3 backlog
- 真 ANTHROPIC_API_KEY 获取 / 验证流程具体步骤 — Anthropic console 文档负责
- 域名供应商选型 (Vercel Registrar vs Cloudflare vs Namecheap) — implementation 时 user 决定
- DNS 配置细节 (A record vs CNAME / TTL / SSL renew) — 实施 retro
- Stripe / Cloudflare / Sentry / Mixpanel 等 vendor 选型 — Phase 3 backlog
- 多语言用户群 priority (是否优先支持哪种语言用户的 β) — Phase 3 backlog
- β-open 后的 v2 feature backlog (e.g., spaced repetition / Chat history persist) — Phase 2 retro 决定

---

## 4. Rejected alternatives

- **Q8 (a) user 单条件** = 无 prerequisite check 容易草率开 β；切换涉及多维度 coordinated transition 需技术 + 经济 ready
- **Q8 (b) technical AND only** = user 不 explicit 时 even 全 ready 也不该自动开（user 是经济决策者）
- **Q8 (c) economic OR only** = user 经济 trigger 触发 时未必 technical ready；coordinated transition 错位
- **Q8 (d) 混合 OR** = 任 1 触自动开 → 失 user 显式 final say；β 烧钱风险高，不能自动
- **Q9 (b) 新 D-093 implementation ADR** = 设计阶段 vs 实施阶段切分人为；§2.3 checklist 直接放 D-092 减少 ADR 数；OQ-40 close 一次性完成
- **Q9 (c) D-092 + D-088/D-089/D-090 amendment chain** = D-088/D-089/D-090 已锁 final，amendment 走 D-080 v1.1 §8 pattern in-place 即可，不需 D-092 强制同 turn 触发；coupling 过紧
- **Q9 (d) D-092 极薄 + session-level checklist** = 失语境化；checklist 散 session log 后续找回成本高；自包含更易追溯

---

## 5. Consequences

### 5.1 Positive

- OQ-40 终于 close → STATE.md §4 OPEN OQ 从 4 减到 3（OQ-01 / OQ-02 / OQ-05 partial close LOCKED 保留）→ Phase 2 设计阶段完整收尾
- §2.1 混合 AND + multi-trigger entry → user 是 final say + 4 类别 entry 提供 review 时机 → 不漏触发 + 不被自动机制误开 β
- §2.3 全包 checklist → β-open 实施时无需另起设计；走 D-092 §2.3 逐项即可
- §2.4 prerequisite gate → cache hit rate / cost drift / D-090 retro 校正 等关键 metric 在 β-open 前必须 ready，防止草率切换
- §2.2 D-092 自包含 + 不立 D-093 → ADR 数控制（90 → 92 完成 Phase 2 设计阶段 design-time lock；D-091 + D-092 共 2 个收尾 ADR）
- 解锁 D-088 / D-089 / D-090 中悬空的 7 处 "OQ-40 close" 引用 → ADR 网络一致性 ✅

### 5.2 Risks (6 项 + mitigations)

| Risk | severity | Mitigation |
|---|---|---|
| §2.1 user 显式条件下 user 长期不签 → β 永远不开 → α-now max-plan 限制下使用瓶颈 | **Medium** | §2.6(α) tripwire 6 个月 review；α-now max-plan quota 限制实际是 user 体感，可加 dashboard 提醒 |
| §2.3 checklist 中 Anthropic key / Vercel Pro 流程变 → checklist 项 obsolete | **Medium** | §2.6(β) tripwire；β-open 实施 session 必须 check 每 item 当前可执行性，发现变就 amend in-place |
| §2.4 prerequisite gate 中 cache hit rate < 50% → β 永远不开 → 但 cache 设计可能根本不对（D-088 §2.3 假设失败） | **High** | §2.6(γ) tripwire 触发 D-088 §2.3 cache 设计 review；α-now retro 数据 source 必须 第一周建立 |
| β open 后真实 monthly cost 超 D-091 §2.1 pessimistic $4,000 → 经济模型崩 | **High** | §2.6(ε) tripwire 触发 D-092 + D-090 + D-091 同期 amendment；β-open 实施 session 配 monthly cap setting (e.g., Anthropic API monthly $ ceiling) 兜底 |
| §2.3 Step 1 D-089 §2.4 切 BlobDataSource 时 corpus 升级未 ready → 阻塞 β open | **Low** | D-089 §2.4 已锁 BlobDataSource 是 optional；保留 FsDataSource on Pro 也 viable for multi-user (per-instance memory 副本) |
| OQ-40 close 后未来发现 trigger 条件设计不全 | **Low** | D-080 v1.1 §8 amendment pattern 允许 §2.1/§2.4 in-place 增 entry；§2.6 tripwire 覆盖大多数 case |

---

## 6. References

- `docs/decisions/D-083-phase2-direction.md` — OQ-40 Session 24 Turn 3 立项 source
- `docs/decisions/D-085-phase2-form.md` — §2.4 mode α/β trigger reference
- `docs/decisions/D-086-phase2-portability.md` — §2.4 β-ready criteria reference
- `docs/decisions/D-087-phase2-stack.md` — §2.3 Vercel Hobby α → Pro β reference
- `docs/decisions/D-088-phase2-ai-model.md` — §2.2 alias α → date β + §2.5(γ) tripwire reference
- `docs/decisions/D-089-phase2-data-source-contract.md` — §2.4 FsDataSource α → BlobDataSource β reference
- `docs/decisions/D-090-phase2-llm-cost-cap.md` — §2.4 cap mode env var `PHASE2_CAP_MODE` reference
- `docs/decisions/D-091-phase2-budget-and-tier.md` — §2.4 经济性 gate + §2.5(α/β) tripwire reference
- `docs/STATE.md` §4 — OQ-40 status 行 (Session 31 Turn 6 同 turn flip 到 CLOSED LOCKED)
- `docs/discussion/2026-05-18-session-24.md` — OQ-40 立项 Turn 3 历史
- `evidence/phase2_d091_poc_2026-05-19/budget_calc.md` §2.2 — β-ready real $ envelope reference

---

## 7. Sign-off

- **Writer**: main session (Session 31 Turn 5)
- **Reviewer #1 (path α terminal sign-off pattern, same as D-085~D-091)**: APPROVED — Session 31 Turn 6 user terminal sign-off path α 2026-05-19
- **Reviewer #2 (代码审 / audit subagent)**: N/A — 本 ADR 无 code 产物 / 无 LLM rewrite > 50% (Rule A n/a)；§2.3 checklist 是 future implementation 用 declarative 列表，无 LLM 输出依赖

---

**LOCKED final — Session 31 Turn 6 user terminal sign-off path α 2026-05-19 (OQ-40 同 turn flip OPEN → CLOSED LOCKED)**
