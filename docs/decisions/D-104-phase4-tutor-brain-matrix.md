# D-104 — Phase 4 tutor brain = 3-way env-routable matrix (DeepSeek V4 pro default + Anthropic toggle + OpenAI slot)

| 字段 | 值 |
|---|---|
| ID | D-104 |
| Topic | Phase 4 tutor brain model/provider lock (supersede D-102 §7.2) |
| Status | **LOCKED 2026-05-22** (Session 56 mid-flight pivot from Anthropic-only to 3-way env-routable) |
| Supersedes | D-102 §7.2 (round-2 OQ-B lock — Anthropic Sonnet 4.6 / Opus 4.7 + prompt caching) |
| Superseded by | — |
| Related | D-102 (Phase 4 form = AI 学习助手 §2.1 unchanged); D-103 (\$15 cost cap unchanged §2.2); D-095 §2.1 (DeepSeek default provider Phase 2/3) + §2.3 (stable-prefix invariant) + §2.5(ε) (deepseek-side mirror tripwire — see D-105 for the actual FIRE event); D-088 §2.3 (Anthropic prompt caching invariant — relevant when Anthropic toggle is active); LD-Module-B-1~9 (in-source LDs from Session 55 B.1+B.2 — most preserved, some semantic shifts noted below) |
| Closes OQ | n/a (this is a supersede, not a new OQ open/close) |
| Decision-on-lock writeback | `docs/discussion/2026-05-22-session-56.md` Turn 6 same turn (per D-027 §1) |

---

## 1. 背景 / Why

Session 55 closed Phase 4 Module B B.1 + B.2 honouring D-102 §7.2 (Anthropic Claude Sonnet 4.6 default / Opus 4.7 escalation + Anthropic ephemeral cache_control:ephemeral blocks). Commit `c864e5c` shipped to origin.

Session 56 opened with user gate `开始 Phase 4 Module B Step B.3` (cost dry-run G2 second-half). Surveying environment found `apps/web/.env.local` only contains `DEEPSEEK_API_KEY` + `FIREWALL_BASIC_AUTH` — **no `ANTHROPIC_API_KEY` for the dry-run to fire against**.

User clarifying question:

> "请问你用这个是什么用途，如果是编码，你可以用我 plan 的吗，如果是网页上的问答测试，可以用 deepseek 的"

User pivot answer:

> "deepseek + anthropic + chatgpt plan 代理，可以切换"

This is a D-019 §3a slow-pace topic — a major mid-implementation supersede of a locked decision (D-102 §7.2). Per D-029 ADR-for-major-decision threshold, the supersede gets its own standalone ADR (this one).

Round-2 4Q resolved Session 56 Turn 4:

| Q | Locked answer |
|---|---|
| Q1 ChatGPT plan 代理 落地范围 | **留 openai provider slot,Phase 4 v1 不实现** — interface reserved, no SDK dep, no API key required for dev |
| Q2 V4 pro thinking 默认 | **`thinking.type='enabled'` + `reasoningEffort='high'`** (escalate → `'max'`) |
| Q3 Legacy deepseek deprecation handling | **D-105 ADR + B.4 内 migrate** (see D-105 for migrate plan; this ADR cross-references) |

---

## 2. 决定 / Decision

### §2.1 Tutor brain = 3-way env-routable matrix

| Provider | Model | Status | Activation |
|---|---|---|---|
| **deepseek** | `deepseek-v4-pro` (thinking:enabled + reasoningEffort:high default; escalate → max) | **DEFAULT + only active in Phase 4 v1** | `LLM_PROVIDER_TUTOR` unset OR `=deepseek` |
| **anthropic** | `claude-sonnet-4-6` default / `claude-opus-4-7` escalation (preserved from B.1) | **Slot active** — toggleable via env, key not required in dev | `LLM_PROVIDER_TUTOR=anthropic` |
| **openai** | TBD (ChatGPT plan 代理 endpoint TBD) | **Slot reserved interface-only** — Phase 4 v1 does NOT implement; throws "not implemented; reserved Phase 5" if selected | `LLM_PROVIDER_TUTOR=openai` |

D-102 §2.1 form (AI 学習助手) **unchanged**. D-102 §2.2 (infrastructure envelope = major new) **unchanged**. Only §7.2 (specific provider + model lock) is superseded.

### §2.2 DeepSeek V4 pro escalation = thinking.reasoningEffort delta (NOT model swap)

D-102 §7.2 originally locked escalation as **model swap** (Sonnet 4.6 → Opus 4.7). DeepSeek V4 pro has built-in reasoning effort control (`reasoningEffort: 'low' | 'medium' | 'high' | 'xhigh' | 'max'`), so escalation is now a **same-model effort bump**:

| Mode | thinking.type | reasoningEffort |
|---|---|---|
| Default | `enabled` | `high` |
| Escalate (`getTutorModel({escalate: true})`) | `enabled` | `max` |

LD-Module-B-1 escalation criterion (user-explicit harder reasoning request OR retry-after-low-confidence) **unchanged**; only the implementation pivots from "swap model ID" to "bump effort field".

### §2.3 Cache strategy = preserve cache_control markers (dual-purpose, no-op on DeepSeek)

LD-Module-B-5 (two-marker nested-breakpoint cache layout) **preserved**. Rationale:

- DeepSeek **ignores `providerOptions.anthropic.*`** namespace per D-095 §2.3 stable-prefix invariant. The `cache_control:ephemeral` markers attached to the two system messages are **harmless no-ops** under the active DeepSeek route.
- DeepSeek's **automatic server-side prefix cache** fires off the byte-stable prefix layout (system SYSTEM + system preamble + conversation) **without needing the markers** — same posture as Phase 2 chat/quiz/hover routes per D-095 §2.3.
- When the env toggle activates the Anthropic path (`LLM_PROVIDER_TUTOR=anthropic`), the markers **immediately take effect** without code change. This is the "可以切换" architectural intent the user articulated.
- B.3 dry-run will measure DeepSeek's **prefix cache hit ratio** via `providerMetadata.deepseek.{promptCacheHitTokens, promptCacheMissTokens}` (D-095 §2.3 readCacheUsage). The D-103 §2.4 ≥80% target applies to whichever provider is active; the metric name + reporting shape differs (DeepSeek hit/miss tokens vs Anthropic cache_creation/cache_read).

A comment block added to `lib/ai/tutorPrompt.ts buildTutorMessages` documents this dual-purpose explicitly.

### §2.4 Cost cap = D-103 \$15 **unchanged**

User round-2 Q3 (Session 55 — pre-pivot) answered "保留 \$15 D-103". Post-pivot rationale:

- DeepSeek V4 pro unit cost (per Context7 verification 2026-05-22): TBD precise numbers, but expected to be **substantially below** Anthropic Sonnet 4.6 (legacy V3.2 baseline was ~\$0.07/M in + ~\$1.10/M out = ~40× cheaper input + ~14× cheaper output than Sonnet 4.6). V4 pro with `thinking:enabled` adds reasoning tokens to output cost but still expected to be cheaper than Sonnet 4.6 per equivalent task quality.
- Phase 4 projected burn shifts from ~\$2-5 (D-103 §1 Anthropic-based projection) to **~\$0.10-1.00 (DeepSeek V4 pro projection)**.
- Cap **stays at \$15** as a **buffer for Anthropic toggle experimentation + Opus escalation tail + V4 pro thinking overhead unknowns**. D-103 §2.5 cost tripwire at \$10 (66% of cap) **unchanged** — fires mid-implementation cap re-review if cumulative reaches \$10.
- D-103 §2.4 ≥80% cache hit ratio target applies on the active provider — DeepSeek prefix cache or Anthropic ephemeral cache, whichever is routed.

### §2.5 Env routing variable = `LLM_PROVIDER_TUTOR`

Separate env var from D-095 §2.1 `LLM_PROVIDER` (which controls the Phase 2 chat / quiz / hover / smoke route). Rationale:

- Phase 2 routes + Tutor route may want different providers (e.g., Phase 2 stays on DeepSeek V4 flash for chat per D-105 migrate; Tutor on DeepSeek V4 pro for richer reasoning; or Tutor on Anthropic for A/B comparison).
- `LLM_PROVIDER_TUTOR=deepseek` default; `=anthropic` toggle; `=openai` reserved-stub (throws at runtime).
- Unset → defaults to `deepseek` (matches the implementation default).

### §2.6 In-source LD migration (B.1 + B.2 semantic shifts)

| LD | Original (Session 55 Anthropic-only) | Post-D-104 (Session 56 3-way) |
|---|---|---|
| LD-Module-B-1 | Escalation = model swap (Sonnet → Opus) | Escalation = same-model effort bump (DeepSeek V4 pro reasoningEffort high → max); model-swap pattern preserved for Anthropic toggle path (Sonnet → Opus) per §2.2 |
| LD-Module-B-2 | tutor anthropic-pinned (ignores LLM_PROVIDER) | tutor **env-routable** via `LLM_PROVIDER_TUTOR` (default deepseek); Anthropic + OpenAI slots preserved per §2.1 |
| LD-Module-B-3 | Dual API: getTutorModel + getModel("tutor") | **Preserved as-is** — both APIs still single-source via getTutorModel; only the default model returned changes (now DeepSeek V4 pro) |
| LD-Module-B-4 | DeepseekRole = Exclude<ModelRole, "tutor"> | **Reversed — tutor moves back IN to DeepSeek matrix** because DeepSeek is now the default tutor provider. New approach: separate getTutorModel function (kept) + tutor entries in DEEPSEEK_TUTOR + ANTHROPIC_TUTOR const tables |
| LD-Module-B-5 | Two-marker nested cache_control:ephemeral | **Preserved structurally; semantic shifts** — markers are dual-purpose (active on Anthropic toggle, no-op on DeepSeek) per §2.3 |
| LD-Module-B-6 | SYSTEM 5-paragraph ~150 token | **Preserved verbatim** (text unchanged; inline-snapshot still locks bytes) |
| LD-Module-B-7 | Deterministic markdown preamble | **Preserved verbatim** |
| LD-Module-B-8 | Builder accepts ModelMessage[] post-convert | **Preserved verbatim** |
| LD-Module-B-9 | Inline-snapshot SYSTEM lock | **Preserved verbatim** |

New LD introduced this ADR:

- **LD-Module-B-10** Env routing var `LLM_PROVIDER_TUTOR` separate from `LLM_PROVIDER` (per §2.5 rationale)
- **LD-Module-B-11** OpenAI slot = stub-only (throws at runtime with reserved-Phase-5 message) — interface reserved, no SDK dep, no API key required for dev (Q1 round-2 lock)
- **LD-Module-B-12** DeepSeek V4 pro `thinking.type='enabled' + reasoningEffort='high'` default in `getTutorModel` — implementation honors D-102 §2.1 tutor-quality requirement at acceptable cost (much cheaper than Anthropic Sonnet equivalent task)

### §2.7 Reversibility

- D-104 itself can be superseded if Phase 4 + future phases want a different tutor brain (e.g., Phase 5 ChatGPT plan 代理 implemented; D-106 candidate then)
- The 3-way env-routable architecture means toggling is a **zero-code-change env var flip** — no future supersede needed for provider swap, only for **changing the default** or **adding/removing slots**
- D-103 §2.4 ≥80% cache hit target applies to whichever provider is active; per-provider sub-targets can be added in a follow-up ADR if needed (not needed yet — single default DeepSeek covers v1)

---

## 3. Rejected Alternatives

| # | Alternative | Why rejected |
|---|---|---|
| 1 | Keep D-102 §7.2 as-is (Anthropic-only) | User explicit pivot to DeepSeek default. Anthropic-only would require active ANTHROPIC_API_KEY for B.3 dry-run + B.4 ship + every prod call → adds ongoing cost + setup friction |
| 2 | DeepSeek-only (no Anthropic / OpenAI slots) | User explicit "可以切换" intent — wants future flexibility. Slot-only design satisfies that at zero ongoing cost |
| 3 | Two-way (DeepSeek + Anthropic only) | User asked for "deepseek + anthropic + chatgpt plan 代理" — three providers explicitly. OpenAI slot reserved even if implementation deferred |
| 4 | Implement all 3 providers fully in Phase 4 v1 (with @ai-sdk/openai dep + ChatGPT 代理 URL) | User round-2 Q1 picked "留 openai 接口,但不使用" — wants the architectural slot but not the dep / proxy specifics. Defers @ai-sdk/openai SDK install + proxy URL discovery to Phase 5 or polish session |
| 5 | DeepSeek V4 flash default (cheaper than V4 pro) | User explicit pick = V4 pro. Pro gives better tutoring quality + reasoning effort control; cost still 30-100× cheaper than Anthropic Sonnet baseline |
| 6 | DeepSeek V3.2 (deepseek-chat / -reasoner) default | Legacy model line deprecation 2026-07-24 per D-095 §2.5(ε) tripwire FIRE (verified via Context7 2026-05-22). New code MUST use V4 line. Phase 2 migrate plan handled separately by D-105 |
| 7 | DeepSeek V4 pro with thinking.type=disabled default | User explicit pick = enabled + high. tutor-quality use case benefits from reasoning step; cost overhead absorbed by D-103 \$15 cap headroom |
| 8 | reasoningEffort = `max` default | Cost-prudent to start at `high` and escalate to `max` only when user explicitly requests harder reasoning per LD-Module-B-1 retained criterion |
| 9 | Shared `LLM_PROVIDER` env var for both Phase 2 + Tutor | Phase 2 routes + Tutor route may want different providers per §2.5 — separate `LLM_PROVIDER_TUTOR` gives independent control |
| 10 | Strip cache_control markers (Q4 round-1 option b from Session 55) | User round-1 Q4 picked "保留" + round-2 reaffirmed "三个都保留,方便以后可以随时更改" — markers stay as dual-purpose per §2.3 |

---

## 4. Implications

- **B.1 + B.2 partial revision required** — `apps/web/src/lib/ai/provider.ts` + tests must be updated to switch default tutor model from Anthropic Sonnet to DeepSeek V4 pro + add env routing + add OpenAI stub. `apps/web/src/lib/ai/tutorPrompt.ts` needs a comment block documenting dual-purpose cache markers per §2.3. Session 56 lands these revisions before B.3 dry-run.
- **B.3 cost dry-run reframed** — runs against DeepSeek V4 pro (not Anthropic Sonnet). Measures `providerMetadata.deepseek.{promptCacheHitTokens, promptCacheMissTokens}` for cache hit ratio. Cost projection uses DeepSeek V4 pro pricing (TBD precise; expected ~\$0.10-1.00 Phase 4 total).
- **B.4 scope expanded** — ships `/api/tutor` endpoint (DeepSeek V4 pro) **AND** synchronously migrates Phase 2 four routes (`/api/{chat, quiz/explain, glossary/hover, hello-ai}`) from legacy `deepseek-chat` / `deepseek-reasoner` to `deepseek-v4-flash` / `-v4-pro` per D-105 migrate plan.
- **OpenAI slot stays stub** — `LLM_PROVIDER_TUTOR=openai` throws "not implemented; reserved Phase 5" at runtime in `getTutorModel`. Phase 5 ADR (D-106 candidate) will implement when user provides ChatGPT 代理 endpoint + key.
- **γ tripwire baseline** — Module B B.1 + B.2 wall already captured (Session 55 actual −67% + −78%). The revision work this session (B.1 + B.2 patches) is small (~30-60 min total) so no separate γ row planned; B.3 dry-run gets its own γ row.
- **β tripwire** — DeepSeek prefix cache mechanism instead of Anthropic ephemeral cache. NEW Phase 4 β bucket opens at B.3 dry-run. Phase 2 N=14 cumulative DeepSeek β unchanged.
- **D-085 §2.4 frozen surface preservation** — Phase 2 routes are touched by D-105 migrate (model param change), but the modal lifecycle / SSE wire format / SYSTEM_INSTRUCTION text **all unchanged**. D-085 §2.4 frozen contract is at the **behavioral / surface** level not the bottom-of-stack SDK param level (per D-085 §2.4 docstring + D-095 §2.1 precedent — D-095 swapped provider mid-Phase-2 without violating D-085). D-105 documents this disposition explicitly.
- **D-095 §2.5(ε) tripwire FIRE** — handled separately by D-105 (this ADR scopes only the tutor brain matrix; the Phase 2 migrate is a co-triggered but logically independent supersede).

---

## 5. History

- **2026-05-22 Session 53 Turn 5 (D-102 §7.2)**: Anthropic Sonnet 4.6 / Opus 4.7 + prompt caching locked for tutor brain
- **2026-05-22 Session 55 Turns 3-4 (B.1 + B.2)**: tutor model lock + SYSTEM + preamble + nested-breakpoint cache layout shipped per D-102 §7.2 (commit `c864e5c`, pushed to origin)
- **2026-05-22 Session 56 Turn 1**: User gate `开始 Phase 4 Module B Step B.3` opens cost dry-run gate G2 second-half
- **2026-05-22 Session 56 Turn 2**: Survey finds no ANTHROPIC_API_KEY in `.env.local`; reported to user
- **2026-05-22 Session 56 Turn 3**: User asks "请问你用这个是什么用途" + proposes "deepseek + anthropic + chatgpt plan 代理，可以切换" + picks "V4 pro"
- **2026-05-22 Session 56 Turn 4**: D-019 §3a round-2 4Q answered (proxy / thinking / migrate disposition)
- **2026-05-22 Session 56 Turn 5**: Context7 verification — `deepseek-v4-pro` callable; deprecation deadline 2026-07-24 (legacy chat / reasoner); `@ai-sdk/deepseek` 2.0.35 supports `thinking.type` + `reasoningEffort` via `providerOptions.deepseek.*`
- **2026-05-22 Session 56 Turn 6 (THIS ADR)**: D-104 LOCKED — 3-way env-routable matrix with DeepSeek V4 pro default
