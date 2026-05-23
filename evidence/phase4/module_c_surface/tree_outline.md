# Module C — Surface (C.1 + C.2 + C.3 + C.4) file tree

## New files (6)

- `apps/web/src/components/Tutor.tsx` — standalone tutor chat page component (D-106 §2.1)
- `apps/web/src/app/[locale]/tutor/page.tsx` — route page server component
- `apps/web/src/lib/tutor/tutorHistoryStore.ts` — localStorage persistence (D-106 §2.2)
- `apps/web/src/lib/tutor/__tests__/tutorHistoryStore.test.ts` — 14 vitest cases
- `apps/web/src/lib/tutor/escalation.ts` — `shouldEscalate()` heuristic (D-106 §2.4)
- `apps/web/src/lib/tutor/__tests__/escalation.test.ts` — 21 vitest cases

## Modified files (4)

- `apps/web/src/components/NavTabs.tsx` — +`/tutor` to SECONDARY_TAB_PATHS + secondaryLabels (C.4)
- `apps/web/messages/ja.json` — +Nav.tutor + Tutor.* (8 keys)
- `apps/web/messages/zh.json` — +Nav.tutor + Tutor.* (8 keys)
- `apps/web/messages/en.json` — +Nav.tutor + Tutor.* (8 keys)

## Documentation (2)

- `docs/decisions/D-106-module-c-surface-design.md` — ADR locking Q1-Q4
- `docs/discussion/2026-05-23-session-58.md` — session log
