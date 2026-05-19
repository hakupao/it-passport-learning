# 项目当前状态 / Project Live State

> **本文件 = "当前累计状态"的真相源**。Session 日志是历史档案（append-only，记录每一步如何达成）；本文件是当下事实快照。两者关系由 **D-028** 锁定。
>
> **更新规则**: 每场 session 结束前 Claude 必须 sync 到本文件（per **D-027** 第 5 条「关 session 前自检」）。读者优先读本文件。

| 字段 | 值 |
|---|---|
| 最后更新 | **2026-05-19 Session 35 🎯 LLM gate ✅ DONE — Phase 2 Step 4 ✅ DONE + 3 ADR LOCKED (D-094 / D-095 / D-096) — pending commit + push gate** (user kickoff "Session 35 开始" 2026-05-19) — 7 Turn (Turn 1-2 D-094 + Anthropic-only scaffold v1 / Turn 3 user pivot to DeepSeek + D-095 lock + provider.ts refactor + Vercel redeploy / Turn 4 HARD GATE re-ask DeepSeek / Turn 5 user `ChatGPT Plus + auth` side discussion + D-096 lock (α firewall in-scope + β account system out-of-scope retained + ChatGPT Plus ≠ API access 澄清) + 推 Session 36 firewall ops / Turn 6 final HARD GATE re-ask / Turn 7 user `path 3 done` → `go` → DEEPSEEK_API_KEY ✅ on Vercel preview → redeploy `dpl_45RWexSpH5PSu23dboxBeLimq72E` → 2 curl POST → vercel logs --json → **cache hit rate 99.98% on call #2** [57,984 read / 9 miss / 57,993 input] → $0.017 真 billed → `cache_audit_2026-05-19.md` data point #1 → D-091 §2.5(β) tripwire no fire + D-088 §2.3 cache 设计 ratified). Initial Turn 1 4Q meta-framing (Q1 D-094 scope / Q2 scaffold depth / Q3 LLM gate mode / Q4 D-NNN cap) + recommend chain `c/c/b/a` + user blanket ACK `全部按照你推荐的来` 2026-05-19. Turn 2 execute: **(a)** `docs/decisions/D-094-tripwire-wall-amendment.md` LOCKED (Module A wall actuals inline; Module B-D estimate hold; D-091 §2.5(γ) 30% threshold unchanged; defer B-D amend to Step 5 mid-implementation retro per D-094 §2.4) + `evidence/phase2/tripwire_log.md` row #1 (γ 3-point fire / resolved by D-094) + PLAN.md §1 Module A 3 row wall column amend (`actual <N> min (vs estimate <M> day → −X%)` format per D-094 §2.1) + Module B-D 12 row estimate untouched (per D-094 §2.2). **(b)** Step 4 scaffold: `apps/web/{src/lib/ai/anthropic.ts, src/app/api/hello-ai/route.ts, src/lib/ai/__tests__/anthropic.test.ts}` 3 new files (Vercel AI SDK `ai@6.0.184` + `@ai-sdk/anthropic@3.0.78` installed; Opus 4.7 pin `claude-opus-4-7`; `buildCachedSystemMessages` returns 2 system messages with `cache_control:ephemeral` on first per AI SDK v6 contract; `readAnthropicCacheUsage` extracts `cacheCreationInputTokens`/`cacheReadInputTokens` from `providerMetadata.anthropic`; `/api/hello-ai` POST runtime=nodejs maxDuration=30 calls `warmUp()` then `streamText({model: anthropic('claude-opus-4-7'), messages: [...buildCached..., {role:'user', content:'ping'}], onFinish: log usage})`; full glossary JSON ~27K tokens used as cached preamble exceeds Anthropic 1024-token Opus cache minimum; 8 new vitest unit tests) → **pnpm test 36/36 ✅ in 186ms** cumulative (Step 2 13 + Step 3 15 + Step 4 8) / **pnpm build ✅ 2.1s 6 routes (5 static + 1 dynamic /api/hello-ai) 119 kB First Load JS no regression** / **pnpm lint ✅ exit 0** / **tsc exit 0**. **HARD GATE pending**: first 2 real LLM calls (cache_creation + cache_read measurement) deferred to explicit user `go LLM` per CLAUDE.md hard rule + D-090 α-silent $5/$5 cap envelope; ANTHROPIC_API_KEY env var setup also gated. (legacy Session 34 close paragraph below preserved for trace) — Session 34 ✅ CLOSED — Phase 2 Step 3 DONE (4 per-scope assembly fns + corpus boot loader module-level singleton per D-089 §2.3 + Q3=b) (user kickoff "Session 34 开始" 2026-05-19) — 3 turn 紧凑链：Turn 1 Round 1 4Q ans (Q1=a Step 3 完整一气呵成 / Q2=b interface-first then tests / Q3=b module-level singleton / Q4=a propose-first 0 D-NNN-worthy) / Turn 2 Batch A-D execute：Batch A `apps/web/src/lib/data/assembleScope.ts` (4 fns per D-089 §2.3: assembleQuestion / assembleChapter / assembleWholeBook / assembleTermHover + `AssembledScope` 公共 return type + `Math.ceil(len/4)` conservative chars/token heuristic; CJK 实测 ~9 chars/token per phase2_d089_poc_2026-05-19/measurement.md → over-estimates by ~2x safe pre-flight cost guess; calibration TODO Step 4 retro) + Batch B `apps/web/src/lib/data/index.ts` module-level singleton (getDataSource() lazy + warmUp() Promise.all([loadIndex, loadGlossary]) helper exposed for `instrumentation.ts` Step 4+ + __setDataSourceForTesting / __resetDataSourceForTesting NODE_ENV=test guarded) / Batch C 15 new vitest unit tests (assembleScope.test.ts 10: 4 fn × happy+edge + index/glossary out-of-sync stub / index.test.ts 5: singleton stability + warmUp cache discipline + test injection) → **pnpm test 28/28 ✅ in 178ms** cumulative (Step 2 13 + Step 3 15) / Batch D pnpm build ✅ 1404ms 5 static pages 119 kB First Load JS no regression + tsc exit 0 + lint exit 0. **Vercel preview deploy ✅ READY post user "go all 4" auth** @ https://web-nrcpizp2b-bojiangs-projects.vercel.app (`dpl_6d2uo9pn44pL9cw1p6uAzSVyVutD` build 30s iad1; initial `vercel deploy --yes` DENIED by Claude Code auto-mode classifier → user gate → 2nd attempt clean; canonical https://web-mu-sandy-78.vercel.app/ HTTP/2 200 unchanged on Step 1 prod). **Rule B 归档**: 0 (all 4 batches first-try landed). **Evidence**: `evidence/phase2/step_03_assembly/{tree_outline.md, build_log.txt, test_results.txt, vercel_deploy_dpl_6d2uo9pn44pL9cw1p6uAzSVyVutD.log, step_03_audit.md}` 5 files complete. **γ tripwire 3rd data point**: Step 1 25min/1d, Step 2 30min/2d, Step 3 ~30min/1.5d = 3 consecutive >90% under-estimate → triggers PLAN.md §1 wall 列 amendment per D-091 §2.5(γ) → **D-094 amend D-091 §2.5(γ) + PLAN.md §1 wall 列 re-estimate Step 4-15 deferred to Session 35 起手** (per Q1=a 不带 PLAN 校正本场). **节奏 carry-over**: Q2=g1 mid + Q3=a Phase 1 同构 + Q4=d 自适应 slow-pace 继续；Session 35 entry = D-094 amend + Step 4 Vercel AI SDK + Opus 4.7 pin + cache_control:ephemeral block (D-088 §2.3) — 首次真 LLM call，D-090 $5/$5 cap envelope α-silent activates. Commit + push pending user gate per Sessions 27-33 pattern. |
| 当前阶段 | **Phase 2 实施阶段 in progress** (2026-05-19 Session 34 close — Step 3 ✅ DONE) — **4 per-scope assembly fns (assembleQuestion / assembleChapter / assembleWholeBook / assembleTermHover) + corpus boot loader module-level singleton** (per D-089 §2.3 + Session 34 Q3=b) + **28/28 vitest unit tests ✅ in 178ms** (Step 2 13 + Step 3 15 cumulative) + Next.js build 1404ms 5 static pages 119 kB First Load JS no regression vs Step 2. `apps/web/src/lib/data/{assembleScope.ts, index.ts}` + `__tests__/{assembleScope.test.ts, index.test.ts}` 4 new files; Step 2 5 file 全保留. **Vercel preview deploy ✅ READY** @ https://web-nrcpizp2b-bojiangs-projects.vercel.app (`dpl_6d2uo9pn44pL9cw1p6uAzSVyVutD` 30s iad1, post user "go all 4" auth). **Module A 3/3 step ✅ COMPLETE** (Step 1 scaffold / Step 2 DataSource + index.v2 / Step 3 assembly + boot). Module B Step 4 = Vercel AI SDK + @ai-sdk/anthropic + Opus 4.7 pin + cache_control:ephemeral block (D-088 §2.3) — Session 35 起手 首次真 LLM call. **γ tripwire 3rd data point**: 3 consecutive steps >90% under PLAN estimate → D-094 amend D-091 §2.5(γ) + PLAN.md §1 wall 列 re-estimate Step 4-15 → Session 35 起手 lock per Q1=a 不带 PLAN 校正本场. Evidence: `evidence/phase2/step_03_assembly/` 5 files complete (incl. vercel_deploy_dpl_6d2uo9pn44pL9cw1p6uAzSVyVutD.log). |
| Phase 1 状态 | 设计 ✅ + Step 0~6.9 ✅ + Step 6.10 ✅ CLOSED + **Step 6.11 设计 ✅ (D-079/080/081)**: D-079 cadence + D-080 partial polish + D-081 Release asset shape. 实施分 5 轨: A=D-080 polish (~$10 shadow validation), B=D-079 runner+checkpoint infra, C=D-081 release-publish module, D=579-page Stage C 5-gate execution (Mistral ~$0.58 billed, Anthropic $0 billed via max-plan OAuth), E=Release publish + sign-off. |
| 已锁定决定数 | **96** (D-001 ~ D-096；Session 35 lock 3 ADR: D-094 Turn 2 + D-095 Turn 3 + **D-096 Turn 5**). **D-094 essence**: γ tripwire 3rd data point cascade resolved by Module A wall actuals inline; Module B-D estimate held; threshold unchanged. **D-095 essence** (Turn 3, partial supersede D-088 §2.1+§2.3+§2.4; retain §2.2+§2.5+§2.6): DeepSeek default (chat=`deepseek-chat` / quiz=`deepseek-reasoner` / hover/smoke=`deepseek-chat`) + Anthropic switchable (`claude-opus-4-7` per D-088 §2.1 Anthropic-side pin retained) via `LLM_PROVIDER` env switch; stable-prefix message layout (corpus→instruction→user) serves both providers via `providerOptions.anthropic` namespace. `deepseek-v4-pro` 非 API model string (Context7 verified 2026-05-19); future V4 via §2.5(ε) DeepSeek mirror tripwire. **D-096 essence** (Turn 5, amend D-083 §2.5 + PLAN.md §6 + ChatGPT Plus / OpenAI API 关系澄清入 ADR): user `我有 chatgpt plus 的会员，我想加一个 auth 的功能` 2026-05-19 + 4Q ans `a/a/a/a` + `你的计划可以，执行` ACK → §2.1 锁 ChatGPT Plus ($20/月 chat.openai.com 消费级) ≠ OpenAI Platform API access (platform.openai.com pay-as-you-go) 是两个独立产品+独立计费；§2.2 拆 auth 成 α single-user firewall (平台层访问 token) vs β multi-user account system (应用层 user identity + state) 性质不同；§2.3 α firewall via Vercel Password Protection (零代码 / 5 min dashboard toggle) **in-scope** Phase 2 α；§2.4 β account system 仍 out-of-scope per D-083 §2.5；§2.5 PLAN.md §6 amend in-place 同 turn 落盘；§2.6 实施 deferred Session 36 per Q3=a (先关 Step 4 LLM gate)。D-090/D-091 cost envelope re-baseline 仍 triggered → defer to Step 5 mid-retro. |
| 未决问题数 | **3** open（OQ-01 / OQ-02 / OQ-05 **partial close LOCKED** = Phase 2 部分由 D-083 §2.5 锁，Phase 3/4 形态 + 顺序继续 open），41 closed（OQ-40 = β 开放时间窗 / 触发条件 = **CLOSED LOCKED Session 31 Turn 6 path α 2026-05-19 by D-092**；剩余 3 OQ 全在 Phase 1 后续 / Phase 3-4 范围） |
| GitHub repo | **https://github.com/hakupao/it-passport-learning** (Public, main, **origin synced at `773ecfd` Session 18 close**. Session 19 pushed 6 commits at session start (`6f5310e..773ecfd`). Session 19 close commit pending will move both HEAD and origin/main forward by 1.) |
| 下一会话 | **Session 35 close pending user `go commit` + `push it` gates per Sessions 27-34 pattern** (G3=a 1 atomic commit with D-094 + D-095 + D-096 + provider.ts + cache_audit data point #1 + 全套 PLAN/STATE/log/evidence). **Session 36 起手 entry actions** (in order): (i) **5 min Vercel ops**: Vercel Password Protection one-knob setup per D-096 §2.3+§2.6 (preview + production env both ON; α single-user firewall in-scope); (ii) Step 5 = `/api/chat` whole-book scope wiring + first-week retro (D-088 §2.3 stable-prefix effectiveness 已 Step 4 实测 99.98% hit / D-091 §2.5(β) cache hit rate trigger 已 no fire baseline / D-095 §4.2/§4.3 cost envelope re-baseline 用 Step 5 multi-mode data 再算; assembleScope.ts chars/4 → chars/5 calibration TODO from cache_audit §4.2; AI SDK warning re multi-system messages silence option). γ tripwire 4th data point: Step 4 Turn 1-7 ~140 min vs estimate 1 day → −85% drift — Module B 第一个 data point；D-094 §2.4 Step 5 mid-retro 决策 input acquired. |

---

## 1. 项目概览

构建一个**资格考试三语学习内容工厂**。第一目标书：

> 【令和６年度】 ITパスポート 〈書名 + 著者已脱敏 per 2026-05-17 用户规则〉

**核心动机**: 非母语技术学习者卡在日语片假名/平假名的字形识读，而**不是**概念理解。三语对照（日/中/英）+ `kana_helper` 字段 = 直击痛点。

**愿景路线图**:

```
Phase 1: 三语化内容工厂 (本次锁定)
   ↓
Phase 2 (A): 个人备考工具
Phase 3 (B): Web App 题库/学习站
Phase 4 (C): AI 学习助手
   ↓
Phase 5: cert-extractor 通用框架（任意资格教材）
```

---

## 2. Phase 1 当前架构（已锁）

### 2.1 技术栈

- 主语言: **Python 3.11+** (D-024)
- Phase 3 前端: TypeScript / Next.js 或 Astro（Phase 3 才决定，通过文件契约解耦）
- 包管理 / 测试 / 日志: 留 Topic #7 决定

### 2.2 形态：三层 Hybrid (D-023)

```
Layer 3: YAML pipeline 配置 (pipelines/itpassport-r6.yaml)
   ↓ 解析
Layer 2: CLI (cert-extractor run / ocr / inspect ...)
   ↓ 调用
Layer 1: Python 库 (cert_extractor)
   ↓ 实例化
Layer 0: 插件实现 (plugins/source/, plugins/ocr/, ...)
```

GUI **不在 v1**，Phase 3 再考虑。

### 2.3 4 轴可插拔 (D-021)

| 轴 | v1 内置 | 占位接口（v2+ 实现） |
|---|---|---|
| Source Reader | `epub_image` | `pdf` / `txt` / `html` / `docx` / `markdown` |
| OCR Engine | `mistral` | `claude_vision` / `paddle` / `olmocr` / `tesseract` |
| Translator | `claude_sonnet_46` | `gpt` / `gemini` / `deepl` |
| Exporter | `json` / `markdown` / `sqlite` | `anki` / `notion` / `csv` |

### 2.4 数据模型

- **三语** (D-009): 每个文本字段 = `{jp, zh, en}`
- **Hybrid 锚点** (D-022): 每实体保留 `page` + `block_id` + `section_path`
- **Cert-agnostic** (D-010): `cert_id` 顶层区分；`itpassport_r6` 是首个
- **kana_helper** 字段 (D-012): 难读片假名词附 `{surface, reading, zh_concept}`

### 2.5 Pipeline (D-008 + D-011)

```
0. Unpack EPUB → raw/pages/page_NNN.jpg
1. OCR (Mistral) → ocr/page_NNN.md
2. Page Classify (Claude Sonnet) → 标签
3. Hard-page Re-OCR (Claude Vision, 条件触发) → cleaned MD
4. Structure (Claude) → entities (chapters/sections/terms/questions/tables/figures)
4.5 Glossary 抽取 + 锁定 (在翻译前!)
5. Trilingual Translation (Claude, glossary-constrained)
6. Audit (per 规则 A)
7. Export → JSON + JSONL + Markdown + SQLite
```

### 2.6 插件机制 (D-025 + D-026)

- 内部: `@register_<axis>("<name>")` 装饰器 + 自动扫描 `plugins/`
- 第三方: Python `entry_points`（Phase 5 生态用）
- 版本化: 库 semver + 插件 `__cert_extractor_min_version__` 单行声明

### 2.7 OCR 选型 (D-005 + D-006 + D-007)

- 主: **Mistral OCR** (Scale plan, $1/1k pages)
- 难页复核: **Claude Sonnet 4.6 Vision (1M ctx)**

---

## 3. 工程纪律

### 3.1 用户硬规则 (per User CLAUDE.md `<personal_operating_principles>`)

- **A** — 语义抽检 (>50% 压缩或改写必须 N 样本独立抽检)
- **B** — 失败归档不删
- **C** — Retro 强制
- **D** — Writer/Reviewer 分离

### 3.2 讨论操作守则 (D-027)

1. 决定即写入
2. 待定即列入
3. 状态变更即同步
4. Live state vs Historical journal 分离 (本文件 vs session 日志)
5. 关 session 前自检

### 3.3 追溯结构 (Topic #2 ✅ 闭合，全部组件就位)

| 文件 / 目录 | 角色 | 状态 |
|---|---|---|
| `docs/STATE.md` (本文件) | Live state 真相源 | ✅ D-028 已建 |
| `docs/discussion/YYYY-MM-DD-session-NN.md` | Session 编年体日志 | ✅ session-01 (closed) + session-02 (in progress) |
| `docs/discussion/README.md` | 讨论规约 + 操作守则 | ✅ 已建 |
| `docs/decisions/D-NNN-slug.md` | 重大决定 ADR | ✅ 8 条 ADR 已写完 (D-005/008/013/016/021/022/023/024) |
| `docs/decisions/README.md` | ADR 规约 | ✅ 已建 |
| `docs/templates/evidence-template.md` | 抽检证据模板 | ✅ D-030 已建 |
| `docs/templates/failure-template.md` | 失败 attempt 模板 | ✅ D-032 已建 |
| `docs/templates/retrospective-template.md` | Phase 收尾复盘模板 | ✅ D-033 已建 |
| `evidence/` | 抽检证据落点 (per 规则 A) | ⏳ 进入 Phase 1 实施时建 |
| `failures/` | 失败 attempt 归档落点 (per 规则 B) | ⏳ 进入 Phase 1 实施时建 |
| `RETROSPECTIVE.md` | Phase 1 收尾复盘 | ⏳ Phase 1 收尾时由模板拷贝 |

---

## 4. 当前未决问题（open）

| OQ | 问题 | 归 Topic | 状态 |
|---|---|---|---|
| OQ-01 | Phase 1 实际要支持的源类型优先级（v1 后） | Topic #1 收尾后开放 | open |
| OQ-02 | OCR 引擎抽象的更细颗粒度（部分覆盖） | Topic #1 后续 | open |
| OQ-05 | A/B/C 三个 Phase 的具体形态 + 启动顺序 | Topic #8 | **partial close LOCKED** (Session 24 Turn 4) — Phase 2 = A+C hybrid 部分由 D-083 §2.5 锁；Phase 3/4 形态 + 顺序继续 open |
| ~~OQ-40~~ | ~~β 开放时间窗 / 触发条件（"什么时候 / 什么条件下 α → β 切换"）~~ | Topic #8 | **CLOSED LOCKED** Session 31 Turn 6 path α 2026-05-19 by D-092 |

（已闭合的 OQ-04/06/07/08~39 详见 session-01~06 日志 §3-4）

> **里程碑**:
> - **Phase 1 设计阶段彻底收尾**: Topic #1~#7 ✅ 全闭合（D-001~D-073, 7 独立 ADR）
> - **Phase 1 实施 gate ✅ 解锁**: 等 user 显式 "开始实施" 切阶段
> - 剩余 3 OQ 全在 Phase 1 范围外（Topic #1 后续 / Topic #8 Phase 2-4）

---

## 5. 下一步 / Resume Instructions (current = **Session 13 open — Step 6.11 设计层 3D 锁完，进入实施 TDD 起手 (6.11.A.1)**)

### Session 11 progress (2026-05-11) — **Step 6.9 Stage 6 ✅ CLOSED**

- ✅ Stage A user retro worksheet → 3-Q sign-off (Q1=D / Q2=✓ / Q3=✓)
- ✅ Stage A JSON snapshot: `evidence/.../stage6_review_stageA_rerun2.json` (23KB)
- ✅ Stage B dispatched → halted at page_042 safety FAIL (32/40 audited)
- ✅ Stage B JSON snapshot: `evidence/.../stage6_review_stageB.json` (99KB)
- ✅ Stage B root-cause: both FAILs = detector FPs (page_19 D7 + page_42 D5)
- ✅ Stage B retro worksheet → 5-Q sign-off (Q1=A / Q2=A / Q3=A / Q4=B / Q5=✓)
- ✅ Detector fixes (D5 regex + D7 subset-difference + D9 → INFO) + 4 regression tests
- ✅ Full unit test suite: 324/324 pass (320 base + 4 new)
- ✅ Stage B rerun #2 → 40/40 audited, 21 PASS / 18 WARN / 1 real FAIL (page_22 LLM-caught hallucination); evidence snapshot 133KB
- ✅ Closure worksheet Q1 = B (user hand-edited page_022 entity[2].rows[1][1].en, removed "Activities")
- ✅ Hand-edit documented: `evidence/.../page_022_hand_edit_2026-05-11.md`
- ✅ Stage B rerun #3 → 40/40 audited, **22 PASS / 18 WARN / 0 FAIL**, safety=False, overall=WARN; evidence snapshot 135KB
- ✅ `evidence/.../step_06_audit.md` updated with full Stage B narrative + closure summary + known polish items + sign-off table populated through "Final" row
- ✅ STATE.md synced this turn (per D-027 §3)
- ✅ Session 11 log §7 covers all phases of Stage 6 closure

**Cumulative dry-run shadow cost (post Step 6.9 closure)**: $47.44 + $37.67 = **$85.11 shadow / $0.05 Mistral real / $0 Anthropic real (max-plan OAuth)**

### Step 6.10 Stage 7 export — next entry point (Session 12)

Stage 6 carried forward as "known polish items" (all WARN-level, non-blocking):

- D6 choice_marker_inconsistent ×3 pages (rs=7) → Stage 7 export normalizes zh+en → A/B/C/D, jp keeps ア/イ/ウ/エ
- LLM L3 translation_unfaithful WARN clusters (page_022 ストラテジ→Strategy tautology, page_038 circular EN, suffix inconsistency) → Stage 5 prompt v2 polish item
- D7 numeric_inconsistent WARN ×22 leaves (style/subset only, no conflict) → Stage 5 / Stage 7 normalization candidate
- D11 kana_helper_missing INFO ×11 leaves → Stage 4.5 backfill
- D13 run-level INFO ×2 (g_022 / g_028 glossary surface-concept split) → Stage 4.5 glossary self-consistency

Stage 7 export contract reminders:

- Refuse UNTRANSLATED leaves (D-076 envelope)
- Refuse `answer_index == -1` (D-076 envelope)
- Normalize choice markers (D6 rs=7 carry-forward from Stage 6)
- Document known polish items in release notes for first GitHub Release tag

### Session 10 close summary — Stage 6 scaffold + Stage A 0-FAIL baseline ✅

### Session 10 close summary — Stage 6 scaffold + Stage A 0-FAIL baseline ✅

**D locked**: D-077 — Stage 6 audit reviewer LLM (two-pass deterministic + LLM, two-tier verdict, repair_stage tagging, Stage A 5-page → Stage B 40-page; amends D-063 retry semantics). ADR: `docs/decisions/D-077-stage6-audit-reviewer.md`. Session log: `docs/discussion/2026-05-07-session-10.md`.

**Memory**: new `feedback_quality_over_cost.md` (default to highest-quality / safest design option; do not pre-frame around shadow cost — user feedback Session 10 起手).

**3 commits this session**:
- `39b8710` — Stage 6 audit reviewer scaffold (D-077 + 5 modules + 4 test files + 103 unit tests)
- `a624f28` — D5/D7 false-positive fixes from Stage A retro (D5 short-circuit on 0-question pages; D7 circled-numeral normalization)
- `162aebb` — D7 numeric_inconsistent severity heuristic (FAIL only on real conflict; WARN on style/paraphrase)

**3 LLM dispatches** (Stage A 5-page audit, total 36 calls, $8.42 shadow / $0 billed):
- Stage A #0: surfaced D5+D7 FPs; halted on page_045 safety FAIL
- Stage A re-run #1: D5 fixed, 2 D7 strict FAILs persist
- Stage A re-run #2: 0 FAILs / 5 WARN, clean baseline ready for Stage B

**Stage A re-run #2 result** (current `audit/stage6_review.json`): overall=WARN, safety_failed=False, P/W/F=0/5/0, repair_stage="5". Real catches verified: F-CHOICE-MARKER (page_043 D6) + LLM Phase 2 circular-definition (page_038) + LLM idiomatic 自我完结型 (page_043).

### Next sub-steps for Session 11

| # | Action | LLM ($)? | Status |
|---|---|---|---|
| 6.9.1~6.9.5 | Stage 6 scaffold + 320 unit tests | no | ✅ done (Session 10) |
| Stage A #0/#1/#2 | 5-page audit verification (3 dispatches) | yes ($8.42 shadow) | ✅ done (Session 10) |
| 6.9.7 | Stage A user retro worksheet + 3-Q sign-off | no | ✅ done |
| 6.9.8 | Stage B 40-page audit dispatch (halt) | yes ($7.56 / $0 billed) | ✅ partial (halt @ page_042) |
| 6.9.8a | Stage B user retro worksheet + 5-Q sign-off | no | ✅ done (A/A/A/B/✓) |
| 6.9.8b | Detector fixes (D5 regex + D7 subset + D9 INFO) + 4 regression tests | no | ✅ done (324/324 pass) |
| 6.9.8c | Stage B rerun #2 (full 40-page after fix) | yes ($10.95 / $0 billed) | ✅ done (21/18/1, 1 real LLM-caught FAIL) |
| 6.9.8d | Closure worksheet Q1 = B → user hand-edit page_022 + documented | no | ✅ done |
| 6.9.8e | Stage B rerun #3 (after hand-edit) | yes ($10.75 / $0 billed) | ✅ done (22/18/0 clean) |
| **6.9.9** | **Stage 6 closure — step_06_audit.md narrative + sign-off + STATE sync** | no | ✅ **done — Stage 6 CLOSED** |
| 6.10 design | Stage 7 export v1 — D-078 ADR | no | ✅ done (Session 12) |
| 6.10.1 | `schema.py` + 25 tests | no | ✅ done |
| 6.10.2 | `normalizers.py` + 37 tests | no | ✅ done |
| 6.10.3 | `gates.py` + 14 tests | no | ✅ done |
| 6.10.4 | `emitters.py` + 18 tests | no | ✅ done |
| 6.10.5 | `runner.py` + CLI `export-trilingual` + 9 tests (incl. half-width-jp regression) | no | ✅ done |
| 6.10.6 | `evidence/.../step_07_export.md` post-dispatch | no | ✅ done |
| 6.10.7 | Real 40-page dry-run (84 files emitted; Gate A pre-normalize fix applied) | no | ✅ done (0 LLM cost) |
| 6.10.8 | User sample-review (page_006/014/022/038/043) | — | ✅ PASS ("ok通过", 2026-05-11) |
| 6.10.9 | Step 6.10 closure (step_07_export.md + STATE sync) | — | ✅ done (this turn) |
| **6.11 设计层** | D-079 + D-080 + D-081 — Stage C cadence + 部分 polish + Release asset shape | no | ✅ done (Session 13) |
| **6.11.A** | D-080 Stage 4.5 polish 实施 + 40-page 重 baseline 验证 | A.3 = yes (~$10 shadow / $0 billed) | ⏸ next entry point |
| 6.11.A.1 | Stage 4.5 `scan_katakana_terms_for_backfill` + `kana_stop_list.txt` (20 词种子) + KanaHelper.auto_backfill 字段 + 9 unit tests | no | ✅ done (suite 436/436) |
| 6.11.A.2 | Stage 4.5 `split_multi_concept_items` (6 separators, balanced/unbalanced 双路径, warn 透传) + 5 unit tests | no | ✅ done (suite 441/441) |
| 6.11.A.3 | 40-page re-baseline (Stage 4.5 → 5 → 6 phase-1); D11/D13 INFO = 0 验证 | yes (~$22-27 shadow / $0 billed via max-plan OAuth, 5 attempts incl 2 bug fixes) | ⚠️ done with NO-ACCEPTANCE — D-080 v1.1 §8 amended (acceptance withdrawn) |
| 6.11.A.4 | `evidence/.../step_45_polish.md` + STATE.md sync + D-080 v1.1 amend | no | ✅ done (this turn) |
| **6.11.B** | D-079 runner + checkpoint infra | no | ✅ done (Session 14, all 3 sub-steps) |
| 6.11.B.1 | CLI `stage --from N [--redo]` + 6 tests (`pipeline/stage_dispatch.py` planner + cleanup; suite 442→448) | no | ✅ done (Session 14) |
| 6.11.B.2 | Checkpoint emitter `gate_N_<ts>.json` + 5 tests (`pipeline/checkpoint.py` Pydantic Checkpoint + emit_checkpoint + tokyo_timestamp_slug + load_checkpoint; suite 448→453) | no | ✅ done (Session 14) |
| 6.11.B.3 | 5 个 gate 的 halt criteria checker + 8 tests (`pipeline/halt_criteria.py` HaltResult + `_within_tolerance` + 5 checkers + `_walk_translation` Plan-B regression guards; suite 453→461) | no | ✅ done (Session 14) |
| **6.11.C** | D-081 release-publish 模块 | no | ✅ done (Session 14, all 4 sub-steps) |
| 6.11.C.1 | `cert_extractor.release.tag_name()` + 4 tests (`release/__init__.py` + `release/tag_name.py` underscore↔dash mapping + ParsedTag NamedTuple + version normalization + round-trip; suite 461→465) | no | ✅ done (Session 14) |
| 6.11.C.2 | `cert_extractor.release.compose_notes()` + 4 tests (`release/notes.py` D-081 §2.3 5-section Markdown composer + polish aggregation + GitContext; suite 465→469) | no | ✅ done (Session 14) |
| 6.11.C.3 | `cert_extractor.release.publish()` orchestrator + integration test (mock gh) (`release/publish.py` D-081 §2.4 8-step: validate→zip→SHA256SUMS→compose-notes→gh-create→gh-view + injectable `gh_runner`; suite 469→473) | no | ✅ done (Session 14) |
| 6.11.C.4 | 手写 `docs/release-notes/itpassport-r6-v1.0.0-intro.md` (~250 字; project background + kana_helper rationale + what-you-get + audience; smoke-rendered through compose_notes → clean 2.9KB body) | no | ✅ done (Session 14) |
| **6.11.D** | Stage C 579-page 5-gate 执行 | yes (Mistral ~$0.58 billed; Anthropic $0 billed via max-plan OAuth) | ⏸ |
| 6.11.D.1 | Pre-flight: `gh auth status` ✅ (hakupao, repo+workflow scopes), 579-page EPUB ✅ (`./IT-Passport.epub` 256 MB, 579 page-image entries), Anthropic OAuth ✓ (Session 13 path), **MISTRAL_API_KEY ❌ 未在 shell** → Session 15 user sourced `.env.local` (inline loaded into Bash subshell) | no | ✅ done (Session 14 + 15) |
| 6.11.D.2 | Stage 0 unpack + Stage 1 OCR → Gate ①. **run_id=`dry_run_2026-05-12T13-23-19`**, 579/579 pages OCR'd in 1026 s, 0 fail, `mistral_usd=$0.5790`. Gate ① 第一次 FAIL (B.3 checker schema bug — read flat `cost.mistral_usd` but emitter writes `cost.current.mistral_usd`); patched `halt_criteria.py` nested-first + flat fallback + 1 new test (suite 473→474). Gate ① 重跑 PASS, checkpoint `gate_1_2026-05-12T13-42-47.json` emitted. Rule B archive `failures/stage1_ocr/stage1-2026-05-12-gate1-checker-schema.md`. | Mistral $0.579 | ✅ done (Session 15) |
| 6.11.D.3 | Stage 2 classify (579 opus) + Stage 3 re-OCR (42 opus Vision; +14 force on D-076 violators = 56 cleaned) + Stage 4 structure (554 of 579, 25 auto-skipped-by-label, **2224 entities** chapter/section/term/question/table/figure 6 类齐). β.1 remediation: δ visual confirm F-MISTRAL-ANSWER-LINE-LOSS → α commit `0fa65e9` (CLI flag matrix + checker patches + 2 tests + 2 failure archives) → β.1 14-page force-OCR + re-Stage-4 → **Gate ② PASS** clean. Checkpoint `gate_2_2026-05-12T23-15-29.json` emitted. Per-page sanity vs visual: page_043 `[2,2,2,3,2]` ✓✓✓ / page_525 `[2,1,2,1,1]` ✓✓✓. | $0 billed / **$235.63 shadow** opus | ✅ done (Session 16) |
| 6.11.D.4 | Stage 4.5 glossary single-call opus → Gate ③ first-shot PASS。 1 LLM call, 70 921 tokens, **908 trilingual entries** locked from 978 unique surfaces (7% alias-merge), kana_helper coverage = 308 (307 LLM-authored + 1 D-080 polish-#1 auto-backfill safety-net on g_451)。 Gate ③ inputs (orchestrator-computed per D-080 v1.1 §8.5 wiring): D11=0 (deferred — no `translated/` at this gate), **D13=0** (`detect_glossary_consistency` clean), **untranslated=0**, entry count 908 in [500, 1500] band。 Checkpoint `gate_3_2026-05-13T09-50-35.json` emitted。 δ-equivalent quality spot-check (9 entries) clean。 `verdict_halted=FAIL` operational artifact (cumulative-cap framing, NOT a data fail) noted as Phase 1 v2 UX wart, no archive。 | $0 billed / **$2.549 shadow** opus | ✅ done (Session 17) |
| 6.11.D.5 forward | Stage 5 translation forward pass — 554/554 pages on disk via 3 attempts (1 instant halt CLI gap → patch+test+commit `ebfdbd9` 477/477; 2 WARN halt $350 anthropic soft; 3 clean exit `verdict_halted=None`). 5607 fields translated, 1728 glossary hits, **452 UNTRANSLATED leaves residue across 96/554 pages** (sub-batch parse failures, not stuck-leaves). | $0 billed / **$169.52 shadow** Stage 5 alone; cumulative $407.70 shadow | ✅ done forward (Session 18) |
| 6.11.D.5 residue | Plan A executed Session 19: chunk=4 attempt-4 ($46.35, 96→67 residue) → chunk=1 attempts 5/6/7/8 ($172.40 combined, API-quota churn + iterative convergence) → **71 stuck leaves** (term.definition class, Session 09 pattern at scale) → Claude-Opus hand-edit drafts → user-approved `apply_hand_edits.py` 71/71 transactional apply → Gate ④ checker **passed:True / reasons:[]** (jp_mutation=0 + untranslated=0) → checkpoint `gate_4_2026-05-16T08-08-58.json` emitted. Evidence: `step_06_11_D_5_stuck_leaves.json` + `step_06_11_D_5_hand_edit_checklist.md` + `apply_hand_edits.py`. | **$218.74 Stage 5 shadow** Session 19 / $0 billed via OAuth; cumulative $626.44 shadow | ✅ **CLOSED (Session 19)** |
| 6.11.D.6 | Stage 6 audit reviewer LLM per D-077 (Stage A 5-page → Stage B 40-page → closure) → Gate ⑤ (`safety_failed=False` + manageable FAIL count) → `gate_5_<ts>.json` checkpoint. Also serves as system-level Writer ≠ Reviewer audit (Rule D) for the 71 hand-edits + 5076 LLM translations. | $30.92 shadow / Anthropic $0 billed | ✅ **CLOSED (Session 20)** — Gate ⑤ PASS w/ user auth on 2 documented edge-case FAILs (page_292 D7 date-format heterogeneity + page_479 L learning-gloss); 3 detector patches (`c627e13`/`f7eecc7`/`114a1af`) + 6 hand-edits applied; checkpoint `gate_5_2026-05-16T19-27-52.json` emitted |
| 6.11.D.7 | Stage 7 export (D-078 dual gate) → 579-page `output/` | no LLM ($0) | ✅ **CLOSED (Session 21)** — Stage 7 PASS after 5 detector patches (`2c3c66f`/`8c68c2e`) + 2 hand-edits (page_292 en numeric date + page_445 answer_index real defect); 554 pages emitted to `output/` (1112 files); Gate A + Gate B both PASS; 254 choices normalized per F-CHOICE-MARKER policy |
| **6.11.E** | Release publication | no LLM ($0) | ✅ **CLOSED (Session 22)** — `itpassport-r6-v1.0.0` published to GitHub Releases on target `820235c`; 6 assets (2.11 MB); release_url https://github.com/hakupao/it-passport-learning/releases/tag/itpassport-r6-v1.0.0 |
| 6.11.E.1 | Push prior commits to origin/main | no | ✅ done (Session 20/21 close pushes; Session 21 final push at `820235c`) |
| 6.11.E.2 | `release.publish()` Python API invocation → `itpassport-r6-v1.0.0` | no | ✅ done (Session 22, `run_release_publish.py --confirm`, 6 assets uploaded) |
| 6.11.E.3 | Verify Release page: 6 assets, sizes match | no | ✅ done (Session 22, `gh release view` byte-for-byte match) |
| 6.11.E.4 | `evidence/.../step_06_11_release.md` + STATE.md sync Step 6.11 ✅ | no | ✅ done (this turn) |
| **6.12** | Phase 1 RETROSPECTIVE.md (per 规则 C) | no LLM ($0) | ✅ **DONE (Session 23 CLOSED 2026-05-17)** — `RETROSPECTIVE.md` FINAL 351 行 per Rule C + D-033 template. 6 turns: D-019 4Q → outline → full expansion → critic Rule D NEEDS-REWORK → Turn 5 rework (9 must-fix + §2.2 ⑤ Stage 7 firefight + §5.5 v2 backlog 16 条；D-058 critic 误报已驳回保留 ✅) → Turn 6 user terminal PASS (path α skip Reviewer #2). §3 ADR review: 22 ✅ / 2 ⚠️ (D-065 / D-071) / 1 🔄 (D-080) / 0 ❌；§4.1 cost variance -99.6% billed vs 预算中位 $250 (Mistral $0.579 + Anthropic $0 billed / shadow $657.36)；§5.5 v2 backlog 16 条结转 Phase 2 |

### Session 09 + 09b summary (Step 6.8 Stage 5 ✅ post Plan-B)

**Session 09 (false-PASS, then user retro)**:
- 393 trilingual leaves, 6 retry attempts produced 0 untrans residue
- D-074 locked: Stage 5 prompt wrapper-clause
- Closed at PASS, but user retro caught architectural bugs (see Session 09b)

**Session 09b (Plan-B fix)**:
- User retro worksheet (`docs/discussion/2026-05-07-stage5-user-retro-worksheet.md`) + 3 review sub-files caught:
  - Stage 4 `answer_index` bug: page_043 had `[0,0,0,0,0]` should be `[2,2,2,3,2]`
  - Stage 5 `_glossary_lookup` jp-mutation: 10 leaves on 7 pages had `translated.jp != structured.jp`
  - Glossary content: ~10 entries needed translation polish
- D-075 locked: Stage 5 jp-preservation contract + regression test
- D-076 locked: Stage 4 answer-line parsing + envelope `-1` rejection + regression test
- Stage 4 re-run (40 pages) + page_043 re-OCR (vision_full → cleaned/) + glossary 13 patches + Stage 5 re-run (40 pages, opus, chunk=8) + 2 chunk=1 retries on stubborn pages + 2 hand-translations
- **Final: 382/382 leaves translated, 0 UNTRANSLATED, 0 jp mutations, 10/10 question.answer_index match ground truth**
- Cumulative dry-run shadow **$47.44** / $0.05 billed (max-plan OAuth = $0 Anthropic billed)
- 212 unit tests pass (197 base + 15 Plan-B regression guards)

**Open per Plan-B Decision**:
- F-MISTRAL-ANSWER-LINE-LOSS — Phase-2 Stage 3 heuristic enhancement
- F-CHOICE-MARKER — Stage 6 WARN + Stage 7 export normalize
- F-COP21 — partially mitigated by glossary patch; remainder defers to Stage 7
- 2 hand-translations awaiting user verbal sign-off (claude-drafted, doc'd in evidence)

### Next sub-steps (6.9 onwards)

| Sub-step | Content | State |
|---|---|---|
| 6.9 | Stage 6 audit reviewer LLM (per D-060/D-061/D-063) | ⏸ — next entry point |
| 6.10 | Stage 7 export (envelope + JSON/Markdown/SQLite, refuse UNTRANSLATED) | ⏸ |
| 6.11 | 全本 579 pages run (per D-073 Stage C) + GitHub Release (per D-046) | ⏸ |
| 6.12 | Phase 1 收尾 RETROSPECTIVE.md (per 规则 C) | ⏸ |

### Resume entry-point for Session 11

1. Read this file (`docs/STATE.md`) — top table + §5 "Next sub-steps".
2. Read `docs/discussion/2026-05-07-session-10.md` §2 + §6/§7/§8 (D-077 lock, 3 commits, Stage A iteration ledger, close summary).
3. Read `evidence/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/step_06_audit.md` Stage A re-run #2 section (clean baseline) — Session 11 picks up from this verdict.
4. Read `docs/decisions/D-077-stage6-audit-reviewer.md` only if needed for Stage B mechanics (§2.7 Stage B plan + §2.8 halt strategy).
5. Resume at **Step 6.9.8 — Stage B 40-page dispatch**. Command in `step_06_audit.md` "Stage B dispatch plan" section. **GATE**: user must explicitly authorize Stage B LLM dispatch ("go Stage B" / "授权 Stage B"). Stage A re-run #2 user retro is implicit per "下次再跑 Stage B" instruction; if user wants explicit retro on the 5 pages first, present `audit/stage6_review.json` summary before dispatching.

---

## 5b. Historical resume note (pre-Session-09)

**Session 01-07 全已闭合**。Phase 1 设计 + 实施起手 + Stage 1 dry-run + Stage B 用户 retro PASS 全部完成。**Phase 1 Step 6 (stage 2-7 + 全本) 是 Session 08 第一题**。

**Session 07 关键产物 (HEAD `652b09e`)**:
- 9 commits: design baseline (`6d4035c`) → phase switch (`c6c3660`) → 包骨架 (`bd6b0c7`) → 核心模块 + 77 tests (`841f5b9`) → 内置 plugins + dry-run CLI + 92 tests (`5c2251c`) → state/log sync (`98f2a63`) → mistralai import fix (`140ce34`) → Step 5 evidence (`4a3958c`) → Session 07 close (`652b09e`)
- 92 unit tests pass
- 50 pages 真实 OCR 数据 + Stage B PASS evidence 落盘 (`evidence/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/step_01_audit.md`)
- 累计成本: $0.05 (Mistral) + $0 (Anthropic max plan)

**Session 08 起手 user 三选**:
- **(a) 直接开 Step 6** — Claude 从 stage 2 page classify 一路实施到 stage 7 + 全本，撞 cap 就停等 user 决策
- **(b) 先升级 Anthropic 双轨** — 加 ANTHROPIC_API_KEY env 走 pay-as-you-go ~$30 全本，不撞 max plan 5h quota（per D-069 §2.4 零代码变更升级）
- **(c) 先复盘 dry-run OCR samples 调 prompt** — review `data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/ocr/page_*.md`，针对 known 小问题（HTML entity / 表格化）调 stage 5 翻译 prompt 或 stage 4 structure prompt

### 已锁的仓库形态（D-034 ~ D-053，Topic #3 产物）

```
. (mono-repo, 单 git repo, 所有 Phase 1-5)
├── pyproject.toml                # 根: uv workspace 伞包 (D-038)
│                                 #     hatchling backend (D-036)
│                                 #     requires-python = ">=3.11,<4.0" (D-037)
│                                 #     [tool.uv.workspace] members=["packages/*"] (D-039)
│                                 #     [dependency-groups] dev=[...] (PEP 735)
│                                 #     [tool.pytest.ini_options] testpaths+markers (D-041,042)
├── uv.lock                       # 单根 lock (D-039)
├── README.md                     # ✅ 已建 (D-048)
├── README.zh-CN.md               # ✅ 已建 (D-048)
├── CLAUDE.md                     # ✅ 已建 (D-049, 项目级 Claude 指引)
├── .gitignore                    # ⏳ 关 session 时建 (per D-044/045/046/050)
├── packages/
│   └── extractor/
│       ├── pyproject.toml        # name="cert-extractor", hatchling, runtime deps
│       ├── src/cert_extractor/
│       │   ├── __init__.py
│       │   ├── pipeline.py
│       │   └── plugins/{source,ocr,translator,exporter}/
│       └── tests/                # 测试与 src 平级 (D-040)
│           ├── conftest.py
│           ├── _fixtures/        # 下划线防 pytest collect (D-043)
│           │   ├── MANIFEST.md
│           │   ├── mini_sample.epub      # commit
│           │   └── pages/                # gitignored
│           ├── unit/             # @pytest.mark.unit (D-042)
│           ├── integration/      # @pytest.mark.integration
│           └── e2e/              # @pytest.mark.e2e
├── apps/                         # 未来 Phase 3；暂不入 workspace glob
├── docs/                         # ✅ 已建（共享）
├── pipelines/                    # YAML 配置（共享）
├── package.json                  # 未来加 (pnpm workspace)
├── evidence/                     # 实施期建（规则 A，commit）
├── failures/                     # 实施期建（规则 B，commit）
└── data/                         # 实施期建（runtime，gitignore per D-050）
    └── <cert_id>/runs/<run_id>/
        ├── raw/ ocr/ classified/ cleaned/
        ├── structured/ glossary/ translated/
        └── output/                       # GitHub Release 发版 (D-046)
```

> Canonical pyproject.toml + tests + .gitignore + data 范例见 [`docs/discussion/2026-05-06-session-02.md`](discussion/2026-05-06-session-02.md) §4.1 + §4.2 + §4.3 + §4.5。

### Session 06 ✅ Closed — Topic #7 全闭合 ★ Phase 1 实施 gate 解锁

| Q | OQ | D 锁定 | 一行 spec |
|---|---|---|---|
| — | OQ-06 | (status) | ✅ user 答 max 20 plan ok |
| — | OQ-07 | (status) | ✅ user 答 Scale plan 升级了 |
| Q32 | OQ-35 | **D-069** | Claude Agent SDK + max plan via OAuth；零额外费用起步；**独立 ADR**: `docs/decisions/D-069-anthropic-via-agent-sdk.md` |
| Q33 | OQ-36 | **D-070** | Mistral Python SDK + 50 pages dry-run + user 审核 → 全本 |
| Q34 | OQ-37 | **D-071** | 软硬 cap 三档（wall-time/cost/fail count）+ WARN 等人决 + 重跑上限；**独立 ADR**: `docs/decisions/D-071-budget-cap-and-emergency-halt.md` |
| Q35 | OQ-38 | **D-072** | per-stage cost 进 evidence + run summary 写 cost.json |
| Q36 | OQ-39 | **D-073** | 单 chapter dry-run → user retro → 全本；与规则 C retro 对接；**独立 ADR**: `docs/decisions/D-073-phase1-launch-strategy.md` |

> 历史: Session 01-06 全闭合。Topic #1~#7 全 ✅。**Phase 1 设计阶段彻底收尾**。

### 接续动作（Session 07 起手 / 新 Claude 接手）

1. 读本文件 (`docs/STATE.md`) — 30 秒概览（注意 **Phase 1 实施 gate ✅ 解锁**）
2. 读 `docs/discussion/2026-05-06-session-06.md` §2 + §6（5 D + 关 session 总结 + §6.6 就绪状态总览）
3. 必要时读 7 份 ADR (`D-058` schema / `D-061` reviewer / `D-063` audit failure / `D-065` plugin loading / `D-069` Anthropic SDK / `D-071` budget cap / `D-073` Phase 1 启动)
4. 必要时回看 session-01~05 §2 + §6 复习 D-001~D-068
5. **当前位置**: Topic #7 ✅ 闭合 + **Phase 1 实施 gate 解锁**。Session 07 起手是 user 选择题:
   - **(1) 进入 Phase 1 实施**（design 阶段不写代码 → 解锁；起手实施 dry-run 单 chapter per D-073）
   - **(2) 保留设计阶段** 开 Topic #8 (Phase 2-4 形态) / Topic #9 (Phase 1 实施前 retro 触发条件)
6. 进 Session 07 时按 user 选择执行

---

## 6. 文件权威指南 / Where to Find What

| 想知道...... | 看这里 |
|---|---|
| 项目当前状态全貌 | **本文件 (`docs/STATE.md`)** |
| 某条决定为什么这么定 | session 日志（搜 `D-NNN`），重大决定还有 `docs/decisions/D-NNN-*.md` |
| 已经讨论过什么 | `docs/discussion/` 目录按日期排 |
| 操作守则 / 命名规范 | `docs/discussion/README.md` + `docs/decisions/README.md` |
| 抽检证据 | `evidence/` 实施期落点；模板见 `docs/templates/evidence-template.md` |
| 失败归档 | `failures/` 实施期落点；模板见 `docs/templates/failure-template.md` (D-032) |
| 用户硬规则 | User CLAUDE.md 的 `<personal_operating_principles>` |
