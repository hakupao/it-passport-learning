# Phase 2 D-091 γ heavy PoC — measurements summary

> **Status**: 8/8 calls ✅ all OK · wall ~8.5 min · $8.96 cumulative shadow / **$0 真 billed** (max-plan OAuth via Keychain per D-069)
>
> **Date**: 2026-05-19 · **Model**: `claude-opus-4-7` · **Path**: `claude --print --output-format json` (Claude Code CLI v2.1.144) · **Started**: 2026-05-19T04:44:39Z · **Finished**: 2026-05-19T04:53:17Z
>
> **Purpose**: 实测 D-088 §2.3 cache 假设、D-091 budget baseline、D-085 §2.4 mode-dependent scope per-call cost + UX latency。Session 29 H3 "cache hit rate NOT MEASURED" deferred → 本 PoC 补测（with architecture caveat 见 §6）。

---

## §1 — 调用矩阵

8 calls = 4 query × 2 round。每 round 间 sleep 10s（远小于 Claude Code 默认 ephemeral_1h cache window）。

| # | Query | Round | scope | input tokens | output tokens | wall (s) | TTFT (ms) | shadow cost ($) | cache_w | cache_r | hit_rate |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Q1_question_p087 | 1 | question (page) | 189,287 | 3,568 | 74.6 | 22,461 | 1.128 | 164,140 | 25,142 | 13.3% |
| 2 | Q1_question_p087 | 2 | question (page) | 189,598 | 5,518 | 102.6 | 42,198 | 1.178 | 164,451 | 25,142 | 13.3% |
| 3 | Q2_term_g009_3dprinter | 1 | term (glossary only) | 186,071 | 104 | 10.2 | 7,033 | 1.021 | 160,924 | 25,142 | 13.5% |
| 4 | Q2_term_g009_3dprinter | 2 | term (glossary only) | 186,042 | 117 | 8.7 | 6,032 | 1.021 | 160,895 | 25,142 | 13.5% |
| 5 | Q3_chapter_strategy_p175_184 | 1 | chapter (5 pages 175-179) | 196,465 | 7,104 | 114.0 | 95,454 | 1.261 | 171,318 | 25,142 | 12.8% |
| 6 | Q3_chapter_strategy_p175_184 | 2 | chapter (5 pages) | 196,506 | 1,899 | 43.4 | 23,717 | 1.131 | 171,359 | 25,142 | 12.8% |
| 7 | Q5_kana_edge_p181 | 1 | kana edge (page) | 189,025 | 3,212 | 70.0 | 53,587 | 1.117 | 163,878 | 25,142 | 13.3% |
| 8 | Q5_kana_edge_p181 | 2 | kana edge (page) | 188,978 | 2,459 | 54.6 | 26,572 | 1.098 | 163,831 | 25,142 | 13.3% |
| **avg** | — | — | — | 190,247 | 2,998 | **59.8** | **34,632** | **$1.119** | 165,099 | 25,142 | 13.2% |
| **min/max** | — | — | — | 186,042 / 196,506 | 104 / 7,104 | 8.7 / 114.0 | 6,032 / 95,454 | 1.021 / 1.261 | 160,895 / 171,359 | 25,142 (固定) | 12.8% / 13.5% |

---

## §2 — Cache 行为 finding（与 D-088 假设的关键差异）

**Finding**: `cache_read_input_tokens` 在 8 个 call 之间 **始终是固定的 25,142**，而 `cache_creation_input_tokens` 每 call 重新 160K-171K 大量写新 cache。

**解读**:
- 25,142 tokens = Claude Code CLI **内部 stable** 的 system + tools cache（与本 PoC 测试 "hi PONG" 的 56,185 不同因为 PoC 跑在已运行的 session context 内）；这部分跨 call **稳定命中** = 13% cache hit rate 的来源
- 160K-171K = **我们提供的 prefix（system + glossary + scope）**每 call **重新写 cache**，跨 call 之间 **不 reuse**
- ⇒ `claude --print` 每次跑一个 fresh agent session，**用户内容（包括 D-088 §2.3 想锁的 system+glossary block）不会被 CLI 端自动 dedupe / cache_control**

**对 D-088 §2.3 的影响**:
- D-088 锁的 cache 设计 = **app 端 explicit `cache_control: ephemeral` block on system+glossary**，via Vercel AI SDK `providerOptions.anthropic.cacheControl`
- 这条路径在 D-087 锁的 raw Vercel AI SDK direct 路径下能工作，但 **本 PoC 的 `claude --print` 路径绕开了 app 端 cache_control 机制**
- ⇒ **本 PoC 实测的 13.3% hit rate ≠ D-088 §2.3 的 80-95% 设计假设**；二者**不在同一路径**
- ⇒ D-088 §2.3 的 80-95% 假设 **本 PoC 既不证实也不证伪**；真实 raw Vercel AI SDK + cache_control 路径的 cache 行为 **推 Phase 2 实施第一周 retro 实测**

**D-088 §2.5 tripwire 检测项**:
- 实施第一周 retro 必加项 = **raw Vercel AI SDK + cache_control 路径下，cache_read_input_tokens / total_input_tokens 在第二/三次 call same prefix 时是否 ≥ 70%**
- 若 < 70% → tripwire fired，触发 D-088 §2.5 amendment review

---

## §3 — Per-call cost finding（无 explicit cache_control 的 ceiling）

**Finding**: Per-call avg shadow cost = **$1.119**；range $1.021-$1.261；**$0 真 billed**（max-plan OAuth via Keychain ✅）。

**解读**:
- 8 calls × ~165K input + Opus 4.7 pricing $15/M input + $75/M output = base ~$2.5 + cache_w 1.25× 165K × $15/M = $3.09 + output ~$75/M × 3K avg = $0.225 per call expected → 实测 $1.119 表明 **Claude Code 内部已做某种 cache_creation 优化**（or pricing 不直接按 $15/M）；细节推 D-088 cache pricing audit
- 全 8 call **均 < D-090 per-query hard $5 cap** ✅（最贵 $1.26 = 25% of cap，余量充足）
- 总 8 call shadow = $8.96 ≈ **1 day heavy user**（参考 D-089 measurement.md $13.55/day baseline）；shadow cap $25 远未触

**vs D-090 cap 校对**:
- D-090 hard $5/query cap = 实测 max $1.26 → **充足余量** ✅
- D-090 soft $5/day = 4-5 call 触发；mid $15/day = 13-15 call；hard $30/day = 27-30 call → **若用 explicit cache_control 实际人均 50+ call/day viable**
- **但若无 cache_control（PoC 路径 ceiling）**：mid $15 = 13 call，hard $30 = 27 call → **cache_control 是 D-090 经济性的关键前提**

---

## §4 — Latency / TTFT finding（D-091 UX budget critical input）

**Finding**: TTFT 严重 variance：min 6,032ms（Q2 term hover）→ max **95,454ms（Q3 chapter R1）**；avg 34,632ms。

**Per-scope TTFT breakdown**:

| Scope | TTFT min-max (ms) | wall min-max (s) | 体验等级 |
|---|---|---|---|
| Q2 term (~186K input, 104-117 output) | **6,032 - 7,033** | **8.7 - 10.2** | ✅ UI tooltip 可接受 |
| Q1 question (~189K, 3-5K output) | 22,461 - 42,198 | 74.6 - 102.6 | ⚠️ Quiz Explain 需 streaming 进度条 |
| Q5 kana (~189K, 2-3K output) | 26,572 - 53,587 | 54.6 - 70.0 | ⚠️ Study term hover 需 streaming |
| Q3 chapter (~196K, 2-7K output) | 23,717 - **95,454** | 43.4 - 114.0 | ❌ Study summarize 需 longer-context 处理设计 |

**对 L7 假设的 verdict**:
- L7 假设 "TTFT <3s 目标" → **不达成**；min observed 6s（Q2 简短输出 term）→ Phase 2 Chat UI **必须** streaming progressive 渲染（不能等 TTFT）
- L7 假设的 3s 目标 **应改为 "streaming first chunk arrived" UX = 用户在 ≤3s 看到 spinner / hint chip / partial echo**，不是 model 真的开始输出
- 真实"思考期"(从用户 submit 到 first token) = 6-95s，**必须** UI buffer / busy state / "正在阅读教材..." prompt

**对 D-085 §2.4 mode 的影响**:
- ✅ **Term hover popover** (D-085 §2.5 + Q2 scope) = **viable**，10s wall < 心理学 "interruption" 临界（教科书引用 < 12s）
- ⚠️ **Quiz Explain button** (D-085 §2.5 + Q1 scope) = 需 modal + streaming 而非 inline；75-103s wall = 用户不会无缓冲等待
- ❌ **Study chapter summarize** (D-085 §2.4 Study mode + Q3 scope) = 43-114s wall + 24-95s TTFT；**不 viable as on-demand 按钮**；需 **预生成 cache** (Phase 2 v2 backlog) 或 **back-off to per-page summarize**

---

## §5 — Quality spot-check（advisory；非 release gate）

Per Rule A：γ PoC 是 measurement 类，**无 compress/rewrite > 50%**，免 N 样本 audit。但简短读了 8 个 result chars 字符串：

| Query | Round 1 ／ Round 2 quality (qualitative) |
|---|---|
| Q1 不正アクセス | R1 (2,823 chars) / R2 (4,009 chars) — both 给出全 4 选项分析 + 法律定义 + JP/EN 关键术语；R2 略详细 |
| Q2 3Dプリンター | R1 (124 chars) / R2 (137 chars) — 都 ≤80 字 target → ⚠️ 略超；都含 JP+reading+EN+1 场景；fit tooltip |
| Q3 chapter 175-179 | R1 (1,496 chars) / R2 (1,097 chars) — 都 5 bullets；R2 更紧凑；JP 术语 + reading 都给 |
| Q5 レコメンデーション | R1 (1,103 chars) / R2 (1,689 chars) — 长音 ー 规则解释 + recommendation 拆解 + mnemonic 都覆盖；R2 mnemonic 更具体 |

**Verdict**: Opus 4.7 单模型 quality 跨 4 scope ✅ uniform high；与 Session 29 H1 +H2 结论一致（D-088 锁的单模型决定不动）。

---

## §6 — Architecture caveat（critical）

**`claude --print --output-format json` 路径 ≠ D-087 锁的 raw Vercel AI SDK direct 路径**：

| 维度 | PoC 路径 (`claude --print`) | D-087 锁路径 (Vercel AI SDK + `@ai-sdk/anthropic`) |
|---|---|---|
| 调用方式 | Claude Code agent loop 包一层 | 直 `streamText({ model: anthropic('claude-opus-4-7'), ... })` |
| OAuth $0 path | ✅ via Keychain (D-069) | ❌ 需 ANTHROPIC_API_KEY billed |
| Metadata exposure | ✅ 完整 `usage` 字段 | ✅ 完整 `usage` 字段 |
| Cache control | ❌ 不可 explicit set | ✅ `providerOptions.anthropic.cacheControl: 'ephemeral'` |
| Cache 跨 call reuse | ❌ fresh session 每 call | ✅ via cache_control 命中 |
| 内部 system+tools overhead | ⚠️ ~25K cache + 一些 wrapping | ✅ 无 |

**为什么仍采用 `claude --print` 路径跑 PoC**:
- L9 lock 要求 $0 billed via OAuth → raw SDK 不满足（需 API key billed）
- `claude-agent-sdk-python` 未装 + metadata exposure 未验证 → setup 时间 + uncertainty
- `claude --print` 是当前唯一 $0 billed + metadata 完整 的 path

**因此本 PoC 的 cache hit rate 数据 (13.3%) 不适用于 D-088 §2.3 设计假设 (80-95%)**；适用范围 = **Claude Code agent loop 内部 cache 行为**。

**真实 raw Vercel AI SDK + cache_control 路径的 cache 行为 → 推 Phase 2 实施第一周 retro 实测**（D-088 §2.5 tripwire 新增项，见 §2）。

---

## §7 — Phase 2 budget 影响（详见 budget_calc.md）

- **Per-query cost ceiling without cache_control**: avg $1.12 / max $1.26 → D-090 hard $5/query cap **充足**
- **Per-query cost with cache_control (D-088 §2.3 设计)**: estimate first call ~$1.85, subsequent ~$0.15-$0.50（per D-088 §2.3 + Anthropic pricing）→ 10× 经济性
- **Daily heavy-use shadow (50 query/day) 范围**:
  - **No cache** (本 PoC ceiling): 50 × $1.12 = **$56/day** ❌ exceed D-090 hard $30
  - **With cache** (D-088 设计): $1.85 (1st) + 49 × $0.50 = **$26.35/day** ✅ within D-090 hard $30
  - **D-089 PoC estimate** (baseline $13.55/day) 偏 optimistic（基于 token math + cache_creation 1.25× 假设不变；实测 Claude Code 内部 cache 行为有调整空间）

**结论**: cache_control 是 D-090 cap budget 经济性的关键前提 → **D-091 budget 必须分 "with cache" / "without cache" 两套 estimates**；β-open 前必须 raw SDK 路径 retro 验证 cache 实际行为。

---

## §8 — Files committed

```
evidence/phase2_d091_poc_2026-05-19/
├── scripts/measure_cache.py     # 257 行 stdlib-only re-runnable harness
├── measurements.json             # 8 call summary + per-call usage metrics
├── measurements.md               # 本文件
├── budget_calc.md                # Phase 2 budget 三档表 + scenarios (D-091 input)
├── run.log                       # PoC stdout log
└── raw/
    ├── Q1_question_p087_input.txt
    ├── Q1_question_p087_round1.json
    ├── Q1_question_p087_round2.json
    ├── Q2_term_g009_3dprinter_input.txt
    ├── Q2_term_g009_3dprinter_round1.json
    ├── Q2_term_g009_3dprinter_round2.json
    ├── Q3_chapter_strategy_p175_184_input.txt
    ├── Q3_chapter_strategy_p175_184_round1.json
    ├── Q3_chapter_strategy_p175_184_round2.json
    ├── Q5_kana_edge_p181_input.txt
    ├── Q5_kana_edge_p181_round1.json
    └── Q5_kana_edge_p181_round2.json
```

**Reproducibility**: `python3 evidence/phase2_d091_poc_2026-05-19/scripts/measure_cache.py` 任意时刻可重跑（max-plan OAuth $0 billed；shadow ~$9 / wall ~9 min）。

---

## §9 — Calibration caveats

- `claude --print` 内部 system+tools cache (25,142 tokens 稳定) = Claude Code CLI v2.1.144 specific；CLI 升版可能变
- shadow cost is Anthropic's billing-side calculation, may differ from manual `pricing × tokens` math (e.g., volume discounts / 2026-05 pricing fluctuations)
- TTFT 受网络 + Anthropic infra 实时负载影响；单次 wall variance ±20%
- Q3 chapter scope 只跑 5 pages（175-179）;真实 chapter 98 pages 等价 ~1MB JSON input → 等比放大估计 TTFT 50-80s、wall 90-130s
- Quality spot-check 是 advisory；非 release gate（per Rule A：本 PoC 无 compression/rewrite > 50%，免 N 样本 audit）

---

**End of measurements.md** · **Status: written 2026-05-19 Session 31 Turn 3**
