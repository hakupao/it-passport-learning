# Step 3 — File tree outline

> Phase 2 Step 3 = 4 per-scope assembly fns + corpus boot loader (per D-089 §2.3 + Session 34 Q3=b module-level singleton).
> Reference: `docs/phase2/PLAN.md` §1 Module A Step 3.

## New files

```
apps/web/src/lib/data/
├── assembleScope.ts                          # NEW (Batch A) — 4 per-scope assembly fns
├── index.ts                                  # NEW (Batch B) — module-level singleton boot loader
├── DataSource.ts                             # (Step 2, unchanged)
├── FsDataSource.ts                           # (Step 2, unchanged)
├── types.ts                                  # (Step 2, unchanged)
└── __tests__/
    ├── assembleScope.test.ts                 # NEW (Batch C) — 10 unit tests
    ├── index.test.ts                         # NEW (Batch C) — 5 unit tests
    └── FsDataSource.test.ts                  # (Step 2, 13 tests, unchanged)
```

## Contract surface (per D-089 §2.3)

| Fn | Mode (D-085 §2.4) | Token estimate |
|---|---|---|
| `assembleQuestion(ds, pageId, entityIndex)` | Quiz Explain | ~500-3000 |
| `assembleChapter(ds, chapterId)` | Study Chat | ~50K-150K |
| `assembleWholeBook(ds)` | Standalone Chat | ~800K |
| `assembleTermHover(ds, surfaceJp)` | Study term tooltip | ~80-200 |

All return `AssembledScope = { scope, contextBlock, tokenEstimate, meta }`.

## Boot loader surface (per Session 34 Q3=b)

| Export | Purpose |
|---|---|
| `getDataSource()` | module-level singleton accessor (lazy construct) |
| `warmUp()` | eager `Promise.all([loadIndex, loadGlossary])` helper for `instrumentation.ts` (Step 4+) |
| `__setDataSourceForTesting(ds)` | test-only injection (NODE_ENV=test guarded) |
| `__resetDataSourceForTesting()` | test-only reset |

## Test counts

| File | Tests |
|---|---|
| `FsDataSource.test.ts` (Step 2) | 13 |
| `assembleScope.test.ts` (Step 3) | 10 |
| `index.test.ts` (Step 3) | 5 |
| **total** | **28** |

All ✅ green, 178ms duration (vitest@4.1.6).

## Files NOT changed (per D-083 §2.2 + Step 2 contracts)

- `packages/extractor/` — untouched
- `apps/web/_fixtures/v1.0.3/` — untouched (Step 2 corpus)
- `apps/web/src/lib/data/{DataSource,FsDataSource,types}.ts` — Step 2 contracts unchanged
- `docs/decisions/*` — no new D this step (Q4=a propose-first, 0 D-NNN)
