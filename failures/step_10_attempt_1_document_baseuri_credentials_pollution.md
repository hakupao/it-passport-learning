# step_10 attempt 1 — document.baseURI credentials pollution

**Status**: FIXED (in-step diversion). Final canonical = prod-v3 `dpl_BqdybbaGeBEqmvX9vv5zUVwKmHEL` (target=production, aliased canonical `web-mu-sandy-78.vercel.app`).

**Session**: 2026-05-20 Session 42 (Phase 2 Step 10).
**Rule**: B (failed attempt archive).
**Parent task**: Phase 2 Module C 1/4 — Quiz Explain UI (modal + busy state).

---

## What broke

After landing the Step 9 carry-over defensive `history.replaceState` URL-credential strip in `<QuizList />` mount effect, the prod-v2 deploy `dpl_FcrwVPJuLNUEKexBaN7AfST3rXCm` failed UI smoke with the modal showing the locked Chinese error surface `AI 暂时不可用，请稍后重试。`

In Chrome DevTools MCP probe via `evaluate_script`:

```js
fetch('/api/quiz/explain', { method: 'POST', body: JSON.stringify({ question_id: 'page_042_entity_0' }) })
// → TypeError: Failed to execute 'fetch' on 'Window':
//   Request cannot be constructed from a URL that includes credentials: /api/quiz/explain
```

Yet `window.location.href` showed the strip HAD landed:

```js
({ href: window.location.href, hasAt: window.location.href.includes('@') })
// → { href: "https://web-mu-sandy-78.vercel.app/quiz?qid=page_042_entity_0", hasAt: false }
```

---

## Root cause

`history.replaceState(...)` updates **`window.location.href`** but does **NOT** update **`document.baseURI`**:

```js
({
  baseURI: document.baseURI,                                          // ← STILL has `claude:...@host` prefix
  windowLocation: window.location.href,                               // ← clean after replaceState
  url: document.URL,                                                  // ← STILL has @
  documentURI: document.documentURI,                                  // ← STILL has @
})
```

Chrome's `Request` constructor resolves relative URLs against **`document.baseURI`**, not `window.location.href`. So when our quiz SSE consumer called `fetch("/api/quiz/explain")` with a relative path, Chrome resolved it against the polluted base URI and rejected the resulting URL for containing credentials.

**Why Step 9 `<Chat />` did not hit this**: useChat from `@ai-sdk/react@3.0.187` constructs its fetch URL internally; it likely calls `fetch(absolute_url, ...)` (or uses an internal resolution that ignores `document.baseURI`). Either way, useChat's path through the AI SDK does not trip the Chrome relative-resolution code path.

---

## Fix

`apps/web/src/lib/quiz/quizSseTransport.ts` gained a `resolveEndpoint(endpoint)` helper that constructs an **absolute** URL against `window.location.origin` for any non-absolute `endpoint`:

```ts
function resolveEndpoint(endpoint: string): string {
  if (typeof window === "undefined") return endpoint;
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint;
  }
  try {
    return new URL(endpoint, window.location.origin).toString();
  } catch {
    return endpoint;
  }
}
```

`streamQuizExplain` now passes `resolveEndpoint(endpoint)` to `fetchImpl(...)` instead of the raw relative `/api/quiz/explain`. `window.location.origin` IS strip-respecting (it never carries credentials per [URL spec](https://url.spec.whatwg.org/#dom-url-origin)), so `new URL("/api/quiz/explain", "https://host").toString()` yields a clean absolute URL that Chrome's `Request` constructor accepts.

Cumulative cost of in-step diversion: 1 prod re-deploy (v2 → v3) — same wall pattern as Session 41 Rule B archive 2.

---

## Lessons (RETROSPECTIVE v2 backlog)

1. **`history.replaceState` is necessary-but-insufficient for credential-stripping**: it must be paired with either (a) absolute-URL fetch construction or (b) a `<base href="...">` element rewrite. Step 9 only worked because useChat happened to use an internal absolute-URL pattern. Future surfaces should default to absolute-URL fetch construction.

2. **`document.baseURI` ≠ `window.location.href`** under `history.replaceState`. This is a small but load-bearing subtlety of the WHATWG URL/Document specs that does not appear in MDN's `replaceState` page.

3. **MCP-based UI smoke would have caught this earlier than Chrome devtools probe**: the visible modal error `AI 暂时不可用，请稍后重试。` was the first symptom; the underlying TypeError lived in the JS layer and was only surfaced by `evaluate_script`. Module C/D test design should bake a console-error capture step into Chrome DevTools MCP smoke runs.

4. **No new D-NNN ADR required**: this is an implementation-layer bug, not a design decision. The locked design (Q4=a hand-rolled SSE consumer; Q3=a `?qid=` URL state) still holds; only the relative→absolute URL detail differs. Per D-094 §2.1 + D-080 v1.1 §8 in-source amendment pattern, the fix is documented inline in `quizSseTransport.ts`'s `resolveEndpoint` JSDoc block.

---

## Failed-deploy ID

`dpl_FcrwVPJuLNUEKexBaN7AfST3rXCm` (prod-v2 with the defensive strip but no absolute-URL resolution). Production canonical alias was briefly served by this build; no user impact (α single-user, only Claude exercised the UI surface during smoke).

## Working deploy ID

`dpl_BqdybbaGeBEqmvX9vv5zUVwKmHEL` (prod-v3 with `resolveEndpoint`). Aliased canonical `web-mu-sandy-78.vercel.app` since 2026-05-20.
