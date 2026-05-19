# Phase 2 实施 PLAN — 15-step / 3 weeks full-time

> **Ground truth source**: D-091 §2.3（15-17 step / ~14.5-16.5 day / Tier 3 全套 evidence）
> **节奏 driver**: D-019 Q4=d 自适应 slow-pace（D-NNN-worthy → 4Q；micro → propose-first；user 可任意 override）
> **实施 gate**: 2026-05-19 Session 32（user kickoff "开 Phase 2 实施 gate"）
>
> 本 PLAN 是 **live document**；每 step 完成后 `_progress.json` + `evidence/phase2/step_NN_<topic>/` 落盘；PLAN 本身 amendment 走 §5 tripwire cascade。

| 字段 | 值 |
|---|---|
| 起手 | 2026-05-19 Session 32 |
| 总 step 数 | **15** |
| 总 wall | **~3 weeks full-time** (~14.5 day) |
| Tier | **Tier 3** = Phase 1 carry-over + 5 Phase 2 specific additions |
| 评审 | Writer/Reviewer 分离 per Rule D；path α user terminal sign-off |
| 数据源 | v1.0.3 `output/` JSON (D-089 FsDataSource default α / BlobDataSource β-ready) |
| AI 模型 | Opus 4.7 pin + Hybrid + system+glossary ephemeral cache (D-088) |
| 成本 cap | D-090 $5/$15/$30 daily + per-query $5 + α-silent / β-D071-graduated |
| Stack | Next.js 15 + React 19 + TS strict + Vercel AI SDK + Vercel + SSR (D-087) |

---

## 1. Step 路线

### Module A — Scaffold (3 step / 4.5 day)

| Step | Topic | Output | Evidence | Wall |
|---|---|---|---|---|
| **1** ✅ DONE 2026-05-19 | Next.js 15 scaffold + TS strict + Vercel deploy hello-world | `apps/web/` Next.js **15.5.18** + Tailwind 4 + ESLint 9 + app router + `src/` + `@/*` alias + TS strict + `noUncheckedIndexedAccess` + Vercel project `bojiangs-projects/web` ✅ **LIVE @ https://web-mu-sandy-78.vercel.app/** (HTTP/2 200) | `step_01_scaffold/{tree_outline.md, vercel_deploy_dpl_2JMygfKhYsAJnZZZdVskPAKSRSUy.log, step_01_audit.md}` + 1 failure archive (`failures/phase2/step_01_scaffold_attempt_001.md` — Next.js 16 drift) | actual wall ~25 min (vs estimate 1 day — well under) |
| **2** ✅ DONE 2026-05-19 | DataSource interface + FsDataSource adapter + index.json v2 backfill | `apps/web/src/lib/data/{DataSource.ts, FsDataSource.ts, types.ts}` + `scripts/build_index_v2.py` + `apps/web/_fixtures/v1.0.3/index.v2.json` (16 chapters[] + 908 glossary_index + 2455 entity_by_id per D-089 §2.2) + vitest@4.1.6 wired + Vercel preview deploy ✅ READY @ https://web-pi06buffc-bojiangs-projects.vercel.app (build 37s, no regression vs Step 1) | `step_02_datasource/{tree_outline.md, build_log.txt, test_results.txt, vercel_deploy_dpl_7LqtYNHvEuFSdiePWj5k8KqiYKoW.log, step_02_audit.md}` + 13/13 unit tests ✅ in 158ms | actual wall ~30 min total Session 33 wall (vs estimate 2 day — well under; γ tripwire candidate per `step_02_audit.md` §Wall actual vs PLAN estimate) |
| **3** | 4 per-scope assembly fns + corpus boot loader (FS-at-boot per D-089 β PoC) | whole-book / chapter / question / glossary-only scope fns | `step_03_assembly/` + integration test | 1.5 day |

### Module B — AI 路径 (5 step / 5.5 day)

| Step | Topic | Output | Evidence | Wall |
|---|---|---|---|---|
| **4** | Vercel AI SDK + `@ai-sdk/anthropic` + Opus 4.7 pin + cache_control block | streaming AI hello-world + `cache_control: ephemeral` on system+glossary (D-088 §2.3) | `step_04_ai_sdk/` + `cache_audit_<date>.md` | 1 day |
| **5** | Chat mode wiring (whole-book scope, D-085) | `/api/chat` streaming endpoint + cache_creation/cache_read metadata capture | `step_05_chat/` + 第一周 cache hit retro (D-088/D-091 §2.5(β) tripwire 数据 source) | 1.5 day |
| **6** | Quiz Explain mode wiring (question scope, D-085) | `/api/quiz/explain` + scope-specific assembly | `step_06_quiz/` + integration test | 1 day |
| **7** | Study term hover mode wiring (glossary scope, D-085) | `/api/glossary/hover` + popover client API | `step_07_glossary/` + TTFT 测量 (term hover ≤7s 目标 per γ PoC) | 1 day |
| **8** | 1-retry-no-fallback + δ-all-tripwire detector (D-088 §2.4) | retry middleware + tripwire alert | `step_08_retry/` + failure scenarios test | 1 day |

### Module C — UI & UX (4 step / 4 day)

| Step | Topic | Output | Evidence | Wall |
|---|---|---|---|---|
| **9** | Chat UI (streaming + history + Resume per D-085) | `<Chat />` component + history persistence + Resume tab | `step_09_chat_ui/` + screenshot | 1.5 day |
| **10** | Quiz Explain UI (modal + busy state for ⚠️ 22-42s TTFT) | `<QuizExplain />` modal + busy hint | `step_10_quiz_ui/` + UX QA | 1 day |
| **11** | Study term hover UI (popover for ✅ 6-7s TTFT) | `<TermPopover />` + glossary lookup wiring | `step_11_term_popover/` + UX QA | 0.5 day |
| **12** | Layout / navigation / 3 mode 切换 + i18n 三语 base (ja/en/zh) | `<Layout />` + mode tab + locale switcher | `step_12_layout/` + i18n smoke | 1 day |

### Module D — Polish + Deploy (3 step / 2.5 day)

| Step | Topic | Output | Evidence | Wall |
|---|---|---|---|---|
| **13** | D-090 cap implementation + env var switch + cost dashboard widget | per-query/daily cap + `PHASE2_CAP_MODE` env switch + α-silent log / β-graduated warn-confirm-halt | `step_13_cap/` + cap_trigger E2E | 1 day |
| **14** | Lighthouse audit (≥90 perf) + i18n 三语 complete + a11y smoke | Lighthouse ≥90 mobile+desktop + 3 lang full strings | `step_14_polish/` + `lighthouse_<date>.md` | 1 day |
| **15** | E2E Playwright (Chat happy + cap trigger) + production Vercel deploy + custom domain (β-ready optional) | Playwright spec + prod deploy URL + (β optional) domain DNS | `step_15_deploy/` + `e2e_<run>.json` + `vercel_deploy_prod.log` | 0.5 day |

**总计**: **15 step / ~14.5 day / 3 weeks full-time**。

---

## 2. Evidence 落点 (D-091 §2.2 全套清单 + Q3=a Phase 1 同构)

```
evidence/phase2/
├── README.md                              # orientation
├── step_01_scaffold/                       # step 1 artifacts
│   ├── tree_outline.md                     # apps/<dir>/ 文件树
│   ├── vercel_deploy_<sha>.log             # Phase 2 specific
│   └── preview_screenshot.png              # preview URL screenshot
├── step_02_datasource/
├── step_03_assembly/
├── step_04_ai_sdk/
│   └── cache_audit_<date>.md               # Phase 2 specific (D-088 §2.3 实测)
├── step_05_chat/
│   └── cache_audit_<date>.md               # 第一周 retro
├── step_06_quiz/
├── step_07_glossary/
│   └── ttft_<date>.md                      # Phase 2 specific (D-085 §2.4 mode latency)
├── step_08_retry/
├── step_09_chat_ui/
├── step_10_quiz_ui/
├── step_11_term_popover/
├── step_12_layout/
├── step_13_cap/
├── step_14_polish/
│   └── lighthouse_<date>.md                # Phase 2 specific
└── step_15_deploy/
    ├── e2e_<run>.json                      # Phase 2 specific
    └── vercel_deploy_prod.log              # Phase 2 specific

failures/phase2/
├── README.md
└── step_NN_<topic>_attempt_X.md            # per Rule B (flat per Q3=a)

docs/phase2/
├── PLAN.md                                 # 本 file (live)
└── (sub-PLAN per major checkpoint, if needed)

_progress.json                              # 顶层 (Phase 2 specific tracking) — 实施期建
RETROSPECTIVE_phase2.md                     # Phase 2 收尾 (Rule C) — Phase 2 全完成后建
```

---

## 3. 节奏 / 评审 (per Q4=d 自适应)

| 项 | 节奏 |
|---|---|
| **D-019 slow-pace 适用** | Q4=d：D-NNN-worthy（新 ADR / 架构 / 不可逆 / cross-step coupling）→ slow-pace 4Q；纯编码 micro → propose-first；user 可任意 override |
| **Step boundary 评审** | 每 step 完成 = `_progress.json` mark done + evidence 落盘 + user terminal sign-off path α |
| **Writer/Reviewer 分离** | Rule D：writer = main session；reviewer = sub-agent dispatch（`code-reviewer` / `verifier`）或 user；不自审 |
| **失败归档** | Rule B：任 attempt failure → `failures/phase2/step_NN_<topic>_attempt_X.md`，不删 |
| **Phase retro** | Rule C：Phase 2 收尾 `RETROSPECTIVE_phase2.md` |
| **Mid-implementation retro** | Step 5 完成后（Module A+B 接合，cache hit rate 第一周 retro）+ Step 12 完成后（Module C 完）；D-091 §2.5(γ) tripwire 数据 source |

---

## 4. 锁定关联 ADR

| ADR | 在本 PLAN 中的作用 |
|---|---|
| D-083 | Phase 2 = A+C hybrid；v1.0.3 `output/` 是数据源 |
| D-084 | v1.0.3 ✅ shipped (数据源就位) |
| D-085 | Hybrid 双模式 (Quiz + Study) + Chat；per-mode scope = whole-book / chapter / question / glossary |
| D-086 | s1 web stack 严格度 |
| D-087 | Next.js 15 + Vercel AI SDK + Vercel + SSR + TS strict + React 19 + `@ai-sdk/anthropic` native prompt caching |
| D-088 | Opus 4.7 单模型 + Hybrid pin + system+glossary ephemeral cache + 1-retry no-fallback + δ-all-tripwire |
| D-089 | DataSource interface + FsDataSource default + BlobDataSource β-ready + index.json v2 backfill + 4 per-scope assembly fns |
| D-090 | $5/$15/$30 daily cap + per-query $5 + α-silent / β-D071-graduated + env var switch |
| D-091 | 本 PLAN 的 ground truth（§2.3 15 step + §2.2 evidence + §2.4 cap 联动 + §2.5 tripwire） |
| D-092 | β trigger 触发条件 + β-open sub-step checklist（post-Phase-2 α 上线后参考） |

---

## 5. Amendment / Tripwire (per D-091 §2.5 cascade + PLAN-specific)

**D-091 §2.5 5 triggers**（任 1 触 = D-091 review session）:

| Trigger | 触发条件 | Amendment 路径 |
|---|---|---|
| **α** | PoC ceiling ±50% drift（第一周 retro 实测） | D-091 §2.1 三档数 amend |
| **β** | Cache hit rate retro < 50% | D-088 §2.3 + D-091 §2.1 expected/pessimistic 折叠 |
| **γ** | Step 数 / wall > 30% drift | 本 PLAN §1 step 拆分 amend + Phase 2 mid-implementation retro |
| **δ** | β user 数 > 10/month | D-091 §2.1 envelope 等比放大 + 触发付费模型 review (Phase 3 backlog) |
| **ε** | Anthropic pricing 改价 / Opus 4.7 deprecation | D-088 §2.5(α) 同期触发 + D-091 §2.1 等比 amend |

**PLAN-specific tripwire**:

- **节奏 drift**：Q4=d 自适应实测过于 propose-heavy（user 频繁 override）→ 切回 (b) step-boundary 适用（类 Phase 1 实施模式）
- **Repo layout drift**：Step 1 实施后发现 monorepo dir 命名（`apps/` vs `packages/` vs 顶层）与 D-082 原假设冲突 → 走 D-082 amendment sub-ADR

---

## 6. Out of scope (推 Phase 3 / 后续 backlog)

- 多用户 hosting / multi-tenant（γ/δ 范围，per D-083 §2.3）
- 付费模型（subscription / per-call billing，per D-091 §3）
- API key rotation / multi-key load balance（per D-091 §3）
- Custom domain DNS provider 选型（per D-092 §3）
- Phase 1 cert-extractor 通用化为任意资格教材（Phase 5，per D-083 §2.2）
- 移动端 native（PWA 之外）
- Offline mode / service worker 完整 cache (PWA 基本可后续加)
- 用户账户系统（auth / login / multi-device sync）— β-ready 之后

---

## 7. STATUS

**🚧 draft (Session 32 Turn 2)** — LOCKED final 等 Step 1 完成 + 第一周 retro 校正后；每 step 完成 in-place 更新 `_progress.json` + Step row evidence ref。
