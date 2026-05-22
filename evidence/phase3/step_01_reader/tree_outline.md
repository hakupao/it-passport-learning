# Step 1 — file tree outline

Phase 3 Step 1 (Reader 壳) — Session 50 · 2026-05-22.
LDs: D-101 §2.1-§2.5 + PLAN.md §0 LD-1~LD-4.

## New files (6)

```
apps/web/src/
├── app/
│   └── [locale]/
│       └── book/
│           ├── chapter/
│           │   └── [nn]/
│           │       └── page.tsx              # NEW — chapter reader route (D-101 §2.2)
│           └── page.tsx                       # NEW — book index route (D-101 §2.1)
├── components/
│   ├── BookIndex.tsx                          # NEW — 16-chapter TOC component
│   └── ChapterReader.tsx                      # NEW — continuous chapter page flow
└── lib/
    └── book/
        ├── __tests__/
        │   └── chapterScope.test.ts           # NEW — 20 unit cases
        └── chapterScope.ts                    # NEW — pure projection / parse fns
```

## Modified files (5)

```
apps/web/src/components/NavTabs.tsx            # MOD — LD-1 Book primary tab + chat/quiz/glossary 视觉降级
apps/web/src/app/[locale]/page.tsx             # MOD — redirect /chat → /book per D-101 §2.1
apps/web/messages/ja.json                      # MOD — Nav.book + Book.* keys
apps/web/messages/zh.json                      # MOD — Nav.book + Book.* keys
apps/web/messages/en.json                      # MOD — Nav.book + Book.* keys
```

## Deleted files (0)

(none; Phase 2 surfaces remain as escape-hatch URLs per LD-1)

## Evidence files (this dir)

```
evidence/phase3/step_01_reader/
├── tree_outline.md                            # this file
├── build_log.txt                              # `pnpm exec next build` output
├── test_results.txt                           # `pnpm exec vitest run` summary
└── design_notes.md                            # design rationale + LD trace
```
