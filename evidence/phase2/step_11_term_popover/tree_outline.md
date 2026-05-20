# Step 11 — Term Popover UI · file inventory (Session 43)

7 new source files; `/api/glossary/hover` route UNCHANGED (LD-6 — Module B 5/5 ✅ complete).

```
apps/web/src/
├── app/
│   └── glossary/
│       └── page.tsx                            (40 lines)  ← server component; warmUp + loadGlossary + listGlossarySummaries
├── components/
│   ├── GlossaryList.tsx                       (141 lines)  ← client; useSearchParams ?term= ⇆ <TermPopover />
│   └── TermPopover.tsx                        (291 lines)  ← modal role="dialog" aria-modal="true"; phase machine; skeleton 3 rows
└── lib/
    └── glossary/
        ├── glossaryScope.ts                   (157 lines)  ← pure logic: buildGlossarySummary / listGlossarySummaries / parseTermParam / isKnownSurface / findSummaryBySurface
        ├── glossarySseTransport.ts            (265 lines)  ← hand-rolled SSE consumer; resolveEndpoint(window.location.origin) carry-over from Step 10 Rule B
        └── __tests__/
            ├── glossaryScope.test.ts          (230 lines)
            └── glossarySseTransport.test.ts   (320 lines)

(unchanged)
└── app/api/glossary/hover/route.ts            (149 lines)  ← Step 7, Session 39 (Module B 4/4)
```

Total new code: **1444 lines** (584 LOC source + 550 LOC tests + 310 LOC component markup).

Compare to Step 10 baseline:
- Step 10 added ~1100 net lines for quiz UI.
- Step 11 +~344 over Step 10 mostly from tests (550 vs 572) and the denser
  TermPopover header (Japanese surface + kana + zh/en + page chip vs the
  simpler `第 N ページ 問M` heading).

No new package dependencies — uses existing `next`, `react`, and the
already-present `@/lib/ai/retry`. The `Intl.Collator('ja')` is a built-in
ICU API available in Node 20+ and all evergreen browsers.
