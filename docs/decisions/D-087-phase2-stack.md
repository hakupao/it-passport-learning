# D-087 — Phase 2 stack: Next.js 15 + Vercel AI SDK on Vercel (TS strict + SSR)

| 字段 | 值 |
|---|---|
| Status | **LOCKED final** 2026-05-19 Session 28 Turn 4（user terminal sign-off path α）|
| 类型 | Phase 2 stack lock (sub-ADR of D-086 §2.4 + D-085 §2.5 form-derived requirements) |
| 主题归属 | Topic #8 — Phase 2 detail spec, step 4 of D-083 §5.3 (stack-only per Q1=a; AI/data/cost cap deferred) |
| Supersede? | 否（D-001 ~ D-086 unchanged）|
| Linked OQ | OQ-40 (β 开放时间窗) — Q7=a Vercel 让 β 时只升级 plan + 加 domain 即可 |
| Session 日志 | `docs/discussion/2026-05-19-session-28.md` Turn 3 |
| 评审 (Rule D) | Writer = Claude Opus 4.7；Reviewer = user 终审（同 Phase 2 path α 模式）|

---

## 1. Context

D-083 + D-084 + D-085 + D-086 已 LOCKED。Phase 2 form = iii+iv Hybrid + Chat (D-085)，portability strictness = s1 strict web stack (D-086)。step 4 起步需要具体技术栈。

Session 28 Round 1 (meta-framing):
- Q1=(a) 本场只锁 D-087 stack；D-088 (AI 模型) / D-089 (数据源) / D-090 (cost cap+RAG) 推 Session 29+
- Q2=(b) topic-grained ADR split (Phase 1 ADR pattern)
- Q3=(β) 轻 PoC: spike token + cost cap 数字 (corpus measurement + Anthropic pricing math)
- Q4=(g2) ADR 颗粒度 = mid level (framework + language + deployment + rendering mode)

**β PoC key findings** (per Session 28 Turn 2):
- Whole-book v1.0.3 = **~0.84M tokens (含 glossary)** → **FITS Claude 1M context (Sonnet 4.6 / Opus 4.7) single-shot**
- D-085 §5.3 risk "whole-book needs RAG" 对 α-now 单用户 **overcautious** — RAG/chunking 推到 β/γ 多用户 phase 即可
- Per-call cost @Sonnet 4.6 with prompt caching: whole-book $0.25 / chapter $0.022 / question $0.008
- Daily heavy use estimate: **~$1.22 cached** vs ~$9.42 uncached → **prompt caching is non-optional** for D-090 cost cap

Session 28 Round 2 (Q5/Q6/Q7/Q8 all `a` = recommended path):
- Q5=(a) Next.js 15 (React 19) + Vercel AI SDK
- Q6=(a) TypeScript strict
- Q7=(a) Vercel
- Q8=(a) SSR

## 2. Decision (本 ADR 的 lock)

### 2.1 Framework = Next.js 15+ (React 19+, App Router)

Phase 2 webapp 用 **Next.js 15** 系列（撰写时 latest stable），**App Router**（server components 默认），**React 19+**。

理由：
- D-085 §2.4 / §2.5 form-derived: streaming Chat UI + Hover popover + 3-tab navigation — **Vercel AI SDK + Next.js** 是这个域 industry-best (`@ai-sdk/anthropic` 原生 + `useChat` / `streamText` hooks)
- D-086 §2.1: web stack — Next.js 100% web-deployable，符合 s1 strict
- 社区最大 = onboarding + AI 协作 cost 最低
- React 19 + RSC 让 server-side LLM call (per §2.4 SSR) 与 client-side UI 自然解耦

### 2.2 Language = TypeScript strict

`tsconfig.json` 使用 `"strict": true` (+ `noUncheckedIndexedAccess`, `noImplicitAny`, 等 strict suite)。

理由：
- 长期可维护性 — Phase 1 Python 已经强制 types-only-where-needed；Phase 2 frontend 借鉴
- AI 协作（与 Claude 配对）受益于类型上下文
- Vercel AI SDK + React 19 都 TS-first，跟着主流

### 2.3 Deployment target = Vercel

- **α-now**: Vercel Hobby (free) tier，本地 `vercel dev` 跑 + push to main → preview deploy。
- **β-future**: Vercel Pro tier ($20/mo) + 加 custom domain；**zero code rewrite** per D-086 §2.1。
- **γ-future**: 同 plan，加 SSO / Team；超 Vercel quota 时考虑 Cloudflare/self-host 迁移（D-080 v1.1 §8 amendment path）。

理由：
- Vercel x Anthropic 整合最深 (Vercel AI SDK 是 Vercel 维护)
- Hobby tier 对 α 单用户绰绰有余 (100K function invocations/month free)
- β 升级是 click + $20/mo，不动 code

### 2.4 Rendering mode = SSR

- **Server-side rendering** via Next.js App Router + Server Actions + API routes
- LLM API calls **strictly server-side** (Anthropic API key 不暴露给 browser)
- Streaming Chat 走 server-side `streamText` → client `useChat` hook
- Static parts (Study mode 章节内容) 用 RSC (React Server Components) 服务端渲染 + cache

理由：
- API key 安全（server-side only，per OWASP web security best practice）
- D-086 §2.1: β = 只换 hosting → SSR 模式在所有 host (Vercel / Cloudflare / self-host) 都跑
- Streaming Chat 需要 server-side relay（直接 browser→Anthropic 会暴露 key）
- Performance: RSC + streaming 是 React 19 + Next.js 15 的优化路径

### 2.5 AI integration = Vercel AI SDK + `@ai-sdk/anthropic`

- 用 **Vercel AI SDK v5+** 的 `streamText` / `generateText` API（server-side）
- 用 `useChat` / `useCompletion` hooks（client-side）
- **Prompt caching 原生支持** via `providerOptions: { anthropic: { cacheControl: ... } }` — D-090 cost cap 的 critical enabler
- D-088 (Session 29+) 会锁具体 model (Sonnet 4.6 / Opus 4.7 / Haiku 4.5) 与 prompt cache policy detail

### 2.6 Build tooling = Next.js native (Turbopack-ready)

- Next.js 15 自带 build pipeline + Turbopack (默认 dev mode)
- 不引入第三方 bundler (Vite / Webpack manual config) — Next.js 默认值即可
- ESLint + Prettier 标配（具体 config 推 D-091+ / implementation 阶段）

### 2.7 Component / bundle approach

- **Server Components (RSC) 默认** — 减少 bundle size
- **Client Components (`"use client"`)** 仅在需要 interactivity / state hooks 时 (Quiz interaction / Chat input / Top tabs switching)
- **不锁** UI library / state mgmt library / icon set / 字体 — D-091+ territory

## 3. Out of scope (推 Session 29+)

| 项目 | 处理 |
|---|---|
| **AI model 选择** (Sonnet 4.6 / Opus 4.7 / Haiku 4.5 / version pinning) | **D-088** (Session 29+) |
| **AI provider 多 vendor strategy** (Anthropic only? GPT fallback? Local Llama?) | D-088 |
| **Prompt caching policy detail** (which prompts to cache; cache breakpoint placement) | D-088 / D-090 |
| **数据源 contract** (v1.0.3 zip 解压 / static JSON serve / Vercel Blob ingest / DB) + manifest 结构 | **D-089** |
| **LLM cost cap 数字** (三档 cap 复用 D-071) | **D-090** |
| **RAG / chunking strategy** (per β PoC: 推到 β/γ 多用户阶段；α-now 不需) | D-090 或 β 时新 ADR |
| State management library (Zustand / Jotai / native `useState`) | D-091+ / implementation |
| UI library (shadcn/ui? Radix? Tailwind v4? Headless UI?) | D-091+ / implementation |
| Icon set + 字体 + i18n approach | D-091+ / implementation |
| Test stack (Vitest / Playwright / Storybook) | D-091+ / implementation |
| Bundle size budget / Lighthouse targets | D-091+ / implementation |
| Authentication (none for α; later β/γ) | β-future ADR |
| Database (none for α; possibly Vercel Postgres for β) | β-future ADR |
| Specific Vercel project config (env vars / preview branches) | implementation |
| Custom domain | β-future / OQ-40 trigger |

## 4. Rejected alternatives

| 候选 (Q5/Q6/Q7/Q8 b-e) | 拒绝原因 |
|---|---|
| (Q5-b) SvelteKit + AI SDK Svelte | 更小 bundle + 更 clean DX 是优点，但 Vercel AI SDK Svelte 比 React 版本社区小，streaming Chat patterns 更少现成 example；项目优先 reduce risk |
| (Q5-c) Astro + React islands | content-first 适合 Study 静态阅读，但 Quiz + Chat 是 high-interactivity 主线，islands 模式有 friction |
| (Q5-d) Vite SPA + 独立 Python FastAPI BE | 双 repo / monorepo 复杂度；API key 处理需独立 BE 部署；多 parts；α-now 不必要 |
| (Q5-e) Remix / SolidStart / Nuxt | 用户基数较小；Vercel AI SDK 在这些上不是首选；ecosystem cost 不划算 |
| (Q6-b) TS loose | 起手 strict 避免后期补 type 的 tech debt |
| (Q6-c) JS only | 放弃类型系统不值得；现代 JS 项目 TS-first 已是默认 |
| (Q7-b) Cloudflare Pages + Workers | AI SDK 兼容 (Cloudflare AI 可用 Anthropic via Workers AI Gateway)，但 Vercel x Anthropic 整合更深；Workers 限制 (CPU time / cold start) 是 future concern |
| (Q7-c) 自建 VPS / Docker | 多 ops work；α-now 单 user 不需要 |
| (Q7-d) GitHub Pages | 仅 static，与 Q8=a SSR 完全不兼容 |
| (Q7-e) Defer | 违反 D-086 §2.1 "β = 只换 hosting" intent；不锁 = 风险 |
| (Q8-b) SSG | 不能 server-side secret-keyed LLM call；要么暴露 key，要么必须配 serverless endpoint = 实际还是 server-side ⇒ SSR 直接更清楚 |
| (Q8-c) Hybrid (Study SSG / Quiz+Chat client) | 增加复杂度；Next.js 15 + RSC 已经默认 hybrid (RSC for static / Client Components for interactive)，不需 Astro-style 显式 island |
| (Q8-d) Pure SPA + 独立 BE | 同 Q5-d，多 parts |
| Q1=b/c/d (本场锁多 ADR) | user Q1=a explicit; 单 ADR 单 session 节奏稳健 |
| Q3=α (无 PoC) | user Q3=β explicit; cost 数字必须 baseline 才能 informed D-090 |
| Q4=g1 (高 level only family) | user Q4=g2 explicit; framework family + 几个关键决定都要锁 |
| Q4=g3 (deep with version pinning) | g2 留 version (e.g. Next.js 15+, Sonnet 4.6 vs 4.7 具体型号) 给 D-088 / implementation；g2 = framework + language + deploy + rendering 已足够 |

## 5. Consequences

### 5.1 Positive
- **Streaming Chat UI = path-of-least-resistance**: Vercel AI SDK + React + `useChat` hook = 几十行 client code 就能跑 streaming
- **Prompt caching 原生**: D-090 cost cap baseline (per Session 28 β PoC) 直接可行
- **Vercel deploy 0-config**: Hobby tier 足够 α; Pro $20/mo 升级路径清晰
- **TypeScript strict = 长期 tech debt 低**
- **SSR = API key 安全 + β-ready**: 同 codebase 在 Vercel / Cloudflare / self-host 都跑 (per D-086)
- **生态最大**: AI 协作 + future 维护者 onboarding cost 低
- **Next.js 15 + RSC** 自然实现 D-085 §2.3 (Top tabs preserve state) + §2.4 (mode-dependent Chat scope server-side)
- **OQ-40 β 切换最简单**: Hobby → Pro + domain，code 不动

### 5.2 Negative / Risk
- **Vercel vendor lock-in**: Vercel-specific features (KV / Cron / Edge config / Marketplace) 会逐渐渗透；mitigated by Next.js 是 OSS framework，Cloudflare / self-host 也能跑 Next.js
- **Next.js learning curve**: App Router + RSC + Server Actions 是新 API 集合 (React 18 → 19 transition)
- **Bundle size > SvelteKit**: 现代 device 不严重，但 mobile-Safari 旧设备可能感觉
- **Server-side LLM calls 需 deploy 才能 fully test**: mitigated by `vercel dev` 本地 simulate
- **React 19 + App Router 还在快速演进**: API 偶尔 breaking; mitigated by 锁 minor version + Vercel SLA

### 5.3 Mitigation
- Vendor lock-in: 每条 Vercel-specific feature 触发 D-080 v1.1 §8 amendment + 记录 Cloudflare/self-host 等价方案
- 复杂度: Phase 1 cert-extractor 已经 Python + uv + Mistral SDK + Anthropic SDK + pydantic + pytest 复杂度，team has experience
- Bundle: Next.js 15 + Turbopack + RSC 默认已 optimize；Lighthouse budget 推 D-091+
- Server-side test: `vercel dev` + Playwright (D-091+) 可以本地完整 simulate
- React 19 churn: 锁 `next@~15.x.x` minor + 等 patch release，不 chase canary

## 6. Linked / supersede / amend

- **Supersedes**: 无
- **Amends**: 无
- **Linked**:
  - **D-083 §2.1 + §3** = parent (Phase 2 + intent signal)
  - **D-085 §2.4 + §2.5** = form-derived requirements (streaming Chat + Hover popover + 3 tabs) → Next.js + Vercel AI SDK 最佳匹配
  - **D-086 §2.1 + §2.2** = s1 strict web stack → Next.js 完全符合
  - **D-069** = Anthropic SDK 经验 (Phase 1 pipeline used `anthropic` Python SDK; Phase 2 用 `@ai-sdk/anthropic` JS) — provider 同源
  - **D-071** = three-tier cost cap pattern (复用 for D-090 LLM cost cap)
  - **D-080 v1.1 §8** = amendment policy for future Vercel-specific decisions
- **Cited by future**:
  - **D-088** AI model (will lock Sonnet 4.6 / Opus 4.7 / Haiku 4.5 + version + prompt cache policy on top of D-087 §2.5 AI SDK choice)
  - **D-089** data source contract (v1.0.3 zip / static JSON / DB — 多个选项 D-087 都支持)
  - **D-090** LLM cost cap (will baseline on D-087 §2.5 prompt caching enabled + β PoC numbers)
  - **D-091+** state mgmt / UI library / icon / 字体 / i18n / test stack
  - Phase 2 implementation milestones each cite D-087 §2.1-§2.7 as architectural baseline

## 7. Sign-off

| 角色 | 名字 | 时间 | 状态 |
|---|---|---|---|
| 撰写人 | Claude Opus 4.7 (1M ctx) | 2026-05-19 Session 28 Turn 3 | **LOCKED final** (path α one-step sign-off) |
| Reviewer #1 (per Rule D) | user (hakupao) | 2026-05-19 Session 28 Turn 4 | **APPROVED** — Q9 = α, ACK D-087 LOCKED draft as-is |

Per D-019 + Rule D: Writer (Claude) ≠ Reviewer (user 终审)。本 ADR LOCKED final at Session 28 Turn 4 commit。后续 D-088+ 引用本 ADR §2 不需 amendment。

---

## End of D-087
