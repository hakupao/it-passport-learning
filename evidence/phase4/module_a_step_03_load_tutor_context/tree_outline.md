# Phase 4 Module A Step A.3 — loadTutorContext composer

> Whole-module-1-sitting context: A.1 + A.2 + A.3 all landed Session 54.
> This step's evidence dir also holds the module-close build_log + test_results
> (shared with A.1 and A.2 via the single gate-run pattern).

## Files changed (A.3)

```
MOD (2 — same files as A.1; A.3 ships its section into them):
  apps/web/src/lib/tutor/tutorContext.ts                   (bottom section: LoadTutorContextOptions + loadTutorContext composer; +30 lines)
  apps/web/src/lib/tutor/__tests__/tutorContext.test.ts    (bottom describe: 5 loadTutorContext cases; +90 lines)
```

## Public surface added (A.3)

| Symbol | Kind | Purpose |
|---|---|---|
| `LoadTutorContextOptions` | interface | `{recentQuizLimit?: number}` |
| `loadTutorContext(storage, chapters, options?)` | fn | I/O composer: read progressStore + apply A.1 projections → emit `TutorContext` |

## Dependency direction

```
loadTutorContext (A.3) ───imports──► progressStore.loadProgress (Phase 3, untouched)
                       └──invokes──► projectChapterStatuses (A.1, same file)
                       └──invokes──► projectRecentQuiz (A.1, same file)
```

## SSR-safety contract

`loadTutorContext` takes a `StorageLike` (typed identically to Phase 3 `progressStore.StorageLike`) so it can be called:

- Under vitest with `makeMemoryStorage()` stub — no jsdom needed
- From a client component's `useEffect` (post-mount-gate per Phase 3 LD-Step3-D) with `window.localStorage`
- Fallback posture: storage read failure or corrupt persisted shape → returns `TutorContext` with all chapters in `pendingChapters` + empty `recentQuiz` (mirrors `loadProgress`'s first-launch posture)

## What stays untouched

Same as A.1 — no Phase 1+2+3 frozen surface touched. A.3 is an I/O composer over A.1's pure helpers + Phase 3's existing `loadProgress`.

## Module A close gate evidence (this dir)

| File | Content |
|---|---|
| `build_log.txt` | `pnpm exec next build` output at Module A close (23 static pages green; bundle invariants preserved) |
| `test_results.txt` | `pnpm exec vitest run` output at Module A close (366/366 PASS; +22 over Phase 3 close = +18 tutorContext + +4 persistQuizOutcome) |
