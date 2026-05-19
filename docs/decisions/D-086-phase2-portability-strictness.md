# D-086 — Phase 2 β-ready portability strictness = s1 strict web stack (高 level lock)

| 字段 | 值 |
|---|---|
| Status | **LOCKED final** 2026-05-19 Session 27 Turn 3（user terminal sign-off path α）|
| 类型 | Phase 2 portability strictness lock (sub-ADR of D-083 §2.3 + §3 intent signal) |
| 主题归属 | Topic #8 — Phase 2 detail spec, step 3 of D-083 §5.3 |
| Supersede? | 否（D-001 ~ D-085 unchanged；D-083 §2 + §3 unchanged）|
| Linked OQ | OQ-40 (β 开放时间窗) 在 D-086 lock 之后含义更具体（β = hosting swap，不是 code rewrite）|
| Session 日志 | `docs/discussion/2026-05-19-session-27.md` Turn 2 |
| 评审 (Rule D) | Writer = Claude Opus 4.7；Reviewer = user 终审（同 D-083 ~ D-085 path α 模式）|

---

## 1. Context

D-083 §3 starting hypothesis 列了 **Q7 = s1** strict web stack 作 intent signal not §2 lock。D-085 form mainline（Top tabs / Hover popover / mobile-ready）已暗含 web-leaning。Session 27 step 3 = 把 portability strictness 升级成显式 §2 lock。

Session 27 Round 1：
- Q1=(a) 本场只跑 step 3（D-086 only；D-087+ 推下场）
- Q2=(α) 直接 confirm s1 as §2 lock，不开 reverse window
- Q3=(g1) 高 level lock 颗粒度：只锁 s1/s2/s3 选择，concrete β-ready criteria 推下场
- Q4 = n/a

因 Q3=g1，本场无 Round 2 sub-items 需钻；Turn 2 直接 propose ADR draft（同 Session 24 D-083 Q5=a 极薄 lock 模式）。

## 2. Decision (本 ADR 的 lock)

### 2.1 Phase 2 β-ready portability strictness = s1 strict web stack

Phase 2 设计 + 实施都以 **web 技术栈** 为目标平台：
- α-now 阶段：本地 dev server (per D-083 §2.3 α 私有自用)
- β-future 阶段：换 hosting target (per D-083 §2.3 + OQ-40)，**不 rewrite code**

### 2.2 "Web stack" 抽象层定义

"Web 技术栈" 在 D-086 中是抽象目标，不锁具体 framework：

- **必须能 deploy 到 browser**：output 为 HTML/CSS/JS（运行时） + 一个能跑这套的 host (local dev / static hosting / SSR)
- **必须 mobile-ready**：能在主流 mobile browser 跑 (per D-085 §2.3 Top tabs mobile-ready 已暗含)
- **不锁** specific framework / language / SSR vs SPA / static vs dynamic — 都是 D-087 territory

### 2.3 What s1 categorically locks OUT (不可走的方向)

以下方向因为违反 s1 而 categorically rejected：
- **Desktop-native-only**（PyQt / Tkinter / wxPython / Swift macOS app / WinForms 等）
- **Mobile-native-only**（iOS Swift / Android Java / Flutter native-only / Kotlin Multiplatform without web target）
- **CLI-only Python script with no UI**（除非作为 webapp 的内部 worker，永不展示给 user）
- **Electron / Tauri / Wails as primary delivery**（混合 web + native shell）：α-now 不 ban native shell（β 时若想加 desktop wrapper 是 future option），但 **不能让 native shell 替代 browser-deployable contract**（s1 = β 换 hosting，不是 β 换 packaging）

### 2.4 Specific stack choice = D-087 territory

本 ADR **不锁** 以下：
- Next.js / Astro / SvelteKit / SolidStart / Vite+SPA / 等
- TypeScript / JavaScript-only / WASM
- SSR vs SPA vs SSG vs ISR
- Tailwind / Vanilla CSS / CSS-in-JS
- React / Vue / Svelte / Solid
- FastAPI / Node / Cloudflare Workers / Vercel functions (back-end if any)

这些是 D-087 (Phase 2 stack) 的工作。Session 28+ 锁。

### 2.5 Concrete β-ready criteria 推下场

per Q3=g1 高 level lock，以下 criteria **不在 D-086 §2 lock 范围**，全部 deferred to D-087+：
- Deployment target list (Vercel / Cloudflare Pages / GitHub Pages / Netlify / 自建 VPS / 等)
- Mobile browser specific support (Safari 17+ / Chrome Android 等)
- Code organization rules (业务逻辑层 vs UI 层是否必须严格分离 / state mgmt 范围 / etc)
- "Lock out β" 具体测试 (e.g., 是否禁止 macOS-only API；是否禁止 Python-only state)
- LLM cost cap (per D-085 §5.3) — D-087+
- AI 模型 / 数据源 contract — D-087+

## 3. Out of scope (推 Session 28+)

| 项目 | 处理 |
|---|---|
| 具体 framework / language pick (Next.js / Astro / 等) | **D-087** (Phase 2 stack lock) |
| Deployment target list (Vercel / Cloudflare / GitHub Pages 等) | D-087 |
| Mobile browser specific support | D-087 |
| Code organization rules (business / UI 分层严格度) | D-087 |
| "Lock out β" 具体测试 | D-087 |
| LLM cost cap for whole-book Chat scope (D-085 §5.3) | D-087+ |
| AI 模型 (Claude / GPT / local) | D-087+ |
| 数据源 contract (read-only v1.0.3 zip / static JSON serve / DB) | D-087+ |
| State mgmt details / routing / data fetch | 实现层 |
| Offline support / PWA installable / service worker | D-087+ |
| 多用户 / hosting | out of Phase 2 scope per D-083 §2.3 |

## 4. Rejected alternatives

| 候选 | 拒绝原因 |
|---|---|
| (s2) 中等：核心逻辑 Python portable + UI 灵活 | D-085 form mainline (Top tabs + Hover popover + mobile-ready) 内在是 web；Python core + JS UI 需 Python-web bridge (FastAPI + JS frontend)，多一层复杂度 vs 直接全 web；s1 zero migration cost 更划算 |
| (s3) 松：本地 Python script 起步，β 时再决重写还是 host | 显式违反 D-083 §2.3 "α now + β-ready 设计今天不能 lock out β"；"再决" = 把 β-ready 风险 unlock 给 future |
| Native-first（iOS Swift / Android Kotlin / desktop GUI） | 违反 D-085 form mainline (3 tabs + Hover popover 是 web 心智)；β 时打开给 web 用户的路径几乎不可能保留 |
| Q2=β reverse window | user Q2=α explicit confirm，无需 1-2 turn 重评 |
| Q3=g2/g3/g4 锁 concrete criteria | user Q3=g1 explicit；criteria 推下场不是 lazy，是 Q3=g1 + Q1=a 的明确意图（"只跑 step 3"）|
| Skip D-086 直接进 D-087 | 违反 D-083 §5.3 step 3 entry checklist + D-019 设计阶段约束 |

## 5. Consequences

### 5.1 Positive
- **β migration cost = hosting swap only**：D-083 §2.3 + OQ-40 在 D-086 lock 后含义具体 — α → β 只换 hosting，不动 code
- **Mobile-ready by default**：browsers run everywhere；D-085 Top tabs / Hover popover 实施时不需要 mobile-specific 改造
- **Multiple deploy options preserved**：Vercel / Cloudflare Pages / GitHub Pages / Netlify / 自建 VPS — D-087 自由度
- **Phase 5 cert-extractor 通用化 path 不被阻塞**：Phase 2 webapp 是 v1.0.3+ output 的消费者，Phase 5 改 cert-extractor 不影响 Phase 2 web stack
- **简化心智模型**：web tech 是 mainstream，user / future 协作者 onboarding 成本低

### 5.2 Negative / Risk
- **Web stack 启动复杂度比 Python script 高**：build tooling / framework decision / hosting concept 都是 D-087 要处理的
- **Mobile Safari quirks 是 known cost**：触屏 hover (D-085 §2.5 Hover popover) 在 mobile 需要 fallback (long-press / tap) — 实施层
- **Server-side state 风险**（β-future）：如果 β 时需要 per-user state，必须有 API 层；α-now state 是 local file（per D-085 §2.2 Resume last 实现）
- **Power-user features 比 desktop 难**：offline-first / native filesystem access / 系统通知 等 — D-087+ 评估是否要 PWA + service worker
- **D-087 stack choice 错了 = future migration cost**：mitigated by D-080 v1.1 §8 amendment pattern + Phase 2 RETRO 评估

### 5.3 Mitigation
- D-087 stack lock 可以做 PoC if user wants (Session 28+)
- Phase 2 RETRO（per Rule C）评估实际碰到的 portability 问题
- Whole-book Chat scope LLM cost cap (D-085 §5.3) 必须在 D-087+ 一起锁
- 若实施时发现 s1 太严格（e.g. desktop-only feature 真有 ROI），走 amendment path (D-080 v1.1 §8 模式) — D-086 status: AMENDED v1.1

## 6. Linked / supersede / amend

- **Supersedes**: 无
- **Amends**: 无
- **Linked**:
  - **D-083 §2.3** = parent ADR (α-now + β-ready)
  - **D-083 §3** = intent signal source (Q7=s1)
  - **D-085 §2.3 + §2.5** = form mainline 内含 web-leaning (Top tabs / Hover popover) — D-086 把这层 implicit 转 explicit
  - **OQ-40** = β 开放时间窗 / 触发条件 — D-086 lock 后 OQ-40 含义清晰为 "什么时候换 hosting target"
  - **D-080 v1.1 §8** = amendment policy for future D-086 thicken (if needed)
- **Cited by future**:
  - **D-087** = Phase 2 stack lock（具体 framework / language / SSR vs SPA / 等）
  - **D-088+** = AI 模型 / 数据源 contract / LLM cost cap
  - Phase 2 实施阶段每个 milestone

## 7. Sign-off

| 角色 | 名字 | 时间 | 状态 |
|---|---|---|---|
| 撰写人 | Claude Opus 4.7 (1M ctx) | 2026-05-19 Session 27 Turn 2 | **LOCKED final** (path α one-step sign-off) |
| Reviewer #1 (per Rule D) | user (hakupao) | 2026-05-19 Session 27 Turn 3 | **APPROVED** — Q5 = α, ACK D-086 LOCKED draft as-is |

Per D-019 + Rule D: Writer (Claude) ≠ Reviewer (user 终审)。本 ADR LOCKED final at Session 27 Turn 3 commit。后续 D-087+ 引用本 ADR §2.1 + §2.2 不需 amendment。

---

## End of D-086
