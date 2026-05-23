# D-106 — Module C tutor surface design (standalone route + global thread + snapshot refresh + auto-detect escalation)

| 字段 | 値 |
|---|---|
| ID | D-106 |
| Topic | Phase 4 Module C surface form, persistence model, TutorContext refresh policy, escalation UX |
| Status | **LOCKED 2026-05-23** (Session 58 Turn 3 — user round-1 Q1-Q4 answers all explicit) |
| Supersedes | — |
| Superseded by | — |
| Related | D-102 (Phase 4 form = AI 学習助手); D-103 §2.4 (≥80% cache hit target — Q3 snapshot preserves); D-104 §2.1 (tutor brain 3-way matrix — Q4 auto-detect drives `escalate` flag); D-101 LD-1 (NavTabs visual hierarchy — Q1 adds 5th tab); D-085 §2.4 (Phase 2 frozen surface — Q2 separate storage key preserves) |
| Closes OQ | n/a |
| Decision-on-lock writeback | `docs/discussion/2026-05-23-session-58.md` Turn 3 same turn (per D-027 §1) |

---

## 1. 背景 / Why

PLAN.md §1 Module C has 4 steps (C.1–C.4). C.1 is a design fork — the tutor surface can be a standalone route or a book-trunk modal. The remaining 3 Qs (persistence, refresh, escalation) shape C.2 implementation contract. Per D-019 §3a slow-pace, 4 Qs were posted Session 58 Turn 2; user answered all 4 explicitly Turn 3.

---

## 2. 決定 / Decision

### §2.1 Surface form = standalone `/[locale]/tutor` route (Q1)

The tutor lives at `/[locale]/tutor` as a dedicated page, accessed via a **5th NavTabs tab**. The tab follows the Phase 3 LD-1 visual hierarchy — tutor is a **secondary tab** (same demotion tier as chat/quiz/glossary) since the book trunk remains the primary surface per D-101 §2.1.

Rationale: standalone route provides the deepest immersion + clearest mental model ("a place to study with the tutor"). The `/api/tutor` endpoint is already route-handler-scoped (not tied to book context), so a standalone surface is the natural mapping.

### §2.2 Persistence = single global thread (Q2)

One continuous tutor conversation persisted in localStorage under key **`itp:tutor:session:v1`**. Resume-style UX mirrors Phase 2 `historyStore` precedent (D-085 §2.2) but with a **separate storage key** so D-085 §2.4 frozen contract stays untouched.

Implementation contract:
- Storage module = new `tutorHistoryStore.ts` following `historyStore.ts` pattern (StorageLike abstraction, version envelope, MAX_PERSISTED_MESSAGES cap, corrupt-tolerant fallback to empty)
- Clear button = "新しい会話 / 新对话 / New conversation" (same UX contract as Phase 2 Chat)
- No per-chapter scoping — single thread across all chapters

### §2.3 TutorContext refresh = snapshot on mount (Q3)

`loadTutorContext()` fires **once on component mount** (inside `useEffect` after mount-gate per Phase 3 LD-Step3-D). The resulting `TutorContext` is frozen for the duration of the tutor session. Refresh only occurs on page reload or new-conversation clear.

Rationale: snapshot model preserves the **inner preamble cache breakpoint** byte-stable across all turns within a session. This directly supports D-103 §2.4 ≥80% Anthropic ephemeral cache hit target verified in B.3 dry-run. Mid-session progress changes (e.g. user marks a chapter complete in another tab) are NOT reflected until the tutor session restarts — acceptable trade-off for α-private single-user posture.

### §2.4 Escalation = auto-detect heuristic (Q4)

The client-side code sets `escalate=true` based on a **keyword-match heuristic** applied to the latest user message. No UI toggle. The heuristic examines:

1. **Explicit harder-reasoning signals** — trilingual keyword set (e.g. "わからない", "もっと詳しく", "不懂", "详细解释", "don't understand", "explain more", "too hard", "why")
2. **Retry-after-short-response** — if the previous assistant response was notably short (< threshold tokens) AND the user re-asks about the same topic, treat as implicit escalation

Per D-104 §2.2, `escalate=true` triggers:
- DeepSeek: `reasoningEffort: 'high'` → `'max'` (same model `deepseek-v4-pro`)
- Anthropic: `claude-sonnet-4-6` → `claude-opus-4-7` (model swap)

The heuristic is a **pure function** (`shouldEscalate(messages: UIMessage[]): boolean`) so it can be unit-tested without LLM calls. False-positive cost is bounded (one turn at higher tier); false-negative cost is zero (user gets standard-tier response). Keyword list is an in-source LD, not ADR-locked — can evolve without D-NNN ceremony.

---

## 3. 却下した代替案 / Rejected alternatives

### Q1 — Surface form
| Alternative | Why rejected |
|---|---|
| (b) Modal inside book trunk | Tutor becomes "in-book only" — harder to reach without entering a chapter first; competes with `<ChapterChatModal />` for the same panel slot; limits future evolution to multi-context tutor |
| (c) Hybrid (standalone + book affordance) | More code + duplicated entry surface for α-private scale; over-engineering — the standalone route is sufficient; book-context pre-fill can be added Phase 5 without breaking D-106 |
| (d) Claude decides | User gave explicit answer |

### Q2 — Persistence
| Alternative | Why rejected |
|---|---|
| (b) Per-chapter scoped | 16 separate threads = complex state management + UX switching; pedagogical bleed across chapters is acceptable for a general-purpose tutor (it's not a chapter-specific Q&A — that's `<ChapterChatModal />`) |
| (c) Ephemeral | No continuity across visits; loses learning context between sessions; Phase 2 chat already validated that resume-style persistence is valuable for the user |
| (d) User-toggleable | More UI; defers the decision; α-private single user doesn't need privacy toggles |

### Q3 — Refresh policy
| Alternative | Why rejected |
|---|---|
| (b) Refresh every send | Cache key drifts on every turn (inner preamble bytes change) → cache hit ratio degrades below D-103 §2.4 ≥80% target; cost rises proportionally; verified empirically in B.3 dry-run that byte-stable preamble is essential for Anthropic cache engagement |
| (c) Explicit refresh button | More UI surface; most users won't press it; the mount-snapshot + page-reload natural refresh covers the practical use case |

### Q4 — Escalation UX
| Alternative | Why rejected |
|---|---|
| (b) Explicit user toggle | 95% of users won't touch a "deeper reasoning" button; adds UI complexity for α-private single user who doesn't need cost-control affordances |
| (c) Both auto + override | Most complex option; combines the brittleness of auto-detect with the UI overhead of a toggle; over-engineering for v1 |
| (d) Hide escalate for v1 | Leaves the escalation codepath untested end-to-end until Phase 5; auto-detect is low-risk (bounded false-positive cost) and exercises the full D-104 matrix in production |

---

## 4. Implementation mapping (PLAN.md §1 C.1–C.4)

| Step | Scope per D-106 |
|---|---|
| C.1 | **DONE** — design lock is this ADR. No code; wall ≈ 0 (design happened in Q round). |
| C.2 | Build `<Tutor />` page component + `tutorHistoryStore.ts` + `shouldEscalate()` heuristic + i18n keys (ja/zh/en) + `/[locale]/tutor/page.tsx` route |
| C.3 | Wire `useChat` → `/api/tutor` with TutorContext snapshot + escalation heuristic; smoke 3 locales |
| C.4 | NavTabs 5th tab (secondary tier per LD-1 visual hierarchy) |
