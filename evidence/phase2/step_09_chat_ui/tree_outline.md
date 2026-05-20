# Step 9 — file tree outline (Phase 2, Session 41)

Files touched in Step 9 of Phase 2 / Module C, scope = `<Chat />` UI surface
mounted at `/chat`, AI SDK v6 data-stream migration for `/api/chat`,
localStorage-backed Resume contract per D-085 §2.2.

## New files

```
apps/web/src/
├── app/
│   └── chat/
│       └── page.tsx                                  (10 lines) standalone /chat route
├── components/
│   └── Chat.tsx                                     (~200 lines) useChat + localStorage + Resume + clear
└── lib/
    └── chat/
        ├── historyStore.ts                           (~110 lines) StorageLike-shaped persistence
        └── __tests__/
            └── historyStore.test.ts                  (~165 lines) 14 vitest cases (load/save/clear/resilience)

evidence/phase2/step_09_chat_ui/
├── tree_outline.md                                   (this file)
├── build_log.txt
├── test_results.txt
├── cache_audit_2026-05-20.md
├── design_notes.md
├── step_09_audit.md
├── ui_smoke_2026-05-20.md
├── screenshot_1_restored_conversation.png
├── screenshot_2_multi_turn.png
├── screenshot_3_resume_after_reload.png
└── screenshot_4_cleared_empty_state.png
```

## Modified files

```
apps/web/
├── package.json                       +@ai-sdk/react@3.0.187; react 19.1.0→19.2.6; react-dom 19.1.0→19.2.6;
│                                       @types/react 19→19.2.x; @types/react-dom 19→19.2.x
├── pnpm-lock.yaml                     (auto)
└── src/
    ├── app/
    │   ├── layout.tsx                  metadata title/description (was "Create Next App" → real title)
    │   └── api/chat/
    │       ├── route.ts                 AI SDK v6 data-stream migration
    │       │                            - request body  : `{scope, userMessage}` → `{messages: UIMessage[]}`
    │       │                            - response shape : custom SSE encoder → `toUIMessageStreamResponse()`
    │       │                            - multi-turn via `await convertToModelMessages(messages)`
    │       │                            - retain         : `maxRetries: STREAM_CONFIG.maxRetries=1` (D-088 §2.4),
    │       │                                               onFinish tripwire eval (D-091 §2.5β),
    │       │                                               `X-LLM-Provider` header,
    │       │                                               formatUserFacingError surface (D-088 §2.4)
    │       └── __tests__/route.test.ts  contract refresh (was 6 cases → now 8 cases)
    └── lib/ai/
        ├── chat.ts                     -validateChatRequestBody + ChatRequestBody/USER_MESSAGE_MAX_LENGTH
        │                               (retired with /api/chat migration; 3 other routes still use
        │                                buildChatSseResponse which stays)
        └── __tests__/chat.test.ts     -9 validator cases (no other caller)
```

## Net vitest delta

- Step 8 baseline    : 150 / 150 (chat.test 15 + retry.test 12 + tripwire.test 18 + ...)
- Step 9 removed    :  -9 chat.test validator cases (validator retired)
- Step 9 added      : +14 historyStore.test cases + 8 (was 6) /api/chat route.test
                       = +14 + 2 net = +16
- Step 9 final      : 157 / 157 ✅

## Production deploys

| Phase | Deployment id (short) | Wall | Notes |
|---|---|---|---|
| Preview 1 | `dpl_a5hjkjsbn` | 5 s build | ❌ failed: npm peer dep ERESOLVE on react@19.1.0 vs @ai-sdk/react peer |
| (fix)     | react 19.1 → 19.2.6 + react-dom + @types pnpm bump |
| Preview 2 | `dpl_jyum90s88` | ~47 s | ✅ READY |
| Prod 1    | `dpl_6mymk4bc2` | 58 s | ✅ READY (aliased `web-mu-sandy-78.vercel.app`); UI smoke exposed `fetch with credentials in URL` Chrome restriction |
| (fix)     | `<Chat />` defensive `history.replaceState` on mount to strip URL creds |
| Prod 2    | `dpl_ola34hvzr` | 47 s | ✅ READY (final Step 9 alias); UI smoke 2 真 LLM calls 99.88-99.99% hit |
