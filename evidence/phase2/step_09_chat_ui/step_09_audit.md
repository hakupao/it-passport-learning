# Step 9 audit — acceptance + pre-close self-check (Phase 2, Session 41)

## §1 Acceptance criteria

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | `<Chat />` client component renders at `/chat` route on prod canonical | ✅ | `ui_smoke_2026-05-20.md`; screenshot_1 / 3 / 4 |
| 2 | useChat (`@ai-sdk/react@3.0.187`) consumes AI SDK v6 data stream | ✅ | call #1 + #2 streamed text rendered live; `vercel logs` shows `responseStatusCode: 200` on both POSTs |
| 3 | `/api/chat/route.ts` returns `toUIMessageStreamResponse()` (NOT custom SSE) | ✅ | source `apps/web/src/app/api/chat/route.ts`; test `route.test.ts` asserts new shape |
| 4 | Multi-turn conversation: user→assistant→user→assistant works | ✅ | screenshot_2; call #2 with turnCount=3 ratifies |
| 5 | Language mirror per SYSTEM_INSTRUCTION (zh-CN → ja-JP on call #2) | ✅ | screenshot_2; assistant reply switches language matching user's switch |
| 6 | Corpus grounding (citation/known facts only) | ✅ | call #1 cites `第489ページ` (matches GlossaryEntry.first_page for DNS); call #2 cites OSI layer 7 + UDP port 53 (textbook accurate) |
| 7 | localStorage persistence with `itp:chat:history:v1` envelope | ✅ | `evaluate_script` returned `{"version":1,"messages":[...],"updatedAt":"..."}` |
| 8 | D-085 §2.2 Resume pin-last on hard reload | ✅ | screenshot_3; 4-message conversation fully restored from localStorage |
| 9 | "新しい会话 / 新对话" clear button empties messages | ✅ | screenshot_4; localStorage post-clear has `messages: []` |
| 10 | D-097 firewall still gates `/chat` + `/api/chat` | ✅ | pre-promote probe `curl -I` HTTP 401 + WWW-Authenticate; same on `/chat` |
| 11 | D-088 §2.4 `maxRetries: STREAM_CONFIG.maxRetries = 1` retained through migration | ✅ | source `route.ts:84`; AI SDK passes through to provider; no fallback path |
| 12 | D-091 §2.5(β) tripwire eval retained in `onFinish` | ✅ | source `route.ts:103-110`; `vercel logs` shows `[chat]` entries with `providerMetadata.deepseek.promptCacheHitTokens` — tripwire eval ran (0 fires under healthy 99.88-99.99% hit) |
| 13 | `formatUserFacingError` locked Chinese surface still wired (via `onError` on stream response) | ✅ | source `route.ts:113-119`; not exercised this Session (no provider errors) but unit-tested via `retry.test.ts` |
| 14 | 157 / 157 vitest green | ✅ | `test_results.txt` |
| 15 | `pnpm lint` exit 0 | ✅ | `build_log.txt` (lint step in build) |
| 16 | `pnpm exec tsc --noEmit` exit 0 | ✅ | confirmed; caught `await convertToModelMessages(...)` at first try |
| 17 | `pnpm build` green; route table has `/chat` + 4 dynamic APIs + Middleware 37.6 kB | ✅ | `build_log.txt` |
| 18 | npm install (fresh, no lockfile) passes after React 19.2.6 bump | ✅ | reproduced in `/tmp/web-fresh-test` |
| 19 | Vercel preview + prod deploys READY | ✅ | preview `dpl_jyum90s88`; prod `dpl_ola34hvzr` (Step 9 v2 final) |

## §2 Rule A semantic audit

- Step 9 = structural wiring + UI surface; no >50 % content compression / rewrite.
- Informal coherence audit on the N=2 LLM replies → both PASS per `cache_audit_2026-05-20.md §8`.

## §3 Rule B failure archive

Two in-step diversions archived to maintain Rule B archive discipline:

- **`failures/step_09_attempt_1_react_peer_dep_eresolve.md`** — Preview-1 deploy
  `dpl_a5hjkjsbn` failed with `Command "npm install" exited with 1`. Root cause:
  `@ai-sdk/react@3.0.187` peer dep range `^18 || ~19.0.1 || ~19.1.2 || ^19.2.1`
  excludes `react@19.1.0` (tilde gap between `~19.0.1` and `~19.1.2`). pnpm
  (Sessions 35-40 local) was lenient, npm (Vercel) was strict. Fix: pnpm bump
  React 19.1.0 → 19.2.6 same step.

- **`failures/step_09_attempt_2_fetch_credentials_in_url.md`** — Chrome DevTools
  MCP smoke on Prod-1 (`dpl_6mymk4bc2`) failed with client-side alert:
  `Failed to execute 'fetch' on 'Window': Request cannot be constructed from a URL that includes credentials: /api/chat`.
  Chrome's `fetch` refuses same-origin URLs resolved from `window.location.href`
  when the URL contains Basic Auth credentials; useChat's default transport
  hits exactly that branch. Fix: `<Chat />` mount effect now strips URL creds
  via `history.replaceState` (defensive — does not weaken D-097 because Basic
  Auth is already cached by browser HTTP auth cache by mount time).

Both were caught and fixed within the same Step 9 wall; the fix code shipped
to Prod-2 `dpl_ola34hvzr` and is part of the Step 9 atomic commit.

## §4 Rule D Writer/Reviewer

| Role | Identity | Action |
|---|---|---|
| Writer | Claude (main session) | Wrote all source + tests + evidence files |
| Reviewer #1 | user (hakupao) terminal | `a/a/a/a` 4Q ACK (Q1-Q4 design lock) |
| Reviewer #2 | user (hakupao) terminal | `授权 vercel deploy` (preview) + `授权 vercel --prod` × 2 (Prod-1, Prod-2) |
| Reviewer #3 (post-diversion) | user terminal | `a` selection on Path 1 vs 2 vs 3 fix-flow question |
| Reviewer #4 (commit) | pending user `go commit` + `push it` gates per Sessions 27-40 pattern | |

Writer ≠ Reviewer satisfied per Rule D.

## §5 Pre-close self-check (per D-027 §5)

| Item | State | Evidence |
|---|---|---|
| 0 new ADR lock | ✅ | Step 9 honoured locked D-085 / D-088 / D-091 / D-094 / D-095 / D-097 cleanly. In-source amendments (React bump + defensive replaceState) documented per D-094 §2.1 + D-080 v1.1 §8 patterns; NOT D-NNN-worthy. |
| Code green | ✅ | 157/157 vitest + lint exit 0 + tsc strict exit 0 + build green |
| Vercel env vars | ✅ | unchanged from Step 8 (DEEPSEEK_API_KEY + FIREWALL_BASIC_AUTH) |
| Preview deploy | ✅ | `dpl_jyum90s88-bojiangs-projects.vercel.app` post React bump |
| Production deploy | ✅ | Prod-1 `dpl_6mymk4bc2` → Prod-2 final `dpl_ola34hvzr` (target=production, aliased canonical `web-mu-sandy-78.vercel.app`) |
| Firewall still gating | ✅ | post-Prod-2 probe HTTP 401 + WWW-Authenticate |
| 2 真 LLM UI smoke ✅ | ✅ | `[chat]` log entries; multi-turn ratified; cache hit 99.88-99.99 % |
| 0 [tripwire] fires | ✅ | `vercel logs | grep '\[tripwire\]'` empty |
| Module B 5/5 ✅ retained (no regression) | ✅ | 3 other routes still wired with `buildChatSseResponse` + `maxRetries` + tripwire eval |
| PLAN.md Step 9 row | pending Batch H write | `actual ~110 min` inline amend per D-094 §2.1 |
| STATE.md sync | pending Batch H write | 4 anchors |
| Session log on disk | pending Batch H write | `docs/discussion/2026-05-20-session-41.md` |
| Evidence on disk | ✅ | `step_09_chat_ui/` 7 docs + 4 screenshots; tripwire_log row #6 pending append |
| Rule A 抽检 | n/a | wiring + UI; informal coherence audit on N=2 LLM replies in `cache_audit §8` |
| Rule B 失败归档 | ✅ | 2 archive files in `failures/step_09_attempt_{1,2}_*.md` |
| Rule C (Phase retro) | n/a | mid-Phase; Module C first data-point retro in `cache_audit §4` (NOT Rule C Phase-end retro) |
| Rule D Writer ≠ Reviewer | ✅ | §4 above |
| OPEN OQ count | 3 unchanged | Phase 1 后续 / Phase 3-4 范围 |
| Module C+D full re-estimate | **NOT done** | deferred to Step 12 close (N=4 UI data points) per D-094 §2.4; `cache_audit §4.2` rationale |
