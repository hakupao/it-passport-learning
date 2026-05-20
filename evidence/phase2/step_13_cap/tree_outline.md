# Step 13 — Tree outline (files added/modified Session 45)

## New files (4)

```
apps/web/src/lib/ai/cap.ts                                 ~340 行
apps/web/src/lib/ai/__tests__/cap.test.ts                  ~370 行
docs/decisions/D-100-cap-counter-persistence-upstash.md    ADR
docs/discussion/2026-05-20-session-45.md                   session log
```

## Modified files (6)

```
apps/web/src/app/api/chat/route.ts          + recordCapEvent import + onFinish call (~14 行 add)
apps/web/src/app/api/quiz/explain/route.ts  + same (~14 行 add)
apps/web/src/app/api/glossary/hover/route.ts + same (~14 行 add)
apps/web/src/app/api/hello-ai/route.ts      + same (~14 行 add; uses pre-existing cacheUsage const)
apps/web/package.json                       + "@upstash/redis": "^1.38.0"
pnpm-lock.yaml                              dep install
docs/phase2/PLAN.md                         Step 13 ✅ CODE-COMPLETE row
docs/STATE.md                               4-anchor sync (header + 当前阶段 + 已锁定决定数 + 下一会话)
```

## Evidence files (this dir, 4)

```
evidence/phase2/step_13_cap/
├── tree_outline.md        (this file)
├── build_log.txt          full pipeline output (vitest + tsc + lint + build)
├── test_results.txt       cap.test.ts verbose output (40 tests)
└── design_notes.md        4Q answers + LDs + Context7 audit narrative
```

## Bundle impact

- Middleware: 48.9 kB unchanged (server-only addition)
- First Load JS shared: 115 kB unchanged
- Each `[locale]/*` static route: unchanged
- `/api/*` dynamic routes: include `@upstash/redis` lazy dynamic import in their lambda bundles only (not measured separately by Next; size impact ~50-100 kB per lambda, well within Vercel function size limits)

## Test count delta

- Cumulative: 237 → 277 (+40)
- New file: `apps/web/src/lib/ai/__tests__/cap.test.ts` (40 cases across 11 describe blocks)
- No existing test regression
