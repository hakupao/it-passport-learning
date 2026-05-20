# Step 8 — file tree + cumulative counts

Generated 2026-05-20 Session 40 (Module B 5/5 ✅ COMPLETE close).

## New files this step

```
apps/web/src/lib/ai/retry.ts                       (~95 lines)
apps/web/src/lib/ai/tripwire.ts                    (~130 lines)
apps/web/src/lib/ai/__tests__/retry.test.ts        (~145 lines)
apps/web/src/lib/ai/__tests__/tripwire.test.ts     (~180 lines)
evidence/phase2/step_08_retry/tree_outline.md      (this file)
evidence/phase2/step_08_retry/build_log.txt
evidence/phase2/step_08_retry/test_results.txt
evidence/phase2/step_08_retry/cache_audit_2026-05-20.md
evidence/phase2/step_08_retry/design_notes.md
evidence/phase2/step_08_retry/step_08_audit.md
evidence/phase2/step_08_retry/smoke_call_1_hello_ai.log
evidence/phase2/step_08_retry/smoke_call_2_chat.log
evidence/phase2/step_08_retry/smoke_call_3_quiz.log
evidence/phase2/step_08_retry/smoke_call_4_hover.log
evidence/phase2/step_08_retry/smoke_call_5_cold_quiz.log
```

## Modified files this step

```
apps/web/src/lib/ai/chat.ts                          (+ formatUserFacingError + console.error)
apps/web/src/lib/ai/__tests__/chat.test.ts           (assertion: locked user-surface message + console.error spy)
apps/web/src/app/api/chat/route.ts                   (+ maxRetries: 1 + tripwire eval)
apps/web/src/app/api/quiz/explain/route.ts           (+ maxRetries: 1 + tripwire eval)
apps/web/src/app/api/glossary/hover/route.ts         (+ maxRetries: 1 + tripwire eval)
apps/web/src/app/api/hello-ai/route.ts               (+ maxRetries: 1 + tripwire eval)
docs/phase2/PLAN.md                                  (Step 8 row → ✅ DONE narrative)
docs/STATE.md                                        (4 anchor sync)
docs/discussion/2026-05-20-session-40.md             (new session journal)
evidence/phase2/tripwire_log.md                      (row #5 appended)
```

## Cumulative Phase 2 counts

| Step | Vitest cases | Routes | Files |
|---|---|---|---|
| 1 (scaffold) | 0 | 0 dynamic + 5 static | baseline |
| 2 (DataSource) | 13 | unchanged | +1 module |
| 3 (assembly) | 28 cumulative | unchanged | +2 modules |
| 4 (hello-ai) | 48 cumulative | 1 dynamic added | +3 files |
| 5 (chat) | 81 cumulative | 2 dynamic | +4 files + 1 mod |
| 6 (quiz/explain) | 100 cumulative | 3 dynamic | +2 files + amend |
| 7 (glossary/hover) | 120 cumulative | 4 dynamic | +2 files + amend |
| **8 (retry+tripwire)** | **150 cumulative (+30)** | **4 dynamic (no new)** | **+2 modules + 4 route mods** |

Build snapshot (post Step 8):
```
9 routes ( 5 static + 4 dynamic )
ƒ Middleware 37.6 kB unchanged
First Load JS 119 kB unchanged (Step 8 is server-only)
```

Vitest snapshot (post Step 8):
```
13 test files / 150 tests / 393ms
```
