# D-098 — whole-book scope payload shrink (drop pages, retain chapters + glossary)

| 字段 | 值 |
|---|---|
| 状态 | **LOCKED final** — Session 37 Turn batch E pre-flight 2026-05-20 (4Q ans `B/Modify/锁D-098/Yes原计划` + Recommended blanket) |
| 锁定 session | `docs/discussion/2026-05-20-session-37.md` Turn N (B-fix discovery + lock) |
| 类型 | **Amend D-085 (chat-mode scope semantics) + D-089 §2.3 (assembleWholeBook payload contract)** |
| 颗粒度 | g1 narrow — 仅锁 `whole-book` scope payload shape；其他 3 scope (question / chapter / term-hover) 不动 |
| 前置 ADR | D-085 (chat-mode 4-scope map) / D-088 §2.1+§2.3 (model + cache layout) / D-089 §2.3 (assembleScope fns) / D-095 §2.1 (DeepSeek default) |
| Supersede? | **NO** — amend only；assembleWholeBook fn 实现替换但 fn signature + scope kind name 不变 |

---

## 1. Context

**Trigger**: Session 37 Step 5 Batch E pre-flight 检测 — DeepSeek 64K context vs assembleWholeBook 实测 payload size 物理冲突。

**实测发现序列** (Session 37 batch E entry):

1. Step 5 4Q (Session 37) Q1=a 锁 scope=whole-book only，Q2=a stateless 单轮 SSE，Q3=a curl-only smoke，Q4=a N≥3 retro 轻
2. Batch A-C green: chat.ts + route.ts + 21 new vitest cases (cumulative 79/79 pass) + lint + build + tsc strict
3. Batch D done: DEEPSEEK_API_KEY 加 prod env (经空值 placeholder 误操作 + 3-step rollback + user 改本地 .env.local 后 re-add 成功) + preview deploy READY
4. **Batch E pre-flight**: 真 cost-conservative 习惯触发本地 token 测量 (避免 prod deploy + 3 wasted 真 call)
5. 本地测量结果 (Session 37 `node -e ...`):
   - `_fixtures/v1.0.3/` raw = 3.04 MB (554 pages 2.61 MB + index 114 KB + glossary 318 KB)
   - assembleWholeBook contextBlock pretty-print × 1.27 ≈ **3.86 MB chars**
   - chars/4 conservative token estimate = **964K tokens**
   - chars/9 CJK-measured token estimate = **429K tokens** (per D-089 §2.3 measurement.md ~9 chars/token CJK)
   - **vs DeepSeek 64K**: 6.5× over (chars/9) / 14.7× over (chars/4)
   - **vs Anthropic 200K**: 2.1× over
   - **vs Anthropic 1M ctx**: 0.43× ✓ (fits only on 1M-tier Opus 4.7)

**根因**: D-089 §2.3 assembleWholeBook 实现注释明确写 "Expected token range: ~800K (fits Opus 4.7 1M ctx)"，是为 Opus 4.7 1M 设计；D-095 (Session 35) 把 chat 模式 default provider 切到 DeepSeek (64K ctx) 时**未审视 assembleWholeBook 兼容性**。属于 D-095 partial-supersede D-088 §2.1+§2.3 时的 scope-aware completeness oversight；Step 3 设计 + Step 4 hello-ai 用 glossary-only corpus 都没有暴露 (hello-ai 不调 assembleWholeBook)；Step 5 第一次拼 assembleWholeBook + DeepSeek 即穿透。

**D-019 §3 "consult authoritative docs — do not rely on memory alone" 违反序列** (从 D-097 §1 lesson 同根但不同位):
- D-097 §1 lesson: D-096 §2.3 locked "Vercel Password Protection Hobby tier 也有" 未 docs 验证
- D-098 §1 lesson: D-095 锁定 chat → DeepSeek default 时未 docs 验证 DeepSeek 64K context limit 与 D-089 §2.3 assembleWholeBook ~800K estimate 的物理兼容性

**User constraint** (Session 37 4Q response):
- Q1=B 瘦 whole-book = 保 D-095 DeepSeek default + Module B 后续 step 不沛费的 cost-conscious 路径
- Q2=Modify (single-track) = 不双轨避免未来又 mismatch
- Q3=锁 ADR = 跨 step 设计决定能召回理由
- Q4=Yes 原 retro 计划不变 = 3 真 call cache hit retro 仍 deliver 不升 ceremony

---

## 2. Decision

### 2.1 assembleWholeBook 新 payload contract

```ts
// BEFORE (D-089 §2.3 original; deprecated this turn):
{
  scope: "whole-book",
  cert_id, run_id,
  totals,
  pages,    // ← Page[] = 554 entries, ~3 MB → 429K CJK tokens
}

// AFTER (D-098 §2.1 lean; effective Step 5 onwards):
{
  scope: "whole-book",
  cert_id, run_id,
  totals,
  chapters,         // ChapterRef[] = 16 entries, ~2 KB
  glossary_entries, // GlossaryEntry[] = 908 entries, ~318 KB (same as Step 4 hello-ai corpus)
}
```

### 2.2 Token envelope after lean (predicted)

- chapters: 16 entries × ~150 bytes = ~2.4 KB → ~300 tokens (chars/9)
- glossary_entries: 908 entries = ~318 KB → ~36K tokens (chars/9; Step 4 actual measured 57,993 input tokens including the full glossary + small instruction wrapper)
- index meta + totals + JSON pretty overhead = ~1 KB → ~120 tokens
- **Total ~58-60K tokens** (匹配 Step 4 hello-ai 实测 57,993，因为 lean 主体即 glossary 同 hello-ai；chapters list 新增 +300 tokens 净增可忽略)
- **DeepSeek 64K margin**: ~4-6K tokens for system instruction + user message + output → 边缘可用，需要 sub-step 留 calibration TODO

### 2.3 Step 5 retro 仍按 Q4=a 跑 (per 4Q)

- Step 5 close gate 不变：N≥3 真 LLM call (call #1 cache creation / call #2 cache read / call #3 cache read confirm)
- cache_audit data point #2/#3/#4 + chars/N calibration recompute (chars/4 → chars/? from N=3 actual input_tokens) + tripwire_log row #2 (Module B Step 5 wall actual + cache hit baseline ratify)
- D-091 §2.5(β) cache hit rate tripwire 50% threshold check 仍 active

### 2.4 D-085 amendment (D-098 §2.4)

D-085 chat-mode 4-scope map 保留，但补充语义：

| Scope | D-085 原意 | D-098 amend |
|---|---|---|
| `whole-book` | "all 554 pages full corpus" α-now | **α-now = lean (chapters + glossary)**; full-pages corpus mode deferred Phase 3+ β 阶段或当切换到 1M-ctx 模型时 |
| `chapter` | full pages of 1 chapter | unchanged (Step 7+ wires; ~50-150K tokens range per D-089) |
| `question` | 1 page + entity pin | unchanged |
| `term-hover` | 1 glossary entry | unchanged |

### 2.5 D-089 §2.3 amendment (D-098 §2.5)

`assembleWholeBook` 原 D-089 §2.3 "Expected token range: ~800K (fits Opus 4.7 1M ctx)" 注释更新为：
- 新："Expected token range: ~58-60K (lean per D-098 §2.1; fits DeepSeek 64K + Anthropic standard 200K + 1M)"
- 旧 800K full-corpus 形态 reserved 作 Phase 3+ β 阶段 reactivation 点 (`assembleWholeBookFull` 可能在 1M model 选项明确后新增双轨；D-098 §3 rejected alt B 当时再评估)

### 2.6 Cache prefix invariant 仍保留 (D-088 §2.3)

Lean payload 仍是 D-088 §2.3 stable-prefix 的 corpus block：
- 同一 user 多次提问 → contextBlock 100% 字节相同 (chapters + glossary 单一 source from FsDataSource singleton per D-089 §2.1) → DeepSeek server-side prefix cache 99%+ hit 假设保留 (per Step 4 baseline 99.98%)
- Anthropic ephemeral block cache 设计 (providerOptions.anthropic.cacheControl) 仍生效

---

## 3. Rejected alternatives

| Alt | 方案 | 拒因 |
|---|---|---|
| **A** 换 Anthropic 1M | prod LLM_PROVIDER=anthropic + ANTHROPIC_API_KEY add + `claude-opus-4-7` 1M tier | (1) D-095 §2.1 DeepSeek default 是 Session 35 user 主动选择 (cost-conscious + V3 已够强)；(2) Anthropic 1M tier 是否 honored 不确定 (model string `claude-opus-4-7` w/o `[1m]` suffix 行为待 docs 验证)；(3) Step 4 cost baseline ~$0.017/call vs Anthropic 1.7M tokens × $3/M input + cache = ~$1.92/call = **×113 cost 增长**；(4) 违 user feedback_quality_over_cost.md 反 (本场用户明确 Q1=B 即拒 A) |
| **B** Modify assembleWholeBook (LOCKED) | 单轨改 fn 内部，签名不动 | (a) Q2=Modify Recommended user blanket ACK; (b) 简单；(c) 避免双轨 mismatch；(d) Phase 3+ 需要 full-corpus 时再分 fn 不晚 |
| **C** Hybrid scope→provider routing | provider.ts 加 tokenEstimate-based router；< 60K → DeepSeek / ≥ 60K → Anthropic | (1) 需要双 key 配 (Anthropic + DeepSeek)；(2) 路由 logic + 双 provider 单 step retro 数据点变多变量；(3) D-095 §2.1 default 单一 provider 设计意图被绕；(4) over-engineering for α-now |
| **D** Halt Step 5 redesign | 不动代码，仅锁 D-098，推 Step 5 实施到 Session 38+ | 浪费 Batch A-D 已成代码 (chat.ts + route.ts + 21 tests + preview deploy READY)；只是 assembleWholeBook 小改即可解锁 |
| **E** 双轨 assembleWholeBookLean + 保留 full | 新加 lean 函数 + Step 5 call lean / 不动 full | Q2=Modify Recommended 拒之；表达意图但 cost 双码路径 + 未来 confusion；single-track 更 honest |
| **F** Chapter abstracts pre-compute | 离线生成每 chapter ~1K token abstract 入 corpus | (1) 需要预生成步骤 (LLM call) 未做；(2) Step 5 范围；(3) 不在本场 wall budget |
| **G** Pages 全量但 trim entity-level | 保 pages 但 entity.markdown / entity.translated 部分内容截断 | (1) 截断破坏 retrieval-quality；(2) 工程复杂；(3) 仍不一定够 64K |

---

## 4. Implications

### 4.1 Code changes (本场)

- `apps/web/src/lib/data/assembleScope.ts` assembleWholeBook fn 重写：drop `pages`, add `chapters` + `glossary_entries`
- `apps/web/src/lib/data/__tests__/assembleScope.test.ts` assembleWholeBook 测试组重写 (stub 也要给 chapters + glossary entries)
- `apps/web/src/app/api/chat/route.ts` 不动 (route 调 assembleWholeBook，新 payload shape 透明转发到 buildMessagesWithStablePrefix)
- `apps/web/src/lib/ai/chat.ts` 不动
- `apps/web/src/app/api/chat/__tests__/route.test.ts` 不动 (route test 通过 vi.mock(assembleScope) stub 出 `{ contextBlock: "[]" }`)

### 4.2 PLAN.md amend

- §1 Step 5 row: "whole-book scope" 后加 "(lean payload per D-098 §2.1)"
- §3 cost / tripwire 区: cache hit baseline 期望仍 99.98% (corpus 仍是同一份 glossary 同 Step 4)，D-091 §2.5(β) tripwire no fire 期望

### 4.3 STATE.md amend

- 已锁定决定数 97 → **98**
- 最后更新 row 加 Session 37 + D-098 essence + B-fix narrative
- 下一会话 row 更新

### 4.4 RETROSPECTIVE v2 backlog 新增

- Lesson: D-095 partial supersede D-088 §2.1+§2.3 时未做 scope-aware compatibility 验证 (DeepSeek 64K vs assembleWholeBook 800K 估)；与 D-097 lesson "memory-only assumption 未 docs 验证" 同根
- Rule 候选 (RETROSPECTIVE v2): 任何 provider/scope/quota 维度 partial supersede 必须立即跑 cross-product compat check (pseudocode 或 fixture 小样)，否则下一 step 即触雷
- 这是 γ tripwire (wall) 之外的另一类 "design completeness" tripwire，建议补 D-091 §2.5(δ) 或新 §2.5(?) 编码

### 4.5 Cost envelope re-baseline 仍 Step 5 close retro 做

- Step 5 真 N=3 后再算 D-095 §4.2/§4.3 cost envelope，不本 ADR 提前决；本场 lean payload ~58K tokens × DeepSeek $0.07/M cached + $0.27/M miss ≈ ~$0.017 per call (Step 4 baseline 适用)

### 4.6 Phase 3+ β 阶段 reactivation hook

- 当 1M-ctx model 决策点到 (e.g. Phase 3 web app 升 Anthropic 1M tier，或 OpenAI gpt-5 等 1M 等价物入场)，本 D-098 §2.4 lean → full 反演路径 reserved；当时新建 `assembleWholeBookFull` 不动 lean，双轨各自 ADR 表达

---

## 5. Out-of-scope (intentional)

- 不修改 assembleQuestion / assembleChapter / assembleTermHover (其他 3 scope 不受 ctx 影响)
- 不引入 chapter abstracts (Phase 3+ retrieval quality 提升时考虑)
- 不引入双 provider auto-fallback (D-095 §2.4 明确不在 scope)
- 不锁 D-091 §2.5(δ) cross-product compat tripwire (RETROSPECTIVE v2 backlog 候选，Phase 2 收尾时讨论)
- 不在本 ADR 重新讨论 D-095 partial supersede 路径 (历史 ratified 不动)

---

## 6. Audit trail

| 时间 | 事件 |
|---|---|
| 2026-05-19 Session 35 Turn 3 | D-095 LOCKED — DeepSeek default chat mode；但未交叉验证 assembleWholeBook 800K estimate compat with DeepSeek 64K ctx (D-098 §1 根因 #1) |
| 2026-05-20 Session 37 batch E pre-flight | 本地 node 测量 → confirm 429K-964K tokens vs 64K ctx 物理冲突 |
| 2026-05-20 Session 37 D-019 §3a 4Q | Q1=B / Q2=Modify / Q3=锁 ADR / Q4=Yes 原计划，all Recommended blanket |
| 2026-05-20 Session 37 本 ADR write | per D-027 §1 同 turn 落盘 + session-37 log 同 turn 引用 + STATE/PLAN sync 同 turn |

## 7. Cross-references

- D-085 chat mode scope map (amended by §2.4)
- D-088 §2.3 cache layout (compatible, no change)
- D-089 §2.3 assembleScope fns (amended by §2.5)
- D-091 §2.5(β) cache hit rate tripwire (still active, expected no fire)
- D-094 §2.4 Step 5 mid-implementation retro decision input (本 ADR 不是 mid-retro 触发 but 是 mid-step factual error 修正 — 不算 §2.4 触发数据点 per §2.4 narrow scope wording)
- D-095 §2.1 DeepSeek default (retained, root cause but not superseded)
- D-097 §1 lesson sibling (memory-only assumption 未 docs 验证 → factual error → ADR fix)
