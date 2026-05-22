# D-102 — Phase 4 形态 = AI 学习助手 (D-083 §2.5 deferred form lifted)

| 字段 | 值 |
|---|---|
| ID | D-102 |
| Topic | Phase 4 形态锁 |
| Status | **LOCKED 2026-05-22** (Session 53 Turn 6 — round-1 + round-2 4Q both resolved; full close via §7 amendment) |
| Supersedes | — |
| Superseded by | — |
| Related | D-083 §2.5 (Phase 4 form deferred — now lifted); D-101 §2.6 (Phase 4 form OPEN — now closed by this ADR); D-090 (LLM cost cap, Phase 1-3 \$5 α-silent ceiling); D-091 (Phase 2 budget); D-085 §2.4 (3 Phase 2 surfaces frozen); D-088 §2.3 + D-095 §2.3 (stable-prefix cache invariant); D-100 (Upstash cap counter — already provisioned, candidate reuse for Phase 4 server state); D-097 (Basic Auth firewall); D-099 (next-intl i18n chrome); progressStore (Phase 3 Step 3 LD-Step3-A~H — candidate data source); Phase 3 RETROSPECTIVE §2.3 (hand-off list); Phase 3 RETROSPECTIVE §3.6 (γ tripwire — new-infra path reverts to Phase 1/2 unit cost model) |
| Closes OQ | n/a (OQ-05 already fully closed by D-101 §2.6) |
| Decision-on-lock writeback | `docs/discussion/2026-05-22-session-53.md` §3 same turn (per D-027 §1) |

---

## 1. 背景 / Why

Phase 3 (textbook reading trunk at `/[locale]/book`) shipped 2026-05-22 (Session 52 ✅ COMPLETE + frozen + tagged `phase3-α-ship-2026-05-22`). Per D-101 §2.6, Phase 4 form was deliberately deferred "直到 Phase 3 实施反馈 collected". That feedback now exists in `/RETROSPECTIVE_phase3.md` (5 sections, Rule C-conformant).

User gate signal `open phase 4` 2026-05-22 (Session 53 Turn 1) opens **Phase 4 设计阶段** per CLAUDE.md "Phase/stage signaling" + Session 52 §7 entry option (c). D-019 §3a round-1 4Q posed Session 53 Turn 2 and answered same turn:

| Q | Locked answer |
|---|---|
| Q1 Form | **AI 学习助手** (D-083 §2.5 deferred form lifted) |
| Q2 Infrastructure envelope | **Major new infrastructure** (new model endpoint / DB / SDK) |
| Q3 Phase 3 holdovers | **Separate polish list** (form work first; holdovers tracked but not blocking) |
| Q4 Step plan granularity | **4 modules × N steps** (Phase 2-scale ceremony) |

These four answers crystallize Phase 4 form at the headline level. Specifics (which signals does the tutor read? which model? which SDK? which 4 modules? what cost ceiling?) drop to D-019 §3a round-2 4Q as OQ-A/B/C/D below (§5).

---

## 2. 决定 / Decision

### §2.1 Phase 4 form = AI 学习助手 (chat-driven personalized tutor)

Phase 4 ships an AI 学习助手 — a chat-driven personalized tutor that:

- **Knows the user's reading progress** via progressStore (Phase 3 LD-Step3-A~H schema): which chapters are completed, which are in-progress (scrollY > 0), what's pending. Quiz history (`recordQuizAnswer` slot) also available if wired (currently helper-only per LD-Step3-H).
- **Engages in conversation tailored to where the user is** — recommends next steps, answers questions in reading context, references specific chapters/pages, calls out weak areas.
- **Surfaces** TBD per OQ-C round-2 (new route `/[locale]/tutor`? modal inside book trunk? sidebar?). NOT replacing Phase 2 `<Chat />` (which stays as escape-hatch chat); NOT replacing Phase 3 `<ChapterChatModal />` (which stays as in-chapter narrow-scope chat).

This is the D-083 §2.5 deferred form lifted. D-101 §2.6 had marked Phase 4 form as "STILL OPEN — deferred until Phase 3 implementation reveals real needs"; the reveal happened, the form fits.

### §2.2 Infrastructure envelope = major new

Phase 4 **opens new infrastructure** — explicitly NOT composition-only on Phase 2+3 surfaces (which was offered as Q2 option a but rejected). Specifics deferred per OQ-B round-2, but candidates include:

- **New model endpoint** — e.g., Anthropic Claude Sonnet 4.6 / Opus 4.7 alongside or replacing the current DeepSeek `deepseek-chat`. Better instruction-following + longer context for a tutor brain that holds conversation memory + progress facts.
- **Agentic SDK** — e.g., Anthropic Agent SDK or Vercel AI SDK agent patterns for a multi-turn tool-using tutor (tool 1: read progressStore; tool 2: cite chapter passages; tool 3: suggest next chapter).
- **Server-side state DB** — Upstash Redis already provisioned per D-100 (currently used only for cap counter); could host tutor session memory beyond localStorage (cross-device continuity, longer history retention than progressStore's α-private scope).
- **AI Gateway** — e.g., Vercel AI Gateway for model swap without code change; useful if Phase 4 wants to A/B test models.

**γ tripwire implication**: per RETROSPECTIVE_phase3 §3.6 module-level observation, "new-infra path reverts to Phase 1/2 unit cost model (midpoint × 1.0, NOT Phase 3's × 0.4)". Phase 4 PLAN.md estimates must NOT use the Phase 3 multiplier. Phase 4 N=1 datapoint forthcoming.

### §2.3 Phase 3 holdovers = separate polish list (not blocking)

Phase 4 form work proceeds independently of the RETROSPECTIVE_phase3 §2.3 hand-off list. These remain tracked but **not blocking** Phase 4:

1. Wire `recordQuizAnswer` into `<QuizExplain />` finalize handler (LD-Step3-H helper-only currently)
2. Wire scroll position restore using `recordChapterScroll` + `scrollY` slot
3. Re-open β tripwire data collection on prod for chapter chat / translate paths
4. β graduation queue items (RETROSPECTIVE_phase2 §2.1-§2.6)
5. Adaptive recommendation (could become Phase 5 form or Phase 4 closing polish)

If Phase 4 work naturally surfaces a need (e.g., the tutor wants to cite the user's quiz history → wiring `recordQuizAnswer` becomes prerequisite), the holdover gets promoted into the relevant module. Otherwise they stay as opportunistic polish at Phase 4 closing.

### §2.4 Step plan granularity = 4 modules × N steps (Phase 2-scale ceremony)

Phase 4 follows the **Phase 2 ceremony model** — Module A / B / C / D each with multiple sub-steps, per-step Tier 3 evidence (`evidence/phase4/module_X_step_NN_*/`), per-step PLAN.md row, per-module mid-retro if warranted, full `RETROSPECTIVE_phase4.md` at close per Rule C. Specifics deferred per OQ-C round-2; typical decomposition sketch:

- **Module A** — Data / Profile layer (progressStore reads, conversation memory shape, optional server state via Upstash)
- **Module B** — Tutor brain (model pick + prompt engineering + tool use if agentic)
- **Module C** — UI surface (new route or modal, integration with existing book trunk, i18n via D-099)
- **Module D** — Ship (Vercel deploy + Playwright + axe-core + Lighthouse + tag candidate `phase4-α-ship-YYYY-MM-DD`)

Concrete module names + step counts + per-module wall estimate TBD per OQ-C.

### §2.5 Cost / β posture

Per CLAUDE.md "What you should NOT do without explicit user approval": **no LLM API calls that cost money** without an explicit user gate. Phase 4 implementation phase will need a **fresh user gate** when the new model burn begins (similar to the Phase 1 dry-run gate per `feedback_quality_over_cost.md`).

Current cumulative cost across all phases: **\~\$0.66 真** (Phase 1 Mistral ~\$0.579 + Phase 2 Anthropic ~\$0.085 + Phase 3 ~\$0) vs **\$5 D-090 α-silent cap** = **7.6× headroom**. Phase 4 unit cost projection:

- If new model = Anthropic Claude Sonnet 4.6: per-conversation unit cost projected meaningfully higher than Phase 2 (no prefix cache yet since SYSTEM differs from chat); first-call cost in single-digit cents
- Agentic conversation with tool use multiplies turn count per session → cumulative cost multiplier
- Need cost projection ADR pending OQ-B + OQ-D round-2 — candidate D-103

β re-opens on prod at user-gated Phase 4 Module D deploy. Existing N=14 β cumulative from Phase 2 carries forward; Phase 4 likely opens a new bucket since SYSTEM differs.

### §2.6 Reversibility

- D-102 itself can be superseded if Phase 4 form needs to pivot (e.g., user changes mind to 错题学习链 mid-implementation)
- AI 学习助手 route additive — Phase 2+3 surfaces (chat / quiz / glossary / book) all stay reachable
- New infrastructure pieces individually rollback-able (e.g., model swap behind feature flag; Upstash usage opt-in)
- progressStore / historyStore / Phase 3 surfaces remain FROZEN per D-085 §2.4 + `phase3-α-ship-2026-05-22` tag

---

## 3. Rejected Alternatives

| # | Alternative | Why rejected |
|---|---|---|
| 1 | 错题学习链 (adaptive recommendation) as Phase 4 form | User chose AI 学习助手 in round-1 Q1; adaptive can become Phase 5 form or Phase 4 closing polish |
| 2 | Phase 3 holdover wire-up only as Phase 4 form (no new headline feature) | User chose form-bearing Phase 4 instead — holdover-only was Q1 option c but not picked |
| 3 | Open-discussion form (round-2 4Q to determine form first) | User picked AI 学习助手 directly in round-1 Q1 — no need for "what is the form" round |
| 4 | Composition-only infrastructure (zero new backend) | User chose "major new" in round-1 Q2 — explicitly opting INTO heavier infra path; accepts γ tripwire midpoint × 1.0 model |
| 5 | Limited new infrastructure (small additions only) | Same as #4 — user picked the major path over the middle option |
| 6 | Holdovers as Phase 4 Step 0 baseline (wire first, form after) | User chose "separate polish list" in round-1 Q3 — form work is the priority |
| 7 | Holdovers deferred to Phase 5 (no Phase 4 polish) | User chose "tracked but not blocking" rather than "deferred entirely" |
| 8 | Single-sitting Phase 4 (1 step like Phase 3 sub-step) | User chose 4 modules × N (Phase 2-scale) in round-1 Q4 — explicitly opting INTO heavier ceremony |
| 9 | 3-5 steps (Phase 3-scale) | User chose heavier 4-modules ceremony — Phase 3-scale Phase 4 would have been the middle option but wasn't picked |

---

## 4. Implications

- **CLAUDE.md "no executable code in 设计阶段"** holds — code is gated on Phase 4 实施 user signal AFTER D-102 fully closes via OQ-A/B/C/D round-2 4Q + PLAN.md written
- **Cost gate** — Phase 4 first LLM API call (likely Module B development) needs **explicit user approval** per CLAUDE.md
- **γ tripwire** — N=1 for Phase 4 will be the first datapoint of "new-infra path"; Phase 1/2 unit cost model expected; PLAN.md estimates use midpoint × 1.0 NOT Phase 3's × 0.4
- **β tripwire** — re-opens on Phase 4 prod deploy with new model paths; existing N=14 cumulative from Phase 2 carries forward; Phase 4 likely opens a new bucket since SYSTEM differs
- **Tier** — Phase 4 = Tier 3 (mirror Phase 1/2/3 — Phase 2-scale ceremony confirmed per Q4)
- **Rule A/B/C/D** — all carry over verbatim; Phase 4 close requires `/RETROSPECTIVE_phase4.md` per Rule C
- **Phase 1+2+3 freeze preservation** — all 3 tags immutable; D-102 is strictly additive; no Phase 2+3 frozen surface modified by Phase 4 form work (Phase 3 holdover wire-ups, if any, are polish-list items per §2.3)
- **OQ-01 + OQ-02 Phase 1 carryover** — unchanged; still open; not Phase 4 scope

---

## 5. Next-step open questions (OQ-A/B/C/D round-2 4Q)

| OQ | Topic | Open options sketch |
|---|---|---|
| **OQ-A** | Personalization signals (what does the tutor know about the user?) | (a) chapters+quiz only / (b) +scrollY+time-on-chapter / (c) +user-stated learning goal / (d) chat-only no progressStore reads |
| **OQ-B** | New infrastructure piece (which "major" specifically?) | (a) Anthropic Claude (Sonnet 4.6 / Opus 4.7) + prompt caching / (b) Vercel AI Gateway (model swap) / (c) Anthropic Agent SDK with tools / (d) Upstash + new endpoint for server-side session memory |
| **OQ-C** | 4-module decomposition | (a) Data / Brain / Surface / Ship / (b) Model+cap / Prompt / Conv UI / Ship / (c) Brain / Tools / Surface / Ship / (d) decide after A+B |
| **OQ-D** | Cost / β envelope | (a) keep \$5 D-090 cap (7.6× headroom) / (b) lift to \$10-25 for Phase 4 / (c) β-open Phase 4 immediately (real cost on prod from Module A) / (d) decide after B (which model determines unit cost) |

OQ-A/B/C/D enter slow-pace round-2 4Q immediately after this lock (Session 53 Turn 4). On lock, D-102 §2 will be amended in-place with the round-2 answers; PLAN.md `docs/phase4/PLAN.md` follows.

---

## 6. History

- **2026-05-22 Session 49 Turn 4 (D-101)**: Phase 3 form locked; Phase 4 form OPEN per §2.6 deferral
- **2026-05-22 Sessions 50-52**: Phase 3 Steps 1-3 implementation; Phase 3 ✅ COMPLETE Session 52
- **2026-05-22 Session 52 Turn 8-9**: Phase 3 prod deploy + FROZEN + TAGGED (`phase3-α-ship-2026-05-22`)
- **2026-05-22 Session 53 Turn 1**: User gate signal "open phase 4" opens Phase 4 设计阶段
- **2026-05-22 Session 53 Turn 2**: D-019 §3a round-1 4Q posed + answered (form / infra / holdovers / steps)
- **2026-05-22 Session 53 Turn 3 (THIS ADR)**: D-102 LOCKED partial; OQ-A/B/C/D round-2 reserved
- **2026-05-22 Session 53 Turn 5**: OQ-A/B/C/D round-2 4Q answered — signals = chapters+quiz / model = Anthropic Sonnet 4.6 default + Opus 4.7 fallback + prompt caching / 4-modules = Data → Brain → Surface → Ship / cap lift to \$15 via D-103
- **2026-05-22 Session 53 Turn 6 (FULL LOCK)**: D-102 §7 "Round-2 close" appended; Status: LOCKED partial → LOCKED full; PLAN.md written at `docs/phase4/PLAN.md`; D-103 cost ADR LOCKED same turn

---

## 7. Round-2 close (Session 53 Turn 6 — full lock)

OQ-A/B/C/D round-2 4Q answered Session 53 Turn 5; D-102 fully closes via the following locked specifics (supersedes §5 placeholders + extends §2.2/§2.3/§2.4/§2.5):

### §7.1 OQ-A resolved — Personalization signals = chapters + quiz only (progressStore baseline)

Tutor reads `chapters[nn].{completedAt, scrollY}` + `quiz[qid].{lastAnswered, correct}` from progressStore. Clean signal surface; matches LD-Step3-A~H schema exactly.

**Implication**: RETROSPECTIVE_phase3 §2.3 holdover #1 (wire `recordQuizAnswer` into `<QuizExplain />`) is **promoted from polish list to Module A scope** — quiz signal is meaningless without it. §2.3 amended accordingly: holdover #1 is now Module A Step A.2; holdovers #2-5 stay on the separate polish list.

Rejected (round-2): +scrollY/time-on-chapter (over-scope for v1; richer signal not justified by tutor v1 needs); +user-stated learning goal (UI complexity for marginal signal-to-noise gain; can be added in a Phase 5 evolution); chat-only no progressStore reads (loses "knows your progress" core differentiation from Phase 2 Chat).

### §7.2 OQ-B resolved — Infrastructure piece = Anthropic Claude (Sonnet 4.6 / Opus 4.7) + prompt caching

**Locked model**: Anthropic Claude Sonnet 4.6 default; Opus 4.7 fallback for harder tutoring questions (escalation criterion TBD per Module B Step B.1 — likely "user explicitly asks for harder reasoning" or "Sonnet refuses / gives low-confidence answer").

**Locked SDK**: existing `@anthropic-ai/sdk` already in `apps/web/package.json` from Phase 2. **No new SDK pattern.**

**Locked caching**: Anthropic ephemeral cache blocks (`cache_control: {type: "ephemeral"}`) for the SYSTEM_INSTRUCTION + stable user-state preamble (TutorContext-as-text). 5-minute TTL per Anthropic docs; tutor SYSTEM expected to be byte-identical across turns → ≥80% cache hit on input tokens projected (per D-103 §2.4).

Rejected (round-2): Vercel AI Gateway (operational complexity unjustified for single-vendor pick); Anthropic Agent SDK with tools (agentic over-engineering for v1; can be added in a Phase 5 evolution); Upstash + server-side memory (localStorage scope sufficient for α-private single-user; defer to Phase 5/6 multi-user).

§2.2 candidates list superseded by this locked pick.

### §7.3 OQ-C resolved — 4-module decomposition = Data → Brain → Surface → Ship (Phase 2 A/B/C/D mirror)

| Module | Name | Scope summary |
|---|---|---|
| **A** | Data / Profile layer | Define tutor's read-surface types (TutorContext); wire `recordQuizAnswer` into `<QuizExplain />` (holdover #1 promoted per §7.1); build `loadTutorContext()` projection helper |
| **B** | Tutor brain | Lock Anthropic model; author tutor SYSTEM_INSTRUCTION with progress-aware preamble + ephemeral cache; **cost dry-run gate (explicit user approval)** per CLAUDE.md; ship `/api/tutor` endpoint |
| **C** | UI surface | Decide route (new `/[locale]/tutor` standalone vs modal inside book trunk) — D-019 §3a mini-Q at Module C Step C.1 if needed; build tutor surface + i18n keys via D-099; wire to `/api/tutor`; NavTabs integration if standalone |
| **D** | Ship | Vercel deploy + Playwright + axe-core + Lighthouse; RETROSPECTIVE_phase4.md per Rule C; tag candidate `phase4-α-ship-YYYY-MM-DD` (user-gated) |

Detailed step plan at `docs/phase4/PLAN.md` (written Session 53 Turn 6 same turn). §2.4 placeholder superseded.

Rejected (round-2): Model+cap → Prompt → Conv UI → Ship (cost-first ordering — cost-cap question already answered by D-103 separately, no need to front-load it as a module); Brain → Tools → Surface → Ship (agentic-first — agentic deferred to Phase 5 per §7.2 rejection list).

### §7.4 OQ-D resolved — Cost / β envelope = lift cap \$5 → \$15 via D-103 ADR

D-090 §2.x α-silent cap raised from **\$5 → \$15** (midpoint of the OQ-D \$10-25 range; conservative) for Phase 4 via standalone ADR **D-103** (`docs/decisions/D-103-phase4-cost-cap-raise.md`), written Session 53 Turn 6 same turn per D-029 major-decision threshold.

Reasoning:
- Anthropic Claude Sonnet 4.6 unit cost: ~\$3/M input + ~\$15/M output (≈40× DeepSeek input, ≈14× DeepSeek output baseline)
- Phase 4 projected ~\$2-5 真 across full implementation (cost dry-run gates Module B Step B.3)
- Cumulative all-phases prior ~\$0.66 + Phase 4 ~\$2-5 = ~\$3-6 vs new \$15 cap = **2.5-5× headroom**
- Cap is the **visibility ceiling**, NOT spend authorization — per CLAUDE.md, every Phase 4 LLM API call still needs explicit user gate (Module B Step B.3 dry-run = first gate; Module C Step C.3 smoke = second)

§2.5 cost projection sketch superseded by D-103.

Rejected (round-2): Keep \$5 cap (insufficient headroom for Anthropic-on-tutor unit cost; projection consumes 40-100% of cap immediately); β-open Phase 4 immediately on prod (commits to prod-cost visibility before brain is shipped — premature; β re-opens at Module D deploy as planned); decide-after-OQ-B (OQ-B now locked, no need to defer).

### §7.5 PLAN.md on disk

`docs/phase4/PLAN.md` written Session 53 Turn 6 same turn. **~14 steps total** (4 modules × ~3-4 steps each):

- Module A: A.1 types / A.2 wire recordQuizAnswer / A.3 loadTutorContext helper
- Module B: B.1 model lock / B.2 SYSTEM + cache / B.3 cost dry-run **+ user gate** / B.4 `/api/tutor`
- Module C: C.1 route decision / C.2 UI + i18n / C.3 wire + smoke / C.4 NavTabs (if standalone)
- Module D: D.1 preview + Playwright / D.2 prod + axe + Lighthouse + user gate / D.3 RETROSPECTIVE + tag

γ tripwire baseline = **midpoint × 1.0** (Phase 1/2 unit cost model per RETROSPECTIVE_phase3 §3.6 — do NOT use Phase 3's × 0.4 multiplier).

### §7.6 Status update

D-102 = **LOCKED (fully) 2026-05-22 Session 53 Turn 6**. Round-2 OQ-A/B/C/D all RESOLVED. **Phase 4 设计阶段 ✅ COMPLETE Session 53**. Phase 4 Module A 实施 gate user-pending per CLAUDE.md "Phase/stage signaling".
