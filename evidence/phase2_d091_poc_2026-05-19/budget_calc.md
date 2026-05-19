# Phase 2 budget_calc — D-091 input 三档预算 + 工作流 Tier 评估

> **Status**: 草稿 written 2026-05-19 Session 31 Turn 3，feed into D-091 ADR draft Turn 5
>
> **Inputs**:
> - `measurements.md` §3 + §7（本 PoC ceiling）
> - `evidence/phase2_d089_poc_2026-05-19/measurement.md` §3（D-089 token math baseline $13.55/day with cache）
> - `evidence/phase2_d088_poc_2026-05-19/cost_table.md`（Anthropic 2026-05 pricing baseline）
> - D-088 §2.3 cache 设计（system + glossary ephemeral cache_control block）
> - D-090 三档 cap（$5/$15/$30 daily soft/mid/hard + per-query $5）
> - D-087 stack（Vercel Hobby α free / Pro β $20/mo + domain ~$15/yr）
>
> **Caveat**: γ PoC 实测 cache hit rate 13.3% 走 Claude Code agent loop 路径，**不适用于** D-088 §2.3 设计假设 80-95%（架构 mismatch；详见 measurements.md §6）。budget 给 **两套 estimates**（with cache / without cache）。

---

## §1 — Per-call cost matrix（按 D-085 §2.4 mode-dependent scope）

### §1.1 No-cache ceiling（本 PoC 直接实测；保守估计）

| Scope (D-085 §2.4) | input tokens | output avg | cost per call ($) | 数据源 |
|---|---|---|---|---|
| **term hover** (glossary only) | 186K | 110 | **$1.02** | PoC Q2 R1/R2 avg |
| **question Quiz Explain** (page + glossary) | 189K | 4,500 | **$1.15** | PoC Q1 R1/R2 avg |
| **kana edge / Study term hover** (page + glossary) | 189K | 2,800 | **$1.11** | PoC Q5 R1/R2 avg |
| **chapter Study (5 pages)** | 196K | 4,500 | **$1.20** | PoC Q3 R1/R2 avg |
| **chapter Study (full 98 pages, 估算)** | ~340K* | ~6,000 | **~$2.10** | 等比放大 196K→340K |
| **whole-book Chat** (798K + glossary) | ~896K | ~5,000 | **~$5.40** | 等比放大；接近 D-090 per-query $5 边界 |

\* 全 98-page chapter = 146K tokens (D-089 measurement.md §3) + glossary 98K + system 0.5K + query 1K ≈ 245K real；本估算偏保守。

### §1.2 With-cache target（D-088 §2.3 设计；推 Phase 2 实施第一周 retro 验证）

假设 cache block = system + glossary ~98K，cache hit 80% within session（D-088 §2.3 lock）。

**Anthropic 2026-05 Opus 4.7 pricing**: input $15/M / output $75/M / cache_write 1.25× = $18.75/M / cache_read 0.1× = $1.50/M。

| Scope | first call cost ($) | subsequent call cost ($) | 数据源 |
|---|---|---|---|
| **term hover** (98K cached + tiny var) | 98K × $18.75/M + 0.5K × $15/M + 0.1K × $75/M = **$1.85** | 98K × $1.50/M + 0.5K × $15/M + 0.1K × $75/M = **$0.16** | D-088 §2.3 + cost_table.md |
| **question Quiz Explain** (cached + 13K page + 4.5K out) | $1.85 + 13K × $15/M + 4.5K × $75/M = **$2.38** | $0.16 + 13K × $15/M + 4.5K × $75/M = **$0.69** | 同上 |
| **kana edge** (cached + 13K page + 3K out) | $1.85 + $0.20 + $0.23 = **$2.28** | $0.16 + $0.20 + $0.23 = **$0.59** | 同上 |
| **chapter Study (5 pages)** | $1.85 + 60K × $15/M + 5K × $75/M = **$3.13** | $0.16 + $0.90 + $0.38 = **$1.44** | 同上 |
| **chapter Study (full 98 pages)** | $1.85 + 146K × $15/M + 6K × $75/M = **$4.49** | $0.16 + $2.19 + $0.45 = **$2.80** | 接近 per-query $5 cap |
| **whole-book Chat** (798K + glossary) | $1.85 + 700K × $15/M + 5K × $75/M = **$12.85** ⚠️ over $5 cap | $0.16 + $10.50 + $0.38 = **$11.04** ⚠️ | D-090 §2.1 阻挡 ✅ |

**关键洞察**:
- **Whole-book Chat 单 call > $5 / per-query cap** → D-090 §2.1 per-query cap 直接阻挡 ✅；强制用户走 chapter 或 page scope
- **Cache hit rate 假设需 Phase 2 retro 实测**；若实测 < 50% → first/subsequent 差距收窄 → 经济性 ↓ → 触 D-088 §2.5 tripwire 重评

---

## §2 — Daily mix scenarios（β-ready multi-user estimates）

### §2.1 α-now single-user / max-plan OAuth（$0 真 billed）

shadow only，no real 美元 spend；用于 D-090 cap 触发监控 + dashboard 显示。

| 使用 pattern | per-call avg ($) | calls/day | shadow daily ($) | D-090 cap 触发 |
|---|---|---|---|---|
| **轻** = 5 term hover + 2 Quiz Explain + 1 Study page | $0.42 | 8 | **$3.36** | 未触 soft $5 |
| **中** = 10 term + 5 Quiz + 3 Study | $0.45 | 18 | **$8.10** | 触 soft $5，warn |
| **重** = 15 term + 8 Quiz + 5 Study + 1 chapter | $0.51 | 29 | **$14.79** | 触 mid $15 边界 |
| **超重** = 30 term + 15 Quiz + 10 Study + 3 chapter | $0.58 | 58 | **$33.64** ❌ | 触 hard $30，自动 halt |

注: α-now 实际真 billed = $0（OAuth max-plan）；上面 shadow 只用于 D-090 cap 监控可视化（per D-090 §2.2 silent log）。

### §2.2 β-ready 真 API key billed（D-088 §2.5(γ) tripwire 切换后）

real $ billed；D-090 §2.3 graduated UI cap 启用。

| 使用 pattern | daily $ real billed | D-090 cap 行为 |
|---|---|---|
| 轻 (per §2.1) | $3.36 / day | ✅ 无 UI 干扰 |
| 中 | $8.10 / day | ✅ 无 UI 干扰 |
| 重 | $14.79 / day | ⚠️ 红色 inline 横幅 ($14.79 > $5 soft) |
| 超重 | $33.64 / day | ❌ halt + banner; user 须等到 JST 00:00 reset |

**Per-month projection**（β multi-user 8 用户 中等使用 28 天 = 224 user-days × $8.10）= **$1,814.40/month** 真 billed。

**单用户 月 ceiling**（D-090 hard $30/day × 30 天）= $900/month/user 真 billed（极端假设）。

---

## §3 — Phase 2 implementation 总预算估算

### §3.1 Α-now path（user single + max-plan OAuth + Vercel Hobby）

| Item | 估算 | 备注 |
|---|---|---|
| Anthropic API real billed | **$0** | max-plan OAuth ✅ |
| Anthropic shadow visible | ~$5-15/day × 30 day = **$150-450** | dashboard only，不真扣 |
| Vercel Hobby hosting | **$0** | free tier |
| Domain (no custom domain α) | **$0** | use `*.vercel.app` |
| Implementation labor (Claude Code OAuth + max-plan time) | **$0** | inherited from Phase 1 D-069 path |
| 第三方 dependency cost | **$0** | npm OSS only |
| **总计 (α-now)** | **$0 真 billed** | |

### §3.2 Β-ready path（多 user + real ANTHROPIC_API_KEY + Vercel Pro + 域名）

| Item | 估算 | 备注 |
|---|---|---|
| Anthropic API real billed | **$200-2,000/month** | 取决 user 数 × 使用 pattern；§2.2 单 user $8/day × 8 user × 28 day = ~$1,800/月 中位 |
| Vercel Pro hosting | **$20/month** | D-087 §2.3 锁 |
| Custom domain | **$15/year ≈ $1.25/month** | 估 .com via Vercel registrar |
| SSL | **$0** | Vercel auto |
| Real APP DEV labor | **$0** | Claude Code dev path 继承 |
| Monitoring / Sentry / log (optional) | **$0-26/month** | Sentry team plan if used |
| **总计 (β-ready)** | **$220-2,050/month** 真 billed | 主要 driver = Anthropic API |

### §3.3 三档 budget envelope（D-091 lock 候选数）

| 档 | α-now monthly real $ | β-ready monthly real $ | 触发 D-091 amendment |
|---|---|---|---|
| **optimistic** (single user 轻使用 / β 内测 2 user) | $0 / ~$220 | $0 / ~$220 | 持平 |
| **expected** (single user 中使用 / β 5-8 user 中位) | $0 / ~$1,800 | shadow $250-450 | mid 大致命中 |
| **pessimistic** (heavy use / β 用户增长 + edge case 烧钱) | $0 / ~$4,000 | shadow $450+ | D-088 §2.5(γ) + D-090 §2.5(β,γ) tripwire 一起触 |

**结论 (D-091 §2.1 候选数)**:
- **Phase 2 α-now 总预算 = $0 真 billed monthly + $150-450/月 shadow visible**
- **Phase 2 β-ready 总预算 envelope = $220-4,000/月 真 billed**（视用户数 + 使用强度；中位 ~$1,800/月）
- **触发 β open 经济性 gate**: 用户付费 ≥ ~$1,800 / 月 cover Anthropic + Vercel + 域名 → β-ready 商业化前需建付费模型（推 Phase 2 v2 / Phase 3 backlog）

---

## §4 — 工作流 Tier 评估（D-091 §2.2 input）

### §4.1 Phase 2 实施 step 数估算

| 实施 step | 内容 | 估算 |
|---|---|---|
| 1 | Next.js 15 scaffold + TS strict + Vercel deploy hello-world (D-087) | 0.5 day |
| 2 | `DataSource` interface + `FsDataSource` adapter (D-089 §2.1) | 1 day |
| 3 | `scripts/build_index_v2.py` backfill v1.0.3 → v1.0.4 (D-089 §2.2) | 1 day |
| 4 | Per-scope `assembleQuestion/Chapter/WholeBook/TermHover` (D-089 §2.3) | 2 day |
| 5 | Vercel AI SDK `streamText` + Anthropic provider + `cache_control` block (D-087 §2.5 + D-088 §2.3) | 1 day |
| 6 | `useChat` client + 3 top tab (Study / Quiz / Chat) (D-085 §2.3) | 2 day |
| 7 | Mode-dependent scope wiring (D-085 §2.4) | 1.5 day |
| 8 | Quiz Explain button + Study term hover popover (D-085 §2.5) | 1 day |
| 9 | Resume last mode (D-085 §2.2) | 0.5 day |
| 10 | D-090 cap monitor (silent α / graduated β + env var `PHASE2_CAP_MODE`) | 1 day |
| 11 | Error retry (D-088 §2.4) + 用户 "AI 暂时不可用" toast | 0.5 day |
| 12 | i18n / 字体 / responsive (mobile-ready per D-086) | 1 day |
| 13 | Lighthouse audit + 性能 ≥ 90 (D-087 内部 implies) | 0.5 day |
| 14 | E2E 测试 (Playwright Chat happy path + cap 触发 path) | 1 day |
| 15 | Vercel preview deploy + Anthropic real-API smoke test | 0.5 day |
| 16 | Α-launch / docs / README | 0.5 day |
| **总计** | — | **14.5 day** ≈ **15 step** ≈ **3 week** wall full-time |

### §4.2 Tier 推荐

| Tier | step 数 / 时长 | evidence 强度 | 候选 |
|---|---|---|---|
| Tier 1 | < 5 step / < 1h | minimal | ❌ Phase 2 远超 |
| Tier 2 | 5-15 step / 半-1 day | PLAN.md + _progress.json + checkpoints + failures + RETRO | ⚠️ Phase 2 步数恰处边界（15）|
| Tier 3 | > 15 step / 多日 / high stakes | Tier 2 + trace.jsonl + subagent_prompts + audit_matrix | ✅ Phase 2 size 匹配 + Phase 2 stake (β 商业化路径 / 真 API 钱) 适配 |

**D-091 §2.2 推荐: Tier 3**（理由：14.5 day × 多 sub-system 跨度 + β 商业化 stake + D-088/D-089/D-090 三 ADR 已构成 Tier 3 evidence 基础）。

---

## §5 — 输入 D-091 ADR 候选数 summary

| Field | 候选数 | 数据源 |
|---|---|---|
| α-now monthly real cost | **$0** | §3.1 |
| α-now monthly shadow visible | $150-450 | §3.1 + D-089 baseline |
| β-ready monthly real cost envelope | **$220-4,000**（中位 ~$1,800）| §3.2 |
| Per-query ceiling no cache | **$1.26 max / $1.12 avg** | PoC Q3 R1 + avg |
| Per-query target with cache | **$0.16-$2.80** range | §1.2 |
| TTFT viable range | term ✅ 6-7s / Quiz ⚠️ 22-42s / Study ⚠️ 27-54s / chapter ❌ 24-95s | §1.1 measurements |
| Phase 2 step 数 | **15** | §4.1 |
| Phase 2 wall time | **3 weeks full-time** | §4.1 |
| Tier 推荐 | **Tier 3** | §4.2 |
| Evidence path | Tier 3 template (D-033) + 继承 Phase 1 D-077/D-079/D-080 模式 | — |

---

## §6 — Calibration caveats

- §1.2 with-cache estimates 基于 D-088 §2.3 80% cache hit 假设；**未实测**；Phase 2 实施第一周 retro 必测 → D-088 §2.5 tripwire 新增项
- §2 daily mix 用户行为假设 = 教育 app 教科书引用经验（"中等使用" 8-18 call/day）；本项目首次部署，无 prior data
- §3.2 β-ready monthly real $ 主要 driver = 真 user 数 × 使用强度；当前 Phase 2 设计阶段无 user 数据，envelope wide
- §4.1 step 数估算 = 经验估，单 dev (Claude Code OAuth) 走 D-087/D-088/D-089/D-090 锁后 path；如 stack 切换 (D-087 amendment) 估算翻倍
- shadow ↔ real $ 不能简单换算（max-plan flat $200/月 摊到任意 shadow 量）

---

**End of budget_calc.md** · feed into D-091 ADR draft Session 31 Turn 5
