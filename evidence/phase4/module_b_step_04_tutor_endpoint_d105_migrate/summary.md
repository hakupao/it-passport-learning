# Phase 4 Module B Step B.4 — summary

## What shipped

Single atomic commit landing two cross-referenced deliverables:

1. **`/api/tutor` POST handler** — Phase 4 AI 学習助手 brain endpoint
   - 3-way env-routable matrix per D-104 §2.1 (DeepSeek V4 pro default /
     Anthropic Sonnet 4.6 toggle / OpenAI reserved-stub)
   - Consumes `TutorContext` (from Module A) + `UIMessage[]` conversation
     history
   - Builds messages via `buildTutorMessages` (from B.2) — nested-
     breakpoint cache layout per D-103 §2.4 + LD-Module-B-5
   - AI SDK v6 `toUIMessageStreamResponse` (useChat-compatible for Module
     C UI)
   - `onFinish` wires tripwire (β cache hit) + cap (D-103 §2.5 G7 cost)
   - maxDuration=60s; D-097 firewall passes through

2. **D-105 Phase 2 four-route migrate** — legacy `deepseek-chat` /
   `deepseek-reasoner` → `deepseek-v4-flash` with route-handler-level
   `providerOptions.deepseek.thinking.type` per D-105 §2.1 table
   - `/api/chat` + `/api/glossary/hover` + `/api/hello-ai` → thinking
     disabled (non-thinking parity)
   - `/api/quiz/explain` → thinking enabled + reasoningEffort=high
     (legacy reasoner parity)
   - D-095 §2.5(ε) tripwire FIRE handled (2026-07-24 deadline)
   - D-085 §2.4 frozen surface preserved — middleware 44.2 kB / chat
     169 kB / quiz 120 kB / book 121 kB / book/chapter 181 kB **all
     UNCHANGED**

## Gate outcomes

| Gate | Command | Result |
|---|---|---|
| vitest (full) | `pnpm exec vitest run` | **447/447 PASS + 2 skipped** (+ tutor-cost-dryrun opt-in) — up from 416/416 Session 56 close (+31 new cases: +9 provider, +6 cap, +17 tutor route) |
| tsc | `pnpm exec tsc --noEmit` | clean — first re-run pass after LD-Module-B-15-A `ProviderOptionsShape` type alias resolved the AI SDK `SharedV3ProviderOptions` constraint |
| eslint | `pnpm exec eslint src` | 0 errors / 0 warnings |
| next build | `pnpm exec next build` | green — 24 static pages compile in 1.66s; `/api/tutor` registered as dynamic route (138 B) |

## Bundle invariants vs Session 56 close baseline

| Surface | Baseline | This commit | Status |
|---|---|---|---|
| Middleware | 44.2 kB | 44.2 kB | ✅ unchanged |
| Shared First Load JS | 102 kB | 102 kB | ✅ unchanged |
| `/[locale]/chat` | 169 kB | 169 kB | ✅ unchanged |
| `/[locale]/quiz` | 120 kB | 120 kB | ✅ unchanged |
| `/[locale]/book` | 121 kB | 121 kB | ✅ unchanged |
| `/[locale]/book/chapter/[nn]` | 181 kB | 181 kB | ✅ unchanged |
| `/[locale]/glossary` | 119 kB | 119 kB | ✅ unchanged |
| `/api/{chat, quiz/explain, glossary/hover, hello-ai}` | 138 B | 138 B | ✅ unchanged |
| `/api/tutor` (new) | n/a | **138 B** | ✅ parity with siblings |

D-085 §2.4 frozen contract honoured across the migrate — model param
change is bottom-of-stack per D-105 §2.2 and does NOT propagate to
surface bundles.

## In-source LDs added this step

- **LD-Module-B-15** — Phase 2 thinking-mode dispatch via call-site
  `providerOptions` (NOT baked into LanguageModel); helper +
  `ProviderOptionsShape` type alias + cap pricing tier extension
  - **15-A** local `ProviderOptionsShape` (no `@ai-sdk/provider-utils`
    direct dep)
  - **15-B** `pricingFor` tutor dispatch to V4 pro / Sonnet tiers
- **LD-Module-B-16** — `validateTutorRequestBody` extracted to sibling
  `tutorRequest.ts` per Next.js route-export restriction (build-time
  reviewer chain caught the violation)

## Phase 4 cost ledger — cumulative

| Step | Real \$ | Cum Phase 4 \$ |
|---|---|---|
| A.1 + A.2 + A.3 | \$0 | \$0 |
| B.1 + B.2 | \$0 | \$0 |
| B.3 (4 dry-run attempts) | ~\$0.35 | ~\$0.35 |
| **B.4 (this)** | **\$0** | **~\$0.35** |

vs D-103 \$15 cap = **42× headroom**; vs cost tripwire G7 \$10 = 28×
headroom. G7 silent.

## Module B closure status

Module B Step B.1 + B.2 + B.3 + B.4 **all ✅ DONE**. Module B itself
**fully shipped** in 4 steps across 3 sittings (Session 55: B.1+B.2;
Session 56: B.3; Session 57: B.4). Phase 4 tutor brain end-to-end
operational and behind the firewall; the only remaining downstream
work is Module C UI (`<Tutor />` surface + useChat wiring) per gate
G4.

## Next-step gate

**G4** Module C 实施 — user-pending `开始 Phase 4 Module C` (or
step-level `开始 Phase 4 Module C Step C.1`). G4 fires C.1 design Q
on route decision (standalone `/[locale]/tutor` vs in-book modal).
