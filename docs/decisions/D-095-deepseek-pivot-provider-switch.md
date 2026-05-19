# D-095 — DeepSeek default provider + switchable Anthropic + stable-prefix cache reorder

| 字段 | 值 |
|---|---|
| 状态 | **LOCKED final** — Session 35 Turn 3 user terminal sign-off path α 2026-05-19 (`Q1-a，Q2-d，Q3-b，Q4-a。我希望别完全删除anthropic这种可能，变成可以切换的` 2026-05-19 + `请继续作业` 2026-05-19 propose-first ACK) |
| 锁定 session | `docs/discussion/2026-05-19-session-35.md` Turn 3 (4Q + ans + execute) |
| 类型 | **partial supersede** of D-088 §2.1 + §2.3 + §2.4；retain D-088 §2.2 (Hybrid form) + §2.5 (tripwire framework) + §2.6 (其他设计原则) |
| 颗粒度 | g2 mid — 锁 provider matrix + 切换机制 + cache 策略 + retry 范围；不锁具体 prompt template / per-mode SLA / provider-specific 调参细节（推 Step 5+ 实施 retro） |
| 前置 ADR | D-085（4 mode）/ D-087（Next.js + Vercel AI SDK）/ **D-088（被 partial supersede）** / D-090（cost cap envelope — 本 ADR §4.2 触发 amend）/ D-091（budget envelope — 本 ADR §4.3 触发 amend）/ D-094（γ tripwire wall amend pattern） |
| Supersede? | **partial** — 见状态行；amend log 在本 ADR §6 |

---

## 1. Context

**Step 4 entry**：Session 35 Turn 2 已完成 `@ai-sdk/anthropic` + Opus 4.7 + `cache_control:ephemeral` scaffold（3 source file + 8 test + Vercel preview deploy ✅）；HARD GATE 卡在 `ANTHROPIC_API_KEY` 设置。

**User pivot trigger** (Session 35 Turn 3 user message)：

> 明白了，我想使用 deepseek-v4-pro 你可以帮我修改一下吗

**Push-back 与澄清**（Claude Turn 3 response）：
1. 切 provider = D-NNN-worthy 设计变更，触 D-088 §2.1+§2.3+§2.4 LOCKED 锁 + D-090/D-091 cost envelope baseline；不能 propose-first 直改代码
2. `deepseek-v4-pro` 在 DeepSeek 官方 docs (`api-docs.deepseek.com`) **未作为 API model string 暴露**；当前可调 model = `deepseek-chat` (V3.2 base) / `deepseek-reasoner` (R1 base) — landing 页提 "DeepSeek-V4" 但无 API 实例化路径
3. 开 Round 1 4Q slow-pace per D-019 §3a + 项目 CLAUDE.md

**User answer** (Session 35 Turn 3)：

| Q | ans | 含义 |
|---|---|---|
| Q1 | **a** | 切换动机 = 成本（直接打掉 D-091 β-ready $1,800-4,000/月 envelope 大头） |
| Q2 | **d** | 混搭：chat→`deepseek-chat` + quiz→`deepseek-reasoner` + hover→`deepseek-chat` + retain `claude-opus-4-7` 作 switchable fallback（user 附注 `我希望别完全删除anthropic这种可能，变成可以切换的`） |
| Q3 | **b** | 重构 prompt 顺序：glossary 最前 + system 中 + user 末 → 保证 prefix stable 最大化 DeepSeek server-side automatic prefix cache hit |
| Q4 | **a** | 新立 D-095 supersede D-088 §2.1+§2.3+§2.4；retain §2.2+§2.5+§2.6 |

加 user 显式 hard requirement：**Anthropic 路径必须 retain 为可切换选项**（不可完全删除）→ 决定 §2.1 provider matrix 设计 = first-class switchable provider，不是 dead-letter fallback。

---

## 2. Decision

### 2.1 Provider matrix + 切换机制

**Lock**: Phase 2 AI 路径采用**双 provider switchable** 设计：

| Provider | Default? | 触发条件 | Model id matrix |
|---|---|---|---|
| **DeepSeek** | ✅ default | `process.env.LLM_PROVIDER` 未设 或 `=='deepseek'` | chat→`deepseek-chat`, quiz→`deepseek-reasoner`, hover→`deepseek-chat`, smoke→`deepseek-chat` |
| **Anthropic** | retained | `process.env.LLM_PROVIDER=='anthropic'` | 全部 role→`claude-opus-4-7`（D-088 §2.1 single-model pin **在 Anthropic 侧** 保留） |

**切换粒度**：server cold-start 读 env，整 process 生命周期内单 provider；不做 per-request switch（per-request 走 D-095 §2.5(ζ) tripwire 后再决定，scope 推 Phase 3 / β-open）。

**API surface**:
- `getActiveProvider(): ProviderKind` — 读 env 返 `'deepseek' | 'anthropic'`，default `'deepseek'`
- `getModel(role: ModelRole, provider?: ProviderKind)` — 给定 role + 可选 override provider 返回 LanguageModel 实例
- `ModelRole = 'chat' | 'quiz' | 'hover' | 'smoke'` (其中 'smoke' 是 hello-ai 类 health check 用)

**Anthropic 侧保留 D-088 §2.1 single-model pin**：当 `LLM_PROVIDER=='anthropic'` 时所有 4 role 全走 `claude-opus-4-7` — D-088 §2.1 原意（Anthropic-side no fallback / no per-role splitting）在 Anthropic 路径内**保留有效**；本 ADR §2.1 只是**在 Anthropic 之上**加一层 provider 切换，没有 supersede D-088 §2.1 的 Anthropic-internal 设计。

### 2.2 Cache 策略 — stable-prefix reorder (Q3=b)

**Lock**: 消息布局统一改为 3-block 顺序 `[corpus, instruction, user]`：

```
messages[0] = { role: 'system', content: <corpus block (glossary JSON, ~27K tokens stable across calls)>,
                providerOptions: { anthropic: { cacheControl: { type: 'ephemeral' } } } }
messages[1] = { role: 'system', content: <short system instruction, stable per session> }
messages[2] = { role: 'user',   content: <per-request user message (variable suffix)> }
```

**为什么这个顺序**：
- **DeepSeek 视角**：server-side automatic prefix caching — prefix（前缀）越长且越 stable，cache hit 越高。把最大且最稳的 corpus 放最前 → max prefix stability；user message 在末 → 唯一变动部分在 suffix。
- **Anthropic 视角**：`cache_control:{type:'ephemeral'}` 通过 `providerOptions.anthropic` namespace 显式标记 corpus block 为 ephemeral cache（D-088 §2.3 原意保留）；DeepSeek 忽略 `anthropic.*` namespace 字段（OpenAI-compatible API contract 不识别），不冲突。
- **统一 builder 同时 serve 两 provider** — `buildMessagesWithStablePrefix(corpus, instruction, userMsg)` 一个 fn 工作于两 provider。

**Anthropic ephemeral cache 1024-token minimum**：corpus block (full glossary JSON ~317 KB → ~8.8K-19.8K tokens by chars/4 vs 9 chars/token) ✅ well above 1024 threshold。

**DeepSeek prefix cache 行为**（per DeepSeek docs）：
- 64-token alignment block；prefix 命中按 block 数返报告
- `providerMetadata.deepseek.promptCacheHitTokens` + `promptCacheMissTokens` 是 token-level 计数（不是 block）
- 价位：cache hit 9× 折扣（从 input 全价 → ~$0.07/M tokens hit）

**Cache usage 读取统一接口**：
- `readCacheUsage(providerMetadata) -> CacheUsageReport`
- Returns `{ provider, cacheCreationInputTokens, cacheReadInputTokens, cacheMissInputTokens }`
- Anthropic 走 `cacheCreationInputTokens + cacheReadInputTokens` 字段；`cacheMissInputTokens` = null
- DeepSeek 走 `promptCacheHitTokens → cacheReadInputTokens` + `promptCacheMissTokens → cacheMissInputTokens`；`cacheCreationInputTokens` = null

### 2.3 Retry / fallback 范围

**Lock**: D-088 §2.4 `1-retry no-fallback` 语义 **在 active provider 内保留**；**不**做 inter-provider auto-fallback（即不会 DeepSeek 失败时自动切 Anthropic）。

**理由**:
- Inter-provider auto-fallback 让 cost / latency / 输出 quality 不可预测，混进 D-091 cost envelope 不利于实测 retro
- 切 provider 是 ops 决定（改 env redeploy），不是 runtime 决定
- 极端 case (DeepSeek 完全 down) 走 D-095 §2.5(ζ) tripwire user 手工切

**δ-all-tripwire 概念** (D-088 §2.4 原意) 保留：active provider 的 retry/fallback 失败 → tripwire alert → user 决定下一步（继续重试 / 等 / 切 provider / 等 SDK 修复）

### 2.4 SDK 依赖更新

**新增**:
- `@ai-sdk/deepseek` (latest stable) — package.json + pnpm-lock.yaml

**保留**:
- `@ai-sdk/anthropic@3.0.78` — Anthropic 路径仍需
- `ai@6.0.184` — Vercel AI SDK core

### 2.5 §2.5 tripwire — 新增 ζ + 既有 D-088 §2.5 框架延用

D-088 §2.5 5 trigger (α/β/γ/δ/ε) framework retained。新增：

- **(ζ) Provider availability / quality drift**：active provider (DeepSeek default) 出现 5xx / quota / latency 异常 > 30% sustained 24h → tripwire alert → user decide 切 `LLM_PROVIDER=anthropic` redeploy；同时启 cost envelope re-baseline (D-090/D-091 amend cascade)
- **(ε) Anthropic pricing 改价 / Opus 4.7 deprecation** 现状原 trigger 含义保留，**且增加 DeepSeek-side mirror**: DeepSeek `deepseek-chat` / `deepseek-reasoner` deprecation 或 model id 切换（V4 上线为可调 API model 时）同等触发

### 2.6 D-088 §2.2 form + §2.5 framework + §2.6 design principles 全保留

未触 superpose 的 §2.2 (mode-specific form: Quiz Explain / Study Chat / Term Hover) + §2.5 framework + §2.6 retained。这是 partial supersede 的关键：本 D-095 只动 provider+cache+retry-scope 3 段，不动其他。

---

## 3. Rejected alternatives

### Q1 rejected alternatives (animator: motivation = cost only)

- (b) 数据主权 — REJECTED：user 没提此考虑；β-open 之前不暴露任何用户数据，主权问题非紧迫
- (c) 特定能力 — REJECTED：未做 quality A/B test，无证据 DeepSeek 在中/日文输出 quality 超过 Opus 4.7；推 Step 5+ 实施 retro 实测
- (d) 临时探索仅 hello-ai — REJECTED：与 Q2=d 混搭模式 + Q4=a 立 D-095 完整覆盖不一致；user 选 Q4=a 表示要 ADR 级 lock

### Q2 rejected alternatives (model id + scope)

- (a) deepseek-chat 单一全用 — REJECTED：Q2=d 显式 混搭，quiz 推理 mode 用 `deepseek-reasoner` 更适配
- (b) deepseek-reasoner 全用 — REJECTED：reasoner 输出比 chat 慢且贵；Term Hover 类轻量场景过 over-engineered
- (c) deepseek-v4-pro 单一 — **REJECTED with explicit verification**：DeepSeek 官方 API docs (`api-docs.deepseek.com` Context7 query 2026-05-19) **未将 `deepseek-v4-pro` 暴露为 API model string**；当前 callable models = `deepseek-chat` / `deepseek-reasoner`。若 V4 后续上线 API → 走 §2.5(ε) DeepSeek-side mirror tripwire 切。

### Q3 rejected alternatives (cache 策略)

- (a) 延用 system+glossary 前置 pattern 删 cache_control 标记 — REJECTED：放弃 Anthropic-side 的显式 ephemeral cache 利益（即使 DeepSeek 是 default，user wants Anthropic 路径仍要 viable）；且 prompt 顺序未严格 stable-prefix 化 → DeepSeek hit rate 不优
- (c) 放弃 cache 设计简化 — REJECTED：Anthropic 路径用户切回时仍需 cache（cost）；DeepSeek 路径不要 cache 短期也 OK 但长期对全 book scope (~800K tokens) 会撞 cap → 留 cache 设计

### Q4 rejected alternatives (ADR 路径)

- (b) D-088 in-place v1.1 amend — REJECTED：动 §2.1 + §2.3 + §2.4 三段对 D-088 是 ~50% 内容重写，已超过 D-080 v1.1 §8 minor amend 边界（轻量数值/措辞调整为主）；走 supersede 更清晰
- (c) Sub-ADR narrow override — REJECTED：与 user 显式 "完整可切换" 要求不匹配；narrow override 让 Anthropic 是 first-class 不是 sub-case 的契合度不如 supersede 重新组织
- (d) 本场只换 smoke 推 Session 36 ADR — REJECTED：与 Q4=a "ADR-level lock 即立" 显式选择矛盾；且 propose-first 走到这步代码已经写完，回 Session 36 重写更费

---

## 4. Implications

### 4.1 Code refactor (this turn)

**Delete**:
- `apps/web/src/lib/ai/anthropic.ts` (~70 lines) — buildCachedSystemMessages + readAnthropicCacheUsage + ANTHROPIC_MODEL_ID 全部迁入 `provider.ts`
- `apps/web/src/lib/ai/__tests__/anthropic.test.ts` (~85 lines) — 8 tests 迁入 `__tests__/provider.test.ts` 重组扩展

**Create**:
- `apps/web/src/lib/ai/provider.ts` (~120 lines) — 4 export: `getActiveProvider`, `getModel`, `buildMessagesWithStablePrefix`, `readCacheUsage` + 类型 `ProviderKind` + `ModelRole` + `CacheUsageReport`
- `apps/web/src/lib/ai/__tests__/provider.test.ts` (~150 lines) — 覆盖 4 fn × (anthropic + deepseek + unknown branch + edge case)

**Modify**:
- `apps/web/src/app/api/hello-ai/route.ts` — import 改 provider.ts；smoke role；onFinish log 改用 unified `readCacheUsage`
- `apps/web/package.json` — `+@ai-sdk/deepseek` deps
- `apps/web/pnpm-lock.yaml` — resolves +N

### 4.2 D-090 cost cap envelope re-baseline (deferred to Session 36+ 实测 retro)

**Triggered** (per §1 Q1=a)：D-091 β-ready $220-1,800-4,000/月 envelope 基于 Anthropic Opus pricing；DeepSeek ~30-50× 便宜 → optimistic/expected/pessimistic 三档全部需重算。

**Defer 到第一周实测 retro** (PLAN.md §3 Step 5 mid-implementation retro 节点)：
- 数据需要：first-week DeepSeek call 量 × 真 cache hit rate × per-call 真 cost (从 `cache_audit_<date>.md` data point #1+ aggregate)
- 之后 amend D-090 §2.1 + D-091 §2.1 数字 via D-080 v1.1 §8 in-place pattern

**短期不动**：D-090 $5/$15/$30 daily + $5 per-query cap 现行数值保留（对 DeepSeek 来说 cap 极度松，不影响 functional）；Anthropic 路径切回时 cap 仍适用如 D-088 时代。

### 4.3 D-091 cost envelope amend (deferred 同 §4.2)

同 §4.2 — defer to Step 5 mid-retro。

### 4.4 PLAN.md §1 Step 4 row scope expansion (this turn)

Step 4 行 Output 列：从 `Vercel AI SDK + @ai-sdk/anthropic + Opus 4.7 pin + cache_control block` → `Vercel AI SDK + @ai-sdk/deepseek + @ai-sdk/anthropic + DeepSeek default (deepseek-chat/reasoner) + Anthropic switchable (claude-opus-4-7) + stable-prefix message order (D-095 §2.3) + unified readCacheUsage`。

Step 4 evidence 不增加新 file 大类，但 `step_04_audit.md` 需 amend 加 D-095 section。

### 4.5 STATE.md sync

- `已锁定决定数` 94 → **95**
- `最后更新` row Session 35 entry append D-095 lock
- `下一会话` row → HARD GATE 改为 DEEPSEEK_API_KEY (+ optional ANTHROPIC_API_KEY for switch test)

### 4.6 Session 35 log Turn 3 amend + Turn 4 plan

`docs/discussion/2026-05-19-session-35.md` Turn 3 写 DeepSeek pivot 4Q + ans + D-095 lock execute；Turn 4 plan = HARD GATE + LLM 2 call + cache_audit + commit + push（同 G3=a 路径）。

### 4.7 Evidence dir

`evidence/phase2/step_04_ai_sdk/` 既有 5 file 全 amend（不删 prior log, append D-095 sections + new vercel deploy log）：
- `tree_outline.md` — update file list (delete anthropic.ts, add provider.ts)
- `build_log.txt` — update with post-refactor build output
- `test_results.txt` — update with new test count post-refactor
- `vercel_deploy_dpl_9MniAsEGaGeMVKBwzLrRSzRS8zXA.log` — PRESERVED (D-095 pre-pivot Anthropic-only scaffold deploy baseline)
- `vercel_deploy_dpl_<new>.log` — NEW (D-095 post-pivot deploy)
- `step_04_audit.md` — amend with D-095 section + Q1/Q2/Q3/Q4 ans trace + provider matrix table

### 4.8 Anthropic ephemeral cache 仍是有效设计

D-088 §2.3 cache_control:ephemeral 块设计在 `LLM_PROVIDER=='anthropic'` 路径下 **完全保留有效**（per §2.2 `providerOptions.anthropic` namespace markup retained on first system message）。本 ADR 只是把这个块作为 "stable prefix 第 0 行" 同时也对 DeepSeek prefix cache 有正面贡献，不是把它废掉。

---

## 5. Out of scope（推 Session 36+ / Phase 3 backlog）

- Per-request `X-LLM-Provider` header override — server cold-start env 切换够用；per-request 推 §2.5(ζ) 实测后再加
- Inter-provider auto-fallback runtime middleware — §2.3 明锁 NOT in scope
- DeepSeek-specific prompt tuning（reasoner mode 的 reasoning tokens 显隐 / chat mode 的 system 字段大小敏感性等）— 推 Step 5+ mode wiring 实施 retro
- DeepSeek pricing 实测 → D-090 / D-091 envelope amend 数字 — Step 5 mid-retro 节点统一处理
- DeepSeek-V4 上线为 API callable model 时的 model id 切换 — §2.5(ε) DeepSeek-side mirror tripwire 覆盖
- Quality A/B test between providers — Phase 3 backlog / user-driven

---

## 6. Audit / Trace

- **Trigger**: user message `我想使用deepseek-v4-pro 你可以帮我修改一下吗` 2026-05-19 Session 35 Turn 3
- **Slow-pace 4Q + ans**: `c/c/b/a` for the cascade 4Q in Turn 2 (D-094) + `a/d/b/a` for the DeepSeek pivot 4Q in Turn 3
- **Explicit user hard requirement carry-over**: `我希望别完全删除anthropic这种可能，变成可以切换的` 2026-05-19 → §2.1 first-class switchable provider design
- **Verification step**: Context7 query `/websites/api-docs_deepseek` 2026-05-19 → 确认 `deepseek-v4-pro` 非 API model string；`deepseek-chat` + `deepseek-reasoner` 为现役 callable
- **Recommend chain ACK**: Session 35 Turn 3 `请继续作业` 2026-05-19 = propose-first execute green light
- **Lock turn**: Session 35 Turn 3 (本 ADR write + provider.ts refactor + PLAN.md §1 Step 4 row amend + STATE.md sync + evidence amend)
- **Cascade events to log**: `evidence/phase2/tripwire_log.md` 不立新 row（本 ADR 不是 tripwire fire 处理 — 是 user-initiated design change；row 仅记 §2.5 框架内 trigger fire）

---

## 7. Amend / Future supersede pattern

- 本 D-095 可后续 amend in-place（v1.1 / v1.2…）按 D-080 v1.1 §8 模式，不立新 D-NNN supersede chain
- 若 DeepSeek 路径 6 个月内出大问题（cost > Anthropic / quality issue / API instability）→ 走 §2.5(ζ) provider drift tripwire → 可能 supersede D-095 整体回 D-088-style 单 provider，但概率低
- D-090 / D-091 envelope amend = D-080 v1.1 §8 in-place numeric amend，不立新 D-NNN

---

**END D-095 v1.0 — 2026-05-19 LOCKED**
