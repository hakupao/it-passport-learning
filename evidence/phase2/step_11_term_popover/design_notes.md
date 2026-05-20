# Step 11 — Term Popover UI · design notes (Session 43)

> Companion to PLAN.md row 49 + `docs/discussion/2026-05-20-session-43.md`
> Turn 1. Captures sub-LDs (in-source amendments per D-094 §2.1; NOT
> D-NNN-worthy) and the reasoning behind the clone-adapt shape.

## 1. Locked design

### Q1=a — Surface
New `/glossary` browse page → click → modal-like overlay.

- Symmetric with Step 10 `/quiz` shape.
- Lowest coupling to Step 12 Layout work (no shared chrome assumed).
- Clean data point for Module C 3/4 retro at Step 12 close.

### Q2=a — Click-to-open interaction
- Single code path desktop + mobile.
- Hover-layer + tap-to-open device-branch deferred to Step 12 polish.

### Q3=a — Stream-as-it-arrives
- Phase machine `idle → loading → streaming → done | error`.
- Skeleton during `loading`; live deltas append during `streaming`.
- Module C consistency with `<Chat />` (Step 9) and `<QuizExplain />` (Step 10).

### Q4=a — Hand-rolled SSE transport
- New `lib/glossary/glossarySseTransport.ts` literally cloned from
  `lib/quiz/quizSseTransport.ts`.
- Field renames only (`question_id` → `surface_jp`; `/api/quiz/explain` →
  `/api/glossary/hover`).
- DRY refactor to a shared `lib/ai/sseTransport.ts` deferred to Step 12
  cleanup (LD-5 — in-source amend, not D-NNN).

## 2. Sub-LDs (in-source amendments per D-094 §2.1 + D-080 v1.1 §8)

| ID | Decision | Why |
|---|---|---|
| LD-1 | `role="dialog" aria-modal="true"`, viewport-centered modal | Q1=a says "popover overlay (mirrors /quiz)" = modal-like; centered avoids positioning math; a11y precedent from `<QuizExplain />`. |
| LD-2 | `?term=<encodeURIComponent(surface_jp)>` URL state via useSearchParams; `router.push` on click, `router.replace` on close | Mirror of Step 10 `?qid=`; encodeURIComponent for non-ASCII (アルゴリズム → %E3%82%A2%E3%83%AB%E3%82%B4%E3%83%AA%E3%82%BA%E3%83%A0) round-trip safety per WHATWG URL spec. |
| LD-3 | 50音 order via `Intl.Collator('ja', { sensitivity: 'base', numeric: true })`; no virtualization, no pagination, no search | Step 14 Lighthouse owns perf; 908 × ~1KB DOM ≈ <1MB; search is feature-creep risk. Stable secondary sort by id keeps order deterministic across renders. |
| LD-4 | Single `<pre className="whitespace-pre-wrap">` block — `HOVER_SYSTEM_INSTRUCTION` already structures JP/中文/English | Same as `<QuizExplain />`; no client-side parsing. |
| LD-5 | Literal clone of `quizSseTransport.ts`, including `resolveEndpoint` | Module C clone-adapt sub-pattern; DRY refactor deferred. |
| LD-6 | `/api/glossary/hover` UNCHANGED from Step 7 | Module B 5/5 ✅. Client-only Step 11. |
| LD-7 | 39 net new vitest cases mirroring Step 10's 36 (close to budget) | vitest node env precludes React component tests; UI smoke via Chrome DevTools MCP per Module C pattern. |
| LD-8 | Skeleton 3 rows (vs Step 10's 4) + indeterminate progress bar + "AI が用語を解説中…/AI 正在解释术语…" | Hover responses ≈70-90 tok (smaller than quiz 600 tok). |
| LD-9 | Error fallback "AI 暂时不可用，请稍后重试。" per D-088 §2.4 + retry button | Locked surface; consistent across Steps 9-11. |

## 3. Defence-in-depth: URL-credential strip + absolute-URL fetch

The Step 9 (Session 41) Rule B archives + Step 10 (Session 42) Rule B archive
revealed two distinct credentialed-URL hazards:

1. Chrome's `fetch()` refuses URLs containing `user:pass@host` credentials —
   defence = `history.replaceState` to strip the credential prefix on mount.
2. `history.replaceState` updates `window.location.href` but **not**
   `document.baseURI`. Chrome's `Request` constructor resolves relative URLs
   against `document.baseURI`, so even after the strip a `fetch("/foo")` call
   may still throw — defence = construct fetch URLs as absolute via
   `new URL(endpoint, window.location.origin)`, which IS strip-respecting per
   the URL spec.

`<GlossaryList />` carries the Session 41 strip. `glossarySseTransport.ts`
carries the Session 42 absolute-URL `resolveEndpoint` fix. Either alone is
necessary but insufficient; together they are robust against both hazards.

## 4. Expected β cache data point (Module C 3/4)

| Scenario | Expected hit | Reference |
|---|---|---|
| Cold call on a never-before-seen `surface_jp` | 0% (creation) | Step 7 Session 39 N=5 baseline |
| Warm call on the same `surface_jp` within prefix-cache TTL | ~96% (smallest 400-tok scope per N=5) | Step 7 |
| Cross-surface call to a different `surface_jp` | 0% (creation per-surface) | Step 7 N=3 cross-surface ratified |

Smoke plan calls for **2 真 LLM hover calls via Chrome DevTools MCP** for the
Module C 3/4 data point:
- Call A — `アルゴリズム` (same surface as Step 7 Session 39 first data point;
  cross-session continuity check; expecting prefix-cache hit if TTL > 5 days).
- Call B — a different surface from the 908 to ratify per-surface creation
  behaviour from the UI path.

If Call A hits at ≥96% it ratchets the cross-session TTL finding from Session
42's "> 4 days" by another ~1 day. If it cold-creates at 0%, the TTL is
between 4 and ~5 days and the finding contracts; either result is a Phase 2
β observability data point worth keeping.

## 5. Out-of-scope for Step 11 (Module D / Step 12 backlog)

- Hover-on-glossary-token in chat / quiz reply text (LD-2-ish; defers to
  Step 12 Layout integration).
- Search / filter on the 908-card list (would be useful UX but feature-creep
  this far into Module C; defer to Step 12 or 14).
- Virtualised list rendering (Lighthouse-driven optimization).
- DRY refactor of `quizSseTransport` + `glossarySseTransport` into a single
  shared `lib/ai/sseTransport.ts` (LD-5).
- Cosmetic AI SDK "system-message-in-prompts" warning suppression
  (cosmetic; defensive `allowSystemInMessages: true` pending).
