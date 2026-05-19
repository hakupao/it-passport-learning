# Step 1 scaffold — `apps/web/` 文件树 outline

Captured 2026-05-19 Session 32 Turn 3 post `pnpm create next-app@15 apps/web ...` + first Vercel deploy.

## Root state (project root after Step 1)

```
IT-Passport-Learning/
├── .nvmrc                            # 22 (Vercel-aligned)
├── package.json                      # root monorepo umbrella (private, packageManager=pnpm@11.1.3)
├── pnpm-workspace.yaml               # packages: apps/*; allowBuilds: sharp/unrs-resolver=true
├── pnpm-lock.yaml                    # generated
├── apps/
│   └── web/                          # ← Phase 2 Next.js 15 app (per D-093 §2.1)
├── packages/
│   └── extractor/                    # Phase 1 (Python uv, untouched)
├── docs/
│   ├── decisions/D-093-phase2-app-location.md   # NEW this session
│   ├── phase2/PLAN.md                            # NEW this session
│   └── discussion/2026-05-19-session-32.md       # NEW this session
├── evidence/phase2/                  # NEW (Q3=a Phase 1 同构 carry-over)
├── failures/phase2/                  # NEW (Rule B)
└── (其他 Phase 1 artifacts unchanged)
```

## `apps/web/` (Next.js 15 scaffold output)

```
apps/web/
├── .gitignore                        # Next.js default: node_modules / .next / .vercel / *.local
├── .vercel/                          # gitignored — Vercel project link
│   └── project.json                  # {projectId, orgId, projectName=web}
├── .next/                            # gitignored — build cache
├── README.md                         # Next.js default
├── eslint.config.mjs                 # flat config (ESLint 9)
├── next-env.d.ts                     # ambient types
├── next.config.ts                    # default empty config
├── package.json                      # name=web, next@15.5.18, react@19.1.0, TS@5.9.3
├── postcss.config.mjs                # Tailwind 4 PostCSS
├── tsconfig.json                     # strict + noUncheckedIndexedAccess (D-087 + propose-first)
├── public/
│   └── (Next.js default static assets)
├── src/
│   └── app/                          # App Router (D-087 SSR)
│       ├── favicon.ico
│       ├── globals.css               # Tailwind 4 base
│       ├── layout.tsx                # root layout
│       └── page.tsx                  # `/` route (default Next.js welcome)
└── node_modules/                     # pnpm workspace-linked
```

## Key version pins (post-scaffold)

| Package | Version | 锁定 source |
|---|---|---|
| next | **15.5.18** | D-087 lock (Next.js 15) ✅ |
| react | 19.1.0 | D-087 + D-088 (React 19) ✅ |
| react-dom | 19.1.0 | (paired with react) |
| typescript | 5.9.3 | (Next.js 15 baseline) |
| tailwindcss | 4.3.0 | (Tailwind 4 stable) |
| eslint | 9.39.4 | (ESLint 9 flat config) |
| eslint-config-next | 15.5.18 | (paired with next) |
| @types/node | 20.19.41 | (LTS types) |

## What's gitignored at this stage

- `apps/web/.next/` (build cache, regenerated each build)
- `apps/web/.vercel/` (Vercel project link, machine-local)
- `apps/web/node_modules/`
- `node_modules/` (root, via pnpm shared store)
- `pnpm-lock.yaml` — **NOT** gitignored (committed per pnpm recommendation, reproducibility)

## Lines of code (scaffold default)

- `src/app/layout.tsx`: ~24 lines (root layout with Geist font + Tailwind globals)
- `src/app/page.tsx`: ~117 lines (Next.js welcome page placeholder)
- `src/app/globals.css`: ~27 lines (Tailwind 4 base import + theme tokens)
- Total app code: ~168 lines scaffold placeholder（Step 2 起 replace with cert-extractor UI）
