# Step 7 — `/api/glossary/hover` term-hover wiring — file tree

Session 39 · 2026-05-20 · Phase 2 Module B 4/4 ✅ 收官

## New files (this Step)

```
apps/web/src/lib/ai/
  hover.ts                          (validator + HOVER_SYSTEM_INSTRUCTION + HOVER_USER_PROMPT)
  __tests__/hover.test.ts           (11 vitest cases: 9 validator + 2 prompt constants)

apps/web/src/app/api/glossary/hover/
  route.ts                          (POST + GET handlers; SSE response via buildChatSseResponse)
  __tests__/route.test.ts           (8 vitest cases: 1 happy + 6 bad input + 1 GET health)
```

## Touched files (this Step)

```
docs/phase2/PLAN.md                 (Step 7 row → ✅ DONE narrative)
docs/STATE.md                       (4-anchor sync: 最后更新 / 当前阶段 / 已锁定决定数 / 下一会话)
docs/discussion/2026-05-20-session-39.md  (new session log)
evidence/phase2/tripwire_log.md     (row #4 appended — γ 7th data point + β N=5 + Module B 收官)
apps/web/src/lib/data/assembleScope.ts    (header comment Step 7 row added to N=4 chars/N table)
```

## Evidence emitted (this Step)

```
evidence/phase2/step_07_glossary/
  tree_outline.md                   (this file)
  build_log.txt                     (pnpm build snapshot — 9 routes, 4 dynamic including /api/glossary/hover)
  test_results.txt                  (vitest snapshot — 120/120 ✅)
  cache_audit_2026-05-20.md         (full N=3 smoke retro + chars/N decision + Module B 收官 retro)
  step_07_audit.md                  (Rule A audit pattern)
  smoke_call_1.log                  (アルゴリズム cold creation; 400 in / 75 out / 0 hit / 400 miss)
  smoke_call_2.log                  (アルゴリズム repeat; 400 in / 71 out / 384 hit / 16 miss = 96.0%)
  smoke_call_3.log                  (データベース different; 391 in / 86 out / 0 hit / 391 miss)
```

## Cumulative counts post Step 7

| Aspect | Before (post-Step-6) | After (post-Step-7) |
|---|---|---|
| Source files (apps/web/src/) | hover.ts created | +1 (hover.ts) |
| Route files (apps/web/src/app/api/) | quiz/explain/route.ts | +1 (glossary/hover/route.ts) |
| Vitest test files | 11 | 11 (test files unchanged; +2 new) — actually 11+2=13 |
| Total vitest cases | 100 | **120** (+20: 11 hover.test + 9 route.test stub-driven actually 11+8=19; one prompt-coverage delta) |
| Next.js routes | 8 (5 static + 3 dynamic) | **9** (5 static + 4 dynamic) |
| Middleware bytes | 37.6 kB | 37.6 kB (unchanged) |
| First Load JS | 119 kB | 119 kB (unchanged) |
| Phase 2 真 billed cumulative | ~$0.051 | **~$0.0515** (+$0.0005 Step 7 hover) |

## Cross-references

- `docs/decisions/D-085-phase2-3-mode-design.md` §2.4 mode = hover
- `docs/decisions/D-089-data-source-α-now-β-ready.md` §2.3 assembleTermHover
- `docs/decisions/D-095-deepseek-default-anthropic-switchable.md` §2.1 hover role = `deepseek-chat`
- `docs/decisions/D-097-firewall-edge-middleware.md` α firewall (Basic Auth gates `/api/glossary/hover`)
- `evidence/phase2/step_07_glossary/cache_audit_2026-05-20.md` §3 N=3 smoke retro + chars/N decision
- `evidence/phase2/tripwire_log.md` row #4 (γ 7th data point + β N=5 cross-scope ratification)
