# Failure: phase2/step_09 / attempt_2 — Chrome fetch refuses URL with credentials

## Metadata

| field | value |
|---|---|
| `attempt_id` | `step_09-2026-05-20-002` |
| `stage` | phase2/step_09_chat_ui |
| `timestamp` | 2026-05-20T06:55:00+09:00 |
| `triggered_by` | `evidence/phase2/step_09_chat_ui/ui_smoke_2026-05-20.md` flow rows 4-5 |
| `git_sha` | (pre-commit; working tree at Session 41 mid-step, post-attempt-1-fix) |
| `model_or_tool` | n/a (client-side fetch failure in Chrome 138+ via Chrome DevTools MCP) |
| `cost` | ~$0 (no LLM call reached the backend; failed at fetch construction) |
| `elapsed_minutes` | ~12 min (smoke open → diagnosis → patch decision → redeploy gate) |

## Input

- Prod-1 deploy: `dpl_6mymk4bc2-bojiangs-projects.vercel.app`, target=production, aliased canonical `web-mu-sandy-78.vercel.app`. Built after react peer-dep fix (attempt 1).
- Smoke harness: `mcp__chrome-devtools__new_page url=https://claude:<pass>@web-mu-sandy-78.vercel.app/chat` — passes Basic Auth credentials embedded in URL per Session 35-40 pattern.
- User action: typed "DNS是什么" into the chat input + clicked 送信.

## Product

`<Chat />` UI rendered correctly; useChat hook initialised; D-097 firewall accepted the embedded creds for the page load. On 送信 click, JavaScript console threw:

```
Failed to execute 'fetch' on 'Window': Request cannot be constructed from a URL that includes credentials: /api/chat
```

UI surface displayed the error in the `role="alert"` region (no fetch reached the backend; no `[chat]` log line on Vercel).

## Technical verdict

**FAIL — client-side fetch construction rejected by Chrome.**

useChat's default transport resolves `/api/chat` against `window.location.href` via `new URL("/api/chat", window.location.href)`. Because `window.location.href` was `https://claude:<pass>@web-mu-sandy-78.vercel.app/chat` (credentials in URL), the resulting Request constructor threw. Chrome has refused fetch URLs containing credentials since Chrome 59+ (per WHATWG fetch spec §5: "If url's includes credentials is true, then return a network error").

## Business verdict

**FAIL on smoke methodology.** The Step 9 prod canonical itself was healthy; the harness method of passing creds via URL was the issue. Crucially: a **real user** typing the clean URL into a browser would hit the Basic Auth dialog, fill it manually, and never trigger this branch — so the failure was harness-induced, not user-flow-induced.

However, an α-user who bookmarks the URL with credentials (e.g. `https://claude:pass@.../chat` as a password manager autofill) would also trigger it. So the fix is real-user-relevant, not just smoke-relevant.

## Root cause

Two compounded design assumptions:
1. Sessions 35-40 used curl-only smoke; never exercised browser fetch with credentialed URLs.
2. The Step 9 4Q-locked design (Q1=a AI SDK + useChat) inherited useChat's default transport behaviour which resolves URLs against `window.location.href`.

The combination surfaced only when Step 9 introduced the first browser-based smoke flow.

## Fix

Defensive URL-credential strip in `<Chat />` mount effect:

```ts
if (window.location.href.includes("@")) {
  window.history.replaceState(
    {},
    "",
    window.location.pathname + window.location.search + window.location.hash,
  );
}
```

Comment explains why this doesn't weaken D-097: Chrome's HTTP auth cache already holds the credentials per session by the time the mount effect runs (the page load itself successfully passed Basic Auth), so subsequent same-origin fetches auto-attach `Authorization: Basic <encoded>` from cache without needing creds in the URL.

Code lives in `apps/web/src/components/Chat.tsx` mount-effect block; documented in `evidence/phase2/step_09_chat_ui/design_notes.md §3` as an in-source amendment per D-094 §2.1 + D-080 v1.1 §8 patterns. NOT D-NNN-worthy.

## Input to next attempt

`<Chat />` mount effect with defensive `replaceState`. Re-verified:
- 157/157 vitest still green
- tsc clean
- lint exit 0
- build green

Re-deploy: prod `dpl_ola34hvzr` (Prod-2 final) READY → smoke retry → 真 LLM calls #1 + #2 succeeded with 99.88-99.99 % cache hit (see `cache_audit_2026-05-20.md`).

## Lesson candidate (RETROSPECTIVE backlog)

> Defaults of UI libraries (useChat's transport URL resolution) may depend on
> `window.location.href` in ways that are silently fragile when the page URL
> contains credentials. For any future client-side fetch surface in this
> project, either:
>   (a) strip URL credentials defensively at mount (current Step 9 pattern), or
>   (b) construct fetch URLs with explicit absolute origins (more invasive).
> α-now: option (a) is sufficient; reconsider at Phase 3 (β multi-user surface)
> if browser-side fetch surface grows.

Candidate for RETROSPECTIVE.md "保留下来的做法" section: "Always test
browser-based smoke against credentialed bookmark URLs before assuming the
real-user path is the only entry point."
