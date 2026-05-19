# D-091 — Phase 2 实施 budget envelope + 工作流 Tier

| 字段 | 值 |
|---|---|
| 状态 | **LOCKED final** — Session 31 Turn 6 user terminal sign-off path α 2026-05-19 |
| 锁定 session | `docs/discussion/2026-05-19-session-31.md` |
| 类型 | Phase 2 step 5 lock (设计阶段最后一公里的 budget + ceremony 选档；与 D-092 一起收尾设计阶段) |
| 颗粒度 | g2 mid level（三档 budget scenarios + Tier 选档 + step 数估算 + cap 联动 + tripwire；不锁具体 per-stage budget breakdown / per-week velocity / specific evidence template diff vs Phase 1 → 推 Phase 2 实施 retro） |
| 前置 ADR | D-069 (Anthropic OAuth max-plan path $0 billed) / D-071 (Phase 1 三档 cap pattern) / D-085 (form + per-mode scope) / D-086 (web stack portability) / D-087 (Next.js + Vercel) / D-088 (Opus 4.7 + cache 设计) / D-089 (数据源 contract + β PoC token math) / D-090 (三档 cost cap + α/β 行为) |
| PoC 证据 | `evidence/phase2_d091_poc_2026-05-19/{measurements.md, measurements.json, budget_calc.md}` — γ heavy PoC 8 calls Opus 4.7 via `claude --print` D-069 OAuth $0 billed / wall ~8.5 min / per-call avg $1.12 shadow ceiling without cache_control |

---

## 1. Context

D-083~D-090 完成 Phase 2 step 1~4 设计锁。**剩余 Phase 2 step 5 = budget envelope + 工作流 Tier 选档**，与 D-092 一起作为 Phase 2 实施 gate 解锁前的最后两个 design-time 锁。

D-088 估 daily mix shadow ~$7.92/day（cost_table.md §3 原估，cache hit 80-95% 假设）→ D-089 β light PoC 校正 ~$13.55/day（cache block real 98,910 tokens；measurement.md §3）→ D-091 γ heavy PoC 8 calls 实测 ceiling $1.12 avg / $1.26 max per call（无 explicit `cache_control` 的 Claude Code agent loop 路径；架构 mismatch 见 measurements.md §6 → cache_control 真实行为推 Phase 2 实施第一周 retro 实测）。

**预算逻辑**:
- α-now path = max-plan OAuth via Keychain (D-069) → 用户 **真 billed = $0** monthly；shadow visible $150-450/月 only used for D-090 cap 可视化
- β-ready path = 真 ANTHROPIC_API_KEY billed → user 数 × 使用强度 决定真 monthly $；§2.1 三档 scenarios 给出 envelope

**Tier 逻辑**:
- Phase 1 走 Tier 3（多日 / high stakes / 真 LLM 烧钱风险）；evidence 全套 = PLAN + _progress + checkpoints + failures + retro + trace.jsonl + subagent_prompts + audit_matrix
- Phase 2 step 数估算 = 15 step / 3 weeks full-time（budget_calc.md §4.1）；处 Tier 2/3 边界；考虑 β 商业化 stake + 多 sub-system 跨度 → Tier 3 适配

---

## 2. Decision

### 2.1 Budget envelope — 三档 scenarios table（Q6=a）

**Lock**: 三档 scenarios table 同时区分 α-now / β-ready；不锁单一明数；amendment 走 §2.5 tripwire（per `evidence/phase2_d091_poc_2026-05-19/budget_calc.md` §3.3）。

| 档 | α-now monthly real $ | β-ready monthly real $ | 触发 §2.5 amendment 条件 |
|---|---|---|---|
| **optimistic** | $0 真 billed / ~$150 shadow | ~$220 真 (内测 2 user 中等使用) | 持平；无 amendment |
| **expected** | $0 真 billed / ~$300 shadow | ~$1,800 真 (5-8 user 中位) | 实测中位 ±50% drift → review |
| **pessimistic** | $0 真 billed / ~$450 shadow | ~$4,000 真 (heavy use / edge case) | D-088 §2.5(γ) + D-090 §2.5(β/γ) 一起触 → review |

**详解**:
- **α-now**: max-plan OAuth 路径全程 D-091 γ PoC 实测验证 ✅（8 calls $8.96 shadow / $0 真 billed）；shadow $150-450/月 范围 = §2.4 per-call $0.50-$1.50 × 10-30 call/day 量级
- **β-ready 真 billed driver**: per-call cost (with cache_control 目标 $0.16-$2.80 range，per budget_calc.md §1.2) × call 数 × 用户数；中位 5-8 user 每人 ~$8/day → 月 $200/user → 总 ~$1,800/月
- **Per-call cost ceiling** without cache_control（PoC 路径实测）= $1.12 avg / $1.26 max（measurements.md §1）；β-open 前必测 with-cache 行为，若 hit rate < 50% → expected 上限抬到 $3,000-3,500/月
- **Whole-book Chat 单 call ~$5.40** 临 D-090 per-query $5 cap 边界 → §2.4 per-query cap 直接阻挡 ✅ 已经 PoC 验证机制 work

### 2.2 工作流 Tier — Tier 3 全套 + Phase 1 carry-over（Q7=a）

**Lock**: Tier 3，与 Phase 1 一致；evidence template 全套继承 D-033 + Phase 1 D-077/D-079/D-080 模式 + Phase 2 specific additions。

**Evidence 全套清单**（Phase 2 实施前每项需就位）:

| Evidence 类型 | 继承 Phase 1 ✅ / Phase 2 specific 🆕 | 落点 |
|---|---|---|
| PLAN.md / sub-PLAN per step | ✅ inherit | `docs/discussion/<date>-session-<n>.md` + 实施期 PLAN |
| _progress.json | ✅ inherit | session log §进度表 + 实施期 `_progress.json` |
| checkpoints/ | ✅ inherit (Phase 1 D-079 模式) | `evidence/phase2/<run_id>/checkpoints/` |
| failures/ | ✅ inherit (Rule B) | `failures/phase2/<step>/<attempt>.md` |
| RETROSPECTIVE.md | ✅ inherit (Rule C) | Phase 2 收尾 `RETROSPECTIVE_phase2.md` |
| trace.jsonl | ✅ inherit | per session log + 实施期 dispatch trace |
| subagent_prompts/ | ✅ inherit (Rule D) | `evidence/phase2/<run_id>/subagent_prompts/` |
| audit_matrix.md | ✅ inherit | `evidence/phase2/<run_id>/audit_matrix.md` |
| **Cache hit rate audit (第一周 retro)** | 🆕 Phase 2 specific | `evidence/phase2/cache_audit_<date>.md` (D-088 §2.5 tripwire 验证 input) |
| **Lighthouse audit** | 🆕 Phase 2 specific | `evidence/phase2/lighthouse_<date>.md` (D-087 内部 implies 性能 ≥90) |
| **Vercel deploy log** | 🆕 Phase 2 specific | `evidence/phase2/vercel_deploy_<sha>.log` |
| **E2E test snapshot** (Playwright Chat happy path + cap 触发) | 🆕 Phase 2 specific | `evidence/phase2/e2e_<run>.json` |
| **TTFT real-world sample** (D-085 §2.4 mode latency 实测) | 🆕 Phase 2 specific | `evidence/phase2/ttft_<date>.md` |

**Tier 3 ceremony 要求 confirm**（per `~/.claude/templates/workflow-tier3.md`）:
- Rule A 抽检（> 50% 改写要 N 样本 audit）— Phase 2 主要是 UI/AI integration，少 LLM rewrite 类工作，但 cache audit + LLM response quality audit 仍适用
- Rule B 失败归档（任 attempt failure 落 `failures/`）— Phase 2 implementation 期适用
- Rule C 收尾 RETROSPECTIVE.md — Phase 2 收尾必写
- Rule D Writer ≠ Reviewer — Phase 2 code review 走 sub-agent dispatch（不在 main session 自审）

### 2.3 Phase 2 implementation step 数 + wall time estimate

**Lock**: **15 step / 3 weeks full-time wall**（per budget_calc.md §4.1 详细列表）。

汇总（详细见 budget_calc.md §4.1）:

| 模块 | step 数 | wall 估算 |
|---|---|---|
| Scaffold (Next.js + DataSource + manifest backfill) | 4 step | 4.5 day |
| AI 路径 (Vercel AI SDK + cache_control + 3 mode wiring) | 5 step | 5.5 day |
| UI & UX (Chat + Quiz Explain + Study term hover + Resume) | 4 step | 4 day |
| Cap + Retry + i18n + Lighthouse + E2E + deploy | 4 step | 2.5 day |
| **总计** | **15-17 step** | **~14.5-16.5 day** ≈ **3 week** |

**Tier 3 处 5-15 step 上沿/越界**；§2.2 锁的 Tier 3 选档 适配 step 数 + β 商业化 stake。

### 2.4 与 D-090 cap 联动 + α/β 经济性 gate

**Per-query cap (D-090 §2.1)**:
- $5 hard cap → whole-book Chat scope ~$5.40/call 临 cap 边界 → 实施时 **必须** with cache_control 才能 viable（cached whole-book ~$1.37 ✅）
- PoC 实测无 cache 路径 max $1.26/call → cap 当前 余量 4×；with cache 路径预期 max $2.80/call (chapter full 98 pages) → 余量 1.8×
- ⇒ cap 数值不动；β-open 前必须 cache_control retro 验证 hit rate ≥ 50%（详 §2.5）

**Daily cap (D-090 §2.1)**:
- §2.1 expected $1,800/month real β / 28 day = $64/day average / 5 user = $13/user/day → 触 D-090 mid $15 边界
- ⇒ D-090 cap 数值不动；β multi-user 商业化前需建付费模型 cover Anthropic + Vercel 成本（推 Phase 2 v2 / Phase 3 backlog）

### 2.5 Tripwire / amendment triggers

**5 triggers** → 任 1 触 = D-091 review session:

- **(α)** **PoC ceiling 实测 ±50% drift**：γ PoC ceiling $1.12 avg per call → Phase 2 实施第一周 retro 实测真实 with-cache avg；若 < $0.56 或 > $1.68 → review §2.1 三档数 (with cache target)
- **(β)** **Cache hit rate retro 实测 < 50%**：D-088 §2.3 设计 80-95%，本 D-091 §2.1 expected envelope 基于 80% 假设；若实测 < 50% → with-cache cost 上调 → 触 D-088 §2.5(δ) all-tripwire + D-090 §2.5(γ) baseline drift + D-091 §2.1 expected pessimistic 折叠
- **(γ)** **Step 数 / wall time 偏差 > 30%**：§2.3 lock 15 step / 3 week；若实测 > 20 step / > 4 week → §2.2 Tier 不变（Tier 3 已 cover），但 §2.3 estimate amend + 触发 Phase 2 mid-implementation retro
- **(δ)** **β user 数实际 > 10 / month**：§2.1 expected 假设 5-8 user 中位；若超 → cost projection 等比放大 → 触发付费模型 review（推 Phase 3 backlog）
- **(ε)** **Anthropic pricing 改价 / Opus 4.7 deprecation**：D-088 §2.5(α) tripwire 同期触发；D-091 §2.1 cost envelope 等比 amend

**Amendment 走 D-080 v1.1 §8 pattern**：minor 数值 amend in-place + log；major scope amend 走 sub-ADR 或 supersede。

---

## 3. Out of scope（推 Phase 2 实施 retro / Phase 3 backlog）

- Per-stage budget breakdown by week / sprint
- Per-week velocity tracking
- 付费模型 (subscription tier / per-call billing to end user)
- Anthropic API key rotation / multi-key load balance
- Cost telemetry 上报 (Sentry / DataDog / 自建 dashboard)
- Vercel team plan / multi-environment cost (β-future scale)
- Specific Phase 2 evidence template diff vs Phase 1（Tier 3 模板复用为主，diff 是 retro 任务）
- D-090 cap UI 具体文案 i18n 三语 string

---

## 4. Rejected alternatives

- **Q6 (b)** Single envelope range = 太 loose，β multi-user 数变化时无法做有意义的 amendment 决策
- **Q6 (c)** 三个分立明数 = commit 中位数过紧；β 真 user 数实际只有 2-3 时 expected $1,800 数变 noise；scenarios table 更弹性
- **Q6 (d)** Formula meta-lock = "$250/user/月" 公式 user 数不固定时计算结果发散；scenarios table 提供 anchor 更易讨论 amendment
- **Q7 (b)** Tier 2 = step 数 15 + β 商业化 stake + 多 sub-system + 真 ANTHROPIC_API_KEY 烧钱风险 不匹配 Tier 2 ceremony；evidence 薄会重蹈 Phase 1 Stage 5 stuck-leaf 类问题
- **Q7 (c)** Tier 2/3 hybrid = 切割点（"前 5 step vs 后 10 step"）容易 mismatch 实际开发节奏；统一 Tier 3 更可预期
- **Q7 (d)** Tier 3 with Phase 1 carry-over = 实际上 §2.2 已隐含 carry-over；(d) vs (a) 实质差异不大；为 lock 简洁选 (a)
- Tier 2/3 mixed-per-step = 复杂度高；step 间切 Tier ceremony 易遗漏

---

## 5. Consequences

### 5.1 Positive

- α-now 真 monthly cost = $0（max-plan OAuth）→ Phase 2 实施可立刻起跑，无需 ANTHROPIC_API_KEY 预算批 / Vercel Pro 升级 / 域名注册
- β-ready envelope $220-$4,000/月 给 future商业化 / 付费模型设计提供 anchor
- Tier 3 evidence 全套继承 Phase 1 → 模板 / 工具链 / 命名约定 0 学习成本 → implementation velocity 不被 ceremony 拖
- 三档 scenarios table 直接对应 D-090 三档 cap + D-088 §2.5(δ) tripwire → amendment 决策路径明确
- PoC `claude --print` 路径 ✅ 验证 α-now max-plan OAuth 工业级跑通 8 calls → Phase 2 实施期 dev loop 不需新 auth setup
- §2.2 evidence 清单含 cache_audit + Lighthouse + TTFT 三项 Phase 2 specific 类型 → §2.5 tripwire 数据 source 落实

### 5.2 Risks (5 项 + mitigations)

| Risk | severity | Mitigation |
|---|---|---|
| α→β 切换时 envelope 实测远超 pessimistic $4,000/月（multi-user 突然增长 / heavy edge case） | **High** | D-090 hard $30/day cap + per-query $5 cap 仍 work；§2.5(δ) tripwire 实施前 user 数 review；β-open 前付费模型 ready 是 D-092 §2.x 锁的 prerequisite |
| Cache hit rate Phase 2 实测 < 50% → with-cache cost 上调 50-100% → expected envelope 实际 $2,700-3,600 | **Medium** | §2.5(β) tripwire 第一周必测；早期发现可通过 cache block 设计调整 (e.g., 不缓存超大 chapter, 仅缓存 system+glossary stable prefix) |
| Phase 2 step 数 / wall time 实际 > 4 week → β 时间窗推延 | **Medium** | §2.5(γ) tripwire；Tier 3 evidence 中 _progress.json 周更新做早期发现；Phase 2 mid-implementation retro 调整 scope |
| Tier 3 ceremony overhead 拖累 implementation velocity（Phase 2 size 处 Tier 2 边界） | **Low** | Phase 1 ceremony 工具链已熟；继承复用为主，新增仅 cache_audit / Lighthouse / TTFT / E2E / Vercel deploy 5 类；增量成本 < 10% 总 wall |
| α-now shadow cost monitoring 失准 → user 体感不到 cost → β 切换准备不足 | **Low** | D-090 §2.6 cost accounting (Anthropic `usage` field per-call) + Phase 2 dashboard small widget；α-now silent log 但 dashboard 可见 |

---

## 6. References

- `docs/decisions/D-069-anthropic-via-agent-sdk.md` — OAuth $0 path（D-091 §2.1 α-now 基础）
- `docs/decisions/D-071-budget-cap-and-emergency-halt.md` — Phase 1 三档 cap pattern（D-090 复用 + D-091 §2.4 联动）
- `docs/decisions/D-088-phase2-ai-model.md` — Opus 4.7 + cache（§2.3 cache 设计；D-091 §2.5(β) tripwire 实测验证 source）
- `docs/decisions/D-089-phase2-data-source-contract.md` — DataSource 抽象 + β PoC token math baseline $13.55/day
- `docs/decisions/D-090-phase2-llm-cost-cap.md` — 三档 cap + α/β 切换（D-091 §2.4 联动）
- `evidence/phase2_d091_poc_2026-05-19/measurements.md` — γ heavy PoC 9 sections + architecture caveat (D-091 §2.1 input)
- `evidence/phase2_d091_poc_2026-05-19/budget_calc.md` — Phase 2 budget 三档表 + Tier 评估 (D-091 §2.1+§2.2+§2.3 详细 source)
- `evidence/phase2_d089_poc_2026-05-19/measurement.md` — β light PoC daily mix $13.55/day baseline
- `~/.claude/templates/workflow-tier3.md` — Tier 3 ceremony reference
- `RETROSPECTIVE.md` (Phase 1) — Tier 3 模板继承的 ground truth

---

## 7. Sign-off

- **Writer**: main session (Session 31 Turn 5)
- **Reviewer #1 (path α terminal sign-off pattern, same as D-085~D-090)**: APPROVED — Session 31 Turn 6 user terminal sign-off path α 2026-05-19
- **Reviewer #2 (代码审 / audit subagent)**: N/A — 本 ADR 无 code 产物 / 无 LLM rewrite > 50% (Rule A n/a)；PoC measurement.md + budget_calc.md 是数据 / 估算类，质量 spot-check 已落 measurements.md §5

---

**LOCKED final — Session 31 Turn 6 user terminal sign-off path α 2026-05-19**
