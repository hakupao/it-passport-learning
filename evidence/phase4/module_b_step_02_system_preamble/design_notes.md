# Phase 4 Module B Step B.2 — design notes

> **Scope**: Author the tutor `SYSTEM_INSTRUCTION` constant + the
> `formatTutorPreamble(ctx)` deterministic text projection + the
> `buildTutorMessages(ctx, conversation)` message builder with Anthropic
> ephemeral cache_control on both system messages (nested-breakpoint
> layout). Pure builder; no API call.
>
> **Source of truth**: D-102 §7.2 (Anthropic Sonnet 4.6 + prompt caching
> locked); D-103 §2.4 (≥80% cache hit ratio target — ephemeral cache
> mandatory); D-088 §2.3 + D-095 §2.3 (stable-prefix invariant mirror);
> Phase 4 PLAN.md §1 row B.2; Phase 2 chat.ts cache-block reference.

---

## 1. Cache-layout decision (in-source LD-Module-B-5)

### Why two cache_control markers (nested breakpoints) vs one?

Anthropic's prompt cache uses longest-matching-prefix lookup with up to
4 cache_control breakpoints per request. Single-marker layout (Phase 2
chat pattern) caches everything up to and including the marked block;
nested-marker layout creates multiple addressable cache prefixes within
the same request.

For the tutor, the two stable-prefix blocks have different invalidation
profiles:

| Block | Invalidation trigger | Frequency |
|---|---|---|
| `TUTOR_SYSTEM_INSTRUCTION` | Source code edit | ~never within a deploy |
| `formatTutorPreamble(ctx)` | User completes a chapter / self-reports a quiz | irregular within a session |

Single-marker (on preamble): cache invalidates the entire prefix when
preamble bytes drift — even though the SYSTEM portion was byte-stable.

Two-marker: when preamble drifts, the inner breakpoint invalidates, but
the outer (SYSTEM-only) breakpoint still hits. Result: partial cache-hit
recovery on progress-mutation mid-session, which directly improves the
D-103 §2.4 ≥80% hit-ratio target.

The cost of the extra marker is negligible (Anthropic does not charge
per cache_control marker; the 4-marker budget is more than enough).

### Why SYSTEM first, preamble second?

Per longest-matching-prefix lookup, the cache key is the full token
sequence from the start of the prompt. Placing the invariant block
first means the outer cache prefix is also the longest-stable prefix.
This is the same posture as Phase 2's chat layout (corpus first =
longest-stable block; SYSTEM_INSTRUCTION second). Tutor mirrors that
pattern but swaps "corpus" for "SYSTEM_INSTRUCTION" (the tutor doesn't
need the full 554-page corpus inline — the preamble is the per-user
context surface).

## 2. SYSTEM_INSTRUCTION authoring rationale (LD-Module-B-6)

The locked text is intentionally minimal — 5 paragraphs, ~150 tokens —
because it's the byte-stable cache key. Drift is expensive (every
existing ephemeral cache entry across all users invalidates on a
SYSTEM edit, though the 5-min TTL absorbs this naturally).

Key clauses + their purpose:

| Clause | Purpose |
|---|---|
| `AI 学習助手 (study tutor) for the Japanese IT Passport (ITパスポート)` | Domain anchor (D-102 §2.1 form lock) |
| `user-state snapshot above (## User Learning Snapshot)` | Forward-reference to the preamble — tells Sonnet to read the snapshot above as user-state, not as part of the user's question |
| `recommend next chapters from Pending` + `reference completed chapters` + `revisit quiz items they recently marked as wrong` | Grounding contract — converts the 3-bucket TutorContext into 3 concrete instructions |
| `chapter number (nn) and the Japanese title verbatim` | Citation discipline (D-101 §2.3 strict-ja-content invariant honored) |
| `Reply in Japanese by default ... mirror their language` | Language policy mirrors Phase 2 chat SYSTEM_INSTRUCTION |
| `≤300 tokens` | Reply budget (looser than Phase 2 chat's 200 because tutoring needs walking-through-a-topic room; B.3 cost dry-run will verify under D-103 \$15) |
| `encouraging, specific, never patronising — coaching relationship` | Tone anchor for the tutor persona |

## 3. formatTutorPreamble layout (LD-Module-B-7)

```
## User Learning Snapshot

Total chapters: N

### Completed (count)
- nn: title
...
(or "(none)")

### In progress (count)
...

### Pending (count)
...

### Recent quiz attempts (count)
- ISO timestamp | question_id | correct|wrong
...
```

### Why this structure?

| Choice | Rationale |
|---|---|
| Markdown headings (`##` / `###`) | Sonnet 4.6 instruction-following is robust on markdown headings (Phase 2 hover/quiz SYSTEM also uses headings); helps the model parse the snapshot as structured |
| `(none)` literal for empty buckets | Bucket headings always appear → consistent shape across cold/warm states (= cache-friendly); empty marker is unambiguous (vs missing heading which could be read as "data unavailable") |
| `nn: title` (Japanese verbatim) | Matches D-101 §2.3 strict-ja-content invariant; the tutor cites these strings back to the user |
| ISO timestamp on quiz | Sonnet can reason about recency without ambiguous "recent" / "today" phrasing |
| `correct|wrong` literal vs `true|false` | Natural language is easier for Sonnet to act on ("revisit wrong answers") |
| `(count)` in heading | Token-efficient summary; the tutor sees both the count and the list without redundant counting |

### Why deterministic projection?

Cache-friendliness — same TutorContext bytes → same preamble bytes. The
A.1 projection helpers (`projectChapterStatuses` + `projectRecentQuiz`)
already deliver deterministic ordering (source order within buckets +
lastAnswered DESC with questionId ASC tiebreaker), so the projection
chain is end-to-end deterministic.

## 4. ModelMessage builder design (LD-Module-B-8)

`buildTutorMessages` accepts `ModelMessage[]` for the conversation suffix
(not `UIMessage[]`). The caller (future `/api/tutor` route in B.4) is
expected to convert client UIMessages via `convertToModelMessages` first
— same posture as Phase 2 `/api/chat`. This keeps the builder pure +
testable in node env without dragging UI-side types in.

## 5. In-source LDs (this step)

- **LD-Module-B-5** Two-marker nested-breakpoint cache layout (vs
  single-marker) — see §1
- **LD-Module-B-6** SYSTEM_INSTRUCTION ~150 tokens, 5 paragraphs, ≤300
  token reply budget — see §2
- **LD-Module-B-7** Deterministic markdown-heading preamble with
  `(count)` summaries + `(none)` empty markers — see §3
- **LD-Module-B-8** Builder accepts `ModelMessage[]` (post-convert) for
  pure node-env testability — see §4
- **LD-Module-B-9** Vitest **inline-snapshot** (`toMatchInlineSnapshot`)
  locks the SYSTEM byte content — drift triggers test failure (writer
  ≠ reviewer enforcement per Rule D; if SYSTEM changes intentionally,
  the snapshot updates in the same diff under review)

## 6. Rule disposition

| Rule | Status | Note |
|---|---|---|
| **A** Semantic audit (>50% compression) | n/a | New file, no transformation work |
| **B** Failure archive | n/a | First-try clean (tutorPrompt.test.ts 19/19 PASS on first run; full suite 390/390 PASS) |
| **C** Phase retro | ⏸ deferred | RETROSPECTIVE_phase4.md at Module D Step D.3 per PLAN.md |
| **D** Writer ≠ Reviewer | ✅ partial | Build-time reviewer chain (vitest + tsc + eslint + next build) fired; inline-snapshot under reviewer surveillance |

## 7. γ tripwire row #20 (Module B B.2)

- **PLAN.md midpoint**: 135 min (B.2 row: "90-180 min").
- **Actual wall**: ~30 min (SYSTEM authoring + preamble formatter + builder + 19 tests + 1 inline-snapshot lock).
- **Delta**: **-78% under midpoint**.
- **Module B N=2 mean**: B.1 -67% + B.2 -78% = mean **-72% under midpoint**.
- **Interpretation**: Module B's first two steps are typing + constant-
  authoring + pure-helper work — same composition profile as Module A
  data layer (mean -70%). The PLAN.md §5 hypothesis ("new-infra reverts
  to midpoint × 1.0") will be tested at **B.3 (cost dry-run)** + **B.4
  (`/api/tutor` endpoint)** which are the first steps with non-trivial
  new-infra work (stream handling, error semantics, cache-usage telemetry).
  Until then, treat the -72% mean as composition-leverage rather than
  evidence the new-infra reversion thesis is wrong.

## 8. β tripwire posture (Anthropic ephemeral cache)

B.2 does not fire any API call. β data collection starts at:

- **B.3 cost dry-run**: ~10 mock conversations; β re-opens here with the
  NEW Phase 4 bucket (Anthropic ephemeral cache, different mechanism vs
  Phase 2 DeepSeek prefix cache N=14 cumulative). Target ≥80% per D-103
  §2.4.
- **B.4 `/api/tutor` endpoint**: production wiring; first end-to-end real-
  user β datapoint.
- **C.3 wire + smoke**: per-locale smoke; β data per locale.
- **D.2 prod deploy**: full empirical β append to RETROSPECTIVE_phase4.

## 9. Cache prefix audit (D-088 §2.3 / D-095 §2.3 stable-prefix invariant)

B.2 introduces a new byte-stable prefix for the tutor path. The Phase 2
chat / quiz / hover SYSTEMs at `apps/web/src/app/api/chat/route.ts` /
`apps/web/src/lib/ai/quiz.ts` / `apps/web/src/lib/ai/hover.ts` are
**untouched** — D-085 §2.4 frozen contract honored. The tutor cache key
is a NEW prefix that does not collide with Phase 2 caches (different
SYSTEM bytes = different cache namespace per Anthropic ephemeral cache
contract).

`tutorPrompt.ts` exports the SYSTEM constant + 2 pure helpers. No global
state, no side effects, no I/O. The constant has an inline-snapshot
guard against accidental edits.

## 10. Module B Step B.3 hand-off

Step B.3 is **the cost dry-run + user gate G2** per Phase 4 PLAN.md §4:

> After Module A close + user explicit `开始 Phase 4 Module B` → Steps
> B.1 + B.2 land; Step B.3 cost dry-run triggers explicit user approval
> per CLAUDE.md before first Anthropic API call.

This session lands B.1 + B.2 only. **B.3 cost dry-run requires explicit
user approval** before I run ~10 mock conversations against the locked
SYSTEM + preamble + Sonnet 4.6 to measure:

- Input tokens / output tokens per turn
- Cache hit ratio (target ≥80%)
- Cost per conversation
- Projected Phase 4 burn vs D-103 \$15 cap

If projection exceeds cap, Module B is revised + B.3 re-runs before B.4
ships `/api/tutor`. User gate signals: `开始 Phase 4 Module B Step B.3`
(or `开始 dry run`) opens that gate; `hold` defers.
