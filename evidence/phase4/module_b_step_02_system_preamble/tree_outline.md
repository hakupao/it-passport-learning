# Phase 4 Module B Step B.2 — tree outline

> Author tutor `SYSTEM_INSTRUCTION`, `formatTutorPreamble(ctx)` text
> projection, and `buildTutorMessages(ctx, conversation)` message builder
> with Anthropic ephemeral cache_control on the two-message stable
> prefix per D-103 §2.4. Pure builder — no LLM cost.

## NEW files

```
apps/web/src/lib/ai/tutorPrompt.ts                          (~150 lines)
  - TUTOR_SYSTEM_INSTRUCTION (frozen string constant)
  - formatTutorPreamble(ctx: TutorContext): string
  - buildTutorMessages(ctx, conversation): ModelMessage[]
    └─ [0] system SYSTEM_INSTRUCTION  cache_control: ephemeral  (outer breakpoint)
       [1] system preamble            cache_control: ephemeral  (inner breakpoint)
       [2..N] ...conversation

apps/web/src/lib/ai/__tests__/tutorPrompt.test.ts           (~190 lines)
  - 5 SYSTEM_INSTRUCTION stability cases (incl. inline-snapshot lock)
  - 6 formatTutorPreamble projection cases
  - 8 buildTutorMessages cache + composition cases
```

## MOD files

(none — B.2 is greenfield in a new file)

## Test count delta

- tutorPrompt.test.ts NEW: 19 cases (5 + 6 + 8)
- Full suite: 366 (Phase 4 Module A close baseline) + 24 (B.1 + B.2) = 390 vitest tests

## Cache layout (D-103 §2.4 nested-breakpoint design)

```
streamText({
  messages: [
    { role: "system", content: TUTOR_SYSTEM_INSTRUCTION,
      providerOptions: { anthropic: { cacheControl: { type: "ephemeral" } } } },
    { role: "system", content: formatTutorPreamble(ctx),
      providerOptions: { anthropic: { cacheControl: { type: "ephemeral" } } } },
    ...conversation,
  ],
  ...
})
```

Two cache_control markers exploit Anthropic's nested-prefix cache
(longest-matching-prefix wins, up to 4 breakpoints supported):

- **Outer breakpoint** (SYSTEM_INSTRUCTION): hits on every tutor call —
  SYSTEM is invariant across users + sessions; only invalidates if the
  source code is edited (vitest inline-snapshot guards against that).
- **Inner breakpoint** (preamble): hits when the user's progress is
  byte-stable across turns — typical multi-turn tutoring sitting where
  the user is asking questions without marking new chapters complete /
  self-reporting new quizzes.

When the user mutates progress mid-session, the inner cache invalidates
but the outer still hits — best-case 5-min-TTL graceful degradation.

## Bundle delta vs B.1 close

| Surface | B.1 close | B.2 close | Δ |
|---|---|---|---|
| Middleware | 44.2 kB | 44.2 kB | **UNCHANGED** |
| Shared First Load JS | 102 kB | 102 kB | **UNCHANGED** |
| `/[locale]/chat` First Load | 169 kB | 169 kB | **UNCHANGED** ← Phase 2 D-085 §2.4 invariant preserved |
| `/[locale]/quiz` | 1.57 kB / 120 kB | 1.57 kB / 120 kB | **UNCHANGED** |
| `/[locale]/book` | 1.38 kB / 121 kB | 1.38 kB / 121 kB | **UNCHANGED** |
| `/[locale]/book/chapter/[nn]` | 5.13 kB / 181 kB | 5.13 kB / 181 kB | **UNCHANGED** |

`tutorPrompt.ts` is server-only (imports `ModelMessage` from `ai`,
referenced only by the future `/api/tutor` route in B.4); zero client
bundle delta.

## Cost ledger

- B.2 LLM API calls fired: **0**
- B.2 cumulative Phase 4 spend: **\$0.00**
- D-103 \$15 cap headroom: unchanged — first call gated at B.3 user
  approval per CLAUDE.md.
