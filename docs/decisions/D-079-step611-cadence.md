# D-079 — Step 6.11 全本 579-page Stage C cadence: selective per-stage gate

| Field | Value |
|---|---|
| ID | D-079 |
| Title | Step 6.11 cadence — 5 selective user-confirm gates at high-risk stage boundaries (Stages 1 / 4 / 4.5 / 5 / 6); mechanical stages (0 / 2 / 3) auto-pass |
| Status | **Locked** (2026-05-11, Session 13) |
| Phase / Stage | Phase 1, Step 6.11 (Stage C 全本 run) |
| Supersedes | — |
| Amends | D-073 (Phase 1 launch strategy) — refines Stage C cadence from "same flow as Stage A, cap-halt only" into "5 explicit user gates" |
| Depends on | D-008 (pipeline shape), D-071 (budget cap), D-073 (Stage C contract), D-077 (Stage 6 audit reviewer), D-078 (Stage 7 export gates) |
| ADR convention | per D-029 (major decisions get standalone ADR) |

---

## 1. Context

Stage A (40-page dry-run, `dry_run_2026-05-06T16-58-10`) ran straight-through Stages 0 → 7 with one user retro at the end. That run surfaced two systemic bugs only at the Stage 6 audit verdict step:

- **Plan-B Stage 4 `answer_index` bug** — page_043 had `[0,0,0,0,0]` instead of `[2,2,2,3,2]`; only caught when Stage 6 LLM reviewer flagged it post-translation
- **Plan-B Stage 5 `_glossary_lookup` jp-mutation** — 10 leaves on 7 pages had `translated.jp != structured.jp`; caught at Stage 6 D1 detector

At 40 pages, the recovery cost was one Plan-B cycle (re-run Stage 4 + Stage 5 + Stage 6 on 40 pages, $10.95 shadow / $0 billed via max-plan OAuth). At 579 pages (Stage C scale, ~14.5× larger), the same class of bug would cost a full-book re-run on the affected stages — disproportionately worse, even with max-plan OAuth absorbing the Anthropic $$$.

D-073 §2.1 specified Stage C as "same flow as Stage A, cap-halt only (per D-071)". That spec is now refined: same flow yes, but **with explicit user gates at the boundaries that the dry-run experience proved were the bug-discovery surface**. Mechanical stages (Stage 0 unpack, Stage 2 page classify, Stage 3 conditional re-OCR) auto-pass.

User authorized "我想听听你的建议" → "全部 ok" → Claude proposes + locks per D-019 + D-027.

---

## 2. Decision

### 2.1 Five user-confirmation gates

After each of these stages completes, the Stage C runner **halts** and emits a structured checkpoint summary; user must explicitly say "继续 Stage N+1" / "go" / equivalent before the next stage starts. No timeout, no auto-continue.

| Gate | After Stage | What user inspects | Halt criteria (must hold before user-OK) | Resume command |
|---|---|---|---|---|
| **① Post-OCR** | Stage 1 (Mistral) | 5 random `ocr/page_NNN.md` samples + page-count summary | `len(ocr/) == len(raw/)`, no zero-byte files, Mistral cost in `cost.json` within ±10% of 40-page extrapolation ($0.58 ± 10%) | `uv run cert-extractor stage --from 2 --run-id <id>` |
| **② Post-Structure** | Stage 4 | 10 random `structured/page_NNN.json` — verify Question entities have `answer_index ∈ [0, len(choices))` (Plan-B regression check), table entities have non-empty `rows`, no `UNTRANSLATED` markers in `jp` field | 0 `answer_index == -1`; 0 schema validation FAIL; entity count within ±20% of 40-page-extrapolated `161 × (579/40) ≈ 2330` | `uv run cert-extractor stage --from 4.5 --run-id <id>` |
| **③ Post-Glossary** | Stage 4.5 | Glossary length + distribution; D11 (kana_helper) + D13 (self-consistency) detector counts on rebuilt glossary; per D-080 partial polish, both should be 0 | D11 INFO = 0; D13 run-level INFO = 0 (per D-080 acceptance); glossary entry count within ±20% of extrapolation; 0 untranslated surface entries | `uv run cert-extractor stage --from 5 --run-id <id>` |
| **④ Post-Translation** | Stage 5 | 10 random `translated/page_NNN.json` — verify (a) `translated.jp == structured.jp` (Plan-B jp-mutation guard); (b) zero `UNTRANSLATED` sentinel; (c) all glossary-locked terms render per locked translation; (d) spot-check EN for circular definitions | 0 jp-mutation; 0 untranslated residue; 0 glossary-lock violations | `uv run cert-extractor stage --from 6 --run-id <id>` |
| **⑤ Post-Audit** | Stage 6 | `audit/stage6_review.json` verdict summary — total PASS / WARN / FAIL / repair_stage distribution; LLM L3 (Phase 2) catch list; safety_failed status | `safety_failed == False`; FAIL count = 0 (or user authorizes hand-edit / Stage 5 retry per D-077); polish_items count within ±20% of extrapolated (102 × 14.5 ≈ 1480 ceiling) | `uv run cert-extractor stage --from 7 --run-id <id>` |

After Gate ⑤ passes, Stage 7 (export) runs autonomously — it is deterministic (no LLM), and its own dual gate (D-078 §2.6) acts as the final pre-Release release gate.

### 2.2 Mechanical stages auto-pass

| Stage | Why auto-pass |
|---|---|
| **0 Unpack** | EPUB → image extraction; failure mode is binary (succeeds → files exist; fails → no files); no semantic risk |
| **2 Page classify** | Claude Sonnet sees one image per call; misclassification is bounded (page-label mismatch); Stage 4 + Stage 6 D-detectors catch any downstream impact |
| **3 Hard-page re-OCR** | Conditional firing (only on Stage 2 "hard" pages, ~5-10% rate); Stage 6 D1/D2 catch quality regressions on re-OCR output |

These stages run between Gate ① and Gate ② without halting. Cost is tracked, but no user confirmation needed.

### 2.3 Cap interaction (per D-071)

The 5 gates are **additive** to the D-071 budget caps, not a replacement.

- D-071 hard cap (wall-time, cost, fail-count) still triggers `emergency_halt.md` regardless of gate status — even mid-stage
- D-071 soft cap WARN still requires user decision regardless of gate status
- Gates ①-⑤ trigger between stages; D-071 caps fire any time

If a cap WARN/FAIL fires during Stage N, the runner halts immediately (does NOT wait for Gate N). User decision per D-071 §3 either resumes or aborts; on resume, the next gate is still gate N (for that stage) on first re-completion.

### 2.4 Resume + idempotency contract

Each gate halt produces a checkpoint file: `data/<cert_id>/runs/<run_id>/checkpoints/gate_<N>_<timestamp>.json` containing:

```json
{
  "gate": <1..5>,
  "stage_completed": <0..6>,
  "next_stage": <1..7>,
  "halt_time": "<ISO8601 with tz>",
  "summary": { "pages_processed": <int>, "cost_so_far": <float>, ... },
  "halt_criteria_passed": true,
  "samples_for_review": ["<path>", ...],
  "resume_command": "uv run cert-extractor stage --from <N+1> --run-id <id>"
}
```

The CLI `stage --from <N>` subcommand reads existing artifacts under `data/.../runs/<run_id>/<stage>/` and **does not re-run completed stages**. Stage idempotency was already required by D-008; this ADR exercises that contract end-to-end.

If user opts to **re-run** a stage (e.g. after manually correcting input), use `stage --from <N> --redo`. Redo deletes the existing stage output before re-running.

### 2.5 Cost-tracking gate output

`cost.json` (per D-072) is updated after every stage; the gate summary surfaces it. User has running view of:

- per-stage cost (Mistral $$$, Anthropic shadow / billed)
- cumulative cost
- D-071 cap proximity (% of soft + hard cap consumed)

This satisfies the user's right-to-pause-on-cost without forcing a per-page interactive cost decision (which would be impractical at 579 pages).

---

## 3. Rejected alternatives

| Alternative | Reason rejected |
|---|---|
| **(a) Straight-through (one final retro)** — D-073 literal reading | Plan-B history proves mid-pipeline bugs surface only at Stage 6 verdict; at 579-page scale, "discover bug at end, re-run from Stage N" is disproportionately costly. The dry-run evidence directly invalidates this approach for Stage C. |
| **(b) Full per-stage gate (all 7 stages incl. 0/2/3)** | Stages 0/2/3 are mechanical (binary success or auto-bounded); gating them = user-interruption-as-process-overhead with no risk-reduction value. Costs user attention budget without buying risk coverage. |
| **(c) Per-chapter chunk** — 13 chapters × 7 stages = ~91 micro-decision points | (1) Stage 6 audit is by-design a whole-run reviewer for cross-page consistency (glossary, kana_helper, term-lock); chunking by chapter breaks that invariant. (2) Decision-point count is operationally unmanageable. (3) No real risk-reduction over selective gate approach. |
| **(d) Trust D-071 cap alone** | D-071 catches resource exhaustion (wall-time, cost, hard-fail) — not silent semantic regressions like Stage 4 answer_index drift. Cap and gates serve orthogonal purposes. |
| **(e) Auto-continue after timeout** | The whole point of gates is human inspection of high-stakes intermediate output; timeouts defeat that. Stages are not time-critical at this scale. |

---

## 4. Consequences

### 4.1 Positive

- Bug class detected at Stage 4 (answer_index drift) caught at Gate ② instead of Gate ⑤ → recovery scope = re-run Stages 4+ only (not Stages 4-6)
- Bug class detected at Stage 5 (jp-mutation) caught at Gate ④ instead of Gate ⑤ → recovery scope = re-run Stage 5 only
- Cost-tracking surfaced at every gate; user has 5 explicit "do I want to spend the next $$$ on Stage N+1" decision points without per-page interrupts
- Idempotent resume contract validated end-to-end (D-008 was theoretical; this ADR exercises it)

### 4.2 Negative / trade-offs

- 5 user-confirmation pauses ⇒ Stage C wall-clock is dominated by user response latency, not LLM throughput. For a working session, this can run minutes; for unattended overnight runs, it stalls. **Mitigation**: user can pre-authorize all 5 gates by passing `--auto-gate` on the runner CLI for unattended runs (D-079 §2.1 default = interactive; flag opt-out for unattended).
- Gate criteria thresholds (±10% / ±20%) are heuristic; first 579-page run is itself the calibration. Acceptable for v1.0.0; tune in follow-on ADR.

### 4.3 Risks

- **Bug class not in any of the 5 gates** — a regression in Stage 7 export (post-Gate ⑤) is caught only by D-078 dual gate + user sample review. Acceptable because Stage 7 is deterministic (no LLM), tested 427/427, and dry-run produced 84 files clean.
- **User over-trusts the gates** — gate halt criteria are necessary-not-sufficient; user still must spot-check samples. ADR explicitly lists samples to inspect per gate.

---

## 5. Acceptance criteria

Step 6.11 closure (after Stage C 579-page completes + Stage 7 export + GitHub Release tag):

1. All 5 gates fired and produced checkpoint files under `data/.../runs/<run_id>/checkpoints/`
2. No D-071 cap WARN/FAIL fired during Stage C (or, if fired, resolved per D-071 §3)
3. Stage 6 final verdict: `safety_failed == False`, `FAIL == 0` (post any hand-edit per D-077 §F-CHOICE-MARKER / closure-worksheet pattern)
4. Stage 7 dual gate (D-078 §2.6): both Gate A + Gate B PASS on 579-page output
5. GitHub Release tag `itpassport-r6-v1.0.0` published per D-081 with 6 assets
6. Evidence: `evidence/.../step_06_11_stagec.md` documenting all 5 gate verdicts + per-stage cost + recovery actions (if any)
7. STATE.md synced: Step 6.11 ✅; Step 6.12 (RETROSPECTIVE.md per Rule C) is next entry point

---

## 6. References

- D-008 — Stage 0-7 pipeline (this ADR consumes the idempotency contract)
- D-029 — major decisions get standalone ADR (this is one)
- D-071 — budget cap and emergency halt (orthogonal to gates; both apply)
- D-072 — cost tracking (gate output surfaces cost.json)
- D-073 — Phase 1 launch strategy (this ADR amends §2.1 Stage C cadence)
- D-077 — Stage 6 audit reviewer (Gate ⑤ consumes its verdict)
- D-078 — Stage 7 export gates (Stage 7 deterministic; no Gate ⑥-⑦ needed)
- D-080 — Stage 4.5 partial polish v1.5 (Gate ③ acceptance depends on D-080 D11/D13 deliverables)
- D-019 — slow-pace 3a (this ADR followed: 3 Q posed → user "你来定" → Claude proposes + Context7-verified gh CLI + lock)
- D-027 — decision-on-lock writeback (this ADR + session-13 log + STATE.md updated same turn)
- Session 13 log: `docs/discussion/2026-05-11-session-13.md`
- Stage A retro evidence (cadence rationale): `evidence/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/step_06_audit.md`
- Plan-B history (bug class evidence): `docs/discussion/2026-05-07-session-09b.md` (or session-09 if not separated)

---

## 7. Sign-off

| Role | Name | Time | Status |
|---|---|---|---|
| Open-question poser | Claude main session (Opus 4.7 1M ctx) | 2026-05-11 (Session 13 open) | 3 Q posed per D-019 |
| User answerer | user | 2026-05-11 | "我想听听你的建议" → delegation |
| Proposer | Claude main session | 2026-05-11 | proposal §1-§7 |
| User refiner | user | 2026-05-11 | "全部 ok" — no overrides |
| Locker | Claude main session | 2026-05-11 | D-079 locked, this ADR |
| Implementer | TBD (Step 6.11 entry-point) | TBD | Stage C runner CLI gate hook + checkpoint file emitter |
| User final sign-off (Step 6.11 closure) | user | TBD | post 579-page completion + Release publish |
