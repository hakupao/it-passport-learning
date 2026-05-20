# Step 14 polish — tree outline (files touched)

Session 46, 2026-05-20.

## New files (3)

```
apps/web/src/lib/a11y/
  useFocusTrap.ts                       # LD-1 / LD-5 focus trap + restore hook

apps/web/src/components/
  SkipLink.tsx                          # LD-2 WCAG 2.4.1 Bypass Blocks
```

(Plus this evidence dir.)

## Modified files (12)

```
apps/web/messages/
  ja.json                               # + Common.skipToMain key
  zh.json                               # + Common.skipToMain + Sample 5 polish
  en.json                               # + Common.skipToMain key

apps/web/src/app/[locale]/
  layout.tsx                            # + <SkipLink /> before <NavTabs />

apps/web/src/components/
  Chat.tsx                              # contrast + focus-visible + aria-busy + main id
  QuizExplain.tsx                       # contrast + focus trap + reduced motion + aria-busy + focus-visible
  QuizList.tsx                          # contrast + main id + focus-visible
  TermPopover.tsx                       # contrast + focus trap + reduced motion + aria-busy + focus-visible
  GlossaryList.tsx                      # contrast + main id + focus-visible
  NavTabs.tsx                           # contrast + focus-visible on Link
  LocaleSwitcher.tsx                    # focus-visible bump + contrast on label/border
```

## Untouched (verified no regression)

```
apps/web/src/lib/ai/                    # Step 13 cap.ts untouched
apps/web/src/lib/chat/
apps/web/src/lib/glossary/
apps/web/src/lib/quiz/
apps/web/src/app/api/                   # 4 API routes untouched
apps/web/src/middleware.ts              # Firewall + i18n compose untouched
apps/web/src/i18n/                      # routing/navigation/request untouched
```

## Diff stats

```
3 files created    (~150 lines: useFocusTrap.ts ~115 / SkipLink.tsx ~20 / + this evidence dir)
12 files modified  (~50 lines net diff: contrast bumps + focus-visible adds + 2 focus-trap integrations + 2 reduced-motion blocks + i18n keys)
```

277/277 vitest baseline preserved (no new tests added — see design_notes §4 for testing strategy decision).
