# D-093 — Phase 2 app location + D-082 `apps/` reservation amendment

| 字段 | 值 |
|---|---|
| 状态 | **LOCKED final** — Session 32 Turn 3 user terminal sign-off path α 2026-05-19 |
| 锁定 session | `docs/discussion/2026-05-19-session-32.md` Turn 2 (Q5) + Turn 3 (execute) |
| 类型 | sub-ADR of D-082（amend `apps/` reservation 措辞）+ Phase 2 实施 step 1 prerequisite |
| 颗粒度 | g1 narrow — 锁 dir 名 + amend 一句 CLAUDE.md/AGENTS.md；不重新讨论 D-082 整体结构 |
| 前置 ADR | D-082（项目结构 v2 + apps/ 原 reservation）/ D-083（Phase 2 = A+C hybrid web app）/ D-087（Next.js 15 + Vercel）/ D-091（15-step / Tier 3 / Step 1 = scaffold） |
| Supersede? | 否；**amend** D-082（minor 措辞 amend，per D-080 v1.1 §8 pattern） |

---

## 1. Context

D-082（Phase 1 final 项目结构 v2）锁的措辞：

> `packages/extractor/` is Phase 1's only package; `apps/` reserved for Phase 3+.

该措辞写于 2026-05-13 Session 12 前后，**Phase 2 形态当时未定**（OQ-05 open）。Session 24 (2026-05-18) D-083 locked Phase 2 = A+C hybrid web app（"带 AI 答疑的个人备考工具"）→ Phase 2 本身就是 web app → `apps/` 留给 Phase 3+ 的原假设过时。

D-091 §2.3 Step 1 = "Next.js 15 scaffold + TS strict + Vercel deploy hello-world" → 必须有一个 dir 来 host Next.js app。Session 32 Turn 2 Q5 抛 4 options（`apps/itp-learn/` / `apps/web/` / `packages/web/` / 顶层 `web/`）；user Q5=b 锁 `apps/web/`。

本 ADR 同时：
- 锁 Phase 2 web app dir = `apps/web/`
- amend D-082 / CLAUDE.md / AGENTS.md `apps/ reserved for Phase 3+` 措辞 → "Phase 2+"

---

## 2. Decision

### 2.1 Phase 2 web app location = `apps/web/`

**Lock**: Phase 2 整个 web 应用（Next.js 15 + Vercel AI SDK）位于 `apps/web/`。

含义：
- Phase 2 第一 tenant of `apps/`
- 通用 dir 名（不带 cert prefix）；future multi-cert 由 D-089 DataSource 层支持（同一 app 切数据源），不立新 app 实例
- 内部结构遵循 Next.js 15 `create-next-app` scaffold + `src/` dir convention（D-087 strict）

### 2.2 D-082 `apps/` reservation 措辞 amend

**原** (D-082 / CLAUDE.md L94 / AGENTS.md L94):
> `packages/extractor/` is Phase 1's only package; `apps/` reserved for Phase 3+.

**新** (本 ADR LOCK):
> `packages/extractor/` is Phase 1's only package; `apps/` is for Phase 2+ web/CLI apps (`apps/web/` = Phase 2 Next.js 15 app per D-093).

CLAUDE.md / AGENTS.md mirror updated 同 turn。

### 2.3 `pnpm` workspace 启用

**Lock**: root `pnpm-workspace.yaml` 加 `apps/*`；monorepo TS apps/ + Python `packages/extractor/` 工具链并存（Python `uv.lock` + TS `pnpm-lock.yaml` 各自管理）。

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
```

注意：`packages/extractor/` 是 Python uv package，**不** 进 pnpm workspace（pnpm 仅管 TS/JS workspace；Python 由 uv 管）。这是 cross-toolchain monorepo 的正常模式。

### 2.4 Future apps/ 扩展约定

任何 Phase 3+ 新 app（如 CLI tool / admin dashboard / mobile companion）：
- 直接在 `apps/<name>/` 加 dir
- 不需新 D-NNN amend D-082（已 amend 措辞 cover）
- 单 cert vs multi-cert 由 D-089 数据源层处理，不影响 app dir 数量

---

## 3. Out of scope（推 Phase 2 / Phase 3）

- `apps/web/` 内部结构细节（推 D-091 §2.3 Step 1 scaffold 完成后由 `create-next-app` 决定 + `src/` dir 模式）
- 任何 future apps/ 命名约定的细节（如 `apps/cli/` 还是 `apps/<feature>/`，由出现时再定）
- pnpm vs npm vs yarn 工具链选择（D-093 § 2.3 锁 pnpm，per Q5 propose-first ACK）
- Vercel monorepo 配置细节（Root Directory 设置等，推到 Vercel CLI link 实际跑时观察）

---

## 4. Rejected alternatives

- **(a) `apps/itp-learn/`** cert-scoped 名 — 假设 Phase 5 远期 generalize 必走多 app 路径；但 D-089 DataSource 层已支持多 cert 切换（单 app 切 cert prefix 路由），不需多 app dir；cert prefix 在 dir 名是过度承诺
- **(c) `packages/web/`** — `packages/` 历来是 library/SDK 类（Phase 1 `packages/extractor/` 是 Python uv lib）；web app 是 application 而非 library，semantic mismatch；且 Vercel monorepo 惯例 = `apps/`
- **(d) 顶层 `web/`** 新 dir — 脱离 Vercel monorepo 惯例（`apps/` + `packages/`）；future apps 增长时拍平 dir 树管理成本上升
- **不立 D-093 直接 in-place amend D-082** — Tier 3 (D-091 §2.2) 要求 ADR trail；inline amend D-082 没有显式 trigger / 理由记录，破坏 traceability

---

## 5. Consequences

### 5.1 Positive

- `apps/web/` 是 Vercel monorepo 标准 dir 命名 — `vercel CLI` 自动识别，Root Directory 配置 0 学习成本
- `pnpm-workspace.yaml` 启用后 root 一次 `pnpm install` 即可装所有 workspace；future `apps/cli` 等增长 0 ceremony
- amend 措辞精简（一句话），未触 D-082 主体结构，per D-080 v1.1 §8 minor amend pattern
- 不承诺单 cert dir 命名 → Phase 5 远期 generalize 路径开放（DataSource 层切换）

### 5.2 Risks

| Risk | severity | Mitigation |
|---|---|---|
| `pnpm-workspace.yaml` 与 `packages/extractor/` Python uv 工具链混淆（误把 Python pkg 当 TS workspace） | **Low** | workspace yaml 显式只 list `apps/*`，不含 `packages/*`；README + CLAUDE.md 注释跨工具链边界 |
| Vercel deploy 默认 Root Directory = repo root → 多 app monorepo 时需在 Vercel dashboard 设 Root = `apps/web` | **Low** | Step 1 Vercel CLI link 时显式设；`vercel.json` 或 dashboard config 都可 |
| future Phase 3+ app（如 `apps/cli/`）出现时 dir 名约定（kebab-case / snake-case / camel） | **Low** | 出现时再决定；D-093 §2.4 留口 |
| `apps/web/` "web" 名过于 generic，将来若有第二 web app（如 admin dashboard）冲突 | **Low** | 第二 web app 出现时改 dir 名（如 `apps/admin/` + 此 `apps/web/` 可改 `apps/user/`）；当下不预防过早抽象 |

---

## 6. References

- `docs/decisions/D-082-project-structure-v2.md` — 被 amend 的源 ADR（措辞 L94）
- `docs/decisions/D-083-phase2-direction.md` — Phase 2 = A+C hybrid web app（D-093 锁的前提）
- `docs/decisions/D-087-phase2-stack.md` — Next.js 15 + Vercel（D-093 §2.1 dir 内部技术栈源）
- `docs/decisions/D-091-phase2-budget-and-tier.md` — Step 1 = scaffold（D-093 是 Step 1 前置 lock）
- `docs/decisions/D-080-stage4-5-polish.md` v1.1 §8 — amendment pattern reference
- `CLAUDE.md` L94 — mirror amend target
- `AGENTS.md` L94 — mirror amend target
- `docs/phase2/PLAN.md` — Phase 2 实施 PLAN（Step 1 row 引用本 ADR）

---

## 7. Sign-off

- **Writer**: main session (Session 32 Turn 3)
- **Reviewer #1 (path α terminal sign-off pattern, same as D-085~D-092)**: APPROVED — Session 32 Turn 2 Q5=b ACK + Turn 3 same-turn lock 2026-05-19
- **Reviewer #2 (代码审 / audit subagent)**: N/A — 本 ADR 无 code 产物（仅措辞 amend + dir 命名 lock）

---

**LOCKED final — Session 32 Turn 3 user terminal sign-off path α 2026-05-19**
