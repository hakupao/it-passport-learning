# Phase 4 Module B Step B.1 — design notes

> **Scope**: Lock the Anthropic tutor model pair (Sonnet 4.6 default / Opus
> 4.7 escalation) into `apps/web/src/lib/ai/provider.ts`; add `tutor` to
> `ModelRole`; add typed `getTutorModel` selector; document escalation
> criterion. Pure typing + selector — no API call.
>
> **Source of truth**: D-102 §7.2 (form lock — Anthropic Claude
> Sonnet 4.6 / Opus 4.7 + prompt caching); D-103 §2.1 (Phase 4 \$15 cap)
> + §2.4 (ephemeral cache MANDATORY); Phase 4 PLAN.md §1 row B.1.

---

## 1. Locked specifics

| Field | Value | Source |
|---|---|---|
| Default model ID | `claude-sonnet-4-6` | D-102 §7.2 round-2 lock |
| Escalation model ID | `claude-opus-4-7` | D-102 §7.2 round-2 lock (Phase 2 anthropic path uses same Opus pin per D-088 §2.1 — no new SDK pattern) |
| SDK | `@ai-sdk/anthropic` ^3.0.78 (existing) | D-102 §7.2 "no new SDK pattern" |
| Provider routing | anthropic-pinned (ignores `LLM_PROVIDER`) | D-102 §7.2 + D-103 §2.4 (ephemeral cache is anthropic-specific) |
| Cache attachment | NOT in B.1 scope — Module B Step B.2 attaches `cache_control:ephemeral` on the prefix messages | D-103 §2.4 |

## 2. Escalation criterion (in-source LD-Module-B-1)

The tutor surface (Module C) passes `{ escalate: true }` to `getTutorModel`
when either:

- **User-explicit**: the user asks for harder reasoning ("explain like I'm a
  CS student", "deep dive", "give me the full derivation") — UI hint TBD
  in Module C Step C.2.
- **Retry-after-low-confidence**: a prior Sonnet turn returned a hedged
  / "I'm not certain" response and the user retries the same question.
  Detection heuristic TBD in Module C; this could be as simple as a UI
  toggle ("try harder") rather than auto-escalation.

The escalation is per-call, not per-session — once the harder reasoning
turn returns, subsequent turns can fall back to Sonnet unless escalation
remains explicitly enabled. This keeps the cost envelope predictable
(Opus 4.7 is ~5× Sonnet unit cost per D-103 §1).

## 3. In-source LDs (per D-094 §2.1 in-source amendment pattern)

- **LD-Module-B-1** Escalation criterion as documented in §2 above
  (user-explicit OR retry-after-low-confidence)
- **LD-Module-B-2** Tutor role is anthropic-pinned in `getModel` —
  `provider` arg + `LLM_PROVIDER` env both ignored on the tutor path.
  Rationale: D-103 §2.4 ephemeral cache is anthropic-specific
  (`providerOptions.anthropic.cacheControl`); DeepSeek's automatic prefix
  cache uses a different mechanism that the tutor brain (multi-turn,
  user-state-aware) is not engineered for.
- **LD-Module-B-3** Separate `getTutorModel` selector vs extending
  `getModel("tutor", "anthropic")`. The dual API gives callers a typed
  ergonomic path (`getTutorModel({ escalate: true })`) for the only role
  that needs escalation, while keeping `getModel("tutor")` available for
  Phase 2-style call sites that just want "the default model for this
  role". Both paths converge on `getTutorModel()` internally so the
  selection logic stays single-source.
- **LD-Module-B-4** `DeepseekRole = Exclude<ModelRole, "tutor">` typed
  record key — keeps `DEEPSEEK_MODEL_BY_ROLE` from gaining a meaningless
  `tutor: "deepseek-..."` placeholder. The Exclude is the cleanest way
  to express "the tutor role exists in ModelRole but does not appear in
  the deepseek matrix".

## 4. Rule disposition

| Rule | Status | Note |
|---|---|---|
| **A** Semantic audit (>50% compression) | n/a | Pure typing — no transformation work |
| **B** Failure archive | n/a | First-try clean (provider.test.ts 25/25 PASS on first run; full suite 390/390 PASS) |
| **C** Phase retro | ⏸ deferred | RETROSPECTIVE_phase4.md committed at Module D Step D.3 per PLAN.md |
| **D** Writer ≠ Reviewer | ✅ partial | Build-time reviewer chain (vitest + tsc + eslint + next build) fired; browser-based reviewer chain engages at Module D ship |

## 5. γ tripwire row #19 (Module B B.1)

- **PLAN.md midpoint**: 60 min (B.1 row: "30-90 min").
- **Actual wall**: ~20 min (model-ID add + selector + tests + verification).
- **Delta**: **-67% under midpoint**.
- **Module B N=1 first datapoint**: Module A mean was -70% (data layer
  projection); B.1 -67% is the first new-infra-path step. Hypothesis from
  PLAN.md §5 was that Module B reverts to midpoint × 1.0 (per
  RETROSPECTIVE_phase3 §3.6). B.1 actual is similar to Module A — but
  B.1 is essentially a constant-add + typed selector + tests, the lightest
  new-infra step. **Watch B.2 (SYSTEM authoring) for whether γ holds at
  composition-leverage or reverts to midpoint × 1.0**; that's the first
  meaningful new-infra wall-cost datapoint.

## 6. Cache prefix audit (D-088 §2.3 / D-095 §2.3 stable-prefix invariant)

B.1 does not modify any existing SYSTEM_INSTRUCTION or message-builder
helper. The Phase 2 byte-stable prefixes for `/api/{chat, quiz/explain,
glossary/hover}` are untouched. B.2 will introduce a NEW byte-stable
prefix for the tutor path (own SYSTEM + own preamble); the Phase 2
prefixes remain frozen per D-085 §2.4.

## 7. Module B Step B.2 hand-off

Step B.2 will create `apps/web/src/lib/ai/tutorPrompt.ts` with:

- `TUTOR_SYSTEM_INSTRUCTION` (string constant; vitest inline-snapshot
  locks it).
- `formatTutorPreamble(ctx: TutorContext)` (deterministic text projection
  of the Module A `TutorContext` shape).
- `buildTutorMessages(ctx, conversation)` (composes the
  `[system SYSTEM, system preamble, ...conversation]` prefix and attaches
  `cache_control:ephemeral` to both system messages per D-103 §2.4 nested-
  breakpoint layout).

`getTutorModel()` from B.1 will be wired in by the future `/api/tutor`
endpoint (Module B Step B.4 — post-B.3 cost dry-run gate G2).
