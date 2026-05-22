# Step 3 Progress — file tree outline

Phase 3 / Session 52 / 2026-05-22.

## New files

```
apps/web/src/lib/book/progressStore.ts
apps/web/src/lib/book/__tests__/progressStore.test.ts
apps/web/src/components/ChapterCompletionGate.tsx
apps/web/src/components/BookProgressSummary.tsx
evidence/phase3/step_03_progress/tree_outline.md   (this file)
evidence/phase3/step_03_progress/build_log.txt
evidence/phase3/step_03_progress/test_results.txt
evidence/phase3/step_03_progress/design_notes.md
RETROSPECTIVE_phase3.md
docs/discussion/2026-05-22-session-52.md
```

## Modified files

```
apps/web/src/components/BookIndex.tsx       (+BookProgressSummary header overlay + ChapterProgressPill per card)
apps/web/src/components/ChapterReader.tsx   (+ChapterCompletionGate mounted between ChapterEndPanel and SelectionToolbar)
apps/web/messages/ja.json                   (+Book.* 13 keys: progressSummary / chapterCompleted / chapterInProgress / chapterNotStarted / completionPanelLabel / completionPanelTitle / markCompleted / markCompletedReady / markCompletedGateHint / completedBadge / completedAt)
apps/web/messages/zh.json                   (same 13 keys, zh)
apps/web/messages/en.json                   (same 13 keys, en)
docs/phase3/PLAN.md                         (Step 3 row → ✅ DONE + §7 STATUS final)
docs/STATE.md                               (5-anchor sync; legacy Session 51 preserved per D-028)
```

## Dependency graph (additions)

```
BookIndex (server)
├── BookProgressSummary ("use client")   ← progressStore.loadProgress
└── ChapterProgressPill  ("use client")  ← progressStore.{isChapterCompleted, isChapterInProgress}

ChapterReader (server)
├── ChapterEndPanel        (existing Step 2)
├── ChapterCompletionGate  ("use client")   ← progressStore.{loadProgress, markChapterCompleted, saveProgress, isChapterCompleted}
│       └── IntersectionObserver sentinel  (1×1 transparent div at top of gate panel)
└── SelectionToolbar       (existing Step 2)

progressStore (pure)
├── load / save / clear         (StorageLike abstraction, schemaVersion gated)
├── emptyProgress               (canonical fallback)
├── markChapterCompleted        (idempotent stamp)
├── recordChapterScroll         (overwrite semantics)
├── recordQuizAnswer            (overwrite semantics)
└── countCompletedChapters      (canonical NN list iteration)
```

## What stays untouched

```
apps/web/src/lib/chat/historyStore.ts                                — Phase 2 D-085 §2.2 invariant
apps/web/src/lib/data/*                                               — corpus loader, AI SDK plumbing
apps/web/src/app/api/**                                               — no API changes
apps/web/src/middleware.ts + D-097 firewall                           — untouched
apps/web/src/i18n/* + D-099 next-intl chrome                          — untouched
apps/web/src/components/{Chat,QuizExplain,QuizList,GlossaryList,
  TermPopover,LocaleSwitcher,NavTabs,SkipLink,ChapterChatModal,
  ChapterQuizPicker,ChapterEndPanel,ParagraphTranslate,
  SelectionToolbar}                                                   — Phase 2 + Step 1/2 surfaces unchanged
```
