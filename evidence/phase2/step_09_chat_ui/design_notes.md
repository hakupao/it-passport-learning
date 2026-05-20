# Step 9 design notes — `<Chat />` Module C entry (Phase 2, Session 41)

> 4Q-locked design decisions, code mapping, deferred items.

## 1. 4Q answers (D-019 §3a slow-pace)

| Q | Question | Ans | Rationale |
|---|---|---|---|
| Q1 | Chat 前端如何消费 SSE 流？ | **(a) 改 chat.ts → AI SDK data stream + useChat hook** | AI SDK v6 idioms; UI 层零自写 SSE 消费；多回合 abort/optimistic/history 由 useChat 处理；route 用 `streamText().toUIMessageStreamResponse()` |
| Q2 | history 持久化后端？ | **(a) localStorage cross-session** | 同步 API + 5MB 配额对纯文本 chat 充足；SSR-safe `'use client' + useEffect`；最简单 + 满足 D-085 §2.2 Resume contract |
| Q3 | Resume 时 UX 行为？ | **(a) Pin last conversation — 严格 Resume** | 严格 honour D-085 §2.2 「上次位置」 = 完整 thread；「新しい会话」按钮显式 escape；α-now 简单 |
| Q4 | Step 9 UI 字符串 i18n？ | **(a) 硬编码中文/日文 now，Step 12 抽取** | Step 9 wall 干净；Step 12 已分配 1 day for i18n base；error surface 已锁中文 D-088 §2.4 |

All 4 Recommended; user blanket ACK `a/a/a/a` (`Session 41 4Q ACK`).

## 2. Code mapping (which decision → which code)

### Q1 (AI SDK data stream)

- **`apps/web/src/app/api/chat/route.ts`** (rewrite):
  - Request body shape: `{messages: UIMessage[]}` (was `{scope, userMessage}`).
  - Server constructs:
    ```ts
    const conversation = await convertToModelMessages(parsed.messages);
    const result = streamText({
      model: getModel("chat"),
      maxRetries: STREAM_CONFIG.maxRetries,  // D-088 §2.4
      abortSignal: request.signal,
      messages: [
        { role: "system", content: corpusBlock, providerOptions: { anthropic: { cacheControl: { type: "ephemeral" }}} },
        { role: "system", content: SYSTEM_INSTRUCTION },
        ...conversation,
      ],
      onFinish: ({usage, providerMetadata}) => {
        // [chat] usage log + tripwire eval (D-091 §2.5β)
      },
    });
    return result.toUIMessageStreamResponse({
      onError: (e) => formatUserFacingError(e),  // D-088 §2.4 locked Chinese surface
      headers: { "X-LLM-Provider": provider },
    });
    ```
  - `convertToModelMessages` is `Promise<ModelMessage[]>` in AI SDK v6 — must `await`. (TSC caught this at first try.)
  - The stable-prefix layout (corpus → SYSTEM → conversation) is inlined here rather than reusing `buildMessagesWithStablePrefix`, because that helper signs against `userMessage: string`. The cached prefix (corpus + SYSTEM_INSTRUCTION) stays byte-identical across turns; conversation grows as the variable suffix.
  - 3 other routes (`/api/{hello-ai, quiz/explain, glossary/hover}`) intentionally NOT migrated — their UI consumers (Step 10 modal, Step 11 popover) are single-shot, useChat-irrelevant. They retain `buildChatSseResponse` from `lib/ai/chat.ts`.

- **`apps/web/src/lib/ai/chat.ts`** (trim):
  - Removed: `validateChatRequestBody`, `ChatRequestBody`, `ChatBodyValidation`, `USER_MESSAGE_MAX_LENGTH` (no callers after migration).
  - Kept: `buildChatSseResponse` + frame types + `StreamTokenUsage` + `BuildChatSseArgs` (used by the 3 other routes).
  - Module docstring updated to clarify it's now the "single-shot SSE encoder for /api/{hello-ai, quiz/explain, glossary/hover}", not /api/chat.

### Q2 (localStorage cross-session)

- **`apps/web/src/lib/chat/historyStore.ts`** (new): 3 fns + StorageLike interface
  - `loadChatHistory(storage, key)` — returns `UIMessage[]`; returns `[]` for every recoverable failure (no storage, parse error, schema mismatch, throws). State corruption fallback per D-085 §5.3.
  - `saveChatHistory(storage, messages, key)` — versioned envelope `{version:1, messages, updatedAt:ISO}`; caps at `MAX_PERSISTED_MESSAGES = 200`; swallows `setItem` throws (quota/private mode).
  - `clearChatHistory(storage, key)` — `removeItem`; swallows throws.
- StorageLike abstraction = `{getItem, setItem, removeItem}` so vitest in node env can drive with `new Map<string, string>` mock, no jsdom dep.
- Cap MAX_PERSISTED_MESSAGES = 200 with `slice(-N)` keeps the most-recent tail.
- HISTORY_STORAGE_KEY = `itp:chat:history:v1`; bump suffix for future schema changes.

### Q3 (Pin last conversation)

- **`apps/web/src/components/Chat.tsx`**:
  - Mount effect restores prior history via `loadChatHistory(window.localStorage)`, then `setMessages(prior)` if non-empty.
  - `restored` boolean guards the save-effect so the empty initial state doesn't overwrite a saved thread before restore lands.
  - Save effect persists on every `messages` change.
  - "新しい会話 / 新对话" button = the only explicit-clear path; `setMessages([])` + `clearChatHistory(...)`.
  - Disabled when `messages.length === 0 || isStreaming`.
  - The defensive `window.history.replaceState` for URL-credentials strip lives in the same mount effect (see Q4 below for context).

### Q4 (hardcoded zh-CN/ja now)

- All `<Chat />` labels are top-level constants in `Chat.tsx`:
  - `PLACEHOLDER` = ja
  - `SEND_LABEL` = ja
  - `NEW_CHAT_LABEL` = zh + ja
  - `TITLE` / `SUBTITLE` = ja
  - `EMPTY_HINT` = ja
  - `STREAMING_HINT` = ja
  - `ERROR_FALLBACK` = zh (matches D-088 §2.4 locked surface)
- Step 12 will extract into i18n catalog; Step 12 row already allocates 1 day for i18n base.

## 3. Same-turn in-source amendments (per D-094 §2.1 + D-080 v1.1 §8 patterns)

- **React 19.1.0 → 19.2.6 minor bump**:
  - Trigger: `@ai-sdk/react@3.0.187` peer dep `^18 || ~19.0.1 || ~19.1.2 || ^19.2.1` excludes 19.1.0 (the `~19.1.2` tilde gap).
  - pnpm tolerated locally; npm strict-mode (Vercel) ERESOLVE'd.
  - Resolution: pnpm bumped to `^19.2.1` — landed in same Step 9 commit; documented here, not D-NNN-worthy.
  - Verified: 157/157 vitest stays green; tsc clean; lint 0; build green; npm install in fresh tmp dir passes.

- **`<Chat />` defensive URL-credential strip** (mid-step robustness fix):
  - Trigger: Chrome's `fetch()` rejects same-origin URLs resolved from `window.location.href` when the URL contains credentials → `useChat`'s default transport throws on credentialed bookmarks / smoke harness URLs.
  - Fix: `if (window.location.href.includes("@")) window.history.replaceState({}, "", pathname+search+hash)` in mount effect.
  - Comment explains why this doesn't weaken D-097 firewall (Basic Auth already cached by browser HTTP auth cache by mount time).
  - Inline comment in `Chat.tsx`; not D-NNN-worthy.

- **Layout metadata bump**: `title: "Create Next App"` → `"IT パスポート 三語学習"`; description bumped to honest one-liner. Cosmetic but visible — left next-scaffold metadata was a stale dev-template leak that would have surfaced in any browser tab title.

## 4. Failure-mode coverage (referenced by step_09_audit.md §1)

| Failure mode | Coverage |
|---|---|
| LLM transient 5xx | `STREAM_CONFIG.maxRetries = 1` (D-088 §2.4) applied via `streamText` |
| LLM permanent error (e.g. quota) | `formatUserFacingError` → locked Chinese surface in SSE error frame; raw err to `console.error` for debug |
| localStorage corrupt / parse error | `loadChatHistory` returns `[]` (D-085 §5.3 fallback) |
| localStorage quota exceeded | `saveChatHistory` swallows `setItem` throw |
| private mode storage denial | both load + save swallow throws |
| SSR / no window | `isBrowser()` guard; mount effect sets `restored=true` and skips storage |
| URL with credentials (bookmark / smoke) | defensive `replaceState` strips before `useChat` constructs fetch |
| API 401 (firewall miss) | useChat's `error` surface; Basic Auth cached after first navigation |
| Multi-turn cache invariant | corpus + SYSTEM_INSTRUCTION as 2 leading system messages → byte-identical prefix |

## 5. Deferred items (Module C+D backlog)

- i18n extraction (Step 12)
- 3-tab Layout integration (Step 12)
- Quiz Explain UI modal (Step 10)
- Term hover popover (Step 11)
- R1 empty-delta defensive warning frame (Module C/D backlog; downgraded to "data-point-2 non-deterministic" per Session 40 DC-40.2)
- AI SDK system-message-in-prompts warning mitigation (cosmetic; `allowSystemInMessages: true`)
- Clear-then-empty-write churn (see cache_audit_2026-05-20.md §5.4)
- Multi-thread history surface (D-085 §3 deferred to Phase 2 v2 / Phase 3)

## 6. Module C+D full re-estimate decision

**Still NOT done this turn.** See `cache_audit_2026-05-20.md §4.2`. Wait for
N=4 Module C data points (= Step 12 close) before triggering a full re-estimate.
The per-step PLAN.md inline `actual <N> min` amendment continues per D-094 §2.1.
