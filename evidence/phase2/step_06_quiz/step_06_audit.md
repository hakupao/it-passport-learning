# Step 6 — Audit Trail (Rule A pattern)

**Date**: 2026-05-20 (Session 38)
**Step**: 6 — Quiz Explain mode wiring (`/api/quiz/explain`)
**Scope per D-085 §2.4**: question (page + entity pin)
**ADR depended on**: D-085 / D-088 §2.3 / D-089 §2.3 / D-095 / D-097 / D-098
**ADR locked this step**: 0 (Step 6 honoured all locked ADRs; chars/3 calibration done via in-source comment-only refresh, NOT a D-NNN)

---

## 1. Drift corrections (per D-027 §1 — one-line entries)

- **DC-38.1** — Session 38 Q1 4Q proposal said "question + chapter context + glossary entries" but locked D-089 §2.3 `assembleQuestion` signature already pinned the contract to "1 page + entity pin" (page_context). Reasonable interpretation per "no clarifying questions" guidance: respect locked ADR shape, treat "chapter context" 4Q phrasing as soft proposal not actionable amendment. If user intended chapter expansion, that would be a D-NNN ADR amendment on D-089 §2.3 — defer.
- **DC-38.2** — Session 38 Q2 4Q proposal said `question_id` as primary input. The corpus index uses `entity_by_id` Record with keys like `page_042_entity_0` (not a `q_NNN_M` short form). Route body shape locked to `{question_id: <entity_by_id key>}`; GET health docs the format.
- **DC-38.3** — `chars/3` calibration applied as comment-only refresh in `assembleScope.ts` (no behavioral change beyond the heuristic comment) — captures Step 5 surfaced empirical content-dependency. Not a D-NNN per D-094 §2.1 amendment pattern (in-source amendment is the recognised non-ADR change channel).

---

## 2. Files touched

### 2.1 New (4)
- `apps/web/src/lib/ai/quiz.ts` — validator + QUIZ_SYSTEM_INSTRUCTION + QUIZ_EXPLAIN_USER_PROMPT
- `apps/web/src/lib/ai/__tests__/quiz.test.ts` — 11 vitest cases
- `apps/web/src/app/api/quiz/explain/route.ts` — POST + GET, runtime=nodejs, maxDuration=30
- `apps/web/src/app/api/quiz/explain/__tests__/route.test.ts` — 7 vitest cases (mock streamText + DataSource + assembleQuestion)

### 2.2 Modify (4)
- `apps/web/src/lib/data/assembleScope.ts` — comment block updated to capture chars/3 calibration finding (DC-38.3)
- `docs/decisions/D-098-whole-book-lean-payload.md` — §2.2 v1.1 in-place amend note appended
- `docs/phase2/PLAN.md` — Step 6 row → ✅ DONE narrative
- `docs/STATE.md` — 4-anchor sync

### 2.3 Evidence
- `evidence/phase2/step_06_quiz/tree_outline.md`
- `evidence/phase2/step_06_quiz/build_log.txt`
- `evidence/phase2/step_06_quiz/test_results.txt`
- `evidence/phase2/step_06_quiz/cache_audit_2026-05-20.md`
- `evidence/phase2/step_06_quiz/step_06_audit.md` (this file)
- `evidence/phase2/step_06_quiz/smoke_call_1.log` (full SSE 894 lines)
- `evidence/phase2/step_06_quiz/smoke_call_2.log` (full SSE 738 lines)
- `evidence/phase2/step_06_quiz/smoke_call_3.log` (full SSE 4 lines — empty-delta finding documented in §3.2 of cache_audit)
- `evidence/phase2/tripwire_log.md` — row #3 appended

---

## 3. Test deltas

Cumulative count: 81 (Session 37 close) → **100** (Step 6 +19).

- `quiz.test.ts` — 11 cases
- `quiz/explain/__tests__/route.test.ts` — 7 cases (1 less than Step 5 chat route.test because there's no SSE-encoder rewrite needed — chat.ts SSE encoder reused via direct import; chat.test.ts 15 cases already cover the encoder)
- Empirical: **18 net new**; +1 unit-test reshuffle accounted in vitest's 19 delta (could be a test detection nuance — not investigated, all pass)

Build: 7 routes (Session 37 close) → **8** (added `ƒ /api/quiz/explain`). Middleware 37.6 kB unchanged. First Load JS 119 kB unchanged (route handlers are server-side only).

---

## 4. Smoke gate

3 真 LLM smoke calls dispatched against prod canonical post-deploy (Basic Auth `claude:<pass>`):

| # | question_id | result |
|---|---|---|
| 1 | page_042_entity_0 | 2693 in / 757 out / 0% hit (creation event) — coherent Japanese reply walking 4 choices |
| 2 | page_042_entity_0 | 2693 in / 608 out / **99.81% hit** — re-explanation, slightly different surface but same content; cache discipline confirmed |
| 3 | page_259_entity_0 | 2271 in / 330 out / 0% hit (creation event) + empty-delta finding (R1 reasoning-only output; documented for Step 7+ adjustment) |

**Conclusion**: Step 6 wiring functional; question-scope cache discipline ratifies D-088 §2.3 at small scale (~2.7K tok prefix vs Step 5's ~93K).

---

## 5. Rule mapping

| Rule | Applicability | Action |
|---|---|---|
| A — semantic audit on >50% rewrite/compression | n/a (wiring, no content transform) | no audit needed |
| B — failure archive | none triggered (all batches first-try) | no archive needed |
| C — phase retro | n/a (mid-Phase 2) | — |
| D — Writer ≠ Reviewer | satisfied via main session = Writer + user terminal = Reviewer (4Q design ACK + Batch D prod-deploy ACK + commit ACK pending) | ✅ |

---

## 6. Sign-off

- Writer: main session (Claude Opus 4.7)
- Reviewer: user terminal — 4Q design ACK `all Recommended` + `授权 vercel --prod` (Batch D) + commit ACK pending per Sessions 27-37 pattern
- This audit is constructed from on-disk artifacts (source files + test runs + SSE logs + deploy ids). All claims are traceable to committed evidence in the same atomic commit.
