# Phase 2 Step 5 — code surface tree outline

Session 37 (2026-05-20) deliverables.

```
apps/web/
├── src/
│   ├── app/
│   │   └── api/
│   │       └── chat/                            ← NEW (Batch A)
│   │           ├── route.ts                      (~115 行) POST + GET handlers
│   │           └── __tests__/
│   │               └── route.test.ts             (~140 行) 6 integration tests
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── chat.ts                          ← NEW (Batch A) (~130 行) SSE encoder + validator
│   │   │   └── __tests__/
│   │   │       └── chat.test.ts                 ← NEW (Batch A) (~210 行) 15 unit tests
│   │   └── data/
│   │       ├── assembleScope.ts                 ← MODIFIED (B-fix) assembleWholeBook → lean per D-098 §2.1
│   │       └── __tests__/
│   │           └── assembleScope.test.ts        ← MODIFIED (B-fix) assembleWholeBook 3 lean tests (was 1 full-pages)
└── vitest.config.ts                             ← MODIFIED (Batch C) resolve.alias { "@": ./src } added

docs/
└── decisions/
    └── D-098-whole-book-lean-payload.md         ← NEW (~250 行) amend D-085 + D-089 §2.3

docs/discussion/
└── 2026-05-20-session-37.md                     ← NEW (Batch G)

docs/phase2/
└── PLAN.md                                       ← MODIFIED Step 5 row → ✅ DONE 2026-05-20

docs/
└── STATE.md                                      ← MODIFIED 4 anchors sync

evidence/
└── phase2/
    ├── tripwire_log.md                          ← MODIFIED row #2 appended
    └── step_05_chat/                            ← NEW dir (this Step's evidence)
        ├── tree_outline.md                       (this file)
        ├── build_log.txt
        ├── test_results.txt
        ├── cache_audit_2026-05-20.md            (~250 行)
        ├── step_05_audit.md                     (~150 行)
        ├── smoke_call_1.log                     (English; cache creation 92,814 miss)
        ├── smoke_call_2.log                     (Japanese TCP/IP; 99.98% cache hit)
        ├── smoke_call_3.log                     (Japanese DNS; 99.98% cache hit)
        └── (vercel_deploy_*.log if captured)

failures/
└── step_05_attempt_1_full_pages_payload_ctx_overflow.md   ← NEW (Rule B 临界 path)
```

## File summary

| File | Type | Purpose |
|---|---|---|
| `apps/web/src/app/api/chat/route.ts` | new | POST `/api/chat` SSE handler + GET health |
| `apps/web/src/app/api/chat/__tests__/route.test.ts` | new | 6 integration tests (vi.mock AI SDK + data layer) |
| `apps/web/src/lib/ai/chat.ts` | new | SSE encoder + request body validator (no AI-SDK-type coupling) |
| `apps/web/src/lib/ai/__tests__/chat.test.ts` | new | 15 unit tests: validator + SSE wire format |
| `apps/web/src/lib/data/assembleScope.ts` | modify | assembleWholeBook lean payload (chapters + glossary, no pages) per D-098 §2.1 |
| `apps/web/src/lib/data/__tests__/assembleScope.test.ts` | modify | assembleWholeBook test block rewritten (3 lean cases) |
| `apps/web/vitest.config.ts` | modify | resolve.alias `@` → `./src` (config drift fix) |
| `docs/decisions/D-098-whole-book-lean-payload.md` | new | ADR lock; amend D-085 + D-089 §2.3 |
| `evidence/phase2/tripwire_log.md` | modify | row #2 appended (β no fire / γ Step 5 wall / D-098) |
| `evidence/phase2/step_05_chat/*` | new | 7 evidence files (this step's audit + cache + 3 smoke logs) |
| `failures/step_05_attempt_1_*.md` | new | Rule B 临界 path archive (full-pages ctx-overflow pre-deploy catch) |

## Deploys this Step

1. `dpl_pEnTDNqn92YR7KYuVQpSxR9jsxCJ` Preview (1st, Batch D) — stale full-pages code, replaced
2. `dpl_9vdp4ai79-...` Preview (2nd, post B-fix, Batch E re-launch verify)
3. `dpl_e3qoyhzsh-...` Production (B-fix, Batch E) — canonical `web-mu-sandy-78.vercel.app`

(Vercel `dpl_*` short IDs from `vercel ls` summary; full UUIDs in commit/log if captured.)
