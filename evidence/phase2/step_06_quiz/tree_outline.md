# Step 6 Quiz Explain — file tree

Phase 2 Step 6 atomic commit shape (Session 38 2026-05-20):

```
apps/web/
├── src/
│   ├── app/api/quiz/explain/
│   │   ├── route.ts                              (new, ~120 lines)
│   │   └── __tests__/
│   │       └── route.test.ts                     (new, ~190 lines, 7 cases)
│   ├── lib/ai/
│   │   ├── quiz.ts                               (new, ~70 lines)
│   │   └── __tests__/
│   │       └── quiz.test.ts                      (new, ~110 lines, 11 cases)
│   └── lib/data/
│       └── assembleScope.ts                      (modify — chars/3 calibration only)
└── (no other file touched)

docs/
├── STATE.md                                       (modify — 4 anchor sync)
├── discussion/2026-05-20-session-38.md           (new, ~300 lines)
├── decisions/D-098-whole-book-lean-payload.md    (modify — §2.2 v1.1 amend note)
└── phase2/PLAN.md                                 (modify — Step 6 row → ✅ DONE)

evidence/phase2/
├── step_06_quiz/
│   ├── tree_outline.md                            (this file)
│   ├── build_log.txt                              (next build snapshot)
│   ├── test_results.txt                           (pnpm test snapshot)
│   ├── cache_audit_2026-05-20.md                 (N=3 retro)
│   ├── step_06_audit.md                           (Rule A audit per project pattern)
│   ├── smoke_call_1.log                           (page_042_entity_0 cold)
│   ├── smoke_call_2.log                           (page_042_entity_0 hit)
│   └── smoke_call_3.log                           (page_259_entity_0 cold; empty-delta finding)
└── tripwire_log.md                                (modify — row #3 appended for Step 6)
```

## Deploy artifacts (out-of-band Vercel platform state, not in git)

- Preview deploy: `dpl_AQXsR2xkkwn8Ah1PFbmnTKaUGhqg` @ `web-d3lm6f265-bojiangs-projects.vercel.app`
- Production deploy: `dpl_DBK7TkSrhr1Y2x464TNDPUEGn6DT` @ `web-hni4o9clb-bojiangs-projects.vercel.app` aliased canonical `web-mu-sandy-78.vercel.app`
- Env vars unchanged (DEEPSEEK_API_KEY + FIREWALL_BASIC_AUTH already on both Preview + Production from Sessions 36-37)

## Cumulative counts

- vitest cases: 81 (Session 37 close) → **100** (Step 6 +19)
- routes: 7 (5 static + 2 dynamic) → **8** (added `ƒ /api/quiz/explain`)
- ADR LOCKED: 98 (Session 37 close) — Step 6 LOCKS 0 new ADR (locked design honoured D-085/D-088/D-089/D-095/D-098)
- Phase 2 真 billed cumulative: $0.047 → **~$0.051** (Step 6 ~$0.004 quiz scope cheap)
