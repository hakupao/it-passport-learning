# Phase 4 Module A Step A.1 — TutorContext types + projection helpers

> Whole-module-1-sitting context: A.1 + A.2 + A.3 all landed Session 54.
> Build-time gates fired once at module close — see
> `evidence/phase4/module_a_step_03_load_tutor_context/{build_log.txt,test_results.txt}`.

## Files changed (A.1 only)

```
NEW (2):
  apps/web/src/lib/tutor/tutorContext.ts                   (top section: types + 2 projection helpers; ~95 lines through projectRecentQuiz)
  apps/web/src/lib/tutor/__tests__/tutorContext.test.ts    (top + middle sections: 13 cases; 6 projectChapterStatuses + 7 projectRecentQuiz)
```

A.3 section of the same `tutorContext.ts` + the bottom describe block of `tutorContext.test.ts` are shipped in Step A.3 (same physical files, different logical units).

## Public surface added (A.1)

| Symbol | Kind | Purpose |
|---|---|---|
| `QuizAttempt` | interface | Projected shape `{questionId, lastAnswered, correct}` |
| `TutorContext` | interface | `{completedChapters[], inProgressChapters[], pendingChapters[], recentQuiz[]}` |
| `DEFAULT_RECENT_QUIZ_LIMIT` | const = 10 | Cap on `recentQuiz.length` |
| `projectChapterStatuses(progress, chapters)` | fn | 3-bucket split preserving source order |
| `projectRecentQuiz(progress, limit)` | fn | Desc sort by lastAnswered + qid tiebreaker, sliced |

## Dependency direction

```
tutorContext (A.1) ───imports──► book/progressStore (Phase 3)
                  └──imports──► book/chapterScope ChapterSummary (Phase 3)
```

No new transitive deps. Phase 1+2+3 frozen surfaces untouched (additive).

## What stays untouched

- All Phase 1+2+3 frozen surfaces (chat / quiz / glossary / book) — A.1 is pure new-file logic
- `apps/web/src/lib/book/progressStore.ts` schema unchanged (only A.2 extends it with a new helper)
- `apps/web/src/lib/book/chapterScope.ts` unchanged
- No `/api/*` changes
- No middleware changes
- No `app/` route changes
