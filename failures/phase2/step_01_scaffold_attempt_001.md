# Step 1 scaffold attempt 001 — `create-next-app@latest` 装上 Next.js 16 违 D-087

| 字段 | 值 |
|---|---|
| Step | 1 / 15 (PLAN.md Module A) |
| Attempt | 001 |
| Session | `docs/discussion/2026-05-19-session-32.md` Turn 3 |
| Date | 2026-05-19 |
| Status | **FAIL — D-087 version drift** (Next.js 16 ≠ locked Next.js 15) |
| 解决 attempt | 002 = `pnpm create next-app@15 ...` 显式 pin → ✅ Next.js 15.5.18 |

---

## 输入

```bash
mkdir -p apps/web && pnpm create next-app@latest apps/web --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --turbopack --yes
```

cwd: `/Users/bojiangzhang/MyProject/IT-Passport-Learning`

环境:
- Node v25.9.0 / npm 11.12.1 / pnpm 11.1.3 / vercel CLI 54.1.0
- `apps/` 不存在前置；`mkdir -p apps/web` 先创建空 dir

---

## 产物

```
apps/web/package.json:
  "dependencies": {
    "next": "16.2.6",          ← ❌ Next.js 16 (npm @latest 当前默认)
    "react": "19.2.4",
    "react-dom": "19.2.4"
  }
```

`pnpm install` exit non-zero with `ERR_PNPM_IGNORED_BUILDS` (sharp + unrs-resolver) — non-fatal but `create-next-app` 把 abort 当 fatal 退出。

---

## 技术判定

- ❌ Next.js 16 ≠ D-087 锁 (Next.js 15)
- ⚠️ pnpm 11 build script 默认 skip (sharp + unrs-resolver) — 非 blocker on darwin-arm64 (prebuilt binaries auto-installed via `@img/sharp-darwin-arm64` 等 platform-specific deps)
- ⚠️ create-next-app 把 pnpm install non-zero exit 当 "Aborting installation" — 实际 deps 已落 node_modules

## 业务判定

- ❌ FAIL — Phase 2 stack D-087 严格锁 "Next.js 15 + Vercel AI SDK"；Next.js 16 是今天 npm `@latest` (Oct/Nov 2025 GA) 但**未** 走 D-087 amendment review
- 违 Rule "不 unilaterally 改 LOCKED ADR 行为"

## 下一 attempt 输入

```bash
rm -rf apps/web
# root pnpm-workspace.yaml 加 allowBuilds: { sharp: true, unrs-resolver: true }
mkdir -p apps/web && pnpm create next-app@15 apps/web --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --turbopack --yes
```

关键改动:
1. `@latest` → `@15` 显式 pin major version (=> 15.5.18 实测装上)
2. root yaml 预 approve build scripts 避免 install abort

→ Attempt 002 ✅ PASS (见 `evidence/phase2/step_01_scaffold/step_01_audit.md`)

---

## 教训 (carry to PLAN.md / future steps)

1. **Major version drift**：第三方包发布频率快；`@latest` 是不稳定 pin → 凡 D-NNN-locked stack 一律显式 major version pin
2. **pnpm 11 build script 默认 skip**：所有用 sharp / 原生 binary 类包的新 monorepo 都要预 approve（root yaml `allowBuilds` 或 `onlyBuiltDependencies`）→ PLAN.md §3 节奏 row 可加 "新 dep 引入时 verify build script 列表"
3. **create-next-app abort 行为 misleading**：deps 实际 install 完才 abort；不要被 "Aborting installation" 误导成 "什么都没装"
