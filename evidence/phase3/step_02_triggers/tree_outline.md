# Step 2 Inline triggers — file tree

Phase 3 / Session 51 / 2026-05-22.

## NEW files

```
apps/web/src/lib/book/translatePrompt.ts                       (~90 lines)
apps/web/src/lib/book/__tests__/translatePrompt.test.ts        (~120 lines, 14 cases)
apps/web/src/components/ParagraphTranslate.tsx                 (~200 lines)
apps/web/src/components/SelectionToolbar.tsx                   (~150 lines)
apps/web/src/components/ChapterChatModal.tsx                   (~180 lines)
apps/web/src/components/ChapterQuizPicker.tsx                  (~130 lines)
apps/web/src/components/ChapterEndPanel.tsx                    (~75 lines)
evidence/phase3/step_02_triggers/tree_outline.md               (this file)
evidence/phase3/step_02_triggers/build_log.txt
evidence/phase3/step_02_triggers/test_results.txt
evidence/phase3/step_02_triggers/design_notes.md
```

## MODIFIED files

```
apps/web/src/lib/book/chapterScope.ts                          (+buildChapterQuestionSummaries import + helper)
apps/web/src/lib/book/__tests__/chapterScope.test.ts           (+3 cases for buildChapterQuestionSummaries)
apps/web/src/components/ChapterReader.tsx                      (+ChapterEndPanel + SelectionToolbar mount; +chapterQuestions + titleJp props; data-chapter-content marker on page list)
apps/web/src/app/[locale]/book/chapter/[nn]/page.tsx           (+buildChapterQuestionSummaries projection; passes chapterQuestions + titleJp to ChapterReader)
apps/web/messages/ja.json                                      (+Book.* 17 keys for Step 2 surfaces)
apps/web/messages/zh.json                                      (+Book.* 17 keys for Step 2 surfaces)
apps/web/messages/en.json                                      (+Book.* 17 keys for Step 2 surfaces)
docs/phase3/PLAN.md                                            (Step 2 row → DONE + actual wall amend; §7 STATUS upgrade)
docs/STATE.md                                                  (5-anchor sync; legacy Session 50 preserved per D-028)
docs/discussion/2026-05-22-session-51.md                       (NEW session log this turn)
```

## Component dependency graph (Step 2 additions)

```
ChapterReader (server)
├─ ChapterEndPanel (client, mounted at end of page list)
│   ├─ ChapterChatModal (client, uses useChat → /api/chat)
│   └─ ChapterQuizPicker (client)
│       └─ QuizExplain (Phase 2 Step 10, reused verbatim)
└─ SelectionToolbar (client, listens on document.selectionchange)
    └─ ParagraphTranslate (client, uses useChat → /api/chat)
```

All client components are mounted inside the chapter route only — no new
top-level layout changes. Phase 2 surfaces (chat, quiz, glossary) are
untouched.
