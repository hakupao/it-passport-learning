# Module C — Surface design notes

## §1 D-106 decisions

| Q | Decision | Rationale |
|---|---|---|
| Q1 Surface | Standalone `/[locale]/tutor` route, 5th NavTabs secondary tab | Deepest immersion; clearest mental model; `/api/tutor` already route-scoped |
| Q2 Persistence | Single global thread, key `itp:tutor:session:v1` | Resume-style UX mirrors Phase 2 chat; separate key preserves D-085 §2.4 |
| Q3 Refresh | Snapshot on mount | Preserves inner preamble cache breakpoint byte-stable across turns (D-103 §2.4) |
| Q4 Escalation | Auto-detect keyword heuristic, no UI toggle | Bounded false-positive cost; exercises full D-104 matrix in prod |

## §2 In-source LDs

- **LD-Module-C-1**: `DefaultChatTransport({ api: "/api/tutor" })` used to configure useChat endpoint (AI SDK v6 transport pattern; replaces deprecated `api` string option from v4)
- **LD-Module-C-2**: `sendMessage(msg, { body: { tutorContext, escalate } })` per-send body injection via `ChatRequestOptions.body` — avoids React state timing issues with hook-level body
- **LD-Module-C-3**: `ctxRef = useRef<TutorContext>` for snapshot context (D-106 §2.3) — ref not state, since TutorContext is frozen for session and shouldn't trigger re-renders
- **LD-Module-C-4**: Pending user message constructed as temporary `UIMessage` for `shouldEscalate()` evaluation before `sendMessage` fires — allows keyword detection on the message being sent (not yet in the messages array)
- **LD-Module-C-5**: `handleClear` refreshes TutorContext after clearing history — new-conversation starts with fresh progress snapshot
- **LD-Module-C-6**: Tutor page server component loads chapters via same `buildAllChapterSummaries()` + `DataSource.loadIndex()` pattern as book page — chapters passed as serialized props to client component

## §3 γ tripwire

Module C treated as single block (C.1 design lock + C.2+C.3+C.4 implementation in one sitting).

- PLAN midpoint: C.1 45 + C.2 150 + C.3 75 + C.4 45 = **315 min**
- Actual: ~40 min wall (C.1 design = ~10 min Q round + C.2+C.3+C.4 = ~30 min implementation)
- Delta: **−87% under midpoint**
- Profile: composition-on-frozen-surfaces — Tutor.tsx mirrors Chat.tsx 1:1; tutorHistoryStore mirrors historyStore; escalation is greenfield pure function; NavTabs is 2-line addition

## §4 Rule disposition

- **Rule A**: 0 抽检 — all greenfield additions, no >50% compression/rewrite
- **Rule B**: 0 失败归档 — gates clean first try (tsc + vitest 482/482 + eslint 0/0 + next build 27 pages)
- **Rule C**: RETROSPECTIVE_phase4.md at Phase 4 close (D.3)
- **Rule D**: Writer ≠ Reviewer — build-time reviewer chain fired (vitest + tsc + eslint + next build); subagent separation for tutorHistoryStore + escalation (executor agents) vs main context (Tutor.tsx + NavTabs + i18n)

## §5 Bundle invariants

| Surface | Session 57 | Module C | Delta |
|---|---|---|---|
| Middleware | 44.2 kB | 44.2 kB | UNCHANGED |
| Shared First Load | 102 kB | 102 kB | UNCHANGED |
| `/[locale]/chat` | 169 kB | 169 kB | UNCHANGED (D-085 §2.4) |
| `/[locale]/quiz` | 120 kB | 120 kB | UNCHANGED |
| `/[locale]/book` | 121 kB | 121 kB | UNCHANGED |
| `/[locale]/book/chapter/[nn]` | 181 kB | 181 kB | UNCHANGED |
| `/[locale]/glossary` | 119 kB | 119 kB | UNCHANGED |
| `/[locale]/tutor` | — | **175 kB** | NEW |
| Phase 2 API routes | 138 B | 138 B | UNCHANGED |
| `/api/tutor` | 138 B | 138 B | UNCHANGED |
| Static pages | 24 | 27 | +3 (ja/zh/en tutor) |
