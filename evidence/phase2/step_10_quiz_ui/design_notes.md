# Step 10 — Quiz Explain UI design notes

Session 2026-05-20 Session 42 · Phase 2 Module C 1/4.

## 4Q → code mapping

| Q | Choice | Implementation site |
|---|---|---|
| **Q1** Surface | a) Modal triggered from quiz list, `?qid=` URL backed | `QuizExplain.tsx` (`role="dialog"` + `aria-modal="true"`); `QuizList.tsx` `handleSelect` pushes `?qid=...` via `next/navigation` `useRouter`. |
| **Q2** Busy UX | a) Skeleton + 「AI 正在分析…」 + 不定 progress bar | `QuizExplain.tsx` `<BusySkeleton />` component: 4-line `animate-pulse` skeleton + `role="progressbar"` w/ CSS keyframe animation (sliding 35%-wide stripe; 1.6s loop). Trilingual hint `AI が回答を生成しています…（最長 約30〜45秒）` + 中文 mirror. Hint reflects 22-42s envelope from STATE.md next-session note, though Step 6 Session 38 measured 5-15s wall on the actual `/api/quiz/explain` endpoint — the larger envelope is the design budget for worst-case R1 reasoning. |
| **Q3** QID source | a) URL `?qid=page_NNN_entity_M` | `QuizList.tsx`: `activeQid = useSearchParams().get('qid')`; `activeSummary` derived via `summaries.find(...)`; `handleSelect` → `router.push('?qid=...', {scroll:false})`; `handleClose` → `router.replace(qs ? '?'+qs : '?', {scroll:false})` to drop the param without growing history. |
| **Q4** Component | a) New `<QuizExplain />`, share only transport pattern | New file `QuizExplain.tsx` (298 lines, NO useChat); transport pattern shared by inheriting the Step-5 SSE wire format (`data: {type:'delta',text}` / `data: {type:'usage',...}` / `data: [DONE]`) — encoded server-side by `buildChatSseResponse` (unchanged Module B 5/5), decoded client-side by new `lib/quiz/quizSseTransport.ts`. |

## File layout

```
apps/web/src/
  lib/quiz/
    quizScope.ts                       — pure logic: list/parse/build summary helpers
    quizSseTransport.ts                — pure logic: SSE consumer + fetch wrapper
    __tests__/
      quizScope.test.ts                — 18 cases
      quizSseTransport.test.ts         — 18 cases
  components/
    QuizExplain.tsx                    — modal "use client"
    QuizList.tsx                       — list "use client"
  app/quiz/
    page.tsx                           — server component; loads QuizSummary[] from FsDataSource
```

## Server / client boundary

- `/quiz` route is `dynamic = "force-dynamic"` (FsDataSource reads pageJSON every request).
- Server side: `loadQuizSummaries()` loads `idx.entity_by_id` once, groups 254 question refs into 68 unique pages, `Promise.all`-loads each page, then `buildQuizSummary` per question. The result (~250 KB JSON) is serialized into the client `<QuizList />` props.
- Client side: `<QuizList />` consumes `summaries` + `useSearchParams()` for `?qid=` reactive binding; renders cards + the always-mounted `<QuizExplain summary={...} onClose={...} />` whose `summary !== null` ⇒ modal renders.

## In-source amendments (per D-094 §2.1 + D-080 v1.1 §8 patterns)

- `quizSseTransport.ts`: `resolveEndpoint(endpoint)` helper. Reason for the absolute-URL pattern documented inline (Chrome `Request` constructor resolves relatives against `document.baseURI`, which is NOT updated by `history.replaceState`; only `window.location.origin` is strip-respecting). See `failures/step_10_attempt_1_document_baseuri_credentials_pollution.md` for the failure archive.

- `QuizList.tsx`: defensive `history.replaceState` URL-credential strip carried over from Session 41 Step 9. This handles the `claude:<pass>@host/quiz` initial-URL case so `window.location.href` becomes clean post-mount (necessary even though the absolute-URL fetch in `quizSseTransport` is the actual workaround — the strip also benefits any 3rd-party fetch that resolves against `window.location.href` directly).

## NOT D-NNN-worthy

- The `resolveEndpoint` absolute-URL pattern is an implementation-layer fix to an HTML5/WHATWG URL spec subtlety, not a design decision.
- Session 42 honoured locked design cleanly:
  - D-085 §2.4 quiz scope (page + entity pin, assembleQuestion).
  - D-088 §2.3 stable-prefix invariant (corpus → instruction → fixed prompt; intra-question cache hit ratified at 99.81%).
  - D-088 §2.4 1-retry-no-fallback (maxRetries=1 + formatUserFacingError already in /api/quiz/explain since Step 8; unchanged).
  - D-089 §2.3 per-scope assembly (assembleQuestion reused, no scope-shape change).
  - D-091 §2.5(β) tripwire (0 [tripwire] fires under healthy operation, consistent w/ Sessions 38-41).
  - D-095 stable-prefix layout (server-side route untouched).
  - D-097 firewall (gated; pre+post deploy probes HTTP 401 + WWW-Authenticate).
