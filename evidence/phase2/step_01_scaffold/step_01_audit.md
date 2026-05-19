# Step 1 audit — Next.js 15 scaffold + TS strict + Vercel deploy hello-world

| 字段 | 值 |
|---|---|
| Step | **1 / 15** (per `docs/phase2/PLAN.md` §1 Module A) |
| Session | `docs/discussion/2026-05-19-session-32.md` Turn 3 |
| Wall | ~25 min (npm install -g pnpm+vercel ~11s / scaffold retry ~40s / pnpm install fixes ~3 min / build smoke test ~10s / Vercel deploy ~60s / evidence dump) |
| Result | ✅ **PASS** — Vercel preview live + curl HTTP/2 200 + build green |
| Rule A | n/a — scaffold 类工作；无 LLM rewrite > 50% |
| Rule B | 1 attempt failure 记录如下 |
| Rule D | Writer = main session；Reviewer = user terminal sign-off path α（next turn）|

---

## Acceptance criteria（per `docs/phase2/PLAN.md` §1 Step 1）

| AC | Met? | Evidence |
|---|---|---|
| `apps/web/` 创建 + Next.js 15 (not 16) | ✅ | `package.json` `"next": "15.5.18"` |
| TS strict + `noUncheckedIndexedAccess` | ✅ | `apps/web/tsconfig.json` L7-8 |
| Tailwind 4 + ESLint 9 + app router + `src/` + `@/*` alias | ✅ | `apps/web/{postcss.config.mjs,eslint.config.mjs,src/app/,tsconfig.json paths}` |
| `pnpm-workspace.yaml` 启用 (`apps/*`) | ✅ | root `pnpm-workspace.yaml` |
| `.nvmrc` = 22 (Vercel-aligned) | ✅ | root `.nvmrc` |
| Local build green | ✅ | `pnpm --filter web build` → ✓ Compiled successfully in 1279ms |
| Vercel preview URL live | ✅ | https://web-mu-sandy-78.vercel.app/ + HTTP/2 200 |
| D-093 sub-ADR locked (apps/ amend) | ✅ | `docs/decisions/D-093-phase2-app-location.md` |
| CLAUDE.md + AGENTS.md mirror amend | ✅ | both line 94 updated |

---

## Failure attempt（Rule B）

**`failures/phase2/step_01_scaffold_attempt_001.md`** (本目录 sibling) — `create-next-app@latest` 默认装 Next.js **16.2.6** 违 D-087 lock；归档 + 重做用 `create-next-app@15` 显式 pin。

第二个 attempt（也 archive 候选）：pnpm 11 `ERR_PNPM_IGNORED_BUILDS` (sharp + unrs-resolver) — non-fatal warning，darwin-arm64 prebuilt 二进制自动到位；通过 root `pnpm-workspace.yaml` `allowBuilds: { sharp: true, unrs-resolver: true }` 显式 approve 后 silent。

---

## D-087 compliance ✅

- Next.js 15.5.18（D-087 锁 "Next.js 15"） ✅
- React 19.1.0（D-087 配套 + D-088 "React 19"） ✅
- TS strict（D-087 锁 "TS strict"） ✅
- Vercel deploy（D-087 锁 "Vercel hosting"） ✅
- SSR（app router default = RSC + SSR per D-087） ✅
- Vercel AI SDK 尚未装 → 推 Step 4

## D-091 §2.2 evidence 类型 cover

- ✅ `tree_outline.md` (step_01_scaffold/)
- ✅ `vercel_deploy_<sha>.log` (step_01_scaffold/) — **Phase 2 specific addition #1 触发**
- ⏸ `cache_audit_<date>.md` — 推 Step 4/5
- ⏸ `lighthouse_<date>.md` — 推 Step 14
- ⏸ `e2e_<run>.json` — 推 Step 15
- ⏸ `ttft_<date>.md` — 推 Step 7

---

## Cost actual

- LLM cost: **$0** (本 step 无 LLM call；scaffold + Vercel deploy only)
- Vercel cost: **$0** (Hobby tier, per D-091 §2.1 α-now)
- npm packages installed: 318 (apps/web) + 313 (global pnpm + vercel) = 631 deps total
- Bandwidth: ~150 MB total (npm + Vercel build cache)

---

## Risks / open items（推 Step 2+）

1. **Vercel project name "web"** 通用 — future multi-tenant 可能想 rename；非 blocker，dashboard 改即可
2. **Turbopack production builds** stable but young — Phase 2 mid-implementation retro 时校验 cache behavior (D-088 §2.3)
3. **Telemetry default on** — Phase 2 retro 时 opt-out 决策
4. **Vercel build CLI 53.3.2** vs local 54.1.0 — minor drift；可推 Vercel project settings 显式 pin
5. **pnpm `pnpm-workspace.yaml` 11+ `allowBuilds` format** 是 pnpm 11 新行为；如未来升 pnpm 12 可能需 amend yaml format

---

## Sign-off

- Writer: main session (Session 32 Turn 3)
- Reviewer #1 (Rule D path α): pending Turn 4 user terminal sign-off
